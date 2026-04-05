use crate::entities::{DiscoverySession, DiscoveryPhase};
use crate::values::PlanningReadiness;

/// Domain service for evaluating discovery session health
/// and readiness to transition from discovery to planning.
pub struct DiscoveryService;

impl DiscoveryService {
    /// Assesses whether a discovery session has concluded with enough
    /// information to proceed to formal planning.
    pub fn assess_readiness(session: &DiscoverySession) -> PlanningReadiness {
        let mut blockers = Vec::new();

        if !session.is_concluded() {
            blockers.push(format!(
                "Session is still in {:?} phase — must be Concluded",
                session.phase()
            ));
        }

        if session.options_considered().is_empty() {
            blockers.push("No options have been explored".into());
        }

        let unresolved_tradeoffs = session.unresolved_tradeoff_count();
        if unresolved_tradeoffs > 0 {
            blockers.push(format!("{unresolved_tradeoffs} unresolved tradeoff(s) remain"));
        }

        if session.open_questions().len() > 3 {
            blockers.push(format!(
                "{} open questions remain — reduce to 3 or fewer",
                session.open_questions().len()
            ));
        }

        let score = Self::compute_score(session);

        if blockers.is_empty() {
            let mut readiness = PlanningReadiness::ready(score);
            if session.risks().is_empty() {
                readiness = readiness.with_recommendation(
                    "Consider identifying at least one risk before planning",
                );
            }
            readiness
        } else {
            PlanningReadiness::not_ready(score, blockers)
        }
    }

    fn compute_score(session: &DiscoverySession) -> f64 {
        let mut score = 0.0;
        let total = 5.0;

        // Phase progress
        score += match session.phase() {
            DiscoveryPhase::Framing => 0.2,
            DiscoveryPhase::Exploring => 0.5,
            DiscoveryPhase::Converging => 0.8,
            DiscoveryPhase::Concluded => 1.0,
        };

        // Options explored
        if !session.options_considered().is_empty() {
            score += 1.0;
        }

        // Selected option exists
        if session.options_considered().iter().any(|o| o.selected) {
            score += 1.0;
        }

        // Tradeoffs resolved
        if !session.tradeoffs().is_empty() && session.unresolved_tradeoff_count() == 0 {
            score += 1.0;
        }

        // Risk identification
        if !session.risks().is_empty() {
            score += 1.0;
        }

        score / total
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::values::{Tradeoff, TradeoffPosition, IdentifiedRisk, RiskLevel, RiskCategory};
    use uuid::Uuid;

    #[test]
    fn framing_session_is_not_ready() {
        let s = DiscoverySession::start(Uuid::new_v4(), "Test", "Problem");
        let readiness = DiscoveryService::assess_readiness(&s);
        assert!(!readiness.is_ready);
        assert!(!readiness.blockers.is_empty());
    }

    #[test]
    fn concluded_session_with_options_is_ready() {
        let mut s = DiscoverySession::start(Uuid::new_v4(), "Test", "Problem");
        s.add_option("Option A", "Description A");
        s.select_option(0);
        s.add_tradeoff(Tradeoff::new("Speed", "Quality", TradeoffPosition::Balanced, "Balanced approach"));
        s.add_risk(IdentifiedRisk::new("Tight timeline", RiskLevel::Medium, RiskCategory::Delivery));
        s.advance_phase(DiscoveryPhase::Exploring).unwrap();
        s.advance_phase(DiscoveryPhase::Converging).unwrap();
        s.advance_phase(DiscoveryPhase::Concluded).unwrap();

        let readiness = DiscoveryService::assess_readiness(&s);
        assert!(readiness.is_ready);
    }
}
