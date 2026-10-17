pub mod commands;
pub mod db;
pub mod sync;

use db::init_db;
use sync::SyncOrchestrator;
use tauri::{Manager, State};

#[tauri::command]
async fn trigger_sync(
    orchestrator: State<'_, SyncOrchestrator>,
    org_id: Option<String>,
    session_token: Option<String>,
) -> Result<sync::SyncStatusReport, String> {
    orchestrator.run_sync(org_id.as_deref(), session_token.as_deref()).await
}

#[tauri::command]
fn get_sync_status(orchestrator: State<'_, SyncOrchestrator>) -> sync::SyncStatusReport {
    orchestrator.get_status()
}

#[tauri::command]
fn get_unresolved_conflicts(
    pool: State<'_, db::DbPool>,
) -> Result<Vec<sync::conflicts::ConflictItem>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    sync::conflicts::get_unresolved_conflicts(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn resolve_conflict_item(
    pool: State<'_, db::DbPool>,
    conflict_id: String,
    resolution: String,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    sync::conflicts::resolve_conflict(&conn, &conflict_id, &resolution).map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_data = app.path().app_data_dir().expect("Failed to get app data dir");
            let pool = init_db(app_data).expect("Failed to initialize SQLite database");

            // Configuration is required; no cloud key is embedded in the binary.
            let supabase_url = std::env::var("VITE_SUPABASE_URL").unwrap_or_default();
            let supabase_anon_key = std::env::var("VITE_SUPABASE_ANON_KEY").unwrap_or_default();

            let orchestrator = SyncOrchestrator::new(pool.clone(), supabase_url, supabase_anon_key);

            app.manage(pool);
            app.manage(orchestrator);

            // Show window smoothly after setup
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::login_user,
            commands::auth::get_cached_offline_user,
            commands::auth::clear_cached_offline_user,
            commands::fetch_db_state,
            commands::mutate_db,
            commands::backup::create_local_backup,
            commands::backup::get_backup_history,
            commands::backup::restore_local_backup,
            commands::reports::export_csv_file,
            trigger_sync,
            get_sync_status,
            get_unresolved_conflicts,
            resolve_conflict_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running EduSphere AI Desktop application");
}
