/**
 * Stock Knows - Frontend Controller
 * Connects the 3 AI Agents to the Cute & Eye-Friendly UI.
 */

// State Management
const state = {
  currentSymbol: 'NVDA',
  currentTimeframe: '1d',
  currentRange: '3mo',
  chart: null,
  marketSummary: null,
  geminiKey: localStorage.getItem('stock_knows_gemini_key') || '',
  theme: localStorage.getItem('stock_knows_theme') || 'dark',
  isAnalyzing: false
};

// DOM Elements
const elements = {
  // Navigation & Search
  stockSearchInput: document.getElementById('stock-search-input'),
  btnSearchStock: document.getElementById('btn-search-stock'),
  tickerTape: document.getElementById('ticker-tape'),
  btnSummarizeMarket: document.getElementById('btn-summarize-market'),
  btnToggleTheme: document.getElementById('btn-toggle-theme'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  
  // Stock Overview
  stockSymbolDisplay: document.getElementById('stock-symbol-display'),
  stockNameDisplay: document.getElementById('stock-name-display'),
  stockPriceDisplay: document.getElementById('stock-price-display'),
  stockChangeDisplay: document.getElementById('stock-change-display'),
  timeframeButtons: document.querySelectorAll('.btn-timeframe'),
  
  // Agent 1: Candle Scout
  agent1BullishProb: document.getElementById('agent1-bullish-prob'),
  agent1BearishProb: document.getElementById('agent1-bearish-prob'),
  agent1NeutralProb: document.getElementById('agent1-neutral-prob'),
  agent1BarBullish: document.getElementById('agent1-bar-bullish'),
  agent1BarBearish: document.getElementById('agent1-bar-bearish'),
  agent1BarNeutral: document.getElementById('agent1-bar-neutral'),
  agent1PatternsList: document.getElementById('agent1-patterns-list'),
  agent1RsiValue: document.getElementById('agent1-rsi-value'),
  agent1Ema20Value: document.getElementById('agent1-ema20-value'),
  agent1SupportValue: document.getElementById('agent1-support-value'),
  agent1ResistanceValue: document.getElementById('agent1-resistance-value'),
  agent1VolumeSurge: document.getElementById('agent1-volume-surge'),

  // Agent 2: News Radar
  agent2BullishProb: document.getElementById('agent2-bullish-prob'),
  agent2BearishProb: document.getElementById('agent2-bearish-prob'),
  agent2NeutralProb: document.getElementById('agent2-neutral-prob'),
  agent2BarBullish: document.getElementById('agent2-bar-bullish'),
  agent2BarBearish: document.getElementById('agent2-bar-bearish'),
  agent2BarNeutral: document.getElementById('agent2-bar-neutral'),
  agent2BuyingPressure: document.getElementById('agent2-buying-pressure'),
  agent2RetailMood: document.getElementById('agent2-retail-mood'),
  agent2ArticlesList: document.getElementById('agent2-articles-list'),

  // Agent 3: Master Decision
  agent3BullishProb: document.getElementById('agent3-bullish-prob'),
  agent3BearishProb: document.getElementById('agent3-bearish-prob'),
  agent3NeutralProb: document.getElementById('agent3-neutral-prob'),
  agent3BarBullish: document.getElementById('agent3-bar-bullish'),
  agent3BarBearish: document.getElementById('agent3-bar-bearish'),
  agent3BarNeutral: document.getElementById('agent3-bar-neutral'),
  agent3VerdictText: document.getElementById('agent3-verdict-text'),
  agent3VerdictBadge: document.getElementById('agent3-verdict-badge'),
  agent3IntradayScore: document.getElementById('agent3-intraday-score'),
  agent3IntradayText: document.getElementById('agent3-intraday-text'),
  agent3SwingScore: document.getElementById('agent3-swing-score'),
  agent3SwingText: document.getElementById('agent3-swing-text'),
  agent3StopLoss: document.getElementById('agent3-stoploss'),
  agent3Target1: document.getElementById('agent3-target1'),
  agent3Rrr: document.getElementById('agent3-rrr'),

  // Chat Console
  chatMessages: document.getElementById('chat-messages'),
  chatInput: document.getElementById('chat-input'),
  btnSendChat: document.getElementById('btn-send-chat'),
  agentThinkingIndicator: document.getElementById('agent-thinking-indicator'),

  // Settings Modal
  settingsModal: document.getElementById('settings-modal'),
  inputGeminiKey: document.getElementById('input-gemini-key'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  btnCloseSettings: document.getElementById('btn-close-settings'),

  // Market Summary Modal
  summaryModal: document.getElementById('summary-modal'),
  summaryContent: document.getElementById('summary-content'),
  btnCloseSummary: document.getElementById('btn-close-summary')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  applyTheme(state.theme);

  // Initialize Candlestick Chart
  state.chart = new CandlestickChart('candle-canvas', 'chart-tooltip');

  // Load Initial Market Pulse & NVDA analysis
  loadMarketSummary();
  runAnalysis(state.currentSymbol);

  // Bind Event Listeners
  initListeners();
});

function initListeners() {
  // Search Bar
  elements.btnSearchStock.addEventListener('click', handleSearch);
  elements.stockSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Timeframe buttons
  elements.timeframeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.timeframeButtons.forEach(b => b.classList.remove('bg-purple-600', 'text-white'));
      elements.timeframeButtons.forEach(b => b.classList.add('text-slate-400'));
      btn.classList.add('bg-purple-600', 'text-white');
      btn.classList.remove('text-slate-400');

      const tf = btn.dataset.timeframe;
      const rng = btn.dataset.range;
      state.currentTimeframe = tf;
      state.currentRange = rng;
      runAnalysis(state.currentSymbol);
    });
  });

  // Summarize Market button
  elements.btnSummarizeMarket.addEventListener('click', showMarketSummaryModal);

  // Theme toggle
  elements.btnToggleTheme.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Settings Modal
  elements.btnOpenSettings.addEventListener('click', () => {
    elements.inputGeminiKey.value = state.geminiKey;
    elements.settingsModal.classList.remove('hidden');
  });
  elements.btnCloseSettings.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });
  elements.btnSaveSettings.addEventListener('click', () => {
    state.geminiKey = elements.inputGeminiKey.value.trim();
    localStorage.setItem('stock_knows_gemini_key', state.geminiKey);
    elements.settingsModal.classList.add('hidden');
    appendChatMessage('Agent 3', '⚙️ Settings saved successfully! Optional Gemini AI is ' + (state.geminiKey ? 'Active ✨' : 'Disabled (using built-in engine).'));
  });

  // Market Summary Modal Close
  elements.btnCloseSummary.addEventListener('click', () => {
    elements.summaryModal.classList.add('hidden');
  });

  // Chat Send
  elements.btnSendChat.addEventListener('click', handleUserSendMessage);
  elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserSendMessage();
  });

  // Quick Chat Prompts
  document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.chatInput.value = btn.dataset.prompt.replace('{SYMBOL}', state.currentSymbol);
      handleUserSendMessage();
    });
  });
}

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('stock_knows_theme', theme);
  const root = document.documentElement;

  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    elements.btnToggleTheme.innerHTML = '🌙';
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
    elements.btnToggleTheme.innerHTML = '☀️';
  }

  if (state.chart) {
    state.chart.draw();
  }
}

