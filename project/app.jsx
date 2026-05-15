/* Oswol App Shell */

const NAV = [
  { section: "WORKSPACE", items: [
    { k:"brief",      t:"Design brief", icon:"doc" },
    { k:"home",       t:"Dashboard",    icon:"home" },
    { k:"asset",      t:"Markets",      icon:"markets" },
  ]},
  { section: "INTELLIGENCE", items: [
    { k:"money",      t:"Smart Money",  icon:"money", badge:"142" },
    { k:"social",     t:"Social",       icon:"social" },
    { k:"heat",       t:"Heat Map",     icon:"heat" },
    { k:"watch",      t:"Watchlist",    icon:"watch", badge:"5" },
  ]},
  { section: "OUTPUT", items: [
    { k:"copilot",    t:"AI Copilot",   icon:"copilot" },
    { k:"newsletter", t:"Newsletter",   icon:"newsletter" },
  ]},
];

const TICKER = [
  { s:"S&P 500", p:"5,308.12", d:0.42 },
  { s:"NDX", p:"18,621", d:0.78 },
  { s:"RUT", p:"2,089", d:-0.18 },
  { s:"DXY", p:"104.32", d:-0.21 },
  { s:"10Y", p:"4.38%", d:-0.06 },
  { s:"BTC", p:"67,420", d:-1.06 },
  { s:"ETH", p:"3,412", d:-1.84 },
  { s:"GOLD", p:"2,348", d:0.62 },
  { s:"OIL", p:"82.14", d:-0.31 },
];

