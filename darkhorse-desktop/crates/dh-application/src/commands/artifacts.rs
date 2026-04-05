use serde::{Deserialize, Serialize};
use std::path::Path;
use tracing::info;
use uuid::Uuid;

use crate::errors::AppResult;
use crate::ports::ArtifactStore;
use dh_domain::values::{ArtifactKind, ArtifactRef};
use std::path::PathBuf;

// --- Export Artifact ---

#[derive(Debug, Deserialize)]
pub struct ExportArtifactCommand {
    pub kind: String,
    pub name: String,
    pub content: String,
    pub initiative_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct ArtifactExported {
    pub path: PathBuf,
    pub kind: String,
    pub name: String,
}

pub async fn handle_export_artifact(
    cmd: ExportArtifactCommand,
    store: &dyn ArtifactStore,
) -> AppResult<ArtifactExported> {
    let kind = match cmd.kind.to_lowercase().as_str() {
        "discovery" | "discovery_output" => ArtifactKind::DiscoveryOutput,
        "planning" | "planning_output" => ArtifactKind::PlanningOutput,
        "requirements" | "requirements_spec" => ArtifactKind::RequirementsSpec,
        "roadmap" => ArtifactKind::RoadmapExport,
        "architecture" | "adr" => ArtifactKind::ArchitectureDecision,
        _ => ArtifactKind::Custom(cmd.kind.clone()),
    };

    let relative = format!(
        "artifacts/{}/{}-{}.md",
        cmd.kind.to_lowercase(),
        cmd.name.to_lowercase().replace(' ', "-"),
        cmd.initiative_id
    );

    let artifact = ArtifactRef {
        kind: kind.clone(),
        name: cmd.name.clone(),
        relative_path: PathBuf::from(&relative),
    };

    let path = store.save_artifact(&artifact, cmd.content.as_bytes())?;
    info!(path = %path.display(), kind = ?kind, "Artifact exported");

    Ok(ArtifactExported {
        path,
        kind: cmd.kind,
        name: cmd.name,
    })
}

// --- List Workspace Artifacts ---

#[derive(Debug, Serialize)]
pub struct ArtifactEntry {
    pub kind: String,
    pub name: String,
    pub path: PathBuf,
}

pub async fn handle_list_workspace_artifacts(
    store: &dyn ArtifactStore,
) -> AppResult<Vec<ArtifactEntry>> {
    let refs = store.list_artifacts(Path::new("artifacts"))?;
    Ok(refs
        .into_iter()
        .map(|r| ArtifactEntry {
            kind: format!("{:?}", r.kind),
            name: r.name,
            path: r.relative_path,
        })
        .collect())
}
