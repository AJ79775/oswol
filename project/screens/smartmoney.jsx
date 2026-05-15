/* Smart Money Radar — full screen */

const smartMoneyData = [
  { who:"Sen. Marcus Hale", chamber:"Senate · CA", party:"D", role:"Senator", action:"Bought", asset:"NVDA", price:"$904", size:"$1–5M", traded:"Apr 2, 2026", filed:"May 15, 2026", delay:43, sig:78, src:"STOCK Act" },
  { who:"Rep. Elena Park", chamber:"House · NY", party:"R", role:"Senator", action:"Bought", asset:"AVGO", price:"$1,612", size:"$50–100k", traded:"Apr 18", filed:"May 15", delay:27, sig:64, src:"STOCK Act" },
  { who:"Vanta Capital", chamber:"$22B AUM", party:"—", role:"Hedge Fund", action:"+12.4%", asset:"MSFT", price:"avg $402", size:"$220M", traded:"Q1 2026", filed:"May 14", delay:45, sig:71, src:"13F" },
  { who:"Aragon Partners", chamber:"$8B AUM", party:"—", role:"Hedge Fund", action:"NEW", asset:"AMD", price:"avg $158", size:"$84M", traded:"Q1 2026", filed:"May 14", delay:45, sig:69, src:"13F" },
  { who:"L. Chen", chamber:"NVDA · CFO", party:"—", role:"Insider", action:"Sold", asset:"NVDA", price:"$938", size:"$2.1M", traded:"May 13", filed:"May 15", delay:2, sig:52, src:"Form 4 · 10b5-1" },
  { who:"D. Ortega", chamber:"AMD · Director", party:"—", role:"Insider", action:"Bought", asset:"AMD", price:"$159", size:"$220k", traded:"May 12", filed:"May 13", delay:1, sig:74, src:"Form 4" },
  { who:"Sen. James Webb", chamber:"Senate · TX", party:"R", role:"Senator", action:"Bought", asset:"LMT", price:"$478", size:"$15–50k", traded:"Mar 28", filed:"May 12", delay:45, sig:58, src:"STOCK Act" },
  { who:"Crescent Asset", chamber:"$14B AUM", party:"—", role:"Hedge Fund", action:"−18%", asset:"TSLA", price:"avg $192", size:"−$140M", traded:"Q1 2026", filed:"May 14", delay:45, sig:61, src:"13F" },
];

