use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::ArtifactPath;

/// Legacy Desktop planning draft retained as optional A1 adapter input. After
/// A1 exists this value is never editable plan authority or readiness truth.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanningOutput {
    id: Uuid,
    initiative_id: Uuid,
    mvp_id: Uuid,
    title: String,
    executive_summary: String,
    scope_definition: String,
    requirement_outline: Vec<PlannedRequirement>,
    implementation_approach: String,
    risk_summary: Vec<String>,
    success_criteria: Vec<String>,
    artifact_path: Option<ArtifactPath>,
    generated_at: DateTime<Utc>,
}

/// A non-authoritative requirement observation captured before A1.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlannedRequirement {
    pub title: String,
    pub description: String,
    pub priority_hint: String,
    pub category: String,
}

impl PlanningOutput {
    pub fn new(
        initiative_id: Uuid,
        mvp_id: Uuid,
        title: impl Into<String>,
        executive_summary: impl Into<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            initiative_id,
            mvp_id,
            title: title.into(),
            executive_summary: executive_summary.into(),
            scope_definition: String::new(),
            requirement_outline: Vec::new(),
            implementation_approach: String::new(),
            risk_summary: Vec::new(),
            success_criteria: Vec::new(),
            artifact_path: None,
            generated_at: Utc::now(),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }
    pub fn initiative_id(&self) -> Uuid {
        self.initiative_id
    }
    pub fn mvp_id(&self) -> Uuid {
        self.mvp_id
    }
    pub fn title(&self) -> &str {
        &self.title
    }
    pub fn executive_summary(&self) -> &str {
        &self.executive_summary
    }
    pub fn scope_definition(&self) -> &str {
        &self.scope_definition
    }
    pub fn requirement_outline(&self) -> &[PlannedRequirement] {
        &self.requirement_outline
    }
    pub fn implementation_approach(&self) -> &str {
        &self.implementation_approach
    }
    pub fn risk_summary(&self) -> &[String] {
        &self.risk_summary
    }
    pub fn success_criteria(&self) -> &[String] {
        &self.success_criteria
    }
    pub fn artifact_path(&self) -> Option<&ArtifactPath> {
        self.artifact_path.as_ref()
    }

    pub fn set_scope_definition(&mut self, scope: impl Into<String>) {
        self.scope_definition = scope.into();
    }

    pub fn set_implementation_approach(&mut self, approach: impl Into<String>) {
        self.implementation_approach = approach.into();
    }

    pub fn add_planned_requirement(&mut self, req: PlannedRequirement) {
        self.requirement_outline.push(req);
    }

    pub fn add_risk(&mut self, risk: impl Into<String>) {
        self.risk_summary.push(risk.into());
    }

    pub fn add_success_criterion(&mut self, criterion: impl Into<String>) {
        self.success_criteria.push(criterion.into());
    }

    pub fn set_artifact_path(&mut self, path: ArtifactPath) {
        self.artifact_path = Some(path);
    }

    pub fn planned_requirement_count(&self) -> usize {
        self.requirement_outline.len()
    }
}
