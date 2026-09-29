/**
 * Stock Knows - Agent 1: Candlestick Pattern Scout ("Candle Scout")
 * Dedicated specialist in Candlestick Patterns, Price Action DNA, and Technical Probabilities.
 */

class CandleScoutAgent {
  constructor() {
    this.name = 'Candle Scout';
    this.role = 'Candlestick Pattern & Technical Analyst';
    this.avatar = '🕯️';
    this.tagline = 'Eyes on every wick and body in real-time.';
  }

  /**
   * Analyze candlestick data for patterns, technical momentum, and compute bullish/bearish probability.
   * @param {Array} candles - Array of OHLCV candles
   * @param {string} symbol - Ticker symbol
   */
  analyze(candles, symbol = 'TICKER') {
    if (!candles || candles.length < 5) {
      return this.getFallbackAnalysis(symbol);
    }

    const detectedPatterns = [];
    const n = candles.length;
    const current = candles[n - 1];
    const prev1 = candles[n - 2];
    const prev2 = candles[n - 3];
    const prev3 = candles[n - 4];

    // Helper functions for candle anatomy
    const body = (c) => Math.abs(c.close - c.open);
    const range = (c) => Math.max(c.high - c.low, 0.001);
    const upperWick = (c) => c.high - Math.max(c.open, c.close);
    const lowerWick = (c) => Math.min(c.open, c.close) - c.low;
    const isGreen = (c) => c.close > c.open;
    const isRed = (c) => c.close < c.open;
    const isDoji = (c) => body(c) / range(c) < 0.12;

    // Detect recent trend (last 10 candles)
    const recentSlice = candles.slice(-10);
    const trendSlope = (recentSlice[recentSlice.length - 1].close - recentSlice[0].close) / recentSlice[0].close;
    const isDowntrend = trendSlope < -0.015;
    const isUptrend = trendSlope > 0.015;

    // 1. Single Candle Patterns on Current & Prev1
    [
      { c: current, label: 'Current Candle', idx: n - 1 },
      { c: prev1, label: 'Previous Candle', idx: n - 2 }
    ].forEach(({ c, label, idx }) => {
      const b = body(c);
      const r = range(c);
      const uw = upperWick(c);
      const lw = lowerWick(c);

      // Hammer (Bullish Reversal)
      if (lw >= 1.8 * b && uw <= 0.25 * b && (isDowntrend || c.close < prev2.close)) {
        detectedPatterns.push({
          name: 'Hammer',
          bias: 'Bullish',
          confidence: 82,
          candleIndex: idx,
          price: c.close,
          description: `${label} formed a textbook Hammer with a long lower shadow (${(lw / b).toFixed(1)}x body), indicating buyers strongly rejected lower prices.`
        });
      }

      // Inverted Hammer (Bullish Reversal)
      if (uw >= 1.8 * b && lw <= 0.25 * b && isDowntrend) {
        detectedPatterns.push({
          name: 'Inverted Hammer',
          bias: 'Bullish',
          confidence: 74,
          candleIndex: idx,
          price: c.close,
          description: `${label} formed an Inverted Hammer with high upper rejection after a dip, signaling testing of buying strength.`
        });
      }

      // Shooting Star (Bearish Reversal)
      if (uw >= 1.8 * b && lw <= 0.25 * b && (isUptrend || c.high > prev2.high)) {
        detectedPatterns.push({
          name: 'Shooting Star',
          bias: 'Bearish',
          confidence: 84,
          candleIndex: idx,
          price: c.close,
          description: `${label} flashed a Shooting Star! Price pushed higher to $${c.high} but bears aggressively pushed it back down before close.`
        });
      }

      // Hanging Man (Bearish Reversal)
      if (lw >= 1.8 * b && uw <= 0.25 * b && isUptrend) {
        detectedPatterns.push({
          name: 'Hanging Man',
          bias: 'Bearish',
          confidence: 76,
          candleIndex: idx,
          price: c.close,
          description: `${label} showed a Hanging Man pattern at the top of an uptrend, revealing sudden selling pressure.`
        });
      }

      // Doji / Dragonfly / Gravestone
      if (isDoji(c)) {
        if (lw > 2 * uw && lw > 0.6 * r) {
          detectedPatterns.push({
            name: 'Dragonfly Doji',
            bias: 'Bullish',
            confidence: 78,
            candleIndex: idx,
            price: c.close,
            description: `${label} created a Dragonfly Doji: extreme lower rejection showing bears failed to keep prices down.`
          });
        } else if (uw > 2 * lw && uw > 0.6 * r) {
          detectedPatterns.push({
            name: 'Gravestone Doji',
            bias: 'Bearish',
            confidence: 80,
            candleIndex: idx,
            price: c.close,
            description: `${label} created a Gravestone Doji: bulls got exhausted at $${c.high}, indicating a potential reversal down.`
          });
        } else {
          detectedPatterns.push({
            name: 'Neutral Doji',
            bias: 'Neutral',
            confidence: 70,
            candleIndex: idx,
            price: c.close,
            description: `${label} is a tight Doji candle, showing equal standoff between buyers and sellers (indecision).`
          });
        }
      }

      // Marubozu (Power momentum candle)
      if (b / r > 0.85 && r > 0.01 * c.close) {
        if (isGreen(c)) {
          detectedPatterns.push({
            name: 'Bullish Marubozu',
            bias: 'Bullish',
            confidence: 85,
            candleIndex: idx,
            price: c.close,
            description: `${label} is a solid Bullish Marubozu with virtually no shadows. Strong institutional buying throughout the period.`
          });
        } else {
          detectedPatterns.push({
            name: 'Bearish Marubozu',
            bias: 'Bearish',
            confidence: 85,
            candleIndex: idx,
            price: c.close,
            description: `${label} is a heavy Bearish Marubozu, reflecting decisive seller dominance.`
          });
        }
      }
    });

    // 2. Two-Candle Patterns (prev1 + current)
    // Bullish Engulfing
    if (isRed(prev1) && isGreen(current) && current.open <= prev1.close && current.close >= prev1.open) {
      detectedPatterns.push({
        name: 'Bullish Engulfing',
        bias: 'Bullish',
        confidence: 88,
        candleIndex: n - 1,
        price: current.close,
        description: `Current green candle completely engulfs the prior red candle! Major bullish reversal signal.`
      });
    }

    // Bearish Engulfing
    if (isGreen(prev1) && isRed(current) && current.open >= prev1.close && current.close <= prev1.open) {
      detectedPatterns.push({
        name: 'Bearish Engulfing',
        bias: 'Bearish',
        confidence: 88,
        candleIndex: n - 1,
        price: current.close,
        description: `Current red candle completely engulfed the prior green candle! Bears have taken immediate control.`
      });
    }

    // Piercing Line (Bullish)
    if (isRed(prev1) && isGreen(current) && current.open < prev1.low && current.close > (prev1.open + prev1.close) / 2 && current.close < prev1.open) {
      detectedPatterns.push({
        name: 'Piercing Line',
        bias: 'Bullish',
        confidence: 80,
        candleIndex: n - 1,
        price: current.close,
        description: `Bullish Piercing Line formed: price opened below previous low but closed well above the midpoint of the prior red candle.`
      });
    }

    // Dark Cloud Cover (Bearish)
    if (isGreen(prev1) && isRed(current) && current.open > prev1.high && current.close < (prev1.open + prev1.close) / 2 && current.close > prev1.open) {
      detectedPatterns.push({
        name: 'Dark Cloud Cover',
        bias: 'Bearish',
        confidence: 80,
        candleIndex: n - 1,
        price: current.close,
        description: `Dark Cloud Cover detected: opened higher than previous high but sank below the 50% body level of the green candle.`
      });
    }

    // Bullish Harami (Inside bar reversal)
    if (isRed(prev1) && isGreen(current) && current.open > prev1.close && current.close < prev1.open && body(current) < 0.6 * body(prev1)) {
      detectedPatterns.push({
        name: 'Bullish Harami',
        bias: 'Bullish',
        confidence: 72,
        candleIndex: n - 1,
        price: current.close,
        description: `Bullish Harami inside bar: contraction of selling momentum, signaling a potential upward bounce.`
      });
    }

    // Bearish Harami
    if (isGreen(prev1) && isRed(current) && current.open < prev1.close && current.close > prev1.open && body(current) < 0.6 * body(prev1)) {
      detectedPatterns.push({
        name: 'Bearish Harami',
        bias: 'Bearish',
        confidence: 72,
        candleIndex: n - 1,
        price: current.close,
        description: `Bearish Harami inside bar: upward momentum stalled within the prior candle's body.`
      });
    }

    // 3. Three-Candle Patterns (prev2, prev1, current)
    // Morning Star (Bullish Reversal)
    if (isRed(prev2) && isDoji(prev1) && isGreen(current) && current.close > (prev2.open + prev2.close) / 2) {
      detectedPatterns.push({
        name: 'Morning Star',
        bias: 'Bullish',
        confidence: 90,
        candleIndex: n - 1,
        price: current.close,
        description: `Classic 3-candle Morning Star: steep decline halted by a star candle, followed by decisive bullish confirmation.`
      });
    }

    // Evening Star (Bearish Reversal)
    if (isGreen(prev2) && isDoji(prev1) && isRed(current) && current.close < (prev2.open + prev2.close) / 2) {
      detectedPatterns.push({
        name: 'Evening Star',
        bias: 'Bearish',
        confidence: 90,
        candleIndex: n - 1,
        price: current.close,
        description: `Classic 3-candle Evening Star: rally paused with indecision, now confirmed by strong selling pressure.`
      });
    }

    // Three White Soldiers
    if (isGreen(prev2) && isGreen(prev1) && isGreen(current) &&
        prev1.close > prev2.close && current.close > prev1.close &&
        body(current) > 0.005 * current.close && body(prev1) > 0.005 * prev1.close) {
      detectedPatterns.push({
        name: 'Three White Soldiers',
        bias: 'Bullish',
        confidence: 86,
        candleIndex: n - 1,
        price: current.close,
        description: `Three White Soldiers advancing: sustained high-volume bullish breakout across three consecutive intervals.`
      });
    }

    // Three Black Crows
    if (isRed(prev2) && isRed(prev1) && isRed(current) &&
        prev1.close < prev2.close && current.close < prev1.close &&
        body(current) > 0.005 * current.close && body(prev1) > 0.005 * prev1.close) {
      detectedPatterns.push({
        name: 'Three Black Crows',
        bias: 'Bearish',
        confidence: 86,
        candleIndex: n - 1,
        price: current.close,
        description: `Three Black Crows descending: persistent aggressive supply and cascading breakdowns.`
      });
    }

    // Compute Moving Averages & RSI
    const closes = candles.map(c => c.close);
    const ema9 = this.calculateEMA(closes, 9);
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, Math.min(50, closes.length - 1));
    const rsi14 = this.calculateRSI(closes, 14);

