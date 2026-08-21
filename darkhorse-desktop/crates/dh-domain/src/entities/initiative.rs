use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::{Priority, Status};

/// An initiative represents a high-level product idea or strategic goal
/// that the user wants to explore, plan, and deliver.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Initiative {
    id: Uuid,
    name: String,
    description: String,
    status: Status,
    priority: Priority,
    tags: Vec<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl Initiative {
    pub fn new(name: impl Into<String>, description: impl Into<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name: name.into(),
            description: description.into(),
            status: Status::Draft,
            priority: Priority::Medium,
            tags: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn description(&self) -> &str {
        &self.description
    }

    pub fn status(&self) -> &Status {
        &self.status
    }

    pub fn priority(&self) -> &Priority {
        &self.priority
    }

    pub fn tags(&self) -> &[String] {
        &self.tags
    }

    pub fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    pub fn updated_at(&self) -> DateTime<Utc> {
        self.updated_at
    }

    pub fn rename(&mut self, name: impl Into<String>) {
        self.name = name.into();
        self.updated_at = Utc::now();
    }

    pub fn update_description(&mut self, description: impl Into<String>) {
        self.description = description.into();
        self.updated_at = Utc::now();
    }

    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = priority;
        self.updated_at = Utc::now();
    }

    pub fn add_tag(&mut self, tag: impl Into<String>) {
        let tag = tag.into();
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
            self.updated_at = Utc::now();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_initiative_has_draft_status() {
        let init = Initiative::new("Test", "A test initiative");
        assert!(matches!(init.status(), Status::Draft));
    }
}