function handleSearch() {
  const query = elements.stockSearchInput.value.trim().toUpperCase();
  if (query) {
    state.currentSymbol = query;
    elements.stockSearchInput.value = '';
    runAnalysis(state.currentSymbol);
  }
}

/**
 * Load Top Ticker Carousel
 */
async function loadMarketSummary() {
  try {
    const res = await fetch('/api/market-summary');
    const data = await res.json();

    if (data.success && data.summary) {
      state.marketSummary = data;
      renderTickerTape(data.summary.stocks);
    }
  } catch (err) {
    console.warn('Failed to load market summary:', err);
  }
}

function renderTickerTape(stocks = []) {
  if (!elements.tickerTape) return;
  elements.tickerTape.innerHTML = '';

  stocks.forEach(stock => {
    const isUp = stock.changePercent >= 0;
    const chip = document.createElement('div');
    chip.className = `ticker-chip ${stock.symbol === state.currentSymbol ? 'active' : ''}`;
    chip.innerHTML = `
      <span class="font-bold">${stock.symbol}</span>
      <span class="text-xs text-slate-400 font-mono">$${stock.price.toFixed(2)}</span>
      <span class="text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
    `;

    chip.addEventListener('click', () => {
      document.querySelectorAll('.ticker-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentSymbol = stock.symbol;
      runAnalysis(stock.symbol);
    });

    elements.tickerTape.appendChild(chip);
  });
}

/**
 * Core Multi-Agent Analysis Execution
 */
async function runAnalysis(symbol = 'NVDA') {
  if (state.isAnalyzing) return;
  state.isAnalyzing = true;

  // Show live agent thinking pulse
  showAgentThinking(true, `Consulting Agent 1 (Candle Scout) & Agent 2 (News Radar) for ${symbol}...`);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        interval: state.currentTimeframe,
        range: state.currentRange
      })
    });

    const json = await res.json();
    if (!json.success || !json.result) {
      throw new Error(json.error || 'Failed to analyze stock');
    }

    const { candles, agent1Candle, agent2News, agent3Master, companyName, currentPrice, priceChange, priceChangePercent } = json.result;

    // 1. Update Header Ticker Info
    elements.stockSymbolDisplay.innerText = symbol;
    elements.stockNameDisplay.innerText = companyName || `${symbol} Inc.`;
    elements.stockPriceDisplay.innerText = `$${currentPrice.toFixed(2)}`;
    
    const isUp = priceChange >= 0;
    elements.stockChangeDisplay.innerText = `${isUp ? '+' : ''}$${priceChange.toFixed(2)} (${isUp ? '+' : ''}${priceChangePercent.toFixed(2)}%)`;
    elements.stockChangeDisplay.className = `font-mono font-bold text-sm ${isUp ? 'text-emerald-400' : 'text-rose-400'}`;

    // 2. Render Candlestick Chart with Detected Patterns
    state.chart.setData(candles, agent1Candle.detectedPatterns);

    // 3. Update Agent 1 Card (Candle Scout)
    renderAgent1(agent1Candle);

    // 4. Update Agent 2 Card (News Radar)
    renderAgent2(agent2News);

    // 5. Update Agent 3 Card (Stock Knows Master Verdict)
    renderAgent3(agent3Master);

    // Update active ticker in carousel
    document.querySelectorAll('.ticker-chip').forEach(c => {
      if (c.querySelector('.font-bold')?.innerText === symbol) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

  } catch (err) {
    console.error('Analysis error:', err);
    appendChatMessage('Stock Knows Master', `⚠️ Sorry, couldn't load ${symbol}: ${err.message}. Please try another ticker like AAPL, NVDA, or TSLA.`);
  } finally {
    state.isAnalyzing = false;
    showAgentThinking(false);
  }
}

