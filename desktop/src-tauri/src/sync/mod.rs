pub mod conflicts;
pub mod queue;
pub mod supabase;

use crate::db::DbPool;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use supabase::SupabaseClient;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncStatusReport {
    pub is_online: bool,
    pub last_sync_time: Option<String>,
    pub pending_count: i64,
    pub failed_count: i64,
    pub resolved_count: i64,
    pub conflict_count: i64,
    pub message: String,
}

pub struct SyncOrchestrator {
    pool: DbPool,
    client: SupabaseClient,
}

impl SyncOrchestrator {
    pub fn new(pool: DbPool, supabase_url: String, supabase_anon_key: String) -> Self {
        let client = SupabaseClient::new(supabase_url, supabase_anon_key);
        Self { pool, client }
    }

    /// Performs full two-way synchronization: Push offline queue -> Pull cloud updates
    pub async fn run_sync(&self, org_id: Option<&str>, session_token: Option<&str>) -> Result<SyncStatusReport, String> {
        let is_healthy = self.client.check_health().await;
        if !is_healthy {
            return Ok(SyncStatusReport {
                is_online: false,
                last_sync_time: None,
                pending_count: self.get_pending_count(),
                failed_count: self.get_failed_count(),
                resolved_count: 0,
                conflict_count: self.get_conflict_count(),
                message: "Working offline. Supabase cloud endpoint unreachable.".to_string(),
            });
        }

        // 1. Process Offline Queue (Local -> Cloud Push)
        let pushed_count = self.process_pending_queue(session_token).await?;

        // 2. Fetch fresh updates (Cloud -> Local Pull). Do not report a
        // successful two-way sync until received records are durably written to
        // SQLite; silently discarding them creates stale desktop data.
        let pulled_count = self.pull_cloud_tables(org_id, session_token).await?;

        let report = SyncStatusReport {
            is_online: true,
            last_sync_time: Some(chrono::Utc::now().to_rfc3339()),
            pending_count: self.get_pending_count(),
            failed_count: self.get_failed_count(),
            resolved_count: pushed_count,
            conflict_count: self.get_conflict_count(),
            message: format!("Sync completed successfully. Pushed {} mutations and pulled {} records.", pushed_count, pulled_count),
        };

        Ok(report)
    }

    pub fn get_status(&self) -> SyncStatusReport {
        SyncStatusReport {
            // This synchronous status endpoint cannot make a reliable network
            // assertion. `run_sync` performs the real health check.
            is_online: false,
            last_sync_time: None,
            pending_count: self.get_pending_count(),
            failed_count: self.get_failed_count(),
            resolved_count: 0,
            conflict_count: self.get_conflict_count(),
            message: "Sync status not yet verified. Run sync to check connectivity.".to_string(),
        }
    }

    fn get_pending_count(&self) -> i64 {
        if let Ok(conn) = self.pool.get() {
            queue::get_queue_stats(&conn).map(|(p, _, _)| p).unwrap_or(0)
        } else {
            0
        }
    }

    fn get_failed_count(&self) -> i64 {
        if let Ok(conn) = self.pool.get() {
            queue::get_queue_stats(&conn).map(|(_, f, _)| f).unwrap_or(0)
        } else {
            0
        }
    }

    fn get_conflict_count(&self) -> i64 {
        if let Ok(conn) = self.pool.get() {
            conflicts::get_unresolved_conflicts(&conn).map(|list| list.len() as i64).unwrap_or(0)
        } else {
            0
        }
    }

    async fn process_pending_queue(&self, session_token: Option<&str>) -> Result<i64, String> {
        let conn = self.pool.get().map_err(|e| e.to_string())?;
        let queue_items = queue::get_pending_queue(&conn).map_err(|e| e.to_string())?;
        
        let mut success_count = 0;
        for item in queue_items {
            let payload: Value = serde_json::from_str(&item.payload).unwrap_or_default();
            let table = &item.table_name;

            let result = match item.operation.as_str() {
                "INSERT" | "UPSERT" => {
                    self.client.upsert_record(table, &payload, session_token).await
                }
                "UPDATE" => {
                    self.client.update_record(table, "id", &item.record_id, &payload, session_token).await
                }
                "DELETE" => {
                    self.client.delete_record(table, "id", &item.record_id, session_token).await.map(|_| Value::Null)
                }
                _ => Ok(Value::Null),
            };

            match result {
                Ok(_) => {
                    let _ = queue::update_queue_status(&conn, &item.id, "RESOLVED", None);
                    success_count += 1;
                }
                Err(err) => {
                    let _ = queue::update_queue_status(&conn, &item.id, "FAILED", Some(&err));
                }
            }
        }

        Ok(success_count)
    }

    async fn pull_cloud_tables(&self, org_id: Option<&str>, session_token: Option<&str>) -> Result<i64, String> {
        let tables = vec![
            "organizations", "students", "teachers", "attendance",
            "fee_invoices", "expenses", "homework", "exams", "results",
            "notices", "library_books"
        ];

        let mut total_records = 0;
        for table in tables {
            if let Ok(records) = self.client.fetch_table_data(table, org_id, session_token).await {
                total_records += records.len() as i64;
                // Each cloud table requires a reviewed SQLite mapping and a
                // transactional upsert before it can count as pulled.
            }
        }

        Err(format!(
            "Cloud pull is disabled: {} records were received but no SQLite upsert mapping is implemented. Outgoing queue processing may have completed; refresh from the web or complete the pull mapping before relying on desktop parity.",
            total_records
        ))
    }
}
