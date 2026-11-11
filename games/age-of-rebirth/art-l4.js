"use strict";
// =====================================================================
//  ART · PHASE II: the voyage (sea, coasts, caravel, storm) and the Atlantic chart
// =====================================================================

// ---------------------------------------------------------------- distant coasts (cached strips)
// Each coast is a wide strip along the horizon, scrolled slowly (parallax), so Africa
// slides past on the left-hand (east) side of a ship sailing south.
const COAST_W = 1800;
Art.coast = function (kind) {
  this.coasts = this.coasts && this.coasts.res === this.res ? this.coasts : { res: this.res };
  if (this.coasts[kind]) return this.coasts[kind];
  const [c, x] = this.mk(COAST_W, 140), r = mulberry(kind.length * 31 + 7), H = 140, base = 120;
  const ridge = (col, amp, freq, off, y0) => {
    x.beginPath(); x.moveTo(0, H);
    for (let px = 0; px <= COAST_W; px += 20) x.lineTo(px, y0 - amp * (0.5 + 0.5 * Math.sin(px * freq + off)) - amp * 0.3 * Math.sin(px * freq * 3.1 + off * 2));
    x.lineTo(COAST_W, H); x.closePath(); x.fillStyle = col; x.fill();
  };
  if (kind === "lisbon") {
    ridge("#9db0a4", 40, 0.004, 1, base - 30); ridge("#7f9a84", 26, 0.007, 3, base - 6);
    for (let i = 0; i < 26; i++) {                      // white houses with red roofs on the hills
      const hx = 60 + i * 66 + r() * 30, hy = base - 20 - r() * 40, w = 18 + r() * 16, h = 12 + r() * 10;
      x.fillStyle = "#efe6d2"; x.fillRect(hx, hy, w, h); x.fillStyle = "#b5532f"; x.beginPath(); x.moveTo(hx - 2, hy); x.lineTo(hx + w / 2, hy - 7); x.lineTo(hx + w + 2, hy); x.fill();
    }
    for (const tx of [380, 1200]) {                     // a castle on the hill and a harbor tower
      x.fillStyle = "#d9cdb0"; x.fillRect(tx, base - 60, 70, 40); for (let k = 0; k < 6; k++) x.fillRect(tx + k * 12, base - 66, 7, 6);
      x.fillRect(tx + 26, base - 84, 18, 24); x.fillStyle = "#b23a2e"; x.fillRect(tx + 34, base - 100, 2, 16); x.fillRect(tx + 36, base - 100, 10, 6);
    }
  } else if (kind === "desert") {
    ridge("#e6c58c", 30, 0.003, 2, base - 18); ridge("#d6ae6c", 22, 0.006, 5, base - 2);
    for (let px = 0; px < COAST_W; px += 300) { x.fillStyle = "#b98a52"; x.beginPath(); x.moveTo(px, base + 6); x.lineTo(px + 30, base - 40); x.lineTo(px + 120, base - 44); x.lineTo(px + 150, base + 6); x.fill(); x.strokeStyle = "rgba(90,60,30,0.4)"; x.lineWidth = 1; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(px + 30 + k * 4, base - 40 + k * 11); x.lineTo(px + 120 + k * 7, base - 44 + k * 12); x.stroke(); } }
  } else if (kind === "jungle") {
    ridge("#5f8a5a", 36, 0.004, 4, base - 24); ridge("#3f6e46", 20, 0.008, 1, base - 4);
    for (let i = 0; i < 40; i++) {                      // palm trees on the shore
      const px = r() * COAST_W, h = 30 + r() * 26;
      x.strokeStyle = "#5a4024"; x.lineWidth = 3; x.beginPath(); x.moveTo(px, base + 4); x.quadraticCurveTo(px + 6, base - h / 2, px + 3, base - h); x.stroke();
      x.strokeStyle = "#2f5a34"; x.lineWidth = 3;
      for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.7; x.beginPath(); x.moveTo(px + 3, base - h); x.quadraticCurveTo(px + 3 + Math.cos(a) * 12, base - h - 8 + Math.sin(a) * 4, px + 3 + Math.cos(a) * 20, base - h + 6); x.stroke(); }
    }
  } else if (kind === "cape") {
    ridge("#8a9a8a", 70, 0.003, 0.5, base - 30); ridge("#6f7f6c", 40, 0.006, 2, base - 4);
    for (let px = 100; px < COAST_W; px += 600) {        // flat-topped mountains and sea cliffs
      x.fillStyle = "#5f6b5c"; x.beginPath(); x.moveTo(px, base + 6); x.lineTo(px + 40, base - 84); x.lineTo(px + 230, base - 88); x.lineTo(px + 280, base + 6); x.fill();
      x.fillStyle = "rgba(255,255,255,0.75)"; x.fillRect(px + 44, base - 92, 182, 6);
    }
  }
  else if (kind === "unknown") {
    ridge("rgba(150,150,140,0.55)", 50, 0.003, 1.5, base - 22); ridge("rgba(120,122,112,0.6)", 26, 0.006, 4, base - 2);
    x.font = `italic 22px ${FONT_D}`; x.fillStyle = "rgba(60,50,40,0.35)"; x.textAlign = "center";
    for (let px = 300; px < COAST_W; px += 900) x.fillText("Here be monsters?", px, base - 70);
    for (let px = 700; px < COAST_W; px += 900) { x.strokeStyle = "rgba(60,90,80,0.45)"; x.lineWidth = 6; x.beginPath(); for (let k = 0; k < 4; k++) x.arc(px + k * 26, base - 20, 11, Math.PI, 0); x.stroke(); }
  }
  // the shoreline and surf
  x.fillStyle = kind === "desert" ? "#efd9a6" : "#e8dcb8"; x.fillRect(0, base + 4, COAST_W, 6);
  x.fillStyle = "rgba(255,255,255,0.7)"; for (let px = 0; px < COAST_W; px += 14) x.fillRect(px, base + 10 + (px % 28 ? 0 : 1), 9, 2);
  this.grainify(c, x, COAST_W, H, 0.4);
  return (this.coasts[kind] = c);
};

// ---------------------------------------------------------------- the caravel
// Lateen (triangular) sails let a caravel sail into the wind; the red cross of the
// Order of Christ marks Portuguese ships.
Art.caravel = function (x, y, t, o = {}) {
  const c = ctx, s = o.scale || 1, bob = Math.sin(t / 22) * 2.5, tilt = (o.tilt || 0) + Math.sin(t / 30) * 0.03, puff = o.puff || 0.5;
  c.save(); c.translate(x, y + bob); c.rotate(tilt); c.scale(s * (o.face || 1), s);
  if (o.ghost) c.globalAlpha = 0.4;
  // wake
  c.fillStyle = "rgba(255,255,255,0.5)"; for (let i = 0; i < 4; i++) { const k = (t * 0.05 + i * 0.25) % 1; c.beginPath(); c.ellipse(-60 - k * 60, 4, 10 + k * 16, 2.5, 0, 0, 7); c.fill(); }
  // hull
  c.beginPath(); c.moveTo(-58, -26); c.lineTo(-44, -24); c.lineTo(36, -18); c.quadraticCurveTo(52, -20, 62, -30); c.quadraticCurveTo(54, 0, 34, 6); c.lineTo(-40, 6); c.quadraticCurveTo(-56, 0, -58, -26); c.closePath();
  c.fillStyle = lgr(c, 0, -26, 0, 6, [[0, "#9a6a3a"], [0.5, "#7a4e26"], [1, "#4a2e16"]]); c.fill(); inkStroke(c, 1.6);
  c.strokeStyle = "rgba(43,29,20,0.5)"; c.lineWidth = 1; for (const yy of [-12, -4]) { c.beginPath(); c.moveTo(-54, yy); c.lineTo(50, yy - 2); c.stroke(); }
  c.fillStyle = "#c9a227"; c.fillRect(-44, -22, 80, 2.5);
  c.fillStyle = "#6e4523"; c.fillRect(-58, -36, 18, 12); c.beginPath(); c.rect(-58, -36, 18, 12); inkStroke(c, 1);   // stern castle
  // masts
  c.fillStyle = "#3b2a1a"; c.fillRect(-2, -118, 3.5, 98); c.fillRect(-36, -86, 3, 64);
  // lateen sails on long slanted yards
  const sail = (mx, top, w, h) => {
    c.strokeStyle = "#3b2a1a"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(mx - w * 0.55, top + h); c.lineTo(mx + w * 0.45, top - 6); c.stroke();
    c.beginPath(); c.moveTo(mx + w * 0.45, top - 4); c.quadraticCurveTo(mx + w * (0.45 + puff * 0.35), top + h * 0.55, mx + 2, top + h + 4); c.lineTo(mx - w * 0.5, top + h); c.closePath();
    c.fillStyle = lgr(c, mx - w / 2, 0, mx + w / 2, 0, [[0, "#d9ccb0"], [1, "#fbf5e6"]]); c.fill(); inkStroke(c, 1.3);
    const cx = mx + w * 0.08, cy = top + h * 0.6, k = w * 0.09;   // the cross of the Order of Christ
    c.fillStyle = "#b23a2e"; c.fillRect(cx - k * 0.35, cy - k * 1.4, k * 0.7, k * 2.8); c.fillRect(cx - k * 1.4, cy - k * 0.35, k * 2.8, k * 0.7);
    c.fillStyle = "#fbf5e6"; c.fillRect(cx - k * 0.1, cy - k * 1.1, k * 0.2, k * 2.2); c.fillRect(cx - k * 1.1, cy - k * 0.1, k * 2.2, k * 0.2);
  };
  sail(-34, -84, 52, 58); sail(0, -116, 78, 88);
  c.fillStyle = "#b23a2e"; c.beginPath(); c.moveTo(1, -124); c.lineTo(18 + Math.sin(t / 6) * 2, -120); c.lineTo(1, -116); c.fill();
  c.restore();
};

