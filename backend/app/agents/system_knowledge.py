import json
from typing import Dict, Any, List
from app.memory.store import memory_store

PLATFORM_SYSTEM_KNOWLEDGE = """
# 🏛️ FINTECH AGENT OS: SYSTEM OPERATIONAL MANUAL & PLATFORM KNOWLEDGE BASE

## 1. PLATFORM OVERVIEW & CORE CAPABILITIES
FinTech Agent OS is a Validation-First Quantitative Financial Research, Automated Backtesting, and Overfitting Audit Platform.
It eliminates backtest overfitting (P-Hacking / Data Snooping) using a 10-node agentic pipeline, stationary block bootstrap CIs, a 30% Cryptographic Holdout Vault, a write-ahead SHA-256 trial ledger, and quantum QUBO portfolio optimization.

---

## 2. HOW TO RUN STRATEGIES IN OUR SYSTEM (STEP-BY-STEP UI GUIDE)

### Step 1: Submit Natural Language Strategy Prompt on Home Canvas (`/`)
1. Go to the **Home Page (`/`)**.
2. Locate the **Natural Language Strategy Console** at the top.
3. Type your prompt or click a **Preset Strategy Chip** (e.g., `Bollinger Bands`, `RSI Momentum`, `HMM Market Regime`, `Pairs Trading`).
   - **Exact Prompt Example for Gold**:
     `"Build a 20-period Bollinger Bands mean-reversion strategy on Gold (GC=F) with ATR position sizing"`
   - **Exact Prompt Example for Bitcoin**:
     `"Run a 20/50 SMA crossover strategy on BTC-USD with 2% risk fraction per trade"`
4. Click the **`⚡ Synthesize & Run Backtest`** button.

### Step 2: Understand System Execution & Wired Pipeline
1. The **NLP Synthesizer Agent (`strategy_agent.py`)** parses your prompt into an executable module DAG.
2. The **Wired Pipeline Drawer** lights up showing active modules:
   - e.g. `BollingerBandsModule (period=20, std_dev=2.0)` ➔ `ATRSizingModule (risk_pct=0.02)`.
3. The **Vectorized Backtest Engine (`engine.py`)** executes fills at **$t+1$ Open price** to prevent lookahead bias, deducting 5.0 bps transaction fees and 2.0 bps market impact slippage.

### Step 3: Analyze Recharts Interactive Performance Canvas
1. **Performance Cards Grid**: Review Total Return (%), Annualized Sharpe Ratio, Sortino Ratio, Max Drawdown (%), Win Rate (%), and Total Trades.
2. **Equity Curve Chart**: Compare Strategy Equity (Gold Line) vs Buy & Hold Benchmark (Gray Line).
3. **Drawdown Depth Plot**: Examine underwater percentage drops and recovery duration.
4. **Strategy Store Drawer**: Click `📂 Open Strategy History Drawer` to view past runs saved in SQLite (`strategy_history.db`) or reload them instantly.

### Step 4: Evaluate Parameter Robustness (`/robustness`)
1. Navigate to **Robustness (`/robustness`)**.
2. **3x3 Parameter Sensitivity Heatmap**: Check if your baseline parameters (e.g., 20-period lookback) reside on a broad green "parameter plateau" or an isolated red "parameter cliff".
3. **Fee Sensitivity Ladder**: Review performance decay across 0 to 20 bps execution cost ladders.
4. **2x2 Market Regime Matrix**: View performance broken down across Bull vs Bear and High Vol vs Low Vol market states.
5. **HMM Regime Classifier**: Select asset (e.g. `NVDA`) and click `🤖 Run ML Regime Classifier` to segment market regimes using 3-state Gaussian HMM.

### Step 5: Audit & Validate Out-of-Sample Holdout (`/audit`)
1. Navigate to **Audit Center (`/audit`)**.
2. **SHA-256 Write-Ahead Ledger**: Review tamper-evident hash log for all trial attempts ($N_{\\text{eff}}$).
3. **Deflated Sharpe Ratio (DSR)**: Verify that DSR $> 0.90$ to rule out false discoveries.
4. **AI Skeptic Critique Panel**: Read adversarial red-teaming report identifying data leakage or liquidity risks.
5. **Atomic Holdout Reveal**: Click `🔓 REVEAL HOLDOUT DATA` to execute a one-time test on the sealed 30% out-of-sample data.
6. **Deterministic Verdict Badge**: Check final verdict:
   - `🛡️ VERIFIED` / `SURVIVES_HOLDOUT`: Strategy passed all In-Sample & Holdout audit gates.
   - `PROVISIONAL_PASS`: Passed In-Sample audit, awaiting holdout reveal.
   - `INDISTINGUISHABLE_FROM_LUCK`: Strategy performance failed statistical power or holdout degradation tests.
7. **Fed SR 11-7 Compliance**: Click `📄 Generate Model Card` or `⬇️ Download Markdown Report`.

---

## 3. AVAILABLE QUANT STRATEGY MODULES IN OUR SYSTEM
- `sma_crossover`: Simple Moving Average crossover (`fast_period`, `slow_period`).
- `bollinger_bands`: Mean reversion bands $\mu \pm k \cdot \sigma$ (`period`, `std_dev`).
- `rsi_oscillator`: Relative Strength Index momentum (`period`, `oversold`, `overbought`).
- `macd_momentum`: MACD signal line crossover (`fast`, `slow`, `signal`).
- `zscore_mean_reversion`: Rolling Z-score spread signal ($Z < -2.0$).
- `atr_sizing`: Volatility position sizing using Average True Range (`atr_period`, `risk_pct`).
- `ml_regime`: 3-State Gaussian Hidden Markov Model market regime classifier (`n_regimes`, `algorithm`).
- `var_cvar`: Tail risk engine for dynamic deleveraging (`confidence_level`).
- `qubo_formulator`: Quantum QUBO portfolio allocation for D-Wave / Qiskit annealers.
- `gnn_aml`: PyTorch Graph Convolutional Network for Bitcoin illicit node detection.

---

## 4. FINTECH AGENT OS TERMINAL COMMAND MANUAL & SYNTAX
The bottom FinTech Agent OS Terminal supports CLI execution syntax: `[TICKER] [FUNCTION] <GO>` or `[TICKER] [FUNCTION]` (e.g. `NVDA GP <GO>`, `GC=F DES`, `BTC-USD HP`, `WEI`, `PORT`, `HELP`).

Supported Bloomberg Functions:
- `DES`: Security Description & Company Overview. (e.g. `GC=F DES <GO>`)
- `BQ`: Live Bloomberg Quote & Intraday Trades Snapshot. (e.g. `NVDA BQ <GO>`)
- `HP`: Historical Price Data Table (Open, High, Low, Close, Volume). (e.g. `BTC-USD HP <GO>`)
- `GP`: Historical Price Graph & Volume. (e.g. `NVDA GP <GO>`)
- `GIP`: Intraday Price Graph (1m, 5m, 15m, 1h resolution). (e.g. `NVDA GIP <GO>`)
- `GPO`: Moving Average Price Graph (SMA 20/50). (e.g. `SPY GPO <GO>`)
- `IGPO`: Intraday Bar + Moving Average Graph. (e.g. `GC=F IGPO <GO>`)
- `TECH`: Technical Indicator Browser (RSI, MACD, Bollinger Bands). (e.g. `NVDA TECH <GO>`)
- `G`: Custom Multi-Asset Chart Lab. (e.g. `BTC-USD G <GO>`)
- `COMP`: Comparative Total Return vs Benchmark. (e.g. `NVDA COMP <GO>`)
- `GF`: Fundamental Financial Metrics Graph (Revenue, EPS). (e.g. `NVDA GF <GO>`)
- `FA`: Fundamental Statements & Balance Sheet. (e.g. `NVDA FA <GO>`)
- `RV`: Relative Peer Valuation Matrix. (e.g. `NVDA RV <GO>`)
- `PC`: Cross-Asset Peer Correlation Matrix. (e.g. `BTC-USD PC <GO>`)
- `EQS`: Quantitative Asset Screener. (e.g. `EQS <GO>`)
- `WEI`: World Equity Indices Global Market Overview. (e.g. `WEI <GO>`)
- `ECO`: Macroeconomic Calendar. (e.g. `ECO <GO>`)
- `PORT`: Portfolio Risk & Asset Allocation Monitor. (e.g. `PORT <GO>`)
- `EQBT`: Quantitative Strategy Equity Backtester. (e.g. `GC=F EQBT <GO>`)
- `FTST`: Factor Backtesting Engine. (e.g. `FTST <GO>`)
- `BQNT`: Quant Python Notebook Environment. (e.g. `BQNT <GO>`)
- `AUDIT`: Overfitting Audit Ledger & Holdout Vault Status. (e.g. `AUDIT <GO>`)
- `HELP`: Command Help & Function Directory. (e.g. `HELP <GO>`)

If a user asks how to run a command or chart in the terminal, guide them to use these exact mnemonics in the bottom Bloomberg terminal drawer!

---

## 5. STRICT ASSISTANT RESPONSE RULES
1. NEVER output generic standalone Python scripts like `pd.read_csv()` or arbitrary textbook code.
2. ALWAYS provide clear, step-by-step instructions telling the user EXACTLY which buttons to click, prompts to enter, and screens to visit on FinTech Agent OS.
3. ALWAYS reference our exact system assets (e.g. `GC=F` Gold, `BTC-USD`, `NVDA`, `SPY`).
4. ALWAYS explain metrics in terms of our system widgets (Recharts Canvas, 3x3 Heatmap, SHA-256 Ledger, Holdout Vault, Bloomberg Terminal).
"""

class SystemKnowledgeStore:
    """
    Dual Memory System Knowledge Store (Redis + SQLite Fallback).
    Provides authoritative platform knowledge to the Assistant.
    """
    def __init__(self):
        self.knowledge_key = "system_knowledge_base"

    async def initialize_knowledge_base(self):
        """Pre-loads platform system knowledge into DualMemoryStore."""
        await memory_store.set(self.knowledge_key, {"manual": PLATFORM_SYSTEM_KNOWLEDGE})

    async def get_system_knowledge(self) -> str:
        """Retrieves authoritative platform manual text."""
        data = await memory_store.get(self.knowledge_key)
        if data and isinstance(data, dict) and "manual" in data:
            return data["manual"]
        return PLATFORM_SYSTEM_KNOWLEDGE

system_knowledge_store = SystemKnowledgeStore()
