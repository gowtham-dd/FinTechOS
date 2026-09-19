"use client";
import React from "react";
import { WorkflowStep } from "@/lib/api";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";

interface WorkflowDagProps {
  steps: WorkflowStep[];
  currentVersion?: number;
}

export const WorkflowDag: React.FC<WorkflowDagProps> = ({ steps, currentVersion = 3 }) => {
  return (
    <div className="mc-card p-6 bg-claude-card border-3 border-mc-border shadow-pixel">
      <div className="flex items-center justify-between mb-4 border-b border-mc-border/20 pb-3">
        <div>
          <h3 className="font-black text-base pixel-font text-claude-surface uppercase tracking-wide">
            REWARD-DRIVEN WORKFLOW DAG (VERSION {currentVersion})
          </h3>
          <p className="text-xs text-claude-surface/75">
            Mutated DAG topology optimized for maximum financial risk capture and minimal redundancy.
          </p>
        </div>
        <span className="mc-badge bg-claude-amber text-white">REWARD: 0.89</span>
      </div>

      {/* DAG Flow Horizontal Timeline */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.step_id || idx}>
            <div className="flex-shrink-0 w-52 mc-card p-3 bg-claude-cream/90 border-2 border-mc-border hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-claude-surface/70">
                <span>STEP {idx + 1}</span>
                <span className="flex items-center gap-1 text-mc-emerald font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>DONE</span>
                </span>
              </div>

              <h4 className="font-bold text-xs text-claude-surface truncate mb-1">
                {step.agent_name}
              </h4>

              <p className="text-[11px] text-claude-surface/80 line-clamp-2 mb-2 text-justify">
                {step.output_summary}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-mc-border/10 text-[10px] font-mono text-claude-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-claude-amber" />
                  <span>{step.timestamp || "12:00:00"}</span>
                </span>
                <span className="text-claude-orange uppercase font-bold">Artifact</span>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 flex-shrink-0 text-claude-amber" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
