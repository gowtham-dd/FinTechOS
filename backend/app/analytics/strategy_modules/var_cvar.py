import numpy as np
import pandas as pd
from scipy.stats import norm
from typing import Dict, Any
from app.analytics.strategy_modules.base import BaseStrategyModule

class VaRCVaRModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "var_cvar"

    @property
    def name(self) -> str:
        return "Value at Risk (VaR) & Expected Shortfall (CVaR)"

    @property
    def category(self) -> str:
        return "Quantitative Risk"

    @property
    def description(self) -> str:
        return "Calculates 1-day 95% and 99% Value at Risk (VaR) and Conditional VaR (CVaR / Expected Shortfall) using 3 methodologies: Historical Percentile, Parametric Normal, and Monte Carlo."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "portfolio_value": {"type": "float", "default": 100000.0, "min": 1000.0, "max": 10000000.0, "description": "Portfolio Value ($ / INR)"},
            "confidence_level": {"type": "float", "default": 0.95, "options": [0.95, 0.99], "description": "Confidence Level (95% or 99%)"}
        }

    def compute_risk_metrics(self, df: pd.DataFrame, portfolio_val: float = 100000.0) -> Dict[str, Any]:
        closes = df["close"].values
        if len(closes) < 2:
            return {"error": "Insufficient price data"}

        returns = pd.Series(closes).pct_change().dropna().values
        n = len(returns)
        mu = float(np.mean(returns))
        sigma = float(np.std(returns))

        # 1. Historical VaR & CVaR
        sorted_returns = np.sort(returns)
        hist_var_95_pct = -float(np.percentile(sorted_returns, 5))
        hist_var_99_pct = -float(np.percentile(sorted_returns, 1))

        # CVaR (Expected Shortfall): Average loss below VaR cutoff
        cutoff_95 = np.percentile(sorted_returns, 5)
        cutoff_99 = np.percentile(sorted_returns, 1)
        hist_cvar_95_pct = -float(np.mean(sorted_returns[sorted_returns <= cutoff_95]))
        hist_cvar_99_pct = -float(np.mean(sorted_returns[sorted_returns <= cutoff_99]))

        # 2. Parametric (Gaussian) VaR & CVaR
        # VaR = -(mu - z * sigma)
        z_95 = norm.ppf(0.95)  # 1.64485
        z_99 = norm.ppf(0.99)  # 2.32635
        param_var_95_pct = -(mu - z_95 * sigma)
        param_var_99_pct = -(mu - z_99 * sigma)

        # Parametric CVaR: mu - sigma * pdf(z) / (1 - confidence)
        param_cvar_95_pct = -(mu - sigma * norm.pdf(z_95) / 0.05)
        param_cvar_99_pct = -(mu - sigma * norm.pdf(z_99) / 0.01)

        # 3. Monte Carlo VaR & CVaR (10,000 simulated 1-day returns)
        np.random.seed(42)
        mc_returns = np.random.normal(mu, sigma, 10000)
        mc_var_95_pct = -float(np.percentile(mc_returns, 5))
        mc_var_99_pct = -float(np.percentile(mc_returns, 1))
        mc_cvar_95_pct = -float(np.mean(mc_returns[mc_returns <= np.percentile(mc_returns, 5)]))
        mc_cvar_99_pct = -float(np.mean(mc_returns[mc_returns <= np.percentile(mc_returns, 1)]))

        asset_name = df["asset"].iloc[0] if "asset" in df.columns else "Asset"

        return {
            "asset": asset_name,
            "portfolio_value": portfolio_val,
            "historical": {
                "var_95_pct": round(hist_var_95_pct * 100, 2),
                "var_95_usd": round(hist_var_95_pct * portfolio_val, 2),
                "cvar_95_usd": round(hist_cvar_95_pct * portfolio_val, 2),
                "var_99_pct": round(hist_var_99_pct * 100, 2),
                "var_99_usd": round(hist_var_99_pct * portfolio_val, 2),
                "cvar_99_usd": round(hist_cvar_99_pct * portfolio_val, 2),
            },
            "parametric": {
                "var_95_pct": round(param_var_95_pct * 100, 2),
                "var_95_usd": round(param_var_95_pct * portfolio_val, 2),
                "cvar_95_usd": round(param_cvar_95_pct * portfolio_val, 2),
                "var_99_pct": round(param_var_99_pct * 100, 2),
                "var_99_usd": round(param_var_99_pct * portfolio_val, 2),
                "cvar_99_usd": round(param_cvar_99_pct * portfolio_val, 2),
            },
            "monte_carlo": {
                "var_95_pct": round(mc_var_95_pct * 100, 2),
                "var_95_usd": round(mc_var_95_pct * portfolio_val, 2),
                "cvar_95_usd": round(mc_cvar_95_pct * portfolio_val, 2),
                "var_99_pct": round(mc_var_99_pct * 100, 2),
                "var_99_usd": round(mc_var_99_pct * portfolio_val, 2),
                "cvar_99_usd": round(mc_cvar_99_pct * portfolio_val, 2),
            },
            "plain_english": f"If you hold ${portfolio_val:,.0f} in {asset_name}, your 1-day 95% Historical VaR is ${round(hist_var_95_pct * portfolio_val, 2):,.2f} ({round(hist_var_95_pct * 100, 2)}%). This means on 95% of trading days, your daily loss will NOT exceed this amount. In the worst 5% of days, your expected average loss (CVaR) is ${round(hist_cvar_95_pct * portfolio_val, 2):,.2f}."
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        return np.ones(len(df), dtype=int)
