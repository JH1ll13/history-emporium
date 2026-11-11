"use strict";
// =====================================================================
//  ART — everything the game paints.
//  Logical coordinates are 960×544. Cached layers (tiles, skyline,
//  clouds, map) are rendered at Art.res (device pixels per logical
//  pixel), so the game stays sharp on large and high-density screens.
//  Style: ink outlines, warm Tuscan palette, painterly gradients.
// =====================================================================
const INK = "#2b1d14";

const Art = {
  res: 1, tiles: {}, clouds: [],
  mk(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w * this.res)); c.height = Math.max(1, Math.ceil(h * this.res));
    c.lw = w; c.lh = h;
    const x = c.getContext("2d"); x.scale(this.res, this.res);
    return [c, x];
  },
  put(c, x, y, cx = ctx) { cx.drawImage(c, x, y, c.lw, c.lh); },
  build() {
    this.buildGrain();
    this.buildTiles();
    this.buildBackgrounds();
    this.buildClouds();
    this.buildVignette();
    this.buildCoins();
    this.decorCache = new Map();
  },
  // Paper grain, baked into cached layers (cheaper than a per-frame overlay).
  grainify(c, x, w, h, a = 1) {
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = a; x.globalCompositeOperation = "source-atop";
    x.fillStyle = x.createPattern(this.grainCanvas, "repeat"); x.fillRect(0, 0, c.width, c.height); x.restore();
  }
};

