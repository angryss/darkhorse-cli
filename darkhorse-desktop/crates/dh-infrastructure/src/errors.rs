use thiserror::Error;

/// Infrastructure-level errors.
#[derive(Debug, Error)]
pub enum InfraError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("Settings error: {0}")]
    Settings(String),

    #[error("Update check failed: {0}")]
    UpdateCheck(String),
}