function renderAgent1(a1) {
  // Probabilities
  elements.agent1BullishProb.innerText = `${a1.probabilities.bullish}%`;
  elements.agent1BearishProb.innerText = `${a1.probabilities.bearish}%`;
  elements.agent1NeutralProb.innerText = `${a1.probabilities.neutral}%`;

  elements.agent1BarBullish.style.width = `${a1.probabilities.bullish}%`;
  elements.agent1BarBearish.style.width = `${a1.probabilities.bearish}%`;
  elements.agent1BarNeutral.style.width = `${a1.probabilities.neutral}%`;

  // Technical Gauges
  elements.agent1RsiValue.innerText = a1.technicalMetrics.rsi14;
  elements.agent1RsiValue.className = `font-mono font-bold ${a1.technicalMetrics.rsi14 > 70 ? 'text-rose-400' : a1.technicalMetrics.rsi14 < 30 ? 'text-emerald-400' : 'text-amber-400'}`;

  elements.agent1Ema20Value.innerText = `$${a1.technicalMetrics.ema20.toFixed(2)}`;
  elements.agent1SupportValue.innerText = `$${a1.technicalMetrics.support.toFixed(2)}`;
  elements.agent1ResistanceValue.innerText = `$${a1.technicalMetrics.resistance.toFixed(2)}`;
  elements.agent1VolumeSurge.innerText = a1.technicalMetrics.isVolumeSurge ? 'Surge ⚡' : 'Normal';
  elements.agent1VolumeSurge.className = `font-semibold text-xs ${a1.technicalMetrics.isVolumeSurge ? 'text-amber-400 font-bold' : 'text-slate-400'}`;

  // Patterns list
  elements.agent1PatternsList.innerHTML = '';
  if (a1.detectedPatterns.length === 0) {
    elements.agent1PatternsList.innerHTML = `<div class="text-xs text-slate-400 italic py-1">No single extreme reversal pattern on the last candle; price following moving averages.</div>`;
  } else {
    a1.detectedPatterns.forEach(p => {
      const isBull = p.bias === 'Bullish';
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs';
      div.innerHTML = `
        <div class="flex items-center gap-1.5 font-semibold">
          <span>${isBull ? '✨' : '🔻'}</span>
          <span>${p.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${isBull ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${p.bias}</span>
          <span class="font-mono text-slate-400">${p.confidence}%</span>
        </div>
      `;
      elements.agent1PatternsList.appendChild(div);
    });
  }
}

