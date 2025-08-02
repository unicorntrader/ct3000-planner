
import React, { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');

  const generate = () => {
    const pine = `//@version=5
indicator("Trade Watch: Breakout Trigger", overlay=true)
resistance = ta.highest(high, 20)
breakout = close > resistance
plotshape(breakout, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(breakout, title="Breakout Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"breakout","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;

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

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Plan Trader - Trade Watch Setup</h1>
      <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="Ticker (e.g. AAPL)" />
      <select value={trigger} onChange={e => setTrigger(e.target.value)}>
        <option value="breakout">Breakout</option>
        <option value="retest">Retest</option>
        <option value="hhhl">HH/HL</option>
      </select>
      <button onClick={generate}>Generate</button>

      <h2>Pine Script</h2>
      <pre style={{ background: "#f0f0f0", padding: "1rem" }}>{pineCode}</pre>

      <h2>Webhook JSON</h2>
      <pre style={{ background: "#f9f9f9", padding: "1rem" }}>{webhookJson}</pre>
    </div>
  );
}
