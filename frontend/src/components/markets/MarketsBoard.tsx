"use client";
import React, { useState } from "react";
import { TOP_SECURITIES_LIST, DATA_CATEGORIES } from "@/lib/marketsData";
import { TrendingUp, TrendingDown, ChevronRight, ArrowRight } from "lucide-react";

interface MarketsBoardProps {
  onSelectSecurity: (symbol: string) => void;
}

export const MarketsBoard: React.FC<MarketsBoardProps> = ({ onSelectSecurity }) => {
  const [activeCategory, setActiveCategory] = useState<string>("stocks");

  return (
    <div className="bg-white rounded-2xl border border-claude-amber/25 shadow-sm p-6 sm:p-8 space-y-6 select-none font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Data Categories */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-gray-200 lg:pr-6 pb-6 lg:pb-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-claude-amber rounded-full" />
              <span>DATA</span>
            </h3>
            <span className="text-[10px] text-claude-orange font-bold px-2 py-0.5 rounded-full bg-claude-amber/10 border border-claude-amber/30 font-mono">
              LIVE FEEDS
            </span>
          </div>

          <div className="space-y-1">
            {DATA_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <div key={cat.id} className="group">
                  <button
                    onClick={() => setActiveCategory(cat.id)}
                    onMouseEnter={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-claude-amber/10 text-claude-orange font-bold border-l-2 border-claude-orange shadow-xs"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span className="capitalize">{cat.title}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? "text-claude-orange translate-x-0.5" : "text-gray-400"
                      }`}
                    />
                  </button>

                  {/* Sub-items for active category */}
                  {isActive && (
                    <div className="pl-3 py-1 space-y-1 animate-in fade-in duration-150">
                      {cat.items.map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => onSelectSecurity(item.symbol)}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-gray-600 hover:text-claude-orange hover:bg-claude-amber/5 transition-colors text-left"
                        >
                          <span className="truncate pr-2 font-medium">{item.name}</span>
                          <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                            <span className="text-gray-800 font-semibold">{item.price}</span>
                            <span
                              className={`font-bold ${
                                item.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {item.change}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Institutional Feeds Synchronized</span>
            </div>
          </div>
        </div>

        {/* Right Section: Top Securities Grid (WhatsApp Image 1 format) */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-claude-orange rounded-full" />
                <span>TOP SECURITIES</span>
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                GLOBAL MARKETS
              </span>
            </div>
            <span className="text-[11px] text-gray-500 hidden sm:inline-block">
              Click any security to view interactive Bloomberg charts & details
            </span>
          </div>

          {/* 4 columns x 3+ rows grid matching WhatsApp Image 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOP_SECURITIES_LIST.map((sec) => (
              <button
                key={sec.symbol}
                onClick={() => onSelectSecurity(sec.symbol)}
                className="bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-claude-orange hover:shadow-md p-3.5 rounded-xl text-left transition-all duration-150 hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-claude-orange transition-colors truncate">
                    {sec.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 group-hover:text-claude-orange font-bold">
                    {sec.symbol}
                  </span>
                </div>

                <div className="font-extrabold text-base text-gray-950 tracking-tight font-mono">
                  {sec.price}
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                  {sec.isPositive ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                      <TrendingUp className="w-3 h-3" />
                      {sec.changePct}
                    </span>
                  ) : (
                    <span className="text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                      <TrendingDown className="w-3 h-3" />
                      {sec.changePct}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Quick Jump Bar */}
          <div className="mt-5 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-3">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 uppercase font-mono text-[10px]">Trending Assets:</span>
              <button
                onClick={() => onSelectSecurity("NVDA")}
                className="text-gray-700 hover:text-claude-orange font-semibold hover:underline transition-colors"
              >
                NVIDIA (NVDA)
              </button>
              <button
                onClick={() => onSelectSecurity("BTC")}
                className="text-gray-700 hover:text-claude-orange font-semibold hover:underline transition-colors"
              >
                Bitcoin (BTC)
              </button>
              <button
                onClick={() => onSelectSecurity("GLD")}
                className="text-gray-700 hover:text-claude-orange font-semibold hover:underline transition-colors"
              >
                Gold (GLD)
              </button>
              <button
                onClick={() => onSelectSecurity("SPX")}
                className="text-gray-700 hover:text-claude-orange font-semibold hover:underline transition-colors"
              >
                S&P 500 (SPX)
              </button>
            </div>

            <div className="text-[11px] text-gray-400 font-mono">
              NYSE · NASDAQ · CME · ICE · LSE · TOKYO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
