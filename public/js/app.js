/**
 * Stock Knows - Frontend Controller (Indian Stock Market NSE / BSE)
 * Connects TradingView Platform Candlesticks, Boom/Dump Radar, Live Watchlist,
 * and Agent 3 Self-Reflection Accuracy Tracker.
 */

// State Management
const state = {
  currentSymbol: 'RELIANCE',
  currentTvSymbol: 'NSE:RELIANCE',
  currentTimeframe: '1d',
  currentRange: '3mo',
  chartMode: 'tv', // 'tv' or 'patterns'
  chart: null,
  marketSummary: null,
  boomForecast: null,
  accuracyInfo: null,
  geminiKey: localStorage.getItem('stock_knows_gemini_key') || '',
  theme: localStorage.getItem('stock_knows_theme') || 'dark',
  isAnalyzing: false,
  tvWidgetInstance: null
};

// Safe DOM Setters
function safeText(el, text) {
  if (el) el.innerText = text;
}
function safeWidth(el, width) {
  if (el) el.style.width = width;
}

// DOM Elements
const elements = {
  stockSearchInput: document.getElementById('stock-search-input'),
  btnSearchStock: document.getElementById('btn-search-stock'),
  indicesBar: document.getElementById('indices-bar'),
  liveWatchlist: document.getElementById('live-watchlist'),
  btnSummarizeMarket: document.getElementById('btn-summarize-market'),
  btnOpenAccuracy: document.getElementById('btn-open-accuracy'),
  badgeAccuracyRate: document.getElementById('badge-accuracy-rate'),
  btnToggleTheme: document.getElementById('btn-toggle-theme'),

  // Boom & Dump Forecast
  boomStocksList: document.getElementById('boom-stocks-list'),
  dumpStocksList: document.getElementById('dump-stocks-list'),
  forecastUpdatedTime: document.getElementById('forecast-updated-time'),

  // Stock Overview
  stockSymbolDisplay: document.getElementById('stock-symbol-display'),
  stockNameDisplay: document.getElementById('stock-name-display'),
  stockPriceDisplay: document.getElementById('stock-price-display'),
  stockChangeDisplay: document.getElementById('stock-change-display'),
  btnShowTv: document.getElementById('btn-show-tv'),
  btnShowPatterns: document.getElementById('btn-show-patterns'),
  tvChartContainer: document.getElementById('tv-chart-container'),
  canvasChartContainer: document.getElementById('canvas-chart-container'),

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

  // Agent 2: News Radar
  agent2BullishProb: document.getElementById('agent2-bullish-prob'),
  agent2BearishProb: document.getElementById('agent2-bearish-prob'),
  agent2NeutralProb: document.getElementById('agent2-neutral-prob'),
  agent2BarBullish: document.getElementById('agent2-bar-bullish'),
  agent2BarBearish: document.getElementById('agent2-bar-bearish'),
  agent2BarNeutral: document.getElementById('agent2-bar-neutral'),
  agent2BuyingPressure: document.getElementById('agent2-buying-pressure'),
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

  // Accuracy Modal
  accuracyModal: document.getElementById('accuracy-modal'),
  accuracyModalContent: document.getElementById('accuracy-modal-content'),
  btnCloseAccuracy: document.getElementById('btn-close-accuracy'),
  btnRefreshAccuracy: document.getElementById('btn-refresh-accuracy'),

  // Summary Modal
  summaryModal: document.getElementById('summary-modal'),
  summaryContent: document.getElementById('summary-content'),
  btnCloseSummary: document.getElementById('btn-close-summary')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);

  // Initialize Canvas Chart engine for pattern overlays
  state.chart = new CandlestickChart('candle-canvas', 'chart-tooltip');

  // Load initial data
  loadMarketSummary();
  loadAccuracyTracker();
  runAnalysis(state.currentSymbol);

  // Bind Event Listeners
  initListeners();

  // Auto-refresh live watchlist every 30 seconds
  setInterval(() => {
    loadMarketSummary(true);
  }, 30000);
});

