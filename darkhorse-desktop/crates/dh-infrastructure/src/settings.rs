use dh_application::errors::{AppError, AppResult};
use dh_application::ports::SettingsStore;
use std::sync::Arc;

use crate::database::DbConnection;

/// SQLite-backed settings store for app preferences and lightweight persisted state.
pub struct SqliteSettingsStore {
    db: Arc<DbConnection>,
}

impl SqliteSettingsStore {
    pub fn new(db: Arc<DbConnection>) -> Self {
        Self { db }
    }
}

impl SettingsStore for SqliteSettingsStore {
    fn get(&self, key: &str) -> AppResult<Option<String>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT value FROM settings WHERE key = ?1")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let result = stmt
                    .query_row([key], |row| row.get::<_, String>(0));
                match result {
                    Ok(val) => Ok(Some(val)),
                    Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
                    Err(e) => Err(crate::errors::InfraError::Sqlite(e)),
                }
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn set(&self, key: &str, value: &str) -> AppResult<()> {
        self.db
            .with_conn(|conn| {
                conn.execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
                    [key, value],
                )
                .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(())
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn delete(&self, key: &str) -> AppResult<bool> {
        self.db
            .with_conn(|conn| {
                let rows = conn
                    .execute("DELETE FROM settings WHERE key = ?1", [key])
                    .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(rows > 0)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }

    fn keys(&self) -> AppResult<Vec<String>> {
        self.db
            .with_conn(|conn| {
                let mut stmt = conn
                    .prepare("SELECT key FROM settings ORDER BY key")
                    .map_err(crate::errors::InfraError::Sqlite)?;
                let keys = stmt
                    .query_map([], |row| row.get::<_, String>(0))
                    .map_err(crate::errors::InfraError::Sqlite)?
                    .collect::<Result<Vec<_>, _>>()
                    .map_err(crate::errors::InfraError::Sqlite)?;
                Ok(keys)
            })
            .map_err(|e| AppError::Persistence(e.to_string()))
    }
}
