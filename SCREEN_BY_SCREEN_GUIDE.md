# 🧱 FinTech Agent OS: Brick-by-Brick Screen, Component, Button & Graph Manual

> **Exhaustive User Interface & Operational Reference Guide for Every Screen, Component, Action Control, Button, Input, Slider, Graph, Chart, and Table in FinTech Agent OS.**

---

## 📋 Table of Contents
1. [Overview & Navigation Architecture](#-overview--navigation-architecture)
2. [Screen 1: AI Strategy Builder & Main Dashboard (`/`)](#-screen-1-ai-strategy-builder--main-dashboard-)
3. [Screen 2: Bloomberg Markets Hub & Terminal (`/markets`)](#-screen-2-bloomberg-markets-hub--terminal-markets)
4. [Screen 3: Assets & Technical Indicators Studio (`/assets`)](#-screen-3-assets--technical-indicators-studio-assets)
5. [Screen 4: Strategy Research Lab Canvas (`/research`)](#-screen-4-strategy-research-lab-canvas-research)
6. [Screen 5: Robustness & Market Regimes Chamber (`/robustness`)](#-screen-5-robustness--market-regimes-chamber-robustness)
7. [Screen 6: Institutional Audit Center (`/audit`)](#-screen-6-institutional-audit-center-audit)
8. [Screen 7: Calibration & Placebo Lab (`/calibration`)](#-screen-7-calibration--placebo-lab-calibration)
9. [Screen 8: Deployment Studio (`/deploy`)](#-screen-8-deployment-studio-deploy)

---

## 🏛️ Overview & Navigation Architecture

FinTech Agent OS features a top global navigation bar ([Navbar.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/components/layout/Navbar.tsx)) present across all screens.

### 🧭 Global Navigation Bar Components
* **Brand Logo & Title (`FinTech Agent OS`)**: Clicking returns to the primary dashboard (`/`).
* **Live Status Badges**:
  * `API Status`: Green indicator showing backend connection (`http://localhost:8000`).
  * `Database`: Shows status of SQLite persistence (`strategy_history.db`).
  * `Active Model`: Displays current active AI LLM synthesizer model.
* **Navigation Links**:
  * **`Home`**: Navigates to `/` (AI Builder & Dashboard).
  * **`Markets`**: Navigates to `/markets` (Bloomberg Style Market Terminal).
  * **`Assets`**: Navigates to `/assets` (Indicator Analysis Studio).
  * **`Research`**: Navigates to `/research` (Drag-and-Drop DAG Composer).
  * **`Robustness`**: Navigates to `/robustness` (Heatmap & Regime Matrix).
  * **`Audit`**: Navigates to `/audit` (SHA-256 Hash Ledger).
  * **`Calibration`**: Navigates to `/calibration` (Null Universe Lab).
  * **`Deploy`**: Navigates to `/deploy` (Model Card & Live Adapter).

---

## 🖥️ Screen 1: AI Strategy Builder & Main Dashboard (`/`)

* **Route**: `/`
* **Source Code**: [frontend/src/app/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/page.tsx)
* **Purpose**: Primary natural language strategy generation, instant backtest execution, performance analytics visualization, and strategy store history management.

```
+-----------------------------------------------------------------------------------+
|  GLOBAL NAVBAR: [FinTech Agent OS]  Status: API Online | DB Active                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Prompt Input Box: "Build a Bollinger Bands & ATR strategy on BTC-USD..." ]     |
|  [ Preset Chips: (Bollinger Bands) (RSI Momentum) (HMM Regime) (Pairs Trading) ]  |
|  [ BUTTON: ⚡ Synthesize & Run Backtest ]                                         |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | WIRED PIPELINE DRAWER: [Bollinger Module] -> [ATR Sizing] -> [HMM Filter]   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-------------+  +-------------+  +-------------+  +-------------+  +----------+ |
|  | Return: +48%|  | Sharpe: 1.85|  | MaxDD: -12% |  | WinRate: 64%|  | Trades:82| |
|  +-------------+  +-------------+  +-------------+  +-------------+  +----------+ |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH 1: Recharts Interactive Equity Curve (Strategy vs Asset Benchmark)    |  |
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH 2: Recharts Drawdown Depth Plot (% Underwater over time)              |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ BUTTON: 📂 Open Strategy History Drawer ]  [ BUTTON: 🗑️ Clear SQLite Store ]    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. Natural Language Prompt Box
* **Type**: Multiline Textarea
* **Function**: Accepts natural language requests (e.g. *"Build an ATR position-sized Bollinger Band strategy on Gold"*).
* **Keyboard Shortcut**: `Ctrl + Enter` to trigger execution.

#### 2. Preset Strategy Prompt Chips
* **Type**: Interactive Action Buttons
* **Chips Available**:
  * `Bollinger Bands Mean Reversion`: Fills prompt with Bollinger std dev band breakout logic.
  * `RSI Momentum`: Fills prompt with 14-period RSI oversold/overbought momentum logic.
  * `HMM Market Regime`: Fills prompt with 3-state Gaussian HMM volatility filter.
  * `Pairs Trading Stat Arb`: Fills prompt with cointegration spread mean-reversion logic.
* **Action**: Auto-populates the prompt input box with template queries.

#### 3. `⚡ Synthesize & Run Backtest` Button
* **Type**: Primary Action Button (Amber Gold)
* **What it Does**:
  1. Sends POST payload to `/quant/synthesize-strategy`.
  2. Parses natural language into dynamic module pipeline JSON specs.
  3. Executes vectorized backtest simulator on historical OHLCV data.
  4. Returns equity curve, trade log, and metrics.
  5. Saves run to SQLite database (`strategy_history.db`).

#### 4. Wired Pipeline Drawer
* **Type**: Visual Node Pipeline Display
* **What it Displays**: Shows interconnected active strategy module cards (e.g., `BollingerBandsModule` $\rightarrow$ `ATRSizingModule` $\rightarrow$ `MLRegimeModule`).
* **Content inside Each Card**: Module ID, target asset, parameter values (lookback periods, multipliers).

#### 5. Performance Overview Metric Cards (6 Grid Cards)
* **Card 1: Total Return (%)**: Cumulative return over backtest period. Green for positive, red for negative.
* **Card 2: Sharpe Ratio**: Risk-adjusted excess return ($\text{Sharpe} > 1.0$ is good, $> 2.0$ is institutional quality).
* **Card 3: Sortino Ratio**: Downside risk-adjusted return metric.
* **Card 4: Max Drawdown (%)**: Deepest peak-to-trough equity drop percentage.
* **Card 5: Win Rate (%)**: Percentage of closed trades yielding positive PnL.
* **Card 6: Total Trades**: Count of total executed long/short trades.

#### 6. Recharts Interactive Charts Canvas
* **GRAPH 1: Equity Curve Comparison Plot**:
  * **Chart Type**: Multi-line Chart
  * **X-Axis**: Time / Date ($t=1 \dots T$).
  * **Y-Axis**: Cumulative Portfolio Value ($).
  * **Lines**:
    * **Gold Line**: Strategy Cumulative Equity.
    * **Gray Line**: Buy & Hold Asset Benchmark Equity.
  * **Tooltips**: Hovering displays exact portfolio value, benchmark value, and return percentage for that date.
* **GRAPH 2: Drawdown Depth Area Chart**:
  * **Chart Type**: Area Chart (Red Gradient Fill)
  * **X-Axis**: Time / Date.
  * **Y-Axis**: Drawdown Percentage ($0\%$ at peak down to $-X\%$).
  * **Visual Purpose**: Instantly highlights underwater duration and risk recovery times.

#### 7. Strategy History Drawer & Database Buttons
* **`📂 Open Strategy History Drawer` Button**: Slides open side panel displaying past backtest runs saved in SQLite.
  * **Card Action - `Reload Run`**: Click any past run card to instantly restore its prompt, wired pipeline, equity curve, and metric summary.
* **`🗑️ Clear SQLite Store` Button**: Purges all saved strategy runs from `strategy_history.db`.

---

## 🏛️ Screen 2: Bloomberg Markets Hub & Terminal (`/markets`)

* **Route**: `/markets`
* **Source Code**: [frontend/src/app/markets/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/markets/page.tsx)
* **Components**: `BloombergTickerRibbon.tsx`, `BloombergChart.tsx`, `MarketsAtAGlance.tsx`, `MarketsBoard.tsx`, `RelatedNewsGrid.tsx`
* **Purpose**: Real-time asset tracking, interactive candlestick charting, moving average overlays, RSI subpanel, and market overview tables.

```
+-----------------------------------------------------------------------------------+
| RIBBON: [BTC-USD $64,210 +3.4%]  [ETH-USD $3,450 -0.8%]  [GC=F $2,380 +1.2%]     |
+-----------------------------------------------------------------------------------+
|  NAV: (All Assets) (Crypto) (Commodities) (Equities) (Forex)                      |
|                                                                                   |
|  MAIN CHART: Bloomberg Technical Candlestick / Line Chart                         |
|  [Timeframe: (1D) (1W) (1M) (1Y) (ALL)]  [Type: (Candles) (Line)]                 |
|  [Overlays: [X] MA20  [X] MA50  [X] Bollinger Bands  [X] Volume]                |
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH: OHLC Price Candles + Moving Average Lines + Volume Bar Overlay       |  |
|  +-----------------------------------------------------------------------------+  |
|  | SUBPANEL: RSI Oscillator Line (Overbought 70 / Oversold 30 Lines)           |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  TABLE: Markets at a Glance Board                                                 |
|  Symbol | Name | Price | 24h Change | Volatility | Action                       |
|  BTC-USD| Bitcoin | $64,210 | +3.4% | High (42%) | [BUTTON: Backtest] [Trade]   |
|                                                                                   |
|  GRID: Related News & Market Sentiment                                            |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. `BloombergTickerRibbon.tsx` — Scrolling Ticker Ribbon
* **Type**: Horizontal Auto-Scrolling Ribbon Component
* **Content**: Live price feeds for `BTC-USD`, `ETH-USD`, `GC=F` (Gold), `CL=F` (Oil), `NVDA`, `AAPL`, `SPY`, `EURUSD=X`.
* **Visuals**: Displays ticker symbol, price, 24h change percentage (Green $+X\%$ / Red $-Y\%$), and volatility level badge.

#### 2. `BloombergChart.tsx` — Main Price & Indicator Chart
* **Timeframe Control Buttons**:
  * `1D`, `1W`, `1M`, `1Y`, `ALL`: Sets temporal granularity of chart bars.
* **Chart Style Toggle Button**:
  * `Candles`: Renders full Open-High-Low-Close Japanese Candlesticks (Green bullish hollow, Red bearish solid).
  * `Line`: Renders continuous closing price line chart.
* **Technical Overlay Checkboxes**:
  * `[X] MA 20`: Toggles 20-period Moving Average line (Amber).
  * `[X] MA 50`: Toggles 50-period Moving Average line (Blue).
  * `[X] Bollinger Bands`: Toggles upper and lower 2-sigma standard deviation bands (Purple translucent shading).
  * `[X] Volume Overlay`: Toggles bottom vertical volume bars.
* **RSI Subpanel Chart**:
  * **Type**: Separate synchronized line chart below main price chart.
  * **X-Axis**: Aligned time series axis.
  * **Y-Axis**: RSI value ($0$ to $100$).
  * **Reference Lines**: Red dashed line at $70$ (Overbought), Green dashed line at $30$ (Oversold).

#### 3. `MarketsAtAGlance.tsx` & `MarketsBoard.tsx` — Asset Universe Table
* **Category Filter Tabs**: `All`, `Crypto`, `Commodities`, `Equities`, `Forex`.
* **Asset Table Columns**:
  * `Asset Symbol & Name`: Ticker identifier.
  * `Price`: Current price ($).
  * `24h Change`: Percentage price movement.
  * `Volatility Score`: Annualized standard deviation rating.
  * `Action Buttons`:
    * `[BUTTON: Backtest]`: Opens asset directly in AI Strategy Builder (`/`).
    * `[BUTTON: Analyze]`: Opens asset in Assets Studio (`/assets`).

#### 4. `RelatedNewsGrid.tsx` — Market News & Sentiment Grid
* **Type**: Cards Grid
* **Content**: Live news articles, market sentiment tags (Bullish/Bearish), timestamp, and source links for selected asset.

---

## 🎨 Screen 3: Assets & Technical Indicators Studio (`/assets`)

* **Route**: `/assets`
* **Source Code**: [frontend/src/app/assets/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/assets/page.tsx)
* **Purpose**: Single-asset indicator breakdown, dev-holdout data safety verification, drawdown depth plots, and cross-asset correlation matrix analysis.

```
+-----------------------------------------------------------------------------------+
| BANNER: 🔒 Dev Data Partition Active (70% Dev Data / 30% Holdout Vault Sealed)     |
+-----------------------------------------------------------------------------------+
| CONTROLS: [Asset Dropdown: BTC-USD v]  [Start Date: 2021-01-01]  [End: 2023-12-31] |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH 1: Price Series with SMA 20 / SMA 50 / Bollinger Bands Overlays       |  |
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH 2: RSI Momentum Oscillator Subpanel (14-period)                         |  |
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH 3: Historical Drawdown Percentage Depth                                 |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  TABLE: Cross-Asset Weekly Return Correlation Matrix                              |
|         BTC-USD | GLD   | NVDA  | SPY                                             |
| BTC-USD |  1.00   | 0.12  | 0.45  | 0.38                                            |
| GLD     |  0.12   | 1.00  | 0.05  | 0.15                                            |
| NVDA    |  0.45   | 0.05  | 1.00  | 0.72                                            |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. Partition Safety Banner
* **Type**: Information Alert Bar (Gold Border)
* **Purpose**: Confirms that data displayed is strictly restricted to the 70% In-Sample Dev partition, guaranteeing no holdout data leakage.

#### 2. Asset & Date Controls
* **`Asset Selector Dropdown`**: Switch active asset (`BTC-USD`, `GLD`, `NVDA`, `SPY`, `ETH-USD`, `EURUSD=X`).
* **`Start / End Date Pickers`**: Adjust historical window range.

#### 3. Asset Technical Charts
* **GRAPH 1: OHLC Price & Moving Average Chart**: Plots raw asset prices alongside 20-period and 50-period SMA curves.
* **GRAPH 2: RSI Oscillator Chart**: Displays 14-period Relative Strength Index.
* **GRAPH 3: Drawdown Underwater Plot**: Displays historical asset peak-to-trough price drawdowns.

#### 4. Cross-Asset Correlation Matrix Table
* **Type**: Interactive Heatmap Matrix
* **Values**: Pearson correlation coefficients $r_{ij} \in [-1.0, +1.0]$ between weekly asset returns.
* **Color Coding**: Green for positive correlation, Blue for neutral, Red for negative correlation.

---

## 🔬 Screen 4: Strategy Research Lab Canvas (`/research`)

* **Route**: `/research`
* **Source Code**: [frontend/src/app/research/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/research/page.tsx)
* **Purpose**: Drag-and-drop multi-module DAG pipeline composer, real-time indicator parameter tuning, and custom strategy backtest execution.

```
+-----------------------------------------------------------------------------------+
| RESEARCH CANVAS: Drag & Drop Module Pipeline Builder                              |
+-----------------------------------------------------------------------------------+
| PALETTE (Left Sidebar)  | CANVAS (Center)                                         |
| [DRAG: SMA Crossover]   |                                                         |
| [DRAG: Bollinger Bands] |  +--------------------+      +--------------------+     |
| [DRAG: RSI Oscillator]  |  | Node 1: Bollinger  | ---> | Node 2: ATR Sizing |     |
| [DRAG: ATR Sizing]      |  +--------------------+      +--------------------+     |
| [DRAG: HMM Regime]      |                                   |                     |
| [DRAG: VaR Risk Engine] |                              +----+---------------+     |
|                         |                              | Node 3: HMM Filter |     |
|                         |                              +--------------------+     |
|                         |                                                         |
| PARAMETER TUNING PANEL (Right Sidebar)                                            |
| Bollinger Lookback:  [===|======] 20 days                                         |
| Std Dev Multiplier:  [======|===] 2.0x                                            |
| Risk Fraction (%):   [==|=======] 2.0%                                            |
| Slippage (bps):      [=|========] 5 bps                                           |
|                                                                                   |
| [ BUTTON: 🚀 Run Custom Research Pipeline ]                                       |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. Module Palette (Left Sidebar)
* **Type**: Drag-and-Drop Source List
* **Modules Available to Drag**:
  * `SMA Crossover`, `Bollinger Bands`, `RSI Oscillator`, `MACD Momentum`, `Z-Score Mean Reversion`, `ATR Sizing`, `Ichimoku Cloud`, `Supertrend`, `VWAP Execution`, `Pairs Trading`, `HMM Market Regime`, `VaR / CVaR Tail Risk`.

#### 2. Interactive DAG Composer Canvas (Center Workspace)
* **Type**: Interactive Node Editor Canvas
* **Node Capabilities**:
  * **Add Node**: Drag module from sidebar onto canvas.
  * **Connect Wires**: Click output port of signal node and drag wire to input port of position sizing or risk node.
  * **Delete Node / Wire**: Select node/wire and press `Delete` button.

#### 3. Parameter Tuning Drawer (Right Sidebar)
* **Sliders & Numeric Inputs**:
  * `Fast Period Slider`: Adjust short moving average lookback ($5 \dots 50$ days).
  * `Slow Period Slider`: Adjust long moving average lookback ($20 \dots 200$ days).
  * `Std Dev Multiplier Slider`: Adjust Bollinger band width ($1.0 \sigma \dots 3.5 \sigma$).
  * `Risk Fraction % Slider`: Adjust capital risk fraction per trade ($0.5\% \dots 10.0\%$).
  * `Slippage Bps Input`: Set expected execution slippage ($0 \dots 50\text{ bps}$).

#### 4. `🚀 Run Custom Research Pipeline` Button
* **What it Does**: Compiles canvas DAG state into JSON, sends request to backend `/quant/run-backtest`, and renders backtest results in real-time.

---

## 📊 Screen 5: Robustness & Market Regimes Chamber (`/robustness`)

* **Route**: `/robustness`
* **Source Code**: [frontend/src/app/robustness/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/robustness/page.tsx)
* **Purpose**: Overfitting analysis, 3x3 parameter sensitivity grid, transaction fee decay ladder, 2x2 market regime matrix, HMM regime classification, and atomic holdout reveal.

```
+-----------------------------------------------------------------------------------+
|  SECTION 1: 3x3 Parameter Sensitivity Neighborhood Matrix                         |
|             Fast=15       Fast=20       Fast=25                                   |
|  Slow=40   [Sharpe 1.42] [Sharpe 1.65] [Sharpe 1.38]                              |
|  Slow=50   [Sharpe 1.58] [Sharpe 1.85]*[Sharpe 1.52]                              |
|  Slow=60   [Sharpe 1.31] [Sharpe 1.49] [Sharpe 1.25]                              |
|  *Center cell represents chosen baseline parameters.                              |
+-----------------------------------------------------------------------------------+
|  SECTION 2: Transaction Cost & Slippage Sensitivity Ladder                        |
|  [BAR CHART: Performance Decay across 0, 2, 5, 10, 15, 20 bps commission]         |
+-----------------------------------------------------------------------------------+
|  SECTION 3: 2x2 Market Regime Performance Matrix                                  |
|               Low Volatility       High Volatility                                |
|  Bull Market [Return: +32%, S: 2.1][Return: +18%, S: 1.2]                         |
|  Bear Market [Return: +8%,  S: 0.8][Return: -14%, S: -0.5]                        |
+-----------------------------------------------------------------------------------+
|  SECTION 4: Gaussian HMM Machine Learning Regime Detection Controls               |
|  [Asset: NVDA v]  [Algo: (HMM) (GMM)]  [BUTTON: 🤖 Run ML Regime Classifier]       |
|  [GRAPH: Probability Timeline for Regimes: Bull (Green), Bear (Red), Vol (Gray)]  |
+-----------------------------------------------------------------------------------+
|  SECTION 5: Atomic 30% Out-of-Sample Holdout Reveal Vault                         |
|  Status: 🔒 VAULT LOCKED (24 Months Sealed Data)                                  |
|  [BUTTON: 🔓 REVEAL HOLDOUT DATA (ONE-TIME ACTION)]                               |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. 3x3 Parameter Sensitivity Heatmap Grid
* **Type**: 3x3 Matrix Grid Component
* **Purpose**: Checks whether baseline parameters reside on a broad "parameter plateau" (robust) or a sharp "parameter cliff" (overfit).
* **Color Coding**: Deep green for high Sharpe ratio ($> 1.5$), Light green for moderate Sharpe ($1.0 - 1.5$), Red for low/negative Sharpe ($< 0.8$).

#### 2. Transaction Cost & Slippage Ladder Chart
* **Type**: Bar Chart (Recharts)
* **X-Axis**: Transaction Fee Bps ($0, 2, 5, 10, 15, 20\text{ bps}$).
* **Y-Axis**: Annualized Sharpe Ratio.
* **Visual Insight**: Shows how rapidly strategy returns decay under realistic trading fees.

#### 3. 2x2 Market Regime Matrix
* **Type**: 4-Cell Quadrant Box
* **Quadrants**:
  1. *Bull Market / Low Volatility*: Ideal market state.
  2. *Bull Market / High Volatility*: Trending with noise.
  3. *Bear Market / Low Volatility*: Slow downward drift.
  4. *Bear Market / High Volatility*: Crash/panic conditions.
* **Metrics in Each Quadrant**: Total Return, Sharpe Ratio, Max Drawdown.

#### 4. Machine Learning Regime Detection Controls
* **`Asset Selector Dropdown`**: Choose asset for regime analysis (e.g. `NVDA`).
* **`Algorithm Selector`**: Toggle between `HMM` (Gaussian Hidden Markov Model) and `GMM` (Gaussian Mixture Model).
* **`🤖 Run ML Regime Classifier` Button**: Calls `/quant/regime-detection` endpoint to segment historical data into 3 hidden regime states.
* **Regime Probability Timeline Plot**: Multi-area chart displaying probability $P(S_t = k)$ for each regime over time.

#### 5. Atomic Holdout Vault & Reveal Button
* **Vault Lock Status Badge**: Displays `🔒 VAULT LOCKED` prior to reveal.
* **`🔓 REVEAL HOLDOUT DATA` Button**:
  * **Type**: High-Warning Action Button (Red/Terracotta)
  * **What it Does**: Executes one-time reveal of the sealed 30% out-of-sample holdout dataset, comparing In-Sample vs Out-of-Sample Sharpe ratio to calculate final validation verdict.

---

## 🛡️ Screen 6: Institutional Audit Center (`/audit`)

* **Route**: `/audit`
* **Source Code**: [frontend/src/app/audit/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/audit/page.tsx)
* **Purpose**: Tamper-proof SHA-256 hash ledger inspection, AI Skeptic Agent critique review, deterministic verdict badge display, and Federal Reserve SR 11-7 compliance report generation.

```
+-----------------------------------------------------------------------------------+
| VERDICT BADGE: [ VERIFIED - PASSED ALL AUDIT CHECKS ] (Green Shield)              |
+-----------------------------------------------------------------------------------+
| CARDS: [Total Trial Attempts (N_eff): 14] [Deflated Sharpe Ratio (DSR): 0.94]     |
|                                                                                   |
| PANEL 1: AI Skeptic Agent Adversarial Red-Team Critique                           |
| "The strategy demonstrates robust momentum capture. However, slippage sensitivity |
| increases significantly during High Volatility regimes. Deflated Sharpe ratio     |
| confirms statistical significance at 94% confidence."                            |
|                                                                                   |
| TABLE: Write-Ahead SHA-256 Tamper-Evident Trial Hash Ledger                       |
| Trial ID | Timestamp | Prompt / Strategy | In-Sample S | DSR | Status | Hash     |
| RUN_104  | 2026-09-19| Bollinger + ATR   | 1.85        | 0.94| PASSED | e3b0c4...|
| RUN_103  | 2026-09-19| SMA Crossover     | 1.20        | 0.45| REJECT | 8f4b2a...|
|                                                                                   |
| EXPORT CONTROLS:                                                                  |
| [BUTTON: 📄 Generate Fed SR 11-7 Model Card]  [BUTTON: ⬇️ Download Markdown Report]|
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. Deterministic Verdict Shield Badge
* **Type**: Large Status Badge Header
* **Possible States**:
  * `🛡️ VERIFIED`: Strategy passed statistical power, selection-aware p-value, and holdout degradation tests.
  * `⚠️ OVERFIT`: Strategy degraded by $>35\%$ in holdout or failed Deflated Sharpe Ratio test.
  * `❌ REJECTED`: Strategy failed statistical power or exhibited negative expected return.

#### 2. Audit Summary Cards
* **Trial Attempts ($N_{\text{eff}}$)**: Counts total recorded strategy iterations in SQLite database.
* **Deflated Sharpe Ratio ($\text{DSR}$)**: Value between $0.0$ and $1.0$ ($>0.90$ indicates $<10\%$ probability of false discovery).

#### 3. AI Skeptic Agent Critique Panel
* **Content**: Automated adversarial report highlighting data leakage risks, parameter sensitivity warnings, and liquidity assumptions generated by [skeptic.py](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/backend/app/agents/skeptic.py).

#### 4. Cryptographic SHA-256 Hash Chain Table
* **Columns**: Trial ID, Timestamp, Strategy Prompt, In-Sample Sharpe, DSR, Verification Status, SHA-256 State Hash.
* **Purpose**: Provides immutable proof of trial history for compliance auditors.

#### 5. Fed SR 11-7 Compliance Export Buttons
* **`📄 Generate Fed SR 11-7 Model Card` Button**: Compiles model architecture, data lineage, assumptions, limitations, and stress tests into institutional template.
* **`⬇️ Download Markdown Report` Button**: Triggers browser file download of full `.md` report.

---

## 🎲 Screen 7: Calibration & Placebo Lab (`/calibration`)

* **Route**: `/calibration`
* **Source Code**: [frontend/src/app/calibration/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/calibration/page.tsx)
* **Purpose**: Benchmarking strategy performance against 1,000 synthetic null universes to maintain strict False Discovery Rate (FDR) controls.

```
+-----------------------------------------------------------------------------------+
| CALIBRATION: Empirical Null Universe Benchmark (<5% False Discovery Rate)         |
+-----------------------------------------------------------------------------------+
|  +-----------------------------------------------------------------------------+  |
|  | GRAPH: 1,000 Synthetic Null Universes Sharpe Ratio Percentile Distribution   |  |
|  | [Gray Distribution Curve: Random Null Sharpe Ratios (Mean = 0.0)]           |  |
|  | [Gold Vertical Line: Your Strategy Sharpe Ratio (1.85) -> 98.4th Percentile]  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
| CONTROLS:                                                                         |
| False Discovery Rate (FDR Alpha): [===|======] 0.05 (5%)                          |
| [BUTTON: 🎲 Generate 1,000 Judge-Seed Placebo Universes]                          |
|                                                                                   |
| SUMMARY: P-Value = 0.016 | FDR Control: PASSED | Empirical Percentile: 98.4%       |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. Empirical Null Distribution Chart
* **Type**: Histogram & Density Curve Chart (Recharts)
* **X-Axis**: Sharpe Ratio values ($-2.0 \dots +3.0$).
* **Y-Axis**: Frequency / Count across 1,000 synthetic null time series.
* **Vertical Reference Lines**:
  * **Gold Line**: Observed Strategy Sharpe Ratio.
  * **Red Line**: 95th Percentile Threshold ($p = 0.05$).

#### 2. Calibration Controls
* **`FDR Alpha Slider`**: Adjust False Discovery Rate significance cutoff ($0.01 \dots 0.10$).
* **`🎲 Generate 1,000 Judge-Seed Placebo Universes` Button**: Triggers phase-scrambling algorithm to generate synthetic null data series and recalculate empirical p-value.

---

## 🚀 Screen 8: Deployment Studio (`/deploy`)

* **Route**: `/deploy`
* **Source Code**: [frontend/src/app/deploy/page.tsx](file:///d:/Data%20Science/SIH/FinTech%20Agent%20OS/frontend/src/app/deploy/page.tsx)
* **Purpose**: Deploying verified strategies to paper or live trading environments via brokerage API adapters.

```
+-----------------------------------------------------------------------------------+
| DEPLOYMENT STUDIO: Live Execution & Brokerage Adapter Gateway                     |
+-----------------------------------------------------------------------------------+
| CONFIGURATION:                                                                    |
| Environment:      [(x) Paper Trading   ( ) Staging   ( ) Live Production]         |
| Broker Adapter:   [Select Adapter: Alpaca Markets v]                              |
| API Key:          [************************]                                      |
| API Secret:       [************************]                                      |
| Max Allocation:   [$ 50,000            ]                                      |
| Leverage Limit:   [1.0x                ]                                      |
|                                                                                   |
| [ BUTTON: 🚀 DEPLOY STRATEGY TO PAPER TRADING ENGINE ]                            |
+-----------------------------------------------------------------------------------+
```

### 🧱 Component Breakdown & Controls

#### 1. Environment Selection Radio Group
* **Options**: `Paper Trading` (Simulated live fills), `Staging` (Testnet), `Live Production` (Real capital execution).

#### 2. Broker Adapter Dropdown & API Input Fields
* **Broker Options**: `Alpaca Markets`, `Interactive Brokers (IBKR)`, `Binance / Crypto Exchange`.
* **Credential Fields**: API Key, API Secret Key, Account Number.

#### 3. Capital Allocation Controls
* **Max Allocation Input**: Maximum cash allocation assigned to strategy.
* **Leverage Cap Slider**: Sets hard leverage cap ($1.0x \dots 3.0x$).

#### 4. `🚀 DEPLOY STRATEGY TO PAPER TRADING ENGINE` Button
* **Type**: Primary Execution Button
* **What it Does**: Validates API credentials, registers strategy with live execution engine, and opens live execution monitoring dashboard.

---

*FinTech Agent OS UI Manual — Every brick, component, button, and graph documented with precision.*
