use rusqlite::Connection;

// Migrations preserve legacy user data. They never migrate Desktop labels into
// governed VEP state or rewrite project-owned A1/projections.
use tracing::info;

use super::DbConnection;
use crate::errors::InfraError;

/// Run all pending migrations against the database.
pub fn run_migrations(db: &DbConnection) -> Result<(), InfraError> {
    db.with_conn(|conn| {
        apply_migrations(conn)?;
        Ok(())
    })
}

fn apply_migrations(conn: &Connection) -> Result<(), InfraError> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );",
    )?;

    let migrations: &[(&str, &str)] = &[
        (
            "001_create_initiatives",
            include_str!("../../migrations/001_create_initiatives.sql"),
        ),
        (
            "002_create_mvps",
            include_str!("../../migrations/002_create_mvps.sql"),
        ),
        (
            "003_create_requirements",
            include_str!("../../migrations/003_create_requirements.sql"),
        ),
        (
            "004_create_settings",
            include_str!("../../migrations/004_create_settings.sql"),
        ),
        (
            "005_create_workspaces",
            include_str!("../../migrations/005_create_workspaces.sql"),
        ),
        (
            "006_create_discovery_sessions",
            include_str!("../../migrations/006_create_discovery_sessions.sql"),
        ),
        (
            "007_create_implementation_slices",
            include_str!("../../migrations/007_create_implementation_slices.sql"),
        ),
    ];

    for (name, sql) in migrations {
        let already_applied: bool = conn
            .prepare("SELECT COUNT(*) FROM _migrations WHERE name = ?1")?
            .query_row([name], |row| row.get::<_, i64>(0))
            .map(|c| c > 0)?;

        if !already_applied {
            conn.execute_batch(sql)?;
            conn.execute("INSERT INTO _migrations (name) VALUES (?1)", [name])?;
            info!(migration = name, "Applied migration");
        }
    }

    Ok(())
}
