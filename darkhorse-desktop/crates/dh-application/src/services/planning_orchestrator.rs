use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::{ArtifactStore, InitiativeRepository, MvpRepository, RequirementRepository};
use dh_domain::services::PlanningService;
use dh_domain::values::VepReadinessInput;
use std::path::Path;

/// Read-only planning adapter. A1 remains the sole editable plan authority;
/// this service can collect input or read an already-derived projection only.
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

    pub fn collect_vep_input(&self, initiative_id: Uuid) -> AppResult<VepReadinessInput> {
        self.initiative_repo
            .find_by_id(initiative_id)?
            .ok_or_else(|| AppError::NotFound(format!("Initiative {initiative_id}")))?;
        let mvps = self.mvp_repo.find_by_initiative(initiative_id)?;
        let mut requirements = Vec::new();
        for mvp in &mvps {
            requirements.extend(self.requirement_repo.find_by_mvp(mvp.id())?);
        }
        Ok(PlanningService::collect_vep_input(&mvps, &requirements))
    }

    pub fn load_derived_projection(&self, relative_path: &Path) -> AppResult<Vec<u8>> {
        self.artifact_store.load_artifact(relative_path)
    }
}
