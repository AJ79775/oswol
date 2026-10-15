/* Oswol Daily Brief — deterministic scene engine.
 * Every frame is a pure function of time: OSV.mount(i) builds scene i, OSV.seek(t) poses it.
 * No CSS transitions or timers are used, so frame capture is exact and repeatable. */
(function () {
  "use strict";
  let S = null;      // story (from Python)
  let cur = null;    // current scene state
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const prog = (t, s, d) => clamp((t - s) / Math.max(d, 1e-6));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  function el(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  /* ---------------- animation registry ---------------- */
  function A(node, start, kind, dur, opts) {
    if (!node) return node;
    cur.anims.push({ node, start, kind: kind || "up", dur: dur == null ? 0.6 : dur, opts: opts || {} });
    if (kind !== "count" && kind !== "draw") node.style.opacity = 0;
    return node;
  }
  function ACT(node, start, end, fn) { cur.actives.push({ node, start, end, fn }); }
  // Quiet focus on the item being discussed: champagne hairline, no glow (diagram-design: borders, not shadows).
  function focus(nodes, times, endT) {
    nodes.forEach((n, i) => {
      const t0 = times[i], t1 = i + 1 < times.length ? times[i + 1] : endT;
      if (t0 == null) return;
      ACT(n, t0 + 0.25, Math.max(t0 + 0.8, t1), (node, a) => (node.style.borderColor = a > 0 ? `rgba(216,198,167,${0.12 + 0.5 * a})` : ""));
    });
  }

  function applyAnim(a, t) {
    const raw = prog(t, a.start, a.dur);
    const p = a.opts.linear ? raw : easeOut(raw);
    const s = a.node.style;
    switch (a.kind) {
      case "fade": s.opacity = p; break;
      case "up": s.opacity = p; s.transform = `translateY(${(1 - p) * (a.opts.dist || 26)}px)`; break;
      case "down": s.opacity = p; s.transform = `translateY(${-(1 - p) * (a.opts.dist || 20)}px)`; break;
      case "left": s.opacity = p; s.transform = `translateX(${-(1 - p) * (a.opts.dist || 40)}px)`; break;
      case "right": s.opacity = p; s.transform = `translateX(${(1 - p) * (a.opts.dist || 40)}px)`; break;
      case "scale": s.opacity = p; s.transform = `scale(${0.94 + 0.06 * p})`; break;
      case "growX": s.opacity = raw > 0 ? 1 : 0; s.transform = `scaleX(${p})`; break;
      case "growY": s.opacity = raw > 0 ? 1 : 0; s.transform = `scaleY(${p})`; break;
      case "draw": s.strokeDashoffset = (a.opts.len || 1000) * (1 - easeInOut(raw)); s.opacity = raw > 0 ? 1 : 0; break;
      case "count": {
        s.opacity = clamp(raw * 3);
        a.node.textContent = formatNum(a.opts.num, easeOut(raw));
        break;
      }
    }
  }

  /* numbers: "5,308.12" / "+4.21%" / "$67,420" / "48.2k" counted up from zero */
  function parseNum(str) {
    const m = String(str).match(/^([^\d\-−+]*)([+\-−]?)([\d,]*\.?\d+)(.*)$/);
    if (!m) return null;
    const digits = m[3];
    return { pre: m[1], sign: m[2], val: parseFloat(digits.replace(/,/g, "")), dec: (digits.split(".")[1] || "").length, comma: digits.includes(","), post: m[4] };
  }
  function formatNum(n, p) {
    if (!n) return "";
    let v = (n.val * p).toFixed(n.dec);
    if (n.comma) { const [i, d] = v.split("."); v = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : ""); }
    return n.pre + n.sign + v + n.post;
  }
  function countable(node, text, start, dur) {
    const n = parseNum(text);
    if (!n) { A(node, start, "up", 0.5); node.textContent = text; return; }
    node.textContent = text;
    A(node, start, "count", dur || 0.9, { num: n });
  }
  const pct = (v) => (v == null ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(Math.abs(v) < 10 ? 2 : 1).replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m)) + "%");
  const pctFixed = (v) => (v == null ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2) + "%");

  /* fit text by shrinking font size until it fits its box */
  function fit(node, maxH, minPx) {
    if (!node) return;
    let size = parseFloat(getComputedStyle(node).fontSize);
    let guard = 40;
    while (node.scrollHeight > maxH && size > minPx && guard-- > 0) { size -= 2; node.style.fontSize = size + "px"; }
  }
  function fitBox(box, minScale) {
    // shrink every font in a container proportionally until it fits vertically
    let scale = 1, guard = 20;
    const base = $$("*", box).map((n) => [n, parseFloat(getComputedStyle(n).fontSize)]);
    while (box.scrollHeight > box.clientHeight + 2 && scale > (minScale || 0.7) && guard-- > 0) {
      scale -= 0.04;
      base.forEach(([n, px]) => (n.style.fontSize = px * scale + "px"));
    }
  }

  const regimeClass = (r) => ({ "RISK-ON": "up", "RISK-OFF": "down", MIXED: "warn" }[String(r || "").toUpperCase()] || "");
  function regimeChip(r) {
    if (!r) return "";
    return `<span class="chip ${regimeClass(r)}"><span class="dot"></span>Regime · ${esc(String(r).toUpperCase())}</span>`;
  }
  function head(sc, d, extra) {
    const eyebrow = sc.number ? `${sc.number} · ${esc(sc.chapter)}` : esc(sc.chapter);
    return `<div class="head"><div><div class="eyebrow">${eyebrow}</div><h2>${esc(d.title || sc.chapter)}</h2></div>${extra || ""}</div>`;
  }
  function animHead(root) {
    A($(".head .eyebrow", root), 0.12, "up", 0.5, { dist: 14 });
    A($(".head h2", root), 0.22, "up", 0.6, { dist: 20 });
    $$(".head > :not(div:first-child)", root).forEach((n, i) => A(n, 0.5 + i * 0.1, "fade", 0.5));
  }

  /* ---------------- brand motif: circle + bars + curve (from the Oswol mark) ---------------- */
  function motifSVG(withBars) {
    const bars = [120, 170, 220, 270, 320].map((h, i) =>
      `<rect class="mb" x="${232 + i * 34}" y="${392 - h}" width="16" height="${h}" rx="8" fill="${i % 2 ? "#5E6B73" : "#D8C6A7"}" opacity="${0.55 + i * 0.09}" style="transform-origin:${240 + i * 34}px 392px"/>`).join("");
    return `<svg viewBox="0 0 520 520">
      <g class="spin" style="transform-origin:260px 260px">
        <circle class="ring r1" cx="260" cy="260" r="236" fill="none" stroke="#47555E" stroke-width="12" stroke-linecap="round" stroke-dasharray="1483" stroke-dashoffset="1483"/>
        <circle class="ring r2" cx="260" cy="260" r="204" fill="none" stroke="#D8C6A7" stroke-width="7" stroke-linecap="round" stroke-dasharray="1100 1282" stroke-dashoffset="1100" transform="rotate(-70 260 260)"/>
        <circle class="ring r3" cx="260" cy="260" r="174" fill="none" stroke="#5E6B73" stroke-width="4" stroke-linecap="round" stroke-dasharray="820 1093" stroke-dashoffset="820" transform="rotate(30 260 260)"/>
      </g>
      ${withBars === false ? "" : bars}
      <path class="curve" d="M96 404 C 190 470, 330 470, 452 300" fill="none" stroke="#22D3EE" stroke-width="5" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460" opacity=".9"/>
    </svg>`;
  }
  function animMotif(root, t0) {
    const rings = $$(".ring", root);
    A(rings[0], t0, "draw", 1.6, { len: 1483 });
    A(rings[1], t0 + 0.25, "draw", 1.5, { len: 1100 });
    A(rings[2], t0 + 0.45, "draw", 1.4, { len: 820 });
    $$(".mb", root).forEach((b, i) => A(b, t0 + 0.7 + i * 0.12, "growY", 0.7));
    A($(".curve", root), t0 + 1.3, "draw", 1.1, { len: 460 });
    cur.spin = $(".spin", root);
  }

  /* ---------------- scene builders ---------------- */
  const B = {};

  B.cold_open = (sc, d) => {
    const words = String(d.headline || S.title || "").split(/\s+/).filter(Boolean);
    const root = el(`<div class="sc"><div class="open"><div class="left">
        <div class="kicker">AI market brief · ${esc(S.dateLong)}</div>
        <h1>${words.map((w) => `<span class="w">${esc(w)} </span>`).join("")}</h1>
        ${d.subtitle ? `<div class="sub">${esc(d.subtitle)}</div>` : ""}
        ${regimeChip(d.regime)}
      </div><div class="motif">${motifSVG()}</div></div></div>`);
    cur.after = () => { fit($("h1", root), 250, 50); fit($(".sub", root), 140, 24); };
    A($(".kicker", root), 0.15, "up", 0.5, { dist: 14 });
    $$(".w", root).forEach((w, i) => A(w, 0.4 + i * 0.075, "up", 0.55, { dist: 18 }));
    const tText = 0.4 + words.length * 0.075 + 0.2;
    A($(".sub", root), tText, "up", 0.6);
    A($(".chip", root), tText + 0.35, "fade", 0.5);
    animMotif(root, 0.25);
    return root;
  };

  B.agenda = (sc, d) => {
    const items = d.bullets || [];
    const rows = Math.ceil(items.length / 2);
    const root = el(`<div class="sc">${head(sc, { title: d.title || "Today's brief" },
      `<span class="chip ai"><span class="dot"></span>≈ ${Math.max(1, Math.round(S.total / 60))} min watch</span>`)}
      <div class="body"><div class="agenda" style="grid-auto-flow:column;grid-template-rows:repeat(${rows},auto)">
        ${items.map((b, i) => `<div class="row"><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="name">${esc(b)}</span></div>`).join("")}
      </div></div></div>`);
    animHead(root);
    const rv = sc.reveals.bullets || [];
    $$(".row", root).forEach((r, i) => A(r, rv[i] != null ? rv[i] : 0.8 + i * 0.25, "left", 0.55, { dist: 30 }));
    return root;
  };

  function tilesScene(sc, d, chipHtml) {
    const tiles = d.tiles || [];
    const n = tiles.length;
    const cols = n <= 4 ? n : 3;
    const maxAbs = Math.max(0.01, ...tiles.map((t) => Math.abs(t.change_pct || 0)));
    const signals = (d.bullets || []).slice(0, 4);
    const ai = d.subtitle || signals.length ? `<div class="aicard"><span class="tag">AI READ</span><div class="txt">${esc(d.subtitle || "")}</div>
      ${signals.length ? `<div class="sig">${signals.map((b) => `<span class="chip">${esc(b)}</span>`).join("")}</div>` : ""}</div>` : "";
    const root = el(`<div class="sc">${head(sc, d, chipHtml)}<div class="body">
      <div class="tiles" style="grid-template-columns:repeat(${Math.max(1, cols)},1fr)">
      ${tiles.map((t) => {
        const cls = (t.change_pct || 0) > 0 ? "up" : (t.change_pct || 0) < 0 ? "down" : "";
        const hasVal = t.value && String(t.value).trim();
        const name = ((S.names && S.names[t.label]) || "").replace(/^the\s+/i, "");
        const w = (Math.abs(t.change_pct || 0) / maxAbs) * 50;
        const meter = t.change_pct == null ? "" : `<div class="meter"><i style="${(t.change_pct || 0) >= 0 ? `left:50%;width:${w}%;background:var(--up)` : `right:50%;width:${w}%;background:var(--down)`};transform-origin:${(t.change_pct || 0) >= 0 ? "left" : "right"}"></i></div>`;
        return `<div class="card tile">
          <div class="lab">${esc(t.label)}</div><div class="nm">${esc(name)}</div>
          ${hasVal ? `<div class="val">${esc(t.value)}</div><div class="chg mono ${cls}">${t.change_pct == null ? "" : ((t.change_pct > 0 ? "▲ " : t.change_pct < 0 ? "▼ " : "") + pctFixed(t.change_pct))}</div>`
                   : `<div class="val ${cls}">${pctFixed(t.change_pct)}</div>`}
          ${t.note ? `<div class="note">${esc(t.note)}</div>` : ""}${meter}</div>`;
      }).join("")}</div>${ai}</div></div>`);
    animHead(root);
    const rv = sc.reveals.tiles || [];
    $$(".tile", root).forEach((tile, i) => {
      const t0 = rv[i] != null ? rv[i] : 0.7 + i * 0.3;
      A(tile, t0, "up", 0.6, { dist: 30 });
      const v = $(".val", tile);
      countable(v, v.textContent, t0 + 0.1, 0.9);
      A($(".chg", tile), t0 + 0.45, "fade", 0.4);
      A($(".meter i", tile), t0 + 0.4, "growX", 0.7);
    });
    focus($$(".tile", root), $$(".tile", root).map((_, i) => (rv[i] != null ? rv[i] : 0.7 + i * 0.3)), sc.speechEnd);
    const lastTile = Math.max(0.7, ...rv);
    const aiT = sc.warnAt > 0 ? sc.warnAt : Math.min(lastTile + 1.2, sc.speechEnd - 1);
    A($(".aicard", root), aiT, "up", 0.6);
    $$(".aicard .chip", root).forEach((c, i) => A(c, aiT + 0.3 + i * 0.15, "fade", 0.4));
    cur.after = () => { const g = $(".tiles", root); if (n > 4) $$(".tile", g).forEach((x) => (x.style.paddingTop = "24px")); fitBox($(".body", root), 0.75); };
    return root;
  }
  B.overview = (sc, d) => tilesScene(sc, d, regimeChip(d.regime));
  B.live_data = (sc, d) => tilesScene(sc, d, `<span class="chip ai"><span class="dot"></span>Live snapshot${d.sources && d.sources.length ? " · " + esc(d.sources.join(", ")) : ""}</span>`);

  B.movers = (sc, d) => {
    const gain = (d.gainers || []).slice().sort((a, b) => b.change_pct - a.change_pct);
    const lose = (d.losers || []).slice().sort((a, b) => b.change_pct - a.change_pct);
    const rows = [...gain.map((m) => ({ ...m, g: "gainers" })), ...lose.map((m) => ({ ...m, g: "losers" }))];
    const W = 1664, axis = W / 2, maxLen = axis - 190;
    const maxAbs = Math.max(0.01, ...rows.map((r) => Math.abs(r.change_pct)));
    const areaH = 560, rowH = Math.min(62, Math.floor((areaH - 40) / Math.max(1, rows.length)));
    const root = el(`<div class="sc">${head(sc, d)}
      <div class="body"><div class="movers" style="height:${rows.length * rowH + 20}px;margin-top:40px">
        <div class="axis" style="left:${axis}px"></div>
        <div class="lbl" style="left:${axis + 24}px">GAINERS ▸</div><div class="lbl" style="right:${W - axis + 24}px">◂ DECLINERS</div>
        ${rows.map((r, i) => {
          const len = Math.max(6, (Math.abs(r.change_pct) / maxAbs) * maxLen);
          const pos = r.change_pct >= 0;
          let name = r.name && r.name !== r.symbol ? r.name : ((S.names && S.names[r.symbol]) || "");
          name = name.replace(/^the\s+/i, ""); if (name === r.symbol) name = "";
          return `<div class="mrow" data-g="${r.g}" style="top:${i * rowH}px">
            <div class="bar ${pos ? "pos" : "neg"}" style="${pos ? `left:${axis + 1}px` : `right:${W - axis + 1}px`};width:${len}px"></div>
            <div class="tk" style="${pos ? `right:${W - axis + 22}px;flex-direction:row-reverse` : `left:${axis + 22}px`}"><span class="s">${esc(r.symbol)}</span><span class="n">${esc(name)}</span></div>
            <div class="v ${pos ? "up" : "down"}" style="${pos ? `left:${axis + len + 18}px` : `right:${W - axis + len + 18}px`}">${pctFixed(r.change_pct)}</div>
          </div>`;
        }).join("")}
      </div></div></div>`);
    animHead(root);
    const rg = sc.reveals.gainers || [], rl = sc.reveals.losers || [];
    let gi = 0, li = 0;
    $$(".mrow", root).forEach((row) => {
      // reveal times follow the original (unsorted) order; map by symbol
      const sym = $(".s", row).textContent;
      const g = row.dataset.g;
      const list = g === "gainers" ? d.gainers : d.losers;
      const idx = list.findIndex((m) => m.symbol === sym);
      const rv = g === "gainers" ? rg : rl;
      const t0 = rv[idx] != null ? rv[idx] : 0.8 + (g === "gainers" ? gi++ : 3 + li++) * 0.35;
      A($(".tk", row), t0, "fade", 0.4);
      ACT($(".bar", row), t0 + 0.6, t0 + 2.2, (node, a) => (node.style.filter = a > 0 ? `brightness(${1 + 0.25 * a})` : ""));
      A($(".bar", row), t0 + 0.05, "growX", 0.7);
      countable($(".v", row), $(".v", row).textContent, t0 + 0.2, 0.7);
    });
    $$(".lbl", root).forEach((n, i) => A(n, 0.55 + i * 0.1, "fade", 0.5));
    return root;
  };

  B.flow = (sc, d) => {
    const nodes = (d.nodes || []).slice(0, 6);
    const edges = (d.edges || []).filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to));
    const depth = Object.fromEntries(nodes.map((n) => [n.id, 0]));
    for (let k = 0; k < nodes.length; k++) edges.forEach((e) => { if (depth[e.to] < depth[e.from] + 1) depth[e.to] = depth[e.from] + 1; });
    if (!edges.length) nodes.forEach((n, i) => (depth[n.id] = i)); // no edges: lay out as a sequence
    const cols = Math.max(...Object.values(depth)) + 1;
    const byCol = Array.from({ length: cols }, () => []);
    nodes.forEach((n) => byCol[depth[n.id]].push(n));
    const maxRows = Math.max(...byCol.map((c) => c.length));
    const W = 1664, H = 540;
    const gapX = cols >= 5 ? 120 : cols === 4 ? 140 : 170, gapY = 36;
    const nodeW = Math.min(400, (W - (cols - 1) * gapX) / cols);
    const nodeH = maxRows > 1 ? Math.min(230, (H - (maxRows - 1) * gapY) / maxRows) : 250;
    const x0 = (W - (cols * nodeW + (cols - 1) * gapX)) / 2;
    const pos = {};
    byCol.forEach((col, ci) => {
      const totalH = col.length * nodeH + (col.length - 1) * gapY;
      col.forEach((n, ri) => (pos[n.id] = { x: x0 + ci * (nodeW + gapX), y: (H - totalH) / 2 + ri * (nodeH + gapY) }));
    });
    const kindLabel = { cause: "Cause", mechanism: "Mechanism", effect: "Effect", risk: "Risk", neutral: "Context" };
    const r = 8;
    // Ports: several edges on one side of a node get distinct, ordered attachment points.
    const outs = {}, ins = {};
    edges.forEach((e, i) => { (outs[e.from] = outs[e.from] || []).push(i); (ins[e.to] = ins[e.to] || []).push(i); });
    const portY = (list, i, node, other) => {
      const sorted = list.slice().sort((p, q) => pos[other(p)].y - pos[other(q)].y);
      return node.y + (nodeH * (sorted.indexOf(i) + 1)) / (list.length + 1);
    };
    const paths = edges.map((e, i) => {
      const a = pos[e.from], b = pos[e.to];
      const xs = a.x + nodeW, xt = b.x - 6;
      const ys = portY(outs[e.from], i, a, (j) => edges[j].to);
      const yt = portY(ins[e.to], i, b, (j) => edges[j].from);
      const span = depth[e.to] - depth[e.from];
      let dpath, lx, ly;
      if (Math.abs(ys - yt) < 1) { dpath = `M${xs} ${ys} H${xt}`; lx = span > 1 ? xs + gapX / 2 : (xs + xt) / 2; ly = ys - 30; }
      else {
        // Long spans turn in the last gap so the run stays clear of intermediate nodes (orthogonal, r=8 elbows).
        const xm = span > 1 ? xt - gapX / 2 + 6 : (xs + xt) / 2, dir = yt > ys ? 1 : -1;
        dpath = `M${xs} ${ys} H${xm - r} Q${xm} ${ys} ${xm} ${ys + dir * r} V${yt - dir * r} Q${xm} ${yt} ${xm + r} ${yt} H${xt}`;
        if (span > 1) { lx = xs + gapX / 2; ly = ys - 22; } else { lx = xm; ly = (ys + yt) / 2; }
      }
      const len = Math.abs(xt - xs) + Math.abs(yt - ys) + 20;
      return { e, dpath, lx, ly, len };
    });
    const root = el(`<div class="sc">${head(sc, d)}
      <div class="body"><div class="flow" style="height:${H}px">
        <svg class="edges" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#D8C6A7"/></marker></defs>
          ${paths.map((p, i) => `<path class="edge hot" data-i="${i}" d="${p.dpath}" stroke-dasharray="${p.len}" stroke-dashoffset="${p.len}" marker-end="url(#ah)"/>`).join("")}
        </svg>
        ${paths.map((p, i) => (p.e.label ? `<div class="elabel" data-i="${i}" style="left:${p.lx}px;top:${p.ly}px;max-width:${gapX - 12}px;white-space:normal;text-align:center">${esc(p.e.label)}</div>` : "")).join("")}
        ${nodes.map((n) => `<div class="node" data-id="${esc(n.id)}" style="left:${pos[n.id].x}px;top:${pos[n.id].y}px;width:${nodeW}px;height:${nodeH}px">
            <div class="hl"></div><div class="k k-${n.kind}">${kindLabel[n.kind] || "Context"}</div>
            <div class="l">${esc(n.label)}</div>${n.detail ? `<div class="d">${esc(n.detail)}</div>` : ""}</div>`).join("")}
      </div></div></div>`);
    animHead(root);
    const rv = sc.reveals.nodes || [];
    const times = {};
    nodes.forEach((n, i) => (times[n.id] = rv[i] != null ? rv[i] : 0.8 + i * 0.9));
    const order = nodes.map((n) => n.id).sort((a, b) => times[a] - times[b]);
    $$(".node", root).forEach((nd) => {
      const id = nd.dataset.id, t0 = times[id];
      A(nd, t0, "scale", 0.55);
      const next = order[order.indexOf(id) + 1];
      const tEnd = next ? times[next] : sc.speechEnd;
      ACT($(".hl", nd), t0 + 0.2, tEnd, (node, a) => (node.style.opacity = a));
    });
    paths.forEach((p, i) => {
      const t0 = Math.max(times[p.e.from] + 0.3, times[p.e.to] - 0.5);
      A($(`.edge[data-i="${i}"]`, root), t0, "draw", 0.55, { len: p.len });
      A($(`.elabel[data-i="${i}"]`, root), t0 + 0.35, "fade", 0.35);
    });
    cur.after = () => $$(".node", root).forEach((nd) => { fit($(".l", nd), nodeH * 0.48, 20); const dd = $(".d", nd); if (dd) { dd.style.maxHeight = nodeH * 0.42 + "px"; dd.style.overflow = "hidden"; } });
    return root;
  };

  B.bullets = (sc, d) => {
    const items = d.bullets || [];
    const root = el(`<div class="sc">${head(sc, d)}
      <div class="body"><div class="bul">${items.map((b, i) => `<div class="b"><div class="no">${String(i + 1).padStart(2, "0")}</div><div class="tx">${esc(b)}</div></div>`).join("")}</div>
      ${d.warning ? `<div class="note-strip"><span class="t">⚠ NOTE</span><span>${esc(d.warning)}</span></div>` : ""}</div></div>`);
    animHead(root);
    const rv = sc.reveals.bullets || [];
    const rows = $$(".b", root);
    rows.forEach((row, i) => {
      const t0 = rv[i] != null ? rv[i] : 0.8 + i * 1.2;
      const t1 = rv[i + 1] != null ? rv[i + 1] : sc.speechEnd + 0.3;
      A(row, t0, "left", 0.55, { dist: 28 });
      ACT(row, t0, t1, (node, a, past) => { $(".tx", node).style.color = past ? "var(--ink-md)" : "var(--ink-hi)"; $(".no", node).style.background = `rgba(216,198,167,${0.16 * a})`; });
    });
    if (d.warning) A($(".note-strip", root), sc.warnAt > 0 ? sc.warnAt : sc.speechEnd * 0.75, "up", 0.5);
    cur.after = () => fitBox($(".body", root), 0.68);
    return root;
  };

  B.disclosures = (sc, d) => {
    const items = d.disclosures || [];
    const kind = (x) => { const r = (x.role + " " + x.who).toLowerCase();
      if (/senat|rep\.|congress|politic|house|governor/.test(r)) return "GOV";
      if (/ceo|cfo|cto|director|officer|insider|chair|founder/.test(r)) return "INS";
      if (/fund|capital|13f|management|partners|holdings|llc/.test(r)) return "FUND"; return "FILING"; };
    const act = (a) => (/sold|sell|sale|exit|trim/i.test(a) ? "down" : /bought|buy|purchas|add|acquir/i.test(a) ? "up" : "");
    const root = el(`<div class="sc">${head(sc, d)}<div class="body"><div class="rows">
      ${items.map((x) => `<div class="card rowc"><span class="badge">${kind(x)}</span>
        <div class="grow"><div class="who">${esc(x.who)}</div>${x.role ? `<div class="role">${esc(x.role)}</div>` : ""}</div>
        ${x.action ? `<span class="chip ${act(x.action)}">${esc(x.action)}${x.asset ? " · " + esc(x.asset) : ""}</span>` : x.asset ? `<span class="chip">${esc(x.asset)}</span>` : ""}
        ${x.size ? `<span class="mono" style="font-size:22px;color:var(--ink-md)">${esc(x.size)}</span>` : ""}
        ${x.delay_days != null ? `<span class="chip warn">Delay ${x.delay_days}d</span>` : ""}</div>`).join("")}
      </div>${d.warning ? `<div class="note-strip"><span class="t">⚠ FILING DELAY</span><span>${esc(d.warning)}</span></div>` : ""}</div></div>`);
    animHead(root);
    const rv = sc.reveals.disclosures || [];
    const dt = $$(".rowc", root).map((r, i) => (rv[i] != null ? rv[i] : 0.8 + i * 1.0));
    $$(".rowc", root).forEach((r, i) => A(r, dt[i], "up", 0.55));
    focus($$(".rowc", root), dt, sc.warnAt > 0 ? sc.warnAt : sc.speechEnd);
    if (d.warning) A($(".note-strip", root), sc.warnAt > 0 ? sc.warnAt : sc.speechEnd * 0.75, "up", 0.5);
    cur.after = () => fitBox($(".body", root), 0.72);
    return root;
  };

  B.narratives = (sc, d) => {
    const items = d.narratives || [];
    const toneCls = (t) => ({ bullish: "up", bearish: "down", mixed: "warn" }[String(t).toLowerCase()] || "");
    const hypeCls = (h) => ({ high: "down", med: "warn", medium: "warn", low: "up" }[String(h).toLowerCase()] || "");
    const root = el(`<div class="sc">${head(sc, d, `<span class="chip social"><span class="dot"></span>Narrative velocity</span>`)}<div class="body"><div class="rows">
      ${items.map((x) => `<div class="card rowc">
        <div class="grow"><div class="who">${esc(x.name)}</div>${x.mentions ? `<div class="role mono">${esc(x.mentions)} mentions</div>` : ""}</div>
        ${x.velocity != null ? `<div style="display:flex;align-items:center;gap:18px"><div class="vel"><i style="width:${clamp(x.velocity / 100) * 100}%"></i></div><span class="mono" style="font-size:22px;color:var(--ink-md);width:92px">${Math.round(x.velocity)}/100</span></div>` : ""}
        <span class="chip ${toneCls(x.tone)}">${esc(x.tone || "neutral")}</span>
        ${x.hype_risk ? `<span class="chip ${hypeCls(x.hype_risk)}">Hype ${esc(x.hype_risk)}</span>` : ""}</div>`).join("")}
      </div>${d.warning ? `<div class="note-strip"><span class="t">⚠ NOISE</span><span>${esc(d.warning)}</span></div>` : ""}</div></div>`);
    animHead(root);
    const rv = sc.reveals.narratives || [];
    $$(".rowc", root).forEach((r, i) => {
      const t0 = rv[i] != null ? rv[i] : 0.8 + i * 1.0;
      A(r, t0, "up", 0.55);
      A($(".vel i", r), t0 + 0.3, "growX", 0.9);
    });
    focus($$(".rowc", root), $$(".rowc", root).map((_, i) => (rv[i] != null ? rv[i] : 0.8 + i * 1.0)), sc.warnAt > 0 ? sc.warnAt : sc.speechEnd);
    if (d.warning) A($(".note-strip", root), sc.warnAt > 0 ? sc.warnAt : sc.speechEnd * 0.75, "up", 0.5);
    cur.after = () => fitBox($(".body", root), 0.72);
    return root;
  };

  B.calendar = (sc, d) => {
    const items = d.events || [];
    const lvl = (x) => ({ high: 3, med: 2, medium: 2, low: 1 }[String(x).toLowerCase()] || 2);
    const side = (d.bullets || []).slice(0, 5);
    const cal = `<div class="cal"><div class="rail"></div>
      ${items.map((e) => `<div class="ev"><div class="dot"></div><div class="when">${esc(e.when)}<span class="imp">${[1, 2, 3].map((k) => `<i class="${k <= lvl(e.impact) ? "on" : ""}"></i>`).join("")}</span></div>
        <div class="what">${esc(e.event)}</div>${e.detail ? `<div class="det">${esc(e.detail)}</div>` : ""}</div>`).join("")}</div>`;
    const root = el(`<div class="sc">${head(sc, d)}<div class="body">${side.length
      ? `<div class="calwrap">${cal}<div class="side"><h3>Backdrop</h3>${side.map((b) => `<div class="it">${esc(b)}</div>`).join("")}</div></div>` : cal}</div></div>`);
    animHead(root);
    const rb = sc.reveals.bullets || [];
    $$(".side .it", root).forEach((it, i) => A(it, rb[i] != null ? rb[i] : 1.2 + i * 0.8, "left", 0.5, { dist: 24 }));
    A($(".side h3", root), Math.max(0.6, (rb[0] || 1.2) - 0.3), "fade", 0.4);
    A($(".rail", root), 0.5, "growY", 1.2);
    const rv = sc.reveals.events || [];
    $$(".ev", root).forEach((e, i) => {
      const t0 = rv[i] != null ? rv[i] : 0.8 + i * 1.0;
      const t1 = rv[i + 1] != null ? rv[i + 1] : (sc.reveals.bullets && sc.reveals.bullets[0]) || sc.speechEnd;
      A(e, t0, "left", 0.55, { dist: 26 });
      ACT($(".dot", e), t0 + 0.2, Math.max(t0 + 0.8, t1), (node, a) => (node.style.background = `rgba(216,198,167,${0.9 * a})`));
    });
    cur.after = () => fitBox($(".body", root), 0.72);
    return root;
  };

  B.stat = (sc, d) => {
    const st = d.stat || { value: "", label: "", context: "" };
    const root = el(`<div class="sc">${head(sc, d)}<div class="stat" style="height:auto;margin-top:10px">
      <div class="ring">${motifSVG(true)}</div>
      <div><div class="big">${esc(st.value)}</div><div class="lab">${esc(st.label)}</div>${st.context ? `<div class="ctx">${esc(st.context)}</div>` : ""}</div></div></div>`);
    animHead(root);
    animMotif(root, 0.3);
    countable($(".big", root), st.value, 0.7, 1.2);
    A($(".lab", root), 1.1, "up", 0.5);
    A($(".ctx", root), 1.5, "up", 0.6);
    cur.after = () => fit($(".big", root), 190, 80);
    return root;
  };

  B.caution = (sc, d) => {
    const root = el(`<div class="sc"><div class="caution"><div class="box">
      <div class="t"><svg width="26" height="24" viewBox="0 0 26 24"><path d="M13 2 L24.5 22 H1.5 Z" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round"/><path d="M13 9 V15" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round"/><circle cx="13" cy="18.5" r="1.4" fill="#F59E0B"/></svg>${esc(d.title || "Worth knowing").toUpperCase()}</div>
      <div class="x">${esc(d.warning || "")}</div></div></div></div>`);
    A($(".box", root), 0.2, "scale", 0.6);
    A($(".t", root), 0.45, "fade", 0.5);
    A($(".x", root), 0.6, "up", 0.6);
    cur.after = () => fit($(".x", root), 420, 26);
    return root;
  };

  B.recap = (sc, d) => {
    const items = (d.bullets || []).slice(0, 3);
    const root = el(`<div class="sc">${head(sc, { title: d.title || "Three things to remember" })}
      <div class="body"><div class="recap" style="grid-template-columns:repeat(${Math.max(1, items.length)},1fr)">${items.map((b, i) => `<div class="card"><div class="n">${String(i + 1).padStart(2, "0")}</div><div class="x">${esc(b)}</div></div>`).join("")}</div></div></div>`);
    animHead(root);
    const rv = sc.reveals.bullets || [];
    $$(".recap .card", root).forEach((c, i) => {
      const t0 = rv[i] != null ? rv[i] : 0.8 + i * 1.5;
      A(c, t0, "up", 0.6, { dist: 34 });
      ACT(c, t0, rv[i + 1] != null ? rv[i + 1] : sc.speechEnd + 0.3, (node, a) => (node.style.borderColor = `rgba(216,198,167,${0.12 + 0.4 * a})`));
    });
    cur.after = () => $$(".recap .x", root).forEach((x) => fit(x, 210, 24));
    return root;
  };

  B.outro = (sc, d) => {
    const root = el(`<div class="sc"><div class="outro">
      <div class="mk">${motifSVG(false)}<img src="img/oswol-mark.png" alt=""></div>
      <h2>${esc(d.title || "Signal over noise.")}</h2><div class="site">OSWOL.COM</div>
      <div class="disc">${esc(d.warning || "")}</div></div></div>`);
    animMotif(root, 0.1);
    A($("img", root), 0.5, "scale", 0.8);
    A($("h2", root), 1.0, "up", 0.6);
    A($(".site", root), 1.35, "fade", 0.6);
    A($(".disc", root), 1.8, "fade", 0.8);
    return root;
  };

  /* ---------------- chrome, background, captions ---------------- */
  function buildChrome() {
    const stage = $("#stage");
    $("#bg").innerHTML = `<div class="grid"></div><svg viewBox="0 0 520 520"><g class="bgspin" style="transform-origin:260px 260px">
      <circle cx="260" cy="260" r="236" fill="none" stroke="rgba(241,235,221,.06)" stroke-width="10"/>
      <circle cx="260" cy="260" r="204" fill="none" stroke="rgba(216,198,167,.07)" stroke-width="6" stroke-dasharray="1000 300"/>
      <circle cx="260" cy="260" r="174" fill="none" stroke="rgba(241,235,221,.05)" stroke-width="3" stroke-dasharray="600 500"/></g></svg>`;
    $("#chrome").innerHTML = `<div class="top"><div class="brand"><img src="img/oswol-mark.png" alt=""><span class="word">oswol</span><span class="sep"></span><span class="kick">Daily Brief</span></div>
      <div class="top-right">${S.isDemo ? `<span class="demo">Demo data</span>` : ""}<span class="date">${esc(S.dateLabel)}</span></div></div>
      <div class="bottom"><div class="progress"><div class="fill"></div>${S.chapters.slice(1).map((c) => `<div class="tick" style="left:${(c.start / S.total) * 100}%"></div>`).join("")}</div>
      <div class="chap"></div><div class="site">oswol.com</div></div>`;
    $("#captions").innerHTML = `<div class="cap" style="opacity:0"></div>`;
    stage.dataset.ready = "1";
  }

  function poseChrome(globalT, sc, t) {
    $("#chrome .fill").style.transform = `scaleX(${clamp(globalT / S.total)})`;
    const bg = $("#bg .bgspin");
    if (bg) bg.style.transform = `rotate(${globalT * 1.6}deg)`;
    const cap = $("#captions .cap");
    if (!S.burnCaptions) { cap.style.display = "none"; return; }
    const c = sc.captions.find((x) => t >= x.start - 0.05 && t < x.end + 0.25);
    if (!c) { cap.style.opacity = 0; return; }
    if (cap.textContent !== c.text) cap.textContent = c.text;
    cap.style.opacity = Math.min(prog(t, c.start - 0.05, 0.12), 1 - prog(t, c.end + 0.13, 0.12));
  }

  /* ---------------- public API ---------------- */
  async function init(story) {
    S = story;
    buildChrome();
    await document.fonts.ready;
    await Promise.all($$("img").map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
  }

  async function mount(i) {
    const sc = S.scenes[i];
    cur = { i, sc, anims: [], actives: [], after: null, spin: null };
    const holder = $("#scene");
    holder.innerHTML = "";
    const build = B[sc.type] || B.bullets;
    const root = build(sc, sc.data);
    if (!S.burnCaptions) root.classList.add("no-caps");
    holder.appendChild(root);
    const chap = $("#chrome .chap");
    chap.innerHTML = sc.number ? `<b>${sc.number}</b> · ${esc(sc.chapter)}` : esc(sc.chapter);
    await document.fonts.ready;
    await Promise.all($$("img", holder).map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
    if (cur.after) cur.after();
    seek(0);
    return true;
  }

  function seek(t) {
    const sc = cur.sc;
    for (const a of cur.anims) applyAnim(a, t);
    for (const x of cur.actives) {
      const a = clamp(Math.min(prog(t, x.start, 0.3), 1 - prog(t, x.end - 0.1, 0.3)));
      const past = t >= x.end;
      x.fn(x.node, a, past);
    }
    if (cur.spin) cur.spin.style.transform = `rotate(${Math.max(0, t - 1.5) * 2.2}deg)`;
    // enter / exit: dip through the background (brag rule: no muddy double exposures)
    const root = $("#scene");
    const enter = easeOut(prog(t, 0, 0.3));
    const exit = easeInOut(prog(t, sc.duration - 0.5, 0.45));
    root.style.opacity = Math.min(enter, 1 - exit);
    root.style.transform = `translateY(${-10 * exit}px)`;
    poseChrome(sc.start + t, sc, t);
  }

  window.OSV = { init, mount, seek };
})();
