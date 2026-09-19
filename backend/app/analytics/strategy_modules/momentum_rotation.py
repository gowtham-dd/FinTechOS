import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class MomentumRotationModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "momentum_rotation"

    @property
    def name(self) -> str:
        return "Cross-Asset Rolling Momentum Rotation"

    @property
    def category(self) -> str:
        return "Momentum"

    @property
    def description(self) -> str:
        return "Calculates N-day trailing total returns. Allocates capital to assets exhibiting positive rolling momentum above quantile benchmark."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "lookback_days": {"type": "int", "default": 90, "min": 10, "max": 365, "description": "Momentum Lookback Window (Days)"},
            "min_return_pct": {"type": "float", "default": 0.0, "min": -10.0, "max": 20.0, "description": "Minimum Required Return %"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        lookback = int(params.get("lookback_days", 90))
        min_ret = float(params.get("min_return_pct", 0.0)) / 100.0

        returns = pd.Series(closes).pct_change(periods=lookback).fillna(0).values
        return np.where(returns > min_ret, 1, 0)
