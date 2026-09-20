"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MarketsBoard } from "@/components/markets/MarketsBoard";
import { BloombergChart } from "@/components/markets/BloombergChart";
import { MarketsAtAGlance } from "@/components/markets/MarketsAtAGlance";
import { RelatedNewsGrid } from "@/components/markets/RelatedNewsGrid";
import { AssetInfoSection } from "@/components/markets/AssetInfoSection";
import {
  getSecurity,
  SECURITIES_DATABASE,
  TOP_SECURITIES_LIST,
  RECENTLY_VIEWED,
  SecurityData,
} from "@/lib/marketsData";
import {
  LineChart as LucideLineChart,
  AlertCircle,
  Search,
  Check,
  Plus,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Terminal,
  LayoutGrid,
} from "lucide-react";

function AssetsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected security: if symbol is in query params, use it; otherwise default to null (shows the MarketsBoard)
  const paramSymbol = searchParams.get("symbol");
  const [selectedSecuritySymbol, setSelectedSecuritySymbol] = useState<string | null>(paramSymbol);

  // Bloomberg module detail states
  const [activeTab, setActiveTab] = useState<"Summary" | "Related News" | "Index Info">("Summary");
  const [activeTimeframe, setActiveTimeframe] = useState<"1D" | "1M" | "6M" | "YTD" | "1Y" | "5Y">("1D");
  const [showNewsMarkers, setShowNewsMarkers] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync with URL parameter
  useEffect(() => {
    const sym = searchParams.get("symbol");
    setSelectedSecuritySymbol(sym || null);
  }, [searchParams]);

  // Security mapping for Bloomberg market module
  const securitySymbol = useMemo(() => {
    if (!selectedSecuritySymbol) return null;
    const clean = selectedSecuritySymbol.toUpperCase().replace("-USD", "");
    if (clean === "SPY") return "SPX";
    if (SECURITIES_DATABASE[clean]) return clean;
    return "NVDA";
  }, [selectedSecuritySymbol]);

  const security: SecurityData | null = useMemo(() => {
    if (!securitySymbol) return null;
    return getSecurity(securitySymbol);
  }, [securitySymbol]);

  const isPositive = security ? security.changeDollar >= 0 : true;

  // Handle clicking a security (switches to detail view)
  const handleSelectSecurity = (sym: string) => {
    setSelectedSecuritySymbol(sym);
    router.push(`/assets?symbol=${sym}`, { scroll: false });
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Back to overview board handler
  const handleBackToOverview = () => {
    setSelectedSecuritySymbol(null);
    router.push(`/assets`, { scroll: false });
  };

  // Copy share link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  // Search filter list
  const filteredSecurities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.values(SECURITIES_DATABASE).filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.symbol.toLowerCase().includes(q) ||
        s.tickerCode.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);


  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide mb-2">
              <LucideLineChart className="w-3.5 h-3.5" />
              <span>SCREEN 2: ASSETS & INDICATORS</span>
            </div>
            <h1 className="text-3xl font-extrabold text-claude-surface tracking-tight">
              Asset Price Series & Indicator Studio
            </h1>
            <p className="text-sm text-claude-surface/70 mt-1">
              Live Bloomberg market data, technical indicators, drawdowns, and cross-asset correlations.
            </p>
          </div>

          {/* If inside detail view, provide a fast back button */}
          {security && (
            <button
              onClick={handleBackToOverview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-claude-amber/10 to-claude-orange/10 hover:from-claude-amber/20 hover:to-claude-orange/20 border border-claude-orange/30 hover:border-claude-orange text-xs font-bold text-claude-orange shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-claude-orange" />
              <span>Back to Markets Overview</span>
            </button>
          )}
        </div>

        {/* Dev-Only Data Banner */}
        <div className="pro-card p-5 bg-amber-50/80 border-l-4 border-l-amber-500 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              DATA BOUNDARY SAFETY GUARD: DEV DATA ONLY (t ≤ 2023-12-31)
            </h3>
            <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
              Data displayed below covers the development partition (70%). The final 24 months are cryptographically isolated in the Holdout Vault to prevent data-peeking.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: MARKETS BOARD (Default state: Data categories + Top Securities grid) */}
        {/* ========================================================================= */}
        {!security ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-600" />
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Global Markets & Securities Directory
                </h2>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                Click any asset below to view its complete Bloomberg charts & statistics
              </span>
            </div>

            {/* The white Bloomberg Market Board */}
            <MarketsBoard onSelectSecurity={handleSelectSecurity} />
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: SECURITY DETAIL SUITE (Shown when user clicks ANY stock / asset)   */
          /* ========================================================================= */
          <div className="bg-white rounded-2xl border border-claude-amber/25 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation & Breadcrumb with Back Link */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-claude-orange transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-claude-orange" />
                  <span>All Securities</span>
                </button>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span onClick={handleBackToOverview} className="hover:text-claude-orange cursor-pointer transition-colors">
                    Markets
                  </span>
                  <span>|</span>
                  <span className="text-gray-900 font-bold">Data</span>
                  <span>|</span>
                  <span className="text-claude-orange font-mono font-bold uppercase">{security.symbol}</span>
                </div>
              </div>

              {/* Quick Quote Search Box with Autocomplete */}
              <div className="relative w-full sm:w-72">
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-claude-orange/30 focus-within:border-claude-orange transition-all">
                  <Search className="w-3.5 h-3.5 text-claude-orange mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for quotes (e.g. NVDA, BTC, Gold)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full text-xs text-gray-900 outline-none placeholder:text-gray-400 font-sans"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {isSearchOpen && filteredSecurities.length > 0 && (
                  <div className="absolute top-full right-0 w-full sm:w-80 bg-white border border-claude-amber/30 shadow-xl rounded-xl mt-1 z-50 max-h-64 overflow-y-auto">
                    {filteredSecurities.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => handleSelectSecurity(item.symbol)}
                        className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-claude-amber/5 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-gray-900">{item.name}</div>
                          <div className="text-[10.5px] font-mono text-claude-orange font-semibold">{item.tickerCode}</div>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <div className="font-bold">${item.price.toLocaleString()}</div>
                          <div
                            className={`text-[11px] font-semibold ${
                              item.changeDollar >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {item.changeDollar >= 0 ? "+" : ""}
                            {item.changePct.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Security Title & Follow Button Header (WhatsApp Image 2) */}
            <div className="pt-2 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight font-sans">
                  {security.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-claude-amber/10 border border-claude-amber/30 text-claude-orange font-mono text-xs font-bold">
                  {security.symbol}
                </span>
                <button
                  onClick={() => setIsFollowing((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 shadow-sm ${
                    isFollowing
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gradient-to-r from-claude-amber to-claude-orange text-white hover:brightness-105 shadow-claude-orange/20"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mb-3">
                <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{security.tickerCode}</span>
                <span>·</span>
                <span>({security.currency})</span>
                <span>·</span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">{security.marketStatus}</span>
              </div>

              {/* Big Price & Change */}
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight font-mono">
                  {security.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-base sm:text-lg font-bold font-mono flex items-center gap-1 ${
                    isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  <span>{isPositive ? "▲" : "▼"}</span>
                  <span>
                    {Math.abs(security.changeDollar).toFixed(2)} ({isPositive ? "+" : "-"}
                    {Math.abs(security.changePct).toFixed(2)}%)
                  </span>
                </span>
              </div>

              <div className="text-[11px] text-gray-500 font-mono mt-1">
                {security.timestamp}
              </div>
            </div>

            {/* Tab Navigation: Summary | Related News | Index Info (WhatsApp Image 2) */}
            <div className="flex items-center gap-8 border-b border-gray-200 text-sm font-bold mt-4">
              {(["Summary", "Related News", "Index Info"] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 transition-all relative ${
                      isActive
                        ? "text-claude-orange font-black border-b-[3px] border-claude-orange"
                        : "text-gray-500 hover:text-claude-orange"
                    }`}
                  >
                    {tab === "Index Info" && security.assetType === "Stock"
                      ? "Company Info"
                      : tab === "Index Info" && security.assetType !== "Index"
                      ? "Asset Info"
                      : tab}
                  </button>
                );
              })}
            </div>

            {/* Main 3-Column Bloomberg Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              {/* Left Column (Search, Recently Viewed, Terminal Promo - WhatsApp Images 3, 5) */}
              <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                {/* Secondary Search Box */}
                <div className="hidden sm:block">
                  <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-claude-orange/30 focus-within:border-claude-orange transition-all">
                    <Search className="w-3.5 h-3.5 text-claude-orange mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search for quotes"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      className="w-full text-xs text-gray-900 outline-none placeholder:text-gray-400 font-sans"
                    />
                  </div>
                </div>

                {/* Recently Viewed Widget */}
                <div className="border-t lg:border-t-0 pt-4 lg:pt-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-mono mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-claude-amber rounded-full" />
                    <span>Recently Viewed</span>
                  </h3>

                  <div className="space-y-2">
                    {RECENTLY_VIEWED.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => handleSelectSecurity(item.symbol)}
                        className={`w-full text-left p-2.5 rounded-xl hover:bg-claude-amber/5 transition-all block border ${
                          item.symbol === security.symbol
                            ? "bg-claude-amber/10 border-claude-orange/40 shadow-xs"
                            : "border-transparent hover:border-claude-amber/20"
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono mt-0.5">
                          <span className="text-gray-600 font-medium">{item.price}</span>
                          <span
                            className={`font-semibold ${
                              item.isPositive ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {item.changePct}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Share Icons Toolbar (Image 3) */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-claude-orange flex items-center justify-center text-gray-600 hover:text-claude-orange hover:bg-claude-amber/5 transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${security.name} on Bloomberg Markets`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-claude-orange flex items-center justify-center text-gray-600 hover:text-claude-orange hover:bg-claude-amber/5 transition-colors"
                    title="Share on X"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-claude-orange flex items-center justify-center text-gray-600 hover:text-claude-orange hover:bg-claude-amber/5 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(security.name)}&body=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`)}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-claude-orange flex items-center justify-center text-gray-600 hover:text-claude-orange hover:bg-claude-amber/5 transition-colors"
                    title="Email Quote"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-claude-orange flex items-center justify-center text-gray-600 hover:text-claude-orange hover:bg-claude-amber/5 transition-colors relative"
                    title="Copy Link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>

                  {copiedToast && (
                    <span className="text-[10px] font-bold text-claude-orange animate-in fade-in">
                      Copied!
                    </span>
                  )}
                </div>

                {/* Professional Terminal Promo Card */}
                <div className="bg-gradient-to-br from-[#1b1714] to-[#282018] border border-claude-amber/30 text-white p-4 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-claude-orange font-bold uppercase">
                    <Terminal className="w-3.5 h-3.5 text-claude-amber" />
                    <span>Professional Terminal</span>
                  </div>
                  <p className="text-xs font-bold text-gray-100 leading-snug">
                    Before it's here, it's on the Quant Fintech Terminal
                  </p>
                  <button
                    onClick={() => alert("Connecting to Quant Fintech Terminal Professional Service...")}
                    className="w-full bg-gradient-to-r from-claude-amber to-claude-orange text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5 rounded-lg hover:brightness-110 shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>LEARN MORE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Watchlist Link */}
                <div>
                  <button
                    onClick={() => alert("Your Watchlist contains: " + security.symbol + ", BTC, NVDA, GLD")}
                    className="text-xs font-bold text-claude-orange hover:text-amber-700 flex items-center gap-1.5 group transition-colors"
                  >
                    <span>View Your Watchlist</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Center Column: Interactive Charts, Overviews & Content (Images 2, 3, 4, 5, 6) */}
              <div className="lg:col-span-6 space-y-8 order-1 lg:order-2">
                {activeTab === "Summary" && (
                  <>
                    {/* Summary Toolbar: Timeframes, News Toggle, Add Comparison */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                      {/* Timeframe Pills: 1D, 1M, 6M, YTD, 1Y, 5Y */}
                      <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-0.5 bg-gray-50 text-xs font-mono">
                        {(["1D", "1M", "6M", "YTD", "1Y", "5Y"] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setActiveTimeframe(tf)}
                            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                              activeTimeframe === tf
                                ? "bg-gradient-to-r from-claude-amber to-claude-orange text-white shadow-xs font-black"
                                : "text-gray-600 hover:text-claude-orange"
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        {/* News Toggle Switch (Image 2) */}
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-gray-700">
                          <span>News</span>
                          <div
                            onClick={() => setShowNewsMarkers((prev) => !prev)}
                            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                              showNewsMarkers ? "bg-claude-orange" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                                showNewsMarkers ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </label>

                        {/* Add a comparison (Image 2) */}
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleSelectSecurity(e.target.value);
                            }}
                            className="text-xs font-sans text-gray-700 border border-gray-300 rounded-lg px-2.5 py-1 bg-white hover:border-claude-orange focus:border-claude-orange focus:ring-1 focus:ring-claude-orange transition-colors cursor-pointer outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              + Add a comparison
                            </option>
                            {TOP_SECURITIES_LIST.filter((s) => s.symbol !== security.symbol).map((s) => (
                              <option key={s.symbol} value={s.symbol}>
                                Compare with {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Bloomberg Financial Chart (Images 2 & 3) */}
                    <BloombergChart
                      data={security.timeSeries[activeTimeframe]}
                      prevClose={security.prevClose}
                      currency={security.currency}
                      isPositive={isPositive}
                      timeframe={activeTimeframe}
                      showNewsMarkers={showNewsMarkers}
                    />

                    {/* Overview Section (WhatsApp Image 3) */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-claude-orange rounded-full" />
                        <span>Overview</span>
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-sans border-t border-b border-gray-200 py-3">
                        <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-claude-amber/30 transition-colors">
                          <div className="text-gray-500 font-mono text-[10px] uppercase font-semibold">OPEN</div>
                          <div className="font-extrabold text-base text-gray-900 font-mono mt-0.5">
                            {security.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-claude-amber/30 transition-colors">
                          <div className="text-gray-500 font-mono text-[10px] uppercase font-semibold">1 YEAR RETURN</div>
                          <div className={`font-extrabold text-base font-mono mt-0.5 ${security.yearReturnPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {security.yearReturnPct >= 0 ? "+" : ""}{security.yearReturnPct.toFixed(2)}%
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-claude-amber/30 transition-colors">
                          <div className="text-gray-500 font-mono text-[10px] uppercase font-semibold">DAY RANGE</div>
                          <div className="font-extrabold text-xs text-gray-900 font-mono mt-1 truncate">
                            {security.dayLow.toLocaleString(undefined, { minimumFractionDigits: 2 })} – {security.dayHigh.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-claude-amber/30 transition-colors">
                          <div className="text-gray-500 font-mono text-[10px] uppercase font-semibold">PREV. CLOSE</div>
                          <div className="font-extrabold text-base text-gray-900 font-mono mt-0.5">
                            {security.prevClose.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-claude-amber/30 transition-colors">
                          <div className="text-gray-500 font-mono text-[10px] uppercase font-semibold">YTD RETURN</div>
                          <div className={`font-extrabold text-base font-mono mt-0.5 ${security.ytdReturnPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {security.ytdReturnPct >= 0 ? "+" : ""}{security.ytdReturnPct.toFixed(2)}%
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-claude-amber/30 transition-colors">
                          <div className="text-gray-500 font-mono text-[10px] uppercase font-semibold">52 WEEK RANGE</div>
                          <div className="font-extrabold text-xs text-gray-900 font-mono mt-1 truncate">
                            {security.yearLow.toLocaleString(undefined, { minimumFractionDigits: 2 })} – {security.yearHigh.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Statistics Section (WhatsApp Image 4) */}
                    <div className="space-y-3 pt-4">
                      <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-claude-amber rounded-full" />
                        <span>Key Statistics</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs font-sans border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">P/E RATIO</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.peRatio ?? "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">PRICE TO BOOK RATIO</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.priceToBookRatio ?? "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">PRICE TO SALES RATIO</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.priceToSalesRatio ?? "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">1 YEAR RETURN</span>
                          <span className={`font-bold font-mono ${security.yearReturnPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {security.yearReturnPct >= 0 ? "+" : ""}{security.yearReturnPct.toFixed(2)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">30 DAY AVG VOLUME</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.thirtyDayAvgVolume}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">EPS</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.eps ?? "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">LAST DIVIDEND REPORTED</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.lastDividendReported ?? "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 hover:bg-claude-amber/5 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 font-mono uppercase text-[11px]">MARKET CAP</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {security.marketCap ?? "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "Related News" && (
                  /* Related News Editorial Grid (WhatsApp Image 5) */
                  <RelatedNewsGrid
                    articles={security.newsArticles}
                    securityName={security.name}
                  />
                )}

                {activeTab === "Index Info" && (
                  /* Asset & Index Info Specifications (WhatsApp Image 6) */
                  <AssetInfoSection security={security} />
                )}
              </div>

              {/* Right Column: Sponsored Banner & Markets at a Glance Widget (Images 2, 4, 6) */}
              <div className="lg:col-span-3 space-y-6 order-3">
                {/* Top right sponsored ad placeholder (Images 2, 3, 5, 6) */}
                <div className="h-52 bg-gradient-to-br from-amber-50/70 to-orange-50/50 rounded-2xl border border-claude-amber/30 flex flex-col items-center justify-center p-5 text-center shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-claude-orange font-bold mb-1">
                    Institutional Sponsor
                  </span>
                  <p className="text-sm font-extrabold text-gray-900">
                    Quantum FinTech AgentOS
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Cryptographic Holdout Vaults Active
                  </p>
                  <span className="mt-3 px-3 py-1 rounded-full bg-white border border-claude-amber/30 text-claude-orange font-mono text-[10px] font-bold shadow-xs">
                    SYSTEM VERIFIED
                  </span>
                </div>

                {/* Markets at a Glance Widget (WhatsApp Image 4) */}
                <MarketsAtAGlance onSelectSecurity={handleSelectSecurity} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AssetsPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-claude-cream flex items-center justify-center font-mono text-xs text-gray-500">
            Loading Assets & Indicators Studio...
          </div>
        }
      >
        <AssetsContent />
      </Suspense>
    </AuthGuard>
  );
}
