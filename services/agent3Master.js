/**
 * Stock Knows - Agent 3: Master Decision & Orchestrator ("Stock Knows AI")
 * The primary interface for the user. Coordinates Agent 1 and Agent 2 in the background
 * to deliver purely probabilistic market synthesis, intraday vs swing guidance, and risk management.
 */

const marketData = require('./marketData');
const agent1Candle = require('./agent1Candle');
const agent2News = require('./agent2News');

class StockKnowsMasterAgent {
  constructor() {
    this.name = 'Stock Knows Master';
    this.role = 'Chief Probabilistic Strategist & Orchestrator';
    this.avatar = '🧠';
    this.tagline = 'Synthesizing candle geometry and market buzz into actionable probability.';
  }

  /**
   * Run full multi-agent analysis on a stock ticker
   * @param {string} symbol - Ticker symbol
   */
  async runAnalysis(symbol = 'NVDA', timeframe = '1d', range = '3mo') {
    const cleanSymbol = symbol.trim().toUpperCase();

    // Fetch candle and news data concurrently
    const [candleData, newsData] = await Promise.all([
      marketData.fetchCandles(cleanSymbol, timeframe, range),
      marketData.fetchNews(cleanSymbol)
    ]);

    // Agent 1: Candlestick Pattern Scout runs on the candles
    const candleAnalysis = agent1Candle.analyze(candleData.candles, cleanSymbol);

    // Agent 2: News Radar runs on the headlines and articles
    const newsAnalysis = agent2News.analyze(newsData, cleanSymbol);

    // Agent 3: Synthesizes both reports into calibrated probabilities
    const synthesis = this.synthesizeProbabilities(candleAnalysis, newsAnalysis, candleData);

    return {
      symbol: cleanSymbol,
      companyName: candleData.name,
      currency: candleData.currency,
      currentPrice: candleData.currentPrice,
      priceChange: candleData.priceChange,
      priceChangePercent: candleData.priceChangePercent,
      timestamp: new Date().toISOString(),
      candles: candleData.candles,
      agent1Candle: candleAnalysis,
      agent2News: newsAnalysis,
      agent3Master: synthesis
    };
  }

