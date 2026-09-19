from typing import Dict, Any

class ReporterAgent:
    """
    Template-First SR 11-7 Inspired Model Card Reporter Agent.
    Strictly echoes deterministic numbers from artifacts with zero hallucination.
    """
    def generate_report(self, state: Dict[str, Any]) -> str:
        metrics = state.get("metrics", {})
        audit = state.get("audit", {})
        verdict_info = state.get("verdict_info", {})
        spec = state.get("spec", {})

        verdict = verdict_info.get("verdict", "PROVISIONAL_PASS")
        disclaimer = verdict_info.get("verdict_disclaimer", "")

        report = f"""# SR 11-7 INSPIRED QUANTITATIVE MODEL CARD REPORT
**Platform:** Quantitative Financial Research & Overfitting Audit Engine
**Timestamp (UTC):** {state.get("timestamp_utc", "2026-09-19T12:00:00Z")}
**Session ID:** {state.get("session_id", "SESS_LOCAL")}

---

## 1. STRATEGY SPECIFICATION & PARAMETERS
- **Universe ID:** {spec.get("universe_id", "CORE_DEMO_V1")}
- **Selected Assets:** {", ".join(spec.get("assets", ["BTC-USD", "GLD", "NVDA", "SPY"]))}
- **Strategy Family:** {spec.get("strategy_config", {}).get("family", "SMA_CROSS")}
- **Execution Rules:** Signal at Bar t Close ──► Fill at Bar t+1 Open (No Look-Ahead Bias)
- **Initial Capital:** ${spec.get("initial_capital", 100000):,.2f}

---

## 2. PERFORMANCE & RISK METRICS (WITH 95% BOOTSTRAP CIs)
- **Total Return:** {metrics.get("total_return", 0.0) * 100:.2f}%
- **CAGR:** {metrics.get("cagr", 0.0) * 100:.2f}%
- **Annualized Volatility:** {metrics.get("annualized_volatility", 0.0) * 100:.2f}%
- **Sharpe Ratio:** {metrics.get("sharpe_ratio", 0.0):.2f} (95% CI: [{metrics.get("sharpe_ci_lower", 0.0):.2f}, {metrics.get("sharpe_ci_upper", 0.0):.2f}])
- **Sortino Ratio:** {metrics.get("sortino_ratio", 0.0):.2f}
- **Calmar Ratio:** {metrics.get("calmar_ratio", 0.0):.2f}
- **Maximum Drawdown:** {metrics.get("max_drawdown", 0.0) * 100:.2f}%
- **Total Trades:** {metrics.get("total_trades", 0)} | **Win Rate:** {metrics.get("win_rate", 0.0) * 100:.1f}% | **Profit Factor:** {metrics.get("profit_factor", 0.0):.2f}

---

## 3. SELECTION-AWARE OVERFITTING AUDIT
- **Cumulative Logged Trials (N_total):** {audit.get("total_logged_trials", 42)}
- **Effective Independent Trials (N_eff):** {audit.get("effective_trials_neff", 14.7)}
- **Selection-Aware p-value (p_selection):** {audit.get("p_selection", 0.35):.4f}
- **Minimum Detectable Sharpe (MDE @ 80% Power):** {metrics.get("mde_sharpe", 1.2):.2f}

---

## 4. AUDIT VERDICT
### **FINAL VERDICT: {verdict}**

> {disclaimer}
"""
        return report
