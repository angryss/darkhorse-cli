use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::{ArtifactStore, InitiativeRepository, MvpRepository, RequirementRepository};
use dh_domain::services::PlanningService;
use dh_domain::values::{ArtifactKind, ArtifactRef};
use std::path::PathBuf;

/// Orchestrates the full planning workflow — checks readiness, generates
/// planning artifacts, and persists outputs.
pub struct PlanningOrchestrator<'a> {
    initiative_repo: &'a dyn InitiativeRepository,
    mvp_repo: &'a dyn MvpRepository,
    requirement_repo: &'a dyn RequirementRepository,
    artifact_store: &'a dyn ArtifactStore,
}

impl<'a> PlanningOrchestrator<'a> {
    pub fn new(
        initiative_repo: &'a dyn InitiativeRepository,
        mvp_repo: &'a dyn MvpRepository,
        requirement_repo: &'a dyn RequirementRepository,
        artifact_store: &'a dyn ArtifactStore,
    ) -> Self {
        Self {
            initiative_repo,
            mvp_repo,
            requirement_repo,
            artifact_store,
        }
    }

    pub fn check_readiness(&self, initiative_id: Uuid) -> AppResult<(bool, f64)> {
        let initiative = self
            .initiative_repo
            .find_by_id(initiative_id)?
            .ok_or_else(|| AppError::NotFound(format!("Initiative {initiative_id}")))?;

        let mvps = self.mvp_repo.find_by_initiative(initiative_id)?;
        let mut reqs = Vec::new();
        for mvp in &mvps {
            reqs.extend(self.requirement_repo.find_by_mvp(mvp.id())?);
        }

        let ready = PlanningService::is_ready_for_planning(&initiative, &mvps, &reqs);
        let score = PlanningService::readiness_score(&mvps, &reqs);
        Ok((ready, score))
    }

    pub fn generate_planning_artifact(
        &self,
        initiative_id: Uuid,
        content: &str,
    ) -> AppResult<PathBuf> {
        let artifact = ArtifactRef {
            kind: ArtifactKind::PlanningOutput,
            name: format!("planning-{initiative_id}.md"),
            relative_path: PathBuf::from(format!("artifacts/planning/planning-{initiative_id}.md")),
        };
        let path = self
            .artifact_store
            .save_artifact(&artifact, content.as_bytes())?;
        info!(initiative_id = %initiative_id, path = %path.display(), "Planning artifact generated");
        Ok(path)
    }
}