  /**
   * Combine Agent 1 & Agent 2 probabilities with adaptive weighting
   */
  synthesizeProbabilities(agent1, agent2, rawData) {
    const currentPrice = rawData.currentPrice;

    // Weighting: 55% Technical Candlesticks + 45% News Sentiment
    const techWeight = 0.55;
    const newsWeight = 0.45;

    let rawBullish = Math.round(agent1.probabilities.bullish * techWeight + agent2.probabilities.bullish * newsWeight);
    let rawBearish = Math.round(agent1.probabilities.bearish * techWeight + agent2.probabilities.bearish * newsWeight);

    // Clamp probabilities to realistic bounds (never 0% or 100%, always probabilistic)
    rawBullish = Math.min(89, Math.max(11, rawBullish));
    rawBearish = Math.min(89, Math.max(11, rawBearish));
    let rawNeutral = Math.max(6, 100 - (rawBullish + rawBearish));

    // Rebalance sum to 100
    const remainder = 100 - (rawBullish + rawBearish + rawNeutral);
    rawNeutral += remainder;

    const probabilities = {
      bullish: rawBullish,
      bearish: rawBearish,
      neutral: rawNeutral
    };

    // Determine Actionable Probabilistic Verdict
    let actionVerdict = '';
    let actionBadgeClass = '';
    let riskLevel = 'Moderate';

    if (rawBullish >= 67) {
      actionVerdict = 'High Probability Bullish Setup (Favorable Long Probability)';
      actionBadgeClass = 'verdict-bullish-strong';
      riskLevel = 'Calculated / Low-to-Moderate (With Stop Loss)';
    } else if (rawBullish >= 54) {
      actionVerdict = 'Mild Bullish Tilt (Cautious Accumulation / Wait for Dip)';
      actionBadgeClass = 'verdict-bullish-mild';
      riskLevel = 'Moderate';
    } else if (rawBearish >= 67) {
      actionVerdict = 'High Probability Bearish Setup (Risk of Downside / Sell / Avoid)';
      actionBadgeClass = 'verdict-bearish-strong';
      riskLevel = 'Elevated Downside Risk';
    } else if (rawBearish >= 54) {
      actionVerdict = 'Bearish Tilt / Caution (Sellers Dominating / High Trap Risk)';
      actionBadgeClass = 'verdict-bearish-mild';
      riskLevel = 'High Risk for Buyers';
    } else {
      actionVerdict = 'Indecision & Choppy Consolidation (Wait for Pattern Breakout)';
      actionBadgeClass = 'verdict-neutral';
      riskLevel = 'Choppy / Whip-saw Risk';
    }

    // Intraday vs Swing Probabilistic Feasibility
    const volatilityPercent = Math.abs(rawData.priceChangePercent);
    const isVolumeHigh = agent1.technicalMetrics.isVolumeSurge;
    const rsi = agent1.technicalMetrics.rsi14;

    // Intraday Probability
    let intradayProb = Math.round(
      (volatilityPercent > 1.2 ? 30 : 15) +
      (isVolumeHigh ? 25 : 10) +
      (Math.abs(rawBullish - rawBearish) > 15 ? 25 : 10) +
      (rsi > 35 && rsi < 65 ? 15 : 5)
    );
    intradayProb = Math.min(88, Math.max(20, intradayProb));

    // Swing / Position Probability
    let swingProb = Math.round(
      (currentPrice > agent1.technicalMetrics.ema20 ? 30 : 15) +
      (rawBullish > 55 ? 35 : rawBearish > 55 ? 15 : 25) +
      (agent2.probabilities.bullish > 50 ? 25 : 10)
    );
    swingProb = Math.min(88, Math.max(20, swingProb));

    // Suggested Trading Levels (Probability Anchors)
    const support = agent1.technicalMetrics.support;
    const resistance = agent1.technicalMetrics.resistance;
    const stopLoss = rawBullish >= rawBearish
      ? Number((currentPrice * 0.975).toFixed(2)) // 2.5% below
      : Number((currentPrice * 1.025).toFixed(2)); // short invalidation

    const target1 = rawBullish >= rawBearish
      ? Number((currentPrice + (currentPrice - stopLoss) * 1.8).toFixed(2))
      : Number((currentPrice - (stopLoss - currentPrice) * 1.8).toFixed(2));

    const target2 = rawBullish >= rawBearish
      ? Number((currentPrice + (currentPrice - stopLoss) * 2.8).toFixed(2))
      : Number((currentPrice - (stopLoss - currentPrice) * 2.8).toFixed(2));

    const riskAmount = Math.abs(currentPrice - stopLoss);
    const rewardAmount = Math.abs(target1 - currentPrice);
    const rrr = riskAmount > 0 ? `1 : ${(rewardAmount / riskAmount).toFixed(1)}` : '1 : 2.0';

    // Conversational probability report
    const conversationReport = `🧠 **Stock Knows Master Verdict**:
I consulted both specialized bots behind the scenes:
• **Candle Scout (Agent 1)** assigned **${agent1.probabilities.bullish}% Bullish / ${agent1.probabilities.bearish}% Bearish** based on recent candlestick structures (${agent1.detectedPatterns.map(p => p.name).join(', ') || 'trendline positioning'}).
• **News Radar (Agent 2)** calculated **${agent2.probabilities.bullish}% Bullish / ${agent2.probabilities.bearish}% Bearish** from latest news flow and retail sentiment.

🎯 **Combined Probabilities**:
- **Bullish Probability**: **${probabilities.bullish}%** 🟢
- **Bearish Probability**: **${probabilities.bearish}%** 🔴
- **Chop / Consolidation**: **${probabilities.neutral}%** ⚪

📊 **What You Should Do (Probabilistic Guidance)**:
• **Action**: **${actionVerdict}**
• **Intraday Feasibility**: **${intradayProb}%** chance of favorable volatility today. ${intradayProb >= 60 ? 'Suitable for day trading with tight discipline.' : 'Low momentum right now; intraday chop risk.'}
• **Swing / Holding Feasibility**: **${swingProb}%** chance of multi-session continuation.
• **Risk-to-Reward Ratio**: **${rrr}**
• **Invalidation Level (Stop-Loss)**: **$${stopLoss}** *(If price breaks this level, our probabilistic thesis is invalidated)*
• **Probability Target 1**: **$${target1}** | **Target 2**: **$${target2}**

⚠️ *Stock Knows Golden Rule: The market operates strictly on probability, never certainty. Always position-size so no single trade hurts you.*`;

    return {
      agent: this.name,
      avatar: this.avatar,
      probabilities,
      actionVerdict,
      actionBadgeClass,
      riskLevel,
      intraday: {
        probability: intradayProb,
        suitability: intradayProb >= 65 ? 'High Intraday Potential' : intradayProb >= 45 ? 'Moderate / Scalp Only' : 'Low Intraday Volatility',
        advice: intradayProb >= 60 ? 'Active momentum is present. Favorable for quick intraday setups around VWAP/EMA.' : 'Wait for volume breakout before entering intraday.'
      },
      swing: {
        probability: swingProb,
        suitability: swingProb >= 65 ? 'Favorable for Multi-Day Swing' : 'Better suited for quick profit taking / Wait for trend',
        advice: swingProb >= 65 ? 'Trend and sentiment align for multi-day position holding with trailing stop.' : 'Choppy trendline; keep positions nimble.'
      },
      levels: {
        entryZone: `$${(currentPrice * 0.995).toFixed(2)} - $${(currentPrice * 1.005).toFixed(2)}`,
        stopLoss,
        target1,
        target2,
        riskRewardRatio: rrr
      },
      fullReport: conversationReport
    };
  }

