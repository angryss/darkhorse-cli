use serde::{Deserialize, Serialize};

/// Relative sizing for MVP scope.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ScopeSize {
    Tiny,
    Small,
    Medium,
    Large,
}

/// Represents an explicit scope boundary — things that are
/// deliberately included or excluded from an MVP.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScopeBoundary {
    pub included: Vec<String>,
    pub excluded: Vec<String>,
    pub deferred: Vec<String>,
}

impl ScopeBoundary {
    pub fn new() -> Self {
        Self {
            included: Vec::new(),
            excluded: Vec::new(),
            deferred: Vec::new(),
        }
    }
}

impl Default for ScopeBoundary {
    fn default() -> Self {
        Self::new()
    }
}
