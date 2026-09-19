"use client";
import React, { useEffect, useRef, useState } from "react";
import { CaseCandidate } from "@/lib/api";

interface NetworkGraphProps {
  candidates?: CaseCandidate[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ candidates = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Generate node positions for clusters
    const nodes: any[] = [];
    const edges: any[] = [];
    const numNodes = candidates.length > 0 ? Math.min(candidates.length, 60) : 55;

    for (let i = 0; i < numNodes; i++) {
      const cand = candidates[i] || {
        case_id: `CASE_${String(i + 1).padStart(4, '0')}`,
        entity_id: `BTC_TX_${String(i).padStart(3, '0')}`,
        risk_score: 0.5 + (i * 0.08) % 0.45,
        financial_impact_usd: 10000 + (i * 50000) % 1500000,
        cluster_id: (i % 6) + 1
      };

      const angle = (i / numNodes) * Math.PI * 2;
      const radius = 100 + (cand.cluster_id * 20) + Math.sin(i) * 35;

      nodes.push({
        id: cand.entity_id,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        risk: cand.risk_score,
        impact: cand.financial_impact_usd,
        cluster: cand.cluster_id,
        case_id: cand.case_id
      });
    }

    // Connect node edges within cluster
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].cluster === nodes[j].cluster || Math.random() < 0.04) {
          edges.push({ source: i, target: j });
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw pixel grid background
      ctx.strokeStyle = "rgba(217, 119, 6, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw edges
      edges.forEach(edge => {
        const u = nodes[edge.source];
        const v = nodes[edge.target];
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.strokeStyle = u.risk > 0.8 || v.risk > 0.8 ? "rgba(220, 38, 38, 0.45)" : "rgba(30, 25, 21, 0.15)";
        ctx.lineWidth = u.risk > 0.8 || v.risk > 0.8 ? 2 : 1;
        ctx.stroke();
      });

      // Update & Draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        // Node block shape
        ctx.fillStyle = node.risk > 0.85 ? "#DC2626" : node.risk > 0.6 ? "#EA580C" : "#059669";
        const size = node.impact > 800000 ? 12 : 8;
        ctx.fillRect(node.x - size/2, node.y - size/2, size, size);

        ctx.strokeStyle = "#1E1915";
        ctx.lineWidth = 2;
        ctx.strokeRect(node.x - size/2, node.y - size/2, size, size);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [candidates]);

  return (
    <div className="mc-card p-4 relative bg-claude-card border-3 border-mc-border">
      <div className="flex items-center justify-between mb-3 border-b border-mc-border/20 pb-2">
        <h3 className="font-bold text-sm pixel-font text-claude-surface uppercase">
          ELLIPTIC BITCOIN TRANSACTION NETWORK GRAPH
        </h3>
        <span className="mc-badge bg-claude-orange text-white">203K NODES TOPOLOGY</span>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={380}
        className="w-full h-[380px] bg-claude-cream/80 border-2 border-mc-border cursor-crosshair"
      />

      <div className="flex items-center justify-between mt-3 text-xs font-mono text-claude-surface/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-mc-redstone border border-mc-border" /> Illicit Cluster</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-claude-orange border border-mc-border" /> High Risk Entity</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-mc-emerald border border-mc-border" /> Licit Entity</span>
        </div>
        <span>NetworkX Graph Analytics</span>
      </div>
    </div>
  );
};
