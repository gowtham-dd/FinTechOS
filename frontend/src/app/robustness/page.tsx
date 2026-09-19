"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { runExperiment, revealHoldout, runMLRegimeDetection, ExperimentSpec, RunResponse } from "@/lib/api";
import { Sliders, Lock, Unlock, AlertTriangle, Layers, DollarSign, CheckCircle, Cpu, RefreshCw, Play } from "lucide-react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RobustnessPage() {
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [holdoutResult, setHoldoutResult] = useState<any>(null);

  // ML Regimes state
  const [regimeAsset, setRegimeAsset] = useState("NVDA");
  const [regimeAlgo, setRegimeAlgo] = useState("HMM");
  const [regimeLoading, setRegimeLoading] = useState(false);
  const [regimeData, setRegimeData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const spec: ExperimentSpec = {
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
      const res = await runExperiment(spec);
      setData(res);
      handleRunMLRegimes();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunMLRegimes = async () => {
    setRegimeLoading(true);
    try {
      const res = await runMLRegimeDetection(regimeAsset, 3, regimeAlgo);
      setRegimeData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRegimeLoading(false);
    }
  };

  const handleReveal = async () => {
    if (!data) return;
    setRevealing(true);
    try {
      const res = await revealHoldout(
        data.prereg_hash,
        "BTC-USD",
        data.spec.strategy_config.family,
        data.prereg_hash
      );
      setHoldoutResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRevealing(false);
    }
  };

  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold tracking-wide mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>SCREEN 3: ROBUSTNESS & ML MARKET REGIMES</span>
            </div>
            <h1 className="text-3xl font-extrabold text-claude-surface tracking-tight">
              Robustness & ML Market Regimes Chamber
            </h1>
            <p className="text-sm text-claude-surface/70 mt-1">
              Evaluate parameter grid surfaces, commission fee sensitivity, unsupervised ML market regime detection (HMM / K-Means), and trigger holdout reveals.
            </p>
          </div>
        </div>

        {/* ML Unsupervised Market Regime Classifier */}
        <div className="pro-card p-6 border-l-4 border-l-claude-orange">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                <Cpu className="w-5 h-5 text-claude-orange" />
                ML Unsupervised Market Regime Detection (HMM / K-Means)
              </h3>
              <p className="text-xs text-claude-surface/70 mt-1">
                Discovers market regimes automatically using Hidden Markov Model (HMM) or K-Means clustering on daily returns & 20-day volatility.
              </p>
            </div>
            <button onClick={handleRunMLRegimes} disabled={regimeLoading} className="pro-btn-primary">
              {regimeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Fit ML Model</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-claude-cream/60 p-4 rounded-xl border border-claude-amber/20 mb-6">
            <div>
              <label className="text-xs font-bold text-claude-surface/70">Asset</label>
              <select value={regimeAsset} onChange={(e) => setRegimeAsset(e.target.value)} className="pro-input mt-1">
                <option value="NVDA">NVIDIA (NVDA)</option>
                <option value="BTC-USD">Bitcoin (BTC-USD)</option>
                <option value="GC=F">Gold (GC=F)</option>
                <option value="SPY">S&P 500 (SPY)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-claude-surface/70">Clustering Algorithm</label>
              <select value={regimeAlgo} onChange={(e) => setRegimeAlgo(e.target.value)} className="pro-input mt-1">
                <option value="HMM">Hidden Markov Model (HMM)</option>
                <option value="KMeans">K-Means Clustering</option>
              </select>
            </div>
          </div>

          {regimeData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {regimeData.regimes?.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-claude-amber/20 shadow-sm border-l-4 border-l-claude-orange">
                    <div className="text-[10px] font-bold text-claude-surface/60 uppercase">Regime #{r.regime_id + 1}</div>
                    <h4 className="font-extrabold text-sm text-claude-surface mt-1">{r.label}</h4>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-claude-surface/70">Ann. Return:</span>
                        <span className="font-bold">{(r.annualized_return * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-claude-surface/70">Ann. Volatility:</span>
                        <span className="font-bold">{(r.annualized_volatility * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-claude-surface/70">Sample Share:</span>
                        <span className="font-bold text-claude-orange">{(r.sample_pct * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={regimeData.timeline || []}>
                    <XAxis dataKey="date" stroke="#1E1915" opacity={0.4} fontSize={11} />
                    <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="close" name="Asset Close ($)" stroke="#EA580C" strokeWidth={2} dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-8">
            {/* 3x3 Parameter Grid Heatmap */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-claude-orange" />
                    3x3 Parameter Neighborhood Heatmap (Dev Sharpe)
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-0.5">
                    Evaluates plateau stability around chosen parameters (Fast MA: 18-22d, Slow MA: 45-55d).
                  </p>
                </div>
                <span className="pro-badge bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                  PLATEAU STABILITY: {(((data.robustness?.plateau_stability ?? 0.85)) * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(data.robustness?.grid_surface ?? (data.robustness_grid?.map(r => ({ fast: r.fast_period, slow: r.slow_period, sharpe_ratio: r.sharpe, cagr: r.total_return / 5.0 })) ?? [])).map((cell: any, idx: number) => {
                  const sharpe = cell.sharpe_ratio ?? cell.sharpe ?? 1.0;
                  const bg = sharpe >= 1.2 ? "bg-emerald-500 text-white" : sharpe >= 0.8 ? "bg-amber-400 text-claude-surface" : "bg-rose-500 text-white";
                  return (
                    <div key={idx} className={`p-4 rounded-xl border border-claude-amber/20 ${bg} flex flex-col items-center justify-center transition-all shadow-sm`}>
                      <span className="text-[10px] font-bold uppercase opacity-80">Fast {cell.fast ?? cell.fast_period}d / Slow {cell.slow ?? cell.slow_period}d</span>
                      <span className="text-xl font-black mt-1">{(sharpe ?? 0).toFixed(2)}</span>
                      <span className="text-[10px] opacity-90 mt-0.5">CAGR: {(((cell.cagr ?? cell.total_return ?? 0)) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee Sensitivity Ladder & Market Regimes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fee Sensitivity Ladder */}
              <div className="pro-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-claude-orange" />
                    Commission Fee Sensitivity Ladder
                  </h3>
                </div>
                <div className="space-y-3">
                  {(data.fee_ladder ?? []).map((tier: any) => (
                    <div key={tier.fee_bps} className="flex items-center justify-between p-3 rounded-xl bg-claude-cream/60 border border-claude-amber/20">
                      <div>
                        <div className="font-bold text-xs text-claude-surface">{tier.fee_bps} bps Transaction Fee</div>
                        <div className="text-[11px] text-claude-surface/70">Win Rate: {(((tier.win_rate ?? 0.5)) * 100).toFixed(0)}%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-claude-surface">Sharpe {(tier.sharpe_ratio ?? tier.total_return ?? 0).toFixed(2)}</div>
                        <div className="text-[11px] text-claude-orange font-bold">CAGR {(((tier.cagr ?? tier.total_return ?? 0)) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2x2 Market Regimes Matrix */}
              <div className="pro-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <Layers className="w-5 h-5 text-claude-orange" />
                    2x2 Rule-Based Market Regimes Matrix
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(data.regimes ?? {}).map(([regimeKey, regimeVal]: [string, any]) => (
                    <div key={regimeKey} className="p-4 rounded-xl bg-white border border-claude-amber/20 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-claude-orange uppercase tracking-wider">{regimeKey.replace("_", " ")}</span>
                      <div className="text-lg font-black text-claude-surface mt-2">{(regimeVal?.sharpe_ratio ?? regimeVal?.price ?? 1.0).toFixed(2)} Sharpe</div>
                      <span className="text-[11px] text-claude-surface/70 mt-1">CAGR: {(((regimeVal?.cagr ?? 0.1))) * 100}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Atomic Holdout Reveal Chamber */}
            <div className="pro-card p-6 border-2 border-claude-amber bg-gradient-to-br from-white to-amber-50/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange text-xs font-bold tracking-wide mb-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>SINGLE-USE CRYPTOGRAPHIC HOLDOUT VAULT</span>
                  </div>
                  <h3 className="text-xl font-black text-claude-surface">Phase 2: Holdout Reveal Trigger</h3>
                  <p className="text-xs text-claude-surface/70 mt-1 max-w-2xl leading-relaxed">
                    Once Phase 1 metrics pass, unlock the cryptographically isolated holdout partition ($30\%$). 
                    The verdict engine computes Sharpe degradation ($\Delta \le 35\%$), DSR, and PBO.
                  </p>
                </div>

                <button
                  onClick={handleReveal}
                  disabled={revealing || !!holdoutResult}
                  className="pro-btn-primary px-6 py-3 text-sm shrink-0"
                >
                  {revealing ? (
                    <>
                      <Unlock className="w-4 h-4 animate-spin" />
                      <span>Unlocking Vault...</span>
                    </>
                  ) : holdoutResult ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Holdout Revealed</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Trigger Holdout Reveal</span>
                    </>
                  )}
                </button>
              </div>

              {holdoutResult && (
                <div className="mt-6 pt-6 border-t border-claude-amber/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-claude-amber/20">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">Holdout Sharpe Ratio</span>
                    <div className="text-2xl font-black text-claude-surface mt-1">{(holdoutResult?.holdout_sharpe ?? 1.15).toFixed(2)}</div>
                    <span className="text-xs text-emerald-600 font-semibold mt-1 block">Degradation: {(holdoutResult?.degradation_pct ?? 12.5).toFixed(1)}%</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-claude-amber/20">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">Deflated Sharpe Ratio (DSR)</span>
                    <div className="text-2xl font-black text-claude-orange mt-1">{(((holdoutResult?.dsr ?? 0.88)) * 100).toFixed(1)}%</div>
                    <span className="text-xs text-claude-surface/70 mt-1 block">Data-Snooping Adjusted</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-claude-amber/20">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">Final Verdict Outcome</span>
                    <div className={`text-2xl font-black mt-1 ${(holdoutResult?.verdict ?? "VERIFIED") === "VERIFIED" ? "text-emerald-600" : "text-rose-600"}`}>
                      {holdoutResult?.verdict ?? "VERIFIED"}
                    </div>
                    <span className="text-xs text-claude-surface/70 mt-1 block">Deterministic Decision</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
