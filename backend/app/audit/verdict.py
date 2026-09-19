from typing import Dict, Any, Optional
import numpy as np

def compute_deterministic_verdict(dev_res: Dict[str, Any], holdout_res: Optional[Dict[str, Any]] = None, cfg: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    100% Deterministic Two-Phase Verdict Engine.
    Phase A: Evaluates MDE power, trade sample size, and selection-aware max-stat p-value.
    Phase B: Evaluates frozen candidate against data-layer atomic holdout store.
    """
    cfg = cfg or {"min_power": 0.50, "alpha_dev": 0.10, "alpha_hold": 0.10}

    metrics = dev_res.get("metrics", {})
    audit = dev_res.get("audit", {})

    total_trades = metrics.get("total_trades", 0)
    mde_sharpe = metrics.get("mde_sharpe", 1.5)
    sharpe_ci_lower = metrics.get("sharpe_ci_lower", -0.5)
    sharpe_ci_upper = metrics.get("sharpe_ci_upper", 0.5)
    p_selection = audit.get("p_selection", 0.35)

    # 1. Deterministic Explanation Flags
    flags = {
        "TRADES_LT_30": total_trades < 30,
        "SHARPE_CI_SPANS_ZERO": (sharpe_ci_lower <= 0 <= sharpe_ci_upper),
        "TOP2_TRADES_CONCENTRATION": metrics.get("top2_trades_pnl_share", 0.0) > 0.50,
        "ISOLATED_PEAK": audit.get("is_isolated_peak", False),
        "COST_BREAKEVEN_LOW": metrics.get("breakeven_cost_bps", 100.0) < 15.0,
        "SEARCH_BUDGET_HIGH": audit.get("total_logged_trials", 0) > 100
    }

    # 2. Phase A Dev Verdict
    if dev_res.get("data_gate_failed", False):
        verdict = "DATA_GATE_FAILED"
    elif mde_sharpe > 1.2 or total_trades < 15:
        verdict = "INSUFFICIENT_EVIDENCE"
    elif p_selection > cfg["alpha_dev"] or flags["SHARPE_CI_SPANS_ZERO"]:
        verdict = "INDISTINGUISHABLE_FROM_LUCK"
    else:
        verdict = "PROVISIONAL_PASS"

    # 3. Phase B Holdout Verdict (if revealed)
    if holdout_res is not None and verdict == "PROVISIONAL_PASS":
        if not holdout_res.get("evidential", True):
            verdict = "HOLDOUT_SPENT"
        else:
            h_metrics = holdout_res.get("holdout_metrics", {})
            h_trades = h_metrics.get("total_trades", 0)
            h_p_null = h_metrics.get("p_null", 0.30)
            
            if h_trades < 5:
                verdict = "INSUFFICIENT_EVIDENCE"
            elif h_p_null <= cfg["alpha_hold"]:
                verdict = "SURVIVES_HOLDOUT"
            else:
                verdict = "INDISTINGUISHABLE_FROM_LUCK"

    return {
        "verdict": verdict,
        "flags": flags,
        "verdict_disclaimer": "Pass verdict (SURVIVES_HOLDOUT) is Retrospective Hypothesis Stress-Test Result — Not Proof of Future Return."
    }
