"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  parsePrompt,
  runExperiment,
  RunResponse,
  ExperimentSpec,
  fetchStrategyModules,
  sendStrategyChatPrompt,
  fetchStrategyHistory,
  clearStrategyHistory,
  runMonteCarloSimulation,
  runVaRAnalysis
} from "@/lib/api";
import {
  Sparkles,
  ShieldCheck,
  LineChart,
  Play,
  CheckCircle,
  RefreshCw,
  Info,
  Sliders,
  Database,
  Bot,
  Layers,
  TrendingUp,
  Activity,
  Send,
  BookOpen,
  Scale,
  Check,
  Award,
  Trash2,
  BarChart2,
  AlertTriangle
} from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from "recharts";

export default function ResearchLabPage() {
  const [activeTab, setActiveTab] = useState<"ai_chat" | "history_comparison" | "formulas_benchmark" | "monte_carlo" | "var_risk" | "classic_lab">("ai_chat");

  // AI Chat & Strategy Builder state
  const [chatPrompt, setChatPrompt] = useState("Build a trend-following strategy for Gold using SMA 20/50 crossover with RSI filter and ATR trailing stop");
  const [selectedAsset, setSelectedAsset] = useState("GC=F");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Strategy Comparison History state
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Modular Blocks catalog
  const [modulesList, setModulesList] = useState<any[]>([]);

  // Monte Carlo state
  const [mcAsset, setMcAsset] = useState("GC=F");
  const [mcPaths, setMcPaths] = useState(1000);
  const [mcHorizon, setMcHorizon] = useState(252);
  const [mcLoading, setMcLoading] = useState(false);
  const [mcData, setMcData] = useState<any>(null);

  // VaR state
  const [varAsset, setVarAsset] = useState("BTC-USD");
  const [varCap, setVarCap] = useState(100000);
  const [varLoading, setVarLoading] = useState(false);
  const [varData, setVarData] = useState<any>(null);

  // Classic Lab state
  const [prompt, setPrompt] = useState("Test SMA 20/50 crossover on BTC & Gold over 5 years with 0.1% fees");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [spec, setSpec] = useState<ExperimentSpec | null>(null);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [runData, setRunData] = useState<RunResponse | null>(null);
  const [activeStage, setActiveStage] = useState(0);

  const [fastPeriod, setFastPeriod] = useState(20);
  const [slowPeriod, setSlowPeriod] = useState(50);
  const [trialCounter, setTrialCounter] = useState(1);

  const recommendedStrategies = [
    {
      title: "🌟 Golden Cross SMA 20/50 + ATR Stop (Gold)",
      prompt: "Build a trend-following strategy for Gold using SMA 20/50 crossover with RSI filter and ATR trailing stop",
      asset: "GC=F"
    },
    {
      title: "⚡ MACD Momentum Breakout (NVIDIA)",
      prompt: "Build a momentum breakout strategy for NVIDIA using MACD 12/26 line crossover with signal span 9",
      asset: "NVDA"
    },
    {
      title: "📈 RSI Oversold Reversion (Bitcoin)",
      prompt: "Build a mean reversion strategy for Bitcoin using RSI 14 with oversold threshold 30 and overbought 70",
      asset: "BTC-USD"
    },
    {
      title: "🎯 Z-Score Mean Reversion (S&P 500)",
      prompt: "Build a Z-Score mean reversion strategy for SPY using 20-day rolling window and negative entry threshold -2.0",
      asset: "SPY"
    },
    {
      title: "🌊 Bollinger Bands Squeeze (Gold)",
      prompt: "Build a volatility breakout strategy for Gold using 20-period Bollinger Bands with 2 standard deviations",
      asset: "GC=F"
    },
    {
      title: "☁️ Ichimoku Cloud Breakout (Bitcoin)",
      prompt: "Build an Ichimoku Cloud breakout strategy for Bitcoin using 9 Tenkan-sen and 26 Kijun-sen lines",
      asset: "BTC-USD"
    },
    {
      title: "🚀 Supertrend ATR Directional Trend (NVIDIA)",
      prompt: "Build a Supertrend directional indicator strategy for NVIDIA using 10 ATR period and 3.0 multiplier",
      asset: "NVDA"
    },
    {
      title: "📊 VWAP Discount Execution (Intel)",
      prompt: "Build a VWAP intraday execution strategy for Intel using 20-period volume weighted average price",
      asset: "INTC"
    }
  ];

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

  // Initial Load
  useEffect(() => {
    fetchStrategyModules().then((res) => {
      if (res && res.modules) setModulesList(res.modules);
    }).catch(console.error);

    loadHistory();

    const defaultSpec: ExperimentSpec = {
      universe_id: "CORE_DEMO_V1",
      assets: ["BTC-USD", "GC=F", "NVDA", "SPY"],
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

  const loadHistory = async () => {
    try {
      const res = await fetchStrategyHistory();
      if (res && res.history) setHistoryList(res.history);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAIChat = async () => {
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await sendStrategyChatPrompt(chatPrompt, selectedAsset, 100000);
      setChatResponse(res);
      await loadHistory();
    } catch (e: any) {
      console.error(e);
      setChatResponse(null);
      setChatError(e?.message || "Featherless LLM Inference failed.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectRecommendation = (rec: any) => {
    setChatPrompt(rec.prompt);
    setSelectedAsset(rec.asset);
    setChatLoading(true);
    setChatError(null);
    sendStrategyChatPrompt(rec.prompt, rec.asset, 100000).then((res) => {
      setChatResponse(res);
      loadHistory();
    }).catch((e: any) => {
      console.error(e);
      setChatResponse(null);
      setChatError(e?.message || "Featherless LLM Inference failed.");
    }).finally(() => {
      setChatLoading(false);
    });
  };

  const handleClearHistory = async () => {
    try {
      await clearStrategyHistory();
      setHistoryList([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunMonteCarlo = async () => {
    setMcLoading(true);
    try {
      const res = await runMonteCarloSimulation(mcAsset, mcPaths, mcHorizon);
      setMcData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setMcLoading(false);
    }
  };

  const handleRunVaR = async () => {
    setVarLoading(true);
    try {
      const res = await runVaRAnalysis(varAsset, varCap);
      setVarData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setVarLoading(false);
    }
  };

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
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange text-xs font-bold tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STRATEGY BACKTESTING ENGINE</span>
            </div>
            <h1 className="text-3xl font-extrabold text-claude-surface tracking-tight">
              Strategy Backtest & AI Assistant Lab
            </h1>
            <p className="text-sm text-claude-surface/70 mt-1">
              Create, auto-wire independent strategy blocks with AI, run backtests, compare multi-strategy historical results in database, and simulate Monte Carlo futures.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="pro-badge bg-white text-claude-surface border-claude-amber/30 shadow-sm">
              <Database className="w-3.5 h-3.5 text-claude-orange" />
              <span>LIVE DATA: YFINANCE</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-claude-amber/30 pb-3">
          {[
            { id: "ai_chat", label: "AI Strategy Builder", icon: Bot },
            { id: "history_comparison", label: `Strategy History & Comparison (${historyList.length})`, icon: BarChart2 },
            { id: "formulas_benchmark", label: "Formulas & Competitor Comparison", icon: Scale },
            { id: "monte_carlo", label: "Monte Carlo Simulation", icon: TrendingUp },
            { id: "var_risk", label: "Value at Risk (VaR)", icon: Activity },
            { id: "classic_lab", label: "Parameter Playground & Audit", icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "history_comparison") loadHistory();
                  if (tab.id === "monte_carlo" && !mcData) handleRunMonteCarlo();
                  if (tab.id === "var_risk" && !varData) handleRunVaR();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? "bg-claude-orange text-white shadow-md"
                    : "bg-white text-claude-surface/70 hover:text-claude-surface hover:bg-claude-cream/60 border border-claude-amber/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: AI STRATEGY BUILDER & CHATBOT                 */}
        {/* ---------------------------------------------------- */}
        {activeTab === "ai_chat" && (
          <div className="space-y-6">
            {/* Recommended Strategies Dropdown */}
            <div className="pro-card p-4 bg-amber-50/60 border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-claude-surface">
                  <Award className="w-4 h-4 text-claude-orange shrink-0" />
                  <span>Curated Recommended Strategy Templates:</span>
                </div>
                <select
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    if (idx >= 0 && idx < recommendedStrategies.length) {
                      handleSelectRecommendation(recommendedStrategies[idx]);
                    }
                  }}
                  className="pro-input sm:w-96 text-xs font-semibold"
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a Recommended Strategy Template --</option>
                  {recommendedStrategies.map((rec, idx) => (
                    <option key={idx} value={idx}>
                      {rec.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Chat Canvas */}
            <div className="pro-card p-6 border-l-4 border-l-claude-orange">
              <label className="block text-xs font-bold uppercase tracking-wider text-claude-surface/70 mb-2">
                Ask AI Assistant to Create & Backtest Any Strategy
              </label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="e.g. Build me a trend-following strategy for Gold with SMA 20/50 crossover and RSI filter"
                  className="pro-input flex-1"
                />
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="pro-input sm:w-44"
                >
                  <option value="GC=F">Gold (GC=F)</option>
                  <option value="BTC-USD">Bitcoin (BTC-USD)</option>
                  <option value="NVDA">NVIDIA (NVDA)</option>
                  <option value="SPY">S&P 500 (SPY)</option>
                  <option value="TLT">Treasuries (TLT)</option>
                  <option value="SLV">Silver (SLV)</option>
                  <option value="ETH-USD">Ethereum (ETH-USD)</option>
                  <option value="INTC">Intel (INTC)</option>
                </select>
                <button
                  onClick={handleRunAIChat}
                  disabled={chatLoading}
                  className="pro-btn-primary whitespace-nowrap"
                >
                  {chatLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Wiring Modules...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Execute AI Strategy</span>
                    </>
                  )}
                </button>
              </div>

              {chatError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 mt-4">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-900 flex items-center gap-2">
                      <span>Featherless LLM Inference Error</span>
                      <span className="px-2 py-0.5 text-[10px] bg-rose-200 text-rose-900 rounded-full font-mono font-bold">NO FALLBACK ALLOWED</span>
                    </h4>
                    <p className="mt-1 font-mono text-xs text-rose-800 leading-relaxed">{chatError}</p>
                    <p className="mt-2 text-[11px] text-rose-700">
                      Please set your active <code className="bg-rose-100 px-1 py-0.5 rounded font-mono font-bold text-rose-900">FEATHERLESS_API_KEY</code> in <code className="bg-rose-100 px-1 py-0.5 rounded font-mono font-bold text-rose-900">backend/.env</code>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Live Reasoning & Pipeline Wiring Progress Indicator */}
            {chatLoading && (
              <div className="pro-card p-6 border-l-4 border-l-claude-orange bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 shadow-md my-6">
                <div className="flex items-center justify-between mb-4 border-b border-claude-amber/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-claude-orange opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-claude-orange"></span>
                    </div>
                    <h4 className="font-bold text-sm text-claude-surface flex items-center gap-2">
                      <Bot className="w-4 h-4 text-claude-orange" />
                      <span>Featherless AI Quantitative Agent Working...</span>
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-claude-orange/10 text-claude-orange border border-claude-orange/20 animate-pulse">
                    LIVE PIPELINE INFERENCE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-claude-amber/20 flex items-center gap-3 shadow-xs">
                    <RefreshCw className="w-4 h-4 text-claude-orange animate-spin shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-claude-surface/60 uppercase">Step 1</div>
                      <div className="text-xs font-semibold text-claude-surface">LLM Prompt Parsing</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-claude-amber/20 flex items-center gap-3 shadow-xs">
                    <Database className="w-4 h-4 text-blue-600 animate-pulse shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-claude-surface/60 uppercase">Step 2</div>
                      <div className="text-xs font-semibold text-claude-surface">yfinance Real Data</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-claude-amber/20 flex items-center gap-3 shadow-xs">
                    <Activity className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-claude-surface/60 uppercase">Step 3</div>
                      <div className="text-xs font-semibold text-claude-surface">Backtest Execution</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-claude-amber/20 flex items-center gap-3 shadow-xs">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-claude-surface/60 uppercase">Step 4</div>
                      <div className="text-xs font-semibold text-claude-surface">AI Synthesis & SQLite</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wired Modular Block Diagram */}
            {chatResponse && (
              <div className="space-y-6">
                <div className="pro-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-claude-surface uppercase tracking-wide flex items-center gap-2">
                      <Layers className="w-4 h-4 text-claude-orange" />
                      Auto-Wired Modular Strategy Pipeline Block Diagram
                    </h3>
                    <span className="pro-badge bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
                      Target: {chatResponse.asset}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {chatResponse.wired_pipeline?.map((mod: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-claude-amber/30 bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded bg-claude-orange/10 text-claude-orange font-mono text-[10px] font-bold">
                              MODULE {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              LOGIC: {mod.combine_logic || "AND"}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-claude-surface">{mod.module_id}</h4>
                          <div className="mt-2 text-[11px] font-mono text-claude-surface/80 bg-claude-cream/80 p-2.5 rounded-lg border border-claude-amber/20 overflow-x-auto max-w-full break-all whitespace-pre-wrap">
                            {JSON.stringify(mod.params, null, 2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanation & Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 pro-card p-6">
                    <h3 className="font-bold text-base text-claude-surface flex items-center gap-2 mb-4">
                      <LineChart className="w-5 h-5 text-claude-orange" />
                      Real Strategy Backtest Equity Curve ({chatResponse.asset})
                    </h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReLineChart data={chatResponse.equity_curve || []}>
                          <XAxis dataKey="date" stroke="#1E1915" opacity={0.4} fontSize={11} />
                          <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} domain={["auto", "auto"]} />
                          <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                          <Line type="monotone" dataKey="portfolio_value" name="Portfolio Value ($)" stroke="#EA580C" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="close" name="Asset Close ($)" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                        </ReLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pro-card p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-claude-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-claude-orange" />
                        AI Agent Quantitative Synthesis
                      </h3>
                      <div className="prose prose-sm text-xs text-claude-surface/80 leading-relaxed whitespace-pre-line bg-claude-cream/60 p-4 rounded-xl border border-claude-amber/20 max-h-64 overflow-y-auto">
                        {chatResponse.ai_explanation}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-claude-amber/20">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">Total Return</div>
                        <div className="text-lg font-black text-emerald-800">
                          {((chatResponse.summary?.total_return || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                        <div className="text-[10px] text-rose-700 font-bold uppercase">Max Drawdown</div>
                        <div className="text-lg font-black text-rose-800">
                          {((chatResponse.summary?.max_drawdown || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: MULTI-STRATEGY HISTORY & COMPARISON           */}
        {/* ---------------------------------------------------- */}
        {activeTab === "history_comparison" && (
          <div className="space-y-8">
            <div className="pro-card p-6 border-l-4 border-l-claude-orange flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-claude-orange" />
                  Strategy Backtest Performance Database Comparison
                </h3>
                <p className="text-xs text-claude-surface/70 mt-1">
                  Persisted SQLite store of all strategies executed by the user. Compare Sharpe Ratio and Return % side-by-side.
                </p>
              </div>
              <button onClick={handleClearHistory} className="pro-btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            </div>

            {/* Comparison Bar Chart */}
            {historyList.length > 0 && (
              <div className="pro-card p-6">
                <h3 className="font-bold text-sm text-claude-surface uppercase tracking-wide mb-4">
                  Sharpe Ratio & Total Return % Multi-Strategy Comparison
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyList.map((h) => ({
                      name: `${h.strategy_name} (${h.asset})`,
                      sharpe: h.sharpe_ratio,
                      return_pct: +(h.total_return * 100).toFixed(1)
                    }))}>
                      <XAxis dataKey="name" stroke="#1E1915" opacity={0.4} fontSize={10} />
                      <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                      <Legend />
                      <Bar dataKey="sharpe" name="Sharpe Ratio" fill="#EA580C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="return_pct" name="Total Return (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Strategy Comparison Table */}
            <div className="pro-card p-6">
              <h3 className="font-bold text-sm text-claude-surface uppercase tracking-wide mb-4">
                Saved Strategy Runs Database ({historyList.length} Runs)
              </h3>

              {historyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-claude-surface/60 font-semibold bg-claude-cream rounded-xl">
                  No strategy runs saved yet. Execute a strategy in the AI Strategy Builder tab to record results!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-claude-cream/80 border-b border-claude-amber/30 text-claude-surface font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Run ID</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Asset</th>
                        <th className="p-3">Strategy Module</th>
                        <th className="p-3">Total Return</th>
                        <th className="p-3">Sharpe Ratio</th>
                        <th className="p-3">Max Drawdown</th>
                        <th className="p-3">Trades</th>
                        <th className="p-3">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-claude-amber/20 font-medium">
                      {historyList.map((run, idx) => (
                        <tr key={idx} className="hover:bg-claude-cream/40">
                          <td className="p-3 font-mono text-[11px] font-bold text-claude-orange">{run.run_id}</td>
                          <td className="p-3 text-claude-surface/70">{run.timestamp}</td>
                          <td className="p-3 font-bold">{run.asset}</td>
                          <td className="p-3 font-mono text-emerald-700">{run.strategy_name}</td>
                          <td className={`p-3 font-bold ${run.total_return >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                            {(run.total_return * 100).toFixed(1)}%
                          </td>
                          <td className="p-3 font-extrabold text-claude-surface">{run.sharpe_ratio.toFixed(2)}</td>
                          <td className="p-3 text-rose-600 font-bold">{(run.max_drawdown * 100).toFixed(1)}%</td>
                          <td className="p-3">{run.total_trades}</td>
                          <td className="p-3 font-bold">{(run.win_rate * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: FORMULAS & COMPETITOR BENCHMARK COMPARISON    */}
        {/* ---------------------------------------------------- */}
        {activeTab === "formulas_benchmark" && (
          <div className="space-y-8">
            {/* Competitor Comparison Matrix */}
            <div className="pro-card p-6 border-l-4 border-l-claude-orange">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <Scale className="w-5 h-5 text-claude-orange" />
                    Industry Competitor Backtesting Architecture Comparison
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-1">
                    How FinTech Agent OS backtest engine compares against Bloomberg BQuant, QuantConnect, and TradingView.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-claude-cream/80 border-b border-claude-amber/30 text-claude-surface font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Feature / Capability</th>
                      <th className="p-3 text-claude-orange font-black">FinTech Agent OS (Our Engine)</th>
                      <th className="p-3">Bloomberg BQuant / Equity Signal</th>
                      <th className="p-3">QuantConnect / Backtrader</th>
                      <th className="p-3">TradingView PineScript</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-claude-amber/20">
                    <tr>
                      <td className="p-3 font-semibold">Natural Language Strategy Creation</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> LangChain + Groq LLM Auto-Wiring
                      </td>
                      <td className="p-3 text-rose-600 font-medium">Manual Python Code / BQL Queries</td>
                      <td className="p-3 text-rose-600 font-medium">Manual C# / Python Boilerplate</td>
                      <td className="p-3 text-rose-600 font-medium">Manual PineScript Coding</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Look-Ahead Bias Prevention</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> Vectorized Bar (t+1) Open Fills
                      </td>
                      <td className="p-3 text-emerald-600 font-medium">Supports Bar t+1 Open</td>
                      <td className="p-3 text-emerald-600 font-medium">Supports Bar t+1 Open</td>
                      <td className="p-3 text-rose-600 font-medium">Bar Close Fill (Repainting Risk)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">False Discovery & Overfitting Audit</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> Deflated Sharpe (DSR) & PBO Audit
                      </td>
                      <td className="p-3 text-amber-600 font-medium">Manual Factor Selection</td>
                      <td className="p-3 text-rose-600 font-medium">Not Built-In</td>
                      <td className="p-3 text-rose-600 font-medium">Not Available</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">95% Bootstrap Confidence Intervals</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> 500-Block Stationary Bootstrap
                      </td>
                      <td className="p-3 text-amber-600 font-medium">Custom Script Required</td>
                      <td className="p-3 text-rose-600 font-medium">Not Built-In</td>
                      <td className="p-3 text-rose-600 font-medium">Not Available</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Real-Time Data Access</td>
                      <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> yfinance (Gold, BTC, NVDA, SPY)
                      </td>
                      <td className="p-3 text-emerald-600 font-medium">Bloomberg Terminal Data ($2,500/mo)</td>
                      <td className="p-3 text-emerald-600 font-medium">Market Data Subscriptions</td>
                      <td className="p-3 text-emerald-600 font-medium">TradingView Feeds</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complete Formulas Specification */}
            <div className="pro-card p-6 space-y-6">
              <h3 className="font-bold text-base text-claude-surface flex items-center gap-2 border-b border-claude-amber/20 pb-3">
                <BookOpen className="w-5 h-5 text-claude-orange" />
                Mathematical Formulas Used in Backtest Engine
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 space-y-2">
                  <h4 className="font-bold text-sm text-claude-surface">1. Execution Fill Price & Fees</h4>
                  <p className="text-claude-surface/80">Prevents look-ahead bias by executing signals generated at bar t on bar t+1 Open price:</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[11px] border border-claude-amber/20">
                    Buy Price = Open_(t+1) × (1 + Fee_rate)<br />
                    Sell Price = Open_(t+1) × (1 - Fee_rate)<br />
                    Fee_rate = (Spread_bps + Commission_bps + Slippage_bps) / 10,000
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 space-y-2">
                  <h4 className="font-bold text-sm text-claude-surface">2. CAGR (Compound Annual Growth Rate)</h4>
                  <p className="text-claude-surface/80">Annualized geometric rate of portfolio return:</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[11px] border border-claude-amber/20">
                    CAGR = (Final_Capital / Initial_Capital)^(252 / N) - 1
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 space-y-2">
                  <h4 className="font-bold text-sm text-claude-surface">3. Sharpe Ratio & Annualized Volatility</h4>
                  <p className="text-claude-surface/80">Risk-adjusted return normalized by total volatility:</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[11px] border border-claude-amber/20">
                    Sharpe = (E[R_daily] - R_f) / σ_daily × √252<br />
                    σ_ann = σ_daily × √252
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 space-y-2">
                  <h4 className="font-bold text-sm text-claude-surface">4. Sortino Ratio (Downside Deviation)</h4>
                  <p className="text-claude-surface/80">Penalizes only harmful negative return volatility:</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[11px] border border-claude-amber/20">
                    Sortino = (CAGR - R_f) / σ_downside<br />
                    σ_downside = √ (1/N ∑ min(R_t - R_f, 0)²) × √252
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 space-y-2">
                  <h4 className="font-bold text-sm text-claude-surface">5. Maximum Drawdown (MDD)</h4>
                  <p className="text-claude-surface/80">Peak-to-trough drop depth across portfolio lifetime:</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[11px] border border-claude-amber/20">
                    Peak_t = max(Portfolio_0 ... Portfolio_t)<br />
                    Drawdown_t = (Portfolio_t - Peak_t) / Peak_t<br />
                    MDD = min(Drawdown_t)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 space-y-2">
                  <h4 className="font-bold text-sm text-claude-surface">6. Deflated Sharpe Ratio (DSR)</h4>
                  <p className="text-claude-surface/80">Adjusts Sharpe Ratio for multiple testing (trials tested):</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-[11px] border border-claude-amber/20">
                    DSR = Φ ( (Sharpe - Sharpe_benchmark) / SE_Sharpe )<br />
                    Sharpe_benchmark = √(2 × ln(N_trials)) × σ_returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: MONTE CARLO SIMULATION                        */}
        {/* ---------------------------------------------------- */}
        {activeTab === "monte_carlo" && (
          <div className="space-y-6">
            <div className="pro-card p-6 border-l-4 border-l-claude-orange">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-claude-orange" />
                    Monte Carlo Geometric Brownian Motion (GBM) Futures Simulator
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-1">
                    Simulates 1,000 probabilistic price paths for the next 252 trading days based on historical daily mean return and volatility.
                  </p>
                </div>
                <button onClick={handleRunMonteCarlo} disabled={mcLoading} className="pro-btn-primary">
                  {mcLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>Run 1,000 Simulations</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-claude-cream/60 p-4 rounded-xl border border-claude-amber/20">
                <div>
                  <label className="text-xs font-bold text-claude-surface/70">Asset</label>
                  <select value={mcAsset} onChange={(e) => setMcAsset(e.target.value)} className="pro-input mt-1">
                    <option value="GC=F">Gold (GC=F)</option>
                    <option value="BTC-USD">Bitcoin (BTC-USD)</option>
                    <option value="NVDA">NVIDIA (NVDA)</option>
                    <option value="SPY">S&P 500 (SPY)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-claude-surface/70">Simulated Paths</label>
                  <input type="number" value={mcPaths} onChange={(e) => setMcPaths(Number(e.target.value))} className="pro-input mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-claude-surface/70">Horizon (Trading Days)</label>
                  <input type="number" value={mcHorizon} onChange={(e) => setMcHorizon(Number(e.target.value))} className="pro-input mt-1" />
                </div>
              </div>
            </div>

            {mcData && (
              <div className="space-y-6">
                <div className="pro-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="pro-badge bg-emerald-50 text-emerald-800 border-emerald-200">
                      {mcData.summary?.insight}
                    </span>
                    <span className="text-xs font-bold text-claude-surface/60">
                      Annual Volatility: {((mcData.summary?.annualized_volatility || 0) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Fan Path Chart */}
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={mcData.timeline || []}>
                        <XAxis dataKey="day" label={{ value: 'Days Forward', position: 'insideBottom', offset: -5 }} stroke="#1E1915" opacity={0.4} fontSize={11} />
                        <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="p95" name="95th Percentile (Upper)" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                        <Line type="monotone" dataKey="p75" name="75th Percentile" stroke="#3B82F6" strokeWidth={1} dot={false} />
                        <Line type="monotone" dataKey="p50_median" name="50th Percentile (Median Path)" stroke="#EA580C" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="p25" name="25th Percentile" stroke="#3B82F6" strokeWidth={1} dot={false} />
                        <Line type="monotone" dataKey="p5" name="5th Percentile (Lower)" stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">Last Known Price</span>
                    <div className="text-2xl font-black text-claude-surface mt-1">${mcData.summary?.last_known_price}</div>
                  </div>
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">1-Yr Median Target</span>
                    <div className="text-2xl font-black text-claude-orange mt-1">${mcData.summary?.median_target_1yr}</div>
                  </div>
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">90% Confidence Interval</span>
                    <div className="text-sm font-bold text-emerald-700 mt-1">${mcData.summary?.p5_lower_bound_1yr} - ${mcData.summary?.p95_upper_bound_1yr}</div>
                  </div>
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase">Prob. Positive Return</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{((mcData.summary?.probability_positive_return || 0) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: VALUE AT RISK (VaR)                           */}
        {/* ---------------------------------------------------- */}
        {activeTab === "var_risk" && (
          <div className="space-y-6">
            <div className="pro-card p-6 border-l-4 border-l-claude-orange">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <Activity className="w-5 h-5 text-claude-orange" />
                    Value at Risk (VaR) & Conditional VaR (CVaR / Expected Shortfall)
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-1">
                    Compares Historical, Parametric (Normal), and Monte Carlo 1-day maximum expected loss at 95% and 99% confidence.
                  </p>
                </div>
                <button onClick={handleRunVaR} disabled={varLoading} className="pro-btn-primary">
                  {varLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>Calculate Risk</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-claude-cream/60 p-4 rounded-xl border border-claude-amber/20">
                <div>
                  <label className="text-xs font-bold text-claude-surface/70">Asset</label>
                  <select value={varAsset} onChange={(e) => setVarAsset(e.target.value)} className="pro-input mt-1">
                    <option value="BTC-USD">Bitcoin (BTC-USD)</option>
                    <option value="GC=F">Gold (GC=F)</option>
                    <option value="NVDA">NVIDIA (NVDA)</option>
                    <option value="SPY">S&P 500 (SPY)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-claude-surface/70">Portfolio Capital ($)</label>
                  <input type="number" value={varCap} onChange={(e) => setVarCap(Number(e.target.value))} className="pro-input mt-1" />
                </div>
              </div>
            </div>

            {varData && (
              <div className="space-y-6">
                <div className="pro-card p-6 bg-amber-50/50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-claude-orange shrink-0 mt-0.5" />
                    <p className="text-xs text-claude-surface/80 leading-relaxed font-medium">
                      {varData.plain_english}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Historical VaR */}
                  <div className="pro-card p-6 border-t-4 border-t-blue-500">
                    <h4 className="font-bold text-sm text-claude-surface mb-4">Historical VaR (Non-Parametric)</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 95% VaR:</span>
                        <span className="font-black text-rose-600">${varData.historical?.var_95_usd} ({varData.historical?.var_95_pct}%)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 95% CVaR (Expected Loss):</span>
                        <span className="font-black text-rose-700">${varData.historical?.cvar_95_usd}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 99% VaR:</span>
                        <span className="font-black text-rose-800">${varData.historical?.var_99_usd} ({varData.historical?.var_99_pct}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Parametric VaR */}
                  <div className="pro-card p-6 border-t-4 border-t-amber-500">
                    <h4 className="font-bold text-sm text-claude-surface mb-4">Parametric VaR (Gaussian Normal)</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 95% VaR:</span>
                        <span className="font-black text-rose-600">${varData.parametric?.var_95_usd} ({varData.parametric?.var_95_pct}%)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 95% CVaR (Expected Loss):</span>
                        <span className="font-black text-rose-700">${varData.parametric?.cvar_95_usd}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 99% VaR:</span>
                        <span className="font-black text-rose-800">${varData.parametric?.var_99_usd} ({varData.parametric?.var_99_pct}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Monte Carlo VaR */}
                  <div className="pro-card p-6 border-t-4 border-t-emerald-500">
                    <h4 className="font-bold text-sm text-claude-surface mb-4">Monte Carlo VaR (10k Draws)</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 95% VaR:</span>
                        <span className="font-black text-rose-600">${varData.monte_carlo?.var_95_usd} ({varData.monte_carlo?.var_95_pct}%)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 95% CVaR (Expected Loss):</span>
                        <span className="font-black text-rose-700">${varData.monte_carlo?.cvar_95_usd}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-claude-cream rounded-lg">
                        <span className="text-claude-surface/70">1-Day 99% VaR:</span>
                        <span className="font-black text-rose-800">${varData.monte_carlo?.var_99_usd} ({varData.monte_carlo?.var_99_pct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CLASSIC PARAMETER PLAYGROUND & AUDIT          */}
        {/* ---------------------------------------------------- */}
        {activeTab === "classic_lab" && (
          <div className="space-y-8">
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
              <div 
                className="fixed inset-0 z-50 bg-claude-surface/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
                onClick={() => setShowSpecModal(false)}
              >
                <div 
                  className="pro-card max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col bg-white border border-claude-amber/30 rounded-2xl animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-claude-amber/20 pb-3 shrink-0">
                    <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Confirm Parsed Pydantic Strategy Spec
                    </h3>
                    <button 
                      onClick={() => setShowSpecModal(false)} 
                      className="text-claude-surface/50 hover:text-claude-surface p-1 rounded-lg hover:bg-claude-cream transition-colors text-xl font-bold leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <div className="bg-claude-cream p-4 rounded-xl border border-claude-amber/20 font-mono text-xs overflow-y-auto overflow-x-auto max-h-[50vh] shrink">
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(spec, null, 2)}</pre>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 shrink-0 border-t border-claude-amber/10">
                    <button onClick={() => setShowSpecModal(false)} className="pro-btn-secondary">Cancel</button>
                    <button onClick={() => executeRun(spec)} className="pro-btn-primary">Confirm & Execute Node Pipeline</button>
                  </div>
                </div>
              </div>
            )}

            {/* 10-Node Workflow Progress */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-claude-surface tracking-wide uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-claude-orange" />
                  10-Node Workflow Pipeline Visualizer
                </h3>
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
                        {isDone ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : isCurrent ? <RefreshCw className="w-3 h-3 animate-spin text-claude-orange" /> : null}
                      </div>
                      <div className="font-semibold truncate">{stageName}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parameter Playground */}
            <div className="pro-card p-6 border-l-4 border-l-claude-amber">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-claude-surface flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-claude-orange" />
                    Sub-Second Parameter Playground
                  </h3>
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
                  <input type="range" min="5" max="50" value={fastPeriod} onChange={(e) => handleSliderChange(parseInt(e.target.value), slowPeriod)} className="w-full accent-claude-orange cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-claude-surface mb-1">
                    <span>Slow Moving Average Period</span>
                    <span>{slowPeriod} Days</span>
                  </div>
                  <input type="range" min="20" max="200" value={slowPeriod} onChange={(e) => handleSliderChange(fastPeriod, parseInt(e.target.value))} className="w-full accent-claude-orange cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Performance Results */}
            {runData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">Dev Sharpe Ratio</span>
                    <div className="text-2xl font-black text-claude-surface mt-1">{runData.metrics.sharpe_ratio.toFixed(2)}</div>
                  </div>
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">95% Bootstrap CI</span>
                    <div className="text-lg font-bold text-claude-orange mt-1">
                      [{runData.bootstrap_ci?.ci_lower?.toFixed(2) ?? runData.metrics?.sharpe_ci_lower?.toFixed(2) ?? "0.00"}, {runData.bootstrap_ci?.ci_upper?.toFixed(2) ?? runData.metrics?.sharpe_ci_upper?.toFixed(2) ?? "0.00"}]
                    </div>
                  </div>
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">Max Drawdown</span>
                    <div className="text-2xl font-black text-rose-600 mt-1">{((runData.metrics?.max_drawdown ?? 0) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="pro-card p-5">
                    <span className="text-xs font-bold text-claude-surface/60 uppercase tracking-wider">Phase 1 Verdict</span>
                    <div className="text-xl font-extrabold text-emerald-600 mt-1">
                      {runData.verdict?.outcome ?? (typeof runData.verdict === "string" ? runData.verdict : "PROVISIONAL_PASS")}
                    </div>
                  </div>
                </div>

                <div className="pro-card p-6">
                  <h3 className="font-bold text-base text-claude-surface mb-4">Strategy Equity Curve vs. Benchmarks</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={runData.equity_curve || []}>
                        <XAxis dataKey="date" stroke="#1E1915" opacity={0.4} fontSize={11} />
                        <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                        <Line type="monotone" dataKey="portfolio_value" name="Strategy Equity ($)" stroke="#EA580C" strokeWidth={2.5} dot={false} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
