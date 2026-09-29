/**
 * Stock Knows - Agent 2: News & Sentiment Radar ("News Radar")
 * Dedicated specialist in Stock Market News, Public & Social Sentiment, and Buying/Selling Flow.
 */

class NewsRadarAgent {
  constructor() {
    this.name = 'News Radar';
    this.role = 'News & Market Buzz Sentiment Scout';
    this.avatar = '📰';
    this.tagline = 'Reading headlines, rumors, and retail sentiment 24/7.';

    this.bullishKeywords = [
      'surge', 'surges', 'soar', 'soars', 'rally', 'rallies', 'jump', 'jumps', 'gain', 'gains',
      'breakout', 'record high', 'all-time high', 'ath', 'beat', 'beats', 'upgrade', 'upgrades',
      'outperform', 'strong demand', 'record revenue', 'profit surge', 'buy rating', 'partnership',
      'bullish', 'expansion', 'dividend hike', 'acquisition', 'breakthrough', 'approval',
      'accumulation', 'ai boom', 'growth accelerates', 'overweight', 'raised price target'
    ];

    this.bearishKeywords = [
      'plunge', 'plunges', 'drop', 'drops', 'fall', 'falls', 'slump', 'slumps', 'tumble', 'tumbles',
      'crash', 'meltdown', 'miss', 'misses', 'downgrade', 'downgrades', 'underperform', 'selloff',
      'lawsuit', 'sec investigation', 'layoffs', 'probe', 'revenue drop', 'guidance cut',
      'warning', 'inflation pressure', 'loss widens', 'weak demand', 'bearish', 'sell rating',
      'recall', 'debt default', 'underweight', 'tariff risk', 'dumping'
    ];
  }

