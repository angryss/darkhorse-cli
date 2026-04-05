use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::DiscoverySessionRepository;
use dh_domain::entities::{DiscoverySession, DiscoveryPhase};
use dh_domain::services::DiscoveryService;

// --- Start Discovery Session ---

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
    pub phase: String,
}

pub async fn handle_start_discovery_session(
    cmd: StartDiscoverySessionCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<DiscoverySessionStarted> {
    let session = DiscoverySession::start(cmd.initiative_id, cmd.title, cmd.problem_statement);
    let id = session.id();
    let initiative_id = session.initiative_id();
    repo.save(&session)?;
    info!(session_id = %id, "Discovery session started");
    Ok(DiscoverySessionStarted {
        session_id: id,
        initiative_id,
        phase: format!("{:?}", DiscoveryPhase::Framing),
    })
}

// --- Continue Discovery Session (advance phase) ---

#[derive(Debug, Deserialize)]
pub struct ContinueDiscoverySessionCommand {
    pub session_id: Uuid,
    pub target_phase: DiscoveryPhaseInput,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum DiscoveryPhaseInput {
    Exploring,
    Converging,
    Concluded,
}

impl From<DiscoveryPhaseInput> for DiscoveryPhase {
    fn from(input: DiscoveryPhaseInput) -> Self {
        match input {
            DiscoveryPhaseInput::Exploring => DiscoveryPhase::Exploring,
            DiscoveryPhaseInput::Converging => DiscoveryPhase::Converging,
            DiscoveryPhaseInput::Concluded => DiscoveryPhase::Concluded,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct DiscoverySessionContinued {
    pub session_id: Uuid,
    pub new_phase: String,
}

pub async fn handle_continue_discovery_session(
    cmd: ContinueDiscoverySessionCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<DiscoverySessionContinued> {
    let mut session = repo
        .find_by_id(cmd.session_id)?
        .ok_or_else(|| AppError::NotFound(format!("Discovery session {}", cmd.session_id)))?;

    let target: DiscoveryPhase = cmd.target_phase.into();
    session.advance_phase(target)?;
    let phase = format!("{:?}", session.phase());
    repo.save(&session)?;
    info!(session_id = %cmd.session_id, phase = %phase, "Discovery session advanced");
    Ok(DiscoverySessionContinued {
        session_id: cmd.session_id,
        new_phase: phase,
    })
}

// --- Record Discovery Decision (add option) ---

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
    repo.save(&session)?;
    Ok(())
}

// --- Assess Discovery Readiness ---

#[derive(Debug, Deserialize)]
pub struct AssessDiscoveryReadinessCommand {
    pub session_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct DiscoveryReadinessResult {
    pub session_id: Uuid,
    pub is_ready: bool,
    pub score: f64,
    pub blockers: Vec<String>,
    pub recommendations: Vec<String>,
}

pub async fn handle_assess_discovery_readiness(
    cmd: AssessDiscoveryReadinessCommand,
    repo: &dyn DiscoverySessionRepository,
) -> AppResult<DiscoveryReadinessResult> {
    let session = repo
        .find_by_id(cmd.session_id)?
        .ok_or_else(|| AppError::NotFound(format!("Discovery session {}", cmd.session_id)))?;

    let readiness = DiscoveryService::assess_readiness(&session);
    Ok(DiscoveryReadinessResult {
        session_id: cmd.session_id,
        is_ready: readiness.is_ready,
        score: readiness.score,
        blockers: readiness.blockers,
        recommendations: readiness.recommendations,
    })
}

// --- Load Discovery Session ---

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

// --- List Discovery Sessions ---

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
