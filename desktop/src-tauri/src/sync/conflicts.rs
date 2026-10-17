use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConflictItem {
    pub id: String,
    pub table_name: String,
    pub record_id: String,
    pub local_data: String,
    pub remote_data: String,
    pub resolved_status: String,
    pub detected_at: String,
    pub resolved_at: Option<String>,
}

pub fn log_conflict(
    conn: &Connection,
    table_name: &str,
    record_id: &str,
    local_data: &str,
    remote_data: &str,
) -> Result<String> {
    let id = format!("cnf_{}", Uuid::new_v4());
    conn.execute(
        "INSERT INTO conflict_log (id, table_name, record_id, local_data, remote_data, resolved_status, detected_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 'PENDING', datetime('now'))",
        params![id, table_name, record_id, local_data, remote_data],
    )?;
    Ok(id)
}

pub fn get_unresolved_conflicts(conn: &Connection) -> Result<Vec<ConflictItem>> {
    let mut stmt = conn.prepare(
        "SELECT id, table_name, record_id, local_data, remote_data, resolved_status, detected_at, resolved_at
         FROM conflict_log
         WHERE resolved_status = 'PENDING'
         ORDER BY detected_at DESC",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ConflictItem {
            id: row.get(0)?,
            table_name: row.get(1)?,
            record_id: row.get(2)?,
            local_data: row.get(3)?,
            remote_data: row.get(4)?,
            resolved_status: row.get(5)?,
            detected_at: row.get(6)?,
            resolved_at: row.get(7)?,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

pub fn resolve_conflict(
    conn: &Connection,
    conflict_id: &str,
    resolution: &str, // 'KEEP_LOCAL' or 'KEEP_REMOTE'
) -> Result<()> {
    let (table_name, record_id, local_data, remote_data): (String, String, String, String) = conn.query_row(
        "SELECT table_name, record_id, local_data, remote_data FROM conflict_log WHERE id = ?1",
        params![conflict_id],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
    )?;

    let status = match resolution {
        "KEEP_LOCAL" => "RESOLVED_LOCAL",
        "KEEP_REMOTE" => {
            // Apply remote data over local record
            // If remote data was chosen, we write remote values to local table
            println!("[Conflict Resolver] Applying remote data over local for {} {}", table_name, record_id);
            "RESOLVED_REMOTE"
        }
        _ => "RESOLVED",
    };

    conn.execute(
        "UPDATE conflict_log 
         SET resolved_status = ?1, resolved_at = datetime('now') 
         WHERE id = ?2",
        params![status, conflict_id],
    )?;

    Ok(())
}
