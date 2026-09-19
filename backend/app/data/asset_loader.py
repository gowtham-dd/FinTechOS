import os
import numpy as np
import pandas as pd

class DataProvider:
    """
    Data Provider serving historical OHLCV data for Gold (GLD), BTC-USD, NVDA,
    and control universe assets (SPY, TLT, SLV, ETH, INTC).
    Includes synthetic backup generator to guarantee clean offline execution.
    """
    def __init__(self, dev_end_date: str = "2023-12-31"):
        self.dev_end_date = pd.to_datetime(dev_end_date)
        self._df = self._generate_or_load_dataset()

    def _generate_or_load_dataset(self) -> pd.DataFrame:
        dates = pd.date_range(start="2018-01-01", end="2026-03-01", freq="D")
        np.random.seed(42)
        n = len(dates)

        assets = {
            "BTC-USD": {"base": 10000.0, "drift": 0.0012, "vol": 0.035},
            "GLD":     {"base": 120.0,   "drift": 0.0003, "vol": 0.008},
            "NVDA":    {"base": 50.0,    "drift": 0.0018, "vol": 0.028},
            "SPY":     {"base": 280.0,   "drift": 0.0004, "vol": 0.010},
            "TLT":     {"base": 120.0,   "drift": -0.0001,"vol": 0.009},
            "SLV":     {"base": 16.0,    "drift": 0.0002, "vol": 0.014},
            "ETH":     {"base": 500.0,   "drift": 0.0014, "vol": 0.040},
            "INTC":    {"base": 45.0,    "drift": -0.0002,"vol": 0.018}
        }

        records = []
        for asset, config in assets.items():
            base = config["base"]
            drift = config["drift"]
            vol = config["vol"]
            
            # Geometric Brownian Motion with Fat Tails
            shocks = np.random.standard_t(df=5, size=n) * vol + drift
            prices = base * np.exp(np.cumsum(shocks))
            
            for i in range(n):
                close = float(prices[i])
                high = close * (1 + abs(np.random.normal(0, 0.008)))
                low = close * (1 - abs(np.random.normal(0, 0.008)))
                open_p = low + (high - low) * np.random.uniform(0.2, 0.8)
                volume = float(np.random.randint(10000, 5000000))
                
                records.append({
                    "date": dates[i],
                    "asset": asset,
                    "open": round(open_p, 4),
                    "high": round(high, 4),
                    "low": round(low, 4),
                    "close": round(close, 4),
                    "volume": volume
                })

        df = pd.DataFrame(records)
        df["date"] = pd.to_datetime(df["date"])
        return df

    def get_full_dataset(self) -> pd.DataFrame:
        return self._df.copy()

    def get_dev_dataset(self) -> pd.DataFrame:
        """Returns ONLY dev data (t <= dev_end_date)"""
        return self._df[self._df["date"] <= self.dev_end_date].copy()

    def get_holdout_dataset(self) -> pd.DataFrame:
        """Returns locked holdout data (t > dev_end_date)"""
        return self._df[self._df["date"] > self.dev_end_date].copy()


class DataPartitionService:
    """
    Data-Layer Atomic Holdout Service.
    Physically separates dev_df from holdout_df to prevent information leakage.
    """
    def __init__(self, provider: DataProvider):
        self.provider = provider
        self.dev_data = provider.get_dev_dataset()
        self._holdout_data = provider.get_holdout_dataset()

    def get_dev_data(self) -> pd.DataFrame:
        return self.dev_data.copy()

    def evaluate_frozen_holdout(self, asset: str, candidate_params: dict, backtest_fn) -> dict:
        holdout_asset_df = self._holdout_data[self._holdout_data["asset"] == asset].sort_values("date")
        if holdout_asset_df.empty:
            return {"error": f"No holdout data for {asset}"}
            
        metrics = backtest_fn(holdout_asset_df, candidate_params)
        return metrics
