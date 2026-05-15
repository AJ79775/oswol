/* Dashboard screen — Oswol */

const sparkA = [12,14,13,15,17,16,19,21,20,22,24,23,25,28,27,29,32,31,33,36];
const sparkB = [40,38,39,37,36,38,35,34,33,34,32,31,30,29,28,27,26,25,24,22];
const sparkC = [50,52,51,54,53,55,57,56,58,59,57,60,62,61,63,65,64,66,68,71];
const sparkBrief = [60,58,57,59,62,61,64,67,65,68,72,70,74,77,75,79,82,80,84,88];

const topMovers = [
  { s: "NVDA", n: "NVIDIA", p: "942.18", d: 4.21, sp: sparkA, color: "var(--up)" },
  { s: "TSLA", n: "Tesla", p: "184.62", d: -2.84, sp: sparkB, color: "var(--down)" },
  { s: "AAPL", n: "Apple", p: "228.04", d: 1.12, sp: sparkA, color: "var(--up)" },
  { s: "AMD",  n: "AMD", p: "164.92", d: 3.40, sp: sparkC, color: "var(--up)" },
  { s: "META", n: "Meta", p: "512.30", d: 0.78, sp: sparkA, color: "var(--up)" },
  { s: "BTC",  n: "Bitcoin", p: "67,420", d: -1.06, sp: sparkB, color: "var(--down)" },
];

const macroEvents = [
  { t: "08:30 EST", lvl: "HIGH", e: "CPI YoY · April",       f: "3.4%", a: "3.5%" },
  { t: "10:00 EST", lvl: "MED",  e: "Powell speech",          f: "—",   a: "live" },
  { t: "14:00 EST", lvl: "HIGH", e: "FOMC minutes",           f: "—",   a: "pending" },
  { t: "Tomorrow",  lvl: "LOW",  e: "Initial jobless claims", f: "215k", a: "—" },
];

const smartMoneyFeed = [
  { who: "Sen. Marcus Hale", tag: "Senator", action: "Bought", asset: "NVDA", size: "$1–5M", filed: "2h ago", delay: "44d", sig: 78 },
  { who: "Vanta Capital",     tag: "Hedge Fund (13F)", action: "Added", asset: "MSFT", size: "+12.4%", filed: "1d ago", delay: "45d", sig: 64 },
  { who: "L. Chen (CFO)",     tag: "Insider · Form 4", action: "Sold", asset: "AMD", size: "$2.1M", filed: "3h ago", delay: "2d", sig: 52 },
];

const socialNarratives = [
  { name: "AI Power Demand", vel: 92, mentions: "48.2k", risk: "med", trend: "▲ surging" },
  { name: "GLP-1 v2.0",      vel: 71, mentions: "21.6k", risk: "low", trend: "▲ rising" },
  { name: "China stimulus",  vel: 58, mentions: "17.0k", risk: "med", trend: "▲ rising" },
  { name: "Quantum stocks",  vel: 41, mentions: "9.4k",  risk: "high",trend: "▼ cooling" },
];

const watchlist = [
  { s: "NVDA", p: "942.18", d: 4.21 },
  { s: "AAPL", p: "228.04", d: 1.12 },
  { s: "SPY",  p: "521.40", d: 0.34 },
  { s: "ETH",  p: "3,412",  d: -1.84 },
  { s: "QQQ",  p: "452.12", d: 0.91 },
];

