use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::AppResult;

/// Command to update roadmap milestones and items.
#[derive(Debug, Deserialize)]
pub struct UpdateRoadmapCommand {
    pub initiative_id: Uuid,
    pub action: RoadmapAction,
}

#[derive(Debug, Deserialize)]
pub enum RoadmapAction {
    AddMilestone {
        name: String,
        description: String,
    },
    AddItem {
        milestone_id: Uuid,
        title: String,
    },
    CompleteItem {
        milestone_id: Uuid,
        item_id: Uuid,
    },
}

#[derive(Debug, Serialize)]
pub struct UpdateRoadmapResult {
    pub initiative_id: Uuid,
    pub message: String,
}

pub async fn handle_update_roadmap(cmd: UpdateRoadmapCommand) -> AppResult<UpdateRoadmapResult> {
    let message = match &cmd.action {
        RoadmapAction::AddMilestone { name, .. } => {
            info!(initiative_id = %cmd.initiative_id, milestone = %name, "Milestone added");
            format!("Milestone '{}' added", name)
        }
        RoadmapAction::AddItem { title, .. } => {
            info!(initiative_id = %cmd.initiative_id, item = %title, "Roadmap item added");
            format!("Item '{}' added", title)
        }
        RoadmapAction::CompleteItem { item_id, .. } => {
            info!(initiative_id = %cmd.initiative_id, item = %item_id, "Item completed");
            format!("Item '{}' marked complete", item_id)
        }
    };

    Ok(UpdateRoadmapResult {
        initiative_id: cmd.initiative_id,
        message,
    })
}
