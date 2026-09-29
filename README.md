# 🌸 Stock Knows — 3 AI Agents Pure Market Probabilities

A cute, eye-soothing, and intelligent multi-agent stock market intelligence platform. 

Instead of making unrealistic guaranteed predictions, **Stock Knows** operates strictly on **probabilistic modeling** by synthesizing real-time candlestick patterns with news sentiment flow.

---

## 🤖 The 3 AI Agent Architecture

Stock Knows employs a specialized 3-agent hierarchy. You interact directly with **Agent 3**, who directs and coordinates **Agent 1** and **Agent 2** behind the scenes:

```
                            ┌────────────────────────────────────────┐
                            │               USER                     │
                            └──────────────────┬─────────────────────┘
                                               │ (Commands & Chat)
                                               ▼
                         ┌──────────────────────────────────────────────┐
                         │   Agent 3: Stock Knows Master (Orchestrator) │
                         │      - Combines probabilities                │
                         │      - Calculates Intraday vs Swing Feasibility
                         │      - Strictly probabilistic (No guarantees)│
                         └──────────────┬────────────────┬──────────────┘
                                        │                │
                   ┌────────────────────┘                └────────────────────┐
                   ▼                                                          ▼
  ┌───────────────────────────────────┐                     ┌───────────────────────────────────┐
  │   Agent 1: Candle Scout           │                     │   Agent 2: News Radar             │
  │   - Real-time Candlestick Scanner │                     │   - News & Sentiment Scout        │
  │   - 15+ Pattern Detectors         │                     │   - Public & Retail Buzz Radar    │
  │   - Technical Bullish/Bearish %   │                     │   - Market Movers & Top Gainers   │
  └───────────────────────────────────┘                     └───────────────────────────────────┘
```

### 1. 🕯️ Agent 1: Candle Scout (Candlestick Pattern Specialist)
- **Role**: Continuously monitors OHLCV price action DNA.
- **Pattern Detectors**: Detects Hammer, Inverted Hammer, Shooting Star, Hanging Man, Bullish/Bearish Engulfing, Morning/Evening Star, Three White Soldiers, Three Black Crows, Piercing Line, Dark Cloud Cover, Harami, and Dojis.
- **Technical Metrics**: Computes RSI (14), EMA 20, EMA 50, dynamic Support & Resistance zones, and volume surges.
- **Output**: Generates a **Technical Probability Breakdown** (`Bullish %`, `Bearish %`, `Neutral %`).

### 2. 📰 Agent 2: News Radar (News & Market Buzz Specialist)
- **Role**: Scours financial news feeds, headlines, and retail buzz.
- **Sentiment Engine**: Evaluates buying accumulation vs distribution selling pressure.
- **Market Pulse**: Identifies top trending stocks and today's strongest gainers.
- **Output**: Generates a **News Sentiment Probability Breakdown** (`Bullish %`, `Bearish %`, `Neutral %`).

### 3. 🧠 Agent 3: Stock Knows Master (Chief Strategist & Decision Engine)
- **Role**: The only agent the user interacts with directly.
- **Bayesian Synthesis**: Fuses Candle Scout's price action probabilities with News Radar's sentiment scores into a single composite probability.
- **Probabilistic Edge**:
  - Probability Score: e.g. **72% Bullish / 18% Bearish / 10% Chop**
  - Action Recommendation: High Probability Bullish Setup, Bearish Warning, or Indecision Trap.
  - Intraday Trade Suitability (%) & Entry/Invalidation Zones.
  - Multi-Day Swing Feasibility (%) & Trend Alignment.
  - Risk-to-Reward Ratio (e.g. 1 : 2.5) with strict Stop-Loss anchor.
- **Golden Rule**: Operates strictly on probability. **Zero false guarantees.**

---

## ✨ Design: Cute & Easy on the Eyes ("Ankhon ko achi lage")

- **Soothing Theme**: Gentle "Midnight Velvet" dark mode with soft lavender, mint emerald, and warm rose accents, designed to prevent eye fatigue during long market sessions.
- **Cute Avatars & Badges**: Friendly mascots representing each agent with live animated status indicators.
- **Interactive Candlestick Chart**: High-DPI Canvas chart with zoom, crosshairs, EMA20 overlay, and visual pattern annotation badges directly on the candles!
- **Market Summary Drawer**: Quick one-click summary of today's bullish market leaders.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Stock-Knows.git
cd Stock-Knows

# Install dependencies
npm install

# Start the application
npm start
```

Open your browser at **`http://localhost:3000`**.

---

## ⚙️ Configuration (Optional)

Stock Knows has a built-in intelligent multi-agent probability engine that works **100% out of the box** without any external keys.

If you wish to unlock free-form natural language generation with Google Gemini:
1. Create a `.env` file or click **⚙️ Settings** in the UI.
2. Add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 📜 License
MIT License. Built for traders who value probabilities over hype.
