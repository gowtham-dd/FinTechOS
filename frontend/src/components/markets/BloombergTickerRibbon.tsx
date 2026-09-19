"use client";
import React, { useRef } from "react";
import { TOP_SECURITIES_LIST } from "@/lib/marketsData";
import { ChevronLeft, ChevronRight, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";

interface BloombergTickerRibbonProps {
  currentSymbol: string;
  onSelectSecurity: (symbol: string) => void;
  onToggleMegaMenu?: () => void;
}

export const BloombergTickerRibbon: React.FC<BloombergTickerRibbonProps> = ({
  currentSymbol,
  onSelectSecurity,
  onToggleMegaMenu,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-1.5 px-4 sm:px-8 flex items-center text-xs font-sans select-none">
      {/* Top Securities Dropdown Trigger */}
      <button
        onClick={onToggleMegaMenu}
        className="flex items-center gap-1.5 font-bold text-gray-900 hover:text-black py-1 pr-3 border-r border-gray-300 shrink-0 text-[11px] tracking-tight group"
      >
        <span>Top Securities</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-black transition-transform" />
      </button>

      {/* Horizontal Scrolling Ribbon */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-3 py-0.5"
      >
        {TOP_SECURITIES_LIST.map((item) => {
          const isSelected = item.symbol.toUpperCase() === currentSymbol.toUpperCase();
          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSecurity(item.symbol)}
              className={`flex items-center gap-2 px-3 py-1 rounded transition-all whitespace-nowrap shrink-0 text-[11px] font-mono ${
                isSelected
                  ? "bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-600"
                  : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className={`font-sans font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>
                {item.name}
              </span>
              <span className={isSelected ? "text-amber-100" : "text-gray-700"}>{item.price}</span>
              <span
                className={`flex items-center font-bold ${
                  item.isPositive
                    ? isSelected ? "text-emerald-200" : "text-emerald-600"
                    : isSelected ? "text-rose-200" : "text-rose-600"
                }`}
              >
                {item.changePct}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Arrows */}
      <div className="flex items-center gap-1 pl-2 border-l border-gray-300 shrink-0">
        <button
          onClick={() => handleScroll("left")}
          className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-black transition-colors"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleScroll("right")}
          className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-black transition-colors"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
