use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::InitiativeRepository;
use dh_domain::entities::Initiative;

#[derive(Debug, Deserialize)]
pub struct LoadInitiativeCommand {
    pub id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct LoadInitiativeResult {
    pub initiative: Initiative,
}

pub async fn handle_load_initiative(
    cmd: LoadInitiativeCommand,
    repo: &dyn InitiativeRepository,
) -> AppResult<LoadInitiativeResult> {
    let initiative = repo
        .find_by_id(cmd.id)?
        .ok_or_else(|| AppError::NotFound(format!("Initiative {}", cmd.id)))?;
    info!(id = %cmd.id, "Initiative loaded");
    Ok(LoadInitiativeResult { initiative })
}
