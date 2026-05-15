/* Market Heat Map screen */

const N100 = [
  "NVDA","MSFT","AAPL","GOOG","AMZN","META","TSLA","AVGO","COST","NFLX",
  "AMD","ADBE","PEP","CSCO","TMUS","INTC","CMCSA","QCOM","TXN","AMAT",
  "INTU","HON","ISRG","AMGN","BKNG","SBUX","ADI","MDLZ","GILD","VRTX",
  "ADP","REGN","PYPL","LRCX","MU","PANW","KLAC","SNPS","CDNS","MELI",
  "ASML","CHTR","ORLY","MAR","ABNB","FTNT","WDAY","NXPI","ADSK","CRWD",
  "ROST","CTAS","DXCM","MNST","KDP","KHC","AEP","CSGP","PCAR","TEAM",
  "FAST","ODFL","EXC","BIIB","XEL","CTSH","IDXX","PAYX","CPRT","MRVL",
  "ZS","ANSS","DDOG","TTD","SIRI","EBAY","ON","ILMN","WBD","CSX",
  "ALGN","VRSK","FANG","WBA","LULU","CDW","SGEN","ENPH","ZM","DLTR",
  "GFS","BKR","TTWO","JD","SPLK","MTCH","ROP","PODD","ADP2","SMCI"
];

function HeatMapScreen() {
  const [scope, setScope] = React.useState("nasdaq");
  // pseudo-deterministic returns
  const seed = scope === "nasdaq" ? 1.3 : scope === "etf" ? 0.8 : scope === "sector" ? 0.5 : scope === "crypto" ? 1.6 : 1.0;
  const cells = N100.map((s, i) => {
    const v = (Math.sin(i * seed + 0.7) * 1.4 + Math.cos(i * 0.39) * 0.8 + Math.sin(i * 0.13) * 1.1);
    return { s, v };
  });
  const colorFor = (v) => {
    const a = Math.min(0.78, Math.abs(v) / 3 * 0.7 + 0.08);
    if (v >= 0) return `rgba(16, 185, 129, ${a})`;
    return `rgba(251, 113, 133, ${a})`;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>HEAT MAP</div>
          <h1 className="page-title">Market at a glance</h1>
          <div className="page-sub">Color = % change today. Size = relative market cap weighting.</div>
        </div>
        <div className="page-actions">
          <div className="seg">
            <button className={scope === "nasdaq" ? "active" : ""} onClick={() => setScope("nasdaq")}>Nasdaq-100</button>
            <button className={scope === "sp" ? "active" : ""} onClick={() => setScope("sp")}>S&P 500</button>
            <button className={scope === "sector" ? "active" : ""} onClick={() => setScope("sector")}>Sectors</button>
            <button className={scope === "etf" ? "active" : ""} onClick={() => setScope("etf")}>ETFs</button>
            <button className={scope === "crypto" ? "active" : ""} onClick={() => setScope("crypto")}>Crypto</button>
            <button className={scope === "watch" ? "active" : ""} onClick={() => setScope("watch")}>Watchlist</button>
          </div>
          <button className="topbar-btn"><Icon name="download" size={13}/></button>
        </div>
      </div>

      {/* Legend strip */}
      <div className="card" style={{marginBottom:16, padding:"12px 18px", display:"flex", alignItems:"center", gap:18}}>
        <span className="eyebrow">PERFORMANCE TODAY</span>
        <div style={{flex:1, display:"flex", alignItems:"center", gap:0, height:8, borderRadius:999, overflow:"hidden"}}>
          {[-3,-2,-1,-0.5,0,0.5,1,2,3].map((v,i) => <div key={i} style={{flex:1, height:"100%", background:colorFor(v)}}/>)}
        </div>
        <div style={{display:"flex", justifyContent:"space-between", width:"100%", maxWidth:240, fontSize:10.5, color:"var(--ink-lo)", fontFamily:"var(--font-mono)"}}>
          <span>−3%</span><span>0%</span><span>+3%</span>
        </div>
        <span className="pill up">62% green</span>
        <span className="pill down">38% red</span>
      </div>

      {/* Sector mini grouped layout */}
      <div className="card" style={{padding:18}}>
        <div className="card-head">
          <div className="card-title">Nasdaq-100 · grouped by sector</div>
          <div style={{display:"flex", gap:8}}>
            <span className="pill">Tap a tile for details</span>
          </div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"2fr 1.3fr 1fr", gap:6, gridAutoRows:"minmax(70px, auto)"}}>
          {/* Mega tech group spans large */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridTemplateRows:"repeat(2, 1fr)", gap:6, gridRow:"span 2"}}>
            {cells.slice(0,8).map((c,i) => (
              <HeatTile key={i} sym={c.s} v={c.v} big={i === 0} colorFor={colorFor}/>
            ))}
          </div>
          {/* Semis */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, gridRow:"span 2"}}>
            {cells.slice(8,17).map((c,i) => (
              <HeatTile key={i} sym={c.s} v={c.v} colorFor={colorFor}/>
            ))}
          </div>
          {/* Software */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:6, gridRow:"span 2"}}>
            {cells.slice(17,23).map((c,i) => (
              <HeatTile key={i} sym={c.s} v={c.v} colorFor={colorFor}/>
            ))}
          </div>
        </div>

        <div style={{marginTop:14, display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:6, gridAutoRows:"58px"}}>
          {cells.slice(23).map((c,i) => (
            <HeatTile key={i} sym={c.s} v={c.v} small colorFor={colorFor}/>
          ))}
        </div>
      </div>

      {/* Sector ranking */}
      <SectorRanking/>

      <DisclaimerFooter/>
    </div>
  );
}

