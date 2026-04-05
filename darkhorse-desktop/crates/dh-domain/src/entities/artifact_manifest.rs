use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::values::{ArtifactKind, ArtifactPath};

/// Tracks all generated local artifacts associated with an initiative
/// or workspace. Provides a first-class manifest rather than treating
/// artifact tracking as a side effect of generation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactManifest {
    id: Uuid,
    workspace_id: Uuid,
    entries: Vec<ManifestEntry>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestEntry {
    pub id: Uuid,
    pub kind: ArtifactKind,
    pub name: String,
    pub path: ArtifactPath,
    pub source_entity_id: Option<Uuid>,
    pub generated_at: DateTime<Utc>,
}

impl ArtifactManifest {
    pub fn new(workspace_id: Uuid) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            workspace_id,
            entries: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid { self.id }
    pub fn workspace_id(&self) -> Uuid { self.workspace_id }
    pub fn entries(&self) -> &[ManifestEntry] { &self.entries }

    pub fn register(
        &mut self,
        kind: ArtifactKind,
        name: impl Into<String>,
        path: ArtifactPath,
        source_entity_id: Option<Uuid>,
    ) -> Uuid {
        let id = Uuid::new_v4();
        self.entries.push(ManifestEntry {
            id,
            kind,
            name: name.into(),
            path,
            source_entity_id,
            generated_at: Utc::now(),
        });
        self.updated_at = Utc::now();
        id
    }

    pub fn remove(&mut self, entry_id: Uuid) -> bool {
        let len = self.entries.len();
        self.entries.retain(|e| e.id != entry_id);
        if self.entries.len() != len {
            self.updated_at = Utc::now();
            true
        } else {
            false
        }
    }

    pub fn find_by_kind(&self, kind: &ArtifactKind) -> Vec<&ManifestEntry> {
        self.entries.iter().filter(|e| &e.kind == kind).collect()
    }

    pub fn find_by_source(&self, entity_id: Uuid) -> Vec<&ManifestEntry> {
        self.entries
            .iter()
            .filter(|e| e.source_entity_id == Some(entity_id))
            .collect()
    }

    pub fn entry_count(&self) -> usize {
        self.entries.len()
    }
}
