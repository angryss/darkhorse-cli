use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::DiscoverySessionRepository;
use dh_domain::entities::{DiscoveryPhase, DiscoverySession};
use dh_domain::services::DiscoveryService;
use dh_domain::values::VepReadinessInput;

#[derive(Debug, Deserialize)]
pub struct StartDiscoverySessionCommand {
    pub initiative_id: Uuid,
    pub title: String,
    pub problem_statement: String,
}

#[derive(Debug, Serialize)]
pub struct DiscoverySessionStarted {
    pub session_id: Uuid,
    pub initiative_id: Uuid,
    pub notebook_phase: String,
}

pub async fn handle_start_discovery_session(
    cmd: StartDiscoverySessionCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<DiscoverySessionStarted> {
    let session = DiscoverySession::start(cmd.initiative_id, cmd.title, cmd.problem_statement);
    let result = DiscoverySessionStarted {
        session_id: session.id(),
        initiative_id: session.initiative_id(),
        notebook_phase: format!("{:?}", session.phase()),
    };
    repo.save(&session)?;
    info!(session_id = %result.session_id, "Discovery notes started");
    Ok(result)
}

#[derive(Debug, Deserialize)]
pub struct UpdateDiscoveryNotebookCommand {
    pub session_id: Uuid,
    pub notebook_phase: DiscoveryPhase,
}

#[derive(Debug, Serialize)]
pub struct DiscoveryNotebookUpdated {
    pub session_id: Uuid,
    pub notebook_phase: String,
    pub process_transition: bool,
}

pub async fn handle_update_discovery_notebook(
    cmd: UpdateDiscoveryNotebookCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<DiscoveryNotebookUpdated> {
    let mut session = repo
        .find_by_id(cmd.session_id)?
        .ok_or_else(|| AppError::NotFound(format!("Discovery session {}", cmd.session_id)))?;
    session.set_notebook_phase(cmd.notebook_phase);
    let notebook_phase = format!("{:?}", session.phase());
    repo.save(&session)?;
    Ok(DiscoveryNotebookUpdated {
        session_id: cmd.session_id,
        notebook_phase,
        process_transition: false,
    })
}

#[derive(Debug, Deserialize)]
pub struct RecordDiscoveryOptionCommand {
    pub session_id: Uuid,
    pub option_name: String,
    pub description: String,
}

pub async fn handle_record_discovery_option(
    cmd: RecordDiscoveryOptionCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<()> {
    let mut session = repo
        .find_by_id(cmd.session_id)?
        .ok_or_else(|| AppError::NotFound(format!("Discovery session {}", cmd.session_id)))?;
    session.add_option(cmd.option_name, cmd.description);
    repo.save(&session)
}

#[derive(Debug, Deserialize)]
pub struct CollectDiscoveryVepInputCommand {
    pub session_id: Uuid,
}

pub async fn handle_collect_discovery_vep_input(
    cmd: CollectDiscoveryVepInputCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<VepReadinessInput> {
    let session = repo
        .find_by_id(cmd.session_id)?
        .ok_or_else(|| AppError::NotFound(format!("Discovery session {}", cmd.session_id)))?;
    Ok(DiscoveryService::collect_vep_input(&session))
}

#[derive(Debug, Deserialize)]
pub struct LoadDiscoverySessionCommand {
    pub session_id: Uuid,
}

pub async fn handle_load_discovery_session(
    cmd: LoadDiscoverySessionCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<DiscoverySession> {
    repo.find_by_id(cmd.session_id)?
        .ok_or_else(|| AppError::NotFound(format!("Discovery session {}", cmd.session_id)))
}

#[derive(Debug, Deserialize)]
pub struct ListDiscoverySessionsCommand {
    pub initiative_id: Uuid,
}

pub async fn handle_list_discovery_sessions(
    cmd: ListDiscoverySessionsCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<Vec<DiscoverySession>> {
    repo.find_by_initiative(cmd.initiative_id)
}
