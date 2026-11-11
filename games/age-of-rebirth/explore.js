"use strict";
// =====================================================================
//  PHASE II · THE AGE OF EXPLORATION
//  Voyage: a sailing level. The caravel sails south along Africa while an
//  onshore wind pushes it toward the rocky coast. Steer with ↑ ↓; answer
//  each gust's two cards with ← → to turn the wind (see LEVELS.L4 below).
//  Chart: the Atlantic sea chart where Phase II lives.
// =====================================================================

// ---------------------------------------------------------------- Voyage 1: the level definition
// How the voyage teaches: each new word arrives as a short picture lesson from the crew,
// at the moment it matters (the compass before the fog, the astrolabe at noon). Then the
// sea itself asks about it. An onshore wind always pushes the caravel toward the rocky
// coast; when a gust builds, two answer cards appear in the sky. Pick the right one
// (← or →) and the wind swings fair; a wrong or slow answer blows you toward the reef.
// New words start as pictures ("Which is the compass?"), then "What is this?", then the
// clue alone, and come back sooner after a miss and later after a hit (spacing).
LEVELS.L4 = {
  id: "L4", num: 4, kind: "voyage", label: "Phase II · Voyage 1", title: "Around the Cape", music: "voyage", bossMusic: "boss3", mix: false,
  zones: [
    { x1: 5200, name: "Lisbon, August 1487", sky: ["#8fc0e0", "#f3e6c8"], sea: ["#3d86a8", "#1f5878"], coast: "lisbon" },
    { x1: 14000, name: "The Coast of Africa", sky: ["#9cc8e2", "#f6e2b4"], sea: ["#3a8fa8", "#1d5f7a"], coast: "desert" },
    { x1: 20600, name: "The Gulf of Guinea", sky: ["#8ec4d8", "#eef0d0"], sea: ["#2f8c96", "#17596a"], coast: "jungle" },
    { x1: 24600, name: "Unknown Waters", sky: ["#a8b4b8", "#e6dcc4"], sea: ["#3a6a7c", "#1a3a4a"], coast: "unknown" },
    { x1: 99999, name: "Beyond the Cape", sky: ["#86b6d8", "#f2e8d0"], sea: ["#2f7ea0", "#164e6c"], coast: "cape" }
  ],
  stormZone: { name: "The Cape of Storms", sky: ["#2c3444", "#5a606a"], sea: ["#2c4a5a", "#142a36"], coast: "none", storm: true },
  comics: {
    intro: [
      { scene: "lisbon", actors: [["john2", 300], ["dias", 470], ["player", 600]], caption: "Lisbon, 1487. King John II of Portugal wants a sea route to the spices of Asia, one that avoids the Mediterranean merchants." },
      { scene: "sea", actors: [["ship", 480]], caption: "He sends Bartolomeu Dias with two caravels and a supply ship. Their mission: sail farther south than anyone, and find the end of Africa." },
      { scene: "storm", actors: [["ship", 420], ["herald", 700]], caption: "The winds here blow toward a rocky coast. Learn the ways of the sea, or be wrecked!" }
    ],
    outro: [
      { scene: "cape", actors: [["dias", 360], ["player", 480], ["crew", 620]], caption: "1488: Dias rounds the tip of Africa. The tired crew begs to turn home, so he heads back, passing the cape he names the Cape of Storms." },
      { scene: "lisbon", actors: [["john2", 360], ["dias", 520]], caption: "King John II renames it the Cape of Good Hope: the sea road to India is open. Ten years later, Vasco da Gama will sail it all the way." }
    ]
  },
  win: { title: "You rounded the Cape!", next: "Sail back to the Lisbon chart for spaced review at <b>Sagres Point</b>, and try again to beat your Renown." },
  hurt: "Your ship was wrecked!"
};
TRACKS.voyage = { bpm: 120, lead: .045, perc: false, lute: true, minor: [9, 2],
  mel: "D5 . . E5 F5 . E5 D5 | C5 . A4 . . . G4 . | A4 . . C5 D5 . E5 . | F5 . E5 . D5 . . . | A5 . . G5 F5 . E5 D5 | C5 . D5 . E5 . A4 . | D5 . . C5 A4 . G4 F4 | D4 . . . . . . .",
  bass: "D3 C3 D3 A2 F3 C3 G2 D3" };

// The sea, top to bottom: horizon, the rocky reef along the coast, open water.
const SEA = { horizon: 250, top: 304, reef: 330, bottom: 496, shipX: 250, lanes: [372, 430, 486] };
const VOYAGE_LEN = 29400;

