use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Represents a generated artifact — a document, export, or template output
/// stored in the local filesystem.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactRef {
    pub kind: ArtifactKind,
    pub name: String,
    pub relative_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ArtifactKind {
    DiscoveryOutput,
    PlanningOutput,
    RequirementsSpec,
    RoadmapExport,
    ProgressReport,
    ArchitectureDecision,
    ImplementationSlice,
    ExportedBundle,
    Template,
    Custom(String),
}
