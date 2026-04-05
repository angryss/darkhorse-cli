use crate::errors::AppResult;

/// Port for reading and writing application-level settings and lightweight
/// persisted state (window size, recent files, preferences).
pub trait SettingsStore: Send + Sync {
    fn get(&self, key: &str) -> AppResult<Option<String>>;
    fn set(&self, key: &str, value: &str) -> AppResult<()>;
    fn delete(&self, key: &str) -> AppResult<bool>;
    fn keys(&self) -> AppResult<Vec<String>>;
}
