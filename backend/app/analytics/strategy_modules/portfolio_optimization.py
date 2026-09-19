import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import Dict, Any, List
from app.analytics.strategy_modules.base import BaseStrategyModule

class PortfolioOptimizationModule(BaseStrategyModule):
    @property
    def module_id(self) -> str:
        return "portfolio_optimization"

    @property
    def name(self) -> str:
        return "Modern Portfolio Theory (MPT) & Efficient Frontier Optimizer"

    @property
    def category(self) -> str:
        return "Portfolio Optimization"

    @property
    def description(self) -> str:
        return "Computes the MPT Efficient Frontier using 10,000 Monte Carlo allocation weight combinations. Identifies exact Max Sharpe Ratio Portfolio and Minimum Volatility Portfolio."

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        return {
            "n_simulations": {"type": "int", "default": 10000, "min": 1000, "max": 25000, "description": "Monte Carlo Weight Simulations"},
            "risk_free_rate": {"type": "float", "default": 0.04, "min": 0.0, "max": 0.10, "description": "Annual Risk-Free Rate"}
        }

    def optimize_portfolio(self, multi_asset_df: pd.DataFrame, rf: float = 0.04, n_sims: int = 10000) -> Dict[str, Any]:
        """
        Takes multi-asset OHLCV dataframe, pivot close prices into asset columns,
        runs 10,000 Monte Carlo allocations, and performs SciPy optimization for Max Sharpe & Min Volatility.
        """
        piv = multi_asset_df.pivot(index="date", columns="asset", values="close").dropna()
        if piv.shape[1] < 2:
            return {"error": "Portfolio optimization requires at least 2 assets"}

        asset_names = list(piv.columns)
        num_assets = len(asset_names)
        
        # Calculate daily returns, mean returns vector, covariance matrix
        returns = piv.pct_change().dropna()
        mean_returns = returns.mean() * 252
        cov_matrix = returns.cov() * 252

        # 1. Monte Carlo Sampling of 10,000 Allocation Weights
        np.random.seed(42)
        weights_matrix = np.random.dirichlet(np.ones(num_assets), size=n_sims)

        port_returns = np.dot(weights_matrix, mean_returns)
        port_vols = np.zeros(n_sims)

        cov_values = cov_matrix.values
        for i in range(n_sims):
            w = weights_matrix[i]
            port_vols[i] = np.sqrt(np.dot(w.T, np.dot(cov_values, w)))

        port_sharpes = (port_returns - rf) / (port_vols + 1e-9)

        # Build Efficient Frontier scatter dataset (downsample to 500 points for UI rendering)
        frontier_points = []
        step = max(1, n_sims // 500)
        for i in range(0, n_sims, step):
            weights_dict = {asset_names[j]: round(float(weights_matrix[i, j]), 4) for j in range(num_assets)}
            frontier_points.append({
                "return": round(float(port_returns[i]), 4),
                "volatility": round(float(port_vols[i]), 4),
                "sharpe": round(float(port_sharpes[i]), 4),
                "weights": weights_dict
            })

        # 2. Exact SciPy Optimization for Max Sharpe Ratio
        def negative_sharpe(w):
            r = np.dot(w, mean_returns)
            v = np.sqrt(np.dot(w.T, np.dot(cov_values, w)))
            return -(r - rf) / (v + 1e-9)

        constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
        bounds = tuple((0.0, 1.0) for _ in range(num_assets))
        init_guess = num_assets * [1.0 / num_assets]

        opt_sharpe = minimize(negative_sharpe, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        max_sharpe_weights = {asset_names[j]: round(float(opt_sharpe.x[j]), 4) for j in range(num_assets)}
        max_sharpe_ret = float(np.dot(opt_sharpe.x, mean_returns))
        max_sharpe_vol = float(np.sqrt(np.dot(opt_sharpe.x.T, np.dot(cov_values, opt_sharpe.x))))
        max_sharpe_val = float((max_sharpe_ret - rf) / (max_sharpe_vol + 1e-9))

        # 3. Exact SciPy Optimization for Minimum Volatility
        def min_volatility(w):
            return np.sqrt(np.dot(w.T, np.dot(cov_values, w)))

        opt_vol = minimize(min_volatility, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        min_vol_weights = {asset_names[j]: round(float(opt_vol.x[j]), 4) for j in range(num_assets)}
        min_vol_ret = float(np.dot(opt_vol.x, mean_returns))
        min_vol_vol = float(np.sqrt(np.dot(opt_vol.x.T, np.dot(cov_values, opt_vol.x))))
        min_vol_sharpe = float((min_vol_ret - rf) / (min_vol_vol + 1e-9))

        # Recommendation Text
        rec_parts = [f"{round(w * 100, 1)}% {a}" for a, w in max_sharpe_weights.items() if w > 0.01]
        rec_str = ", ".join(rec_parts)

        return {
            "assets": asset_names,
            "max_sharpe_portfolio": {
                "return": round(max_sharpe_ret, 4),
                "volatility": round(max_sharpe_vol, 4),
                "sharpe": round(max_sharpe_val, 4),
                "weights": max_sharpe_weights
            },
            "min_volatility_portfolio": {
                "return": round(min_vol_ret, 4),
                "volatility": round(min_vol_vol, 4),
                "sharpe": round(min_vol_sharpe, 4),
                "weights": min_vol_weights
            },
            "efficient_frontier_samples": frontier_points,
            "recommendation": f"Optimal Capital Allocation for Max Sharpe ({round(max_sharpe_val, 2)}): Allocate {rec_str}."
        }

    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        return np.ones(len(df), dtype=int)