function HeatTile({ sym, v, big, small, colorFor }) {
  return (
    <div className="heat-tile" style={{
      background: colorFor(v),
      gridColumn: big ? "span 2" : undefined,
      gridRow: big ? "span 2" : undefined,
      padding: small ? "6px 8px" : "10px 12px",
    }}>
      <div className="sym" style={{fontSize: big ? 18 : small ? 10.5 : 12}}>{sym}</div>
      <div className="pct" style={{fontSize: big ? 14 : small ? 10 : 11}}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</div>
    </div>
  );
}

function SectorRanking() {
  const sectors = [
    { s:"Semiconductors", p: 2.84 },
    { s:"Software · Infrastructure", p: 1.92 },
    { s:"Internet · Mega cap", p: 0.78 },
    { s:"Consumer · Discretionary", p: 0.34 },
    { s:"Healthcare · Biotech", p: -0.12 },
    { s:"Comm. Services", p: -0.41 },
    { s:"Energy", p: -0.88 },
    { s:"Utilities", p: -1.24 },
  ];
  return (
    <div className="card" style={{marginTop:16}}>
      <div className="card-head">
        <div className="card-title">Sector performance · today</div>
        <span className="pill">11 GICS sectors</span>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:8}}>
        {sectors.map((s,i) => (
          <div key={i} style={{display:"flex", alignItems:"center", gap:14}}>
            <span style={{width:200, fontSize:12.5, color:"var(--ink-md)"}}>{s.s}</span>
            <div style={{flex:1, position:"relative", height:18}}>
              <div style={{position:"absolute", top:7, left:0, right:0, height:1, background:"var(--line)"}}/>
              <div style={{position:"absolute", top:7, left:"50%", width:1, height:18, marginTop:-9, background:"var(--line-2)"}}/>
              <div style={{
                position:"absolute",
                top:3, height:12,
                left: s.p >= 0 ? "50%" : `${50 + s.p * 12}%`,
                width: `${Math.abs(s.p) * 12}%`,
                background: s.p >= 0 ? "var(--up)" : "var(--down)",
                opacity:0.6,
                borderRadius:3,
              }}/>
            </div>
            <span className={`delta ${s.p >= 0 ? "up" : "down"}`} style={{minWidth:60, textAlign:"right"}}>{s.p >= 0 ? "+" : ""}{s.p.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HeatMapScreen });