function SmartMoneyScreen() {
  const [tab, setTab] = React.useState("all");
  const filtered = tab === "all" ? smartMoneyData : smartMoneyData.filter(d => d.role.toLowerCase().includes(tab));

  const sigColor = (s) => s >= 70 ? "var(--up)" : s >= 55 ? "var(--champagne)" : "var(--ink-md)";

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>SMART MONEY RADAR</div>
          <h1 className="page-title">Who's buying what, and when did they actually do it</h1>
          <div className="page-sub">Politicians, insiders, and institutional funds — with the gap between trade date and filing date made explicit.</div>
        </div>
        <div className="page-actions">
          <div className="seg">
            <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All</button>
            <button className={tab === "senator" ? "active" : ""} onClick={() => setTab("senator")}>Politicians</button>
            <button className={tab === "insider" ? "active" : ""} onClick={() => setTab("insider")}>Insiders</button>
            <button className={tab === "fund" ? "active" : ""} onClick={() => setTab("fund")}>Hedge funds</button>
          </div>
          <button className="topbar-btn"><Icon name="filter" size={13}/> Filter</button>
          <button className="topbar-btn"><Icon name="download" size={13}/></button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid" style={{gridTemplateColumns:"repeat(4,1fr)", marginBottom:16}}>
        <StatCard k="Filings today" v="142" sub="▲ 18 vs avg" c="var(--ink-hi)"/>
        <StatCard k="Net political flow · 7d" v="+$48M" sub="Tech & defense leading" c="var(--up)"/>
        <StatCard k="Avg reporting delay" v="32 days" sub="Median 28 · STOCK Act" c="var(--warn)"/>
        <StatCard k="High-signal trades" v="9" sub="Score ≥ 70" c="var(--ai)"/>
      </div>

      {/* Delay warning callout */}
      <div className="card" style={{marginBottom:16, padding:"14px 18px", borderColor:"rgba(245,158,11,0.25)", background:"linear-gradient(180deg, rgba(245,158,11,0.04), transparent), var(--bg-1)"}}>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <Icon name="alert" size={18} color="var(--warn)"/>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5, color:"var(--ivory)", marginBottom:3}}>Trade date ≠ filing date.</div>
            <div style={{fontSize:12, color:"var(--ink-lo)"}}>Political disclosures are reported up to <b>45 days</b> after the trade under the STOCK Act. Treat these signals as <b>lagging confirmation</b>, never as real-time positioning.</div>
          </div>
          <button className="topbar-btn ghost-ai">Read methodology <Icon name="arrow-right" size={12}/></button>
        </div>
      </div>

      {/* Filings table */}
      <div className="card" style={{padding:0}}>
        <div style={{padding:"14px 18px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div className="card-title">Recent filings <span className="lead">· {filtered.length} results</span></div>
          <div style={{display:"flex", gap:8}}>
            <span className="pill"><Icon name="calendar" size={11}/> Last 24h</span>
            <span className="pill">All assets</span>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:60}}></th>
              <th>Who</th>
              <th>Action</th>
              <th>Asset</th>
              <th>Size</th>
              <th>Trade date</th>
              <th>Filed</th>
              <th>Delay</th>
              <th>Signal</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r,i) => (
              <tr key={i}>
                <td>
                  <div className="avatar" style={{width:34, height:34, borderRadius:10, background: r.role === "Insider" ? "rgba(34,211,238,0.12)" : r.role === "Hedge Fund" ? "rgba(216,198,167,0.12)" : "rgba(139,92,246,0.14)", color: r.role === "Insider" ? "var(--ai)" : r.role === "Hedge Fund" ? "var(--champagne)" : "var(--social)", fontSize:10, fontFamily:"var(--font-mono)"}}>
                    {r.role === "Insider" ? "INS" : r.role === "Hedge Fund" ? "FND" : "GOV"}
                  </div>
                </td>
                <td>
                  <div style={{color:"var(--ink-hi)"}}>{r.who}</div>
                  <div style={{fontSize:11, color:"var(--ink-lo)", marginTop:2}}>{r.chamber}</div>
                </td>
                <td>
                  <span style={{color: r.action.includes("Bought") || r.action.includes("+") || r.action === "NEW" ? "var(--up)" : "var(--down)", fontSize:12.5}}>{r.action}</span>
                  <div style={{fontSize:10.5, color:"var(--ink-dim)", marginTop:2}}>@ {r.price}</div>
                </td>
                <td className="mono" style={{color:"var(--ivory)", fontWeight:600}}>{r.asset}</td>
                <td className="num" style={{color:"var(--ink-md)"}}>{r.size}</td>
                <td className="mono" style={{color:"var(--ink-md)", fontSize:11.5}}>{r.traded}</td>
                <td className="mono" style={{color:"var(--ink-md)", fontSize:11.5}}>{r.filed}</td>
                <td>
                  <span className="pill" style={{borderColor: r.delay > 30 ? "rgba(245,158,11,0.3)" : r.delay > 5 ? "rgba(216,198,167,0.3)" : "rgba(16,185,129,0.3)", color: r.delay > 30 ? "var(--warn)" : r.delay > 5 ? "var(--champagne)" : "var(--up)"}}>+{r.delay}d</span>
                </td>
                <td>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <div style={{width:50, height:4, background:"rgba(241,235,221,0.06)", borderRadius:999, overflow:"hidden"}}>
                      <div style={{width:`${r.sig}%`, height:"100%", background:sigColor(r.sig)}}/>
                    </div>
                    <span className="mono" style={{fontSize:11, color: sigColor(r.sig), minWidth:18}}>{r.sig}</span>
                  </div>
                </td>
                <td><SourceBadge name={r.src} verified/></td>
                <td><button className="topbar-btn" style={{padding:"4px 6px"}}><Icon name="link" size={12}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DisclaimerFooter/>
    </div>
  );
}

function StatCard({ k, v, sub, c }) {
  return (
    <div className="card">
      <div className="eyebrow" style={{marginBottom:8}}>{k}</div>
      <div className="num" style={{fontSize:26, letterSpacing:"-0.02em", color: c}}>{v}</div>
      <div style={{fontSize:11.5, color:"var(--ink-lo)", marginTop:6}}>{sub}</div>
    </div>
  );
}

Object.assign(window, { SmartMoneyScreen });
