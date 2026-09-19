import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class SupertrendModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "supertrend"

    @property
    def name(self) -> str:
        return "Supertrend Directional Indicator"

    @property
    def category(self) -> str:
        return "Trend Following"

    @property
    def description(self) -> str:
        return "Popular ATR-based trend indicator. Generates Buy signals when price closes above trailing upper line, and Sell signals when price breaks below lower line."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "period": {"type": "int", "default": 10, "min": 3, "max": 50, "description": "ATR Lookback Period"},
            "multiplier": {"type": "float", "default": 3.0, "min": 1.0, "max": 6.0, "description": "ATR Multiplier Factor"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        highs = df["high"].values
        lows = df["low"].values
        period = int(params.get("period", 10))
        mult = float(params.get("multiplier", 3.0))

        tr1 = pd.Series(highs - lows)
        tr2 = pd.Series(np.abs(highs - pd.Series(closes).shift(1).fillna(closes[0])))
        tr3 = pd.Series(np.abs(lows - pd.Series(closes).shift(1).fillna(closes[0])))
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(period, min_periods=1).mean().values

        hl2 = (highs + lows) / 2.0
        upper = hl2 + mult * atr
        lower = hl2 - mult * atr

        signals = np.zeros(len(closes), dtype=int)
        in_trend = 1
        for i in range(1, len(closes)):
            if closes[i] > upper[i-1]:
                in_trend = 1
            elif closes[i] < lower[i-1]:
                in_trend = 0
            signals[i] = in_trend

        return signals
