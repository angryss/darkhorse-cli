use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

/// The root context for all Dark Horse work. A workspace organizes
/// initiatives, discovery sessions, planning outputs, requirements,
/// roadmap data, progress history, generated artifacts, and local settings.
///
/// Every entity in the domain ultimately belongs to a workspace.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    id: Uuid,
    name: String,
    description: String,
    root_path: PathBuf,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl Workspace {
    pub fn create(name: impl Into<String>, root_path: impl Into<PathBuf>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name: name.into(),
            description: String::new(),
            root_path: root_path.into(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid { self.id }
    pub fn name(&self) -> &str { &self.name }
    pub fn description(&self) -> &str { &self.description }
    pub fn root_path(&self) -> &std::path::Path { &self.root_path }
    pub fn created_at(&self) -> DateTime<Utc> { self.created_at }
    pub fn updated_at(&self) -> DateTime<Utc> { self.updated_at }

    pub fn rename(&mut self, name: impl Into<String>) {
        self.name = name.into();
        self.updated_at = Utc::now();
    }

    pub fn set_description(&mut self, description: impl Into<String>) {
        self.description = description.into();
        self.updated_at = Utc::now();
    }

    /// Resolve a relative artifact path to an absolute path within this workspace.
    pub fn resolve_path(&self, relative: &std::path::Path) -> PathBuf {
        self.root_path.join(relative)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn workspace_resolves_paths() {
        let ws = Workspace::create("Test", "/home/user/projects/alpha");
        let resolved = ws.resolve_path(std::path::Path::new("artifacts/discovery.md"));
        assert!(resolved.to_string_lossy().contains("artifacts"));
    }
}