function initListeners() {
  // Search
  elements.btnSearchStock?.addEventListener('click', handleSearch);
  elements.stockSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Chart Switcher (TradingView vs Pattern Canvas)
  elements.btnShowTv?.addEventListener('click', () => switchChartMode('tv'));
  elements.btnShowPatterns?.addEventListener('click', () => switchChartMode('patterns'));

  // Modals
  elements.btnSummarizeMarket?.addEventListener('click', showMarketSummaryModal);
  elements.btnCloseSummary?.addEventListener('click', () => elements.summaryModal.classList.add('hidden'));

  elements.btnOpenAccuracy?.addEventListener('click', showAccuracyModal);
  elements.btnCloseAccuracy?.addEventListener('click', () => elements.accuracyModal.classList.add('hidden'));
  elements.btnRefreshAccuracy?.addEventListener('click', loadAccuracyTracker);

  // Theme Toggle
  elements.btnToggleTheme?.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Chat
  elements.btnSendChat?.addEventListener('click', handleUserSendMessage);
  elements.chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserSendMessage();
  });

  // Quick Prompt Chips
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
    if (elements.btnToggleTheme) elements.btnToggleTheme.innerHTML = '🌙';
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
    if (elements.btnToggleTheme) elements.btnToggleTheme.innerHTML = '☀️';
  }

  // Reload TradingView widget with current theme
  renderTradingViewWidget(state.currentTvSymbol, theme);
  if (state.chart) state.chart.draw();
}

function switchChartMode(mode) {
  state.chartMode = mode;
  if (mode === 'tv') {
    elements.tvChartContainer.classList.remove('hidden');
    elements.canvasChartContainer.classList.add('hidden');
    elements.btnShowTv.classList.replace('text-slate-400', 'text-white');
    elements.btnShowTv.classList.add('bg-purple-600');
    elements.btnShowPatterns.classList.remove('bg-purple-600', 'text-white');
    elements.btnShowPatterns.classList.add('text-slate-400');
    renderTradingViewWidget(state.currentTvSymbol, state.theme);
  } else {
    elements.tvChartContainer.classList.add('hidden');
    elements.canvasChartContainer.classList.remove('hidden');
    elements.btnShowPatterns.classList.replace('text-slate-400', 'text-white');
    elements.btnShowPatterns.classList.add('bg-purple-600');
    elements.btnShowTv.classList.remove('bg-purple-600', 'text-white');
    elements.btnShowTv.classList.add('text-slate-400');
    if (state.chart) state.chart.resizeAndDraw();
  }
}

/**
 * Embed TradingView Real-Time Candlestick Chart
 */
function renderTradingViewWidget(tvSymbol = 'NSE:RELIANCE', theme = 'dark') {
  const container = document.getElementById('tradingview_widget');
  if (!container) return;
  container.innerHTML = '';

  if (window.TradingView) {
    try {
      new window.TradingView.widget({
        "autosize": true,
        "symbol": tvSymbol,
        "interval": "D",
        "timezone": "Asia/Kolkata",
        "theme": theme === 'light' ? 'light' : 'dark',
        "style": "1", // 1 = Candlestick chart
        "locale": "in",
        "toolbar_bg": theme === 'light' ? '#f8fafc' : '#0b0f19',
        "enable_publishing": false,
        "allow_symbol_change": true,
        "hide_side_toolbar": false,
        "container_id": "tradingview_widget"
      });
    } catch (e) {
      console.warn('TradingView widget initialization:', e.message);
    }
  }
}

function handleSearch() {
  const query = elements.stockSearchInput.value.trim().toUpperCase();
  if (query) {
    elements.stockSearchInput.value = '';
    runAnalysis(query);
  }
}

/**
 * Load Indian Market Indices and Live Watchlist
 */
async function loadMarketSummary(isBackgroundPoll = false) {
  try {
    const res = await fetch('/api/market-summary');
    const data = await res.json();

    if (data.success && data.summary) {
      state.marketSummary = data.summary;
      state.boomForecast = data.boomForecast;

      renderIndicesBar(data.summary.indices);
      renderLiveWatchlist(data.summary.stocks);
      renderBoomAndDump(data.boomForecast);
    }
  } catch (err) {
    console.warn('Error loading market summary:', err);
  }
}

function renderIndicesBar(indices = []) {
  if (!elements.indicesBar) return;
  elements.indicesBar.innerHTML = '';

  indices.forEach(idx => {
    const isUp = idx.changePercent >= 0;
    const item = document.createElement('div');
    item.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs cursor-pointer hover:border-purple-500 transition whitespace-nowrap';
    item.innerHTML = `
      <span class="font-bold text-slate-200">${idx.name}</span>
      <span class="text-slate-100 font-semibold">₹${idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
      <span class="text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">${isUp ? '▲ +' : '▼ '}${idx.changePercent.toFixed(2)}%</span>
    `;

    item.addEventListener('click', () => {
      runAnalysis(idx.symbol);
    });

    elements.indicesBar.appendChild(item);
  });
}

