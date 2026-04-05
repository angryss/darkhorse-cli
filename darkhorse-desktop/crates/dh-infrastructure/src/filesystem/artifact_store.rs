use std::fs;
use std::path::{Path, PathBuf};

use dh_application::errors::{AppError, AppResult};
use dh_application::ports::ArtifactStore;
use dh_domain::values::{ArtifactKind, ArtifactRef};
use tracing::info;

/// Local filesystem-backed artifact store.
///
/// Artifacts are written under a configurable base directory,
/// organized by their relative path from the ArtifactRef.
pub struct LocalArtifactStore {
    base_dir: PathBuf,
}

impl LocalArtifactStore {
    pub fn new(base_dir: PathBuf) -> AppResult<Self> {
        fs::create_dir_all(&base_dir).map_err(|e| AppError::Filesystem(e.to_string()))?;
        Ok(Self { base_dir })
    }

    pub fn base_dir(&self) -> &Path {
        &self.base_dir
    }
}

impl ArtifactStore for LocalArtifactStore {
    fn save_artifact(&self, artifact: &ArtifactRef, content: &[u8]) -> AppResult<PathBuf> {
        let full_path = self.base_dir.join(&artifact.relative_path);
        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent).map_err(|e| AppError::Filesystem(e.to_string()))?;
        }
        fs::write(&full_path, content).map_err(|e| AppError::Filesystem(e.to_string()))?;
        info!(path = %full_path.display(), kind = ?artifact.kind, "Artifact saved");
        Ok(full_path)
    }

    fn load_artifact(&self, path: &Path) -> AppResult<Vec<u8>> {
        let full_path = self.base_dir.join(path);
        fs::read(&full_path).map_err(|e| AppError::Filesystem(e.to_string()))
    }

    fn list_artifacts(&self, prefix: &Path) -> AppResult<Vec<ArtifactRef>> {
        let dir = self.base_dir.join(prefix);
        if !dir.exists() {
            return Ok(Vec::new());
        }

        let mut artifacts = Vec::new();
        for entry in fs::read_dir(&dir).map_err(|e| AppError::Filesystem(e.to_string()))? {
            let entry = entry.map_err(|e| AppError::Filesystem(e.to_string()))?;
            let path = entry.path();
            if path.is_file() {
                let name = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let relative = path
                    .strip_prefix(&self.base_dir)
                    .unwrap_or(&path)
                    .to_path_buf();
                artifacts.push(ArtifactRef {
                    kind: ArtifactKind::ExportedBundle,
                    name,
                    relative_path: relative,
                });
            }
        }
        Ok(artifacts)
    }

    fn delete_artifact(&self, path: &Path) -> AppResult<bool> {
        let full_path = self.base_dir.join(path);
        if full_path.exists() {
            fs::remove_file(&full_path).map_err(|e| AppError::Filesystem(e.to_string()))?;
            Ok(true)
        } else {
            Ok(false)
        }
    }
}
