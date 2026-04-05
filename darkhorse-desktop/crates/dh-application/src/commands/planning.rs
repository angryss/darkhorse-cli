use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::{InitiativeRepository, MvpRepository, RequirementRepository};
use dh_domain::services::PlanningService;

/// Command to start the formal planning flow for an initiative.
#[derive(Debug, Deserialize)]
pub struct StartPlanningCommand {
    pub initiative_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct PlanningReadinessResult {
    pub initiative_id: Uuid,
    pub is_ready: bool,
    pub readiness_score: f64,
    pub blockers: Vec<String>,
}

pub async fn handle_start_planning(
    cmd: StartPlanningCommand,
    initiative_repo: &dyn InitiativeRepository,
    mvp_repo: &dyn MvpRepository,
    requirement_repo: &dyn RequirementRepository,
) -> AppResult<PlanningReadinessResult> {
    let initiative = initiative_repo
        .find_by_id(cmd.initiative_id)?
        .ok_or_else(|| AppError::NotFound(format!("Initiative {}", cmd.initiative_id)))?;

    let mvps = mvp_repo.find_by_initiative(cmd.initiative_id)?;

    // Collect requirements across all MVPs
    let mut all_requirements = Vec::new();
    for mvp in &mvps {
        let reqs = requirement_repo.find_by_mvp(mvp.id())?;
        all_requirements.extend(reqs);
    }

    let is_ready =
        PlanningService::is_ready_for_planning(&initiative, &mvps, &all_requirements);
    let score = PlanningService::readiness_score(&mvps, &all_requirements);

    let mut blockers = Vec::new();
    if mvps.is_empty() {
        blockers.push("No MVPs defined".to_string());
    }
    if all_requirements.len() < 3 {
        blockers.push(format!(
            "Only {} requirements — need at least 3",
            all_requirements.len()
        ));
    }

    info!(
        initiative_id = %cmd.initiative_id,
        ready = is_ready,
        score = score,
        "Planning readiness checked"
    );

    Ok(PlanningReadinessResult {
        initiative_id: cmd.initiative_id,
        is_ready,
        readiness_score: score,
        blockers,
    })
}
