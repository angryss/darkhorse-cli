use serde::{Deserialize, Serialize};

/// Draft tradeoff observation supplied as VEP/A1 input.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tradeoff {
    pub dimension_a: String,
    pub dimension_b: String,
    pub position: TradeoffPosition,
    pub notes: String,
}

/// A local draft position, not governed approval.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TradeoffPosition {
    FavorA,
    FavorB,
    Balanced,
    Unresolved,
}

impl Tradeoff {
    pub fn new(
        a: impl Into<String>,
        b: impl Into<String>,
        position: TradeoffPosition,
        notes: impl Into<String>,
    ) -> Self {
        Self {
            dimension_a: a.into(),
            dimension_b: b.into(),
            position,
            notes: notes.into(),
        }
    }

    pub fn has_draft_position(&self) -> bool {
        self.position != TradeoffPosition::Unresolved
    }
}
