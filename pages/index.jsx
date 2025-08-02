import React, { useState } from 'react';
import './styles.css';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [copied, setCopied] = useState(false);

  const descriptions = {
    breakout: 'This script detects breakouts by comparing the current close to the highest high of the last 20 bars. It sends a webhook alert when the price breaks resistance.',
    retest: 'This script identifies retests by detecting when price moves back near a previous high after a breakout. It triggers alerts when that retest level is touched.',
    hhhl: 'This script monitors higher highs and higher lows in an uptrend and alerts when structure confirms continuation. Good for trend-following entries.'
  };

  const generate = () => {
    const pine = `//@version=5
indicator("Trade Watch: ${trigger.charAt(0).toUpperCase() + trigger.slice(1)} Trigger", overlay=true)
resistance = ta.highest(high, 20)
breakout = close > resistance
plotshape(breakout, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(breakout, title="Breakout Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"${trigger}","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;

    const json = {
      userId: "anton123",
      symbol: ticker.toUpperCase(),
      setup: trigger,
      price: "{{close}}",
      volume: "{{volume}}",
      timestamp: "{{time}}"
    };

    setPineCode(pine);
    setWebhookJson(JSON.stringify(json, null, 2));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: 'auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Plan Trader – Trade Watch Setup</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          placeholder="Ticker (e.g. AAPL)"
          style={{ fontSize: '1rem', padding: '0.5rem', flex: '1 0 150px' }}
        />
        <select
          value={trigger}
          onChange={e => setTrigger(e.target.value)}
          style={{ fontSize: '1rem', padding: '0.5rem' }}
        >
          <option value="breakout">Breakout</option>
          <option value="retest">Retest</option>
          <option value="hhhl">HH/HL</option>
        </select>
        <button
          onClick={generate}
          style={{ fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Generate
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 45%', background: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Pine Script</h2>
          <pre style={{ overflowX: 'auto', fontSize: '0.9rem' }}>{pineCode}</pre>
          <button
            onClick={() => handleCopy(pineCode)}
            style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
          >📋 Copy</button>
          {copied && <div style={{ color: 'green', fontSize: '0.8rem' }}>✅ Copied to clipboard</div>}
        </div>

        <div style={{ flex: '1 1 45%', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Webhook JSON</h2>
          <pre style={{ overflowX: 'auto', fontSize: '0.9rem' }}>{webhookJson}</pre>
          <button
            onClick={() => handleCopy(webhookJson)}
            style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
          >📋 Copy</button>
        </div>
      </div>

      <div style={{ marginTop: '1rem', background: '#eaf4ff', padding: '1rem', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🧠 Strategy Logic</h3>
        <p style={{ fontSize: '0.95rem' }}>{descriptions[trigger]}</p>
      </div>
    </div>
  );
}
