"use strict";
// =====================================================================
//  LEVEL 3 ART — Tudor England and the Channel, 1534–1588
//  London's black-and-white houses, Hampton Court's red brick,
//  a night observatory with the Great Orrery, and the white cliffs.
// =====================================================================

ZONE_TINT.push(["#f4f2ee", "#b6bcc4"], ["#fffaf0", "#d8c8b0"], ["#4a4e78", "#1e2244"], ["#ffffff", "#c4ccd4"], ["#8a909c", "#3c424e"]);
Object.assign(LAYER_FACTOR, { thames: 0.2, tudorStreet: 0.45, palace: 0.2, knot: 0.45, spires: 0.22, channel: 0.07, dover: 0.25, armadaFar: 0.15 });

// ---------------------------------------------------------------- heraldry
// The Tudor rose: a red rose with a white rose inside.
function tudorRose(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [r, col] of [[10, "#b8282c"], [6, "#f6f1e6"]]) {
    c.fillStyle = col;
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2; c.beginPath(); c.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5, 0, 7); c.fill(); }
    c.beginPath(); c.arc(0, 0, r * 0.62, 0, 7); c.fill();
  }
  c.fillStyle = "#d9a728"; c.beginPath(); c.arc(0, 0, 2.2, 0, 7); c.fill();
  c.fillStyle = "#3f6a42"; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2 + Math.PI / 5; c.beginPath(); c.moveTo(Math.cos(a) * 7, Math.sin(a) * 7); c.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); c.lineTo(Math.cos(a + 0.25) * 7, Math.sin(a + 0.25) * 7); c.fill(); }
  c.restore();
}
function tudorShield(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-14, -16); c.lineTo(14, -16); c.lineTo(14, 2); c.quadraticCurveTo(14, 14, 0, 20); c.quadraticCurveTo(-14, 14, -14, 2); c.closePath();
  c.fillStyle = "#2a4a8a"; c.fill();
  c.save(); c.clip(); c.fillStyle = "#b8282c"; c.fillRect(0, -16, 14, 18); c.fillRect(-14, 2, 14, 18); c.restore();
  inkStroke(c, 1.4);
  for (const [lx, ly] of [[-7, -7], [7, 11]]) lily(c, lx, ly, 0.55, "#e9c44a");
  c.fillStyle = "#e9c44a";
  for (const [lx, ly] of [[7, -7], [-7, 11]]) { c.beginPath(); c.moveTo(lx - 5, ly - 1); c.lineTo(lx + 5, ly - 1); c.lineTo(lx + 3, ly + 1); c.lineTo(lx - 3, ly + 1); c.fill(); c.fillRect(lx - 4, ly + 2, 8, 1.2); }
  c.restore();
}

// ---------------------------------------------------------------- tiles
Object.assign(TILE_PAINT, {
  t0Body(c, r, v) {          // London: soot-darkened brick and timber
    c.fillStyle = "#3a2c24"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 4; row++) {
      const off = (row % 2) * 8 - ((v * 5) % 16);
      for (let bx = off - 16; bx < 32; bx += 16) {
        c.fillStyle = ["#7a4636", "#6c3e30", "#844c3a", "#5e382c"][Math.floor(r() * 4)]; c.fillRect(bx + 1, row * 8 + 1, 14, 6.5);
        c.fillStyle = "rgba(255,220,190,0.14)"; c.fillRect(bx + 1, row * 8 + 1, 14, 1);
      }
    }
    speck(c, r, 0, 0, 32, 32, 16, ["rgba(20,14,10,0.5)", "rgba(190,150,120,0.3)"]);
  },
  t0Top(c, r, v) {
    TILE_PAINT.t0Body(c, r, v);
    c.fillStyle = "#2c2622"; c.fillRect(0, -1, 32, 14);
    for (let row = 0; row < 2; row++) for (let i = -1; i < 5; i++) {
      const x = i * 8 + (row ? 4 : 0) + (r() - 0.5), y = row * 6;
      rrp(c, x + 0.5, y, 7, 5.4, 2.4);
      c.fillStyle = rgr(c, x + 2.4, y + 1.2, 0.5, 6, [[0, "#b9b3a6"], [1, "#6c665c"]]); c.fill();
      c.strokeStyle = "rgba(10,8,5,0.5)"; c.lineWidth = 0.6; c.stroke();
    }
    c.fillStyle = lgr(c, 0, 12, 0, 16, [[0, "#4a3a2c"], [1, "#2c2016"]]); c.fillRect(0, 12, 32, 4);
    if (v === 2) { c.fillStyle = "rgba(120,140,150,0.45)"; c.beginPath(); c.ellipse(14, 6, 6, 1.6, 0, 0, 7); c.fill(); }
  },
  t1Body(c, r, v) {          // Hampton Court: red brick with a diaper pattern of dark bricks
    c.fillStyle = "#6a3424"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 4; row++) {
      const off = (row % 2) * 8;
      for (let bx = off - 16, k = 0; bx < 32; bx += 16, k++) {
        const diaper = (row + k + v) % 4 === 0;
        c.fillStyle = diaper ? "#3e2a3a" : ["#b5583c", "#a84e34", "#c0644a", "#9e4a30"][Math.floor(r() * 4)];
        c.fillRect(bx + 1, row * 8 + 1, 14, 6.5);
        c.fillStyle = "rgba(255,210,170,0.18)"; c.fillRect(bx + 1, row * 8 + 1, 14, 1);
      }
    }
    speck(c, r, 0, 0, 32, 32, 10, ["rgba(60,20,10,0.4)", "rgba(240,190,150,0.3)"]);
  },
  t1Top(c, r, v) {
    TILE_PAINT.t1Body(c, r, v);
    c.fillStyle = lgr(c, 0, 0, 0, 12, [[0, "#d8ccb0"], [1, "#a89a7c"]]); c.fillRect(0, 0, 32, 12);
    speck(c, r, 0, 0, 32, 11, 30, ["rgba(110,95,70,0.6)", "rgba(250,245,230,0.6)"]);
    c.fillStyle = "#e8dcc0"; c.fillRect(0, 10, 32, 3); c.fillStyle = "rgba(40,20,10,0.4)"; c.fillRect(0, 13, 32, 1.5);
    c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= 32; x += 4) c.lineTo(x, -3 + Math.sin(x + v) * 1.2);
    c.lineTo(32, 0); c.closePath(); c.fillStyle = "#4f7a35"; c.fill();
  },
  t2Body(c, r, v) {          // the observatory: dark dressed stone
    c.fillStyle = "#1a1c2c"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 2; row++) {
      const start = -((v * 9 + row * 10) % 20);
      for (let bx = start; bx < 32; bx += 20) {
        c.fillStyle = ["#3c3e56", "#34364c", "#44465e", "#2e3044"][Math.floor(r() * 4)]; c.fillRect(bx + 1, row * 16 + 1, 18, 14);
        c.fillStyle = "rgba(170,180,255,0.16)"; c.fillRect(bx + 1, row * 16 + 1, 18, 1.2);
      }
    }
    speck(c, r, 0, 0, 32, 32, 8, ["rgba(200,210,255,0.3)"]);
  },
  t2Top(c, r, v) {
    TILE_PAINT.t2Body(c, r, v);
    c.fillStyle = lgr(c, 0, 0, 0, 12, [[0, "#6a6c88"], [1, "#3a3c54"]]); c.fillRect(0, 0, 32, 12);
    c.fillStyle = "#b8963c"; c.fillRect(0, 10, 32, 2);
    c.fillStyle = "rgba(255,240,180,0.6)"; c.fillRect(0, 10, 32, 0.6);
    if (v % 2 === 0) { c.save(); c.translate(16, 5); c.fillStyle = "#c9a227"; for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -4); c.lineTo(1, 0); c.lineTo(-1, 0); c.fill(); } c.restore(); }
  },
  t3Body(c, r, v) {          // Dover: white chalk with flints
    c.fillStyle = lgr(c, 0, 0, 0, 32, [[0, "#ece6d6"], [1, "#cfc6b0"]]); c.fillRect(0, 0, 32, 32);
    c.strokeStyle = "rgba(150,140,120,0.35)"; c.lineWidth = 0.8;
    for (let k = 0; k < 3; k++) { const y = 6 + k * 10 + r() * 2; c.beginPath(); c.moveTo(0, y); c.lineTo(32, y + r() * 2 - 1); c.stroke(); }
    for (let k = 0; k < 2; k++) { const px = 4 + r() * 24, py = 6 + r() * 22; c.fillStyle = "#3c3a40"; c.beginPath(); c.ellipse(px, py, 2.6, 1.8, r(), 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,0.4)"; c.fillRect(px - 1, py - 1, 1, 1); }
  },
  t3Top(c, r, v) {
    TILE_PAINT.t3Body(c, r, v);
    c.beginPath(); c.moveTo(0, -2);
    for (let x = 0; x <= 32; x += 4) c.lineTo(x, 8 + Math.sin(x * 0.5 + v) * 1.6 + r() * 1.5);
    c.lineTo(32, -2); c.closePath();
    c.fillStyle = lgr(c, 0, 0, 0, 10, [[0, "#8fae5a"], [1, "#5a7a38"]]); c.fill();
    c.strokeStyle = "#7a9c48"; c.lineWidth = 1; c.lineCap = "round";
    for (let i = 0; i < 14; i++) { const x = r() * 32, h = 3 + r() * 6; c.beginPath(); c.moveTo(x, 5); c.lineTo(x + (r() - 0.5) * 3, 5 - h); c.stroke(); }
    if (v === 1) { c.fillStyle = "#e8c43a"; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(8 + k * 4, -1 - (k % 2) * 2, 1.4, 0, 7); c.fill(); } }
  },
  thatch(c, r, v) {          // a bundle of old thatch that gives way
    c.beginPath(); c.moveTo(0, 0); c.lineTo(32, 0); c.lineTo(32, 14); c.lineTo(26, 19); c.lineTo(19, 15); c.lineTo(12, 21); c.lineTo(5, 16); c.lineTo(0, 18); c.closePath();
    c.fillStyle = lgr(c, 0, 0, 0, 20, [[0, "#d8b468"], [1, "#8a6a30"]]); c.fill(); inkStroke(c, 1.1);
    c.strokeStyle = "rgba(90,60,20,0.6)"; c.lineWidth = 0.8;
    for (let i = 0; i < 12; i++) { const x = i * 2.8 + r(); c.beginPath(); c.moveTo(x, 1); c.lineTo(x + 1.5, 14 + r() * 4); c.stroke(); }
    c.fillStyle = "#6e4523"; c.fillRect(0, 5, 32, 2);
  },
  palaceDoor(c, r, v) {      // oak doors of the Long Gallery
    c.fillStyle = lgr(c, 0, 0, 32, 0, [[0, "#5b3a1e"], [0.5, "#8b5a2b"], [1, "#4a2e17"]]); c.fillRect(0, 0, 32, 32);
    c.strokeStyle = "rgba(30,15,5,0.6)"; c.lineWidth = 1;
    for (let k = 0; k < 2; k++) { rrp(c, 4, 3 + k * 15, 24, 12, 2); c.stroke(); }
    c.strokeStyle = "rgba(255,220,170,0.25)"; c.beginPath(); c.moveTo(5, 4); c.lineTo(27, 4); c.stroke();
    if (v === 0) tudorRose(c, 16, 16, 0.5);
    c.fillStyle = "#2b2b2b"; c.fillRect(0, 0, 2, 32); c.fillRect(30, 0, 2, 32);
  }
});

