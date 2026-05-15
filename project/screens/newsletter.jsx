/* Newsletter Builder */

function NewsletterScreen() {
  const [tone, setTone] = React.useState("calm");
  const [tmpl, setTmpl] = React.useState("daily");
  const [lang, setLang] = React.useState("en");
  const [sections, setSections] = React.useState({
    headline: true, brief: true, movers: true, smart: true, social: true, macro: true, watch: false, charts: true, disc: true,
  });
  const tones = { calm:"Calm & analytical", sharp:"Sharp & punchy", educational:"Educational" };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>NEWSLETTER BUILDER</div>
          <h1 className="page-title">Compose your daily, in 30 seconds</h1>
          <div className="page-sub">Pull from Oswol's intelligence stack, pick a template and tone, and export — Substack, beehiiv, email, PDF.</div>
        </div>
        <div className="page-actions">
          <button className="topbar-btn"><Icon name="eye" size={13}/> Preview email</button>
          <button className="topbar-btn primary"><Icon name="download" size={13}/> Export</button>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:16}}>
        {/* Controls */}
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>Template</div>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              {[
                { k:"daily", t:"The Daily", d:"Punchy market open. 5-min read." },
                { k:"weekly", t:"The Weekly Macro", d:"Long-form recap. 12-min read." },
                { k:"thesis", t:"Single Thesis", d:"One asset, one argument." },
                { k:"crypto", t:"Crypto Watch", d:"On-chain + narrative scan." },
              ].map(o => (
                <button key={o.k} onClick={() => setTmpl(o.k)} style={{textAlign:"left", padding:"12px 14px", background: tmpl === o.k ? "rgba(216,198,167,0.06)" : "var(--bg-2)", border:`1px solid ${tmpl === o.k ? "rgba(216,198,167,0.3)" : "var(--line)"}`, borderRadius:12, cursor:"pointer"}}>
                  <div style={{fontSize:13, color:"var(--ivory)", marginBottom:3}}>{o.t}</div>
                  <div style={{fontSize:11.5, color:"var(--ink-lo)"}}>{o.d}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>Tone</div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {Object.entries(tones).map(([k,t]) => (
                <label key={k} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", background: tone === k ? "rgba(34,211,238,0.06)" : "transparent"}}>
                  <input type="radio" checked={tone === k} onChange={() => setTone(k)} style={{accentColor:"var(--ai)"}}/>
                  <span style={{fontSize:13, color:"var(--ink-md)"}}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>Language</div>
            <div className="seg" style={{width:"100%"}}>
              <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} style={{flex:1}}>English</button>
              <button className={lang === "ar" ? "active" : ""} onClick={() => setLang("ar")} style={{flex:1}}>العربية</button>
              <button className={lang === "bi" ? "active" : ""} onClick={() => setLang("bi")} style={{flex:1}}>Bilingual</button>
            </div>
            <div style={{fontSize:11, color:"var(--ink-dim)", marginTop:8, lineHeight:1.5}}>RTL layout, Arabic typography pairing, and bilingual export are fully supported.</div>
          </div>

          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>Sections</div>
            <div style={{display:"flex", flexDirection:"column", gap:4}}>
              {[
                ["headline","Headline + hook"],
                ["brief","AI market brief"],
                ["movers","Top movers"],
                ["smart","Smart money"],
                ["social","Social narratives"],
                ["macro","Macro events"],
                ["watch","Watchlist update"],
                ["charts","Embedded charts"],
                ["disc","Disclaimer"],
              ].map(([k,t]) => (
                <Toggle key={k} on={sections[k]} onChange={v => setSections(s => ({...s, [k]:v}))} label={t}/>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card" style={{padding:0, background:"var(--bg-elev)"}}>
          <div style={{padding:"14px 18px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div className="card-title">Live preview <span className="lead">· {tones[tone].toLowerCase()}</span></div>
            <div style={{display:"flex", gap:8}}>
              <span className="pill"><Icon name="eye" size={11}/> Reading time 4m</span>
              <span className="pill">Word count 712</span>
            </div>
          </div>
          <NewsletterPreview tone={tone} sections={sections} lang={lang}/>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <label style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:8, cursor:"pointer"}}>
      <span style={{fontSize:13, color: on ? "var(--ink-hi)" : "var(--ink-lo)"}}>{label}</span>
      <button onClick={(e) => { e.preventDefault(); onChange(!on); }} style={{width:32, height:18, borderRadius:999, background: on ? "var(--ai)" : "var(--bg-4)", position:"relative", transition:".15s"}}>
        <span style={{position:"absolute", top:2, left: on ? 16 : 2, width:14, height:14, borderRadius:"50%", background: on ? "var(--bg-0)" : "var(--ink-lo)", transition:".15s"}}/>
      </button>
    </label>
  );
}

function NewsletterPreview({ tone, sections, lang }) {
  const headlines = {
    calm: "AI compute stretches the rally, while April CPI quietly does the heavy lifting",
    sharp: "Cooler CPI + NVDA's $26B quarter = lift-off for AI compute",
    educational: "Why one earnings print just moved an entire supply chain",
  };
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <div style={{padding:"36px 56px", maxHeight:"calc(100vh - 280px)", overflowY:"auto", direction: dir, fontFamily: lang === "ar" ? "Noto Naskh Arabic, var(--font-ui)" : "var(--font-ui)"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:30}}>
        <OsLogoMark size={24}/>
        <span style={{fontFamily:"var(--font-display)", fontSize:15, color:"var(--ivory)", letterSpacing:"-0.01em"}}>Oswol Daily</span>
        <span style={{marginInlineStart:"auto", fontSize:11, color:"var(--ink-lo)", fontFamily:"var(--font-mono)"}}>WED · MAY 15 · 2026</span>
      </div>

      {sections.headline && (
        <>
          <div style={{fontFamily:"var(--font-serif)", fontSize:38, lineHeight:1.15, color:"var(--ivory)", letterSpacing:"-0.01em", marginBottom:16, textWrap:"balance"}}>
            {lang === "ar" ? "حوسبة الذكاء الاصطناعي تطيل موجة الصعود، بينما يقوم تقرير التضخم الأبرد بالعمل الثقيل بهدوء." : headlines[tone]}
          </div>
          <div style={{fontSize:14, color:"var(--ink-md)", lineHeight:1.6, marginBottom:30, textWrap:"pretty"}}>
            {lang === "ar"
              ? "ارتفعت إنفيديا بنسبة 4.21٪ بعد توجيه يفوق التوقعات بنسبة 8٪. أكد التعليق على الإنفاق الرأسمالي للذكاء الاصطناعي تسارع الطلب الهيكلي. ساعد تقرير التضخم الأبرد على دفع عوائد السندات إلى الانخفاض بمقدار 6 نقاط أساس."
              : "NVDA jumped 4.21% after guiding next-quarter revenue 8% above consensus. The capex commentary confirmed accelerating structural demand. Cooler April CPI nudged 10-year yields 6bp lower — and that, more than the print itself, is what's letting compute multiples expand again."}
          </div>
        </>
      )}

      {sections.brief && (
        <NewsletterBlock title={lang === "ar" ? "ملخص اليوم" : "Today's brief"}>
          {(lang === "ar"
            ? ["تصاعد الإنفاق الرأسمالي للذكاء الاصطناعي","CPI 3.4٪ مقابل 3.5٪","العوائد −6 نقاط أساس","مؤشر الخوف 13.4"]
            : ["AI capex commentary accelerated","CPI 3.4% vs 3.5%E","10Y −6bp","VIX 13.4 · calm"]
          ).map((b,i) => (
            <li key={i} style={{padding:"10px 0", borderBottom:"1px solid var(--line)", display:"flex", gap:10, alignItems:"baseline", listStyle:"none"}}>
              <span className="mono" style={{color:"var(--ai)", fontSize:11, minWidth:24}}>{String(i+1).padStart(2,"0")}</span>
              <span style={{fontSize:13.5, color:"var(--ink-md)"}}>{b}</span>
            </li>
          ))}
        </NewsletterBlock>
      )}

      {sections.charts && (
        <NewsletterBlock title={lang === "ar" ? "النجم: NVDA" : "Star of the day · NVDA"}>
          <div style={{padding:14, background:"var(--bg-1)", borderRadius:12, border:"1px solid var(--line)"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
              <div>
                <div style={{fontSize:13, color:"var(--ink-lo)"}}>NVDA · 1D</div>
                <div className="num" style={{fontSize:22, color:"var(--ivory)"}}>942.18</div>
              </div>
              <div className="delta up" style={{fontSize:14}}>+4.21%</div>
            </div>
            <AreaChart data={[880,892,901,895,902,914,920,918,924,931,927,933,941,938,942]} height={120} color="var(--up)"/>
          </div>
        </NewsletterBlock>
      )}

      {sections.movers && (
        <NewsletterBlock title={lang === "ar" ? "أكبر المتحركين" : "Top movers"}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10}}>
            {[["NVDA","+4.21%","var(--up)"],["AMD","+3.40%","var(--up)"],["TSLA","-2.84%","var(--down)"]].map(([s,p,c],i) => (
              <div key={i} style={{padding:"10px 12px", background:"var(--bg-1)", border:"1px solid var(--line)", borderRadius:10}}>
                <div className="mono" style={{fontSize:12, fontWeight:600}}>{s}</div>
                <div className="delta" style={{color:c, fontSize:13, marginTop:3}}>{p}</div>
              </div>
            ))}
          </div>
        </NewsletterBlock>
      )}

      {sections.smart && (
        <NewsletterBlock title={lang === "ar" ? "حركة الأموال الذكية" : "Smart money this morning"}>
          <div style={{fontSize:13, color:"var(--ink-md)", lineHeight:1.65}}>
            {lang === "ar"
              ? "اشترى السيناتور هايل أسهم NVDA بقيمة 1-5 مليون دولار بتاريخ التداول 2 أبريل، وأودع الإفصاح اليوم — تأخير 43 يومًا. أضافت فانتا كابيتال 12.4٪ إلى مركزها في مايكروسوفت."
              : "Sen. Hale disclosed a $1–5M NVDA buy executed on Apr 2 — filed today, 43d delay. Vanta Capital added 12.4% to its MSFT position in Q1. CFO Chen's NVDA sale was a pre-scheduled 10b5-1 program."}
          </div>
        </NewsletterBlock>
      )}

      {sections.disc && (
        <div style={{marginTop:30, paddingTop:16, borderTop:"1px solid var(--line)", fontSize:10.5, color:"var(--ink-dim)", lineHeight:1.6}}>
          {lang === "ar"
            ? "أوسول منصة استخبارات وأبحاث. لا تنفذ صفقات. الإفصاحات السياسية والمؤسسية قد تتأخر 30-45 يومًا. الأداء السابق ليس مؤشرًا للنتائج المستقبلية."
            : "Oswol is a research and intelligence platform. We do not execute trades or provide personalized advice. Insider, institutional, and political trade disclosures carry legal reporting delays of 30–45 days. Past performance is not indicative of future results."}
        </div>
      )}
    </div>
  );
}

function NewsletterBlock({ title, children }) {
  return (
    <div style={{marginBottom:30}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
        <span className="eyebrow" style={{color:"var(--champagne)"}}>{title}</span>
        <div style={{flex:1, height:1, background:"var(--line)"}}/>
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { NewsletterScreen });
