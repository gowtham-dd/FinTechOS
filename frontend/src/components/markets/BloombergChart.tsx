"use client";
import React, { useState, useMemo } from "react";
import { TimeSeriesPoint } from "@/lib/marketsData";

interface BloombergChartProps {
  data: TimeSeriesPoint[];
  prevClose: number;
  currency: string;
  isPositive: boolean;
  timeframe: string;
  showNewsMarkers?: boolean;
  comparisonSymbol?: string | null;
}

export const BloombergChart: React.FC<BloombergChartProps> = ({
  data,
  prevClose,
  currency,
  isPositive,
  timeframe,
  showNewsMarkers = false,
  comparisonSymbol = null,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);

  // Calculate SVG bounds and scaling
  const chartHeight = 320;
  const chartWidth = 800; // viewBox width
  const padding = { top: 25, right: 65, bottom: 35, left: 10 };

  const { minPrice, maxPrice, points, prevCloseY } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minPrice: 0, maxPrice: 100, points: [], prevCloseY: chartHeight / 2 };
    }

    const prices = data.map((d) => d.price);
    const allPrices = [...prices, prevClose];
    const rawMin = Math.min(...allPrices);
    const rawMax = Math.max(...allPrices);
    const spread = rawMax - rawMin || 1;
    const min = rawMin - spread * 0.08;
    const max = rawMax + spread * 0.08;

    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const scaledPoints = data.map((d, index) => {
      const x = padding.left + (index / (data.length - 1 || 1)) * innerWidth;
      const y = padding.top + (1 - (d.price - min) / (max - min)) * innerHeight;
      return { ...d, x, y };
    });

    const pCloseY = padding.top + (1 - (prevClose - min) / (max - min)) * innerHeight;

    return { minPrice: min, maxPrice: max, points: scaledPoints, prevCloseY: pCloseY };
  }, [data, prevClose]);

  // Construct SVG paths
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = chartHeight - padding.bottom;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [linePath, points]);

  // Handle mouse move for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * chartWidth;

    // Find nearest point
    let closest = points[0];
    let minDistance = Infinity;

    for (const pt of points) {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = pt;
      }
    }

    if (closest) {
      setHoveredPoint(closest);
      setHoverX(closest.x);
      setHoverY(closest.y);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
    setHoverY(null);
  };

  // Format y-axis ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const val = minPrice + ((maxPrice - minPrice) * i) / count;
      const y = padding.top + (1 - i / count) * (chartHeight - padding.top - padding.bottom);
      ticks.push({ val, y });
    }
    return ticks;
  }, [minPrice, maxPrice]);

  const formatPriceTick = (val: number) => {
    if (val >= 10000) return `${(val / 1000).toFixed(1)}K`;
    if (val >= 1000) return `${(val / 1000).toFixed(2)}K`;
    if (val >= 10) return val.toFixed(2);
    return val.toFixed(3);
  };

  const primaryColor = isPositive ? "#16A34A" : "#DC2626";
  const gradientStart = isPositive ? "rgba(22, 163, 74, 0.18)" : "rgba(220, 38, 38, 0.18)";

  return (
    <div className="w-full bg-white relative font-sans border-b border-gray-200 select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-[280px] sm:h-[340px] block cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="bloombergAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((tick, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={chartWidth - padding.right}
              y2={tick.y}
              stroke="#E5E7EB"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <text
              x={chartWidth - padding.right + 8}
              y={tick.y + 3.5}
              fill="#9CA3AF"
              fontSize="10"
              fontFamily="monospace"
            >
              {formatPriceTick(tick.val)}
            </text>
          </g>
        ))}

        {/* Previous Close Reference Line */}
        <line
          x1={padding.left}
          y1={prevCloseY}
          x2={chartWidth - padding.right}
          y2={prevCloseY}
          stroke="#9CA3AF"
          strokeDasharray="3 3"
          strokeWidth="1.2"
        />
        <text
          x={padding.left + 4}
          y={prevCloseY - 6}
          fill="#6B7280"
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="0.05em"
          fontFamily="monospace"
        >
          PREV. CLOSE {prevClose.toLocaleString()} {currency}
        </text>

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#bloombergAreaGrad)" />

        {/* Main Price Line */}
        <path
          d={linePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bottom X-axis baseline */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#1F2937"
          strokeWidth="1.2"
        />

        {/* X-axis Time Labels */}
        {points
          .filter((_, idx) => idx % Math.ceil(points.length / 7) === 0 || idx === points.length - 1)
          .map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={chartHeight - padding.bottom + 16}
              textAnchor="middle"
              fill="#6B7280"
              fontSize="10"
              fontFamily="monospace"
            >
              {pt.time}
            </text>
          ))}

        {/* News Event Markers */}
        {showNewsMarkers &&
          points.length > 4 &&
          [2, Math.floor(points.length / 2), points.length - 3].map((index) => {
            const pt = points[index];
            if (!pt) return null;
            return (
              <g key={index}>
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx={pt.x} cy={pt.y} r="1.5" fill="#FFFFFF" />
              </g>
            );
          })}

        {/* Active Hover Crosshair (Vertical and Horizontal) */}
        {hoverX !== null && hoverY !== null && hoveredPoint && (
          <g>
            {/* Vertical tracking dashed line */}
            <line
              x1={hoverX}
              y1={padding.top}
              x2={hoverX}
              y2={chartHeight - padding.bottom}
              stroke="#EA580C"
              strokeDasharray="2 2"
              strokeWidth="1.2"
              opacity="0.8"
            />

            {/* Point marker */}
            <circle cx={hoverX} cy={hoverY} r="4.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />

            {/* Bloomberg Hover Tooltip Box */}
            <g transform={`translate(${Math.min(hoverX - 45, chartWidth - padding.right - 95)}, ${Math.max(hoverY - 36, padding.top)})`}>
              <rect
                width="96"
                height="30"
                rx="6"
                fill="#1C1814"
                stroke="#EA580C"
                strokeWidth="1.2"
                filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.3))"
              />
              <text x="48" y="13" fill="#FED7AA" fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                {hoveredPoint.price.toLocaleString()} {currency}
              </text>
              <text x="48" y="24" fill="#E5E7EB" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                {hoveredPoint.time}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
