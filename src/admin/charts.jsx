/* global React, window */
/* PH04 — Biểu đồ SVG thuần cho Dashboard điều hành */

function fmtTrieu(v) { return v.toLocaleString("vi-VN"); }

/* Donut: segments=[{label,value,color}] */
function Donut({ segments, size = 168, thickness = 22, centerTop, centerBig }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-inset)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} strokeLinecap="butt" />
          );
          off += len;
          return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15 }}>
        {centerTop && <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>{centerTop}</div>}
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{centerBig}</div>
      </div>
    </div>
  );
}

function Legend({ items, columns }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns ? `repeat(${columns},1fr)` : "1fr", gap: "7px 14px", flex: 1, minWidth: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{it.label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{it.value}{it.suffix || ""}</span>
        </div>
      ))}
    </div>
  );
}

/* Line + area chart. points=[{l,v}] */
function LineArea({ points, color = "#2563eb", height = 200, unit = "" }) {
  const W = 640, H = height, padL = 44, padB = 26, padT = 14, padR = 12;
  const max = Math.max(...points.map((p) => p.v)) * 1.15 || 1;
  const iw = W - padL - padR, ih = H - padB - padT;
  const x = (i) => padL + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => padT + ih - (v / max) * ih;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.v)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${padT + ih} L${x(0)},${padT + ih} Z`;
  const ticks = 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      <defs>
        <linearGradient id="laFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const gy = padT + (i / ticks) * ih;
        const val = Math.round(max - (i / ticks) * max);
        return (
          <g key={i}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="var(--border-subtle)" strokeWidth="1" />
            <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="10.5" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">{val}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#laFill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.v)} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">{p.l}</text>
        </g>
      ))}
      {unit && <text x={padL} y={11} fontSize="10" fill="var(--text-disabled)">{unit}</text>}
    </svg>
  );
}

/* Thanh xếp chồng ngang. segs=[{value,color}] */
function StackBar({ segs, height = 9 }) {
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div style={{ display: "flex", width: "100%", height, borderRadius: height, overflow: "hidden", background: "var(--bg-inset)" }}>
      {segs.map((s, i) => <span key={i} title={String(s.value)} style={{ width: (s.value / total * 100) + "%", background: s.color }} />)}
    </div>
  );
}

/* Danh sách thanh ngang. items=[{label,value}] */
function HBars({ items, color = "#2563eb", fmt }) {
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 54px", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          <div style={{ height: 8, borderRadius: 4, background: "var(--bg-inset)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: (it.value / max * 100) + "%", background: it.color || color, borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-mono)", textAlign: "right" }}>{fmt ? fmt(it.value) : it.value}</span>
        </div>
      ))}
    </div>
  );
}

window.AdminCharts = { Donut, Legend, LineArea, StackBar, HBars, fmtTrieu };
