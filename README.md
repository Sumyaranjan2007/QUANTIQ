# QUANTIQ — Quantitative Multi-Asset Financial Intelligence & Backtesting Platform

> *"Understand the market. Test the strategy. Measure the risk."*

---

## 🌟 Executive Overview

**QUANTIQ** is an institutional-grade quantitative research, strategy backtesting, and market regime intelligence platform designed for quantitative analysts, systematic traders, and portfolio managers. Built with a sleek dark financial terminal aesthetic inspired by institutional desks, QUANTIQ provides a complete mathematical lifecycle: from raw historical multi-asset time-series ingestion and factor decomposition to realistic event-driven backtesting with slippage and transaction costs, tail-risk measurement (VaR / CVaR), machine-detected market regimes, and forensic event attribution (*"Why Did This Happen?"*).

---

## ⚡ Key Differentiators

1. **"WHY DID THIS HAPPEN?" (Forensic Attribution Engine)**:
   - For any major anomaly in a strategy backtest (deepest drawdown, peak single-day gain, volatility shock, or regime inversion), click **[WHY DID THIS HAPPEN?]** to deconstruct the exact technical indicators (SMA20 vs SMA50), market regime state, volatility percentile, and execution friction at that precise moment with an analytical narrative.
2. **"STRATEGY DNA" (6-Axis Behavioral Fingerprint)**:
   - Evaluates strategies beyond just returns. Analyzes **Trading Frequency**, **Trend Sensitivity**, **Volatility Sensitivity**, **Drawdown Resilience**, **Holding Duration**, and **Signal Precision** displayed on a real-time radar chart.
3. **"MARKET REGIME REPLAY" (Macro Epoch Simulator)**:
   - Isolate historical stress periods (e.g. *2022 Bear Market*, *2023 Recovery*, *2024 Bull Run*, *High Vol Shock*) and dynamically replay execution bars, equity evolution, and regime transitions.
4. **Zero-Configuration Offline Guarantee**:
   - Bundles realistic, multi-year deterministic seeded historical datasets (2020–2026) for **Gold (XAU)**, **Bitcoin (BTC)**, **NVIDIA (NVDA)**, and **NIFTY 50 (^NSEI)**. Runs immediately out-of-the-box without requiring external API keys.
5. **AI Quant Assistant with Deterministic Fallback**:
   - Interactive slide-out conversational panel. If a Gemini or Groq API key is configured, it powers deep contextual queries; otherwise, a deterministic mathematical synthesis engine answers telemetry questions directly from live dashboard state.

---

## 🛠️ Architecture & Tech Stack

