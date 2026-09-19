"use client";
import React, { useState, useEffect, useRef } from "react";
import { Terminal, Maximize2, Minimize2, Plus, X, ChevronUp, ChevronDown, Play, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StreamItem {
  id: string;
  command: string;
  output: any;
  timestamp: string;
}

interface TerminalTab {
  id: string;
  title: string;
  command: string;
  stream: StreamItem[];
  history: string[];
}

export function BloombergTerminalWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: "tab-1",
      title: "FINTECH OS CLI",
      command: "",
      stream: [],
      history: []
    }
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [inputCommand, setInputCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [globalHistory, setGlobalHistory] = useState<string[]>([
    "GC=F GP <GO>",
    "NVDA BQ <GO>",
    "BTC-USD HP <GO>",
    "NVDA TECH <GO>",
    "WEI <GO>",
    "PORT <GO>",
    "AUDIT <GO>"
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Auto-focus input field when terminal opens or active tab changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, activeTabId]);

  // Auto-scroll stream to bottom on new outputs
  useEffect(() => {
    if (isOpen) {
      streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab?.stream, loading, isOpen]);

  const executeCommand = async (cmdToRun: string, targetTabId?: string) => {
    const tabId = targetTabId || activeTabId;
    let rawCmd = cmdToRun.trim();
    if (!rawCmd || loading) return;

    if (!rawCmd.toUpperCase().endsWith("<GO>")) {
      rawCmd = `${rawCmd} <GO>`;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: rawCmd, tab_id: tabId })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Append execution item to stream
        const newItem: StreamItem = {
          id: `item-${Date.now()}`,
          command: rawCmd,
          output: data,
          timestamp: data.timestamp
        };

        setGlobalHistory((prev) => [rawCmd, ...prev.filter((h) => h !== rawCmd)].slice(0, 50));

        setTabs((prevTabs) =>
          prevTabs.map((t) => {
            if (t.id === tabId) {
              const updatedHistory = [rawCmd, ...t.history.filter((h) => h !== rawCmd)].slice(0, 20);
              return {
                ...t,
                title: `${data.ticker} ${data.function_code} <GO>`,
                command: rawCmd,
                stream: [...t.stream, newItem],
                history: updatedHistory
              };
            }
            return t;
          })
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setHistoryIndex(-1);
      setInputCommand("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleAddNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      title: `CLI ${tabs.length + 1}`,
      command: "",
      stream: [],
      history: []
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(inputCommand);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (globalHistory.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, globalHistory.length - 1);
        setHistoryIndex(nextIdx);
        setInputCommand(globalHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputCommand(globalHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand("");
      }
    }
  };

  const presetShortcuts = [
    "GC=F GP <GO>",
    "NVDA BQ <GO>",
    "BTC-USD HP <GO>",
    "NVDA TECH <GO>",
    "PC <GO>",
    "WEI <GO>",
    "PORT <GO>",
    "AUDIT <GO>",
    "HELP <GO>"
  ];

  return (
    <>
      {/* Bottom Silent Dock Bar */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-40 h-11 bg-[#FAF6F0] border-t-2 border-amber-400/90 text-[#1E1915] font-mono text-xs px-4 py-1.5 flex items-center justify-between shadow-lg backdrop-blur-md cursor-pointer hover:bg-[#F3EDE2] transition-colors select-none group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-100/90 border border-amber-300 text-amber-900 font-bold group-hover:bg-amber-200/80 transition">
              <Terminal className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span>FINTECH AGENT OS TERMINAL</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>

            <span className="text-amber-400 hidden sm:inline">|</span>

            <span className="text-stone-600 text-xs hidden lg:inline font-sans">
              Click anywhere to open CLI console &amp; run system mnemonics (<span className="text-amber-800 font-mono font-bold">&lt;GO&gt;</span>)
            </span>

            {/* Quick Command Chips */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
              {presetShortcuts.slice(0, 5).map((shortcut, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                    setInputCommand(shortcut);
                    executeCommand(shortcut);
                  }}
                  className="px-2 py-0.5 rounded bg-white border border-amber-300/80 hover:border-amber-500 hover:bg-amber-100/80 text-amber-900 font-mono transition text-[11px]"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-800 font-bold hidden sm:inline group-hover:text-amber-900">
              CLICK TO EXPAND
            </span>
            <div className="p-1 rounded bg-amber-200/70 group-hover:bg-amber-300/80 text-amber-900 transition">
              <ChevronUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Expanded FinTech Agent OS Terminal Drawer */}
      {isOpen && (
        <div
          className={`fixed left-0 right-0 z-50 bg-[#FAF6F0] border-t-2 border-amber-400/90 text-[#1E1915] font-mono flex flex-col shadow-2xl transition-all duration-200 ${
            isMaximized ? "top-0 bottom-0" : "bottom-0 h-[520px] max-h-[92vh]"
          }`}
        >
          {/* Top Header Bar & Multi-Tab Workspace */}
          <div className="bg-gradient-to-r from-amber-100/80 via-[#F5EFE6] to-orange-100/80 border-b border-amber-300/80 px-3 py-1.5 flex items-center justify-between select-none">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <div className="flex items-center gap-1.5 pr-3 mr-2 border-r border-amber-300/80 text-amber-900 font-bold text-xs">
                <Terminal className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">FINTECH AGENT OS TERMINAL</span>
              </div>

              {tabs.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTabId(t.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-t text-xs font-mono cursor-pointer transition border-t border-x ${
                    activeTabId === t.id
                      ? "bg-white border-amber-400 text-amber-900 font-bold shadow-xs"
                      : "bg-amber-50/70 border-amber-200/80 text-stone-600 hover:text-amber-900 hover:bg-amber-100/50"
                  }`}
                >
                  <span>{t.title}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(e, t.id)}
                      className="hover:text-red-500 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddNewTab}
                className="p-1 rounded hover:bg-amber-200/60 text-amber-800 transition ml-1"
                title="Create New Terminal Tab"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-2 text-stone-600">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1 hover:bg-amber-200/60 hover:text-amber-900 rounded transition"
                title={isMaximized ? "Restore Terminal" : "Maximize Terminal"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition"
                title="Minimize Terminal to Bottom Dock"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preset Shortcuts Bar (Positioned ABOVE Output Area) */}
          <div className="bg-[#F5EFE6] border-b border-amber-300/60 px-3 py-1 flex items-center gap-1.5 overflow-x-auto text-[11px] select-none">
            <span className="text-amber-900/80 font-bold mr-1">PRESETS:</span>
            {presetShortcuts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputCommand(s);
                  executeCommand(s);
                }}
                className="px-2 py-0.5 rounded bg-white border border-amber-300/80 hover:border-amber-500 hover:bg-amber-100/80 text-amber-900 font-semibold transition whitespace-nowrap shadow-2xs"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Scrolling Terminal Output Stream Body (Middle Stream Area) */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#FAF6F0] text-[#1E1915] font-mono text-xs space-y-6 scrollbar-thin scrollbar-thumb-amber-300/60">
            {activeTab.stream.length === 0 && !loading && (
              <div className="py-8 text-center text-amber-800/80 font-mono">
                <p className="text-sm font-bold text-amber-900">⚡ FinTech Agent OS Terminal CLI Active</p>
                <p className="text-xs my-1">Type any system command (e.g. <span className="text-emerald-700 font-bold">NVDA BQ</span>, <span className="text-emerald-700 font-bold">GC=F GP</span>, <span className="text-emerald-700 font-bold">WEI</span>, <span className="text-emerald-700 font-bold">PORT</span>, <span className="text-emerald-700 font-bold">HELP</span>) and press Enter.</p>
              </div>
            )}

            {activeTab.stream.map((item) => (
              <div key={item.id} className="border-b border-amber-300/60 pb-4">
                {/* Executed Command Line Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">FINTECH OS&gt;</span>
                    <span className="text-amber-900 font-bold">{item.command}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    [{item.timestamp}] {item.output?.execution_ms ? `${item.output.execution_ms}ms` : ""}
                  </div>
                </div>

                {/* Text Summary Log Output */}
                {item.output?.data?.text_summary && (
                  <div className="p-2.5 mb-3 bg-amber-50/90 border-l-3 border-amber-500 text-amber-950 text-xs font-mono leading-relaxed rounded-r-md border-y border-r border-amber-200/60">
                    {item.output.data.text_summary}
                  </div>
                )}

                {/* Render Output Type Visuals / Tables / Charts */}
                {item.output?.output_type === "CHART" && item.output.data.series && (
                  <div className="h-[220px] w-full my-2 bg-white p-2 rounded-xl border border-amber-300/70 shadow-2xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.output.data.series}>
                        <XAxis dataKey="date" stroke="#B45309" tick={{ fill: "#92400E", fontSize: 10 }} />
                        <YAxis stroke="#B45309" tick={{ fill: "#92400E", fontSize: 10 }} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: "#FFFBEB", borderColor: "#F59E0B", color: "#78350F", borderRadius: "8px" }} />
                        <Line type="monotone" dataKey="close" stroke="#D97706" strokeWidth={2} dot={false} name="Close Price" />
                        {item.output.data.series[0]?.sma20 && (
                          <Line type="monotone" dataKey="sma20" stroke="#059669" strokeWidth={1.5} dot={false} name="SMA 20" />
                        )}
                        {item.output.data.series[0]?.sma50 && (
                          <Line type="monotone" dataKey="sma50" stroke="#2563EB" strokeWidth={1.5} dot={false} name="SMA 50" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {item.output?.output_type === "INDICATOR" && item.output.data.series && (
                  <div className="h-[200px] w-full my-2 bg-white p-2 rounded-xl border border-amber-300/70 shadow-2xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.output.data.series}>
                        <XAxis dataKey="date" stroke="#B45309" tick={{ fill: "#92400E", fontSize: 10 }} />
                        <YAxis stroke="#B45309" tick={{ fill: "#92400E", fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "#FFFBEB", borderColor: "#F59E0B", color: "#78350F", borderRadius: "8px" }} />
                        <Line type="monotone" dataKey="rsi" stroke="#059669" strokeWidth={2} dot={false} name="RSI (14)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {item.output?.output_type === "TABLE" && item.output.data.rows && (
                  <div className="overflow-x-auto my-2 rounded-xl border border-amber-300/70 shadow-2xs bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-amber-100/90 border-b border-amber-300 text-amber-900 text-xs font-bold">
                          {Object.keys(item.output.data.rows[0] || {}).map((col) => (
                            <th key={col} className="p-2.5 capitalize">{col.replace(/_/g, " ")}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.output.data.rows.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-amber-200/60 hover:bg-amber-50/60 transition-colors">
                            {Object.values(row).map((val: any, j: number) => (
                              <td key={j} className="p-2.5 text-stone-800 text-xs font-mono">
                                {typeof val === "number" ? (val % 1 !== 0 ? val.toFixed(2) : val.toLocaleString()) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {item.output?.output_type === "MARKET" && item.output.data.indices && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 my-2">
                    {item.output.data.indices.map((idx: any, i: number) => (
                      <div key={i} className="p-3 bg-white border border-amber-300/80 rounded-xl shadow-2xs">
                        <div className="text-xs text-amber-900 font-bold">{idx.name}</div>
                        <div className="text-sm text-stone-900 font-black my-0.5 font-mono">{idx.value}</div>
                        <div className={idx.change.startsWith("+") ? "text-emerald-700 font-bold text-xs" : "text-red-600 font-bold text-xs"}>
                          {idx.change}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {item.output?.output_type === "QUANT" && item.output.data.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 my-2">
                    {Object.entries(item.output.data.metrics).map(([k, v]: [string, any]) => (
                      <div key={k} className="p-2.5 bg-white border border-amber-300/80 rounded-xl shadow-2xs">
                        <div className="text-[10px] text-amber-800 uppercase tracking-wider font-bold">{k.replace(/_/g, " ")}</div>
                        <div className="text-xs text-stone-900 font-black mt-1 font-mono">
                          {typeof v === "number" ? (v > 0 && k.includes("return") ? `+${v}%` : `${v}${k.includes("pct") || k.includes("volatility") ? "%" : ""}`) : v}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {item.output?.output_type === "AUDIT" && (
                  <div className="p-3 bg-white border border-amber-300/80 rounded-xl text-xs space-y-2 shadow-2xs">
                    <p className="text-amber-900 font-bold">Total Logged Strategy Backtests: {item.output.data.total_logged_runs}</p>
                    <p className="text-stone-600 text-xs">Cryptographic Ledger Status: <span className="text-emerald-700 font-bold">ACTIVE (SHA-256)</span> | Sealed Out-of-Sample Holdout Vault: <span className="text-amber-800 font-bold">LOCKED (30% Data)</span></p>
                  </div>
                )}

                {item.output?.output_type === "HELP" && item.output.data.mnemonics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 my-2">
                    {Object.entries(item.output.data.mnemonics).map(([code, desc]: [string, any]) => (
                      <div
                        key={code}
                        onClick={() => {
                          const cmd = `${code} <GO>`;
                          setInputCommand(cmd);
                          executeCommand(cmd);
                        }}
                        className="p-2.5 bg-white border border-amber-300/80 hover:border-amber-500 hover:bg-amber-50/80 cursor-pointer rounded-xl transition shadow-2xs"
                      >
                        <span className="text-emerald-700 font-bold">{code}</span>: <span className="text-amber-950 font-medium">{desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-amber-900 py-2 font-bold">
                <span className="animate-spin text-amber-600">⏳</span> Processing FinTech OS Command...
              </div>
            )}

            <div ref={streamEndRef} />
          </div>

          {/* Command Prompt Input Line (Positioned at the VERY BOTTOM) */}
          <div className="bg-[#F5EFE6] border-t border-amber-300/80 px-3 py-2 flex items-center gap-2">
            <span className="text-amber-900 font-bold text-xs flex items-center gap-1">
              <span className="text-emerald-700">FINTECH OS&gt;</span>
            </span>

            <input
              ref={inputRef}
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              autoFocus
              placeholder="Type system command (e.g. NVDA BQ, GC=F GP, WEI, PORT, HELP) and press Enter"
              className="flex-1 bg-white border border-amber-300/90 text-[#1E1915] font-mono text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 placeholder:text-stone-400 font-bold tracking-wide shadow-2xs"
            />

            <button
              onClick={() => executeCommand(inputCommand)}
              disabled={loading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs tracking-wider transition flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>&lt;GO&gt;</span>
              <Play className="w-3 h-3 fill-current" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
