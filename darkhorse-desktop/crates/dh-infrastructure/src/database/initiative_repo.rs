use dh_application::errors::AppError;
use dh_application::ports::InitiativeRepository;
use dh_domain::entities::Initiative;
use uuid::Uuid;

// Persisted `status` is a legacy catalog label retained for lossless user-data
// compatibility. No repository read/write can authorize VEP lifecycle state.

use super::DbConnection;

/// SQLite-backed implementation of the InitiativeRepository port.
pub struct SqliteInitiativeRepo {
    db: std::sync::Arc<DbConnection>,
}

impl SqliteInitiativeRepo {
    pub fn new(db: std::sync::Arc<DbConnection>) -> Self {
        Self { db }
    }
}

impl InitiativeRepository for SqliteInitiativeRepo {
    fn save(&self, initiative: &Initiative) -> dh_application::errors::AppResult<()> {
        self.db
            .with_conn(|conn| {
                let json = serde_json::to_string(initiative)
                    .map_err(|e| crate::errors::InfraError::Serialization(e))?;

                conn.execute(
                    "INSERT OR REPLACE INTO initiatives (id, name, description, status, priority, tags, created_at, updated_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    rusqlite::params![
                        initiative.id().to_string(),
                        initiative.name(),
                        initiative.description(),
                        format!("{:?}", initiative.status()),
                        format!("{}", initiative.priority()),
                        serde_json::to_string(initiative.tags()).unwrap_or_default(),
                        initiative.created_at().to_rfc3339(),
                        initiative.updated_at().to_rfc3339(),
                    ],
                )
                .map_err(crate::errors::InfraError::Sqlite)?;

                let _ = json; // full serialization validated
                Ok(())
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_by_id(&self, id: Uuid) -> dh_application::errors::AppResult<Option<Initiative>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT id, name, description, status, priority, tags, created_at, updated_at FROM initiatives WHERE id = ?1")
                    .map_err(crate::errors::InfraError::Sqlite)?;

                let result = stmt
                    .query_row([id.to_string()], |row| {
                        let name: String = row.get(1)?;
                        let description: String = row.get(2)?;
                        Ok(Initiative::new(name, description))
                    })
                    .optional()
                    .map_err(crate::errors::InfraError::Sqlite)?;

                Ok(result)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_all(&self) -> dh_application::errors::AppResult<Vec<Initiative>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare(
                        "SELECT id, name, description FROM initiatives ORDER BY created_at DESC",
                    )
                    .map_err(crate::errors::InfraError::Sqlite)?;

                let initiatives = stmt
                    .query_map([], |row| {
                        let name: String = row.get(1)?;
                        let description: String = row.get(2)?;
                        Ok(Initiative::new(name, description))
                    })
                    .map_err(crate::errors::InfraError::Sqlite)?
                    .collect::<Result<Vec<_>, _>>()
                    .map_err(crate::errors::InfraError::Sqlite)?;

                Ok(initiatives)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn delete(&self, id: Uuid) -> dh_application::errors::AppResult<bool> {
        self.db
            .with_conn(|conn| {
                let rows = conn
                    .execute("DELETE FROM initiatives WHERE id = ?1", [id.to_string()])
                    .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(rows > 0)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }
}

/// Extension trait making rusqlite optional results ergonomic.
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
