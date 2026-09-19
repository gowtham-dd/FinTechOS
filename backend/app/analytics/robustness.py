import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.analytics.engine import generate_signals, run_backtest
from app.models.schemas import ExperimentSpec

def run_parameter_grid_search(df: pd.DataFrame, spec: ExperimentSpec) -> Tuple[List[dict], bool]:
    """
    Executes vectorized grid search over parameter ranges (e.g. Fast MA 10-50, Slow MA 30-200).
    Computes 3x3 Plateau Stability Scoring to detect isolated overfit peaks.
    """
    grid_spec = spec.grid
    fast_range = range(grid_spec.fast_period_range[0], grid_spec.fast_period_range[1], grid_spec.fast_period_range[2])
    slow_range = range(grid_spec.slow_period_range[0], grid_spec.slow_period_range[1], grid_spec.slow_period_range[2])

    grid_results = []
    matrix = {}

    for f_p in fast_range:
        matrix[f_p] = {}
        for s_p in slow_range:
            if f_p >= s_p:
                continue
            
            p_config = {"family": spec.strategy_config.family, "fast_period": f_p, "slow_period": s_p}
            _, summary, _ = run_backtest(df, spec, custom_params=p_config)
            
            sharpe = round(summary["total_return"] / (abs(summary["max_drawdown"]) + 1e-5), 2)
            matrix[f_p][s_p] = sharpe
            
            grid_results.append({
                "fast_period": f_p,
                "slow_period": s_p,
                "total_return": summary["total_return"],
                "max_drawdown": summary["max_drawdown"],
                "sharpe": sharpe
            })

    # Plateau Stability Scoring (3x3 neighborhood mean)
    is_isolated_peak = False
    if grid_results:
        best_cell = max(grid_results, key=lambda x: x["sharpe"])
        best_f, best_s = best_cell["fast_period"], best_cell["slow_period"]
        
        # Check adjacent cells
        adjacent_sharpes = []
        for df_val in [-grid_spec.fast_period_range[2], 0, grid_spec.fast_period_range[2]]:
            for ds_val in [-grid_spec.slow_period_range[2], 0, grid_spec.slow_period_range[2]]:
                nf, ns = best_f + df_val, best_s + ds_val
                if nf in matrix and ns in matrix[nf]:
                    adjacent_sharpes.append(matrix[nf][ns])
                    
        avg_plateau_sharpe = np.mean(adjacent_sharpes) if adjacent_sharpes else best_cell["sharpe"]
        # If best cell is > 50% higher than neighborhood mean, flag as isolated peak
        if best_cell["sharpe"] > 1.5 * avg_plateau_sharpe and len(adjacent_sharpes) >= 4:
            is_isolated_peak = True

    return grid_results, is_isolated_peak

def compute_fee_sensitivity_ladder(df: pd.DataFrame, spec: ExperimentSpec) -> List[dict]:
    """Runs strategy performance across a transaction cost ladder (0 to 100 bps)"""
    fee_steps = [0.0, 5.0, 10.0, 20.0, 50.0, 100.0]
    ladder = []
    
    for fee_bps in fee_steps:
        # Clone spec with override cost
        spec_copy = spec.model_copy(deep=True)
        for k in spec_copy.costs:
            spec_copy.costs[k].spread_bps = fee_bps / 3.0
            spec_copy.costs[k].commission_bps = fee_bps / 3.0
            spec_copy.costs[k].slippage_bps = fee_bps / 3.0
            
        _, summary, _ = run_backtest(df, spec_copy)
        ladder.append({
            "fee_bps": fee_bps,
            "total_return": summary["total_return"],
            "max_drawdown": summary["max_drawdown"],
            "total_trades": summary["total_trades"]
        })
        
    return ladder

def compute_2x2_market_regimes(df: pd.DataFrame) -> List[dict]:
    """
    Computes 2x2 Market Regime Matrix:
    Trend (Price > / < 200d SMA) x Volatility (Vol > / < Expanding Median)
    Yields 4 Labels: Bull/Low Vol, Bull/High Vol, Bear/Low Vol, Bear/High Vol
    """
    df = df.copy().sort_values("date").reset_index(drop=True)
    closes = df["close"].values
    n = len(closes)

    sma200 = pd.Series(closes).rolling(200, min_periods=1).mean().values
    returns = pd.Series(closes).pct_change().fillna(0)
    vol30 = returns.rolling(30, min_periods=1).std().fillna(0).values
    median_vol = np.median(vol30)

    regimes = []
    regime_counts = {"Bull/Low Vol": 0, "Bull/High Vol": 0, "Bear/Low Vol": 0, "Bear/High Vol": 0}

    for i in range(n):
        is_bull = closes[i] >= sma200[i]
        is_high_vol = vol30[i] >= median_vol

        if is_bull and not is_high_vol:
            label = "Bull/Low Vol"
        elif is_bull and is_high_vol:
            label = "Bull/High Vol"
        elif not is_bull and not is_high_vol:
            label = "Bear/Low Vol"
        else:
            label = "Bear/High Vol"

        regime_counts[label] += 1
        if i % 100 == 0 or i == n - 1:
            regimes.append({
                "date": df["date"].iloc[i].strftime("%Y-%m-%d"),
                "regime": label,
                "price": round(closes[i], 2),
                "sma200": round(sma200[i], 2),
                "volatility": round(vol30[i], 4)
            })

    return regimes

def compute_cross_asset_correlations(full_df: pd.DataFrame) -> Dict[str, Any]:
    """Computes synchronized weekly return cross-asset correlation matrix & 60-day rolling correlation"""
    pivot_df = full_df.pivot(index="date", columns="asset", values="close").ffill().bfill()
    weekly_returns = pivot_df.resample("W").last().pct_change().dropna()

    corr_matrix = weekly_returns.corr().fillna(0.0).round(3).to_dict()
    
    # 60-day rolling correlation between BTC-USD and GLD
    rolling_corr = []
    if "BTC-USD" in pivot_df.columns and "GLD" in pivot_df.columns:
        daily_ret = pivot_df.pct_change().fillna(0)
        r_corr = daily_ret["BTC-USD"].rolling(60).corr(daily_ret["GLD"]).fillna(0)
        for dt, val in r_corr.items():
            rolling_corr.append({
                "date": dt.strftime("%Y-%m-%d"),
                "correlation": 0.0 if np.isnan(val) else round(float(val), 3)
            })

    return {
        "correlation_matrix": corr_matrix,
        "rolling_correlation_btc_gld": rolling_corr[-100:]  # last 100 bars
    }