// The crew's lessons: who says it, what they say, and how it helps you sail.
const LESSONS = {
  car: { who: "dias", name: "Captain Dias", line: "This is our caravel: a small, fast Portuguese ship. Its triangular sails can even sail against the wind.", use: "The wind pushes us toward the rocks. Hold ↓ to steer away from the coast!" },
  dias: { who: "crew", name: "João, a sailor", line: "Our captain is Bartolomeu Dias. King John II sent him to find the southern tip of Africa.", use: "No European has ever sailed around it. We will be the first!" },
  por: { who: "john2", name: "King John II", line: "Portugal is a small kingdom on the edge of Europe, but it faces the open ocean. Our sailors lead the world in exploring!", use: "Sail for Portugal, and bring back the way to India." },
  atl: { who: "dias", name: "Captain Dias", line: "Ahead lies the Atlantic Ocean: the huge ocean west of Europe and Africa. No one knows how far south it goes.", use: "Gusts are coming. Answer fast to turn the wind your way!" },
  med: { who: "trader", name: "A spice trader", line: "Why not sail east? The Mediterranean Sea is ruled by merchants of Venice and Genoa, and the Ottomans hold its eastern ports.", use: "Spices cost a fortune by the time they cross it. So Portugal goes around Africa instead." },
  why: { who: "dias", name: "Captain Dias", line: "Why risk our lives? God, gold, and glory: to spread Christianity, to grow rich from trade, and to win fame for Portugal.", use: "Collect all three on the water: GOD, GOLD, and GLORY. A full set wins royal favor!" },
  cmp: { who: "pilot", name: "Pêro, the pilot", line: "Fog ahead! This compass has a magnetized needle that always points north, even with no sun or stars.", use: "In the fog, follow the compass arrow to the safe channel." },
  risk: { who: "pilot", name: "Pêro, the pilot", line: "Remember the dangers of navigation: storms, hidden reefs, getting lost, and scurvy from no fresh food.", use: "Keep your supplies up with barrels, and stay off the reef!" },
  ast: { who: "pilot", name: "Pêro, the pilot", line: "This is an astrolabe. It measures the sun’s angle above the horizon, which tells us how far north or south we are.", use: "It’s noon. Let’s take a reading!" },
  mer: { who: "trader", name: "A merchant at Elmina", line: "I am a merchant: I buy and sell goods to make a profit. Here at Elmina we trade cloth for gold.", use: "Your trade fills the ship with supplies." },
  nav: { who: "dias", name: "Captain Dias", line: "You’ve learned the compass and the astrolabe. You are now a navigator: someone who plans and steers a ship’s route!", use: "From here on, we sail where no European has sailed." },
  cape: { who: "dias", name: "Captain Dias", line: "Land on our left! We have rounded Africa’s tip. I call it the Cape of Storms. The king will name it the Cape of Good Hope.", use: "It promises a sea road to India!" }
};
const DISCOVERIES = {
  bojador: { name: "Cape Bojador", sub: "Sailors feared it until Gil Eanes passed it in 1434" },
  elmina: { name: "Elmina, the Gold Coast", sub: "A Portuguese trading fort, built 1482" },
  cross: { name: "Cape Cross", sub: "Diogo Cão’s stone pillar, 1486: the farthest any European had sailed" },
  unknown: { name: "Unknown Waters", sub: "Farther south than any European has ever sailed" },
  tip: { name: "The Tip of Africa", sub: "1488: the first Europeans to sail around it" },
  fish: { name: "The Great Fish River", sub: "Here the crew made Dias turn for home" }
};
// Stage 0 prompts: pick the picture.
const PIC_Q = { por: "Which one is Portugal?", mer: "Which one is the merchant?", nav: "Which one is the navigator?", car: "Which one is a caravel?",
  ast: "Which one is an astrolabe?", cmp: "Which one is a compass?", dias: "Which one is Bartolomeu Dias?", atl: "Which map shows the Atlantic Ocean?",
  med: "Which map shows the Mediterranean Sea?", cape: "Which one is the Cape of Good Hope?", why: "Which shows the causes of exploration?", risk: "Which shows the dangers of navigation?" };
const SEA_RANKS = [[0, "Ship’s Boy"], [120, "Deckhand"], [320, "Sailor"], [620, "Navigator"], [1000, "Pilot"], [1500, "Captain"], [2200, "Admiral"]];
const TREASURE = {
  gold: { label: "GOLD", tip: "GOLD: riches from trade in gold and spices." },
  god: { label: "GOD", tip: "GOD: spreading the Christian faith." },
  glory: { label: "GLORY", tip: "GLORY: fame for Portugal’s king and sailors." }
};

function buildVoyage() {
  const o = [], r = mulberry(1487);
  const add = (type, x, y, extra) => o.push({ type, x, y, ...extra });
  const lane = () => SEA.lanes[Math.floor(r() * 3)];
  const lesson = (x, c) => add("lesson", x, 0, { c });
  // lessons, in the order the voyage needs them
  lesson(160, "car"); lesson(1700, "dias"); lesson(3300, "por"); lesson(4800, "atl"); lesson(6400, "med"); lesson(8000, "why");
  lesson(10300, "cmp"); lesson(12400, "risk"); lesson(13700, "ast"); add("astro", 13760, 0, { stop: 0 });
  add("port", 15800, 0, { name: "Elmina", c: "mer", disc: "elmina" }); lesson(18200, "nav");
  add("discover", 13250, 0, { k: "bojador" }); add("discover", 21000, 0, { k: "cross" }); add("discover", 21600, 0, { k: "unknown" });
  add("port", 22600, 0, { name: "the supply ship", supply: true });
  add("boss", 24600, 0);
  lesson(25000, "cape"); add("discover", 25060, 0, { k: "tip" }); add("astro", 26600, 0, { stop: 1 });
  add("finish", 29000, 0);
  add("ms", 7200, 344, { id: "ms_zurara" }); add("ms", 20900, 344, { id: "ms_padrao" }); add("ms", 27400, 344, { id: "ms_barros" });
  // the fog bank (use the compass) and the shoals of Cape Bojador (one safe channel each)
  add("fog", 10500, 0, { len: 1700 });
  [[10900, 1], [11350, 2], [11800, 0], [12900, 1], [13100, 0], [13300, 2]].forEach(([x, gap]) => SEA.lanes.forEach((y, i) => { if (i !== gap) add("rock", x, y, { r: 22, wall: true }); }));
  // islets, supplies and God, gold, glory along the way
  const busy = x => o.some(q => Math.abs(q.x - x) < 260 && (q.type === "lesson" || q.type === "port" || q.wall || q.type === "astro" || q.type === "boss"));
  for (let x = 2200; x < 28600; x += 620 + r() * 300) { if (!busy(x) && !(x > 10400 && x < 13500) && !(x > 24300 && x < 25200)) add("rock", x, lane(), { r: 22 }); }
  for (let x = 1100; x < 28600; x += 1500 + r() * 400) if (!busy(x)) add("barrel", x + 200, lane());
  const kinds = ["gold", "god", "glory"];
  let k = 0;
  for (let x = 8300; x < 28600; x += 380 + r() * 260) { if (busy(x) || (x > 24300 && x < 25200)) continue; add("treasure", x, lane(), { kind: kinds[k++ % 3] }); }
  // never put a treasure or barrel right on a rock
  const out = o.filter(q => !((q.type === "treasure" || q.type === "barrel") && o.some(rk => rk.type === "rock" && Math.abs(rk.x - q.x) < 90 && rk.y === q.y)));
  return out.sort((a, b) => a.x - b.x);
}

