"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  Sparkles,
  ShieldCheck,
  LineChart as LucideLineChart,
  Sliders,
  Award,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  User,
} from "lucide-react";

// Mock financial dataset for Panel 1 (Interactive Stock Chart)
const ASSET_SERIES: Record<string, { price: string; change: string; isPositive: boolean; points: { x: number; price: number; sma20: number; sma50: number }[] }> = {
  NVDA: {
    price: "121.65",
    change: "-0.78%",
    isPositive: false,
    points: [
      { x: 0, price: 92.4, sma20: 89.2, sma50: 86.1 },
      { x: 1, price: 95.1, sma20: 90.4, sma50: 87.0 },
      { x: 2, price: 98.8, sma20: 92.1, sma50: 88.2 },
      { x: 3, price: 96.2, sma20: 93.3, sma50: 89.1 },
      { x: 4, price: 104.5, sma20: 96.0, sma50: 90.5 },
      { x: 5, price: 108.2, sma20: 99.2, sma50: 92.4 },
      { x: 6, price: 105.7, sma20: 101.4, sma50: 94.1 },
      { x: 7, price: 114.9, sma20: 105.0, sma50: 96.8 },
      { x: 8, price: 118.4, sma20: 108.8, sma50: 99.5 },
      { x: 9, price: 115.6, sma20: 111.2, sma50: 102.1 },
      { x: 10, price: 124.8, sma20: 114.7, sma50: 105.4 },
      { x: 11, price: 129.2, sma20: 118.3, sma50: 109.0 },
      { x: 12, price: 121.65, sma20: 120.1, sma50: 112.5 },
    ],
  },
  BTC: {
    price: "63,450.00",
    change: "+1.85%",
    isPositive: true,
    points: [
      { x: 0, price: 54200, sma20: 53100, sma50: 51200 },
      { x: 1, price: 56800, sma20: 54000, sma50: 52100 },
      { x: 2, price: 58200, sma20: 55400, sma50: 53000 },
      { x: 3, price: 57400, sma20: 56200, sma50: 54100 },
      { x: 4, price: 59900, sma20: 57300, sma50: 55200 },
      { x: 5, price: 61500, sma20: 58800, sma50: 56400 },
      { x: 6, price: 60200, sma20: 59600, sma50: 57500 },
      { x: 7, price: 62800, sma20: 60800, sma50: 58900 },
      { x: 8, price: 64100, sma20: 61900, sma50: 60100 },
      { x: 9, price: 62900, sma20: 62400, sma50: 61000 },
      { x: 10, price: 64500, sma20: 63100, sma50: 61800 },
      { x: 11, price: 65200, sma20: 63800, sma50: 62400 },
      { x: 12, price: 63450, sma20: 63700, sma50: 62900 },
    ],
  },
  SPX: {
    price: "5,842.10",
    change: "+0.30%",
    isPositive: true,
    points: [
      { x: 0, price: 5120, sma20: 5080, sma50: 4990 },
      { x: 1, price: 5210, sma20: 5130, sma50: 5040 },
      { x: 2, price: 5290, sma20: 5180, sma50: 5090 },
      { x: 3, price: 5260, sma20: 5210, sma50: 5130 },
      { x: 4, price: 5380, sma20: 5270, sma50: 5190 },
      { x: 5, price: 5460, sma20: 5330, sma50: 5240 },
      { x: 6, price: 5410, sma20: 5370, sma50: 5290 },
      { x: 7, price: 5540, sma20: 5430, sma50: 5350 },
      { x: 8, price: 5620, sma20: 5490, sma50: 5410 },
      { x: 9, price: 5590, sma20: 5540, sma50: 5460 },
      { x: 10, price: 5720, sma20: 5610, sma50: 5520 },
      { x: 11, price: 5810, sma20: 5690, sma50: 5590 },
      { x: 12, price: 5842.1, sma20: 5740, sma50: 5650 },
    ],
  },
};

