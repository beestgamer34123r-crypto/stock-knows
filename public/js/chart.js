/**
 * Stock Knows - Candlestick Chart Engine
 * Lightweight, high-performance HTML5 Canvas Candlestick & Volume Chart with pattern annotations.
 */

class CandlestickChart {
  constructor(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = document.getElementById(tooltipId);
    this.candles = [];
    this.patterns = [];
    this.ema20 = [];
    this.hoverIndex = -1;
    this.mousePos = { x: -1, y: -1 };

    this.padding = { top: 30, right: 65, bottom: 45, left: 15 };

    this.initEvents();
    window.addEventListener('resize', () => this.resizeAndDraw());
  }

  setData(candles = [], patterns = [], trajectory = null) {
    this.candles = candles;
    this.patterns = patterns;
    if (trajectory) {
      this.trajectory = trajectory;
    }
    this.ema20 = this.computeEMA(candles.map(c => c.close), 20);
    this.hoverIndex = -1;
    this.resizeAndDraw();
  }

  setTrajectory(trajectory) {
    this.trajectory = trajectory;
    this.draw();
  }

  computeEMA(values, period = 20) {
    if (!values || values.length === 0) return [];
    const k = 2 / (period + 1);
    const ema = [];
    let prev = values[0];
    ema.push(prev);
    for (let i = 1; i < values.length; i++) {
      const cur = values[i] * k + prev * (1 - k);
      ema.push(cur);
      prev = cur;
    }
    return ema;
  }

