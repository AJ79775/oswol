/* Social Narrative Scanner */

const narratives = [
  { name:"AI Power Demand", desc:"Hyperscalers + utilities deal flow + nuclear PPAs", vel:92, mentions:"48.2k", risk:"med", confirm:"high", assets:["NVDA","VST","CEG","TLN","SMR"], trend:"surging" },
  { name:"GLP-1 v2.0",      desc:"Oral GLP-1 trial readouts; obesity TAM expansion",      vel:71, mentions:"21.6k", risk:"low", confirm:"high", assets:["LLY","NVO","VKTX"], trend:"rising" },
  { name:"China stimulus",  desc:"PBoC RRR cut whispers; property sector turnaround",     vel:58, mentions:"17.0k", risk:"med", confirm:"med",  assets:["FXI","BABA","KWEB","PDD"], trend:"rising" },
  { name:"Quantum stocks",  desc:"IBM Q-Heron specs leak; meme-tier rotation underway",  vel:41, mentions:"9.4k",  risk:"high",confirm:"low",  assets:["IONQ","RGTI","QBTS"], trend:"cooling" },
  { name:"Uranium squeeze", desc:"Cameco Q1 + Kazakh export caps; SPUT premium expanding",vel:38, mentions:"7.1k",  risk:"low", confirm:"high", assets:["CCJ","UEC","URA"], trend:"rising" },
  { name:"Defense rebuild", desc:"Pentagon FY27 budget leak; missiles + drones focus",   vel:34, mentions:"5.6k",  risk:"low", confirm:"med",  assets:["LMT","RTX","KTOS"], trend:"flat" },
];

