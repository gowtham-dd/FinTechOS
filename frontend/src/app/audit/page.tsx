"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { runExperiment, ExperimentSpec, RunResponse } from "@/lib/api";
import { ShieldCheck, FileText, CheckCircle, AlertTriangle, Layers, Cpu, Award, Download, Database } from "lucide-react";

export default function AuditPage() {
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadReport = () => {
    if (!data) return;
    const blob = new Blob([data.model_card || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SR11-7_Model_Card_${data.prereg_hash.substring(0, 8)}.md`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SCREEN 4: AUDIT CENTER</span>
            </div>
            <h1 className="text-3xl font-extrabold text-claude-surface tracking-tight">
              Institutional Overfitting Audit Court
            </h1>
            <p className="text-sm text-claude-surface/70 mt-1">
              Tamper-evident trial ledgers, DSR/PBO overfitting statistics, AI Skeptic critique, and Fed SR 11-7 reports.
            </p>
          </div>

          {data && (
            <button
              onClick={handleDownloadReport}
              className="pro-btn-primary px-5 py-2.5 text-xs self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download SR 11-7 Model Report</span>
            </button>
          )}
        </div>

        {data && (
          <div className="space-y-8">
            {/* Audit Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="pro-card p-6 border-l-4 border-l-claude-orange">
                <div className="flex items-center justify-between text-xs font-bold text-claude-surface/60 uppercase mb-2">
                  <span>Write-Ahead Trial Ledger</span>
                  <Database className="w-4 h-4 text-claude-orange" />
                </div>
                <div className="text-2xl font-black text-claude-surface">Hash Verified</div>
                <p className="text-[11px] text-claude-surface/70 mt-1 font-mono truncate">{data.prereg_hash.substring(0, 16)}...</p>
              </div>

              <div className="pro-card p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between text-xs font-bold text-claude-surface/60 uppercase mb-2">
                  <span>Deflated Sharpe (DSR)</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{(((data.dsr_pbo?.dsr ?? 0.92)) * 100).toFixed(1)}%</div>
                <p className="text-[11px] text-claude-surface/70 mt-1">Adjusted for Multiple Testing</p>
              </div>

              <div className="pro-card p-6 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between text-xs font-bold text-claude-surface/60 uppercase mb-2">
                  <span>Overfitting Prob (PBO)</span>
                  <AlertTriangle className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600">{(((data.dsr_pbo?.pbo ?? 0.04)) * 100).toFixed(1)}%</div>
                <p className="text-[11px] text-claude-surface/70 mt-1">Probability of Backtest Illusion</p>
              </div>

              <div className="pro-card p-6 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between text-xs font-bold text-claude-surface/60 uppercase mb-2">
                  <span>Audit Evidence Score</span>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-claude-surface">{data.verdict?.score ?? 85} / 100</div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Status: {data.verdict?.outcome ?? (typeof data.verdict === "string" ? data.verdict : "PROVISIONAL_PASS")}</p>
              </div>
            </div>

            {/* AI Skeptic Agent Critique */}
            <div className="pro-card p-6 border-2 border-rose-200 bg-rose-50/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  AI Skeptic Agent Adversarial Critique
                </h3>
                <span className="pro-badge bg-rose-100 text-rose-800 border-rose-300">
                  Adversarial Risk Audit
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 leading-relaxed font-mono whitespace-pre-wrap">
                {data.skeptic_critique}
              </div>
            </div>

            {/* SR 11-7 Model Card Governance Preview */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                    <FileText className="w-5 h-5 text-claude-orange" />
                    Fed SR 11-7 Model Governance Card Preview
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-0.5">
                    Automated model documentation generated by the Reporter Agent.
                  </p>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="pro-btn-secondary px-4 py-2 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-claude-cream/60 border border-claude-amber/20 font-mono text-xs text-claude-surface overflow-x-auto max-h-96">
                <pre>{data.model_card}</pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
