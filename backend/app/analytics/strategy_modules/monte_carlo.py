import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.analytics.strategy_modules.base import BaseStrategyModule

class MonteCarloModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "monte_carlo"

    @property
    def name(self) -> str:
        return "Monte Carlo Geometric Brownian Motion (GBM) Simulation"

    @property
    def category(self) -> str:
        return "Quantitative Risk"

    @property
    def description(self) -> str:
        return "Simulates 1,000 probabilistic forward price paths over a 1-year (252 trading days) horizon using historical daily mean return and volatility under Geometric Brownian Motion."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "n_paths": {"type": "int", "default": 1000, "min": 100, "max": 5000, "description": "Number of Simulated Price Paths"},
            "time_horizon_days": {"type": "int", "default": 252, "min": 21, "max": 504, "description": "Forecast Horizon (Trading Days)"}
        }

    def simulate_paths(self, df: pd.DataFrame, n_paths: int = 1000, horizon: int = 252) -> Dict[str, Any]:
        closes = df["close"].values
        if len(closes) < 2:
            return {"error": "Insufficient data"}

        returns = pd.Series(closes).pct_change().dropna().values
        mu = float(np.mean(returns))
        sigma = float(np.std(returns))
        last_price = float(closes[-1])

        dt = 1.0
        # GBM Formula: S(t+1) = S(t) * exp((mu - 0.5 * sigma^2)*dt + sigma * sqrt(dt) * Z)
        drift = (mu - 0.5 * (sigma ** 2)) * dt
        
        np.random.seed(42)
        shocks = np.random.normal(0, 1, size=(n_paths, horizon))
        daily_returns = np.exp(drift + sigma * np.sqrt(dt) * shocks)

        # Price paths matrix (n_paths, horizon + 1)
        price_paths = np.zeros((n_paths, horizon + 1))
        price_paths[:, 0] = last_price

        for t in range(horizon):
            price_paths[:, t+1] = price_paths[:, t] * daily_returns[:, t]

        # Compute percentile bands across time
        p5 = np.percentile(price_paths, 5, axis=0)
        p25 = np.percentile(price_paths, 25, axis=0)
        p50 = np.percentile(price_paths, 50, axis=0)  # Median
        p75 = np.percentile(price_paths, 75, axis=0)
        p95 = np.percentile(price_paths, 95, axis=0)

        # Build trajectory JSON payload
        timeline = []
        start_date = df["date"].iloc[-1]
        forecast_dates = pd.date_range(start=start_date, periods=horizon + 1, freq="B")

        for t in range(horizon + 1):
            timeline.append({
                "day": t,
                "date": forecast_dates[t].strftime("%Y-%m-%d"),
                "p5": round(float(p5[t]), 2),
                "p25": round(float(p25[t]), 2),
                "p50_median": round(float(p50[t]), 2),
                "p75": round(float(p75[t]), 2),
                "p95": round(float(p95[t]), 2),
                "sample_path_1": round(float(price_paths[0, t]), 2),
                "sample_path_2": round(float(price_paths[1, t]), 2),
                "sample_path_3": round(float(price_paths[2, t]), 2),
            })

        summary = {
            "last_known_price": round(last_price, 2),
            "historical_daily_mu": round(mu, 6),
            "historical_daily_sigma": round(sigma, 6),
            "annualized_volatility": round(sigma * np.sqrt(252), 4),
            "median_target_1yr": round(float(p50[-1]), 2),
            "p5_lower_bound_1yr": round(float(p5[-1]), 2),
            "p95_upper_bound_1yr": round(float(p95[-1]), 2),
            "probability_positive_return": round(float(np.mean(price_paths[:, -1] > last_price)), 4),
            "insight": f"Based on {n_paths} simulated GBM paths, there is a 90% probability that {df['asset'].iloc[0] if 'asset' in df.columns else 'Asset'} will trade between ${round(p5[-1],2)} and ${round(p95[-1],2)} in 1 year (median target: ${round(p50[-1],2)})."
        }

        return {
            "summary": summary,
            "timeline": timeline
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        # Default buy signal if 1-year median expectation is positive
        sim = self.simulate_paths(df)
        p_pos = sim.get("summary", {}).get("probability_positive_return", 0.5)
        return np.ones(len(df), dtype=int) if p_pos > 0.5 else np.zeros(len(df), dtype=int)
