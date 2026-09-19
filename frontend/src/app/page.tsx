"use client";
import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Sparkles,
  ShieldCheck,
  LineChart,
  Sliders,
  Award,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange text-xs font-bold tracking-wide mb-8">
          <Sparkles className="w-4 h-4" />
          <span>NEXT-GEN AGENTIC QUANT RESEARCH ENGINE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-claude-surface tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Hypothesis-Driven Quant Research &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-claude-amber via-claude-orange to-amber-700">
            Overfitting Audit Engine
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-claude-surface/70 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Transform natural language ideas into backtested quantitative strategies. 
          Audited by cryptographic holdout vaults, 500-iteration stationary block bootstraps, 
          and write-ahead SHA-256 tamper-evident ledgers.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link href="/research" className="pro-btn-primary px-8 py-4 text-base rounded-2xl shadow-md">
            <Sparkles className="w-5 h-5" />
            <span>Launch Research Lab</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          <Link href="/audit" className="pro-btn-secondary px-8 py-4 text-base rounded-2xl shadow-sm">
            <ShieldCheck className="w-5 h-5 text-claude-orange" />
            <span>Explore Audit Center</span>
          </Link>
          <Link href="/calibration" className="pro-btn-dark px-8 py-4 text-base rounded-2xl shadow-sm">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Live Judge Placebo Demo</span>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left max-w-6xl mx-auto">
          <div className="pro-card p-6 border-l-4 border-l-claude-amber">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60">Data Protection</span>
              <Lock className="w-5 h-5 text-claude-orange" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1">30% Holdout Vault</div>
            <p className="text-xs text-claude-surface/70">Cryptographically isolated dataset inaccessible to optimization routines.</p>
          </div>

          <div className="pro-card p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60">Statistical Rigor</span>
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1">500 Bootstraps</div>
            <p className="text-xs text-claude-surface/70">Stationary Block Bootstrap CIs to detect lucky random backtest anomalies.</p>
          </div>

          <div className="pro-card p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60">Ledger Security</span>
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1">SHA-256 Ledger</div>
            <p className="text-xs text-claude-surface/70">Tamper-evident write-ahead trial history preventing post-hoc data snooping.</p>
          </div>

          <div className="pro-card p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60">False Positives</span>
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1">&lt; 5% FDR Target</div>
            <p className="text-xs text-claude-surface/70">Empirically calibrated against 1,000 null universe strategies.</p>
          </div>
        </div>
      </section>

      {/* 6 Platform Screens Overview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-claude-surface tracking-tight mb-3">
            Comprehensive 6-Screen Quant Environment
          </h2>
          <p className="text-base text-claude-surface/70 max-w-2xl mx-auto">
            From natural language prompt parsing to institutional model card generation, 
            explore our modular quantitative research suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Screen 1: Research Lab */}
          <div className="pro-card p-8 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-claude-amber/10 border border-claude-amber/30 text-claude-orange flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-claude-orange tracking-wider uppercase mb-1 block">Screen 1</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Research Lab Canvas</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Type strategy prompts in plain English. Review Pydantic confirmation specs, observe 10-node workflow progress, and inspect equity curves against Buy & Hold and Null baselines.
              </p>
            </div>
            <Link href="/research" className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Open Research Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 2: Assets & Indicators */}
          <div className="pro-card p-8 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 block">Screen 2</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Assets & Indicators</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Inspect raw OHLCV price series for GLD, BTC, NVDA, SPY, and more. Overlay technical indicators (SMA, EMA, RSI, Bollinger) and analyze weekly asset correlation matrices.
              </p>
            </div>
            <Link href="/assets" className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Inspect Assets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 3: Robustness & Regimes */}
          <div className="pro-card p-8 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-1 block">Screen 3</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Robustness & Regimes</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Evaluate 3x3 parameter neighborhood heatmaps to catch fragile sharp peaks. Stress-test strategies across commission fee ladders (0-20 bps) and 2x2 market regimes.
              </p>
            </div>
            <Link href="/robustness" className="pro-btn-secondary w-full text-xs py-2.5">
              <span>View Robustness</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 4: Audit Center */}
          <div className="pro-card p-8 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-1 block">Screen 4</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Audit Center</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Review un-editable SHA-256 trial logs, Deflated Sharpe Ratio (DSR), Probability of Backtest Overfitting (PBO), AI Skeptic Agent critiques, and download SR 11-7 model reports.
              </p>
            </div>
            <Link href="/audit" className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Audit Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 5: Calibration & Placebo */}
          <div className="pro-card p-8 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 tracking-wider uppercase mb-1 block">Screen 5</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Calibration & Live Placebo</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Benchmark strategies against 1,000 empirical null universes. Run live judge-seed placebo tests to prove zero false positives on random data.
              </p>
            </div>
            <Link href="/calibration" className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Test Calibration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 6: System Status & Ledger Vault */}
          <div className="pro-card p-8 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 tracking-wider uppercase mb-1 block">Vault Architecture</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Holdout Data Vault</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Learn how atomic 2-phase holdout separation locks out data-peeking. Unlocks only after passing Phase 1 Dev metrics and pre-registering hashes.
              </p>
            </div>
            <Link href="/research" className="pro-btn-dark w-full text-xs py-2.5">
              <span>Start Strategy Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10-Node Workflow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-white rounded-3xl border border-claude-amber/20 shadow-sm mb-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-claude-orange tracking-wider uppercase mb-2 block">System Execution Flow</span>
          <h2 className="text-3xl font-extrabold text-claude-surface tracking-tight mb-3">
            The 10-Node Overfitting Audit Pipeline
          </h2>
          <p className="text-sm text-claude-surface/70 max-w-xl mx-auto">
            Every prompt submitted to Quantum FinTech AgentOS flows through 10 deterministic validation nodes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { step: "01", title: "NLP Prompt Parser", desc: "Maps text to Pydantic strategy spec" },
            { step: "02", title: "Data Partition Service", desc: "Isolates 70% Dev / 30% Holdout Vault" },
            { step: "03", title: "Indicator Engine", desc: "Calculates SMA, EMA, RSI, Bollinger" },
            { step: "04", title: "Pure Backtester", desc: "Executes trades at t+1 Next-Open" },
            { step: "05", title: "Vectorized Metrics", desc: "Computes Sharpe, Sortino, Drawdown" },
            { step: "06", title: "Block Bootstrap", desc: "500-iteration 95% Confidence Bounds" },
            { step: "07", title: "Robustness Grid", desc: "3x3 Plateau & Commission Ladder" },
            { step: "08", title: "Audit Ledger", desc: "Logs trial attempt into SQLite SHA-256" },
            { step: "09", title: "Skeptic Critique", desc: "Adversarial AI threat analysis" },
            { step: "10", title: "Deterministic Verdict", desc: "Outputs VERIFIED, OVERFIT, or FAIL" },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 hover:border-claude-amber transition-all">
              <span className="text-xs font-black text-claude-orange">{item.step}</span>
              <h4 className="font-bold text-xs text-claude-surface mt-1 mb-1">{item.title}</h4>
              <p className="text-[11px] text-claude-surface/70 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-claude-amber/20 text-center text-xs text-claude-surface/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-claude-surface">QUANT FINTECH AGENT OS</span>
            <span>— Validation-First Quantitative Research Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/research" className="hover:text-claude-orange transition-colors">Research</Link>
            <Link href="/assets" className="hover:text-claude-orange transition-colors">Assets</Link>
            <Link href="/robustness" className="hover:text-claude-orange transition-colors">Robustness</Link>
            <Link href="/audit" className="hover:text-claude-orange transition-colors">Audit</Link>
            <Link href="/calibration" className="hover:text-claude-orange transition-colors">Calibration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