// ---------------------------------------------------------------- backgrounds
// A black-and-white Tudor house: close-set studs, jettied upper floors, a steep gable.
function tudorHouse(x, r, X, base, w, h, dark) {
  const plaster = dark ? "#c8c0b0" : ["#f2ece0", "#ebe2d0", "#f4eee4"][Math.floor(r() * 3)], timber = dark ? "#3a3028" : "#231a14";
  const floors = Math.max(2, Math.floor(h / 56)), fh = h / floors;
  for (let f = 0; f < floors; f++) {
    const jet = f * 6, fx = X - jet, fw = w + jet * 2, fy = base - (f + 1) * fh;
    x.fillStyle = plaster; x.fillRect(fx, fy, fw, fh);
    x.fillStyle = timber; x.fillRect(fx, fy + fh - 5, fw, 5); x.fillRect(fx, fy, fw, 3);
    for (let px = fx; px < fx + fw - 2; px += 9) x.fillRect(px, fy, 3, fh);
    if (f > 0) {
      const ww = Math.min(fw * 0.5, 48), wx = fx + (fw - ww) / 2, wy = fy + fh * 0.25;
      x.fillStyle = "#3a4048"; x.fillRect(wx, wy, ww, fh * 0.45);
      x.strokeStyle = "rgba(220,210,170,0.55)"; x.lineWidth = 0.6;
      for (let k = 0; k < ww; k += 5) { x.beginPath(); x.moveTo(wx + k, wy); x.lineTo(wx + k + 5, wy + 5); x.stroke(); x.beginPath(); x.moveTo(wx + k + 5, wy); x.lineTo(wx + k, wy + 5); x.stroke(); }
      x.fillStyle = "rgba(255,220,140,0.2)"; x.fillRect(wx + 2, wy + 2, ww * 0.4, fh * 0.4);
      x.strokeStyle = timber; x.lineWidth = 2; x.strokeRect(wx, wy, ww, fh * 0.45);
    }
    x.fillStyle = "rgba(0,0,0,0.2)"; x.fillRect(fx, fy + fh, fw, 4);
  }
  const top = base - h, ow = w + floors * 12;
  if (r() > 0.4) roofChimney(x, X + w / 2, top, w / 2 + floors * 6 + 6, ow * 0.75, X + w * 0.74, "#7a4636");
  x.fillStyle = dark ? "#4a3a34" : "#5a4036"; x.beginPath(); x.moveTo(X - floors * 6 - 6, top); x.lineTo(X + w / 2, top - ow * 0.75); x.lineTo(X + w + floors * 6 + 6, top); x.closePath(); x.fill();
  x.fillStyle = plaster; x.beginPath(); x.moveTo(X + 6, top); x.lineTo(X + w / 2, top - ow * 0.62); x.lineTo(X + w - 6, top); x.closePath(); x.fill();
  x.fillStyle = timber; for (let px = X + 8; px < X + w - 8; px += 9) { const hh = (1 - Math.abs(px - X - w / 2) / (w / 2)) * ow * 0.62; x.fillRect(px, top - hh, 3, hh); }
  x.strokeStyle = timber; x.lineWidth = 3; x.beginPath(); x.moveTo(X + 6, top); x.lineTo(X + w / 2, top - ow * 0.62); x.lineTo(X + w - 6, top); x.stroke();
  x.fillStyle = "#2a1c14"; x.beginPath(); x.moveTo(X + w / 2 - 11, base); x.lineTo(X + w / 2 - 11, base - 30); x.lineTo(X + w / 2, base - 38); x.lineTo(X + w / 2 + 11, base - 30); x.lineTo(X + w / 2 + 11, base); x.fill();
}
Art.paintThames = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(301);
  // the river
  x.fillStyle = lgr(x, 0, 380, 0, VH, [[0, "#8aa2ac"], [1, "#56707c"]]); x.fillRect(0, 384, BG_W, VH - 384);
  for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(230,240,240,${0.15 + r() * 0.2})`; x.fillRect(r() * BG_W, 390 + r() * 120, 8 + r() * 14, 1.2); }
  // far bank of roofs and church spires
  for (let X = -20; X < BG_W;) { const w = 24 + r() * 26, h = 20 + r() * 34; x.fillStyle = ["#8a8c94", "#7c7e88", "#969aa2"][Math.floor(r() * 3)]; x.fillRect(X, 384 - h, w, h); x.beginPath(); x.moveTo(X - 3, 384 - h); x.lineTo(X + w / 2, 384 - h - w * 0.5); x.lineTo(X + w + 3, 384 - h); x.fill(); X += w + 1; }
  for (let i = 0; i < 14; i++) { const X = 60 + i * 170 + r() * 60, h = 70 + r() * 50; x.fillStyle = "#7a7c86"; x.fillRect(X, 384 - h, 10, h); x.beginPath(); x.moveTo(X - 2, 384 - h); x.lineTo(X + 5, 384 - h - 30); x.lineTo(X + 12, 384 - h); x.fill(); }
  // Old St Paul's Cathedral with its great spire
  const S = 520;
  x.fillStyle = "#9a9ca4"; x.fillRect(S - 160, 300, 320, 84); x.fillRect(S - 30, 210, 60, 100);
  x.beginPath(); x.moveTo(S - 164, 300); x.lineTo(S, 262); x.lineTo(S + 164, 300); x.fill();
  x.fillStyle = "#8a8c96"; x.beginPath(); x.moveTo(S - 24, 210); x.lineTo(S, 60); x.lineTo(S + 24, 210); x.fill();
  x.fillStyle = "rgba(60,62,70,0.5)"; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(S - 140 + i * 44, 380); x.lineTo(S - 140 + i * 44, 320); x.arc(S - 132 + i * 44, 320, 8, Math.PI, 0); x.lineTo(S - 124 + i * 44, 380); x.fill(); }
  // the Tower of London: the White Tower with four turrets
  const K = 1500;
  x.fillStyle = "#c4c0b4"; x.fillRect(K - 110, 340, 220, 44);
  for (let i = 0; i < 16; i++) x.fillRect(K - 110 + i * 14, 332, 8, 9);
  x.fillStyle = "#d8d4c8"; x.fillRect(K - 60, 230, 120, 120);
  for (const tx of [K - 66, K + 50]) { x.fillRect(tx, 200, 16, 40); x.fillStyle = "#5a6070"; x.beginPath(); x.moveTo(tx - 2, 200); x.quadraticCurveTo(tx + 8, 176, tx + 18, 200); x.fill(); x.fillStyle = "#c9a227"; x.fillRect(tx + 7, 168, 2, 12); x.fillStyle = "#d8d4c8"; }
  x.fillStyle = "rgba(60,60,70,0.45)"; for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) x.fillRect(K - 46 + i * 28, 250 + j * 32, 8, 14);
  // London Bridge, crowded with houses
  const B = 2050;
  x.fillStyle = "#8a8678"; x.fillRect(B - 220, 372, 440, 14);
  for (let i = 0; i < 10; i++) { x.fillStyle = "#7a7668"; x.fillRect(B - 216 + i * 44, 384, 14, 30); }
  for (let X = B - 214; X < B + 200;) { const w = 18 + r() * 16, h = 26 + r() * 30; x.fillStyle = ["#a6a094", "#b4aea0", "#9a9488"][Math.floor(r() * 3)]; x.fillRect(X, 372 - h, w, h); x.fillStyle = "#6e6a62"; x.beginPath(); x.moveTo(X - 2, 372 - h); x.lineTo(X + w / 2, 372 - h - 12); x.lineTo(X + w + 2, 372 - h); x.fill(); X += w + 2; }
  // wherries on the water
  for (let i = 0; i < 9; i++) { const X = 100 + i * 260 + r() * 80, Y = 420 + r() * 60; x.fillStyle = "#4a3424"; x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(X + 22, Y + 8, X + 44, Y); x.lineTo(X + 38, Y + 6); x.lineTo(X + 6, Y + 6); x.fill(); x.fillStyle = "#3a2c22"; x.fillRect(X + 18, Y - 12, 4, 12); }
  x.fillStyle = "rgba(200,205,215,0.28)"; x.fillRect(0, 0, BG_W, VH);
  return c;
};
Art.paintTudorStreet = function () {
  const [c, x] = this.mk(1800, VH), r = mulberry(311), base = 484;
  cobbles(x, mulberry(312), 1800, base);
  for (let X = 10; X < 1790;) {
    const w = 96 + r() * 70, h = 140 + r() * 80;
    if (X + w > 1790) break;
    tudorHouse(x, r, X, base, w, h, false);
    x.fillStyle = "#6e675c"; x.fillRect(X - 10, base - 8, w + 20, 10);
    // hanging shop sign
    if (r() > 0.5) { x.fillStyle = "#2a1c14"; x.fillRect(X + w - 4, base - h * 0.55, 24, 3); x.fillStyle = ["#b23a2e", "#2f6aa3", "#c9a227"][Math.floor(r() * 3)]; x.fillRect(X + w + 6, base - h * 0.55 + 4, 16, 18); x.strokeStyle = "#2a1c14"; x.lineWidth = 1.5; x.strokeRect(X + w + 6, base - h * 0.55 + 4, 16, 18); }
    X += w + 14 + r() * 26;
  }
  x.fillStyle = "rgba(60,60,70,0.12)"; x.fillRect(0, 0, 1800, VH);
  return c;
};
Art.paintPalace = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(321);
  // distant parkland
  x.fillStyle = lgr(x, 0, 330, 0, VH, [[0, "#9ab07a"], [1, "#7a945a"]]); x.fillRect(0, 360, BG_W, VH);
  for (let i = 0; i < 40; i++) { const X = r() * BG_W, Y = 350 + r() * 20, s = 16 + r() * 18; x.fillStyle = "#5e7a48"; x.beginPath(); x.arc(X, Y, s, Math.PI, 0); x.fill(); }
  // the palace: long red-brick ranges, battlements, gatehouse, twisted chimneys
  const brick = (X, Y, w, h) => {
    x.fillStyle = "#b25e44"; x.fillRect(X, Y, w, h);
    x.fillStyle = "rgba(60,30,50,0.35)";
    for (let yy = Y + 6; yy < Y + h; yy += 14) for (let xx = X + ((yy / 14) % 2) * 7; xx < X + w; xx += 28) { x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + 5, yy + 5); x.lineTo(xx, yy + 10); x.lineTo(xx - 5, yy + 5); x.fill(); }
  };
  for (let seg = 0; seg < 3; seg++) {
    const X0 = 80 + seg * 800;
    brick(X0, 250, 560, 140);
    x.fillStyle = "#9a4a34"; for (let i = 0; i < 40; i++) x.fillRect(X0 + i * 14, 242, 8, 9);
    for (let i = 0; i < 9; i++) { x.fillStyle = "#e8dcc0"; x.fillRect(X0 + 30 + i * 60, 280, 24, 34); x.fillRect(X0 + 30 + i * 60, 336, 24, 34); x.fillStyle = "#3a4048"; x.fillRect(X0 + 33 + i * 60, 283, 18, 28); x.fillRect(X0 + 33 + i * 60, 339, 18, 28); x.fillStyle = "#e8dcc0"; x.fillRect(X0 + 41 + i * 60, 283, 2, 28); x.fillRect(X0 + 33 + i * 60, 296, 18, 2); x.fillRect(X0 + 41 + i * 60, 339, 2, 28); x.fillRect(X0 + 33 + i * 60, 352, 18, 2); }
    // gatehouse
    const G = X0 + 280;
    brick(G - 60, 180, 120, 210);
    for (const tx of [G - 76, G + 56]) { brick(tx, 150, 20, 240); x.fillStyle = "#6a7078"; x.beginPath(); x.moveTo(tx - 2, 150); x.quadraticCurveTo(tx + 10, 124, tx + 22, 150); x.fill(); x.fillStyle = "#c9a227"; x.fillRect(tx + 9, 112, 2, 16); x.beginPath(); x.moveTo(tx + 11, 112); x.lineTo(tx + 20, 116); x.lineTo(tx + 11, 120); x.fill(); }
    x.fillStyle = "#e8dcc0"; x.fillRect(G - 30, 200, 60, 50); x.fillStyle = "#3a4048"; x.fillRect(G - 26, 204, 52, 42);
    x.fillStyle = "#2a1c14"; x.beginPath(); x.moveTo(G - 26, 390); x.lineTo(G - 26, 330); x.quadraticCurveTo(G, 296, G + 26, 330); x.lineTo(G + 26, 390); x.fill();
    tudorRose(x, G, 270, 1.4);
    // twisted chimneys
    for (let i = 0; i < 6; i++) {
      const cx = X0 + 40 + i * 92 + (i > 2 ? 140 : 0);
      if (Math.abs(cx - G) < 90) continue;
      for (let k = 0; k < 2; k++) {
        const px = cx + k * 12;
        x.fillStyle = "#a24e36"; x.fillRect(px, 200, 9, 46);
        x.strokeStyle = "rgba(60,20,10,0.6)"; x.lineWidth = 1; for (let yy = 202; yy < 246; yy += 6) { x.beginPath(); x.moveTo(px, yy); x.lineTo(px + 9, yy + 4); x.stroke(); }
        x.fillStyle = "#8a3e2a"; x.fillRect(px - 2, 196, 13, 5);
      }
    }
  }
  x.fillStyle = "rgba(230,225,215,0.22)"; x.fillRect(0, 0, BG_W, VH);
  return c;
};
Art.paintKnot = function () {
  const [c, x] = this.mk(1800, VH), r = mulberry(331), base = 484;
  // a knot garden: low clipped hedges in interlacing patterns, gravel paths, yew cones
  x.fillStyle = "#d8ccb0"; x.fillRect(0, base - 34, 1800, 40);
  for (let X = 20; X < 1780; X += 180) {
    x.fillStyle = "#3f6a32"; x.fillRect(X, base - 30, 150, 26);
    x.strokeStyle = "#86a85a"; x.lineWidth = 3;
    x.beginPath(); x.ellipse(X + 40, base - 17, 30, 10, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(X + 110, base - 17, 30, 10, 0, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(X + 10, base - 27); x.lineTo(X + 140, base - 7); x.moveTo(X + 10, base - 7); x.lineTo(X + 140, base - 27); x.stroke();
    for (const k of [0, 1]) { const px = X + 4 + k * 170; x.fillStyle = "#2f5426"; x.beginPath(); x.moveTo(px - 12, base - 30); x.quadraticCurveTo(px - 8, base - 80, px, base - 96); x.quadraticCurveTo(px + 8, base - 80, px + 12, base - 30); x.fill(); x.fillStyle = "rgba(160,200,120,0.25)"; x.beginPath(); x.ellipse(px - 4, base - 64, 3, 16, 0.1, 0, 7); x.fill(); }
    if (r() > 0.5) { x.fillStyle = "#e8e2d4"; x.fillRect(X + 72, base - 58, 6, 30); x.beginPath(); x.arc(X + 75, base - 62, 7, 0, 7); x.fill(); }
  }
  x.fillStyle = "rgba(255,245,225,0.1)"; x.fillRect(0, 0, 1800, VH);
  return c;
};
Art.paintSpires = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(341);
  // a moonlit skyline of towers, with an astronomer's rooftop platform
  x.fillStyle = "#151a34"; x.fillRect(0, 420, BG_W, VH);
  for (let X = -10; X < BG_W;) { const w = 30 + r() * 40, h = 40 + r() * 90; x.fillStyle = ["#1c2244", "#20264a", "#181e3c"][Math.floor(r() * 3)]; x.fillRect(X, 430 - h, w, h + 10); if (r() > 0.6) { x.beginPath(); x.moveTo(X - 2, 430 - h); x.lineTo(X + w / 2, 430 - h - 40); x.lineTo(X + w + 2, 430 - h); x.fill(); } for (let k = 0; k < 3; k++) if (r() > 0.6) { x.fillStyle = "rgba(255,210,120,0.6)"; x.fillRect(X + 6 + r() * (w - 14), 440 - h + r() * h * 0.7, 4, 6); } X += w + 2; }
  for (let i = 0; i < 6; i++) {
    const X = 180 + i * 400 + r() * 80;
    x.fillStyle = "#262c52"; x.fillRect(X, 170, 60, 270);
    x.fillStyle = "#1c2244"; for (let k = 0; k < 6; k++) x.fillRect(X - 4 + k * 12, 160, 8, 12);
    x.fillStyle = "rgba(255,210,120,0.55)"; x.fillRect(X + 24, 220, 10, 16);
    // an armillary sphere on top
    x.strokeStyle = "#c9a227"; x.lineWidth = 2;
    x.beginPath(); x.arc(X + 30, 130, 20, 0, 7); x.stroke(); x.beginPath(); x.ellipse(X + 30, 130, 20, 6, 0.4, 0, 7); x.stroke(); x.beginPath(); x.ellipse(X + 30, 130, 6, 20, 0, 0, 7); x.stroke();
    x.fillStyle = "#c9a227"; x.fillRect(X + 28, 150, 4, 12);
  }
  // constellations
  x.strokeStyle = "rgba(220,220,255,0.25)"; x.lineWidth = 1;
  for (let i = 0; i < 8; i++) { const X = r() * BG_W, Y = 40 + r() * 120; x.beginPath(); x.moveTo(X, Y); for (let k = 0; k < 4; k++) x.lineTo(X + 20 + k * 22 + r() * 10, Y + (r() - 0.5) * 40); x.stroke(); }
  return c;
};
Art.paintChannel = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(351);
  x.fillStyle = lgr(x, 0, 300, 0, VH, [[0, "#7a9cb0"], [1, "#3e6478"]]); x.fillRect(0, 320, BG_W, VH);
  for (let i = 0; i < 220; i++) { x.fillStyle = `rgba(235,245,250,${0.12 + r() * 0.22})`; x.fillRect(r() * BG_W, 326 + r() * 200, 6 + r() * 16, 1.2); }
  // the far French coast
  x.fillStyle = "rgba(120,140,150,0.6)"; x.beginPath(); x.moveTo(0, 322);
  for (let X = 0; X <= BG_W; X += 40) x.lineTo(X, 316 - Math.sin(X / 300) * 6 - r() * 3);
  x.lineTo(BG_W, 322); x.fill();
  return c;
};
Art.paintDover = function () {
  const [c, x] = this.mk(2000, VH), r = mulberry(361);
  // the white cliffs, with a castle and a chain of warning beacons
  const top = X => 300 + Math.sin(X / 260) * 26 + Math.sin(X / 90) * 8;
  x.beginPath(); x.moveTo(0, VH); for (let X = 0; X <= 2000; X += 10) x.lineTo(X, top(X)); x.lineTo(2000, VH); x.closePath();
  x.fillStyle = lgr(x, 0, 280, 0, 480, [[0, "#f4f0e4"], [1, "#c8c0aa"]]); x.fill();
  x.strokeStyle = "rgba(150,140,120,0.35)"; x.lineWidth = 1;
  for (let X = 0; X < 2000; X += 22 + r() * 20) { x.beginPath(); x.moveTo(X, top(X) + 14); x.lineTo(X + r() * 10 - 5, 470); x.stroke(); }
  x.beginPath(); x.moveTo(0, VH); for (let X = 0; X <= 2000; X += 10) x.lineTo(X, top(X) + 3); x.lineTo(2000, top(2000) - 10); for (let X = 2000; X >= 0; X -= 10) x.lineTo(X, top(X) - 6); x.closePath();
  x.fillStyle = "#6e9a48"; x.fill();
  // Dover Castle
  const K = 900, ky = top(K) - 6;
  x.fillStyle = "#b8b0a0"; x.fillRect(K - 70, ky - 50, 140, 50); for (let i = 0; i < 10; i++) x.fillRect(K - 70 + i * 14, ky - 58, 8, 9);
  x.fillStyle = "#c8c0b0"; x.fillRect(K - 26, ky - 100, 52, 60); for (let i = 0; i < 4; i++) x.fillRect(K - 26 + i * 14, ky - 108, 8, 9);
  x.fillStyle = "rgba(50,50,60,0.5)"; x.fillRect(K - 8, ky - 86, 6, 12); x.fillRect(K + 6, ky - 86, 6, 12);
  x.fillStyle = "#f6f2ea"; x.fillRect(K - 1, ky - 132, 2, 26); x.fillRect(K + 1, ky - 132, 22, 14); x.fillStyle = "#b8282c"; x.fillRect(K + 10, ky - 132, 4, 14); x.fillRect(K + 1, ky - 127, 22, 4);
  // beacons on the hills
  for (const BX of [200, 520, 1300, 1700]) {
    const by = top(BX) - 4;
    x.strokeStyle = "#3a2c22"; x.lineWidth = 2; x.beginPath(); x.moveTo(BX - 8, by); x.lineTo(BX, by - 34); x.lineTo(BX + 8, by); x.stroke();
    x.fillStyle = "#4a3424"; x.fillRect(BX - 7, by - 40, 14, 8);
    x.fillStyle = "rgba(255,180,80,0.85)"; x.beginPath(); x.moveTo(BX - 7, by - 40); x.quadraticCurveTo(BX - 4, by - 56, BX, by - 62); x.quadraticCurveTo(BX + 4, by - 54, BX + 7, by - 40); x.fill();
    x.fillStyle = "rgba(255,220,140,0.25)"; x.beginPath(); x.arc(BX, by - 48, 22, 0, 7); x.fill();
  }
  return c;
};
Art.paintArmadaFar = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(371);
  // the Armada's famous crescent of ships on the horizon, under storm clouds
  x.fillStyle = "rgba(40,46,58,0.55)"; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(r() * BG_W, 40 + r() * 80, 60 + r() * 60, 0, 7); x.fill(); }
  for (let i = 0; i < 40; i++) {
    const k = i / 39, X = 200 + k * 2000, Y = 300 - Math.sin(k * Math.PI) * 26 + (r() - 0.5) * 6, s = 0.6 + r() * 0.4;
    x.fillStyle = "#2a2a30"; x.beginPath(); x.moveTo(X - 14 * s, Y); x.lineTo(X + 14 * s, Y); x.lineTo(X + 10 * s, Y + 6 * s); x.lineTo(X - 10 * s, Y + 6 * s); x.fill();
    x.fillRect(X - 0.7, Y - 22 * s, 1.4, 22 * s);
    x.fillStyle = "#c8c4b8"; x.fillRect(X - 7 * s, Y - 18 * s, 14 * s, 8 * s); x.fillRect(X - 5 * s, Y - 9 * s, 10 * s, 6 * s);
    x.fillStyle = "#b8282c"; x.fillRect(X - 2 * s, Y - 16 * s, 4 * s, 4 * s);
  }
  return c;
};
// Background layers are found by name: "thames" -> paintThames.
const L3_LAYERS = ["thames", "tudorStreet", "palace", "knot", "spires", "channel", "dover", "armadaFar"];

// ---------------------------------------------------------------- scenery
Object.assign(L2_DECOR, {
  signpost(c, x, b) { c.fillStyle = "#4a3424"; c.fillRect(x + 14, b - 60, 5, 60); c.fillStyle = "#8b5a2b"; c.beginPath(); c.moveTo(x - 4, b - 56); c.lineTo(x + 30, b - 56); c.lineTo(x + 38, b - 50); c.lineTo(x + 30, b - 44); c.lineTo(x - 4, b - 44); c.closePath(); c.fill(); inkStroke(c, 1); c.fillStyle = "#f2deb0"; c.font = `bold 9px ${FONT_D}`; c.textAlign = "center"; c.fillText("LONDON", x + 16, b - 47); },
  crates(c, x, b) { for (const [ox, oy, s] of [[0, 0, 28], [30, 0, 26], [14, -26, 24]]) { rrp(c, x + ox, b - s + oy, s, s, 2); c.fillStyle = lgr(c, 0, b - s + oy, 0, b + oy, [[0, "#b07a42"], [1, "#6e4523"]]); c.fill(); inkStroke(c, 1.1); c.strokeStyle = "rgba(50,25,10,0.6)"; c.beginPath(); c.moveTo(x + ox + 2, b - s + oy + 2); c.lineTo(x + ox + s - 2, b + oy - 2); c.stroke(); } },
  pump(c, x, b) { c.fillStyle = "#3a3a44"; c.fillRect(x + 10, b - 48, 12, 48); c.beginPath(); c.rect(x + 10, b - 48, 12, 48); inkStroke(c, 1); c.fillRect(x + 20, b - 36, 12, 5); c.strokeStyle = "#3a3a44"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 12, b - 44); c.lineTo(x - 4, b - 56); c.stroke(); c.fillStyle = "#6a5040"; c.fillRect(x + 22, b - 10, 16, 10); },
  topiary(c, x, b) { c.fillStyle = "#8a6a4a"; rrp(c, x + 6, b - 16, 20, 16, 2); c.fill(); inkStroke(c, 1); c.fillStyle = lgr(c, x, 0, x + 32, 0, [[0, "#5a8a42"], [1, "#2f5426"]]); for (const [cy, rr] of [[-26, 11], [-46, 8], [-60, 5]]) { c.beginPath(); c.arc(x + 16, b + cy, rr, 0, 7); c.fill(); inkStroke(c, 0.9); } },
  urn(c, x, b) { c.fillStyle = "#d8d0c0"; c.fillRect(x + 8, b - 10, 16, 10); c.beginPath(); c.moveTo(x + 6, b - 34); c.quadraticCurveTo(x + 4, b - 14, x + 12, b - 10); c.lineTo(x + 20, b - 10); c.quadraticCurveTo(x + 28, b - 14, x + 26, b - 34); c.closePath(); c.fill(); inkStroke(c, 1); c.fillStyle = "#4f7a35"; c.beginPath(); c.arc(x + 16, b - 38, 9, Math.PI, 0); c.fill(); for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? "#b8282c" : "#f4ead2"; c.beginPath(); c.arc(x + 9 + k * 5, b - 42 + (k % 2) * 3, 2.4, 0, 7); c.fill(); } },
  rose(c, x, b) { c.fillStyle = "#3f6a32"; c.beginPath(); c.ellipse(x + 16, b - 12, 16, 12, 0, Math.PI, 0); c.fill(); inkStroke(c, 0.9); tudorRose(c, x + 10, b - 16, 0.4); tudorRose(c, x + 22, b - 12, 0.35); tudorRose(c, x + 16, b - 22, 0.32); },
  fountain(c, x, b, sd, t) { c.fillStyle = "#cfc6b4"; c.beginPath(); c.ellipse(x + 32, b - 6, 30, 7, 0, 0, 7); c.fill(); inkStroke(c, 1); c.fillRect(x + 4, b - 6, 56, 6); c.fillRect(x + 28, b - 40, 8, 34); c.beginPath(); c.ellipse(x + 32, b - 40, 14, 4, 0, 0, 7); c.fill(); inkStroke(c, 1); c.fillStyle = "rgba(160,200,230,0.7)"; for (let k = -1; k <= 1; k += 2) { c.beginPath(); c.moveTo(x + 32, b - 46); c.quadraticCurveTo(x + 32 + k * 18, b - 58 + Math.sin(t / 8) * 2, x + 32 + k * 24, b - 8); c.lineTo(x + 32 + k * 22, b - 8); c.quadraticCurveTo(x + 32 + k * 16, b - 54, x + 32, b - 44); c.fill(); } },
  armillary(c, x, b, sd, t) { c.fillStyle = "#5b3a1e"; c.fillRect(x + 12, b - 30, 8, 30); c.fillRect(x + 4, b - 4, 24, 4); c.save(); c.translate(x + 16, b - 48); c.strokeStyle = "#c9a227"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.stroke(); c.rotate(t / 60); c.beginPath(); c.ellipse(0, 0, 16, 5, 0.4, 0, 7); c.stroke(); c.beginPath(); c.ellipse(0, 0, 5, 16, 0, 0, 7); c.stroke(); c.fillStyle = "#4f8ab0"; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.restore(); },
  globe(c, x, b) { c.fillStyle = "#5b3a1e"; c.fillRect(x + 6, b - 22, 4, 22); c.fillRect(x + 22, b - 22, 4, 22); c.fillRect(x + 2, b - 24, 28, 4); c.beginPath(); c.arc(x + 16, b - 38, 13, 0, 7); c.fillStyle = rgr(c, x + 12, b - 42, 1, 14, [[0, "#e8dcb0"], [1, "#a89060"]]); c.fill(); inkStroke(c, 1); c.fillStyle = "#6a8a4a"; c.beginPath(); c.ellipse(x + 12, b - 40, 5, 7, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 21, b - 34, 4, 3, 0, 0, 7); c.fill(); c.strokeStyle = "#c9a227"; c.lineWidth = 1.6; c.beginPath(); c.arc(x + 16, b - 38, 15, -2.4, 0.8); c.stroke(); },
  quadrant(c, x, b) { c.fillStyle = "#5b3a1e"; c.fillRect(x + 4, b - 4, 26, 4); c.save(); c.translate(x + 6, b - 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -40); c.arc(0, 0, 40, -Math.PI / 2, 0); c.closePath(); c.fillStyle = "rgba(201,162,39,0.35)"; c.fill(); c.strokeStyle = "#c9a227"; c.lineWidth = 2; c.stroke(); c.lineWidth = 0.6; for (let k = 1; k < 9; k++) { const a = -Math.PI / 2 + k * Math.PI / 18; c.beginPath(); c.moveTo(Math.cos(a) * 34, Math.sin(a) * 34); c.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); c.stroke(); } c.restore(); },
  candles(c, x, b, sd, t) { c.fillStyle = "#5b3a1e"; c.fillRect(x + 4, b - 22, 24, 22); c.beginPath(); c.rect(x + 4, b - 22, 24, 22); inkStroke(c, 1); for (const ox of [8, 15, 22]) { c.fillStyle = "#efe6d0"; c.fillRect(x + ox, b - 34, 4, 12); c.fillStyle = "rgba(255,210,120,0.35)"; c.beginPath(); c.arc(x + ox + 2, b - 38, 8, 0, 7); c.fill(); c.fillStyle = "#ffb347"; c.beginPath(); c.ellipse(x + ox + 2, b - 38 + Math.sin(t / 4 + ox) * 0.6, 1.8, 3.4, 0, 0, 7); c.fill(); } },
  books(c, x, b) { const cols = ["#7a2a20", "#2a4a6a", "#4a5a2a", "#6a4a2a", "#3a2a4a"]; for (let i = 0; i < 5; i++) { c.fillStyle = cols[i]; c.fillRect(x + 2, b - 6 - i * 7, 26 - (i % 2) * 4, 6); c.fillStyle = "#e8dcc0"; c.fillRect(x + 4, b - 4 - i * 7, 20 - (i % 2) * 4, 1); } },
  grass(c, x, b) { c.strokeStyle = "#6e8a42"; c.lineWidth = 1.4; c.lineCap = "round"; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(x + 4 + i * 3, b); c.quadraticCurveTo(x + 4 + i * 3 + 3, b - 10, x + 2 + i * 3 + (i % 3) * 3, b - 16 - (i % 2) * 6); c.stroke(); } },
  gorse(c, x, b) { c.fillStyle = "#3f5a2a"; c.beginPath(); c.ellipse(x + 16, b - 10, 16, 11, 0, Math.PI, 0); c.fill(); inkStroke(c, 0.8); c.fillStyle = "#f2c63c"; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(x + 4 + (i * 7) % 26, b - 6 - (i * 5) % 14, 1.6, 0, 7); c.fill(); } },
  anchor(c, x, b) { c.save(); c.translate(x + 16, b - 4); c.rotate(-0.3); c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -36); c.moveTo(-10, -28); c.lineTo(10, -28); c.stroke(); c.beginPath(); c.arc(0, -6, 12, 0.2, Math.PI - 0.2); c.stroke(); c.strokeStyle = "#5a5a64"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -36); c.moveTo(-10, -28); c.lineTo(10, -28); c.stroke(); c.beginPath(); c.arc(0, -6, 12, 0.2, Math.PI - 0.2); c.stroke(); c.beginPath(); c.arc(0, -40, 4, 0, 7); c.stroke(); c.restore(); },
  nets(c, x, b) { c.strokeStyle = "#5b3a1e"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, b); c.lineTo(x + 4, b - 50); c.moveTo(x + 60, b); c.lineTo(x + 60, b - 50); c.stroke(); c.beginPath(); c.moveTo(x + 4, b - 46); c.quadraticCurveTo(x + 32, b - 20, x + 60, b - 46); c.lineTo(x + 56, b - 8); c.quadraticCurveTo(x + 32, b, x + 8, b - 8); c.closePath(); c.fillStyle = "rgba(150,120,80,0.35)"; c.fill(); c.strokeStyle = "rgba(90,60,30,0.6)"; c.lineWidth = 0.7; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(x + 8 + k * 7, b - 44 + Math.sin(k) * 4); c.lineTo(x + 8 + k * 6, b - 6); c.stroke(); } for (const ox of [20, 44]) { c.fillStyle = "#e8dcc0"; c.beginPath(); c.arc(x + ox, b - 30, 3, 0, 7); c.fill(); inkStroke(c, 0.6); } },
  lobsterpot(c, x, b) { c.beginPath(); c.moveTo(x + 4, b); c.lineTo(x + 4, b - 14); c.quadraticCurveTo(x + 16, b - 32, x + 28, b - 14); c.lineTo(x + 28, b); c.closePath(); c.fillStyle = "rgba(140,100,60,0.4)"; c.fill(); c.strokeStyle = "#6e4523"; c.lineWidth = 1.6; c.stroke(); c.lineWidth = 0.8; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x + 4 + k * 6, b); c.lineTo(x + 4 + k * 6, b - 22 + Math.abs(k - 2.5) * 3); c.stroke(); } },
  beaconPost(c, x, b, sd, t) { c.strokeStyle = "#3a2c22"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 6, b); c.lineTo(x + 16, b - 54); c.lineTo(x + 26, b); c.stroke(); c.fillStyle = "#4a3424"; c.fillRect(x + 7, b - 62, 18, 10); inkStroke(c, 1); c.fillStyle = "rgba(255,170,70,0.85)"; c.beginPath(); c.moveTo(x + 8, b - 62); c.quadraticCurveTo(x + 12, b - 80 - Math.sin(t / 5) * 4, x + 16, b - 88); c.quadraticCurveTo(x + 21, b - 78, x + 24, b - 62); c.fill(); }
});
ANIMATED_L2.add("fountain"); ANIMATED_L2.add("armillary"); ANIMATED_L2.add("candles"); ANIMATED_L2.add("beaconPost");

// ---------------------------------------------------------------- creatures
// A Thames rat: plump, whiskered, with a long pink tail.
Art.rat = function (e, t) {
  const c = ctx, cx = e.x + e.w / 2, by = e.y + e.h, dir = e.vx > 0 ? 1 : -1;
  if (!e.alive) { if (e.dead > 30) return; c.globalAlpha = 1 - e.dead / 30; c.fillStyle = "#6e5a4a"; c.beginPath(); c.ellipse(cx, by - 4, 16, 4, 0, 0, 7); c.fill(); c.globalAlpha = 1; return; }
  Art.shadow(cx, by, 15);
  const run = Math.sin(t / 3 + e.x) * 2;
  c.save(); c.translate(cx, by); c.scale(dir, 1);
  c.strokeStyle = "#d89a9a"; c.lineWidth = 2.4; c.lineCap = "round"; c.beginPath(); c.moveTo(-14, -8); c.quadraticCurveTo(-28, -4 + run, -34, -16); c.stroke();
  for (const lx of [-8, 8]) { c.fillStyle = "#d89a9a"; c.beginPath(); c.ellipse(lx + (lx > 0 ? run : -run), -1, 4, 2, 0, 0, 7); c.fill(); }
  c.beginPath(); c.ellipse(-1, -12, 17, 11, 0, 0, 7);
  c.fillStyle = rgr(c, -4, -18, 2, 20, [[0, "#9a8676"], [1, "#5a4838"]]); c.fill(); inkStroke(c, 1.2);
  c.beginPath(); c.moveTo(10, -18); c.quadraticCurveTo(24, -14, 25, -9); c.quadraticCurveTo(18, -4, 8, -6); c.closePath();
  c.fillStyle = "#8a7666"; c.fill(); inkStroke(c, 1);
  c.fillStyle = "#e8a0a0"; c.beginPath(); c.arc(25, -9, 2.2, 0, 7); c.fill();
  c.fillStyle = "#b89a8a"; c.beginPath(); c.arc(9, -20, 5, 0, 7); c.fill(); inkStroke(c, 0.9); c.fillStyle = "#e8b0b0"; c.beginPath(); c.arc(9, -20, 2.6, 0, 7); c.fill();
  c.fillStyle = "#111"; c.beginPath(); c.arc(17, -14, 1.8, 0, 7); c.fill(); c.fillStyle = "#fff"; c.fillRect(17.4, -15.2, 0.8, 0.8);
  c.strokeStyle = "rgba(40,30,20,0.6)"; c.lineWidth = 0.6; for (const dy of [-1, 1]) { c.beginPath(); c.moveTo(22, -10); c.lineTo(30, -10 + dy * 3); c.stroke(); }
  c.restore();
};
// A herring gull: white and grey, yellow beak, swooping.
Art.gull = function (e, t) {
  const c = ctx;
  if (!e.alive) { if (e.dead > 30) return; c.globalAlpha = 1 - e.dead / 30; for (let i = 0; i < 6; i++) { c.fillStyle = "#f2f2ee"; c.fillRect(e.x + 6 + i * 4, e.y + 10 + Math.sin(i + e.dead / 5) * 6 + e.dead, 4, 1.6); } c.globalAlpha = 1; return; }
  const dir = e.vx > 0 ? 1 : -1, diving = e.dive > 0, wing = diving ? -0.8 : Math.sin(t / 5) * 0.9;
  c.save(); c.translate(e.x + 18, e.y + 12); c.scale(dir, 1); if (diving) c.rotate(0.35);
  c.fillStyle = "#e8e8e4"; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-20, -2); c.lineTo(-19, 4); c.closePath(); c.fill(); inkStroke(c, 0.8);
  c.beginPath(); c.ellipse(0, 1, 13, 7, 0, 0, 7); c.fillStyle = lgr(c, 0, -6, 0, 8, [[0, "#ffffff"], [1, "#d8d8d4"]]); c.fill(); inkStroke(c, 1.1);
  c.beginPath(); c.arc(11, -4, 5.4, 0, 7); c.fillStyle = "#ffffff"; c.fill(); inkStroke(c, 1);
  c.fillStyle = "#f2c63c"; c.beginPath(); c.moveTo(15, -5); c.lineTo(23, -3); c.lineTo(15, -1.4); c.closePath(); c.fill(); inkStroke(c, 0.6);
  c.fillStyle = "#c0392b"; c.beginPath(); c.arc(20, -2.6, 0.9, 0, 7); c.fill();
  c.fillStyle = "#222"; c.beginPath(); c.arc(12.6, -5.4, 1.1, 0, 7); c.fill();
  c.save(); c.translate(-1, -2); c.rotate(-wing);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -18, -22, -14); c.lineTo(-17, -6); c.quadraticCurveTo(-6, 1, 0, 0);
  c.fillStyle = lgr(c, 0, 0, -22, -14, [[0, "#b8bcc4"], [0.75, "#9aa0aa"], [1, "#2a2a30"]]); c.fill(); inkStroke(c, 1);
  c.restore();
  c.restore();
};

// ---------------------------------------------------------------- guides
Object.assign(NPC_LOOK, {
  apprentice: { robe: "#6a4a7a", trim: "#3a2a4a", hat: "flat", hatCol: "#2a2a34", beard: null, skin: "#f0c9a0", long: false, prop: "apron" },
  parr:       { robe: "#7a2a3a", trim: "#d9a728", hat: "hood", hatCol: "#1e1a20", beard: null, skin: "#f2d0b0", long: true, prop: "book" },
  digges:     { robe: "#22284a", trim: "#c9a227", hat: "cap", hatCol: "#1a1a24", beard: "#7a6a5a", skin: "#e8b890", long: true, prop: "scope" },
  drake:      { robe: "#3a4a6a", trim: "#c9a227", hat: "tall", hatCol: "#1e1a18", beard: "#a0603a", skin: "#e0a87e", long: false, prop: "scope" }
});

// ---------------------------------------------------------------- the Long Gallery
// Royal portraits in gilt frames. idx: 0 Henry VIII, 1 Edward VI, 2 Mary I, 3 Elizabeth I.
Art.portrait = function (x, y, idx, lit, active, t) {
  const c = ctx, w = 52, h = 66;
  if (lit) { c.fillStyle = rgr(c, x + w / 2, y + h / 2, 4, 70, [[0, "rgba(255,225,140,0.55)"], [1, "rgba(255,225,140,0)"]]); c.beginPath(); c.arc(x + w / 2, y + h / 2, 70, 0, 7); c.fill(); }
  c.strokeStyle = "#5b3a1e"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + w / 2, y - 22); c.lineTo(x + 8, y); c.moveTo(x + w / 2, y - 22); c.lineTo(x + w - 8, y); c.stroke();
  c.fillStyle = "#c9a227"; c.beginPath(); c.arc(x + w / 2, y - 22, 2.5, 0, 7); c.fill();
  rrp(c, x - 4, y - 4, w + 8, h + 8, 3); c.fillStyle = lgr(c, x, y, x + w, y + h, [[0, "#f2d77a"], [0.5, "#b8861a"], [1, "#e9c44a"]]); c.fill(); inkStroke(c, 1.4);
  c.fillStyle = ["#1e2a3a", "#2a1e2a", "#1e2a22", "#2a1e1e"][idx]; c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x + w / 2, y + h);
  const skin = "#f0c8a4";
  if (idx === 0) {          // Henry VIII: broad shoulders, slashed doublet, beard, flat cap with feather
    c.fillStyle = "#8a2a1e"; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-24, -26); c.quadraticCurveTo(0, -34, 24, -26); c.lineTo(30, 0); c.fill();
    c.fillStyle = "#d9a728"; for (let k = -2; k <= 2; k++) c.fillRect(k * 8 - 1, -26, 2, 26);
    c.fillStyle = "#3a2a1a"; c.fillRect(-26, -24, 8, 24); c.fillRect(18, -24, 8, 24);
    c.fillStyle = skin; c.beginPath(); c.ellipse(0, -40, 10, 11, 0, 0, 7); c.fill();
    c.fillStyle = "#b8743a"; c.beginPath(); c.moveTo(-10, -40); c.quadraticCurveTo(-9, -26, 0, -27); c.quadraticCurveTo(9, -26, 10, -40); c.quadraticCurveTo(0, -33, -10, -40); c.fill();
    c.fillStyle = "#1a1a1a"; c.beginPath(); c.ellipse(0, -50, 14, 4, -0.1, 0, 7); c.fill(); c.fillStyle = "#f4ead2"; c.beginPath(); c.ellipse(9, -54, 7, 2, -0.6, 0, 7); c.fill();
  } else if (idx === 1) {   // Edward VI: a boy in a black cap and fur-trimmed robe
    c.fillStyle = "#2a2a3a"; c.beginPath(); c.moveTo(-22, 0); c.lineTo(-16, -22); c.quadraticCurveTo(0, -28, 16, -22); c.lineTo(22, 0); c.fill();
    c.fillStyle = "#c8b8a0"; c.fillRect(-18, -22, 6, 22); c.fillRect(12, -22, 6, 22);
    c.fillStyle = "#c0392b"; c.fillRect(-4, -22, 8, 22);
    c.fillStyle = skin; c.beginPath(); c.ellipse(0, -34, 8, 9, 0, 0, 7); c.fill();
    c.fillStyle = "#c8a060"; c.fillRect(-8, -40, 16, 4);
    c.fillStyle = "#111"; c.beginPath(); c.ellipse(0, -42, 11, 3.5, 0, 0, 7); c.fill(); c.fillStyle = "#f4ead2"; c.beginPath(); c.arc(-6, -43, 1.4, 0, 7); c.fill();
  } else if (idx === 2) {   // Mary I: dark gown, French hood, a crucifix
    c.fillStyle = "#3a1e2a"; c.beginPath(); c.moveTo(-24, 0); c.lineTo(-18, -24); c.quadraticCurveTo(0, -30, 18, -24); c.lineTo(24, 0); c.fill();
    c.fillStyle = "#d9a728"; c.fillRect(-1, -18, 2, 10); c.fillRect(-4, -15, 8, 2);
    c.fillStyle = skin; c.beginPath(); c.ellipse(0, -36, 8, 10, 0, 0, 7); c.fill();
    c.fillStyle = "#1a1418"; c.beginPath(); c.moveTo(-12, -30); c.lineTo(-11, -46); c.quadraticCurveTo(0, -54, 11, -46); c.lineTo(12, -30); c.lineTo(8, -32); c.lineTo(8, -44); c.quadraticCurveTo(0, -48, -8, -44); c.lineTo(-8, -32); c.fill();
    c.strokeStyle = "#e8dcc0"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, -44); c.quadraticCurveTo(0, -49, 9, -44); c.stroke();
  } else {                  // Elizabeth I: red hair, a great white ruff, pearls
    c.fillStyle = "#f4ead2"; c.beginPath(); c.moveTo(-26, 0); c.lineTo(-18, -24); c.quadraticCurveTo(0, -30, 18, -24); c.lineTo(26, 0); c.fill();
    c.fillStyle = "#c9a227"; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(k * 6, -14 + Math.abs(k), 1.4, 0, 7); c.fill(); }
    c.fillStyle = "#fbf8f0"; c.beginPath(); c.ellipse(0, -28, 18, 6, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(120,110,90,0.6)"; c.lineWidth = 0.6; for (let k = -16; k <= 16; k += 3) { c.beginPath(); c.moveTo(k, -31); c.lineTo(k, -25); c.stroke(); }
    c.fillStyle = "#f6dcc4"; c.beginPath(); c.ellipse(0, -38, 7, 9, 0, 0, 7); c.fill();
    c.fillStyle = "#c8562a"; c.beginPath(); c.arc(-6, -44, 5, 0, 7); c.arc(6, -44, 5, 0, 7); c.arc(0, -47, 6, 0, 7); c.fill();
    c.fillStyle = "#fff"; for (let k = -1; k <= 1; k++) { c.beginPath(); c.arc(k * 5, -51, 1.4, 0, 7); c.fill(); }
  }
  c.fillStyle = "#222"; c.beginPath(); c.arc(-3, idx === 0 ? -41 : idx === 1 ? -35 : -37, 1, 0, 7); c.arc(3, idx === 0 ? -41 : idx === 1 ? -35 : -37, 1, 0, 7); c.fill();
  c.restore();
  // a name plaque under each portrait
  const name = ["Henry VIII", "Edward VI", "Mary I", "Elizabeth I"][idx];
  rrp(c, x - 2, y + h + 7, w + 4, 15, 3); c.fillStyle = lit ? "#ffe8a8" : "#e8dcc0"; c.fill(); inkStroke(c, 0.9);
  c.fillStyle = INK; c.font = `800 11px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(name, x + w / 2, y + h + 15);
  if (lit) { c.fillStyle = "#2f7a64"; c.font = `bold 16px ${FONT_B}`; c.fillText("✓", x + w - 4, y + 6); }
  else if (active) { c.strokeStyle = `rgba(255,230,150,${0.4 + 0.3 * Math.sin(t / 8)})`; c.lineWidth = 2; rrp(c, x - 6, y - 6, w + 12, h + 12, 4); c.stroke(); }
};

