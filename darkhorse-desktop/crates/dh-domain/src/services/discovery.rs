use crate::entities::DiscoverySession;
use crate::values::VepReadinessInput;

/// Collects Desktop observations for a governed VEP input. It does not score,
/// gate, or decide whether Discover may transition to Plan.
pub struct DiscoveryService;

impl DiscoveryService {
    pub fn collect_vep_input(session: &DiscoverySession) -> VepReadinessInput {
        VepReadinessInput {
            discovery_notes_present: !session.notes().trim().is_empty(),
            option_count: session.options_considered().len(),
            unresolved_tradeoff_count: session.unpositioned_tradeoff_count(),
            open_question_count: session.open_questions().len(),
            mvp_count: 0,
            requirement_count: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn observation_has_no_readiness_decision() {
        let session = DiscoverySession::start(Uuid::new_v4(), "Test", "Problem");
        let value = serde_json::to_value(DiscoveryService::collect_vep_input(&session)).unwrap();
        assert!(value.get("isReady").is_none());
        assert!(value.get("score").is_none());
        assert_eq!(value["optionCount"], 0);
    }
}
