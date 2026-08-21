use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::DecisionRationale;

/// Captures a non-authoritative decision observation for A1 input. Governed
/// scope and architecture remain in canonical A1 after materialization.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MvpDecision {
    id: Uuid,
    mvp_id: Uuid,
    title: String,
    rationale: DecisionRationale,
    impact: DecisionImpact,
    created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DecisionImpact {
    /// Affects overall MVP scope definition
    ScopeDefining,
    /// Affects technical architecture
    Architectural,
    /// Affects product direction or priorities
    ProductDirection,
    /// Affects timeline or delivery approach
    DeliveryApproach,
}

impl MvpDecision {
    pub fn new(
        mvp_id: Uuid,
        title: impl Into<String>,
        rationale: DecisionRationale,
        impact: DecisionImpact,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            mvp_id,
            title: title.into(),
            rationale,
            impact,
            created_at: Utc::now(),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }
    pub fn mvp_id(&self) -> Uuid {
        self.mvp_id
    }
    pub fn title(&self) -> &str {
        &self.title
    }
    pub fn rationale(&self) -> &DecisionRationale {
        &self.rationale
    }
    pub fn impact(&self) -> &DecisionImpact {
        &self.impact
    }
    pub fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }
}
