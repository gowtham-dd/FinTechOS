"use client";
import React, { useState } from "react";
import { AgentMetadata } from "@/lib/api";
import { AgentCard } from "./AgentCard";
import { Sparkles, Bot, Layers, CheckCircle2 } from "lucide-react";

interface AgentGridProps {
  agents: AgentMetadata[];
  onSelectAgent?: (agent: AgentMetadata) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents, onSelectAgent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredAgents = agents.filter(a => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "risk") return a.role.toLowerCase().includes("risk") || a.role.toLowerCase().includes("quality");
    if (selectedCategory === "graph") return a.role.toLowerCase().includes("topology") || a.role.toLowerCase().includes("graph");
    if (selectedCategory === "quantum") return a.role.toLowerCase().includes("solver") || a.role.toLowerCase().includes("qubo") || a.role.toLowerCase().includes("quantum");
    return true;
  });

  return (
    <div className="mc-card p-6 md:p-8 bg-claude-cream/60 border-4 border-mc-border shadow-pixel-lg">
      {/* Big Card Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b-2 border-mc-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-6 h-6 text-claude-orange" />
            <h2 className="text-xl md:text-2xl font-black pixel-font text-claude-surface tracking-wide">
              16 SPECIALIZED AGENT ECOSYSTEM
            </h2>
          </div>
          <p className="text-xs md:text-sm text-claude-surface/80 text-justify">
            Each agent operates as a specialized computational unit communicating via structured JSON artifacts rather than chat spam.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "all", label: "ALL AGENTS (16)" },
            { id: "risk", label: "RISK & INGESTION" },
            { id: "graph", label: "GRAPH ENGINE" },
            { id: "quantum", label: "QUANTUM OPT" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all border border-mc-border shadow-pixel-sm ${
                selectedCategory === cat.id
                  ? "bg-claude-orange text-white"
                  : "bg-white text-claude-surface hover:bg-claude-amber/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 16 Minecraft Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {filteredAgents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={index}
            onSelect={onSelectAgent}
          />
        ))}
      </div>

      {/* Big Card Footer Summary */}
      <div className="mt-6 pt-4 border-t-2 border-mc-border flex flex-col md:flex-row items-center justify-between text-xs font-mono text-claude-surface/90 gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-mc-emerald" />
          <span>Structured JSON Artifact Pipeline Enabled</span>
        </div>
        <div className="flex items-center gap-2 text-claude-rust font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Groq Llama-3.3-70b + PyQUBO Quantum Annealing</span>
        </div>
      </div>
    </div>
  );
};
