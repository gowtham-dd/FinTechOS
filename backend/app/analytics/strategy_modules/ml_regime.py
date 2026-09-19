import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.analytics.strategy_modules.base import BaseStrategyModule

class MLRegimeModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "ml_regime"

    @property
    def name(self) -> str:
        return "ML Unsupervised Market Regime Detection (HMM / K-Means)"

    @property
    def category(self) -> str:
        return "ML & Regimes"

    @property
    def description(self) -> str:
        return "Discovers market regimes automatically using Hidden Markov Model (HMM) or K-Means clustering on daily returns and 20-day rolling volatility. Generates signals tailored to detected regime state."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "n_regimes": {"type": "int", "default": 3, "min": 2, "max": 5, "description": "Number of Hidden Regimes (e.g. 3: Bull, Bear, High Vol)"},
            "algorithm": {"type": "str", "default": "HMM", "options": ["HMM", "KMeans"], "description": "ML Clustering Algorithm"}
        }

    def fit_regimes(self, df: pd.DataFrame, n_regimes: int = 3, algorithm: str = "HMM") -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        """Fits HMM or K-Means model on returns & volatility, returns regime sequence and regime metadata."""
        closes = df["close"].values
        ret = pd.Series(closes).pct_change().fillna(0).values
        vol = pd.Series(closes).pct_change().rolling(20, min_periods=1).std().fillna(0).values

        X = np.column_stack([ret, vol])
        
        # Standardize features
        mean_X = np.mean(X, axis=0)
        std_X = np.std(X, axis=0) + 1e-9
        X_scaled = (X - mean_X) / std_X

        regime_labels = np.zeros(len(closes), dtype=int)
        
        try:
            if algorithm == "HMM":
                from hmmlearn.hmm import GaussianHMM
                model = GaussianHMM(n_components=n_regimes, covariance_type="full", n_iter=100, random_state=42)
                model.fit(X_scaled)
                regime_labels = model.predict(X_scaled)
            else:
                from sklearn.cluster import KMeans
                model = KMeans(n_clusters=n_regimes, random_state=42, n_init=10)
                regime_labels = model.fit_predict(X_scaled)
        except Exception:
            # Robust Fallback to Quantile Volatility Clustering if ML model fails
            vol_pct = pd.Series(vol).rank(pct=True).values
            regime_labels = np.where(vol_pct > 0.7, 2, np.where(ret > 0, 0, 1))

        # Compute summary metrics per regime
        regimes_info = []
        for r in range(n_regimes):
            mask = (regime_labels == r)
            mean_ret = float(np.mean(ret[mask]) * 252) if np.sum(mask) > 0 else 0.0
            ann_vol = float(np.std(ret[mask]) * np.sqrt(252)) if np.sum(mask) > 0 else 0.0
            
            # Interpret Regime Label
            if mean_ret > 0.05 and ann_vol < 0.25:
                label_name = "Bull / Low Volatility"
            elif mean_ret < -0.05:
                label_name = "Bear / Downtrend"
            elif ann_vol >= 0.25:
                label_name = "High Volatility Crisis"
            else:
                label_name = "Sideways / Consolidation"

            regimes_info.append({
                "regime_id": int(r),
                "label": label_name,
                "annualized_return": round(mean_ret, 4),
                "annualized_volatility": round(ann_vol, 4),
                "sample_pct": round(float(np.sum(mask) / len(closes)), 4)
            })

        return regime_labels, regimes_info

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        n_regimes = int(params.get("n_regimes", 3))
        algo = str(params.get("algorithm", "HMM"))

        regimes, info = self.fit_regimes(df, n_regimes=n_regimes, algorithm=algo)
        bullish_regimes = set([r["regime_id"] for r in info if r["annualized_return"] > 0])
        
        signals = np.zeros(len(df), dtype=int)
        for i in range(len(df)):
            signals[i] = 1 if regimes[i] in bullish_regimes else 0
        return signals
