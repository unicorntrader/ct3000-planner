import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Load visuals only on the client (prevents SSR/render recursion with large SVGs)
const StrategyVisuals = dynamic(() => import('../components/StrategyVisuals'), { ssr: false });

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
          :root {
            --bg: #ffffff;
            --ink: #0b0c0e;
            --muted: #6b7280;       /* gray-500 */
            --panel: #f3f4f6;       /* gray-100 */
            --border: #e5e7eb;      /* gray-200 */
            --brand: #1d4ed8;       /* blue-700 */
            --brand-ink: #ffffff;
            --brand-soft: #e0e7ff;  /* indigo-100-ish */
            --accent: #0ea5e9;      /* sky-500 */
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, "Inter", Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
            background: var(--bg);
            color: var(--ink);
          }
          a { color: var(--brand); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
          .topbar {
            display:flex; align-items:center; justify-content:space-between;
            padding: 12px 16px; border:1px solid var(--border); border-radius:10px;
            background: var(--panel);
          }
          .badge {
            font-size: 13px; color: var(--muted);
          }
          .hero {
            margin-top: 18px; padding: 28px; border:1px solid var(--border); border-radius:16px;
            background: linear-gradient(180deg, #f8fbff 0%, #ffffff 60%);
          }
          .title { font-size: 40px; line-height:1.1; margin: 0 0 8px; letter-spacing: -0.02em; }
          .subtitle { color: var(--muted); margin: 0 0 20px; font-size: 16px; }
          .cta-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
          .cta-primary {
            display:inline-flex; align-items:center; justify-content:center; gap:10px;
            padding: 16px 22px; font-size: 18px; font-weight: 700; letter-spacing: .2px;
            background: var(--brand); color: var(--brand-ink); border-radius: 12px; border: none; cursor: pointer;
            box-shadow: 0 6px 18px rgba(29,78,216,.25);
          }
          .cta-primary:hover { transform: translateY(-1px); }
          .cta-ghost {
            padding: 12px 16px; font-weight: 600; color: var(--brand);
            background: var(--brand-soft); border:1px solid var(--border); border-radius: 10px;
          }
          .grid { display:grid; grid-template-columns: 1.2fr .8fr; gap: 20px; margin-top: 22px; }
          @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
          .card {
            background: #fff; border:1px solid var(--border); border-radius: 12px; padding: 16px;
          }
          .card h2 { margin: 0 0 12px; font-size: 20px; }
          .row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom: 12px; }
          .input, .select {
            padding: 12px 14px; font-size: 16px; border:1px solid var(--border); border-radius: 10px; background:#fff; flex:1 1 220px;
          }
          .generate {
            padding: 14px 22px; font-size: 18px; font-weight: 700; border-radius: 12px; border:none; cursor:pointer;
            background: var(--accent); color:#fff; box-shadow: 0 6px 16px rgba(14,165,233,.25);
          }
          .info {
            background: var(--panel); border:1px solid var(--border); border-radius: 10px; padding: 12px; font-size: 14px; color: var(--muted);
          }
          .code-wrap { position:relative; }
          .copy {
            position:absolute; top:10px; right:10px; padding:6px 10px; font-size:13px; border-radius:8px;
            background: var(--ink); color:#fff; border:none; cursor:pointer;
          }
          pre {
            background: #0b1021; color: #d1e9ff; margin:0; padding: 14px; border-radius: 10px;
            overflow-x: auto; max-height: 280px; overflow-y:auto; font-size: 14px;
          }
          code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
          .footer-cta {
            margin-top: 28px; padding: 18px; border:1px dashed var(--border); border-radius: 12px; background:#f8fafc;
            display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
          }
        `}</style>
      </Head>

      <div className="wrap">
        <div className="topbar">
          <div className="badge">
            a tool by <a href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">@philoinvestor</a>
          </div>
          {/* Prominent top button directly under/next to attribution */}
          <a
            className="cta-primary"
            href="https://forms.gle/e9yVXHze5MnuKqM68"
            target="_blank"
            rel="noreferrer"
            aria-label="Join the waitlist for Co‑Trader 3000"
          >
            Join the Co‑Trader 3000 Waitlist
          </a>
        </div>

        <section className="hero">
          <h1 className="title">TAKE THE MARKETS WITH YOU</h1>
          <p className="subtitle">Generate clean TradingView triggers with one click — then copy the Pine or payload and go.</p>
          <div className="cta-row">
            <a
              className="cta-primary"
              href="https://forms.gle/e9yVXHze5MnuKqM68"
              target="_blank"
              rel="noreferrer"
            >
              🚀 Join the Waitlist
            </a>
            <a className="cta-ghost" href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">
              Follow @philoinvestor
            </a>
          </div>

          <div className="grid">
            <div className="card">
              <h2>Strategy & Inputs</h2>
              <div className="row">
                <input
                  className="input"
                  value={ticker}
                  onChange={e => setTicker(e.target.value)}
                  placeholder="Ticker (e.g. AAPL)"
                />
                <select
                  className="select"
                  value={trigger}
                  onChange={e => setTrigger(e.target.value)}
                >
                  <option value="breakout">Breakout</option>
                  <option value="range_breakout">Range Breakout</option>
                  <option value="ma10">MA10 Breakdown</option>
                  <option value="ma50">MA50 Breakdown</option>
                </select>
                <button className="generate" onClick={generate}>Generate</button>
              </div>
              <div className="info"><strong>Strategy:</strong> {explanation}</div>

              <div style={{ marginTop: 14 }}>
                <StrategyVisuals selected={trigger} />
              </div>
            </div>

            <div className="card">
              <h2>📜 Pine Script</h2>
              <div className="code-wrap">
                <button
                  className="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(pineCode || '');
                  }}
                >
                  Copy
                </button>
                <pre><code>{pineCode}</code></pre>
              </div>

              <h2 style={{ marginTop: 16 }}>📦 Payload (for alerts)</h2>
              <div className="code-wrap">
                <button
                  className="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookJson || '');
                  }}
                >
                  Copy
                </button>
                <pre><code>{webhookJson}</code></pre>
              </div>
            </div>
          </div>

          <div className="footer-cta">
            <div>
              <strong>Join the waitlist for Co‑Trader 3000</strong>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>Be first to get new strategy packs & workflows.</div>
            </div>
            <a
              className="cta-primary"
              href="https://forms.gle/e9yVXHze5MnuKqM68"
              target="_blank"
              rel="noreferrer"
            >
              Get Early Access
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

// Prevent static export of "/" to avoid any SSR recursion issues with heavy client-only visuals.
export async function getServerSideProps() {
  return { props: {} };
}
