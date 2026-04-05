use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::AppResult;
use crate::ports::RequirementRepository;
use dh_domain::entities::{Requirement, RequirementKind};
use dh_domain::values::Priority;

/// Command to add a new requirement to an MVP.
#[derive(Debug, Deserialize)]
pub struct AddRequirementCommand {
    pub mvp_id: Uuid,
    pub title: String,
    pub description: String,
    pub kind: RequirementKind,
    pub priority: Priority,
    pub acceptance_criteria: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct AddRequirementResult {
    pub id: Uuid,
    pub mvp_id: Uuid,
    pub title: String,
}

pub async fn handle_add_requirement(
    cmd: AddRequirementCommand,
    repo: &dyn RequirementRepository,
) -> AppResult<AddRequirementResult> {
    let mut requirement = Requirement::new(cmd.mvp_id, &cmd.title, &cmd.description, cmd.kind);
    requirement.set_priority(cmd.priority);
    for criterion in &cmd.acceptance_criteria {
        requirement.add_criterion(criterion);
    }

    let id = requirement.id();
    repo.save(&requirement)?;

    info!(id = %id, mvp_id = %cmd.mvp_id, title = %cmd.title, "Requirement added");

    Ok(AddRequirementResult {
        id,
        mvp_id: cmd.mvp_id,
        title: cmd.title,
    })
}
