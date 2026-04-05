use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::WorkspaceRepository;
use dh_domain::entities::Workspace;

// --- Create Workspace ---

#[derive(Debug, Deserialize)]
pub struct CreateWorkspaceCommand {
    pub name: String,
    pub root_path: PathBuf,
}

#[derive(Debug, Serialize)]
pub struct WorkspaceCreated {
    pub workspace_id: Uuid,
    pub name: String,
    pub root_path: PathBuf,
}

pub async fn handle_create_workspace(
    cmd: CreateWorkspaceCommand,
    repo: &dyn WorkspaceRepository,
) -> AppResult<WorkspaceCreated> {
    let ws = Workspace::create(&cmd.name, &cmd.root_path);
    let id = ws.id();
    repo.save(&ws)?;
    info!(workspace_id = %id, name = %cmd.name, "Workspace created");
    Ok(WorkspaceCreated {
        workspace_id: id,
        name: cmd.name,
        root_path: cmd.root_path,
    })
}

// --- Load Workspace ---

#[derive(Debug, Deserialize)]
pub struct LoadWorkspaceCommand {
    pub workspace_id: Uuid,
}

pub async fn handle_load_workspace(
    cmd: LoadWorkspaceCommand,
    repo: &dyn WorkspaceRepository,
) -> AppResult<Workspace> {
    repo.find_by_id(cmd.workspace_id)?
        .ok_or_else(|| AppError::NotFound(format!("Workspace {}", cmd.workspace_id)))
}

// --- List Workspaces ---

pub async fn handle_list_workspaces(
    repo: &dyn WorkspaceRepository,
) -> AppResult<Vec<Workspace>> {
    repo.find_all()
}

// --- Load Workspace Summary ---

#[derive(Debug, Serialize)]
pub struct WorkspaceSummary {
    pub workspace_id: Uuid,
    pub name: String,
    pub root_path: PathBuf,
    pub initiative_count: usize,
}

pub async fn handle_load_workspace_summary(
    workspace_id: Uuid,
    workspace_repo: &dyn WorkspaceRepository,
) -> AppResult<WorkspaceSummary> {
    let ws = workspace_repo
        .find_by_id(workspace_id)?
        .ok_or_else(|| AppError::NotFound(format!("Workspace {workspace_id}")))?;

    Ok(WorkspaceSummary {
        workspace_id: ws.id(),
        name: ws.name().to_string(),
        root_path: ws.root_path().to_path_buf(),
        initiative_count: 0, // Will be populated once initiative-workspace link is queried
    })
}
