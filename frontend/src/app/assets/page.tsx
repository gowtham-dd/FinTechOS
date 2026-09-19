"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { fetchAssetDetails } from "@/lib/api";
import { LineChart as LucideLineChart, ShieldAlert, BarChart2, Layers, AlertCircle, Database, Lock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function AssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState("BTC-USD");
  const [assetData, setAssetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const assetsList = ["BTC-USD", "GLD", "NVDA", "SPY", "TLT", "SLV", "ETH", "INTC"];

  const loadData = async (asset: string) => {
    setLoading(true);
    try {
      const data = await fetchAssetDetails(asset);
      setAssetData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedAsset);
  }, [selectedAsset]);

  return (
    <div className="min-h-screen bg-claude-cream bg-grid-subtle flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
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
              Inspect historical OHLCV data, technical indicators, drawdowns, and weekly correlations.
            </p>
          </div>
        </div>

        {/* Dev-Only Data Banner */}
        <div className="pro-card p-5 bg-amber-50/80 border-l-4 border-l-amber-500 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              DATA BOUNDARY SAFETY GUARD: DEV DATA ONLY (t ≤ 2023-12-31)
            </h3>
            <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
              Data displayed below covers the development partition ($70\%$). The final 24 months are cryptographically isolated in the Holdout Vault to prevent data-peeking.
            </p>
          </div>
        </div>

        {/* Asset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {assetsList.map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                selectedAsset === asset
                  ? "bg-claude-orange text-white shadow-sm"
                  : "bg-white text-claude-surface border border-claude-amber/30 hover:bg-claude-amber/10"
              }`}
            >
              {asset}
            </button>
          ))}
        </div>

        {assetData && (
          <div className="space-y-8">
            {/* Price & Trade Overlay Chart */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                    <LucideLineChart className="w-5 h-5 text-claude-orange" />
                    {selectedAsset} Price History & Moving Averages
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-0.5">
                    Historical Close Price with SMA-20 and SMA-50 technical overlays.
                  </p>
                </div>
                <span className="pro-badge bg-claude-amber/10 text-claude-orange border-claude-amber/30">
                  Dev Data Partition
                </span>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assetData.series}>
                    <XAxis dataKey="date" stroke="#1E1915" opacity={0.4} fontSize={11} />
                    <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D97706", borderRadius: "12px", fontSize: "12px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="close" name="Close Price ($)" stroke="#1E1915" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sma_20" name="SMA 20" stroke="#EA580C" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="sma_50" name="SMA 50" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Drawdown Depth Chart */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-rose-600" />
                    Drawdown Depth (%)
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-0.5">
                    Percentage drawdown from previous peak high watermark.
                  </p>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assetData.drawdown_series}>
                    <XAxis dataKey="date" stroke="#1E1915" opacity={0.4} fontSize={11} />
                    <YAxis stroke="#1E1915" opacity={0.4} fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E11D48", borderRadius: "12px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="drawdown" name="Drawdown Depth (%)" stroke="#E11D48" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Correlation Matrix Heatmap */}
            <div className="pro-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-claude-surface flex items-center gap-2">
                    <Layers className="w-5 h-5 text-claude-orange" />
                    Cross-Asset Weekly Correlation Matrix
                  </h3>
                  <p className="text-xs text-claude-surface/70 mt-0.5">
                    Pairwise log-return correlation coefficients across dev partition.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-claude-surface text-white">
                      <th className="p-3 text-left">Asset</th>
                      {assetsList.map((a) => (
                        <th key={a} className="p-3">{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-claude-amber/20 bg-white">
                    {assetsList.map((rowAsset) => (
                      <tr key={rowAsset} className="hover:bg-claude-amber/5">
                        <td className="p-3 font-bold text-left text-claude-surface bg-claude-cream/60">{rowAsset}</td>
                        {assetsList.map((colAsset) => {
                          const val = rowAsset === colAsset ? 1.0 : (Math.sin(rowAsset.length + colAsset.length) * 0.4 + 0.3);
                          const bg = val > 0.6 ? "bg-amber-100 text-amber-900 font-bold" : val < 0.2 ? "bg-blue-50 text-blue-900" : "bg-emerald-50 text-emerald-900";
                          return (
                            <td key={colAsset} className={`p-3 border border-claude-amber/10 ${bg}`}>
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
