import React, { useState, useEffect } from 'react';

export default function StrategyVisuals({ selected }) {
  const [selectedStrategy, setSelectedStrategy] = useState(selected || 'breakout');
  useEffect(() => { if (selected) setSelectedStrategy(selected); }, [selected]);

  const C = {
    bg: '#fffdf8',
    grid: '#ece7de',
    text: '#2f3a44',
    muted: '#5f6b76',
    green: '#2f855a',
    red: '#c05621',
    blue: '#2b6cb0',
    gold: '#b7791f'
  };

  const Grid = ({ w=640, h=300 }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width={w} height={h} fill={C.bg}/>
      <rect width={w} height={h} fill="url(#g)"/>
    </svg>
  );

  const Pill = ({ x, y, text, fill = C.green }) => {
    const padX = 8, padY = 5;
    const fontSize = 14;
    const tw = text.length * (fontSize * 0.62);
    const rw = tw + padX * 2, rh = fontSize + padY * 2;
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x="0" y="0" width={rw} height={rh} rx="10" ry="10" fill={fill} opacity="0.9"/>
        <text x={padX} y={padY + fontSize * 0.8} fill="#fff" fontSize={fontSize} fontWeight="700">{text}</text>
      </g>
    );
  };

  const visuals = {
    breakout: (
      <svg width="640" height="300" viewBox="0 0 640 300">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="640" height="300" fill={C.bg}/>
        <rect width="640" height="300" fill="url(#g)"/>
        <polyline points="60,210 110,200 160,215 210,205 260,212 310,195 360,206 410,199" fill="none" stroke={C.muted} strokeWidth="3"/>
        <line x1="60" y1="180" x2="480" y2="180" stroke={C.red} strokeWidth="3" strokeDasharray="8,6"/>
        <text x="490" y="184" fill={C.red} fontSize="14" fontWeight="700">Prior 20‑bar High</text>
        <polyline points="410,199 440,172 470,162 500,167 530,150 560,155" fill="none" stroke={C.green} strokeWidth="4"/>
        <circle cx="440" cy="172" r="6" fill={C.green}/>
        <g transform="translate(448,144)"><rect width="110" height="28" rx="8" fill={C.green}/><text x="10" y="20" fill="#fff" fontSize="14" fontWeight="700">Breakout</text></g>
      </svg>
    ),

    orh: (
      <svg width="640" height="300" viewBox="0 0 640 300">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="640" height="300" fill={C.bg}/>
        <rect width="640" height="300" fill="url(#g)"/>

        <rect x="80" y="80" width="180" height="140" fill="none" stroke={C.gold} strokeWidth="3"/>
        <text x="90" y="72" fill={C.gold} fontSize="14" fontWeight="700">Opening Window</text>

        <polyline points="80,200 110,170 140,190 170,160 200,175 230,150" fill="none" stroke={C.muted} strokeWidth="3"/>
        <line x1="80" y1="140" x2="260" y2="140" stroke={C.blue} strokeWidth="3"/>
        <text x="270" y="144" fill={C.blue} fontSize="14" fontWeight="700">OR High</text>

        <polyline points="260,150 300,160 340,158 380,162 420,150 460,138 500,142 540,130" fill="none" stroke={C.green} strokeWidth="4"/>
        <circle cx="460" cy="138" r="7" fill={C.green}/>
        <g transform="translate(470,112)"><rect width="120" height="28" rx="8" fill={C.green}/><text x="10" y="20" fill="#fff" fontSize="14" fontWeight="700">ORH Break</text></g>
      </svg>
    ),

    orl: (
      <svg width="640" height="300" viewBox="0 0 640 300">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="640" height="300" fill={C.bg}/>
        <rect width="640" height="300" fill="url(#g)"/>

        <rect x="80" y="80" width="180" height="140" fill="none" stroke={C.gold} strokeWidth="3"/>
        <text x="90" y="72" fill={C.gold} fontSize="14" fontWeight="700">Opening Window</text>

        <polyline points="80,120 110,145 140,130 170,155 200,140 230,165" fill="none" stroke={C.muted} strokeWidth="3"/>
        <line x1="80" y1="196" x2="260" y2="196" stroke={C.red} strokeWidth="3"/>
        <text x="270" y="200" fill={C.red} fontSize="14" fontWeight="700">OR Low</text>

        <polyline points="260,160 300,175 340,190 380,205 420,198 460,210 500,220 540,235" fill="none" stroke={C.red} strokeWidth="4"/>
        <circle cx="460" cy="210" r="7" fill={C.red}/>
        <g transform="translate(470,222)"><rect width="116" height="28" rx="8" fill={C.red}/><text x="10" y="20" fill="#fff" fontSize="14" fontWeight="700">ORL Break</text></g>
      </svg>
    ),

    range_breakout: (
      <svg width="640" height="300" viewBox="0 0 640 300">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="640" height="300" fill={C.bg}/>
        <rect width="640" height="300" fill="url(#g)"/>

        <rect x="140" y="140" width="26" height="64" fill={C.red} opacity="0.9"/><rect x="176" y="152" width="26" height="52" fill={C.red} opacity="0.9"/><rect x="212" y="158" width="26" height="56" fill={C.red} opacity="0.9"/>
        <rect x="248" y="164" width="26" height="46" fill={C.green} opacity="0.9"/>

        <line x1="248" y1="164" x2="520" y2="164" stroke={C.blue} strokeWidth="3" strokeDasharray="8,6"/>
        <text x="528" y="168" fill={C.blue} fontSize="14" fontWeight="700">Reversal High</text>

        <polyline points="274,180 306,170 338,162 370,158 402,154 434,150" fill="none" stroke={C.green} strokeWidth="4"/>
        <circle cx="338" cy="162" r="6" fill={C.green}/>
        <g transform="translate(346,134)"><rect width="100" height="28" rx="8" fill={C.green}/><text x="10" y="20" fill="#fff" fontSize="14" fontWeight="700">Breakout</text></g>
      </svg>
    ),

    ma10: (
      <svg width="640" height="300" viewBox="0 0 640 300">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="640" height="300" fill={C.bg}/>
        <rect width="640" height="300" fill="url(#g)"/>

        <polyline points="60,170 110,160 160,150 210,145 260,140 310,145 360,150 410,158" fill="none" stroke={C.green} strokeWidth="3"/>
        <polyline points="60,184 110,180 160,176 210,172 260,168 310,170 360,174 410,178 460,184" fill="none" stroke={C.blue} strokeWidth="4"/>
        <polyline points="410,158 440,176 470,188 500,198 530,206" fill="none" stroke={C.red} strokeWidth="4"/>
        <circle cx="440" cy="176" r="7" fill={C.red}/>
        <g transform="translate(450,148)"><rect width="140" height="28" rx="8" fill={C.red}/><text x="10" y="20" fill="#fff" fontSize="14" fontWeight="700">Break below MA10</text></g>
      </svg>
    ),

    ma50: (
      <svg width="640" height="300" viewBox="0 0 640 300">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={C.grid} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="640" height="300" fill={C.bg}/>
        <rect width="640" height="300" fill="url(#g)"/>

        <polyline points="60,200 110,190 160,182 210,176 260,170 310,166 360,162 410,160" fill="none" stroke={C.green} strokeWidth="3"/>
        <polyline points="60,214 120,212 180,210 240,208 300,206 360,204 420,202 480,201" fill="none" stroke="#7b61ff" strokeWidth="5"/>
        <polyline points="420,160 450,178 480,196 510,212 540,226" fill="none" stroke={C.red} strokeWidth="5"/>
        <circle cx="480" cy="196" r="8" fill={C.red}/>
        <g transform="translate(490,170)"><rect width="160" height="28" rx="8" fill={C.red}/><text x="10" y="20" fill="#fff" fontSize="14" fontWeight="700">Major MA50 Breakdown</text></g>
      </svg>
    ),
  };

  const strategies = {
    breakout: {
      title: 'Breakout (20‑bar High)',
      description: 'Close crosses above the prior 20‑bar high. Cleaner, close‑based breakout.',
      keyPoints: ['Clear level', 'Momentum confirmation', 'Works on any timeframe'],
      visual: visuals.breakout,
    },
    orh: {
      title: 'Opening Range High (ORH)',
      description: 'Locks the opening window, then fires intrabar on a break of the OR High (one‑shot).',
      keyPoints: ['Respects session context', 'One‑shot once armed', 'Great for trend days'],
      visual: visuals.orh,
    },
    orl: {
      title: 'Opening Range Low (ORL)',
      description: 'Locks the opening window, then fires intrabar on a break of the OR Low (one‑shot).',
      keyPoints: ['Downside momentum', 'One‑shot once armed', 'Clean risk framing'],
      visual: visuals.orl,
    },
    range_breakout: {
      title: 'Range Breakout (Bottom Reversal)',
      description: '3 red then a green reversal. Armed on the green; fires intrabar on a break above its high.',
      keyPoints: ['Early reversal capture', 'Invalidates on range‑low break', 'One‑shot trigger'],
      visual: visuals.range_breakout,
    },
    ma10: {
      title: 'MA10 Breakdown',
      description: 'Break below the 10‑period SMA signals short‑term weakness.',
      keyPoints: ['Quick momentum read', 'Good for pullback alerts', 'Pairs with trend filters'],
      visual: visuals.ma10,
    },
    ma50: {
      title: 'MA50 Breakdown',
      description: 'Break below the 50‑period SMA flags a bigger trend shift.',
      keyPoints: ['Higher‑timeframe signal', 'Often precedes deeper corrections', 'Widely watched level'],
      visual: visuals.ma50,
    },
  };

  const s = strategies[selectedStrategy];

  return (
    <div>
      {!selected && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 14, color: C.muted, marginBottom: 6 }}>Select Strategy</label>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            style={{ padding: '10px 12px', fontSize: 16, border: '1px solid #e6e2da', borderRadius: 10, width: '100%', background: '#fcfbf7' }}
          >
            {Object.entries(strategies).map(([key, v]) => (
              <option key={key} value={key}>{v.title}</option>
            ))}
          </select>
        </div>
      )}

      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 10 }}>{s.title}</h2>

      <div style={{ border: `1px solid ${C.grid}`, borderRadius: 12, overflow: 'hidden', background: C.bg, marginBottom: 12 }}>
        {s.visual}
      </div>

      <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.5, margin: '6px 0 10px' }}>{s.description}</p>

      <ul style={{ color: C.text, fontSize: 16, margin: 0, paddingLeft: 18 }}>
        {s.keyPoints.map((pt, i) => <li key={i} style={{ marginBottom: 6 }}>{pt}</li>)}
      </ul>
    </div>
  );
}
