use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::MvpRepository;
use dh_domain::entities::{ScopeCandidate, ScopeCandidateSource};
use dh_domain::values::ScopeClassification;

// --- Define MVP Scope (add candidate) ---

#[derive(Debug, Deserialize)]
pub struct DefineMvpScopeCommand {
    pub mvp_id: Uuid,
    pub description: String,
    pub source: String,
}

#[derive(Debug, Serialize)]
pub struct ScopeCandidateAdded {
    pub candidate_id: Uuid,
    pub mvp_id: Uuid,
}

pub async fn handle_define_mvp_scope(
    cmd: DefineMvpScopeCommand,
    mvp_repo: &dyn MvpRepository,
) -> AppResult<ScopeCandidateAdded> {
    // Verify MVP exists
    mvp_repo
        .find_by_id(cmd.mvp_id)?
        .ok_or_else(|| AppError::NotFound(format!("MVP {}", cmd.mvp_id)))?;

    let source = match cmd.source.to_lowercase().as_str() {
        "discovery" => ScopeCandidateSource::Discovery,
        "stakeholder" => ScopeCandidateSource::Stakeholder,
        "technical" => ScopeCandidateSource::Technical,
        "research" | "user_research" => ScopeCandidateSource::UserResearch,
        _ => ScopeCandidateSource::Refinement,
    };

    let candidate = ScopeCandidate::new(cmd.mvp_id, cmd.description, source);
    let id = candidate.id();
    info!(candidate_id = %id, mvp_id = %cmd.mvp_id, "Scope candidate added");
    Ok(ScopeCandidateAdded {
        candidate_id: id,
        mvp_id: cmd.mvp_id,
    })
}

// --- Classify Scope Candidate ---

#[derive(Debug, Deserialize)]
pub struct ClassifyScopeCandidateCommand {
    pub candidate_id: Uuid,
    pub classification: String,
    pub rationale: String,
}

#[derive(Debug, Serialize)]
pub struct ScopeCandidateClassified {
    pub candidate_id: Uuid,
    pub classification: String,
}

pub async fn handle_classify_scope_candidate(
    cmd: ClassifyScopeCandidateCommand,
) -> AppResult<ScopeCandidateClassified> {
    let classification = match cmd.classification.to_lowercase().as_str() {
        "included" => ScopeClassification::Included,
        "excluded" => ScopeClassification::Excluded,
        "deferred" => ScopeClassification::Deferred,
        _ => ScopeClassification::Undecided,
    };

    info!(
        candidate_id = %cmd.candidate_id,
        classification = %classification,
        "Scope candidate classified"
    );

    Ok(ScopeCandidateClassified {
        candidate_id: cmd.candidate_id,
        classification: classification.to_string(),
    })
}
