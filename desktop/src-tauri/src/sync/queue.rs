use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QueueItem {
    pub id: String,
    pub operation: String, // 'INSERT', 'UPDATE', 'DELETE'
    pub table_name: String,
    pub record_id: String,
    pub payload: String,
    pub user_context: String,
    pub created_at: String,
    pub retry_count: i64,
    pub status: String, // 'PENDING', 'SYNCING', 'FAILED', 'RESOLVED'
    pub error_message: Option<String>,
}

pub fn enqueue_operation(
    conn: &Connection,
    operation: &str,
    table_name: &str,
    record_id: &str,
    payload: &str,
    user_context: &str,
) -> Result<String> {
    let id = format!("sync_{}", Uuid::new_v4());
    conn.execute(
        "INSERT INTO sync_queue (id, operation, table_name, record_id, payload, user_context, created_at, retry_count, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'), 0, 'PENDING')",
        params![id, operation, table_name, record_id, payload, user_context],
    )?;
    Ok(id)
}

pub fn get_pending_queue(conn: &Connection) -> Result<Vec<QueueItem>> {
    let mut stmt = conn.prepare(
        "SELECT id, operation, table_name, record_id, payload, user_context, created_at, retry_count, status, error_message
         FROM sync_queue
         WHERE status = 'PENDING' OR status = 'FAILED'
         ORDER BY created_at ASC
         LIMIT 50",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(QueueItem {
            id: row.get(0)?,
            operation: row.get(1)?,
            table_name: row.get(2)?,
            record_id: row.get(3)?,
            payload: row.get(4)?,
            user_context: row.get(5)?,
            created_at: row.get(6)?,
            retry_count: row.get(7)?,
            status: row.get(8)?,
            error_message: row.get(9)?,
        })
    })?;

    let mut items = Vec::new();
    for item in rows {
        items.push(item?);
    }
    Ok(items)
}

pub fn update_queue_status(
    conn: &Connection,
    id: &str,
    status: &str,
    error_message: Option<&str>,
) -> Result<()> {
    conn.execute(
        "UPDATE sync_queue 
         SET status = ?1, error_message = ?2,
             retry_count = CASE WHEN ?1 = 'FAILED' THEN retry_count + 1 ELSE retry_count END
         WHERE id = ?3",
        params![status, error_message, id],
    )?;
    Ok(())
}

pub fn remove_queue_item(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM sync_queue WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn get_queue_stats(conn: &Connection) -> Result<(i64, i64, i64)> {
    let pending: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sync_queue WHERE status = 'PENDING'",
        [],
        |row| row.get(0),
    )?;

    let failed: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sync_queue WHERE status = 'FAILED'",
        [],
        |row| row.get(0),
    )?;

    let resolved: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sync_queue WHERE status = 'RESOLVED'",
        [],
        |row| row.get(0),
    )?;

    Ok((pending, failed, resolved))
}
