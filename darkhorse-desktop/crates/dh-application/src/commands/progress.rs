use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::AppResult;
use dh_domain::entities::ProgressStatus;

/// Command to record a progress update.
#[derive(Debug, Deserialize)]
pub struct UpdateProgressCommand {
    pub initiative_id: Uuid,
    pub title: String,
    pub status: ProgressStatus,
    pub notes: String,
}

#[derive(Debug, Serialize)]
pub struct UpdateProgressResult {
    pub entry_id: Uuid,
    pub initiative_id: Uuid,
}

pub async fn handle_update_progress(
    cmd: UpdateProgressCommand,
) -> AppResult<UpdateProgressResult> {
    info!(
        initiative_id = %cmd.initiative_id,
        title = %cmd.title,
        status = ?cmd.status,
        "Progress entry recorded"
    );

    Ok(UpdateProgressResult {
        entry_id: Uuid::new_v4(),
        initiative_id: cmd.initiative_id,
    })
}
