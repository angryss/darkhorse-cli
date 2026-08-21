use dh_application::errors::AppError;
use dh_application::ports::DiscoverySessionRepository;
use dh_domain::entities::DiscoverySession;
use uuid::Uuid;

// Serialized phase/risk values are non-authoritative notebook/VEP input data.

use super::DbConnection;

/// SQLite-backed implementation of the DiscoverySessionRepository port.
/// Uses JSON serialization for the full entity to preserve rich nested structure.
pub struct SqliteDiscoverySessionRepo {
    db: std::sync::Arc<DbConnection>,
}

impl SqliteDiscoverySessionRepo {
    pub fn new(db: std::sync::Arc<DbConnection>) -> Self {
        Self { db }
    }
}

impl DiscoverySessionRepository for SqliteDiscoverySessionRepo {
    fn save(&self, session: &DiscoverySession) -> dh_application::errors::AppResult<()> {
        self.db
            .with_conn(|conn| {
                let json = serde_json::to_string(session)
                    .map_err(crate::errors::InfraError::Serialization)?;
                conn.execute(
                    "INSERT OR REPLACE INTO discovery_sessions (id, initiative_id, data_json, created_at, updated_at)
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    rusqlite::params![
                        session.id().to_string(),
                        session.initiative_id().to_string(),
                        json,
                        session.created_at().to_rfc3339(),
                        session.updated_at().to_rfc3339(),
                    ],
                )
                .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(())
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_by_id(&self, id: Uuid) -> dh_application::errors::AppResult<Option<DiscoverySession>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT data_json FROM discovery_sessions WHERE id = ?1")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let result = stmt
                    .query_row([id.to_string()], |row| {
                        let json: String = row.get(0)?;
                        Ok(json)
                    })
                    .optional()
                    .map_err(crate::errors::InfraError::Sqlite)?;
                match result {
                    Some(json) => {
                        let session: DiscoverySession = serde_json::from_str(&json)
                            .map_err(crate::errors::InfraError::Serialization)?;
                        Ok(Some(session))
                    }
                    None => Ok(None),
                }
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_by_initiative(
        &self,
        initiative_id: Uuid,
    ) -> dh_application::errors::AppResult<Vec<DiscoverySession>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT data_json FROM discovery_sessions WHERE initiative_id = ?1 ORDER BY created_at DESC")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let sessions = stmt
                    .query_map([initiative_id.to_string()], |row| {
                        let json: String = row.get(0)?;
                        Ok(json)
                    })
                    .map_err(crate::errors::InfraError::Sqlite)?
                    .filter_map(|r| r.ok())
                    .filter_map(|json| serde_json::from_str(&json).ok())
                    .collect();
                Ok(sessions)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn delete(&self, id: Uuid) -> dh_application::errors::AppResult<bool> {
        self.db
            .with_conn(|conn| {
                let rows = conn
                    .execute(
                        "DELETE FROM discovery_sessions WHERE id = ?1",
                        [id.to_string()],
                    )
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
