"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("fintech_os_auth_token");
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Trigger global auth modal with pending target URL
          window.dispatchEvent(new CustomEvent("require-auth", { detail: { targetHref: pathname } }));
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      const token = localStorage.getItem("fintech_os_auth_token");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("user-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("user-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono font-bold text-stone-500">Verifying Quant Authentication Token...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-700 flex items-center justify-center mb-5 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900 tracking-tight mb-2">
          Protected Research Screen Access
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed mb-6 font-medium">
          Accessing <span className="font-mono font-bold text-amber-800">{pathname}</span> requires active Quant FinTech OS authentication. Please sign in or use 1-click evaluation access.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("require-auth", { detail: { targetHref: pathname } }))}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            Sign In / Sample Account
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
