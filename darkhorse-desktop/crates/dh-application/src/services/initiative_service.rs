use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::InitiativeRepository;
use dh_domain::entities::Initiative;

/// Initiative catalog service. It intentionally exposes no lifecycle mutation.
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
}
