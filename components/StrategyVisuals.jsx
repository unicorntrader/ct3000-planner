// pages/index.jsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import StrategyVisuals from '../components/StrategyVisuals';

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
          return 'Closes above the prior 20‑bar high (classic, excludes current bar); clean momentum breakout.';
        case 'range_breakout':
          return '3 red then 1 green; once armed, fires intrabar on break above the green candle’s high (one‑shot).';
        case 'ma10':
          return 'Breaks below 10‑period SMA to flag short‑term momentum weakness.';
        case 'ma50':
          return 'Breaks below 50‑period SMA to flag higher‑timeframe weakness.';
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

plot(range_established ? range_high : na, "Range High", color=color.new(color.blue, 0))
plot(range_established ? range_low  : na, "Range Low",  color=color.new(color.red, 0))
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

  const Card = ({ title, children, right }) => (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E6E1DA',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#2C2C2C' }}>{title}</h2>
        <div style={{ marginLeft: 'auto' }}>{right}</div>
      </div>
      {children}
    </section>
  );

  return (
    <>
      <Head>
        <title>TAKE THE MARKETS WITH YOU</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --bg: #FAF7F2; /* warm/earthy off-white */
            --ink: #1C1B1A;
            --muted: #6B655E;
            --accent: #0E7C66; /* deep green */
          }
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body {
            margin: 0;
            font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--ink);
          }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; }
          code { font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
        `}</style>
      </Head>

      <div style={{ padding: '28px 20px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: 0.2, margin: 0 }}>
            TAKE THE MARKETS WITH YOU
          </h1>
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>
            a tool by <a href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">@philoinvestor</a>
          </span>
        </header>

        {/* Controls */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr auto',
            gap: 12,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Ticker (e.g. AAPL)"
            style={{
              padding: '12px 14px',
              fontSize: 18,
              borderRadius: 12,
              border: '1px solid #D8D2C9',
              background: '#FFF',
              outline: 'none',
            }}
          />
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            style={{
              padding: '12px 40px 12px 14px',
              fontSize: 18,
              borderRadius: 12,
              border: '1px solid #D8D2C9',
              background: '#FFF',
              appearance: 'none',
              backgroundImage:
                'url("data:image/svg+xml;utf8,<svg fill=\\"%236B655E\\" height=\\"20\\" viewBox=\\"0 0 24 24\\" width=\\"20\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M7 10l5 5 5-5\\"/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPositionX: 'calc(100% - 12px)',
              backgroundPositionY: 'center',
            }}
          >
            <option value="breakout">Breakout</option>
            <option value="range_breakout">Range Breakout</option>
            <option value="ma10">MA10 Breakdown</option>
            <option value="ma50">MA50 Breakdown</option>
          </select>

          <button
            onClick={generate}
            style={{
              padding: '12px 24px',
              fontSize: 20,
              cursor: 'pointer',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 8px 18px rgba(14,124,102,0.25)',
              transform: 'translateY(0)',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🚀 Generate
          </button>
        </section>

        {/* Strategy summary */}
        <Card title="Strategy">
          <p style={{ margin: 0, color: '#3b3a38', lineHeight: 1.5 }}>{explanation}</p>
        </Card>

        {/* Visuals */}
        <Card title={null}>
          <StrategyVisuals selected={trigger} />
        </Card>

        {/* Pine Script */}
        <Card
          title="📜 Pine Script"
          right={
            <button
              onClick={() => {
                navigator.clipboard.writeText(pineCode);
                const el = document.getElementById('pine-copied');
                if (el) {
                  el.style.opacity = 1;
                  setTimeout(() => (el.style.opacity = 0), 1200);
                }
              }}
              style={{
                padding: '8px 12px',
                fontSize: 14,
                borderRadius: 10,
                border: '1px solid #D8D2C9',
                background: '#FFF',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          }
        >
          <span
            id="pine-copied"
            style={{
              position: 'absolute',
              right: 84,
              marginTop: -34,
              opacity: 0,
              transition: 'opacity .2s ease',
              fontSize: 13,
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            ✅ Copied!
          </span>

          <div
            style={{
              background: '#F3EFE8',
              border: '1px solid #E6E1DA',
              borderRadius: 12,
              padding: 12,
              height: 260, // fixed height
              overflow: 'auto', // scroll inside
            }}
          >
            <code style={{ fontSize: 14, whiteSpace: 'pre' }}>
              {pineCode || '// Click Generate to preview Pine Script here…'}
            </code>
          </div>
        </Card>

        {/* Webhook JSON */}
        <Card
          title="📦 Webhook JSON"
          right={
            <button
              onClick={() => {
                navigator.clipboard.writeText(webhookJson);
                const el = document.getElementById('json-copied');
                if (el) {
                  el.style.opacity = 1;
                  setTimeout(() => (el.style.opacity = 0), 1200);
                }
              }}
              style={{
                padding: '8px 12px',
                fontSize: 14,
                borderRadius: 10,
                border: '1px solid #D8D2C9',
                background: '#FFF',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          }
        >
          <span
            id="json-copied"
            style={{
              position: 'absolute',
              right: 84,
              marginTop: -34,
              opacity: 0,
              transition: 'opacity .2s ease',
              fontSize: 13,
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            ✅ Copied!
          </span>

          <div
            style={{
              background: '#F8F6F2',
              border: '1px solid #E6E1DA',
              borderRadius: 12,
              padding: 12,
              height: 260, // fixed height
              overflow: 'auto', // scroll inside
            }}
          >
            <code style={{ fontSize: 14, whiteSpace: 'pre' }}>
              {webhookJson || '{\n  // Click Generate to preview Webhook JSON here…\n}'}
            </code>
          </div>
        </Card>

        {/* CTA */}
        <section style={{ textAlign: 'center', marginTop: 28, marginBottom: 10 }}>
          <a
            href="https://forms.gle/e9yVXHze5MnuKqM68"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 22px',
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              background: 'var(--accent)',
              borderRadius: 12,
              boxShadow: '0 8px 18px rgba(14,124,102,0.25)',
            }}
          >
            Join the waitlist for Co‑Trader 3000
          </a>
        </section>
      </div>
    </>
  );
}
