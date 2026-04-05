use serde::{Deserialize, Serialize};

/// Represents a tradeoff identified during discovery or planning.
/// Captures the tension between two competing concerns.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tradeoff {
    pub dimension_a: String,
    pub dimension_b: String,
    pub position: TradeoffPosition,
    pub notes: String,
}

/// Where the decision landed on the tradeoff spectrum.
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

    pub fn is_resolved(&self) -> bool {
        self.position != TradeoffPosition::Unresolved
    }
}