// ---------------------------------------------------------------- objects in the water
function seaScale(y) { return 0.8 + (y - SEA.top) / (SEA.bottom - SEA.top) * 0.35; }
Art.seaThing = function (o, sx, t, V) {
  const c = ctx, y = o.y, s = seaScale(y), bob = Math.sin(t / 18 + o.x) * 3;
  c.save(); c.translate(sx, y + bob); c.scale(s, s);
  c.fillStyle = "rgba(20,40,60,0.25)"; c.beginPath(); c.ellipse(0, 6, 26, 6, 0, 0, 7); c.fill();
  if (o.type === "rock") {
    c.beginPath(); c.moveTo(-28, 6); c.lineTo(-20, -18); c.lineTo(-4, -30); c.lineTo(12, -22); c.lineTo(26, 6); c.closePath();
    c.fillStyle = lgr(c, -20, -30, 20, 6, [[0, "#9a9488"], [1, "#4f4a42"]]); c.fill(); inkStroke(c, 1.6);
    c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, -16); c.lineTo(-4, -26); c.stroke();
    // a red danger ring so rocks read clearly against the sea
    const pulse = 0.6 + Math.sin(t / 9 + o.x) * 0.25;
    c.strokeStyle = `rgba(214,48,32,${pulse})`; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 4, 36, 10, 0, 0, 7); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.8)"; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t / 30; c.beginPath(); c.arc(Math.cos(a) * 28, 4 + Math.sin(a) * 6, 3, 0, 7); c.fill(); }
  } else if (o.type === "barrel") {
    c.fillStyle = "#8a5a2c"; rrp(c, -14, -22, 28, 26, 7); c.fill(); inkStroke(c, 1.3);
    c.fillStyle = "#3b2a1a"; c.fillRect(-14, -17, 28, 3); c.fillRect(-14, -5, 28, 3);
    c.fillStyle = "#e9d54a"; c.beginPath(); c.ellipse(0, -28, 7, 5, 0.3, 0, 7); c.fill(); inkStroke(c, 0.8); c.fillStyle = "#4f8a3a"; c.beginPath(); c.ellipse(7, -33, 4, 2, -0.5, 0, 7); c.fill();
  } else if (o.type === "chest") {
    c.fillStyle = rgr(c, 0, -10, 2, 30, [[0, "rgba(255,215,94,0.6)"], [1, "rgba(255,215,94,0)"]]); c.beginPath(); c.arc(0, -10, 30, 0, 7); c.fill();
    c.fillStyle = "#7a4a22"; c.fillRect(-16, -18, 32, 20); c.beginPath(); c.rect(-16, -18, 32, 20); inkStroke(c, 1.3);
    c.fillStyle = "#c9a227"; c.fillRect(-16, -12, 32, 3); c.fillRect(-3, -14, 6, 8);
  } else if (o.type === "crate") {
    c.fillStyle = rgr(c, 0, -14, 2, 34, [[0, "rgba(255,215,94,0.7)"], [1, "rgba(255,215,94,0)"]]); c.beginPath(); c.arc(0, -14, 34, 0, 7); c.fill();
    c.fillStyle = "#d9a728"; c.fillRect(-18, -34, 36, 36); c.beginPath(); c.rect(-18, -34, 36, 36); inkStroke(c, 1.6);
    c.strokeStyle = "#8a6410"; c.lineWidth = 2; c.strokeRect(-14, -30, 28, 28);
    c.fillStyle = "#fff6d8"; c.font = `bold 24px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", 0, -15);
  } else if (o.type === "bottle" || o.type === "ghost") {
    const ghost = o.type === "ghost";
    c.fillStyle = rgr(c, 0, -12, 2, 34, [[0, ghost ? "rgba(190,150,255,0.7)" : "rgba(255,243,196,0.75)"], [1, "rgba(255,243,196,0)"]]); c.beginPath(); c.arc(0, -12, 34, 0, 7); c.fill();
    c.rotate(-0.5 + Math.sin(t / 20) * 0.15);
    c.fillStyle = ghost ? "rgba(150,110,220,0.8)" : "rgba(120,170,140,0.85)"; rrp(c, -9, -30, 18, 30, 6); c.fill(); inkStroke(c, 1.2);
    c.fillRect(-4, -38, 8, 9); c.fillStyle = "#8a5a2c"; c.fillRect(-4, -42, 8, 5);
    c.fillStyle = "#f4ead2"; c.save(); c.rotate(0.1); c.fillRect(-5, -24, 10, 16); c.restore();
  } else if (o.type === "treasure") {
    const col = o.kind === "gold" ? "rgba(255,215,94,0.7)" : o.kind === "god" ? "rgba(255,250,230,0.75)" : "rgba(255,160,140,0.6)";
    c.fillStyle = rgr(c, 0, -18, 2, 38, [[0, col], [1, "rgba(255,255,255,0)"]]); c.beginPath(); c.arc(0, -18, 38, 0, 7); c.fill();
    c.restore(); Art.treasureIcon(o.kind, sx, y + bob - 22, s * 0.95, t);
    c.save(); c.fillStyle = "rgba(43,29,20,0.8)"; c.font = `800 ${Math.round(12 * s)}px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle";
    const lb = TREASURE[o.kind].label, w = c.measureText(lb).width + 10; rr(sx - w / 2, y + bob + 4, w, 16, 5); c.fill(); c.fillStyle = "#ffd75e"; c.fillText(lb, sx, y + bob + 12.5);
  } else if (o.type === "ms") {
    c.restore(); Art.manuscript(sx, y - 16, t, false); return;
  }
  c.restore();
};

