import React, { useMemo, useRef, useState } from 'react';
import { rand } from '../lib/metrics.js';

// Hand-built SVG charts (no chart library needed). They animate in via CSS and show hover tooltips.

const niceMax = (v) => {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
};

function Tooltip({ x, y, lines, w }) {
  if (x === null) return null;
  const left = Math.min(Math.max(x, 70), w - 70);
  return (
    <div className="chart-tip" style={{ left: left, top: y }}>
      {lines.map((l, i) => <div key={i} className={i === 0 ? 'tip-title' : ''}>{l}</div>)}
    </div>
  );
}

export function LineChart({ data, height = 260 }) {
  const w = 640; const h = height;
  const pad = { l: 8, r: 8, t: 16, b: 28 };
  const max = niceMax(Math.max(...data.map((d) => d.value), 1) * 1.1);
  const iw = w - pad.l - pad.r; const ih = h - pad.t - pad.b;
  const pts = data.map((d, i) => ({ ...d, x: pad.l + 14 + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * (iw - 28)), y: pad.t + ih - (d.value / max) * ih }));
  const [hover, setHover] = useState(null);
  const wrap = useRef(null);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1].x},${pad.t + ih} L${pts[0].x},${pad.t + ih} Z`;
  const grid = [0, 0.33, 0.66, 1];
  return (
    <div className="chart-wrap" ref={wrap}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Sales over the last ${data.length} months`} className="chart-svg" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="lcArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6938FF" stopOpacity=".22" /><stop offset="1" stopColor="#6938FF" stopOpacity="0" /></linearGradient>
          <filter id="lcShadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#6938FF" floodOpacity=".28" /></filter>
        </defs>
        {grid.map((g) => <line key={g} x1={pad.l} x2={w - pad.r} y1={pad.t + ih - g * ih} y2={pad.t + ih - g * ih} className="grid" />)}
        <path d={area} fill="url(#lcArea)" className="line-area" />
        <path d={path} className="line-path" filter="url(#lcShadow)" pathLength="1" />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${p.label}: ${rand(p.value)}`}>
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hover === i ? 7 : 5} className="line-dot" />
            <text x={p.x} y={h - 8} textAnchor="middle" className="axis">{p.label}</text>
          </g>
        ))}
      </svg>
      {hover !== null && <Tooltip x={(pts[hover].x / w) * (wrap.current?.clientWidth || w)} y={(pts[hover].y / h) * height - 54} w={wrap.current?.clientWidth || w} lines={[pts[hover].label, rand(pts[hover].value)]} />}
    </div>
  );
}

export function BarChart({ data, series, height = 280 }) {
  // data: [{label, sales, expenses}], series: [{key,label,color,visible}]
  const w = 640; const h = height;
  const pad = { l: 8, r: 8, t: 16, b: 28 };
  const visible = series.filter((s) => s.visible);
  const max = niceMax(Math.max(...data.flatMap((d) => visible.map((s) => d[s.key])), 1) * 1.08);
  const iw = w - pad.l - pad.r; const ih = h - pad.t - pad.b;
  const group = iw / data.length;
  const bw = Math.min(26, (group * 0.7) / Math.max(visible.length, 1));
  const [hover, setHover] = useState(null);
  const wrap = useRef(null);
  return (
    <div className="chart-wrap" ref={wrap}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Monthly sales and expenses" className="chart-svg" onMouseLeave={() => setHover(null)}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`bar-${s.key}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={s.color} /><stop offset=".45" stopColor={s.light} /><stop offset="1" stopColor={s.color} />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.33, 0.66, 1].map((g) => <line key={g} x1={pad.l} x2={w - pad.r} y1={pad.t + ih - g * ih} y2={pad.t + ih - g * ih} className="grid" />)}
        {data.map((d, gi) => {
          const gx = pad.l + gi * group + group / 2;
          const total = visible.length * bw + (visible.length - 1) * 6;
          return (
            <g key={d.label} onMouseEnter={() => setHover(gi)} onFocus={() => setHover(gi)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label}: ${visible.map((s) => `${s.label} ${rand(d[s.key])}`).join(', ')}`}>
              <rect x={gx - group / 2} y={pad.t} width={group} height={ih} fill={hover === gi ? 'rgba(105,56,255,.05)' : 'transparent'} rx="10" />
              {visible.map((s, si) => {
                const bh = Math.max(2, (d[s.key] / max) * ih);
                const x = gx - total / 2 + si * (bw + 6);
                return <rect key={s.key} x={x} y={pad.t + ih - bh} width={bw} height={bh} rx={bw / 2.4} fill={`url(#bar-${s.key})`} className="bar" style={{ animationDelay: `${gi * 60 + si * 40}ms`, transformOrigin: `${x}px ${pad.t + ih}px` }} />;
              })}
              <text x={gx} y={h - 8} textAnchor="middle" className="axis">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <Tooltip
          x={((pad.l + hover * group + group / 2) / w) * (wrap.current?.clientWidth || w)} y={10} w={wrap.current?.clientWidth || w}
          lines={[data[hover].label, ...visible.map((s) => `${s.label}: ${rand(data[hover][s.key])}`)]}
        />
      )}
    </div>
  );
}

export function Donut({ segments, centerLabel, centerSub, size = 250 }) {
  const [active, setActive] = useState(null);
  const total = segments.reduce((a, s) => a + Math.max(s.value, 0), 0) || 1;
  const r = 86; const c = 2 * Math.PI * r;
  let acc = 0;
  const parts = useMemo(() => segments.map((s) => {
    const frac = Math.max(s.value, 0) / total;
    const part = { ...s, frac, offset: acc };
    acc += frac;
    return part;
  }), [segments, total]);
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg viewBox="0 0 220 220" width={size} height={size} role="img" aria-label={segments.map((s) => `${s.label} ${s.pct}%`).join(', ')}>
        <defs><filter id="dnShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#15131A" floodOpacity=".18" /></filter></defs>
        <g transform="rotate(-90 110 110)" filter="url(#dnShadow)">
          {parts.map((p, i) => (
            <circle
              key={p.key} cx="110" cy="110" r={r} fill="none" stroke={p.color} strokeWidth={active === i ? 40 : 34}
              strokeDasharray={`${Math.max(p.frac * c - 2, 0)} ${c}`} strokeDashoffset={-p.offset * c}
              className="donut-seg" style={{ cursor: 'pointer', animationDelay: `${i * 120}ms` }}
              onClick={() => setActive(active === i ? null : i)} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActive(active === i ? null : i); }}
            >
              <title>{`${p.label}: ${p.pct}% (${rand(p.value)})`}</title>
            </circle>
          ))}
        </g>
        <circle cx="110" cy="110" r="62" fill="#fff" />
        <circle cx="110" cy="110" r="62" fill="none" stroke="rgba(105,56,255,.12)" strokeWidth="2" />
      </svg>
      <div className="donut-center">
        <strong>{active !== null ? `${parts[active].pct}%` : centerLabel}</strong>
        <span>{active !== null ? parts[active].label : centerSub}</span>
      </div>
    </div>
  );
}
