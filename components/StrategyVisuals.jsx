import React, { useState, useEffect } from 'react';

export default function StrategyVisuals({ selected }) {
  const [selectedStrategy, setSelectedStrategy] = useState(selected || 'breakout');

  useEffect(() => {
    if (selected) setSelectedStrategy(selected);
  }, [selected]);

  const strategies = {
    breakout: {
      title: 'Breakout (Prior 20‑Bar High)',
      description:
        'Looks for a clean breakout where the close crosses above the prior 20‑bar high (excluding the current bar).',
      keyPoints: [
        'Close-based signal to reduce noise',
        'Uses prior 20‑bar high (no current-bar lookahead)',
        'Great for momentum continuation',
        'Works on any timeframe',
      ],
      visual: (
        <svg width="440" height="220" viewBox="0 0 440 220">
          <defs>
            <pattern id="gridB" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2638" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="440" height="220" fill="url(#gridB)" />
          <polyline points="30,160 60,155 90,162 120,150 150,158 180,145 210,152" fill="none" stroke="#8aa0c8" strokeWidth="2"/>
          <line x1="30" y1="135" x2="240" y2="135" stroke="#ef7777" strokeWidth="2" strokeDasharray="6,6"/>
          <text x="246" y="138" fontSize="11" fill="#ef7777">Prior 20‑Bar High</text>
          <polyline points="210,152 240,130 270,118 300,122 330,108 360,112" fill="none" stroke="#7af0b6" strokeWidth="3"/>
          <polygon points="240,130 234,136 244,136" fill="#7af0b6"/>
          <text x="246" y="120" fontSize="12" fill="#7af0b6" fontWeight="bold">Breakout</text>
        </svg>
      )
    },

    orh: {
      title: 'Opening Range High (ORH)',
      description:
        'Defines the opening range from the first N bars of the session. After the window locks, fires once intrabar on a break above the OR High.',
      keyPoints: [
        'User‑tunable opening window (bars)',
        'Locks after window; no repaint',
        'One‑shot intrabar trigger',
        'Great for morning momentum',
      ],
      visual: (
        <svg width="440" height="220" viewBox="0 0 440 220">
          <defs>
            <pattern id="gridORH" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2638" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="440" height="220" fill="url(#gridORH)" />
          <rect x="40" y="150" width="120" height="40" fill="rgba(122,240,182,0.06)" stroke="#6aa3ff" strokeDasharray="6,6"/>
          <text x="46" y="146" fontSize="11" fill="#6aa3ff">Opening Window</text>
          <line x1="40" y1="150" x2="160" y2="150" stroke="#6aa3ff" strokeWidth="2"/>
          <polyline points="40,170 60,160 80,175 100,165 120,172 140,160 160,158 180,155 200,150" fill="none" stroke="#8aa0c8" strokeWidth="2"/>
          <line x1="40" y1="158" x2="160" y2="158" stroke="#7af0b6" strokeWidth="3"/>
          <text x="166" y="160" fontSize="11" fill="#7af0b6">Locked OR High</text>
          <polyline points="200,150 230,142 260,135 290,128 320,122" fill="none" stroke="#7af0b6" strokeWidth="3"/>
          <polygon points="230,142 224,148 234,148" fill="#7af0b6"/>
          <text x="236" y="138" fontSize="12" fill="#7af0b6" fontWeight="bold">Break Above ORH</text>
        </svg>
      )
    },

    orl: {
      title: 'Opening Range Low (ORL)',
      description:
        'Defines the opening range from the first N bars of the session. After the window locks, fires once intrabar on a break below the OR Low.',
      keyPoints: [
        'User‑tunable opening window (bars)',
        'Locks after window; no repaint',
        'One‑shot intrabar trigger',
        'Great for morning fades',
      ],
      visual: (
        <svg width="440" height="220" viewBox="0 0 440 220">
          <defs>
            <pattern id="gridORL" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2638" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="440" height="220" fill="url(#gridORL)" />
          <rect x="40" y="120" width="120" height="60" fill="rgba(239,119,119,0.06)" stroke="#6aa3ff" strokeDasharray="6,6"/>
          <text x="46" y="116" fontSize="11" fill="#6aa3ff">Opening Window</text>
          <polyline points="40,130 60,138 80,125 100,140 120,128 140,145 160,148 180,152 200,158" fill="none" stroke="#8aa0c8" strokeWidth="2"/>
          <line x1="40" y1="148" x2="160" y2="148" stroke="#ef7777" strokeWidth="3"/>
          <text x="166" y="150" fontSize="11" fill="#ef7777">Locked OR Low</text>
          <polyline points="200,158 230,166 260,172 290,180 320,186" fill="none" stroke="#ef7777" strokeWidth="3"/>
          <polygon points="230,166 224,160 234,160" fill="#ef7777"/>
          <text x="236" y="170" fontSize="12" fill="#ef7777" fontWeight="bold">Break Below ORL</text>
        </svg>
      )
    },

    range_breakout: {
      title: 'Range Breakout (Bottom Reversal)',
      description:
        '3 consecutive red candles then a green reversal. Once armed, fires intrabar on break above the green high (one‑shot).',
      keyPoints: [
        'Early reversal capture',
        'One‑shot once armed',
        'Invalidates on range‑low break',
        'Works across assets/timeframes',
      ],
      visual: (
        <svg width="440" height="220" viewBox="0 0 440 220">
          <defs>
            <pattern id="gridRB" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2638" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="440" height="220" fill="url(#gridRB)" />
          <rect x="110" y="130" width="18" height="40" fill="#ef7777"/>
          <rect x="140" y="140" width="18" height="32" fill="#ef7777"/>
          <rect x="170" y="148" width="18" height="36" fill="#ef7777"/>
          <rect x="200" y="156" width="18" height="28" fill="#7af0b6"/>
          <line x1="200" y1="156" x2="330" y2="156" stroke="#6aa3ff" strokeWidth="2" strokeDasharray="6,6"/>
          <text x="336" y="160" fontSize="11" fill="#6aa3ff">Reversal High</text>
          <polyline points="230,166 260,148 290,140 320,136" fill="none" stroke="#7af0b6" strokeWidth="3"/>
          <polygon points="260,148 254,154 264,154" fill="#7af0b6"/>
          <text x="266" y="142" fontSize="12" fill="#7af0b6" fontWeight="bold">Breakout</text>
        </svg>
      )
    },

    ma10: {
      title: 'MA10 Breakdown',
      description:
        'Flags short‑term weakness when price breaks below the 10‑period SMA.',
      keyPoints: [
        'Quick momentum read',
        'Dynamic S/R around trend',
        'Good risk management cue',
        'Pairs with pullback playbooks',
      ],
      visual: (
        <svg width="440" height="220" viewBox="0 0 440 220">
          <defs>
            <pattern id="grid10" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2638" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="440" height="220" fill="url(#grid10)" />
          <polyline points="40,120 70,112 100,108 130,104 160,100 190,104 220,100" fill="none" stroke="#7af0b6" strokeWidth="2"/>
          <polyline points="40,130 80,125 120,118 160,112 200,110 240,114 280,118" fill="none" stroke="#6aa3ff" strokeWidth="3"/>
          <polyline points="220,100 250,120 280,136 310,146 340,152" fill="none" stroke="#ef7777" strokeWidth="3"/>
          <circle cx="250" cy="120" r="6" fill="#ef7777"/>
          <text x="256" y="116" fontSize="12" fill="#ef7777" fontWeight="bold">Breakdown</text>
        </svg>
      )
    },

    ma50: {
      title: 'MA50 Breakdown',
      description:
        'Signals a more significant shift when price breaks below the 50‑period SMA.',
      keyPoints: [
        'Higher‑timeframe warning',
        'Often precedes deeper corrections',
        'Watched by institutions',
        'Useful regime filter',
      ],
      visual: (
        <svg width="440" height="220" viewBox="0 0 440 220">
          <defs>
            <pattern id="grid50" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2638" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="440" height="220" fill="url(#grid50)" />
          <polyline points="40,150 70,144 100,138 130,132 160,126 190,120 220,118" fill="none" stroke="#7af0b6" strokeWidth="2"/>
          <polyline points="40,160 90,158 140,155 190,151 240,148 290,146 340,148" fill="none" stroke="#a78bfa" strokeWidth="4"/>
          <polyline points="220,118 250,132 280,146 310,160 340,170" fill="none" stroke="#dc5656" strokeWidth="4"/>
          <circle cx="280" cy="146" r="7" fill="#dc5656"/>
          <text x="288" y="142" fontSize="12" fill="#dc5656" fontWeight="bold">Breakdown</text>
        </svg>
      )
    },
  };

  const s = strategies[selectedStrategy];

  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 18, color: 'var(--muted)' }}>{s.title}</h2>
      <div style={{ marginTop: 12 }}>{s.visual}</div>
      <div style={{ marginTop: 12, color: 'var(--muted)' }}>{s.description}</div>
      <ul style={{ marginTop: 10, paddingLeft: 18 }}>
        {s.keyPoints.map((p, i) => (
          <li key={i} style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