Art.port = function (o, sx, t) {
  const c = ctx, y = SEA.top - 16;
  c.save(); c.translate(sx, y);
  // pier
  c.fillStyle = "#6e4523"; c.fillRect(-90, 6, 180, 10); for (let k = -84; k < 90; k += 24) c.fillRect(k, 6, 5, 30);
  // fort walls and tower
  c.fillStyle = "#e6dcc4"; c.fillRect(-80, -50, 160, 56); c.beginPath(); c.rect(-80, -50, 160, 56); inkStroke(c, 1.4);
  for (let k = 0; k < 9; k++) c.fillRect(-80 + k * 19, -58, 11, 8);
  c.fillRect(-20, -96, 40, 50); c.beginPath(); c.rect(-20, -96, 40, 50); inkStroke(c, 1.4);
  c.fillStyle = "#3b2a1a"; c.fillRect(-7, -20, 14, 26); c.fillRect(-6, -84, 5, 9); c.fillRect(2, -84, 5, 9);
  c.fillStyle = "#3b2a1a"; c.fillRect(-1, -126, 2.5, 30);
  c.fillStyle = "#fbf5e6"; c.beginPath(); c.moveTo(1, -126); c.lineTo(26 + Math.sin(t / 7) * 2, -120); c.lineTo(1, -110); c.fill(); inkStroke(c, 0.8);
  c.fillStyle = "#b23a2e"; c.fillRect(9, -122, 3, 9); c.fillRect(6, -119, 9, 3);
  // name
  c.font = `18px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle";
  const label = o.name[0].toUpperCase() + o.name.slice(1), w = c.measureText(label).width + 24;
  c.fillStyle = "rgba(253,246,227,0.92)"; rr(-w / 2, -150, w, 26, 6); c.fill(); c.strokeStyle = "#8a6410"; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = INK; c.fillText(label, 0, -136);
  c.restore();
};

// The end of the voyage: the mouth of a river and a stone padrão (a pillar topped by a cross).
Art.finish = function (sx, t) {
  const c = ctx, y = SEA.top - 20;
  c.save(); c.translate(sx, y);
  c.fillStyle = "#d8c89a"; c.beginPath(); c.ellipse(0, 10, 120, 18, 0, 0, 7); c.fill();
  c.fillStyle = "#4f8aa6"; c.beginPath(); c.moveTo(-30, 10); c.quadraticCurveTo(0, -30, 30, 10); c.fill();
  c.fillStyle = "#e6dcc4"; c.fillRect(50, -60, 14, 66); c.fillRect(44, -66, 26, 8); c.fillRect(54, -84, 6, 20); c.fillRect(48, -78, 18, 5);
  c.beginPath(); c.rect(50, -60, 14, 66); inkStroke(c, 1.2);
  c.font = `16px ${FONT_D}`; c.textAlign = "center"; c.fillStyle = "rgba(253,246,227,0.92)"; rr(-90, -120, 180, 24, 6); c.fill();
  c.fillStyle = INK; c.textBaseline = "middle"; c.fillText("The Great Fish River", 0, -107);
  c.restore();
};

// ---------------------------------------------------------------- the whole voyage scene
Art.voyage = function (V) {
  const c = ctx, t = G.t, d = V.d + V.drift, Z = V.def.zones;
  const zi = V.zoneOf(V.d);
  let z = Z[zi], nz = Z[Math.min(Z.length - 1, zi + 1)], f = clamp((V.d - (z.x1 - 400)) / 400, 0, 1);
  if (V.storm) { z = nz = V.def.stormZone; f = 0; }
  const mix = (a, b) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = s => Math.round(((pa >> s) & 255) * (1 - f) + ((pb >> s) & 255) * f); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; };
  const storm = !!V.storm;
  // sky
  c.fillStyle = lgr(c, 0, 0, 0, SEA.horizon + 30, [[0, mix(z.sky[0], nz.sky[0])], [1, mix(z.sky[1], nz.sky[1])]]); c.fillRect(0, 0, VW, SEA.horizon + 30);
  if (!storm) { c.fillStyle = "rgba(255,240,190,0.8)"; c.beginPath(); c.arc(820, 64, 24, 0, 7); c.fill(); c.fillStyle = "rgba(255,240,190,0.25)"; c.beginPath(); c.arc(820, 64, 42, 0, 7); c.fill(); }
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 230 - d * 0.08 - t * 0.15) % 1300 + 1300) % 1300 - 160, cy = 40 + (i * 37) % 110;
    c.fillStyle = storm ? "rgba(60,66,80,0.9)" : "rgba(255,255,255,0.7)";
    for (const [dx, dy, r] of [[0, 0, 22], [24, -8, 28], [52, 0, 20]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r * (storm ? 1.7 : 1), 0, 7); c.fill(); }
  }
  // the coast slides past on the horizon
  const drawCoast = (kind, a) => { if (kind === "none" || a <= 0.01) return; c.globalAlpha = a; Art.layer(Art.coast(kind), d, 0.35, SEA.horizon - 120); c.globalAlpha = 1; };
  drawCoast(z.coast, 1 - f); if (nz !== z) drawCoast(nz.coast, f);
  // sea
  c.fillStyle = lgr(c, 0, SEA.horizon, 0, VH, [[0, mix(z.sea[0], nz.sea[0])], [1, mix(z.sea[1], nz.sea[1])]]); c.fillRect(0, SEA.horizon, VW, VH - SEA.horizon);
  c.strokeStyle = "rgba(255,255,255,0.2)"; c.lineWidth = 1.5;
  for (let row = 0; row < 14; row++) {
    const yy = SEA.horizon + 8 + row * row * 1.6, sp = 0.3 + row * 0.08, amp = 1 + row * 0.35 + (storm ? 3 : 0);
    c.beginPath();
    for (let px = -20; px <= VW + 20; px += 16) { const ph = (px + d * sp) / (40 + row * 6); c.lineTo(px, yy + Math.sin(ph + t / 25) * amp); }
    c.stroke();
  }
  Art.reef(d, t, V);
  if (storm) { c.fillStyle = "rgba(20,30,45,0.3)"; c.fillRect(0, 0, VW, VH); }

  const sx = G.shake ? rnd(-G.shake, G.shake) / 2 : 0, sy = G.shake ? rnd(-G.shake, G.shake) / 2 : 0;
  c.save(); c.translate(sx, sy);
  for (const o of V.objs) {
    const ox = V.sx(o); if (ox < -220 || ox > VW + 220) continue;
    if (o.type === "port") Art.port(o, ox, t);
    if (o.type === "finish") Art.finish(ox, t);
    if (o.type === "discover" && o.k === "cross") Art.padrao(ox, t);
  }
  // the onshore wind: streaks blowing toward the coast, stronger as a gust builds
  const w = V.windNow || 0;
  if (w > 0.12) {
    c.strokeStyle = `rgba(255,255,255,${Math.min(0.55, w * 0.6)})`; c.lineWidth = 1.6;
    for (let i = 0; i < 4 + w * 18; i++) { const k = ((t * (2 + w * 6) + i * 137) % 260) / 260, x0 = (i * 211) % VW, y0 = SEA.bottom + 20 - k * 240; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + 14, y0 - 26 - w * 20); c.stroke(); }
  }
  const list = [];
  for (const o of V.objs) {
    if (o.done) continue;
    const ox = V.sx(o); if (ox < -120 || ox > VW + 260) continue;
    if (["rock", "barrel", "treasure"].includes(o.type) || (o.type === "ms" && !o.taken)) list.push([o.y, () => Art.seaThing(o, ox, t, V)]);
  }
  if (typeof Race !== "undefined" && Race.running && Race.players) {
    for (const g of Race.players()) if (!g.isMe && g.lv === V.def.id && typeof g.x === "number") { const ox = g.x - V.d + SEA.shipX; if (ox > -80 && ox < VW + 80) list.push([g.y, () => { Art.caravel(ox, g.y, t + g.x, { scale: seaScale(g.y) * 0.8, ghost: true }); c.fillStyle = "#fff"; c.font = `700 12px ${FONT_B}`; c.textAlign = "center"; c.fillText(Race.nameOf(g.id), ox, g.y - 130 * seaScale(g.y) * 0.8); }]); }
  }
  const p = V.p;
  list.push([p.y, () => {
    if (p.inv > 0 && Math.floor(p.inv / 5) % 2) c.globalAlpha = 0.45;
    if (V.boost > 0) { c.fillStyle = rgr(c, SEA.shipX, p.y - 60, 4, 90, [[0, "rgba(255,230,140,0.45)"], [1, "rgba(255,230,140,0)"]]); c.beginPath(); c.arc(SEA.shipX, p.y - 60, 90, 0, 7); c.fill(); }
    Art.caravel(SEA.shipX, p.y, t, { scale: seaScale(p.y), tilt: p.tilt, puff: clamp((V.speed - 1) / 4, 0.1, 1) }); c.globalAlpha = 1;
  }]);
  list.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
  // danger: a red glow on the reef when the ship drifts close
  const near = clamp(1 - (p.y - SEA.reef) / 70, 0, 1);
  if (near > 0) { c.fillStyle = `rgba(214,48,32,${near * 0.28 * (0.7 + Math.sin(t / 5) * 0.3)})`; c.fillRect(0, SEA.top - 20, VW, 60); }
  Art.voyageFog(V, t);
  for (const fx of V.fx) {
    if (fx.k === "wind") { c.strokeStyle = `rgba(255,255,255,${fx.t / 30})`; c.lineWidth = 2; c.beginPath(); c.moveTo(fx.x - (30 - fx.t) * 4, fx.y); c.lineTo(fx.x - (30 - fx.t) * 4 - 40, fx.y); c.stroke(); }
    if (fx.k === "bolt") {
      if (fx.t > 15) { const k = (fx.t - 15) / 65; c.strokeStyle = `rgba(255,70,50,${0.9 - k * 0.5})`; c.lineWidth = 3; c.beginPath(); c.ellipse(fx.x, fx.y, 46, 14, 0, 0, 7); c.stroke(); c.fillStyle = "rgba(255,70,50,0.15)"; c.fill(); }
      else { c.fillStyle = `rgba(255,255,230,${fx.t / 30})`; c.fillRect(0, 0, VW, VH); c.strokeStyle = "#fff8c0"; c.lineWidth = 4; c.beginPath(); let bx = fx.x + 30, by = 0; c.moveTo(bx, by); while (by < fx.y) { by += 30; bx += rnd(-18, 18); c.lineTo(bx + (fx.x - bx) * by / fx.y, by); } c.stroke(); }
    }
    if (fx.k === "wave") {
      const s = seaScale(fx.y);
      c.save(); c.translate(fx.x, fx.y); c.scale(s, s);
      c.fillStyle = "#2a5a74"; c.beginPath(); c.moveTo(-50, 8); c.quadraticCurveTo(-20, -60, 30, -50); c.quadraticCurveTo(0, -40, 10, -20); c.quadraticCurveTo(30, 0, 60, 8); c.closePath(); c.fill(); inkStroke(c, 1.4);
      c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.moveTo(-20, -40); c.quadraticCurveTo(10, -66, 34, -48); c.quadraticCurveTo(10, -50, -6, -36); c.fill();
      c.strokeStyle = "rgba(214,48,32,0.7)"; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 6, 54, 10, 0, 0, 7); c.stroke();
      c.restore();
    }
  }
  c.save(); c.translate(SEA.shipX - V.d, 0); drawParticles(); c.restore();
  c.restore();
  if (storm) { c.strokeStyle = "rgba(200,215,235,0.35)"; c.lineWidth = 1.2; for (let i = 0; i < 70; i++) { const rx = (i * 97 + t * 9) % (VW + 100) - 50, ry = (i * 53 + t * 14) % VH; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 6, ry + 16); c.stroke(); } }
  Art.post();
  Art.voyageHUD(V);
  Art.gustCards(V);
};

// The rocky coast: a band of jagged rocks and surf at the top of the sea.
Art.reef = function (d, t, V) {
  const c = ctx, y = SEA.top, off = (d % 64 + 64) % 64;
  c.fillStyle = "rgba(255,255,255,0.55)";
  for (let x = -64; x < VW + 64; x += 16) { const yy = SEA.reef + 4 + Math.sin((x + d) / 30 + t / 12) * 3; c.beginPath(); c.ellipse(x - off, yy, 10, 3, 0, 0, 7); c.fill(); }
  for (let x = -64, i = 0; x < VW + 64; x += 32, i++) {
    const rx = x - off, k = Math.floor((x + d - off) / 32), h = 12 + ((k * 7919) % 13), wv = 10 + ((k * 31) % 8);
    c.beginPath(); c.moveTo(rx - wv, y + 26); c.lineTo(rx - wv * 0.4, y + 26 - h); c.lineTo(rx + 2, y + 26 - h - 4); c.lineTo(rx + wv * 0.6, y + 26 - h * 0.6); c.lineTo(rx + wv, y + 26); c.closePath();
    c.fillStyle = (k & 1) ? "#4f4a42" : "#5f584e"; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  }
  c.fillStyle = "rgba(255,255,255,0.8)";
  for (let x = -64; x < VW + 64; x += 24) { const k = (t / 18 + x * 0.07) % 1; c.beginPath(); c.arc(x - off, SEA.reef - 2 - k * 10, 3 * (1 - k), 0, 7); c.fill(); }
};
// Diogo Cão's padrão: a stone pillar topped by a cross, on the shore at Cape Cross.
Art.padrao = function (sx, t) {
  const c = ctx, y = SEA.horizon - 2;
  c.save(); c.translate(sx, y);
  c.fillStyle = "#e6dcc4"; c.fillRect(-6, -70, 12, 70); c.fillRect(-12, -76, 24, 8); c.fillRect(-3, -96, 6, 22); c.fillRect(-10, -90, 20, 5);
  c.beginPath(); c.rect(-6, -70, 12, 70); inkStroke(c, 1.2);
  c.restore();
};
// Fog hides the rocks; the compass needle points to the safe channel.
Art.voyageFog = function (V, t) {
  const F = V.objs.find(o => o.type === "fog");
  if (!F) return;
  const x0 = V.sx(F), x1 = x0 + F.len;
  if (x1 < 0 || x0 > VW) return;
  const c = ctx;
  const span = x1 - x0 + 400, g = c.createLinearGradient(x0 - 200, 0, x1 + 200, 0);
  g.addColorStop(0, "rgba(225,228,226,0)"); g.addColorStop(300 / span, "rgba(225,228,226,0.5)"); g.addColorStop(1 - 300 / span, "rgba(225,228,226,0.5)"); g.addColorStop(1, "rgba(225,228,226,0)");
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 14; i++) { const fx = ((i * 173 - V.d * 0.6 - t * 0.4) % (VW + 300) + VW + 300) % (VW + 300) - 150; c.fillStyle = "rgba(240,242,240,0.35)"; c.beginPath(); c.ellipse(fx, 300 + (i * 47) % 200, 120, 30, 0, 0, 7); c.fill(); }
  if (V.d > F.x - 200 && V.d < F.x + F.len) {
    // the compass: which lane is clear ahead?
    const ahead = V.objs.filter(o => o.type === "rock" && !o.done && o.x - V.d > 0 && o.x - V.d < 650);
    const nextX = ahead.length ? Math.min(...ahead.map(o => o.x)) : null;
    const blocked = SEA.lanes.map(y => ahead.some(o => o.x === nextX && o.y === y));
    const safe = blocked.findIndex(b => !b);
    const cx = SEA.shipX + 150, cy = 210;
    c.save(); c.translate(cx, cy);
    c.fillStyle = "rgba(253,246,227,0.95)"; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.fill(); c.strokeStyle = "#8a6410"; c.lineWidth = 3; c.stroke();
    c.fillStyle = "#6b4f2a"; c.font = `700 11px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("N", 0, -24);
    if (safe >= 0) {
      const ty = SEA.lanes[safe] - V.p.y, ang = Math.atan2(ty, 160);
      c.rotate(ang);
      c.fillStyle = "#b23a2e"; c.beginPath(); c.moveTo(26, 0); c.lineTo(-8, -7); c.lineTo(-8, 7); c.closePath(); c.fill();
      c.fillStyle = "#2b1d14"; c.beginPath(); c.moveTo(-26, 0); c.lineTo(-8, -5); c.lineTo(-8, 5); c.closePath(); c.fill();
    }
    c.restore();
    c.fillStyle = "#fff"; c.font = `800 14px ${FONT_B}`; c.textAlign = "center"; c.fillText("Compass: follow the red arrow", cx, cy + 50);
    if (safe >= 0) { c.strokeStyle = `rgba(255,236,160,${0.5 + Math.sin(t / 6) * 0.3})`; c.lineWidth = 3; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(SEA.shipX + 80, SEA.lanes[safe]); c.lineTo(VW, SEA.lanes[safe]); c.stroke(); c.setLineDash([]); }
  }
};