// ---------------------------------------------------------------- helpers
function rrp(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function lgr(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function rgr(c, x, y, r0, r1, stops, x1, y1) { const g = c.createRadialGradient(x, y, r0, x1 ?? x, y1 ?? y, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function speck(c, r, x, y, w, h, n, cols, size = 1) {
  for (let i = 0; i < n; i++) { c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fillRect(x + r() * w, y + r() * h, size, size); }
}
function blobs(c, r, x, y, w, h, n, col, r0, r1) {
  for (let i = 0; i < n; i++) {
    const bx = x + r() * w, by = y + r() * h, rad = r0 + r() * (r1 - r0);
    c.fillStyle = rgr(c, bx, by, 0, rad, [[0, col], [1, col.replace(/[\d.]+\)$/, "0)")]]);
    c.beginPath(); c.arc(bx, by, rad, 0, 7); c.fill();
  }
}
function inkStroke(c, w = 1.5, a = 1) { c.strokeStyle = a < 1 ? `rgba(43,29,20,${a})` : INK; c.lineWidth = w; c.stroke(); }
// Florentine lily (giglio), centered at x,y, roughly 12*s tall.
function lily(c, x, y, s, col) {
  c.fillStyle = col; c.beginPath();
  c.moveTo(x, y - 6 * s); c.quadraticCurveTo(x + 2.2 * s, y - 2.5 * s, x, y + 0.5 * s); c.quadraticCurveTo(x - 2.2 * s, y - 2.5 * s, x, y - 6 * s);
  for (const d of [-1, 1]) {
    c.moveTo(x + d * 0.8 * s, y - 0.2 * s);
    c.bezierCurveTo(x + d * 4.5 * s, y - 0.8 * s, x + d * 6 * s, y - 4.5 * s, x + d * 3.6 * s, y - 5.8 * s);
    c.bezierCurveTo(x + d * 4.6 * s, y - 3.4 * s, x + d * 3 * s, y - 1.6 * s, x + d * 0.6 * s, y - 1.2 * s);
    c.moveTo(x, y + 0.6 * s); c.lineTo(x + d * 2.6 * s, y + 4.6 * s); c.lineTo(x + d * 1.4 * s, y + 4.8 * s); c.lineTo(x, y + 2 * s);
  }
  c.fill();
  c.fillRect(x - 2.6 * s, y - 0.4 * s, 5.2 * s, 1.4 * s);
}
// Medici arms: gold shield, red palle, the top one blue with gold lilies.
function mediciShield(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-10, -12); c.lineTo(10, -12); c.lineTo(10, 2); c.quadraticCurveTo(10, 10, 0, 14); c.quadraticCurveTo(-10, 10, -10, 2); c.closePath();
  c.fillStyle = lgr(c, -10, -12, 10, 14, [[0, "#f6d77a"], [1, "#b88a1f"]]); c.fill(); inkStroke(c, 1.2);
  const ball = (bx, by, col) => { c.fillStyle = col; c.beginPath(); c.arc(bx, by, 2.3, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,0.45)"; c.beginPath(); c.arc(bx - 0.7, by - 0.7, 0.8, 0, 7); c.fill(); };
  ball(0, -8, "#2f5aa8");
  [[-5, -3], [5, -3], [-6, 2.5], [6, 2.5], [0, 7]].forEach(([a, b]) => ball(a, b, "#c0392b"));
  c.restore();
}

// Imperial eagle (Holy Roman Empire), a simplified heraldic silhouette.
function eagle(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(0, 2, 5, 9, 0, 0, 7); c.fill();
  c.beginPath(); c.arc(0, -9, 3.6, 0, 7); c.fill();
  c.beginPath(); c.moveTo(2.5, -9.5); c.lineTo(7, -8); c.lineTo(2.8, -7); c.fill();
  for (const d of [-1, 1]) {
    c.beginPath(); c.moveTo(d * 3, -3);
    c.lineTo(d * 18, -12); c.lineTo(d * 16, -6); c.lineTo(d * 20, -5); c.lineTo(d * 16, -1); c.lineTo(d * 19, 1); c.lineTo(d * 14, 3); c.lineTo(d * 4, 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(d * 2, 10); c.lineTo(d * 6, 17); c.lineTo(d * 3, 17); c.lineTo(d * 1, 12); c.fill();
  }
  c.beginPath(); c.moveTo(-4, 9); c.lineTo(0, 18); c.lineTo(4, 9); c.fill();
  c.fillStyle = "#c0392b"; c.beginPath(); c.moveTo(2.5, -10); c.lineTo(4.2, -11); c.lineTo(3.8, -9); c.fill();
  c.restore();
}
function eagleShield(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-10, -12); c.lineTo(10, -12); c.lineTo(10, 2); c.quadraticCurveTo(10, 10, 0, 14); c.quadraticCurveTo(-10, 10, -10, 2); c.closePath();
  c.fillStyle = lgr(c, -10, -12, 10, 14, [[0, "#f6d77a"], [1, "#b88a1f"]]); c.fill(); inkStroke(c, 1.2);
  eagle(c, 0, 0, 0.5, "#1e1a18");
  c.restore();
}

// ---------------------------------------------------------------- tiles
// Each cached tile is 32×48 with a 16px margin on top (for grass blades
// and roof edges that overhang); drawn at (x, y - 16).
const TILE_PAINT = {
  z0Body(c, r, v) {
    c.fillStyle = "#6f5a44"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 2; row++) {
      const start = -((v * 7 + row * 12) % 24);
      for (let bx = start; bx < 32; bx += 24) {
        const cols = ["#a88b69", "#9f8262", "#b09372", "#977a5c"];
        c.fillStyle = cols[Math.floor(r() * 4)]; c.fillRect(bx + 1, row * 16 + 1, 22, 14);
        c.fillStyle = "rgba(255,236,200,0.28)"; c.fillRect(bx + 1, row * 16 + 1, 22, 1.5); c.fillRect(bx + 1, row * 16 + 1, 1.5, 14);
        c.fillStyle = "rgba(40,25,10,0.3)"; c.fillRect(bx + 1, row * 16 + 13.5, 22, 1.5); c.fillRect(bx + 21.5, row * 16 + 1, 1.5, 14);
        speck(c, r, bx + 2, row * 16 + 2, 19, 11, 14, ["rgba(90,70,50,0.5)", "rgba(210,190,160,0.5)"]);
      }
    }
  },
  z0Top(c, r, v) {
    TILE_PAINT.z0Body(c, r, v);
    c.fillStyle = "#4b4136"; c.fillRect(0, -1, 32, 14);
    for (let row = 0; row < 2; row++) for (let i = -1; i < 5; i++) {
      const x = i * 8 + (row ? 4 : 0) + (r() - 0.5), y = row * 6;
      rrp(c, x + 0.5, y, 7, 5.6, 2.3);
      c.fillStyle = rgr(c, x + 2.5, y + 1.4, 0.5, 6, [[0, "#d2c3a8"], [1, "#8a7b65"]]); c.fill();
      c.strokeStyle = "rgba(25,18,10,0.45)"; c.lineWidth = 0.6; c.stroke();
    }
    c.fillStyle = lgr(c, 0, 12, 0, 16, [[0, "#c4ac88"], [1, "#9e8665"]]); c.fillRect(0, 12, 32, 4);
    c.fillStyle = "rgba(30,20,10,0.45)"; c.fillRect(0, 16, 32, 1.5);
  },
  z1Body(c, r, v) {
    c.fillStyle = lgr(c, 0, 0, 0, 32, [[0, "#7e5d3c"], [1, "#5c422a"]]); c.fillRect(0, 0, 32, 32);
    c.strokeStyle = "rgba(50,32,18,0.35)"; c.lineWidth = 1;
    for (let k = 0; k < 2; k++) { c.beginPath(); const y = 10 + k * 12 + r() * 3; c.moveTo(0, y); c.bezierCurveTo(10, y - 2, 20, y + 3, 32, y); c.stroke(); }
    for (let k = 0; k < 3; k++) {
      const px = 3 + r() * 26, py = 6 + r() * 22, pw = 2 + r() * 3;
      c.fillStyle = rgr(c, px - 0.6, py - 0.8, 0, pw * 1.4, [[0, "#b8ab98"], [1, "#6f6658"]]);
      c.beginPath(); c.ellipse(px, py, pw, pw * 0.7, 0, 0, 7); c.fill();
    }
    speck(c, r, 0, 0, 32, 32, 18, ["rgba(40,25,12,0.5)", "rgba(160,120,80,0.4)"]);
  },
  z1Top(c, r, v) {
    TILE_PAINT.z1Body(c, r, v);
    c.beginPath(); c.moveTo(0, -2);
    for (let x = 0; x <= 32; x += 4) c.lineTo(x, 9 + Math.sin(x * 0.7 + v) * 2 + r() * 2);
    c.lineTo(32, -2); c.closePath();
    c.fillStyle = lgr(c, 0, 0, 0, 12, [[0, "#86b453"], [1, "#4b7531"]]); c.fill();
    const greens = ["#5d8c3a", "#7fb04c", "#9ccb62", "#4a7a30", "#6a9c40"];
    c.lineCap = "round";
    for (let i = 0; i < 30; i++) {
      const x = r() * 32, h = 4 + r() * 10, lean = (r() - 0.5) * 5;
      c.strokeStyle = greens[Math.floor(r() * greens.length)]; c.lineWidth = 1 + r() * 0.6;
      c.beginPath(); c.moveTo(x, 6); c.quadraticCurveTo(x + lean * 0.3, 6 - h * 0.6, x + lean, 6 - h); c.stroke();
    }
    if (v === 1 || v === 3) {
      const fx = 6 + r() * 20, fy = -6 - r() * 3;
      c.strokeStyle = "#4a7a30"; c.lineWidth = 1; c.beginPath(); c.moveTo(fx, 5); c.lineTo(fx, fy); c.stroke();
      for (let k = 0; k < 5; k++) { const a = k * 1.256; c.fillStyle = v === 1 ? "#fbf6ea" : "#d8382c"; c.beginPath(); c.ellipse(fx + Math.cos(a) * 2, fy + Math.sin(a) * 2, 1.6, 1.1, a, 0, 7); c.fill(); }
      c.fillStyle = v === 1 ? "#f2c63c" : "#2b1d14"; c.beginPath(); c.arc(fx, fy, 1, 0, 7); c.fill();
    }
  },
  z2Body(c, r, v) {
    c.fillStyle = "#dcb47e"; c.fillRect(0, 0, 32, 32);
    blobs(c, r, 0, 0, 32, 32, 5, "rgba(240,206,152,0.5)", 4, 10);
    blobs(c, r, 0, 0, 32, 32, 4, "rgba(176,132,82,0.35)", 3, 9);
    speck(c, r, 0, 0, 32, 32, 22, ["rgba(140,100,60,0.35)", "rgba(255,240,210,0.4)"]);
    if (v === 2) { c.strokeStyle = "rgba(90,60,30,0.35)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(6, 4); c.lineTo(10, 12); c.lineTo(8, 18); c.lineTo(13, 26); c.stroke(); }
  },
  z2Win(c, r, v) {
    TILE_PAINT.z2Body(c, r, v);
    c.fillStyle = "#8f8d82"; rrp(c, 7, 3, 18, 26, 2); c.fill();
    c.beginPath(); c.moveTo(9, 28); c.lineTo(9, 11); c.arc(16, 11, 7, Math.PI, 0); c.lineTo(23, 28); c.closePath();
    c.fillStyle = lgr(c, 0, 4, 0, 28, [[0, "#4a3d33"], [1, "#221a14"]]); c.fill();
    c.fillStyle = "rgba(255,220,150,0.18)"; c.fillRect(10, 12, 2, 14);
    for (const sx of [1.5, 24.5]) {
      c.fillStyle = "#4d7a5c"; c.fillRect(sx, 4, 6, 24);
      c.fillStyle = "#3a5e46"; for (let k = 0; k < 7; k++) c.fillRect(sx, 6 + k * 3.3, 6, 1);
      c.strokeStyle = "rgba(25,30,20,0.6)"; c.lineWidth = 0.8; c.strokeRect(sx, 4, 6, 24);
    }
    c.fillStyle = "#a9a79b"; c.fillRect(6, 28, 20, 2.5);
    if (v % 2) { c.fillStyle = "#6e4523"; c.fillRect(8, 25, 16, 3); for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? "#d8382c" : "#4f7a35"; c.beginPath(); c.arc(9.5 + k * 3.2, 24, 1.8, 0, 7); c.fill(); } }
  },
  z2Top(c, r, v) {
    TILE_PAINT.z2Body(c, r, v);
    c.fillStyle = "#5e2414"; c.fillRect(0, -3, 32, 18);
    for (let row = 0; row < 3; row++) for (let i = -1; i < 5; i++) {
      const x = i * 8 + (row % 2 ? 4 : 0), y = -3 + row * 5;
      rrp(c, x, y, 7.6, 8.5, 3.6);
      c.fillStyle = lgr(c, x, 0, x + 7.6, 0, [[0, "#86361d"], [0.45, "#dc8a5a"], [1, "#74301a"]]); c.fill();
      c.strokeStyle = "rgba(40,15,5,0.35)"; c.lineWidth = 0.6; c.stroke();
    }
    if (v === 1) blobs(c, r, 2, 0, 28, 10, 3, "rgba(110,130,60,0.55)", 1.5, 3);
    c.fillStyle = lgr(c, 0, 14, 0, 19, [[0, "rgba(30,12,5,0.6)"], [1, "rgba(30,12,5,0)"]]); c.fillRect(0, 14, 32, 5);
    c.fillStyle = "#4a1c0f"; c.fillRect(0, 13.5, 32, 1.5);
  },
  z3Body(c, r, v) {
    c.fillStyle = "#2a2333"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 3; row++) for (let i = -1; i < 3; i++) {
      const x = i * 14 + (row % 2) * 7 + r() * 2, y = row * 11;
      c.fillStyle = ["#3d3449", "#453b52", "#362e41"][Math.floor(r() * 3)]; rrp(c, x + 0.5, y + 0.5, 13, 10, 2); c.fill();
      c.fillStyle = "rgba(150,140,190,0.18)"; c.fillRect(x + 1.5, y + 1, 11, 1.2);
    }
    speck(c, r, 0, 0, 32, 32, 10, ["rgba(170,140,220,0.4)"]);
  },
  z3Top(c, r, v) {
    TILE_PAINT.z3Body(c, r, v);
    c.beginPath(); c.moveTo(0, -1);
    for (let x = 0; x <= 32; x += 4) c.lineTo(x, 6 + Math.sin(x + v) * 1.5 + (x % 12 === 4 ? 6 : 0));
    c.lineTo(32, -1); c.closePath();
    c.fillStyle = lgr(c, 0, 0, 0, 10, [[0, "#7a5c9e"], [1, "#4b3766"]]); c.fill();
    for (let i = 0; i < 4; i++) { c.fillStyle = "rgba(220,190,255,0.7)"; c.beginPath(); c.arc(3 + r() * 26, 1 + r() * 4, 0.9, 0, 7); c.fill(); }
  },
  brick(c, r, v) {
    c.fillStyle = "#d6c19d"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 4; row++) for (let i = -1; i < 3; i++) {
      const x = i * 16 + (row % 2 ? 8 : 0), y = row * 8;
      c.fillStyle = ["#b5532f", "#a84a29", "#c0603a", "#9e4426", "#b9583a"][Math.floor(r() * 5)];
      c.fillRect(x + 0.6, y + 0.6, 14.8, 6.8);
      c.fillStyle = "rgba(255,200,160,0.3)"; c.fillRect(x + 0.6, y + 0.6, 14.8, 1);
      c.fillStyle = "rgba(60,20,8,0.35)"; c.fillRect(x + 0.6, y + 6.4, 14.8, 1);
      speck(c, r, x + 1, y + 1, 14, 6, 4, ["rgba(70,25,10,0.5)", "rgba(240,170,120,0.4)"]);
    }
    c.strokeStyle = "rgba(43,29,20,0.6)"; c.lineWidth = 1; c.strokeRect(0.5, 0.5, 31, 31);
  },
  plank(c, r, v) {
    c.fillStyle = lgr(c, 0, 0, 0, 10, [[0, "#b98549"], [1, "#6e4523"]]); rrp(c, 0, 0, 32, 10, 1.5); c.fill();
    c.strokeStyle = "rgba(70,40,15,0.45)"; c.lineWidth = 0.7;
    for (let k = 0; k < 3; k++) { c.beginPath(); const y = 2.5 + k * 2.4; c.moveTo(0, y); c.bezierCurveTo(10, y + r() - 0.5, 22, y - r() + 0.5, 32, y); c.stroke(); }
    c.fillStyle = "#3b2414"; c.fillRect(v % 2 ? 15.5 : 31, 0, 1, 10);
    for (const nx of [3.5, 28]) { c.fillStyle = "#2b2b2b"; c.beginPath(); c.arc(nx, 5, 1.2, 0, 7); c.fill(); c.fillStyle = "#aaa"; c.fillRect(nx - 0.6, 4.2, 0.6, 0.6); }
    c.fillStyle = "rgba(20,10,5,0.35)"; c.fillRect(0, 10, 32, 2);
    c.strokeStyle = INK; c.lineWidth = 1; rrp(c, 0.5, 0.5, 31, 9.5, 1.5); c.stroke();
  },
  qblock(c, r, v) {
    rrp(c, 0.5, 0.5, 31, 31, 4);
    c.fillStyle = lgr(c, 0, 0, 32, 32, [[0, "#ffe28a"], [0.5, "#d9a728"], [1, "#94650f"]]); c.fill(); inkStroke(c, 1.3);
    c.fillStyle = lgr(c, 0, 4, 0, 28, [[0, "#fbf0d2"], [1, "#e4cc92"]]); rrp(c, 4, 4, 24, 24, 2); c.fill();
    c.strokeStyle = "rgba(120,80,10,0.6)"; c.lineWidth = 1; c.stroke();
    c.fillStyle = "#24508f"; rrp(c, 8, 7, 16, 18, 2); c.fill();
    c.strokeStyle = "#e8c04a"; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = "rgba(255,255,255,0.12)"; for (let k = 0; k < 4; k++) c.fillRect(9 + k * 4, 8, 1, 16);
    c.fillStyle = "#f6d36a"; c.font = `bold 17px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", 16, 16.5);
    for (const [a, b] of [[2.5, 2.5], [29.5, 2.5], [2.5, 29.5], [29.5, 29.5]]) { c.fillStyle = "#7a520c"; c.beginPath(); c.arc(a, b, 1.4, 0, 7); c.fill(); }
  },
  used(c, r, v) {
    rrp(c, 0.5, 0.5, 31, 31, 4);
    c.fillStyle = lgr(c, 0, 0, 32, 32, [[0, "#a07d4c"], [1, "#5b432a"]]); c.fill(); inkStroke(c, 1.3);
    c.strokeStyle = "rgba(255,230,190,0.25)"; c.lineWidth = 1; rrp(c, 3.5, 3.5, 25, 25, 3); c.stroke();
    for (const [a, b] of [[16, 9], [10, 15], [22, 15], [12, 22], [20, 22]]) {
      c.fillStyle = rgr(c, a - 0.8, b - 0.8, 0, 3.2, [[0, "#c9a46a"], [1, "#6e5232"]]); c.beginPath(); c.arc(a, b, 2.8, 0, 7); c.fill();
    }
  },
  tower(c, r, v) {
    c.fillStyle = "#5c544a"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 2; row++) for (let i = -1; i < 2; i++) {
      const x = i * 20 + (row ? 10 : 0) + (v % 2) * 5, y = row * 16;
      rrp(c, x + 1, y + 1, 18, 14, 2.5);
      c.fillStyle = lgr(c, x, y, x + 18, y + 14, [[0, "#b2a796"], [1, "#7f7465"]]); c.fill();
      c.fillStyle = "rgba(255,250,235,0.3)"; c.fillRect(x + 2, y + 1.5, 15, 1.2);
      speck(c, r, x + 2, y + 2, 16, 11, 8, ["rgba(80,70,60,0.5)", "rgba(230,220,200,0.4)"]);
    }
  },
  crumble(c, r, v) {
    c.fillStyle = "#5e2414"; c.fillRect(0, -2, 32, 17);
    for (let row = 0; row < 3; row++) for (let i = -1; i < 5; i++) {
      const x = i * 8 + (row % 2 ? 4 : 0), y = -2 + row * 4.5, broken = (i + row + v) % 5 === 0;
      rrp(c, x, y, 7.6, 8, 3.4);
      c.fillStyle = broken ? "#4a1c0f" : lgr(c, x, 0, x + 7.6, 0, [[0, "#7a321b"], [0.45, "#c47548"], [1, "#6a2b16"]]); c.fill();
    }
    c.strokeStyle = "#1e0c06"; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(7, -1); c.lineTo(12, 6); c.lineTo(9, 13); c.moveTo(22, 0); c.lineTo(19, 8); c.lineTo(24, 13); c.stroke();
    c.fillStyle = "#4a2e17"; c.fillRect(0, 15, 32, 3);
    c.fillStyle = "#6e4523"; c.fillRect(3, 18, 4, 14); c.fillRect(25, 18, 4, 14);
    c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(3, 18, 4, 14); c.strokeRect(25, 18, 4, 14);
  }
};
Art.buildTiles = function () {
  this.tiles = {};
  for (const key in TILE_PAINT) {
    this.tiles[key] = [];
    for (let v = 0; v < 4; v++) {
      const [c, x] = this.mk(32, 48);
      x.translate(0, 16);
      TILE_PAINT[key](x, mulberry(key.length * 97 + v * 13), v);
      this.grainify(c, x, 32, 48, 0.6);
      this.tiles[key].push(c);
    }
  }
};
Art.tile = function (key, tx, ty, x, y) {
  const set = this.tiles[key];
  ctx.drawImage(set[(tx * 7 + ty * 13) % 4], x, y - 16, 32, 48);
};

// ---------------------------------------------------------------- backgrounds
const BG_W = 2400;
// Background layers are painted on demand (per level) and cached.
// Parallax factor for each layer.
const LAYER_FACTOR = { hills: 0.07, city: 0.2, street: 0.45, roofs: 0.45, plains: 0.07, wittenberg: 0.2, fachwerk: 0.45,
  workshopBack: 0.25, workshopFront: 0.5, rhineFar: 0.08, forest: 0.35, worms: 0.18 };
Art.buildBackgrounds = function () { this.layers = {}; };
Art.getLayer = function (name) {
  if (this.layers[name]) return this.layers[name];
  let L;
  if (name === "hills") {
    const far = this.paintHills(true), near = this.paintHills(false);
    const [h, hx] = this.mk(BG_W, VH); this.put(far, 0, 0, hx); this.put(near, 0, 0, hx); L = h;
  } else {
    const fn = { city: "paintCity", street: "paintStreet", roofs: "paintRoofs", plains: "paintPlains", wittenberg: "paintWittenberg",
      fachwerk: "paintFachwerk", workshopBack: "paintWorkshopBack", workshopFront: "paintWorkshopFront", rhineFar: "paintRhine",
      forest: "paintForest", worms: "paintWorms" }[name] || "paint" + name[0].toUpperCase() + name.slice(1);
    L = this[fn]();
  }
  this.grainify(L, L.getContext("2d"), L.lw, L.lh, 0.55);
  return (this.layers[name] = L);
};
// Keep only the layers a level needs (each layer is several megabytes).
Art.keepLayers = function (names) {
  for (const k in this.layers) if (!names.includes(k)) delete this.layers[k];
};
Art.paintHills = function (far) {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(far ? 11 : 12);
  const k = n => Math.PI * 2 * n / BG_W;
  const ridge = X => far
    ? 292 + Math.sin(X * k(3)) * 26 + Math.sin(X * k(7) + 1) * 12 + Math.sin(X * k(17)) * 5
    : 338 + Math.sin(X * k(4) + 2) * 22 + Math.sin(X * k(9)) * 12 + Math.sin(X * k(23) + 1) * 4;
  x.beginPath(); x.moveTo(0, VH);
  for (let X = 0; X <= BG_W; X += 8) x.lineTo(X, ridge(X));
  x.lineTo(BG_W, VH); x.closePath();
  x.fillStyle = far ? lgr(x, 0, 250, 0, 420, [[0, "#9eaabb"], [1, "#c3c4c0"]]) : lgr(x, 0, 310, 0, 470, [[0, "#8d9c70"], [1, "#b2b48e"]]);
  x.fill();
  if (!far) {
    // vineyard rows, olive groves, cypress lines and villas on the slopes
    x.save(); x.clip();
    x.strokeStyle = "rgba(90,110,60,0.25)"; x.lineWidth = 1;
    for (let X = 0; X < BG_W; X += 140 + r() * 120) {
      for (let i = 0; i < 6; i++) { const y0 = ridge(X) + 14 + i * 6; x.beginPath(); x.moveTo(X, y0); x.lineTo(X + 70, y0 + 6); x.stroke(); }
    }
    for (let i = 0; i < 160; i++) { const X = r() * BG_W, y0 = ridge(X) + 8 + r() * 60; x.fillStyle = `rgba(110,125,85,${0.5 + r() * 0.4})`; x.beginPath(); x.arc(X, y0, 2 + r() * 2, 0, 7); x.fill(); }
    x.restore();
    for (let X = 40; X < BG_W; X += 90 + r() * 160) {
      const n = 3 + Math.floor(r() * 5);
      for (let i = 0; i < n; i++) {
        const cx = X + i * 7, by = ridge(cx) + 4 + i * 1.5, h = 12 + r() * 9;
        x.fillStyle = "#4a5e3e"; x.beginPath(); x.ellipse(cx, by - h / 2, 2.6, h / 2, 0, 0, 7); x.fill();
      }
      if (r() > 0.5) {
        const vx = X + 50, vy = ridge(vx) + 10;
        x.fillStyle = "#efe2c8"; x.fillRect(vx, vy - 7, 12, 7); x.fillStyle = "#b5694a"; x.fillRect(vx - 1, vy - 9, 14, 2.5);
        x.fillStyle = "#efe2c8"; x.fillRect(vx + 8, vy - 13, 4, 6); x.fillStyle = "#b5694a"; x.fillRect(vx + 7.5, vy - 14, 5, 1.5);
      }
    }
  } else {
    for (let i = 0; i < 40; i++) { const X = r() * BG_W, y0 = ridge(X) + 4 + r() * 20; x.fillStyle = "rgba(120,130,150,0.5)"; x.fillRect(X, y0, 3, 2); }
  }
  return c;
};
function bgHouse(x, r, X, base, w, h, palette, roofCol, detail) {
  const col = palette[Math.floor(r() * palette.length)];
  x.fillStyle = col; x.fillRect(X, base - h, w, h + 120);
  x.fillStyle = "rgba(60,30,10,0.12)"; x.fillRect(X + w * 0.75, base - h, w * 0.25, h + 120);
  x.fillStyle = roofCol; x.beginPath(); x.moveTo(X - 3, base - h); x.lineTo(X + 4, base - h - 5); x.lineTo(X + w - 4, base - h - 5); x.lineTo(X + w + 3, base - h); x.fill();
  x.fillStyle = "rgba(40,20,10,0.35)"; x.fillRect(X - 3, base - h, w + 6, 1.5);
  if (detail) {
    const rows = Math.floor((h - 10) / 16), cols = Math.max(1, Math.floor((w - 6) / 11));
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = X + 5 + i * ((w - 10) / cols) + 1, wy = base - h + 8 + j * 16;
      x.fillStyle = "rgba(60,40,28,0.75)"; x.fillRect(wx, wy, 4, 7);
      if (r() > 0.5) { x.fillStyle = "rgba(80,110,85,0.7)"; x.fillRect(wx - 2, wy, 1.6, 7); x.fillRect(wx + 4.4, wy, 1.6, 7); }
    }
    if (r() > 0.7) { x.fillStyle = col; x.fillRect(X + w * 0.6, base - h - 14, 10, 10); x.fillStyle = roofCol; x.fillRect(X + w * 0.6 - 2, base - h - 16, 14, 3); x.fillStyle = "rgba(60,40,28,0.7)"; x.fillRect(X + w * 0.6 + 2, base - h - 11, 2, 5); x.fillRect(X + w * 0.6 + 6, base - h - 11, 2, 5); }
  }
}
Art.paintCity = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(31), base = 432;
  const back = ["#d9c3a0", "#d4b48c", "#e0caa7", "#cdb08c"], front = ["#d8ac76", "#c99560", "#e2bd8a", "#cfa070", "#bf8c5c", "#e5c99c"];
  // back row (hazier)
  for (let X = -40; X < BG_W + 40;) { const w = 30 + r() * 40; bgHouse(x, r, X, base - 30, w, 40 + r() * 50, back, "#c0866a", false); X += w - 3; }
  const wrap = f => { f(0); x.save(); x.translate(-BG_W, 0); f(0); x.restore(); };
  // Duomo: polychrome nave, octagonal drum, Brunelleschi's dome
  const D = 900;
  x.fillStyle = "#ece2cc"; x.fillRect(D - 150, 312, 300, 130);
  for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? "#6b8a70" : "#c99a8e"; x.fillRect(D - 146 + i * 25, 322, 3, 110); }
  x.fillStyle = "#6b8a70"; x.fillRect(D - 150, 312, 300, 4); x.fillRect(D - 150, 360, 300, 3);
  for (let i = 0; i < 6; i++) { x.fillStyle = "#4a3b30"; x.beginPath(); x.moveTo(D - 132 + i * 50, 400); x.lineTo(D - 132 + i * 50, 380); x.arc(D - 126 + i * 50, 380, 6, Math.PI, 0); x.lineTo(D - 120 + i * 50, 400); x.fill(); }
  x.fillStyle = "#b8573a"; x.beginPath(); x.moveTo(D - 154, 312); x.lineTo(D, 290); x.lineTo(D + 154, 312); x.fill();
  for (const s of [-1, 1]) { x.fillStyle = "#c2623e"; x.beginPath(); x.ellipse(D + s * 78, 300, 30, 22, 0, Math.PI, 0); x.fill(); x.fillStyle = "#ece2cc"; x.fillRect(D + s * 78 - 30, 298, 60, 16); }
  x.fillStyle = "#ece2cc"; x.fillRect(D - 56, 228, 112, 72);
  x.fillStyle = "#6b8a70"; x.fillRect(D - 56, 228, 112, 4); x.fillRect(D - 56, 266, 112, 3);
  for (const ox of [-30, 0, 30]) { x.fillStyle = "#4a3b30"; x.beginPath(); x.arc(D + ox, 248, 6, 0, 7); x.fill(); x.strokeStyle = "#a9a090"; x.lineWidth = 2; x.stroke(); }
  x.fillStyle = "rgba(60,30,10,0.18)"; x.fillRect(D + 20, 228, 36, 72);
  x.beginPath(); x.moveTo(D - 56, 230); x.bezierCurveTo(D - 54, 160, D - 24, 120, D, 116); x.bezierCurveTo(D + 24, 120, D + 54, 160, D + 56, 230); x.closePath();
  x.fillStyle = lgr(x, D - 56, 0, D + 56, 0, [[0, "#e08a5c"], [0.4, "#c8643c"], [1, "#8a3820"]]); x.fill();
  x.strokeStyle = "rgba(255,230,210,0.12)"; x.lineWidth = 1;
  for (let k = 1; k < 9; k++) { const yy = 230 - k * 12; x.beginPath(); x.moveTo(D - 56 + k * 4.5, yy); x.quadraticCurveTo(D, yy - 6, D + 56 - k * 4.5, yy); x.stroke(); }
  x.strokeStyle = "#f2ece0"; x.lineWidth = 3.2;
  for (const ox of [-36, -13, 13, 36]) { x.beginPath(); x.moveTo(D + ox, 230); x.quadraticCurveTo(D + ox * 0.75, 150, D + ox * 0.1, 120); x.stroke(); }
  x.fillStyle = "#f2ece0"; x.fillRect(D - 9, 96, 18, 22);
  x.fillStyle = "#4a3b30"; for (const ox of [-5, 0, 5]) x.fillRect(D + ox - 1, 100, 2, 12);
  x.fillStyle = "#e8e0d0"; x.beginPath(); x.moveTo(D - 10, 96); x.lineTo(D, 74); x.lineTo(D + 10, 96); x.fill();
  x.fillStyle = "#d9a728"; x.beginPath(); x.arc(D, 72, 3.5, 0, 7); x.fill(); x.fillRect(D - 0.8, 62, 1.6, 8); x.fillRect(D - 3, 64, 6, 1.4);
  // Giotto's campanile
  const Cx = 1090;
  x.fillStyle = "#ece2cc"; x.fillRect(Cx - 19, 156, 38, 290);
  x.fillStyle = "rgba(60,30,10,0.15)"; x.fillRect(Cx + 8, 156, 11, 290);
  for (let j = 0; j < 5; j++) { const y0 = 176 + j * 52; x.fillStyle = "#6b8a70"; x.fillRect(Cx - 19, y0, 38, 3); x.fillStyle = "#c99a8e"; x.fillRect(Cx - 15, y0 + 8, 30, 3); }
  [[196, 2, 18], [248, 2, 22], [300, 3, 30]].forEach(([wy, n, h]) => { for (let i = 0; i < n; i++) { const wx = Cx - (n * 9) / 2 + i * 9 + 1; x.fillStyle = "#3e3228"; x.beginPath(); x.moveTo(wx, wy + h); x.lineTo(wx, wy + 4); x.arc(wx + 3.5, wy + 4, 3.5, Math.PI, 0); x.lineTo(wx + 7, wy + h); x.fill(); } });
  x.fillStyle = "#d8cfba"; x.fillRect(Cx - 23, 150, 46, 7); x.fillStyle = "#6b8a70"; x.fillRect(Cx - 23, 156, 46, 2);
  // Palazzo Vecchio
  const P = 1720;
  x.fillStyle = "#a88a62"; x.fillRect(P - 90, 296, 180, 150);
  x.strokeStyle = "rgba(70,50,30,0.35)"; x.lineWidth = 1; for (let j = 0; j < 9; j++) { x.beginPath(); x.moveTo(P - 90, 306 + j * 14); x.lineTo(P + 90, 306 + j * 14); x.stroke(); }
  for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) { const wx = P - 76 + i * 28, wy = 318 + j * 44; x.fillStyle = "#3e3228"; x.beginPath(); x.moveTo(wx, wy + 20); x.lineTo(wx, wy + 6); x.arc(wx + 6, wy + 6, 6, Math.PI, 0); x.lineTo(wx + 12, wy + 20); x.fill(); x.fillStyle = "#a88a62"; x.fillRect(wx + 5.4, wy + 4, 1.2, 16); }
  x.fillStyle = "#97794f"; x.fillRect(P - 96, 280, 192, 18);
  x.fillStyle = "#6b5236"; for (let i = 0; i < 16; i++) x.fillRect(P - 92 + i * 12, 292, 4, 6);
  for (let i = 0; i < 16; i++) { x.fillStyle = "#a88a62"; x.fillRect(P - 95 + i * 12, 270, 7, 11); }
  x.fillStyle = "#a88a62"; x.fillRect(P - 14, 150, 28, 132);
  x.fillStyle = "rgba(60,30,10,0.18)"; x.fillRect(P + 6, 150, 8, 132);
  x.fillStyle = "#97794f"; x.fillRect(P - 20, 168, 40, 18);
  for (let i = 0; i < 5; i++) { const mx = P - 19 + i * 8; x.fillStyle = "#a88a62"; x.beginPath(); x.moveTo(mx, 168); x.lineTo(mx, 158); x.lineTo(mx + 2.5, 161); x.lineTo(mx + 5, 158); x.lineTo(mx + 5, 168); x.fill(); }
  x.fillStyle = "#f2ece0"; x.beginPath(); x.arc(P, 220, 8, 0, 7); x.fill(); x.fillStyle = "#24508f"; x.beginPath(); x.arc(P, 220, 6, 0, 7); x.fill();
  x.strokeStyle = "#d9a728"; x.lineWidth = 1.2; x.beginPath(); x.moveTo(P, 220); x.lineTo(P, 215.5); x.moveTo(P, 220); x.lineTo(P + 3.5, 221); x.stroke();
  x.fillStyle = "#a88a62"; x.fillRect(P - 7, 130, 14, 22); x.fillStyle = "#3e3228"; x.fillRect(P - 4, 134, 3, 10); x.fillRect(P + 1, 134, 3, 10);
  x.fillStyle = "#8a6d48"; x.beginPath(); x.moveTo(P - 9, 130); x.lineTo(P, 112); x.lineTo(P + 9, 130); x.fill();
  // Santa Croce and the Badia spire
  const S = 320;
  x.fillStyle = "#efe6d3"; x.fillRect(S - 50, 340, 100, 100);
  x.beginPath(); x.moveTo(S - 54, 340); x.lineTo(S, 306); x.lineTo(S + 54, 340); x.fill();
  x.fillStyle = "#6b8a70"; x.fillRect(S - 50, 340, 100, 3); x.fillRect(S - 18, 344, 3, 96); x.fillRect(S + 15, 344, 3, 96);
  x.fillStyle = "#4a3b30"; x.beginPath(); x.arc(S, 328, 6, 0, 7); x.fill(); x.fillRect(S - 8, 410, 16, 30);
  x.fillStyle = "#c9a888"; x.fillRect(1338, 260, 12, 120); x.beginPath(); x.moveTo(1335, 262); x.lineTo(1344, 206); x.lineTo(1353, 262); x.fill();
  x.fillStyle = "#b8956f"; x.fillRect(2010, 250, 20, 140); for (let i = 0; i < 4; i++) x.fillRect(2008 + i * 6, 244, 4, 7);
  // front row of houses and trees
  for (let X = -30; X < BG_W + 30;) {
    const w = 36 + r() * 50, h = 30 + r() * 60;
    const nearLandmark = [D - 160, D + 160, Cx - 30, Cx + 30, P - 100, P + 100].some((v, i, a) => i % 2 === 0 && X + w > v && X < a[i + 1]);
    if (!nearLandmark || r() > 0.4) bgHouse(x, r, X, base + 6, w, nearLandmark ? h * 0.5 : h, front, "#b5603d", true);
    X += w - 2;
  }
  for (let i = 0; i < 18; i++) {
    const X = r() * BG_W;
    if (r() > 0.5) { x.fillStyle = "#3f5a38"; x.beginPath(); x.ellipse(X, base - 20, 4, 26, 0, 0, 7); x.fill(); }
    else { x.fillStyle = "#5b4630"; x.fillRect(X - 1.5, base - 36, 3, 30); x.fillStyle = "#4b6a3f"; x.beginPath(); x.ellipse(X, base - 40, 22, 8, 0, 0, 7); x.fill(); }
  }
  x.fillStyle = "rgba(235,215,185,0.16)"; x.fillRect(0, 0, BG_W, VH);
  return c;
};
// A Florentine palazzo facade for the near street layer.
function palazzo(x, r, X, base, w, h) {
  const col = ["#d9b27c", "#c99a66", "#e2c193", "#cfa77a", "#b98e63", "#d6b48c"][Math.floor(r() * 6)];
  x.fillStyle = col; x.fillRect(X, base - h, w, h + 100);
  blobs(x, r, X, base - h, w, h, 6, "rgba(255,235,200,0.25)", 6, 20);
  blobs(x, r, X, base - h, w, h, 5, "rgba(120,80,40,0.18)", 6, 18);
  // rusticated ground floor
  x.fillStyle = "#b9a184"; x.fillRect(X, base - 62, w, 62);
  for (let j = 0; j < 4; j++) for (let i = 0; i < w / 22 + 1; i++) {
    const bx = X + i * 22 - (j % 2) * 11, by = base - 62 + j * 15.5;
    x.fillStyle = j % 2 ? "#ab9374" : "#b49c7d"; rrp(x, Math.max(X, bx) + 1, by + 1, Math.min(20, X + w - bx - 1), 13.5, 3); x.fill();
  }
  // arched portal
  const px = X + w / 2 - 16;
  x.fillStyle = "#8f7a5f"; x.beginPath(); x.moveTo(px - 4, base); x.lineTo(px - 4, base - 36); x.arc(px + 16, base - 36, 20, Math.PI, 0); x.lineTo(px + 36, base); x.fill();
  x.fillStyle = "#3a2a1d"; x.beginPath(); x.moveTo(px, base); x.lineTo(px, base - 36); x.arc(px + 16, base - 36, 16, Math.PI, 0); x.lineTo(px + 32, base); x.fill();
  x.fillStyle = "#5b3a1e"; x.fillRect(px + 2, base - 34, 28, 34); x.fillStyle = "#3a2412"; x.fillRect(px + 15.5, base - 34, 1, 34);
  // string courses and windows
  x.fillStyle = "rgba(90,60,35,0.5)"; x.fillRect(X, base - 64, w, 3); x.fillRect(X, base - 122, w, 3);
  const nwin = Math.max(2, Math.floor(w / 40));
  for (let i = 0; i < nwin; i++) {
    const wx = X + (i + 0.5) * (w / nwin) - 9;
    // piano nobile: arched bifora with stone frame
    x.fillStyle = "#a99c88"; x.beginPath(); x.moveTo(wx - 3, base - 70); x.lineTo(wx - 3, base - 98); x.arc(wx + 9, base - 98, 12, Math.PI, 0); x.lineTo(wx + 21, base - 70); x.fill();
    x.fillStyle = "#33261b"; x.beginPath(); x.moveTo(wx, base - 72); x.lineTo(wx, base - 98); x.arc(wx + 9, base - 98, 9, Math.PI, 0); x.lineTo(wx + 18, base - 72); x.fill();
    x.fillStyle = "#a99c88"; x.fillRect(wx + 8, base - 100, 2, 28);
    x.fillStyle = "rgba(255,220,150,0.15)"; x.fillRect(wx + 2, base - 96, 2, 20);
    // upper floor with green shutters
    if (h > 165) {
      x.fillStyle = "#33261b"; x.fillRect(wx + 2, base - 152, 14, 20);
      x.fillStyle = "#4d7a5c"; x.fillRect(wx - 4, base - 152, 6, 20); x.fillRect(wx + 16, base - 152, 6, 20);
      x.fillStyle = "#3a5e46"; for (let k = 0; k < 5; k++) { x.fillRect(wx - 4, base - 150 + k * 4, 6, 1); x.fillRect(wx + 16, base - 150 + k * 4, 6, 1); }
      x.fillStyle = "#a99c88"; x.fillRect(wx, base - 132, 18, 2.5);
    }
    if (r() > 0.55) { x.fillStyle = "#7a4a28"; x.fillRect(wx - 2, base - 72, 22, 4); for (let k = 0; k < 6; k++) { x.fillStyle = k % 2 ? "#d8382c" : "#e86a8a"; x.beginPath(); x.arc(wx + k * 4, base - 74, 2.4, 0, 7); x.fill(); } }
  }
  // deep Tuscan eave and roof
  x.fillStyle = "#5b3a1e"; x.fillRect(X - 6, base - h - 4, w + 12, 7);
  x.fillStyle = "#3b2414"; for (let i = 0; i < w / 8 + 1; i++) x.fillRect(X - 4 + i * 8, base - h + 3, 3, 4);
  x.fillStyle = "#a4462a"; x.beginPath(); x.moveTo(X - 8, base - h - 4); x.lineTo(X + 6, base - h - 14); x.lineTo(X + w - 6, base - h - 14); x.lineTo(X + w + 8, base - h - 4); x.fill();
  x.fillStyle = "rgba(0,0,0,0.12)"; x.fillRect(X + w - 10, base - h, 10, h);
}
Art.paintStreet = function () {
  const [c, x] = this.mk(1800, VH), r = mulberry(41), base = 482;
  for (let X = 0; X < 1800;) {
    if (r() < 0.35) {
      // a walled garden with cypresses and a stone pine
      const w = 90 + r() * 70;
      x.fillStyle = "#c9b08a"; x.fillRect(X, base - 46, w, 46);
      x.fillStyle = "#a99070"; x.fillRect(X, base - 50, w, 5);
      for (let i = 0; i < 3; i++) { const cx = X + 16 + i * (w - 30) / 2, h = 70 + r() * 50; x.fillStyle = lgr(x, cx - 9, 0, cx + 9, 0, [[0, "#4f7d45"], [1, "#24452a"]]); x.beginPath(); x.ellipse(cx, base - 46 - h / 2, 9, h / 2, 0, 0, 7); x.fill(); }
      if (r() > 0.4) { const px = X + w / 2; x.fillStyle = "#5b4630"; x.fillRect(px - 2, base - 110, 4, 64); x.fillStyle = lgr(x, 0, base - 135, 0, base - 105, [[0, "#5f8a4a"], [1, "#2f5a32"]]); x.beginPath(); x.ellipse(px, base - 118, 40, 14, 0, 0, 7); x.fill(); }
      X += w;
    } else {
      const w = 120 + r() * 80, h = 120 + r() * 80;
      palazzo(x, r, X, base, Math.min(w, 1800 - X), h);
      X += w;
    }
    if (X < 1800 - 60 && r() < 0.5) { x.fillStyle = "#4a3828"; x.fillRect(X, base - 140, 14, 140); X += 14; }
  }
  x.fillStyle = "rgba(70,45,25,0.12)"; x.fillRect(0, 0, 1800, VH);
  return c;
};
Art.paintRoofs = function () {
  const [c, x] = this.mk(1800, VH), r = mulberry(51);
  for (let band = 0; band < 3; band++) {
    const top = 360 + band * 46;
    for (let X = -20; X < 1820;) {
      const w = 50 + r() * 90, h = 14 + r() * 18, y0 = top + r() * 14;
      x.fillStyle = ["#c9643a", "#b5532f", "#d27448", "#a84a29"][Math.floor(r() * 4)];
      x.beginPath(); x.moveTo(X, y0 + h); x.lineTo(X + w * 0.3, y0); x.lineTo(X + w * 0.7, y0); x.lineTo(X + w, y0 + h); x.closePath(); x.fill();
      x.strokeStyle = "rgba(90,30,10,0.35)"; x.lineWidth = 1; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(X + w * i / 6, y0 + 2); x.lineTo(X + w * i / 6 + (i - 3) * 3, y0 + h); x.stroke(); }
      x.fillStyle = "rgba(255,210,170,0.22)"; x.beginPath(); x.moveTo(X + w * 0.3, y0); x.lineTo(X + w * 0.7, y0); x.lineTo(X + w * 0.6, y0 + 3); x.lineTo(X + w * 0.35, y0 + 3); x.fill();
      x.fillStyle = ["#dcb47e", "#cfa070", "#e2c193"][Math.floor(r() * 3)]; x.fillRect(X, y0 + h, w, 60);
      for (let i = 0; i < w / 14; i++) if (r() > 0.4) { x.fillStyle = "rgba(60,40,28,0.7)"; x.fillRect(X + 4 + i * 14, y0 + h + 8, 4, 7); }
      if (r() > 0.6) { x.fillStyle = "#a4462a"; x.fillRect(X + w * 0.5, y0 - 12, 7, 14); x.fillStyle = "#7a3018"; x.fillRect(X + w * 0.5 - 2, y0 - 14, 11, 3); }
      if (r() > 0.85) { x.fillStyle = "#d6b48c"; x.fillRect(X + w * 0.2, y0 - 16, 18, 16); x.fillStyle = "#3e3228"; x.fillRect(X + w * 0.2 + 3, y0 - 12, 4, 8); x.fillRect(X + w * 0.2 + 11, y0 - 12, 4, 8); x.fillStyle = "#a4462a"; x.fillRect(X + w * 0.2 - 2, y0 - 19, 22, 4); }
      X += w * (0.7 + r() * 0.3);
    }
    x.fillStyle = `rgba(240,200,160,${0.22 - band * 0.07})`; x.fillRect(0, top - 20, 1800, 80);
  }
  return c;
};
Art.layer = function (img, cam, factor, y = 0, alpha = 1) {
  if (typeof img === "string") { factor = LAYER_FACTOR[img]; img = this.getLayer(img); }
  const w = img.lw, off = ((cam * factor) % w + w) % w;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, -off, y, w, img.lh);
  if (w - off < VW) ctx.drawImage(img, w - off, y, w, img.lh);
  ctx.globalAlpha = 1;
};

// ---------------------------------------------------------------- sky, clouds, grain
const ZONE_TINT = [["#ffffff", "#dfe6ee"], ["#fff8e8", "#e8d4b4"], ["#ffe2c8", "#d99a86"], ["#8a7aa6", "#4b3e66"],
  ["#eef0f2", "#9aa3ad"], ["#d9c9b0", "#8a7058"], ["#ffd9b8", "#b07a86"], ["#5d5a80", "#2e2c46"]];
Art.buildClouds = function () {
  this.clouds = ZONE_TINT.map(([hi, lo], z) => [0, 1, 2, 3].map(i => {
    const r = mulberry(70 + i), [c, x] = this.mk(240, 100);
    const puffs = Array.from({ length: 7 + i }, (_, k) => [40 + r() * 160, 40 + r() * 26 - (k % 3) * 6, 16 + r() * 20]);
    puffs.sort((a, b) => a[1] - b[1]);
    for (const [px, py, pr] of puffs) {
      x.fillStyle = rgr(x, px - pr * 0.3, py - pr * 0.5, pr * 0.1, pr * 1.1, [[0, hi], [0.65, hi], [1, lo]]);
      x.beginPath(); x.arc(px, py, pr, 0, 7); x.fill();
    }
    x.fillStyle = lo; x.globalAlpha = 0.5; x.fillRect(30, 68, 180, 3); x.globalAlpha = 1;
    return c;
  }));
  const r = mulberry(5);
  this.cloudPos = Array.from({ length: 8 }, (_, i) => ({ x: i * 310 + r() * 140, y: 24 + r() * 150, s: 0.55 + r() * 0.6, v: 0.06 + r() * 0.1, k: i % 4 }));
};
Art.sky = function (cam, zones, z, nz, f, t) {
  const Z = zones[z], sky = ctx.createLinearGradient(0, 0, 0, VH);
  sky.addColorStop(0, lerpHex(Z.sky[0], zones[nz].sky[0], f));
  sky.addColorStop(0.75, lerpHex(Z.sky[1], zones[nz].sky[1], f));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, VH);
  const moon = Z.sun === "moon", sx = 760 - cam * 0.02, sy = moon ? 100 : 110 + z * 34;
  if (Z.sun) {
    const glow = rgr(ctx, sx, sy, 10, 200, moon ? [[0, "rgba(220,220,255,0.45)"], [1, "rgba(220,220,255,0)"]] : [[0, "rgba(255,245,200,0.75)"], [1, "rgba(255,240,200,0)"]]);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 200, 0, 7); ctx.fill();
    ctx.fillStyle = moon ? "rgba(240,238,255,0.92)" : "#fff6d6"; ctx.beginPath(); ctx.arc(sx, sy, moon ? 26 : 34, 0, 7); ctx.fill();
    if (moon) { ctx.fillStyle = "rgba(180,180,210,0.35)"; [[-8, -6, 5], [6, 4, 7], [-4, 10, 3]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(sx + a, sy + b, r, 0, 7); ctx.fill(); }); }
  }
  if (moon) for (let i = 0; i < 40; i++) { const x = (i * 137.5) % VW, y = (i * 61.7) % 260; ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * Math.sin(t / 30 + i)})`; ctx.fillRect(x, y, 1.6, 1.6); }
  if (Z.rays) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const a = 1.9 + i * 0.22 + Math.sin(t / 300 + i) * 0.03;
      ctx.fillStyle = `rgba(255,230,180,${0.035 + (i % 2) * 0.015})`;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 900, sy + Math.sin(a) * 900); ctx.lineTo(sx + Math.cos(a + 0.07) * 900, sy + Math.sin(a + 0.07) * 900); ctx.fill();
    }
    ctx.restore();
  }
  // clouds
  const span = 3100;
  for (const cl of this.cloudPos) {
    if (!G.modal) cl.x += cl.v;
    const x = ((cl.x - cam * 0.1) % span + span) % span - 200, img = this.clouds[Z.tint][cl.k];
    ctx.globalAlpha = Z.sun === "moon" || Z.tint === 3 ? 0.7 : 0.92;
    ctx.drawImage(img, x, cl.y, img.lw * cl.s, img.lh * cl.s);
  }
  ctx.globalAlpha = 1;
  // distant birds
  const fx = ((t * 0.6 - cam * 0.15) % 2600 + 2600) % 2600 - 200;
  ctx.strokeStyle = Z.sun === "moon" || Z.tint === 3 ? "rgba(40,20,50,0.6)" : "rgba(60,40,30,0.5)"; ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    const bx = fx + i * 18 - (i % 2) * 8, by = 70 + i * 6 + Math.sin(t / 10 + i) * 3, w = Math.sin(t / 5 + i) * 3;
    ctx.beginPath(); ctx.moveTo(bx - 5, by - w); ctx.quadraticCurveTo(bx - 2, by - w * 0.3, bx, by); ctx.quadraticCurveTo(bx + 2, by - w * 0.3, bx + 5, by - w); ctx.stroke();
  }
};
Art.buildGrain = function () {
  const n = 192, c = document.createElement("canvas"); c.width = n; c.height = n;
  const x = c.getContext("2d"), img = x.createImageData(n, n), r = mulberry(8);
  for (let i = 0; i < n * n; i++) { const v = r() * 255; img.data[i * 4] = v; img.data[i * 4 + 1] = v * 0.92; img.data[i * 4 + 2] = v * 0.8; img.data[i * 4 + 3] = 34; }
  x.putImageData(img, 0, 0);
  this.grainCanvas = c;
};
// Spinning florin: 16 cached frames.
Art.buildCoins = function () {
  this.coinFrames = [];
  for (let i = 0; i < 16; i++) {
    const [c, x] = this.mk(30, 30), sx = Math.cos(i / 16 * Math.PI * 2);
    x.translate(15, 15); x.scale(Math.max(0.12, Math.abs(sx)), 1);
    x.beginPath(); x.arc(0, 0, 13, 0, 7); x.fillStyle = "#8a6410"; x.fill();
    x.beginPath(); x.arc(0, 0, 11.5, 0, 7); x.fillStyle = rgr(x, -4, -5, 1, 14, [[0, "#fff1b0"], [0.5, "#f2c63c"], [1, "#b8861a"]]); x.fill();
    x.strokeStyle = "rgba(138,100,16,0.7)"; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, 9, 0, 7); x.stroke();
    if (Math.abs(sx) > 0.35) lily(x, 0, 1, 1.05, sx > 0 ? "#a87c14" : "#9a7012");
    x.strokeStyle = "rgba(255,255,240,0.8)"; x.lineWidth = 1.4; x.beginPath(); x.arc(0, 0, 9.5, 3.6, 4.6); x.stroke();
    this.coinFrames.push(c);
  }
};
Art.buildVignette = function () {
  const [c, x] = this.mk(VW, VH);
  const g = x.createRadialGradient(VW / 2, VH / 2, VH * 0.42, VW / 2, VH / 2, VW * 0.66);
  g.addColorStop(0, "rgba(30,15,5,0)"); g.addColorStop(1, "rgba(30,15,5,0.42)");
  x.fillStyle = g; x.fillRect(0, 0, VW, VH);
  this.vignette = c;
};
Art.post = function () { this.put(this.vignette, 0, 0); };

