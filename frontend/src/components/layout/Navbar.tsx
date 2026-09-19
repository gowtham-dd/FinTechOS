"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

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

  const [authUser, setAuthUser] = useState<{ email: string; full_name: string } | null>(null);

  useEffect(() => {
    const updateAuthUser = () => {
      try {
        const stored = localStorage.getItem("fintech_os_auth_user");
        if (stored) {
          setAuthUser(JSON.parse(stored));
        } else {
          setAuthUser(null);
        }
      } catch (e) {
        setAuthUser(null);
      }
    };
    updateAuthUser();
    window.addEventListener("user-auth-change", updateAuthUser);
    window.addEventListener("storage", updateAuthUser);
    return () => {
      window.removeEventListener("user-auth-change", updateAuthUser);
      window.removeEventListener("storage", updateAuthUser);
    };
  }, []);

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

  const handleAuthButtonClick = () => {
    window.dispatchEvent(new CustomEvent("require-auth", { detail: { openOnly: true } }));
  };

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

        {/* Right Top Auth / Profile Button (Replaces MongoDB Pill) */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handleAuthButtonClick}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/60 text-xs font-bold text-amber-950 shadow-2xs transition-all cursor-pointer group"
          >
            {authUser ? (
              <>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  {authUser.full_name ? authUser.full_name.charAt(0).toUpperCase() : authUser.email.charAt(0).toUpperCase()}
                </div>
                <span className="font-extrabold">{authUser.full_name || authUser.email}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse ml-0.5" />
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Sign Up / Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-amber-300 text-amber-900 bg-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleAuthButtonClick();
            }}
            className="mt-2 w-full py-2 px-3 rounded-lg border border-amber-300 bg-white text-xs font-bold text-amber-950 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>{authUser ? (authUser.full_name || authUser.email) : "Sign Up / Sign In"}</span>
          </button>
        </div>
      )}
    </header>
  );
};