class Voyage {
  constructor(def) {
    this.def = def;
    this.focus = LEVEL_CODEX[def.id];
    this.replay = !!(SAVE.levels[def.id] && SAVE.levels[def.id].done);
    this.objs = buildVoyage();
    this.length = VOYAGE_LEN;
    for (const o of this.objs) if (o.type === "ms") o.taken = !!SAVE.manuscripts[o.id];
    this.d = 0; this.drift = 0; this.speed = 3;
    this.p = { y: 440, vy: 0, hearts: 4, maxHearts: 4, inv: 0, tilt: 0, face: 1 };
    Object.defineProperty(this.p, "x", { get: () => this.d });   // races measure progress by p.x
    this.supplies = 100; this.scurvyT = 0; this.checkpoint = 0;
    this.quick = { n: 0, right: 0, fast: 0, ms: [] }; this.deep = { n: 0, right: 0 }; this.byConcept = {};
    this.florinsEarned = 0; this.won = false; this.busy = false; this.boss = null; this.storm = null;
    this.banner = null; this.zone = -1; this.msg = null; this.fx = [];
    // the wind and the questions it brings
    this.active = []; this.st = {}; this.gi = 0; this.gust = null; this.gap = 200; this.shove = 0; this.boost = 0; this.tutorial = 0;
    this.combo = 0; this.bestCombo = 0; this.renown = 0; this.rank = 0;
    this.treasure = { gold: 0, god: 0, glory: 0 }; this.sets = 0; this.tipShown = {};
    this.found = {};
  }
  get W() { return this.length / T; }
  get cam() { return this.d; }
  zoneOf(d) { const z = this.def.zones.findIndex(z => d <= z.x1); return z < 0 ? this.def.zones.length - 1 : z; }
  zoneDef() { return this.storm ? this.def.stormZone : this.def.zones[this.zoneOf(this.d)]; }
  sx(o) { return o.x - this.d + SEA.shipX; }
  queueGhost() { }                                  // missed words come back through the wind instead

  // ------------------------------------------------------------ update
  update() {
    const p = this.p;
    if (this.busy) return;
    if (p.inv > 0) p.inv--;
    const zi = this.zoneOf(this.d);
    if (zi !== this.zone && !this.storm) {
      this.zone = zi; const z = this.def.zones[zi];
      this.banner = { text: z.name, sub: `Phase II · Voyage 1 · Leg ${zi + 1} of ${this.def.zones.length}`, t: 200 };
    }
    if (this.banner && --this.banner.t <= 0) this.banner = null;
    if (this.msg && --this.msg.t <= 0) this.msg = null;

    // steering against the onshore wind
    const g = this.gust, S = this.storm;
    let wind = S ? 0.2 : 0.11;
    if (g && g.phase === "ask") wind = (S ? 0.22 : 0.14) + 0.78 * Math.pow(g.t / g.T, 2);
    if (this.shove > 0) { this.shove--; wind = 0.95; }
    if (this.boost > 0) wind = -0.05;
    const up = keys.up || keys.jump, down = keys.down;
    p.vy += -wind + (up ? -0.5 : 0) + (down ? 0.55 : 0); p.vy *= 0.86;
    p.y = clamp(p.y + p.vy, SEA.top, SEA.bottom); p.tilt = p.vy * 0.02;
    this.windNow = wind;
    if (p.y < SEA.reef + 4 && p.inv <= 0) { this.damage(); p.vy = 7; toast("Crunch! The reef! Steer away from the coast (↓)."); }

    // sailing on
    let target = S ? 0 : 3 + Math.min(1.6, this.combo * 0.16);
    if (this.boost > 0) { this.boost--; target += 2.6; if (G.t % 3 === 0) this.fx.push({ k: "wind", x: SEA.shipX - 40, y: p.y - 50 + rnd(-30, 30), t: 30 }); }
    const fog = this.inFog();
    if (fog) target = Math.min(target, 3.2);
    this.speed += (target - this.speed) * 0.05;
    if (S) this.drift += 2.4 + (this.boost > 0 ? 3 : 0); else this.d += this.speed;

    // supplies and scurvy
    this.supplies = Math.max(0, this.supplies - 0.02 * Math.max(1, this.speed / 3));
    if (this.supplies <= 0) { if (++this.scurvyT % 420 === 1) { this.damage(true); toast("Scurvy! The crew is sick without fresh food. Grab a supply barrel!"); } }
    else this.scurvyT = 0;

    this.updateGust();
    if (S) { this.updateStorm(); this.fx = this.fx.filter(f => --f.t > 0); return; }

    for (const o of this.objs) {
      if (o.done) continue;
      const dx = o.x - this.d;
      if (dx > 1100) break;
      if (o.type === "rock") { if (Math.abs(dx) < o.r + 22 && Math.abs(o.y - p.y) < o.r + 12 && p.inv <= 0) { this.damage(); p.vy += o.y > p.y ? -6 : 6; this.speed *= 0.5; } continue; }
      if (o.type === "barrel" && this.hit(o, 34)) { o.done = true; this.supplies = Math.min(100, this.supplies + 30); Sfx.play("coin"); floatText(this.d, p.y - 70, "+ supplies", "#cfe9b0"); continue; }
      if (o.type === "treasure" && this.hit(o, 36)) { o.done = true; this.collectTreasure(o); continue; }
      if (o.type === "ms" && !o.taken && this.hit(o, 40)) { o.taken = true; this.collectManuscript(o); return; }
      if (o.type === "lesson" && dx <= 0) { o.done = true; this.checkpoint = o.x; this.lesson(o.c); return; }
      if (o.type === "port" && dx <= 0) { o.done = true; this.dock(o); return; }
      if (o.type === "discover" && dx <= 0) { o.done = true; this.discover(o.k); continue; }
      if (o.type === "astro" && dx <= 0) { o.done = true; this.endGust(); this.busy = true; runAstrolabe(this, ASTROLABE_STOPS[o.stop]).then(() => { this.busy = false; this.addRenown(40, "Position fixed!"); }); return; }
      if (o.type === "boss" && dx <= 0) { o.done = true; this.startStorm(); return; }
      if (o.type === "finish" && dx <= 0) { o.done = true; this.discover("fish"); this.finish(); return; }
    }
    if (this.def.zones[zi].coast === "unknown") this.weather(0.5);
    this.fx = this.fx.filter(f => --f.t > 0);
  }
  inFog() { const f = this.objs.find(o => o.type === "fog"); return f && this.d > f.x && this.d < f.x + f.len ? f : null; }
  hit(o, r) { return Math.abs(o.x - this.d) < r && Math.abs(o.y - this.p.y) < r; }
  damage(silent) {
    const p = this.p;
    if (p.inv > 0 && !silent) return;
    p.hearts--; p.inv = 90; G.shake = 10; Sfx.play("hurt"); this.combo = 0;
    burst(this.d, p.y - 20, "#b98549", 16, 3.5);
    if (p.hearts <= 0) this.sink();
  }
  sink() {
    const p = this.p;
    const lost = Math.min(SAVE.florins, 5); SAVE.florins -= lost; writeSave();
    p.hearts = p.maxHearts; p.inv = 150; p.y = 440; p.vy = 0; this.supplies = Math.max(this.supplies, 80);
    this.endGust(); this.gap = 200;
    if (this.storm) { toast(`Wrecked on the rocks! The crew patches the hull and fights on (−${lost} florins).`); return; }
    this.d = this.checkpoint; this.speed = 2;
    for (const o of this.objs) if (o.x > this.d && (o.type === "rock" || o.type === "barrel")) o.done = false;
    toast(`Shipwreck! Your crew limps back and repairs the ship (−${lost} florins).`);
  }
  addRenown(n, label) {
    this.renown += n;
    if (label) floatText(this.d, this.p.y - 110, `${label} +${n}`, "#fff3c4");
    while (this.rank < SEA_RANKS.length - 1 && this.renown >= SEA_RANKS[this.rank + 1][0]) {
      this.rank++; Sfx.play("buff");
      toast(`Promoted: ${SEA_RANKS[this.rank][1]}!`, "ach");
    }
  }

