import numpy as np
import pandas as pd
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class ZScoreMeanReversionModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "zscore_mean_reversion"

    @property
    def name(self) -> str:
        return "Z-Score Mean Reversion"

    @property
    def category(self) -> str:
        return "Mean Reversion"

    @property
    def description(self) -> str:
        return "Calculates Z-Score of price relative to rolling mean and standard deviation. Buys when Z-Score is below negative entry threshold, exits when Z-Score reverts to 0."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "period": {"type": "int", "default": 20, "min": 5, "max": 100, "description": "Rolling Window Period"},
            "entry_z": {"type": "float", "default": -2.0, "min": -4.0, "max": -0.5, "description": "Negative Entry Z-Score"},
            "exit_z": {"type": "float", "default": 0.0, "min": -0.5, "max": 2.0, "description": "Exit Target Z-Score"}
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        closes = df["close"].values
        p = int(params.get("period", 20))
        entry_z = float(params.get("entry_z", -2.0))
        exit_z = float(params.get("exit_z", 0.0))

        mean = pd.Series(closes).rolling(p, min_periods=1).mean()
        std = pd.Series(closes).rolling(p, min_periods=1).std().fillna(1e-5)
        z_score = ((pd.Series(closes) - mean) / std).values

        signals = np.zeros(len(closes), dtype=int)
        in_pos = False
        for i in range(len(z_score)):
            if z_score[i] <= entry_z:
                in_pos = True
            elif z_score[i] >= exit_z:
                in_pos = False
            signals[i] = 1 if in_pos else 0
        return signals