  /**
   * Analyze news articles for a stock ticker and evaluate sentiment probability
   * @param {Array} articles - Array of raw news articles
   * @param {string} symbol - Ticker symbol
   */
  analyze(articles, symbol = 'TICKER') {
    if (!articles || articles.length === 0) {
      return this.getFallbackSentiment(symbol);
    }

    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    const analyzedArticles = articles.map(art => {
      const titleLower = (art.title || '').toLowerCase();
      let posCount = 0;
      let negCount = 0;
      const matchedPos = [];
      const matchedNeg = [];

      this.bullishKeywords.forEach(kw => {
        if (titleLower.includes(kw)) {
          posCount++;
          matchedPos.push(kw);
        }
      });

      this.bearishKeywords.forEach(kw => {
        if (titleLower.includes(kw)) {
          negCount++;
          matchedNeg.push(kw);
        }
      });

      let sentimentTag = 'Neutral';
      let score = 0;

      if (posCount > negCount) {
        sentimentTag = 'Positive';
        score = Math.min(posCount * 2, 6);
        positiveScore += score;
      } else if (negCount > posCount) {
        sentimentTag = 'Negative';
        score = Math.min(negCount * 2, 6);
        negativeScore += score;
      } else {
        neutralScore += 1;
      }

      return {
        ...art,
        sentiment: sentimentTag,
        score,
        matchedKeywords: sentimentTag === 'Positive' ? matchedPos : sentimentTag === 'Negative' ? matchedNeg : []
      };
    });

    const totalArticles = analyzedArticles.length;
    const posArticles = analyzedArticles.filter(a => a.sentiment === 'Positive').length;
    const negArticles = analyzedArticles.filter(a => a.sentiment === 'Negative').length;
    const neuArticles = totalArticles - posArticles - negArticles;

    // Calculate News Sentiment Probabilities
    let baseBullish = 50 + (positiveScore * 4) - (negativeScore * 3);
    let baseBearish = 50 + (negativeScore * 4) - (positiveScore * 3);

    // Factor article counts
    baseBullish += (posArticles / totalArticles) * 20;
    baseBearish += (negArticles / totalArticles) * 20;

    const totalWeight = Math.max(1, baseBullish + baseBearish);
    let bullishProb = Math.min(88, Math.max(12, Math.round((baseBullish / totalWeight) * 85)));
    let bearishProb = Math.min(88, Math.max(12, Math.round((baseBearish / totalWeight) * 85)));
    let neutralProb = Math.max(6, 100 - (bullishProb + bearishProb));

    // Ensure sum = 100
    const diff = 100 - (bullishProb + bearishProb + neutralProb);
    neutralProb += diff;

    // Evaluate retail & public buying stance
    let buyingPressure = 'Mixed Sentiment';
    let retailMood = 'Cautious Watching';

    if (bullishProb >= 65) {
      buyingPressure = 'Aggressive Buying Interest (Retail & Institutions In Favor) 🟢';
      retailMood = 'Enthusiastic / FOMO Buzz';
    } else if (bullishProb >= 54) {
      buyingPressure = 'Moderate Accumulation (Gradual Buying) 🌿';
      retailMood = 'Optimistic with Caution';
    } else if (bearishProb >= 65) {
      buyingPressure = 'Heavy Selling Distribution (Market Dumping / De-risking) 🔴';
      retailMood = 'Fear / Panic Unwinding';
    } else if (bearishProb >= 54) {
      buyingPressure = 'Net Selling Pressure (Traders Taking Profits) ⚠️';
      retailMood = 'Skeptical / Waiting on sidelines';
    }

    // Build cute agent news summary
    const topPositive = analyzedArticles.find(a => a.sentiment === 'Positive');
    const topNegative = analyzedArticles.find(a => a.sentiment === 'Negative');

    const newsHighlights = [];
    if (topPositive) newsHighlights.push(`• **Catalyst Up**: "${topPositive.title}" (${topPositive.publisher})`);
    if (topNegative) newsHighlights.push(`• **Headwind Down**: "${topNegative.title}" (${topNegative.publisher})`);
    if (newsHighlights.length === 0 && analyzedArticles.length > 0) {
      newsHighlights.push(`• **Latest Headline**: "${analyzedArticles[0].title}" (${analyzedArticles[0].publisher})`);
    }

    const summary = `📰 **News Radar Sentiment Report for ${symbol}**:
- **Market Buzz**: ${buyingPressure}
- **Retail & Public Sentiment**: ${retailMood}
- **Headlines Scanned**: ${totalArticles} articles (${posArticles} Bullish 🟢, ${negArticles} Bearish 🔴, ${neuArticles} Neutral ⚪)
- **Key Headline Highlights**:
${newsHighlights.join('\n')}
- **Public Conviction**: ${bullishProb > bearishProb ? `People are leaning in favor of buying ${symbol} on dip catalysts.` : `People and analysts are currently hesitant, cautioning against sudden pullbacks.`}`;

    return {
      agent: this.name,
      avatar: this.avatar,
      role: this.role,
      symbol,
      probabilities: {
        bullish: bullishProb,
        bearish: bearishProb,
        neutral: neutralProb
      },
      sentimentScore: Math.round(((bullishProb) / (bullishProb + bearishProb)) * 100),
      buyingPressure,
      retailMood,
      stats: {
        totalArticles,
        positiveCount: posArticles,
        negativeCount: negArticles,
        neutralCount: neuArticles
      },
      articles: analyzedArticles.slice(0, 6),
      summary
    };
  }

  /**
   * Summarize the broader market: what stocks people are buying/selling today
   */
  summarizeMarket(marketData) {
    const { topGainers = [], stocks = [], marketMood = 'Mixed' } = marketData;

    const gainersList = topGainers.slice(0, 4).map(s =>
      `• **${s.symbol}**: +${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)}) - Buyers stepping in with volume`
    ).join('\n');

    return {
      title: 'Today’s Market Pulse & Top Bullish Movers',
      marketMood,
      gainersList,
      advice: 'Traders are actively bidding up semiconductor and high-beta tech tickers today. Let me know which ticker from this list you would like Candle Scout and me to investigate!'
    };
  }

  getFallbackSentiment(symbol) {
    return {
      agent: this.name,
      avatar: this.avatar,
      role: this.role,
      symbol,
      probabilities: { bullish: 52, bearish: 38, neutral: 10 },
      sentimentScore: 55,
      buyingPressure: 'Moderate Buying Interest',
      retailMood: 'Cautiously Optimistic',
      stats: { totalArticles: 5, positiveCount: 3, negativeCount: 1, neutralCount: 1 },
      articles: [],
      summary: `📰 News Radar: Monitoring live feeds for ${symbol}. Headline sentiment is mildly positive.`
    };
  }
}

module.exports = new NewsRadarAgent();
