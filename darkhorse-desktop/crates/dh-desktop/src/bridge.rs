use serde::Deserialize;
use tauri::State;
use uuid::Uuid;

use dh_application::commands;
use dh_application::ports::{InitiativeRepository, SettingsStore, VepDelegationRequest};
use dh_infrastructure::updates;

use crate::state::AppState;

// ─── Initiative commands ───────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateInitiativeInput {
    pub name: String,
    pub description: String,
}

#[tauri::command]
pub async fn create_initiative(
    input: CreateInitiativeInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let cmd = commands::CreateInitiativeCommand {
        name: input.name,
        description: input.description,
    };
    let result = commands::handle_create_initiative(cmd, &state.initiative_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_initiatives(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let initiatives = state
        .initiative_repo
        .find_all()
        .map_err(|e| e.to_string())?;
    serde_json::to_value(initiatives).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct LoadInitiativeInput {
    pub id: String,
}

#[tauri::command]
pub async fn load_initiative(
    input: LoadInitiativeInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let id = Uuid::parse_str(&input.id).map_err(|e| e.to_string())?;
    let cmd = commands::LoadInitiativeCommand { id };
    let result = commands::handle_load_initiative(cmd, &state.initiative_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

// ─── Discovery commands ────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct StartDiscoveryInput {
    pub initiative_id: String,
    pub title: String,
    pub problem_statement: String,
}

#[tauri::command]
pub async fn start_discovery_session(
    input: StartDiscoveryInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let initiative_id = Uuid::parse_str(&input.initiative_id).map_err(|e| e.to_string())?;
    let cmd = commands::StartDiscoverySessionCommand {
        initiative_id,
        title: input.title,
        problem_statement: input.problem_statement,
    };
    let result = commands::handle_start_discovery_session(cmd, &state.discovery_session_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct UpdateDiscoveryNotebookInput {
    pub session_id: String,
    pub notebook_phase: String,
}

#[tauri::command]
pub async fn update_discovery_notebook(
    input: UpdateDiscoveryNotebookInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let session_id = Uuid::parse_str(&input.session_id).map_err(|e| e.to_string())?;
    let notebook_phase = match input.notebook_phase.to_lowercase().as_str() {
        "framing" => dh_domain::entities::DiscoveryPhase::Framing,
        "exploring" => dh_domain::entities::DiscoveryPhase::Exploring,
        "converging" => dh_domain::entities::DiscoveryPhase::Converging,
        "concluded" => dh_domain::entities::DiscoveryPhase::Concluded,
        _ => return Err(format!("Invalid notebook phase: {}", input.notebook_phase)),
    };
    let cmd = commands::UpdateDiscoveryNotebookCommand {
        session_id,
        notebook_phase,
    };
    let result = commands::handle_update_discovery_notebook(cmd, &state.discovery_session_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct RecordOptionInput {
    pub session_id: String,
    pub option_name: String,
    pub description: String,
}

#[tauri::command]
pub async fn record_discovery_option(
    input: RecordOptionInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let session_id = Uuid::parse_str(&input.session_id).map_err(|e| e.to_string())?;
    let cmd = commands::RecordDiscoveryOptionCommand {
        session_id,
        option_name: input.option_name,
        description: input.description,
    };
    commands::handle_record_discovery_option(cmd, &state.discovery_session_repo)
        .await
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "recorded": true }))
}

#[derive(Debug, Deserialize)]
pub struct DiscoveryReadinessInput {
    pub session_id: String,
}

#[tauri::command]
pub async fn collect_discovery_vep_input(
    input: DiscoveryReadinessInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let session_id = Uuid::parse_str(&input.session_id).map_err(|e| e.to_string())?;
    let cmd = commands::CollectDiscoveryVepInputCommand { session_id };
    let result = commands::handle_collect_discovery_vep_input(cmd, &state.discovery_session_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct ListDiscoverySessionsInput {
    pub initiative_id: String,
}

#[tauri::command]
pub async fn list_discovery_sessions(
    input: ListDiscoverySessionsInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let initiative_id = Uuid::parse_str(&input.initiative_id).map_err(|e| e.to_string())?;
    let cmd = commands::ListDiscoverySessionsCommand { initiative_id };
    let result = commands::handle_list_discovery_sessions(cmd, &state.discovery_session_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

// ─── Planning commands ─────────────────────────────────────────────

#[tauri::command]
pub async fn invoke_project_vep(
    input: VepDelegationRequest,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let result = commands::handle_invoke_project_vep(input, &state.vep_delegator)
        .map_err(|error| error.to_string())?;
    serde_json::to_value(result).map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn get_vep_lifecycle() -> Result<serde_json::Value, String> {
    serde_json::to_value(dh_domain::values::VEP_LIFECYCLE).map_err(|error| error.to_string())
}

// ─── Scope commands ────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct DefineScopeInput {
    pub mvp_id: String,
    pub description: String,
    pub source: String,
}

#[tauri::command]
pub async fn define_mvp_scope(
    input: DefineScopeInput,
    _state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let mvp_id = Uuid::parse_str(&input.mvp_id).map_err(|e| e.to_string())?;
    let cmd = commands::DefineMvpScopeCommand {
        mvp_id,
        description: input.description,
        source: input.source,
    };

    // MvpRepository is not yet wired — scaffold the response
    let _ = cmd;
    Ok(serde_json::json!({
        "mvp_id": mvp_id.to_string(),
        "message": "Scope candidate recorded (MVP repo wiring pending)"
    }))
}

// ─── Slice commands ────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct GenerateSlicesInput {
    pub mvp_id: String,
    pub slices: Vec<SliceInputBridge>,
}

#[derive(Debug, Deserialize)]
pub struct SliceInputBridge {
    pub title: String,
    pub description: String,
    pub slice_type: String,
    pub requirement_ids: Vec<String>,
}

#[tauri::command]
pub async fn generate_slices(
    input: GenerateSlicesInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let mvp_id = Uuid::parse_str(&input.mvp_id).map_err(|e| e.to_string())?;
    let slices = input
        .slices
        .into_iter()
        .map(|s| {
            let req_ids = s
                .requirement_ids
                .iter()
                .filter_map(|id| Uuid::parse_str(id).ok())
                .collect();
            commands::SliceInput {
                title: s.title,
                description: s.description,
                slice_type: s.slice_type,
                requirement_ids: req_ids,
            }
        })
        .collect();

    let cmd = commands::GenerateSlicesCommand { mvp_id, slices };
    let result = commands::handle_generate_slices(cmd, &state.slice_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct UpdateSliceStatusInput {
    pub slice_id: String,
    pub status: String,
}

#[tauri::command]
pub async fn update_slice_work_item(
    input: UpdateSliceStatusInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let slice_id = Uuid::parse_str(&input.slice_id).map_err(|e| e.to_string())?;
    let cmd = commands::UpdateSliceStatusCommand {
        slice_id,
        status: input.status,
    };
    commands::handle_update_slice_work_item(cmd, &state.slice_repo)
        .await
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "updated": true }))
}

#[derive(Debug, Deserialize)]
pub struct ListSlicesInput {
    pub mvp_id: String,
}

#[tauri::command]
pub async fn list_slices(
    input: ListSlicesInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let mvp_id = Uuid::parse_str(&input.mvp_id).map_err(|e| e.to_string())?;
    let cmd = commands::ListSlicesCommand { mvp_id };
    let result = commands::handle_list_slices(cmd, &state.slice_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

// ─── Roadmap commands ──────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RoadmapInput {
    pub initiative_id: String,
    pub action: serde_json::Value,
}

#[tauri::command]
pub async fn update_roadmap(input: RoadmapInput) -> Result<serde_json::Value, String> {
    let initiative_id = Uuid::parse_str(&input.initiative_id).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({
        "initiative_id": initiative_id.to_string(),
        "action": input.action,
        "message": "Roadmap update scaffold — action received"
    }))
}

// ─── Progress commands ─────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ProgressInput {
    pub initiative_id: String,
    pub title: String,
    pub status: String,
    pub notes: String,
}

#[tauri::command]
pub async fn update_progress(input: ProgressInput) -> Result<serde_json::Value, String> {
    let initiative_id = Uuid::parse_str(&input.initiative_id).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({
        "initiative_id": initiative_id.to_string(),
        "entry_id": Uuid::new_v4().to_string(),
        "status": input.status,
        "notes": input.notes,
        "message": format!("Local work note '{}' recorded; no VEP state changed", input.title)
    }))
}

// ─── Artifact commands ─────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ExportArtifactInput {
    pub kind: String,
    pub name: String,
    pub content: String,
    pub initiative_id: String,
}

#[tauri::command]
pub async fn export_artifact(
    input: ExportArtifactInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let initiative_id = Uuid::parse_str(&input.initiative_id).map_err(|e| e.to_string())?;
    let cmd = commands::ExportArtifactCommand {
        kind: input.kind,
        name: input.name,
        content: input.content,
        initiative_id,
    };
    let result = commands::handle_export_artifact(cmd, &state.artifact_store)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_workspace_artifacts(
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let result = commands::handle_list_workspace_artifacts(&state.artifact_store)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

// ─── Workspace commands ────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateWorkspaceInput {
    pub name: String,
    pub root_path: String,
}

#[tauri::command]
pub async fn create_workspace(
    input: CreateWorkspaceInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let cmd = commands::CreateWorkspaceCommand {
        name: input.name,
        root_path: input.root_path.into(),
    };
    let result = commands::handle_create_workspace(cmd, &state.workspace_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_workspaces(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let result = commands::handle_list_workspaces(&state.workspace_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct LoadWorkspaceSummaryInput {
    pub workspace_id: String,
}

#[tauri::command]
pub async fn load_workspace_summary(
    input: LoadWorkspaceSummaryInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let workspace_id = Uuid::parse_str(&input.workspace_id).map_err(|e| e.to_string())?;
    let result = commands::handle_load_workspace_summary(workspace_id, &state.workspace_repo)
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_value(result).map_err(|e| e.to_string())
}

// ─── Settings commands ─────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct GetSettingInput {
    pub key: String,
}

#[tauri::command]
pub async fn get_setting(
    input: GetSettingInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let value = state
        .settings_store
        .get(&input.key)
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "key": input.key, "value": value }))
}

#[derive(Debug, Deserialize)]
pub struct SetSettingInput {
    pub key: String,
    pub value: String,
}

fn is_governed_vep_setting(key: &str) -> bool {
    let normalized = key.to_ascii_lowercase().replace(['-', '_', '.'], "");
    normalized.contains("vep") || normalized.contains("processversion")
}

#[tauri::command]
pub async fn set_setting(
    input: SetSettingInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    if is_governed_vep_setting(&input.key) {
        return Err("SECONDARY_DESKTOP_VERSION_PIN_REJECTED: generated project root package.json is the sole current VEP-version authority.".into());
    }
    state
        .settings_store
        .set(&input.key, &input.value)
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "key": input.key, "saved": true }))
}

#[cfg(test)]
mod tests {
    use super::is_governed_vep_setting;

    #[test]
    fn desktop_rejects_secondary_vep_version_settings() {
        assert!(is_governed_vep_setting("current-vep-version"));
        assert!(is_governed_vep_setting("process_version"));
        assert!(!is_governed_vep_setting("theme"));
    }
}

// ─── Update commands ───────────────────────────────────────────────

#[tauri::command]
pub async fn check_updates() -> Result<serde_json::Value, String> {
    let status = updates::check_for_updates(env!("CARGO_PKG_VERSION")).await;
    serde_json::to_value(status).map_err(|e| e.to_string())
}
