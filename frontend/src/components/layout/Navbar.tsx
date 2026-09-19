"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { getActiveUser, UserProfile } from "@/lib/userStore";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getActiveUser());
    const handleAuth = () => setCurrentUser(getActiveUser());
    window.addEventListener("user-auth-change", handleAuth);
    return () => window.removeEventListener("user-auth-change", handleAuth);
  }, []);

  const navLinks = [
    { label: "Research Lab", href: "/research" },
    { label: "Assets & Indicators", href: "/assets" },
    { label: "Robustness & Regimes", href: "/robustness" },
    { label: "Audit Center", href: "/audit" },
    { label: "Calibration", href: "/calibration" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-stone-200/50 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo - Orange rounded square with Q + Stacked text */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-claude-orange shadow-sm flex items-center justify-center text-white font-black text-xl group-hover:scale-105 transition-transform duration-200 shrink-0">
            Q
          </div>
          <div className="flex flex-col justify-center leading-none gap-0.5">
            <span className="font-extrabold text-[14px] sm:text-[15px] tracking-tight text-gray-950 group-hover:text-claude-orange transition-colors">
              QUANT FINTECH
            </span>
            <span className="font-extrabold text-[14px] sm:text-[15px] tracking-tight text-gray-950 group-hover:text-claude-orange transition-colors">
              AGENT OS
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[13.5px] xl:text-[14.5px] font-semibold transition-colors duration-150 ${
                  isActive
                    ? "text-claude-orange font-bold"
                    : "text-gray-800 hover:text-claude-orange"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Profile Avatar Image/Icon right after Calibration */}
          <Link
            href="/optimization"
            title={currentUser ? `${currentUser.name} (${currentUser.role})` : "Portfolio Optimization & Login"}
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all overflow-hidden shrink-0 cursor-pointer ${
              pathname === "/optimization" || pathname === "/portfolio-optimization"
                ? "border-claude-orange ring-2 ring-claude-orange/30 shadow-xs bg-claude-orange/10"
                : "border-stone-300 hover:border-claude-orange bg-stone-100 hover:bg-white"
            }`}
          >
            {currentUser ? (
              <div className={`w-full h-full bg-gradient-to-tr ${currentUser.avatarColor || "from-orange-500 to-amber-600"} flex items-center justify-center text-white font-extrabold text-xs shadow-inner`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-600 hover:text-claude-orange">
                <User className="w-4 h-4" />
              </div>
            )}
          </Link>
        </nav>

        {/* Right Status Pill */}
        <div className="hidden sm:flex items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300/90 bg-white/70 backdrop-blur-xs text-xs sm:text-[13px] font-semibold text-gray-800 shadow-2xs hover:border-gray-400 transition-colors">
            <span>Holdout Vault Status:</span>
            <span className="text-emerald-600 font-bold">SECURE</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0 shadow-xs" />
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-gray-200/60 flex flex-col gap-2 bg-[#FAF6F0] px-2 pb-3">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-gray-800 hover:text-claude-orange hover:bg-white rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/portfolio-optimization"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm font-semibold text-gray-800 hover:text-claude-orange hover:bg-white rounded-lg transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentUser ? `bg-gradient-to-tr ${currentUser.avatarColor}` : "bg-stone-200"} flex items-center justify-center text-white text-xs font-bold`}>
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-stone-700" />}
              </div>
              <span>{currentUser ? `${currentUser.name}'s Portfolio` : "Portfolio Optimization"}</span>
            </div>
            {currentUser && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-claude-amber/15 text-claude-orange font-mono font-bold">
                ACTIVE
              </span>
            )}
          </Link>
          <div className="pt-2 border-t border-gray-200/40 flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-800">
            <span>Holdout Vault Status:</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              SECURE
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

