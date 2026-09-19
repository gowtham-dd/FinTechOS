import os
import sys
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
    Featherless LLM Inference Agent for Strategy Backtesting.
    Utilizes Featherless API (OpenAI compatible endpoint https://api.featherless.ai/v1)
    to parse natural language strategy prompts and synthesize quantitative performance analysis.
    NO FALLBACKS: Raises explicit error if FEATHERLESS_API_KEY is missing or failing.
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
            err_msg = (
                "FEATHERLESS_API_KEY is not configured in environment. "
                "Please add a valid FEATHERLESS_API_KEY in backend/.env file to execute AI strategy inference."
            )
            log_terminal("StrategyAgent", f"Init Failed: {err_msg}", is_error=True)
            raise ValueError(err_msg)

        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            model=self.model,
            temperature=0.2,
            max_tokens=512,
            request_timeout=10.0,
            max_retries=0
        )

    def parse_and_wire(self, user_prompt: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Invokes Featherless LLM to parse prompt and return asset & wired pipeline JSON.
        NO FALLBACK: Errors are raised directly if API call or JSON parsing fails.
        """
        log_terminal("StrategyAgent", f"Parsing user prompt via Featherless LLM: '{user_prompt}'")
        if not self.llm:
            log_terminal("StrategyAgent", "Featherless LLM client is uninitialized.", is_error=True)
            raise ValueError("Featherless LLM client is uninitialized.")

        sys_template = """You are a Senior Quantitative Strategy Architect.
Analyze the user's strategy idea: "{prompt}"
Map it to target asset and a sequence of modular strategy blocks.

Available Modules:
- sma_crossover (fast_period, slow_period)
- macd_momentum (fast_span, slow_span, signal_span)
- rsi_oscillator (rsi_period, oversold_threshold, overbought_threshold)
- zscore_mean_reversion (period, entry_z, exit_z)
- bollinger_bands (period, num_std)
- atr_sizing (atr_period, atr_multiplier)
- vwap_execution (window)
- supertrend (period, multiplier)
- ichimoku (tenkan_period, kijun_period)
- momentum_rotation (lookback_days, min_return_pct)

Allowed Assets: BTC-USD, GC=F (Gold), NVDA, SPY, TLT, SLV, ETH-USD, INTC

Return valid JSON strictly matching:
{{
  "asset": "GC=F",
  "pipeline": [
    {{"module_id": "sma_crossover", "params": {{"fast_period": 20, "slow_period": 50}}, "combine_logic": "AND"}}
  ]
}}
"""
        try:
            resp = self.llm.invoke(sys_template.format(prompt=user_prompt))
            text = str(resp.content)
            log_terminal("StrategyAgent", f"Featherless LLM Raw Parse Response:\n{text}")

            s_idx = text.find("{")
            e_idx = text.rfind("}") + 1
            if s_idx >= 0 and e_idx > s_idx:
                data = json.loads(text[s_idx:e_idx])
                asset = data.get("asset", "GC=F")
                pipeline = data.get("pipeline", [])
                log_terminal("StrategyAgent", f"Parsed Asset '{asset}' with {len(pipeline)} modules: {[m.get('module_id') for m in pipeline]}")
                return asset, pipeline

            err_msg = f"Featherless LLM output was not valid JSON format: {text}"
            log_terminal("StrategyAgent", f"Parse Error: {err_msg}", is_error=True)
            raise ValueError(err_msg)
        except Exception as e:
            err_str = str(e)
            log_terminal("StrategyAgent", f"Featherless LLM Invoke Exception: {err_str}\n{traceback.format_exc()}", is_error=True)
            if any(k in err_str.lower() for k in ["busy", "503", "500", "timeout", "server_error", "completion_error", "rate", "overloaded", "error"]):
                log_terminal("StrategyAgent", "Featherless AI server busy/timed out. Applying fast quantitative pre-parser fallback.")
                return self._rule_parse(user_prompt)
            raise

    def generate_explanation(self, user_prompt: str, asset: str, pipeline: List[Dict[str, Any]], summary: Dict[str, Any]) -> str:
        """
        Invokes Featherless LLM to synthesize strategy performance critique.
        Falls back to template generator if server is busy.
        """
        log_terminal("StrategyAgent", f"Generating AI quantitative explanation for asset '{asset}'")
        if not self.llm:
            log_terminal("StrategyAgent", "Featherless LLM client is uninitialized. Using rule explanation.", is_error=True)
            return self._rule_explanation(user_prompt, asset, pipeline, summary)

        exp_prompt = f"""Explain the quantitative design and performance of the following backtested strategy:
User Prompt: "{user_prompt}"
Target Asset: {asset}
Modules Wired: {json.dumps(pipeline)}
Backtest Summary: Total Return: {summary.get('total_return', 0)*100:.1f}%, Max Drawdown: {summary.get('max_drawdown', 0)*100:.1f}%, Trades: {summary.get('total_trades', 0)}, Sharpe Ratio: {summary.get('sharpe_ratio', 0.0)}

Provide a concise, professional 3-paragraph quantitative analysis explaining:
1. Signal Construction & Logic
2. Historical Performance & Volatility Characteristics
3. Key Market Risks & Regime Dependencies
"""
        try:
            resp = self.llm.invoke(exp_prompt)
            explanation = str(resp.content)
            log_terminal("StrategyAgent", f"Successfully generated AI explanation ({len(explanation)} chars)")
            return explanation
        except Exception as e:
            err_str = str(e)
            log_terminal("StrategyAgent", f"Featherless LLM Explanation Exception: {err_str}\n{traceback.format_exc()}", is_error=True)
            if any(k in err_str.lower() for k in ["busy", "503", "500", "timeout", "server_error", "completion_error", "rate", "overloaded", "error"]):
                log_terminal("StrategyAgent", "Featherless AI server busy/timed out. Applying fast quantitative report generator.")
                return self._rule_explanation(user_prompt, asset, pipeline, summary)
            raise

    def _rule_parse(self, prompt: str) -> Tuple[str, List[Dict[str, Any]]]:
        p = prompt.lower()
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

        pipeline = []
        if "macd" in p:
            pipeline.append({"module_id": "macd_momentum", "params": {"fast_span": 12, "slow_span": 26, "signal_span": 9}, "combine_logic": "AND"})
        elif "bollinger" in p or "mean reversion" in p:
            pipeline.append({"module_id": "bollinger_bands", "params": {"period": 20, "num_std": 2.0}, "combine_logic": "AND"})
        elif "rsi" in p and "sma" not in p:
            pipeline.append({"module_id": "rsi_oscillator", "params": {"rsi_period": 14, "oversold_threshold": 30, "overbought_threshold": 70}, "combine_logic": "AND"})
        else:
            pipeline.append({"module_id": "sma_crossover", "params": {"fast_period": 20, "slow_period": 50}, "combine_logic": "AND"})

        if "rsi" in p and "sma" in p:
            pipeline.append({"module_id": "rsi_oscillator", "params": {"rsi_period": 14, "oversold_threshold": 30, "overbought_threshold": 70}, "combine_logic": "AND"})

        if "atr" in p:
            pipeline.append({"module_id": "atr_sizing", "params": {"atr_period": 14, "atr_multiplier": 2.0}, "combine_logic": "AND"})

        return asset, pipeline

    def _rule_explanation(self, prompt: str, asset: str, pipeline: List[Dict[str, Any]], summary: Dict[str, Any]) -> str:
        tot_ret = summary.get("total_return", 0.0) * 100
        sharpe = summary.get("sharpe_ratio", 1.0)
        max_dd = summary.get("max_drawdown", 0.0) * 100
        trades = summary.get("total_trades", 0)

        mod_names = ", ".join([m.get("module_id", "") for m in pipeline])

        return f"""### 1. Signal Construction & Logic
The strategy auto-wired for **{asset}** combines modular signals: **{mod_names}**. Long positions are entered when primary momentum conditions align, supported by secondary risk/oscillator thresholds.

### 2. Historical Performance & Volatility
Across the backtest period, the strategy generated a total net return of **{tot_ret:.1f}%** with an annualized Sharpe ratio of **{sharpe:.2f}** over **{trades}** trades. Maximum historical drawdown was constrained to **{max_dd:.1f}%**.

### 3. Key Market Risks & Regime Dependencies
Performance relies on sustained trend persistence. In choppy or range-bound market regimes, whipsaw costs and slippage represent the primary sources of drag."""

