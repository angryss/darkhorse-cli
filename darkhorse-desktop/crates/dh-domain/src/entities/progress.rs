use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Tracks overall delivery progress for an initiative, including
/// completed items, blockers, and velocity indicators.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressTracker {
    id: Uuid,
    initiative_id: Uuid,
    entries: Vec<ProgressEntry>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressEntry {
    id: Uuid,
    title: String,
    status: ProgressStatus,
    notes: String,
    recorded_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProgressStatus {
    NotStarted,
    InProgress,
    Blocked,
    Completed,
    Deferred,
}

impl ProgressTracker {
    pub fn new(initiative_id: Uuid) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            initiative_id,
            entries: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn initiative_id(&self) -> Uuid {
        self.initiative_id
    }

    pub fn entries(&self) -> &[ProgressEntry] {
        &self.entries
    }

    pub fn add_entry(
        &mut self,
        title: impl Into<String>,
        status: ProgressStatus,
        notes: impl Into<String>,
    ) -> Uuid {
        let id = Uuid::new_v4();
        self.entries.push(ProgressEntry {
            id,
            title: title.into(),
            status,
            notes: notes.into(),
            recorded_at: Utc::now(),
        });
        self.updated_at = Utc::now();
        id
    }

    pub fn update_entry_status(&mut self, entry_id: Uuid, status: ProgressStatus) -> bool {
        if let Some(entry) = self.entries.iter_mut().find(|e| e.id == entry_id) {
            entry.status = status;
            self.updated_at = Utc::now();
            true
        } else {
            false
        }
    }

    pub fn completion_percent(&self) -> f64 {
        if self.entries.is_empty() {
            return 0.0;
        }
        let done = self
            .entries
            .iter()
            .filter(|e| e.status == ProgressStatus::Completed)
            .count() as f64;
        (done / self.entries.len() as f64) * 100.0
    }

    pub fn blocked_count(&self) -> usize {
        self.entries
            .iter()
            .filter(|e| e.status == ProgressStatus::Blocked)
            .count()
    }
}
