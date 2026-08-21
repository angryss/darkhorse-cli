use std::path::PathBuf;
use std::sync::Arc;

use dh_infrastructure::database::{run_migrations, DbConnection};
use dh_infrastructure::database::{
    SqliteDiscoverySessionRepo, SqliteInitiativeRepo, SqliteSliceRepo, SqliteWorkspaceRepo,
};
use dh_infrastructure::filesystem::{LocalArtifactStore, ProjectLocalVepDelegator};
use dh_infrastructure::settings::SqliteSettingsStore;

/// Shared application state managed by Tauri.
///
/// Holds the database connection, repositories, and stores
/// that are injected into command handlers.
pub struct AppState {
    pub initiative_repo: SqliteInitiativeRepo,
    pub discovery_session_repo: SqliteDiscoverySessionRepo,
    pub workspace_repo: SqliteWorkspaceRepo,
    pub slice_repo: SqliteSliceRepo,
    pub artifact_store: LocalArtifactStore,
    pub vep_delegator: ProjectLocalVepDelegator,
    pub settings_store: SqliteSettingsStore,
}

impl AppState {
    pub fn initialize() -> anyhow::Result<Self> {
        let data_dir = Self::data_dir()?;
        std::fs::create_dir_all(&data_dir)?;

        let db_path = data_dir.join("darkhorse.db");
        let db = Arc::new(DbConnection::open(&db_path)?);

        run_migrations(&db)?;

        let artifacts_dir = data_dir.join("artifacts");
        let artifact_store = LocalArtifactStore::new(artifacts_dir)?;
        let settings_store = SqliteSettingsStore::new(Arc::clone(&db));
        let initiative_repo = SqliteInitiativeRepo::new(Arc::clone(&db));
        let discovery_session_repo = SqliteDiscoverySessionRepo::new(Arc::clone(&db));
        let workspace_repo = SqliteWorkspaceRepo::new(Arc::clone(&db));
        let slice_repo = SqliteSliceRepo::new(Arc::clone(&db));

        Ok(Self {
            initiative_repo,
            discovery_session_repo,
            workspace_repo,
            slice_repo,
            artifact_store,
            vep_delegator: ProjectLocalVepDelegator,
            settings_store,
        })
    }

    /// Returns the platform-appropriate data directory for DarkHorse Desktop.
    fn data_dir() -> anyhow::Result<PathBuf> {
        let base = dirs_next().unwrap_or_else(|| PathBuf::from("."));
        Ok(base.join("darkhorse-desktop"))
    }
}

fn dirs_next() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        std::env::var("APPDATA").ok().map(PathBuf::from)
    }
    #[cfg(target_os = "macos")]
    {
        std::env::var("HOME")
            .ok()
            .map(|h| PathBuf::from(h).join("Library/Application Support"))
    }
    #[cfg(target_os = "linux")]
    {
        std::env::var("XDG_DATA_HOME")
            .ok()
            .map(PathBuf::from)
            .or_else(|| {
                std::env::var("HOME")
                    .ok()
                    .map(|h| PathBuf::from(h).join(".local/share"))
            })
    }
}