    // Support and Resistance based on swing pivots
    const { support, resistance } = this.calculatePivotLevels(candles);

    // Volume Analysis
    const avgVolume20 = candles.slice(-20).reduce((acc, c) => acc + c.volume, 0) / Math.min(20, candles.length);
    const volumeRatio = avgVolume20 > 0 ? current.volume / avgVolume20 : 1;
    const isVolumeSurge = volumeRatio >= 1.4;

    // Calculate Technical Probabilities
    let bullishScore = 50;
    let bearishScore = 50;

    // Impact from patterns
    detectedPatterns.forEach(p => {
      const weight = (p.confidence / 100) * 18;
      if (p.bias === 'Bullish') {
        bullishScore += weight;
        bearishScore -= weight * 0.7;
      } else if (p.bias === 'Bearish') {
        bearishScore += weight;
        bullishScore -= weight * 0.7;
      }
    });

    // Impact from Moving Averages
    if (current.close > ema20) {
      bullishScore += 8;
      bearishScore -= 5;
    } else {
      bearishScore += 8;
      bullishScore -= 5;
    }

    if (ema9 > ema20) {
      bullishScore += 6;
    } else {
      bearishScore += 6;
    }

    // Impact from RSI
    if (rsi14 < 30) {
      // Oversold bounce probability
      bullishScore += 10;
    } else if (rsi14 > 70) {
      // Overbought exhaustion probability
      bearishScore += 10;
    } else if (rsi14 >= 50 && rsi14 <= 65) {
      bullishScore += 5; // Healthy bullish momentum
    } else if (rsi14 < 50 && rsi14 >= 35) {
      bearishScore += 5; // Mild bearish slope
    }

