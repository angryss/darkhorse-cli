use dh_domain::entities::Mvp;
use uuid::Uuid;

use crate::errors::AppResult;

/// Port for persisting and retrieving MVPs.
pub trait MvpRepository: Send + Sync {
    fn save(&self, mvp: &Mvp) -> AppResult<()>;
    fn find_by_id(&self, id: Uuid) -> AppResult<Option<Mvp>>;
    fn find_by_initiative(&self, initiative_id: Uuid) -> AppResult<Vec<Mvp>>;
    fn delete(&self, id: Uuid) -> AppResult<bool>;
}
