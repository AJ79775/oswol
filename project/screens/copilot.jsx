/* AI Copilot screen */

const suggestedPrompts = [
  "Why did NVDA move 4% today?",
  "Who's been quietly buying defense stocks in the last 30 days?",
  "Compare AMD vs NVDA on AI exposure and valuation.",
  "Summarize today's macro in 3 bullets.",
  "What narratives are driving small caps this week?",
  "Show me politicians who bought tech in Q1.",
];

function CopilotScreen() {
  const [messages, setMessages] = React.useState([
    { role:"user", text:"What's driving the rally in NVDA today, and is it sustainable?" },
    { role:"ai", text:"NVDA is up <b style=\"color:var(--up)\">4.21%</b> on a clean Q1 beat plus accelerating AI capex commentary from hyperscalers. Three factors:", followUp:[
      { k:"01", t:"Earnings beat — Q1 revenue $26B vs $24.6B consensus. Q2 guide 8% above street." },
      { k:"02", t:"Hyperscaler capex — multi-year AI infra plans reiterated by MSFT, GOOGL, META on their calls." },
      { k:"03", t:"Macro tailwind — April CPI 3.4% vs 3.5%E, 10Y −6bp. Lower rates lift duration-sensitive names." },
    ], conf:82, sources:["Bloomberg","Reuters","SEC 10-Q","BLS","CME FedWatch"], tail:"Sustainability depends on whether <b>capex translates to revenue</b> for compute names beyond NVDA. Watch SOXX breadth and hyperscaler follow-throughs this week." },
    { role:"user", text:"Show me which politicians have bought NVDA in the last 6 months." },
    { role:"ai", text:"In the last 180 days, <b>7 members of Congress</b> have disclosed NVDA purchases:", table:[
      ["Sen. Marcus Hale", "D · CA", "$1–5M", "Apr 2", "filed +43d"],
      ["Rep. James Webb", "R · TX", "$15–50k", "Mar 28", "filed +45d"],
      ["Rep. Elena Park", "R · NY", "$50–100k", "Feb 14", "filed +21d"],
      ["Sen. Maria Lopez", "D · AZ", "$1–15k", "Jan 30", "filed +30d"],
    ], tail:"Note all trades carry filing delays — these are <b style=\"color:var(--warn)\">lagging signals</b>, not real-time positioning.", sources:["STOCK Act filings"], conf:96 },
  ]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const send = (q) => {
    if (!q.trim()) return;
    setMessages(m => [...m, { role:"user", text:q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages(m => [...m, { role:"ai", text:"That's a great question. Here's what I can see from the latest filings, news, and market data — bound to change as new sources come in.", conf:74, sources:["Live data"], tail:"<i>This is a demo response. In production, Oswol Copilot would query the unified market + filings index and stream cited results.</i>" }]);
    }, 900);
  };

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 280px", gap:16, height:"calc(100vh - 56px - 26px - 80px)"}}>
      {/* Chat column */}
      <div style={{display:"flex", flexDirection:"column", minHeight:0}}>
        <div className="page-head" style={{marginBottom:14}}>
          <div>
            <div className="eyebrow" style={{marginBottom:6}}>AI COPILOT</div>
            <h1 className="page-title">Ask anything about the market</h1>
            <div className="page-sub">Cited responses. Source links. Confidence on every answer.</div>
          </div>
          <div className="page-actions">
            <span className="pill ai"><Icon name="sparkle" size={11}/> Oswol AI · v3</span>
            <button className="topbar-btn"><Icon name="plus" size={13}/> New chat</button>
          </div>
        </div>

        <div className="card" style={{flex:1, padding:0, display:"flex", flexDirection:"column", minHeight:0}}>
          <div style={{flex:1, overflowY:"auto", padding:"20px 22px"}}>
            {messages.map((m, i) => (
              <Message key={i} m={m}/>
            ))}
            {thinking && (
              <div style={{display:"flex", gap:12, marginBottom:24}}>
                <AiAvatar/>
                <div style={{padding:"12px 14px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:14, color:"var(--ink-lo)", fontSize:13, display:"flex", alignItems:"center", gap:8}}>
                  <span className="spin" style={{display:"inline-block", width:14, height:14, borderRadius:"50%", border:"2px solid var(--ai)", borderTopColor:"transparent"}}/>
                  searching filings · news · social...
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div style={{padding:"14px 18px", borderTop:"1px solid var(--line)", background:"var(--bg-1)"}}>
            <div style={{display:"flex", gap:8, marginBottom:10, flexWrap:"wrap"}}>
              {["@asset","@filing","@news","@macro","#explain","#compare","#summarize"].map(t => (
                <span key={t} className="pill" style={{cursor:"pointer", fontSize:11}}>{t}</span>
              ))}
            </div>
            <div style={{display:"flex", gap:10, alignItems:"flex-end", padding:"10px 14px", background:"var(--bg-2)", border:"1px solid var(--line-2)", borderRadius:14}}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about an asset, an event, a politician's trades..."
                rows={1}
                style={{flex:1, resize:"none", background:"transparent", border:0, outline:0, color:"var(--ink-hi)", fontSize:13.5, lineHeight:1.5, fontFamily:"var(--font-ui)", padding:"4px 0", maxHeight:120}}
              />
              <button className="topbar-btn primary" style={{padding:"7px 10px"}} onClick={() => send(input)}><Icon name="send" size={14}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        <div className="card">
          <div className="card-title" style={{marginBottom:12}}>Try asking</div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {suggestedPrompts.map((p,i) => (
              <button key={i} onClick={() => send(p)} style={{textAlign:"left", padding:"10px 12px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:10, fontSize:12.5, color:"var(--ink-md)", lineHeight:1.4, cursor:"pointer"}}>{p}</button>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{marginBottom:12}}>Quick actions</div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            <QuickAction icon="brief" t="Generate today's brief"/>
            <QuickAction icon="newsletter" t="Draft a newsletter"/>
            <QuickAction icon="copy" t="Compare two assets"/>
            <QuickAction icon="alert" t="Set up an alert"/>
          </div>
        </div>
        <div className="card" style={{padding:"14px 16px", fontSize:11.5, color:"var(--ink-lo)", lineHeight:1.5}}>
          <div className="eyebrow" style={{marginBottom:6}}>HOW COPILOT WORKS</div>
          Oswol retrieves and synthesizes from a unified market, filings, news, and social index. Every claim is cited. Confidence reflects source quality and agreement, not certainty.
        </div>
      </div>
    </div>
  );
}

function AiAvatar() {
  return (
    <div style={{width:30, height:30, borderRadius:9, background:"linear-gradient(135deg, var(--ai), var(--social))", display:"grid", placeItems:"center", flexShrink:0}}>
      <Icon name="sparkle" size={14} color="#0A0D0F"/>
    </div>
  );
}

function Message({ m }) {
  if (m.role === "user") {
    return (
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:18}}>
        <div style={{maxWidth:"75%", padding:"10px 14px", background:"rgba(216,198,167,0.08)", border:"1px solid rgba(216,198,167,0.2)", borderRadius:14, fontSize:13.5, color:"var(--ivory)", lineHeight:1.5}}>{m.text}</div>
      </div>
    );
  }
  return (
    <div style={{display:"flex", gap:12, marginBottom:24}}>
      <AiAvatar/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{padding:"14px 16px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:14}}>
          <div style={{fontSize:13.5, color:"var(--ink-hi)", lineHeight:1.55, textWrap:"pretty"}} dangerouslySetInnerHTML={{__html:m.text}}/>
          {m.followUp && (
            <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8}}>
              {m.followUp.map((f,i) => (
                <div key={i} style={{display:"flex", gap:10, padding:"10px 12px", background:"var(--bg-1)", borderRadius:10, border:"1px solid var(--line)"}}>
                  <span className="mono" style={{color:"var(--ai)", fontSize:11}}>{f.k}</span>
                  <span style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.5}}>{f.t}</span>
                </div>
              ))}
            </div>
          )}
          {m.table && (
            <table className="tbl" style={{marginTop:12, fontSize:12}}>
              <thead><tr><th>Member</th><th>Affiliation</th><th>Size</th><th>Trade date</th><th>Filing</th></tr></thead>
              <tbody>
                {m.table.map((r,i) => <tr key={i}>{r.map((c,j) => <td key={j} style={{padding:"8px 10px"}}>{c}</td>)}</tr>)}
              </tbody>
            </table>
          )}
          {m.tail && (
            <div style={{marginTop:12, fontSize:13, color:"var(--ink-md)", lineHeight:1.55}} dangerouslySetInnerHTML={{__html:m.tail}}/>
          )}
          {m.sources && (
            <div style={{marginTop:14, paddingTop:12, borderTop:"1px solid var(--line)", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center"}}>
              <span className="eyebrow">SOURCES</span>
              {m.sources.map(s => <SourceBadge key={s} name={s} verified/>)}
              {m.conf && <div style={{marginLeft:"auto"}}><ConfidenceBadge value={m.conf}/></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, t }) {
  return (
    <button style={{display:"flex", gap:10, alignItems:"center", textAlign:"left", padding:"10px 12px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:10, fontSize:12.5, color:"var(--ink-md)", cursor:"pointer"}}>
      <Icon name={icon} size={14} color="var(--ai)"/>
      <span>{t}</span>
      <Icon name="chevron-right" size={12} style={{marginLeft:"auto", opacity:0.5}}/>
    </button>
  );
}

Object.assign(window, { CopilotScreen });
