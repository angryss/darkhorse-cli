use serde::{Deserialize, Serialize};

/// Legacy initiative catalog label retained so existing rows deserialize.
/// It is not developer lifecycle state and has no transition API.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Status {
    Draft,
    Exploring,
    Planning,
    Delivering,
    Completed,
    Archived,
}

/// The persisted `Status` above is a legacy Desktop organization label only.
/// It has no transition API and cannot authorize VEP lifecycle movement.

/// The one developer-visible lifecycle, projected from governed VEP output.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VepLifecycleStage {
    Discover,
    Plan,
    Implement,
    Test,
    Close,
}

pub const VEP_LIFECYCLE: [VepLifecycleStage; 5] = [
    VepLifecycleStage::Discover,
    VepLifecycleStage::Plan,
    VepLifecycleStage::Implement,
    VepLifecycleStage::Test,
    VepLifecycleStage::Close,
];
