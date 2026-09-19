import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class MACDMomentumModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "macd_momentum"

    @property
    def name(self) -> str:
        return "MACD Line & Histogram Momentum"

    @property
    def category(self) -> str:
        return "Momentum"

    @property
    def description(self) -> str:
        return "Computes MACD Line (12 EMA - 26 EMA) and Signal Line (9 EMA of MACD). Buy signal when MACD Line > Signal Line and MACD Histogram is positive."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "fast_span": {"type": "int", "default": 12, "min": 3, "max": 50, "description": "Fast EMA Span"},
            "slow_span": {"type": "int", "default": 26, "min": 10, "max": 100, "description": "Slow EMA Span"},
            "signal_span": {"type": "int", "default": 9, "min": 2, "max": 30, "description": "Signal Line EMA Span"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        fast_span = int(params.get("fast_span", 12))
        slow_span = int(params.get("slow_span", 26))
        signal_span = int(params.get("signal_span", 9))

        ema_fast = pd.Series(closes).ewm(span=fast_span, adjust=False).mean()
        ema_slow = pd.Series(closes).ewm(span=slow_span, adjust=False).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal_span, adjust=False).mean()

        return np.where(macd_line.values > signal_line.values, 1, 0)
