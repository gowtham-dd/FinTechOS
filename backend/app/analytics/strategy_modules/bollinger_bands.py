import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class BollingerBandsModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "bollinger_bands"

    @property
    def name(self) -> str:
        return "Bollinger Bands Squeeze & Breakout"

    @property
    def category(self) -> str:
        return "Volatility / Breakout"

    @property
    def description(self) -> str:
        return "Uses 20-period moving average with upper/lower bands set at K standard deviations. Signal turns Long when price closes above upper band or bounces off lower band."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "period": {"type": "int", "default": 20, "min": 5, "max": 100, "description": "Bollinger Period"},
            "num_std": {"type": "float", "default": 2.0, "min": 1.0, "max": 3.5, "description": "Standard Deviation Multiplier"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        p = int(params.get("period", 20))
        num_std = float(params.get("num_std", 2.0))

        sma = pd.Series(closes).rolling(p, min_periods=1).mean()
        std = pd.Series(closes).rolling(p, min_periods=1).std().fillna(0)
        lower_band = (sma - num_std * std).values
        upper_band = (sma + num_std * std).values

        signals = np.zeros(len(closes), dtype=int)
        in_pos = False
        for i in range(len(closes)):
            if closes[i] < lower_band[i]:
                in_pos = True
            elif closes[i] > upper_band[i]:
                in_pos = False
            signals[i] = 1 if in_pos else 0
        return signals
