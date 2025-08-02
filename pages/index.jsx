import React, { useState, useEffect } from 'react';
import Head from 'next/head';

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
          return 'Detects if price breaks above the highest high over the last 20 candles. Useful for momentum breakout strategies.';
        case 'retest':
          return 'Looks for a bullish retest: candle closes above resistance, then price returns and bounces off that level.';
        case 'hhhl':
          return 'Tracks higher-high/higher-low structure over 5 candles. Helps identify sustained uptrends.';
        case 'ma10':
          return 'Triggers when the price breaks below the 10-period moving average. Useful for detecting short-term weakness.';
        case 'ma50':
          return 'Triggers when the price breaks below the 50-period moving average. Highlights longer-term trend shifts.';
        default:
          return '';
      }
    };
    setExplanation(getExplanation());
  }, [trigger]);

  const generate = () => {
    let pine = `//@version=5\nindicator("Trade Watch: ${trigger} Trigger", overlay=true)\n`;

    if (trigger === 'breakout') {
      pine += `resistance = ta.highest(high, 20)\ntrigger = close > resistance\n`;
    } else if (trigger === 'retest') {
      pine += `resistance = ta.highest(high, 20)\nbroken = close[1] > resistance[1]\nretest = close < resistance and close > open\ntrigger = broken and retest\n`;
    } else if (trigger === 'hhhl') {
      pine += `hh = high > high[1] and high[1] > high[2]\nhl = low > low[1] and low[1] > low[2]\ntrigger = hh and hl\n`;
    } else if (trigger === 'ma10') {
      pine += `ma = ta.sma(close, 10)\ntrigger = close < ma\n`;
    } else if (trigger === 'ma50') {
      pine += `ma = ta.sma(close, 50)\ntrigger = close < ma\n`;
    }

    pine += `\nplotshape(trigger, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")\nalertcondition(trigger, title="${trigger} Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"${trigger}","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;

    const json = {
      userId: "anton123",
      symbol: ticker.toUpperCase(),
      setup: trigger,
      price: "{{close}}",
      volume: "{{volume}}",
      timestamp: "{{time}}"
    };

    setPineCode(pine.trim());
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
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23000\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPositionX: 'calc(100% - 10px)',
              backgroundPositionY: 'center',
              backgroundSize: '16px',
              flex: '1 1 200px',
              minWidth: '220px'
            }}
          >
            <option value="breakout">Breakout</option>
            <option value="retest">Retest</option>
            <option value="hhhl">HH/HL Structure</option>
            <option value="ma10">MA10 Breakdown</option>
            <option value="ma50">MA50 Breakdown</option>
          </select>
          <button
            onClick={generate}
            style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', background: '#111', color: '#fff', border: 'none' }}
          >
            🚀 Generate
          </button>
        </div>

        <div style={{ marginBottom: '2rem', fontSize: '16px', background: '#eef2f5', padding: '1rem', borderRadius: '6px' }}>
          <strong>ℹ️ Strategy:</strong> {explanation}
        </div>

        {/* Pine Script Section */}
        <h2 style={{ fontSize: '24px' }}>📜 Pine Script</h2>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pineCode);
              const el = document.getElementById('pine-copied');
              el.style.opacity = 1;
              setTimeout(() => (el.style.opacity = 0), 1500);
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
              borderRadius: '4px'
            }}
          >
            Copy
          </button>
          <span id="pine-copied" style={{ position: 'absolute', top: '10px', right: '80px', opacity: 0, transition: 'opacity 0.3s ease', fontSize: '14px' }}>
            ✅ Copied!
          </span>
          <pre style={{ background: '#f0f0f0', padding: '1rem', overflowX: 'auto', fontSize: '15px' }}>
            <code>{pineCode}</code>
          </pre>
        </div>

        {/* Webhook JSON Section */}
        <h2 style={{ fontSize: '24px' }}>📦 Webhook JSON</h2>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(webhookJson);
              const el = document.getElementById('json-copied');
              el.style.opacity = 1;
              setTimeout(() => (el.style.opacity = 0), 1500);
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
              borderRadius: '4px'
            }}
          >
            Copy
          </button>
          <span id="json-copied" style={{ position: 'absolute', top: '10px', right: '80px', opacity: 0, transition: 'opacity 0.3s ease', fontSize: '14px' }}>
            ✅ Copied!
          </span>
          <pre style={{ background: '#f9f9f9', padding: '1rem', overflowX: 'auto', fontSize: '15px' }}>
            <code>{webhookJson}</code>
          </pre>
        </div>
      </div>
    </>
  );
}
