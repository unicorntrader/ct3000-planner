import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// (Optional) Load visuals client-only; safe even if we temporarily hide them
const StrategyVisuals = dynamic(() => import('../components/StrategyVisuals'), { ssr: false });

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [explanation, setExplanation] = useState('');

  // Strategy explainer (no Retest; added ORH/ORL)
  useEffect(() => {
    const text =
      trigger === 'breakout'
        ? 'Closes above the prior 20‑bar high (excludes the current bar) for a clean momentum breakout.'
        : trigger === 'orh'
        ? 'ORH = Outside Range High. Today’s high exceeds BOTH the prior day’s high and low, and closes through the prior high (range expansion to the upside).'
        : trigger === 'orl'
        ? 'ORL = Outside Range Low. Today’s low undercuts BOTH the prior day’s high and low, and closes through the prior low (range expansion to the downside).'
        : trigger === 'range_breakout'
        ? '3 red bars then 1 green; once armed, fires on a break above the green bar’s high (one‑shot).'
        : trigger === 'ma10'
        ? 'Triggers when price breaks below the 10‑period SMA to flag short‑term weakness.'
        : trigger === 'ma50'
        ? 'Triggers when price breaks below the 50‑period SMA to flag higher‑timeframe weakness.'
        : '';
    setExplanation(text);
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
    } else if (trigger === 'orh') {
      // Outside Range High (daily by default; works on any TF vs prior bar)
      pine += `ph = high[1]
pl = low[1]
outside_up = high > ph and low < pl
trigger = outside_up and close > ph
plot(ph, "Prev High", color=color.red)
plot(pl, "Prev Low", color=color.blue)
`;
    } else if (trigger === 'orl') {
      // Outside Range Low
      pine += `ph = high[1]
pl = low[1]
outside_dn = high > ph and low < pl
trigger = outside_dn and close < pl
plot(ph, "Prev High", color=color.red)
plot(pl, "Prev Low", color=color.blue)
`;
    } else if (trigger === 'ma10') {
      pine += `ma = ta.sma(close, 10)
trigger = close < ma
plot(ma, "SMA10", color=color.new(color.blue, 0))
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <style>{`
          :root{
            --bg:#faf7f2;        /* earthy light */
            --ink:#2a2a2a;
            --muted:#6b6b6b;
            --card:#fff;
            --accent:#6c8e5a;    /* olive green */
            --accent2:#b07e4a;   /* clay */
            --border:#e6e1d9;
          }
          html,body{ margin:0; background:var(--bg); color:var(--ink); font-family:'Inter',sans-serif; }
          .container{ max-width:1000px; margin:0 auto; padding:28px 20px 80px; }
          .toprow{ display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
          .title{ font-size:36px; font-weight:800; letter-spacing:.3px; }
          .credit a{ color:var(--accent2); text-decoration:none; font-weight:600; }
          .panel{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px; }
          .row{ display:flex; gap:12px; flex-wrap:wrap; }
          .input, .select{ padding:12px 14px; font-size:18px; border:1px solid var(--border); border-radius:10px; background:#fff; min-width:220px; }
          .select{ appearance:none; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%236b6b6b'><path d='M7 10l5 5 5-5'/></svg>"); background-repeat:no-repeat; background-position:calc(100% - 10px) center; background-size:16px; }
          .generate{ padding:14px 28px; font-size:18px; font-weight:700; border:none; border-radius:12px; cursor:pointer; background:var(--accent); color:white; box-shadow:0 6px 20px rgba(108,142,90,.25); }
          .generate:hover{ transform:translateY(-1px); }
          .explainer{ background:#f3efe8; border:1px solid var(--border); border-radius:12px; padding:14px; color:var(--muted); }
          .sectionTitle{ font-size:22px; margin:22px 0 10px; }
          .codewrap{ position:relative; }
          .copy{ position:absolute; top:10px; right:10px; padding:6px 10px; font-size:14px; border-radius:8px; border:1px solid var(--border); background:#fff; cursor:pointer; }
          pre{ background:#fbfaf8; border:1px solid var(--border); border-radius:12px; padding:14px; font-size:15px; max-height:320px; overflow:auto; }
          .footer{ margin-top:36px; text-align:center; }
          .waitlist{ display:inline-block; padding:14px 22px; background:var(--accent2); color:white; border-radius:12px; text-decoration:none; font-weight:700; }
        `}</style>
      </Head>

      <div className="container">
        <div className="toprow">
          <h1 className="title">TAKE THE MARKETS WITH YOU</h1>
          <div className="credit">
            a tool by <a href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">@philoinvestor</a>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <input
              className="input"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Ticker (e.g. AAPL)"
            />
            <select
              className="select"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
            >
              <option value="breakout">Breakout (20‑bar High)</option>
              <option value="orh">ORH — Outside Range High</option>
              <option value="orl">ORL — Outside Range Low</option>
              <option value="range_breakout">Range Breakout</option>
              <option value="ma10">MA10 Breakdown</option>
              <option value="ma50">MA50 Breakdown</option>
            </select>
            <button className="generate" onClick={generate}>🚀 Generate</button>
          </div>

          <div className="explainer"><strong>Strategy:</strong> {explanation}</div>

          {/* Hide visuals for now if your StrategyVisuals doesn’t yet include ORH/ORL */}
          {/* <div style={{ marginTop: 18 }}><StrategyVisuals selected={trigger} /></div> */}
        </div>

        <h2 className="sectionTitle">📜 Pine Script</h2>
        <div className="codewrap">
          <button
            className="copy"
            onClick={() => {
              navigator.clipboard.writeText(pineCode || '');
              const el = document.getElementById('pine-copied');
              if (el) { el.style.opacity = 1; setTimeout(() => (el.style.opacity = 0), 1200); }
            }}
          >
            Copy
          </button>
          <span id="pine-copied" style={{ position: 'absolute', top: 12, right: 80, opacity: 0, transition: 'opacity .25s' }}>
            ✅ Copied!
          </span>
          <pre><code>{pineCode}</code></pre>
        </div>

        <h2 className="sectionTitle">📦 Alert/Webhook JSON (optional)</h2>
        <div className="codewrap">
          <button
            className="copy"
            onClick={() => {
              navigator.clipboard.writeText(webhookJson || '');
              const el = document.getElementById('json-copied');
              if (el) { el.style.opacity = 1; setTimeout(() => (el.style.opacity = 0), 1200); }
            }}
          >
            Copy
          </button>
          <span id="json-copied" style={{ position: 'absolute', top: 12, right: 80, opacity: 0, transition: 'opacity .25s' }}>
            ✅ Copied!
          </span>
          <pre><code>{webhookJson}</code></pre>
        </div>

        <div className="footer">
          <a className="waitlist" href="https://forms.gle/e9yVXHze5MnuKqM68" target="_blank" rel="noreferrer">
            Join the waitlist for Co‑Trader 3000
          </a>
        </div>
      </div>
    </>
  );
}

// Keep it dynamic (avoids static export edge cases with visuals/head)
export async function getServerSideProps() {
  return { props: {} };
}
