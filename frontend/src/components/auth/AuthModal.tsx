"use client";
import React, { useState } from "react";
import { X, Lock, Mail, User, ArrowRight, Sparkles, LogOut, CheckCircle2, Zap, AlertCircle } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onAuthSuccess: (token: string, user: UserProfile) => void;
  onLogout: () => void;
}

export function AuthModal({ isOpen, onClose, user, onAuthSuccess, onLogout }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const validateForm = () => {
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address (e.g., name@domain.com).");
      return false;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }
    if (mode === "signup" && !fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validateForm()) return;

    setLoading(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = mode === "signup" ? `${apiBase}/api/v1/auth/signup` : `${apiBase}/api/v1/auth/login`;

    try {
      const payload = mode === "signup"
        ? { email: email.trim(), password, full_name: fullName.trim() }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      // Strict Validation: Ensure status is 200 and valid access_token is returned
      if (res.ok && res.status === 200 && data && data.access_token && data.user) {
        onAuthSuccess(data.access_token, data.user);
        showToast(mode === "signup" ? "Account created successfully!" : "Signed in successfully!");
        setTimeout(() => onClose(), 800);
      } else {
        // STRICT REJECTION: Invalid credentials must NOT log the user in!
        setErrorMsg(data.detail || "Invalid email address or password. Please verify credentials.");
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      setErrorMsg("Unable to connect to backend server. Please verify backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg("");
    setDemoLoading(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiBase}/api/v1/auth/demo`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.access_token) {
        onAuthSuccess(data.access_token, data.user);
        showToast("Logged in with Sample Quant Researcher Account!");
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg("Failed to connect demo account.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Unable to connect to backend server.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-amber-200/90 rounded-2xl shadow-2xl shadow-amber-950/20 overflow-hidden text-[#1E1915]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-100/90 via-white to-orange-100/90 px-6 py-4 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-600/20 border border-white/40">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1E1915] text-base tracking-tight">
                {user ? "Quant Researcher Profile" : mode === "signup" ? "Create FinTech OS Account" : "Sign In to FinTech OS"}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">MongoDB Atlas Cloud Database Connected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-amber-100/60 text-stone-500 hover:text-stone-900 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {user ? (
            /* Logged In User View */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-stone-900">{user.full_name}</h4>
                <p className="text-xs text-stone-500 font-mono mt-0.5">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mt-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MongoDB Atlas Cloud Authenticated</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-stone-500">Access Level:</span>
                  <span className="font-bold text-amber-900">Full System Access</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-500">Cloud Storage:</span>
                  <span className="font-bold text-emerald-700">MongoDB Atlas Cluster</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold transition text-stone-700 cursor-pointer"
                >
                  Continue Session
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form View */
            <div className="space-y-4">
              
              {/* Segmented Mode Switcher */}
              <div className="bg-amber-100/60 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-white text-amber-950 shadow-xs border border-amber-200/80 font-black"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-white text-amber-950 shadow-xs border border-amber-200/80 font-black"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* 1-Click Sample Account Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 hover:from-amber-200 hover:to-orange-200 border border-amber-300 text-amber-950 font-bold text-xs transition flex items-center justify-between shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-500 text-white shadow-xs">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {demoLoading ? "Connecting Sample Account..." : "1-Click Sample Quant Account"}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-mono uppercase font-black">
                  DEMO
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-amber-200/70"></div>
                <span className="flex-shrink mx-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  OR ENTER DETAILS
                </span>
                <div className="flex-grow border-t border-amber-200/70"></div>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Senior Quant Researcher"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="researcher@fintech-os.io"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-white">⏳</span> Processing...
                    </span>
                  ) : (
                    <>
                      <span>{mode === "signup" ? "Create Quant Account" : "Sign In to System"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
