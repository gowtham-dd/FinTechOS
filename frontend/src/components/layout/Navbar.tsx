"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Database } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Research Lab", href: "/research" },
    { label: "Assets & Indicators", href: "/assets" },
    { label: "Robustness & Regimes", href: "/robustness" },
    { label: "Audit Center", href: "/audit" },
    { label: "Portfolio & Allocation", href: "/portfolio-optimization" },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    try {
      const token = localStorage.getItem("fintech_os_auth_token");
      if (!token) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("require-auth", { detail: { targetHref: href } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
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
                  onClick={(e) => handleNavClick(e, item.href)}
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
          </nav>

          {/* Right Status Pill */}
          <div className="hidden sm:flex items-center gap-3">
            {/* MongoDB Connection Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-300/80 bg-amber-50/80 text-xs font-semibold text-amber-900 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>MongoDB Atlas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0 shadow-xs animate-pulse" />
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
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item.href);
                }}
                className="px-3 py-2 text-sm font-semibold text-gray-800 hover:text-claude-orange hover:bg-white rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
};

