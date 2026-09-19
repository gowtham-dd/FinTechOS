from pydantic import BaseModel, Field, field_validator, Discriminator
from typing import List, Dict, Optional, Literal, Union, Annotated, Any
from datetime import date

class CostModel(BaseModel):
    spread_bps: float = Field(default=5.0, ge=0.0, le=100.0)
    commission_bps: float = Field(default=5.0, ge=0.0, le=100.0)
    slippage_bps: float = Field(default=5.0, ge=0.0, le=100.0)

# Family-Specific Discriminated Union Schemas
class SMACrossParams(BaseModel):
    family: Literal["SMA_CROSS"] = "SMA_CROSS"
    fast_period: int = Field(default=20, ge=2, le=200)
    slow_period: int = Field(default=50, ge=5, le=500)

    @field_validator("slow_period")
    def validate_order(cls, slow_period, info):
        if "fast_period" in info.data and slow_period <= info.data["fast_period"]:
            raise ValueError("slow_period must be greater than fast_period")
        return slow_period

class EMATrendParams(BaseModel):
    family: Literal["EMA_TREND"] = "EMA_TREND"
    fast_period: int = Field(default=12, ge=2, le=100)
    slow_period: int = Field(default=26, ge=5, le=300)

    @field_validator("slow_period")
    def validate_order(cls, slow_period, info):
        if "fast_period" in info.data and slow_period <= info.data["fast_period"]:
            raise ValueError("slow_period must be greater than fast_period")
        return slow_period

class MomentumParams(BaseModel):
    family: Literal["MOMENTUM"] = "MOMENTUM"
    lookback_days: int = Field(default=90, ge=5, le=365)
    quantile_threshold: float = Field(default=0.5, ge=0.0, le=1.0)

class MeanReversionParams(BaseModel):
    family: Literal["MEAN_REVERSION"] = "MEAN_REVERSION"
    period: int = Field(default=20, ge=5, le=100)
    std_devs: float = Field(default=2.0, ge=0.5, le=4.0)

StrategyParams = Annotated[
    Union[SMACrossParams, EMATrendParams, MomentumParams, MeanReversionParams],
    Discriminator("family")
]

class GridSpec(BaseModel):
    fast_period_range: List[int] = Field(default=[10, 50, 5])
    slow_period_range: List[int] = Field(default=[30, 200, 10])

    @field_validator("fast_period_range", "slow_period_range")
    def validate_grid_size(cls, v):
        if len(v) != 3 or v[2] <= 0:
            raise ValueError("Grid range must be [start, stop, step] with positive step")
        return v

class ExperimentSpec(BaseModel):
    universe_id: str = "CORE_DEMO_V1"
    assets: List[Literal["BTC-USD", "GLD", "GC=F", "NVDA", "SPY", "TLT", "SLV", "ETH", "ETH-USD", "INTC"]] = Field(
        default=["BTC-USD", "GLD", "NVDA", "SPY"]
    )
    strategy_config: StrategyParams = Field(default_factory=SMACrossParams)
    grid: Optional[GridSpec] = Field(default_factory=GridSpec)
    initial_capital: float = 100_000.0
    sizing: Literal["FULL", "FIXED_FRAC", "TARGET_VOL"] = "FULL"
    max_leverage: float = 1.0
    long_only: bool = True
    costs: Optional[Dict[str, CostModel]] = Field(
        default_factory=lambda: {
            "BTC-USD": CostModel(spread_bps=10.0, commission_bps=10.0, slippage_bps=10.0),
            "GLD": CostModel(spread_bps=2.0, commission_bps=2.0, slippage_bps=2.0),
            "NVDA": CostModel(spread_bps=3.0, commission_bps=2.0, slippage_bps=3.0),
            "SPY": CostModel(spread_bps=1.0, commission_bps=1.0, slippage_bps=1.0),
            "TLT": CostModel(spread_bps=2.0, commission_bps=2.0, slippage_bps=2.0),
            "SLV": CostModel(spread_bps=3.0, commission_bps=2.0, slippage_bps=3.0),
            "ETH": CostModel(spread_bps=12.0, commission_bps=10.0, slippage_bps=12.0),
            "INTC": CostModel(spread_bps=4.0, commission_bps=2.0, slippage_bps=4.0),
        }
    )
    rf_source: Literal["TBILL", "ZERO"] = "TBILL"
    dev_end_date: str = "2023-12-31"
    periods_per_year: Dict[str, int] = Field(
        default={"BTC-USD": 365, "ETH": 365, "GLD": 252, "NVDA": 252, "SPY": 252, "TLT": 252, "SLV": 252, "INTC": 252}
    )
    seed: int = 42

class PerformanceMetrics(BaseModel):
    total_return: float
    cagr: float
    annualized_volatility: float
    sharpe_ratio: float
    sharpe_ci_lower: float
    sharpe_ci_upper: float
    sortino_ratio: float
    calmar_ratio: float
    max_drawdown: float
    drawdown_duration_days: int
    recovery_time_days: int
    total_trades: int
    win_rate: float
    profit_factor: float
    expectancy_usd: float
    avg_holding_days: float
    top2_trades_pnl_share: float
    breakeven_cost_bps: float
    mde_sharpe: float
    null_baseline_percentile: float

class EngineState(BaseModel):
    user_id: str = "DEFAULT_USER"
    session_id: str = "SESS_LOCAL"
    spec: ExperimentSpec
    prereg_hash: Optional[str] = None
    data_valid: bool = True
    error_message: Optional[str] = None
    aligned_data_hash: Optional[str] = None
    backtest_metrics: Optional[PerformanceMetrics] = None
    equity_curve: List[Dict[str, Any]] = []
    trade_list: List[Dict[str, Any]] = []
    null_baseline_curve: List[Dict[str, Any]] = []
    robustness_heatmap: List[Dict[str, Any]] = []
    fee_ladder: List[Dict[str, Any]] = []
    regimes: List[Dict[str, Any]] = []
    stress_replays: List[Dict[str, Any]] = []
    audit_results: Dict[str, Any] = {}
    verdict: str = "PROVISIONAL_PASS"
    flags: Dict[str, bool] = {}
    skeptic_critique: str = ""
    reporter_summary: str = ""
    holdout_results: Optional[Dict[str, Any]] = None