// ---------------------------------------------------------------- characters
// The apprentice: particolored hose, slashed sleeves, doublet, beret.
Art.player = function (p, t) {
  const c = ctx, f = p.face, air = !p.onGround && !p.fly, moving = p.onGround && Math.abs(p.vx) > 0.3;
  const ph = p.anim, swing = moving ? Math.sin(ph) * 0.65 : air ? 0 : Math.sin(t / 40) * 0.04;
  const sq = p.squash || 0;
  c.save();
  c.translate(Math.round(p.x + 15), Math.round(p.y + 42));
  c.scale(f * (1 - sq * 0.5), 1 + sq);
  const bob = moving ? -Math.abs(Math.cos(ph)) * 1.4 : Math.sin(t / 24) * 0.5;
  // cape
  const flap = Math.min(10, Math.abs(p.vx) * 1.8) + (air ? 5 : 0) + Math.sin(t / 7) * 1.2;
  c.beginPath(); c.moveTo(-3, -28 + bob);
  c.quadraticCurveTo(-12 - flap * 0.6, -18 + bob, -14 - flap, -6 + (air ? -4 : 0));
  c.quadraticCurveTo(-8 - flap * 0.5, -5, -2, -10 + bob); c.closePath();
  c.fillStyle = lgr(c, 0, -28, -14 - flap, -6, [[0, SAVE.cape], [1, shade(SAVE.cape, -0.35)]]); c.fill(); inkStroke(c, 1.2);
  const limb = (x0, y0, a1, a2, l1, l2, col, w) => {
    const kx = x0 + Math.sin(a1) * l1, ky = y0 + Math.cos(a1) * l1, ex = kx + Math.sin(a2) * l2, ey = ky + Math.cos(a2) * l2;
    c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = INK; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(kx, ky); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(kx, ky); c.lineTo(ex, ey); c.stroke();
    return [ex, ey, a2];
  };
  const boot = ([ex, ey, a]) => { c.save(); c.translate(ex, ey); c.rotate(-a * 0.4); c.fillStyle = "#3b2414"; rrp(c, -2.6, -1.8, 7.4, 4.2, 1.8); c.fill(); inkStroke(c, 1); c.fillStyle = "rgba(255,220,180,0.3)"; c.fillRect(-1.5, -1.2, 4, 1); c.restore(); };
  const legA = air ? [0.9, -0.2] : [swing, -swing], knee = a => moving ? Math.max(0, -Math.sin(ph + (a > 0 ? 0 : Math.PI))) * 0.9 : air ? 1.1 : 0;
  // back limbs (darker)
  const armBack = air ? -2.6 : p.fly ? -2.9 : -swing * 0.9;
  limb(-2, -25 + bob, armBack, armBack - 0.3, 6, 6, "#1f4266", 4.2);
  boot(limb(-2.2, -13 + bob, legA[1], legA[1] - knee(-1), 7, 7, "#8a6a28", 4.4));
  // front leg, drawn before the doublet so the jacket's skirt covers the hip
  boot(limb(2.2, -13 + bob, legA[0], legA[0] - knee(1), 7, 7, "#b23a2e", 4.4));
  // torso: doublet with skirt, belt, buttons, collar
  c.beginPath(); c.moveTo(-6.5, -27 + bob); c.quadraticCurveTo(0, -29 + bob, 6.5, -27 + bob); c.lineTo(7, -15 + bob); c.lineTo(8.5, -10 + bob);
  c.quadraticCurveTo(0, -8 + bob, -8.5, -10 + bob); c.lineTo(-7, -15 + bob); c.closePath();
  c.fillStyle = lgr(c, -7, -27, 7, -10, [[0, "#3f78b0"], [0.6, "#2b5a8a"], [1, "#1d3f63"]]); c.fill(); inkStroke(c, 1.3);
  c.strokeStyle = "rgba(15,30,50,0.45)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-3, -24 + bob); c.lineTo(-4, -13 + bob); c.moveTo(4, -24 + bob); c.lineTo(5, -13 + bob); c.stroke();
  c.fillStyle = "#e7c35a"; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(1, -25 + i * 3 + bob, 0.9, 0, 7); c.fill(); }
  c.fillStyle = "#5b3a1e"; c.fillRect(-7.5, -15.5 + bob, 15, 2.6); c.fillStyle = "#e7c35a"; c.fillRect(0, -15.8 + bob, 3, 3.2);
  c.fillStyle = "#6e4523"; rrp(c, 3.5, -14 + bob, 4, 4.5, 1.2); c.fill(); inkStroke(c, 0.8);
  c.fillStyle = "#f4efe2"; c.beginPath(); c.ellipse(0.5, -27.5 + bob, 5.5, 1.8, 0, 0, 7); c.fill(); inkStroke(c, 0.8);
  // front arm
  const armFront = air ? -2.5 : p.fly ? -2.8 : swing * 0.9;
  const [hx, hy] = limb(3, -25 + bob, armFront, armFront + (moving ? 0.5 : 0.3), 6, 6, "#2f6aa3", 4.4);
  c.fillStyle = "#e7c35a"; c.save(); c.translate(3 + Math.sin(armFront) * 3, -25 + bob + Math.cos(armFront) * 3); c.rotate(-armFront); c.fillRect(-0.6, -2, 1.2, 4); c.restore();
  c.fillStyle = "#efc39b"; c.beginPath(); c.arc(hx, hy, 2, 0, 7); c.fill(); inkStroke(c, 0.8);
  // head
  const hy0 = -34 + bob;
  c.fillStyle = "#5a3418"; c.beginPath(); c.ellipse(-2.5, hy0 + 1.5, 6.5, 7, 0, 0, 7); c.fill();
  c.beginPath(); c.arc(1, hy0, 7, 0, 7);
  c.fillStyle = rgr(c, 3, hy0 - 2, 1, 9, [[0, "#f8d6b2"], [1, "#e0a87e"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#5a3418"; c.beginPath(); c.moveTo(-6, hy0 - 3); c.quadraticCurveTo(-2, hy0 - 8, 6, hy0 - 5); c.lineTo(5, hy0 - 3); c.quadraticCurveTo(0, hy0 - 4.5, -3, hy0 + 4); c.lineTo(-6, hy0 + 5); c.closePath(); c.fill();
  c.fillStyle = "#e0a87e"; c.beginPath(); c.ellipse(-1.5, hy0 + 0.5, 1.4, 2, 0, 0, 7); c.fill();
  const blink = t % 220 < 7;
  if (blink) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(3.2, hy0 - 0.5); c.lineTo(6.2, hy0 - 0.5); c.stroke(); }
  else {
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(4.6, hy0 - 0.6, 1.7, 2.1, 0, 0, 7); c.fill();
    c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(5.2, hy0 - 0.4, 1.1, 0, 7); c.fill();
    c.fillStyle = "#fff"; c.fillRect(5.3, hy0 - 1.2, 0.6, 0.6);
  }
  c.strokeStyle = "#4a2a14"; c.lineWidth = 0.9; c.beginPath(); c.moveTo(3, hy0 - 3.6); c.lineTo(6.4, hy0 - 3.2); c.stroke();
  c.strokeStyle = "rgba(43,29,20,0.7)"; c.beginPath(); c.moveTo(7.6, hy0 - 0.5); c.lineTo(8.6, hy0 + 2.2); c.lineTo(7.4, hy0 + 2.5); c.stroke();
  c.beginPath(); c.moveTo(5, hy0 + 4.3); c.quadraticCurveTo(6.2, hy0 + 5, 7.2, hy0 + 4); c.stroke();
  c.fillStyle = "rgba(230,120,110,0.35)"; c.beginPath(); c.arc(4, hy0 + 2.8, 1.8, 0, 7); c.fill();
  // beret with feather
  c.save(); c.translate(0, hy0 - 5.5); c.rotate(-0.12);
  c.strokeStyle = "#f4efe2"; c.lineWidth = 2; c.lineCap = "round";
  const fw = Math.sin(t / 9) * 1.5;
  c.beginPath(); c.moveTo(-5, -1); c.quadraticCurveTo(-12, -9 + fw, -18, -5 + fw); c.stroke();
  c.strokeStyle = "rgba(200,190,170,0.9)"; c.lineWidth = 0.6;
  for (let k = 0; k < 5; k++) { const fx = -7 - k * 2.2, fy = -3.5 - k * 0.8 + fw * (k / 5); c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx - 1.5, fy + 2.5); c.stroke(); }
  c.beginPath(); c.ellipse(0, 0, 9.5, 4.2, 0, 0, 7);
  c.fillStyle = lgr(c, 0, -4, 0, 4, [[0, "#d24a3a"], [1, "#8e2a20"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#7a2219"; c.beginPath(); c.ellipse(1, 2.4, 8, 1.4, 0, 0, 7); c.fill();
  c.fillStyle = "#e7c35a"; c.beginPath(); c.arc(-4.5, 0.5, 1.4, 0, 7); c.fill();
  c.restore();
  c.restore();
};
function shade(hex, amt) {
  const v = parseInt(hex.slice(1), 16), ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  return "rgb(" + ch.map(x => Math.round(clamp(amt < 0 ? x * (1 + amt) : x + (255 - x) * amt, 0, 255))).join(",") + ")";
}
Art.shadow = function (x, y, w) { ctx.fillStyle = "rgba(20,10,5,0.25)"; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.22, 0, 0, 7); ctx.fill(); };

// Gloomling: a creature of living fog.
Art.gloom = function (e, t, px) {
  const c = ctx, cx = e.x + e.w / 2, by = e.y + e.h;
  if (!e.alive) {
    if (e.dead > 30) return;
    c.globalAlpha = 1 - e.dead / 30;
    c.fillStyle = "#3a2a4e"; c.beginPath(); c.ellipse(cx, by - 3, 20 + e.dead * 0.5, 4, 0, 0, 7); c.fill();
    c.globalAlpha = 1; return;
  }
  for (let i = 0; i < 4; i++) {
    const a = t / 14 + i * 1.7, k = ((t / 40 + i * 0.25) % 1);
    c.fillStyle = `rgba(120,90,165,${0.35 * (1 - k)})`;
    c.beginPath(); c.arc(cx + Math.cos(a) * 8, e.y - 4 - k * 18, 3 + k * 3, 0, 7); c.fill();
  }
  Art.shadow(cx, by, 16);
  c.beginPath();
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI, rx = 19, ry = 22;
    c.lineTo(cx + Math.cos(a) * rx, by - 6 + Math.sin(a) * ry + Math.sin(t / 7 + i) * (i % 2 ? 0.8 : 0));
  }
  for (let i = 0; i <= 6; i++) { const xx = cx + 19 - i * (38 / 6); c.lineTo(xx, by - 1 - (i % 2 ? 5 : 0) + Math.sin(t / 5 + i) * 1.5); }
  c.closePath();
  c.fillStyle = rgr(c, cx - 4, by - 22, 2, 30, [[0, "#7a5aa3"], [0.6, "#3f2b57"], [1, "#22152e"]]); c.fill(); inkStroke(c, 1.4);
  c.fillStyle = "rgba(200,170,240,0.25)"; c.beginPath(); c.ellipse(cx - 7, by - 21, 5, 3, -0.5, 0, 7); c.fill();
  const look = clamp((px - cx) / 80, -1, 1) * 2;
  for (const s of [-1, 1]) {
    const ex = cx + s * 7 + look, ey = by - 15;
    c.fillStyle = rgr(c, ex, ey, 0, 7, [[0, "rgba(255,215,94,0.6)"], [1, "rgba(255,215,94,0)"]]); c.beginPath(); c.arc(ex, ey, 7, 0, 7); c.fill();
    c.fillStyle = "#ffd75e"; c.beginPath(); c.ellipse(ex, ey, 3.6, 4.2, 0, 0, 7); c.fill();
    c.fillStyle = "#1a1024"; c.beginPath(); c.ellipse(ex + look * 0.4, ey, 1, 3, 0, 0, 7); c.fill();
    c.strokeStyle = "#1a1024"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ex - s * 4, ey - 6); c.lineTo(ex + s * 3, ey - 4); c.stroke();
  }
  c.fillStyle = "#1a1024"; c.beginPath(); c.moveTo(cx - 6 + look, by - 8); c.quadraticCurveTo(cx + look, by - 4, cx + 6 + look, by - 8); c.quadraticCurveTo(cx + look, by - 6, cx - 6 + look, by - 8); c.fill();
  c.fillStyle = "#f2e9ff"; c.beginPath(); c.moveTo(cx - 3 + look, by - 7.4); c.lineTo(cx - 2 + look, by - 5.6); c.lineTo(cx - 1 + look, by - 7); c.moveTo(cx + 1 + look, by - 7); c.lineTo(cx + 2 + look, by - 5.6); c.lineTo(cx + 3 + look, by - 7.4); c.fill();
};
// Pigeon: iridescent neck, barred wings.
Art.pigeon = function (e, t) {
  const c = ctx;
  if (!e.alive) { if (e.dead > 30) return; c.globalAlpha = 1 - e.dead / 30; for (let i = 0; i < 6; i++) { c.fillStyle = "#c9c2b8"; c.fillRect(e.x + 6 + i * 4, e.y + 10 + Math.sin(i + e.dead / 5) * 6 + e.dead, 3, 1.5); } c.globalAlpha = 1; return; }
  const dir = e.vx > 0 ? 1 : -1, diving = e.dive > 0, wing = diving ? -0.9 : Math.sin(t / 3.5) * 0.9;
  c.save(); c.translate(e.x + 18, e.y + 12); c.scale(dir, 1); if (diving) c.rotate(0.35);
  c.fillStyle = "#6f6c78"; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-19, -2); c.lineTo(-19, 5); c.closePath(); c.fill(); inkStroke(c, 1);
  c.beginPath(); c.ellipse(0, 1, 12, 7.5, 0, 0, 7);
  c.fillStyle = lgr(c, 0, -6, 0, 8, [[0, "#a7a4b0"], [1, "#77737f"]]); c.fill(); inkStroke(c, 1.2);
  c.beginPath(); c.ellipse(8, -3, 5.5, 5, 0.3, 0, 7);
  c.fillStyle = lgr(c, 4, -8, 12, 2, [[0, "#5fa28a"], [0.5, "#8a6aa8"], [1, "#6f8c9a"]]); c.fill();
  c.fillStyle = "#8d8a94"; c.beginPath(); c.arc(12, -6, 4.2, 0, 7); c.fill(); inkStroke(c, 1);
  c.fillStyle = "#e08a2a"; c.beginPath(); c.arc(13.4, -6.8, 1.6, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(13.6, -6.8, 0.8, 0, 7); c.fill();
  c.fillStyle = "#d9b8a0"; c.beginPath(); c.moveTo(15.8, -6.4); c.lineTo(19.5, -5.2); c.lineTo(15.8, -4.4); c.fill();
  c.save(); c.translate(-1, -2); c.rotate(-wing);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -14, -16, -10); c.lineTo(-14, -6); c.lineTo(-11, -7); c.lineTo(-10, -2); c.quadraticCurveTo(-4, 1, 0, 0);
  c.fillStyle = lgr(c, 0, 0, -16, -10, [[0, "#9b98a5"], [1, "#6a6773"]]); c.fill(); inkStroke(c, 1);
  c.strokeStyle = "#3b3a44"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-5, -5); c.lineTo(-9, -3); c.moveTo(-8, -8); c.lineTo(-12, -5); c.stroke();
  c.restore();
  c.restore();
};
// Gold florin with the Florentine lily.
Art.coin = function (x, y, t) {
  const c = ctx, frame = ((Math.floor((t / 14 + x * 0.05) / (Math.PI * 2) * 16) % 16) + 16) % 16;
  c.drawImage(this.coinFrames[frame], x - 15, y - 15, 30, 30);
  if ((t + x) % 90 < 8) { c.fillStyle = "rgba(255,255,230,0.9)"; const k = (t + x) % 90; c.fillRect(x + 6 - 0.5, y - 9 - k * 0.3, 1, 6); c.fillRect(x + 3.5, y - 6.5 - k * 0.3, 6, 1); }
};
// A Codex page: parchment, red ribbon, illuminated initial, halo of light.
Art.codexPage = function (x, y, t) {
  const c = ctx, yy = y - 8 + Math.sin(t / 15 + x) * 4;
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 6; i++) {
    const a = t / 80 + i * Math.PI / 3;
    c.fillStyle = "rgba(255,230,150,0.06)"; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + Math.cos(a) * 60, yy + Math.sin(a) * 60); c.lineTo(x + Math.cos(a + 0.25) * 60, yy + Math.sin(a + 0.25) * 60); c.fill();
  }
  c.restore();
  c.fillStyle = rgr(c, x, yy, 2, 46, [[0, "rgba(255,240,170,0.7)"], [1, "rgba(255,240,170,0)"]]); c.beginPath(); c.arc(x, yy, 46, 0, 7); c.fill();
  c.save(); c.translate(x, yy); c.rotate(Math.sin(t / 20) * 0.08);
  c.beginPath(); c.moveTo(-14, -19); c.lineTo(10, -19); c.lineTo(15, -14); c.lineTo(15, 20); c.quadraticCurveTo(0, 17, -14, 20); c.closePath();
  c.fillStyle = lgr(c, -14, -19, 15, 20, [[0, "#fbf3dc"], [1, "#e2cc9a"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#d8c08a"; c.beginPath(); c.moveTo(10, -19); c.lineTo(10, -14); c.lineTo(15, -14); c.fill(); inkStroke(c, 0.8);
  c.fillStyle = "#24508f"; c.fillRect(-10, -14, 8, 8); c.strokeStyle = "#d9a728"; c.lineWidth = 1; c.strokeRect(-10, -14, 8, 8);
  c.fillStyle = "#f6d36a"; c.font = `bold 8px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("R", -6, -9.6);
  c.fillStyle = "rgba(60,40,25,0.55)";
  for (let i = 0; i < 7; i++) c.fillRect(i < 2 ? 0 : -10, -13 + i * 4.4, i < 2 ? 10 : (i === 6 ? 12 : 21), 1.3);
  c.fillStyle = "#b23a2e"; c.beginPath(); c.moveTo(6, -19); c.lineTo(6, 26); c.lineTo(8.5, 22.5); c.lineTo(11, 26); c.lineTo(11, -19); c.fill();
  c.restore();
};
Art.sign = function (x, y, id) {
  const c = ctx, b = y + 32;
  c.fillStyle = "#4a2e17"; c.fillRect(x + 14, b - 34, 5, 34); c.beginPath(); c.rect(x + 14, b - 34, 5, 34); inkStroke(c, 1);
  c.save(); c.translate(x + 16, b - 34);
  rrp(c, -15, -16, 30, 20, 3); c.fillStyle = lgr(c, 0, -16, 0, 4, [[0, "#b58550"], [1, "#7d5128"]]); c.fill(); inkStroke(c, 1.3);
  c.strokeStyle = "rgba(255,220,170,0.3)"; c.lineWidth = 1; rrp(c, -12.5, -13.5, 25, 15, 2); c.stroke();
  c.fillStyle = id === 6 ? "#ffcf5e" : "#f2deb0"; c.font = `bold 13px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(id === 6 ? "!" : "i", 0, -5.5);
  c.restore();
};
// Checkpoint: the banner of Florence, a red lily on white.
Art.checkpoint = function (k, t, style) {
  const c = ctx, x = k.x + 12, b = k.y + 32;
  c.fillStyle = "#3b2a1a"; c.fillRect(x, b - 88, 5, 88); c.beginPath(); c.rect(x, b - 88, 5, 88); inkStroke(c, 1);
  c.fillStyle = "#d9a728"; c.beginPath(); c.arc(x + 2.5, b - 91, 4.5, 0, 7); c.fill(); inkStroke(c, 1);
  c.fillStyle = "#6e4523"; c.fillRect(x - 4, b - 4, 13, 4);
  if (k.on) {
    const w = i => Math.sin(t / 8 + i * 0.6) * 3;
    c.beginPath(); c.moveTo(x + 5, b - 84);
    for (let i = 0; i <= 8; i++) c.lineTo(x + 5 + i * 5, b - 84 + w(i));
    for (let i = 8; i >= 0; i--) c.lineTo(x + 5 + i * 5, b - 54 + w(i));
    c.closePath();
    if (style === "rose") { c.fillStyle = lgr(c, x, 0, x + 45, 0, [[0, "#ffffff"], [1, "#e8e0d0"]]); c.fill(); inkStroke(c, 1.2); c.fillStyle = "#b8282c"; c.fillRect(x + 21, b - 84 + w(4), 7, 30); c.fillRect(x + 5, b - 72 + w(4), 40, 6); }
    else if (style === "eagle") { c.fillStyle = lgr(c, x, 0, x + 45, 0, [[0, "#f6d77a"], [1, "#c9a227"]]); c.fill(); inkStroke(c, 1.2); eagle(c, x + 25, b - 69 + w(4), 0.75, "#1e1a18"); }
    else { c.fillStyle = lgr(c, x, 0, x + 45, 0, [[0, "#ffffff"], [1, "#e8e0d0"]]); c.fill(); inkStroke(c, 1.2); lily(c, x + 25, b - 68 + w(4), 1.5, "#c0392b"); }
  } else {
    c.beginPath(); c.moveTo(x + 5, b - 84); c.quadraticCurveTo(x + 14, b - 70, x + 9, b - 50); c.lineTo(x + 5, b - 52); c.closePath();
    c.fillStyle = "#b9b1a4"; c.fill(); inkStroke(c, 1);
  }
};
Art.spring = function (s) {
  const c = ctx, x = s.x, base = s.y + 32, h = s.squash > 0 ? 10 : 20;
  c.fillStyle = "#5b3a1e"; rrp(c, x + 1, base - 5, 30, 5, 1.5); c.fill(); inkStroke(c, 1);
  for (let i = 0; i < 4; i++) {
    const y0 = base - 5 - (i + 1) * h / 4;
    c.strokeStyle = INK; c.lineWidth = 3.6; c.beginPath(); c.ellipse(x + 16, y0 + h / 8, 11, 2.6, 0, 0, Math.PI); c.stroke();
    c.strokeStyle = i % 2 ? "#e2b04a" : "#c8922a"; c.lineWidth = 2.2; c.beginPath(); c.ellipse(x + 16, y0 + h / 8, 11, 2.6, 0, 0, Math.PI); c.stroke();
  }
  rrp(c, x + 2, base - h - 11, 28, 7, 2.5); c.fillStyle = lgr(c, 0, base - h - 11, 0, base - h - 4, [[0, "#e05a4a"], [1, "#9e2a20"]]); c.fill(); inkStroke(c, 1.2);
};
// Caltrops: big steel spikes with red-hot tips and a pulsing warning glow, easy to spot on any ground.
Art.spikes = function (k) {
  const c = ctx, x = k.x, b = k.y + 32, pulse = 0.65 + Math.sin(G.t / 8 + x) * 0.35;
  const g = c.createRadialGradient(x + 16, b - 6, 2, x + 16, b - 6, 30);
  g.addColorStop(0, `rgba(255,70,40,${0.55 * pulse})`); g.addColorStop(1, "rgba(255,70,40,0)");
  c.fillStyle = g; c.beginPath(); c.ellipse(x + 16, b - 6, 30, 18, 0, 0, 7); c.fill();
  c.fillStyle = "#2f2f35"; rrp(c, x, b - 6, 32, 6, 2); c.fill(); inkStroke(c, 1);
  for (let i = 0; i < 4; i++) {
    const sx = x + 4 + i * 8;
    c.beginPath(); c.moveTo(sx - 4, b - 5); c.lineTo(sx, b - 26); c.lineTo(sx + 4, b - 5); c.closePath();
    c.fillStyle = lgr(c, sx - 4, 0, sx + 4, 0, [[0, "#f4f4f8"], [0.5, "#9a9aa6"], [1, "#4a4a54"]]); c.fill(); inkStroke(c, 1.1);
    c.beginPath(); c.moveTo(sx - 1.6, b - 18); c.lineTo(sx, b - 26); c.lineTo(sx + 1.6, b - 18); c.closePath();
    c.fillStyle = "#e0402c"; c.fill();
  }
};
Art.plat = function (m, t) {
  if (m.kind === "press") return this.pressPlat(m, t);
  if (m.kind === "raft") return this.raft(m, t);
  const c = ctx, x = m.x, y = m.y;
  c.strokeStyle = "#5b4630"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(x + 10, y); c.lineTo(x + 26, -10); c.moveTo(x + m.w - 10, y); c.lineTo(x + m.w - 26, -10); c.stroke();
  rrp(c, x, y, m.w, 15, 3); c.fillStyle = lgr(c, 0, y, 0, y + 15, [[0, "#b98549"], [1, "#6e4523"]]); c.fill(); inkStroke(c, 1.3);
  c.fillStyle = "#3b2414"; for (let i = 1; i < 3; i++) c.fillRect(x + i * 32, y + 1, 1.2, 13);
  c.fillStyle = "#2b2b2b"; c.fillRect(x + 6, y + 3, 6, 9); c.fillRect(x + m.w - 12, y + 3, 6, 9);
  c.fillStyle = "rgba(20,10,5,0.3)"; c.fillRect(x + 3, y + 15, m.w - 6, 3);
};
// Leonardo da Vinci's ornithopter.
Art.machine = function (cx, cy, flying, flapping, t) {
  const c = ctx, flap = flying ? Math.sin(t / (flapping ? 2.5 : 7)) * 0.5 : -0.25;
  c.save(); c.translate(cx, cy);
  for (const side of [-1, 1]) {
    c.save(); c.scale(side, 1); c.rotate(flap);
    c.beginPath(); c.moveTo(4, 0);
    c.bezierCurveTo(20, -30, 52, -36, 78, -16);
    c.lineTo(72, -9); c.quadraticCurveTo(66, -2, 60, 0); c.quadraticCurveTo(54, -1, 48, 3); c.quadraticCurveTo(40, 1, 32, 6); c.quadraticCurveTo(18, 3, 4, 0);
    c.fillStyle = lgr(c, 0, -30, 0, 6, [[0, "rgba(248,236,206,0.95)"], [1, "rgba(212,188,140,0.95)"]]); c.fill(); inkStroke(c, 1.4);
    c.strokeStyle = "#6e4523"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(40, -26, 78, -16); c.stroke();
    c.lineWidth = 1.1;
    for (const [ex, ey] of [[60, 0], [48, 3], [32, 6], [70, -9]]) { c.beginPath(); c.moveTo(10 + ex * 0.2, -6); c.lineTo(ex, ey); c.stroke(); }
    c.restore();
  }
  c.strokeStyle = "#5b3a1e"; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(-24, 4); c.lineTo(24, 4); c.moveTo(0, -6); c.lineTo(0, 10); c.stroke();
  c.strokeStyle = "rgba(60,40,20,0.7)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -6); c.lineTo(-30, -14); c.moveTo(0, -6); c.lineTo(30, -14); c.stroke();
  if (!flying) {
    c.fillStyle = "#5b3a1e"; c.fillRect(-15, 4, 4, 18); c.fillRect(11, 4, 4, 18);
    c.fillStyle = `rgba(255,230,140,${0.5 + Math.sin(t / 10) * 0.4})`; c.font = `bold 18px ${FONT_B}`; c.textAlign = "center"; c.fillText("✦", 0, -40);
  }
  c.restore();
};
// Gate: rusticated stone portal, iron-banded doors, Medici arms above.
Art.door = function (d, arms) {
  const c = ctx, x = d.x * T, top = 11 * T, base = 14 * T;
  c.save();
  c.beginPath(); c.rect(x - 8, top - 30, T + 16, base - top + 30); c.clip();
  const yy = -d.lift;
  c.beginPath(); c.moveTo(x - 4, base + yy); c.lineTo(x - 4, top + 18 + yy); c.arc(x + 16, top + 18 + yy, 20, Math.PI, 0); c.lineTo(x + 36, base + yy); c.closePath();
  c.fillStyle = lgr(c, x - 4, 0, x + 36, 0, [[0, "#7d5128"], [0.5, "#9a6a38"], [1, "#5b3a1e"]]); c.fill(); inkStroke(c, 1.5);
  c.strokeStyle = "rgba(40,22,10,0.6)"; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(x - 4 + i * 8, top + 2 + yy); c.lineTo(x - 4 + i * 8, base + yy); c.stroke(); }
  for (const by of [top + 30, top + 66]) {
    c.fillStyle = "#2b2b2b"; c.fillRect(x - 4, by + yy, 40, 5);
    c.fillStyle = "#8a8a8a"; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x + i * 8, by + 2.5 + yy, 1.4, 0, 7); c.fill(); }
  }
  c.strokeStyle = "#2b2b2b"; c.lineWidth = 2; c.beginPath(); c.arc(x + 22, top + 52 + yy, 4, 0, 7); c.stroke();
  c.restore();
  // stone arch frame
  c.strokeStyle = "#8f8578"; c.lineWidth = 7; c.beginPath(); c.moveTo(x - 7, base); c.lineTo(x - 7, top + 18); c.arc(x + 16, top + 18, 23, Math.PI, 0); c.lineTo(x + 39, base); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(x + 16, top + 18, 26.5, Math.PI, 0); c.stroke();
  for (let i = 0; i <= 6; i++) { const a = Math.PI + i * Math.PI / 6; c.beginPath(); c.moveTo(x + 16 + Math.cos(a) * 19.5, top + 18 + Math.sin(a) * 19.5); c.lineTo(x + 16 + Math.cos(a) * 26.5, top + 18 + Math.sin(a) * 26.5); c.stroke(); }
  if (arms === "eagle") eagleShield(c, x + 16, top - 24, 1.1); else if (arms === "tudor") tudorShield(c, x + 16, top - 24, 1.1); else mediciShield(c, x + 16, top - 24, 1.1);
  if (!d.open) {
    c.fillStyle = "rgba(43,29,20,0.88)"; rrp(c, x - 16, top - 70, 64, 24, 12); c.fill();
    c.strokeStyle = "#c9a227"; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = "#ffe8a8"; c.font = `bold 15px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(`🔒 ${d.have}/${d.cfg.need}`, x + 16, top - 57.5);
  }
};
// Word block plaque (in-world quick recall).
Art.wordBlock = function (x, y, w, label, state) {
  const c = ctx, s = { idle: ["#e9cf87", "#a8761a", "#2b1d14"], right: ["#9ad8b6", "#2f7a64", "#123d30"], wrong: ["#ec9f93", "#b23a2e", "#4a120c"], dim: ["#d8cdb4", "#8a7a62", "#8a7a62"] }[state];
  rrp(c, x + 1, y, w - 2, T, 6); c.fillStyle = lgr(c, 0, y, 0, y + T, [[0, "#fff1c4"], [1, s[0]]]); c.fill();
  c.strokeStyle = s[1]; c.lineWidth = 3; c.stroke(); inkStroke(c, 1);
  c.fillStyle = "#b23a2e"; c.beginPath(); c.moveTo(x + 4, y + 2); c.lineTo(x + 11, y + 2); c.lineTo(x + 4, y + 9); c.fill(); c.beginPath(); c.moveTo(x + w - 4, y + 2); c.lineTo(x + w - 11, y + 2); c.lineTo(x + w - 4, y + 9); c.fill();
  c.fillStyle = s[2]; c.font = `800 14px ${FONT_B}`; c.textAlign = "center"; c.textBaseline = "middle";
  const lines = wrapText(label, w - 14);
  lines.forEach((l, k) => c.fillText(l, x + w / 2, y + 16.5 + (k - (lines.length - 1) / 2) * 13));
};
Art.ring = function (x, y, label, col, t) {
  const c = ctx;
  c.strokeStyle = "rgba(43,29,20,0.7)"; c.lineWidth = 10; c.beginPath(); c.ellipse(x, y, 16, 46, 0, 0, 7); c.stroke();
  c.strokeStyle = col === "gold" ? lgr(c, 0, y - 46, 0, y + 46, [[0, "#ffe28a"], [0.5, "#c9961e"], [1, "#ffe28a"]]) : col; c.lineWidth = 6.5;
  c.beginPath(); c.ellipse(x, y, 16, 46, 0, 0, 7); c.stroke();
  c.strokeStyle = "rgba(255,255,230,0.6)"; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, 16, 46, 0, 3.6, 4.8); c.stroke();
  c.font = `800 15px ${FONT_B}`;
  const tw = c.measureText(label).width + 18;
  rrp(c, x + 24, y - 14, tw, 28, 7); c.fillStyle = "rgba(251,244,224,0.97)"; c.fill();
  c.strokeStyle = col === "gold" ? "#c9a227" : col; c.lineWidth = 2; c.stroke();
  c.fillStyle = INK; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(label, x + 33, y + 1);
};
// Wrought-iron lantern for the boss arena.
Art.lantern = function (x, base, lit, t) {
  const c = ctx;
  c.fillStyle = "#2b2b2b"; c.fillRect(x - 2.5, base - 46, 5, 46);
  c.strokeStyle = "#2b2b2b"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, base - 44); c.quadraticCurveTo(x + 10, base - 50, x + 4, base - 58); c.stroke();
  if (lit) {
    c.fillStyle = rgr(c, x, base - 66, 2, 64, [[0, "rgba(255,225,140,0.85)"], [1, "rgba(255,225,140,0)"]]); c.beginPath(); c.arc(x, base - 66, 64, 0, 7); c.fill();
  }
  c.beginPath(); c.moveTo(x - 10, base - 52); c.lineTo(x + 10, base - 52); c.lineTo(x + 12, base - 78); c.lineTo(x - 12, base - 78); c.closePath();
  c.fillStyle = lit ? lgr(c, 0, base - 78, 0, base - 52, [[0, "#fff3c4"], [1, "#ffc04a"]]) : "#4a4038"; c.fill(); inkStroke(c, 2);
  c.strokeStyle = "#2b2b2b"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, base - 52); c.lineTo(x, base - 78); c.stroke();
  if (lit) { c.fillStyle = "#ff8a2a"; c.beginPath(); c.ellipse(x, base - 62 + Math.sin(t / 3) * 0.6, 2.6, 5 + Math.sin(t / 2) * 0.8, 0, 0, 7); c.fill(); }
  c.fillStyle = "#2b2b2b"; c.beginPath(); c.moveTo(x - 14, base - 78); c.lineTo(x, base - 88); c.lineTo(x + 14, base - 78); c.fill();
  if (lit) { c.fillStyle = "#fff6d8"; c.font = `bold 20px ${FONT_B}`; c.textAlign = "center"; c.fillText("▼", x, base - 98 + Math.sin(t / 6) * 3); }
};
// The Fog of Forgetting.
Art.boss = function (b, t) {
  const c = ctx, fade = b.dying ? Math.max(0, 1 - b.dying / 140) : 1;
  c.save(); c.globalAlpha = fade; c.translate(b.x, b.y);
  for (let i = 0; i < 7; i++) {
    const sx = -80 + i * 27, sway = Math.sin(t / 18 + i) * 10;
    c.strokeStyle = "rgba(40,25,60,0.55)"; c.lineWidth = 7 - (i % 3); c.lineCap = "round";
    c.beginPath(); c.moveTo(sx, 30); c.bezierCurveTo(sx + sway, 70, sx - sway, 100, sx + sway * 0.5, 120 + (i % 2) * 20); c.stroke();
  }
  const puffs = [[-90, 14, 46], [-55, -18, 56], [0, -30, 64], [55, -14, 54], [92, 16, 42], [-30, 26, 48], [36, 28, 50], [0, 6, 60]];
  for (const [dx, dy, r] of puffs) {
    const x0 = dx + Math.sin(t / 22 + dx) * 5, y0 = dy + Math.cos(t / 27 + dy) * 3;
    c.fillStyle = b.flash % 6 > 2 ? "#f0e6ff" : rgr(c, x0 - r * 0.3, y0 - r * 0.4, r * 0.1, r, [[0, "#6a4e8e"], [0.7, "#3a2850"], [1, "rgba(30,18,42,0.95)"]]);
    c.beginPath(); c.arc(x0, y0, r, 0, 7); c.fill();
  }
  c.strokeStyle = "rgba(160,130,210,0.25)"; c.lineWidth = 2;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 30 + i * 18, t / 30 + i, t / 30 + i + 2); c.stroke(); }
  const eye = (ex, ey, r) => {
    c.fillStyle = rgr(c, ex, ey, 0, r * 2.4, [[0, "rgba(255,210,90,0.7)"], [1, "rgba(255,210,90,0)"]]); c.beginPath(); c.arc(ex, ey, r * 2.4, 0, 7); c.fill();
    c.fillStyle = "#ffcf5e"; c.beginPath(); c.ellipse(ex, ey, r, r * (0.7 + Math.sin(t / 30) * 0.15), 0, 0, 7); c.fill();
    c.fillStyle = "#1a1024"; c.beginPath(); c.ellipse(ex, ey, r * 0.25, r * 0.65, 0, 0, 7); c.fill();
  };
  eye(-28, -4, 11); eye(28, -4, 11); eye(-60, 10, 5); eye(62, 8, 5); eye(0, -38, 4);
  c.fillStyle = "#12091a"; c.beginPath(); c.moveTo(-30, 24); c.quadraticCurveTo(0, 46 + Math.sin(t / 15) * 4, 30, 24); c.quadraticCurveTo(0, 32, -30, 24); c.fill();
  c.fillStyle = "#e9dcff"; for (let i = 0; i < 6; i++) { const tx = -24 + i * 9.5; c.beginPath(); c.moveTo(tx, 26 + Math.abs(i - 2.5)); c.lineTo(tx + 3, 33); c.lineTo(tx + 6, 26 + Math.abs(i - 2.5)); c.fill(); }
  c.restore();
};
Art.orb = function (o, t) {
  const c = ctx;
  c.fillStyle = rgr(c, o.x, o.y, 2, 22, [[0, "rgba(160,110,220,0.5)"], [1, "rgba(160,110,220,0)"]]); c.beginPath(); c.arc(o.x, o.y, 22, 0, 7); c.fill();
  c.fillStyle = rgr(c, o.x - 4, o.y - 4, 1, 14, [[0, "#9a78c8"], [1, "#2a1838"]]); c.beginPath(); c.arc(o.x, o.y, 12, 0, 7); c.fill(); inkStroke(c, 1.2);
  c.strokeStyle = "rgba(230,210,255,0.6)"; c.lineWidth = 1.4; c.beginPath(); c.arc(o.x, o.y, 7, t / 5, t / 5 + 2.4); c.stroke();
};

// ---------------------------------------------------------------- the Arno and its bridge
Art.water = function (x0, x1, top, t, style) {
  const c = ctx;
  c.fillStyle = lgr(c, 0, top, 0, VH, style === "rhine" ? [[0, "#7fa89a"], [0.25, "#4f7f74"], [1, "#2a4a46"]] : [[0, "#6aa6c4"], [0.25, "#3f7fa6"], [1, "#24506e"]]);
  c.fillRect(x0, top, x1 - x0, VH - top);
  c.fillStyle = "rgba(255,240,210,0.18)"; c.fillRect(x0, top + 4, x1 - x0, 6);
  for (let x = x0; x < x1; x += 26) {
    for (let k = 0; k < 3; k++) {
      const yy = top + 14 + k * 18 + ((x / 26) % 3) * 4, ox = Math.sin(t / 18 + x * 0.1 + k) * 7;
      c.fillStyle = `rgba(200,230,245,${0.35 - k * 0.08})`; c.fillRect(x + ox, yy, 12 - k * 2, 1.6);
    }
  }
  c.fillStyle = "#cfe8f4"; c.fillRect(x0, top, x1 - x0, 2.5);
};
Art.boat = function (bt, top, t) {
  const c = ctx, by = top - 6 + Math.sin(t / 20 + bt.x) * 1.5, x = bt.x;
  c.save(); c.translate(x, by); c.scale(bt.dir, 1); c.translate(bt.dir < 0 ? -60 : 0, 0);
  c.beginPath(); c.moveTo(-4, -2); c.quadraticCurveTo(30, 4, 64, -2); c.lineTo(54, 10); c.lineTo(6, 10); c.closePath();
  c.fillStyle = lgr(c, 0, -2, 0, 10, [[0, "#8b5a2b"], [1, "#4a2e17"]]); c.fill(); inkStroke(c, 1.2);
  c.strokeStyle = "rgba(255,220,170,0.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(2, 2); c.quadraticCurveTo(30, 7, 58, 2); c.stroke();
  c.fillStyle = "#2f6aa3"; rrp(c, 24, -16, 10, 14, 3); c.fill(); inkStroke(c, 1);
  c.fillStyle = "#efc39b"; c.beginPath(); c.arc(29, -20, 4.2, 0, 7); c.fill(); inkStroke(c, 0.8);
  c.fillStyle = "#3b2414"; c.beginPath(); c.ellipse(29, -23.5, 4.5, 2, 0, 0, 7); c.fill();
  c.strokeStyle = "#5b3a1e"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(33, -10); c.lineTo(56 + Math.sin(t / 15) * 6, 16); c.stroke();
  c.restore();
};
Art.bridge = function () {
  // The Ponte Vecchio, with its shops perched over the Arno.
  const c = ctx, x0 = 144 * T, x1 = 158 * T, deck = 10.6 * T, water = 14.4 * T;
  c.save(); c.globalAlpha = 0.93;
  c.fillStyle = lgr(c, 0, deck, 0, water, [[0, "#c39c68"], [1, "#9a7a50"]]); c.fillRect(x0, deck, x1 - x0, water - deck);
  for (let i = 0; i < 3; i++) {
    const aw = (x1 - x0 - 80) / 3 - 30, ax = x0 + 40 + i * ((x1 - x0 - 80) / 3);
    c.beginPath(); c.moveTo(ax, water); c.lineTo(ax, deck + 60); c.quadraticCurveTo(ax + aw / 2, deck + 14, ax + aw, deck + 60); c.lineTo(ax + aw, water); c.closePath();
    c.fillStyle = lgr(c, 0, deck + 30, 0, water, [[0, "#2c4e64"], [1, "#3f7fa6"]]); c.fill();
    c.strokeStyle = "#e0c9a0"; c.lineWidth = 4; c.beginPath(); c.moveTo(ax, deck + 60); c.quadraticCurveTo(ax + aw / 2, deck + 14, ax + aw, deck + 60); c.stroke();
    c.strokeStyle = "rgba(90,60,30,0.6)"; c.lineWidth = 1;
    for (let k = 0; k <= 8; k++) { const tt = k / 8, px = (1 - tt) * (1 - tt) * ax + 2 * (1 - tt) * tt * (ax + aw / 2) + tt * tt * (ax + aw), py = (1 - tt) * (1 - tt) * (deck + 60) + 2 * (1 - tt) * tt * (deck + 14) + tt * tt * (deck + 60); c.beginPath(); c.moveTo(px, py); c.lineTo(px, py - 6); c.stroke(); }
  }
  c.fillStyle = "#e0c9a0"; c.fillRect(x0, deck - 2, x1 - x0, 5);
  const cols = ["#d9a066", "#c97f4a", "#e0b878", "#b8703e", "#d8956a", "#e6c08e"];
  for (let i = 0; i < 14; i++) {
    const sx = x0 + i * 32, h = 36 + (i * 7) % 18;
    c.fillStyle = cols[i % 6]; c.fillRect(sx, deck - h, 32, h);
    c.fillStyle = "rgba(60,30,10,0.15)"; c.fillRect(sx + 24, deck - h, 8, h);
    c.fillStyle = "#3e2a1a"; c.fillRect(sx + 6, deck - h + 9, 8, 11); c.fillRect(sx + 18, deck - h + 9, 8, 11);
    c.fillStyle = "#4d7a5c"; c.fillRect(sx + 3, deck - h + 9, 3, 11); c.fillRect(sx + 26, deck - h + 9, 3, 11);
    c.fillStyle = "#a4462a"; c.fillRect(sx - 2, deck - h - 6, 36, 7); c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(sx - 2, deck - h + 1, 36, 1.5);
    c.strokeStyle = "#5b3a1e"; c.lineWidth = 2; c.beginPath(); c.moveTo(sx + 4, deck + 2); c.lineTo(sx + 12, deck + 22); c.moveTo(sx + 28, deck + 2); c.lineTo(sx + 20, deck + 22); c.stroke();
  }
  c.fillStyle = "#dcb987"; c.fillRect(x0 + 40, deck - 76, x1 - x0 - 80, 16);
  c.fillStyle = "#a4462a"; c.fillRect(x0 + 36, deck - 80, x1 - x0 - 72, 5);
  c.fillStyle = "#3e2a1a"; for (let i = 0; i < 20; i++) c.fillRect(x0 + 50 + i * 18, deck - 72, 6, 8);
  c.restore();
};

// ---------------------------------------------------------------- scenery
const ANIMATED_DECOR = new Set(["banner", "bench", "chimney", "laundry", "vane", "wisplamp"]);
Art.decor = function (d, t) {
  if (ANIMATED_DECOR.has(d.kind) || ANIMATED_L2.has(d.kind)) return this.paintDecor(d, t, ctx);
  let spr = this.decorCache.get(d);
  if (!spr) {
    const [c, x] = this.mk(180, 160);
    x.translate(-d.tx * T + 40, -d.base + 140);
    this.paintDecor(d, 0, x);
    spr = c; this.decorCache.set(d, spr);
  }
  ctx.drawImage(spr, d.tx * T - 40, d.base - 140, 180, 160);
};
Art.paintDecor = function (d, t, c) {
  const x = d.tx * T, b = d.base, sd = d.seed;
  if (L2_DECOR[d.kind]) { c.save(); L2_DECOR[d.kind](c, x, b, sd, t); c.restore(); return; }
  c.save();
  switch (d.kind) {
    case "lamp": {
      c.fillStyle = "#2b2b2b"; c.fillRect(x + 13, b - 92, 5, 92); c.fillRect(x + 8, b - 6, 15, 6); c.fillRect(x + 10, b - 30, 11, 3);
      c.strokeStyle = "#2b2b2b"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 16, b - 88); c.quadraticCurveTo(x + 30, b - 96, x + 30, b - 86); c.stroke();
      c.beginPath(); c.arc(x + 22, b - 80, 5, Math.PI, Math.PI * 1.8); c.stroke();
      c.fillStyle = rgr(c, x + 30, b - 74, 1, 36, [[0, "rgba(255,210,120,0.55)"], [1, "rgba(255,210,120,0)"]]); c.beginPath(); c.arc(x + 30, b - 74, 36, 0, 7); c.fill();
      c.beginPath(); c.moveTo(x + 24, b - 84); c.lineTo(x + 36, b - 84); c.lineTo(x + 34, b - 66); c.lineTo(x + 26, b - 66); c.closePath();
      c.fillStyle = lgr(c, 0, b - 84, 0, b - 66, [[0, "#fff3c4"], [1, "#f2b84a"]]); c.fill(); inkStroke(c, 1.6);
      c.fillStyle = "#2b2b2b"; c.beginPath(); c.moveTo(x + 22, b - 84); c.lineTo(x + 30, b - 90); c.lineTo(x + 38, b - 84); c.fill();
      break;
    }
    case "stall": {
      c.fillStyle = "#5b3a1e"; c.fillRect(x + 4, b - 74, 4, 74); c.fillRect(x + 88, b - 74, 4, 74);
      rrp(c, x, b - 30, 96, 30, 2); c.fillStyle = lgr(c, 0, b - 30, 0, b, [[0, "#9a6a38"], [1, "#5b3a1e"]]); c.fill(); inkStroke(c, 1.2);
      c.strokeStyle = "rgba(40,22,10,0.5)"; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x + i * 16, b - 26); c.lineTo(x + i * 16, b); c.stroke(); }
      const stripe = sd > 0.5 ? "#b23a2e" : "#2f6db3";
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? "#f4ead2" : stripe;
        c.beginPath(); c.moveTo(x - 6 + i * 13.5, b - 82); c.lineTo(x + 7.5 + i * 13.5, b - 82); c.lineTo(x + 7.5 + i * 13.5, b - 66); c.arc(x + 0.75 + i * 13.5, b - 66, 6.75, 0, Math.PI); c.closePath(); c.fill();
      }
      c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(x - 6, b - 82, 108, 4);
      c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(x - 6, b - 82, 108, 16);
      const fruit = [["#e8892b", "#b85a12"], ["#e8c34a", "#b08a1a"], ["#7aa83f", "#4a7a20"], ["#b23a2e", "#7a1a12"], ["#7a4a9a", "#4a2a6a"]];
      for (let i = 0; i < 14; i++) {
        const [hi, lo] = fruit[(i + Math.floor(sd * 5)) % 5], fx = x + 8 + (i % 9) * 9.5, fy = b - 34 - (i >= 9 ? 7 : 0) - (i % 2) * 2;
        c.fillStyle = rgr(c, fx - 1.5, fy - 1.5, 0.5, 5, [[0, hi], [1, lo]]); c.beginPath(); c.arc(fx, fy, 4.6, 0, 7); c.fill();
      }
      break;
    }
    case "flowers": case "pots": {
      for (let i = 0; i < (d.kind === "pots" ? 2 : 1); i++) {
        const px = x + 6 + i * 14;
        c.fillStyle = "#3f6a32"; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(px + 7 + (k - 2) * 3.5, b - 22 - (k % 2) * 4, 4, 2.4, (k - 2) * 0.4, 0, 7); c.fill(); }
        const petal = d.kind === "pots" ? "#7aa85a" : (sd > 0.5 ? "#e0405a" : "#f2c63c");
        for (let k = 0; k < 4; k++) { c.fillStyle = petal; c.beginPath(); c.arc(px + 2 + k * 3.6, b - 27 - (k % 2) * 5, 2.6, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,0.4)"; c.fillRect(px + 1.4 + k * 3.6, b - 28.4 - (k % 2) * 5, 1, 1); }
        c.beginPath(); c.moveTo(px, b - 17); c.lineTo(px + 14, b - 17); c.lineTo(px + 12, b); c.lineTo(px + 2, b); c.closePath();
        c.fillStyle = lgr(c, px, 0, px + 14, 0, [[0, "#d2744a"], [1, "#8a3c21"]]); c.fill(); inkStroke(c, 1);
        c.fillStyle = "#a84a29"; rrp(c, px - 1.5, b - 19, 17, 3.5, 1); c.fill(); inkStroke(c, 0.8);
      }
      break;
    }
    case "barrel": {
      rrp(c, x + 4, b - 32, 24, 32, 7); c.fillStyle = lgr(c, x + 4, 0, x + 28, 0, [[0, "#5b3a1e"], [0.35, "#a8743e"], [1, "#4a2e17"]]); c.fill(); inkStroke(c, 1.2);
      c.strokeStyle = "rgba(40,22,10,0.4)"; c.lineWidth = 0.8; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x + 4 + i * 6, b - 31); c.quadraticCurveTo(x + 4 + i * 6 + (i - 2) * 1.5, b - 16, x + 4 + i * 6, b - 1); c.stroke(); }
      c.fillStyle = "#3b3b3b"; c.fillRect(x + 4, b - 27, 24, 3); c.fillRect(x + 4, b - 8, 24, 3);
      break;
    }
    case "banner": {
      c.fillStyle = "#3b2a1a"; c.fillRect(x + 6, b - 100, 4, 100);
      c.fillStyle = "#d9a728"; c.beginPath(); c.arc(x + 8, b - 102, 3.5, 0, 7); c.fill();
      const w = k => Math.sin(t / 12 + sd * 6 + k * 0.7) * 3;
      c.beginPath(); c.moveTo(x + 10, b - 96);
      for (let k = 0; k <= 5; k++) c.lineTo(x + 10 + k * 6, b - 96 + w(k));
      for (let k = 5; k >= 0; k--) c.lineTo(x + 10 + k * 6, b - 60 + w(k));
      c.closePath(); c.fillStyle = sd > 0.5 ? "#fbf6ea" : "#c0392b"; c.fill(); inkStroke(c, 1.2);
      lily(c, x + 25, b - 78 + w(3), 1.4, sd > 0.5 ? "#c0392b" : "#fbf6ea");
      break;
    }
    case "well": {
      c.fillStyle = "#5b3a1e"; c.fillRect(x + 2, b - 64, 4, 44); c.fillRect(x + 26, b - 64, 4, 44);
      c.beginPath(); c.moveTo(x - 5, b - 60); c.lineTo(x + 16, b - 76); c.lineTo(x + 37, b - 60); c.closePath(); c.fillStyle = lgr(c, 0, b - 76, 0, b - 60, [[0, "#c9643a"], [1, "#8a3520"]]); c.fill(); inkStroke(c, 1.2);
      rrp(c, x - 1, b - 24, 34, 24, 4); c.fillStyle = lgr(c, x, 0, x + 34, 0, [[0, "#c2b49c"], [1, "#857760"]]); c.fill(); inkStroke(c, 1.2);
      c.strokeStyle = "rgba(60,45,30,0.5)"; c.lineWidth = 1; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(x - 1, b - 16 + i * 8); c.lineTo(x + 33, b - 16 + i * 8); c.stroke(); }
      c.strokeStyle = "#3b2a1a"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 16, b - 62); c.lineTo(x + 16, b - 38); c.stroke();
      c.fillStyle = "#6e4523"; rrp(c, x + 11, b - 38, 10, 8, 2); c.fill(); inkStroke(c, 1);
      break;
    }
    case "easel": {
      c.strokeStyle = "#6e4523"; c.lineWidth = 3; c.lineCap = "round";
      c.beginPath(); c.moveTo(x + 4, b); c.lineTo(x + 16, b - 68); c.lineTo(x + 28, b); c.moveTo(x + 16, b - 68); c.lineTo(x + 19, b); c.stroke();
      c.fillStyle = "#7d5128"; c.fillRect(x, b - 24, 32, 3);
      c.fillStyle = "#c9a227"; rrp(c, x + 1, b - 62, 30, 38, 1.5); c.fill(); inkStroke(c, 1.2);
      c.fillStyle = sd > 0.5 ? "#3c4a33" : "#6d8fae"; c.fillRect(x + 4, b - 59, 24, 32);
      if (sd > 0.5) {
        c.fillStyle = "#5f6b48"; c.beginPath(); c.moveTo(x + 4, b - 40); c.quadraticCurveTo(x + 10, b - 50, x + 16, b - 44); c.quadraticCurveTo(x + 22, b - 52, x + 28, b - 42); c.lineTo(x + 28, b - 27); c.lineTo(x + 4, b - 27); c.fill();
        c.fillStyle = "#2b1d14"; c.beginPath(); c.ellipse(x + 16, b - 43, 7.5, 10, 0, 0, 7); c.fill();
        c.fillStyle = rgr(c, x + 15, b - 47, 0.5, 6, [[0, "#e8c08e"], [1, "#b8885a"]]); c.beginPath(); c.ellipse(x + 16, b - 46, 4, 5.4, 0, 0, 7); c.fill();
        c.fillStyle = "#3b2a1a"; c.beginPath(); c.moveTo(x + 9, b - 27); c.quadraticCurveTo(x + 16, b - 40, x + 23, b - 27); c.fill();
        c.fillStyle = "#e0b880"; c.fillRect(x + 13, b - 31, 6, 2);
      } else {
        c.fillStyle = "#f2e6b8"; c.beginPath(); c.arc(x + 22, b - 52, 3, 0, 7); c.fill();
        c.fillStyle = "#7a9a5a"; c.beginPath(); c.moveTo(x + 4, b - 34); c.quadraticCurveTo(x + 14, b - 46, x + 28, b - 37); c.lineTo(x + 28, b - 27); c.lineTo(x + 4, b - 27); c.fill();
        c.fillStyle = "#3f5a38"; c.beginPath(); c.ellipse(x + 10, b - 38, 1.6, 6, 0, 0, 7); c.fill();
      }
      break;
    }
    case "bench": {
      rrp(c, x - 6, b - 28, 44, 7, 1.5); c.fillStyle = lgr(c, 0, b - 28, 0, b - 21, [[0, "#a8743e"], [1, "#6e4523"]]); c.fill(); inkStroke(c, 1.1);
      c.fillStyle = "#6e4523"; c.fillRect(x - 3, b - 21, 4, 21); c.fillRect(x + 31, b - 21, 4, 21);
      c.save(); c.translate(x + 9, b - 38); c.rotate(t / 40);
      c.fillStyle = "#9a9aa2"; for (let i = 0; i < 10; i++) { c.rotate(Math.PI / 5); c.fillRect(-2, -12, 4, 5); }
      c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fillStyle = rgr(c, -3, -3, 1, 10, [[0, "#c8c8d0"], [1, "#6a6a72"]]); c.fill(); inkStroke(c, 1);
      c.fillStyle = "#4a4a52"; c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill();
      c.restore();
      c.fillStyle = "#efe1bc"; c.save(); c.translate(x + 26, b - 31); c.rotate(-0.15); c.fillRect(-7, -3, 14, 5); c.fillStyle = "#b23a2e"; c.fillRect(5, -3, 2, 5); c.restore();
      break;
    }
    case "sketch": {
      c.fillStyle = "#6e4523"; c.fillRect(x + 4, b - 60, 3, 60); c.fillRect(x + 25, b - 60, 3, 60);
      rrp(c, x - 1, b - 68, 34, 36, 1.5); c.fillStyle = lgr(c, 0, b - 68, 0, b - 32, [[0, "#f6ead0"], [1, "#e0c896"]]); c.fill(); inkStroke(c, 1.1);
      c.strokeStyle = "#7a5a3a"; c.lineWidth = 0.9;
      c.beginPath(); c.arc(x + 16, b - 50, 13, 0, 7); c.stroke(); c.strokeRect(x + 5, b - 62, 22, 23);
      c.beginPath(); c.arc(x + 16, b - 58.5, 2.6, 0, 7); c.moveTo(x + 16, b - 56); c.lineTo(x + 16, b - 46);
      c.moveTo(x + 5, b - 53); c.lineTo(x + 27, b - 53); c.moveTo(x + 7, b - 59); c.lineTo(x + 25, b - 47);
      c.moveTo(x + 16, b - 46); c.lineTo(x + 9, b - 38); c.moveTo(x + 16, b - 46); c.lineTo(x + 23, b - 38);
      c.moveTo(x + 16, b - 46); c.lineTo(x + 12, b - 37.5); c.moveTo(x + 16, b - 46); c.lineTo(x + 20, b - 37.5); c.stroke();
      c.fillStyle = "rgba(120,90,60,0.5)"; for (let i = 0; i < 3; i++) c.fillRect(x + 2, b - 36 + i * 1.6, 10 + i * 4, 0.7);
      break;
    }
    case "bush": {
      const greens = ["#3f6a32", "#4f7d3a", "#5f8f45", "#6fa04f"];
      [[8, 12, 11], [21, 11, 12], [14, 18, 10], [5, 6, 7], [26, 5, 7]].forEach(([a, cc, r], i) => {
        c.fillStyle = rgr(c, x + a - 3, b - cc - 4, 1, r, [[0, greens[3]], [1, greens[i % 2]]]); c.beginPath(); c.arc(x + a, b - cc, r, 0, 7); c.fill();
      });
      c.fillStyle = "rgba(255,255,230,0.25)"; for (let i = 0; i < 6; i++) c.fillRect(x + 4 + i * 4, b - 22 + (i % 3) * 3, 1.5, 1.5);
      break;
    }
    case "cypress": {
      c.fillStyle = "#5b3a1e"; c.fillRect(x + 14, b - 10, 4, 10);
      c.beginPath(); c.moveTo(x + 16, b - 118); c.bezierCurveTo(x + 30, b - 80, x + 28, b - 30, x + 16, b - 8); c.bezierCurveTo(x + 4, b - 30, x + 2, b - 80, x + 16, b - 118);
      c.fillStyle = lgr(c, x + 4, 0, x + 28, 0, [[0, "#4f7d45"], [0.5, "#2f5a32"], [1, "#1f3f24"]]); c.fill(); inkStroke(c, 1, 0.6);
      c.strokeStyle = "rgba(120,170,100,0.35)"; c.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const yy = b - 100 + i * 10; c.beginPath(); c.moveTo(x + 10, yy); c.quadraticCurveTo(x + 14, yy - 4, x + 18, yy); c.stroke(); }
      break;
    }
    case "chimney": {
      c.fillStyle = "#a84a29"; c.fillRect(x + 8, b - 52, 18, 52);
      c.fillStyle = "#d6c19d"; for (let i = 0; i < 6; i++) c.fillRect(x + 8, b - 50 + i * 9, 18, 1);
      c.fillStyle = "rgba(255,200,160,0.25)"; c.fillRect(x + 8, b - 52, 4, 52);
      c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(x + 8, b - 52, 18, 52);
      c.fillStyle = "#7a3018"; c.beginPath(); c.moveTo(x + 4, b - 54); c.lineTo(x + 17, b - 62); c.lineTo(x + 30, b - 54); c.lineTo(x + 30, b - 51); c.lineTo(x + 4, b - 51); c.closePath(); c.fill(); inkStroke(c, 1.1);
      for (let i = 0; i < 4; i++) {
        const k = ((t / 3 + i * 25 + sd * 90) % 100) / 100;
        c.fillStyle = `rgba(232,228,220,${0.5 * (1 - k)})`;
        c.beginPath(); c.arc(x + 17 + Math.sin(k * 6 + sd * 9) * 6 + k * 16, b - 66 - k * 80, 5 + k * 11, 0, 7); c.fill();
      }
      break;
    }
    case "laundry": {
      c.fillStyle = "#5b3a1e"; c.fillRect(x + 2, b - 76, 4, 76); c.fillRect(x + 90, b - 76, 4, 76);
      c.strokeStyle = "#3b2a1a"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, b - 72); c.quadraticCurveTo(x + 48, b - 60, x + 92, b - 72); c.stroke();
      const cols = ["#f4ead2", "#2f6db3", "#b23a2e", "#e8c34a"];
      for (let i = 0; i < 4; i++) {
        const cx = x + 16 + i * 20, sway = Math.sin(t / 15 + i) * 3, top = b - 68 + (i % 3) + Math.abs(i - 1.5) * -1.5;
        c.beginPath(); c.moveTo(cx - 7, top); c.lineTo(cx + 7, top); c.lineTo(cx + 6 + sway, top + 22); c.quadraticCurveTo(cx + sway, top + 24, cx - 6 + sway, top + 22); c.closePath();
        c.fillStyle = cols[(i + Math.floor(sd * 4)) % 4]; c.fill(); inkStroke(c, 0.9);
        c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(cx + 2, top, 4, 20);
        c.fillStyle = "#6e4523"; c.fillRect(cx - 5, top - 2, 2, 4); c.fillRect(cx + 3, top - 2, 2, 4);
      }
      break;
    }
    case "vane": {
      c.fillStyle = "#3b3b3b"; c.fillRect(x + 15, b - 74, 2, 74);
      c.fillStyle = "#3b3b3b"; c.fillRect(x + 9, b - 60, 14, 1.5); c.fillRect(x + 15.25, b - 66, 1.5, 12);
      c.save(); c.translate(x + 16, b - 78); c.scale(Math.cos(t / 60), 1);
      c.fillStyle = "#2b2b2b"; c.beginPath(); c.moveTo(-13, 0); c.lineTo(3, -2); c.lineTo(7, -11); c.lineTo(10, -8); c.lineTo(9, -4); c.lineTo(13, -2); c.lineTo(10, 2); c.lineTo(-9, 4); c.closePath(); c.fill();
      c.fillStyle = "#b23a2e"; c.beginPath(); c.moveTo(7, -11); c.lineTo(9, -13); c.lineTo(10, -10); c.fill();
      c.restore();
      break;
    }
    case "column": {
      c.fillStyle = "#6c6478"; rrp(c, x + 1, b - 9, 30, 9, 1.5); c.fill(); inkStroke(c, 1);
      const h = 46 - sd * 20;
      c.beginPath(); c.moveTo(x + 7, b - 9); c.lineTo(x + 7, b - 9 - h); c.lineTo(x + 12, b - 13 - h); c.lineTo(x + 17, b - 7 - h); c.lineTo(x + 25, b - 11 - h); c.lineTo(x + 25, b - 9); c.closePath();
      c.fillStyle = lgr(c, x + 7, 0, x + 25, 0, [[0, "#9a92a8"], [0.5, "#bdb4cc"], [1, "#6c6478"]]); c.fill(); inkStroke(c, 1);
      c.strokeStyle = "rgba(60,50,70,0.5)"; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + 11 + i * 5, b - 9); c.lineTo(x + 11 + i * 5, b - 7 - h); c.stroke(); }
      break;
    }
    case "deadtree": {
      c.strokeStyle = "#2a2133"; c.lineCap = "round";
      const br = (x0, y0, a, l, w) => { if (l < 6) return; const x1 = x0 + Math.sin(a) * l, y1 = y0 - Math.cos(a) * l; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); br(x1, y1, a - 0.5, l * 0.68, w * 0.65); br(x1, y1, a + 0.45, l * 0.62, w * 0.65); };
      br(x + 16, b, 0.05, 34, 5);
      break;
    }
    case "wisplamp": {
      c.fillStyle = "#2a2133"; c.fillRect(x + 14, b - 52, 4, 52);
      c.fillStyle = rgr(c, x + 16, b - 60, 1, 20, [[0, "rgba(190,150,255,0.6)"], [1, "rgba(190,150,255,0)"]]); c.beginPath(); c.arc(x + 16, b - 60, 20, 0, 7); c.fill();
      c.fillStyle = `rgba(220,190,255,${0.7 + Math.sin(t / 8 + sd * 9) * 0.25})`; c.beginPath(); c.ellipse(x + 16, b - 60 + Math.sin(t / 10) * 1.5, 4.5, 8, 0, 0, 7); c.fill();
      break;
    }
  }
  c.restore();
};

// =====================================================================
//  LEVEL 2 ART — Germany, 1517–1521
// =====================================================================
Object.assign(TILE_PAINT, {
  g0Body(c, r, v) {          // grey sandstone of a north German town
    c.fillStyle = "#5c5d57"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 2; row++) {
      const start = -((v * 9 + row * 10) % 20);
      for (let bx = start; bx < 32; bx += 20) {
        c.fillStyle = ["#9a9a94", "#8f908a", "#a5a49c", "#86877f"][Math.floor(r() * 4)]; c.fillRect(bx + 1, row * 16 + 1, 18, 14);
        c.fillStyle = "rgba(255,255,250,0.22)"; c.fillRect(bx + 1, row * 16 + 1, 18, 1.4);
        c.fillStyle = "rgba(20,20,20,0.28)"; c.fillRect(bx + 1, row * 16 + 13.6, 18, 1.4);
        speck(c, r, bx + 2, row * 16 + 2, 16, 11, 10, ["rgba(60,60,55,0.5)", "rgba(220,220,210,0.45)"]);
      }
    }
  },
  g0Top(c, r, v) {
    TILE_PAINT.g0Body(c, r, v);
    c.fillStyle = "#33342f"; c.fillRect(0, -1, 32, 14);
    for (let row = 0; row < 2; row++) for (let i = -1; i < 5; i++) {
      const x = i * 8 + (row ? 4 : 0), y = row * 6;
      rrp(c, x + 0.6, y + 0.2, 6.8, 5.4, 1.2);
      c.fillStyle = lgr(c, x, y, x + 7, y + 6, [[0, "#c2c3bc"], [1, "#6f716a"]]); c.fill();
      c.strokeStyle = "rgba(20,20,20,0.4)"; c.lineWidth = 0.5; c.stroke();
    }
    c.fillStyle = lgr(c, 0, 12, 0, 16, [[0, "#b6b7ae"], [1, "#8a8b83"]]); c.fillRect(0, 12, 32, 4);
    c.fillStyle = "rgba(20,20,20,0.45)"; c.fillRect(0, 16, 32, 1.5);
    if (v === 2) { c.fillStyle = "#b8742a"; c.save(); c.translate(20, 3); c.rotate(0.6); c.beginPath(); c.ellipse(0, 0, 3, 1.6, 0, 0, 7); c.fill(); c.restore(); }
  },
  g1Body(c, r, v) {          // workshop: stone foundation
    c.fillStyle = "#3e352d"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 3; row++) for (let i = -1; i < 3; i++) {
      const x = i * 14 + (row % 2) * 7, y = row * 11;
      c.fillStyle = ["#5d5246", "#54493e", "#665a4c"][Math.floor(r() * 3)]; rrp(c, x + 0.5, y + 0.5, 13, 10, 2); c.fill();
    }
  },
  g1Top(c, r, v) {           // oak floorboards on a beam
    TILE_PAINT.g1Body(c, r, v);
    c.fillStyle = lgr(c, 0, 0, 0, 10, [[0, "#b07a42"], [1, "#7a4c26"]]); c.fillRect(0, 0, 32, 10);
    c.strokeStyle = "rgba(60,30,10,0.35)"; c.lineWidth = 0.6;
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(0, 2.5 + k * 2.6); c.bezierCurveTo(12, 2 + k * 2.6 + r(), 22, 3 + k * 2.6 - r(), 32, 2.5 + k * 2.6); c.stroke(); }
    c.fillStyle = "#3b2414"; c.fillRect((v * 11) % 32, 0, 1, 10);
    c.fillStyle = "#2b2b2b"; c.fillRect(((v * 11) % 32) + 3, 4, 1.4, 1.4);
    c.fillStyle = "#3b2414"; c.fillRect(0, 10, 32, 4);
    c.fillStyle = "rgba(0,0,0,0.3)"; c.fillRect(0, 14, 32, 2);
    if (v === 3) { c.fillStyle = "rgba(20,20,40,0.55)"; c.beginPath(); c.ellipse(12, 5, 5, 2, 0, 0, 7); c.fill(); }
  },
  g2Body(c, r, v) {          // forest loam with roots and stones
    c.fillStyle = lgr(c, 0, 0, 0, 32, [[0, "#4d3c29"], [1, "#2f2418"]]); c.fillRect(0, 0, 32, 32);
    c.strokeStyle = "rgba(110,80,50,0.5)"; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(r() * 10, 0); c.bezierCurveTo(8, 10, 18, 12, 14 + r() * 10, 32); c.stroke();
    for (let k = 0; k < 2; k++) { const px = 4 + r() * 24, py = 8 + r() * 20; c.fillStyle = rgr(c, px - 1, py - 1, 0.5, 5, [[0, "#9a948a"], [1, "#55524c"]]); c.beginPath(); c.ellipse(px, py, 3.5, 2.6, 0, 0, 7); c.fill(); }
    speck(c, r, 0, 0, 32, 32, 14, ["rgba(20,14,8,0.5)", "rgba(140,110,70,0.35)"]);
  },
  g2Top(c, r, v) {
    TILE_PAINT.g2Body(c, r, v);
    c.beginPath(); c.moveTo(0, -1);
    for (let x = 0; x <= 32; x += 4) c.lineTo(x, 8 + Math.sin(x * 0.6 + v) * 1.8 + r() * 1.5);
    c.lineTo(32, -1); c.closePath();
    c.fillStyle = lgr(c, 0, 0, 0, 10, [[0, "#6f8a42"], [1, "#3d5a28"]]); c.fill();
    c.strokeStyle = "rgba(150,100,50,0.7)"; c.lineWidth = 0.7;
    for (let i = 0; i < 10; i++) { const x = r() * 32, y = 1 + r() * 5, a = r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 3, y + Math.sin(a) * 1.5); c.stroke(); }
    if (v === 1) { c.strokeStyle = "#5f8a3a"; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(14, 4); c.quadraticCurveTo(14 + (k - 1.5) * 4, -4, 14 + (k - 1.5) * 7, -8 + Math.abs(k - 1.5) * 2); c.stroke(); } }
    if (v === 3) {
      c.fillStyle = "#efe6d0"; c.fillRect(21, -3, 2.4, 6);
      c.fillStyle = "#c0392b"; c.beginPath(); c.ellipse(22.2, -3.5, 4.5, 2.6, 0, Math.PI, 0); c.fill();
      c.fillStyle = "#fff"; c.fillRect(20, -5, 1, 1); c.fillRect(23.5, -4.6, 1, 1);
    }
  },
  g3Body(c, r, v) {          // red sandstone of Worms, by night
    c.fillStyle = "#3e2622"; c.fillRect(0, 0, 32, 32);
    for (let row = 0; row < 2; row++) {
      const start = -((v * 7 + row * 12) % 24);
      for (let bx = start; bx < 32; bx += 24) {
        c.fillStyle = ["#7a4a42", "#6e423b", "#86534a", "#734640"][Math.floor(r() * 4)]; c.fillRect(bx + 1, row * 16 + 1, 22, 14);
        c.fillStyle = "rgba(200,190,255,0.12)"; c.fillRect(bx + 1, row * 16 + 1, 22, 1.4);
        speck(c, r, bx + 2, row * 16 + 2, 19, 11, 10, ["rgba(40,20,18,0.5)", "rgba(220,170,150,0.3)"]);
      }
    }
    c.fillStyle = "rgba(20,15,40,0.35)"; c.fillRect(0, 0, 32, 32);
  },
  g3Top(c, r, v) {
    TILE_PAINT.g3Body(c, r, v);
    c.fillStyle = lgr(c, 0, 0, 0, 12, [[0, "#a87a6e"], [1, "#6a443c"]]); c.fillRect(0, 0, 32, 12);
    c.fillStyle = "rgba(210,210,255,0.35)"; c.fillRect(0, 0, 32, 1.5);
    c.fillStyle = "#3e2622"; c.fillRect((v * 13) % 32, 0, 1.2, 12);
  },
  rockCrumble(c, r, v) {
    c.beginPath(); c.moveTo(0, 0); c.lineTo(32, 0); c.lineTo(32, 14); c.lineTo(26, 20); c.lineTo(20, 15); c.lineTo(13, 22); c.lineTo(6, 16); c.lineTo(0, 19); c.closePath();
    c.fillStyle = lgr(c, 0, 0, 0, 22, [[0, "#9b9585"], [1, "#5f5a50"]]); c.fill(); inkStroke(c, 1.1);
    c.fillStyle = "#6f8a42"; c.fillRect(0, 0, 32, 3);
    c.strokeStyle = "#2a2622"; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(9, 2); c.lineTo(13, 9); c.lineTo(11, 15); c.moveTo(23, 3); c.lineTo(20, 10); c.lineTo(24, 14); c.stroke();
  }
});

// ---------------------------------------------------------------- L2 backgrounds
// A post windmill on the north German plain.
function windmill(x, X, base, s, a) {
  x.save(); x.translate(X, base); x.scale(s, s);
  x.fillStyle = "#6e5a46"; x.beginPath(); x.moveTo(-3, 0); x.lineTo(0, -16); x.lineTo(3, 0); x.fill();
  x.fillStyle = "#8a7058"; x.fillRect(-8, -36, 16, 20); x.fillStyle = "#5b4636"; x.beginPath(); x.moveTo(-9, -36); x.lineTo(0, -44); x.lineTo(9, -36); x.fill();
  x.translate(0, -30); x.rotate(a); x.strokeStyle = "#4a3a2c"; x.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -26); x.stroke(); x.fillStyle = "rgba(230,220,200,0.85)"; x.fillRect(0.5, -25, 5, 17); }
  x.restore();
}
Art.paintPlains = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(61), k = n => Math.PI * 2 * n / BG_W;
  const ridge = X => 318 + Math.sin(X * k(2)) * 10 + Math.sin(X * k(9) + 1) * 4;
  x.beginPath(); x.moveTo(0, VH); for (let X = 0; X <= BG_W; X += 8) x.lineTo(X, ridge(X)); x.lineTo(BG_W, VH); x.closePath();
  x.fillStyle = lgr(x, 0, 300, 0, 480, [[0, "#8fa08a"], [1, "#b8b494"]]); x.fill();
  for (let X = 0; X < BG_W; X += 4) { const h = 5 + Math.sin(X * 0.13) * 2 + r() * 3; x.fillStyle = "rgba(70,90,80,0.55)"; x.fillRect(X, ridge(X) - h, 4, h); }
  for (let i = 0; i < 40; i++) {
    const X = r() * BG_W, y0 = ridge(X) + 14 + r() * 50, w = 60 + r() * 120;
    x.fillStyle = ["rgba(200,180,110,0.45)", "rgba(130,150,90,0.45)", "rgba(170,150,100,0.4)"][i % 3];
    x.beginPath(); x.moveTo(X, y0); x.lineTo(X + w, y0 - 3); x.lineTo(X + w + 20, y0 + 10); x.lineTo(X + 10, y0 + 13); x.fill();
  }
  for (let i = 0; i < 9; i++) { const X = 120 + i * 260 + r() * 80; windmill(x, X, ridge(X) + 6, 0.9 + r() * 0.4, r() * 2); }
  for (let i = 0; i < 6; i++) { const X = 60 + i * 400 + r() * 100, by = ridge(X) + 4; x.fillStyle = "#7d7a72"; x.fillRect(X, by - 26, 6, 26); x.beginPath(); x.moveTo(X - 1, by - 26); x.lineTo(X + 3, by - 40); x.lineTo(X + 7, by - 26); x.fill(); x.fillStyle = "#a59a8a"; x.fillRect(X - 14, by - 10, 14, 10); x.fillStyle = "#7a4a3a"; x.fillRect(X - 15, by - 13, 16, 3); }
  return c;
};
// Brick Gothic step gable or a steep tiled roof, for the skyline.
function gableHouse(x, r, X, base, w, h, wall, roof, step) {
  x.fillStyle = wall; x.fillRect(X, base - h, w, h + 100);
  if (step) {
    const n = 4, sw = w / (n * 2);
    x.beginPath(); x.moveTo(X, base - h);
    for (let i = 0; i < n; i++) { x.lineTo(X + i * sw, base - h - (i + 1) * 12); x.lineTo(X + (i + 1) * sw, base - h - (i + 1) * 12); }
    for (let i = n - 1; i >= 0; i--) { x.lineTo(X + w - (i + 1) * sw, base - h - (i + 1) * 12); x.lineTo(X + w - i * sw, base - h - (i + 1) * 12 + 0); }
    x.lineTo(X + w, base - h); x.closePath(); x.fill();
  } else {
    x.fillStyle = roof; x.beginPath(); x.moveTo(X - 3, base - h); x.lineTo(X + w / 2, base - h - w * 0.75); x.lineTo(X + w + 3, base - h); x.fill();
  }
  x.fillStyle = "rgba(40,30,25,0.6)";
  for (let j = 0; j < Math.floor(h / 18); j++) for (let i = 0; i < Math.max(1, Math.floor(w / 12)); i++) if (r() > 0.25) x.fillRect(X + 4 + i * 12, base - h + 8 + j * 18, 4, 7);
}
Art.paintWittenberg = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(71), base = 434;
  for (let X = -40; X < BG_W + 40;) { const w = 30 + r() * 30; gableHouse(x, r, X, base - 26, w, 30 + r() * 30, "#c4bcae", "#8a5a4a", false); X += w - 2; }
  // town church with twin towers
  const S = 700;
  x.fillStyle = "#a9846a"; x.fillRect(S - 110, 300, 180, 140);
  x.fillStyle = "#7a4a3a"; x.beginPath(); x.moveTo(S - 114, 300); x.lineTo(S - 20, 236); x.lineTo(S + 74, 300); x.fill();
  for (const ox of [-160, -122]) {
    x.fillStyle = "#b08c70"; x.fillRect(S + ox, 170, 34, 270);
    x.fillStyle = "rgba(60,30,20,0.2)"; x.fillRect(S + ox + 22, 170, 12, 270);
    x.fillStyle = "#4a3a30"; x.fillRect(S + ox + 12, 200, 10, 22); x.fillRect(S + ox + 12, 250, 10, 22);
    x.fillStyle = "#4f5d58"; x.beginPath(); x.moveTo(S + ox - 2, 170); x.lineTo(S + ox + 17, 110); x.lineTo(S + ox + 36, 170); x.fill();
    x.fillStyle = "#d9a728"; x.beginPath(); x.arc(S + ox + 17, 106, 3, 0, 7); x.fill();
  }
  for (let i = 0; i < 4; i++) { x.fillStyle = "#4a3a30"; x.beginPath(); x.moveTo(S - 96 + i * 42, 420); x.lineTo(S - 96 + i * 42, 330); x.arc(S - 86 + i * 42, 330, 10, Math.PI, 0); x.lineTo(S - 76 + i * 42, 420); x.fill(); }
  // castle with round tower and the castle church
  const K = 1560;
  x.fillStyle = "#b7a68e"; x.fillRect(K - 160, 300, 260, 140);
  x.fillStyle = "#7a4a3a"; x.beginPath(); x.moveTo(K - 164, 300); x.lineTo(K - 140, 262); x.lineTo(K + 80, 262); x.lineTo(K + 104, 300); x.fill();
  for (let i = 0; i < 9; i++) { x.fillStyle = "#4a3a30"; x.fillRect(K - 148 + i * 27, 320, 8, 14); x.fillRect(K - 148 + i * 27, 360, 8, 14); }
  x.fillStyle = "#c2b39a"; x.fillRect(K + 96, 150, 46, 290);
  x.fillStyle = "rgba(60,30,20,0.2)"; x.fillRect(K + 126, 150, 16, 290);
  x.fillStyle = "#4f5d58"; x.beginPath(); x.moveTo(K + 92, 150); x.quadraticCurveTo(K + 119, 96, K + 146, 150); x.fill();
  x.fillStyle = "#4f5d58"; x.fillRect(K + 116, 84, 6, 24); x.fillStyle = "#d9a728"; x.beginPath(); x.arc(K + 119, 82, 3, 0, 7); x.fill();
  for (let j = 0; j < 4; j++) { x.fillStyle = "#4a3a30"; x.fillRect(K + 112, 176 + j * 50, 14, 24); }
  for (const tx of [K - 170, K + 80]) { x.fillStyle = "#c2b39a"; x.fillRect(tx, 250, 30, 190); x.fillStyle = "#7a4a3a"; x.beginPath(); x.moveTo(tx - 4, 250); x.lineTo(tx + 15, 214); x.lineTo(tx + 34, 250); x.fill(); }
  // city wall and gate
  x.fillStyle = "#9a8a76"; x.fillRect(0, 404, BG_W, 40);
  for (let i = 0; i < BG_W / 14; i++) x.fillRect(i * 14, 396, 8, 9);
  x.fillStyle = "#a99780"; x.fillRect(1100, 330, 50, 114); x.fillStyle = "#7a4a3a"; x.beginPath(); x.moveTo(1096, 330); x.lineTo(1125, 290); x.lineTo(1154, 330); x.fill();
  x.fillStyle = "#3b2a1e"; x.beginPath(); x.moveTo(1112, 444); x.lineTo(1112, 404); x.arc(1125, 404, 13, Math.PI, 0); x.lineTo(1138, 444); x.fill();
  for (let X = -20; X < BG_W + 20;) { const w = 34 + r() * 40; if (!(X > S - 180 && X < S + 90) && !(X > K - 180 && X < K + 150)) gableHouse(x, r, X, base + 8, w, 40 + r() * 40, ["#d8cdb8", "#c9b79c", "#b89a80", "#a8704e"][Math.floor(r() * 4)], "#7a3a2a", r() > 0.65); X += w + 2; }
  x.fillStyle = "#8d8676"; x.fillRect(0, base + 6, BG_W, VH - base);
  x.fillStyle = "rgba(200,205,210,0.22)"; x.fillRect(0, 0, BG_W, VH);
  return c;
};
// A chimney that rises out of a gable roof: drawn first, so the roof covers its base.
// (cx, top) is the roof's center at the eaves, hw its half-width, peak its height.
function roofChimney(x, cx, top, hw, peak, at, col) {
  const roofY = top - peak * Math.max(0, 1 - Math.abs(at - cx) / hw);
  const w = 12, y0 = roofY - 18;
  x.fillStyle = col; x.fillRect(at - w / 2, y0, w, top - y0);
  x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(at + w / 2 - 4, y0, 4, top - y0);
  x.fillStyle = "#4a3a30"; x.fillRect(at - w / 2 - 2, y0 - 4, w + 4, 5);
}
// A cobbled street for the bottom of a background layer, so nothing floats above a gap.
function cobbles(x, r, W, top) {
  x.fillStyle = "#6a655a"; x.fillRect(0, top - 2, W, VH - top + 2);
  for (let y = top + 4; y < VH; y += 11) for (let X = (y % 22 ? 0 : 9) - 9; X < W; X += 18 + r() * 4) {
    x.fillStyle = ["#857f72", "#7a7468", "#8f897b"][Math.floor(r() * 3)];
    x.beginPath(); x.ellipse(X + 8, y + 4, 8, 4, 0, 0, 7); x.fill();
  }
  x.fillStyle = "rgba(30,25,20,0.25)"; x.fillRect(0, top - 2, W, 3);
}
// A half-timbered (Fachwerk) house for the near street.
function fachwerk(x, r, X, base, w, h) {
  const plaster = ["#efe6d2", "#e8dcc0", "#f0e2d6", "#e6d8a8"][Math.floor(r() * 4)], timber = r() > 0.5 ? "#4a2e1c" : "#6e2a1e";
  const floors = Math.max(2, Math.floor(h / 62)), fh = h / floors;
  for (let f = 0; f < floors; f++) {
    const jet = f * 5, fx = X - jet, fw = w + jet * 2, fy = base - (f + 1) * fh;
    x.fillStyle = plaster; x.fillRect(fx, fy, fw, fh);
    blobs(x, r, fx, fy, fw, fh, 3, "rgba(190,170,130,0.25)", 6, 16);
    x.fillStyle = timber;
    x.fillRect(fx, fy + fh - 6, fw, 6); x.fillRect(fx, fy, fw, 4);
    const posts = Math.max(3, Math.round(fw / 28));
    for (let i = 0; i <= posts; i++) x.fillRect(fx + i * (fw - 5) / posts, fy, 5, fh);
    for (let i = 0; i < posts; i++) {
      const px = fx + i * (fw - 5) / posts + 5, pw = (fw - 5) / posts - 5;
      x.strokeStyle = timber; x.lineWidth = 4;
      if ((i + f) % 3 === 0) { x.beginPath(); x.moveTo(px, fy + fh - 6); x.lineTo(px + pw, fy + 4); x.moveTo(px, fy + 4); x.lineTo(px + pw, fy + fh - 6); x.stroke(); }
      else if ((i + f) % 3 === 1 && f > 0) {
        x.fillStyle = "#3a3a44"; x.fillRect(px + pw * 0.2, fy + fh * 0.25, pw * 0.6, fh * 0.45);
        x.strokeStyle = "rgba(200,190,150,0.5)"; x.lineWidth = 0.6;
        for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(px + pw * 0.2, fy + fh * 0.25 + k * fh * 0.11); x.lineTo(px + pw * 0.8, fy + fh * 0.25 + k * fh * 0.11 - 4); x.stroke(); }
        x.fillStyle = "rgba(255,220,140,0.18)"; x.fillRect(px + pw * 0.22, fy + fh * 0.27, pw * 0.25, fh * 0.4);
      } else { x.beginPath(); x.moveTo(px, fy + fh * 0.5); x.lineTo(px + pw, fy + fh * 0.5); x.stroke(); }
    }
    x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(fx, fy + fh - 1, fw, 4);
  }
  const top = base - h, rw = w + floors * 10;
  if (r() > 0.4) roofChimney(x, X + w / 2, top, w / 2 + floors * 5 + 6, rw * 0.7, X + w * 0.74, "#8a5a44");
  x.fillStyle = "#6e3a2a"; x.beginPath(); x.moveTo(X - floors * 5 - 6, top); x.lineTo(X + w / 2, top - rw * 0.7); x.lineTo(X + w + floors * 5 + 6, top); x.closePath(); x.fill();
  x.strokeStyle = "rgba(40,15,10,0.4)"; x.lineWidth = 1; for (let k = 1; k < 7; k++) { const yy = top - k * rw * 0.1; const half = (rw / 2 + 6) * (1 - k / 7); x.beginPath(); x.moveTo(X + w / 2 - half, yy); x.lineTo(X + w / 2 + half, yy); x.stroke(); }
  x.fillStyle = "#3b2414"; x.beginPath(); x.moveTo(X + w / 2 - 12, base); x.lineTo(X + w / 2 - 12, base - 34); x.arc(X + w / 2, base - 34, 12, Math.PI, 0); x.lineTo(X + w / 2 + 12, base); x.fill();
}
Art.paintFachwerk = function () {
  const [c, x] = this.mk(1800, VH), r = mulberry(81), base = 484;
  cobbles(x, mulberry(82), 1800, base);
  for (let X = 10; X < 1790;) {
    const w = 110 + r() * 70, h = 130 + r() * 90;
    if (X + w > 1790) break;
    fachwerk(x, r, X, base, w, h);
    x.fillStyle = "#7d776a"; x.fillRect(X - 10, base - 8, w + 20, 10);   // stone footing
    x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(X - 10, base, w + 20, 2);
    X += w + 22 + r() * 30;
  }
  x.fillStyle = "rgba(60,55,50,0.14)"; x.fillRect(0, 0, 1800, VH);
  return c;
};
Art.paintWorkshopBack = function () {
  const [c, x] = this.mk(2000, VH), r = mulberry(91);
  x.fillStyle = lgr(x, 0, 0, 0, VH, [[0, "#3a2c20"], [0.5, "#6b5642"], [1, "#4a3a2c"]]); x.fillRect(0, 0, 2000, VH);
  for (let X = 0; X < 2000; X += 120) {
    x.fillStyle = "#d9c9a6"; x.fillRect(X + 6, 70, 108, 380);
    blobs(x, r, X + 6, 70, 108, 380, 4, "rgba(150,120,80,0.25)", 10, 30);
    x.fillStyle = "#3b2414"; x.fillRect(X, 60, 12, 420); x.fillRect(X, 250, 120, 9);
    x.strokeStyle = "#3b2414"; x.lineWidth = 6; x.beginPath(); x.moveTo(X + 10, 250); x.lineTo(X + 60, 70); x.stroke();
  }
  x.fillStyle = "#2b1d14"; x.fillRect(0, 40, 2000, 30);
  for (let X = 0; X < 2000; X += 60) { x.fillStyle = "#3b2414"; x.fillRect(X, 0, 18, 70); x.fillStyle = "rgba(255,220,170,0.08)"; x.fillRect(X, 0, 4, 70); }
  // leaded windows with slanting light
  for (let X = 140; X < 2000; X += 480) {
    x.fillStyle = "#3b2414"; x.fillRect(X - 6, 100, 92, 132);
    x.fillStyle = lgr(x, 0, 104, 0, 228, [[0, "#cfe0e8"], [1, "#e8dcc0"]]); x.fillRect(X, 106, 80, 120);
    x.strokeStyle = "rgba(60,50,40,0.6)"; x.lineWidth = 0.8;
    for (let i = -8; i < 16; i++) { x.beginPath(); x.moveTo(X + i * 10, 106); x.lineTo(X + i * 10 + 120, 226); x.stroke(); x.beginPath(); x.moveTo(X + i * 10 + 120, 106); x.lineTo(X + i * 10, 226); x.stroke(); }
    x.fillStyle = "#3b2414"; x.fillRect(X + 38, 106, 4, 120); x.fillRect(X, 164, 80, 4);
    x.save(); x.globalCompositeOperation = "lighter";
    x.fillStyle = "rgba(255,230,180,0.08)"; x.beginPath(); x.moveTo(X, 106); x.lineTo(X + 80, 106); x.lineTo(X + 260, 480); x.lineTo(X + 140, 480); x.fill();
    x.restore();
  }
  // shelves of type cases and posted pamphlets
  for (let X = 380; X < 2000; X += 480) {
    x.fillStyle = "#5b3a1e"; x.fillRect(X, 270, 150, 180);
    for (let j = 0; j < 6; j++) { x.fillStyle = "#3b2414"; x.fillRect(X + 4, 276 + j * 29, 142, 24); for (let i = 0; i < 10; i++) { x.fillStyle = "rgba(160,150,140,0.5)"; x.fillRect(X + 7 + i * 14, 280 + j * 29, 11, 16); } }
  }
  for (let i = 0; i < 16; i++) {
    const X = 40 + i * 125 + r() * 30, Y = 120 + r() * 90, rot = (r() - 0.5) * 0.2;
    x.save(); x.translate(X, Y); x.rotate(rot);
    x.fillStyle = "#efe4c8"; x.fillRect(0, 0, 34, 46); x.strokeStyle = "rgba(60,40,25,0.6)"; x.lineWidth = 0.8; x.strokeRect(0, 0, 34, 46);
    x.fillStyle = "rgba(40,30,20,0.75)"; x.fillRect(5, 4, 24, 4); x.fillRect(8, 12, 18, 14);
    for (let k = 0; k < 4; k++) x.fillRect(5, 30 + k * 4, k === 3 ? 14 : 24, 1.4);
    x.fillStyle = "#6e4523"; x.beginPath(); x.arc(17, 2, 1.5, 0, 7); x.fill();
    x.restore();
  }
  return c;
};
Art.paintWorkshopFront = function () {
  const [c, x] = this.mk(1600, VH), r = mulberry(92);
  // drying lines of freshly printed sheets
  for (let L = 0; L < 3; L++) {
    const y0 = 80 + L * 40, X0 = L * 220;
    x.strokeStyle = "#2b1d14"; x.lineWidth = 1; x.beginPath(); x.moveTo(X0, y0); x.quadraticCurveTo(X0 + 800, y0 + 30, X0 + 1600, y0); x.stroke();
    for (let i = 0; i < 18; i++) {
      const sx = X0 + 30 + i * 85 + r() * 20, sy = y0 + 12 * Math.sin((i / 18) * Math.PI) + 2;
      x.fillStyle = "#f4ead2"; x.fillRect(sx, sy, 26, 34); x.strokeStyle = "rgba(60,40,25,0.5)"; x.strokeRect(sx, sy, 26, 34);
      x.fillStyle = "rgba(40,30,20,0.7)"; x.fillRect(sx + 4, sy + 4, 18, 3); for (let k = 0; k < 5; k++) x.fillRect(sx + 4, sy + 10 + k * 4, 18, 1.2);
      x.fillStyle = "#6e4523"; x.fillRect(sx + 10, sy - 2, 5, 4);
    }
  }
  // big wooden presses
  for (let X = 160; X < 1600; X += 520) {
    x.fillStyle = "#4a2e17";
    x.fillRect(X, 250, 16, 230); x.fillRect(X + 110, 250, 16, 230); x.fillRect(X - 6, 240, 138, 18); x.fillRect(X - 6, 330, 138, 14);
    x.fillStyle = "#6e4523"; x.fillRect(X + 4, 250, 4, 230); x.fillRect(X + 114, 250, 4, 230);
    x.fillStyle = "#8a6a3a"; x.fillRect(X + 56, 258, 14, 60);
    x.strokeStyle = "#4a2e17"; x.lineWidth = 2; for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(X + 56, 262 + k * 8); x.lineTo(X + 70, 266 + k * 8); x.stroke(); }
    x.fillStyle = "#3b2414"; x.fillRect(X + 63, 296, 70, 6);
    x.fillStyle = "#5b3a1e"; x.fillRect(X + 20, 318, 86, 12);
    x.fillStyle = "#3b2414"; x.fillRect(X - 20, 380, 166, 16);
    x.fillStyle = "#e8dcc0"; x.fillRect(X + 160, 410, 50, 30); x.fillRect(X + 165, 380, 44, 30); x.fillStyle = "rgba(90,70,40,0.4)"; x.fillRect(X + 160, 424, 50, 2); x.fillRect(X + 165, 394, 44, 2);
  }
  x.fillStyle = "rgba(30,18,10,0.25)"; x.fillRect(0, 0, 1600, VH);
  return c;
};
Art.paintRhine = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(101), k = n => Math.PI * 2 * n / BG_W;
  const far = X => 250 + Math.sin(X * k(3)) * 30 + Math.sin(X * k(11)) * 10;
  x.beginPath(); x.moveTo(0, VH); for (let X = 0; X <= BG_W; X += 8) x.lineTo(X, far(X)); x.lineTo(BG_W, VH); x.closePath();
  x.fillStyle = lgr(x, 0, 220, 0, 420, [[0, "#9a7e9a"], [1, "#c9a8a0"]]); x.fill();
  const slope = X => 300 + Math.sin(X * k(5) + 1) * 40 + Math.sin(X * k(13)) * 12;
  x.beginPath(); x.moveTo(0, VH); for (let X = 0; X <= BG_W; X += 8) x.lineTo(X, slope(X)); x.lineTo(BG_W, VH); x.closePath();
  x.fillStyle = lgr(x, 0, 260, 0, 440, [[0, "#6f7a52"], [1, "#4f5a3c"]]); x.fill();
  x.save(); x.clip();
  x.strokeStyle = "rgba(160,170,110,0.35)"; x.lineWidth = 1.2;
  for (let X = 0; X < BG_W; X += 160) for (let i = 0; i < 9; i++) { const y0 = slope(X) + 12 + i * 8; x.beginPath(); x.moveTo(X, y0); x.lineTo(X + 110, y0 + 10); x.stroke(); }
  x.restore();
  // castles on the heights
  for (let i = 0; i < 4; i++) {
    const X = 260 + i * 600 + r() * 100, by = slope(X) + 4;
    x.fillStyle = "#b9a58e"; x.fillRect(X - 30, by - 30, 70, 30); x.fillRect(X - 6, by - 66, 22, 40);
    for (let m = 0; m < 6; m++) x.fillRect(X - 30 + m * 12, by - 36, 7, 7);
    for (let m = 0; m < 3; m++) x.fillRect(X - 6 + m * 8, by - 72, 5, 7);
    x.fillStyle = "#3e3228"; x.fillRect(X + 2, by - 56, 4, 8); x.fillRect(X - 20, by - 22, 4, 8); x.fillRect(X + 24, by - 22, 4, 8);
    x.fillStyle = "rgba(60,30,40,0.25)"; x.fillRect(X + 8, by - 66, 8, 66);
  }
  // the river with reflections and a riverside village
  x.fillStyle = lgr(x, 0, 404, 0, 470, [[0, "#d9b0a0"], [1, "#7a8a8a"]]); x.fillRect(0, 404, BG_W, 70);
  x.fillStyle = "rgba(255,240,220,0.4)"; for (let X = 0; X < BG_W; X += 30) x.fillRect(X + r() * 10, 412 + r() * 40, 14, 1.4);
  for (let i = 0; i < 5; i++) {
    const X = 100 + i * 480;
    for (let j = 0; j < 5; j++) { const hx = X + j * 22; x.fillStyle = ["#e8dcc0", "#d9c3a0", "#c9a888"][j % 3]; x.fillRect(hx, 380, 20, 26); x.fillStyle = "#6e3a2a"; x.beginPath(); x.moveTo(hx - 2, 380); x.lineTo(hx + 10, 366); x.lineTo(hx + 22, 380); x.fill(); }
    x.fillStyle = "#e8dcc0"; x.fillRect(X + 116, 340, 12, 66); x.fillStyle = "#4f5d58"; x.beginPath(); x.moveTo(X + 114, 340); x.lineTo(X + 122, 312); x.lineTo(X + 130, 340); x.fill();
  }
  x.fillStyle = "rgba(240,200,180,0.18)"; x.fillRect(0, 0, BG_W, VH);
  return c;
};
// A layered fir tree.
function fir(x, X, base, h, col) {
  x.fillStyle = "#4a3324"; x.fillRect(X - 2, base - h * 0.15, 4, h * 0.15);
  for (let i = 0; i < 5; i++) {
    const y0 = base - h * 0.12 - i * h * 0.17, w = (5 - i) * h * 0.07 + 4;
    x.fillStyle = col; x.beginPath(); x.moveTo(X - w, y0); x.lineTo(X, y0 - h * 0.3); x.lineTo(X + w, y0); x.closePath(); x.fill();
    x.fillStyle = "rgba(255,255,220,0.08)"; x.beginPath(); x.moveTo(X - w * 0.2, y0 - 2); x.lineTo(X, y0 - h * 0.28); x.lineTo(X - w * 0.9, y0 - 1); x.fill();
  }
}
Art.paintForest = function () {
  const [c, x] = this.mk(1800, VH), r = mulberry(111);
  for (let i = 0; i < 70; i++) { const X = r() * 1800; fir(x, X, 470 + r() * 10, 90 + r() * 90, ["#2f4a32", "#3a5638", "#28402c"][i % 3]); }
  for (let i = 0; i < 10; i++) { const X = r() * 1800; x.fillStyle = "#e8e4d8"; x.fillRect(X, 330, 4, 150); x.fillStyle = "#2b2b2b"; for (let k = 0; k < 6; k++) x.fillRect(X, 340 + k * 22, 4, 2); x.fillStyle = "rgba(150,170,80,0.7)"; x.beginPath(); x.arc(X + 2, 330, 20, 0, 7); x.fill(); }
  x.fillStyle = "rgba(255,190,160,0.12)"; x.fillRect(0, 0, 1800, VH);
  return c;
};
Art.paintWorms = function () {
  const [c, x] = this.mk(BG_W, VH), r = mulberry(121), base = 436;
  // Worms Cathedral: long nave, two pairs of round towers, two domed crossing towers
  const D = 1000;
  x.fillStyle = "#4a3040"; x.fillRect(D - 230, 290, 460, 150);
  x.fillStyle = "#3a2434"; x.beginPath(); x.moveTo(D - 234, 290); x.lineTo(D, 250); x.lineTo(D + 234, 290); x.fill();
  for (const tx of [D - 250, D - 170, D + 150, D + 230]) {
    x.fillStyle = "#523548"; x.fillRect(tx, 180, 34, 260);
    x.fillStyle = "#2e1e2a"; x.beginPath(); x.moveTo(tx - 3, 180); x.lineTo(tx + 17, 116); x.lineTo(tx + 37, 180); x.fill();
    for (let j = 0; j < 4; j++) { x.fillStyle = "rgba(255,200,120,0.55)"; x.fillRect(tx + 13, 200 + j * 50, 8, 14); }
  }
  for (const dx of [D - 105, D + 75]) {
    x.fillStyle = "#523548"; x.fillRect(dx - 30, 220, 60, 72);
    x.fillStyle = "#2e1e2a"; x.beginPath(); x.moveTo(dx - 34, 222); x.quadraticCurveTo(dx, 170, dx + 34, 222); x.fill();
    for (let i = 0; i < 4; i++) { x.fillStyle = "rgba(255,200,120,0.45)"; x.beginPath(); x.arc(dx - 18 + i * 12, 250, 3.5, 0, 7); x.fill(); }
  }
  x.fillStyle = "rgba(255,200,120,0.5)"; x.beginPath(); x.arc(D, 330, 18, 0, 7); x.fill();
  x.strokeStyle = "#3a2434"; x.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(D, 330); x.lineTo(D + Math.cos(a) * 18, 330 + Math.sin(a) * 18); x.stroke(); }
  // moonlit rim on the cathedral
  x.fillStyle = "rgba(200,200,255,0.18)"; x.fillRect(D - 230, 290, 6, 150);
  // houses with lit windows, and banners of the imperial diet
  for (let X = -20; X < BG_W + 20;) {
    const w = 40 + r() * 50, h = 60 + r() * 70;
    if (!(X > D - 270 && X < D + 270)) {
      x.fillStyle = ["#3a2a3a", "#33263a", "#40303c"][Math.floor(r() * 3)]; x.fillRect(X, base - h, w, h + 100);
      x.fillStyle = "#24182a"; x.beginPath(); x.moveTo(X - 3, base - h); x.lineTo(X + w / 2, base - h - w * 0.6); x.lineTo(X + w + 3, base - h); x.fill();
      for (let j = 0; j < Math.floor(h / 22); j++) for (let i = 0; i < Math.floor(w / 14); i++) if (r() > 0.55) { x.fillStyle = `rgba(255,${190 + Math.floor(r() * 40)},110,${0.5 + r() * 0.4})`; x.fillRect(X + 5 + i * 14, base - h + 10 + j * 22, 5, 8); }
    }
    X += w + 4;
  }
  for (let i = 0; i < 6; i++) {
    const X = 150 + i * 400; x.fillStyle = "#2a1e24"; x.fillRect(X, 320, 4, 120);
    x.fillStyle = "#c9a227"; x.fillRect(X + 4, 324, 30, 40); eagle(x, X + 19, 344, 0.55, "#1e1a18");
  }
  x.fillStyle = "rgba(40,40,90,0.2)"; x.fillRect(0, 0, BG_W, VH);
  return c;
};

// ---------------------------------------------------------------- L2 actors
Art.blot = function (e, t, px) {
  const c = ctx, cx = e.x + e.w / 2, by = e.y + e.h;
  if (!e.alive) { if (e.dead > 30) return; c.globalAlpha = 1 - e.dead / 30; c.fillStyle = "#14141e"; c.beginPath(); c.ellipse(cx, by - 2, 20 + e.dead * 0.6, 4, 0, 0, 7); c.fill(); c.globalAlpha = 1; return; }
  const sq = e.onGround ? 1 + Math.sin(t / 6 + e.x) * 0.06 : 0.86;
  Art.shadow(cx, by, 15);
  c.save(); c.translate(cx, by); c.scale(1 / sq, sq);
  c.beginPath();
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI + (i / 20) * Math.PI, wob = 1 + Math.sin(t / 5 + i * 1.7) * 0.05 + (i % 3 === 0 ? 0.1 : 0);
    c.lineTo(Math.cos(a) * 19 * wob, -2 + Math.sin(a) * 24 * wob);
  }
  c.lineTo(19, 0); c.quadraticCurveTo(0, 3, -19, 0); c.closePath();
  c.fillStyle = rgr(c, -5, -18, 1, 26, [[0, "#3a3a58"], [0.6, "#16162a"], [1, "#0a0a14"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "rgba(160,170,255,0.35)"; c.beginPath(); c.ellipse(-7, -17, 5, 2.6, -0.5, 0, 7); c.fill();
  for (const dx of [-14, 10]) { c.fillStyle = "#0a0a14"; c.beginPath(); c.ellipse(dx, 1 + Math.abs(Math.sin(t / 9 + dx)) * 3, 2.2, 3.4, 0, 0, 7); c.fill(); }
  const look = clamp((px - cx) / 80, -1, 1) * 2.5;
  for (const s of [-1, 1]) {
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(s * 6.5 + look, -12, 4.2, 5, 0, 0, 7); c.fill();
    c.fillStyle = "#16162a"; c.beginPath(); c.arc(s * 6.5 + look * 1.4, -11, 2.1, 0, 7); c.fill();
  }
  c.restore();
};
Art.raven = function (e, t) {
  const c = ctx;
  if (!e.alive) { if (e.dead > 30) return; c.globalAlpha = 1 - e.dead / 30; for (let i = 0; i < 6; i++) { c.fillStyle = "#1e1e26"; c.fillRect(e.x + 6 + i * 4, e.y + 10 + Math.sin(i + e.dead / 5) * 6 + e.dead, 4, 1.6); } c.globalAlpha = 1; return; }
  const dir = e.vx > 0 ? 1 : -1, diving = e.dive > 0, wing = diving ? -0.9 : Math.sin(t / 4) * 1;
  c.save(); c.translate(e.x + 18, e.y + 12); c.scale(dir, 1); if (diving) c.rotate(0.4);
  c.fillStyle = "#1a1a22"; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-22, -3); c.lineTo(-22, 2); c.lineTo(-19, 5); c.closePath(); c.fill(); inkStroke(c, 0.9);
  c.beginPath(); c.ellipse(0, 1, 13, 7.5, 0, 0, 7);
  c.fillStyle = lgr(c, 0, -6, 0, 8, [[0, "#3a3a50"], [1, "#121218"]]); c.fill(); inkStroke(c, 1.1);
  c.fillStyle = "#1e1e28"; c.beginPath(); c.arc(12, -5, 5, 0, 7); c.fill(); inkStroke(c, 1);
  c.fillStyle = "#6a6a74"; c.beginPath(); c.moveTo(16, -6.5); c.lineTo(23, -4); c.lineTo(16, -2.4); c.closePath(); c.fill(); inkStroke(c, 0.7);
  c.fillStyle = "#fff"; c.beginPath(); c.arc(13.6, -6.2, 1.3, 0, 7); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(13.9, -6.2, 0.8, 0, 7); c.fill();
  c.save(); c.translate(-1, -2); c.rotate(-wing);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -16, -19, -12); c.lineTo(-17, -8); c.lineTo(-20, -6); c.lineTo(-15, -4); c.lineTo(-17, -1); c.quadraticCurveTo(-6, 2, 0, 0);
  c.fillStyle = lgr(c, 0, 0, -19, -12, [[0, "#30304a"], [1, "#0e0e14"]]); c.fill(); inkStroke(c, 1);
  c.strokeStyle = "rgba(120,140,220,0.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -4); c.quadraticCurveTo(-9, -10, -15, -9); c.stroke();
  c.restore();
  c.restore();
};
Art.conveyor = function (x, y, dir, t) {
  const c = ctx;
  c.fillStyle = "#3b2414"; c.fillRect(x, y + 14, 32, 18);
  c.fillStyle = "#2a2622"; c.fillRect(x, y, 32, 14);
  c.save(); c.beginPath(); c.rect(x, y, 32, 12); c.clip();
  const off = ((t * 1.6 * dir) % 16 + 16) % 16;
  c.strokeStyle = "rgba(200,190,170,0.55)"; c.lineWidth = 2;
  for (let i = -2; i < 4; i++) { const cx = x + i * 16 + off; c.beginPath(); c.moveTo(cx - 3 * dir, y + 3); c.lineTo(cx + 3 * dir, y + 6); c.lineTo(cx - 3 * dir, y + 9); c.stroke(); }
  c.restore();
  for (const rx of [x + 8, x + 24]) { c.fillStyle = "#6a6a72"; c.beginPath(); c.arc(rx, y + 20, 5, 0, 7); c.fill(); inkStroke(c, 0.8); c.strokeStyle = "#3a3a42"; c.beginPath(); c.moveTo(rx, y + 20); c.lineTo(rx + Math.cos(t / 6 * dir) * 4, y + 20 + Math.sin(t / 6 * dir) * 4); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, 31, 13);
};
Art.pressPlat = function (m, t) {
  const c = ctx, x = m.x, y = m.y;
  c.fillStyle = "#4a2e17"; c.fillRect(x - 10, -10, 10, m.y1 + 40); c.fillRect(x + m.w, -10, 10, m.y1 + 40);
  c.fillStyle = "#3b2414"; c.fillRect(x - 14, 40, m.w + 28, 18);
  c.fillStyle = "#8a6a3a"; c.fillRect(x + m.w / 2 - 8, 58, 16, Math.max(0, y - 58));
  c.strokeStyle = "#4a2e17"; c.lineWidth = 2;
  for (let k = 58; k < y - 4; k += 8) { const ph = (k + t * 2) % 8; c.beginPath(); c.moveTo(x + m.w / 2 - 8, k + ph); c.lineTo(x + m.w / 2 + 8, k + ph + 4); c.stroke(); }
  rrp(c, x, y, m.w, 16, 2); c.fillStyle = lgr(c, 0, y, 0, y + 16, [[0, "#b98549"], [1, "#5b3a1e"]]); c.fill(); inkStroke(c, 1.4);
  c.fillStyle = "#2b2b2b"; for (let i = 0; i < 4; i++) c.fillRect(x + 8 + i * 24, y + 6, 4, 4);
};
Art.raft = function (m, t) {
  const c = ctx, x = m.x, y = m.y + Math.sin(t / 14) * 1.5;
  for (let i = 0; i < 4; i++) {
    const lx = x + i * 32;
    rrp(c, lx + 1, y, 31, 15, 7); c.fillStyle = lgr(c, 0, y, 0, y + 15, [[0, "#a8743e"], [0.5, "#7d5128"], [1, "#4a2e17"]]); c.fill(); inkStroke(c, 1.1);
    c.strokeStyle = "rgba(60,30,10,0.4)"; c.lineWidth = 0.7; c.beginPath(); c.moveTo(lx + 4, y + 5); c.lineTo(lx + 28, y + 5); c.moveTo(lx + 6, y + 10); c.lineTo(lx + 26, y + 10); c.stroke();
  }
  c.fillStyle = "#c9b48a"; for (const rx of [x + 20, x + m.w - 24]) c.fillRect(rx, y - 1, 4, 17);
  c.fillStyle = "#5b3a1e"; c.fillRect(x + m.w - 14, y - 40, 3, 40);
  c.fillStyle = "#c9a227"; c.beginPath(); c.moveTo(x + m.w - 11, y - 40); c.lineTo(x + m.w + 8 + Math.sin(t / 8) * 2, y - 34); c.lineTo(x + m.w - 11, y - 28); c.fill(); inkStroke(c, 0.8);
  c.fillStyle = "rgba(220,240,240,0.5)"; c.fillRect(x - 4, y + 14, m.w + 8, 2);
};
Art.lever = function (x, base, lit, t) {
  const c = ctx;
  if (lit) { c.fillStyle = rgr(c, x, base - 40, 2, 56, [[0, "rgba(255,225,140,0.7)"], [1, "rgba(255,225,140,0)"]]); c.beginPath(); c.arc(x, base - 40, 56, 0, 7); c.fill(); }
  rrp(c, x - 12, base - 26, 24, 26, 3); c.fillStyle = lgr(c, 0, base - 26, 0, base, [[0, "#8b5a2b"], [1, "#4a2e17"]]); c.fill(); inkStroke(c, 1.3);
  c.fillStyle = "#2b2b2b"; c.fillRect(x - 12, base - 20, 24, 3);
  const a = lit ? -0.5 + Math.sin(t / 10) * 0.08 : 0.5;
  c.save(); c.translate(x, base - 22); c.rotate(a);
  c.strokeStyle = INK; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -36); c.stroke();
  c.strokeStyle = "#7a7a84"; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -36); c.stroke();
  c.fillStyle = lit ? "#ffd75e" : "#7d5128"; c.beginPath(); c.arc(0, -38, 6, 0, 7); c.fill(); inkStroke(c, 1.2);
  c.restore();
  if (lit) { c.fillStyle = "#fff6d8"; c.font = `bold 20px ${FONT_B}`; c.textAlign = "center"; c.fillText("▼", x, base - 86 + Math.sin(t / 6) * 3); }
};
Art.lectern = function (x, base, lit, t) {
  const c = ctx;
  if (lit) {
    c.save(); c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.35 + Math.sin(t / 40) * 0.05; c.fillStyle = "rgba(255,230,160,0.12)"; c.beginPath(); c.moveTo(x, base - 50); c.lineTo(x + Math.cos(a - 0.08) * 120, base - 50 + Math.sin(a - 0.08) * 120); c.lineTo(x + Math.cos(a + 0.08) * 120, base - 50 + Math.sin(a + 0.08) * 120); c.fill(); }
    c.restore();
    c.fillStyle = rgr(c, x, base - 50, 2, 50, [[0, "rgba(255,225,140,0.7)"], [1, "rgba(255,225,140,0)"]]); c.beginPath(); c.arc(x, base - 50, 50, 0, 7); c.fill();
  }
  c.fillStyle = "#5b3a1e"; c.fillRect(x - 4, base - 44, 8, 44); c.fillRect(x - 14, base - 5, 28, 5);
  c.beginPath(); c.moveTo(x - 18, base - 40); c.lineTo(x + 18, base - 48); c.lineTo(x + 18, base - 42); c.lineTo(x - 18, base - 34); c.closePath();
  c.fillStyle = "#7d5128"; c.fill(); inkStroke(c, 1.2);
  c.save(); c.translate(x, base - 46); c.rotate(-0.22);
  c.fillStyle = lit ? "#fff8e0" : "#cbbd9a";
  c.beginPath(); c.moveTo(-15, 0); c.quadraticCurveTo(-8, -5, 0, -1); c.quadraticCurveTo(8, -5, 15, 0); c.lineTo(15, 3); c.quadraticCurveTo(8, -2, 0, 2); c.quadraticCurveTo(-8, -2, -15, 3); c.closePath(); c.fill(); inkStroke(c, 1);
  c.restore();
  if (lit) { c.fillStyle = "#fff6d8"; c.font = `bold 20px ${FONT_B}`; c.textAlign = "center"; c.fillText("▼", x, base - 86 + Math.sin(t / 6) * 3); }
};
// The Ink Golem: a hulking figure of printer's ink studded with metal type.
Art.golem = function (b, t) {
  const c = ctx, fade = b.dying ? Math.max(0, 1 - b.dying / 140) : 1;
  c.save(); c.globalAlpha = fade; c.translate(b.x, b.y);
  Art.shadow(0, 0, 44);
  const step = Math.sin(t / 10) * (b.air ? 0 : 3), hit = b.flash % 6 > 2;
  const body = hit ? "#f0e8ff" : null;
  for (const s of [-1, 1]) {
    rrp(c, s * 14 - 9, -30 + (s > 0 ? step : -step), 18, 30, 6);
    c.fillStyle = body || "#1a1a2a"; c.fill(); inkStroke(c, 1.4);
  }
  c.beginPath();
  c.moveTo(-34, -28); c.quadraticCurveTo(-46, -70, -26, -96); c.quadraticCurveTo(0, -116, 26, -96); c.quadraticCurveTo(46, -70, 34, -28); c.quadraticCurveTo(0, -18, -34, -28); c.closePath();
  c.fillStyle = body || rgr(c, -12, -84, 4, 70, [[0, "#3c3c62"], [0.6, "#181828"], [1, "#0a0a12"]]); c.fill(); inkStroke(c, 1.8);
  c.fillStyle = "rgba(160,170,255,0.3)"; c.beginPath(); c.ellipse(-16, -84, 9, 4, -0.6, 0, 7); c.fill();
  // metal type letters stuck in the ink
  c.font = `bold 11px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle";
  [["R", -18, -52, 0.3], ["E", 14, -46, -0.4], ["F", 2, -36, 0.2], ["A", 22, -70, 0.5]].forEach(([ch, lx, ly, a]) => {
    c.save(); c.translate(lx, ly); c.rotate(a); c.fillStyle = "#a9a9b4"; c.fillRect(-5, -6, 10, 12); c.fillStyle = "#3a3a44"; c.fillText(ch, 0, 0.5); c.restore();
  });
  for (const s of [-1, 1]) {
    const sw = Math.sin(t / 12 + s) * 0.2 + (b.throwing && s > 0 ? -1.3 : 0);
    c.save(); c.translate(s * 34, -78); c.rotate(s * 0.3 + sw);
    rrp(c, -8, 0, 16, 44, 8); c.fillStyle = body || "#141424"; c.fill(); inkStroke(c, 1.4);
    c.fillStyle = "#0a0a14"; c.beginPath(); c.ellipse(0, 46, 9, 7, 0, 0, 7); c.fill();
    c.fillStyle = "#0a0a14"; c.beginPath(); c.ellipse(-2, 56 + Math.abs(Math.sin(t / 8)) * 6, 2, 4, 0, 0, 7); c.fill();
    c.restore();
  }
  for (const s of [-1, 1]) {
    c.fillStyle = rgr(c, s * 11, -84, 0, 12, [[0, "rgba(255,210,90,0.7)"], [1, "rgba(255,210,90,0)"]]); c.beginPath(); c.arc(s * 11, -84, 12, 0, 7); c.fill();
    c.fillStyle = "#ffd75e"; c.beginPath(); c.ellipse(s * 11, -84, 5, 3.6, s * 0.25, 0, 7); c.fill();
  }
  c.fillStyle = "#0a0a12"; c.beginPath(); c.moveTo(-12, -66); c.quadraticCurveTo(0, -58, 12, -66); c.quadraticCurveTo(0, -62, -12, -66); c.fill();
  c.restore();
};
// The Rumor Mill: a floating contraption of gears, hoppers, and crumpled pamphlets.
Art.rumor = function (b, t) {
  const c = ctx, fade = b.dying ? Math.max(0, 1 - b.dying / 140) : 1, hit = b.flash % 6 > 2;
  c.save(); c.globalAlpha = fade; c.translate(b.x, b.y);
  for (let i = 0; i < 6; i++) {
    const sx = -60 + i * 24, sw = Math.sin(t / 15 + i) * 10;
    c.strokeStyle = "rgba(240,230,205,0.75)"; c.lineWidth = 5; c.beginPath(); c.moveTo(sx, 34); c.bezierCurveTo(sx + sw, 64, sx - sw, 90, sx + sw * 0.5, 110 + (i % 2) * 18); c.stroke();
    c.strokeStyle = "rgba(60,40,25,0.5)"; c.lineWidth = 0.8;
    for (let k = 0; k < 4; k++) { const yy = 46 + k * 16; c.beginPath(); c.moveTo(sx - 2 + Math.sin(t / 15 + i + k) * 3, yy); c.lineTo(sx + 2 + Math.sin(t / 15 + i + k) * 3, yy); c.stroke(); }
  }
  const gear = (gx, gy, r, n, dir) => {
    c.save(); c.translate(gx, gy); c.rotate(t / 25 * dir);
    c.fillStyle = hit ? "#fff6e0" : "#8a6a3a";
    c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, rr2 = i % 2 ? r : r + 6; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } c.closePath(); c.fill(); inkStroke(c, 1.3);
    c.fillStyle = "#4a2e17"; c.beginPath(); c.arc(0, 0, r * 0.35, 0, 7); c.fill();
    c.restore();
  };
  gear(-70, -6, 26, 10, 1); gear(72, 4, 22, 9, -1); gear(-40, -48, 14, 7, -1);
  c.beginPath(); c.moveTo(-56, -40); c.lineTo(56, -40); c.lineTo(44, 34); c.lineTo(-44, 34); c.closePath();
  c.fillStyle = hit ? "#fff6e0" : lgr(c, -56, 0, 56, 0, [[0, "#7d5128"], [0.5, "#a8743e"], [1, "#5b3a1e"]]); c.fill(); inkStroke(c, 1.8);
  c.strokeStyle = "rgba(40,22,10,0.5)"; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(-56 + i * 22, -40); c.lineTo(-44 + i * 17.6, 34); c.stroke(); }
  c.fillStyle = "#2b2b2b"; c.fillRect(-58, -44, 116, 7); c.fillRect(-48, 20, 96, 5);
  for (const s of [-1, 1]) {
    c.fillStyle = "#3a3a44"; c.beginPath(); c.arc(s * 22, -14, 13, 0, 7); c.fill(); inkStroke(c, 1.2);
    c.fillStyle = rgr(c, s * 22, -14, 1, 12, [[0, "#fff1b0"], [1, "#d9a728"]]); c.beginPath(); c.arc(s * 22, -14, 9, 0, 7); c.fill();
    c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(s * 22 + Math.sin(t / 20) * 3, -14, 3.5, 0, 7); c.fill();
  }
  c.fillStyle = "#0e0a08"; c.fillRect(-26, 4, 52, 12);
  c.fillStyle = "#f4ead2"; c.fillRect(-20 + ((t * 2) % 30), 6, 14, 8);
  c.fillStyle = "#5b3a1e"; c.fillRect(-10, -70, 20, 30); c.fillStyle = "#2b2b2b"; c.fillRect(-13, -74, 26, 6);
  for (let i = 0; i < 4; i++) {
    const k = ((t / 2 + i * 22) % 88) / 88;
    c.save(); c.translate(Math.sin(k * 7 + i) * 14, -74 - k * 70); c.rotate(k * 6 + i);
    c.globalAlpha = fade * (1 - k); c.fillStyle = "#f4ead2"; c.fillRect(-6, -8, 12, 16); c.strokeStyle = "rgba(60,40,25,0.6)"; c.lineWidth = 0.6; c.strokeRect(-6, -8, 12, 16);
    c.restore();
  }
  c.globalAlpha = fade;
  for (let i = 0; i < 5; i++) {
    const a = t / 40 + i * 1.26, ox = Math.cos(a) * 100, oy = Math.sin(a) * 40;
    c.fillStyle = "#e8dcc0"; c.beginPath();
    for (let k = 0; k < 8; k++) { const aa = k * Math.PI / 4, rr2 = 8 + (k % 2) * 3; c.lineTo(ox + Math.cos(aa) * rr2, oy + Math.sin(aa) * rr2); }
    c.closePath(); c.fill(); inkStroke(c, 0.9);
  }
  c.restore();
};
Art.proj = function (o, t) {
  const c = ctx;
  if (o.kind === "fog" || !o.kind) return this.orb(o, t);
  if (o.kind === "ink") {
    c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.vy, o.vx) + Math.PI / 2);
    c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(9, 2, 0, 8); c.quadraticCurveTo(-9, 2, 0, -14);
    c.fillStyle = rgr(c, -2, 0, 1, 12, [[0, "#3c3c62"], [1, "#0a0a14"]]); c.fill(); inkStroke(c, 1);
    c.fillStyle = "rgba(200,200,255,0.5)"; c.beginPath(); c.arc(-2.5, 0, 2, 0, 7); c.fill();
    c.restore(); return;
  }
  if (o.kind === "wave") {
    c.beginPath(); c.moveTo(o.x - 20, o.y + 10); c.quadraticCurveTo(o.x - 10, o.y - 14 - Math.sin(t / 3) * 3, o.x + 4, o.y - 6); c.quadraticCurveTo(o.x + 14, o.y - 2, o.x + 20, o.y + 10); c.closePath();
    c.fillStyle = "#14141e"; c.fill(); inkStroke(c, 1); return;
  }
  if (o.kind === "scroll") {
    c.save(); c.translate(o.x, o.y); c.rotate(t / 6);
    rrp(c, -14, -6, 28, 12, 6); c.fillStyle = lgr(c, 0, -6, 0, 6, [[0, "#fbf3dc"], [1, "#c9b48a"]]); c.fill(); inkStroke(c, 1.1);
    c.fillStyle = "#b23a2e"; c.fillRect(-2, -6, 4, 12);
    c.restore(); return;
  }
  if (o.kind === "pamphlet") {
    c.save(); c.translate(o.x, o.y); c.rotate(Math.sin(t / 10 + o.x) * 0.6);
    c.fillStyle = "#f4ead2"; c.fillRect(-10, -13, 20, 26); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(-10, -13, 20, 26);
    c.fillStyle = "#b23a2e"; c.font = `bold 15px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("!", 0, -3);
    c.fillStyle = "rgba(40,30,20,0.6)"; c.fillRect(-6, 6, 12, 1.2); c.fillRect(-6, 9, 9, 1.2);
    c.restore();
  }
};

// ---------------------------------------------------------------- L2 scenery
const L2_DECOR = {
  pretzel(c, x, b, sd, t) {
    c.fillStyle = "#5b3a1e"; c.fillRect(x + 4, b - 74, 4, 74); c.fillRect(x + 88, b - 74, 4, 74);
    rrp(c, x, b - 30, 96, 30, 2); c.fillStyle = lgr(c, 0, b - 30, 0, b, [[0, "#9a6a38"], [1, "#5b3a1e"]]); c.fill(); inkStroke(c, 1.2);
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "#f4ead2" : "#2f6a3a"; c.beginPath(); c.moveTo(x - 6 + i * 13.5, b - 82); c.lineTo(x + 7.5 + i * 13.5, b - 82); c.lineTo(x + 7.5 + i * 13.5, b - 66); c.arc(x + 0.75 + i * 13.5, b - 66, 6.75, 0, Math.PI); c.closePath(); c.fill(); }
    c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(x - 6, b - 82, 108, 16);
    for (let i = 0; i < 6; i++) {
      const px = x + 12 + i * 14, py = b - 38;
      c.strokeStyle = "#8a4a1a"; c.lineWidth = 3; c.lineCap = "round";
      c.beginPath(); c.arc(px - 3, py, 4, Math.PI * 0.2, Math.PI * 1.6); c.stroke(); c.beginPath(); c.arc(px + 3, py, 4, Math.PI * 1.4, Math.PI * 0.8); c.stroke();
      c.fillStyle = "#fff"; c.fillRect(px - 2, py - 3, 1, 1); c.fillRect(px + 2, py + 1, 1, 1);
    }
  },
  cart(c, x, b) {
    c.fillStyle = "#6e4523"; rrp(c, x, b - 30, 56, 16, 2); c.fill(); inkStroke(c, 1.1);
    for (const wx of [x + 12, x + 44]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(wx, b - 9, 9, 0, 7); c.stroke(); c.strokeStyle = "#8b5a2b"; c.lineWidth = 2; c.beginPath(); c.arc(wx, b - 9, 9, 0, 7); c.stroke(); for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(wx, b - 9); c.lineTo(wx + Math.cos(k * 0.8) * 9, b - 9 + Math.sin(k * 0.8) * 9); c.stroke(); } }
    c.strokeStyle = "#5b3a1e"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 56, b - 24); c.lineTo(x + 76, b - 14); c.stroke();
    const cols = ["#7a2a20", "#2f4a6a", "#4a5a2a", "#6e4523"];
    for (let i = 0; i < 6; i++) { c.fillStyle = cols[i % 4]; c.fillRect(x + 4 + i * 8, b - 44 + (i % 2) * 3, 7, 14 - (i % 2) * 3); c.fillStyle = "#e8dcc0"; c.fillRect(x + 4 + i * 8, b - 42 + (i % 2) * 3, 7, 1.2); }
    c.fillStyle = "#c9b48a"; c.beginPath(); c.ellipse(x + 44, b - 38, 9, 8, 0, 0, 7); c.fill(); inkStroke(c, 1);
  },
  notice(c, x, b) {
    c.fillStyle = "#5b3a1e"; c.fillRect(x + 2, b - 78, 4, 78); c.fillRect(x + 26, b - 78, 4, 78);
    rrp(c, x - 4, b - 80, 40, 46, 2); c.fillStyle = "#7d5128"; c.fill(); inkStroke(c, 1.2);
    c.fillStyle = "#5b3a1e"; c.beginPath(); c.moveTo(x - 8, b - 80); c.lineTo(x + 16, b - 92); c.lineTo(x + 40, b - 80); c.fill(); inkStroke(c, 1);
    [[x, b - 76, 14, 18, -0.08], [x + 16, b - 74, 14, 20, 0.06], [x + 4, b - 54, 22, 16, 0.03]].forEach(([px, py, w, h, a]) => {
      c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = "#f4ead2"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(60,40,25,0.6)"; c.lineWidth = 0.6; c.strokeRect(0, 0, w, h);
      c.fillStyle = "rgba(40,30,20,0.7)"; for (let k = 0; k < 4; k++) c.fillRect(2, 3 + k * 3.4, w - 4, 1); c.restore();
    });
  },
  press(c, x, b) {
    c.fillStyle = "#4a2e17"; c.fillRect(x + 2, b - 80, 7, 80); c.fillRect(x + 48, b - 80, 7, 80); c.fillRect(x - 2, b - 84, 61, 8); c.fillRect(x - 2, b - 30, 61, 8);
    c.fillStyle = "#8a6a3a"; c.fillRect(x + 23, b - 76, 10, 28);
    c.strokeStyle = "#4a2e17"; c.lineWidth = 1.4; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + 23, b - 72 + k * 7); c.lineTo(x + 33, b - 69 + k * 7); c.stroke(); }
    c.fillStyle = "#3b2414"; c.fillRect(x + 28, b - 62, 34, 4); c.fillStyle = "#5b3a1e"; c.fillRect(x + 12, b - 48, 34, 7);
    c.fillStyle = "#f4ead2"; c.fillRect(x + 12, b - 34, 34, 4);
    c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x + 2, b - 80, 7, 80); c.strokeRect(x + 48, b - 80, 7, 80);
  },
  typecase(c, x, b) {
    rrp(c, x, b - 64, 34, 64, 2); c.fillStyle = "#5b3a1e"; c.fill(); inkStroke(c, 1.2);
    for (let j = 0; j < 5; j++) { c.fillStyle = "#3b2414"; c.fillRect(x + 3, b - 60 + j * 12, 28, 9); for (let i = 0; i < 4; i++) { c.fillStyle = "#9a9aa4"; c.fillRect(x + 5 + i * 7, b - 58 + j * 12, 5, 5); } }
  },
  paper(c, x, b) {
    for (let i = 0; i < 3; i++) { const h = 14 - i * 2; rrp(c, x + 2 + i * 2, b - 14 - i * 13, 28 - i * 4, h, 1); c.fillStyle = i % 2 ? "#efe4c8" : "#f6eedb"; c.fill(); inkStroke(c, 0.9); c.strokeStyle = "rgba(120,90,50,0.4)"; c.lineWidth = 0.6; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + 3 + i * 2, b - 14 - i * 13 + k * h / 4); c.lineTo(x + 29 - i * 2, b - 14 - i * 13 + k * h / 4); c.stroke(); } }
    c.strokeStyle = "#8b5a2b"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 16, b - 40); c.lineTo(x + 16, b); c.stroke();
  },
  inkbarrel(c, x, b, sd, t) {
    L1_DECOR_BARREL(c, x, b);
    c.fillStyle = "#14141e"; c.beginPath(); c.ellipse(x + 16, b - 31, 10, 3, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(x + 22, b - 31); c.quadraticCurveTo(x + 26, b - 20, x + 24, b - 12); c.lineTo(x + 21, b - 14); c.quadraticCurveTo(x + 22, b - 22, x + 18, b - 30); c.fill();
    c.beginPath(); c.ellipse(x + 26, b - 1, 9, 2.4, 0, 0, 7); c.fill();
  },
  drying(c, x, b, sd, t) {
    c.fillStyle = "#5b3a1e"; c.fillRect(x + 2, b - 80, 4, 80); c.fillRect(x + 90, b - 80, 4, 80);
    c.strokeStyle = "#3b2a1a"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, b - 76); c.quadraticCurveTo(x + 48, b - 66, x + 92, b - 76); c.stroke();
    for (let i = 0; i < 4; i++) {
      const cx = x + 16 + i * 20, top = b - 72 + Math.abs(i - 1.5) * -1.5 + 2, sw = Math.sin(t / 18 + i) * 2;
      c.save(); c.translate(cx, top); c.rotate(sw * 0.03);
      c.fillStyle = "#f4ead2"; c.fillRect(-8, 0, 16, 22); c.strokeStyle = INK; c.lineWidth = 0.8; c.strokeRect(-8, 0, 16, 22);
      c.fillStyle = "rgba(40,30,20,0.7)"; c.fillRect(-5, 3, 10, 2); for (let k = 0; k < 4; k++) c.fillRect(-5, 8 + k * 3, 10, 0.9);
      c.fillStyle = "#6e4523"; c.fillRect(-2, -2, 4, 4);
      c.restore();
    }
  },
  fir(c, x, b) { fir(c, x + 16, b, 130, "#2f4a32"); },
  fern(c, x, b) {
    c.strokeStyle = "#4f7a35"; c.lineWidth = 1.5; c.lineCap = "round";
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.35, ex = x + 16 + Math.cos(a) * 24, ey = b + Math.sin(a) * 22;
      c.beginPath(); c.moveTo(x + 16, b); c.quadraticCurveTo(x + 16 + Math.cos(a) * 12, b - 18, ex, ey); c.stroke();
      for (let j = 1; j < 5; j++) { const tt = j / 5, px = x + 16 + (ex - x - 16) * tt, py = b + (ey - b) * tt - 6 * tt; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 4, py + 2); c.moveTo(px, py); c.lineTo(px - 4, py + 2); c.stroke(); }
    }
  },
  rock(c, x, b) {
    c.beginPath(); c.moveTo(x - 2, b); c.lineTo(x + 2, b - 18); c.lineTo(x + 12, b - 26); c.lineTo(x + 26, b - 20); c.lineTo(x + 34, b); c.closePath();
    c.fillStyle = lgr(c, x, b - 26, x + 34, b, [[0, "#a49e90"], [1, "#5f5a50"]]); c.fill(); inkStroke(c, 1.2);
    c.fillStyle = "#6f8a42"; c.beginPath(); c.ellipse(x + 12, b - 24, 8, 3, 0.2, 0, 7); c.fill();
  },
  milestone(c, x, b) {
    c.beginPath(); c.moveTo(x + 6, b); c.lineTo(x + 6, b - 30); c.arc(x + 16, b - 30, 10, Math.PI, 0); c.lineTo(x + 26, b); c.closePath();
    c.fillStyle = lgr(c, x + 6, 0, x + 26, 0, [[0, "#b3ab98"], [1, "#7f7868"]]); c.fill(); inkStroke(c, 1.2);
    c.fillStyle = "#3e3a32"; c.font = `bold 9px ${FONT_D}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("WORMS", x + 16, b - 30); c.fillText("XII", x + 16, b - 19);
  },
  mushroom(c, x, b) {
    for (const [mx, s] of [[x + 10, 1], [x + 22, 0.7]]) {
      c.fillStyle = "#efe6d0"; c.fillRect(mx - 2 * s, b - 10 * s, 4 * s, 10 * s);
      c.fillStyle = "#c0392b"; c.beginPath(); c.ellipse(mx, b - 10 * s, 8 * s, 6 * s, 0, Math.PI, 0); c.fill(); inkStroke(c, 0.8);
      c.fillStyle = "#fff"; c.beginPath(); c.arc(mx - 3 * s, b - 13 * s, 1.2, 0, 7); c.arc(mx + 3 * s, b - 12 * s, 1, 0, 7); c.fill();
    }
  },
  torch(c, x, b, sd, t) {
    c.fillStyle = "#2a1e24"; c.fillRect(x + 14, b - 62, 4, 62);
    c.fillStyle = "#4a2e17"; c.fillRect(x + 10, b - 66, 12, 6);
    c.fillStyle = rgr(c, x + 16, b - 74, 1, 34, [[0, "rgba(255,180,90,0.6)"], [1, "rgba(255,180,90,0)"]]); c.beginPath(); c.arc(x + 16, b - 74, 34, 0, 7); c.fill();
    const fl = Math.sin(t / 3 + sd * 9) * 1.5;
    c.fillStyle = "#ff8a2a"; c.beginPath(); c.moveTo(x + 9, b - 66); c.quadraticCurveTo(x + 16 + fl, b - 92, x + 23, b - 66); c.fill();
    c.fillStyle = "#ffe08a"; c.beginPath(); c.moveTo(x + 12, b - 66); c.quadraticCurveTo(x + 16 - fl, b - 82, x + 20, b - 66); c.fill();
  },
  eagleBanner(c, x, b, sd, t) {
    c.fillStyle = "#2a1e24"; c.fillRect(x + 6, b - 100, 4, 100);
    const w = k => Math.sin(t / 12 + sd * 6 + k * 0.7) * 3;
    c.beginPath(); c.moveTo(x + 10, b - 96);
    for (let k = 0; k <= 5; k++) c.lineTo(x + 10 + k * 6, b - 96 + w(k));
    for (let k = 5; k >= 0; k--) c.lineTo(x + 10 + k * 6, b - 56 + w(k));
    c.closePath(); c.fillStyle = "#c9a227"; c.fill(); inkStroke(c, 1.2);
    eagle(c, x + 25, b - 76 + w(3), 0.6, "#1e1a18");
  },
  // The church door associated with the 95 Theses (tradition says they were posted here).
  churchdoor(c, x, b) {
    c.fillStyle = "#9a8f80"; c.fillRect(x - 14, b - 128, 92, 128);
    c.strokeStyle = "rgba(60,50,40,0.5)"; c.lineWidth = 1;
    for (let j = 0; j < 8; j++) { c.beginPath(); c.moveTo(x - 14, b - j * 16); c.lineTo(x + 78, b - j * 16); c.stroke(); }
    c.beginPath(); c.moveTo(x - 4, b); c.lineTo(x - 4, b - 76); c.quadraticCurveTo(x + 32, b - 124, x + 68, b - 76); c.lineTo(x + 68, b); c.closePath();
    c.fillStyle = "#7f7466"; c.fill(); inkStroke(c, 1.4);
    c.beginPath(); c.moveTo(x + 4, b); c.lineTo(x + 4, b - 74); c.quadraticCurveTo(x + 32, b - 112, x + 60, b - 74); c.lineTo(x + 60, b); c.closePath();
    c.fillStyle = lgr(c, x + 4, 0, x + 60, 0, [[0, "#6e4523"], [0.5, "#8b5a2b"], [1, "#4a2e17"]]); c.fill(); inkStroke(c, 1.4);
    c.strokeStyle = "rgba(40,22,10,0.6)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 32, b - 104); c.lineTo(x + 32, b); c.stroke();
    for (const by of [b - 70, b - 30]) { c.fillStyle = "#2b2b2b"; c.fillRect(x + 4, by, 56, 4); c.fillStyle = "#8a8a8a"; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x + 8 + i * 10, by + 2, 1.2, 0, 7); c.fill(); } }
    c.save(); c.translate(x + 14, b - 62); c.rotate(-0.04);
    c.fillStyle = "#f6eedb"; c.fillRect(0, 0, 16, 22); c.strokeStyle = INK; c.lineWidth = 0.8; c.strokeRect(0, 0, 16, 22);
    c.fillStyle = "rgba(40,30,20,0.75)"; c.fillRect(2, 2, 12, 2); for (let k = 0; k < 6; k++) c.fillRect(2, 6 + k * 2.6, 12, 0.8);
    c.fillStyle = "#2b2b2b"; c.beginPath(); c.arc(8, 1, 1.2, 0, 7); c.fill();
    c.restore();
    c.fillStyle = "#857a6c"; c.fillRect(x - 18, b - 6, 100, 6); c.fillRect(x - 10, b - 12, 84, 6);
  }
};
// Reuse the Level 1 barrel painter for the ink barrel.
function L1_DECOR_BARREL(c, x, b) {
  rrp(c, x + 4, b - 32, 24, 32, 7); c.fillStyle = lgr(c, x + 4, 0, x + 28, 0, [[0, "#5b3a1e"], [0.35, "#a8743e"], [1, "#4a2e17"]]); c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#3b3b3b"; c.fillRect(x + 4, b - 27, 24, 3); c.fillRect(x + 4, b - 8, 24, 3);
}
const ANIMATED_L2 = new Set(["drying", "torch", "eagleBanner"]);

