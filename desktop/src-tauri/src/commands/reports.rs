use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportCsvPayload {
    pub filename: String,
    pub rows: Vec<Value>,
    pub columns: Option<Vec<ColumnHeader>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ColumnHeader {
    pub key: String,
    pub label: String,
}

#[tauri::command]
pub async fn export_csv_file(
    app: AppHandle,
    payload: ExportCsvPayload,
) -> Result<String, String> {
    let download_dir = app.path().download_dir().unwrap_or_else(|_| PathBuf::from("."));
    
    let safe_filename = format!(
        "{}_{}.csv",
        payload.filename.replace(".csv", ""),
        chrono::Local::now().format("%Y%m%d_%H%M%S")
    );
    let target_file = download_dir.join(&safe_filename);

    let mut csv_content = String::new();

    // Headers
    if let Some(cols) = payload.columns {
        let header_row = cols.iter().map(|c| format!("\"{}\"", c.label.replace('"', "\"\""))).collect::<Vec<_>>().join(",");
        csv_content.push_str(&header_row);
        csv_content.push_str("\r\n");

        for row in payload.rows {
            let row_line = cols.iter().map(|col| {
                let val = &row[&col.key];
                match val {
                    Value::String(s) => format!("\"{}\"", s.replace('"', "\"\"")),
                    Value::Number(n) => n.to_string(),
                    Value::Bool(b) => b.to_string(),
                    _ => "\"\"".to_string(),
                }
            }).collect::<Vec<_>>().join(",");
            csv_content.push_str(&row_line);
            csv_content.push_str("\r\n");
        }
    }

    fs::write(&target_file, csv_content).map_err(|e| format!("Failed to write CSV: {}", e))?;
    Ok(target_file.to_string_lossy().to_string())
}