// ---------------------------------------------------------------- the Great Orrery
// Brass rings and arms; the Earth or the Sun sits at the center depending on the model.
Art.orrery = function (O, plats, t) {
  const c = ctx, k = O.k, cx = O.cx, cy = O.cy;
  // the pit beneath is deep space
  c.fillStyle = lgr(c, 0, cy, 0, VH, [[0, "rgba(10,12,30,0)"], [1, "rgba(10,12,30,0.8)"]]); c.fillRect(O.x0 * T, cy, (O.x1 - O.x0 + 1) * T, VH - cy);
  c.strokeStyle = `rgba(201,162,39,${0.25 + 0.35 * k})`; c.lineWidth = 1.4; c.setLineDash([6, 6]);
  for (const m of plats) if (m.kind === "orbit") { c.beginPath(); c.ellipse(cx, cy, m.r, m.r * 0.4, 0, 0, 7); c.stroke(); }
  c.setLineDash([]);
  // arms from the center to each planet platform
  for (const m of plats) if (m.kind === "orbit") {
    c.strokeStyle = "#8a6a2a"; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(m.x + m.w / 2, m.y + 8); c.stroke();
    c.strokeStyle = "rgba(255,230,150,0.5)"; c.lineWidth = 1; c.stroke();
  }
  // the central pillar
  c.fillStyle = "#5b3a1e"; c.fillRect(cx - 6, cy, 12, VH - cy); c.beginPath(); c.rect(cx - 6, cy, 12, VH - cy); inkStroke(c, 1);
  const a = O.sunA, ring = 150;
  const earthAt = [cx + Math.cos(a) * ring * k, cy + Math.sin(a) * ring * 0.4 * k];
  const sunAt = [cx + Math.cos(a + Math.PI) * ring * (1 - k), cy + Math.sin(a + Math.PI) * ring * 0.4 * (1 - k)];
  // the Sun
  c.save(); c.translate(...sunAt);
  c.fillStyle = rgr(c, 0, 0, 4, 46, [[0, "rgba(255,220,120,0.8)"], [1, "rgba(255,200,90,0)"]]); c.beginPath(); c.arc(0, 0, 46, 0, 7); c.fill();
  c.rotate(t / 80); c.fillStyle = "#f2b13c"; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(-4, -16); c.lineTo(0, -26); c.lineTo(4, -16); c.fill(); }
  c.beginPath(); c.arc(0, 0, 17, 0, 7); c.fillStyle = rgr(c, -5, -5, 2, 18, [[0, "#fff4c0"], [1, "#e89a2a"]]); c.fill(); inkStroke(c, 1.2);
  c.restore();
  // the Earth
  c.save(); c.translate(...earthAt);
  c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fillStyle = rgr(c, -4, -4, 2, 14, [[0, "#9ad0f0"], [1, "#2a6aa0"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#5a9a4a"; c.beginPath(); c.ellipse(-3, -2, 5, 7, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(6, 4, 3, 2, 0, 0, 7); c.fill();
  c.restore();
  // a label for the model in use
  c.fillStyle = "rgba(20,20,40,0.75)"; rrp(c, cx - 92, cy + 150, 184, 24, 6); c.fill();
  c.fillStyle = k > 0.5 ? "#ffe28a" : "#c9c9e8"; c.font = `800 13px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(k > 0.5 ? "HELIOCENTRIC · Sun at center" : "GEOCENTRIC · Earth at center", cx, cy + 162);
};
// Platforms: planets on the orrery, and ships on the Channel.
const _platL2 = Art.plat;
Art.plat = function (m, t) {
  const c = ctx;
  if (m.kind === "orbit") {
    const x = m.x, y = m.y, cxp = x + m.w / 2;
    rrp(c, x, y, m.w, 12, 5); c.fillStyle = lgr(c, 0, y, 0, y + 12, [[0, "#e9c44a"], [1, "#8a6410"]]); c.fill(); inkStroke(c, 1.3);
    c.fillStyle = "rgba(255,250,220,0.6)"; c.fillRect(x + 6, y + 2, m.w - 12, 1.5);
    const col = { 330: ["#d8a070", "#8a4a2a"], 215: ["#e8d8a0", "#a88a40"], 105: ["#c06040", "#6a2a1a"] }[m.r] || ["#aaa", "#555"];
    c.beginPath(); c.arc(cxp, y + 22, 10, 0, 7); c.fillStyle = rgr(c, cxp - 3, y + 19, 1, 11, [[0, col[0]], [1, col[1]]]); c.fill(); inkStroke(c, 1);
    if (m.r === 330) { c.strokeStyle = "#c9b48a"; c.lineWidth = 1.6; c.beginPath(); c.ellipse(cxp, y + 22, 16, 4, -0.2, 0, 7); c.stroke(); }
    return;
  }
  if (m.kind === "ship") {
    const x = m.x, y = m.y, w = m.w, d = Math.max(34, 14.4 * T + 8 - y);
    c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x + w + 14, y); c.quadraticCurveTo(x + w + 4, y + d * 0.9, x + w - 14, y + d); c.lineTo(x + 10, y + d); c.quadraticCurveTo(x - 4, y + d * 0.7, x - 10, y); c.closePath();
    c.fillStyle = lgr(c, 0, y, 0, y + d, [[0, "#8b5a2b"], [0.5, "#6e4523"], [1, "#3b2414"]]); c.fill(); inkStroke(c, 1.4);
    c.fillStyle = "#c9a227"; c.fillRect(x - 6, y + 6, w + 14, 2.5);
    c.fillStyle = "#e8dcc0"; for (let i = 0; i < 4; i++) { c.fillStyle = "#1a1210"; c.fillRect(x + 12 + i * 28, y + 14, 8, 6); }
    rrp(c, x - 6, y - 4, w + 16, 8, 2); c.fillStyle = lgr(c, 0, y - 4, 0, y + 4, [[0, "#c9945a"], [1, "#7a5028"]]); c.fill(); inkStroke(c, 1);
    // mast and a sail with St George's cross
    const mx = x + w / 2;
    c.fillStyle = "#4a2e17"; c.fillRect(mx - 2, y - 100, 4, 96);
    c.beginPath(); c.moveTo(mx - 30, y - 92); c.quadraticCurveTo(mx, y - 82 + Math.sin(t / 20 + m.ph) * 3, mx + 30, y - 92); c.lineTo(mx + 26, y - 40); c.quadraticCurveTo(mx, y - 32, mx - 26, y - 40); c.closePath();
    c.fillStyle = lgr(c, mx - 30, 0, mx + 30, 0, [[0, "#e8e0cc"], [0.5, "#fbf7ec"], [1, "#d8d0bc"]]); c.fill(); inkStroke(c, 1.1);
    c.fillStyle = "#b8282c"; c.fillRect(mx - 3, y - 88, 6, 50); c.fillRect(mx - 26, y - 66, 52, 6);
    c.fillStyle = "#f6f2ea"; c.fillRect(mx + 2, y - 112, 16, 10); c.fillStyle = "#b8282c"; c.fillRect(mx + 8, y - 112, 4, 10); c.fillRect(mx + 2, y - 108.5, 16, 3);
    c.fillStyle = "rgba(230,245,250,0.7)"; c.beginPath(); c.ellipse(x + w / 2, 14.4 * T + 2, w / 2 + 18, 5, 0, 0, 7); c.fill();
    return;
  }
  return _platL2.call(this, m, t);
};
// A star-bridge: faint sparkles without Galileo's Lens, a solid band of starlight with it.
Art.starBridge = function (x, y, t, on) {
  const c = ctx;
  if (!on) {
    c.fillStyle = `rgba(220,230,255,${0.12 + 0.1 * Math.sin(t / 15 + x)})`;
    for (let i = 0; i < 3; i++) { const sx = x + 6 + i * 10, sy = y + 10 + Math.sin(t / 20 + i + x) * 3; c.fillRect(sx - 0.6, sy - 3, 1.2, 6); c.fillRect(sx - 3, sy - 0.6, 6, 1.2); }
    return;
  }
  rrp(c, x + 1, y + 2, 30, 14, 6); c.fillStyle = lgr(c, 0, y + 2, 0, y + 16, [[0, "rgba(230,240,255,0.9)"], [1, "rgba(140,160,240,0.6)"]]); c.fill();
  c.strokeStyle = "rgba(255,240,180,0.9)"; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = "#fff8d0"; for (let i = 0; i < 3; i++) { const sx = x + 6 + i * 10, sy = y + 9; c.globalAlpha = 0.5 + 0.5 * Math.sin(t / 8 + i); c.fillRect(sx - 0.6, sy - 3, 1.2, 6); c.fillRect(sx - 3, sy - 0.6, 6, 1.2); }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------- arena triggers
// A brass telescope on a tripod (Crystal Spheres arena).
Art.scope = function (x, base, lit, t) {
  const c = ctx;
  if (lit) { c.fillStyle = rgr(c, x, base - 50, 2, 60, [[0, "rgba(200,220,255,0.6)"], [1, "rgba(200,220,255,0)"]]); c.beginPath(); c.arc(x, base - 50, 60, 0, 7); c.fill(); }
  c.strokeStyle = "#5b3a1e"; c.lineWidth = 3; c.beginPath(); c.moveTo(x, base - 34); c.lineTo(x - 14, base); c.moveTo(x, base - 34); c.lineTo(x + 14, base); c.moveTo(x, base - 34); c.lineTo(x, base); c.stroke();
  c.save(); c.translate(x, base - 38); c.rotate(-0.6 + (lit ? Math.sin(t / 30) * 0.05 : 0));
  rrp(c, -22, -6, 44, 12, 4); c.fillStyle = lgr(c, 0, -6, 0, 6, [[0, "#f2d77a"], [1, "#9a7012"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#5b3a1e"; c.fillRect(-6, -7, 4, 14); c.fillRect(8, -7, 4, 14);
  c.fillStyle = lit ? "#e8f4ff" : "#4a5a7a"; c.beginPath(); c.ellipse(22, 0, 3, 7, 0, 0, 7); c.fill(); inkStroke(c, 1);
  c.restore();
  if (lit) { c.fillStyle = "#fff6d8"; c.font = `bold 20px ${FONT_B}`; c.textAlign = "center"; c.fillText("▼", x, base - 86 + Math.sin(t / 6) * 3); }
};
// A warning beacon: an iron fire-basket on a tall post.
Art.beacon = function (x, base, lit, t) {
  const c = ctx;
  c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(x - 12, base); c.lineTo(x, base - 54); c.lineTo(x + 12, base); c.stroke();
  c.strokeStyle = "#6e4523"; c.lineWidth = 4.5; c.stroke();
  c.beginPath(); c.moveTo(x - 14, base - 66); c.lineTo(x + 14, base - 66); c.lineTo(x + 9, base - 52); c.lineTo(x - 9, base - 52); c.closePath();
  c.fillStyle = "#2b2b2b"; c.fill(); inkStroke(c, 1.2);
  c.strokeStyle = "#5a5a64"; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 5, base - 66); c.lineTo(x + k * 3.5, base - 52); c.stroke(); }
  if (lit) {
    c.fillStyle = rgr(c, x, base - 80, 2, 70, [[0, "rgba(255,190,90,0.75)"], [1, "rgba(255,170,70,0)"]]); c.beginPath(); c.arc(x, base - 80, 70, 0, 7); c.fill();
    for (let i = 0; i < 3; i++) {
      const fw = 12 - i * 3, fh = 26 - i * 6 + Math.sin(t / 3 + i) * 4;
      c.fillStyle = ["#e8501e", "#ffa030", "#fff0a0"][i];
      c.beginPath(); c.moveTo(x - fw, base - 66); c.quadraticCurveTo(x - fw * 0.6, base - 66 - fh * 0.7, x + Math.sin(t / 4) * 2, base - 66 - fh); c.quadraticCurveTo(x + fw * 0.6, base - 66 - fh * 0.7, x + fw, base - 66); c.fill();
    }
    c.fillStyle = "#fff6d8"; c.font = `bold 20px ${FONT_B}`; c.textAlign = "center"; c.fillText("▼", x, base - 114 + Math.sin(t / 6) * 3);
  } else { c.fillStyle = "#4a3424"; c.fillRect(x - 10, base - 70, 20, 5); }
};

// ---------------------------------------------------------------- bosses
// The Crystal Spheres: the Herald's machine of nested crystal shells around a stubborn Earth.
Art.spheres = function (b, t) {
  const c = ctx, fade = b.dying ? Math.max(0, 1 - b.dying / 140) : 1, hit = b.flash % 6 > 2, shells = b.maxHp ? b.hp : 3;
  c.save(); c.globalAlpha = fade; c.translate(b.x, b.y);
  c.fillStyle = rgr(c, 0, 0, 10, 120, [[0, "rgba(160,200,255,0.25)"], [1, "rgba(160,200,255,0)"]]); c.beginPath(); c.arc(0, 0, 120, 0, 7); c.fill();
  for (let i = 3; i >= 1; i--) {
    const R = 28 + i * 24, alive = i <= Math.max(shells, b.dying ? 0 : 1);
    c.save(); c.rotate(t / (60 + i * 30) * (i % 2 ? 1 : -1));
    c.beginPath(); c.ellipse(0, 0, R, R * 0.92, 0, 0, 7);
    c.fillStyle = hit ? "rgba(255,255,255,0.4)" : `rgba(${180 - i * 20},${210 - i * 10},255,${alive ? 0.16 : 0.04})`; c.fill();
    c.strokeStyle = alive ? `rgba(220,235,255,0.85)` : "rgba(220,235,255,0.2)"; c.lineWidth = alive ? 2.2 : 1; c.stroke();
    if (alive) {
      c.strokeStyle = "#c9a227"; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, R, R * 0.3, 0.3, 0, 7); c.stroke();
      const pa = t / 40 * (i % 2 ? 1 : -1) + i;
      c.fillStyle = ["#d8a070", "#e8d8a0", "#c06040"][i - 1]; c.beginPath(); c.arc(Math.cos(pa) * R, Math.sin(pa) * R * 0.3, 6, 0, 7); c.fill(); inkStroke(c, 0.8);
      for (let k = 0; k < 6; k++) { const sa = k * 1.05 + i; c.fillStyle = "rgba(255,255,255,0.8)"; c.fillRect(Math.cos(sa) * R * 0.95 - 1, Math.sin(sa) * R * 0.88 - 1, 2, 2); }
    } else {
      c.strokeStyle = "rgba(220,235,255,0.5)"; c.lineWidth = 1; for (let k = 0; k < 5; k++) { const sa = k * 1.3; c.beginPath(); c.moveTo(Math.cos(sa) * R, Math.sin(sa) * R); c.lineTo(Math.cos(sa + 0.2) * (R - 10), Math.sin(sa + 0.2) * (R - 10)); c.stroke(); }
    }
    c.restore();
  }
  // the stubborn Earth at the center, with a scowl
  c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fillStyle = hit ? "#ffffff" : rgr(c, -7, -7, 2, 24, [[0, "#8ac0e8"], [1, "#1e4a7a"]]); c.fill(); inkStroke(c, 1.6);
  c.fillStyle = "#4f8a3a"; c.beginPath(); c.ellipse(-8, -4, 8, 11, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(10, 8, 6, 4, 0, 0, 7); c.fill();
  for (const s of [-1, 1]) { c.fillStyle = "#fff"; c.beginPath(); c.ellipse(s * 7, -4, 4, 4.6, 0, 0, 7); c.fill(); c.fillStyle = "#1a1a2a"; c.beginPath(); c.arc(s * 7 + Math.sin(t / 30) * 1.5, -3, 2, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(s * 12, -11); c.lineTo(s * 3, -8); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 10, 6, Math.PI + 0.4, -0.4); c.stroke();
  c.restore();
};
// The galleon: a towering Spanish warship with the Herald on the stern castle.
Art.galleon = function (b, t) {
  const c = ctx, fade = b.dying ? Math.max(0, 1 - b.dying / 140) : 1, hit = b.flash % 6 > 2, sink = b.dying ? b.dying * 0.6 : 0;
  c.save(); c.globalAlpha = fade; c.translate(b.x, b.y + sink); c.rotate(Math.sin(t / 40) * 0.02 + (b.dying ? b.dying / 900 : 0)); c.scale(-1, 1);
  const hull = hit ? "#fff0e0" : null;
  // masts and sails
  for (const [mx, mh, sw] of [[-60, 190, 46], [6, 230, 58], [70, 170, 40]]) {
    c.fillStyle = "#3b2414"; c.fillRect(mx - 3, -mh, 6, mh);
    for (let k = 0; k < 2; k++) {
      const sy = -mh + 20 + k * (mh * 0.42), sh = mh * 0.34, bw = sw - k * -6;
      c.beginPath(); c.moveTo(mx - bw, sy); c.quadraticCurveTo(mx, sy + 8 + Math.sin(t / 18 + mx) * 3, mx + bw, sy); c.lineTo(mx + bw - 4, sy + sh); c.quadraticCurveTo(mx, sy + sh + 10, mx - bw + 4, sy + sh); c.closePath();
      c.fillStyle = hull || lgr(c, mx - bw, 0, mx + bw, 0, [[0, "#d8cfb8"], [0.5, "#f4eedc"], [1, "#c8bea6"]]); c.fill(); inkStroke(c, 1.2);
      if (k === 0) { c.strokeStyle = "#b8282c"; c.lineWidth = 6; c.beginPath(); c.moveTo(mx - bw * 0.5, sy + sh * 0.2); c.lineTo(mx + bw * 0.5, sy + sh * 0.85); c.moveTo(mx + bw * 0.5, sy + sh * 0.2); c.lineTo(mx - bw * 0.5, sy + sh * 0.85); c.stroke(); }
    }
    c.fillStyle = "#c9a227"; c.beginPath(); c.moveTo(mx, -mh - 2); c.lineTo(mx + 22, -mh + 4 + Math.sin(t / 10 + mx) * 2); c.lineTo(mx, -mh + 10); c.fill();
  }
  c.strokeStyle = "rgba(43,29,20,0.6)"; c.lineWidth = 1; for (const [a1, a2] of [[-150, -60], [-60, 6], [6, 70], [70, 150]]) { c.beginPath(); c.moveTo(a1, -40); c.lineTo(a2, -170); c.stroke(); }
  // hull with castles fore and aft
  c.beginPath(); c.moveTo(-150, -60); c.lineTo(-110, -60); c.lineTo(-110, -40); c.lineTo(90, -40); c.lineTo(90, -90); c.lineTo(150, -94); c.lineTo(140, -20); c.quadraticCurveTo(120, 20, 70, 26); c.lineTo(-100, 26); c.quadraticCurveTo(-140, 10, -150, -60); c.closePath();
  c.fillStyle = hull || lgr(c, 0, -94, 0, 26, [[0, "#9a5a2a"], [0.5, "#6e3a1a"], [1, "#3a1e0e"]]); c.fill(); inkStroke(c, 2);
  c.fillStyle = "#c9a227"; c.fillRect(-140, -36, 280, 4); c.fillRect(92, -84, 52, 3);
  for (let i = 0; i < 7; i++) { c.fillStyle = "#1a0e08"; rrp(c, -120 + i * 32, -22, 12, 10, 2); c.fill(); c.fillStyle = "#3a3a44"; c.fillRect(-122 + i * 32, -18, 6, 3); }
  c.fillStyle = "#b8282c"; c.fillRect(100, -78, 36, 26); c.fillStyle = "#c9a227"; c.beginPath(); c.arc(118, -65, 7, 0, 7); c.fill();
  if (b.smoke) { for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(220,220,220,${b.smoke / 30})`; c.beginPath(); c.arc(160 + i * 12, -16 - i * 6, 8 + i * 4, 0, 7); c.fill(); } }
  c.restore();
  // the Herald on the stern castle (drawn unflipped)
  if (!b.dying || b.dying < 60) Art.herald(b.x - 120, b.y - 96 + sink, t, 1, 0.8);
  // waves around the hull
  c.fillStyle = "rgba(220,240,250,0.7)";
  for (let i = 0; i < 8; i++) { const wx = b.x - 160 + i * 42, wy = b.y + 18 + Math.sin(t / 12 + i) * 3; c.beginPath(); c.ellipse(wx, wy, 18, 4, 0, 0, 7); c.fill(); }
};
const _projL2 = Art.proj;
Art.proj = function (o, t) {
  const c = ctx;
  if (o.kind === "shard") {
    c.save(); c.translate(o.x, o.y); c.rotate(t / 6);
    c.fillStyle = "rgba(200,225,255,0.4)"; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill();
    c.beginPath(); c.moveTo(0, -10); c.lineTo(4, 0); c.lineTo(0, 10); c.lineTo(-4, 0); c.closePath();
    c.fillStyle = lgr(c, -4, -10, 4, 10, [[0, "#ffffff"], [1, "#9ac0f0"]]); c.fill(); inkStroke(c, 0.9);
    c.restore(); return;
  }
  if (o.kind === "ball") {
    c.fillStyle = "rgba(200,200,200,0.3)"; c.beginPath(); c.arc(o.x - o.vx * 3, o.y - o.vy * 3, 7, 0, 7); c.fill();
    c.beginPath(); c.arc(o.x, o.y, 9, 0, 7); c.fillStyle = rgr(c, o.x - 3, o.y - 3, 1, 10, [[0, "#7a7a84"], [1, "#1a1a20"]]); c.fill(); inkStroke(c, 1);
    return;
  }
  return _projL2.call(this, o, t);
};