function renderAgent2(a2) {
  // Probabilities
  elements.agent2BullishProb.innerText = `${a2.probabilities.bullish}%`;
  elements.agent2BearishProb.innerText = `${a2.probabilities.bearish}%`;
  elements.agent2NeutralProb.innerText = `${a2.probabilities.neutral}%`;

  elements.agent2BarBullish.style.width = `${a2.probabilities.bullish}%`;
  elements.agent2BarBearish.style.width = `${a2.probabilities.bearish}%`;
  elements.agent2BarNeutral.style.width = `${a2.probabilities.neutral}%`;

  // Sentiment Stats
  elements.agent2BuyingPressure.innerText = a2.buyingPressure;
  elements.agent2RetailMood.innerText = a2.retailMood;

  // News Articles
  elements.agent2ArticlesList.innerHTML = '';
  if (!a2.articles || a2.articles.length === 0) {
    elements.agent2ArticlesList.innerHTML = `<div class="text-xs text-slate-400 italic py-1">No recent articles found for this ticker.</div>`;
  } else {
    a2.articles.forEach(art => {
      const isPos = art.sentiment === 'Positive';
      const isNeg = art.sentiment === 'Negative';
      const badgeClass = isPos ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : isNeg ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-700/50 text-slate-300 border-slate-600/30';

      const a = document.createElement('a');
      a.href = art.link || '#';
      a.target = '_blank';
      a.className = 'block p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 text-xs transition';
      a.innerHTML = `
        <div class="flex justify-between items-start gap-2 mb-1">
          <span class="text-slate-400 text-[10px]">${art.publisher} • ${art.publishedAt}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded border ${badgeClass} font-semibold">${art.sentiment}</span>
        </div>
        <div class="font-medium text-slate-200 line-clamp-2 hover:text-purple-300">${art.title}</div>
      `;
      elements.agent2ArticlesList.appendChild(a);
    });
  }
}

function renderAgent3(a3) {
  // Master Combined Probabilities
  elements.agent3BullishProb.innerText = `${a3.probabilities.bullish}%`;
  elements.agent3BearishProb.innerText = `${a3.probabilities.bearish}%`;
  elements.agent3NeutralProb.innerText = `${a3.probabilities.neutral}%`;

  elements.agent3BarBullish.style.width = `${a3.probabilities.bullish}%`;
  elements.agent3BarBearish.style.width = `${a3.probabilities.bearish}%`;
  elements.agent3BarNeutral.style.width = `${a3.probabilities.neutral}%`;

  // Action Verdict Badge
  elements.agent3VerdictText.innerText = a3.actionVerdict;
  const isStrongBull = a3.probabilities.bullish >= 65;
  const isStrongBear = a3.probabilities.bearish >= 65;

  elements.agent3VerdictBadge.className = `px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 ${
    isStrongBull ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
    isStrongBear ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
    'bg-purple-500/20 text-purple-300 border border-purple-500/40'
  }`;

  // Feasibility
  elements.agent3IntradayScore.innerText = `${a3.intraday.probability}%`;
  elements.agent3IntradayText.innerText = a3.intraday.suitability;
  elements.agent3SwingScore.innerText = `${a3.swing.probability}%`;
  elements.agent3SwingText.innerText = a3.swing.suitability;

  // Trading Anchors
  elements.agent3StopLoss.innerText = `$${a3.levels.stopLoss}`;
  elements.agent3Target1.innerText = `$${a3.levels.target1}`;
  elements.agent3Rrr.innerText = a3.levels.riskRewardRatio;
}

/**
 * Handle User Chat Messages to Agent 3
 */
