import React, { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let pine = '';
    let description = '';

    switch (trigger) {
      case 'breakout':
        pine = `//@version=5
indicator("Trade Watch: Breakout Trigger", overlay=true)
resistance = ta.highest(high, 20)
breakout = close > resistance
plotshape(breakout, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(breakout, title="Breakout Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"breakout","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        description = "Triggers when price breaks above the highest high of the last 20 candles. Used to catch momentum breakouts.";
        break;
      case 'retest':
        pine = `//@version=5
indicator("Trade Watch: Retest Trigger", overlay=true)
support = ta.lowest(low, 20)
retest = close < support and close > open
plotshape(retest, location=location.belowbar, style=shape.labelup, color=color.orange, text="🔄")
alertcondition(retest, title="Retest Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"retest","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        description = "Triggers when price briefly dips below recent support but closes higher — a classic retest setup.";
        break;
      case 'hhhl':
        pine = `//@version=5
indicator("Trade Watch: HH/HL Trigger", overlay=true)
highPrev = high[1]
lowPrev = low[1]
hhhl = high > highPrev and low > lowPrev
plotshape(hhhl, location=location.belowbar, style=shape.labelup, color=color.blue, text="📈")
alertcondition(hhhl, title="HH/HL Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"hhhl","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        description = "Triggers when both the high and low are higher than the previous candle — indicates an uptrend continuation.";
        break;
      default:
        break;
    }

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
    setCopied(false);
    setExplanation(description);
  };

  const [explanation, setExplanation] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Helvetica, sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Plan Trader - Trade Watch Setup</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input 
          value={ticker} 
          onChange={e => setTicker(e.target.value)} 
          placeholder="Ticker (e.g. AAPL)" 
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />

        <select 
          value={trigger} 
          onChange={e => setTrigger(e.target.value)} 
          style={{ padding: "0.5rem" }}
        >
          <option value="breakout">Breakout</option>
          <option value="retest">Retest</option>
          <option value="hhhl">HH/HL</option>
        </select>

        <button onClick={generate} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>Generate</button>
      </div>

      <p style={{ marginBottom: "2rem", fontStyle: "italic" }}>{explanation}</p>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <h2>Pine Script</h2>
          <pre style={{ background: "#f0f0f0", padding: "1rem", width: "350px", overflowX: "auto" }}>{pineCode}</pre>
          <button onClick={() => copyToClipboard(pineCode)} style={{ marginTop: "0.5rem" }}>📋 Copy</button>
        </div>

        <div>
          <h2>Webhook JSON</h2>
          <pre style={{ background: "#f9f9f9", padding: "1rem", width: "300px", overflowX: "auto" }}>{webhookJson}</pre>
          <button onClick={() => copyToClipboard(webhookJson)} style={{ marginTop: "0.5rem" }}>📋 Copy</button>
        </div>

        <div>
          <h2>Script Logic</h2>
          <pre style={{ background: "#eef9f5", padding: "1rem", width: "300px" }}>{explanation}</pre>
        </div>
      </div>

      {copied && <p style={{ color: "black", marginTop: "1rem" }}>✅ Copied to clipboard</p>}
    </div>
  );
}
