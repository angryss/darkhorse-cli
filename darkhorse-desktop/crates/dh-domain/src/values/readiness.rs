use serde::{Deserialize, Serialize};

/// Readiness assessment for transitioning from discovery to planning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanningReadiness {
    pub score: f64,
    pub is_ready: bool,
    pub blockers: Vec<String>,
    pub recommendations: Vec<String>,
}

/// Structural Desktop observations supplied to the governed planning adapter.
/// Deliberately contains no score, gate, or ready/not-ready decision.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct VepReadinessInput {
    pub discovery_notes_present: bool,
    pub option_count: usize,
    pub unresolved_tradeoff_count: usize,
    pub open_question_count: usize,
    pub mvp_count: usize,
    pub requirement_count: usize,
}
