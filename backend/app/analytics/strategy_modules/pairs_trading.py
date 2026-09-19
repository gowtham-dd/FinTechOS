import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class PairsTradingModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "pairs_trading"

    @property
    def name(self) -> str:
        return "Statistical Arbitrage / Pairs Trading (Spread Z-Score)"

    @property
    def category(self) -> str:
        return "Statistical Arbitrage"

    @property
    def description(self) -> str:
        return "Tracks price spread or ratio between co-integrated assets (e.g. Gold vs Silver, BTC vs ETH). Trades spread divergence when Z-Score > entry threshold."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "lookback": {"type": "int", "default": 30, "min": 10, "max": 120, "description": "Spread Z-Score Lookback"},
            "z_threshold": {"type": "float", "default": 2.0, "min": 1.0, "max": 3.5, "description": "Entry Z-Score Threshold"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        lookback = int(params.get("lookback", 30))
        z_thresh = float(params.get("z_threshold", 2.0))

        # Calculate ratio spread
        sma = pd.Series(closes).rolling(lookback, min_periods=1).mean()
        std = pd.Series(closes).rolling(lookback, min_periods=1).std().fillna(1e-5)
        z_score = ((pd.Series(closes) - sma) / std).values

        signals = np.zeros(len(closes), dtype=int)
        in_pos = False
        for i in range(len(z_score)):
            if z_score[i] < -z_thresh:
                in_pos = True
            elif z_score[i] > z_thresh or abs(z_score[i]) < 0.2:
                in_pos = False
            signals[i] = 1 if in_pos else 0
        return signals