// ---------------------------------------------------------------- the gust: two answer cards in the sky
Art.gustCards = function (V) {
  const g = V.gust; if (!g) return;
  const c = ctx, it = g.item, rects = gustCardRects(it), res = g.phase === "result";
  const slide = Math.min(1, (res ? 99 : g.t) / 10);
  c.save(); c.globalAlpha = slide;
  // the question
  c.font = `800 ${it.stage === 2 || it.echo ? 22 : 24}px ${FONT_B}`;
  const qw = Math.max(472, c.measureText(it.prompt).width + 60);
  const g1 = c.createLinearGradient(0, 62, 0, 110); g1.addColorStop(0, "#fdf6e3"); g1.addColorStop(1, "#efdfb8");
  c.fillStyle = "rgba(20,10,5,0.3)"; rr(VW / 2 - qw / 2 + 3, 66, qw, 46, 10); c.fill();
  c.fillStyle = g1; rr(VW / 2 - qw / 2, 62, qw, 46, 10); c.fill();
  c.strokeStyle = res ? (g.ok ? "#2f7a64" : "#b23a2e") : "#c9a227"; c.lineWidth = 3; c.stroke();
  c.fillStyle = "#6b4f2a"; c.font = `800 11px ${FONT_B}`; c.textAlign = "left"; c.textBaseline = "middle";
  c.fillText(it.echo ? "ECHO FROM HOME" : V.storm ? `STORM · DAY ${V.storm.day + 1}` : "GUST!", VW / 2 - qw / 2 + 12, 72);
  c.fillStyle = INK; c.textAlign = "center"; c.font = `800 ${it.stage === 2 || it.echo ? 22 : 24}px ${FONT_B}`; c.fillText(it.prompt, VW / 2, 90);
  // the gust timer: the wind building toward the rocks
  if (!res) { const k = 1 - g.t / g.T; c.fillStyle = "rgba(43,29,20,0.25)"; rr(VW / 2 - qw / 2 + 10, 102, qw - 20, 5, 2.5); c.fill(); c.fillStyle = k > 0.4 ? "#c9a227" : "#e0574a"; rr(VW / 2 - qw / 2 + 10, 102, (qw - 20) * k, 5, 2.5); c.fill(); }
  if (it.promptPic) {    // "What is this?" shows the picture between the cards
    c.fillStyle = "rgba(20,10,5,0.3)"; rr(VW / 2 - 68, 122, 140, 112, 12); c.fill();
    c.fillStyle = "#fdf6e3"; rr(VW / 2 - 70, 118, 140, 112, 12); c.fill(); c.strokeStyle = "#c9a227"; c.lineWidth = 3; c.stroke();
    c.save(); c.beginPath(); rr(VW / 2 - 68, 120, 136, 108, 10); c.clip(); Art.termIcon(it.promptPic, VW / 2, 174, 0.85, G.t); c.restore();
  }
  rects.forEach((b, i) => {
    const opt = it.options[i], right = opt === it.answer, mine = res && g.pick === i;
    const lift = !res ? Math.sin(G.t / 9 + i * 2) * 2 : 0;
    c.fillStyle = "rgba(20,10,5,0.3)"; rr(b.x + 4, b.y + 6 + lift, b.w, b.h, 12); c.fill();
    c.fillStyle = res ? (right ? "#d9f0e4" : mine ? "#f6d4cc" : "#e8e0cc") : "#fdf6e3"; rr(b.x, b.y + lift, b.w, b.h, 12); c.fill();
    c.strokeStyle = res && right ? "#2f7a64" : res && mine ? "#b23a2e" : "#8a6410"; c.lineWidth = res && (right || mine) ? 4 : 2.5; c.stroke();
    if (it.pic) { c.save(); c.beginPath(); rr(b.x + 2, b.y + lift + 2, b.w - 4, b.h - 4, 10); c.clip(); Art.termIcon(opt, b.x + b.w / 2, b.y + b.h / 2 + lift, 0.8, G.t); c.restore(); }
    else { c.fillStyle = INK; c.font = `800 ${opt.length > 16 ? 19 : 22}px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(opt, b.x + b.w / 2, b.y + b.h / 2 + lift + 4, b.w - 20); }
    // key badge
    c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(b.x + (i ? b.w - 2 : 2), b.y + lift + 6, 15, 0, 7); c.fill();
    c.fillStyle = "#ffd75e"; c.font = `800 16px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(i ? "→" : "←", b.x + (i ? b.w - 2 : 2), b.y + lift + 7);
  });
  if (res) {
    const msg = g.ok ? (V.combo >= 3 ? `Fair winds! ×${1 + Math.floor(V.combo / 3)} streak ${V.combo}` : "Fair wind!") : g.pick < 0 ? `Too slow! ${it.fix}` : it.fix;
    c.font = `800 17px ${FONT_B}`; const mw = Math.min(VW - 40, c.measureText(msg).width + 36);
    c.fillStyle = g.ok ? "rgba(47,122,100,0.95)" : "rgba(178,58,46,0.95)"; rr(VW / 2 - mw / 2, 238, mw, 30, 8); c.fill();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(msg, VW / 2, 254, mw - 16);
  } else if (V.tutorial < 3 && !V.storm) {
    c.font = `800 15px ${FONT_B}`; const tip = "Press ← or → (or tap a card) before the gust blows you onto the rocks!";
    const mw = c.measureText(tip).width + 30; c.fillStyle = "rgba(43,29,20,0.85)"; rr(VW / 2 - mw / 2, 238, mw, 28, 8); c.fill();
    c.fillStyle = "#ffd75e"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(tip, VW / 2, 253);
  }
  c.restore();
};

// ---------------------------------------------------------------- HUD
Art.voyageHUD = function (V) {
  const c = ctx, p = V.p, t = G.t;
  const panel = (x, y, w, h) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "rgba(58,40,28,0.9)"); g.addColorStop(1, "rgba(36,24,16,0.9)"); c.fillStyle = g; rr(x, y, w, h, 10); c.fill(); c.strokeStyle = "rgba(201,162,39,0.75)"; c.lineWidth = 1.5; rr(x + 2.5, y + 2.5, w - 5, h - 5, 8); c.stroke(); };
  // hull and supplies
  panel(10, 10, 226, 74);
  c.fillStyle = "#d9c79c"; c.font = `600 12px ${FONT_B}`; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText("Hull", 22, 28);
  for (let i = 0; i < p.maxHearts; i++) heart(70 + i * 26, 19, 20, i < p.hearts ? "#e0574a" : "rgba(255,255,255,0.18)");
  c.fillStyle = "#d9c79c"; c.fillText("Supplies", 22, 62);
  const low = V.supplies < 25;
  c.fillStyle = "rgba(255,255,255,0.15)"; rr(86, 57, 136, 10, 5); c.fill();
  c.fillStyle = V.supplies <= 0 ? "#b23a2e" : low ? (t % 30 < 15 ? "#e0574a" : "#ffb347") : "#8fcf7a"; rr(86, 57, Math.max(8, 136 * V.supplies / 100), 10, 5); c.fill();
  if (V.supplies <= 0) { c.fillStyle = "#ffb3a6"; c.font = `800 12px ${FONT_B}`; c.fillText("SCURVY!", 150, 77); }
  // God, gold, glory
  if (V.tipShown.gold || V.tipShown.god || V.tipShown.glory || V.active.includes("why")) {
    panel(10, 90, 226, 34);
    [["gold", "Gold"], ["god", "God"], ["glory", "Glory"]].forEach(([k, l], i) => { const x = 22 + i * 72; Art.treasureIcon(k, x + 8, 107, 0.45, t); c.fillStyle = "#fff6d8"; c.font = `700 13px ${FONT_B}`; c.textAlign = "left"; c.fillText(`${l} ${V.treasure[k]}`, x + 20, 108); });
  }
  // renown, rank and the fair-winds streak
  panel(VW - 230, 10, 220, 74);
  c.fillStyle = "#fff6d8"; c.font = `17px ${FONT_D}`; c.textAlign = "left"; c.fillText(SEA_RANKS[V.rank][1], VW - 216, 28);
  c.font = `800 20px ${FONT_B}`; c.fillStyle = "#ffd75e"; c.textAlign = "right"; c.fillText(V.renown, VW - 22, 29);
  c.font = `600 11px ${FONT_B}`; c.fillStyle = "#d9c79c"; c.fillText("RENOWN", VW - 22, 45);
  const nx = SEA_RANKS[V.rank + 1];
  if (nx) { const base = SEA_RANKS[V.rank][0], k = (V.renown - base) / (nx[0] - base); c.fillStyle = "rgba(255,255,255,0.15)"; rr(VW - 216, 41, 120, 6, 3); c.fill(); c.fillStyle = "#ffd75e"; rr(VW - 216, 41, Math.max(6, 120 * k), 6, 3); c.fill(); }
  c.textAlign = "left"; c.font = `800 14px ${FONT_B}`;
  c.fillStyle = V.combo >= 3 ? `hsl(${40 + Math.sin(t / 6) * 10},100%,65%)` : "#d9c79c";
  c.fillText(V.combo ? `Fair winds ×${1 + Math.floor(V.combo / 3)} · streak ${V.combo}` : "Answer gusts for fair winds", VW - 216, 68);
  // the storm's day counter
  if (V.storm) {
    const S = V.storm;
    panel(VW / 2 - 200, 274, 400, 40);
    c.fillStyle = "#e9dcff"; c.font = `16px ${FONT_D}`; c.textAlign = "center"; c.fillText(`The Cape of Storms · ${Math.min(S.day, S.need)} of ${S.need} days survived`, VW / 2, 288);
    for (let i = 0; i < S.need; i++) { c.fillStyle = i < S.day ? "#ffd75e" : "rgba(255,255,255,0.18)"; rr(VW / 2 - 182 + i * 28, 299, 22, 6, 3); c.fill(); }
  }
  // the route, with discoveries stamped on as you reach them
  const rx = 120, rw = VW - 240, ry = VH - 22;
  c.fillStyle = "rgba(36,24,16,0.75)"; rr(rx - 76, ry - 13, rw + 152, 26, 12); c.fill();
  c.strokeStyle = "rgba(255,246,216,0.5)"; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + rw, ry); c.stroke(); c.setLineDash([]);
  c.font = `600 11px ${FONT_B}`; c.fillStyle = "#d9c79c"; c.textBaseline = "middle"; c.textAlign = "right"; c.fillText("Lisbon", rx - 6, ry); c.textAlign = "left"; c.fillText("Fish River", rx + rw + 6, ry);
  for (const o of V.objs) if (o.type === "discover" || (o.type === "port" && o.disc)) {
    const k = o.k || o.disc, zx = rx + rw * o.x / V.length, got = V.found[k];
    c.fillStyle = got ? "#ffd75e" : "rgba(255,246,216,0.35)"; c.beginPath(); c.arc(zx, ry, got ? 5 : 3, 0, 7); c.fill();
  }
  const bx = rx + rw * 24600 / V.length; c.fillStyle = "#9b6bd6"; c.beginPath(); c.arc(bx, ry, 4, 0, 7); c.fill();
  const px = rx + rw * clamp(V.d / V.length, 0, 1);
  c.fillStyle = "#fbf5e6"; c.beginPath(); c.moveTo(px - 7, ry + 5); c.lineTo(px + 7, ry + 5); c.lineTo(px, ry - 9); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  // zone and discovery banners
  if (V.banner && !V.gust) {
    const B = V.banner, a = Math.min(1, B.t / 40, ((B.disc ? 260 : 200) - B.t) / 20);
    c.save(); c.globalAlpha = Math.max(0, a);
    panel(VW / 2 - 260, 120, 520, B.line ? 104 : 80);
    c.fillStyle = B.disc ? "#ffd75e" : "#d9c79c"; c.font = `800 14px ${FONT_B}`; c.textAlign = "center"; c.fillText(B.sub.toUpperCase(), VW / 2, 142);
    c.fillStyle = "#fff6d8"; c.font = `32px ${FONT_D}`; c.fillText(B.text, VW / 2, 174);
    if (B.line) { c.font = `600 14px ${FONT_B}`; c.fillStyle = "#e8dcc0"; c.fillText(B.line, VW / 2, 204, 490); }
    c.restore();
  }
  c.fillStyle = "rgba(255,246,216,0.8)"; c.font = `600 12px ${FONT_B}`; c.textAlign = "right"; c.textBaseline = "alphabetic";
  c.fillText("↑↓ steer · ←→ answer · Esc pause", VW - 14, VH - 40);
};

