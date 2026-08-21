use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::ScopeSize;

/// A product-scope draft used as VEP/A1 input. It cannot authorize lifecycle,
/// readiness, risk tier, or completion.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mvp {
    id: Uuid,
    initiative_id: Uuid,
    name: String,
    version: String,
    goal: String,
    scope: ScopeSize,
    boundaries: Vec<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl Mvp {
    pub fn new(
        initiative_id: Uuid,
        name: impl Into<String>,
        version: impl Into<String>,
        goal: impl Into<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            initiative_id,
            name: name.into(),
            version: version.into(),
            goal: goal.into(),
            scope: ScopeSize::Small,
            boundaries: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn initiative_id(&self) -> Uuid {
        self.initiative_id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn version(&self) -> &str {
        &self.version
    }

    pub fn goal(&self) -> &str {
        &self.goal
    }

    pub fn scope(&self) -> &ScopeSize {
        &self.scope
    }

    pub fn boundaries(&self) -> &[String] {
        &self.boundaries
    }

    pub fn set_scope(&mut self, scope: ScopeSize) {
        self.scope = scope;
        self.updated_at = Utc::now();
    }

    pub fn add_boundary(&mut self, boundary: impl Into<String>) {
        self.boundaries.push(boundary.into());
        self.updated_at = Utc::now();
    }

    pub fn update_goal(&mut self, goal: impl Into<String>) {
        self.goal = goal.into();
        self.updated_at = Utc::now();
    }
}
