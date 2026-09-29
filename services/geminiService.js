/**
 * Stock Knows - Gemini AI Service (Optional LLM Enhancement)
 * Enhances Agent 3's conversational ability using Google Gemini if an API key is provided.
 */

async function generateEnhancedResponse({ userMessage, symbol, analysis, apiKey }) {
  if (!apiKey) {
    throw new Error('No API key provided');
  }

  const { agent1Candle, agent2News, agent3Master, currentPrice } = analysis;

  const systemPrompt = `You are "Stock Knows Master", the head AI strategist of the Stock Knows platform.
You have two specialized background agents reporting to you:
1. "Candle Scout" (Agent 1): Candlestick pattern expert.
   - Patterns detected: ${agent1Candle.detectedPatterns.map(p => p.name).join(', ') || 'No single extreme pattern'}
   - Candlestick Probabilities: Bullish ${agent1Candle.probabilities.bullish}%, Bearish ${agent1Candle.probabilities.bearish}%, Neutral ${agent1Candle.probabilities.neutral}%
   - RSI (14): ${agent1Candle.technicalMetrics.rsi14}, EMA20: $${agent1Candle.technicalMetrics.ema20}
2. "News Radar" (Agent 2): News sentiment and retail/institutional buzz scout.
   - Sentiment: ${agent2News.buyingPressure} (${agent2News.retailMood})
   - News Probabilities: Bullish ${agent2News.probabilities.bullish}%, Bearish ${agent2News.probabilities.bearish}%, Neutral ${agent2News.probabilities.neutral}%

Your Synthesized Master Probabilities for ${symbol} ($${currentPrice}):
- Bullish: ${agent3Master.probabilities.bullish}%
- Bearish: ${agent3Master.probabilities.bearish}%
- Neutral/Chop: ${agent3Master.probabilities.neutral}%
- Action Verdict: ${agent3Master.actionVerdict}
- Intraday Feasibility: ${agent3Master.intraday.probability}% (${agent3Master.intraday.suitability})
- Swing Feasibility: ${agent3Master.swing.probability}% (${agent3Master.swing.suitability})
- Stop Loss (Invalidation): $${agent3Master.levels.stopLoss} | Target 1: $${agent3Master.levels.target1} | RRR: ${agent3Master.levels.riskRewardRatio}

CRITICAL RULES:
1. ALWAYS talk in probabilities. NEVER guarantee anything (e.g. say "There is a 72% bullish probability" instead of "It will definitely go up").
2. Answer the user's specific question directly, concisely, and warmly.
3. Tone: Cute, friendly, comforting, visually pleasing, professional yet fun ("ankhon ko achi lage").
4. If the user writes in Hindi or Hinglish, reply warmly in friendly Hinglish! Otherwise reply in clear English.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          { text: `User Message: "${userMessage}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 800
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || agent3Master.fullReport;
}

module.exports = {
  generateEnhancedResponse
};
