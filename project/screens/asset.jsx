/* Asset detail page + Explain This Move panel */

const priceSeries = (() => {
  const out = [];
  let v = 880;
  for (let i = 0; i < 80; i++) {
    v += (Math.random() - 0.45) * 12 + Math.sin(i / 4) * 2;
    out.push(v);
  }
  out.push(942.18);
  return out;
})();

function AssetPage({ onExplain }) {
  const [tf, setTf] = React.useState("1D");
  return (
    <div>
      <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--ink-lo)", fontSize:12, marginBottom:14}}>
        <span>Markets</span><Icon name="chevron-right" size={12}/>
        <span>US Equities</span><Icon name="chevron-right" size={12}/>
        <span style={{color:"var(--ink-md)"}}>NVIDIA · NVDA</span>
      </div>

      <div className="page-head">
        <div>
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
            <div style={{width:36, height:36, borderRadius:10, background:"#76B900", display:"grid", placeItems:"center", color:"#000", fontWeight:700, fontFamily:"var(--font-display)"}}>N</div>
            <h1 className="page-title" style={{margin:0}}>NVIDIA <span style={{color:"var(--ink-lo)", fontWeight:300}}>· NVDA</span></h1>
            <span className="pill">NASDAQ</span>
            <span className="pill up">Risk-on</span>
          </div>
          <div style={{display:"flex", alignItems:"baseline", gap:14}}>
            <div className="num" style={{fontSize:42, letterSpacing:"-0.03em", color:"var(--ivory)", fontFamily:"var(--font-display)"}}>942.18</div>
            <div className="delta up" style={{fontSize:16}}>+38.04 (+4.21%)</div>
            <span style={{fontSize:11, color:"var(--ink-lo)"}}>· Today</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="topbar-btn"><Icon name="bookmark" size={13}/> Watch</button>
          <button className="topbar-btn"><Icon name="copy" size={13}/> Compare</button>
          <button className="topbar-btn primary" onClick={onExplain}><Icon name="sparkle" size={13}/> Explain this move</button>
        </div>
      </div>

      {/* Chart card */}
      <div className="card" style={{marginBottom:16, padding:0}}>
        <div style={{display:"flex", padding:"14px 18px", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid var(--line)"}}>
          <div className="tabs">
            {["1H","1D","5D","1M","6M","1Y","5Y","All"].map(x => (
              <button key={x} className={`tab ${tf === x ? "active" : ""}`} onClick={() => setTf(x)}>{x}</button>
            ))}
          </div>
          <div style={{display:"flex", gap:8}}>
            <span className="pill"><Icon name="trending" size={11}/> +18.4% MTD</span>
            <span className="pill champagne">Above 50-DMA</span>
            <button className="topbar-btn"><Icon name="expand" size={13}/></button>
          </div>
        </div>
        <div style={{padding:"6px 18px 0"}}>
          <AreaChart data={priceSeries} height={260} color="var(--champagne)" />
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", padding:"14px 18px", borderTop:"1px solid var(--line)"}}>
          {[
            ["Mkt Cap", "$2.31T"],
            ["P/E", "68.4"],
            ["Day Range", "904 — 945"],
            ["52W Range", "418 — 974"],
            ["Volume", "42.1M"],
            ["Avg Vol", "38.4M"],
          ].map((kv,i) => (
            <div key={i}>
              <div style={{fontSize:10.5, color:"var(--ink-dim)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3}}>{kv[0]}</div>
              <div className="num" style={{fontSize:14, color:"var(--ink-hi)"}}>{kv[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI insight summary */}
      <div className="ai-stripe" style={{marginBottom:16}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
          <div className="ai-meta" style={{margin:0}}>
            <span className="pill ai"><Icon name="sparkle" size={11}/> AI EXPLAIN</span>
            <span>auto-generated · 12s ago</span>
          </div>
          <ConfidenceBadge value={82}/>
        </div>
        <div style={{fontFamily:"var(--font-display)", fontSize:19, lineHeight:1.45, letterSpacing:"-0.01em", marginBottom:12}}>
          NVDA is up <span style={{color:"var(--up)"}}>4.21%</span> after guiding next-quarter revenue 8% above consensus. The print confirmed accelerating AI capex from hyperscalers, lifting the entire compute supply chain. Cooler April CPI provided a macro tailwind.
        </div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <span className="pill ai">earnings beat</span>
          <span className="pill ai">AI capex</span>
          <span className="pill ai">macro tailwind</span>
          <span className="pill">supply chain · pos.</span>
          <button className="topbar-btn ghost-ai" style={{marginLeft:"auto"}} onClick={onExplain}>Full breakdown <Icon name="arrow-right" size={12}/></button>
        </div>
      </div>

      {/* Three column: Smart money / Social / News */}
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr", marginBottom:16}}>
        <SmartMoneyMini/>
        <SocialMini/>
        <NewsMini/>
      </div>

      <MacroContextStrip/>
    </div>
  );
}

function SmartMoneyMini() {
  const rows = [
    { who: "Sen. M. Hale", action:"Bought", size:"$1–5M", date:"Apr 2", filed:"May 15", delay:"43d" },
    { who: "Vanta Capital", action:"+12%", size:"$220M", date:"Q1", filed:"May 14", delay:"45d" },
    { who: "Insider · CFO", action:"Sold", size:"$2.1M", date:"May 13", filed:"May 15", delay:"2d" },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Smart money · NVDA</div>
        <span className="pill warn"><Icon name="alert" size={10}/> filing delay</span>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {rows.map((r,i) => (
          <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i<2 ? "1px solid var(--line)" : 0}}>
            <div>
              <div style={{fontSize:12.5, color:"var(--ink-hi)"}}>{r.who}</div>
              <div style={{fontSize:11, color:"var(--ink-lo)", marginTop:2}}>
                <span style={{color: r.action === "Sold" ? "var(--down)" : "var(--up)"}}>{r.action}</span> · {r.size}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="mono" style={{fontSize:10.5, color:"var(--ink-md)"}}>traded {r.date}</div>
              <div className="mono" style={{fontSize:10.5, color:"var(--warn)"}}>filed {r.filed} · +{r.delay}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialMini() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Social pulse</div>
        <span className="pill social">sentiment +0.62</span>
      </div>
      <div style={{display:"flex", alignItems:"baseline", gap:8, marginBottom:14}}>
        <div className="num" style={{fontSize:32, color:"var(--ivory)", letterSpacing:"-0.02em"}}>48.2k</div>
        <div style={{fontSize:11, color:"var(--ink-lo)"}}>mentions · 24h</div>
        <div style={{marginLeft:"auto", color:"var(--social)", fontSize:12}}>▲ 312%</div>
      </div>
      <Bars data={[3,5,4,6,8,11,9,14,18,22,26,32,38,42,48]} height={50} hi={14}/>
      <div className="divider"/>
      <div style={{display:"flex", flexDirection:"column", gap:6}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12}}><span style={{color:"var(--ink-lo)"}}>X / Twitter</span><span className="mono">31.4k</span></div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12}}><span style={{color:"var(--ink-lo)"}}>Reddit · r/wsb, r/stocks</span><span className="mono">9.2k</span></div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12}}><span style={{color:"var(--ink-lo)"}}>TikTok finance</span><span className="mono">5.1k</span></div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12}}><span style={{color:"var(--ink-lo)"}}>Discord servers</span><span className="mono">2.5k</span></div>
      </div>
    </div>
  );
}

function NewsMini() {
  const items = [
    { src:"Bloomberg", time:"3h", v:true, t:"Nvidia Q1 revenue tops $26B; sees Q2 above estimates as Hopper demand persists." },
    { src:"Reuters", time:"5h", v:true, t:"Hyperscalers signal accelerating AI capex into 2026; AMD, AVGO follow higher." },
    { src:"SEC EDGAR", time:"1d", v:true, t:"Form 4 — CFO C. Kress files Rule 10b5-1 sale of 25,000 shares." },
    { src:"The Information", time:"1d", v:false, t:"Sources: Saudi PIF in talks to expand Blackwell allocation." },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">News & filings</div>
        <button className="card-cta">All <Icon name="chevron-right" size={12}/></button>
      </div>
      <div style={{display:"flex", flexDirection:"column"}}>
        {items.map((n,i) => (
          <div key={i} style={{padding:"10px 0", borderBottom: i<items.length-1 ? "1px solid var(--line)" : 0}}>
            <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
              <SourceBadge name={n.src} verified={n.v}/>
              <span style={{fontSize:11, color:"var(--ink-dim)"}}>· {n.time} ago</span>
            </div>
            <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.45, textWrap:"pretty"}}>{n.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroContextStrip() {
  const items = [
    { k:"Sector · Semis", v:"+2.84%", c:"var(--up)" },
    { k:"SOXX ETF", v:"+3.12%", c:"var(--up)" },
    { k:"10Y Yield", v:"−6bp · 4.38%", c:"var(--up)" },
    { k:"DXY", v:"−0.21%", c:"var(--ink-md)" },
    { k:"VIX", v:"13.4 · calm", c:"var(--up)" },
    { k:"FOMC odds Sep cut", v:"68%", c:"var(--ai)" },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Macro context — what's around the move</div>
        <span className="pill">live</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)"}}>
        {items.map((it,i) => (
          <div key={i} style={{padding:"6px 14px 6px 0", borderRight: i<5 ? "1px solid var(--line)" : 0}}>
            <div style={{fontSize:10.5, color:"var(--ink-dim)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4}}>{it.k}</div>
            <div className="num" style={{fontSize:14, color: it.c}}>{it.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* === Explain This Move Panel (right rail) === */
function ExplainPanel({ open, onClose }) {
  return (
    <div className={`rail ${open ? "open" : ""}`}>
      <div style={{padding:"16px 20px", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", gap:10}}>
        <span className="pill ai"><Icon name="sparkle" size={11}/> EXPLAIN THIS MOVE</span>
        <span style={{fontSize:12, color:"var(--ink-lo)", marginLeft:4}}>NVDA · +4.21% today</span>
        <button className="topbar-btn" style={{marginLeft:"auto"}} onClick={onClose}><Icon name="close" size={14}/></button>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:"18px 20px 80px"}}>
        <div style={{fontFamily:"var(--font-display)", fontSize:18, lineHeight:1.45, letterSpacing:"-0.01em", marginBottom:14, textWrap:"pretty"}}>
          NVDA rose <span style={{color:"var(--up)"}}>4.21%</span> after a clean Q1 beat plus accelerating AI capex commitments from cloud hyperscalers — and cooler April CPI added a macro tailwind for high-multiple compute names.
        </div>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:18}}>
          <ConfidenceBadge value={82}/>
          <span className="pill">12s ago</span>
          <span className="pill">14 sources</span>
        </div>

        <Section title="Why it moved" eyebrow="01" tone="ai">
          <ul style={ulStyle}>
            <li><b style={{color:"var(--ink-hi)"}}>Earnings beat.</b> Q1 revenue $26.04B vs $24.6B consensus. Data-center segment +427% YoY.</li>
            <li><b style={{color:"var(--ink-hi)"}}>Q2 guide.</b> Management guided $28B ±2%, ~8% above the street.</li>
            <li><b style={{color:"var(--ink-hi)"}}>Capex commentary.</b> Hyperscaler customers reiterated multi-year AI infrastructure plans.</li>
          </ul>
        </Section>

        <Section title="Price context" eyebrow="02">
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10}}>
            <Stat k="Today" v="+4.21%" c="var(--up)"/>
            <Stat k="MTD" v="+18.4%" c="var(--up)"/>
            <Stat k="YTD" v="+92.6%" c="var(--up)"/>
            <Stat k="vs 50-DMA" v="above" c="var(--champagne)"/>
          </div>
          <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.55}}>Move clears the May 8 high; next resistance ~970. Implied vol cooled from 48 → 39 — option market suggests fade rather than chase.</div>
        </Section>

        <Section title="News context" eyebrow="03">
          <Source name="Bloomberg" verified t="Q1 revenue tops $26B; sees Q2 above estimates"/>
          <Source name="Reuters" verified t="Hyperscalers signal accelerating AI capex"/>
          <Source name="WSJ" verified t="Margin guidance steady at 75.5% gross"/>
        </Section>

        <Section title="Macro context" eyebrow="04">
          <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.55, marginBottom:8}}>
            April CPI printed 3.4% YoY vs 3.5% expected. 10Y yield fell 6bp; September cut odds rose to 68%. Lower rates → higher relative value for long-duration compute names.
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            <span className="pill up">rates ↓</span>
            <span className="pill up">duration tailwind</span>
            <span className="pill up">risk-on breadth</span>
          </div>
        </Section>

        <Section title="Social context" eyebrow="05" tone="social">
          <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.55, marginBottom:8}}>
            48.2k mentions in 24h (▲ 312%). Sentiment +0.62. Top narrative: <i>"AI power demand"</i>. Velocity is rising but hype risk is <span style={{color:"var(--warn)"}}>medium</span> — not yet at retail-blowoff levels.
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            <span className="pill social">X · 31.4k</span>
            <span className="pill social">Reddit · 9.2k</span>
            <span className="pill social">TikTok · 5.1k</span>
          </div>
        </Section>

        <Section title="Smart-money context" eyebrow="06">
          <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.55, marginBottom:8}}>
            Net institutional flow positive over the past 30 trading days. 2 Congressional buys disclosed today, but both traded weeks ago. CFO 10b5-1 sale was pre-scheduled.
          </div>
          <div style={{padding:"10px 12px", background:"var(--warn-soft)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:10, fontSize:11.5, color:"var(--ink-md)", display:"flex", gap:8, lineHeight:1.5}}>
            <Icon name="alert" size={13} color="var(--warn)" style={{flexShrink:0, marginTop:1}}/>
            <div><b style={{color:"var(--warn)"}}>Reporting delay:</b> political trades shown above were filed today but executed up to 45 days ago. They are lagging signals, not real-time positioning.</div>
          </div>
        </Section>

        <Section title="What to watch next" eyebrow="07" tone="champ">
          <ul style={ulStyle}>
            <li>Powell speech at 10:00 ET — language on disinflation.</li>
            <li>SOXX breadth — is the rally just NVDA, or sector-wide?</li>
            <li>Hyperscaler capex follow-throughs at MSFT / GOOGL.</li>
            <li>970 resistance / 39 IV — momentum vs mean-reversion setup.</li>
          </ul>
        </Section>

        <Section title="Sources" eyebrow="08">
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            {["Bloomberg","Reuters","WSJ","SEC 10-Q","SEC Form 4","BLS","CME FedWatch","FactSet","X Sentiment","Reddit API","TikTok scrape","Macrobond","Refinitiv","Internal"].map(s => <SourceBadge key={s} name={s} verified={["Bloomberg","Reuters","WSJ","SEC 10-Q","SEC Form 4","BLS"].includes(s)}/>)}
          </div>
        </Section>

        <div style={{marginTop:24, padding:"12px 14px", background:"rgba(241,235,221,0.02)", border:"1px dashed var(--line-2)", borderRadius:10, fontSize:11, color:"var(--ink-lo)", lineHeight:1.55}}>
          AI summaries can be incorrect or incomplete. Oswol does not provide investment advice. Always verify against the primary sources linked above. Insider, hedge fund, and political trades carry legal reporting delays of 30–45 days.
        </div>
      </div>
      <div style={{padding:"12px 16px", borderTop:"1px solid var(--line)", background:"var(--bg-1)", display:"flex", gap:8}}>
        <button className="topbar-btn" style={{flex:1, justifyContent:"center"}}><Icon name="copy" size={13}/> Copy</button>
        <button className="topbar-btn" style={{flex:1, justifyContent:"center"}}><Icon name="download" size={13}/> Export</button>
        <button className="topbar-btn primary" style={{flex:1, justifyContent:"center"}}><Icon name="newsletter" size={13}/> Send to brief</button>
      </div>
    </div>
  );
}

const ulStyle = { margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:12.5, color:"var(--ink-md)", lineHeight:1.5 };

function Section({ title, eyebrow, tone, children }) {
  const c = tone === "ai" ? "var(--ai)" : tone === "social" ? "var(--social)" : tone === "champ" ? "var(--champagne)" : "var(--ink-md)";
  return (
    <div style={{marginBottom:22}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
        <span className="mono" style={{fontSize:10.5, color:c, letterSpacing:"0.16em"}}>{eyebrow}</span>
        <div style={{height:1, flex:1, background:"var(--line)"}}/>
        <span style={{fontSize:12, color:"var(--ink-hi)", letterSpacing:"-0.005em"}}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Stat({ k, v, c }) {
  return (
    <div style={{padding:"8px 10px", background:"var(--bg-2)", borderRadius:8, border:"1px solid var(--line)"}}>
      <div style={{fontSize:10.5, color:"var(--ink-dim)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3}}>{k}</div>
      <div className="num" style={{fontSize:14, color: c || "var(--ink-hi)"}}>{v}</div>
    </div>
  );
}

function Source({ name, verified, t }) {
  return (
    <div style={{display:"flex", gap:10, alignItems:"flex-start", padding:"8px 0", borderBottom:"1px solid var(--line)"}}>
      <div style={{flexShrink:0, marginTop:2}}><SourceBadge name={name} verified={verified}/></div>
      <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.45}}>{t}</div>
      <button className="topbar-btn" style={{padding:"4px 6px"}}><Icon name="link" size={12}/></button>
    </div>
  );
}

Object.assign(window, { AssetPage, ExplainPanel });
