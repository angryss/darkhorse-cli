use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use dh_application::errors::{AppError, AppResult};
use dh_application::ports::{
    ArtifactStore, VepDelegationPort, VepDelegationRequest, VepDelegationResult,
};
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

/// Process adapter for the existing S04 Darkhorse CLI delegation boundary.
/// It never discovers or executes a global/source/tarball `visu` command.
#[derive(Default)]
pub struct ProjectLocalVepDelegator;

impl ProjectLocalVepDelegator {
    fn validate(request: &VepDelegationRequest) -> AppResult<(PathBuf, PathBuf)> {
        if !request.project_root.is_absolute() {
            return Err(AppError::Validation(
                "MALFORMED_DESKTOP_VEP_REQUEST: projectRoot must be an absolute generated-project directory. Correction: select the generated project root.".into(),
            ));
        }
        let project_root = request.project_root.canonicalize().map_err(|_| AppError::Validation(
            "MALFORMED_DESKTOP_VEP_REQUEST: projectRoot is unavailable. Correction: select an existing generated project root.".into(),
        ))?;
        if !project_root.join("package.json").is_file() {
            return Err(AppError::Validation(
                "MALFORMED_DESKTOP_VEP_REQUEST: projectRoot/package.json is missing. Correction: select the generated project root; Desktop has no VEP-version override.".into(),
            ));
        }
        if !request.delegate_program.is_absolute() {
            return Err(AppError::Validation(
                "MALFORMED_DESKTOP_VEP_REQUEST: delegateProgram must be an absolute Darkhorse CLI runtime path.".into(),
            ));
        }
        let program = request.delegate_program.canonicalize().map_err(|_| AppError::Validation(
            "DARKHORSE_VEP_DELEGATE_UNAVAILABLE: repair the installed Darkhorse CLI; legacy Desktop and global visu fallback are disabled.".into(),
        ))?;
        let program_name = program
            .file_stem()
            .and_then(|v| v.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();
        if program_name == "visu" {
            return Err(AppError::Validation(
                "DIRECT_VISU_BYPASS_REJECTED: invoke a supported Darkhorse S04 delegate, not visu directly.".into(),
            ));
        }

        let program_is_darkhorse = program_name.contains("darkhorse");
        let prefix_is_darkhorse = request
            .delegate_prefix_arguments
            .first()
            .is_some_and(|value| {
                let path = Path::new(value);
                path.is_absolute()
                    && path.is_file()
                    && path
                        .to_string_lossy()
                        .to_ascii_lowercase()
                        .contains("darkhorse-")
            });
        if !program_is_darkhorse && !prefix_is_darkhorse {
            return Err(AppError::Validation(
                "DARKHORSE_VEP_DELEGATE_REQUIRED: delegateProgram/prefix must identify an installed Darkhorse CLI adapter.".into(),
            ));
        }
        Ok((project_root, program))
    }
}

impl VepDelegationPort for ProjectLocalVepDelegator {
    fn invoke(&self, request: &VepDelegationRequest) -> AppResult<VepDelegationResult> {
        let (project_root, program) = Self::validate(request)?;
        let output = Command::new(program)
            .args(&request.delegate_prefix_arguments)
            .arg(request.action.command())
            .arg("--project-root")
            .arg(&project_root)
            .args(&request.arguments)
            .current_dir(&project_root)
            .output()
            .map_err(|error| AppError::Workflow(format!(
                "DARKHORSE_VEP_DELEGATION_FAILED: {error}. Recovery: repair the installed Darkhorse CLI and the project-local exact VEP install; no fallback is permitted."
            )))?;
        let exit_code = output.status.code().unwrap_or(1);
        let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
        let stderr = String::from_utf8_lossy(&output.stderr).into_owned();
        let parsed_json = serde_json::from_str(stdout.trim()).ok();

        if exit_code == 0 && request.require_json && parsed_json.is_none() {
            return Err(AppError::Workflow(
                "MALFORMED_VEP_RESULT: the governed delegate returned zero without valid JSON. Recovery: repair the compatible Darkhorse/VEP pair and rerun; cached Desktop state was not used.".into(),
            ));
        }

        Ok(VepDelegationResult {
            action: request.action.command().into(),
            lifecycle_stage: request.action.lifecycle_stage().into(),
            project_root,
            exit_code,
            stdout,
            stderr,
            parsed_json,
        })
    }
}

#[cfg(test)]
mod vep_delegator_tests {
    use super::*;
    use dh_application::ports::VepDelegationAction;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn request(program: PathBuf) -> VepDelegationRequest {
        VepDelegationRequest {
            project_root: PathBuf::from("relative"),
            delegate_program: program,
            delegate_prefix_arguments: vec![],
            action: VepDelegationAction::Close,
            arguments: vec![],
            require_json: true,
        }
    }

