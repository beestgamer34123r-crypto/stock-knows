# 🌸 Stock Knows — Indian Market 3 AI Agents & Real-Time Trading Platform

A cute, eye-soothing, and high-performance multi-agent stock market intelligence platform built specifically for the **Indian Stock Market (NSE / BSE)**.

Instead of making unrealistic guaranteed predictions, **Stock Knows** operates strictly on **probabilistic modeling** by synthesizing real-time candlestick patterns with news sentiment flow, live market breadth, and fast intraday scalp radar.

---

## 🇮🇳 Key Features

- **🔴 Live Indian Market Data**: Live tracking of **Nifty 50 (`^NSEI`)**, **BSE Sensex (`^BSESN`)**, **Bank Nifty**, and top NSE bluechips (Reliance, Tata Motors, HDFC Bank, ICICI Bank, Infosys, ITC, etc.).
- **⚡ Real-Time Continuous Live Stream (Zero Reload)**: Powered by Server-Sent Events (SSE), continuously synchronizing live stock ticks, green/red flash indicators, and breaking pattern triggers every 3.5 seconds.
- **⚖️ Dedicated Market Breadth Section**: Real-time counter of stocks going up (`🟢 Advances`) vs stocks under pressure (`🔴 Declines`) with dual-color visual meter and Advance/Decline ratio.
- **⚡ Fast Intraday Scalper Radar**: Main focus on quick intraday profit opportunities with tight entry zones, quick targets (+1% to +1.5%), strict invalidation stop-losses (-0.6% to -0.7%), and 15–45m time horizons.
- **🔮 Visual Future Target Trajectory & Cone**: Projected future candle channel cone, directional forecast arrow, Target Flag with probability %, and tight invalidation SL line directly on the chart.
- **📈 TradingView Real-Time Candlestick Platform**: Real-time TradingView platform integration alongside a custom annotated Pattern Scout Canvas.
- **🧠 Direct, High-IQ Chatbot**: Answers exactly what is asked (market breadth, fast scalp setups, stock deep dives) without unnecessary boilerplate dumps.
- **🎯 Self-Reflection & Accuracy Journal**: Continuous machine tracking of past probabilistic calls evaluated against live prices with win-rate calibration.
- **✨ Cute & Eye-Friendly Aesthetic**: "Midnight Velvet" dark mode and "Sakura Pastel Cloud" light mode designed to prevent eye fatigue.

---

## 🤖 The 3 AI Agent Architecture

Stock Knows employs a specialized 3-agent hierarchy. You interact directly with **Agent 3**, who coordinates **Agent 1** and **Agent 2** behind the scenes:

```
                            ┌────────────────────────────────────────┐
                            │               USER                     │
                            └──────────────────┬─────────────────────┘
                                               │ (Commands & Chat)
                                               ▼
                         ┌──────────────────────────────────────────────┐
                         │   Agent 3: Stock Knows Master (Orchestrator) │
                         │      - Direct, High-IQ reasoning             │
                         │      - Fast Intraday Profit Focus            │
                         │      - Market Breadth Synthesis              │
                         │      - Strictly probabilistic (No guarantees)│
                         └──────────────┬────────────────┬──────────────┘
                                        │                │
                   ┌────────────────────┘                └────────────────────┐
                   ▼                                                          ▼
  ┌───────────────────────────────────┐                     ┌───────────────────────────────────┐
  │   Agent 1: Candle Scout           │                     │   Agent 2: News Radar             │
  │   - Real-time Candlestick Scanner │                     │   - Live Indian Financial News    │
  │   - 15+ Pattern Detectors         │                     │   - DII & FII Institutional Flow  │
  │   - Technical Bullish/Bearish %   │                     │   - Retail Buzz & Catalysts       │
  │   - EMA20, RSI, Support/Resist    │                     │   - Boom / Dump Forecasting       │
  └───────────────────────────────────┘                     └───────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/beestgamer34123r-crypto/stock-knows.git
cd stock-knows

# Install dependencies
npm install

# Start the application
npm start
```

Open your browser at **`http://localhost:3000`**.

---

## 📜 License
MIT License. Built for traders who value probabilities, disciplined risk-reward, and clean design.
