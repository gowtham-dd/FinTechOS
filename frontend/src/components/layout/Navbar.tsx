"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogIn, Database } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fintech_os_auth_user");
      if (stored) {
        setAuthUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAuthSuccess = (token: string, user: AuthUser) => {
    localStorage.setItem("fintech_os_auth_token", token);
    localStorage.setItem("fintech_os_auth_user", JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("fintech_os_auth_token");
    localStorage.removeItem("fintech_os_auth_user");
    setAuthUser(null);
    setAuthModalOpen(false);
  };

  const navLinks = [
    { label: "Research Lab", href: "/research" },
    { label: "Assets & Indicators", href: "/assets" },
    { label: "Robustness & Regimes", href: "/robustness" },
    { label: "Audit Center", href: "/audit" },
    { label: "Portfolio & Allocation", href: "/portfolio-optimization" },
  ];

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

          {/* Right User Auth Button & Status Pill */}
          <div className="hidden sm:flex items-center gap-3">
            {/* MongoDB Connection Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-300/80 bg-amber-50/80 text-xs font-semibold text-amber-900 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>MongoDB Atlas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0 shadow-xs animate-pulse" />
            </div>

            {/* Auth Account Button */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 hover:border-amber-400 bg-white hover:bg-amber-50/50 transition-all text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
            >
              {authUser ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-black text-[10px]">
                    {authUser.full_name ? authUser.full_name.charAt(0).toUpperCase() : authUser.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[120px]">{authUser.full_name || authUser.email}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="p-1.5 rounded-xl border border-stone-200 text-stone-700"
            >
              <User className="w-5 h-5" />
            </button>
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

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>{authUser ? `Account: ${authUser.full_name}` : "Sign In / Register"}</span>
              <LogIn className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        )}
      </header>

      {/* Auth Dialog Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={authUser}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />
    </>
  );
};

