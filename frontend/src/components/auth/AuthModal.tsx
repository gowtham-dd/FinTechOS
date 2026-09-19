"use client";
import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles, LogOut, CheckCircle2 } from "lucide-react";

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
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = isSignup ? `${apiBase}/api/v1/auth/signup` : `${apiBase}/api/v1/auth/login`;

    try {
      const payload = isSignup
        ? { email, password, full_name: fullName || "Quant Researcher" }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        onAuthSuccess(data.access_token, data.user);
        onClose();
      } else {
        setErrorMsg(data.detail || "Authentication failed. Please check credentials.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Unable to reach backend server. Please verify FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-amber-200/90 rounded-2xl shadow-2xl overflow-hidden text-[#1E1915]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-100/90 via-white to-orange-100/90 px-6 py-4 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-600/20 border border-white/40">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E1915] text-base tracking-tight">
                {user ? "User Account Settings" : isSignup ? "Create FinTech OS Account" : "Sign In to FinTech OS"}
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

        {/* Content Body */}
        <div className="p-6">
          {user ? (
            /* Logged In View */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-amber-400 text-amber-900 flex items-center justify-center font-black text-2xl shadow-sm">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4 className="font-bold text-lg text-stone-900">{user.full_name}</h4>
                <p className="text-xs text-stone-500 font-mono mt-0.5">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authenticated via MongoDB Atlas Cloud</span>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-100 flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold transition text-stone-700"
                >
                  Close Window
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Sign In / Signup) */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {isSignup && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
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
                    required
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
                    required
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin text-white">⏳</span> Authenticating...
                  </span>
                ) : (
                  <>
                    <span>{isSignup ? "Create Account" : "Sign In to Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-amber-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setErrorMsg("");
                  }}
                  className="text-xs text-amber-800 font-semibold hover:underline"
                >
                  {isSignup ? "Already have an account? Sign In" : "Don't have an account? Create One"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