// A ghost of a missed question: a translucent, shimmering block.
Art.ghostBlock = function (x, y, t) {
  const c = ctx, bob = Math.sin(t / 14 + x) * 2, yy = y + bob;
  c.save();
  c.globalAlpha = 0.35 + Math.sin(t / 10 + x) * 0.1;
  c.fillStyle = rgr(c, x + 16, yy + 16, 2, 30, [[0, "rgba(233,220,255,0.9)"], [1, "rgba(155,107,214,0)"]]); c.beginPath(); c.arc(x + 16, yy + 16, 30, 0, 7); c.fill();
  c.globalAlpha = 0.78;
  rrp(c, x + 1, yy + 1, 30, 30, 6); c.fillStyle = lgr(c, 0, yy, 0, yy + 32, [[0, "rgba(240,232,255,0.85)"], [1, "rgba(155,120,210,0.7)"]]); c.fill();
  c.setLineDash([4, 3]); c.lineDashOffset = -t / 3; c.strokeStyle = "#6a4e8e"; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
  c.strokeStyle = "#4a3466"; c.lineWidth = 2.6; c.lineCap = "round";
  c.beginPath(); c.arc(x + 16, yy + 16, 7.5, -0.4, Math.PI * 1.45); c.stroke();
  c.fillStyle = "#4a3466"; c.beginPath(); c.moveTo(x + 22.5, yy + 9.5); c.lineTo(x + 25.5, yy + 15); c.lineTo(x + 19.5, yy + 14.5); c.fill();
  c.restore();
};

