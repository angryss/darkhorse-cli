CREATE TABLE IF NOT EXISTS mvps (
    id              TEXT PRIMARY KEY,
    initiative_id   TEXT NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    version         TEXT NOT NULL,
    goal            TEXT NOT NULL DEFAULT '',
    scope           TEXT NOT NULL DEFAULT 'Small',
    boundaries      TEXT NOT NULL DEFAULT '[]',
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mvps_initiative ON mvps(initiative_id);
