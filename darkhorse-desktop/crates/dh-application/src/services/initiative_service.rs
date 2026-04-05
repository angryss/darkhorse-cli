use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::InitiativeRepository;
use dh_domain::entities::Initiative;
use dh_domain::values::Status;

/// Application service that coordinates initiative lifecycle operations
/// across the repository boundary.
pub struct InitiativeService<'a> {
    repo: &'a dyn InitiativeRepository,
}

impl<'a> InitiativeService<'a> {
    pub fn new(repo: &'a dyn InitiativeRepository) -> Self {
        Self { repo }
    }

    pub fn list_all(&self) -> AppResult<Vec<Initiative>> {
        self.repo.find_all()
    }

    pub fn get(&self, id: Uuid) -> AppResult<Initiative> {
        self.repo
            .find_by_id(id)?
            .ok_or_else(|| AppError::NotFound(format!("Initiative {id}")))
    }

    pub fn advance(&self, id: Uuid, target: Status) -> AppResult<Initiative> {
        let mut initiative = self.get(id)?;
        initiative.advance_status(target)?;
        self.repo.save(&initiative)?;
        info!(id = %id, status = ?initiative.status(), "Initiative status advanced");
        Ok(initiative)
    }

    pub fn archive(&self, id: Uuid) -> AppResult<Initiative> {
        self.advance(id, Status::Archived)
    }
}