// Cracked stone that the Printer's Press (ground-pound) can smash.
TILE_PAINT.cracked = function (c, r, v) {
  c.fillStyle = "#5c544a"; c.fillRect(0, 0, 32, 32);
  rrp(c, 1, 1, 30, 30, 3); c.fillStyle = lgr(c, 0, 0, 32, 32, [[0, "#b2a796"], [1, "#7a7062"]]); c.fill();
  c.strokeStyle = "#2a2622"; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(4, 6); c.lineTo(12, 13); c.lineTo(9, 20); c.lineTo(16, 28); c.moveTo(12, 13); c.lineTo(22, 10); c.lineTo(28, 4); c.moveTo(22, 10); c.lineTo(24, 22); c.lineTo(30, 26); c.stroke();
  c.strokeStyle = "rgba(255,240,200,0.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(5, 7); c.lineTo(12, 14); c.stroke();
  c.fillStyle = "rgba(255,220,140,0.25)"; c.fillRect(13, 12, 3, 3);
};
// A Lost Manuscript: a rolled scroll with a wax seal, glowing in a hidden spot.
Art.manuscript = function (x, y, t, found) {
  const c = ctx, yy = y + Math.sin(t / 18 + x) * 3;
  c.save();
  if (found) c.globalAlpha = 0.28;
  c.fillStyle = rgr(c, x, yy, 2, 40, [[0, "rgba(255,215,120,0.75)"], [1, "rgba(255,215,120,0)"]]); c.beginPath(); c.arc(x, yy, 40, 0, 7); c.fill();
  c.translate(x, yy); c.rotate(-0.25 + Math.sin(t / 25) * 0.05);
  rrp(c, -15, -8, 30, 16, 7); c.fillStyle = lgr(c, 0, -8, 0, 8, [[0, "#fbf3dc"], [1, "#c9b48a"]]); c.fill(); inkStroke(c, 1.2);
  for (const ex of [-15, 15]) { c.fillStyle = "#e8d8b0"; c.beginPath(); c.ellipse(ex, 0, 3.5, 8, 0, 0, 7); c.fill(); inkStroke(c, 1); }
  c.fillStyle = "#6e4523"; c.fillRect(-2, -8, 4, 16);
  c.fillStyle = "#b23a2e"; c.beginPath(); c.arc(0, 9, 5, 0, 7); c.fill(); inkStroke(c, 0.9);
  c.fillStyle = "#e8a090"; c.beginPath(); c.arc(-1.3, 7.8, 1.4, 0, 7); c.fill();
  c.restore();
};
// Da Vinci's Cloak spread like wings while gliding.
Art.cloak = function (x, y, t) {
  const c = ctx, f = Math.sin(t / 6) * 2;
  c.save(); c.translate(x, y);
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(s * 26, -16 + f, s * 40, -4 + f); c.lineTo(s * 34, 2); c.lineTo(s * 28, 0); c.lineTo(s * 22, 6); c.quadraticCurveTo(s * 10, 4, 0, 6); c.closePath();
    c.fillStyle = lgr(c, 0, -16, 0, 6, [[0, shade(SAVE.cape, 0.25)], [1, shade(SAVE.cape, -0.3)]]); c.globalAlpha = 0.92; c.fill(); inkStroke(c, 1.2);
    c.strokeStyle = "rgba(255,240,210,0.6)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(s * 20, -10 + f, s * 34, -2 + f); c.stroke();
  }
  c.restore();
};

