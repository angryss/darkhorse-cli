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

    /// Lossless input mapping. It intentionally has no Tier 1/2/3 field;
    /// selected tier and rationale may only come back from VEP.
    pub fn to_vep_input(&self) -> VepRiskInput {
        VepRiskInput {
            description: self.description.clone(),
            severity: format!("{:?}", self.level).to_uppercase(),
            category: format!("{:?}", self.category).to_uppercase(),
            mitigation: self.mitigation.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct VepRiskInput {
    pub description: String,
    pub severity: String,
    pub category: String,
    pub mitigation: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn desktop_risk_mapping_is_lossless_and_never_selects_a_tier() {
        let risk = IdentifiedRisk::new(
            "public contract change",
            RiskLevel::High,
            RiskCategory::Dependency,
        )
        .with_mitigation("bounded rollout");
        let mapped = serde_json::to_value(risk.to_vep_input()).unwrap();
        assert_eq!(mapped["description"], "public contract change");
        assert_eq!(mapped["severity"], "HIGH");
        assert_eq!(mapped["category"], "DEPENDENCY");
        assert_eq!(mapped["mitigation"], "bounded rollout");
        assert!(mapped.get("tier").is_none());
    }
}
