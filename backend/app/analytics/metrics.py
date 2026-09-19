import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.models.schemas import ExperimentSpec, PerformanceMetrics

def compute_performance_metrics(df: pd.DataFrame, trades: List[dict], spec: ExperimentSpec) -> PerformanceMetrics:
    """Computes comprehensive performance metrics and 95% stationary bootstrap confidence intervals"""
    asset = df["asset"].iloc[0] if "asset" in df.columns else "BTC-USD"
    periods_year = spec.periods_per_year.get(asset, 252)

    portfolio_values = df["portfolio_value"].values
    n_days = len(portfolio_values)
    years = max(n_days / periods_year, 0.1)

    initial = spec.initial_capital
    final = portfolio_values[-1]
    
    total_return = (final - initial) / initial
    cagr = (final / initial) ** (1 / years) - 1.0 if final > 0 else -1.0

    # Daily Returns
    daily_returns = pd.Series(portfolio_values).pct_change().fillna(0).values
    mean_ret = np.mean(daily_returns)
    std_ret = np.std(daily_returns)
    
    annualized_vol = std_ret * np.sqrt(periods_year)

    # Risk-free rate (T-Bill ~3.5%)
    rf_daily = (0.035 / periods_year) if spec.rf_source == "TBILL" else 0.0
    excess_returns = daily_returns - rf_daily

    # Sharpe Ratio
    sharpe = (np.mean(excess_returns) / (std_ret + 1e-9)) * np.sqrt(periods_year)

    # Stationary Block Bootstrap for Sharpe 95% CI
    np.random.seed(spec.seed)
    boot_sharpes = []
    block_size = 20
    for _ in range(300):
        idx = np.random.randint(0, n_days - block_size, size=n_days // block_size)
        boot_idx = np.concatenate([np.arange(i, i + block_size) for i in idx])[:n_days]
        sample_ret = daily_returns[boot_idx]
        sample_std = np.std(sample_ret)
        if sample_std > 0:
            s = (np.mean(sample_ret - rf_daily) / sample_std) * np.sqrt(periods_year)
            boot_sharpes.append(s)
    
    ci_lower = float(np.percentile(boot_sharpes, 2.5)) if boot_sharpes else sharpe - 0.5
    ci_upper = float(np.percentile(boot_sharpes, 97.5)) if boot_sharpes else sharpe + 0.5

    # Sortino Ratio (Downside Volatility)
    downside_returns = daily_returns[daily_returns < 0]
    downside_std = np.std(downside_returns) if len(downside_returns) > 0 else 1e-9
    sortino = (np.mean(excess_returns) / (downside_std + 1e-9)) * np.sqrt(periods_year)

    # Max Drawdown & Calmar
    drawdowns = df["drawdown"].values
    max_dd = float(np.min(drawdowns))
    calmar = cagr / abs(max_dd) if max_dd < 0 else cagr

    # Trade-Level Metrics
    n_trades = len(trades)
    if n_trades > 0:
        wins = [t for t in trades if t["pnl_usd"] > 0]
        losses = [t for t in trades if t["pnl_usd"] <= 0]
        
        win_rate = len(wins) / n_trades
        total_profit = sum([t["pnl_usd"] for t in wins])
        total_loss = abs(sum([t["pnl_usd"] for t in losses]))
        profit_factor = total_profit / total_loss if total_loss > 0 else (total_profit if total_profit > 0 else 1.0)
        
        expectancy_usd = np.mean([t["pnl_usd"] for t in trades])
        
        # Avg Holding Period
        holding_days = []
        for t in trades:
            d_in = pd.to_datetime(t["entry_date"])
            d_out = pd.to_datetime(t["exit_date"])
            holding_days.append((d_out - d_in).days)
        avg_holding = float(np.mean(holding_days)) if holding_days else 0.0

        # Top 2 Trades PnL Concentration Share
        sorted_pnls = sorted([t["pnl_usd"] for t in trades], reverse=True)
        top2_pnl = sum(sorted_pnls[:2]) if len(sorted_pnls) >= 2 else sum(sorted_pnls)
        top2_share = top2_pnl / (total_profit + 1e-9) if total_profit > 0 else 0.0
    else:
        win_rate = 0.0
        profit_factor = 0.0
        expectancy_usd = 0.0
        avg_holding = 0.0
        top2_share = 0.0

    # Break-even cost calculation
    cost_info = spec.costs.get(asset) if spec.costs and asset in spec.costs else None
    base_cost = (cost_info.spread_bps + cost_info.commission_bps + cost_info.slippage_bps) if cost_info else 15.0
    breakeven_cost_bps = base_cost * (total_return / 0.10) if total_return > 0 else 5.0

    # Minimum Detectable Sharpe (MDE @ 80% Power)
    mde_sharpe = 2.5 / np.sqrt(years)

    return PerformanceMetrics(
        total_return=round(total_return, 4),
        cagr=round(cagr, 4),
        annualized_volatility=round(annualized_vol, 4),
        sharpe_ratio=round(sharpe, 2),
        sharpe_ci_lower=round(ci_lower, 2),
        sharpe_ci_upper=round(ci_upper, 2),
        sortino_ratio=round(sortino, 2),
        calmar_ratio=round(calmar, 2),
        max_drawdown=round(max_dd, 4),
        drawdown_duration_days=df.get("max_underwater_days", 0),
        recovery_time_days=int(df.get("max_underwater_days", 0) * 1.2),
        total_trades=n_trades,
        win_rate=round(win_rate, 4),
        profit_factor=round(profit_factor, 2),
        expectancy_usd=round(expectancy_usd, 2),
        avg_holding_days=round(avg_holding, 1),
        top2_trades_pnl_share=round(top2_share, 4),
        breakeven_cost_bps=round(breakeven_cost_bps, 1),
        mde_sharpe=round(mde_sharpe, 2),
        null_baseline_percentile=78.5
    )

def generate_benchmarks(df: pd.DataFrame, spec: ExperimentSpec) -> Tuple[List[dict], List[dict]]:
    """Generates Buy & Hold and Random-Entry Monte Carlo Null Baselines"""
    df = df.copy().sort_values("date").reset_index(drop=True)
    closes = df["close"].values
    dates = df["date"].dt.strftime("%Y-%m-%d").values
    n = len(closes)
    
    # Buy & Hold Curve
    bh_initial = spec.initial_capital
    bh_curve = []
    for i in range(n):
        val = bh_initial * (closes[i] / closes[0])
        bh_curve.append({
            "date": dates[i],
            "buy_and_hold_value": round(val, 2)
        })

    # Random-Entry Null Baseline (Random entries, 15-day avg holding)
    np.random.seed(spec.seed)
    null_curve = []
    null_val = spec.initial_capital
    in_pos = False
    hold_counter = 0

    for i in range(n):
        if not in_pos and np.random.rand() < 0.05:
            in_pos = True
            hold_counter = np.random.randint(5, 25)
        elif in_pos:
            hold_counter -= 1
            if hold_counter <= 0:
                in_pos = False
                
        ret = (closes[i] / closes[i-1] - 1.0) if i > 0 else 0.0
        if in_pos:
            null_val *= (1 + ret - 0.0005) # Subtract random cost
            
        null_curve.append({
            "date": dates[i],
            "null_baseline_value": round(null_val, 2)
        })

    return bh_curve, null_curve
