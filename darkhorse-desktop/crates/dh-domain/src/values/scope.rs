use serde::{Deserialize, Serialize};

/// Relative draft sizing input; it does not select VEP tier.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ScopeSize {
    Tiny,
    Small,
    Medium,
    Large,
}

/// Draft scope observations. Canonical scope lives in A1 after materialization.
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
