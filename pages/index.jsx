import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');

  const router = useRouter();

  const generate = () => {
    const pine = `//@version=5
indicator("Trade Watch: ${trigger.charAt(0).toUpperCase() + trigger.slice(1)} Trigger", overlay=true)
resistance = ta.highest(high, 20)
${trigger} = close > resistance
plotshape(${trigger}, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(${trigger}, title="${trigger.charAt(0).toUpperCase() + trigger.slice(1)} Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"${trigger}","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')`;

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Plan Trader - Trade Watch Setup</h1>

      <input
        value={ticker}
        onChange={e => setTicker(e.target.value)}
        placeholder="Ticker (e.g. AAPL)"
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />

      <select
        value={trigger}
        onChange={e => setTrigger(e.target.value)}
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      >
        <option value="breakout">Breakout</option>
        <option value="retest">Retest</option>
        <option value="hhhl">HH/HL</option>
      </select>

      <button onClick={generate} style={{ marginRight: "1rem", padding: "0.5rem 1rem" }}>Generate</button>
      <button onClick={() => router.push('/console')} style={{ padding: "0.5rem 1rem" }}>Webhook Console</button>

      <h2 style={{ marginTop: "2rem" }}>Pine Script</h2>
      <button onClick={() => copyToClipboard(pineCode)} style={{ marginBottom: "0.5rem" }}>📋 Copy</button>
      <pre style={{ background: "#f0f0f0", padding: "1rem" }}>{pineCode}</pre>

      <h2 style={{ marginTop: "2rem" }}>Webhook JSON</h2>
      <button onClick={() => copyToClipboard(webhookJson)} style={{ marginBottom: "0.5rem" }}>📋 Copy</button>
      <pre style={{ background: "#f9f9f9", padding: "1rem" }}>{webhookJson}</pre>
    </div>
  );
}
