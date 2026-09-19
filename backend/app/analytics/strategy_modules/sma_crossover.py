import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class SMACrossoverModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "sma_crossover"

    @property
    def name(self) -> str:
        return "SMA Crossover (Golden / Death Cross)"

    @property
    def category(self) -> str:
        return "Trend Following"

    @property
    def description(self) -> str:
        return "Generates Buy signal when Fast Simple Moving Average (e.g. SMA20) crosses above Slow SMA (e.g. SMA50), and Sell signal when Fast crosses below Slow."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "fast_period": {"type": "int", "default": 20, "min": 3, "max": 100, "description": "Fast SMA Lookback Period"},
            "slow_period": {"type": "int", "default": 50, "min": 10, "max": 300, "description": "Slow SMA Lookback Period"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        fast_p = int(params.get("fast_period", 20))
        slow_p = int(params.get("slow_period", 50))

        sma_fast = pd.Series(closes).rolling(fast_p, min_periods=1).mean().values
        sma_slow = pd.Series(closes).rolling(slow_p, min_periods=1).mean().values

        return np.where(sma_fast > sma_slow, 1, 0)
