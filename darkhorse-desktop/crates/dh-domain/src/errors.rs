use thiserror::Error;

/// Domain-level errors representing invariant violations and business rule failures.
#[derive(Debug, Error)]
pub enum DomainError {
    #[error("Initiative not found: {0}")]
    InitiativeNotFound(String),

    #[error("MVP not found: {0}")]
    MvpNotFound(String),

    #[error("Requirement not found: {0}")]
    RequirementNotFound(String),

    #[error("Discovery session not found: {0}")]
    DiscoverySessionNotFound(String),

    #[error("Workspace not found: {0}")]
    WorkspaceNotFound(String),

    #[error("Invalid state transition from {from} to {to}")]
    InvalidStateTransition { from: String, to: String },

    #[error("Validation failed: {0}")]
    ValidationFailed(String),

    #[error("Duplicate entry: {0}")]
    DuplicateEntry(String),

    #[error("Scope boundary violated: {0}")]
    ScopeBoundaryViolated(String),

    #[error("Planning readiness not met: {0}")]
    PlanningReadinessNotMet(String),

    #[error("Artifact not found: {0}")]
    ArtifactNotFound(String),

    #[error("Slice not found: {0}")]
    SliceNotFound(String),
}

pub type DomainResult<T> = Result<T, DomainError>;
