import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class RSIOscillatorModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "rsi_oscillator"

    @property
    def name(self) -> str:
        return "RSI Overbought / Oversold Oscillator"

    @property
    def category(self) -> str:
        return "Mean Reversion / Momentum"

    @property
    def description(self) -> str:
        return "Calculates Relative Strength Index (RSI). Buy signal when RSI crosses above oversold threshold (e.g. 30), sell/exit when RSI crosses above overbought (e.g. 70)."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "rsi_period": {"type": "int", "default": 14, "min": 5, "max": 50, "description": "RSI Lookback Period"},
            "oversold_threshold": {"type": "float", "default": 30.0, "min": 10.0, "max": 45.0, "description": "Oversold Buy Threshold"},
            "overbought_threshold": {"type": "float", "default": 70.0, "min": 55.0, "max": 90.0, "description": "Overbought Exit Threshold"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        period = int(params.get("rsi_period", 14))
        oversold = float(params.get("oversold_threshold", 30.0))
        overbought = float(params.get("overbought_threshold", 70.0))

        delta = pd.Series(closes).diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.rolling(period, min_periods=1).mean()
        avg_loss = loss.rolling(period, min_periods=1).mean()
        rs = avg_gain / (avg_loss + 1e-9)
        rsi = (100 - (100 / (1 + rs))).values

        signals = np.zeros(len(closes), dtype=int)
        in_pos = False
        for i in range(len(rsi)):
            if rsi[i] < oversold:
                in_pos = True
            elif rsi[i] > overbought:
                in_pos = False
            signals[i] = 1 if in_pos else 0
        return signals