function renderLiveWatchlist(stocks = []) {
  if (!elements.liveWatchlist) return;
  elements.liveWatchlist.innerHTML = '';

  stocks.forEach(stock => {
    const isUp = stock.changePercent >= 0;
    const card = document.createElement('button');
    const isActive = stock.symbol === state.currentSymbol;

    card.className = `w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition ${
      isActive
        ? 'bg-purple-900/25 border-purple-500/60 shadow-md'
        : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-purple-500/40'
    }`;

    card.innerHTML = `
      <div>
        <div class="flex items-center gap-1.5 font-bold text-xs text-white">
          <span class="w-2 h-2 rounded-full ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
          <span>${stock.symbol}</span>
        </div>
        <div class="text-[10px] text-slate-400 truncate max-w-[110px]">${stock.name}</div>
      </div>
      <div class="text-right font-mono">
        <div class="text-xs font-bold text-white">₹${stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        <div class="text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">
          ${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      runAnalysis(stock.symbol);
    });

    elements.liveWatchlist.appendChild(card);
  });
}

/**
 * Render Today's Boom & Dump Forecast at the top
 */
function renderBoomAndDump(forecast) {
  if (!forecast) return;

  if (forecast.updatedAt) {
    safeText(elements.forecastUpdatedTime, `Updated: Today ${forecast.updatedAt}`);
  }

  // 1. Render Boom Stocks
  if (elements.boomStocksList) {
    elements.boomStocksList.innerHTML = '';
    (forecast.boomStocks || []).forEach(stock => {
      const isUp = stock.changePercent >= 0;
      const row = document.createElement('div');
      row.className = 'p-2 rounded-xl bg-slate-900/70 hover:bg-purple-950/40 border border-emerald-500/20 hover:border-purple-500/50 cursor-pointer transition flex items-center justify-between';
      row.innerHTML = `
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-white">${stock.symbol}</span>
            <span class="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ${stock.bullishProb}% Boom Prob 🚀
            </span>
          </div>
          <div class="text-[11px] text-slate-400 truncate max-w-[280px]">${stock.catalyst}</div>
        </div>
        <div class="text-right font-mono">
          <div class="text-xs font-bold text-white">₹${stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div class="text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</div>
        </div>
      `;

      row.addEventListener('click', () => {
        runAnalysis(stock.symbol);
        appendChatMessage('User', `Analyze ${stock.symbol} for me`);
        appendChatMessage('Stock Knows Master', `Switching to **${stock.symbol}** (${stock.bullishProb}% Bullish Boom probability). Candle Scout aur News Radar ki live analysis load ho rahi hai!`);
      });

      elements.boomStocksList.appendChild(row);
    });
  }

  // 2. Render Dump Stocks
  if (elements.dumpStocksList) {
    elements.dumpStocksList.innerHTML = '';
    (forecast.dumpStocks || []).forEach(stock => {
      const isUp = stock.changePercent >= 0;
      const row = document.createElement('div');
      row.className = 'p-2 rounded-xl bg-slate-900/70 hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition flex items-center justify-between';
      row.innerHTML = `
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-white">${stock.symbol}</span>
            <span class="text-[10px] px-2 py-0.2 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              ${stock.bearishProb}% Dump / Risk ⚠️
            </span>
          </div>
          <div class="text-[11px] text-slate-400 truncate max-w-[280px]">${stock.catalyst}</div>
        </div>
        <div class="text-right font-mono">
          <div class="text-xs font-bold text-white">₹${stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div class="text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</div>
        </div>
      `;

      row.addEventListener('click', () => {
        runAnalysis(stock.symbol);
        appendChatMessage('User', `Analyze ${stock.symbol} for me`);
        appendChatMessage('Stock Knows Master', `Switching to **${stock.symbol}** (${stock.bearishProb}% Bearish Risk warning). Checking invalidation levels & downside catalysts.`);
      });

      elements.dumpStocksList.appendChild(row);
    });
  }
}

/**
 * Load Accuracy Tracker & Self-Reflection Journal
 */
async function loadAccuracyTracker() {
  try {
    const res = await fetch('/api/accuracy');
    const data = await res.json();
    if (data.success && data.metrics) {
      state.accuracyInfo = data.metrics;
      safeText(elements.badgeAccuracyRate, `${data.metrics.winRate}%`);
      renderAccuracyModalContent(data.metrics);
    }
  } catch (err) {
    console.warn('Error loading accuracy:', err);
  }
}

function renderAccuracyModalContent(metrics) {
  if (!elements.accuracyModalContent) return;

  const predictionsList = metrics.recentPredictions.map(p => `
    <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
      <div class="flex justify-between items-center">
        <span class="font-bold text-white text-xs">${p.symbol} (${p.stance})</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status.includes('SUCCESS') ? 'bg-emerald-500/20 text-emerald-300' : p.status.includes('STOP') ? 'bg-rose-500/20 text-rose-300' : 'bg-purple-500/20 text-purple-300'}">${p.status}</span>
      </div>
      <div class="flex justify-between text-[11px] text-slate-400 font-mono">
        <span>Entry: ₹${p.entryPrice} ➔ Current: ₹${p.currentPrice}</span>
        <span class="${p.outcomeReturn.startsWith('+') ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}">${p.outcomeReturn}</span>
      </div>
      <p class="text-[10px] text-slate-300 italic bg-slate-950/50 p-1.5 rounded-lg border border-white/5">
        🧠 Self-Reflection: ${p.selfReflection}
      </p>
    </div>
  `).join('');

  elements.accuracyModalContent.innerHTML = `
    <div class="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between mb-3">
      <div>
        <div class="text-xs text-emerald-400 font-bold">Historical Model Accuracy Rate</div>
        <div class="text-xl font-black font-mono text-emerald-300">${metrics.winRate}% Calibration</div>
      </div>
      <div class="text-right text-[11px] text-slate-400 font-mono">
        Total Evaluated: ${metrics.totalEvaluated} Calls
      </div>
    </div>

    <div class="mb-3 p-2.5 rounded-xl bg-purple-950/25 border border-purple-800/40 text-xs text-purple-200">
      ${metrics.systemReflection}
    </div>

    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Predictions & Live Verification</h4>
    <div class="space-y-2">
      ${predictionsList}
    </div>
  `;
}

function showAccuracyModal() {
  if (state.accuracyInfo) {
    renderAccuracyModalContent(state.accuracyInfo);
  }
  elements.accuracyModal?.classList.remove('hidden');
}

/**
 * Core Multi-Agent Analysis Execution for Indian Ticker
 */
async function runAnalysis(symbol = 'RELIANCE') {
  if (state.isAnalyzing) return;
  state.isAnalyzing = true;

  showAgentThinking(true, `Candle Scout (Agent 1) & News Radar (Agent 2) Indian market scan kar rahe hain for ${symbol}...`);

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

    const { candles, agent1Candle, agent2News, agent3Master, companyName, currentPrice, priceChange, priceChangePercent, tradingViewSymbol } = json.result;

    state.currentSymbol = symbol;
    state.currentTvSymbol = tradingViewSymbol || `NSE:${symbol}`;

    // 1. Update Header Ticker Info in ₹
    safeText(elements.stockSymbolDisplay, symbol);
    safeText(elements.stockNameDisplay, companyName || `${symbol} (NSE)`);
    safeText(elements.stockPriceDisplay, `₹${currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);

    const isUp = priceChange >= 0;
    if (elements.stockChangeDisplay) {
      elements.stockChangeDisplay.innerText = `${isUp ? '+' : ''}₹${priceChange.toFixed(2)} (${isUp ? '+' : ''}${priceChangePercent.toFixed(2)}%)`;
      elements.stockChangeDisplay.className = `mono-font font-bold text-sm ${isUp ? 'text-emerald-400' : 'text-rose-400'}`;
    }

    // 2. Render TradingView or Pattern Canvas Chart
    renderTradingViewWidget(state.currentTvSymbol, state.theme);
    if (state.chart) {
      state.chart.setData(candles, agent1Candle.detectedPatterns);
    }

    // 3. Render 3 Agent Cards
    renderAgent1(agent1Candle);
    renderAgent2(agent2News);
    renderAgent3(agent3Master);

    // Refresh accuracy badge
    if (json.result.accuracyInfo) {
      safeText(elements.badgeAccuracyRate, `${json.result.accuracyInfo.winRate}%`);
    }

  } catch (err) {
    console.error('Analysis error:', err);
    appendChatMessage('Stock Knows Master', `⚠️ Error loading ${symbol}: ${err.message}. Kripya NSE ticker jaise RELIANCE, TATAMOTORS, HDFCBANK try karein.`);
  } finally {
    state.isAnalyzing = false;
    showAgentThinking(false);
  }
}

function renderAgent1(a1) {
  if (!a1) return;
  safeText(elements.agent1BullishProb, `${a1.probabilities.bullish}%`);
  safeText(elements.agent1BearishProb, `${a1.probabilities.bearish}%`);
  safeText(elements.agent1NeutralProb, `${a1.probabilities.neutral}%`);

  safeWidth(elements.agent1BarBullish, `${a1.probabilities.bullish}%`);
  safeWidth(elements.agent1BarBearish, `${a1.probabilities.bearish}%`);
  safeWidth(elements.agent1BarNeutral, `${a1.probabilities.neutral}%`);

  if (elements.agent1RsiValue) {
    elements.agent1RsiValue.innerText = a1.technicalMetrics.rsi14;
    elements.agent1RsiValue.className = `font-mono font-bold text-xs ${a1.technicalMetrics.rsi14 > 70 ? 'text-rose-400' : a1.technicalMetrics.rsi14 < 30 ? 'text-emerald-400' : 'text-amber-400'}`;
  }

  safeText(elements.agent1Ema20Value, `₹${a1.technicalMetrics.ema20.toFixed(2)}`);
  safeText(elements.agent1SupportValue, `₹${a1.technicalMetrics.support.toFixed(2)}`);
  safeText(elements.agent1ResistanceValue, `₹${a1.technicalMetrics.resistance.toFixed(2)}`);

  if (elements.agent1PatternsList) {
    elements.agent1PatternsList.innerHTML = '';
    if (a1.detectedPatterns.length === 0) {
      elements.agent1PatternsList.innerHTML = `<div class="text-[11px] text-slate-400 italic py-1">No single extreme reversal pattern on the last candle; price following moving averages.</div>`;
    } else {
      a1.detectedPatterns.forEach(p => {
        const isBull = p.bias === 'Bullish';
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]';
        div.innerHTML = `
          <div class="flex items-center gap-1 font-semibold">
            <span>${isBull ? '✨' : '🔻'}</span>
            <span>${p.name}</span>
          </div>
          <span class="text-[9px] px-1.5 py-0.2 rounded font-bold ${isBull ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${p.bias} (${p.confidence}%)</span>
        `;
        elements.agent1PatternsList.appendChild(div);
      });
    }
  }
}

function renderAgent2(a2) {
  if (!a2) return;
  safeText(elements.agent2BullishProb, `${a2.probabilities.bullish}%`);
  safeText(elements.agent2BearishProb, `${a2.probabilities.bearish}%`);
  safeText(elements.agent2NeutralProb, `${a2.probabilities.neutral}%`);

  safeWidth(elements.agent2BarBullish, `${a2.probabilities.bullish}%`);
  safeWidth(elements.agent2BarBearish, `${a2.probabilities.bearish}%`);
  safeWidth(elements.agent2BarNeutral, `${a2.probabilities.neutral}%`);

  safeText(elements.agent2BuyingPressure, a2.buyingPressure);

  if (elements.agent2ArticlesList) {
    elements.agent2ArticlesList.innerHTML = '';
    if (!a2.articles || a2.articles.length === 0) {
      elements.agent2ArticlesList.innerHTML = `<div class="text-[11px] text-slate-400 italic py-1">Monitoring live Indian headlines...</div>`;
    } else {
      a2.articles.slice(0, 3).forEach(art => {
        const isPos = art.sentiment === 'Positive';
        const isNeg = art.sentiment === 'Negative';
        const badgeClass = isPos ? 'bg-emerald-500/20 text-emerald-300' : isNeg ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-slate-300';

        const a = document.createElement('a');
        a.href = art.link || '#';
        a.target = '_blank';
        a.className = 'block p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-[11px] transition';
        a.innerHTML = `
          <div class="flex justify-between items-center gap-1 mb-0.5">
            <span class="text-slate-400 text-[9px] truncate max-w-[140px]">${art.publisher}</span>
            <span class="text-[9px] px-1 py-0.2 rounded font-semibold ${badgeClass}">${art.sentiment}</span>
          </div>
          <div class="font-medium text-slate-200 line-clamp-1 hover:text-purple-300">${art.title}</div>
        `;
        elements.agent2ArticlesList.appendChild(a);
      });
    }
  }
}

function renderAgent3(a3) {
  if (!a3) return;
  safeText(elements.agent3BullishProb, `${a3.probabilities.bullish}%`);
  safeText(elements.agent3BearishProb, `${a3.probabilities.bearish}%`);
  safeText(elements.agent3NeutralProb, `${a3.probabilities.neutral}%`);

  safeWidth(elements.agent3BarBullish, `${a3.probabilities.bullish}%`);
  safeWidth(elements.agent3BarBearish, `${a3.probabilities.bearish}%`);
  safeWidth(elements.agent3BarNeutral, `${a3.probabilities.neutral}%`);

  safeText(elements.agent3VerdictText, a3.actionVerdict);
  const isStrongBull = a3.probabilities.bullish >= 65;
  const isStrongBear = a3.probabilities.bearish >= 65;

  if (elements.agent3VerdictBadge) {
    elements.agent3VerdictBadge.className = `px-2 py-0.5 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1.5 ${
      isStrongBull ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
      isStrongBear ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
      'bg-purple-500/20 text-purple-300 border border-purple-500/40'
    }`;
  }

  safeText(elements.agent3IntradayScore, `${a3.intraday.probability}%`);
  safeText(elements.agent3IntradayText, a3.intraday.suitability);
  safeText(elements.agent3SwingScore, `${a3.swing.probability}%`);
  safeText(elements.agent3SwingText, a3.swing.suitability);

  safeText(elements.agent3StopLoss, `₹${a3.levels.stopLoss}`);
  safeText(elements.agent3Target1, `₹${a3.levels.target1}`);
  safeText(elements.agent3Rrr, a3.levels.riskRewardRatio);
}

/**
 * Handle User Chat Messages to Agent 3
 */
async function handleUserSendMessage() {
  const message = elements.chatInput.value.trim();
  if (!message) return;

  appendChatMessage('User', message);
  elements.chatInput.value = '';

  showAgentThinking(true, `Agent 3 Indian market data aur self-reflection check kar raha hai...`);

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
    appendChatMessage('Stock Knows Master', reply);

    if (targetSymbol && targetSymbol !== state.currentSymbol && analysis) {
      state.currentSymbol = targetSymbol;
      state.currentTvSymbol = analysis.tradingViewSymbol || `NSE:${targetSymbol}`;
      renderTradingViewWidget(state.currentTvSymbol, state.theme);
      if (state.chart) state.chart.setData(analysis.candles, analysis.agent1Candle.detectedPatterns);
      renderAgent1(analysis.agent1Candle);
      renderAgent2(analysis.agent2News);
      renderAgent3(analysis.agent3Master);
      safeText(elements.stockSymbolDisplay, targetSymbol);
      safeText(elements.stockPriceDisplay, `₹${analysis.currentPrice.toFixed(2)}`);
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
  bubble.className = `flex gap-2 my-2 ${isUser ? 'justify-end' : 'justify-start'}`;

  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br/>');

  bubble.innerHTML = `
    ${!isUser ? `<div class="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs shadow flex-shrink-0">🧠</div>` : ''}
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
 * Show Nifty & Sensex Market Summary Modal
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
  const { niftyStatus, sensexStatus, marketMood, topGainers = [] } = state.marketSummary;

  elements.summaryContent.innerHTML = `
    <div class="mb-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
      <div class="flex items-center justify-between mb-1.5">
        <span class="font-bold text-white text-xs">🇮🇳 Indian Market Sentiment:</span>
        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">${marketMood}</span>
      </div>
      <div class="text-xs text-slate-300 font-mono space-y-0.5">
        <div>• <b>${niftyStatus}</b></div>
        <div>• <b>${sensexStatus}</b></div>
      </div>
    </div>

    <div class="mb-3">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Strongest Bullish Leaders (NSE)</h4>
      <div class="grid grid-cols-2 gap-2">
        ${topGainers.map(s => `
          <button class="select-summary-stock p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 text-left transition flex justify-between items-center" data-symbol="${s.symbol}">
            <div>
              <div class="font-bold text-xs text-white">${s.symbol}</div>
              <div class="text-[10px] text-slate-400">₹${s.price.toFixed(2)}</div>
            </div>
            <div class="text-xs font-bold font-mono ${s.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%</div>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-purple-200">
      💡 Kisi bhi stock par click karein to open its real-time TradingView candlestick chart & 3 AI agents report!
    </div>
  `;

  document.querySelectorAll('.select-summary-stock').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.dataset.symbol;
      elements.summaryModal.classList.add('hidden');
      runAnalysis(sym);
      appendChatMessage('User', `Analyze ${sym} for me`);
      appendChatMessage('Stock Knows Master', `Switching to **${sym}** (TradingView + Candle Scout + News Radar).`);
    });
  });

  elements.summaryModal.classList.remove('hidden');
}
