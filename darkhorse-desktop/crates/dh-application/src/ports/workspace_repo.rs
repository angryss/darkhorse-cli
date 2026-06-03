use dh_domain::entities::Workspace;
use uuid::Uuid;

use crate::errors::AppResult;

/// Port for persisting and retrieving DarkHorse workspaces.
pub trait WorkspaceRepository: Send + Sync {
    fn save(&self, workspace: &Workspace) -> AppResult<()>;
    fn find_by_id(&self, id: Uuid) -> AppResult<Option<Workspace>>;
    fn find_all(&self) -> AppResult<Vec<Workspace>>;
    fn delete(&self, id: Uuid) -> AppResult<bool>;
}
