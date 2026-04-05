use tracing_subscriber::{fmt, EnvFilter};

/// Initialize structured logging for the desktop application.
///
/// Uses `tracing` with an env-filter defaulting to `info` level.
/// Logs go to stderr in development and can be redirected to a file for production.
pub fn init_logging() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    fmt()
        .with_env_filter(filter)
        .with_target(true)
        .with_thread_ids(false)
        .with_file(true)
        .with_line_number(true)
        .init();
}
