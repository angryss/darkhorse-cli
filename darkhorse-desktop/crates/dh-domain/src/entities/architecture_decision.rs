use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::DecisionRationale;

/// A lightweight Architecture Decision Record (ADR) capturing important
/// technical or product structure decisions.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchitectureDecision {
    id: Uuid,
    initiative_id: Uuid,
    title: String,
    context: String,
    rationale: DecisionRationale,
    status: AdrStatus,
    consequences: Vec<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AdrStatus {
    Proposed,
    Accepted,
    Superseded,
    Deprecated,
}

impl ArchitectureDecision {
    pub fn propose(
        initiative_id: Uuid,
        title: impl Into<String>,
        context: impl Into<String>,
        rationale: DecisionRationale,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            initiative_id,
            title: title.into(),
            context: context.into(),
            rationale,
            status: AdrStatus::Proposed,
            consequences: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid { self.id }
    pub fn initiative_id(&self) -> Uuid { self.initiative_id }
    pub fn title(&self) -> &str { &self.title }
    pub fn context(&self) -> &str { &self.context }
    pub fn rationale(&self) -> &DecisionRationale { &self.rationale }
    pub fn status(&self) -> &AdrStatus { &self.status }
    pub fn consequences(&self) -> &[String] { &self.consequences }

    pub fn accept(&mut self) {
        self.status = AdrStatus::Accepted;
        self.updated_at = Utc::now();
    }

    pub fn supersede(&mut self) {
        self.status = AdrStatus::Superseded;
        self.updated_at = Utc::now();
    }

    pub fn deprecate(&mut self) {
        self.status = AdrStatus::Deprecated;
        self.updated_at = Utc::now();
    }

    pub fn add_consequence(&mut self, consequence: impl Into<String>) {
        self.consequences.push(consequence.into());
        self.updated_at = Utc::now();
    }
}