function App() {
  const [route, setRoute] = React.useState("brief");
  const [explainOpen, setExplainOpen] = React.useState(false);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULS);
  const [theme, setTheme] = React.useState("day");

  const navigate = (k) => {
    setRoute(k);
    setExplainOpen(false);
    // scroll content top
    setTimeout(() => {
      const c = document.querySelector(".content");
      if (c) c.scrollTo({ top: 0, behavior: "instant" });
    }, 10);
  };

  // Apply tweaks + theme to root
  React.useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-theme", theme);
    if (theme === "night") {
      r.style.setProperty("--bg-0", tweaks.darkness === "deepest" ? "#06080A" : tweaks.darkness === "soft" ? "#0F1418" : "#0A0D0F");
    } else {
      r.style.removeProperty("--bg-0");
    }
    r.style.setProperty("--accent-active", tweaks.accent);
    r.style.setProperty("--champagne", tweaks.warm ? "#D8C6A7" : "#9CA3AF");
  }, [tweaks, theme]);

  const renderRoute = () => {
    switch (route) {
      case "brief":      return <BriefScreen navigate={navigate}/>;
      case "home":       return <Dashboard navigate={navigate}/>;
      case "asset":      return <AssetPage onExplain={() => setExplainOpen(true)}/>;
      case "money":      return <SmartMoneyScreen/>;
      case "social":     return <SocialScreen/>;
      case "heat":       return <HeatMapScreen/>;
      case "copilot":    return <CopilotScreen/>;
      case "newsletter": return <NewsletterScreen/>;
      case "watch":      return <ComingSoon name="Watchlist Intelligence"/>;
      default:           return <Dashboard navigate={navigate}/>;
    }
  };

  return (
    <div className="app" data-screen-label={`Oswol · ${route}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <OsLogoMark size={28}/>
          <span className="brand-name">oswol</span>
          <span className="brand-dot"/>
        </div>

        {NAV.map((sec, si) => (
          <React.Fragment key={si}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map(it => (
              <div key={it.k} className={`nav-item ${route === it.k ? "active" : ""}`} onClick={() => navigate(it.k)}>
                <Icon name={it.icon} className="nav-icon"/>
                <span>{it.t}</span>
                {it.badge && <span className="badge">{it.badge}</span>}
              </div>
            ))}
          </React.Fragment>
        ))}

        <div className="sidebar-footer">
          <div className="nav-item" onClick={() => navigate("copilot")} style={{background:"linear-gradient(135deg, rgba(34,211,238,0.08), rgba(139,92,246,0.05))", border:"1px solid rgba(34,211,238,0.15)"}}>
            <Icon name="sparkle" className="nav-icon" color="var(--ai)"/>
            <span style={{color:"var(--ivory)"}}>Ask Copilot</span>
            <span className="kbd" style={{marginLeft:"auto"}}>⌘K</span>
          </div>
          <div className="user-chip">
            <div className="avatar">T</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12.5, color:"var(--ink-hi)"}}>Tariq A.</div>
              <div style={{fontSize:10.5, color:"var(--ink-lo)"}}>Pro · ME / GCC</div>
            </div>
            <Icon name="settings" size={14} color="var(--ink-lo)"/>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <button className="topbar-btn" style={{padding:"6px 8px"}}><Icon name="menu" size={16}/></button>
          <div className="search">
            <Icon name="search" size={14} color="var(--ink-lo)"/>
            <input placeholder="Search any asset, person, narrative, or event..." />
            <span className="kbd">⌘ K</span>
          </div>
          <div style={{flex:1, overflow:"hidden", maxWidth:520}}>
            <TopTicker items={TICKER}/>
          </div>
          <div className="market-status">
            <span className="live-dot"/>
            Markets · open · 3h 12m left
          </div>
          <button className="topbar-btn" onClick={() => setTheme(t => t === "night" ? "day" : "night")} title={`Switch to ${theme === "night" ? "day" : "night"} mode`}>
            <Icon name={theme === "night" ? "sun" : "moon"} size={14}/>
          </button>
          <button className="topbar-btn ghost-ai" onClick={() => setExplainOpen(true)}><Icon name="sparkle" size={13}/> Explain</button>
        </div>

        {/* Content */}
        <div className="content">
          {renderRoute()}
        </div>
      </main>

      {/* Right rail */}
      <ExplainPanel open={explainOpen} onClose={() => setExplainOpen(false)}/>
      {explainOpen && <div onClick={() => setExplainOpen(false)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:40}}/>}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Accent">
          <TweakColor label="AI accent" value={tweaks.accent} options={["#22D3EE","#8B5CF6","#D8C6A7","#10B981","#F59E0B"]} onChange={v => setTweak("accent", v)}/>
        </TweakSection>
        <TweakSection label="Surface">
          <TweakRadio label="Dark depth" value={tweaks.darkness} options={["soft","normal","deepest"]} onChange={v => setTweak("darkness", v)}/>
          <TweakToggle label="Warm champagne" value={tweaks.warm} onChange={v => setTweak("warm", v)}/>
        </TweakSection>
        <TweakSection label="Quick action">
          <TweakButton label="Trigger Explain panel" onClick={() => { navigate("asset"); setTimeout(() => setExplainOpen(true), 200); }}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

const TWEAK_DEFAULS = /*EDITMODE-BEGIN*/{
  "accent": "#22D3EE",
  "darkness": "normal",
  "warm": true
}/*EDITMODE-END*/;

function TopTicker({ items }) {
  return (
    <div style={{display:"flex", gap:18, overflow:"hidden", whiteSpace:"nowrap"}}>
      {items.map((t, i) => (
        <div key={i} style={{display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:"var(--ink-lo)"}}>
          <span style={{color:"var(--ink-md)"}}>{t.s}</span>
          <span className="num" style={{color:"var(--ink-hi)"}}>{t.p}</span>
          <span className={`delta ${t.d >= 0 ? "up" : "down"}`} style={{fontSize:11}}>{t.d >= 0 ? "+" : ""}{t.d.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}

function ComingSoon({ name }) {
  return (
    <div style={{display:"grid", placeItems:"center", height:"60vh", textAlign:"center"}}>
      <div>
        <OsLogoMark size={70}/>
        <div style={{fontFamily:"var(--font-display)", fontSize:22, color:"var(--ivory)", marginTop:18, letterSpacing:"-0.015em"}}>{name}</div>
        <div style={{fontSize:13, color:"var(--ink-lo)", marginTop:8}}>This module is part of the Oswol roadmap. Patterns reuse components from Smart Money + Asset Detail.</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
