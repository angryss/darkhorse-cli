use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::ports::SliceRepository;
use dh_domain::entities::{ImplementationSlice, ProgressStatus};
use dh_domain::values::SliceType;

// --- Generate Implementation Slices ---

#[derive(Debug, Deserialize)]
pub struct GenerateSlicesCommand {
    pub mvp_id: Uuid,
    pub slices: Vec<SliceInput>,
}

#[derive(Debug, Deserialize)]
pub struct SliceInput {
    pub title: String,
    pub description: String,
    pub slice_type: String,
    pub requirement_ids: Vec<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct SlicesGenerated {
    pub mvp_id: Uuid,
    pub slice_count: usize,
    pub slice_ids: Vec<Uuid>,
}

pub async fn handle_generate_slices(
    cmd: GenerateSlicesCommand,
    repo: &dyn SliceRepository,
) -> AppResult<SlicesGenerated> {
    let mut ids = Vec::new();

    for input in cmd.slices {
        let slice_type = match input.slice_type.to_lowercase().as_str() {
            "fullstack" | "full_stack" => SliceType::FullStack,
            "backend" => SliceType::Backend,
            "frontend" => SliceType::Frontend,
            "infrastructure" => SliceType::Infrastructure,
            "data_migration" | "datamigration" => SliceType::DataMigration,
            "integration" => SliceType::Integration,
            _ => SliceType::FullStack,
        };

        let mut slice =
            ImplementationSlice::new(cmd.mvp_id, input.title, input.description, slice_type);
        for req_id in input.requirement_ids {
            slice.link_requirement(req_id);
        }
        let id = slice.id();
        repo.save(&slice)?;
        ids.push(id);
    }

    info!(mvp_id = %cmd.mvp_id, count = ids.len(), "Implementation slices generated");
    Ok(SlicesGenerated {
        mvp_id: cmd.mvp_id,
        slice_count: ids.len(),
        slice_ids: ids,
    })
}

// --- Link Requirement to Slice ---

#[derive(Debug, Deserialize)]
pub struct LinkRequirementToSliceCommand {
    pub slice_id: Uuid,
    pub requirement_id: Uuid,
}

pub async fn handle_link_requirement_to_slice(
    cmd: LinkRequirementToSliceCommand,
    repo: &dyn SliceRepository,
) -> AppResult<()> {
    let mut slice = repo
        .find_by_id(cmd.slice_id)?
        .ok_or_else(|| AppError::NotFound(format!("Slice {}", cmd.slice_id)))?;
    slice.link_requirement(cmd.requirement_id);
    repo.save(&slice)?;
    info!(slice_id = %cmd.slice_id, requirement_id = %cmd.requirement_id, "Requirement linked to slice");
    Ok(())
}

// --- Update local work-item display status (never VEP state) ---

#[derive(Debug, Deserialize)]
pub struct UpdateSliceStatusCommand {
    pub slice_id: Uuid,
    pub status: String,
}

pub async fn handle_update_slice_work_item(
    cmd: UpdateSliceStatusCommand,
    repo: &dyn SliceRepository,
) -> AppResult<()> {
    let mut slice = repo
        .find_by_id(cmd.slice_id)?
        .ok_or_else(|| AppError::NotFound(format!("Slice {}", cmd.slice_id)))?;

    let status = match cmd.status.to_lowercase().as_str() {
        "in_progress" | "inprogress" => ProgressStatus::InProgress,
        "blocked" => ProgressStatus::Blocked,
        "completed" => ProgressStatus::Completed,
        "deferred" => ProgressStatus::Deferred,
        _ => ProgressStatus::NotStarted,
    };

    slice.update_status(status);
    repo.save(&slice)?;
    info!(slice_id = %cmd.slice_id, "Slice status updated");
    Ok(())
}

// --- List Slices by MVP ---

#[derive(Debug, Deserialize)]
pub struct ListSlicesCommand {
    pub mvp_id: Uuid,
}

pub async fn handle_list_slices(
    cmd: ListSlicesCommand,
    repo: &dyn SliceRepository,
) -> AppResult<Vec<ImplementationSlice>> {
    repo.find_by_mvp(cmd.mvp_id)
}