async function handleUserSendMessage() {
  const message = elements.chatInput.value.trim();
  if (!message) return;

  // Append user bubble
  appendChatMessage('User', message);
  elements.chatInput.value = '';

  // Show thinking animation
  showAgentThinking(true, `Agent 3 is coordinating with Candle Scout & News Radar...`);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        symbol: state.currentSymbol,
        geminiKey: state.geminiKey
      })
    });

    const data = await res.json();
    if (!data.success || !data.response) {
      throw new Error(data.error || 'Agent 3 failed to respond');
    }

    const { reply, intent, targetSymbol, analysis } = data.response;

    // Append Agent 3 response
    appendChatMessage('Stock Knows Master', reply);

    // If chat requested a new symbol or market summary, update the UI!
    if (targetSymbol && targetSymbol !== state.currentSymbol && analysis) {
      state.currentSymbol = targetSymbol;
      state.chart.setData(analysis.candles, analysis.agent1Candle.detectedPatterns);
      renderAgent1(analysis.agent1Candle);
      renderAgent2(analysis.agent2News);
      renderAgent3(analysis.agent3Master);
      elements.stockSymbolDisplay.innerText = targetSymbol;
      elements.stockPriceDisplay.innerText = `$${analysis.currentPrice.toFixed(2)}`;
    }
  } catch (err) {
    appendChatMessage('Stock Knows Master', `⚠️ Error communicating with agents: ${err.message}`);
  } finally {
    showAgentThinking(false);
  }
}

function appendChatMessage(sender, text) {
  const isUser = sender === 'User';
  const bubble = document.createElement('div');
  bubble.className = `flex gap-2.5 my-2.5 ${isUser ? 'justify-end' : 'justify-start'}`;

  // Simple Markdown renderer
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br/>');

  bubble.innerHTML = `
    ${!isUser ? `<div class="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-sm shadow flex-shrink-0">🧠</div>` : ''}
    <div class="chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-agent'}">
      ${formattedText}
    </div>
  `;

  elements.chatMessages.appendChild(bubble);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function showAgentThinking(show, statusText = '') {
  if (!elements.agentThinkingIndicator) return;
  if (show) {
    elements.agentThinkingIndicator.classList.remove('hidden');
    elements.agentThinkingIndicator.querySelector('#agent-thinking-text').innerText = statusText;
  } else {
    elements.agentThinkingIndicator.classList.add('hidden');
  }
}

/**
 * Show Market Summary Modal
 */
function showMarketSummaryModal() {
  if (!state.marketSummary) {
    loadMarketSummary().then(renderSummaryModal);
  } else {
    renderSummaryModal();
  }
}

function renderSummaryModal() {
  if (!state.marketSummary || !elements.summaryModal) return;
  const { summary, newsSummary } = state.marketSummary;

  elements.summaryContent.innerHTML = `
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-slate-400">Current Market Stance:</span>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">${summary.marketMood}</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">${newsSummary.advice}</p>
    </div>

    <div class="space-y-2 mb-4">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Bullish Stocks People Are Buying</h4>
      <div class="grid grid-cols-2 gap-2">
        ${summary.topGainers.map(s => `
          <button class="select-summary-stock p-2.5 rounded-xl bg-slate-800/60 hover:bg-purple-900/30 border border-slate-700/50 hover:border-purple-500/50 text-left transition flex justify-between items-center" data-symbol="${s.symbol}">
            <div>
              <div class="font-bold text-sm text-white">${s.symbol}</div>
              <div class="text-xs text-slate-400">$${s.price.toFixed(2)}</div>
            </div>
            <div class="text-xs font-bold font-mono text-emerald-400">+${s.changePercent.toFixed(2)}%</div>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2">
      <span>💡</span>
      <span>Click any stock above to command Candle Scout and News Radar to run a full probabilistic analysis!</span>
    </div>
  `;

  document.querySelectorAll('.select-summary-stock').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.dataset.symbol;
      state.currentSymbol = sym;
      elements.summaryModal.classList.add('hidden');
      runAnalysis(sym);
      appendChatMessage('User', `Analyze ${sym} for me`);
      appendChatMessage('Stock Knows Master', `Switching active radar to **${sym}**. Deploying Candle Scout and News Radar now!`);
    });
  });

  elements.summaryModal.classList.remove('hidden');
}