  // ------------------------------------------------------------ the gust: a two-card question in the sky
  // Each word moves through stages: 0 pick the picture, 1 name the picture, 2 match the clue.
  pickPrompt() {
    const L4 = this.active;
    if (!L4.length) return null;
    // a few echoes of earlier units once the voyage is well under way
    if (this.d > 15000 && this.gi % 6 === 5) {
      const it = Learn.pickFlash({ dir: "cue" });
      if (it && !LEVEL_CODEX.L4.includes(it.c) && it.options.length >= 2) {
        const other = it.options.find(o => o !== it.answer);
        return { c: it.c, dir: "cue", stage: 2, echo: true, prompt: it.prompt, answer: it.answer, options: shuffle([it.answer, other]), fix: it.fix };
      }
    }
    let c = null, best = 1e9;
    for (const k of L4) { const s = this.st[k], score = s.due * 10 + s.stage - (k === L4[L4.length - 1] ? 3 : 0) + Math.random(); if (k !== this.lastC || L4.length === 1) if (score < best) { best = score; c = k; } }
    const s = this.st[c];
    // picture cards need a voyage word (only those have pictures); keep it clearly different
    const d = Learn.clearDistractors(c, L4.length > 1 ? L4 : LEVEL_CODEX.L4, 1)[0] || Learn.clearDistractors(c, LEVEL_CODEX.L4, 1)[0];
    this.lastC = c;
    if (s.stage === 0) return { c, dir: "pic", stage: 0, prompt: PIC_Q[c], answer: c, options: shuffle([c, d]), pic: true, fix: `${SHORT[c]}: ${FLASH[c][0]}` };
    if (s.stage === 1) return { c, dir: "pic", stage: 1, prompt: "What is this?", promptPic: c, answer: SHORT[c], options: shuffle([SHORT[c], SHORT[d]]), fix: `${SHORT[c]}: ${FLASH[c][0]}` };
    // stage 2: the clue alone; the wrong answer can come from any unit the student knows
    const d2 = Learn.clearDistractors(c, CODEX_ORDER.filter(k => Learn.isIntroduced(k)), 1)[0] || d;
    return { c, dir: "cue", stage: 2, prompt: FLASH[c][Math.floor(Math.random() * FLASH[c].length)], answer: SHORT[c], options: shuffle([SHORT[c], SHORT[d2]]), fix: `${SHORT[c]} = ${FLASH[c][0]}` };
  }
  updateGust() {
    const g = this.gust;
    if (!g) {
      if (!this.active.length) return;
      if (--this.gap > 0) return;
      const item = this.pickPrompt(); if (!item) return;
      const T = this.storm ? 300 : item.stage === 2 ? 360 : 330;
      this.gust = { phase: "ask", t: 0, T, item, t0: performance.now() };
      this.gi++; Sfx.play("whoosh");
      return;
    }
    g.t++;
    if (g.phase === "ask") {
      let pick = null;
      if (pressed.left) pick = 0; else if (pressed.right) pick = 1; else if (this.clickPick !== undefined) pick = this.clickPick;
      this.clickPick = undefined;
      if (pick !== null) this.answer(pick);
      else if (g.t >= g.T) this.answer(-1);
    } else if (g.t >= g.T) { this.gust = null; this.gap = this.storm ? 45 : Math.max(70, 150 - this.combo * 6); }
  }
  answer(pick) {
    const g = this.gust, it = g.item, p = this.p;
    const ok = pick >= 0 && it.options[pick] === it.answer;
    const ms = pick >= 0 && it.stage > 0 ? performance.now() - g.t0 : null;
    g.phase = "result"; g.pick = pick; g.ok = ok; g.t = 0; g.T = ok ? 55 : 120;
    afterQuick(it, ok, ms);
    // this voyage's own spacing: hits come back later, misses come back soon
    const s = this.st[it.c];
    if (s) {
      if (ok) { s.n++; s.stage = Math.min(2, s.stage + 1); s.due = this.gi + [1, 2, 3, 5, 8][Math.min(4, s.n)]; }
      else { s.n = Math.max(0, s.n - 1); s.stage = Math.max(0, s.stage - 1); s.due = this.gi + 1; }
    }
    if (ok) {
      this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.boost = this.storm ? 60 : 150; p.vy += 3.5;
      const mult = 1 + Math.floor(this.combo / 3);
      this.addRenown(10 * mult, this.combo >= 3 ? `Fair winds ×${mult}` : "Fair wind!");
      Sfx.play("ding"); burst(this.d, p.y - 60, "#ffd75e", 18, 3.5);
      if (this.storm) this.stormDay();
      if (this.combo === 5) award("streak5");
    } else {
      this.combo = 0; this.shove = 60; p.vy -= 3.5;
      Sfx.play("wrong"); G.shake = 6;
    }
    if (this.tutorial < 3) this.tutorial++;
  }
  endGust() { this.gust = null; this.shove = 0; }
  clickCards(x, y) {
    if (!this.gust || this.gust.phase !== "ask") return;
    const r = gustCardRects(this.gust.item);
    r.forEach((b, i) => { if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) this.clickPick = i; });
  }

  // ------------------------------------------------------------ lessons, treasure, discoveries
  async lesson(c) {
    this.endGust(); this.busy = true; G.modal = true; clearKeys();
    const first = !Learn.isIntroduced(c);
    if (first) Learn.introduce(c);
    await showVoyageLesson(c, first);
    G.modal = false; clearKeys(); this.busy = false;
    if (first) award("first_codex");
    if (!this.active.includes(c)) this.active.push(c);
    const box = Learn.fstat(c).box;
    this.st[c] = { stage: first ? 0 : box >= 3 ? 2 : 1, n: 0, due: this.gi };
    this.gap = c === "car" ? 240 : 60;
    if (this.focus.every(k => Learn.isIntroduced(k))) award("polymath4");
    this.addRenown(15);
  }
  collectTreasure(o) {
    const T0 = TREASURE[o.kind];
    this.treasure[o.kind]++; Sfx.play("coin");
    burst(this.d, this.p.y - 30, o.kind === "gold" ? "#ffd75e" : o.kind === "god" ? "#fff6d8" : "#e0574a", 14, 3);
    if (!this.tipShown[o.kind]) { this.tipShown[o.kind] = true; toast(T0.tip, "buff"); }
    this.addRenown(5, T0.label);
    const sets = Math.min(this.treasure.gold, this.treasure.god, this.treasure.glory);
    if (sets > this.sets) {
      this.sets = sets;
      const p = this.p; if (p.hearts < p.maxHearts) p.hearts++;
      gainFlorins(10, this.d, p.y - 80); this.addRenown(30);
      toast("God, gold, and glory! Royal favor: the hull is repaired.", "streak"); Sfx.play("auto");
    }
  }
  discover(k) {
    if (this.found[k]) return;
    this.found[k] = true;
    const D = DISCOVERIES[k];
    this.banner = { text: D.name, sub: "Discovered!", line: D.sub, t: 260, disc: true };
    Sfx.play("win"); this.addRenown(50);
    this.checkpoint = this.d;
  }
  async collectManuscript(o) {
    Sfx.play("page"); burst(this.d, this.p.y - 30, "#ffe58a", 26, 4.5);
    const M = MANUSCRIPTS.find(x => x.id === o.id), first = !SAVE.manuscripts[M.id];
    SAVE.manuscripts[M.id] = true; writeSave();
    this.endGust(); this.busy = true; G.modal = true; clearKeys();
    const ok = await Quiz.ask(M.q, { title: `Lost Manuscript · ${M.title}`, subtitle: "A real primary source. Read it like a historian.", boss: true });
    G.modal = false; clearKeys(); this.busy = false;
    afterAnswer(M.q, ok, Learn.record(M.q, ok));
    if (ok && first) gainFlorins(15, this.d, this.p.y - 40);
    this.addRenown(ok ? 60 : 20);
    const found = MANUSCRIPTS.filter(x => x.level === this.def.id && SAVE.manuscripts[x.id]).length;
    toast(`Lost Manuscript found · ${found} of 3 on this voyage`, "ach");
    if (found === 3) award("seal4");
    award("archivist");
  }
  async dock(o) {
    this.endGust(); this.speed = 0; this.checkpoint = o.x + 40;
    Sfx.play("check");
    if (o.disc) this.discover(o.disc);
    if (o.c) await this.lesson(o.c);
    const p = this.p;
    this.supplies = 100; p.hearts = p.maxHearts;
    toast(o.supply ? "You meet your supply ship: fresh water, food, and repairs." : `A good trade at ${o.name}! Full supplies and a repaired hull.`, "buff");
    if (!o.supply) gainFlorins(10, this.d, p.y - 60);
  }

  // ------------------------------------------------------------ weather
  weather(rate) {
    if (Math.random() < 0.006 * rate) this.fx.push({ k: "bolt", x: SEA.shipX + rnd(-40, 380), y: SEA.lanes[Math.floor(Math.random() * 3)] + rnd(-20, 20), t: 80 });
    if (Math.random() < 0.004 * rate) this.fx.push({ k: "wave", x: VW + 60, y: SEA.lanes[Math.floor(Math.random() * 3)], t: 400 });
    this.hazards();
  }
  hazards() {
    const p = this.p, sx = SEA.shipX;
    for (const f of this.fx) {
      if (f.k === "bolt" && f.t === 15) { G.shake = 8; Sfx.play("stomp"); if (Math.abs(f.x - sx) < 46 && Math.abs(f.y - p.y) < 40) this.damage(); }
      if (f.k === "wave") { f.x -= 5; if (Math.abs(f.x - sx) < 40 && Math.abs(f.y - p.y) < 34) { this.damage(); p.vy += f.y > p.y ? -7 : 7; } if (f.x < -80) f.t = 0; }
    }
  }

  // ------------------------------------------------------------ the Cape of Storms: survive 13 days
  startStorm() {
    this.storm = { day: 0, need: 13, t: 0, dying: 0, flash: 0 };
    this.endGust(); this.gap = 90; this.speed = 0;
    Music.play(this.def.bossMusic); Sfx.play("boss"); G.shake = 14;
    this.banner = { text: "The Cape of Storms", sub: "Survive the storm", line: "Every right answer keeps you afloat one more day. Survive 13 days!", t: 280, disc: true };
  }
  stormDay() {
    const S = this.storm;
    S.day++; S.flash = 20;
    if (S.day >= S.need) { S.dying = 1; this.endGust(); this.fx = []; award("boss4"); Sfx.play("win"); this.addRenown(150, "Storm survived"); }
  }
  updateStorm() {
    const S = this.storm;
    S.t++;
    if (S.dying) {
      this.gust = null;
      if (++S.dying > 150) { this.storm = null; this.zone = -1; Music.play(this.def.music); this.speed = 3; this.gap = 120; toast("The storm breaks. Dias turns north… and there is land on your LEFT!", "buff"); }
      return;
    }
    this.weather(1.6 + S.day * 0.1);
  }

  async finish() { this.endGust(); this.busy = true; this.speed = 0; await this.win(); }
  async win() {
    const best = SAVE.voyBest || 0;
    if (this.renown > best) { SAVE.voyBest = this.renown; writeSave(); }
    toast(`Renown ${this.renown}${this.renown > best ? " · a new record!" : ` · best ${best}`} · Rank: ${SEA_RANKS[this.rank][1]}`, "ach");
    await Level.prototype.win.call(this);
  }
  draw() { Art.voyage(this); }
}