// Panel 2: 500-Iteration Bootstrap Equity Fan Points
const BOOTSTRAP_POINTS = [
  { t: 0, median: 1.0, lower: 1.0, upper: 1.0 },
  { t: 50, median: 1.6, lower: 1.2, upper: 2.1 },
  { t: 100, median: 2.3, lower: 1.5, upper: 3.2 },
  { t: 150, median: 3.1, lower: 1.9, upper: 4.4 },
  { t: 200, median: 4.2, lower: 2.4, upper: 5.9 },
  { t: 250, median: 5.4, lower: 3.0, upper: 7.6 },
  { t: 300, median: 6.8, lower: 3.7, upper: 9.5 },
  { t: 350, median: 8.3, lower: 4.5, upper: 11.6 },
  { t: 400, median: 10.1, lower: 5.4, upper: 13.9 },
  { t: 450, median: 12.0, lower: 6.3, upper: 16.5 },
  { t: 500, median: 14.2, lower: 7.2, upper: 19.4 },
];

// Panel 3: Real-Time Cross-Asset Tickers with Mini Sparklines
const TICKER_CARDS = [
  {
    symbol: "SPX",
    name: "S&P 500 Index",
    price: "5,842.10",
    changePct: "+0.30%",
    isPositive: true,
    sparkline: [40, 42, 41, 45, 47, 46, 50, 52, 54, 53, 56, 58],
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    price: "121.65",
    changePct: "-0.78%",
    isPositive: false,
    sparkline: [58, 56, 57, 54, 55, 52, 53, 50, 49, 51, 48, 46],
  },
  {
    symbol: "GLD",
    name: "Gold Spot",
    price: "$2,654.20",
    changePct: "+0.45%",
    isPositive: true,
    sparkline: [30, 31, 33, 32, 35, 37, 36, 39, 41, 43, 44, 46],
  },
  {
    symbol: "BTC",
    name: "Bitcoin / USD",
    price: "$63,450.00",
    changePct: "+1.85%",
    isPositive: true,
    sparkline: [25, 27, 26, 30, 34, 32, 38, 42, 40, 45, 49, 52],
  },
];

