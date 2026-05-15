/* Brief / overview screen — design direction summary embedded inside the product */

function BriefScreen({ navigate }) {
  return (
    <div style={{maxWidth:980}}>
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>OSWOL · DESIGN DIRECTION</div>
          <h1 className="page-title" style={{fontSize:34, lineHeight:1.15}}>Calm intelligence for the next generation of investors.</h1>
          <div className="page-sub" style={{maxWidth:680, marginTop:10, fontSize:14, lineHeight:1.55}}>
            Oswol is a market-intelligence terminal — not a broker, not a meme-trading app, not an old institutional grid. This brief documents the design direction, palette, and component system used in the prototype you're navigating.
          </div>
        </div>
        <div className="page-actions">
          <button className="topbar-btn primary" onClick={() => navigate("home")}><Icon name="arrow-right" size={13}/> Open dashboard</button>
        </div>
      </div>

      {/* Hero — logo + palette */}
      <div className="card" style={{padding:36, marginBottom:24, background:"linear-gradient(135deg, rgba(216,198,167,0.04), rgba(34,211,238,0.03)), var(--bg-1)", overflow:"hidden", position:"relative"}}>
        <div style={{position:"absolute", right:-80, top:-80, opacity:0.08}}><OsLogoMark size={400}/></div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, position:"relative"}}>
          <div>
            <div className="eyebrow" style={{marginBottom:10}}>BRAND ANCHOR</div>
            <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:24}}>
              <OsLogoMark size={80}/>
              <div>
                <div style={{fontFamily:"var(--font-display)", fontSize:34, letterSpacing:"-0.02em", color:"var(--ivory)"}}>Oswol</div>
                <div style={{fontSize:13, color:"var(--ink-lo)", marginTop:2}}>Market intelligence · AI · research</div>
              </div>
            </div>
            <div style={{fontSize:13.5, color:"var(--ink-md)", lineHeight:1.65, textWrap:"pretty"}}>
              The mark reads as <b style={{color:"var(--ivory)"}}>circle + bars + sprout + curve</b>. We interpret that as <b style={{color:"var(--champagne)"}}>ecosystem, analytics, intelligent growth, and momentum</b> — not agriculture. The system that follows turns that into UI: ringed compositions, ascending-bar motifs, and quiet curved accents over a calm slate ground.
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:10}}>FOUNDATION PALETTE</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginBottom:18}}>
              <Swatch c="#47555E" name="Deep Slate" hex="#47555E"/>
              <Swatch c="#5E6B73" name="Slate" hex="#5E6B73"/>
              <Swatch c="#D8C6A7" name="Champagne" hex="#D8C6A7"/>
              <Swatch c="#F1EBDD" name="Ivory" hex="#F1EBDD"/>
            </div>
            <div className="eyebrow" style={{marginBottom:10}}>FUNCTIONAL ACCENTS</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10}}>
              <Swatch c="#22D3EE" name="AI" hex="cyan"/>
              <Swatch c="#8B5CF6" name="Social" hex="violet"/>
              <Swatch c="#10B981" name="Up" hex="emerald"/>
              <Swatch c="#FB7185" name="Down" hex="coral"/>
              <Swatch c="#F59E0B" name="Warn" hex="amber"/>
            </div>
          </div>
        </div>
      </div>

      {/* Principles */}
      <div className="grid" style={{gridTemplateColumns:"repeat(4,1fr)", marginBottom:24}}>
        <Principle k="01" t="Signal over noise" b="Every screen answers one question in 5 seconds; detail lives behind progressive disclosure."/>
        <Principle k="02" t="Calm density" b="Dense data, but composed: hairlines instead of borders, mono numbers, generous whitespace around the headline."/>
        <Principle k="03" t="Trust by design" b="Sources, delays, and confidence are first-class UI — not afterthoughts in footers."/>
        <Principle k="04" t="AI as a quiet host" b="AI suggests, summarizes, and explains. It never shouts. Cyan is its hue, used sparingly as accent, not background."/>
      </div>

      {/* Type system */}
      <div className="card" style={{marginBottom:24, padding:28}}>
        <div className="eyebrow" style={{marginBottom:14}}>TYPE SYSTEM</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24}}>
          <TypeSample family="Sora" stack="var(--font-display)" sample="Aa 942.18" role="Display · headlines · numbers in hero"/>
          <TypeSample family="Geist" stack="var(--font-ui)" sample="Aa Bb Cc" role="UI · body · navigation"/>
          <TypeSample family="JetBrains Mono" stack="var(--font-mono)" sample="0123 +4.21%" role="Numbers · tickers · timestamps"/>
        </div>
        <div className="divider"/>
        <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.6, textWrap:"pretty"}}>
          Bilingual ready: the system pairs cleanly with <b>Noto Naskh Arabic</b> for RTL, with the same xheight rhythm and editorial color. A subtle serif (<b>Instrument Serif</b>) is reserved for one moment per surface — newsletter headlines, marketing — never inside the live app.
        </div>
      </div>

      {/* Anti-patterns */}
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", marginBottom:24}}>
        <div className="card" style={{borderColor:"rgba(16,185,129,0.2)"}}>
          <div className="eyebrow" style={{color:"var(--up)", marginBottom:12}}>DO</div>
          <ul style={{margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:13, color:"var(--ink-md)", lineHeight:1.5}}>
            <li><b style={{color:"var(--ivory)"}}>·</b> Lead with the AI summary; relegate raw tables to second click.</li>
            <li><b style={{color:"var(--ivory)"}}>·</b> Show source, delay, confidence on every claim.</li>
            <li><b style={{color:"var(--ivory)"}}>·</b> Use champagne as a precious accent, not a fill.</li>
            <li><b style={{color:"var(--ivory)"}}>·</b> Hairlines, gaps, and rhythm — not boxes within boxes.</li>
          </ul>
        </div>
        <div className="card" style={{borderColor:"rgba(251,113,133,0.2)"}}>
          <div className="eyebrow" style={{color:"var(--down)", marginBottom:12}}>DON'T</div>
          <ul style={{margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:13, color:"var(--ink-md)", lineHeight:1.5}}>
            <li><b style={{color:"var(--ivory)"}}>·</b> Neon gradients, glassmorphism, crypto-casino energy.</li>
            <li><b style={{color:"var(--ivory)"}}>·</b> "Old Bloomberg" dense grids without hierarchy.</li>
            <li><b style={{color:"var(--ivory)"}}>·</b> Emoji confetti, gamified streaks, childish CTAs.</li>
            <li><b style={{color:"var(--ivory)"}}>·</b> AI marketed as magic — always cite and qualify.</li>
          </ul>
        </div>
      </div>

      {/* Component menu */}
      <div className="card" style={{padding:28, marginBottom:24}}>
        <div className="eyebrow" style={{marginBottom:14}}>COMPONENT KIT — A FEW EXEMPLARS</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16}}>
          <CompTile title="ConfidenceBadge"><ConfidenceBadge value={82}/></CompTile>
          <CompTile title="HypeRiskBadge"><span className="pill warn"><Icon name="alert" size={11}/> hype risk · med</span></CompTile>
          <CompTile title="SignalScoreBadge"><div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:60, height:4, background:"rgba(241,235,221,0.06)", borderRadius:999}}><div style={{width:"78%", height:"100%", background:"var(--up)", borderRadius:999}}/></div><span className="mono" style={{fontSize:11, color:"var(--up)"}}>78</span></div></CompTile>
          <CompTile title="SourceBadge"><div style={{display:"flex", gap:6}}><SourceBadge name="Bloomberg" verified/><SourceBadge name="X"/></div></CompTile>
          <CompTile title="DelayChip"><span className="pill warn">+43d delay</span></CompTile>
          <CompTile title="DeltaNumber"><span className="delta up">+4.21%</span> <span style={{margin:"0 8px", color:"var(--ink-dim)"}}>·</span> <span className="delta down">−2.84%</span></CompTile>
        </div>
      </div>

      {/* Screen navigation grid */}
      <div className="card" style={{padding:28}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:18}}>
          <div className="eyebrow">EXPLORE THE PROTOTYPE</div>
          <div style={{fontSize:12, color:"var(--ink-lo)"}}>Click any tile to navigate</div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14}}>
          {[
            { k:"home", t:"Dashboard", d:"AI brief, pulse, smart money, heat map" },
            { k:"asset", t:"Asset Detail", d:"NVDA · Explain This Move panel" },
            { k:"money", t:"Smart Money", d:"Politicians, insiders, hedge funds" },
            { k:"social", t:"Social Narratives", d:"Velocity, hype risk, discussions" },
            { k:"heat", t:"Heat Map", d:"N-100, sectors, ETFs, crypto" },
            { k:"copilot", t:"AI Copilot", d:"Cited conversational research" },
            { k:"newsletter", t:"Newsletter", d:"Templates, tone, bilingual export" },
          ].map(t => (
            <button key={t.k} onClick={() => navigate(t.k)} style={{textAlign:"left", padding:"14px 16px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:14, cursor:"pointer", transition:"background .15s"}}>
              <div style={{fontFamily:"var(--font-display)", fontSize:15, color:"var(--ivory)", letterSpacing:"-0.01em", marginBottom:4}}>{t.t}</div>
              <div style={{fontSize:11.5, color:"var(--ink-lo)", lineHeight:1.5}}>{t.d}</div>
              <div style={{marginTop:10, fontSize:11, color:"var(--ai)"}}>Open <Icon name="arrow-right" size={11}/></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Swatch({ c, name, hex }) {
  return (
    <div>
      <div style={{height:54, borderRadius:10, background:c, border:"1px solid var(--line)", marginBottom:6}}/>
      <div style={{fontSize:11, color:"var(--ink-md)"}}>{name}</div>
      <div className="mono" style={{fontSize:10, color:"var(--ink-dim)"}}>{hex}</div>
    </div>
  );
}

function Principle({ k, t, b }) {
  return (
    <div className="card" style={{padding:18}}>
      <div className="mono" style={{fontSize:11, color:"var(--champagne)", letterSpacing:"0.16em", marginBottom:14}}>{k}</div>
      <div style={{fontFamily:"var(--font-display)", fontSize:17, color:"var(--ivory)", letterSpacing:"-0.01em", marginBottom:10}}>{t}</div>
      <div style={{fontSize:12.5, color:"var(--ink-md)", lineHeight:1.55}}>{b}</div>
    </div>
  );
}

function TypeSample({ family, stack, sample, role }) {
  return (
    <div style={{padding:"14px 0"}}>
      <div style={{fontFamily:stack, fontSize:48, color:"var(--ivory)", letterSpacing:"-0.02em", lineHeight:1.1, marginBottom:10}}>{sample}</div>
      <div style={{fontSize:12.5, color:"var(--ink-hi)"}}>{family}</div>
      <div style={{fontSize:11, color:"var(--ink-lo)", marginTop:2}}>{role}</div>
    </div>
  );
}

function CompTile({ title, children }) {
  return (
    <div style={{padding:"14px 16px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12}}>
      <div className="eyebrow" style={{marginBottom:12}}>{title}</div>
      {children}
    </div>
  );
}

Object.assign(window, { BriefScreen });