```
                                  QUANTIQ Platform Architecture
                                 
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                           React + Vite + TypeScript + Tailwind                         │
  │  ┌───────────────┬─────────────────┬─────────────────┬────────────────┬─────────────┐  │
  │  │ Landing Page  │ Dashboard (KPI) │ Quant Engine    │ Risk Analysis  │ Correlation │  │
  │  ├───────────────┼─────────────────┼─────────────────┼────────────────┼─────────────┤  │
  │  │ Strategy Lab  │ Backtest Engine │ Regime Analysis │ Portfolio Lab  │ AI Insights │  │
  │  ├───────────────┴─────────────────┴─────────────────┴────────────────┴─────────────┤  │
  │  │ Differentiators: "Why Did This Happen?" | "Strategy DNA" | "Market Regime Replay"│  │
  │  └──────────────────────────────────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ HTTP REST /api
  ┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
  │                               FastAPI Backend Service                                  │
  │  ┌───────────────────────┬───────────────────────────┬──────────────────────────────┐  │
  │  │ API Routers           │ Core Quantitative Engines │ Data & AI Services           │  │
  │  │ - /api/assets         │ - Technical Indicators    │ - MarketDataProvider (Demo/  │  │
  │  │ - /api/analysis       │ - Real Backtest Engine    │   Yahoo/AlphaVantage ready)  │  │
  │  │ - /api/backtest       │ - Risk Engine (VaR, ES)   │ - AI Engine (Deterministic   │  │
  │  │ - /api/risk           │ - Correlation Matrix      │   metrics-driven fallback    │  │
  │  │ - /api/portfolio      │ - Regime Classifier       │   + Gemini/Groq LLM support) │  │
  │  │ - /api/regime         │ - Event Attribution       │                              │  │
  │  │ - /api/ai/*           │   ("Why did this happen") │                              │  │
  │  └───────────────────────┴───────────────────────────┴──────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Recharts.
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pydantic v2.
- **Quantitative Engine**: NumPy, Pandas, SciPy, Scikit-Learn.

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- Node.js (v18+) & `npm`
- Python (3.10+) & `pip`

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend will be live at `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173/`.

---

## 📐 Mathematical Formulas & Risk Metrics

| Metric | Formula | Description |
| :--- | :--- | :--- |
| **Simple Moving Average (SMA)** | $\text{SMA}_n = \frac{1}{n} \sum_{i=0}^{n-1} P_{t-i}$ | Arithmetic rolling mean over $n$ periods. |
| **Exponential Moving Average (EMA)** | $\text{EMA}_t = \alpha P_t + (1-\alpha)\text{EMA}_{t-1}, \alpha = \frac{2}{n+1}$ | Exponentially weighted average with recency priority. |
| **Annualized Volatility** | $\sigma_{\text{ann}} = \sigma_{\text{daily}} \times \sqrt{252}$ | Standard deviation of log daily returns scaled to trading year. |
| **Sharpe Ratio** | $S = \frac{\mathbb{E}[R_p] - R_f}{\sigma_p} \times \sqrt{252}$ | Excess return earned per unit of total volatility ($R_f = 4.0\%$). |
| **Sortino Ratio** | $\text{Sortino} = \frac{\text{CAGR} - R_f}{\sigma_{\text{downside}}}$ | Excess return penalized strictly by negative excursions. |
| **Maximum Drawdown (MDD)** | $\text{MDD} = \min_{t} \left( \frac{P_t - \max_{s \le t} P_s}{\max_{s \le t} P_s} \right)$ | Largest peak-to-trough decline before new equity high. |
| **Historical VaR (95%)** | $\text{VaR}_{0.95} = - \text{Percentile}(R, 5\%)$ | Historical 1-day threshold of maximum expected loss with 95% confidence. |
| **Expected Shortfall (CVaR)** | $\text{ES}_{0.95} = -\mathbb{E}[R \mid R \le -\text{VaR}_{0.95}]$ | Average magnitude of losses situated strictly in the 5% tail. |
| **Pearson Correlation** | $\rho_{X,Y} = \frac{\text{Cov}(X,Y)}{\sigma_X \sigma_Y}$ | Linear co-movement between normalized asset return vectors. |

---

## 🔬 Systematic Strategy Definitions

1. **SMA Crossover (Fast 20 / Slow 50)**:
   - **BUY**: Fast 20 SMA crosses strictly above Slow 50 SMA.
   - **EXIT**: Fast 20 SMA crosses below Slow 50 SMA.
2. **EMA Crossover (Fast 20 / Slow 50)**:
   - Same crossover mechanics utilizing Exponential Moving Averages for quicker reaction to emerging trends.
3. **Momentum (20-Day Lookback, 2.0% Threshold)**:
   - **BUY**: If percentage return over the last 20 days exceeds threshold (+2.0%).
   - **EXIT**: If rolling return decays below threshold.
4. **Mean Reversion (20-Day Rolling Mean, 1.5σ Lower Band)**:
   - **BUY**: Price drops below $1.5$ standard deviations under the 20-day moving average (oversold).
   - **EXIT**: Price returns to the 20-day mean (mean reversion achieved).
5. **Execution Realism (Anti Look-Ahead Bias)**:
   - All strategy signals decided at bar $t$ close are executed at bar $t+1$.
   - **Fixed Friction**: 0.10% transaction commission applied on entry and exit.
   - **Execution Slippage**: 0.05% adverse pricing applied on fill.

---

## 🏆 3–5 Minute Hackathon Judge Demo Walkthrough

1. **STEP 1 — Dashboard Overview**:
   - Open `http://localhost:5173/`. Click **[Launch Quant Dashboard]**.
   - Review live dynamic KPI cards and multi-asset price curves for Gold, Bitcoin, NVIDIA, and NIFTY 50.
2. **STEP 2 — Multi-Asset Correlation**:
   - Navigate to **Correlation Analysis**.
   - Inspect the 4x4 Pearson return heatmap and observe the dynamic analytical narrative highlighting the top diversifier.
3. **STEP 3 — Quant Factor Decomposition**:
   - Click **Quant Engine** to review the 10 mathematical metrics and rolling 21-day volatility & rolling Sharpe charts.
4. **STEP 4 — Systematic Strategy Lab**:
   - Click **Strategy Lab**. Select **SMA Crossover (20/50)**.
   - Click **[RUN BACKTEST]**. Observe strategy outperformance vs. Buy & Hold, equity curves, underwater drawdown profiles, and the round-trip Trade Log.
5. **STEP 5 — Differentiator: "Why Did This Happen?"**:
   - Click **[WHY DID THIS HAPPEN?]** on the maximum drawdown event to view the forensic technical and regime deconstruction.
6. **STEP 6 — Differentiator: Strategy DNA**:
   - Inspect the 6-axis Strategy DNA radar chart showing trading frequency, trend sensitivity, and drawdown resilience.
7. **STEP 7 — Market Regime Replay**:
   - Open **Market Regimes**. Click **[2022 Bear Market]** or **[2024 Bull Run]** and click **[Start Replay]** to watch the state machine animate historical execution bars.
8. **STEP 8 — AI Quant Assistant**:
   - Click the floating **🤖 AI Quant Assistant** button. Select prompt chip *"What caused the largest drawdown?"* to see real-time contextual analysis.

---

## 🛡️ Regulatory & Financial Safety Notice

QUANTIQ is an analytical and educational platform. It does not execute live orders on brokerage exchanges, connect to bank accounts, or dispense personalized financial advice. All figures represent simulated historical backtests under specified friction assumptions. Past performance is non-predictive of future capital results.
