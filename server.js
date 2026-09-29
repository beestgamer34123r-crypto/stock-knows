/**
 * Stock Knows - Server
 * Express web server powering the multi-agent stock market intelligence platform.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const marketData = require('./services/marketData');
const agent1Candle = require('./services/agent1Candle');
const agent2News = require('./services/agent2News');
const agent3Master = require('./services/agent3Master');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Market Summary Endpoint
app.get('/api/market-summary', async (req, res) => {
  try {
    const summary = await marketData.getMarketSummary();
    const newsSummary = agent2News.summarizeMarket(summary);
    res.json({
      success: true,
      summary,
      newsSummary
    });
  } catch (err) {
    console.error('Error fetching market summary:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Fetch Candlesticks Endpoint
app.get('/api/candles', async (req, res) => {
  try {
    const symbol = req.query.symbol || 'NVDA';
    const interval = req.query.interval || '1d';
    const range = req.query.range || '3mo';

    const data = await marketData.fetchCandles(symbol, interval, range);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching candles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Multi-Agent Analysis Endpoint (Runs Agent 1, Agent 2, Agent 3)
app.post('/api/analyze', async (req, res) => {
  try {
    const { symbol = 'NVDA', interval = '1d', range = '3mo' } = req.body;
    const result = await agent3Master.runAnalysis(symbol, interval, range);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error running multi-agent analysis:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Chat Endpoint (Interacting with Agent 3, who consults Agents 1 & 2)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, symbol = 'NVDA', geminiKey = process.env.GEMINI_API_KEY } = req.body;
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

// Serve Frontend index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌸 Stock Knows server is glowing on http://localhost:${PORT}`);
  console.log(`✨ Multi-Agent System Active: [Agent 1: Candle Scout] + [Agent 2: News Radar] + [Agent 3: Stock Knows Master]`);
});
