mod artifact_store;
mod discovery_session_repo;
mod initiative_repo;
mod mvp_repo;
mod requirement_repo;
mod settings_store;
mod slice_repo;
mod workspace_repo;

pub use artifact_store::*;
pub use discovery_session_repo::*;
pub use initiative_repo::*;
pub use mvp_repo::*;
pub use requirement_repo::*;
pub use settings_store::*;
pub use slice_repo::*;
pub use workspace_repo::*;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Operations exposed by the already-governed Darkhorse CLI boundary. Review
/// is part of the Test stage and therefore does not create a sixth lifecycle.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum VepDelegationAction {
    Discover,
    Plan,
    Implement,
    Test,
    Review,
    Close,
}

impl VepDelegationAction {
    pub fn command(self) -> &'static str {
        match self {
            Self::Discover => "discover",
            Self::Plan => "plan",
            Self::Implement => "implement",
            Self::Test => "test",
            Self::Review => "review",
            Self::Close => "close",
        }
    }

    pub fn lifecycle_stage(self) -> &'static str {
        match self {
            Self::Discover => "DISCOVER",
            Self::Plan => "PLAN",
            Self::Implement => "IMPLEMENT",
            Self::Test | Self::Review => "TEST",
            Self::Close => "CLOSE",
        }
    }
}

/// A bounded request to an S04 Darkhorse CLI adapter. The Desktop does not
/// resolve VEP, select its version, or call `visu` directly.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct VepDelegationRequest {
    pub project_root: PathBuf,
    pub delegate_program: PathBuf,
    #[serde(default)]
    pub delegate_prefix_arguments: Vec<String>,
    pub action: VepDelegationAction,
    #[serde(default)]
    pub arguments: Vec<String>,
    #[serde(default)]
    pub require_json: bool,
}

/// Raw child-process truth. No Desktop success, readiness, risk, or lifecycle
/// decision is added. A nonzero VEP/Darkhorse result remains nonzero.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct VepDelegationResult {
    pub action: String,
    pub lifecycle_stage: String,
    pub project_root: PathBuf,
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
    pub parsed_json: Option<serde_json::Value>,
}

pub trait VepDelegationPort: Send + Sync {
    fn invoke(
        &self,
        request: &VepDelegationRequest,
    ) -> crate::errors::AppResult<VepDelegationResult>;
}

#[cfg(test)]
mod vep_port_tests {
    use super::*;

    #[test]
    fn review_is_within_test_and_lifecycle_has_five_stages() {
        assert_eq!(VepDelegationAction::Review.lifecycle_stage(), "TEST");
        assert_eq!(dh_domain::values::VEP_LIFECYCLE.len(), 5);
    }
}
