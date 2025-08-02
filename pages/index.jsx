import React, { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [copied, setCopied] = useState(false);

  const strategyDescriptions = {
    breakout: "Breakout alert when price closes above the highest high over the last 20 candles.",
    retest: "Retest alert when price dips below a level and closes back above it, indicating reclaim.",
    hhhl: "Trend alert when price makes a higher high and higher low, showing upward structure.",
    ma10: "Triggers when price breaks below the 10-period moving average.",
    ma50: "Triggers when price breaks below the 50-period moving average.",
    volumeSpike: "Alerts when volume spikes 2x above the 20-bar average volume.",
  };

  const generate = () => {
    let pine = '';
    switch (trigger) {
      case 'breakout':
        pine = `//@version=5
indicator("Trade Watch: Breakout", overlay=true)
resistance = ta.highest(high, 20)
breakout = close > resistance
plotshape(breakout, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(breakout, title="Breakout Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"breakout","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        break;
      case 'retest':
        pine = `//@version=5
indicator("Trade Watch: Retest", overlay=true)
support = ta.lowest(low, 20)
reclaim = low < support and close > support
plotshape(reclaim, location=location.belowbar, style=shape.labelup, color=color.orange, text="✅")
alertcondition(reclaim, title="Retest Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"retest","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        break;
      case 'hhhl':
        pine = `//@version=5
indicator("Trade Watch: HH/HL", overlay=true)
hh = high > high[1] and low > low[1]
plotshape(hh, location=location.belowbar, style=shape.labelup, color=color.purple, text="📈")
alertcondition(hh, title="HH/HL Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"hhhl","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        break;
      case 'ma10':
        pine = `//@version=5
indicator("Trade Watch: MA10 Breakdown", overlay=true)
ma = ta.sma(close, 10)
breakdown = close < ma
plotshape(breakdown, location=location.abovebar, style=shape.labeldown, color=color.red, text="⬇️")
alertcondition(breakdown, title="MA10 Breakdown", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"ma10","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        break;
      case 'ma50':
        pine = `//@version=5
indicator("Trade Watch: MA50 Breakdown", overlay=true)
ma = ta.sma(close, 50)
breakdown = close < ma
plotshape(breakdown, location=location.abovebar, style=shape.labeldown, color=color.red, text="⬇️")
alertcondition(breakdown, title="MA50 Breakdown", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"ma50","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        break;
      case 'volumeSpike':
        pine = `//@version=5
indicator("Trade Watch: Volume Spike", overlay=true)
avgVol = ta.sma(volume, 20)
spike = volume > avgVol * 2
plotshape(spike, location=location.belowbar, style=shape.labelup, color=color.teal, text="💥")
alertcondition(spike, title="Volume Spike", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"volumeSpike","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;
        break;
      default:
        pine = '// Select a valid trigger.';
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
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Helvetica, sans-serif", maxWidth: 900, margin: "auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Plan Trader – Trade Watch Setup</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          placeholder="Ticker (e.g. AAPL)"
          style={{ padding: "0.5rem", fontSize: "1rem", width: "200px", marginRight: "1rem" }}
        />
        <select
          value={trigger}
          onChange={e => setTrigger(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        >
          <option value="breakout">Breakout</option>
          <option value="retest">Retest</option>
          <option value="hhhl">HH/HL</option>
          <option value="ma10">MA10 Breakdown</option>
          <option value="ma50">MA50 Breakdown</option>
          <option value="volumeSpike">Volume Spike</option>
        </select>
        <button
          onClick={generate}
          style={{ marginLeft: "1rem", padding: "0.5rem 1rem", fontSize: "1rem" }}
        >Generate</button>
      </div>

      <div style={{ fontSize: "0.95rem", marginBottom: "1.5rem", color: "#444" }}>
        <strong>Explanation:</strong> {strategyDescriptions[trigger] || "—"}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h2>Pine Script</h2>
        <pre style={{ background: "#f0f0f0", padding: "1rem", overflowX: "auto" }}>{pineCode}</pre>
        <button
          onClick={() => handleCopy(pineCode)}
          style={{ marginTop: "0.5rem", padding: "0.4rem 1rem", fontSize: "0.9rem" }}
        >📋 Copy Pine Script</button>
      </div>

      <div>
        <h2>Webhook JSON</h2>
        <pre style={{ background: "#f9f9f9", padding: "1rem", overflowX: "auto" }}>{webhookJson}</pre>
        <button
          onClick={() => handleCopy(webhookJson)}
          style={{ marginTop: "0.5rem", padding: "0.4rem 1rem", fontSize: "0.9rem" }}
        >📋 Copy Webhook JSON</button>
        {copied && <span style={{ marginLeft: "1rem", color: "green" }}>Copied ✅</span>}
      </div>
    </div>
  );
}