// ---------------------------------------------------------------- the Channel
const _waterL2 = Art.water;
Art.water = function (x0, x1, top, t, style) {
  if (style !== "sea") return _waterL2.call(this, x0, x1, top, t, style);
  const c = ctx;
  c.fillStyle = lgr(c, 0, top, 0, VH, [[0, "#5a8aa0"], [0.3, "#3a6a84"], [1, "#1e3a50"]]);
  c.fillRect(x0, top, x1 - x0, VH - top);
  c.fillStyle = "#e8f4f8";
  c.beginPath(); c.moveTo(x0, top + 4);
  for (let x = x0; x <= x1; x += 8) c.lineTo(x, top + Math.sin(t / 14 + x * 0.05) * 4 + Math.sin(t / 7 + x * 0.13) * 1.5);
  c.lineTo(x1, top + 8); c.lineTo(x0, top + 8); c.closePath(); c.fill();
  for (let x = x0; x < x1; x += 30) for (let k = 0; k < 3; k++) {
    const yy = top + 18 + k * 20 + ((x / 30) % 3) * 4, ox = Math.sin(t / 16 + x * 0.1 + k) * 8;
    c.fillStyle = `rgba(220,240,250,${0.4 - k * 0.1})`; c.beginPath(); c.ellipse(x + ox, yy, 9 - k * 2, 1.6, 0, 0, 7); c.fill();
  }
};