    // Volume confirmation
    if (isVolumeSurge) {
      if (isGreen(current)) bullishScore += 7;
      if (isRed(current)) bearishScore += 7;
    }

    // Normalize probabilities into clean percentages that total 100
    const rawSum = Math.max(1, bullishScore + bearishScore);
    let bullishProb = Math.min(88, Math.max(12, Math.round((bullishScore / rawSum) * 85)));
    let bearishProb = Math.min(88, Math.max(12, Math.round((bearishScore / rawSum) * 85)));
    let neutralProb = Math.max(6, 100 - (bullishProb + bearishProb));

    // Ensure sum = 100
    const remainder = 100 - (bullishProb + bearishProb + neutralProb);
    neutralProb += remainder;

    // Determine primary stance
    let stance = 'Neutral / Consolidating';
    if (bullishProb >= 60) stance = 'Bullish Pattern Dominance';
    else if (bearishProb >= 60) stance = 'Bearish Pattern Dominance';

    // Build cute agent explanation
    const patternSummary = detectedPatterns.length > 0
      ? detectedPatterns.map(p => `• **${p.name}** (${p.bias}): ${p.description}`).join('\n')
      : `• No extreme single-reversal pattern triggered on the latest candle; price is interacting with EMA 20 ($${ema20.toFixed(2)}) and key trend channels.`;