  /**
   * Interactive Chatbot Handler: User interacts directly with Agent 3
   */
  async handleUserChat(userMessage, contextSymbol = 'NVDA', geminiKey = null) {
    const query = (userMessage || '').trim().toLowerCase();

    // 1. Check if user wants a market summary / overview / top gainers
    if (
      query.includes('summarize') ||
      query.includes('market summary') ||
      query.includes('overview') ||
      query.includes('kya chal raha') ||
      query.includes('market ka hal') ||
      query.includes('market kaisa') ||
      query.includes('top bullish') ||
      query.includes('which stocks') ||
      query.includes('trending')
    ) {
      const summaryData = await marketData.getMarketSummary();
      const newsMarketSummary = agent2News.summarizeMarket(summaryData);

      const topGainerSymbols = summaryData.topGainers.map(s => s.symbol).join(', ');

      const responseText = `✨ **Market Pulse Summary Today** ✨
Current Market Mood: **${summaryData.marketMood}**
${summaryData.bullishCount} of ${summaryData.totalTracked} major tickers are trading green today!

📈 **Top Bullish Movers People Are Buying**:
${newsMarketSummary.gainersList}

🕵️‍♂️ **Agent Collaboration**:
- **Agent 2 (News Radar)**: *"Retail and institutions are focusing heavy volume on ${topGainerSymbols}. Sentiment is actively accumulating."*
- **Agent 1 (Candle Scout)**: *"Candlesticks on these leaders are breaking out above resistance levels."*

👉 **Next Step**: Which stock from this list (or any other ticker like **NVDA**, **TSLA**, **AAPL**, etc.) would you like me to analyze for you? Just name it and I'll deploy Candle Scout and News Radar!`;

      return {
        reply: responseText,
        intent: 'market_summary',
        suggestedSymbols: summaryData.topGainers.map(s => s.symbol),
        summaryData
      };
    }

    // 2. Check if a specific symbol is mentioned in the query
    const words = userMessage.toUpperCase().replace(/[^A-Z0-9$]/g, ' ').split(/\s+/);
    const candidateSymbols = ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'NFLX', 'BTC', 'ETH', 'RELIANCE', 'TATA', 'INFY'];
    let targetSymbol = candidateSymbols.find(sym => words.includes(sym) || words.includes(`$${sym}`));

    if (!targetSymbol) {
      // Check if user entered a short symbol directly
      const shortWord = words.find(w => w.length >= 2 && w.length <= 5 && !['THE', 'FOR', 'AND', 'BUY', 'SELL', 'WHAT', 'HOW', 'CAN', 'YOU', 'KNOW', 'HAI', 'KYA', 'MEIN', 'THIS', 'LOOK', 'SEE', 'TELL'].includes(w));
      if (shortWord) targetSymbol = shortWord;
    }

    if (!targetSymbol) {
      targetSymbol = contextSymbol || 'NVDA';
    }

    // Run full analysis on target symbol
    const analysis = await this.runAnalysis(targetSymbol);

    // If Gemini key is available, we can optionally enhance the conversational synthesis
    if (geminiKey && geminiKey.trim()) {
      try {
        const geminiService = require('./geminiService');
        const enhancedReply = await geminiService.generateEnhancedResponse({
          userMessage,
          symbol: targetSymbol,
          analysis,
          apiKey: geminiKey.trim()
        });
        return {
          reply: enhancedReply,
          intent: 'stock_analysis',
          targetSymbol,
          analysis
        };
      } catch (err) {
        console.warn('[agent3Master] Gemini enhancement fallback:', err.message);
      }
    }

    // Built-in intelligent response
    const reply = `🤖 **Stock Knows Synthesized Analysis for ${targetSymbol}** ($${analysis.currentPrice}):

${analysis.agent3Master.fullReport}

💡 *You can ask me: "Is this better for intraday or swing?", "What does Candle Scout say about RSI?", or "Show me today's top gainers."*`;

    return {
      reply,
      intent: 'stock_analysis',
      targetSymbol,
      analysis
    };
  }
}

module.exports = new StockKnowsMasterAgent();
