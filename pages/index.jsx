import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Load visuals only on the client to avoid SSR recursion with large SVGs/head side-effects
const StrategyVisuals = dynamic(() => import('../components/StrategyVisuals'), { ssr: false });

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [explanation, setExplanation] = useState('');
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    const getExplanation = () => {
      switch (trigger) {
        case 'breakout':
          return 'Closes above the prior 20-bar high (excludes the current bar) for a classic, cleaner breakout.';
        case 'retest':
          return 'Looks for a bullish retest: price closed above resistance, then dips back and holds above that level.';
        case 'ma10':
          return 'Triggers when price breaks below the 10-period SMA to flag short-term weakness.';
        case 'ma50':
          return 'Triggers when price breaks below the 50-period SMA to flag higher-timeframe weakness.';
        case 'range_breakout':
          return '3 red candles then 1 green; once armed, fires intrabar on a break above the green candle’s high (one-shot).';
        default:
          return '';
      }
    };
    setExplanation(getExplanation());

    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/webhook`);
    }
  }, [trigger]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/webhook-messages');
        if (!res.ok) return;
        const data = await res.json();
        setWebhookLogs(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const testWebhook = async () => {
    try {
      const testPayload = {
        symbol: ticker?.toUpperCase() || 'TEST',
        setup: trigger,
        price: 150.25,
        volume: 1000000,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        alert('✅ Test webhook sent successfully!');
      } else {
        alert('❌ Test webhook failed');
      }
    } catch {
      alert('❌ Error sending test webhook');
    }
  };

  const generate = () => {
    let pine = `//@version=5
indicator("Trade Watch: ${trigger} Trigger", overlay=true)
`;

    if (trigger === 'breakout') {
      pine += `priorHigh = ta.highest(high[1], 20)
trigger   = ta.crossover(close, priorHigh)
plot(priorHigh, "Prior 20H", color=color.red)
`;
    } else if (trigger === 'retest') {
      pine += `priorHigh   = ta.highest(high[1], 20)
