import React, { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const strategyDescriptions = {
    breakout: "Triggers when price breaks out above the highest high of the last 20 bars.",
    retest: "(To be implemented) Triggers when price retests a defined level after breakout.",
    hhhl: "(To be implemented) Triggers when price forms higher highs and higher lows, suggesting uptrend continuation."
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Helvetica, sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>📈 Plan Trader – Trade Watch Setup</h1>

      <label style={{ fontWeight: "bold" }}>Ticker:</label><br />
      <input 
        value={ticker} 
        onChange={e => setTicker(e.target.value)} 
        placeholder="e.g. AAPL" 
        style={{ padding: "0.5rem", fontSize: "1rem", width: "100%", marginBottom: "1rem" }} 
      />

      <label style={{ fontWeight: "bold" }}>Trigger Type:</label><br />
      <select 
        value={trigger} 
        onChange={e => setTrigger(e.target.value)} 
        style={{ padding: "0.5rem", fontSize: "1rem", width: "100%", marginBottom: "0.5rem" }}
      >
        <option value="breakout">Breakout</option>
        <option value="retest">Retest</option>
        <option value="hhhl">HH/HL</option>
      </select>
      <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1rem" }}>{strategyDescriptions[trigger]}</div>

      <button 
        onClick={generate} 
        style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "2rem" }}
      >Generate</button>

      <h2 style={{ fontSize: "1.25rem" }}>📜 Pine Script</h2>
      <pre style={{ background: "#f0f0f0", padding: "1rem", whiteSpace: "pre-wrap", wordBreak: "break-word", position: "relative" }}>
        <button onClick={() => copyToClipboard(pineCode)} style={{ position: "absolute", top: 10, right: 10, fontSize: "0.85rem", background: copied ? "#000" : "#eee", color: copied ? "#fff" : "#000", padding: "0.25rem 0.5rem", border: "none", cursor: "pointer" }}>{copied ? "✔ Copied" : "Copy"}</button>
        {pineCode}
      </pre>

      <h2 style={{ fontSize: "1.25rem", marginTop: "2rem" }}>🔗 Webhook JSON</h2>
      <pre style={{ background: "#f9f9f9", padding: "1rem", whiteSpace: "pre-wrap", wordBreak: "break-word", position: "relative" }}>
        <button onClick={() => copyToClipboard(webhookJson)} style={{ position: "absolute", top: 10, right: 10, fontSize: "0.85rem", background: copied ? "#000" : "#eee", color: copied ? "#fff" : "#000", padding: "0.25rem 0.5rem", border: "none", cursor: "pointer" }}>{copied ? "✔ Copied" : "Copy"}</button>
        {webhookJson}
      </pre>
    </div>
  );
}
