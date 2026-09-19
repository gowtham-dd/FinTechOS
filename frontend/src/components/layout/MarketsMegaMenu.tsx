"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOP_SECURITIES_LIST, DATA_CATEGORIES } from "@/lib/marketsData";
import { TrendingUp, TrendingDown, ArrowRight, ChevronRight, X } from "lucide-react";

interface MarketsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketsMegaMenu: React.FC<MarketsMegaMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("stocks");

  if (!isOpen) return null;

  const handleSelectSecurity = (symbol: string) => {
    onClose();
    router.push(`/assets?symbol=${symbol}`);
  };

  return (
    <div className="absolute top-full left-0 w-full bg-white text-gray-900 border-b border-gray-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Top bar with quick close for mobile */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-5 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Bloomberg Markets Terminal
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Data Categories */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-gray-200 lg:pr-6 pb-6 lg:pb-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 font-mono">
                DATA
              </h3>
              <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
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
                          ? "bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500 shadow-xs"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <span className="capitalize">{cat.title}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? "text-amber-600 translate-x-0.5" : "text-gray-400"
                        }`}
                      />
                    </button>

                    {/* Sub-items for active category */}
                    {isActive && (
                      <div className="pl-3 py-1 space-y-1 animate-in fade-in duration-150">
                        {cat.items.map((item) => (
                          <button
                            key={item.symbol}
                            onClick={() => handleSelectSecurity(item.symbol)}
                            className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-gray-600 hover:text-black hover:bg-gray-100 transition-colors text-left"
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
              <Link
                href="/assets?symbol=SPX"
                onClick={onClose}
                className="flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
              >
                <span>Full Quant Fintech Terminal View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Section: Top Securities Grid (WhatsApp Image 1 format) */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 font-mono">
                  TOP SECURITIES
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                  GLOBAL MARKETS
                </span>
              </div>
              <span className="text-[11px] text-gray-500 hidden sm:inline-block">
                Click any security to launch interactive Bloomberg view
              </span>
            </div>

            {/* 4 columns x 3+ rows grid matching WhatsApp Image 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {TOP_SECURITIES_LIST.map((sec) => (
                <button
                  key={sec.symbol}
                  onClick={() => handleSelectSecurity(sec.symbol)}
                  className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-amber-400 hover:shadow-md p-3.5 rounded-xl text-left transition-all duration-150 hover:-translate-y-0.5 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-black truncate">
                      {sec.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 group-hover:text-amber-600">
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
                  onClick={() => handleSelectSecurity("NVDA")}
                  className="text-gray-700 hover:text-black font-semibold hover:underline"
                >
                  NVIDIA (NVDA)
                </button>
                <button
                  onClick={() => handleSelectSecurity("BTC")}
                  className="text-gray-700 hover:text-black font-semibold hover:underline"
                >
                  Bitcoin (BTC)
                </button>
                <button
                  onClick={() => handleSelectSecurity("GLD")}
                  className="text-gray-700 hover:text-black font-semibold hover:underline"
                >
                  Gold (GLD)
                </button>
                <button
                  onClick={() => handleSelectSecurity("SPX")}
                  className="text-gray-700 hover:text-black font-semibold hover:underline"
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
    </div>
  );
};
