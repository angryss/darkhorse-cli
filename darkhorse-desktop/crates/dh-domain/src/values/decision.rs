use serde::{Deserialize, Serialize};

/// Captures the reasoning behind a key product or architecture decision.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionRationale {
    pub chosen_option: String,
    pub reasoning: String,
    pub alternatives_considered: Vec<String>,
    pub constraints: Vec<String>,
}

impl DecisionRationale {
    pub fn new(chosen: impl Into<String>, reasoning: impl Into<String>) -> Self {
        Self {
            chosen_option: chosen.into(),
            reasoning: reasoning.into(),
            alternatives_considered: Vec::new(),
            constraints: Vec::new(),
        }
    }

    pub fn with_alternative(mut self, alt: impl Into<String>) -> Self {
        self.alternatives_considered.push(alt.into());
        self
    }

    pub fn with_constraint(mut self, constraint: impl Into<String>) -> Self {
        self.constraints.push(constraint.into());
        self
    }
}
