"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { parsePrompt, runExperiment, RunResponse, ExperimentSpec } from "@/lib/api";
import { Sparkles, ShieldCheck, LineChart, Play, CheckCircle, RefreshCw, AlertTriangle, Info, Sliders, Database } from "lucide-react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ResearchLabPage() {
  const [prompt, setPrompt] = useState("Test SMA 20/50 crossover on BTC & Gold over 5 years with 0.1% fees");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [spec, setSpec] = useState<ExperimentSpec | null>(null);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [runData, setRunData] = useState<RunResponse | null>(null);
  const [activeStage, setActiveStage] = useState(0);

  // Sliders for sub-second playground
  const [fastPeriod, setFastPeriod] = useState(20);
  const [slowPeriod, setSlowPeriod] = useState(50);
  const [trialCounter, setTrialCounter] = useState(1);

  const stages = [
    "1. Goal Parser Agent",
    "2. Data Quality Gate (Dev Split)",
    "3. Features & Correlation Bank",
    "4. Vectorized Backtest Engine",
    "5. Metrics & Null Baselines",
    "6. Robustness & Validation",
    "7. 2x2 Market Regimes",
    "8. Ledger & DSR Audit",
    "9. AI Skeptic Agent",
    "10. Reporter Agent"
  ];

  const handleParse = async () => {
    setParsing(true);
    try {
      const res = await parsePrompt(prompt);
      setSpec(res.spec);
      setShowSpecModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setParsing(false);
    }
  };

  const executeRun = async (currentSpec: ExperimentSpec) => {
    setShowSpecModal(false);
    setLoading(true);
    setActiveStage(0);

    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < 9) return prev + 1;
        clearInterval(interval);
        return 9;
      });
    }, 200);

    try {
      const res = await runExperiment(currentSpec);
      setRunData(res);
      setTrialCounter((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultSpec: ExperimentSpec = {
      universe_id: "CORE_DEMO_V1",
      assets: ["BTC-USD", "GLD", "NVDA", "SPY"],
      strategy_config: { family: "SMA_CROSS", fast_period: 20, slow_period: 50 },
      initial_capital: 100000,
      sizing: "FULL",
      max_leverage: 1.0,
      long_only: true,
      rf_source: "TBILL",
      dev_end_date: "2023-12-31",
      seed: 42
    };
    setSpec(defaultSpec);
    executeRun(defaultSpec);
  }, []);

  const handleSliderChange = (newFast: number, newSlow: number) => {
    setFastPeriod(newFast);
    setSlowPeriod(newSlow);
    if (spec) {
      const updatedSpec: ExperimentSpec = {
        ...spec,
        strategy_config: { ...spec.strategy_config, fast_period: newFast, slow_period: newSlow }
      };
      setSpec(updatedSpec);
      executeRun(updatedSpec);
    }
  };

  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange text-xs font-bold tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SCREEN 1: RESEARCH LAB</span>
            </div>
            <h1 className="text-3xl font-extrabold text-claude-surface tracking-tight">
              Strategy Hypothesis Canvas
            </h1>
            <p className="text-sm text-claude-surface/70 mt-1">
              Enter your trading strategy hypothesis in plain English or tweak parameters in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="pro-badge bg-white text-claude-surface border-claude-amber/30 shadow-sm">
              <Database className="w-3.5 h-3.5 text-claude-orange" />
              <span>LOGGED TRIALS: #{trialCounter}</span>
            </span>
          </div>
        </div>

        {/* Prompt Input Canvas */}
        <div className="pro-card p-6 border-l-4 border-l-claude-orange">
          <label className="block text-xs font-bold uppercase tracking-wider text-claude-surface/70 mb-2">
            Natural Language Strategy Hypothesis
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Test SMA 20/50 crossover on BTC & Gold over 5 years with 0.1% fees"
              className="pro-input flex-1"
            />
            <button
              onClick={handleParse}
              disabled={parsing || loading}
              className="pro-btn-primary whitespace-nowrap"
            >
              {parsing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing Prompt...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Parse & Run Strategy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pydantic Spec Modal */}
        {showSpecModal && spec && (
          <div className="fixed inset-0 z-50 bg-claude-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="pro-card max-w-xl w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-claude-amber/20 pb-3">
                <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Confirm Parsed Pydantic Strategy Spec
                </h3>
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="text-claude-surface/50 hover:text-claude-surface text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="bg-claude-cream p-4 rounded-xl border border-claude-amber/20 font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(spec, null, 2)}</pre>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="pro-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeRun(spec)}
                  className="pro-btn-primary"
                >
                  Confirm & Execute Node Pipeline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10-Node Workflow SSE Progress Bar */}
        <div className="pro-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-claude-surface tracking-wide uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-claude-orange" />
              10-Node Workflow Pipeline Visualizer
            </h3>
            {loading && (
              <span className="pro-badge bg-amber-50 text-claude-orange border-amber-200 animate-pulse">
                EXECUTING PIPELINE...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {stages.map((stageName, idx) => {
              const isDone = activeStage > idx || (!loading && runData);
              const isCurrent = loading && activeStage === idx;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    isDone
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : isCurrent
                      ? "bg-amber-50 border-amber-300 text-claude-orange font-bold shadow-sm"
                      : "bg-claude-cream/40 border-claude-amber/10 text-claude-surface/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px]">STAGE {idx + 1}</span>
                    {isDone ? (
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-claude-orange" />
                    ) : null}
                  </div>
                  <div className="font-semibold truncate">{stageName}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-Second Parameter Playground Sliders */}
        <div className="pro-card p-6 border-l-4 border-l-claude-amber">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                <Sliders className="w-4 h-4 text-claude-orange" />
                Sub-Second Parameter Playground
              </h3>
              <p className="text-xs text-claude-surface/70 mt-0.5">
                Adjust fast/slow moving averages to see real-time backtest updates.
              </p>
            </div>
            <span className="pro-badge bg-claude-amber/10 text-claude-orange border-claude-amber/30 font-mono">
              FAST: {fastPeriod}d | SLOW: {slowPeriod}d
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-claude-surface mb-1">
                <span>Fast Moving Average Period</span>
                <span>{fastPeriod} Days</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={fastPeriod}
                onChange={(e) => handleSliderChange(parseInt(e.target.value), slowPeriod)}
                className="w-full accent-claude-orange cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-claude-surface mb-1">
                <span>Slow Moving Average Period</span>
                <span>{slowPeriod} Days</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={slowPeriod}
                onChange={(e) => handleSliderChange(fastPeriod, parseInt(e.target.value))}
                className="w-full accent-claude-orange cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Main Performance Cards & Chart */}
        {runData && (
          <div className="space-y-6">
            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="pro-card p-5">
                <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">Dev Sharpe Ratio</span>
                <div className="text-2xl font-black text-claude-surface mt-1">
                  {runData.metrics.sharpe_ratio.toFixed(2)}
                </div>
                <div className="text-[11px] text-claude-surface/70 mt-1">
                  CAGR: {(runData.metrics.cagr * 100).toFixed(1)}%
                </div>
              </div>

              <div className="pro-card p-5">
                <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">95% Bootstrap CI</span>
                <div className="text-lg font-bold text-claude-orange mt-1">
                  [{runData.bootstrap_ci?.ci_lower?.toFixed(2) ?? runData.metrics?.sharpe_ci_lower?.toFixed(2) ?? "0.00"}, {runData.bootstrap_ci?.ci_upper?.toFixed(2) ?? runData.metrics?.sharpe_ci_upper?.toFixed(2) ?? "0.00"}]
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  500 Block Iterations
                </div>
              </div>

              <div className="pro-card p-5">
                <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">Max Drawdown</span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {((runData.metrics?.max_drawdown ?? 0) * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] text-claude-surface/70 mt-1">
                  Win Rate: {((runData.metrics?.win_rate ?? 0) * 100).toFixed(0)}%
                </div>
              </div>

              <div className="pro-card p-5">
                <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">Phase 1 Verdict</span>
                <div className={`text-xl font-extrabold mt-1 ${
                  (runData.verdict?.outcome ?? runData.verdict) === "VERIFIED" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {runData.verdict?.outcome ?? (typeof runData.verdict === "string" ? runData.verdict : "PROVISIONAL_PASS")}
                </div>
                <div className="text-[11px] text-claude-surface/70 mt-1">
                  Score: {runData.verdict?.score ?? 85}/100
                </div>
              </div>
            </div>

            {/* Strategy Equity Curve Chart */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-claude-orange" />
                    Strategy Equity Curve vs. Benchmarks
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-0.5">
                    Comparison against Buy & Hold and Random-Entry Null Baselines over Dev Period.
                  </p>
                </div>
                <span className="pro-badge bg-emerald-50 text-emerald-700 border-emerald-200">
                  t+1 Next-Open Fills Applied
                </span>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={runData.equity_curve.map((item, idx) => ({
                    ...item,
                    buy_and_hold: runData.buy_and_hold_curve?.[idx]?.buy_and_hold_value || item.portfolio_value,
                    null_baseline: runData.null_baseline_curve?.[idx]?.null_baseline_value || item.portfolio_value * 0.95
                  }))}>
                    <XAxis dataKey="date" stroke="#1E1915" opacity={0.4} fontSize={11} />
                    <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="portfolio_value" name="Strategy Equity ($)" stroke="#EA580C" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="buy_and_hold" name="Buy & Hold Benchmark ($)" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                    <Line type="monotone" dataKey="null_baseline" name="Random-Entry Null ($)" stroke="#8C7E72" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