// ---------------------------------------------------------------- treasure and picture icons
Art.treasureIcon = function (k, x, y, s, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (k === "gold") { c.fillStyle = "#c9a227"; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); inkStroke(c, 2); c.fillStyle = "#ffe58a"; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.strokeStyle = "#8a6410"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.stroke(); c.fillStyle = "#8a6410"; c.beginPath(); c.moveTo(0, -5); c.lineTo(4, 0); c.lineTo(0, 5); c.lineTo(-4, 0); c.closePath(); c.fill(); }
  if (k === "god") { c.fillStyle = "#fbf5e6"; c.fillRect(-5, -20, 10, 40); c.fillRect(-15, -10, 30, 10); c.beginPath(); c.rect(-5, -20, 10, 40); c.rect(-15, -10, 30, 10); inkStroke(c, 1.6); c.fillStyle = "#b23a2e"; c.fillRect(-2, -17, 4, 34); c.fillRect(-12, -7, 24, 4); }
  if (k === "glory") { c.fillStyle = "#3a8a4a"; for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { const a = Math.PI / 2 + sd * (0.4 + i * 0.42); c.beginPath(); c.ellipse(Math.cos(a) * 15, Math.sin(a) * 15 - 2, 7, 3.5, a + Math.PI / 2, 0, 7); c.fill(); } c.fillStyle = "#ffd75e"; c.beginPath(); c.moveTo(-10, 6); c.lineTo(-10, -6); c.lineTo(-5, 0); c.lineTo(0, -10); c.lineTo(5, 0); c.lineTo(10, -6); c.lineTo(10, 6); c.closePath(); c.fill(); inkStroke(c, 1.4); }
  c.restore();
};
// Small pictures for each new word, used in lessons and picture questions.
Art.termIcon = function (k, x, y, s, t, big) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  const sea = (w, h) => { c.fillStyle = "#4f8aa6"; c.fillRect(-w / 2, 0, w, h); };
  if (k === "car") { sea(220, 40); c.restore(); Art.caravel(x, y + 30 * s, t, { scale: 0.62 * s, puff: 0.8 }); return; }
  if (k === "ast") {
    c.strokeStyle = "#8a6410"; c.lineWidth = 9; c.beginPath(); c.arc(0, 4, 36, 0, 7); c.stroke();
    c.strokeStyle = "#c9a227"; c.lineWidth = 3; c.beginPath(); c.arc(0, 4, 36, 0, 7); c.stroke();
    c.strokeStyle = "#8a6410"; c.lineWidth = 2; c.beginPath(); c.moveTo(-36, 4); c.lineTo(36, 4); c.moveTo(0, -32); c.lineTo(0, 40); c.stroke();
    c.strokeStyle = "#2b1d14"; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, 22); c.lineTo(30, -14); c.stroke();
    c.fillStyle = "#c9a227"; c.fillRect(-6, -46, 12, 12); c.beginPath(); c.arc(0, -48, 6, Math.PI, 0); c.lineWidth = 2; c.stroke();
    c.fillStyle = "#f6c23e"; c.beginPath(); c.arc(54, -36, 10, 0, 7); c.fill();
  }
  if (k === "cmp") {
    c.fillStyle = "#7a4a22"; c.beginPath(); c.arc(0, 0, 44, 0, 7); c.fill(); inkStroke(c, 2);
    c.fillStyle = "#fbf5e6"; c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill();
    c.fillStyle = "#2b1d14"; c.font = `bold 13px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle"; [["N", 0, -26], ["S", 0, 27], ["E", 27, 0], ["W", -27, 0]].forEach(([l, a, b]) => c.fillText(l, a, b));
    c.rotate(Math.sin(t / 30) * 0.08);
    c.fillStyle = "#b23a2e"; c.beginPath(); c.moveTo(0, -20); c.lineTo(6, 0); c.lineTo(-6, 0); c.closePath(); c.fill();
    c.fillStyle = "#2b1d14"; c.beginPath(); c.moveTo(0, 20); c.lineTo(6, 0); c.lineTo(-6, 0); c.closePath(); c.fill();
  }
  if (k === "nav" || k === "mer" || k === "dias") {
    c.fillStyle = "#e8dcbc"; rrp(c, -60, -42, 120, 90, 10); c.fill();
    c.restore(); c.save(); c.translate(x, y); c.scale(s, s);
    if (k === "nav") {   // a navigator with dividers over a chart
      c.fillStyle = "#efe1bc"; c.fillRect(-4, 10, 56, 34); c.strokeStyle = "#7a5a3a"; c.lineWidth = 1; c.strokeRect(-4, 10, 56, 34);
      c.beginPath(); c.moveTo(4, 36); c.quadraticCurveTo(20, 16, 44, 22); c.stroke();
      c.strokeStyle = "#2b1d14"; c.lineWidth = 2; c.beginPath(); c.moveTo(22, -4); c.lineTo(14, 30); c.moveTo(22, -4); c.lineTo(32, 30); c.stroke();
      c.translate(-26, 44); Art.npc("pilot", 0, 0, t, 1);
    } else if (k === "mer") {   // a merchant with scales and coins
      c.strokeStyle = "#8a6410"; c.lineWidth = 2; c.beginPath(); c.moveTo(24, -18); c.lineTo(24, 30); c.moveTo(6, -14); c.lineTo(42, -14); c.stroke();
      c.fillStyle = "#c9a227"; c.beginPath(); c.arc(6, -2, 9, 0, Math.PI); c.arc(42, -2, 9, 0, Math.PI); c.fill();
      c.fillStyle = "#ffd75e"; c.beginPath(); c.arc(6, -4, 4, 0, 7); c.fill(); c.fillStyle = "#c97a3a"; c.beginPath(); c.arc(42, -5, 3, 0, 7); c.arc(38, -4, 3, 0, 7); c.fill();
      c.fillStyle = "#c9a227"; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(20 + i * 6, 36 - i * 3, 6, 2.5, 0, 0, 7); c.fill(); inkStroke(c, 0.6); }
      c.translate(-26, 44); Art.npc("trader", 0, 0, t, 1);
    } else {   // Dias with his ship behind him
      c.save(); c.globalAlpha = 0.8; Art.caravel(30, 10, t, { scale: 0.35 }); c.restore();
      c.font = `italic 11px ${FONT_D}`; c.fillStyle = "#6b4f2a"; c.textAlign = "center"; c.fillText("1488", 30, 36);
      c.translate(-20, 44); c.scale(1.2, 1.2); Art.npc("dias", 0, 0, t, 1);
    }
  }
  if (k === "atl" || k === "med" || k === "por") {
    // a tiny chart of Iberia and North Africa
    c.fillStyle = "#8fb8c8"; rrp(c, -66, -46, 132, 92, 8); c.fill(); inkStroke(c, 1.5);
    const P = [[-50, -40], [-10, -40], [10, -30], [30, -38], [60, -30], [60, -18], [20, -14], [-8, -10], [-22, -6], [-34, -14], [-40, -28]];
    const A = [[-30, 8], [-10, 2], [30, 4], [62, 2], [62, 44], [-50, 44], [-46, 26]];
    const poly = (pts, col) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = col; c.fill(); inkStroke(c, 1); };
    if (k === "atl") { c.fillStyle = "#2f7ea0"; c.beginPath(); c.moveTo(-66, -46); c.lineTo(-40, -46); c.lineTo(-44, -20); c.lineTo(-36, -4); c.lineTo(-54, 30); c.lineTo(-54, 46); c.lineTo(-66, 46); c.closePath(); c.fill(); }
    if (k === "med") { c.fillStyle = "#2f7ea0"; c.beginPath(); c.moveTo(-26, -6); c.lineTo(20, -12); c.lineTo(62, -16); c.lineTo(62, 2); c.lineTo(30, 4); c.lineTo(-10, 2); c.closePath(); c.fill(); }
    poly(P, "#e3cf9c"); poly(A, "#e3cf9c");
    if (k === "por") { poly([[-50, -36], [-40, -36], [-38, -10], [-34, -14], [-40, -28], [-48, -22]].map(([a, b]) => [a, b]), "#b23a2e"); c.fillStyle = "#fff"; c.font = `bold 11px ${FONT_B}`; c.textAlign = "left"; c.fillText("Lisbon", -40, -20); c.fillStyle = "#b23a2e"; c.beginPath(); c.arc(-45, -20, 3, 0, 7); c.fill(); }
    else { c.fillStyle = "#fff"; c.font = `bold 10px ${FONT_B}`; c.textAlign = "center"; c.fillText(k === "atl" ? "?" : "", -58, 0); }
    if (k === "atl") { c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-62, -20 + i * 18); c.quadraticCurveTo(-56, -24 + i * 18, -50, -20 + i * 18); c.stroke(); } }
  }
  if (k === "cape") {
    c.fillStyle = "#9cc8e2"; rrp(c, -66, -46, 132, 92, 8); c.fill();
    c.fillStyle = "#5f6b5c"; c.beginPath(); c.moveTo(-66, 46); c.lineTo(-66, -10); c.lineTo(-30, -26); c.lineTo(10, -28); c.lineTo(30, 0); c.lineTo(50, 18); c.lineTo(66, 22); c.lineTo(66, 46); c.closePath(); c.fill(); inkStroke(c, 1.3);
    c.fillStyle = "rgba(255,255,255,0.8)"; c.fillRect(-30, -29, 40, 4);
    c.fillStyle = "#3d86a8"; c.fillRect(-66, 30, 132, 16); c.fillStyle = "#fff"; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(30 + i * 7, 26 + Math.sin(t / 8 + i) * 2, 3, 0, 7); c.fill(); }
    c.fillStyle = "#f6c23e"; c.beginPath(); c.arc(46, -28, 10, 0, 7); c.fill();
  }
  if (k === "why") { Art.treasureIcon("god", -44, 0, 1.1, t); Art.treasureIcon("gold", 0, 0, 1.1, t); Art.treasureIcon("glory", 44, 0, 1.1, t); c.fillStyle = INK; c.font = `bold 12px ${FONT_B}`; c.textAlign = "center"; c.fillText("God · gold · glory", 0, 38); }
  if (k === "risk") {
    c.fillStyle = "#3a4250"; for (const [dx, dy, r] of [[-24, -20, 18], [0, -28, 22], [24, -20, 18]]) { c.beginPath(); c.arc(dx, dy, r, 0, 7); c.fill(); }
    c.strokeStyle = "#ffe58a"; c.lineWidth = 3; c.beginPath(); c.moveTo(6, -14); c.lineTo(-4, 4); c.lineTo(6, 4); c.lineTo(-6, 26); c.stroke();
    c.fillStyle = "#5f584e"; c.beginPath(); c.moveTo(-50, 40); c.lineTo(-38, 16); c.lineTo(-24, 40); c.fill(); c.beginPath(); c.moveTo(24, 40); c.lineTo(38, 20); c.lineTo(54, 40); c.fill();
    c.fillStyle = "#3d86a8"; c.fillRect(-60, 38, 120, 8);
  }
  c.restore();
};

// Draw with the shared art functions into a small DOM canvas (lesson cards).
Art.drawInto = function (cnv, w, h, fn) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cnv.width = w * dpr; cnv.height = h * dpr; cnv.style.aspectRatio = `${w} / ${h}`;
  const saved = ctx; ctx = cnv.getContext("2d"); ctx.scale(dpr, dpr);
  try { fn(); } catch (e) { } finally { ctx = saved; }
};

// ---------------------------------------------------------------- comic panels for the voyage
Object.assign(NPC_LOOK, {
  dias:  { robe: "#2f4a6a", trim: "#c9a227", hat: "wide", hatCol: "#1e1a18", beard: "#3a2a1e", skin: "#e0a87e", long: false, prop: "scope" },
  john2: { robe: "#6a1e2a", trim: "#d9a728", hat: "crown", hatCol: "#d9a728", beard: "#4a3020", skin: "#e8b890", long: true, prop: null },
  crew:  { robe: "#8a5a3a", trim: "#3b2414", hat: "cap", hatCol: "#b23a2e", beard: "#5a3a1e", skin: "#d9a07a", long: false, prop: null },
  pilot: { robe: "#4a5a3a", trim: "#c9a227", hat: "flat", hatCol: "#2a2a24", beard: "#6a5a4a", skin: "#e0a87e", long: true, prop: "scope" },
  trader: { robe: "#2f6a5a", trim: "#d9a728", hat: "wide", hatCol: "#6a3a1e", beard: "#2a1e14", skin: "#c98a5e", long: true, prop: "book" }
});
Art.voyagePanel = function (spec) {
  const [cnv, x] = this.mk(VW, VH);
  const saved = ctx; ctx = x;
  try {
    const sc = spec.scene, t = spec.t || 200;
    const skies = { lisbon: ["#8fc0e0", "#f3e6c8"], sea: ["#9cc8e2", "#f6e2b4"], storm: ["#2c3444", "#6a6e78"], cape: ["#86b6d8", "#f2e8d0"] };
    x.fillStyle = lgr(x, 0, 0, 0, 330, [[0, skies[sc][0]], [1, skies[sc][1]]]); x.fillRect(0, 0, VW, 330);
    if (sc !== "storm" && sc !== "sea") Art.layer(Art.coast(sc), 300, 1, 210);
    x.fillStyle = lgr(x, 0, 320, 0, VH, [[0, sc === "storm" ? "#2c4a5a" : "#3d86a8"], [1, sc === "storm" ? "#142a36" : "#1f5878"]]); x.fillRect(0, 320, VW, VH - 320);
    if (sc === "lisbon" || sc === "cape") { x.fillStyle = "#cdb98c"; x.fillRect(0, 440, VW, VH - 440); x.fillStyle = "#6e4523"; x.fillRect(0, 436, VW, 8); }
    if (sc === "storm") { x.strokeStyle = "rgba(200,215,235,0.4)"; x.lineWidth = 1.2; for (let i = 0; i < 80; i++) { const rx = (i * 97) % VW, ry = (i * 53) % VH; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx - 6, ry + 16); x.stroke(); } }
    for (const [kind, ax, extra] of spec.actors || []) {
      if (kind === "ship") Art.caravel(ax, 420, t, { scale: 1.6, puff: 0.9 });
      else if (kind === "player") { x.save(); x.translate(ax, 440); x.scale(1.5, 1.5); this.player({ x: -15, y: -42, face: extra || 1, onGround: true, vx: 0, anim: 0, fly: false, squash: 0 }, 50); x.restore(); }
      else if (kind === "herald") this.herald(ax, 230, 60, -1, 1.4);
      else { x.save(); x.translate(ax, 440); x.scale(1.5, 1.5); this.npc(kind, 0, 0, 40, extra || (ax < VW / 2 ? 1 : -1)); x.restore(); }
    }
    this.post();
  } finally { ctx = saved; }
  return cnv;
};
{
  const base = Art.renderPanel;
  Art.renderPanel = function (spec) { return spec.scene ? this.voyagePanel(spec) : base.call(this, spec); };
}

// ---------------------------------------------------------------- the Atlantic chart
function buildChartBase() {
  const H = CHART_H, [c, x] = Art.mk(VW, H), r = mulberry(29);
  x.fillStyle = lgr(x, 0, 0, 0, H, [[0, "#86a9aa"], [1, "#5f8a96"]]); x.fillRect(0, 0, VW, H);
  blobs(x, r, 0, 0, VW, H, 110, "rgba(165,195,185,0.35)", 30, 110);
  blobs(x, r, 0, 0, VW, H, 70, "rgba(70,110,125,0.22)", 30, 90);
  const lineCols = ["rgba(43,29,20,0.32)", "rgba(40,110,80,0.38)", "rgba(178,58,46,0.38)"];
  for (const [rx, ry] of [[110, 760], [880, 1080]]) for (let k = 0; k < 32; k++) {
    const a = k * Math.PI / 16;
    x.strokeStyle = lineCols[k % 4 === 0 ? 0 : k % 2 === 0 ? 1 : 2]; x.lineWidth = k % 4 === 0 ? 0.9 : 0.6;
    x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + Math.cos(a) * 1500, ry + Math.sin(a) * 1500); x.stroke();
  }
  const P = poly => poly.map(p => cproj(...p));
  const shape = pts => { x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.closePath(); };
  const land = (pts, base) => {
    shape(pts);
    for (const [w, a] of [[18, 0.07], [12, 0.1], [7, 0.14], [3, 0.2]]) { x.strokeStyle = `rgba(30,60,80,${a})`; x.lineWidth = w; x.stroke(); }
    x.fillStyle = base; x.fill();
    x.save(); x.clip();
    blobs(x, r, 0, 0, VW, H, 90, "rgba(255,245,215,0.3)", 10, 40);
    speck(x, r, 0, 0, VW, H, 1200, ["rgba(110,80,40,0.18)", "rgba(255,250,230,0.3)"]);
    x.restore();
    shape(pts); x.strokeStyle = INK; x.lineWidth = 1.6; x.stroke();
  };
  for (const poly of OTHER_LAND) land(P(poly), "#c4b893");
  for (const k in COUNTRIES) for (const poly of COUNTRIES[k].polys) land(P(poly), "#d6c8a0");
  land(P(AFRICA), "#e3cf9c"); land(P(ARABIA), "#d6c8a0");
  // Sahara dunes, rain forest, and the mountains of the south, as on old charts
  const [sx0, sy0] = cproj(-5, 26), [sx1, sy1] = cproj(25, 18);
  x.strokeStyle = "rgba(160,110,60,0.5)"; x.lineWidth = 1.2;
  for (let i = 0; i < 40; i++) { const px = sx0 + r() * (sx1 - sx0), py = sy0 + r() * (sy1 - sy0); x.beginPath(); x.arc(px, py, 6, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
  const [jx0, jy0] = cproj(10, 4), [jx1, jy1] = cproj(28, -6);
  for (let i = 0; i < 40; i++) { const px = jx0 + r() * (jx1 - jx0), py = jy0 + r() * (jy1 - jy0); x.fillStyle = "rgba(60,110,60,0.55)"; x.beginPath(); x.arc(px, py, 4, 0, 7); x.fill(); }
  // names
  const label = (txt, lon, lat, size, col, ang = 0) => { const [px, py] = cproj(lon, lat); x.save(); x.translate(px, py); x.rotate(ang); x.font = `italic ${size}px ${FONT_D}`; x.fillStyle = col; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 0, 0); x.restore(); };
  label("Atlantic Ocean", -19, 3, 30, "rgba(30,50,70,0.75)", -0.1);
  label("Mar Oceano", -19, -0.5, 16, "rgba(30,50,70,0.55)");
  label("Mediterranean Sea", 18, 34.3, 17, "rgba(30,50,70,0.75)", -0.05);
  label("Indian Ocean", 41, -24, 22, "rgba(30,50,70,0.7)");
  label("AFRICA", 18, 14, 34, "rgba(91,58,30,0.6)");
  label("Gulf of Guinea", 3, 1, 15, "rgba(30,50,70,0.7)");
  label("EUROPE", 18, 46.5, 24, "rgba(91,58,30,0.55)");
  label("PORTUGAL", -7.6, 40.4, 12, "rgba(91,58,30,0.7)", -1.2);
  for (const [txt, lon, lat] of [["Cape Bojador", -14.5, 26.1], ["Elmina", -1.4, 5.1], ["Cape of Good Hope", 18.4, -34.4]]) {
    const [px, py] = cproj(lon, lat); x.fillStyle = INK; x.beginPath(); x.arc(px, py, 2.5, 0, 7); x.fill();
    x.font = `13px ${FONT_D}`; x.textAlign = lon < 0 ? "right" : "left"; x.textBaseline = "middle"; x.fillText(txt, px + (lon < 0 ? -8 : 8), py + (lon > 15 ? 14 : 0));
  }
  // wind roses
  for (const [rx, ry, R] of [[110, 760, 46], [880, 1080, 34]]) {
    x.save(); x.translate(rx, ry);
    for (let k = 0; k < 8; k++) { x.rotate(Math.PI / 4); x.fillStyle = k % 2 ? "#efe1bc" : "#2b1d14"; x.beginPath(); x.moveTo(0, -R * (k % 2 ? 0.6 : 1)); x.lineTo(R * 0.12, 0); x.lineTo(-R * 0.12, 0); x.closePath(); x.fill(); x.strokeStyle = INK; x.lineWidth = 0.8; x.stroke(); }
    lily(x, 0, -R - 8, R * 0.09, "#b23a2e"); x.restore();
  }
  Art.grainify(c, x, VW, H, 1);
  c.res = Art.res;
  return c;
}

Art.chart = function (C) {
  if (!C.base || C.base.res !== Art.res) C.base = buildChartBase();
  const c = ctx, t = G.t, pp = C.pos(), target = clamp(pp.y - VH * 0.48, 0, CHART_H - VH);
  C.camY = C.camY === null ? target : C.camY + (target - C.camY) * 0.08;
  c.save(); c.translate(0, -Math.round(C.camY));
  Art.put(C.base, 0, 0);
  // Dias's route: faint until you sail it, then inked in red
  const done = levelDone("L4");
  c.setLineDash(done ? [8, 5] : [3, 7]); c.strokeStyle = done ? "#b23a2e" : "rgba(91,58,30,0.45)"; c.lineWidth = done ? 3 : 2;
  c.beginPath(); DIAS_ROUTE.forEach((p, i) => { const [px, py] = cproj(...p); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); c.setLineDash([]);
  // sea lanes between nodes
  for (const [a, b, open] of CHART_EDGES) {
    if (a === "lisbon" && b === "cape") continue;
    const A = CHART_NODES[a], B = CHART_NODES[b], o = open();
    c.setLineDash(o ? [7, 6] : [3, 8]);
    c.strokeStyle = o ? "#7a2c20" : "rgba(91,58,30,0.4)"; c.lineWidth = o ? 3.5 : 2;
    c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
  }
  c.setLineDash([]);
  // nodes
  c.textAlign = "center"; c.textBaseline = "middle";
  for (const k in CHART_NODES) {
    const n = CHART_NODES[k], here = C.cur === k && !C.to;
    if (n.type === "level") {
      const st = SAVE.levels[n.level] ? SAVE.levels[n.level].stars : 0;
      c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(n.x, n.y, 13, 0, 7); c.fill();
      c.fillStyle = st ? "#d9a728" : "#b23a2e"; c.beginPath(); c.arc(n.x, n.y, 10, 0, 7); c.fill();
      c.fillStyle = "#fff6d8"; c.font = `bold 12px ${FONT_D}`; c.fillText("I", n.x, n.y + 1);
      c.font = `13px ${FONT_B}`; for (let i = 0; i < 3; i++) { c.fillStyle = i < st ? "#ffd75e" : "rgba(43,29,20,0.35)"; c.fillText("★", n.x - 14 + i * 14, n.y - 22); }
    } else if (n.type === "review") {
      c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(n.x, n.y, 12, 0, 7); c.fill(); c.fillStyle = "#24508f"; c.beginPath(); c.arc(n.x, n.y, 9, 0, 7); c.fill();
      const due = Learn.dueForReview();
      if (due) { c.fillStyle = "#b23a2e"; c.beginPath(); c.arc(n.x + 11, n.y - 10, 8, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = `bold 11px ${FONT_B}`; c.fillText(Math.min(99, due), n.x + 11, n.y - 9); }
    } else if (n.type === "locked") {
      c.fillStyle = "rgba(91,58,30,0.45)"; c.font = `bold 22px ${FONT_D}`; c.fillText("?", n.x, n.y + Math.sin(t / 30 + n.x) * 2);
    } else {
      if (n.type === "landmark" && !done) continue;
      c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(n.x, n.y, 8, 0, 7); c.fill(); c.fillStyle = n.type === "landmark" ? "#d9a728" : "#e1cf9b"; c.beginPath(); c.arc(n.x, n.y, 5, 0, 7); c.fill();
    }
    if (n.type === "landmark" && !done) continue;
    c.font = `${here ? "bold " : ""}15px ${FONT_D}`; c.textAlign = "left";
    const w = c.measureText(n.name).width + 12, lx = n.x + 18;
    c.fillStyle = "rgba(251,244,224,0.85)"; rr(lx, n.y - 10, w, 20, 5); c.fill();
    c.fillStyle = "#2b1d14"; c.fillText(n.name, lx + 6, n.y + 1); c.textAlign = "center";
  }
  // the apprentice's caravel
  Art.caravel(pp.x - 4, pp.y + 6, t, { scale: 0.32, face: C.to && CHART_NODES[C.to].x < CHART_NODES[C.from].x ? -1 : 1 });
  c.restore();
  // cartouche
  const cx = VW - 155;
  c.fillStyle = "rgba(20,10,5,0.25)"; rr(cx - 132, 20, 270, 72, 8); c.fill();
  const g = c.createLinearGradient(0, 16, 0, 86); g.addColorStop(0, "#fdf6e3"); g.addColorStop(1, "#ead7a8");
  c.fillStyle = g; rr(cx - 135, 16, 270, 70, 8); c.fill(); c.strokeStyle = "#6b4f2a"; c.lineWidth = 2; c.stroke();
  c.fillStyle = INK; c.font = `26px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.fillText("Mar Oceano · 1487", cx, 50);
  c.font = `600 13px ${FONT_B}`; c.fillStyle = "#6b4f2a"; c.fillText(`Phase II · The Age of Exploration · ${SAVE.florins} florins`, cx, 72);
  c.strokeStyle = "#4a3420"; c.lineWidth = 8; c.strokeRect(4, 4, VW - 8, VH - 8);
  c.strokeStyle = "#c9a227"; c.lineWidth = 1.5; c.strokeRect(12, 12, VW - 24, VH - 24);
  Art.post();
};

