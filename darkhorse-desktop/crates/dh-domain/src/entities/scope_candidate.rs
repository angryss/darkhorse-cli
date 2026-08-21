use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::ScopeClassification;

/// A non-authoritative scope observation. Its local classification is draft
/// input only and cannot override canonical A1 scope.
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
    pub fn new(mvp_id: Uuid, description: impl Into<String>, source: ScopeCandidateSource) -> Self {
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

    pub fn id(&self) -> Uuid {
        self.id
    }
    pub fn mvp_id(&self) -> Uuid {
        self.mvp_id
    }
    pub fn description(&self) -> &str {
        &self.description
    }
    pub fn classification(&self) -> &ScopeClassification {
        &self.classification
    }
    pub fn rationale(&self) -> &str {
        &self.rationale
    }
    pub fn source(&self) -> &ScopeCandidateSource {
        &self.source
    }

    pub fn classify_draft(
        &mut self,
        classification: ScopeClassification,
        rationale: impl Into<String>,
    ) {
        self.classification = classification;
        self.rationale = rationale.into();
        self.updated_at = Utc::now();
    }

    pub fn has_draft_classification(&self) -> bool {
        self.classification.has_draft_classification()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_candidate_is_undecided() {
        let c = ScopeCandidate::new(
            Uuid::new_v4(),
            "User login",
            ScopeCandidateSource::Discovery,
        );
        assert!(!c.has_draft_classification());
    }

    #[test]
    fn classifying_makes_it_decided() {
        let mut c = ScopeCandidate::new(
            Uuid::new_v4(),
            "User login",
            ScopeCandidateSource::Discovery,
        );
        c.classify_draft(ScopeClassification::Included, "Core feature");
        assert!(c.has_draft_classification());
        assert_eq!(c.classification(), &ScopeClassification::Included);
    }
}
