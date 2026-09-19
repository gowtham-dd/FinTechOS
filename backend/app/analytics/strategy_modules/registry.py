import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Type

from app.analytics.strategy_modules.base import BaseStrategyModule
from app.analytics.strategy_modules.sma_crossover import SMACrossoverModule
from app.analytics.strategy_modules.macd_momentum import MACDMomentumModule
from app.analytics.strategy_modules.rsi_oscillator import RSIOscillatorModule
from app.analytics.strategy_modules.zscore_mean_reversion import ZScoreMeanReversionModule
from app.analytics.strategy_modules.bollinger_bands import BollingerBandsModule
from app.analytics.strategy_modules.atr_sizing import ATRSizingModule
from app.analytics.strategy_modules.vwap_execution import VWAPExecutionModule
from app.analytics.strategy_modules.supertrend import SupertrendModule
from app.analytics.strategy_modules.ichimoku import IchimokuCloudModule
from app.analytics.strategy_modules.momentum_rotation import MomentumRotationModule
from app.analytics.strategy_modules.ml_regime import MLRegimeModule
from app.analytics.strategy_modules.pairs_trading import PairsTradingModule
from app.analytics.strategy_modules.monte_carlo import MonteCarloModule
from app.analytics.strategy_modules.var_cvar import VaRCVaRModule
from app.analytics.strategy_modules.portfolio_optimization import PortfolioOptimizationModule

class StrategyModuleRegistry:
    """
    Central Registry for Strategy Signal Modules & Advanced Quantitative Tools.
    Clearly distinguishes Signal Generation Rules from Portfolio & Risk Analytics Engines.
    """
    def __init__(self):
        self._modules: Dict[str, BaseStrategyModule] = {}
        self._register_default_modules()

    def _register_default_modules(self):
        default_instances = [
            SMACrossoverModule(),
            MACDMomentumModule(),
            RSIOscillatorModule(),
            ZScoreMeanReversionModule(),
            BollingerBandsModule(),
            ATRSizingModule(),
            VWAPExecutionModule(),
            SupertrendModule(),
            IchimokuCloudModule(),
            MomentumRotationModule(),
            MLRegimeModule(),
            PairsTradingModule(),
            MonteCarloModule(),
            VaRCVaRModule(),
            PortfolioOptimizationModule()
        ]
        for mod in default_instances:
            self._modules[mod.module_id] = mod

    def register(self, module: BaseStrategyModule):
        self._modules[module.module_id] = module

    def get_module(self, module_id: str) -> Optional[BaseStrategyModule]:
        return self._modules.get(module_id)

    def list_strategy_signal_modules(self) -> List[Dict[str, Any]]:
        """Returns ONLY signal & trade execution modules for strategy wiring"""
        signal_cats = ["Trend Following", "Momentum", "Mean Reversion", "Volatility / Breakout", "Execution", "Risk & Sizing", "Statistical Arbitrage"]
        return [mod.to_dict() for mod in self._modules.values() if mod.category in signal_cats]

    def list_modules(self) -> List[Dict[str, Any]]:
        return [mod.to_dict() for mod in self._modules.values()]

    def combine_signals(self, df: pd.DataFrame, wired_pipeline: List[Dict[str, Any]]) -> np.ndarray:
        """
        Combines signals from multiple wired strategy modules using logical AND/OR consensus.
        """
        if not wired_pipeline:
            return np.ones(len(df), dtype=int)

        n = len(df)
        combined_signal = np.ones(n, dtype=int)

        for step in wired_pipeline:
            mod_id = step.get("module_id")
            params = step.get("params", {})
            logic = step.get("combine_logic", "AND")

            mod = self.get_module(mod_id)
            if mod and mod.category != "Portfolio Optimization" and mod.category != "Quantitative Risk":
                sig = mod.generate_signals(df, params)
                if logic == "OR":
                    combined_signal = np.bitwise_or(combined_signal, sig)
                else:
                    combined_signal = np.bitwise_and(combined_signal, sig)

        return combined_signal

registry_instance = StrategyModuleRegistry()
