use std::path::{Path, PathBuf};

use dh_domain::values::ArtifactRef;

use crate::errors::AppResult;

/// Port for storing and retrieving generated artifacts (documents, exports, etc.)
/// on the local filesystem.
pub trait ArtifactStore: Send + Sync {
    /// Write artifact content to the filesystem and return the stored path.
    fn save_artifact(&self, artifact: &ArtifactRef, content: &[u8]) -> AppResult<PathBuf>;

    /// Read raw content of an artifact.
    fn load_artifact(&self, path: &Path) -> AppResult<Vec<u8>>;

    /// List all artifacts under a given directory prefix.
    fn list_artifacts(&self, prefix: &Path) -> AppResult<Vec<ArtifactRef>>;

    /// Delete an artifact from the filesystem.
    fn delete_artifact(&self, path: &Path) -> AppResult<bool>;
}
