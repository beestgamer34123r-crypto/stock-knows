/**
 * Stock Knows - Server (Indian Stock Market NSE / BSE)
 * Powers Indian indices, TradingView integration, Boom/Dump forecasting, and Self-Reflection tracking.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const marketData = require('./services/marketData');
const agent1Candle = require('./services/agent1Candle');
const agent2News = require('./services/agent2News');
const agent3Master = require('./services/agent3Master');
const accuracyTracker = require('./services/accuracyTracker');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Indian Market Summary Endpoint (Nifty 50, Sensex, Bank Nifty + Top Equities)
app.get('/api/market-summary', async (req, res) => {
  try {
    const summary = await marketData.getMarketSummary();
    const boomForecast = await marketData.getBoomAndDumpForecast();
    res.json({
      success: true,
      summary,
      boomForecast
    });
  } catch (err) {
    console.error('Error fetching market summary:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Boom & Dump Forecast Endpoint
app.get('/api/boom-dump', async (req, res) => {
  try {
    const forecast = await marketData.getBoomAndDumpForecast();
    res.json({ success: true, forecast });
  } catch (err) {
    console.error('Error fetching boom/dump forecast:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Accuracy & Self-Reflection Journal Endpoint
app.get('/api/accuracy', (req, res) => {
  try {
    const metrics = accuracyTracker.getMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    console.error('Error fetching accuracy metrics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Fetch Candlesticks Endpoint
app.get('/api/candles', async (req, res) => {
  try {
    const symbol = req.query.symbol || 'RELIANCE';
    const interval = req.query.interval || '1d';
    const range = req.query.range || '3mo';

    const data = await marketData.fetchCandles(symbol, interval, range);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching candles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Multi-Agent Analysis Endpoint (Runs Agent 1, Agent 2, Agent 3)
app.post('/api/analyze', async (req, res) => {
  try {
    const { symbol = 'RELIANCE', interval = '1d', range = '3mo' } = req.body;
    const result = await agent3Master.runAnalysis(symbol, interval, range);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error running multi-agent analysis:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, symbol = 'RELIANCE', geminiKey = process.env.GEMINI_API_KEY } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const response = await agent3Master.handleUserChat(message, symbol, geminiKey);
    res.json({ success: true, response });
  } catch (err) {
    console.error('Error in agent chat:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌸 Stock Knows Indian Market server running on http://localhost:${PORT}`);
  console.log(`✨ Tracking: Nifty 50 (^NSEI), Sensex (^BSESN), Bank Nifty & Top NSE Equities`);
});
