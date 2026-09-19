import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class VWAPExecutionModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "vwap_execution"

    @property
    def name(self) -> str:
        return "VWAP Intraday / Multi-Day Execution"

    @property
    def category(self) -> str:
        return "Execution"

    @property
    def description(self) -> str:
        return "Volume Weighted Average Price (VWAP). Generates Buy signal when price is below VWAP (discount execution) and overall trend is bullish."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "window": {"type": "int", "default": 20, "min": 5, "max": 100, "description": "Rolling Volume Window"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        volumes = df["volume"].values if "volume" in df.columns else np.ones(len(closes))
        window = int(params.get("window", 20))

        vp = pd.Series(closes * volumes)
        v = pd.Series(volumes)
        vwap = (vp.rolling(window, min_periods=1).sum() / (v.rolling(window, min_periods=1).sum() + 1e-9)).values

        # Buy when price crosses above VWAP
        return np.where(closes > vwap, 1, 0)
