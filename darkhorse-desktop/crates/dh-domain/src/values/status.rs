use serde::{Deserialize, Serialize};

/// Lifecycle status for an initiative. Transitions must follow
/// a forward-only flow: Draft → Exploring → Planning → Delivering → Completed.
/// An initiative can be Archived from any active state.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Status {
    Draft,
    Exploring,
    Planning,
    Delivering,
    Completed,
    Archived,
}

impl Status {
    /// Returns whether transitioning from `self` to `target` is allowed.
    pub fn can_transition_to(&self, target: &Status) -> bool {
        // Anything can be archived
        if *target == Status::Archived {
            return true;
        }
        matches!(
            (self, target),
            (Status::Draft, Status::Exploring)
                | (Status::Exploring, Status::Planning)
                | (Status::Planning, Status::Delivering)
                | (Status::Delivering, Status::Completed)
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_forward_transitions() {
        assert!(Status::Draft.can_transition_to(&Status::Exploring));
        assert!(Status::Exploring.can_transition_to(&Status::Planning));
        assert!(Status::Planning.can_transition_to(&Status::Delivering));
        assert!(Status::Delivering.can_transition_to(&Status::Completed));
    }

    #[test]
    fn any_state_can_archive() {
        assert!(Status::Draft.can_transition_to(&Status::Archived));
        assert!(Status::Delivering.can_transition_to(&Status::Archived));
    }

    #[test]
    fn cannot_skip_states() {
        assert!(!Status::Draft.can_transition_to(&Status::Planning));
        assert!(!Status::Draft.can_transition_to(&Status::Delivering));
    }
}
