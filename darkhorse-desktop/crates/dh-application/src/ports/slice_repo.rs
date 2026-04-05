use dh_domain::entities::ImplementationSlice;
use uuid::Uuid;

use crate::errors::AppResult;

/// Port for persisting and retrieving implementation slices.
pub trait SliceRepository: Send + Sync {
    fn save(&self, slice: &ImplementationSlice) -> AppResult<()>;
    fn find_by_id(&self, id: Uuid) -> AppResult<Option<ImplementationSlice>>;
    fn find_by_mvp(&self, mvp_id: Uuid) -> AppResult<Vec<ImplementationSlice>>;
    fn delete(&self, id: Uuid) -> AppResult<bool>;
}
