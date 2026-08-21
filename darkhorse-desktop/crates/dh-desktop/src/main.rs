mod bridge;
mod state;

use dh_infrastructure::logging;
use tracing::info;

#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    logging::init_logging();
    info!("DarkHorse Desktop starting");

    let app_state = state::AppState::initialize().expect("Failed to initialize app state");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            bridge::create_initiative,
            bridge::list_initiatives,
            bridge::load_initiative,
            bridge::start_discovery_session,
            bridge::update_discovery_notebook,
            bridge::record_discovery_option,
            bridge::collect_discovery_vep_input,
            bridge::list_discovery_sessions,
            bridge::invoke_project_vep,
            bridge::get_vep_lifecycle,
            bridge::define_mvp_scope,
            bridge::generate_slices,
            bridge::update_slice_work_item,
            bridge::list_slices,
            bridge::update_roadmap,
            bridge::update_progress,
            bridge::export_artifact,
            bridge::list_workspace_artifacts,
            bridge::create_workspace,
            bridge::list_workspaces,
            bridge::load_workspace_summary,
            bridge::get_setting,
            bridge::set_setting,
            bridge::check_updates,
        ])
        .run(tauri::generate_context!())
        .expect("Error running DarkHorse Desktop");
}
