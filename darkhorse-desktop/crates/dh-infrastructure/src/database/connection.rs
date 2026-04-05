use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

use crate::errors::InfraError;

/// Thread-safe wrapper around a SQLite connection for local persistence.
pub struct DbConnection {
    conn: Mutex<Connection>,
}

impl DbConnection {
    /// Open (or create) a SQLite database at the given path.
    pub fn open(path: &Path) -> Result<Self, InfraError> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Create an in-memory database (useful for testing).
    pub fn in_memory() -> Result<Self, InfraError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch("PRAGMA foreign_keys=ON;")?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Access the underlying connection under the mutex.
    pub fn with_conn<F, R>(&self, f: F) -> Result<R, InfraError>
    where
        F: FnOnce(&Connection) -> Result<R, InfraError>,
    {
        let conn = self
            .conn
            .lock()
            .map_err(|e| InfraError::Database(format!("Lock poisoned: {e}")))?;
        f(&conn)
    }
}
