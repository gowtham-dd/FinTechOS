"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, LineChart, Sliders, ShieldCheck, Award, Lock } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/research", label: "RESEARCH LAB", icon: Sparkles },
    { href: "/assets", label: "ASSETS & INDICATORS", icon: LineChart },
    { href: "/robustness", label: "ROBUSTNESS & REGIMES", icon: Sliders },
    { href: "/audit", label: "AUDIT CENTER", icon: ShieldCheck },
    { href: "/calibration", label: "CALIBRATION", icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-claude-amber/20 shadow-sm px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-claude-orange to-claude-amber shadow-sm flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform duration-200">
            Q
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-claude-surface group-hover:text-claude-orange transition-colors">
                QUANT FINTECH
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-claude-amber/10 text-claude-orange border border-claude-amber/30 text-[10px] font-bold tracking-wider uppercase">
                AGENT OS
              </span>
            </div>
            <p className="text-[11px] font-medium text-claude-surface/60 hidden sm:block">
              Institutional Overfitting Audit & Research Engine
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? "bg-claude-orange text-white shadow-sm"
                    : "text-claude-surface/80 hover:text-claude-surface hover:bg-claude-amber/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>HOLDOUT VAULT ACTIVE</span>
          </div>
          <Link
            href="/research"
            className="pro-btn-primary px-4 py-2 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW RESEARCH</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