function Dashboard({ navigate }) {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>WED · MAY 15 · MARKET OPEN</div>
          <h1 className="page-title">Good morning, Tariq.</h1>
          <div className="page-sub">Markets are <span style={{color:"var(--up)"}}>risk-on</span>. AI compute names are leading; small-caps are lagging. 3 high-impact events today.</div>
        </div>
        <div className="page-actions">
          <button className="topbar-btn"><Icon name="calendar"/> Today</button>
          <button className="topbar-btn"><Icon name="filter"/> Filter</button>
          <button className="topbar-btn primary"><Icon name="sparkle" size={14}/> Run AI brief</button>
        </div>
      </div>

      {/* ── ROW 1: AI Brief + Market Pulse ── */}
      <div className="grid" style={{gridTemplateColumns:"1.6fr 1fr", marginBottom:16}}>
        <BriefHeroCard onExplain={() => navigate("asset")} />
        <MarketPulseCard />
      </div>

      {/* ── ROW 2: Top Movers ── */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-head">
          <div className="card-title">Top movers <span className="lead">· past 1h</span></div>
          <div className="seg">
            <button className="active">US Equities</button>
            <button>Crypto</button>
            <button>FX</button>
            <button>Commodities</button>
          </div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:14}}>
          {topMovers.map((m, i) => (
            <div key={i} onClick={() => navigate("asset")} style={{cursor:"pointer", padding:"10px 12px", border:"1px solid var(--line)", borderRadius:14, background:"var(--bg-1)"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                <span className="mono" style={{fontSize:12, fontWeight:600}}>{m.s}</span>
                <span className={`delta ${m.d >= 0 ? "up" : "down"}`}>{m.d >= 0 ? "+" : ""}{m.d.toFixed(2)}%</span>
              </div>
              <div className="num" style={{fontSize:18, letterSpacing:"-0.02em", marginBottom:4}}>{m.p}</div>
              <div style={{fontSize:11, color:"var(--ink-lo)", marginBottom:6}}>{m.n}</div>
              <Spark data={m.sp} color={m.color} height={28} width={140} />
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 3: Smart money + Social ── */}
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", marginBottom:16}}>
        <SmartMoneyPreviewCard navigate={navigate}/>
        <SocialNarrativeCard navigate={navigate}/>
      </div>

      {/* ── ROW 4: Heat map + Macro + Watchlist ── */}
      <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr 1fr", marginBottom:16}}>
        <HeatMapPreview navigate={navigate}/>
        <MacroCard/>
        <WatchlistCard/>
      </div>

      {/* ── ROW 5: Risk meter ── */}
      <RiskMeterCard/>

      <DisclaimerFooter/>
    </div>
  );
}

function BriefHeroCard({ onExplain }) {
  return (
    <div className="ai-stripe">
      <div className="ai-meta">
        <span className="pill ai"><Icon name="sparkle" size={11}/> AI BRIEF</span>
        <span>updated 06:42 ET · 14 sources</span>
        <span style={{marginLeft:"auto"}}>est. read 1m 20s</span>
      </div>
      <div style={{fontFamily:"var(--font-display)", fontSize:22, lineHeight:1.35, letterSpacing:"-0.015em", color:"var(--ivory)", textWrap:"pretty", marginBottom:14}}>
        <span style={{color:"var(--champagne)"}}>NVIDIA</span> guided revenue 8% above consensus on Q1; AI capex commentary lifted the entire compute stack. Cooler April CPI keeps a September cut in play — bond yields fell 6bp.
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, marginBottom:14}}>
        {[
          { k: "What's driving today", v: "AI capex + cooler CPI" },
          { k: "Watch into the close",   v: "Powell · 10:00 ET" },
          { k: "Risk signal",             v: "Calm · VIX 13.4" },
        ].map((b,i) => (
          <div key={i} style={{padding:"10px 12px", background:"rgba(241,235,221,0.025)", borderRadius:10, border:"1px solid var(--line)"}}>
            <div className="eyebrow" style={{marginBottom:4}}>{b.k}</div>
            <div style={{fontSize:13, color:"var(--ink-hi)"}}>{b.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
        <SourceBadge name="Bloomberg" verified/>
        <SourceBadge name="Reuters" verified/>
        <SourceBadge name="SEC 10-Q"/>
        <SourceBadge name="3 more"/>
        <div style={{marginLeft:"auto", display:"flex", gap:8}}>
          <button className="topbar-btn ghost-ai" onClick={onExplain}><Icon name="sparkle" size={13}/> Explain in depth</button>
          <button className="topbar-btn"><Icon name="bookmark" size={13}/> Save</button>
        </div>
      </div>
    </div>
  );
}

function MarketPulseCard() {
  const indices = [
    { n: "S&P 500", v: "5,308.12", d: 0.42, sp: sparkA },
    { n: "Nasdaq 100", v: "18,621",   d: 0.78, sp: sparkC },
    { n: "Russell 2k", v: "2,089.34", d: -0.18, sp: sparkB },
    { n: "DXY",        v: "104.32",   d: -0.21, sp: sparkB },
    { n: "10Y Yield",  v: "4.38%",    d: -0.06, sp: sparkB },
    { n: "BTC",        v: "67,420",   d: -1.06, sp: sparkB },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Market pulse <span className="lead">· live</span></div>
        <span className="pill"><span className="live-dot" style={{marginRight:2}}/> live</span>
      </div>
      <div style={{display:"flex", flexDirection:"column"}}>
        {indices.map((idx, i) => (
          <div key={i} style={{display:"grid", gridTemplateColumns:"1fr auto auto", alignItems:"center", gap:14, padding:"10px 0", borderBottom: i < indices.length-1 ? "1px solid var(--line)" : 0}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:11.5, color:"var(--ink-lo)", marginBottom:2}}>{idx.n}</div>
              <div className="num" style={{fontSize:14, color:"var(--ink-hi)"}}>{idx.v}</div>
            </div>
            <Spark data={idx.sp} color={idx.d >= 0 ? "var(--up)" : "var(--down)"} height={22} width={64}/>
            <div className={`delta ${idx.d >= 0 ? "up" : "down"}`} style={{fontSize:11.5, minWidth:54, textAlign:"right"}}>{idx.d >= 0 ? "+" : ""}{idx.d.toFixed(2)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmartMoneyPreviewCard({ navigate }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Smart money radar <span className="lead">· last 24h</span></div>
        <button className="card-cta" onClick={() => navigate("money")}>Open radar <Icon name="chevron-right" size={12}/></button>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {smartMoneyFeed.map((m, i) => (
          <div key={i} style={{display:"flex", gap:12, alignItems:"center", padding:"10px 12px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12}}>
            <div className="avatar" style={{background:"rgba(216,198,167,0.12)", color:"var(--champagne)", fontFamily:"var(--font-mono)", fontSize:10}}>{m.tag === "Senator" ? "GOV" : m.tag.includes("Insider") ? "INS" : "FND"}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:2}}>
                <span style={{fontSize:13, color:"var(--ink-hi)"}}>{m.who}</span>
                <span style={{fontSize:11, color:"var(--ink-lo)"}}>· {m.tag}</span>
              </div>
              <div style={{fontSize:12, color:"var(--ink-md)"}}>
                <span style={{color: m.action === "Bought" || m.action === "Added" ? "var(--up)" : "var(--down)"}}>{m.action}</span>{" "}
                <span className="mono" style={{color:"var(--ivory)"}}>{m.asset}</span> · {m.size}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="pill warn" style={{fontSize:10}}>delay {m.delay}</div>
              <div style={{fontSize:11, color:"var(--ink-lo)", marginTop:4}}>signal {m.sig}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialNarrativeCard({ navigate }) {
  const riskColor = (r) => r === "high" ? "var(--down)" : r === "med" ? "var(--warn)" : "var(--up)";
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Social narratives <span className="lead">· velocity 1h</span></div>
        <button className="card-cta" onClick={() => navigate("social")}>Open scanner <Icon name="chevron-right" size={12}/></button>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {socialNarratives.map((n, i) => (
          <div key={i} style={{padding:"10px 12px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <span style={{fontSize:13, color:"var(--ink-hi)"}}>{n.name}</span>
                <span className="pill" style={{fontSize:10, color:riskColor(n.risk), borderColor: "transparent", background:"transparent", padding:0}}>· hype risk {n.risk}</span>
              </div>
              <span style={{fontSize:11, color: n.trend.startsWith("▲") ? "var(--social)" : "var(--ink-lo)"}}>{n.trend}</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{flex:1, height:4, background:"rgba(139,92,246,0.1)", borderRadius:999}}>
                <div style={{width:`${n.vel}%`, height:"100%", background:"var(--social)", borderRadius:999}}/>
              </div>
              <span className="mono" style={{fontSize:11, color:"var(--ink-md)"}}>{n.mentions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatMapPreview({ navigate }) {
  // 8x5 grid stylized heatmap
  const cells = [];
  for (let i = 0; i < 40; i++) {
    const v = (Math.sin(i * 1.7) + Math.cos(i * 0.5)) * 1.6;
    cells.push(v);
  }
  const tickerSet = ["NVDA","MSFT","AAPL","GOOG","META","AMZN","TSLA","AMD","AVGO","NFLX","COST","ADBE","CSCO","INTC","QCOM","TXN","INTU","AMAT","BKNG","LIN","ORCL","CRM","PEP","PYPL","SBUX","CDNS","SNPS","REGN","VRTX","ADI","KLAC","LRCX","ASML","MU","PANW","FTNT","ZS","DDOG","NOW","SHOP"];
  const colorFor = (v) => {
    if (v > 1.5) return "rgba(16,185,129,0.55)";
    if (v > 0.5) return "rgba(16,185,129,0.30)";
    if (v > -0.5) return "rgba(216,198,167,0.10)";
    if (v > -1.5) return "rgba(251,113,133,0.30)";
    return "rgba(251,113,133,0.55)";
  };
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Heat map <span className="lead">· Nasdaq-100 · today</span></div>
        <button className="card-cta" onClick={() => navigate("heat")}>Full heat map <Icon name="chevron-right" size={12}/></button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:3, height:200}}>
        {cells.map((v, i) => (
          <div key={i} className="heat-tile" style={{background: colorFor(v)}}>
            <div className="sym">{tickerSet[i]}</div>
            <div className="pct">{v >= 0 ? "+" : ""}{v.toFixed(2)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroCard() {
  const levelColor = (l) => l === "HIGH" ? "var(--down)" : l === "MED" ? "var(--warn)" : "var(--ink-lo)";
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Macro · today</div>
        <span className="pill"><Icon name="globe" size={11}/> US · EU</span>
      </div>
      <div style={{display:"flex", flexDirection:"column"}}>
        {macroEvents.map((m,i) => (
          <div key={i} style={{display:"flex", gap:12, padding:"10px 0", borderBottom: i < 3 ? "1px solid var(--line)" : 0, alignItems:"center"}}>
            <div style={{width:64}}>
              <div style={{fontSize:11, color:"var(--ink-md)", fontFamily:"var(--font-mono)"}}>{m.t}</div>
              <div style={{fontSize:9.5, color: levelColor(m.lvl), letterSpacing:"0.1em", fontFamily:"var(--font-mono)"}}>{m.lvl}</div>
            </div>
            <div style={{flex:1, fontSize:12.5, color:"var(--ink-hi)"}}>{m.e}</div>
            <div className="mono" style={{fontSize:11, color:"var(--ink-md)"}}>{m.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchlistCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Watchlist</div>
        <button className="card-cta"><Icon name="plus" size={12}/> Add</button>
      </div>
      <div style={{display:"flex", flexDirection:"column"}}>
        {watchlist.map((w,i) => (
          <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < watchlist.length-1 ? "1px solid var(--line)" : 0}}>
            <div>
              <div className="mono" style={{fontSize:12.5, color:"var(--ink-hi)", fontWeight:600}}>{w.s}</div>
              <div className="num" style={{fontSize:11.5, color:"var(--ink-lo)"}}>{w.p}</div>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <Spark data={i % 2 ? sparkB : sparkA} color={w.d >= 0 ? "var(--up)" : "var(--down)"} height={18} width={60}/>
              <span className={`delta ${w.d >= 0 ? "up" : "down"}`} style={{fontSize:11.5, minWidth:50, textAlign:"right"}}>{w.d >= 0 ? "+" : ""}{w.d.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskMeterCard() {
  return (
    <div className="card" style={{padding:22}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14}}>
        <div>
          <div className="eyebrow" style={{marginBottom:4}}>RISK-ON / RISK-OFF METER</div>
          <div style={{fontSize:18, color:"var(--ivory)", fontFamily:"var(--font-display)", letterSpacing:"-0.015em"}}>
            Markets are leaning <span style={{color:"var(--up)"}}>risk-on</span> · cyclicals leading defensives by 1.4σ
          </div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <span className="pill">VIX 13.4</span>
          <span className="pill">HY OAS −2bp</span>
          <span className="pill up">Breadth 64%</span>
        </div>
      </div>
      <div style={{position:"relative", padding:"6px 0"}}>
        <div className="risk-meter-track">
          <div className="risk-meter-needle" style={{left:"68%"}}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontSize:10.5, color:"var(--ink-lo)", fontFamily:"var(--font-mono)", letterSpacing:"0.08em"}}>
          <span>RISK-OFF</span><span>NEUTRAL</span><span>RISK-ON</span>
        </div>
      </div>
    </div>
  );
}

function DisclaimerFooter() {
  return (
    <div style={{marginTop:32, padding:"14px 18px", border:"1px dashed var(--line-2)", borderRadius:12, display:"flex", gap:12, alignItems:"flex-start", color:"var(--ink-lo)", fontSize:11.5, lineHeight:1.5}}>
      <Icon name="shield" size={14} style={{flexShrink:0, marginTop:2, color:"var(--ink-md)"}}/>
      <div>
        Oswol is an intelligence and research platform. It does not execute trades and does not provide personalized investment advice. AI summaries can be incorrect — always cross-check sources. Insider, institutional, and political trade disclosures are subject to legal reporting delays (often 30–45 days). Past performance is not indicative of future results.
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
