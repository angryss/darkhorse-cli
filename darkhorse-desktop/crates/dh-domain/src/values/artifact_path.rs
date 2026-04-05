use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// A typed local path to a generated artifact within a workspace.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ArtifactPath(PathBuf);

impl ArtifactPath {
    pub fn new(path: impl Into<PathBuf>) -> Self {
        Self(path.into())
    }

    pub fn as_path(&self) -> &std::path::Path {
        &self.0
    }

    pub fn file_name(&self) -> Option<&str> {
        self.0.file_name().and_then(|n| n.to_str())
    }

    pub fn into_inner(self) -> PathBuf {
        self.0
    }
}

impl std::fmt::Display for ArtifactPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0.display())
    }
}

impl From<PathBuf> for ArtifactPath {
    fn from(p: PathBuf) -> Self {
        Self(p)
    }
}

impl From<&str> for ArtifactPath {
    fn from(s: &str) -> Self {
        Self(PathBuf::from(s))
    }
}