// Card positions for the gust question (shared by drawing and clicking).
function gustCardRects(it) { const o = it && it.promptPic ? 90 : 0; return [{ x: VW / 2 - 236 - o, y: 118, w: 220, h: 112 }, { x: VW / 2 + 16 + o, y: 118, w: 220, h: 112 }]; }
cv.addEventListener("click", e => {
  if (G.scene !== "level" || !G.level || !(G.level instanceof Voyage) || G.modal) return;
  const r = cv.getBoundingClientRect();
  G.level.clickCards((e.clientX - r.left) * VW / r.width, (e.clientY - r.top) * VH / r.height);
});

// The crew teaches a new word: a picture, one or two plain sentences, and how it helps you sail.
function showVoyageLesson(c, first) {
  return new Promise(res => {
    const L = LESSONS[c], n = Learn.introducedCount();
    openPanel(`<div class="eyebrow">${first ? `New word · Codex ${n} of ${CODEX_ORDER.length}` : "Remember this word?"}</div>
      <div class="vlesson">
        <canvas class="vpic" width="300" height="220" aria-hidden="true"></canvas>
        <div>
          <h2>${esc(CONCEPTS[c].name)}</h2>
          <p class="vsay"><canvas class="vwho" width="64" height="64" aria-hidden="true"></canvas><span><b>${esc(L.name)}:</b> “${esc(L.line)}”</span></p>
          <p class="vuse">${esc(L.use)}</p>
        </div>
      </div>
      <div class="row"><button class="btn primary" id="cgo" autofocus>Aye! ▶</button></div>`, "wide");
    const pic = panelEl.querySelector(".vpic"), who = panelEl.querySelector(".vwho");
    Art.drawInto(pic, 300, 220, () => Art.termIcon(c, 150, 115, 1.6, 100, true));
    Art.drawInto(who, 64, 64, () => { ctx.translate(32, 64); ctx.scale(1.1, 1.1); ctx.translate(0, 22); Art.npc(L.who, 0, 0, 40, 1); });
    if (typeof readAloud === "function") readAloud(`${CONCEPTS[c].name}. ${L.line}`);
    onPanelClick("#cgo", () => { if (typeof stopReading === "function") stopReading(); closePanel(); res(); });
  });
}


