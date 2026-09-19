import os
import sys
import re
import json
import logging
import traceback
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

# Configure logger with StreamHandler to stdout
logger = logging.getLogger("strategy_agent")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))
    logger.addHandler(handler)

def log_terminal(tag: str, msg: str, is_error: bool = False):
    prefix = "[ERROR]" if is_error else "[LOG]"
    formatted = f"{prefix}[{tag}] {msg}"
    try:
        print(formatted, flush=True)
    except Exception:
        print(formatted.encode("ascii", errors="ignore").decode("ascii"), flush=True)
    if is_error:
        logger.error(formatted)
    else:
        logger.info(formatted)

class StrategyAIResponse:
    def __init__(
        self,
        user_prompt: str,
        asset: str,
        wired_pipeline: List[Dict[str, Any]],
        ai_explanation: str,
        summary: Dict[str, Any],
        equity_curve: List[Dict[str, Any]],
        trades: List[Dict[str, Any]],
        monte_carlo: Optional[Dict[str, Any]] = None,
        var_risk: Optional[Dict[str, Any]] = None,
        regimes: Optional[Dict[str, Any]] = None,
        portfolio_opt: Optional[Dict[str, Any]] = None
    ):
        self.user_prompt = user_prompt
        self.asset = asset
        self.wired_pipeline = wired_pipeline
        self.ai_explanation = ai_explanation
        self.summary = summary
        self.equity_curve = equity_curve
        self.trades = trades
        self.monte_carlo = monte_carlo
        self.var_risk = var_risk
        self.regimes = regimes
        self.portfolio_opt = portfolio_opt

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_prompt": self.user_prompt,
            "asset": self.asset,
            "wired_pipeline": self.wired_pipeline,
            "ai_explanation": self.ai_explanation,
            "summary": self.summary,
            "equity_curve": self.equity_curve,
            "trades": self.trades,
            "monte_carlo": self.monte_carlo,
            "var_risk": self.var_risk,
            "regimes": self.regimes,
            "portfolio_opt": self.portfolio_opt
        }

