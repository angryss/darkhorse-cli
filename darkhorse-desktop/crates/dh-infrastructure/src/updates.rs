use serde::{Deserialize, Serialize};
use tracing::info;

/// Represents the result of an update check.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateStatus {
    pub current_version: String,
    pub latest_version: Option<String>,
    pub update_available: bool,
    pub release_notes: Option<String>,
}

/// Check for available updates.
///
/// In the current scaffold this returns a placeholder. The real implementation
/// will use `tauri-plugin-updater` to query the configured update endpoint.
pub async fn check_for_updates(current_version: &str) -> UpdateStatus {
    info!(version = current_version, "Checking for updates");

    UpdateStatus {
        current_version: current_version.to_string(),
        latest_version: None,
        update_available: false,
        release_notes: None,
    }
}