// ---------------------------------------------------------------- the astrolabe
// Line the sighting rule up with the noon sun, read the angle, and find your latitude.
function runAstrolabe(V, stop) {
  return new Promise(resolve => {
    G.modal = true; clearKeys();
    let ang = 20, done = false;
    openPanel(`<div class="eyebrow">The Astrolabe · ${esc(stop.place)}</div>
      <h2 class="center">Where are we?</h2>
      <p class="small center">It’s noon. Turn the sighting rule with <b>← →</b> (or the slider) until it points at the sun, then take your reading.</p>
      <canvas id="astro" width="640" height="300" style="width:100%;max-width:560px;display:block;margin:0 auto;border-radius:10px"></canvas>
      <input id="astroR" type="range" min="0" max="90" value="20" aria-label="Sighting angle" style="width:100%;max-width:560px;display:block;margin:10px auto">
      <p class="center" id="astroMsg" aria-live="polite"></p>
      <div class="row"><button class="btn primary" id="astroGo" disabled>Take the reading</button></div>`, "wide");
    const cv2 = panelEl.querySelector("#astro"), x = cv2.getContext("2d"), rng = panelEl.querySelector("#astroR"), msg = panelEl.querySelector("#astroMsg"), go = panelEl.querySelector("#astroGo");
    const draw = () => {
      const W = 640, H = 300, ox = 150, oy = 270, R = 170;
      x.fillStyle = "#cfe3ee"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#3f7fa6"; x.fillRect(0, oy, W, H - oy);
      x.strokeStyle = "#1e3a50"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, oy); x.lineTo(W, oy); x.stroke();
      const sa = stop.sunAngle * Math.PI / 180, sx = ox + Math.cos(sa) * (R + 40), sy = oy - Math.sin(sa) * (R + 40);
      const locked = Math.abs(ang - stop.sunAngle) <= 2;
      x.fillStyle = locked ? "rgba(255,220,120,0.6)" : "rgba(255,230,150,0.35)"; x.beginPath(); x.arc(sx, sy, 34, 0, 7); x.fill();
      x.fillStyle = "#f6c23e"; x.beginPath(); x.arc(sx, sy, 20, 0, 7); x.fill();
      // the brass astrolabe and its scale
      x.strokeStyle = "#8a6410"; x.lineWidth = 8; x.beginPath(); x.arc(ox, oy, 100, Math.PI, 2 * Math.PI); x.stroke();
      x.strokeStyle = "#5a3f10"; x.lineWidth = 1;
      for (let a = 0; a <= 90; a += 10) { const r = a * Math.PI / 180; x.beginPath(); x.moveTo(ox + Math.cos(r) * 92, oy - Math.sin(r) * 92); x.lineTo(ox + Math.cos(r) * 108, oy - Math.sin(r) * 108); x.stroke(); x.fillStyle = "#3a2a10"; x.font = "12px sans-serif"; x.fillText(a + "°", ox + Math.cos(r) * 124 - 10, oy - Math.sin(r) * 124 + 4); }
      const r = ang * Math.PI / 180;
      x.strokeStyle = locked ? "#2f7a64" : "#2b1d14"; x.lineWidth = 4; x.beginPath(); x.moveTo(ox, oy); x.lineTo(ox + Math.cos(r) * R, oy - Math.sin(r) * R); x.stroke();
      x.fillStyle = "#c9a227"; x.beginPath(); x.arc(ox, oy, 9, 0, 7); x.fill();
      x.fillStyle = "#2b1d14"; x.font = "bold 18px sans-serif"; x.fillText(`Angle: ${ang}°`, 20, 30);
      go.disabled = !locked || done;
      if (!done) msg.textContent = locked ? "Lined up with the sun! Take your reading." : "Keep turning until the rule points at the sun.";
    };
    const setA = v => { ang = clamp(Math.round(v), 0, 90); rng.value = ang; draw(); };
    rng.oninput = () => setA(+rng.value);
    const key = e => { if (e.key === "ArrowLeft") { e.preventDefault(); setA(ang + 1); } if (e.key === "ArrowRight") { e.preventDefault(); setA(ang - 1); } };
    document.addEventListener("keydown", key);
    draw();
    go.onclick = async () => {
      if (done) return; done = true;
      document.removeEventListener("keydown", key);
      msg.innerHTML = `The sun is <b>${stop.sunAngle}°</b> above the horizon. On this day, latitude = 90° − ${stop.sunAngle}° = <b>${stop.lat}° ${stop.dir === "N" ? "north" : "south"}</b>. You are ${esc(stop.place)}!<br><span class="tiny">(Simplified: real navigators also used tables of the sun’s position for each day of the year.)</span>`;
      go.textContent = "Continue ▶"; go.disabled = false;
      go.onclick = async () => {
        closePanel(); G.modal = false; clearKeys();
        award("astrolabe");
        resolve();
      };
    };
  });
}