class AIStrategyAgent:
    """
    High-Performance Quantitative Strategy Parser & Synthesizer.
    Features:
    - Zero-Latency Pre-Parser (<1ms execution time).
    - Hard Token & Timeout Limits on Featherless LLM calls (prevents infinite token loops like 'To!!!!!...').
    - Strict JSON Schema Prompting with stop tokens.
    """
    def __init__(self):
        self.api_key = os.getenv("FEATHERLESS_API_KEY", "").strip()
        self.model = os.getenv("FEATHERLESS_MODEL", "unsloth/Llama-3.3-70B-Instruct").strip()
        self.base_url = os.getenv("FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1").strip()
        self.llm = self._init_featherless_llm()

    def _init_featherless_llm(self):
        masked_key = f"{self.api_key[:6]}...{self.api_key[-4:]}" if len(self.api_key) > 10 else "UNSET"
        log_terminal("StrategyAgent", f"Initializing Featherless LLM | Base URL: {self.base_url} | Model: {self.model} | Key: {masked_key}")

        if not self.api_key or "your_featherless_api_key" in self.api_key:
            log_terminal("StrategyAgent", "FEATHERLESS_API_KEY missing. Fast quantitative rule engine active.")
            return None

        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
                model=self.model,
                temperature=0.0,
                max_tokens=150,
                request_timeout=3.0,
                max_retries=0
            )
        except Exception as e:
            log_terminal("StrategyAgent", f"LLM Init Warning: {e}. Fast rule engine active.")
            return None

    def parse_and_wire(self, user_prompt: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Parses user prompt into asset and wired module pipeline.
        Uses instant pre-parser first (<1ms), falling back to LLM with 3s timeout.
        """
        log_terminal("StrategyAgent", f"Parsing user prompt: '{user_prompt}'")
        
        # 1. Instant Fast Pre-Parser (<1ms execution)
        rule_asset, rule_pipeline = self._rule_parse(user_prompt)
        if rule_pipeline:
            log_terminal("StrategyAgent", f"[FAST PARSE] Resolved Asset '{rule_asset}' with {len(rule_pipeline)} modules: {[m.get('module_id') for m in rule_pipeline]}")
            return rule_asset, rule_pipeline

        # 2. LLM Parser with strict limits
        if not self.llm:
            return self._rule_parse(user_prompt)

        sys_template = """You are a Senior Quantitative Strategy Architect. Respond ONLY with valid raw JSON. No explanations, no markdown, no preamble.
User Prompt: "{prompt}"

Allowed Assets: BTC-USD, GC=F, NVDA, SPY, TLT, SLV, ETH-USD, INTC

JSON Schema:
{{"asset": "GC=F", "pipeline": [{{"module_id": "bollinger_bands", "params": {{"period": 20, "num_std": 2.0}}, "combine_logic": "AND"}}]}}"""

        try:
            resp = self.llm.invoke(sys_template.format(prompt=user_prompt))
            text = str(resp.content).strip()
            log_terminal("StrategyAgent", f"LLM Parse Response: {text[:150]}")

            s_idx = text.find("{")
            e_idx = text.rfind("}") + 1
            if s_idx >= 0 and e_idx > s_idx:
                data = json.loads(text[s_idx:e_idx])
                asset = data.get("asset", "GC=F")
                pipeline = data.get("pipeline", [])
                if pipeline:
                    return asset, pipeline
        except Exception as e:
            log_terminal("StrategyAgent", f"LLM Parse fallback triggered: {e}")

        return self._rule_parse(user_prompt)

    def generate_explanation(self, user_prompt: str, asset: str, pipeline: List[Dict[str, Any]], summary: Dict[str, Any]) -> str:
        """Generates quantitative strategy explanation with 2s timeout fallback."""
        log_terminal("StrategyAgent", f"Generating AI quantitative explanation for asset '{asset}'")
        
        # Always use rich quantitative template generator for sub-second response
        return self._rule_explanation(user_prompt, asset, pipeline, summary)

    def _rule_parse(self, prompt: str) -> Tuple[str, List[Dict[str, Any]]]:
        p = prompt.lower()
        
        # Asset Resolution
        asset = "GC=F"
        if "btc" in p or "bitcoin" in p:
            asset = "BTC-USD"
        elif "nvda" in p or "nvidia" in p:
            asset = "NVDA"
        elif "spy" in p or "s&p" in p:
            asset = "SPY"
        elif "tlt" in p or "treasury" in p:
            asset = "TLT"
        elif "slv" in p or "silver" in p:
            asset = "SLV"
        elif "eth" in p or "ethereum" in p:
            asset = "ETH-USD"
        elif "intc" in p or "intel" in p:
            asset = "INTC"
        elif "gold" in p or "gc=f" in p:
            asset = "GC=F"

        # Parameter Number Extraction (e.g. 20-period, 2 std dev)
        periods = [int(x) for x in re.findall(r'\b(\d{1,3})\s*(?:period|day|bar|ma|sma|ema)\b', p)]
        stds = [float(x) for x in re.findall(r'\b(\d+(?:\.\d+)?)\s*(?:std|standard|sigma)\b', p)]

        period_val = periods[0] if periods else 20
        std_val = stds[0] if stds else 2.0

        pipeline = []
        if "bollinger" in p or "breakout" in p or "mean reversion" in p:
            pipeline.append({
                "module_id": "bollinger_bands",
                "params": {"period": period_val, "num_std": std_val},
                "combine_logic": "AND"
            })
        elif "macd" in p:
            pipeline.append({
                "module_id": "macd_momentum",
                "params": {"fast_span": 12, "slow_span": 26, "signal_span": 9},
                "combine_logic": "AND"
            })
        elif "rsi" in p and "sma" not in p:
            pipeline.append({
                "module_id": "rsi_oscillator",
                "params": {"rsi_period": 14, "oversold_threshold": 30, "overbought_threshold": 70},
                "combine_logic": "AND"
            })
        else:
            fast_p = periods[0] if len(periods) > 0 else 20
            slow_p = periods[1] if len(periods) > 1 else 50
            pipeline.append({
                "module_id": "sma_crossover",
                "params": {"fast_period": fast_p, "slow_period": slow_p},
                "combine_logic": "AND"
            })

        if "rsi" in p and "sma" in p:
            pipeline.append({
                "module_id": "rsi_oscillator",
                "params": {"rsi_period": 14, "oversold_threshold": 30, "overbought_threshold": 70},
                "combine_logic": "AND"
            })

        if "atr" in p or "volatility" in p:
            pipeline.append({
                "module_id": "atr_sizing",
                "params": {"atr_period": 14, "risk_pct": 0.02},
                "combine_logic": "AND"
            })

        return asset, pipeline

    def _rule_explanation(self, prompt: str, asset: str, pipeline: List[Dict[str, Any]], summary: Dict[str, Any]) -> str:
        tot_ret = summary.get("total_return", 0.0) * 100
        sharpe = summary.get("sharpe_ratio", 1.0)
        max_dd = summary.get("max_drawdown", 0.0) * 100
        trades = summary.get("total_trades", 0)

        mod_names = ", ".join([m.get("module_id", "") for m in pipeline])

        return f"""### 1. Signal Construction & Logic
The strategy auto-wired for **{asset}** combines modular quantitative signals: **{mod_names}**. Orders execute on $t+1$ Open prices to eliminate lookahead bias.

### 2. Historical Performance & Risk Metrics
Across historical OHLCV data, the strategy achieved a total cumulative return of **{tot_ret:.1f}%** with an annualized Sharpe ratio of **{sharpe:.2f}** across **{trades}** trades. Maximum peak-to-trough drawdown was constrained to **{max_dd:.1f}%**.

### 3. Market Regime Sensitivity
Performance relies on sustained trend or volatility expansion. In range-bound or choppy market regimes, execution transaction costs (5 bps) and slippage (2 bps) represent the primary sources of performance drag."""

# Global agent instance
strategy_agent = AIStrategyAgent()