  resizeAndDraw() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width;
    // Responsive chart height: 300px on mobile, up to 390px on tablet/desktop
    const isMobile = window.innerWidth < 640;
    this.height = isMobile ? Math.max(290, rect.height || 290) : Math.max(380, rect.height || 390);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.candles || this.candles.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Outfit, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select a stock or search above to view live candlesticks', w / 2, h / 2);
      return;
    }

    const chartW = w - this.padding.left - this.padding.right;
    const chartH = h - this.padding.top - this.padding.bottom;
    const volumeH = chartH * 0.22;
    const priceH = chartH - volumeH - 15;

    // Price Bounds
    const highs = this.candles.map(c => c.high);
    const lows = this.candles.map(c => c.low);
    const minPrice = Math.min(...lows) * 0.998;
    const maxPrice = Math.max(...highs) * 1.002;
    const priceRange = Math.max(maxPrice - minPrice, 0.01);

    // Volume Bounds
    const maxVolume = Math.max(...this.candles.map(c => c.volume), 1);

    // Helpers to project coordinates
    const numCandles = this.candles.length;
    const candleSlotW = chartW / numCandles;
    const candleBodyW = Math.max(2, Math.min(candleSlotW * 0.72, 14));

    const getX = (idx) => this.padding.left + (idx + 0.5) * candleSlotW;
    const getY = (val) => this.padding.top + priceH - ((val - minPrice) / priceRange) * priceH;
    const getVolY = (vol) => this.padding.top + priceH + 15 + volumeH - (vol / maxVolume) * volumeH;

    // 1. Draw Subtle Grid Lines & Y-axis labels
    const isDark = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = textColor;
    ctx.font = '11px Outfit, Inter, sans-serif';
    ctx.textAlign = 'left';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const p = minPrice + (i / ySteps) * priceRange;
      const y = getY(p);

      ctx.beginPath();
      ctx.moveTo(this.padding.left, y);
      ctx.lineTo(w - this.padding.right, y);
      ctx.stroke();

      ctx.fillText(`₹${p.toFixed(2)}`, w - this.padding.right + 8, y + 4);
    }

    // 2. Draw Volume Bars
    this.candles.forEach((c, idx) => {
      const x = getX(idx);
      const volY = getVolY(c.volume);
      const baselineY = this.padding.top + priceH + 15 + volumeH;
      const isBull = c.close >= c.open;

      ctx.fillStyle = isBull
        ? (isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.25)')
        : (isDark ? 'rgba(251, 113, 133, 0.25)' : 'rgba(244, 63, 94, 0.25)');

      ctx.fillRect(x - candleBodyW / 2, volY, candleBodyW, baselineY - volY);
    });

    // 3. Draw EMA 20 Line
    if (this.ema20.length === this.candles.length) {
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([]);

      this.ema20.forEach((val, idx) => {
        const x = getX(idx);
        const y = getY(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Legend note
      ctx.fillStyle = '#a855f7';
      ctx.fillText('EMA 20', this.padding.left + 8, this.padding.top - 8);
    }

    // 4. Draw Candlesticks (Wicks and Bodies)
    this.candles.forEach((c, idx) => {
      const x = getX(idx);
      const isBull = c.close >= c.open;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const bullColor = isDark ? '#34d399' : '#10b981';
      const bearColor = isDark ? '#fb7185' : '#f43f5e';
      const candleColor = isBull ? bullColor : bearColor;

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(Math.abs(closeY - openY), 2);

      ctx.fillStyle = candleColor;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x - candleBodyW / 2, topY, candleBodyW, bodyH, 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - candleBodyW / 2, topY, candleBodyW, bodyH);
      }
    });

    // 5. Draw Visual Pattern Badges / Flags on Annotated Candles
    if (this.patterns && this.patterns.length > 0) {
      this.patterns.forEach(p => {
        const idx = p.candleIndex !== undefined ? p.candleIndex : (numCandles - 1);
        if (idx >= 0 && idx < numCandles) {
          const c = this.candles[idx];
          const x = getX(idx);
          const isBull = p.bias === 'Bullish';
          const y = isBull ? getY(c.low) + 18 : getY(c.high) - 18;

          // Cute badge pill
          const pillText = `${isBull ? '✨' : '🔻'} ${p.name}`;
          ctx.font = 'bold 10px Outfit, Inter, sans-serif';
          const textW = ctx.measureText(pillText).width;
          const pillW = textW + 14;
          const pillH = 18;
          const pillX = Math.max(5, Math.min(w - pillW - 10, x - pillW / 2));
          const pillY = y - pillH / 2;

          // Shadow and Background
          ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.92)' : 'rgba(244, 63, 94, 0.92)';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pillX, pillY, pillW, pillH, 9);
          } else {
            ctx.fillRect(pillX, pillY, pillW, pillH);
          }
          ctx.fill();

          // Border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(pillText, pillX + pillW / 2, pillY + 12);
        }
      });
    }

    // 5B. Draw Predicted Future Trajectory Channel (Upward or Downward Path Forecast)
    if (this.trajectory && numCandles > 0) {
      const lastCandle = this.candles[numCandles - 1];
      const startX = getX(numCandles - 1);
      const startY = getY(lastCandle.close);
      const endX = Math.min(w - this.padding.right, startX + candleSlotW * 6);

      const isBullish = this.trajectory.direction === 'bullish';
      const targetY = getY(this.trajectory.target1 || (isBullish ? lastCandle.close * 1.018 : lastCandle.close * 0.982));
      const stopLossY = getY(this.trajectory.stopLoss || (isBullish ? lastCandle.close * 0.988 : lastCandle.close * 1.012));

      // 1. Shaded Future Trajectory Cone
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, targetY);
      ctx.lineTo(endX, stopLossY);
      ctx.closePath();

      const coneGrad = ctx.createLinearGradient(startX, startY, endX, targetY);
      if (isBullish) {
        coneGrad.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
        coneGrad.addColorStop(1, 'rgba(16, 185, 129, 0.22)');
      } else {
        coneGrad.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
        coneGrad.addColorStop(1, 'rgba(244, 63, 94, 0.22)');
      }
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // 2. Projected Directional Arrow Line
      ctx.beginPath();
      ctx.strokeStyle = isBullish ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 4]);
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Arrow Tip
      const arrowSize = 6;
      ctx.beginPath();
      ctx.arc(endX, targetY, arrowSize, 0, Math.PI * 2);
      ctx.fillStyle = isBullish ? '#10b981' : '#f43f5e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Invalidation / Stop-Loss Line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(startX, stopLossY);
      ctx.lineTo(endX, stopLossY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Target Label Flag
      const targetText = isBullish
        ? `🎯 Target: ₹${(this.trajectory.target1 || 0).toFixed(2)} (${this.trajectory.probability || 70}% Up)`
        : `🔻 Breakdown: ₹${(this.trajectory.target1 || 0).toFixed(2)} (${this.trajectory.probability || 70}% Down)`;
      
      ctx.font = 'bold 10px Outfit, Inter, sans-serif';
      ctx.fillStyle = isBullish ? '#34d399' : '#fb7185';
      ctx.textAlign = 'right';
      ctx.fillText(targetText, endX - 10, isBullish ? targetY - 8 : targetY + 14);

      // Stop-loss label
      ctx.fillStyle = '#f87171';
      ctx.fillText(`🛑 Invalidation SL: ₹${(this.trajectory.stopLoss || 0).toFixed(2)}`, endX - 10, isBullish ? stopLossY + 12 : stopLossY - 8);
    }

    // 6. Draw Date Labels along bottom
    ctx.fillStyle = textColor;
    ctx.font = '10px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    const dateInterval = Math.max(1, Math.floor(numCandles / 6));

    for (let i = 0; i < numCandles; i += dateInterval) {
      const c = this.candles[i];
      const x = getX(i);
      const dateStr = c.time ? c.time.slice(5) : '';
      ctx.fillText(dateStr, x, h - 12);
    }

    // 7. Draw Crosshair & Hover details if active
    if (this.hoverIndex >= 0 && this.hoverIndex < numCandles) {
      const hc = this.candles[this.hoverIndex];
      const hx = getX(this.hoverIndex);
      const hy = getY(hc.close);

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, this.padding.top);
      ctx.lineTo(hx, h - this.padding.bottom);
      ctx.stroke();

      // Horizontal line to price
      ctx.beginPath();
      ctx.moveTo(this.padding.left, hy);
      ctx.lineTo(w - this.padding.right, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = hc.close >= hc.open ? '#10b981' : '#f43f5e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  initEvents() {
    // Mouse hover
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.candles || this.candles.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.mousePos = { x, y };

      const chartW = this.width - this.padding.left - this.padding.right;
      const candleSlotW = chartW / this.candles.length;
      const relX = x - this.padding.left;
      const idx = Math.floor(relX / candleSlotW);

      if (idx >= 0 && idx < this.candles.length) {
        this.hoverIndex = idx;
        this.draw();
        this.updateTooltip(this.candles[idx], e.clientX, e.clientY);
      } else {
        this.hoverIndex = -1;
        this.draw();
        this.hideTooltip();
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this.draw();
      this.hideTooltip();
    });

    // Touch Support for Mobile Phones
    const handleTouchInteraction = (e) => {
      if (!this.candles || this.candles.length === 0) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.mousePos = { x, y };
      const chartW = this.width - this.padding.left - this.padding.right;
      const candleSlotW = chartW / this.candles.length;
      const relX = x - this.padding.left;
      const idx = Math.floor(relX / candleSlotW);

      if (idx >= 0 && idx < this.candles.length) {
        this.hoverIndex = idx;
        this.draw();
        this.updateTooltip(this.candles[idx], touch.clientX, touch.clientY);
      }
    };

    this.canvas.addEventListener('touchstart', handleTouchInteraction, { passive: true });
    this.canvas.addEventListener('touchmove', handleTouchInteraction, { passive: true });
    this.canvas.addEventListener('touchend', () => {
      this.hoverIndex = -1;
      this.draw();
      this.hideTooltip();
    });
  }

  updateTooltip(candle, clientX, clientY) {
    if (!this.tooltip) return;
    const isBull = candle.close >= candle.open;
    const diff = (candle.close - candle.open).toFixed(2);
    const pct = ((candle.close - candle.open) / candle.open * 100).toFixed(2);

    // Look up if any pattern exists on this candle
    const pattern = this.patterns.find(p => p.candleIndex === this.hoverIndex);

    this.tooltip.innerHTML = `
      <div class="tooltip-header flex justify-between items-center mb-1 text-xs text-slate-400">
        <span>📅 ${candle.date || candle.time || 'Candle'}</span>
        <span class="${isBull ? 'text-emerald-400' : 'text-rose-400'} font-bold">${isBull ? '+' : ''}${pct}%</span>
      </div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
        <div><span class="text-slate-400">Open:</span> <b>₹${candle.open.toFixed(2)}</b></div>
        <div><span class="text-slate-400">High:</span> <b>₹${candle.high.toFixed(2)}</b></div>
        <div><span class="text-slate-400">Low:</span> <b>₹${candle.low.toFixed(2)}</b></div>
        <div><span class="text-slate-400">Close:</span> <b>₹${candle.close.toFixed(2)}</b></div>
      </div>
      <div class="mt-1 text-xs text-slate-400 flex justify-between">
        <span>Vol: <b>${(candle.volume / 1e6).toFixed(1)}M</b></span>
        <span>Chg: <b class="${isBull ? 'text-emerald-400' : 'text-rose-400'}">${diff >= 0 ? '+' : ''}₹${diff}</b></span>
      </div>
      ${pattern ? `
        <div class="mt-2 pt-1 border-t border-slate-700/60 text-xs text-amber-300 font-semibold flex items-center gap-1">
          <span>🕯️ ${pattern.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">${pattern.bias} (${pattern.confidence}%)</span>
        </div>
      ` : ''}
    `;

    this.tooltip.style.display = 'block';

    const cardRect = this.canvas.parentElement.getBoundingClientRect();
    let left = clientX - cardRect.left + 15;
    let top = clientY - cardRect.top + 15;

    // Boundary check so tooltip never overflows phone or container
    if (left + 180 > cardRect.width) {
      left = Math.max(5, cardRect.width - 200);
    }
    if (top + 130 > cardRect.height) {
      top = Math.max(5, top - 120);
    }

    this.tooltip.style.left = `${Math.max(5, left)}px`;
    this.tooltip.style.top = `${Math.max(5, top)}px`;
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
}

window.CandlestickChart = CandlestickChart;