export default function HomePage() {
  const router = useRouter();

  // Command Center & Auth States
  const [selectedAsset, setSelectedAsset] = useState<"NVDA" | "BTC" | "SPX">("NVDA");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1D" | "1M" | "1Y" | "ALL">("1Y");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fintech_os_auth_user");
      if (stored) setAuthUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    const handleRequireAuth = (e: any) => {
      setAuthModalOpen(true);
      if (e.detail?.targetHref) {
        setPendingNavHref(e.detail.targetHref);
      }
    };
    window.addEventListener("require-auth", handleRequireAuth);
    return () => window.removeEventListener("require-auth", handleRequireAuth);
  }, []);

  const handleAuthSuccess = (token: string, user: any) => {
    localStorage.setItem("fintech_os_auth_token", token);
    localStorage.setItem("fintech_os_auth_user", JSON.stringify(user));
    setAuthUser(user);
    if (pendingNavHref) {
      const target = pendingNavHref;
      setPendingNavHref(null);
      router.push(target);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fintech_os_auth_token");
    localStorage.removeItem("fintech_os_auth_user");
    setAuthUser(null);
    setAuthModalOpen(false);
    setPendingNavHref(null);
  };

  const handleProtectedNav = (e: React.MouseEvent, href: string) => {
    try {
      const token = localStorage.getItem("fintech_os_auth_token");
      if (!token) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("require-auth", { detail: { targetHref: href } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SVG Scalers for Panel 1 (Stock Chart)
  const currentAssetData = ASSET_SERIES[selectedAsset] || ASSET_SERIES.NVDA;
  const chartWidth = 360;
  const chartHeight = 160;
  const chartPadding = { top: 15, right: 15, bottom: 25, left: 10 };

  const { chartPath, sma20Path, sma50Path, scaledPoints } = useMemo(() => {
    const pts = currentAssetData.points;
    const allVals = pts.flatMap((p) => [p.price, p.sma20, p.sma50]);
    const min = Math.min(...allVals) * 0.98;
    const max = Math.max(...allVals) * 1.02;
    const innerW = chartWidth - chartPadding.left - chartPadding.right;
    const innerH = chartHeight - chartPadding.top - chartPadding.bottom;

    const scaled = pts.map((p, i) => {
      const x = chartPadding.left + (i / (pts.length - 1)) * innerW;
      const yPrice = chartPadding.top + (1 - (p.price - min) / (max - min)) * innerH;
      const ySma20 = chartPadding.top + (1 - (p.sma20 - min) / (max - min)) * innerH;
      const ySma50 = chartPadding.top + (1 - (p.sma50 - min) / (max - min)) * innerH;
      return { ...p, x, yPrice, ySma20, ySma50 };
    });

    const cPath = scaled.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.yPrice}` : `${acc} L ${p.x},${p.yPrice}`), "");
    const s20Path = scaled.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.ySma20}` : `${acc} L ${p.x},${p.ySma20}`), "");
    const s50Path = scaled.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.ySma50}` : `${acc} L ${p.x},${p.ySma50}`), "");

    return { chartPath: cPath, sma20Path: s20Path, sma50Path: s50Path, scaledPoints: scaled };
  }, [currentAssetData]);

  // SVG Scalers for Panel 2 (Bootstrap Fan)
  const fanWidth = 360;
  const fanHeight = 160;
  const fanPadding = { top: 15, right: 15, bottom: 25, left: 25 };

  const { medianPath, areaPath } = useMemo(() => {
    const innerW = fanWidth - fanPadding.left - fanPadding.right;
    const innerH = fanHeight - fanPadding.top - fanPadding.bottom;
    const maxVal = 22;

    const scaled = BOOTSTRAP_POINTS.map((p, i) => {
      const x = fanPadding.left + (i / (BOOTSTRAP_POINTS.length - 1)) * innerW;
      const yMedian = fanPadding.top + (1 - p.median / maxVal) * innerH;
      const yUpper = fanPadding.top + (1 - p.upper / maxVal) * innerH;
      const yLower = fanPadding.top + (1 - p.lower / maxVal) * innerH;
      return { ...p, x, yMedian, yUpper, yLower };
    });

    const mPath = scaled.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.yMedian}` : `${acc} L ${p.x},${p.yMedian}`), "");

    // Fan Polygon (upper forward, lower backward)
    const upperLine = scaled.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.yUpper}`).join(" ");
    const lowerLine = [...scaled].reverse().map((p) => `L ${p.x},${p.yLower}`).join(" ");
    const fArea = `${upperLine} ${lowerLine} Z`;

    return { medianPath: mPath, areaPath: fArea };
  }, []);

  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION: CONCEPT 2 (THE INTERACTIVE STRATEGY CANVAS)                */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange text-xs font-bold tracking-wide mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NEXT-GEN AGENTIC QUANT RESEARCH ENGINE</span>
        </div>

        {/* High-Impact Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-claude-surface tracking-tight leading-tight max-w-4xl mx-auto mb-4">
          Hypothesis-Driven Quant Research &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-claude-amber via-claude-orange to-amber-700">
            Overfitting Audit Engine
          </span>
        </h1>

        <p className="text-sm sm:text-base text-claude-surface/70 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Enterprise quantitative research validated by cryptographic holdout vaults, 
          500-iteration stationary block bootstraps, and write-ahead SHA-256 trial ledgers.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Link
            href="/research"
            onClick={(e) => handleProtectedNav(e, "/research")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-claude-amber to-claude-orange text-white font-bold text-sm shadow-sm hover:brightness-105 hover:shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Research Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <button
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-amber-300 text-amber-950 font-extrabold text-sm hover:border-amber-500 hover:bg-amber-50/70 shadow-sm transition-all cursor-pointer group"
          >
            <User className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>{authUser ? `Account: ${authUser.full_name || authUser.email}` : "Sign In / Sample Account"}</span>
          </button>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 3-PANEL INSTITUTIONAL COMMAND CENTER                                  */}
        {/* --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto text-left mt-8 mb-12">
          {/* PANEL 1: Market Technical Chart */}
          <div className="bg-white rounded-2xl border border-claude-amber/30 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Header: Asset Picker & Current Price */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-mono font-bold">
                  {(["NVDA", "BTC", "SPX"] as const).map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setSelectedAsset(sym)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        selectedAsset === sym
                          ? "bg-white text-claude-orange shadow-xs font-black"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                <div className="text-right font-mono">
                  <span className="text-sm font-black text-gray-900">${currentAssetData.price}</span>
                  <span
                    className={`text-xs font-bold ml-1.5 ${
                      currentAssetData.isPositive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {currentAssetData.change}
                  </span>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center justify-between py-2 text-[11px] font-mono text-gray-500">
                <span className="text-xs font-bold text-gray-800">Interactive Technicals</span>
                <div className="flex items-center gap-1">
                  {(["1D", "1M", "1Y", "ALL"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        selectedTimeframe === tf
                          ? "bg-claude-orange text-white font-bold"
                          : "hover:text-black"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* SVG Stock Chart with SMA Overlays */}
              <div className="w-full h-40 relative my-1">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                  {/* Grid Lines */}
                  {[35, 75, 115].map((y, i) => (
                    <line
                      key={i}
                      x1={chartPadding.left}
                      y1={y}
                      x2={chartWidth - chartPadding.right}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeDasharray="2 2"
                    />
                  ))}

                  {/* SMA 50 Line */}
                  <path d={sma50Path} fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 2" />

                  {/* SMA 20 Line */}
                  <path d={sma20Path} fill="none" stroke="#EA580C" strokeWidth="1.8" />

                  {/* Price Line */}
                  <path d={chartPath} fill="none" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Current Active Dot */}
                  {scaledPoints.length > 0 && (
                    <circle
                      cx={scaledPoints[scaledPoints.length - 1].x}
                      cy={scaledPoints[scaledPoints.length - 1].yPrice}
                      r="4"
                      fill="#EA580C"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Footer Legend */}
            <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-gray-100 text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-gray-900" /> Close
                </span>
                <span className="flex items-center gap-1 text-claude-orange font-semibold">
                  <span className="w-2 h-2 rounded-full bg-claude-orange" /> SMA 20
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> SMA 50
                </span>
              </div>
              <span className="text-claude-orange font-bold">
                Live Technicals
              </span>
            </div>
          </div>

          {/* PANEL 2: 500-Iteration Bootstrap Equity Fan */}
          <div className="bg-white rounded-2xl border border-claude-amber/30 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-claude-orange rounded-full" />
                    <span>Equity Curve (500 Bootstraps)</span>
                  </h3>
                  <span className="text-[10.5px] text-gray-500 font-mono">Statistical Confidence Fan</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-mono font-bold text-amber-800">
                  95% C.I.
                </span>
              </div>

              {/* Fan Graph SVG */}
              <div className="w-full h-44 relative my-2">
                <svg viewBox={`0 0 ${fanWidth} ${fanHeight}`} className="w-full h-full">
                  <defs>
                    <linearGradient id="fanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[35, 75, 115].map((y, i) => (
                    <line
                      key={i}
                      x1={fanPadding.left}
                      y1={y}
                      x2={fanWidth - fanPadding.right}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeDasharray="2 2"
                    />
                  ))}

                  {/* Shaded 95% Confidence Band Polygon */}
                  <path d={areaPath} fill="url(#fanGrad)" />

                  {/* Median Equity Curve */}
                  <path d={medianPath} fill="none" stroke="#EA580C" strokeWidth="2.4" strokeLinecap="round" />

                  {/* Baseline Buy & Hold reference */}
                  <line
                    x1={fanPadding.left}
                    y1={fanHeight - fanPadding.bottom - 10}
                    x2={fanWidth - fanPadding.right}
                    y2={fanPadding.top + 60}
                    stroke="#9CA3AF"
                    strokeDasharray="3 3"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom Audit Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] uppercase text-gray-500 font-bold">Sharpe</div>
                <div className="text-sm font-black text-gray-900">2.14</div>
              </div>
              <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[10px] uppercase text-gray-500 font-bold">DSR</div>
                <div className="text-sm font-black text-claude-orange">0.96</div>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] uppercase text-emerald-700 font-bold">Overfit Risk</div>
                <div className="text-xs font-black text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LOW</span>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 3: Real-Time Cross-Asset Ticker Cards */}
          <div className="bg-white rounded-2xl border border-claude-amber/30 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-claude-amber rounded-full" />
                  <span>Cross-Asset Tickers</span>
                </h3>
                <span className="text-xs font-bold text-claude-orange font-mono">
                  Live Feeds
                </span>
              </div>

              {/* 4 Stacked Ticker Rows with Mini Sparklines */}
              <div className="space-y-2.5 my-2">
                {TICKER_CARDS.map((card) => {
                  const min = Math.min(...card.sparkline);
                  const max = Math.max(...card.sparkline);
                  const spread = max - min || 1;
                  const sparkWidth = 64;
                  const sparkHeight = 22;

                  const sPath = card.sparkline
                    .map((p, i) => {
                      const x = (i / (card.sparkline.length - 1)) * sparkWidth;
                      const y = sparkHeight - ((p - min) / spread) * (sparkHeight - 4) - 2;
                      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ");

                  return (
                    <div
                      key={card.symbol}
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 border border-gray-100 transition-all"
                    >
                      <div>
                        <div className="text-xs font-black text-gray-900">
                          {card.symbol}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono truncate max-w-[90px]">
                          {card.name}
                        </div>
                      </div>

                      {/* Mini SVG Sparkline */}
                      <div className="w-16 h-6 shrink-0 flex items-center justify-center">
                        <svg width={sparkWidth} height={sparkHeight} className="overflow-visible">
                          <path
                            d={sPath}
                            fill="none"
                            stroke={card.isPositive ? "#16A34A" : "#DC2626"}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* Price & Change */}
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-gray-900">{card.price}</div>
                        <div
                          className={`text-[10.5px] font-bold ${
                            card.isPositive ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {card.changePct}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Launch */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Feeds Synchronized</span>
              </span>
              <span className="text-claude-orange font-bold font-mono text-xs">
                Active Engine
              </span>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* STAT RIGOR CARDS (FEATURES)                                           */}
        {/* --------------------------------------------------------------------- */}
        <div id="features" className="scroll-mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left max-w-7xl mx-auto">
          <div className="pro-card p-6 border-l-4 border-l-claude-amber hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60 font-mono">Data Protection</span>
              <Lock className="w-5 h-5 text-claude-orange" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1 font-mono">30% Holdout Vault</div>
            <p className="text-xs text-claude-surface/70 leading-relaxed">Cryptographically isolated dataset inaccessible to optimization routines.</p>
          </div>

          <div className="pro-card p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60 font-mono">Statistical Rigor</span>
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1 font-mono">500 Bootstraps</div>
            <p className="text-xs text-claude-surface/70 leading-relaxed">Stationary Block Bootstrap CIs to detect lucky random backtest anomalies.</p>
          </div>

          <div className="pro-card p-6 border-l-4 border-l-indigo-500 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60 font-mono">Ledger Security</span>
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1 font-mono">SHA-256 Ledger</div>
            <p className="text-xs text-claude-surface/70 leading-relaxed">Tamper-evident write-ahead trial history preventing post-hoc data snooping.</p>
          </div>

          <div className="pro-card p-6 border-l-4 border-l-amber-500 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-claude-surface/60 font-mono">False Positives</span>
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-claude-surface mb-1 font-mono">&lt; 5% FDR Target</div>
            <p className="text-xs text-claude-surface/70 leading-relaxed">Empirically calibrated against 1,000 null universe strategies.</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6 PLATFORM SCREENS OVERVIEW SECTION                                       */}
      {/* ========================================================================= */}
      <section id="platform" className="scroll-mt-24 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange text-xs font-bold tracking-wide mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>FULL INSTITUTIONAL SUITE</span>
          </div>
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
          <div className="pro-card p-8 hover:-translate-y-1 hover:border-claude-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-claude-amber/10 border border-claude-amber/30 text-claude-orange flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-claude-orange tracking-wider uppercase mb-1 block font-mono">Screen 1</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Research Lab Canvas</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Type strategy prompts in plain English. Review Pydantic confirmation specs, observe 10-node workflow progress, and inspect equity curves against Buy & Hold and Null baselines.
              </p>
            </div>
            <Link href="/research" onClick={(e) => handleProtectedNav(e, "/research")} className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Open Research Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 2: Assets & Indicators */}
          <div className="pro-card p-8 hover:-translate-y-1 hover:border-claude-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-6">
                <LucideLineChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 block font-mono">Screen 2</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Assets & Indicators</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Inspect raw OHLCV price series for GLD, BTC, NVDA, SPY, and more. Overlay technical indicators (SMA, EMA, RSI, Bollinger) and analyze weekly asset correlation matrices.
              </p>
            </div>
            <Link href="/assets" onClick={(e) => handleProtectedNav(e, "/assets")} className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Inspect Assets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 3: Robustness & Regimes */}
          <div className="pro-card p-8 hover:-translate-y-1 hover:border-claude-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-1 block font-mono">Screen 3</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Robustness & Regimes</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Evaluate 3x3 parameter neighborhood heatmaps to catch fragile sharp peaks. Stress-test strategies across commission fee ladders (0-20 bps) and 2x2 market regimes.
              </p>
            </div>
            <Link href="/robustness" onClick={(e) => handleProtectedNav(e, "/robustness")} className="pro-btn-secondary w-full text-xs py-2.5">
              <span>View Robustness</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 4: Audit Center */}
          <div className="pro-card p-8 hover:-translate-y-1 hover:border-claude-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-1 block font-mono">Screen 4</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Audit Center</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Review un-editable SHA-256 trial logs, Deflated Sharpe Ratio (DSR), Probability of Backtest Overfitting (PBO), AI Skeptic Agent critiques, and download SR 11-7 model reports.
              </p>
            </div>
            <Link href="/audit" onClick={(e) => handleProtectedNav(e, "/audit")} className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Audit Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 5: Calibration & Placebo */}
          <div className="pro-card p-8 hover:-translate-y-1 hover:border-claude-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 tracking-wider uppercase mb-1 block font-mono">Screen 5</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Calibration & Live Placebo</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Benchmark strategies against 1,000 empirical null universes. Run live judge-seed placebo tests to prove zero false positives on random data.
              </p>
            </div>
            <Link href="/calibration" onClick={(e) => handleProtectedNav(e, "/calibration")} className="pro-btn-secondary w-full text-xs py-2.5">
              <span>Test Calibration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Screen 6: Holdout Vault Architecture */}
          <div className="pro-card p-8 hover:-translate-y-1 hover:border-claude-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 tracking-wider uppercase mb-1 block font-mono">Vault Architecture</span>
              <h3 className="text-xl font-bold text-claude-surface mb-3">Holdout Data Vault</h3>
              <p className="text-sm text-claude-surface/70 mb-6 leading-relaxed">
                Learn how atomic 2-phase holdout separation locks out data-peeking. Unlocks only after passing Phase 1 Dev metrics and pre-registering hashes.
              </p>
            </div>
            <Link href="/research" onClick={(e) => handleProtectedNav(e, "/research")} className="pro-btn-dark w-full text-xs py-2.5">
              <span>Start Strategy Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10-NODE WORKFLOW PIPELINE (RESOURCES)                                      */}
      {/* ========================================================================= */}
      <section id="resources" className="scroll-mt-24 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-white rounded-3xl border border-claude-amber/20 shadow-sm mb-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-claude-orange tracking-wider uppercase mb-2 block font-mono">System Execution Flow</span>
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
            <div key={item.step} className="p-4 rounded-xl bg-claude-cream/60 border border-claude-amber/20 hover:border-claude-orange hover:bg-white transition-all">
              <span className="text-xs font-black text-claude-orange font-mono">{item.step}</span>
              <h4 className="font-bold text-xs text-claude-surface mt-1 mb-1">{item.title}</h4>
              <p className="text-[11px] text-claude-surface/70 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="mt-auto py-8 px-4 border-t border-claude-amber/20 text-center text-xs text-claude-surface/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-claude-surface">QUANT FINTECH AGENT OS</span>
            <span>— Validation-First Quantitative Research Engine</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/research" onClick={(e) => handleProtectedNav(e, "/research")} className="hover:text-claude-orange transition-colors">Research</Link>
            <Link href="/assets" onClick={(e) => handleProtectedNav(e, "/assets")} className="hover:text-claude-orange transition-colors">Assets</Link>
            <Link href="/robustness" onClick={(e) => handleProtectedNav(e, "/robustness")} className="hover:text-claude-orange transition-colors">Robustness</Link>
            <Link href="/audit" onClick={(e) => handleProtectedNav(e, "/audit")} className="hover:text-claude-orange transition-colors">Audit</Link>
            <Link href="/calibration" onClick={(e) => handleProtectedNav(e, "/calibration")} className="hover:text-claude-orange transition-colors">Calibration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

