use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::{InitiativeRepository, MvpRepository, RequirementRepository};
use dh_domain::services::PlanningService;
use dh_domain::values::VepReadinessInput;

#[derive(Debug, Deserialize)]
pub struct CollectPlanningVepInputCommand {
    pub initiative_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct PlanningVepInputCollected {
    pub initiative_id: Uuid,
    pub observations: VepReadinessInput,
    pub process_transition: bool,
}

pub async fn handle_collect_planning_vep_input(
    cmd: CollectPlanningVepInputCommand,
    initiative_repo: &dyn InitiativeRepository,
    mvp_repo: &dyn MvpRepository,
    requirement_repo: &dyn RequirementRepository,
) -> AppResult<PlanningVepInputCollected> {
    initiative_repo
        .find_by_id(cmd.initiative_id)?
        .ok_or_else(|| AppError::NotFound(format!("Initiative {}", cmd.initiative_id)))?;
    let mvps = mvp_repo.find_by_initiative(cmd.initiative_id)?;
    let mut requirements = Vec::new();
    for mvp in &mvps {
        requirements.extend(requirement_repo.find_by_mvp(mvp.id())?);
    }
    Ok(PlanningVepInputCollected {
        initiative_id: cmd.initiative_id,
        observations: PlanningService::collect_vep_input(&mvps, &requirements),
        process_transition: false,
    })
}
