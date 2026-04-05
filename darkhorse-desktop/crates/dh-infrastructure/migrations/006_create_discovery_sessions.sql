CREATE TABLE IF NOT EXISTS discovery_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    initiative_id TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discovery_sessions_initiative ON discovery_sessions(initiative_id);