// ---------------------------------------------------------------- the Atlantic chart (Phase II map)
const CHART_H = 1150;
const cproj = (lon, lat) => [(lon + 30) * 12.8, 30 + (50 - lat) * 12.4];
const CHART_NODES = {
  biscay: { lon: -6, lat: 46.5, name: "Back to Europe", type: "back" },
  lisbon: { lon: -9.1, lat: 38.7, name: "Lisbon", type: "level", level: "L4" },
  sagres: { lon: -11.8, lat: 35.2, name: "Sagres Point", type: "review" },
  verde: { lon: -23.5, lat: 15.1, name: "Cape Verde Islands", type: "locked" },
  cape: { lon: 18.5, lat: -34.4, name: "Cape of Good Hope", type: "landmark" },
  india: { lon: 40, lat: -12, name: "Toward India", type: "locked" }
};
for (const k in CHART_NODES) { const [x, y] = cproj(CHART_NODES[k].lon, CHART_NODES[k].lat); CHART_NODES[k].x = x; CHART_NODES[k].y = y; }
const CHART_EDGES = [["biscay", "lisbon", () => true], ["lisbon", "sagres", () => true], ["lisbon", "cape", () => levelDone("L4")], ["sagres", "verde", () => false], ["cape", "india", () => false]];
// The route Dias sailed, for the chart and the voyage's mini-map.
const DIAS_ROUTE = [[-9.1, 38.7], [-12, 32], [-16.5, 24], [-18, 15], [-14, 8], [-6, 3], [4, 2], [9, -3], [12, -12], [13.5, -20], [14, -27], [12, -36], [16, -41], [22, -38], [22.1, -34.4], [26.5, -33.9]];
const AFRICA = [[-5.8, 35.8], [-7.6, 33.6], [-9.8, 30.4], [-12.9, 27.9], [-14.5, 26.1], [-16.5, 23.5], [-17, 20.8], [-16.3, 18], [-17.5, 14.7], [-16.7, 12.3], [-15.6, 11.9], [-13.2, 8.5], [-11.4, 6.8], [-7.5, 4.4], [-3.5, 5.1], [-0.2, 5.6], [3.4, 6.4], [6, 4.3], [8.5, 4.6], [9.7, 4], [9.5, 1], [8.7, -0.7], [11.8, -4.5], [12.3, -6], [13.2, -8.8], [13.4, -12.6], [12.1, -15.2], [11.8, -18], [14.5, -22.9], [15.2, -26.6], [16.5, -28.6], [17.8, -31.5], [18.4, -33.9], [18.5, -34.4], [20, -34.8], [22.1, -34.2], [25.6, -34], [27.1, -33.5], [27.9, -33], [31, -29.9], [32.6, -26], [35.5, -24], [34.8, -19.8], [36.8, -17.9], [40.7, -15], [40.4, -10.5], [39.3, -6.8], [39.7, -4], [41.5, -1.5], [45.3, 2], [49, 7.5], [51.3, 11.8], [43.4, 11.3], [43.1, 11.6], [39.5, 15.6], [37.2, 19.6], [35.6, 23.9], [32.5, 29.9], [29.9, 31.2], [25, 31.6], [20.1, 32.1], [16.6, 31.2], [13.2, 32.9], [11, 33.8], [10.2, 36.8], [3, 36.8], [-0.6, 35.7], [-2, 35.1]];
const ARABIA = [[32.5, 29.9], [34.5, 29.5], [35, 28], [39.2, 21.5], [43.5, 12.8], [45, 12.8], [52, 15.5], [57.5, 18.5], [59.8, 22.5], [56.3, 26], [51.5, 24], [48, 29.8], [47.5, 31.5], [45, 33], [40, 37], [36, 36.8], [35.5, 33.5], [34.5, 31.5]];

