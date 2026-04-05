use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::AppResult;
use crate::ports::InitiativeRepository;
use dh_domain::entities::Initiative;

#[derive(Debug, Deserialize)]
pub struct CreateInitiativeCommand {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct CreateInitiativeResult {
    pub id: Uuid,
    pub name: String,
}

pub async fn handle_create_initiative(
    cmd: CreateInitiativeCommand,
    repo: &dyn InitiativeRepository,
) -> AppResult<CreateInitiativeResult> {
    let initiative = Initiative::new(&cmd.name, &cmd.description);
    let id = initiative.id();
    repo.save(&initiative)?;
    info!(id = %id, name = %cmd.name, "Initiative created");
    Ok(CreateInitiativeResult {
        id,
        name: cmd.name,
    })
}
