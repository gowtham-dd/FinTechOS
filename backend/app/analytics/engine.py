import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.models.schemas import ExperimentSpec, PerformanceMetrics

def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Computes TA indicators: SMA 20/50/200, EMA 12/26, RSI 14, Bollinger Bands, ATR 14"""
    df = df.copy().sort_values("date").reset_index(drop=True)
    closes = df["close"].values
    highs = df["high"].values
    lows = df["low"].values
    
    # SMA
    df["sma_20"] = pd.Series(closes).rolling(20, min_periods=1).mean()
    df["sma_50"] = pd.Series(closes).rolling(50, min_periods=1).mean()
    df["sma_200"] = pd.Series(closes).rolling(200, min_periods=1).mean()

    # EMA
    df["ema_12"] = pd.Series(closes).ewm(span=12, adjust=False).mean()
    df["ema_26"] = pd.Series(closes).ewm(span=26, adjust=False).mean()

    # RSI (Wilder's smoothing)
    delta = pd.Series(closes).diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(14, min_periods=1).mean()
    avg_loss = loss.rolling(14, min_periods=1).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    df["rsi_14"] = 100 - (100 / (1 + rs))

    # Bollinger Bands (20-period, 2 std)
    rolling_std = pd.Series(closes).rolling(20, min_periods=1).std().fillna(0)
    df["bollinger_mid"] = df["sma_20"]
    df["bollinger_upper"] = df["sma_20"] + 2.0 * rolling_std
    df["bollinger_lower"] = df["sma_20"] - 2.0 * rolling_std
    df["bollinger_z"] = (df["close"] - df["sma_20"]) / (rolling_std + 1e-9)

    # ATR
    tr1 = pd.Series(highs - lows)
    tr2 = pd.Series(np.abs(highs - pd.Series(closes).shift(1).fillna(closes[0])))
    tr3 = pd.Series(np.abs(lows - pd.Series(closes).shift(1).fillna(closes[0])))
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df["atr_14"] = tr.rolling(14, min_periods=1).mean()

    return df

def generate_signals(df: pd.DataFrame, family: str, params: dict) -> np.ndarray:
    """Generates 1 (Long) or 0 (Cash) signals based on strategy family"""
    closes = df["close"].values
    n = len(closes)
    signals = np.zeros(n, dtype=int)

    if family == "SMA_CROSS":
        fast_p = int(params.get("fast_period", 20))
        slow_p = int(params.get("slow_period", 50))
        sma_fast = pd.Series(closes).rolling(fast_p, min_periods=1).mean().values
        sma_slow = pd.Series(closes).rolling(slow_p, min_periods=1).mean().values
        signals = np.where(sma_fast > sma_slow, 1, 0)

    elif family == "EMA_TREND":
        fast_p = int(params.get("fast_period", 12))
        slow_p = int(params.get("slow_period", 26))
        ema_fast = pd.Series(closes).ewm(span=fast_p, adjust=False).mean().values
        ema_slow = pd.Series(closes).ewm(span=slow_p, adjust=False).mean().values
        signals = np.where(ema_fast > ema_slow, 1, 0)

    elif family == "MOMENTUM":
        lookback = int(params.get("lookback_days", 90))
        returns = pd.Series(closes).pct_change(periods=lookback).fillna(0).values
        signals = np.where(returns > 0, 1, 0)

    elif family == "MEAN_REVERSION":
        p = int(params.get("period", 20))
        stds = float(params.get("std_devs", 2.0))
        sma = pd.Series(closes).rolling(p, min_periods=1).mean()
        std = pd.Series(closes).rolling(p, min_periods=1).std().fillna(0)
        lower_band = (sma - stds * std).values
        upper_band = (sma + stds * std).values
        
        # Buy when price drops below lower band, exit when hits upper band
        in_pos = False
        for i in range(n):
            if closes[i] < lower_band[i]:
                in_pos = True
            elif closes[i] > upper_band[i]:
                in_pos = False
            signals[i] = 1 if in_pos else 0

    return signals

def run_backtest(df: pd.DataFrame, spec: ExperimentSpec, custom_params: dict = None) -> Tuple[pd.DataFrame, dict, List[dict]]:
    """
    Pure Vectorized Strategy Backtest Engine.
    Executes signals at Bar t+1 Open with asset-specific transaction fees (spread + commission + slippage).
    Calculates equity curve, drawdown depth, underwater duration, and trade logs.
    """
    df = df.copy().sort_values("date").reset_index(drop=True)
    asset = df["asset"].iloc[0] if "asset" in df.columns else "BTC-USD"
    
    params = custom_params or spec.strategy_config.model_dump()
    family = params.get("family", "SMA_CROSS")
    
    # Generate signals
    raw_signals = generate_signals(df, family, params)
    
    # Next-Bar (t+1) Open execution: shift signal by 1 bar to prevent look-ahead bias
    exec_signals = np.roll(raw_signals, 1)
    exec_signals[0] = 0  # No trade on first bar

    opens = df["open"].values
    closes = df["close"].values
    dates = df["date"].dt.strftime("%Y-%m-%d").values
    n = len(closes)

    # Cost model lookup
    cost_info = spec.costs.get(asset) if spec.costs and asset in spec.costs else None
    fee_bps = (cost_info.spread_bps + cost_info.commission_bps + cost_info.slippage_bps) if cost_info else 15.0
    fee_rate = fee_bps / 10000.0

    capital = spec.initial_capital
    portfolio_values = np.zeros(n)
    portfolio_values[0] = capital

    position = 0  # 0 or 1
    entry_price = 0.0
    entry_date = ""
    trades = []

    for i in range(1, n):
        target_pos = exec_signals[i]
        price_open = opens[i]
        price_close = closes[i]

        # Trade Execution
        if target_pos == 1 and position == 0:
            # Buy at Open
            position = 1
            entry_price = price_open * (1 + fee_rate)
            entry_date = dates[i]
        elif target_pos == 0 and position == 1:
            # Sell at Open
            exit_price = price_open * (1 - fee_rate)
            pnl_pct = (exit_price - entry_price) / entry_price
            pnl_usd = capital * pnl_pct
            capital += pnl_usd
            
            trades.append({
                "trade_id": len(trades) + 1,
                "asset": asset,
                "entry_date": entry_date,
                "exit_date": dates[i],
                "entry_price": round(entry_price, 2),
                "exit_price": round(exit_price, 2),
                "pnl_pct": round(pnl_pct * 100, 2),
                "pnl_usd": round(pnl_usd, 2)
            })
            position = 0

        # Mark-to-market portfolio value
        if position == 1:
            current_pnl_pct = (price_close - entry_price) / entry_price
            portfolio_values[i] = capital * (1 + current_pnl_pct)
        else:
            portfolio_values[i] = capital

    # Drawdown Calculation
    peaks = np.maximum.accumulate(portfolio_values)
    drawdowns = (portfolio_values - peaks) / peaks
    max_drawdown = float(np.min(drawdowns))

    # Calculate Drawdown Duration
    underwater_days = 0
    max_underwater = 0
    for dd in drawdowns:
        if dd < 0:
            underwater_days += 1
            if underwater_days > max_underwater:
                max_underwater = underwater_days
        else:
            underwater_days = 0

    df["portfolio_value"] = portfolio_values
    df["drawdown"] = drawdowns
    df["signal"] = raw_signals

    summary = {
        "final_capital": round(capital, 2),
        "total_return": round((capital - spec.initial_capital) / spec.initial_capital, 4),
        "max_drawdown": round(max_drawdown, 4),
        "max_underwater_days": max_underwater,
        "total_trades": len(trades),
        "fee_bps_used": fee_bps
    }

    return df, summary, trades
