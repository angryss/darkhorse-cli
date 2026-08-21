use crate::entities::{Mvp, Requirement};
use crate::values::VepReadinessInput;

/// Collects planning facts without creating a competing readiness truth.
pub struct PlanningService;

impl PlanningService {
    pub fn collect_vep_input(mvps: &[Mvp], requirements: &[Requirement]) -> VepReadinessInput {
        VepReadinessInput {
            discovery_notes_present: false,
            option_count: 0,
            unresolved_tradeoff_count: 0,
            open_question_count: 0,
            mvp_count: mvps.len(),
            requirement_count: requirements.len(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn planning_observation_has_no_gate_or_score() {
        let value = serde_json::to_value(PlanningService::collect_vep_input(&[], &[])).unwrap();
        assert!(value.get("isReady").is_none());
        assert!(value.get("readinessScore").is_none());
        assert_eq!(value["mvpCount"], 0);
    }
}
