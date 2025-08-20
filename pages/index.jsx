import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import StrategyVisuals from '@/components/StrategyVisuals';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    const getExplanation = () => {
      switch (trigger) {
        case 'breakout':
          return 'Closes above the prior 20‑bar high (excludes the current bar) for a classic, cleaner breakout.';
        case 'ma10':
          return 'Triggers when price breaks below the 10‑period SMA to flag short‑term weakness.';
        case 'ma50':
          return 'Triggers when price breaks below the 50‑period SMA to flag higher‑timeframe weakness.';
        case 'range_breakout':
          return '3 red candles then 1 green; once armed, fires intrabar on a break above the green candle’s high (one‑shot).';
        default:
          return '';
      }
    };
    setExplanation(getExplanation());
  }, [trigger]);

  const generate = () => {
    let pine = `//@version=5
indicator("Trade Watch: ${trigger} Trigger", overlay=true)
`;

    if (trigger === 'breakout') {
      pine += `priorHigh = ta.highest(high[1], 20)
trigger   = ta.crossover(close, priorHigh)
plot(priorHigh, "Prior 20H", color=color.red)
`;
    } else if (trigger === 'ma10') {
      pine += `ma = ta.sma(close, 10)
trigger = close < ma
plot(ma, "SMA10", color=color.blue)
`;
    } else if (trigger === 'ma50') {
      pine += `ma = ta.sma(close, 50)
trigger = close < ma
plot(ma, "SMA50", color=color.purple)
`;
    } else if (trigger === 'range_breakout') {
      pine += `three_red_then_green = close[4] < open[4] and close[3] < open[3] and close[2] < open[2] and close[1] > open[1]
setup_high = high[1]
setup_low  = math.min(low[4], math.min(low[3], low[2]))

var float range_high = na
var float range_low  = na
var bool  armed      = false

if three_red_then_green
    range_high := setup_high
    range_low  := setup_low
    armed      := true

range_established   = armed and not na(range_high) and not na(range_low)
breakout_condition  = range_established and high > range_high + syminfo.mintick
invalidated         = range_established and low < range_low

if breakout_condition or invalidated
    armed      := false
    range_high := na
    range_low  := na

plot(range_established ? range_high : na, "Range High", color=color.blue)
plot(range_established ? range_low  : na, "Range Low",  color=color.red)
trigger = breakout_condition
`;
    }

    pine += `
plotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(trigger, title="${trigger} Trigger", message='{"symbol":"{{ticker}}","setup":"${trigger}","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')
`.trim();

    const json = {
      symbol: ticker?.toUpperCase() || '{{ticker}}',
      setup: trigger,
      price: '{{close}}',
      volume: '{{volume}}',
      timestamp: '{{time}}',
    };

    setPineCode(pine);
    setWebhookJson(JSON.stringify(json, null, 2));
  };

  return (
    <>
      <Head>
        <title>TAKE THE MARKETS WITH YOU</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
            background: #ffffff;
            color: #0b0c0e;
          }
          a { color: #1d4ed8; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .container { padding: 2rem; max-width: 900px; margin: 0 auto; }
          .topline { display:flex; align-items:center; justify-content: space-between; margin-bottom: 8px; }
          .byline { font-size: 14px; color: #6b7280; }
          .waitlist { padding: 10px 14px; font-size: 15px; font-weight: 600; border-radius: 8px; border: 1px solid #d1d5db; background:#f3f4f6; color:#111; }
          h1 { font-size: 32px; font-weight: 700; margin: 6px 0 16px; }
          .controls { display:flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
          .controls input, .controls select {
            padding: 10px 12px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff;
          }
          .controls button {
            padding: 10px 18px; font-size: 16px; cursor: pointer; background: #0ea5e9; color:#fff; border: none; border-radius: 8px;
          }
          .info { margin-bottom: 1.25rem; font-size: 16px; background: #eef2f7; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb; }
          .section-title { font-size: 24px; margin: 24px 0 8px; }
          .code-wrap { position: relative; }
          .copy-btn {
            position: absolute; top: 10px; right: 10px; font-size: 13px; padding: 6px 10px; background: #111; color:#fff; border: none; cursor:pointer; border-radius: 6px;
          }
          .copied { position:absolute; top:10px; right:84px; opacity:0; transition: opacity .3s; font-size:13px; color:#111; }
          pre {
            background: #0b1021; color: #d1e9ff; padding: 1rem; border-radius: 8px;
            overflow-x: auto; overflow-y: auto; max-height: 300px; font-size: 14px; margin: 0;
          }
          code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
        `}</style>
      </Head>

      <div className="container">
        <div className="topline">
          <div className="byline">
            a tool by <a href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">@philoinvestor</a>
          </div>
          <a
            className="waitlist"
            href="https://forms.gle/e9yVXHze5MnuKqM68"
            target="_blank"
            rel="noreferrer"
          >
            Join the Co‑Trader 3000 waitlist
          </a>
        </div>

        <h1>TAKE THE MARKETS WITH YOU</h1>

        <div className="controls">
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="Ticker (e.g. AAPL)"
            style={{ flex: '1 1 200px' }}
          />
          <select
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            style={{ minWidth: '220px' }}
          >
            <option value="breakout">Breakout</option>
            <option value="range_breakout">Range Breakout</option>
            <option value="ma10">MA10 Breakdown</option>
            <option value="ma50">MA50 Breakdown</option>
          </select>
          <button onClick={generate}>Generate</button>
        </div>

        <div className="info">
          <strong>ℹ️ Strategy:</strong> {explanation}
        </div>

        <div style={{ marginTop: '24px' }}>
          <StrategyVisuals selected={trigger} />
        </div>

        <h2 className="section-title">📜 Pine Script</h2>
        <div className="code-wrap">
          <button
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(pineCode || '');
              const el = document.getElementById('pine-copied');
              if (el) { el.style.opacity = 1; setTimeout(() => (el.style.opacity = 0), 1200); }
            }}
          >
            Copy
          </button>
          <span id="pine-copied" className="copied">✅ Copied!</span>
          <pre><code>{pineCode}</code></pre>
        </div>

        <h2 className="section-title">📦 Payload</h2>
        <div className="code-wrap">
          <button
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(webhookJson || '');
              const el = document.getElementById('json-copied');
              if (el) { el.style.opacity = 1; setTimeout(() => (el.style.opacity = 0), 1200); }
            }}
          >
            Copy
          </button>
          <span id="json-copied" className="copied">✅ Copied!</span>
          <pre><code>{webhookJson}</code></pre>
        </div>
      </div>
    </>
  );
}

// Keep page dynamic to avoid any SSR hiccups with heavy client visuals
export async function getServerSideProps() {
  return { props: {} };
}
