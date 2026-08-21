use serde::{Deserialize, Serialize};

/// Local draft classification for A1 input, never canonical scope.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ScopeClassification {
    /// Confirmed for this MVP
    Included,
    /// Deliberately excluded from this MVP
    Excluded,
    /// Deferred to a future increment
    Deferred,
    /// Still being evaluated
    Undecided,
}

impl ScopeClassification {
    pub fn has_draft_classification(&self) -> bool {
        !matches!(self, ScopeClassification::Undecided)
    }
}

impl std::fmt::Display for ScopeClassification {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Included => write!(f, "Included"),
            Self::Excluded => write!(f, "Excluded"),
            Self::Deferred => write!(f, "Deferred"),
            Self::Undecided => write!(f, "Undecided"),
        }
    }
}
