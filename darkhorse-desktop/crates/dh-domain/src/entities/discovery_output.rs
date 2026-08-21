use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::{ArtifactPath, IdentifiedRisk, Tradeoff};

/// Legacy structured discovery draft retained as VEP input. It is not a formal
/// handoff, readiness decision, tier selection, or lifecycle transition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryOutput {
    id: Uuid,
    session_id: Uuid,
    initiative_id: Uuid,
    summary: String,
    problem_framing: String,
    scope_recommendation: String,
    options_summary: Vec<OptionSummary>,
    tradeoffs: Vec<Tradeoff>,
    risks: Vec<IdentifiedRisk>,
    assumptions: Vec<String>,
    constraints: Vec<String>,
    planning_handoff: PlanningHandoff,
    artifact_path: Option<ArtifactPath>,
    generated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptionSummary {
    pub name: String,
    pub verdict: OptionVerdict,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum OptionVerdict {
    Selected,
    Rejected,
    Parked,
}

/// Non-authoritative observations prepared for the governed adapter.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanningHandoff {
    pub recommended_mvp_scope: String,
    pub key_decisions: Vec<String>,
    pub open_risks: Vec<String>,
    pub suggested_next_steps: Vec<String>,
}

impl DiscoveryOutput {
    pub fn generate(
        session_id: Uuid,
        initiative_id: Uuid,
        summary: impl Into<String>,
        problem_framing: impl Into<String>,
        scope_recommendation: impl Into<String>,
        planning_handoff: PlanningHandoff,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            session_id,
            initiative_id,
            summary: summary.into(),
            problem_framing: problem_framing.into(),
            scope_recommendation: scope_recommendation.into(),
            options_summary: Vec::new(),
            tradeoffs: Vec::new(),
            risks: Vec::new(),
            assumptions: Vec::new(),
            constraints: Vec::new(),
            planning_handoff,
            artifact_path: None,
            generated_at: Utc::now(),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }
    pub fn session_id(&self) -> Uuid {
        self.session_id
    }
    pub fn initiative_id(&self) -> Uuid {
        self.initiative_id
    }
    pub fn summary(&self) -> &str {
        &self.summary
    }
    pub fn problem_framing(&self) -> &str {
        &self.problem_framing
    }
    pub fn scope_recommendation(&self) -> &str {
        &self.scope_recommendation
    }
    pub fn options_summary(&self) -> &[OptionSummary] {
        &self.options_summary
    }
    pub fn tradeoffs(&self) -> &[Tradeoff] {
        &self.tradeoffs
    }
    pub fn risks(&self) -> &[IdentifiedRisk] {
        &self.risks
    }
    pub fn assumptions(&self) -> &[String] {
        &self.assumptions
    }
    pub fn constraints(&self) -> &[String] {
        &self.constraints
    }
    pub fn planning_handoff(&self) -> &PlanningHandoff {
        &self.planning_handoff
    }
    pub fn artifact_path(&self) -> Option<&ArtifactPath> {
        self.artifact_path.as_ref()
    }
    pub fn generated_at(&self) -> DateTime<Utc> {
        self.generated_at
    }

    pub fn add_option_summary(
        &mut self,
        name: impl Into<String>,
        verdict: OptionVerdict,
        reasoning: impl Into<String>,
    ) {
        self.options_summary.push(OptionSummary {
            name: name.into(),
            verdict,
            reasoning: reasoning.into(),
        });
    }

    pub fn add_tradeoff(&mut self, tradeoff: Tradeoff) {
        self.tradeoffs.push(tradeoff);
    }

    pub fn add_risk(&mut self, risk: IdentifiedRisk) {
        self.risks.push(risk);
    }

    pub fn add_assumption(&mut self, a: impl Into<String>) {
        self.assumptions.push(a.into());
    }

    pub fn add_constraint(&mut self, c: impl Into<String>) {
        self.constraints.push(c.into());
    }

    pub fn set_artifact_path(&mut self, path: ArtifactPath) {
        self.artifact_path = Some(path);
    }
}
