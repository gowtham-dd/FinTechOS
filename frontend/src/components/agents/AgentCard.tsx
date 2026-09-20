"use client";
import React from "react";
import { motion } from "framer-motion";
import { PixelAvatar } from "./PixelAvatar";
import { AgentMetadata } from "@/lib/api";
import { Cpu, ShieldCheck, Zap } from "lucide-react";

interface AgentCardProps {
  agent: AgentMetadata;
  index: number;
  onSelect?: (agent: AgentMetadata) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, index, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={() => onSelect && onSelect(agent)}
      className="mc-card-hover cursor-pointer p-4 flex flex-col justify-between relative bg-claude-card group"
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-3 border-b border-mc-border/20 pb-2">
        <span className="mc-badge bg-claude-amber/10 text-claude-rust border-claude-amber/40">
          Agent #{index + 1 < 10 ? `0${index + 1}` : index + 1}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-none bg-mc-emerald animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase text-claude-surface/70">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Main Avatar & Title Header */}
      <div className="flex items-start gap-3.5 mb-3">
        <PixelAvatar avatarKey={agent.avatar} color={agent.color} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-claude-surface truncate group-hover:text-claude-orange transition-colors">
            {agent.name}
          </h3>
          <p className="text-xs font-mono font-semibold text-claude-amber uppercase tracking-wider truncate">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Justified Description */}
      <p className="text-xs text-claude-surface/85 leading-relaxed text-justify mb-4 line-clamp-3">
        {agent.description}
      </p>

      {/* Card Footer Badges */}
      <div className="flex items-center justify-between pt-2 border-t border-mc-border/10 text-[11px] font-mono text-claude-muted">
        <span className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-claude-amber" />
          <span>Featherless API Powered</span>
        </span>
        <span className="flex items-center gap-1 text-claude-rust font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Artifact Ready</span>
        </span>
      </div>
    </motion.div>
  );
};
