const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

export interface OptimizationResult {
  total_financial_impact_usd: number;
  network_coverage_pct: number;
  objective_value: number;
  constraint_violations?: number;
  execution_time_ms?: number;
  classical_result?: any;
  quantum_result?: any;
  delta_financial_impact_pct?: number;
  delta_coverage_pct?: number;
}

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
}

export interface WorkflowStep {
  step_id: string;
  agent_name: string;
  role: string;
  output_summary: string;
  timestamp: string;
}

export interface CaseCandidate {
  case_id: string;
  entity_id: string;
  risk_score: number;
  network_score: number;
  financial_impact_usd: number;
  cluster_id: number;
}

export interface WorkflowExecutionState {
  current_version: number;
  reward_score: number;
  steps: WorkflowStep[];
  quantum_result: {
    total_financial_impact_usd: number;
    network_coverage_pct: number;
  };
  candidates: CaseCandidate[];
}

export interface CostModel {
  spread_bps: number;
  commission_bps: number;
  slippage_bps: number;
}

export interface ExperimentSpec {
  universe_id: string;
  assets: string[];
  strategy_config: {
    family: string;
    fast_period?: number;
    slow_period?: number;
    lookback_days?: number;
    period?: number;
    std_devs?: number;
  };
  grid?: {
    fast_period_range: number[];
    slow_period_range: number[];
  };
  initial_capital: number;
  sizing: string;
  max_leverage: number;
  long_only: boolean;
  costs?: Record<string, CostModel>;
  rf_source: string;
  dev_end_date: string;
  seed: number;
}

export interface PerformanceMetrics {
  total_return: number;
  cagr: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  sharpe_ci_lower: number;
  sharpe_ci_upper: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown: number;
  drawdown_duration_days: number;
  recovery_time_days: number;
  total_trades: number;
  win_rate: number;
  profit_factor: number;
  expectancy_usd: number;
  avg_holding_days: number;
  top2_trades_pnl_share: number;
  breakeven_cost_bps: number;
  mde_sharpe: number;
  null_baseline_percentile: number;
}

export interface RunResponse {
  status: string;
  prereg_hash: string;
  metrics: PerformanceMetrics;
  verdict: any;
  flags?: Record<string, boolean>;
  verdict_disclaimer?: string;
  equity_curve: any[];
  trade_list?: any[];
  buy_and_hold_curve?: any[];
  null_baseline_curve?: any[];
  robustness_grid?: any[];
  robustness?: any;
  bootstrap_ci?: any;
  dsr_pbo?: any;
  fee_ladder?: any[];
  regimes?: any;
  correlation_matrix?: Record<string, Record<string, number>>;
  rolling_correlation?: any[];
  skeptic_critique: string;
  reporter_summary?: string;
  model_card?: string;
  spec?: any;
}

export async function parsePrompt(prompt: string): Promise<{ spec: ExperimentSpec }> {
  try {
    const res = await fetch(`${API_BASE_URL}/quant/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Parse failed");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback spec parser:", err);
    return {
      spec: {
        universe_id: "CORE_DEMO_V1",
        assets: ["BTC-USD", "GLD", "NVDA", "SPY"],
        strategy_config: { family: "SMA_CROSS", fast_period: 20, slow_period: 50 },
        initial_capital: 100000,
        sizing: "FULL",
        max_leverage: 1.0,
        long_only: true,
        rf_source: "TBILL",
        dev_end_date: "2023-12-31",
        seed: 42,
      },
    };
  }
}

export async function runExperiment(spec: ExperimentSpec): Promise<RunResponse> {
  const res = await fetch(`${API_BASE_URL}/quant/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec),
  });
  if (!res.ok) throw new Error("Experiment run failed");
  return await res.json();
}

export async function revealHoldout(user_id: string, asset: string, family_id: string, prereg_hash: string) {
  const res = await fetch(`${API_BASE_URL}/quant/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, asset, family_id, prereg_hash }),
  });
  if (!res.ok) throw new Error("Holdout reveal failed");
  return await res.json();
}

export async function fetchAssetDetails(assetId: string) {
  const res = await fetch(`${API_BASE_URL}/quant/assets/${assetId}`);
  if (!res.ok) throw new Error("Failed to fetch asset details");
  return await res.json();
}

export async function fetchCalibrationCard() {
  const res = await fetch(`${API_BASE_URL}/quant/calibration`);
  if (!res.ok) throw new Error("Failed to fetch calibration");
  return await res.json();
}

export async function runPlaceboTest(judgeSeed: number) {
  const res = await fetch(`${API_BASE_URL}/quant/placebo-seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ judge_seed: judgeSeed }),
  });
  if (!res.ok) throw new Error("Placebo test failed");
  return await res.json();
}

// Legacy exports compatibility stubs
export async function fetchLatestExecution(): Promise<any> {
  return null;
}
export async function fetchOptimizationResult(): Promise<any> {
  return null;
}
export async function fetchWorkflowHistory(): Promise<any[]> {
  return [];
}
export async function triggerWorkflowEvolution(): Promise<any> {
  return null;
}
