import numpy as np
import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseStrategyModule(ABC):
    """
    Abstract Base Class for Independent Modular Strategy Blocks.
    Each module can generate trading signals, compute risk/regimes/simulations,
    and be dynamically wired into an execution pipeline by an AI Agent or User UI.
    """
    
    @property
    @abstractmethod
    def module_id(self) -> str:
        """Unique identifier (e.g. 'sma_crossover')"""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable display name"""
        pass

    @property
    @abstractmethod
    def category(self) -> str:
        """Category: 'Trend', 'Momentum', 'Mean Reversion', 'Risk & Sizing', 'Execution', 'ML & Regimes', 'Quantitative Risk'"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Detailed description of the strategy logic"""
        pass

    @property
    @abstractmethod
    def parameters_schema(self) -> Dict[str, Any]:
        """Schema defining configurable parameters, types, defaults, and bounds"""
        pass

    @abstractmethod
    def generate_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> np.ndarray:
        """
        Generates signal array (1 = Long / Buy, -1 = Short, 0 = Cash / Neutral)
        given OHLCV dataframe and parameters dict.
        """
        pass

    def to_dict(self) -> Dict[str, Any]:
        return {
            "module_id": self.module_id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "parameters_schema": self.parameters_schema
        }
