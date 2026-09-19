"use client";
import React, { useState } from "react";
import { REGIONAL_GLANCE, RegionalIndex } from "@/lib/marketsData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketsAtAGlanceProps {
  onSelectSecurity: (symbol: string) => void;
}

export const MarketsAtAGlance: React.FC<MarketsAtAGlanceProps> = ({ onSelectSecurity }) => {
  const [activeTab, setActiveTab] = useState<string>("Americas");
  const [activeRange, setActiveRange] = useState<string>("1D");

  const indices: RegionalIndex[] = REGIONAL_GLANCE[activeTab] || REGIONAL_GLANCE["Americas"];
  const featured = indices[0];

  // Helper to render mini SVG sparkline
  const renderSparkline = (points: number[], isPositive: boolean, width = 60, height = 20) => {
    if (!points || points.length === 0) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const spread = max - min || 1;

    const pathData = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / spread) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const color = isPositive ? "#16A34A" : "#DC2626";

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  // Helper for larger featured sparkline
  const renderFeaturedSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length === 0) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const spread = max - min || 1;
    const width = 240;
    const height = 48;

    const linePoints = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / spread) * (height - 8) - 4;
      return { x, y };
    });

    const pathData = linePoints
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
      .join(" ");

    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;
    const strokeColor = isPositive ? "#16A34A" : "#DC2626";
    const gradId = `featGrad-${isPositive ? "up" : "down"}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaData} fill={`url(#${gradId})`} />
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 pt-6 font-sans">
      <h3 className="font-bold text-base text-gray-900 mb-3 tracking-tight flex items-center gap-1.5">
        <span className="w-1.5 h-3.5 bg-claude-orange rounded-full" />
        <span>Markets at a Glance</span>
      </h3>

      {/* Region Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 text-xs mb-4">
        {["Americas", "Europe", "APAC", "Your List"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1.5 font-bold transition-all ${
                isActive
                  ? "text-claude-orange border-b-2 border-claude-orange"
                  : "text-gray-500 hover:text-claude-orange"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Featured Header with Big Price and mini chart */}
      {featured && (
        <div className="mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => onSelectSecurity(featured.symbol)}
              className="font-bold text-xs text-gray-900 hover:text-claude-orange truncate max-w-[130px] text-left transition-colors"
            >
              {featured.name}
            </button>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-gray-900">
                {featured.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`font-semibold flex items-center ${
                  featured.changePct >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {featured.changePct >= 0 ? "▲" : "▼"} {Math.abs(featured.changePct)}%
              </span>
            </div>
          </div>

          {/* Featured Sparkline */}
          <div className="my-1.5">
            {renderFeaturedSparkline(featured.sparkline, featured.changePct >= 0)}
          </div>

          {/* Timeframe selector: 1D, 5D, 1M, 6M */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 pt-1">
            {["1D", "5D", "1M", "6M"].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  activeRange === range
                    ? "font-bold text-white bg-claude-orange shadow-xs"
                    : "hover:text-claude-orange"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List of other benchmarks */}
      <div className="divide-y divide-gray-100 text-xs">
        {indices.slice(1).map((idx) => {
          const isPos = idx.changePct >= 0;
          return (
            <div
              key={idx.symbol}
              onClick={() => onSelectSecurity(idx.symbol)}
              className="py-2.5 flex items-center justify-between hover:bg-claude-amber/5 px-2 -mx-2 rounded-lg cursor-pointer transition-colors group"
            >
              <span className="font-bold text-gray-900 group-hover:text-claude-orange transition-colors truncate max-w-[120px] text-[11.5px]">
                {idx.name}
              </span>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-[11px]">
                  <div className="font-bold text-gray-900">
                    {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`font-semibold ${isPos ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPos ? "▲" : "▼"} {Math.abs(idx.changePct)}%
                  </div>
                </div>

                <div className="w-[55px] flex justify-end">
                  {renderSparkline(idx.sparkline, isPos)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Your List Action */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={() => setActiveTab("Your List")}
          className="text-xs font-bold text-claude-orange hover:text-orange-700 underline tracking-tight transition-colors"
        >
          Create Your List <span className="font-normal text-gray-600">to follow what interests you</span>
        </button>
      </div>
    </div>
  );
};
