"use client";
import React from "react";
import { SecurityData } from "@/lib/marketsData";
import { PieChart, Info, Building2, Layers, ShieldAlert, Award } from "lucide-react";

interface AssetInfoSectionProps {
  security: SecurityData;
}

export const AssetInfoSection: React.FC<AssetInfoSectionProps> = ({ security }) => {
  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Overview Text */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight pb-2 border-b border-gray-200 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-claude-orange rounded-full" />
          <span>{security.aboutTitle}</span>
        </h2>

        <div className="space-y-3 text-sm text-gray-800 leading-relaxed max-w-4xl">
          {security.aboutText.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {/* Sector Weightings Breakdown if applicable */}
      {security.sectorWeights && security.sectorWeights.length > 0 && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-claude-orange" />
              <span>Sector & Component Weightings</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">100% Normalized Allocation</span>
          </div>

          {/* Multi-colored stacked bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
            {security.sectorWeights.map((sec, idx) => (
              <div
                key={idx}
                style={{ width: `${sec.percentage}%`, backgroundColor: sec.color }}
                title={`${sec.sector}: ${sec.percentage}%`}
                className="h-full transition-all hover:opacity-85 cursor-pointer"
              />
            ))}
          </div>

          {/* Sector Chips Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {security.sectorWeights.map((sec, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 border border-gray-100 hover:border-claude-amber/30 text-xs transition-colors">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                  <span className="text-gray-800 truncate font-medium">{sec.sector}</span>
                </div>
                <span className="font-mono font-bold text-gray-900">{sec.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Constituents Table if applicable */}
      {security.topHoldings && security.topHoldings.length > 0 && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-claude-amber" />
              <span>Top Index Constituents & Holdings</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">Ranked by Effective Weight</span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 font-mono text-gray-600 uppercase text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-3">Company / Security</th>
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3 text-right">Portfolio Weight</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">24h Chg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {security.topHoldings.map((h, i) => (
                  <tr key={i} className="hover:bg-claude-amber/5 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{h.name}</td>
                    <td className="py-2.5 px-3 font-mono text-claude-orange font-semibold">{h.ticker}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-gray-900">{h.weight}%</td>
                    <td className="py-2.5 px-3 font-mono text-right text-gray-700">${h.price.toFixed(2)}</td>
                    <td className={`py-2.5 px-3 font-mono font-semibold text-right ${h.changePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {h.changePct >= 0 ? "▲" : "▼"} {Math.abs(h.changePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Methodology & Operational Specifications */}
      {security.methodologyDetails && security.methodologyDetails.length > 0 && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-claude-orange" />
            <span>Operational & Governance Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {security.methodologyDetails.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl hover:border-claude-amber/40 hover:bg-amber-50/20 transition-all">
                <div className="text-[11px] font-bold uppercase tracking-wide text-claude-orange font-mono mb-1">
                  {item.label}
                </div>
                <div className="text-xs font-semibold text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
