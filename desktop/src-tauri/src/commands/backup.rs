use crate::db::DbPool;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupRecord {
    pub id: String,
    pub file_path: String,
    pub file_size: i64,
    pub description: Option<String>,
    pub created_at: String,
}

#[tauri::command]
pub async fn create_local_backup(
    app: AppHandle,
    pool: State<'_, DbPool>,
    description: Option<String>,
) -> Result<BackupRecord, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("edusphere.db");
    
    let backups_dir = app_dir.join("backups");
    fs::create_dir_all(&backups_dir).map_err(|e| e.to_string())?;

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_filename = format!("edusphere_backup_{}.db", timestamp);
    let backup_path = backups_dir.join(&backup_filename);

    // Copy SQLite db safely
    fs::copy(&db_path, &backup_path).map_err(|e| format!("Failed to copy DB: {}", e))?;

    let file_size = fs::metadata(&backup_path).map(|m| m.len() as i64).unwrap_or(0);
    let backup_id = format!("bak_{}", Uuid::new_v4());
    let path_str = backup_path.to_string_lossy().to_string();
    let desc = description.unwrap_or_else(|| "Manual Administrator Backup".to_string());

    let conn = pool.get().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO backups (id, file_path, file_size, description, created_at)
         VALUES (?1, ?2, ?3, ?4, datetime('now'))",
        params![backup_id, path_str, file_size, desc],
    ).map_err(|e| e.to_string())?;

    Ok(BackupRecord {
        id: backup_id,
        file_path: path_str,
        file_size,
        description: Some(desc),
        created_at: chrono::Local::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn get_backup_history(
    pool: State<'_, DbPool>,
) -> Result<Vec<BackupRecord>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, file_path, file_size, description, created_at FROM backups ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map([], |row| {
        Ok(BackupRecord {
            id: row.get(0)?,
            file_path: row.get(1)?,
            file_size: row.get(2)?,
            description: row.get(3)?,
            created_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut list = Vec::new();
    for r in rows {
        if let Ok(item) = r {
            list.push(item);
        }
    }
    Ok(list)
}

#[tauri::command]
pub async fn restore_local_backup(
    app: AppHandle,
    backup_path: String,
) -> Result<bool, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let target_db = app_dir.join("edusphere.db");
    let source_backup = PathBuf::from(&backup_path);

    if !source_backup.exists() {
        return Err("Selected backup file does not exist.".to_string());
    }

    fs::copy(&source_backup, &target_db).map_err(|e| format!("Failed to restore database: {}", e))?;
    Ok(true)
}
