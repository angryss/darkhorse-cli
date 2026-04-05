use serde::{Deserialize, Serialize};

/// The type of implementation slice generated from requirements.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SliceType {
    /// Full vertical slice through all layers
    FullStack,
    /// API/backend-only slice
    Backend,
    /// UI/frontend-only slice
    Frontend,
    /// Infrastructure or cross-cutting concern
    Infrastructure,
    /// Data migration or schema change
    DataMigration,
    /// Integration with external system
    Integration,
}

impl std::fmt::Display for SliceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::FullStack => write!(f, "Full Stack"),
            Self::Backend => write!(f, "Backend"),
            Self::Frontend => write!(f, "Frontend"),
            Self::Infrastructure => write!(f, "Infrastructure"),
            Self::DataMigration => write!(f, "Data Migration"),
            Self::Integration => write!(f, "Integration"),
        }
    }
}
