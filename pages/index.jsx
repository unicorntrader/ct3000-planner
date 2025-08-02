import React, { useState } from 'react';
import { Copy } from 'lucide-react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [trigger, setTrigger] = useState('breakout');
  const [pineCode, setPineCode] = useState('');
  const [webhookJson, setWebhookJson] = useState('');
  const [explanation, setExplanation] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let pine = '';
    let json = {};
    let explain = '';

    switch (trigger) {
      case 'breakout':
        pine = `//@version=5
indicator("Trade Watch: Breakout Trigger", overlay=true)
resistance = ta.highest(high, 20)
breakout = close > resistance
plotshape(breakout, location=location.belowbar, style=shape.labelup, color=color.green, text="🚨")
alertcondition(breakout, title="Breakout Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"breakout","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')`;
        explain = 'This script triggers an alert when the current price breaks above the highest high of the past 20 candles — a simple breakout signal. Ideal for momentum-based entries.';
        break;

      case 'retest':
        pine = `//@version=5
indicator("Trade Watch: Retest Trigger", overlay=true)
support = ta.lowest(low, 20)
retest = close < support * 1.02 and close > support
plotshape(retest, location=location.belowbar, style=shape.labelup, color=color.orange, text="↩️")
alertcondition(retest, title="Retest Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"retest","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')`;
        explain = 'Triggers when price approaches support (within 2% above the lowest low of last 20 candles), suggesting a retest. Often used to catch reversals or trend continuation zones.';
        break;

      case 'hhhl':
        pine = `//@version=5
indicator("Trade Watch: HH/HL Trigger", overlay=true)
hh = high > high[1] and high[1] > high[2]
hl = low > low[1] and low[1] > low[2]
hhhl = hh and hl
plotshape(hhhl, location=location.belowbar, style=shape.labelup, color=color.blue, text="🔼")
alertcondition(hhhl, title="HH/HL Trigger", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"hhhl","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')`;
        explain = 'Triggers on higher highs and higher lows — a classic trend confirmation pattern. Useful for traders riding an existing uptrend.';
        break;

      case 'ma10':
        pine = `//@version=5
indicator("Trade Watch: MA10 Breakdown", overlay=true)
ma10 = ta.sma(close, 10)
breakdown = close < ma10
plotshape(breakdown, location=location.abovebar, style=shape.labeldown, color=color.red, text="⬇️")
alertcondition(breakdown, title="MA10 Breakdown", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"ma10","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')`;
        explain = 'Triggers when price breaks below the 10-period moving average — often used as a momentum fade signal in fast-moving markets.';
        break;

      case 'ma50':
        pine = `//@version=5
indicator("Trade Watch: MA50 Breakdown", overlay=true)
ma50 = ta.sma(close, 50)
breakdown = close < ma50
plotshape(breakdown, location=location.abovebar, style=shape.labeldown, color=color.red, text="⬇️")
alertcondition(breakdown, title="MA50 Breakdown", message='{"userId":"anton123","symbol":"{{ticker}}","setup":"ma50","price":{{close}},"volume":{{volume}},"timestamp":"{{time}}"}')`;
        explain = 'Triggers when price breaks below the 50-period moving average — often used by swing traders to detect medium-term trend breaks.';
        break;
    }

    json = {
      userId: "anton123",
      symbol: ticker.toUpperCase(),
      setup: trigger,
      price: "{{close}}",
      volume: "{{volume}}",
      timestamp: "{{time}}"
    };

    setPineCode(pine);
    setWebhookJson(JSON.stringify(json, null, 2));
    setExplanation(explain);
    setCopied(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Inter, sans-serif", maxWidth: 900, margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Plan Trader - Trade Watch Setup</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="Ticker (e.g. AAPL)" style={{ padding: '0.5rem', fontSize: '1rem', minWidth: 150 }} />

        <select value={trigger} onChange={e => setTrigger(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem' }}>
          <option value="breakout">Breakout</option>
          <option value="retest">Retest</option>
          <option value="hhhl">Higher High / Higher Low</option>
          <option value="ma10">MA10 Breakdown</option>
          <option value="ma50">MA50 Breakdown</option>
        </select>

        <button onClick={generate} style={{ padding: '0.5rem 1rem', fontSize: '1rem', background: '#111', color: '#fff' }}>Generate</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2>Pine Script</h2>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#f0f0f0', padding: '1rem', overflowX: 'auto' }}>{pineCode}</pre>
            <button onClick={() => handleCopy(pineCode)} style={{ position: 'absolute', top: 10, right: 10, border: 'none', background: 'none' }}>
              <Copy size={18} />
            </button>
            {copied && <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 12, color: 'black' }}>Copied to clipboard</div>}
          </div>
        </div>

        <div>
          <h2>Webhook JSON</h2>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#f9f9f9', padding: '1rem', overflowX: 'auto' }}>{webhookJson}</pre>
            <button onClick={() => handleCopy(webhookJson)} style={{ position: 'absolute', top: 10, right: 10, border: 'none', background: 'none' }}>
              <Copy size={18} />
            </button>
          </div>
        </div>

        <div>
          <h2>What this strategy does</h2>
          <div style={{ background: '#fffef4', border: '1px solid #ddd', padding: '1rem', fontSize: '1rem', lineHeight: 1.5 }}>{explanation}</div>
        </div>
      </div>
    </div>
  );
}
