use dh_application::errors::AppError;
use dh_application::ports::WorkspaceRepository;
use dh_domain::entities::Workspace;
use uuid::Uuid;

use super::DbConnection;

/// SQLite-backed implementation of the WorkspaceRepository port.
pub struct SqliteWorkspaceRepo {
    db: std::sync::Arc<DbConnection>,
}

impl SqliteWorkspaceRepo {
    pub fn new(db: std::sync::Arc<DbConnection>) -> Self {
        Self { db }
    }
}

impl WorkspaceRepository for SqliteWorkspaceRepo {
    fn save(&self, workspace: &Workspace) -> dh_application::errors::AppResult<()> {
        self.db
            .with_conn(|conn| {
                conn.execute(
                    "INSERT OR REPLACE INTO workspaces (id, name, description, root_path, created_at, updated_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    rusqlite::params![
                        workspace.id().to_string(),
                        workspace.name(),
                        workspace.description(),
                        workspace.root_path().to_string_lossy().to_string(),
                        workspace.created_at().to_rfc3339(),
                        workspace.updated_at().to_rfc3339(),
                    ],
                )
                .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(())
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_by_id(&self, id: Uuid) -> dh_application::errors::AppResult<Option<Workspace>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT id, name, description, root_path, created_at, updated_at FROM workspaces WHERE id = ?1")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let result = stmt
                    .query_row([id.to_string()], |row| {
                        let name: String = row.get(1)?;
                        let root_path: String = row.get(3)?;
                        Ok(Workspace::create(name, root_path))
                    })
                    .optional()
                    .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(result)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_all(&self) -> dh_application::errors::AppResult<Vec<Workspace>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT id, name, description, root_path FROM workspaces ORDER BY created_at DESC")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let workspaces = stmt
                    .query_map([], |row| {
                        let name: String = row.get(1)?;
                        let root_path: String = row.get(3)?;
                        Ok(Workspace::create(name, root_path))
                    })
                    .map_err(crate::errors::InfraError::Sqlite)?
                    .collect::<Result<Vec<_>, _>>()
                    .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(workspaces)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn delete(&self, id: Uuid) -> dh_application::errors::AppResult<bool> {
        self.db
            .with_conn(|conn| {
                let rows = conn
                    .execute("DELETE FROM workspaces WHERE id = ?1", [id.to_string()])
                    .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(rows > 0)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }
}

trait OptionalExt<T> {
    fn optional(self) -> Result<Option<T>, rusqlite::Error>;
}

impl<T> OptionalExt<T> for Result<T, rusqlite::Error> {
    fn optional(self) -> Result<Option<T>, rusqlite::Error> {
        match self {
            Ok(val) => Ok(Some(val)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
