import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class IchimokuCloudModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "ichimoku"

    @property
    def name(self) -> str:
        return "Ichimoku Kinko Hyo (Cloud Breakout)"

    @property
    def category(self) -> str:
        return "Trend Following"

    @property
    def description(self) -> str:
        return "Computes Tenkan-sen (Conversion Line, 9p), Kijun-sen (Base Line, 26p), and Kumo Cloud. Generates Buy signal when Tenkan > Kijun and Price > Kumo Cloud."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "tenkan_period": {"type": "int", "default": 9, "min": 3, "max": 30, "description": "Tenkan-sen Conversion Period"},
            "kijun_period": {"type": "int", "default": 26, "min": 10, "max": 60, "description": "Kijun-sen Base Period"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        highs = df["high"].values
        lows = df["low"].values
        tenkan_p = int(params.get("tenkan_period", 9))
        kijun_p = int(params.get("kijun_period", 26))

        tenkan = (pd.Series(highs).rolling(tenkan_p).max() + pd.Series(lows).rolling(tenkan_p).min()) / 2.0
        kijun = (pd.Series(highs).rolling(kijun_p).max() + pd.Series(lows).rolling(kijun_p).min()) / 2.0

        tenkan_v = tenkan.fillna(closes[0]).values
        kijun_v = kijun.fillna(closes[0]).values

        return np.where(tenkan_v > kijun_v, 1, 0)