    const fullSummary = `🕯️ **Candle Scout Analysis for ${symbol}**:
- **Current Price**: $${current.close.toFixed(2)} (${current.close >= prev1.close ? '🟢 +' : '🔴 -'}$${Math.abs(current.close - prev1.close).toFixed(2)})
- **Patterns Identified**:
${patternSummary}
- **Momentum & Moving Averages**:
  - RSI (14): **${rsi14.toFixed(1)}** (${rsi14 > 70 ? 'Overbought ⚠️' : rsi14 < 30 ? 'Oversold Discount 💎' : 'Neutral Range'})
  - EMA 20: $${ema20.toFixed(2)} (${current.close >= ema20 ? 'Trading ABOVE EMA20 (Bullish Support)' : 'Trading BELOW EMA20 (Bearish Overhead)'})
  - Volume: **${(volumeRatio * 100).toFixed(0)}%** of 20-period average ${isVolumeSurge ? '⚡ (Volume Spike Detected!)' : ''}
- **Nearest Support**: $${support.toFixed(2)} | **Nearest Resistance**: $${resistance.toFixed(2)}`;

    return {
      agent: this.name,
      avatar: this.avatar,
      role: this.role,
      symbol,
      price: current.close,
      probabilities: {
        bullish: bullishProb,
        bearish: bearishProb,
        neutral: neutralProb
      },
      stance,
      detectedPatterns,
      technicalMetrics: {
        rsi14: Number(rsi14.toFixed(1)),
        ema9: Number(ema9.toFixed(2)),
        ema20: Number(ema20.toFixed(2)),
        ema50: Number(ema50.toFixed(2)),
        support: Number(support.toFixed(2)),
        resistance: Number(resistance.toFixed(2)),
        volumeRatio: Number(volumeRatio.toFixed(2)),
        isVolumeSurge
      },
      summary: fullSummary
    };
  }

  calculateEMA(values, period) {
    if (!values || values.length === 0) return 0;
    const k = 2 / (period + 1);
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
    }
    return ema;
  }

  calculateRSI(values, period = 14) {
    if (!values || values.length < period + 1) return 50;
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) {
        avgGain = (avgGain * (period - 1) + diff) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
      }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculatePivotLevels(candles) {
    const slice = candles.slice(-30);
    const highs = slice.map(c => c.high);
    const lows = slice.map(c => c.low);
    const current = candles[candles.length - 1].close;

    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    return {
      support: support < current ? support : current * 0.96,
      resistance: resistance > current ? resistance : current * 1.04
    };
  }

  getFallbackAnalysis(symbol) {
    return {
      agent: this.name,
      avatar: this.avatar,
      role: this.role,
      symbol,
      price: 150.0,
      probabilities: { bullish: 50, bearish: 40, neutral: 10 },
      stance: 'Neutral / Consolidating',
      detectedPatterns: [],
      technicalMetrics: { rsi14: 50, ema9: 148, ema20: 147, ema50: 145, support: 142, resistance: 155, volumeRatio: 1, isVolumeSurge: false },
      summary: `🕯️ Candle Scout: Scanning ${symbol} charts. Initializing pattern recognition engine.`
    };
  }
}

module.exports = new CandleScoutAgent();
