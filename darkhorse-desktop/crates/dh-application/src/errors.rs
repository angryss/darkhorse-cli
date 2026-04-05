use thiserror::Error;

/// Application-level errors representing use-case failures.
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Persistence error: {0}")]
    Persistence(String),

    #[error("Filesystem error: {0}")]
    Filesystem(String),

    #[error("Workflow error: {0}")]
    Workflow(String),

    #[error(transparent)]
    Domain(#[from] dh_domain::errors::DomainError),

    #[error(transparent)]
    Unexpected(#[from] anyhow::Error),
}

pub type AppResult<T> = Result<T, AppError>;