// The Level 2 typesetting station: a big wooden press with a glowing type tray.
Art.pressStation = function (x, base, live, t) {
  const c = ctx;
  if (live) { c.fillStyle = rgr(c, x + 40, base - 60, 4, 90, [[0, "rgba(255,225,140,0.45)"], [1, "rgba(255,225,140,0)"]]); c.beginPath(); c.arc(x + 40, base - 60, 90, 0, 7); c.fill(); }
  c.fillStyle = "#4a2e17"; c.fillRect(x + 4, base - 120, 12, 120); c.fillRect(x + 64, base - 120, 12, 120);
  c.fillRect(x - 2, base - 126, 84, 12); c.fillRect(x - 2, base - 52, 84, 10); c.beginPath(); c.rect(x - 2, base - 52, 84, 10); inkStroke(c, 1);
  c.fillStyle = "#8a6a3a"; c.fillRect(x + 33, base - 114, 14, 40);
  c.strokeStyle = "#4a2e17"; c.lineWidth = 1.6; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(x + 33, base - 110 + k * 7); c.lineTo(x + 47, base - 106 + k * 7); c.stroke(); }
  c.fillStyle = "#3b2414"; c.save(); c.translate(x + 40, base - 92); c.rotate(live ? Math.sin(t / 20) * 0.2 : 0.4); c.fillRect(0, -3, 48, 6); c.restore();
  c.fillStyle = "#5b3a1e"; c.fillRect(x + 12, base - 74, 56, 12);
  rrp(c, x + 8, base - 40, 64, 14, 2); c.fillStyle = "#2a2622"; c.fill();
  for (let i = 0; i < 8; i++) { c.fillStyle = live ? "#d9c78a" : "#8a8a92"; c.fillRect(x + 12 + i * 7, base - 37, 5, 8); }
  c.fillStyle = "#f4ead2"; c.fillRect(x + 20, base - 24, 40, 6);
  if (live) { c.fillStyle = "#fff6d8"; c.font = `bold 20px ${FONT_B}`; c.textAlign = "center"; c.fillText("▼", x + 40, base - 140 + Math.sin(t / 6) * 3); }
};

