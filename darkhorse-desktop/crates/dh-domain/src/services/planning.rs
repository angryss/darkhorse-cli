use crate::entities::{Initiative, Mvp, Requirement};
use crate::values::Status;

/// Domain service that encapsulates planning-related decision logic
/// spanning multiple aggregates.
pub struct PlanningService;

impl PlanningService {
    /// Determines whether an initiative is ready to begin formal planning.
    /// Requires at least one MVP with a defined goal and at least three requirements.
    pub fn is_ready_for_planning(
        initiative: &Initiative,
        mvps: &[Mvp],
        requirements: &[Requirement],
    ) -> bool {
        if *initiative.status() != Status::Exploring {
            return false;
        }
        let has_mvp_with_goal = mvps.iter().any(|m| !m.goal().is_empty());
        let enough_requirements = requirements.len() >= 3;
        has_mvp_with_goal && enough_requirements
    }

    /// Calculates a simple readiness score (0.0–1.0) based on how much
    /// planning preparation has been completed.
    pub fn readiness_score(mvps: &[Mvp], requirements: &[Requirement]) -> f64 {
        let mvp_score = if mvps.is_empty() {
            0.0
        } else {
            let with_goal = mvps.iter().filter(|m| !m.goal().is_empty()).count() as f64;
            let with_boundaries = mvps.iter().filter(|m| !m.boundaries().is_empty()).count() as f64;
            (with_goal + with_boundaries) / (mvps.len() as f64 * 2.0)
        };

        let req_score = match requirements.len() {
            0 => 0.0,
            1..=2 => 0.3,
            3..=5 => 0.6,
            6..=10 => 0.8,
            _ => 1.0,
        };

        (mvp_score + req_score) / 2.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::entities::RequirementKind;
    use uuid::Uuid;

    #[test]
    fn not_ready_when_draft() {
        let init = Initiative::new("Test", "desc");
        assert!(!PlanningService::is_ready_for_planning(&init, &[], &[]));
    }

    #[test]
    fn ready_with_mvp_and_requirements() {
        let mut init = Initiative::new("Test", "desc");
        init.advance_status(Status::Exploring).unwrap();

        let mvp = Mvp::new(init.id(), "MVP 1", "1.0", "Validate core hypothesis");
        let reqs: Vec<Requirement> = (0..3)
            .map(|i| {
                Requirement::new(
                    mvp.id(),
                    format!("Req {i}"),
                    "description",
                    RequirementKind::Functional,
                )
            })
            .collect();

        assert!(PlanningService::is_ready_for_planning(&init, &[mvp], &reqs));
    }

    #[test]
    fn readiness_score_empty() {
        assert_eq!(PlanningService::readiness_score(&[], &[]), 0.0);
    }

    #[test]
    fn readiness_score_improves() {
        let id = Uuid::new_v4();
        let mvp = Mvp::new(id, "MVP", "1.0", "A goal");
        let reqs: Vec<Requirement> = (0..5)
            .map(|i| {
                Requirement::new(id, format!("R{i}"), "d", RequirementKind::Functional)
            })
            .collect();
        let score = PlanningService::readiness_score(&[mvp], &reqs);
        assert!(score > 0.4);
    }
}
