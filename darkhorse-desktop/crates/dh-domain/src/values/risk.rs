use serde::{Deserialize, Serialize};

/// Severity level for identified risks during discovery or planning.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum RiskLevel {
    Critical,
    High,
    Medium,
    Low,
    Negligible,
}

/// A risk identified during discovery, planning, or execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifiedRisk {
    pub description: String,
    pub level: RiskLevel,
    pub mitigation: Option<String>,
    pub category: RiskCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskCategory {
    Technical,
    Product,
    Market,
    Delivery,
    Dependency,
    Unknown,
}

impl IdentifiedRisk {
    pub fn new(description: impl Into<String>, level: RiskLevel, category: RiskCategory) -> Self {
        Self {
            description: description.into(),
            level,
            mitigation: None,
            category,
        }
    }

    pub fn with_mitigation(mut self, m: impl Into<String>) -> Self {
        self.mitigation = Some(m.into());
        self
    }

    pub fn is_mitigated(&self) -> bool {
        self.mitigation.is_some()
    }
}
