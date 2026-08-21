-- S05 preservation: requirements are planning input, not A1 or VEP readiness.
-- Existing rows remain byte/shape compatible and cannot authorize a transition.
CREATE TABLE IF NOT EXISTS requirements (
    id                  TEXT PRIMARY KEY,
    mvp_id              TEXT NOT NULL REFERENCES mvps(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    kind                TEXT NOT NULL DEFAULT 'Functional',
    priority            TEXT NOT NULL DEFAULT 'Medium',
    acceptance_criteria TEXT NOT NULL DEFAULT '[]',
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requirements_mvp ON requirements(mvp_id);
