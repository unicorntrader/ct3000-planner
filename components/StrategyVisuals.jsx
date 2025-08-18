import React, { useState } from 'react';

export default function StrategyVisuals({ selected }) {
  const [selectedStrategy, setSelectedStrategy] = useState(selected || 'breakout');

  // If a parent passes `selected` (e.g., from index.jsx's `trigger`),
  // keep this component in sync with that selection.
  React.useEffect(() => {
    if (selected) setSelectedStrategy(selected);
  }, [selected]);

  const strategies = {
    breakout: {
      title: 'Breakout Strategy',
      description:
        'A breakout occurs when price decisively moves above a established resistance level (the highest point over the last 20 candles). This signals that buyers have overwhelmed sellers and momentum is shifting upward. The strategy is ideal for capturing the beginning of strong trending moves.',
      keyPoints: [
        'Identifies when price breaks above 20-period resistance',
        'Confirms buyer strength and momentum shift',
        'Best used in trending or consolidating markets',
        'Higher volume often confirms genuine breakouts',
      ],
      visual: (
        <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <polyline points="20,150 40,140 60,160 80,145 100,155 120,135 140,150 160,140 180,145" fill="none" stroke="#666" strokeWidth="2" />
          <line x1="20" y1="130" x2="280" y2="130" stroke="#ff4444" strokeWidth="2" strokeDasharray="5,5" />
          <text x="285" y="128" fontSize="11" fill="#ff4444">20-Period High</text>
          <polyline points="180,145 200,120 220,110 240,115 260,100 280,105" fill="none" stroke="#22c55e" strokeWidth="3" />
          <polygon points="200,120 195,125 205,125" fill="#22c55e" />
          <text x="205" y="115" fontSize="12" fill="#22c55e" fontWeight="bold">BREAKOUT!</text>
          <rect x="180" y="170" width="8" height="20" fill="#666" opacity="0.7"/>
          <rect x="200" y="160" width="8" height="30" fill="#22c55e" opacity="0.7"/>
          <rect x="220" y="165" width="8" height="25" fill="#22c55e" opacity="0.7"/>
          <text x="160" y="185" fontSize="10" fill="#666">Volume</text>
        </svg>
      )
    },

    retest: {
      title: 'Retest Strategy',
      description:
        'After price breaks above resistance, it often returns to "test" that same level, which now acts as support. A successful retest shows the breakout was genuine - buyers step in at the old resistance level, confirming it as new support. This provides a lower-risk entry point.',
      keyPoints: [
        'Waits for price to return to broken resistance level',
        'Confirms the level now acts as support',
        'Provides better risk/reward than buying the initial breakout',
        'Filters out false breakouts effectively',
      ],
      visual: (
        <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <polyline points="20,150 40,140 60,160 80,145 100,155 120,135 140,150" fill="none" stroke="#666" strokeWidth="2" />
          <polyline points="40,140 42,128 40,140" fill="none" stroke="#666" strokeWidth="2"/>
          <polyline points="120,135 122,128 120,135" fill="none" stroke="#666" strokeWidth="2"/>
          <polyline points="100,155 102,128 100,155" fill="none" stroke="#666" strokeWidth="2"/>
          <line x1="20" y1="130" x2="180" y2="130" stroke="#ff4444" strokeWidth="3"/>
          <text x="50" y="115" fontSize="11" fill="#ff4444" fontWeight="bold">RESISTANCE</text>
          <polyline points="140,150 160,120 180,110" fill="none" stroke="#22c55e" strokeWidth="3" />
          <text x="130" y="95" fontSize="11" fill="#22c55e" fontWeight="bold">1. BREAK!</text>
          <line x1="180" y1="130" x2="380" y2="130" stroke="#22c55e" strokeWidth="3"/>
          <text x="290" y="115" fontSize="11" fill="#22c55e" fontWeight="bold">NOW SUPPORT</text>
          <polyline points="180,110 200,125 230,132" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <text x="185" y="155" fontSize="11" fill="#f59e0b" fontWeight="bold">2. Retest</text>
          <polyline points="230,132 250,115 270,105 290,110 310,95" fill="none" stroke="#22c55e" strokeWidth="4" />
          <text x="270" y="85" fontSize="11" fill="#22c55e" fontWeight="bold">3. BOUNCE!</text>
          <circle cx="230" cy="132" r="6" fill="#22c55e" stroke="white" strokeWidth="2"/>
          <path d="M230,132 L230,145" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowup)"/>
          <rect x="175" y="125" width="10" height="10" fill="#ff4444"/>
          <rect x="185" y="125" width="10" height="10" fill="#22c55e"/>
          <text x="175" y="145" fontSize="8" fill="#666">Level Changes Role</text>
          <defs>
            <marker id="arrowup" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <polygon points="0 6, 4 0, 8 6" fill="#22c55e"/>
            </marker>
          </defs>
        </svg>
      )
    },

    hhhl: {
      title: 'Higher High / Higher Low Structure',
      description:
        'This pattern identifies a healthy uptrend by tracking consecutive higher highs and higher lows over 5 candles. Each peak is higher than the previous peak, and each valley is higher than the previous valley. This confirms sustained buying pressure and trend strength.',
      keyPoints: [
        'Confirms trend continuation and strength',
        'Each high exceeds the previous high',
        'Each low stays above the previous low',
        'Indicates consistent buying pressure',
      ],
      visual: (
        <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <polyline points="50,160 80,140 110,150 140,120 170,130 200,100 230,115 260,85 290,95" fill="none" stroke="#22c55e" strokeWidth="3" />
          <circle cx="80" cy="140" r="4" fill="#22c55e"/><circle cx="140" cy="120" r="4" fill="#22c55e"/><circle cx="200" cy="100" r="4" fill="#22c55e"/><circle cx="260" cy="85" r="4" fill="#22c55e"/>
          <circle cx="110" cy="150" r="4" fill="#3b82f6"/><circle cx="170" cy="130" r="4" fill="#3b82f6"/><circle cx="230" cy="115" r="4" fill="#3b82f6"/>
          <line x1="110" y1="150" x2="230" y2="115" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3"/>
          <text x="300" y="80" fontSize="12" fill="#22c55e" fontWeight="bold">Higher Highs</text>
          <text x="300" y="120" fontSize="12" fill="#3b82f6" fontWeight="bold">Higher Lows</text>
          <path d="M85,135 L135,115" stroke="#22c55e" strokeWidth="1" markerEnd="url(#arrowgreen)"/>
          <path d="M145,115 L195,95" stroke="#22c55e" strokeWidth="1" markerEnd="url(#arrowgreen)"/>
          <defs>
            <marker id="arrowgreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e"/>
            </marker>
          </defs>
        </svg>
      )
    },

    ma10: {
      title: 'MA10 Breakdown',
      description:
        'When price closes below the 10-period moving average, it signals potential short-term weakness. The MA10 acts as dynamic support in uptrends - when broken, it suggests momentum is shifting and a pullback or reversal may be beginning.',
      keyPoints: [
        'Detects short-term momentum shifts',
        '10-period MA acts as dynamic support/resistance',
        'Quick signal for trend weakness',
        'Often precedes larger corrections',
      ],
      visual: (
        <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <polyline points="20,120 40,110 60,105 80,100 100,95 120,100 140,95 160,100 180,105" fill="none" stroke="#22c55e" strokeWidth="2" />
          <polyline points="20,130 40,125 60,120 80,115 100,110 120,115 140,115 160,120 180,125 200,130 220,135 240,140 260,145" fill="none" stroke="#3b82f6" strokeWidth="3" />
          <polyline points="180,105 200,125 220,140 240,150 260,155" fill="none" stroke="#ef4444" strokeWidth="3" />
          <circle cx="200" cy="125" r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
          <text x="50" y="90" fontSize="12" fill="#22c55e">Price above MA10</text>
          <text x="270" y="120" fontSize="12" fill="#3b82f6">MA10</text>
          <text x="270" y="160" fontSize="12" fill="#ef4444" fontWeight="bold">Breakdown!</text>
          <path d="M180,80 L200,115" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowred)"/>
          <text x="130" y="75" fontSize="11" fill="#ef4444">Break below MA10</text>
          <defs>
            <marker id="arrowred" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444"/>
            </marker>
          </defs>
        </svg>
      )
    },

    ma50: {
      title: 'MA50 Breakdown',
      description:
        'A break below the 50-period moving average signals a more significant trend shift than shorter timeframes. The MA50 represents longer-term sentiment - when broken, it often indicates the start of a deeper correction or trend reversal.',
      keyPoints: [
        'Indicates longer-term trend weakness',
        'More significant than shorter MA breakdowns',
        'Often signals deeper corrections ahead',
        'Key level watched by institutional traders',
      ],
      visual: (
        <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <polyline points="20,140 40,130 60,125 80,120 100,115 120,110 140,105 160,100 180,95 200,100 220,105" fill="none" stroke="#22c55e" strokeWidth="2" />
          <polyline points="20,150 50,148 80,145 110,142 140,140 170,138 200,135 230,133 260,135 290,138" fill="none" stroke="#8b5cf6" strokeWidth="4" />
          <polyline points="220,105 240,120 260,135 280,150 300,160 320,165" fill="none" stroke="#dc2626" strokeWidth="4" />
          <circle cx="260" cy="135" r="8" fill="#dc2626" stroke="white" strokeWidth="3" />
          <text x="50" y="85" fontSize="12" fill="#22c55e">Long uptrend</text>
          <text x="300" y="125" fontSize="12" fill="#8b5cf6" fontWeight="bold">MA50</text>
          <text x="280" y="180" fontSize="12" fill="#dc2626" fontWeight="bold">Major Breakdown</text>
          <polygon points="240,60 250,80 230,80" fill="#fbbf24"/>
          <text x="210" y="55" fontSize="10" fill="#fbbf24">⚠️ Significant Signal</text>
          <rect x="20" y="20" width="60" height="15" fill="#22c55e" opacity="0.3"/>
          <text x="25" y="32" fontSize="10">Strong Trend</text>
          <rect x="260" y="20" width="60" height="15" fill="#dc2626" opacity="0.3"/>
          <text x="265" y="32" fontSize="10">Trend Change</text>
        </svg>
      )
    },

    range_breakout: {
      title: 'Range Breakout (Bottom Reversal)',
      description:
        'This strategy identifies potential bottom formations after selling pressure. It waits for 3 consecutive red candles, followed by a green reversal candle, then triggers when price breaks above that green candle\'s high.',
      keyPoints: [
        'Identifies bottoming patterns after strong selling',
        'Confirms reversal with green candle after red streak',
        'Triggers on breakout above reversal candle high',
        'Excellent for catching trend changes early',
      ],
      visual: (
        <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <rect x="80" y="120" width="15" height="40" fill="#ef4444" stroke="#000" strokeWidth="1"/>
          <rect x="110" y="130" width="15" height="35" fill="#ef4444" stroke="#000" strokeWidth="1"/>
          <rect x="140" y="135" width="15" height="40" fill="#ef4444" stroke="#000" strokeWidth="1"/>
          <rect x="170" y="150" width="15" height="35" fill="#22c55e" stroke="#000" strokeWidth="1"/>
          <line x1="170" y1="150" x2="300" y2="150" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5"/>
          <text x="305" y="155" fontSize="10" fill="#3b82f6">Range High</text>
          <polyline points="200,165 220,145 240,135 260,130 280,125" fill="none" stroke="#22c55e" strokeWidth="4" />
          <polygon points="220,145 215,150 225,150" fill="#22c55e"/>
          <text x="60" y="110" fontSize="11" fill="#ef4444">3 Red Candles</text>
          <text x="160" y="140" fontSize="11" fill="#22c55e">Green Reversal</text>
          <text x="240" y="120" fontSize="11" fill="#22c55e" fontWeight="bold">Breakout!</text>
          <text x="90" y="200" fontSize="10" fill="#666">1. Selling</text>
          <text x="165" y="200" fontSize="10" fill="#666">2. Reversal</text>
          <text x="240" y="200" fontSize="10" fill="#666">3. Breakout</text>
          <rect x="80" y="180" width="4" height="15" fill="#ef4444" opacity="0.5"/>
          <rect x="110" y="175" width="4" height="20" fill="#ef4444" opacity="0.5"/>
          <rect x="140" y="178" width="4" height="17" fill="#ef4444" opacity="0.5"/>
          <rect x="170" y="170" width="4" height="25" fill="#22c55e" opacity="0.5"/>
          <rect x="200" y="165" width="4" height="30" fill="#22c55e" opacity="0.5"/>
        </svg>
      )
    }
  };

  const s = strategies[selectedStrategy];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        {!selected && (
          <>
            <label className="block text-sm font-medium mb-2">Select Strategy:</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-lg"
            >
              {Object.entries(strategies).map(([key, strategy]) => (
                <option key={key} value={key}>{strategy.title}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">{s.title}</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Visual Illustration:</h3>
        <div className="flex justify-center mb-4">{s.visual}</div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Strategy Description:</h3>
        <p className="text-gray-700 leading-relaxed mb-4">{s.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Key Points:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {s.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}
