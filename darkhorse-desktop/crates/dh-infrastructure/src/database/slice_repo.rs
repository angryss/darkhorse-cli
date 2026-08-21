use dh_application::errors::AppError;
use dh_application::ports::SliceRepository;
use dh_domain::entities::ImplementationSlice;
use uuid::Uuid;

// Slice status is local work-item presentation data, never VEP completion.

use super::DbConnection;

/// SQLite-backed implementation of the SliceRepository port.
/// Uses JSON serialization for the full entity.
pub struct SqliteSliceRepo {
    db: std::sync::Arc<DbConnection>,
}

impl SqliteSliceRepo {
    pub fn new(db: std::sync::Arc<DbConnection>) -> Self {
        Self { db }
    }
}

impl SliceRepository for SqliteSliceRepo {
    fn save(&self, slice: &ImplementationSlice) -> dh_application::errors::AppResult<()> {
        self.db
            .with_conn(|conn| {
                let json = serde_json::to_string(slice)
                    .map_err(crate::errors::InfraError::Serialization)?;
                conn.execute(
                    "INSERT OR REPLACE INTO implementation_slices (id, mvp_id, data_json, created_at, updated_at)
                     VALUES (?1, ?2, ?3, datetime('now'), datetime('now'))",
                    rusqlite::params![
                        slice.id().to_string(),
                        slice.mvp_id().to_string(),
                        json,
                    ],
                )
                .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(())
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_by_id(
        &self,
        id: Uuid,
    ) -> dh_application::errors::AppResult<Option<ImplementationSlice>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT data_json FROM implementation_slices WHERE id = ?1")
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
                        let slice: ImplementationSlice = serde_json::from_str(&json)
                            .map_err(crate::errors::InfraError::Serialization)?;
                        Ok(Some(slice))
                    }
                    None => Ok(None),
                }
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn find_by_mvp(
        &self,
        mvp_id: Uuid,
    ) -> dh_application::errors::AppResult<Vec<ImplementationSlice>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT data_json FROM implementation_slices WHERE mvp_id = ?1 ORDER BY created_at")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let slices = stmt
                    .query_map([mvp_id.to_string()], |row| {
                        let json: String = row.get(0)?;
                        Ok(json)
                    })
                    .map_err(crate::errors::InfraError::Sqlite)?
                    .filter_map(|r| r.ok())
                    .filter_map(|json| serde_json::from_str(&json).ok())
                    .collect();
                Ok(slices)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn delete(&self, id: Uuid) -> dh_application::errors::AppResult<bool> {
        self.db
            .with_conn(|conn| {
                let rows = conn
                    .execute(
                        "DELETE FROM implementation_slices WHERE id = ?1",
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
