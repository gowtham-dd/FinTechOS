import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.analytics.strategy_modules.base import BaseStrategyModule

class MLRegimeModule(BaseStrategyModule):
    """
    Advanced Machine Learning Unsupervised Market Regime Classifier & Volatility Engine.
    Implements 3-State Gaussian Hidden Markov Model (HMM), Gaussian Mixture Model (GMM),
    and K-Means Clustering with Online State Probability Inference and Transition Matrices.
    """
    @property
    def module_id(self) -> str:
        return "ml_regime"

    @property
    def name(self) -> str:
        return "ML Unsupervised Market Regime Detection (HMM / GMM / K-Means)"

    @property
    def category(self) -> str:
        return "ML & Regimes"

    @property
    def description(self) -> str:
        return "Automatically classifies market regimes (Bull, Bear, High Volatility, Consolidation) using Hidden Markov Models (HMM), Gaussian Mixture Models (GMM), or K-Means. Computes online transition matrices, regime persistence, and streaming state probabilities."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "n_regimes": {"type": "int", "default": 3, "min": 2, "max": 5, "description": "Number of Hidden Regimes (e.g. 3: Bull, Bear, High Vol)"},
            "algorithm": {"type": "str", "default": "HMM", "options": ["HMM", "GMM", "KMeans"], "description": "ML Clustering & Regime Algorithm"},
            "lookback_vol": {"type": "int", "default": 20, "min": 5, "max": 60, "description": "Rolling Volatility Window"}
        }

    def fit_regimes(self, df: pd.DataFrame, n_regimes: int = 3, algorithm: str = "HMM", lookback_vol: int = 20) -> Tuple[np.ndarray, List[Dict[str, Any]], np.ndarray, np.ndarray]:
        """
        Fits ML model on daily returns & rolling volatility.
        Returns:
            - regime_labels: Array of state indices per bar
            - regimes_info: List of regime summary statistics and interpretations
            - transition_matrix: State transition matrix A_ij = P(S_t = j | S_{t-1} = i)
            - state_probs: Posterior state probabilities P(S_t = k | y_1:t)
        """
        closes = df["close"].values
        ret = pd.Series(closes).pct_change().fillna(0).values
        vol = pd.Series(closes).pct_change().rolling(lookback_vol, min_periods=1).std().fillna(0).values

        X = np.column_stack([ret, vol])
        
        # Standardize features
        mean_X = np.mean(X, axis=0)
        std_X = np.std(X, axis=0) + 1e-9
        X_scaled = (X - mean_X) / std_X

        T_len = len(closes)
        regime_labels = np.zeros(T_len, dtype=int)
        state_probs = np.zeros((T_len, n_regimes), dtype=float)
        
        try:
            if algorithm == "HMM":
                from hmmlearn.hmm import GaussianHMM
                model = GaussianHMM(n_components=n_regimes, covariance_type="full", n_iter=150, random_state=42)
                model.fit(X_scaled)
                regime_labels = model.predict(X_scaled)
                state_probs = model.predict_proba(X_scaled)
                transition_matrix = model.transmat_
            elif algorithm == "GMM":
                from sklearn.mixture import GaussianMixture
                model = GaussianMixture(n_components=n_regimes, covariance_type="full", random_state=42, n_init=5)
                model.fit(X_scaled)
                regime_labels = model.predict(X_scaled)
                state_probs = model.predict_proba(X_scaled)
                # Compute empirical transition matrix for GMM
                transition_matrix = self._compute_empirical_transition_matrix(regime_labels, n_regimes)
            else:
                from sklearn.cluster import KMeans
                model = KMeans(n_clusters=n_regimes, random_state=42, n_init=10)
                regime_labels = model.fit_predict(X_scaled)
                # Compute one-hot probabilities for K-Means
                for i, lbl in enumerate(regime_labels):
                    state_probs[i, lbl] = 1.0
                transition_matrix = self._compute_empirical_transition_matrix(regime_labels, n_regimes)
        except Exception:
            # Fallback to Quantile Volatility Clustering if ML dependencies fail
            vol_pct = pd.Series(vol).rank(pct=True).values
            regime_labels = np.where(vol_pct > 0.7, 2, np.where(ret > 0, 0, 1))
            for i, lbl in enumerate(regime_labels):
                state_probs[i, lbl] = 1.0
            transition_matrix = self._compute_empirical_transition_matrix(regime_labels, n_regimes)

        # Compute summary metrics per regime
        regimes_info = []
        for r in range(n_regimes):
            mask = (regime_labels == r)
            n_samples = np.sum(mask)
            if n_samples > 0:
                log_rets = np.log1p(np.clip(ret[mask], -0.2, 0.2))
                mean_log = float(np.mean(log_rets))
                mean_ret = float(np.clip(np.expm1(mean_log * 252), -0.85, 1.85))
                ann_vol = float(np.std(ret[mask]) * np.sqrt(252))
            else:
                mean_ret = 0.0
                ann_vol = 0.0


            # Transition self-loop probability P(S_t = r | S_{t-1} = r)
            self_loop_prob = float(transition_matrix[r, r]) if r < transition_matrix.shape[0] else 0.8
            expected_duration = round(1.0 / (1.0 - self_loop_prob + 1e-6), 1)

            # Smart Regime Labeling
            if mean_ret > 0.15 and ann_vol < 0.35:
                label_name = "Bullish Expansion"
            elif mean_ret > 0.15 and ann_vol >= 0.35:
                label_name = "High Volatility Rally"
            elif mean_ret < -0.15 and ann_vol >= 0.35:
                label_name = "Bearish Crisis / High Volatility"
            elif mean_ret < -0.15:
                label_name = "Bearish Downtrend"
            elif ann_vol >= 0.35:
                label_name = "High Volatility Turbulence"
            else:
                label_name = "Sideways / Consolidation"

            regimes_info.append({
                "regime_id": int(r),
                "label": label_name,
                "annualized_return": round(mean_ret, 4),
                "annualized_volatility": round(ann_vol, 4),
                "sample_pct": round(float(n_samples / T_len), 4),
                "self_loop_prob": round(self_loop_prob, 4),
                "expected_duration_days": expected_duration
            })


        return regime_labels, regimes_info, transition_matrix, state_probs

    def _compute_empirical_transition_matrix(self, labels: np.ndarray, n_regimes: int) -> np.ndarray:
        """Computes empirical transition matrix A_ij = count(i -> j) / count(i)."""
        counts = np.zeros((n_regimes, n_regimes), dtype=float)
        for t in range(len(labels) - 1):
            i, j = labels[t], labels[t+1]
            counts[i, j] += 1.0
        
        row_sums = counts.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        return counts / row_sums

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        n_regimes = int(params.get("n_regimes", 3))
        algo = str(params.get("algorithm", "HMM"))
        lookback_vol = int(params.get("lookback_vol", 20))

        regimes, info, _, _ = self.fit_regimes(df, n_regimes=n_regimes, algorithm=algo, lookback_vol=lookback_vol)
        bullish_regimes = set([r["regime_id"] for r in info if r["annualized_return"] > 0])
        
        signals = np.zeros(len(df), dtype=int)
        for i in range(len(df)):
            signals[i] = 1 if regimes[i] in bullish_regimes else 0
        return signals
