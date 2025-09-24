import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import StrategyVisuals from '../components/StrategyVisuals';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');

  // Breakout controls
  const [breakoutBasis, setBreakoutBasis] = useState('High'); // High | Close
  const [breakoutLen, setBreakoutLen] = useState(20);

  // Breakdown controls
  const [breakdownBasis, setBreakdownBasis] = useState('Low'); // Low | Close
  const [breakdownLen, setBreakdownLen] = useState(20);

  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [explanation, setExplanation] = useState('');

  // UX: subtle "Updated" pulse + toast for Generate
  const [justUpdated, setJustUpdated] = useState(false);
  const [toast, setToast] = useState('');
  const genTimer = useRef(null);
  const pulseTimer = useRef(null);
  const toastTimer = useRef(null);

  // --- Generate Pine + JSON ---
  const doGenerate = () => {
    let pine = `//@version=5
indicator("Trade Watch: ${trigger} Trigger", overlay=true)
`;

    if (trigger === 'breakout') {
      pine += `len      = input.int(${Math.max(1, Number(breakoutLen) || 20)}, "Lookback Length", minval=1)
basisSrc = input.string("${breakoutBasis}", "Breakout Basis", options=["High","Close"])

// Select prior series (exclude current bar)
priorSeries = basisSrc == "High" ? high[1] : close[1]
level       = ta.highest(priorSeries, len)

// Trigger: close crosses above the level
trigger = ta.crossover(close, level)

// Plots
plot(level, "Prior " + basisSrc + " (" + str.tostring(len) + ")", color=color.red, linewidth=2)
plotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")

// Alert (webhook-safe: numbers unquoted, strings quoted)
alertcondition(trigger, title="breakout Trigger",
  message='{"symbol":"{{ticker}}","setup":"breakout","basis":"'+basisSrc+'","lookback":'+str.tostring(len)+',"price":{{close}},"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'breakdown') {
      pine += `len      = input.int(${Math.max(1, Number(breakdownLen) || 20)}, "Lookback Length", minval=1)
basisSrc = input.string("${breakdownBasis}", "Breakdown Basis", options=["Low","Close"])

// Select prior series (exclude current bar)
priorSeries = basisSrc == "Low" ? low[1] : close[1]
level       = ta.lowest(priorSeries, len)

// Trigger: close crosses below the level
trigger = ta.crossunder(close, level)

// Plots
plot(level, "Prior " + basisSrc + " (" + str.tostring(len) + ")", color=color.blue, linewidth=2)
plotshape(trigger, location=location.abovebar, style=shape.labeldown, color=color.red, text="🚨")

// Alert (webhook-safe: numbers unquoted, strings quoted)
alertcondition(trigger, title="breakdown Trigger",
  message='{"symbol":"{{ticker}}","setup":"breakdown","basis":"'+basisSrc+'","lookback":'+str.tostring(len)+',"price":{{close}},"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'orh') {
      pine += `// Opening Range High - 5 minute window
var float or_high = na
var float or_low = na
var bool armed = false

// New session detection
is_new_session = ta.change(time("D"))
if is_new_session
    or_high := na
    or_low := na
    armed := false

// Opening window: first 5 minutes (9:30-9:35 ET)
session_start = hour == 9 and minute >= 30 and minute < 35
if session_start
    or_high := math.max(nz(or_high, high), high)
    or_low := math.min(nz(or_low, low), low)

// Arm after opening window closes
session_closed = hour == 9 and minute >= 35 and not na(or_high) and not armed
if session_closed
    armed := true

// Trigger: break above OR high (one-shot)
trigger = armed and high > or_high and not na(or_high)
if trigger
    armed := false

// Plots
plot(or_high, "OR High", color=color.blue, linewidth=2)
plot(or_low, "OR Low", color=color.red, linewidth=1)
plotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")

// Alert
alertcondition(trigger, title="orh Trigger",
  message='{"symbol":"{{ticker}}","setup":"orh","orHigh":'+str.tostring(or_high)+',"orLow":'+str.tostring(or_low)+',"price":{{close}},"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'orl') {
      pine += `// Opening Range Low - 5 minute window
var float or_high = na
var float or_low = na
var bool armed = false

// New session detection
is_new_session = ta.change(time("D"))
if is_new_session
    or_high := na
    or_low := na
    armed := false

// Opening window: first 5 minutes (9:30-9:35 ET)
session_start = hour == 9 and minute >= 30 and minute < 35
if session_start
    or_high := math.max(nz(or_high, high), high)
    or_low := math.min(nz(or_low, low), low)

// Arm after opening window closes
session_closed = hour == 9 and minute >= 35 and not na(or_low) and not armed
if session_closed
    armed := true

// Trigger: break below OR low (one-shot)
trigger = armed and low < or_low and not na(or_low)
if trigger
    armed := false

// Plots
plot(or_high, "OR High", color=color.blue, linewidth=1)
plot(or_low, "OR Low", color=color.red, linewidth=2)
plotshape(trigger, location=location.abovebar, style=shape.labeldown, color=color.red, text="🚨")

// Alert
alertcondition(trigger, title="orl Trigger",
  message='{"symbol":"{{ticker}}","setup":"orl","orHigh":'+str.tostring(or_high)+',"orLow":'+str.tostring(or_low)+',"price":{{close}},"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
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
plotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")

alertcondition(trigger, title="range_breakout Trigger",
  message='{"symbol":"{{ticker}}","setup":"range_breakout","price":{{close}},"rangeHigh":'+str.tostring(range_high)+',"rangeLow":'+str.tostring(range_low)+',"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'bullish_reversal') {
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
plotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")

alertcondition(trigger, title="bullish_reversal Trigger",
  message='{"symbol":"{{ticker}}","setup":"bullish_reversal","price":{{close}},"rangeHigh":'+str.tostring(range_high)+',"rangeLow":'+str.tostring(range_low)+',"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'bearish_reversal') {
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
breakdown_condition = range_established and low < range_low - syminfo.mintick
invalidated         = range_established and high > range_high

if breakdown_condition or invalidated
    armed      := false
    range_high := na
    range_low  := na

plot(range_established ? range_high : na, "Range High", color=color.blue)
plot(range_established ? range_low  : na, "Range Low",  color=color.red)

trigger = breakdown_condition
plotshape(trigger, location=location.abovebar, style=shape.labeldown, color=color.red, text="🚨")

alertcondition(trigger, title="bearish_reversal Trigger",
  message='{"symbol":"{{ticker}}","setup":"bearish_reversal","price":{{close}},"rangeHigh":'+str.tostring(range_high)+',"rangeLow":'+str.tostring(range_low)+',"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'ma10') {
      pine += `ma = ta.sma(close, 10)
trigger = ta.crossunder(close, ma)
plot(ma, "SMA10", color=color.blue)
plotshape(trigger, location=location.abovebar, style=shape.labeldown, color=color.red, text="🚨")
alertcondition(trigger, title="ma10 Trigger",
  message='{"symbol":"{{ticker}}","setup":"ma10_breakdown","maLen":10,"price":{{close}},"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    } else if (trigger === 'ma50') {
      pine += `ma = ta.sma(close, 50)
trigger = ta.crossunder(close, ma)
plot(ma, "SMA50", color=color.purple)
plotshape(trigger, location=location.abovebar, style=shape.labeldown, color=color.red, text="🚨")
alertcondition(trigger, title="ma50 Trigger",
  message='{"symbol":"{{ticker}}","setup":"ma50_breakdown","maLen":50,"price":{{close}},"volume":{{volume}},"timestamp":"{{time}}","interval":"{{interval}}"}')
`;
    }

    const sym = (ticker?.toUpperCase() || '{{ticker}}');
    const json = `{
  "symbol": "${sym}",
  "setup": "${trigger}",
  "price": {{close}},
  "volume": {{volume}},
  "timestamp": "{{time}}",
  "interval": "{{interval}}"
}`;

    setPineCode(pine.trim());
    setWebhookJson(json);

    // subtle pulse
    setJustUpdated(true);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setJustUpdated(false), 900);
  };

  // Always auto-generate (debounced) on any change
  useEffect(() => {
    clearTimeout(genTimer.current);
    genTimer.current = setTimeout(doGenerate, 150);
    return () => clearTimeout(genTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, trigger, breakoutBasis, breakoutLen, breakdownBasis, breakdownLen]);

  useEffect(() => {
    const getExplanation = () => {
      switch (trigger) {
        case 'breakout':
          return `Closes above the prior ${breakoutLen}-bar ${breakoutBasis.toLowerCase()} (excludes current bar) for a classic, cleaner breakout.`;
        case 'breakdown':
          return `Closes below the prior ${breakdownLen}-bar ${breakdownBasis.toLowerCase()} (excludes current bar) for a classic, cleaner breakdown.`;
        case 'orh':
          return 'Locks the 5-minute opening window (9:30-9:35 ET), then fires intrabar on a break of the OR High (one-shot).';
        case 'orl':
          return 'Locks the 5-minute opening window (9:30-9:35 ET), then fires intrabar on a break of the OR Low (one-shot).';
        case 'range_breakout':
          return '3 red then a green reversal. Armed on the green; fires intrabar on a break above its high.';
        case 'bullish_reversal':
          return '3 red candles then 1 green; once armed, fires intrabar on a break above the green candle high (one-shot).';
        case 'bearish_reversal':
          return '3 red candles then 1 green; once armed, fires intrabar on a break below the range low (one-shot).';
        case 'ma10':
          return 'Triggers when price breaks below the 10-period SMA to flag short-term weakness.';
        case 'ma50':
          return 'Triggers when price breaks below the 50-period SMA to flag higher-timeframe weakness.';
        default:
          return '';
      }
    };
    setExplanation(getExplanation());
  }, [trigger, breakoutBasis, breakoutLen, breakdownBasis, breakdownLen]);

  // Hotkey: Cmd/Ctrl+Enter → show toast (you don't need to click)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerateClick();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleGenerateClick = () => {
    // Codes already auto-regenerate; just reassure
    setToast("You don't need to click Generate — code updates automatically ✅");
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1600);
  };

  return (
    <>
      <Head>
        <title>TAKE THE MARKETS WITH YOU</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root { --card:#eef2f7; --ink:#0b0c0e; --muted:#6b7280; }
          body {
            margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
            background:#fff; color:var(--ink);
          }
          a { color:#1d4ed8; text-decoration:none; } a:hover{text-decoration:underline;}
          .container { padding:2rem; max-width:900px; margin:0 auto; }

          /* Sticky action bar: full-width inside container (no shrink) */
          .actionbar {
            position: sticky; top:0; z-index: 20;
            display:flex; gap:10px; align-items:center;
            padding:10px 0; margin:0 0 14px 0;
            background:#ffffffF2; /* subtle */
            border-bottom:1px solid #e5e7eb;
          }
          .actionbar input, .actionbar select {
            padding:10px 12px; font-size:16px; border:1px solid #d1d5db; border-radius:6px; background:#fff;
          }
          .generate {
            padding:10px 18px; font-size:16px; cursor:pointer; background:#0ea5e9; color:#fff; border:none; border-radius:8px;
          }
          .pulse {
            font-size:12px; color:#10b981; opacity:0; transition:opacity .25s ease; margin-left:6px;
          }
          .pulse.show { opacity:1; }

          .toast {
            position: fixed; left: 50%; transform: translateX(-50%);
            bottom: 24px; z-index: 50;
            background:#111; color:#fff; padding:10px 14px; border-radius:8px; font-size:14px;
            box-shadow: 0 8px 20px rgba(0,0,0,.25);
          }

          .info { margin:14px 0 18px; font-size:16px; background: var(--card); padding:12px; border-radius:8px; border:1px solid #e5e7eb; }
          .section-title { font-size:24px; margin:24px 0 8px; }
          .code-wrap { position:relative; }
          .copy-btn {
            position:absolute; top:10px; right:10px; font-size:13px; padding:6px 10px; background:#111; color:#fff; border:none; cursor:pointer; border-radius:6px;
          }
          .copied { position:absolute; top:10px; right:84px; opacity:0; transition:opacity .3s; font-size:13px; color:#111; }
          pre {
            background:#0b1021; color:#d1e9ff; padding:1rem; border-radius:8px;
            overflow:auto; max-height:300px; font-size:14px; margin:0;
          }
          code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }

          @media (max-width: 820px){
            .actionbar { flex-wrap: wrap; }
          }
        `}</style>
      </Head>

      <div className="container">
        {/* Top line */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
          <div style={{fontSize:14, color:'#6b7280'}}>
            a tool by <a href="https://x.com/philoinvestor" target="_blank" rel="noreferrer">@philoinvestor</a>
          </div>
          <a
            href="https://forms.gle/e9yVXHze5MnuKqM68"
            target="_blank" rel="noreferrer"
            style={{padding:'10px 14px', fontSize:15, fontWeight:600, borderRadius:8, border:'1px solid #d1d5db', background:'#f3f4f6', color:'#111'}}
          >
            Join the Co-Trader 3000 waitlist
          </a>
        </div>

        <h1 style={{margin:'6px 0 6px'}}>TAKE THE MARKETS WITH YOU</h1>

        {/* Sticky Action Bar (not shrunken) */}
        <div className="actionbar">
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="Ticker (e.g. AAPL)"
            style={{ flex:'1 1 200px' }}
          />
          <select value={trigger} onChange={e => setTrigger(e.target.value)} style={{ minWidth:220 }}>
            <option value="breakout">Breakout</option>
            <option value="breakdown">Breakdown</option>
            <option value="orh">Opening Range High</option>
            <option value="orl">Opening Range Low</option>
            <option value="range_breakout">Range Breakout</option>
            <option value="bullish_reversal">Bullish Reversal</option>
            <option value="bearish_reversal">Bearish Reversal</option>
            <option value="ma10">MA10 Breakdown</option>
            <option value="ma50">MA50 Breakdown</option>
          </select>

          {trigger === 'breakout' && (
            <>
              <select value={breakoutBasis} onChange={e => setBreakoutBasis(e.target.value)} title="Breakout Basis" style={{ minWidth:140 }}>
                <option value="High">High</option>
                <option value="Close">Close</option>
              </select>
              <select
                value={breakoutLen}
                onChange={e => setBreakoutLen(parseInt(e.target.value || '20', 10))}
                title="Lookback"
                style={{ minWidth:90 }}
              >
                {[10,15,20,30,50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </>
          )}

          {trigger === 'breakdown' && (
            <>
              <select value={breakdownBasis} onChange={e => setBreakdownBasis(e.target.value)} title="Breakdown Basis" style={{ minWidth:140 }}>
                <option value="Low">Low</option>
                <option value="Close">Close</option>
              </select>
              <select
                value={breakdownLen}
                onChange={e => setBreakdownLen(parseInt(e.target.value || '20', 10))}
                title="Lookback"
                style={{ minWidth:90 }}
              >
                {[10,15,20,30,50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </>
          )}

          <button className="generate" onClick={handleGenerateClick} title="No need to click — it auto-updates">
            Generate
          </button>

          <span className={`pulse ${justUpdated ? 'show' : ''}`}>{justUpdated ? 'Updated ✓' : ''}</span>
        </div>

        <div className="info">
          <strong>ℹ️ Strategy:</strong> {explanation}
        </div>

        <div style={{ marginTop: 12 }}>
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

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// Keep page dynamic to avoid any SSR hiccups with heavy client visuals
export async function getServerSideProps() {
  return { props: {} };
}