// =====================================================================
//  CHARACTERS — guides who give tips, and the rival Herald of Forgetting
// =====================================================================
const NPC_LOOK = {
  scholar:  { robe: "#2a2a44", trim: "#b23a2e", hat: "cap", hatCol: "#b23a2e", beard: null, skin: "#efc39b", long: true, prop: "book" },
  leonardo: { robe: "#c9787a", trim: "#7a3a3a", hat: "cap", hatCol: "#3a2a24", beard: "#8a8478", skin: "#e8b890", long: true, prop: "sketch" },
  student:  { robe: "#1e1e26", trim: "#5a5a6a", hat: "flat", hatCol: "#1e1e26", beard: null, skin: "#f0c9a0", long: true, prop: "book" },
  printer:  { robe: "#6e5a3a", trim: "#3b2414", hat: "cap", hatCol: "#4a3a2c", beard: "#5a3a1e", skin: "#e0a87e", long: false, prop: "apron" },
  raftsman: { robe: "#3f6a42", trim: "#2a4a2c", hat: "wide", hatCol: "#6e4523", beard: null, skin: "#d9a07a", long: false, prop: "pole" }
};
Art.npc = function (kind, x, base, t, face = -1) {
  const L = NPC_LOOK[kind], c = ctx, bob = Math.sin(t / 30) * 0.8;
  Art.shadow(x, base, 16);
  c.save(); c.translate(x, base); c.scale(face, 1);
  if (L.prop === "pole") { c.strokeStyle = "#6e4523"; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -70); c.lineTo(-4, 0); c.stroke(); }
  // legs and robe
  c.fillStyle = "#2b1d14"; c.fillRect(-7, -12, 5, 12); c.fillRect(2, -12, 5, 12);
  c.beginPath(); c.moveTo(-10, -40 + bob); c.lineTo(10, -40 + bob); c.lineTo(L.long ? 13 : 11, L.long ? -2 : -12); c.lineTo(L.long ? -13 : -11, L.long ? -2 : -12); c.closePath();
  c.fillStyle = lgr(c, -12, 0, 12, 0, [[0, shade(L.robe, 0.15)], [1, shade(L.robe, -0.3)]]); c.fill(); inkStroke(c, 1.3);
  c.fillStyle = L.trim; c.fillRect(-10, -26 + bob, 20, 3);
  if (L.prop === "apron") { c.fillStyle = "#c9b48a"; c.beginPath(); c.moveTo(-7, -34 + bob); c.lineTo(7, -34 + bob); c.lineTo(9, -10); c.lineTo(-9, -10); c.fill(); inkStroke(c, 1); c.fillStyle = "#14141e"; c.beginPath(); c.arc(-2, -20, 2.5, 0, 7); c.arc(4, -15, 1.6, 0, 7); c.fill(); }
  // arms and prop
  c.strokeStyle = INK; c.lineWidth = 6.4; c.lineCap = "round"; c.beginPath(); c.moveTo(-8, -36 + bob); c.lineTo(-11, -22 + bob); c.stroke();
  c.strokeStyle = shade(L.robe, -0.1); c.lineWidth = 4.4; c.beginPath(); c.moveTo(-8, -36 + bob); c.lineTo(-11, -22 + bob); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 6.4; c.beginPath(); c.moveTo(8, -36 + bob); c.lineTo(12, -26 + bob); c.stroke();
  c.strokeStyle = shade(L.robe, -0.1); c.lineWidth = 4.4; c.beginPath(); c.moveTo(8, -36 + bob); c.lineTo(12, -26 + bob); c.stroke();
  if (L.prop === "book") { c.fillStyle = "#7a2a20"; c.fillRect(8, -32 + bob, 10, 12); c.beginPath(); c.rect(8, -32 + bob, 10, 12); inkStroke(c, 0.8); c.fillStyle = "#e8dcc0"; c.fillRect(9, -31 + bob, 8, 1.5); }
  if (L.prop === "scope") { c.save(); c.translate(14, -30 + bob); c.rotate(-0.7); rrp(c, -3, -14, 6, 22, 2); c.fillStyle = lgr(c, -3, 0, 3, 0, [[0, "#f2d77a"], [1, "#9a7012"]]); c.fill(); inkStroke(c, 0.8); c.restore(); }
  if (L.kind === "ruff" || kind === "parr" || kind === "drake" || kind === "digges") { c.fillStyle = "#fbf8f0"; c.beginPath(); c.ellipse(0, -41 + bob, 9, 3, 0, 0, 7); c.fill(); inkStroke(c, 0.7); }
  if (L.prop === "sketch") { c.fillStyle = "#efe1bc"; c.save(); c.translate(14, -30 + bob); c.rotate(-0.2); c.fillRect(-7, -9, 14, 18); c.strokeStyle = "#7a5a3a"; c.lineWidth = 0.7; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.moveTo(-5, -1); c.lineTo(5, -1); c.stroke(); c.restore(); }
  // head
  const hy = -49 + bob;
  c.beginPath(); c.arc(0, hy, 8, 0, 7); c.fillStyle = rgr(c, -2, hy - 3, 1, 10, [[0, shade(L.skin, 0.15)], [1, L.skin]]); c.fill(); inkStroke(c, 1.2);
  if (L.beard) { c.fillStyle = L.beard; c.beginPath(); c.moveTo(-7, hy + 1); c.quadraticCurveTo(-6, hy + (kind === "leonardo" ? 20 : 11), 0, hy + (kind === "leonardo" ? 24 : 13)); c.quadraticCurveTo(6, hy + (kind === "leonardo" ? 20 : 11), 7, hy + 1); c.quadraticCurveTo(0, hy + 5, -7, hy + 1); c.fill(); inkStroke(c, 0.9); }
  c.fillStyle = "#2b1d14"; c.beginPath(); c.arc(-3, hy - 1, 1.2, 0, 7); c.fill();
  if (t % 260 < 6) { c.fillStyle = L.skin; c.fillRect(-4.5, hy - 2.4, 3, 2.4); }
  // hats
  c.fillStyle = L.hatCol;
  if (L.hat === "cap") { c.beginPath(); c.ellipse(0, hy - 7, 9, 4.4, 0, 0, 7); c.fill(); inkStroke(c, 1); }
  if (L.hat === "flat") { c.fillRect(-10, hy - 10, 20, 4); c.fillRect(-6, hy - 13, 12, 4); c.beginPath(); c.rect(-6, hy - 13, 12, 4); inkStroke(c, 0.8); }
  if (L.hat === "hood") { c.beginPath(); c.moveTo(-10, hy + 6); c.lineTo(-10, hy - 6); c.quadraticCurveTo(0, hy - 16, 10, hy - 6); c.lineTo(10, hy + 6); c.lineTo(7, hy + 4); c.lineTo(7, hy - 4); c.quadraticCurveTo(0, hy - 10, -7, hy - 4); c.lineTo(-7, hy + 4); c.closePath(); c.fill(); inkStroke(c, 0.9); c.strokeStyle = "#d9a728"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-8, hy - 4); c.quadraticCurveTo(0, hy - 11, 8, hy - 4); c.stroke(); }
  if (L.hat === "tall") { c.beginPath(); c.ellipse(0, hy - 7, 12, 3, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-7, hy - 7); c.lineTo(-6, hy - 20); c.lineTo(6, hy - 20); c.lineTo(7, hy - 7); c.closePath(); c.fill(); inkStroke(c, 0.9); c.fillStyle = "#c9a227"; c.fillRect(-7, hy - 10, 14, 2); c.fillStyle = "#f4ead2"; c.beginPath(); c.ellipse(5, hy - 22, 6, 2, -0.6, 0, 7); c.fill(); }
  if (L.hat === "crown") { c.beginPath(); c.moveTo(-8, hy - 6); c.lineTo(-9, hy - 16); c.lineTo(-4, hy - 11); c.lineTo(0, hy - 18); c.lineTo(4, hy - 11); c.lineTo(9, hy - 16); c.lineTo(8, hy - 6); c.closePath(); c.fill(); inkStroke(c, 0.9); c.fillStyle = "#b23a2e"; c.beginPath(); c.arc(0, hy - 9, 1.6, 0, 7); c.fill(); }
  if (L.hat === "wide") { c.beginPath(); c.ellipse(0, hy - 6, 14, 3.5, 0, 0, 7); c.fill(); c.fillRect(-6, hy - 13, 12, 7); c.beginPath(); c.rect(-6, hy - 13, 12, 7); inkStroke(c, 1); }
  c.restore();
};
// The Herald of Forgetting: a court herald in a tabard of fog, with a trumpet that blows mist.
Art.herald = function (x, base, t, face = -1, scale = 1) {
  const c = ctx, fl = Math.sin(t / 25) * 4;
  c.save(); c.translate(x, base - fl); c.scale(face * scale, scale);
  c.fillStyle = "rgba(60,40,90,0.25)"; c.beginPath(); c.ellipse(0, fl + 2, 22, 5, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-14, -46); c.lineTo(14, -46); c.lineTo(18, -6); c.quadraticCurveTo(0, 4 + Math.sin(t / 8) * 3, -18, -6); c.closePath();
  c.fillStyle = lgr(c, -18, 0, 18, 0, [[0, "#5a3f7a"], [1, "#2a1838"]]); c.fill(); inkStroke(c, 1.4);
  c.fillStyle = "#c9b2f0"; c.beginPath(); c.moveTo(-8, -42); c.lineTo(8, -42); c.lineTo(6, -16); c.lineTo(0, -10); c.lineTo(-6, -16); c.closePath(); c.fill(); inkStroke(c, 1);
  c.strokeStyle = "#5a3f7a"; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -28, 5, 0, Math.PI * 1.6); c.stroke();
  c.beginPath(); c.arc(0, -56, 9, 0, 7); c.fillStyle = "#b8b0c8"; c.fill(); inkStroke(c, 1.2);
  c.fillStyle = "#ffd75e"; c.beginPath(); c.ellipse(-3.5, -57, 2.4, 1.6, 0, 0, 7); c.ellipse(3, -57, 2.4, 1.6, 0, 0, 7); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-5, -51); c.quadraticCurveTo(0, -53, 5, -50); c.stroke();
  c.fillStyle = "#2a1838"; c.beginPath(); c.ellipse(0, -64, 13, 4, 0, 0, 7); c.fill(); c.fillRect(-7, -72, 14, 8); c.beginPath(); c.rect(-7, -72, 14, 8); inkStroke(c, 1);
  c.strokeStyle = "#c9b2f0"; c.lineWidth = 2; c.beginPath(); c.moveTo(6, -70); c.quadraticCurveTo(20, -88 + fl, 26, -74); c.stroke();
  // trumpet blowing mist
  c.save(); c.translate(-10, -50); c.rotate(-0.25);
  c.fillStyle = "#c9a227"; c.fillRect(-34, -2, 32, 4); c.beginPath(); c.moveTo(-34, -2); c.lineTo(-46, -9); c.lineTo(-46, 9); c.lineTo(-34, 2); c.closePath(); c.fill(); inkStroke(c, 1);
  c.fillStyle = "#5a3f7a"; c.fillRect(-26, 2, 12, 10); c.restore();
  for (let i = 0; i < 4; i++) { const k = ((t / 40 + i * 0.25) % 1); c.fillStyle = `rgba(200,180,240,${0.5 * (1 - k)})`; c.beginPath(); c.arc(-60 - k * 60, -58 - k * 20, 6 + k * 14, 0, 7); c.fill(); }
  c.restore();
};

