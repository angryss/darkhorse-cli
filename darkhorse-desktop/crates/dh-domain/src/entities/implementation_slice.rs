use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::{Priority, SliceType};
use crate::entities::ProgressStatus;

/// An implementation slice is a delivery-ready unit of work derived
/// from one or more requirements. Slices represent the DarkHorse model
/// of turning requirements into concrete implementation chunks.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImplementationSlice {
    id: Uuid,
    mvp_id: Uuid,
    title: String,
    description: String,
    slice_type: SliceType,
    priority: Priority,
    status: ProgressStatus,
    requirement_ids: Vec<Uuid>,
    acceptance_criteria: Vec<String>,
    estimated_complexity: SliceComplexity,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SliceComplexity {
    Trivial,
    Low,
    Medium,
    High,
    VeryHigh,
}

impl ImplementationSlice {
    pub fn new(
        mvp_id: Uuid,
        title: impl Into<String>,
        description: impl Into<String>,
        slice_type: SliceType,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            mvp_id,
            title: title.into(),
            description: description.into(),
            slice_type,
            priority: Priority::Medium,
            status: ProgressStatus::NotStarted,
            requirement_ids: Vec::new(),
            acceptance_criteria: Vec::new(),
            estimated_complexity: SliceComplexity::Medium,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid { self.id }
    pub fn mvp_id(&self) -> Uuid { self.mvp_id }
    pub fn title(&self) -> &str { &self.title }
    pub fn description(&self) -> &str { &self.description }
    pub fn slice_type(&self) -> &SliceType { &self.slice_type }
    pub fn priority(&self) -> &Priority { &self.priority }
    pub fn status(&self) -> &ProgressStatus { &self.status }
    pub fn requirement_ids(&self) -> &[Uuid] { &self.requirement_ids }
    pub fn acceptance_criteria(&self) -> &[String] { &self.acceptance_criteria }
    pub fn estimated_complexity(&self) -> &SliceComplexity { &self.estimated_complexity }

    pub fn link_requirement(&mut self, requirement_id: Uuid) {
        if !self.requirement_ids.contains(&requirement_id) {
            self.requirement_ids.push(requirement_id);
            self.updated_at = Utc::now();
        }
    }

    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = priority;
        self.updated_at = Utc::now();
    }

    pub fn set_complexity(&mut self, complexity: SliceComplexity) {
        self.estimated_complexity = complexity;
        self.updated_at = Utc::now();
    }

    pub fn update_status(&mut self, status: ProgressStatus) {
        self.status = status;
        self.updated_at = Utc::now();
    }

    pub fn add_criterion(&mut self, criterion: impl Into<String>) {
        self.acceptance_criteria.push(criterion.into());
        self.updated_at = Utc::now();
    }

    pub fn is_complete(&self) -> bool {
        self.status == ProgressStatus::Completed
    }

    pub fn linked_requirement_count(&self) -> usize {
        self.requirement_ids.len()
    }
}