// ---------------------------------------------------------------- the finale's beacon on the Iberian Peninsula
// Golden rays and a pulsing star mark where the next unit begins.
Art.iberiaSignal = function (n, t, open) {
  const c = ctx, pulse = 0.5 + Math.sin(t / 14) * 0.5;
  c.save(); c.translate(n.x, n.y);
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + t / 160, len = 70 + pulse * 30;
    c.fillStyle = `rgba(255,215,94,${0.12 + pulse * 0.1})`;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - 0.08) * len, Math.sin(a - 0.08) * len); c.lineTo(Math.cos(a + 0.08) * len, Math.sin(a + 0.08) * len); c.closePath(); c.fill();
  }
  c.fillStyle = rgr(c, 0, 0, 2, 60, [[0, `rgba(255,236,160,${0.55 + pulse * 0.3})`], [1, "rgba(255,236,160,0)"]]); c.beginPath(); c.arc(0, 0, 60, 0, 7); c.fill();
  c.globalCompositeOperation = "source-over";
  for (let k = 0; k < 2; k++) { const r = 18 + ((t / 2 + k * 40) % 80); c.strokeStyle = `rgba(178,58,46,${0.7 * (1 - r / 98)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); }
  if (!open) {
    c.font = `bold 26px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "#2b1d14"; c.fillText("?", 1, -38 + Math.sin(t / 20) * 3 + 1);
    c.fillStyle = "#ffd75e"; c.fillText("?", 0, -38 + Math.sin(t / 20) * 3);
    c.font = `italic 15px ${FONT_D}`; c.fillStyle = "rgba(43,29,20,0.85)";
    const msg = "Something stirs on the Iberian coast…", w = c.measureText(msg).width + 16;
    c.fillStyle = "rgba(251,244,224,0.9)"; rr(-w / 2 + 40, 26, w, 22, 6); c.fill();
    c.fillStyle = "#6b1e14"; c.fillText(msg, 40, 38);
  }
  c.restore();
};