function SocialScreen() {
  const [sel, setSel] = React.useState(0);
  const n = narratives[sel];
  const riskColor = (r) => r === "high" ? "var(--down)" : r === "med" ? "var(--warn)" : "var(--up)";

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>SOCIAL NARRATIVE SCANNER</div>
          <h1 className="page-title">What the internet is talking about</h1>
          <div className="page-sub">Ranked by velocity and cross-platform reach. Hype-risk flags help separate real signals from retail froth.</div>
        </div>
        <div className="page-actions">
          <div className="seg">
            <button className="active">1h</button>
            <button>24h</button>
            <button>7d</button>
          </div>
          <button className="topbar-btn"><Icon name="filter" size={13}/> Sources</button>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:"1fr 1.1fr", marginBottom:16}}>
        {/* Narratives list */}
        <div className="card" style={{padding:0}}>
          <div style={{padding:"14px 18px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between"}}>
            <div className="card-title">Trending narratives</div>
            <span className="pill social">ranked by velocity</span>
          </div>
          <div>
            {narratives.map((nn, i) => (
              <div key={i} onClick={() => setSel(i)} style={{padding:"14px 18px", borderBottom: i<narratives.length-1 ? "1px solid var(--line)" : 0, cursor:"pointer", background: sel === i ? "rgba(139,92,246,0.04)" : "transparent", borderLeft: sel === i ? "2px solid var(--social)" : "2px solid transparent"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
                  <div style={{display:"flex", alignItems:"baseline", gap:10}}>
                    <span className="mono" style={{fontSize:11, color:"var(--ink-dim)"}}>{String(i+1).padStart(2,"0")}</span>
                    <span style={{fontSize:14, color:"var(--ivory)", fontWeight:500}}>{nn.name}</span>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <span className="pill" style={{fontSize:10, color: riskColor(nn.risk), borderColor:"transparent", padding:"0 4px"}}>hype · {nn.risk}</span>
                    <span style={{fontSize:11.5, color:"var(--social)"}}>{nn.trend === "surging" ? "▲▲" : nn.trend === "rising" ? "▲" : nn.trend === "cooling" ? "▼" : "→"} {nn.trend}</span>
                  </div>
                </div>
                <div style={{fontSize:12, color:"var(--ink-lo)", marginBottom:10, lineHeight:1.5}}>{nn.desc}</div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{flex:1, height:4, background:"rgba(139,92,246,0.08)", borderRadius:999, overflow:"hidden"}}>
                    <div style={{width:`${nn.vel}%`, height:"100%", background:"linear-gradient(90deg, var(--social), var(--ai))"}}/>
                  </div>
                  <span className="mono" style={{fontSize:11, color:"var(--ink-md)", minWidth:60, textAlign:"right"}}>{nn.mentions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <NarrativeDetail n={n}/>
      </div>

      <DiscussionsCard/>
      <DisclaimerFooter/>
    </div>
  );
}

function NarrativeDetail({ n }) {
  const riskColor = (r) => r === "high" ? "var(--down)" : r === "med" ? "var(--warn)" : "var(--up)";
  const confColor = (c) => c === "high" ? "var(--up)" : c === "med" ? "var(--champagne)" : "var(--warn)";
  return (
    <div className="ai-stripe" style={{padding:0, overflow:"hidden"}}>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:14}}>
          <span className="pill social"><Icon name="sparkle" size={11}/> NARRATIVE</span>
          <span style={{fontSize:11.5, color:"var(--ink-lo)"}}>auto-clustered · 2,418 source posts</span>
        </div>
        <div style={{fontFamily:"var(--font-display)", fontSize:22, letterSpacing:"-0.015em", color:"var(--ivory)", marginBottom:6}}>{n.name}</div>
        <div style={{fontSize:13, color:"var(--ink-md)", lineHeight:1.5, marginBottom:18}}>{n.desc}</div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18}}>
          <DetailStat k="Velocity" v={`${n.vel}`} c="var(--social)"/>
          <DetailStat k="Mentions 24h" v={n.mentions} c="var(--ink-hi)"/>
          <DetailStat k="Hype risk" v={n.risk.toUpperCase()} c={riskColor(n.risk)}/>
          <DetailStat k="News confirm" v={n.confirm.toUpperCase()} c={confColor(n.confirm)}/>
        </div>

        <div className="eyebrow" style={{marginBottom:10}}>RELATED ASSETS</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:18}}>
          {n.assets.map(a => (
            <span key={a} className="pill" style={{color:"var(--ivory)", borderColor:"var(--line-2)", padding:"4px 10px"}}>
              <span className="mono" style={{fontWeight:600}}>{a}</span>
            </span>
          ))}
        </div>

        <div className="eyebrow" style={{marginBottom:10}}>PLATFORM BREAKDOWN</div>
        <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:18}}>
          {[
            ["X / Twitter", 64, "var(--social)"],
            ["Reddit",       22, "var(--social)"],
            ["TikTok",       9,  "var(--social)"],
            ["Discord",      5,  "var(--social)"],
          ].map(([k,v,c],i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{fontSize:11.5, color:"var(--ink-md)", width:90}}>{k}</span>
              <div style={{flex:1, height:4, background:"rgba(139,92,246,0.08)", borderRadius:999}}><div style={{width:`${v}%`, height:"100%", background:c, borderRadius:999}}/></div>
              <span className="mono" style={{fontSize:11, color:"var(--ink-lo)", width:30, textAlign:"right"}}>{v}%</span>
            </div>
          ))}
        </div>

        {n.risk === "high" && (
          <div style={{padding:"10px 12px", background:"var(--down-soft)", border:"1px solid rgba(251,113,133,0.25)", borderRadius:10, fontSize:11.5, color:"var(--ink-md)", display:"flex", gap:8, lineHeight:1.5, marginBottom:12}}>
            <Icon name="alert" size={13} color="var(--down)" style={{flexShrink:0, marginTop:1}}/>
            <div><b style={{color:"var(--down)"}}>Rumor warning:</b> mentions are concentrated in retail/meme communities. News confirmation is low. Treat as speculation until primary sources confirm.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailStat({ k, v, c }) {
  return (
    <div style={{padding:"10px 12px", background:"rgba(241,235,221,0.025)", borderRadius:10, border:"1px solid var(--line)"}}>
      <div className="eyebrow" style={{marginBottom:4}}>{k}</div>
      <div className="num" style={{fontSize:18, color: c}}>{v}</div>
    </div>
  );
}

function DiscussionsCard() {
  const posts = [
    { src:"X · @energy_macro", t:"Power demand for AI hits the grid. PJM auction prices doubling. This is the next leg, not the GPUs.", eng:"4.2k", time:"1h" },
    { src:"Reddit · r/stocks", t:"Calling it now: utilities outperform semis next 12 months. VST + CEG already ripping.", eng:"1.8k", time:"3h" },
    { src:"X · @hyperscale_io", t:"NVDA call — explicit mention of grid-constrained datacenters. Buy boring power names.", eng:"3.1k", time:"4h" },
    { src:"TikTok · finance creator", t:"Your great-grandparents' nuclear stock is now a tech stock 🚀", eng:"42k", time:"6h" },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Top discussions · AI Power Demand</div>
        <span className="pill">live · 4 platforms</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        {posts.map((p,i) => (
          <div key={i} style={{padding:"12px 14px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
              <span style={{fontSize:11.5, color:"var(--ink-md)"}}>{p.src}</span>
              <span style={{fontSize:11, color:"var(--ink-dim)"}}>{p.time} ago · {p.eng} eng.</span>
            </div>
            <div style={{fontSize:13, color:"var(--ink-hi)", lineHeight:1.5, textWrap:"pretty"}}>"{p.t}"</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SocialScreen });
