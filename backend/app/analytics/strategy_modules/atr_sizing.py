import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class ATRSizingModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "atr_sizing"

    @property
    def name(self) -> str:
        return "ATR Volatility Trailing Stop & Risk Sizing"

    @property
    def category(self) -> str:
        return "Risk & Sizing"

    @property
    def description(self) -> str:
        return "Calculates Average True Range (ATR) to establish dynamic trailing stop-loss levels and size positions inversely proportional to asset volatility."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "atr_period": {"type": "int", "default": 14, "min": 5, "max": 50, "description": "ATR Lookback Window"},
            "atr_multiplier": {"type": "float", "default": 2.5, "min": 1.0, "max": 5.0, "description": "ATR Trailing Stop Distance"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        highs = df["high"].values
        lows = df["low"].values
        period = int(params.get("atr_period", 14))
        mult = float(params.get("atr_multiplier", 2.5))

        tr1 = pd.Series(highs - lows)
        tr2 = pd.Series(np.abs(highs - pd.Series(closes).shift(1).fillna(closes[0])))
        tr3 = pd.Series(np.abs(lows - pd.Series(closes).shift(1).fillna(closes[0])))
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(period, min_periods=1).mean().values

        signals = np.zeros(len(closes), dtype=int)
        trailing_stop = 0.0
        in_pos = False

        for i in range(len(closes)):
            stop_dist = mult * atr[i]
            if not in_pos:
                if i > 0 and closes[i] > closes[i-1]:
                    in_pos = True
                    trailing_stop = closes[i] - stop_dist
            else:
                trailing_stop = max(trailing_stop, closes[i] - stop_dist)
                if closes[i] < trailing_stop:
                    in_pos = False

            signals[i] = 1 if in_pos else 0

        return signals
