import React, { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [explanation, setExplanation] = useState('');

  const generate = () => {
    let pine = '';
    let explanationText = '';

    switch (trigger) {
      case 'breakout':
        pine = `//@version=5
indicator("Trade Watch: Breakout Trigger", overlay=true)
resistance = ta.highest(high, 20)
breakout = close > resistance
plotshape(breakout, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(breakout, title="Breakout Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"breakout","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;

        explanationText = `Breakout Trigger: Detects when price closes above the highest high of the last 20 candles on the user's chart timeframe.

⚠️ Timeframe note: If you're on the 5-min chart, this means the last 100 minutes. On the daily chart, it's the last 20 days. Pine Script inherits the timeframe from the chart.`;
        break;
      case 'retest':
        pine = `//@version=5
indicator("Trade Watch: Retest Trigger", overlay=true)
support = ta.lowest(low, 20)
retest = close < support
plotshape(retest, location=location.abovebar, style=shape.labeldown, color=color.red, text="🔻")
alertcondition(retest, title="Retest Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"retest","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;

        explanationText = `Retest Trigger: Detects when price closes below the lowest low of the last 20 candles, signaling potential breakdown or retest of a previous support.

⚠️ Timeframe note: Inherits from the chart — works on any timeframe.`;
        break;
      case 'hhhl':
        pine = `//@version=5
indicator("Trade Watch: HH/HL Structure", overlay=true)
hh = high > high[1] and high[1] > high[2]
hl = low > low[1] and low[1] > low[2]
trendStructure = hh and hl
plotshape(trendStructure, location=location.belowbar, style=shape.triangleup, color=color.blue, text="📈")
alertcondition(trendStructure, title="HH/HL Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"hhhl","price":{{close}},"volume":{{volume}},"timestamp":"{{time"}}')`;

        explanationText = `HH/HL Trigger: Detects a trend continuation pattern — when both higher highs and higher lows form.

⚠️ Timeframe note: Structure is checked based on bar-to-bar highs/lows — applies to the chart timeframe.`;
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
    setExplanation(explanationText);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem' }}>Plan Trader - Trade Watch Setup</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input style={{ padding: '0.5rem', flex: 1 }} value={ticker} onChange={e => setTicker(e.target.value)} placeholder="Ticker (e.g. AAPL)" />
        <select style={{ padding: '0.5rem' }} value={trigger} onChange={e => setTrigger(e.target.value)}>
          <option value="breakout">Breakout</option>
          <option value="retest">Retest</option>
          <option value="hhhl">HH/HL</option>
        </select>
        <button onClick={generate} style={{ padding: '0.5rem 1rem' }}>Generate</button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h2>Pine Script</h2>
          <pre style={{ background: "#f0f0f0", padding: "1rem", whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{pineCode}</pre>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Strategy Explanation</h2>
          <pre style={{ background: "#e0f7ff", padding: "1rem", whiteSpace: 'pre-wrap' }}>{explanation}</pre>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Webhook JSON</h2>
        <pre style={{ background: "#f9f9f9", padding: "1rem", whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{webhookJson}</pre>
      </div>
    </div>
  );
}
