use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::{IdentifiedRisk, Tradeoff};

/// A discovery session represents a collaborative exploration and shaping
/// session tied to an initiative. It captures the problem framing process,
/// option comparison, tradeoff analysis, and emerging decisions.
///
/// Sessions progress through phases: Framing → Exploring → Converging → Concluded.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoverySession {
    id: Uuid,
    initiative_id: Uuid,
    title: String,
    phase: DiscoveryPhase,
    problem_statement: String,
    options_considered: Vec<DiscoveryOption>,
    tradeoffs: Vec<Tradeoff>,
    risks: Vec<IdentifiedRisk>,
    assumptions: Vec<String>,
    open_questions: Vec<String>,
    notes: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DiscoveryPhase {
    Framing,
    Exploring,
    Converging,
    Concluded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryOption {
    pub name: String,
    pub description: String,
    pub pros: Vec<String>,
    pub cons: Vec<String>,
    pub selected: bool,
}

impl DiscoverySession {
    pub fn start(initiative_id: Uuid, title: impl Into<String>, problem: impl Into<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            initiative_id,
            title: title.into(),
            phase: DiscoveryPhase::Framing,
            problem_statement: problem.into(),
            options_considered: Vec::new(),
            tradeoffs: Vec::new(),
            risks: Vec::new(),
            assumptions: Vec::new(),
            open_questions: Vec::new(),
            notes: String::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid { self.id }
    pub fn initiative_id(&self) -> Uuid { self.initiative_id }
    pub fn title(&self) -> &str { &self.title }
    pub fn phase(&self) -> &DiscoveryPhase { &self.phase }
    pub fn problem_statement(&self) -> &str { &self.problem_statement }
    pub fn options_considered(&self) -> &[DiscoveryOption] { &self.options_considered }
    pub fn tradeoffs(&self) -> &[Tradeoff] { &self.tradeoffs }
    pub fn risks(&self) -> &[IdentifiedRisk] { &self.risks }
    pub fn assumptions(&self) -> &[String] { &self.assumptions }
    pub fn open_questions(&self) -> &[String] { &self.open_questions }
    pub fn notes(&self) -> &str { &self.notes }
    pub fn created_at(&self) -> DateTime<Utc> { self.created_at }
    pub fn updated_at(&self) -> DateTime<Utc> { self.updated_at }

    pub fn advance_phase(&mut self, next: DiscoveryPhase) -> crate::errors::DomainResult<()> {
        let valid = matches!(
            (&self.phase, &next),
            (DiscoveryPhase::Framing, DiscoveryPhase::Exploring)
                | (DiscoveryPhase::Exploring, DiscoveryPhase::Converging)
                | (DiscoveryPhase::Converging, DiscoveryPhase::Concluded)
        );
        if !valid {
            return Err(crate::errors::DomainError::InvalidStateTransition {
                from: format!("{:?}", self.phase),
                to: format!("{:?}", next),
            });
        }
        self.phase = next;
        self.updated_at = Utc::now();
        Ok(())
    }

    pub fn add_option(&mut self, name: impl Into<String>, description: impl Into<String>) {
        self.options_considered.push(DiscoveryOption {
            name: name.into(),
            description: description.into(),
            pros: Vec::new(),
            cons: Vec::new(),
            selected: false,
        });
        self.updated_at = Utc::now();
    }

    pub fn select_option(&mut self, index: usize) -> bool {
        if let Some(opt) = self.options_considered.get_mut(index) {
            opt.selected = true;
            self.updated_at = Utc::now();
            true
        } else {
            false
        }
    }

    pub fn add_tradeoff(&mut self, tradeoff: Tradeoff) {
        self.tradeoffs.push(tradeoff);
        self.updated_at = Utc::now();
    }

    pub fn add_risk(&mut self, risk: IdentifiedRisk) {
        self.risks.push(risk);
        self.updated_at = Utc::now();
    }

    pub fn add_assumption(&mut self, assumption: impl Into<String>) {
        self.assumptions.push(assumption.into());
        self.updated_at = Utc::now();
    }

    pub fn add_open_question(&mut self, question: impl Into<String>) {
        self.open_questions.push(question.into());
        self.updated_at = Utc::now();
    }

    pub fn set_notes(&mut self, notes: impl Into<String>) {
        self.notes = notes.into();
        self.updated_at = Utc::now();
    }

    pub fn is_concluded(&self) -> bool {
        self.phase == DiscoveryPhase::Concluded
    }

    pub fn unresolved_question_count(&self) -> usize {
        self.open_questions.len()
    }

    pub fn unresolved_tradeoff_count(&self) -> usize {
        self.tradeoffs.iter().filter(|t| !t.is_resolved()).count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn session_starts_in_framing_phase() {
        let s = DiscoverySession::start(Uuid::new_v4(), "Test", "Problem statement");
        assert_eq!(s.phase(), &DiscoveryPhase::Framing);
    }

    #[test]
    fn can_advance_through_phases() {
        let mut s = DiscoverySession::start(Uuid::new_v4(), "Test", "Problem");
        assert!(s.advance_phase(DiscoveryPhase::Exploring).is_ok());
        assert!(s.advance_phase(DiscoveryPhase::Converging).is_ok());
        assert!(s.advance_phase(DiscoveryPhase::Concluded).is_ok());
        assert!(s.is_concluded());
    }

    #[test]
    fn cannot_skip_phases() {
        let mut s = DiscoverySession::start(Uuid::new_v4(), "Test", "Problem");
        assert!(s.advance_phase(DiscoveryPhase::Concluded).is_err());
    }
}
