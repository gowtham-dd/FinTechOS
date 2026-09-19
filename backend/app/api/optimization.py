import numpy as np
import pandas as pd
from scipy.optimize import minimize
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from app.data.asset_loader import LiveYFinanceProvider, sanitize_df
from app.data.elliptic_loader import elliptic_loader
from app.models.artifacts import ConstraintSpec
from app.quantum.qubo_formulator import qubo_engine

router = APIRouter(prefix="/optimization", tags=["Portfolio Optimization"])

# ==============================================================================
# DATA MODELS FOR PORTFOLIO OPTIMIZATION
# ==============================================================================

class PortfolioOptRequest(BaseModel):
    assets: List[str] = Field(default=["GC=F", "BTC-USD", "NVDA"], description="List of ticker symbols")
    n_simulations: int = Field(default=10000, description="Monte Carlo simulation count (Layer 2)")
    risk_free_rate: float = Field(default=0.04, description="Annualized risk-free rate (e.g. 4.0%)")

class RunOptimizationRequest(BaseModel):
    max_investigations: int = 50

# ==============================================================================
# CORE ENGINE: 8-LAYER MODERN PORTFOLIO THEORY & EFFICIENT FRONTIER
# ==============================================================================

def execute_portfolio_optimization(assets: List[str], n_sims: int = 10000, rf: float = 0.04) -> Dict[str, Any]:
    """
    Executes the 8-Layer Modern Portfolio Theory (MPT) Optimization Pipeline:
    
    LAYER 1 — DATA LAYER:
      - yfinance download for GC=F, BTC-USD, NVDA (2019-01-01 -> Present)
      - Extract 'Close' column only
      - Align all assets to COMMON trading days (dropping non-overlapping weekend dates)
      - Compute daily % returns -> pct_change().dropna()
      - Outputs: annualised mean_returns (mean * 252) and cov_matrix (cov * 252)
      
    LAYER 2 — MONTE CARLO ENGINE:
      - 10,000 simulations of random weight combinations normalized to 100%
      - For each: portfolio return = w . mu, vol = sqrt(w.T . Cov . w), Sharpe = (return - rf) / vol
      - Samples down to 250 points for snappy SVG chart rendering
      
    LAYER 3 — EXACT SCIPY SLSQP OPTIMIZATION:
      - Optimization A: Max Sharpe Tangency Portfolio (minimizes negative Sharpe)
      - Optimization B: Min Volatility Portfolio (minimizes portfolio variance/volatility)
      - Subject to sum(w) == 1.0 and 0.0 <= w_i <= 1.0
      
    LAYER 4 — ASSEMBLED RESPONSE:
      - max_sharpe_portfolio, min_volatility_portfolio, efficient_frontier_samples (250 pts),
        recommendation string, mean_returns, and cov_matrix
    """
    provider = LiveYFinanceProvider()
    
    # --------------------------------------------------------------------------
    # LAYER 1: DATA LAYER & COMMON TRADING DAY ALIGNMENT
    # --------------------------------------------------------------------------
    dfs = [provider.fetch_asset_data(a) for a in assets]
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Pivot Close prices into asset columns & drop non-overlapping days (e.g. weekends)
    piv = combined_df.pivot(index="date", columns="asset", values="close").dropna()
    if piv.shape[1] < 2:
        raise HTTPException(status_code=400, detail="Portfolio optimization requires at least 2 valid overlapping assets")
        
    asset_names = list(piv.columns)
    num_assets = len(asset_names)
    
    # Daily returns, annualized mean returns, annualized 3x3 covariance matrix
    returns = piv.pct_change().dropna()
    mean_returns = returns.mean() * 252.0
    cov_matrix = returns.cov() * 252.0
    cov_values = cov_matrix.values

    # --------------------------------------------------------------------------
    # LAYER 2: MONTE CARLO ENGINE (10,000 SIMULATIONS)
    # --------------------------------------------------------------------------
    np.random.seed(42)
    # Dirichlet sampling guarantees weights sum to exactly 1.0 (100%)
    weights_matrix = np.random.dirichlet(np.ones(num_assets), size=n_sims)
    
    port_returns = np.dot(weights_matrix, mean_returns)
    port_vols = np.zeros(n_sims)
    
    for i in range(n_sims):
        w = weights_matrix[i]
        port_vols[i] = np.sqrt(np.dot(w.T, np.dot(cov_values, w)))
        
    port_sharpes = (port_returns - rf) / (port_vols + 1e-9)
    
    # Downsample to 250 points for smooth frontend scatter plot rendering
    frontier_points = []
    step = max(1, n_sims // 250)
    for i in range(0, n_sims, step):
        w_dict = {asset_names[j]: round(float(weights_matrix[i, j]), 4) for j in range(num_assets)}
        frontier_points.append({
            "return": round(float(port_returns[i]), 4),
            "volatility": round(float(port_vols[i]), 4),
            "sharpe": round(float(port_sharpes[i]), 4),
            "weights": w_dict
        })
        if len(frontier_points) >= 250:
            break

    # --------------------------------------------------------------------------
    # LAYER 3: EXACT OPTIMIZATION (scipy SLSQP)
    # --------------------------------------------------------------------------
    constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
    bounds = tuple((0.0, 1.0) for _ in range(num_assets))
    init_guess = num_assets * [1.0 / num_assets]

    # Optimization A: Max Sharpe Ratio (Tangency Portfolio)
    def negative_sharpe(w):
        r = np.dot(w, mean_returns)
        v = np.sqrt(np.dot(w.T, np.dot(cov_values, w)))
        return -(r - rf) / (v + 1e-9)

    opt_sharpe = minimize(negative_sharpe, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
    max_sharpe_weights = {asset_names[j]: round(float(opt_sharpe.x[j]), 4) for j in range(num_assets)}
    max_sharpe_ret = float(np.dot(opt_sharpe.x, mean_returns))
    max_sharpe_vol = float(np.sqrt(np.dot(opt_sharpe.x.T, np.dot(cov_values, opt_sharpe.x))))
    max_sharpe_val = float((max_sharpe_ret - rf) / (max_sharpe_vol + 1e-9))

    # Optimization B: Minimum Volatility (Global Minimum Variance)
    def min_volatility(w):
        return np.sqrt(np.dot(w.T, np.dot(cov_values, w)))

    opt_vol = minimize(min_volatility, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
    min_vol_weights = {asset_names[j]: round(float(opt_vol.x[j]), 4) for j in range(num_assets)}
    min_vol_ret = float(np.dot(opt_vol.x, mean_returns))
    min_vol_vol = float(np.sqrt(np.dot(opt_vol.x.T, np.dot(cov_values, opt_vol.x))))
    min_vol_sharpe = float((min_vol_ret - rf) / (min_vol_vol + 1e-9))

    # --------------------------------------------------------------------------
    # LAYER 4: ASSEMBLE BACKEND RESPONSE
    # --------------------------------------------------------------------------
    rec_parts = [f"{round(w * 100, 1)}% {a}" for a, w in sorted(max_sharpe_weights.items(), key=lambda x: x[1], reverse=True) if w > 0.01]
    rec_str = ", ".join(rec_parts)

    return {
        "assets": asset_names,
        "mean_returns": {asset_names[j]: round(float(mean_returns.iloc[j]), 4) for j in range(num_assets)},
        "cov_matrix": {asset_names[i]: {asset_names[j]: round(float(cov_matrix.iloc[i, j]), 4) for j in range(num_assets)} for i in range(num_assets)},
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
        "efficient_frontier_samples": frontier_points[:250],
        "recommendation": f"Optimal Capital Allocation for Max Sharpe ({round(max_sharpe_val, 2)}): Allocate {rec_str}."
    }

# ==============================================================================
# ENDPOINTS
# ==============================================================================

@router.post("/portfolio/opt")
@router.post("/opt")
async def run_portfolio_optimization_endpoint(req: PortfolioOptRequest):
    """
    Layer 4 API Endpoint for Portfolio Optimization.
    Calculates 10,000 Monte Carlo allocations and exact SciPy SLSQP optimal weights.
    """
    assets = req.assets or ["GC=F", "BTC-USD", "NVDA"]
    return execute_portfolio_optimization(assets, n_sims=req.n_simulations, rf=req.risk_free_rate)

@router.post("/benchmark", response_model=Dict[str, Any])
async def run_optimization_benchmark(req: RunOptimizationRequest):
    """Executes side-by-side benchmark comparing Classical ILP vs Quantum QUBO Annealer."""
    candidates = elliptic_loader.get_candidates(limit=1000)
    constraints = ConstraintSpec(max_investigations=req.max_investigations)

    classical_res = qubo_engine.solve_classical(candidates, constraints)
    quantum_res = qubo_engine.solve_quantum_qubo(candidates, constraints)

    return {
        "max_investigations": req.max_investigations,
        "total_candidates": len(candidates),
        "classical": classical_res.model_dump(),
        "quantum": quantum_res.model_dump()
    }
