/* Shared components, icons, helpers for Oswol */

// === Tiny icon set — single-color line, 16x16 ===
const Icon = ({ name, size = 16, color = "currentColor", style }) => {
  const s = { width: size, height: size, ...style };
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", style: s };
  switch (name) {
    case "home": return <svg {...props}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>;
    case "markets": return <svg {...props}><path d="M3 17l5-6 4 3 5-8 4 5"/><path d="M3 21h18"/></svg>;
    case "money": return <svg {...props}><circle cx="12" cy="12" r="8"/><path d="M9 12l2 2 4-4"/></svg>;
    case "social": return <svg {...props}><path d="M21 12a8 8 0 1 1-3.2-6.4"/><path d="M21 4v5h-5"/></svg>;
    case "heat": return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "watch": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/></svg>;
    case "brief": return <svg {...props}><path d="M5 4h11l3 3v13H5z"/><path d="M16 4v4h3"/><path d="M8 12h8M8 16h6"/></svg>;
    case "newsletter": return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case "copilot": return <svg {...props}><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 16l.8 1.8L21.6 18.6 19.8 19.4 19 21.2l-.8-1.8L16.4 18.6l1.8-.8z"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>;
    case "search": return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "arrow-right": return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "chevron-right": return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "plus": return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "filter": return <svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>;
    case "sparkle": return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>;
    case "send": return <svg {...props}><path d="m4 4 17 8-17 8 4-8z"/></svg>;
    case "info": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7v.5"/></svg>;
    case "alert": return <svg {...props}><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18v.5"/></svg>;
    case "link": return <svg {...props}><path d="M10 14 14 10"/><path d="M9 7h-2a4 4 0 0 0 0 8h2"/><path d="M15 17h2a4 4 0 0 0 0-8h-2"/></svg>;
    case "close": return <svg {...props}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case "expand": return <svg {...props}><path d="M9 3H3v6M21 9V3h-6M15 21h6v-6M3 15v6h6"/></svg>;
    case "bookmark": return <svg {...props}><path d="M6 4h12v17l-6-4-6 4z"/></svg>;
    case "globe": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "trending": return <svg {...props}><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>;
    case "doc": return <svg {...props}><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/></svg>;
    case "download": return <svg {...props}><path d="M12 4v12M6 11l6 5 6-5"/><path d="M5 20h14"/></svg>;
    case "copy": return <svg {...props}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/></svg>;
    case "shield": return <svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "play": return <svg {...props}><path d="M6 4v16l14-8z"/></svg>;
    case "menu": return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "eye": return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "sun": return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>;
    case "moon": return <svg {...props}><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3 6.5 6.5 0 0 0 21 12.5Z"/></svg>;
    default: return null;
  }
};

// === Brand logo mark — uses the actual Oswol logo image.
// Clipped to a circle so it presents consistently in day & night modes.
const OsLogoMark = ({ size = 32 }) => (
  <span
    className="os-mark"
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      background: "#F1EBDD",
      flexShrink: 0,
    }}
  >
    <img
      src="logo.png"
      alt="Oswol"
      style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
    />
  </span>
);

// === Sparkline ===
const Spark = ({ data, color = "var(--ai)", height = 36, width = 120, area = true }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const n = data.length;
  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * (width - 2) + 1;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return [x, y];
  });
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const fill = path + ` L${width-1},${height} L1,${height} Z`;
  const gid = `spk-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={width} height={height} className="spark" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      {area && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.25"/>
              <stop offset="1" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={fill} fill={`url(#${gid})`}/>
        </>
      )}
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
};

// === Candle / area chart for asset page ===
const AreaChart = ({ data, height = 220, color = "var(--champagne)" }) => {
  const w = 800;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const n = data.length;
  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * w;
    const y = height - ((v - min) / range) * (height - 30) - 10;
    return [x, y];
  });
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const fill = path + ` L${w},${height} L0,${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>
        <linearGradient id="ac-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22"/>
          <stop offset="1" stopColor={color} stopOpacity="0"/>
        </linearGradient>
        <pattern id="ac-grid" width="80" height="44" patternUnits="userSpaceOnUse">
          <path d="M0 44 H80 M80 0 V44" stroke="rgba(241,235,221,0.04)" strokeWidth="1" fill="none"/>
        </pattern>
      </defs>
      <rect width={w} height={height} fill="url(#ac-grid)"/>
      <path d={fill} fill="url(#ac-g)"/>
      <path d={path} stroke={color} strokeWidth="1.5" fill="none"/>
      {/* last point dot */}
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="8" fill={color} opacity="0.18"/>
    </svg>
  );
};

// === Bar chart (volume etc) ===
const Bars = ({ data, height = 50, color = "rgba(241,235,221,0.18)", hi }) => {
  const w = 100 / data.length;
  const max = Math.max(...data);
  return (
    <div style={{display:"flex", alignItems:"end", height, gap:2, width:"100%"}}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1,
          height: `${(v/max)*100}%`,
          background: i === hi ? "var(--ai)" : color,
          borderRadius: 2,
          opacity: i === hi ? 1 : 0.55,
        }}/>
      ))}
    </div>
  );
};

// === Source pill ===
const SourceBadge = ({ name, verified }) => (
  <span className="pill" style={{borderColor: verified ? "rgba(34,211,238,0.25)" : "var(--line)"}}>
    {verified && <span style={{color:"var(--ai)"}}>◆</span>}
    <span style={{fontFamily:"var(--font-ui)", letterSpacing:0}}>{name}</span>
  </span>
);

// === Confidence Badge ===
const ConfidenceBadge = ({ value }) => {
  const label = value >= 80 ? "HIGH" : value >= 55 ? "MEDIUM" : "LOW";
  const color = value >= 80 ? "var(--ai)" : value >= 55 ? "var(--champagne)" : "var(--warn)";
  return (
    <div style={{display:"flex", alignItems:"center", gap:8}}>
      <span className="mono" style={{fontSize:11, color, letterSpacing:"0.08em"}}>{label} · {value}%</span>
      <div className="conf-bar" style={{width:60}}><i style={{width:`${value}%`}}/></div>
    </div>
  );
};

// === Mini market ticker row ===
const TickerRow = ({ items }) => (
  <div style={{display:"flex", gap:24, overflow:"hidden", padding:"6px 0"}}>
    {items.map((t, i) => (
      <div key={i} style={{display:"flex", alignItems:"center", gap:8, fontSize:12, whiteSpace:"nowrap"}}>
        <span className="mono" style={{color:"var(--ink-md)", fontWeight:600}}>{t.s}</span>
        <span className="num" style={{color:"var(--ink-hi)"}}>{t.p}</span>
        <span className={`delta ${t.d >= 0 ? "up" : "down"}`}>{t.d >= 0 ? "▲" : "▼"} {Math.abs(t.d).toFixed(2)}%</span>
      </div>
    ))}
  </div>
);

// expose to global scope for cross-script use
Object.assign(window, { Icon, OsLogoMark, Spark, AreaChart, Bars, SourceBadge, ConfidenceBadge, TickerRow });