// ---------------------------------------------------------------- comic panels
// A panel is a small scene composed with the same art as the levels:
// { level, zone, cam, actors: [[kind, x, ...]], dark, caption }
Art.renderPanel = function (spec) {
  const def = LEVELS[spec.level], zones = def.zones, Z = zones[spec.zone];
  const [cnv, x] = this.mk(VW, VH);
  const saved = ctx; ctx = x;
  const z = spec.zoom || 1.5;   // a closer "camera" than gameplay, so characters read clearly
  x.translate(VW / 2, VH * 0.7); x.scale(z, z); x.translate(-VW / 2, -VH * 0.7);
  try {
    this.sky(spec.cam, zones, spec.zone, spec.zone, 0, spec.t || 200);
    for (const n of Z.bg) this.layer(n, spec.cam, 0, 0, 1);
    if (spec.dark) { ctx.fillStyle = "rgba(36,18,56,0.4)"; ctx.fillRect(0, 0, VW, VH); }
    for (let tx = 0; tx < 31; tx++) for (let ty = 14; ty < 17; ty++) this.tile(Z.tiles + (ty === 14 ? "Top" : "Body"), tx, ty, tx * T, ty * T);
    for (const [kind, ax, ay, extra] of spec.actors || []) {
      if (kind === "player") this.player({ x: ax - 15, y: ay - 42, face: extra || 1, onGround: true, vx: 0, anim: 0, fly: false, squash: 0 }, 50);
      else if (kind === "herald") this.herald(ax, ay, 60, extra || -1, 1.6);
      else if (kind === "fog") this.boss({ x: ax, y: ay, flash: 0, dying: extra || 0 }, 80);
      else if (kind === "rumor") this.rumor({ x: ax, y: ay, flash: 0, dying: extra || 0 }, 80);
      else if (kind === "golem") this.golem({ x: ax, y: ay, flash: 0, dying: 0 }, 80);
      else if (kind === "spheres") this.spheres({ x: ax, y: ay, flash: 0, dying: extra || 0, hp: 3, maxHp: 3 }, 80);
      else if (kind === "armada") this.galleon({ x: ax, y: ay, flash: 0, dying: extra || 0 }, 80);
      else if (kind === "machine") this.machine(ax, ay, true, false, 40);
      else this.npc(kind, ax, ay, 40, extra || -1);
    }
    this.post();
  } finally { ctx = saved; }
  return cnv;
};

// =====================================================================
//  VISIBILITY AND PRIZES
// =====================================================================
// A pulsing red-orange aura and a ground marker, so enemies stand out against any background.
Art.danger = function (e, t) {
  const c = ctx, cx = e.x + e.w / 2, cy = e.y + e.h / 2, pulse = 0.75 + Math.sin(t / 9 + e.x) * 0.25;
  c.save();
  c.globalCompositeOperation = "source-over";
  const g = c.createRadialGradient(cx, cy, 6, cx, cy, 40);
  g.addColorStop(0, `rgba(255,96,48,${0.5 * pulse})`); g.addColorStop(0.55, `rgba(255,70,40,${0.28 * pulse})`); g.addColorStop(1, "rgba(255,60,30,0)");
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 40, 0, 7); c.fill();
  c.strokeStyle = `rgba(255,236,200,${0.85 * pulse})`; c.lineWidth = 2.5; c.beginPath(); c.ellipse(cx, cy, 25, 21, 0, 0, 7); c.stroke();
  c.strokeStyle = `rgba(214,48,32,${0.9 * pulse})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(cx, cy, 28, 24, 0, 0, 7); c.stroke();
  if (!e.fly) { c.fillStyle = "rgba(214,48,32,0.55)"; c.beginPath(); c.ellipse(cx, e.y + e.h + 1, 20, 4, 0, 0, 7); c.fill(); }
  c.restore();
};
// Prizes that pop out of ? blocks: a heart, or the Golden Laurel.
Art.prize = function (it, t) {
  const c = ctx, x = it.x, y = it.y + Math.sin(t / 12) * 3;
  c.save();
  const g = c.createRadialGradient(x, y, 2, x, y, 30);
  g.addColorStop(0, it.kind === "heart" ? "rgba(255,170,160,0.8)" : "rgba(255,230,140,0.9)"); g.addColorStop(1, "rgba(255,230,140,0)");
  c.fillStyle = g; c.beginPath(); c.arc(x, y, 30, 0, 7); c.fill();
  if (it.kind === "heart") heart(x, y - 10, 24, "#e0574a");
  else Art.laurelIcon(x, y, 1, t);
  c.restore();
};
Art.laurelIcon = function (x, y, s, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t / 20) * 0.1);
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + side * (0.45 + i * 0.42), lx = Math.cos(a) * 12, ly = Math.sin(a) * 12;
    c.save(); c.translate(lx, ly); c.rotate(a + side * 0.6);
    c.beginPath(); c.ellipse(0, 0, 3.2, 6.5, 0, 0, 7);
    c.fillStyle = "#f2c63c"; c.fill(); c.strokeStyle = "#8a6410"; c.lineWidth = 1; c.stroke();
    c.restore();
  }
  c.fillStyle = "#b23a2e"; c.beginPath(); c.arc(0, 12, 2.6, 0, 7); c.fill();
  c.restore();
};
// The player shines gold while the laurel lasts.
Art.laurelGlow = function (p, t) {
  const c = ctx, cx = p.x + 15, cy = p.y + 20;
  c.save(); c.globalCompositeOperation = "lighter";
  const g = c.createRadialGradient(cx, cy, 4, cx, cy, 44);
  g.addColorStop(0, "rgba(255,225,120,0.55)"); g.addColorStop(1, "rgba(255,200,80,0)");
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 44, 0, 7); c.fill();
  c.restore();
  Art.laurelIcon(cx, p.y - 6, 0.75, t);
};
// An enemy paused while a sign is open: a pale ring and a sleepy "z z".
Art.frozen = function (e, t) {
  const c = ctx, cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  c.save();
  c.strokeStyle = "rgba(190,215,255,0.9)"; c.lineWidth = 2; c.setLineDash([4, 4]);
  c.beginPath(); c.ellipse(cx, cy, 26, 22, 0, 0, 7); c.stroke(); c.setLineDash([]);
  c.font = `bold 14px ${FONT_B}`; c.textAlign = "center"; c.fillStyle = "#e8f0ff"; c.strokeStyle = "rgba(20,20,40,0.8)"; c.lineWidth = 3;
  for (let i = 0; i < 2; i++) { const yy = e.y - 8 - i * 12 - (t / 4 % 12), xx = cx + 10 + i * 8; c.strokeText("z", xx, yy); c.fillText("z", xx, yy); }
  c.restore();
};
