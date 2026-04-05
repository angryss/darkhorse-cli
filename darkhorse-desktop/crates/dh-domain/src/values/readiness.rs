use serde::{Deserialize, Serialize};

/// Readiness assessment for transitioning from discovery to planning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanningReadiness {
    pub score: f64,
    pub is_ready: bool,
    pub blockers: Vec<String>,
    pub recommendations: Vec<String>,
}

impl PlanningReadiness {
    pub fn ready(score: f64) -> Self {
        Self {
            score,
            is_ready: true,
            blockers: Vec::new(),
            recommendations: Vec::new(),
        }
    }

    pub fn not_ready(score: f64, blockers: Vec<String>) -> Self {
        Self {
            score,
            is_ready: false,
            blockers,
            recommendations: Vec::new(),
        }
    }

    pub fn with_recommendation(mut self, rec: impl Into<String>) -> Self {
        self.recommendations.push(rec.into());
        self
    }
}
