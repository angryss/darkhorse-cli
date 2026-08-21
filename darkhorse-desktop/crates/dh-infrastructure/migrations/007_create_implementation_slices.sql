-- S05 preservation: slice status is local work-item UI state only.
-- It cannot prove Test/Review/Close or VEP completion.
CREATE TABLE IF NOT EXISTS implementation_slices (
    id TEXT PRIMARY KEY NOT NULL,
    mvp_id TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (mvp_id) REFERENCES mvps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_implementation_slices_mvp ON implementation_slices(mvp_id);
