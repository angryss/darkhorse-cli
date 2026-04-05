use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::ScopeClassification;

/// A candidate item being evaluated for inclusion in MVP scope.
/// Used during the shaping process to track what's in, out, or deferred.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScopeCandidate {
    id: Uuid,
    mvp_id: Uuid,
    description: String,
    classification: ScopeClassification,
    rationale: String,
    source: ScopeCandidateSource,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

/// Where the scope candidate originated.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ScopeCandidateSource {
    Discovery,
    Stakeholder,
    Technical,
    UserResearch,
    Refinement,
}

impl ScopeCandidate {
    pub fn new(
        mvp_id: Uuid,
        description: impl Into<String>,
        source: ScopeCandidateSource,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            mvp_id,
            description: description.into(),
            classification: ScopeClassification::Undecided,
            rationale: String::new(),
            source,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid { self.id }
    pub fn mvp_id(&self) -> Uuid { self.mvp_id }
    pub fn description(&self) -> &str { &self.description }
    pub fn classification(&self) -> &ScopeClassification { &self.classification }
    pub fn rationale(&self) -> &str { &self.rationale }
    pub fn source(&self) -> &ScopeCandidateSource { &self.source }

    pub fn classify(&mut self, classification: ScopeClassification, rationale: impl Into<String>) {
        self.classification = classification;
        self.rationale = rationale.into();
        self.updated_at = Utc::now();
    }

    pub fn is_decided(&self) -> bool {
        self.classification.is_decided()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_candidate_is_undecided() {
        let c = ScopeCandidate::new(Uuid::new_v4(), "User login", ScopeCandidateSource::Discovery);
        assert!(!c.is_decided());
    }

    #[test]
    fn classifying_makes_it_decided() {
        let mut c = ScopeCandidate::new(Uuid::new_v4(), "User login", ScopeCandidateSource::Discovery);
        c.classify(ScopeClassification::Included, "Core feature");
        assert!(c.is_decided());
        assert_eq!(c.classification(), &ScopeClassification::Included);
    }
}