brokeAbove = close[1] > priorHigh
retestHold = close < priorHigh and low >= priorHigh and close > open
trigger    = brokeAbove and retestHold
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <style>{`
          body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background: #f9f9f9;
            color: #111;
          }
          code {
            font-family: 'Courier New', monospace;
            font-size: 14px;
          }
        `}</style>
      </Head>

      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '1rem' }}>📈 Plan Trader — Trade Watch Generator</h1>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="Ticker (e.g. AAPL)"
            style={{ padding: '10px', fontSize: '18px', flex: '1 1 200px' }}
          />
          <select
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '18px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              appearance: 'none',
              backgroundColor: '#fff',
              backgroundImage:
                'url("data:image/svg+xml;utf8,<svg fill=\'%23000\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPositionX: 'calc(100% - 10px)',
              backgroundPositionY: 'center',
              backgroundSize: '16px',
              flex: '1 1 200px',
              minWidth: '220px',
            }}
          >
            <option value="breakout">Breakout</option>
            <option value="retest">Retest</option>
            <option value="ma10">MA10 Breakdown</option>
            <option value="ma50">MA50 Breakdown</option>
            <option value="range_breakout">Range Breakout</option>
          </select>
          <button
            onClick={generate}
            style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer', background: '#111', color: '#fff', border: 'none', borderRadius: 6 }}
          >
            🚀 Generate
          </button>
        </div>

        <div style={{ marginBottom: '2rem', fontSize: '16px', background: '#eef2f5', padding: '1rem', borderRadius: '6px' }}>
          <strong>ℹ️ Strategy:</strong> {explanation}
        </div>

        <div style={{ marginTop: '24px' }}>
          <StrategyVisuals selected={trigger} />
        </div>

        <h2 style={{ fontSize: '24px', marginTop: '24px' }}>📜 Pine Script</h2>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pineCode);
              const el = document.getElementById('pine-copied');
              if (el) {
                el.style.opacity = 1;
                setTimeout(() => (el.style.opacity = 0), 1500);
              }
            }}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '14px',
              padding: '5px 10px',
              background: '#111',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Copy
          </button>
          <span
            id="pine-copied"
            style={{ position: 'absolute', top: '10px', right: '80px', opacity: 0, transition: 'opacity 0.3s ease', fontSize: '14px' }}
          >
            ✅ Copied!
          </span>
          <pre style={{ background: '#f0f0f0', padding: '1rem', overflowX: 'auto', fontSize: '15px', maxHeight: 300, overflowY: 'auto' }}>
            <code>{pineCode}</code>
          </pre>
        </div>

        <h2 style={{ fontSize: '24px' }}>📦 Webhook JSON</h2>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(webhookJson);
              const el = document.getElementById('json-copied');
              if (el) {
                el.style.opacity = 1;
                setTimeout(() => (el.style.opacity = 0), 1500);
              }
            }}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '14px',
              padding: '5px 10px',
              background: '#111',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Copy
          </button>
          <span
            id="json-copied"
            style={{ position: 'absolute', top: '10px', right: '80px', opacity: 0, transition: 'opacity 0.3s ease', fontSize: '14px' }}
          >
            ✅ Copied!
          </span>
          <pre style={{ background: '#f9f9f9', padding: '1rem', overflowX: 'auto', fontSize: '15px', maxHeight: 300, overflowY: 'auto' }}>
            <code>{webhookJson}</code>
          </pre>
        </div>

        <h2 style={{ fontSize: '24px', marginTop: '2rem' }}>🔗 Webhook Configuration</h2>
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '16px' }}>
            <strong>Your Webhook URL:</strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <code
              style={{
                background: '#e8e8e8',
                padding: '8px 12px',
                borderRadius: '4px',
                flex: 1,
                fontSize: '14px',
                wordBreak: 'break-all',
              }}
            >
              {webhookUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                alert('✅ Webhook URL copied!');
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Copy URL
            </button>
            <button
              onClick={testWebhook}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Test Webhook
            </button>
          </div>
          <p style={{ margin: '1rem 0 0 0', fontSize: '14px', color: '#666' }}>
            Copy this URL and paste it into your TradingView alert&apos;s webhook URL field.
          </p>
        </div>

        <h2 style={{ fontSize: '24px' }}>📋 Webhook Logs</h2>
        <div
          style={{
            background: '#f4f4f4',
            padding: '1rem',
            borderRadius: '6px',
            maxHeight: '400px',
            overflowY: 'auto',
            marginBottom: '2rem',
          }}
        >
          {webhookLogs.length === 0 ? (
            <p style={{ margin: 0, color: '#666' }}>No webhook messages received yet...</p>
          ) : (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#666' }}>
                Latest {webhookLogs.length} webhook{webhookLogs.length !== 1 ? 's' : ''} received:
              </p>
              {webhookLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    background: '#fff',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>
                    Received: {new Date(log.receivedAt).toLocaleString()}
                  </div>
                  <pre style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(log, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Force dynamic rendering so Next doesn't try to pre-export "/" (prevents SSR recursion)
export async function getServerSideProps() {
  return { props: {} };
}import React, { useState, useEffect } from 'react';
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
          return 'Classic breakout: fires when the close crosses the prior 20‑bar high (cleaner, close-based).';
        case 'orh':
          return 'Opening Range High: after the opening window locks, fire once intrabar when price breaks the OR High.';
        case 'orl':
          return 'Opening Range Low: after the opening window locks, fire once intrabar when price breaks the OR Low.';
        case 'range_breakout':
          return '3 red then 1 green; once armed, fire intrabar on a break over the green high (one-shot).';
        case 'ma10':
          return 'Breaks below the 10‑period SMA to flag short‑term weakness.';
        case 'ma50':
          return 'Breaks below the 50‑period SMA to flag higher‑timeframe weakness.';
        default:
          return '';
      }
    };
    setExplanation(getExplanation());
  }, [trigger]);

  const generate = () => {
    let pine = `//@version=5
indicator("Plan Trader: ${trigger} Trigger", overlay=true)
`;

    if (trigger === 'breakout') {
      pine += `priorHigh = ta.highest(high[1], 20)
trigger   = ta.crossover(close, priorHigh)
plot(priorHigh, "Prior 20H", color=color.red)
`;
    } else if (trigger === 'orh') {
      pine += `windowBars = input.int(6, "Opening Window Bars")
isNewDay  = ta.change(time("D"))
var int dayBars = 0
dayBars := isNewDay ? 1 : dayBars + 1
inWindow = dayBars <= windowBars

var float orHigh = na
var float orLow  = na
if isNewDay
    orHigh := high
    orLow  := low
else if inWindow
    orHigh := math.max(orHigh, high)
    orLow  := math.min(orLow,  low)

var bool armed = na(armed) ? false : armed
if isNewDay
    armed := true

breakAbove = not inWindow and armed and high > orHigh + syminfo.mintick
trigger    = breakAbove

if trigger
    armed := false

plot(inWindow ? na : orHigh, "OR High", color=color.blue)
plot(inWindow ? na : orLow,  "OR Low",  color=color.orange)
`;
    } else if (trigger === 'orl') {
      pine += `windowBars = input.int(6, "Opening Window Bars")
isNewDay  = ta.change(time("D"))
var int dayBars = 0
dayBars := isNewDay ? 1 : dayBars + 1
inWindow = dayBars <= windowBars

var float orHigh = na
var float orLow  = na
if isNewDay
    orHigh := high
    orLow  := low
else if inWindow
    orHigh := math.max(orHigh, high)
    orLow  := math.min(orLow,  low)

var bool armed = na(armed) ? false : armed
if isNewDay
    armed := true

breakBelow = not inWindow and armed and low < orLow - syminfo.mintick
trigger    = breakBelow

if trigger
    armed := false

plot(inWindow ? na : orHigh, "OR High", color=color.blue)
plot(inWindow ? na : orLow,  "OR Low",  color=color.orange)
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
    }

    pine += `
plotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.new(color.green, 0), text="🚨")
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <style>{`
          :root{
            --bg:#f6f3ee;           /* sand */
            --panel:#ffffff;        /* paper */
            --card:#fffdf8;         /* ivory */
            --text:#1f2933;         /* ink */
            --muted:#5f6b76;        /* slate */
            --accent:#2f855a;       /* forest */
            --accent2:#c05621;      /* terracotta */
            --stroke:#e6e2da;       /* light border */
          }
          body{
            margin:0;
            font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
            background:
              radial-gradient(900px 500px at 70% -10%, rgba(47,133,90,.12), transparent),
              var(--bg);
            color:var(--text);
          }
          .container{max-width:1100px;margin:0 auto;padding:32px;}
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
          .title{font-size:28px;font-weight:800;letter-spacing:.3px}
          .sub{color:var(--muted);font-size:14px}
          .brand a{color:var(--accent2);text-decoration:none;font-weight:700}
          .brand a:hover{text-decoration:underline}
          .grid{display:grid;grid-template-columns:340px 1fr;gap:18px}
          @media(max-width:980px){.grid{grid-template-columns:1fr}}
          .panel{background:var(--panel);border:1px solid var(--stroke);border-radius:14px;padding:16px}
          .card{background:var(--card);border:1px solid var(--stroke);border-radius:14px;padding:16px}
          .row{display:flex;gap:10px;flex-wrap:wrap}
          .input,.select{
            width:100%;padding:12px 14px;background:#fcfbf7;color:var(--text);
            border:1px solid var(--stroke);border-radius:10px;font-size:16px
          }
          .btn{
            padding:12px 16px;border:1px solid var(--stroke);
            background:linear-gradient(180deg,#f3efe7,#e7e1d6);
            color:#2f3a44;border-radius:10px;font-weight:700;cursor:pointer
          }
          .btn:active{transform:translateY(1px)}
          code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;}
          pre{background:#fcfbf7;border:1px solid var(--stroke);border-radius:10px;padding:12px;overflow:auto}
          h2{margin:16px 0 10px}
          .cta{
            display:flex;justify-content:center;align-items:center;gap:14px;
            padding:24px;margin-top:28px;background:var(--panel);border:1px solid var(--stroke);border-radius:14px
          }
          .cta a{
            display:inline-block;padding:12px 18px;border-radius:10px;
            background:var(--accent);color:white;text-decoration:none;font-weight:700
          }
          .cta a:hover{background:#276749}
        `}</style>
      </Head>

      <div className="container">
        <div className="header">
          <div>
            <div className="title">TAKE THE MARKETS WITH YOU</div>
            <div className="sub">Generate Pine + alert JSON for ultra-clear trade triggers with crisp visuals.</div>
          </div>
          <div className="brand">a tool by <a href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">@philoinvestor</a></div>
        </div>

        <div className="grid">
          <div className="panel">
            <div className="row" style={{ marginBottom: 12 }}>
              <input
                className="input"
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                placeholder="Ticker (e.g. AAPL)"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <select
                className="select"
                value={trigger}
                onChange={e => setTrigger(e.target.value)}
              >
                <option value="breakout">Breakout (20H close)</option>
                <option value="orh">ORH (Opening Range High)</option>
                <option value="orl">ORL (Opening Range Low)</option>
                <option value="range_breakout">Range Breakout</option>
                <option value="ma10">MA10 Breakdown</option>
                <option value="ma50">MA50 Breakdown</option>
              </select>
            </div>

            <button className="btn" onClick={generate}>🚀 Generate</button>

            <div className="card" style={{ marginTop: 14 }}>
              <strong>ℹ️ Strategy</strong>
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>{explanation}</div>
            </div>
          </div>

          <div>
            <div className="card">
              <StrategyVisuals selected={trigger} />
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h2>📜 Pine Script</h2>
              <div style={{ position: 'relative' }}>
                <button
                  className="btn"
                  style={{ position: 'absolute', right: 8, top: 8 }}
                  onClick={() => { navigator.clipboard.writeText(pineCode); }}
                >
                  Copy
                </button>
                <pre><code>{pineCode}</code></pre>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h2>📦 Webhook JSON</h2>
              <div style={{ position: 'relative' }}>
                <button
                  className="btn"
                  style={{ position: 'absolute', right: 8, top: 8 }}
                  onClick={() => { navigator.clipboard.writeText(webhookJson); }}
                >
                  Copy
                </button>
                <pre><code>{webhookJson}</code></pre>
              </div>
            </div>

            <div className="cta">
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>Join the waitlist for Co‑Trader 3000</div>
              <a href="https://forms.gle/e9yVXHze5MnuKqM68" target="_blank" rel="noreferrer">Join Waitlist</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