    #[test]
    fn relative_project_root_fails_before_execution() {
        let result = ProjectLocalVepDelegator.invoke(&request(PathBuf::from("visu")));
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("projectRoot must be an absolute"));
    }

    fn fixture() -> Option<(PathBuf, PathBuf, PathBuf)> {
        let node = std::env::var_os("DARKHORSE_TEST_NODE").map(PathBuf::from)?;
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("dh-s05-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        fs::write(
            root.join("package.json"),
            "{\"devDependencies\":{\"@angryss/vep\":\"2.0.0\"}}",
        )
        .unwrap();
        let delegate = root.join("darkhorse-fixture.mjs");
        fs::write(
            &delegate,
            r#"
const args = process.argv.slice(2);
if (args.includes('nonzero')) { process.stderr.write('VEP_REJECTED'); process.exit(23); }
if (args.includes('malformed')) { process.stdout.write('not-json'); process.exit(0); }
process.stdout.write(JSON.stringify({status:'PASS',args}));
"#,
        )
        .unwrap();
        Some((root, node, delegate))
    }

    fn fixture_request(root: &Path, node: PathBuf, delegate: &Path) -> VepDelegationRequest {
        VepDelegationRequest {
            project_root: root.to_path_buf(),
            delegate_program: node,
            delegate_prefix_arguments: vec![delegate.display().to_string()],
            action: VepDelegationAction::Review,
            arguments: vec!["--json".into()],
            require_json: true,
        }
    }

    #[test]
    fn adapter_preserves_json_and_maps_review_into_test() {
        let Some((root, node, delegate)) = fixture() else {
            return;
        };
        let result = ProjectLocalVepDelegator
            .invoke(&fixture_request(&root, node, &delegate))
            .unwrap();
        assert_eq!(result.exit_code, 0);
        assert_eq!(result.lifecycle_stage, "TEST");
        let args = result.parsed_json.unwrap()["args"]
            .as_array()
            .unwrap()
            .clone();
        assert!(args.iter().any(|value| value == "review"));
        assert!(args.iter().any(|value| value == "--project-root"));
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn adapter_preserves_nonzero_and_stderr() {
        let Some((root, node, delegate)) = fixture() else {
            return;
        };
        let mut input = fixture_request(&root, node, &delegate);
        input.arguments = vec!["nonzero".into()];
        input.require_json = false;
        let result = ProjectLocalVepDelegator.invoke(&input).unwrap();
        assert_eq!(result.exit_code, 23);
        assert_eq!(result.stderr, "VEP_REJECTED");
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn zero_with_malformed_required_json_fails_closed() {
        let Some((root, node, delegate)) = fixture() else {
            return;
        };
        let mut input = fixture_request(&root, node, &delegate);
        input.arguments = vec!["malformed".into()];
        let error = ProjectLocalVepDelegator
            .invoke(&input)
            .unwrap_err()
            .to_string();
        assert!(error.contains("MALFORMED_VEP_RESULT"));
        fs::remove_dir_all(root).unwrap();
    }
}
