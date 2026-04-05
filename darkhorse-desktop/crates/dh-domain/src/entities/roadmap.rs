use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A roadmap organizes the delivery timeline for an initiative,
/// grouping work into milestones with target dates and tracked progress.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Roadmap {
    id: Uuid,
    initiative_id: Uuid,
    milestones: Vec<Milestone>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Milestone {
    id: Uuid,
    name: String,
    description: String,
    target_date: Option<NaiveDate>,
    completed: bool,
    items: Vec<RoadmapItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoadmapItem {
    id: Uuid,
    title: String,
    completed: bool,
}

impl Roadmap {
    pub fn new(initiative_id: Uuid) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            initiative_id,
            milestones: Vec::new(),
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

    pub fn milestones(&self) -> &[Milestone] {
        &self.milestones
    }

    pub fn add_milestone(&mut self, name: impl Into<String>, description: impl Into<String>) -> Uuid {
        let id = Uuid::new_v4();
        self.milestones.push(Milestone {
            id,
            name: name.into(),
            description: description.into(),
            target_date: None,
            completed: false,
            items: Vec::new(),
        });
        self.updated_at = Utc::now();
        id
    }

    pub fn milestone_mut(&mut self, id: Uuid) -> Option<&mut Milestone> {
        self.milestones.iter_mut().find(|m| m.id == id)
    }
}

impl Milestone {
    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn set_target_date(&mut self, date: NaiveDate) {
        self.target_date = Some(date);
    }

    pub fn add_item(&mut self, title: impl Into<String>) -> Uuid {
        let id = Uuid::new_v4();
        self.items.push(RoadmapItem {
            id,
            title: title.into(),
            completed: false,
        });
        id
    }

    pub fn complete_item(&mut self, item_id: Uuid) -> bool {
        if let Some(item) = self.items.iter_mut().find(|i| i.id == item_id) {
            item.completed = true;
            true
        } else {
            false
        }
    }

    pub fn mark_completed(&mut self) {
        self.completed = true;
    }

    pub fn progress_percent(&self) -> f64 {
        if self.items.is_empty() {
            return if self.completed { 100.0 } else { 0.0 };
        }
        let done = self.items.iter().filter(|i| i.completed).count() as f64;
        (done / self.items.len() as f64) * 100.0
    }
}
