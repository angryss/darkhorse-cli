use dh_domain::entities::DiscoverySession;
use uuid::Uuid;

use crate::errors::AppResult;

/// Port for persisting and retrieving discovery sessions.
pub trait DiscoverySessionRepository: Send + Sync {
    fn save(&self, session: &DiscoverySession) -> AppResult<()>;
    fn find_by_id(&self, id: Uuid) -> AppResult<Option<DiscoverySession>>;
    fn find_by_initiative(&self, initiative_id: Uuid) -> AppResult<Vec<DiscoverySession>>;
    fn delete(&self, id: Uuid) -> AppResult<bool>;
}