const Chart = {
  cur: "lisbon", from: null, to: null, t: 0, camY: null, base: null,
  init() { if (SAVE.chartNode && CHART_NODES[SAVE.chartNode]) this.cur = SAVE.chartNode; if (!this.base) this.base = buildChartBase(); },
  neighbors(n) { return CHART_EDGES.filter(e => e[0] === n || e[1] === n).map(e => ({ n: e[0] === n ? e[1] : e[0], open: e[2]() })); },
  update() {
    if (this.to) {
      const a = CHART_NODES[this.from], b = CHART_NODES[this.to];
      this.t += 2.6 / Math.hypot(b.x - a.x, b.y - a.y);
      if (this.t >= 1) { this.cur = this.to; this.to = null; SAVE.chartNode = this.cur; writeSave(); updateMapBar(); }
      return;
    }
    let dir = null;
    if (keys.left) dir = [-1, 0]; else if (keys.right) dir = [1, 0]; else if (keys.up) dir = [0, -1]; else if (keys.down) dir = [0, 1];
    if (dir) {
      const here = CHART_NODES[this.cur]; let best = null, bd = 0.35;
      for (const nb of this.neighbors(this.cur)) {
        if (!nb.open) continue;
        const o = CHART_NODES[nb.n], dx = o.x - here.x, dy = o.y - here.y, len = Math.hypot(dx, dy);
        const dot = (dx * dir[0] + dy * dir[1]) / len;
        if (dot > bd) { bd = dot; best = nb.n; }
      }
      if (best) { this.from = this.cur; this.to = best; this.t = 0; Sfx.play("step"); }
    }
    if (pressed.enter || pressed.jump) activateChartNode(this.cur);
  },
  pos() { if (!this.to) return CHART_NODES[this.cur]; const a = CHART_NODES[this.from], b = CHART_NODES[this.to]; return { x: a.x + (b.x - a.x) * this.t, y: a.y + (b.y - a.y) * this.t }; },
  draw() { Art.chart(this); }
};
function activateChartNode(k) {
  const n = CHART_NODES[k];
  if (n.type === "level") startLevel(n.level);
  else if (n.type === "review") runReview();
  else if (n.type === "back") { SAVE.sheet = "europe"; SAVE.mapNode = "iberia"; writeSave(); toMap(); }
  else if (n.type === "landmark") toast("The Cape of Good Hope. Bartolomeu Dias first called it the Cape of Storms.");
  else toast("Future voyages will sail here.");
}
function updateChartBar(bar) {
  const k = Chart.cur, n = CHART_NODES[k];
  let title = n.name, desc = "", action = "";
  if (n.type === "level") {
    const L = LEVELS[n.level], st = SAVE.levels[n.level] ? SAVE.levels[n.level].stars : 0;
    title = `Lisbon · Phase II, Voyage 1: ${L.title}`;
    desc = st ? `Best: ${"★".repeat(st)}${"☆".repeat(3 - st)} · Renown record ${SAVE.voyBest || 0}. Lost Manuscripts: ${MANUSCRIPTS.filter(m => m.level === n.level && SAVE.manuscripts[m.id]).length} of 3.` : "1487: sail with Bartolomeu Dias into unknown waters. Learn the ways of the sea, or the wind will drive you onto the rocks!";
    action = `<button class="btn primary" id="mbgo">${st ? "Sail again" : "Set sail"} ▶</button>`;
  }
  if (n.type === "review") { const due = Learn.dueForReview(); title = "Sagres Point · Hall of Memory"; desc = `Spaced review on the edge of Europe. ${due} memor${due === 1 ? "y is" : "ies are"} ready now.`; action = `<button class="btn primary" id="mbgo">Review ▶</button>`; }
  if (n.type === "back") { desc = "Sail north to the map of Europe."; action = `<button class="btn primary" id="mbgo">Sail north ▶</button>`; }
  if (n.type === "landmark") desc = "Renamed the Cape of Good Hope by King John II: it promised a route to India.";
  if (n.type === "locked") desc = "Future voyages of the Age of Exploration will sail here.";
  bar.innerHTML = `<div class="mbtext"><b>${esc(title)}</b><span>${esc(desc)}</span></div>
    <div class="mbbtns">${action}${typeof Race !== "undefined" && Race.ready ? `<button class="btn" id="mbrace">${Race.active ? "Race ●" : Sync.teacher ? "Host race" : "Join race"}</button>` : ""}${Sync.teacher ? `<button class="btn" id="mbteach">Class</button>` : ""}<button class="btn" id="mbmenu">Menu</button></div>`;
  const go = document.getElementById("mbgo"); if (go) go.onclick = () => activateChartNode(k);
  document.getElementById("mbmenu").onclick = showPause;
  const tb = document.getElementById("mbteach"); if (tb) tb.onclick = () => showTeacher();
  const rb = document.getElementById("mbrace"); if (rb) rb.onclick = () => Race.openMenu();
}
function toChart() {
  G.level = null; G.parts = []; G.floats = [];
  SAVE.sheet = "atlantic"; writeSave();
  Chart.init(); setScene("chart"); updateMapBar(); Music.play("voyage");
}

// Click a chart node to sail there (or to open it if the ship is already there).
cv.addEventListener("click", e => {
  if (G.scene !== "chart" || G.modal || Chart.to) return;
  const r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) * VW / r.width, y = (e.clientY - r.top) * VH / r.height + (Chart.camY || 0);
  for (const k in CHART_NODES) {
    const n = CHART_NODES[k];
    if (Math.hypot(n.x - x, n.y - y) > 24) continue;
    if (k === Chart.cur) activateChartNode(k);
    else if (Chart.neighbors(Chart.cur).some(nb => nb.n === k && nb.open)) { Chart.from = Chart.cur; Chart.to = k; Chart.t = 0; Sfx.play("step"); }
  }
});
