"use client";

export interface RebalanceRecord {
  id: string;
  date: string;
  weights: { [asset: string]: number };
  capital: number;
  expectedReturn: number;
  volatility: number;
  sharpe: number;
  note?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  capital: number;
  riskTolerance: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
  portfolioName: string;
  weights: { [asset: string]: number };
  preset: "MAX_SHARPE" | "MIN_VOL" | "EQUAL" | "CUSTOM";
  updatedAt: string;
  rebalanceHistory: RebalanceRecord[];
}

export const PRESET_PROFILES: UserProfile[] = [
  {
    id: "gowtham_lead_quant",
    name: "Gowtham",
    email: "gowtham@fintechos.ai",
    role: "Lead Quant Researcher & Alpha Architect",
    avatarColor: "from-orange-500 to-amber-600",
    capital: 250000,
    riskTolerance: "MODERATE",
    portfolioName: "Gowtham's Multi-Asset Alpha Portfolio",
    weights: { "GC=F": 0.632, "BTC-USD": 0.101, NVDA: 0.267 },
    preset: "MAX_SHARPE",
    updatedAt: "2026-09-19 14:30 UTC",
    rebalanceHistory: [
      {
        id: "reb_101",
        date: "2026-09-15",
        weights: { "GC=F": 0.60, "BTC-USD": 0.15, NVDA: 0.25 },
        capital: 230000,
        expectedReturn: 0.384,
        volatility: 0.218,
        sharpe: 1.58,
        note: "Pre-FOMC rebalance into Gold safety buffer"
      },
      {
        id: "reb_102",
        date: "2026-09-19",
        weights: { "GC=F": 0.632, "BTC-USD": 0.101, NVDA: 0.267 },
        capital: 250000,
        expectedReturn: 0.378,
        volatility: 0.207,
        sharpe: 1.63,
        note: "Optimal MPT Tangency allocation locked"
      }
    ]
  },
  {
    id: "elena_fund_pm",
    name: "Elena Rostova",
    email: "e.rostova@helios-capital.com",
    role: "Portfolio Manager, Macro Defensive Fund",
    avatarColor: "from-emerald-600 to-teal-700",
    capital: 1000000,
    riskTolerance: "CONSERVATIVE",
    portfolioName: "Helios Capital Global Min-Variance Strategy",
    weights: { "GC=F": 0.705, "BTC-USD": 0.052, NVDA: 0.243 },
    preset: "MIN_VOL",
    updatedAt: "2026-09-18 09:15 UTC",
    rebalanceHistory: [
      {
        id: "reb_201",
        date: "2026-09-01",
        weights: { "GC=F": 0.75, "BTC-USD": 0.05, NVDA: 0.20 },
        capital: 980000,
        expectedReturn: 0.245,
        volatility: 0.162,
        sharpe: 1.26,
        note: "Quarterly institutional risk dampener"
      },
      {
        id: "reb_202",
        date: "2026-09-18",
        weights: { "GC=F": 0.705, "BTC-USD": 0.052, NVDA: 0.243 },
        capital: 1000000,
        expectedReturn: 0.262,
        volatility: 0.168,
        sharpe: 1.32,
        note: "Calibrated to global minimum volatility point"
      }
    ]
  },
  {
    id: "alex_prop_trader",
    name: "Alex Chen",
    email: "alex.c@apexprop.io",
    role: "High-Beta Tech & Digital Asset Trader",
    avatarColor: "from-purple-600 to-indigo-600",
    capital: 75000,
    riskTolerance: "AGGRESSIVE",
    portfolioName: "Apex High-Beta Momentum Fund",
    weights: { "GC=F": 0.15, "BTC-USD": 0.45, NVDA: 0.40 },
    preset: "CUSTOM",
    updatedAt: "2026-09-19 11:45 UTC",
    rebalanceHistory: [
      {
        id: "reb_301",
        date: "2026-09-10",
        weights: { "GC=F": 0.20, "BTC-USD": 0.40, NVDA: 0.40 },
        capital: 68000,
        expectedReturn: 0.542,
        volatility: 0.428,
        sharpe: 1.17,
        note: "Increased crypto exposure prior to breakout"
      },
      {
        id: "reb_302",
        date: "2026-09-19",
        weights: { "GC=F": 0.15, "BTC-USD": 0.45, NVDA: 0.40 },
        capital: 75000,
        expectedReturn: 0.569,
        volatility: 0.449,
        sharpe: 1.18,
        note: "Trimmed Gold to maximize upside beta"
      }
    ]
  }
];

const ACTIVE_USER_KEY = "fintechos_active_user_id";
const USER_PORTFOLIOS_PREFIX = "fintechos_user_portfolio_";

export function getActiveUser(): UserProfile | null {
  if (typeof window === "undefined") return PRESET_PROFILES[0];
  try {
    const activeId = localStorage.getItem(ACTIVE_USER_KEY);
    if (!activeId) return PRESET_PROFILES[0]; // Default to Gowtham for instant seamless access

    // Check user-specific storage
    const stored = localStorage.getItem(`${USER_PORTFOLIOS_PREFIX}${activeId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    const preset = PRESET_PROFILES.find((p) => p.id === activeId);
    return preset || PRESET_PROFILES[0];
  } catch {
    return PRESET_PROFILES[0];
  }
}

export function setActiveUser(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_USER_KEY, profile.id);
    localStorage.setItem(`${USER_PORTFOLIOS_PREFIX}${profile.id}`, JSON.stringify(profile));
    window.dispatchEvent(new Event("user-auth-change"));
  } catch (e) {
    console.error("Failed to set active user:", e);
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
    window.dispatchEvent(new Event("user-auth-change"));
  } catch (e) {
    console.error("Failed to logout:", e);
  }
}

export function saveUserPortfolio(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC"
    };
    localStorage.setItem(`${USER_PORTFOLIOS_PREFIX}${profile.id}`, JSON.stringify(updated));
    if (localStorage.getItem(ACTIVE_USER_KEY) === profile.id) {
      window.dispatchEvent(new Event("user-auth-change"));
    }
  } catch (e) {
    console.error("Failed to save portfolio:", e);
  }
}

export function createCustomUser(name: string, email: string, capital: number, riskTolerance: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE"): UserProfile {
  const id = `user_${Date.now()}`;
  const newProfile: UserProfile = {
    id,
    name: name.trim() || "Independent Quant",
    email: email.trim() || "quant@research.net",
    role: "Quantitative Analyst",
    avatarColor: "from-blue-600 to-indigo-600",
    capital: capital || 100000,
    riskTolerance,
    portfolioName: `${name.trim() || "My"}'s Custom Portfolio`,
    weights: { "GC=F": 0.50, "BTC-USD": 0.20, NVDA: 0.30 },
    preset: "CUSTOM",
    updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    rebalanceHistory: [
      {
        id: `reb_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        weights: { "GC=F": 0.50, "BTC-USD": 0.20, NVDA: 0.30 },
        capital: capital || 100000,
        expectedReturn: 0.384,
        volatility: 0.245,
        sharpe: 1.40,
        note: "Initial personalized portfolio allocation"
      }
    ]
  };

  setActiveUser(newProfile);
  return newProfile;
}
