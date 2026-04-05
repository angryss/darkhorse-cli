use dh_domain::entities::Initiative;
use uuid::Uuid;

use crate::errors::AppResult;

/// Port for persisting and retrieving initiatives.
pub trait InitiativeRepository: Send + Sync {
    fn save(&self, initiative: &Initiative) -> AppResult<()>;
    fn find_by_id(&self, id: Uuid) -> AppResult<Option<Initiative>>;
    fn find_all(&self) -> AppResult<Vec<Initiative>>;
    fn delete(&self, id: Uuid) -> AppResult<bool>;
}
