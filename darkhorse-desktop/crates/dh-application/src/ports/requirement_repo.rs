use dh_domain::entities::Requirement;
use uuid::Uuid;

use crate::errors::AppResult;

/// Port for persisting and retrieving requirements.
pub trait RequirementRepository: Send + Sync {
    fn save(&self, requirement: &Requirement) -> AppResult<()>;
    fn find_by_id(&self, id: Uuid) -> AppResult<Option<Requirement>>;
    fn find_by_mvp(&self, mvp_id: Uuid) -> AppResult<Vec<Requirement>>;
    fn delete(&self, id: Uuid) -> AppResult<bool>;
}
