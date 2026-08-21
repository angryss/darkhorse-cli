use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::Priority;

/// A structured requirement observation supplied to the A1 adapter.
///
/// After A1 exists, this record is not editable plan or completion authority.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Requirement {
    id: Uuid,
    mvp_id: Uuid,
    title: String,
    description: String,
    kind: RequirementKind,
    priority: Priority,
    acceptance_criteria: Vec<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RequirementKind {
    Functional,
    NonFunctional,
    Constraint,
    Assumption,
}

impl Requirement {
    pub fn new(
        mvp_id: Uuid,
        title: impl Into<String>,
        description: impl Into<String>,
        kind: RequirementKind,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            mvp_id,
            title: title.into(),
            description: description.into(),
            kind,
            priority: Priority::Medium,
            acceptance_criteria: Vec::new(),
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

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn description(&self) -> &str {
        &self.description
    }

    pub fn kind(&self) -> &RequirementKind {
        &self.kind
    }

    pub fn priority(&self) -> &Priority {
        &self.priority
    }

    pub fn acceptance_criteria(&self) -> &[String] {
        &self.acceptance_criteria
    }

    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = priority;
        self.updated_at = Utc::now();
    }

    pub fn add_criterion(&mut self, criterion: impl Into<String>) {
        self.acceptance_criteria.push(criterion.into());
        self.updated_at = Utc::now();
    }

    pub fn update_description(&mut self, description: impl Into<String>) {
        self.description = description.into();
        self.updated_at = Utc::now();
    }
}
