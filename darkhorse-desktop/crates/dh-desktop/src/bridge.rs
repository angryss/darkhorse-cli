use serde::Deserialize;
use tauri::State;
use uuid::Uuid;

use dh_application::commands;
use dh_application::ports::{InitiativeRepository, SettingsStore};
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
pub async fn list_initiatives(
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
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
pub struct ContinueDiscoveryInput {
    pub session_id: String,
    pub target_phase: String,
}

#[tauri::command]
pub async fn continue_discovery_session(
    input: ContinueDiscoveryInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let session_id = Uuid::parse_str(&input.session_id).map_err(|e| e.to_string())?;
    let target_phase = match input.target_phase.to_lowercase().as_str() {
        "exploring" => commands::DiscoveryPhaseInput::Exploring,
        "converging" => commands::DiscoveryPhaseInput::Converging,
        "concluded" => commands::DiscoveryPhaseInput::Concluded,
        _ => return Err(format!("Invalid phase: {}", input.target_phase)),
    };
    let cmd = commands::ContinueDiscoverySessionCommand {
        session_id,
        target_phase,
    };
    let result = commands::handle_continue_discovery_session(cmd, &state.discovery_session_repo)
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
pub async fn assess_discovery_readiness(
    input: DiscoveryReadinessInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let session_id = Uuid::parse_str(&input.session_id).map_err(|e| e.to_string())?;
    let cmd = commands::AssessDiscoveryReadinessCommand { session_id };
    let result = commands::handle_assess_discovery_readiness(cmd, &state.discovery_session_repo)
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

#[derive(Debug, Deserialize)]
pub struct PlanningInput {
    pub initiative_id: String,
}

#[tauri::command]
pub async fn check_planning_readiness(
    _input: PlanningInput,
) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "is_ready": false,
        "readiness_score": 0.0,
        "blockers": ["Full planning check requires complete repository wiring"]
    }))
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
    state: State<'_, AppState>,
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
pub async fn update_slice_status(
    input: UpdateSliceStatusInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let slice_id = Uuid::parse_str(&input.slice_id).map_err(|e| e.to_string())?;
    let cmd = commands::UpdateSliceStatusCommand {
        slice_id,
        status: input.status,
    };
    commands::handle_update_slice_status(cmd, &state.slice_repo)
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
        "message": format!("Progress '{}' recorded", input.title)
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
pub async fn list_workspaces(
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
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

#[tauri::command]
pub async fn set_setting(
    input: SetSettingInput,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    state
        .settings_store
        .set(&input.key, &input.value)
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "key": input.key, "saved": true }))
}

// ─── Update commands ───────────────────────────────────────────────

#[tauri::command]
pub async fn check_updates() -> Result<serde_json::Value, String> {
    let status = updates::check_for_updates(env!("CARGO_PKG_VERSION")).await;
    serde_json::to_value(status).map_err(|e| e.to_string())
}
