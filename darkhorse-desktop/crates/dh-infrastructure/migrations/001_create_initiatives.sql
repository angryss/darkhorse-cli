CREATE TABLE IF NOT EXISTS initiatives (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'Draft',
    priority    TEXT NOT NULL DEFAULT 'Medium',
    tags        TEXT NOT NULL DEFAULT '[]',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
