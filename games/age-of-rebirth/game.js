"use strict";
// =====================================================================
//  THE AGE OF REBIRTH — GAME
//  Scenes: title → map (overworld) → level (platformer) → results → map
// =====================================================================

const T = 32, VW = 960, VH = 544;
const S = 1.5;                       // sprite scale
const cv = document.getElementById("game");
let ctx = cv.getContext("2d");   // art.js draws through this; comic panels swap it briefly
const FONT_D = '"IM Fell English SC", Georgia, serif';
const FONT_B = '"Alegreya Sans", "Trebuchet MS", sans-serif';

// ---------------------------------------------------------------- audio
let AC = null;
function audio() {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
  } catch (e) { return null; }
  return AC;
}
let NOISE = null;
function noiseBuf() {
  if (NOISE) return NOISE;
  NOISE = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate);
  const d = NOISE.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return NOISE;
}

const Sfx = {
  tone(f, t0, dur, type = "square", vol = 0.05, f2 = null) {
    const o = AC.createOscillator(), g = AC.createGain(), s = AC.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, s);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + dur);
    g.gain.setValueAtTime(vol, s);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g).connect(AC.destination); o.start(s); o.stop(s + dur + 0.02);
  },
  noise(t0, dur, freq, vol) {
    const n = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), s = AC.currentTime + t0;
    n.buffer = noiseBuf(); f.type = "bandpass"; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, s); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    n.connect(f).connect(g).connect(AC.destination); n.start(s); n.stop(s + dur);
  },
  play(n) {
    if (SAVE.muted || !audio()) return;
    const N = (...a) => this.tone(...a);
    switch (n) {
      case "jump": N(330, 0, .12, "square", .03, 660); break;
      case "coin": N(988, 0, .06, "square", .025); N(1319, .06, .14, "square", .025); break;
      case "right": N(523, 0, .1, "triangle", .08); N(659, .09, .1, "triangle", .08); N(784, .18, .25, "triangle", .08); break;
      case "ding": N(880, 0, .08, "triangle", .07); N(1319, .07, .22, "triangle", .07); break;
      case "quick": [1047, 1319, 1568, 2093].forEach((f, i) => N(f, i * .05, .14, "triangle", .06)); break;
      case "wrong": N(233, 0, .18, "sawtooth", .025, 196); N(185, .16, .25, "sawtooth", .025, 147); break;
      case "hurt": N(400, 0, .25, "square", .04, 90); break;
      case "stomp": N(220, 0, .12, "square", .05, 60); break;
      case "tick": N(880, 0, .04, "triangle", .04); break;
      case "page": N(660, 0, .1, "sine", .07); N(880, .08, .1, "sine", .07); N(1175, .16, .28, "sine", .07); break;
      case "buff": [523, 659, 784, 1047].forEach((f, i) => N(f, i * .07, .12, "square", .03)); break;
      case "door": N(150, 0, .5, "sawtooth", .04, 60); this.noise(0, .4, 400, .05); break;
      case "bump": N(160, 0, .08, "square", .05, 120); break;
      case "beam": N(400, 0, .5, "sawtooth", .035, 1600); this.noise(0, .5, 2500, .04); break;
      case "boss": N(98, 0, .8, "sawtooth", .05, 65); this.noise(0, .8, 200, .06); break;
      case "win": [523, 659, 784, 1047, 784, 1047].forEach((f, i) => N(f, i * .12, .22, "triangle", .08)); break;
      case "step": N(520, 0, .05, "triangle", .025); break;
      case "spring": N(200, 0, .25, "triangle", .07, 900); break;
      case "flap": this.noise(0, .12, 700, .07); break;
      case "whoosh": this.noise(0, .5, 1200, .06); N(300, 0, .4, "sine", .03, 900); break;
      case "splash": this.noise(0, .35, 900, .1); N(300, 0, .2, "sine", .04, 100); break;
      case "coo": N(520, 0, .12, "sine", .04, 440); N(500, .14, .16, "sine", .04, 400); break;
      case "check": [784, 988, 1175].forEach((f, i) => N(f, i * .06, .15, "triangle", .05)); break;
      case "auto": [784, 988, 1175, 1568, 1976].forEach((f, i) => N(f, i * .06, .2, "triangle", .06)); break;
    }
  }
};

// ---------------------------------------------------------------- music
// Procedural Renaissance-flavored tracks in D Dorian: a recorder melody,
// a plucked lute chord, a low drone bass, and (in levels) a tambourine.
const NOTE_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(n) { const m = /^([A-G])(#|b)?(\d)$/.exec(n); return NOTE_BASE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (+m[3] + 1) * 12; }
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const TRACKS = {
  map: { bpm: 96, lead: .045, perc: false,
    mel: "A4 . D5 . E5 . F5 . | E5 . D5 . C5 . A4 . | G4 . A4 . C5 . D5 . | A4 . . . . . . . | F5 . E5 . D5 . C5 . | D5 . A4 . G4 . F4 . | G4 . A4 . C5 . E5 . | D5 . . . . . . .",
    bass: "D3 A2 C3 D3 F3 D3 C3 D3" },
  level: { bpm: 140, lead: .04, perc: true,
    mel: "D5 . A4 D5 F5 E5 D5 C5 | A4 . . G4 A4 C5 D5 E5 | F5 . E5 D5 C5 . A4 . | G4 A4 C5 A4 D5 . . . | F5 G5 A5 . G5 F5 E5 D5 | C5 D5 E5 C5 A4 . G4 . | A4 C5 D5 F5 E5 C5 D5 E5 | D5 . . . A4 . D5 .",
    bass: "D3 D3 C3 G2 F3 C3 A2 D3" },
  // Level 2: a slow chorale on a small organ, then a driving minor-key boss theme
  level2: { bpm: 100, lead: .035, perc: false, organ: true, minor: [9, 4, 11],
    mel: "G4 . G4 . D5 . D5 . | E5 . D5 . B4 . A4 . | G4 . A4 . B4 . C5 . | B4 . A4 . G4 . . . | B4 . C5 . D5 . E5 . | D5 . C5 . B4 . A4 . | G4 . B4 . A4 . F#4 . | G4 . . . . . . .",
    bass: "G2 G2 C3 D3 G2 C3 D3 G2" },
  boss2: { bpm: 148, lead: .03, perc: true, organ: true, clank: true, dark: true, minor: [7, 0],
    mel: "G3 G3 Bb3 G3 C4 Bb3 A3 F#3 | G3 . D3 . G3 . A3 Bb3 | C4 C4 D4 C4 Bb3 A3 G3 A3 | D3 . F#3 . A3 . D4 . | G3 G3 Bb3 G3 C4 Bb3 A3 F#3 | G3 . D3 . G3 . Bb3 C4 | D4 Eb4 D4 C4 Bb3 A3 G3 F#3 | G3 . . . G4 . . .",
    bass: "G2 G2 C3 D3 G2 G2 C3 D3" },
  // Level 3: a lively lute galliard, then a storm at sea
  level3: { bpm: 132, lead: .05, perc: true, lute: true, minor: [9, 2],
    mel: "A4 . . B4 C5 . D5 . | E5 . E5 . D5 C5 B4 . | C5 . A4 . B4 . G4 . | A4 . . . E4 . . . | C5 . . D5 E5 . F5 . | G5 . E5 . D5 . C5 . | B4 . C5 D5 B4 . G#4 . | A4 . . . A4 . . .",
    bass: "A2 C3 F2 E2 C3 G2 E2 A2" },
  boss3: { bpm: 156, lead: .035, perc: true, dark: true, minor: [2, 7],
    mel: "D4 . F4 A4 D5 . C5 A4 | Bb4 . A4 G4 A4 . . . | D4 . F4 A4 D5 . E5 F5 | E5 D5 C#5 E5 A4 . . . | F5 . E5 D5 E5 . D5 C5 | D5 . C5 Bb4 A4 . G4 . | F4 G4 A4 Bb4 C5 Bb4 A4 G4 | A4 . C#5 . D5 . . .",
    bass: "D2 G2 D2 A2 F2 G2 Bb2 A2" },
  boss: { bpm: 152, lead: .035, perc: true, dark: true,
    mel: "D4 D4 F4 D4 G4 F4 E4 C4 | D4 . A3 . D4 . E4 F4 | G4 G4 A4 G4 F4 E4 D4 E4 | A3 . C#4 . E4 . A4 . | D4 D4 F4 D4 G4 F4 E4 C4 | D4 . A3 . D4 . F4 G4 | A4 Bb4 A4 G4 F4 E4 D4 C#4 | D4 . . . D5 . . .",
    bass: "D2 D2 G2 A2 D2 D2 G2 A2" }
};
const MINOR_ROOTS = new Set([2, 9, 4]); // D, A, E are minor chords in D Dorian
const Music = {
  want: null, cur: null, step: 0, next: 0, timer: null, gain: null,
  play(name) {
    this.want = name;
    if (!SAVE.music || !audio()) return;
    if (this.cur === name && this.timer) return;
    this.stop(true);
    const t = TRACKS[name];
    this.cur = name; this.step = 0; this.lastMode = "play"; this.next = AC.currentTime + 0.08;
    this.notes = t.mel.split(/\s+/).filter(x => x && x !== "|");
    this.bass = t.bass.split(/\s+/).map(midi);
    this.gain = AC.createGain(); this.gain.gain.value = 0.9; this.gain.connect(AC.destination);
    this.timer = setInterval(() => this.tick(), 25);
  },
  stop(keepWant) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.gain) { const g = this.gain; g.gain.setTargetAtTime(0, AC.currentTime, 0.1); setTimeout(() => g.disconnect(), 600); }
    this.gain = null; this.cur = null;
    if (!keepWant) this.want = null;
  },
  toggle() {
    SAVE.music = !SAVE.music; writeSave();
    if (SAVE.music && this.want) { const w = this.want; this.want = null; this.play(w); } else this.stop(true);
  },
  // Reading pauses the music; quick recall only ducks it.
  mode() {
    const quiz = document.getElementById("quiz"), panel = document.getElementById("panel");
    if (panel && !panel.hidden) return "pause";
    if (quiz && !quiz.hidden) return quiz.classList.contains("flashmode") ? "duck" : "pause";
    return "play";
  },
  tick() {
    const mode = this.mode();
    if (mode !== this.lastMode) {
      this.lastMode = mode;
      this.gain.gain.setTargetAtTime({ play: 0.9, duck: 0.35, pause: 0 }[mode], AC.currentTime, mode === "play" ? 0.4 : 0.12);
    }
    if (mode === "pause") { this.next = AC.currentTime + 0.3; return; }
    const t = TRACKS[this.cur], dur = 60 / t.bpm / 2; // eighth notes
    while (this.next < AC.currentTime + 0.15) { this.playStep(t, this.step, this.next, dur); this.step++; this.next += dur; }
  },
  voice(type, f, s, dur, vol, attack = 0.01, vib = 0) {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, s);
    if (vib) {
      const l = AC.createOscillator(), lg = AC.createGain();
      l.frequency.value = 5.2; lg.gain.value = vib; l.connect(lg).connect(o.frequency); l.start(s); l.stop(s + dur + .1);
    }
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(vol, s + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g).connect(this.gain); o.start(s); o.stop(s + dur + 0.05);
  },
  playStep(t, step, s, dur) {
    const i = step % this.notes.length, n = this.notes[i];
    if (n !== ".") {
      let len = 1; while (len < 4 && this.notes[(i + len) % this.notes.length] === ".") len++;
      if (t.organ) this.organ(hz(midi(n)), s, dur * len * 0.97, t.lead);
      else if (t.lute) { this.voice("triangle", hz(midi(n)), s, Math.min(0.6, dur * len), t.lead, 0.004); this.voice("sine", hz(midi(n)) * 2, s, 0.22, t.lead * 0.35, 0.004); }
      else { this.voice("sine", hz(midi(n)), s, dur * len * 0.95, t.lead, 0.03, 3); this.voice("triangle", hz(midi(n)) * 2, s, dur * 0.6, t.lead * 0.25); }
    }
    const bar = Math.floor(step / 8) % this.bass.length, root = this.bass[bar], pos = step % 8;
    if (pos === 0 || pos === 4 || (t.perc && pos % 2 === 0)) {
      const m = pos === 4 ? root + 7 : root;
      this.voice("triangle", hz(m), s, dur * (t.perc ? 1.8 : 3.6), t.dark ? .09 : .07, .01);
    }
    if (pos === 2 || pos === 6) {
      const third = (t.minor ? t.minor.includes(root % 12) : MINOR_ROOTS.has(root % 12)) ? 3 : 4;
      [12, 12 + third, 19].forEach((iv, k) => this.voice("triangle", hz(root + iv), s + k * 0.018, dur * 2.2, t.dark ? .018 : .025, .005));
    }
    if (t.perc) {
      const n2 = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
      n2.buffer = noiseBuf(); f.type = "highpass"; f.frequency.value = pos % 4 === 0 ? 2500 : 6000;
      g.gain.setValueAtTime(pos % 4 === 0 ? .05 : .02, s); g.gain.exponentialRampToValueAtTime(0.0001, s + .06);
      n2.connect(f).connect(g).connect(this.gain); n2.start(s); n2.stop(s + .07);
      if (t.clank && pos % 4 === 2) this.voice("square", 180, s, 0.06, 0.03, 0.002);
    }
  },
  // Organ: square and sine pipes through a soft low-pass filter.
  organ(f, s, dur, vol) {
    const filt = AC.createBiquadFilter(), g = AC.createGain();
    filt.type = "lowpass"; filt.frequency.value = 1600;
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + 0.05);
    g.gain.setValueAtTime(vol, s + Math.max(0.06, dur - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    filt.connect(g).connect(this.gain);
    for (const [type, mult, v] of [["square", 1, 0.5], ["sine", 2, 0.6], ["sine", 0.5, 0.5]]) {
      const o = AC.createOscillator(), og = AC.createGain(); o.type = type; o.frequency.value = f * mult; og.gain.value = v;
      o.connect(og).connect(filt); o.start(s); o.stop(s + dur + 0.05);
    }
  }
};

// ---------------------------------------------------------------- input
const keys = {}, pressed = {};
const KEYMAP = {
  ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
  ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
  " ": "jump", Enter: "enter", Escape: "pause", p: "pause", P: "pause",
  c: "codex", C: "codex", m: "music", M: "music"
};
addEventListener("keydown", e => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  const k = KEYMAP[e.key];
  if (!k || G.modal) return;
  e.preventDefault();
  if (!keys[k]) pressed[k] = true;
  keys[k] = true;
});
addEventListener("keyup", e => { const k = KEYMAP[e.key]; if (k) keys[k] = false; });
addEventListener("blur", () => clearKeys());
function clearKeys() { for (const k in keys) keys[k] = false; for (const k in pressed) delete pressed[k]; }

// ---------------------------------------------------------------- helpers
const G = { scene: "title", modal: false, t: 0, shake: 0, parts: [], floats: [], level: null };
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function lerpHex(a, b, f) {
  const ch = s => { const v = parseInt(s.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  const A = ch(a), B = ch(b);
  return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(",") + ")";
}
function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrapText(text, maxW) {
  const words = text.split(" "), lines = []; let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function heart(x, y, s, fill) {
  ctx.fillStyle = fill; ctx.beginPath();
  ctx.moveTo(x, y + s * .3);
  ctx.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3);
  ctx.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .75, x, y + s);
  ctx.bezierCurveTo(x, y + s * .75, x + s * .5, y + s * .6, x + s * .5, y + s * .3);
  ctx.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3);
  ctx.fill();
}
function burst(x, y, color, n = 12, spd = 3) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), v = rnd(spd * .3, spd);
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rnd(25, 45), max: 45, color, size: rnd(3, 7) });
  }
}
function floatText(x, y, text, color = "#fff6d8") { G.floats.push({ x, y, text, color, life: 70 }); }
function toast(text, kind = "") {
  const box = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = "toast " + kind; t.textContent = text;
  box.appendChild(t);
  setTimeout(() => t.classList.add("out"), 2800);
  setTimeout(() => t.remove(), 3300);
}

// ---------------------------------------------------------------- progress & rewards
const ACH = {
  first_codex: ["First Page", "Discovered your first Codex page"],
  polymath: ["Polymath", "Discovered every Codex page"],
  lightning: ["Lightning Recall", "5 quick recalls under 3 seconds"],
  automatic: ["Automatic", "Made a concept automatic ⚡"],
  streak5: ["On Fire", "5 correct answers in a row"],
  streak10: ["Unstoppable", "10 correct answers in a row"],
  comeback: ["Comeback", "Answered a question you once missed"],
  aviator: ["Aviator", "Flew Leonardo da Vinci’s machine across the Arno"],
  tier4: ["Big Thinker", "Answered a Tier 4 Synthesize question"],
  patron: ["Patron of the Arts", "Commissioned your first work"],
  boss: ["Fog Breaker", "Defeated the Fog of Forgetting"],
  polymath2: ["Reformation Scholar", "Discovered every Level 2 Codex page"],
  golem: ["Ink Breaker", "Defeated the Ink Golem"],
  boss2: ["Rumor Buster", "Jammed the Rumor Mill"],
  rafter: ["River Runner", "Rode the raft down the Rhine"],
  ghostbuster: ["Ghostbuster", "Answered a ghost of a missed question"],
  archivist: ["Archivist", "Found your first Lost Manuscript"],
  printer: ["Master Printer", "Set the type for a pamphlet"],
  courier: ["Swift Courier", "Got the pamphlet to all 4 cities ahead of the censor"],
  seal1: ["Gold Seal of Florence", "Found all 3 Lost Manuscripts in Level 1"],
  seal2: ["Gold Seal of Wittenberg", "Found all 3 Lost Manuscripts in Level 2"],
  polymath3: ["Tudor Scholar", "Discovered every Level 3 Codex page"],
  seal3: ["Gold Seal of London", "Found all 3 Lost Manuscripts in Level 3"],
  gallery: ["Royal Historian", "Put the Tudor portraits in order without a mistake"],
  copernican: ["Copernican", "Set the Great Orrery to the sun-centered model"],
  spheres: ["Sphere Breaker", "Shattered the Crystal Spheres"],
  boss3: ["Beacon Keeper", "Scattered the Spanish Armada"],
  laurel: ["Crowned in Laurel", "Found a Golden Laurel in a ? block"],
  ability: ["New Power", "Unlocked a mastery ability"],
  memory: ["Memory Keeper", "Completed a Hall of Memory review"],
  stars3: ["Maestro’s Mark", "Earned 3 stars on a level"],
  complete: ["Renaissance Master", "Completed The Age of Rebirth"],
  polymath4: ["Explorer’s Log", "Discovered every Voyage 1 Codex page"],
  seal4: ["Gold Seal of Lisbon", "Found all 3 Lost Manuscripts on Voyage 1"],
  boss4: ["Storm Rider", "Survived the Cape of Storms"],
  astrolabe: ["Navigator", "Found your latitude with an astrolabe"]
};
function award(id) {
  if (SAVE.achievements[id]) return;
  SAVE.achievements[id] = Date.now(); writeSave();
  toast(`Achievement · ${ACH[id][0]}: ${ACH[id][1]}`, "ach");
}
const RANKS = [[0, "Apprentice"], [150, "Journeyman"], [400, "Artisan"], [800, "Master"], [1400, "Maestro"]];
function rankInfo() {
  let i = 0; RANKS.forEach((r, k) => { if (SAVE.xp >= r[0]) i = k; });
  const next = RANKS[i + 1];
  return { name: RANKS[i][1], next: next ? next[0] : null, base: RANKS[i][0] };
}

function gainFlorins(n, x, y) {
  const L = G.level;
  SAVE.florins += n;
  if (L) { L.florinsEarned += n; if (x !== undefined) floatText(x, y, "+" + n + " ƒ", "#ffd75e"); }
}
function inLevel() { return G.scene === "level" && G.level; }
function hasAbility(id) { return !!SAVE.abilities[id]; }
function automaticCount() { return CODEX_ORDER.filter(c => Learn.isAutomatic(c)).length; }
// Unlock abilities as concepts become automatic; announced when nothing else is on screen.
const pendingAbilities = [];
function checkAbilities() {
  const n = automaticCount();
  for (const a of ABILITIES) if (!SAVE.abilities[a.id] && n >= a.need) { SAVE.abilities[a.id] = true; pendingAbilities.push(a); award("ability"); }
  writeSave();
}
function showAbilityUnlock(a) {
  Sfx.play("auto");
  openPanel(`<div class="eyebrow">New ability · earned by mastery</div><h2 class="center">${esc(a.name)}</h2>
    <p class="center">${esc(a.how)}</p>
    <p class="small center">You unlocked it by making ${a.need} concepts ⚡ automatic. Earlier levels hide Lost Manuscripts that need this power. Go back and look!</p>
    <div class="row"><button class="btn primary" id="abok" autofocus>Got it</button></div>`, "narrow");
  onPanelClick("#abok", closePanel);
}
function tally(c, ok) {
  if (!inLevel()) return;
  const b = G.level.byConcept[c] || (G.level.byConcept[c] = { right: 0, wrong: 0 });
  ok ? b.right++ : b.wrong++;
}
function streakReward() {
  if (SAVE.streak >= 5) award("streak5");
  if (SAVE.streak >= 10) award("streak10");
  if (inLevel() && SAVE.streak > 0 && SAVE.streak % 5 === 0) {
    toast(`Streak of ${SAVE.streak}! +10 florins.`, "streak");
    gainFlorins(10, G.level.p.x + 15, G.level.p.y - 40);
  }
}

// Deep question (full card, tiers 1–4).
async function askQ(opts) {
  if (opts.mix === undefined && inLevel()) opts.mix = !!G.level.def.mix;
  const q = Learn.pick(opts);
  if (!q) return null;
  G.modal = true; clearKeys();
  const ok = await Quiz.ask(q, opts);
  const r = Learn.record(q, ok);
  G.modal = false; clearKeys();
  afterAnswer(q, ok, r);
  if (!ok && inLevel()) G.level.queueGhost({ deep: q });
  return ok;
}
function afterAnswer(q, ok, r) {
  const L = G.level;
  if (typeof Race !== "undefined") Race.onAnswer("deep", ok, { t: q.t });
  Sync.schedule();
  if (inLevel()) { L.deep.n++; if (ok) L.deep.right++; q.c.forEach(c => tally(c, ok)); }
  if (ok) {
    const combo = 1 + Math.floor(SAVE.streak / 5) * 0.5;
    SAVE.xp += 10 * q.t;
    gainFlorins(Math.round(4 * q.t * combo), L ? L.p.x + 15 : undefined, L ? L.p.y - 24 : undefined);
    streakReward();
    if (r.comeback) award("comeback");
    if (q.t === 4) award("tier4");
  }
  writeSave();
}

// Quick recall: compact card (ms timed) or in-world (ms = null).
async function askQuick(title, focus) {
  const item = Learn.pickFlash({ focus, mix: inLevel() && !!G.level.def.mix });
  if (!item) return null;
  G.modal = true; clearKeys();
  const { ok, ms } = await Quiz.flash(item, { title });
  G.modal = false; clearKeys();
  afterQuick(item, ok, ms);
  if (!ok && inLevel()) G.level.queueGhost({ quick: item });
  return ok;
}
function afterQuick(item, ok, ms) {
  const r = Learn.recordFlash(item, ok, ms), L = G.level;
  if (typeof Race !== "undefined") Race.onAnswer("quick", ok, { ms });
  Sync.schedule();
  if (inLevel()) {
    L.quick.n++; if (ok) L.quick.right++;
    if (ok && ms != null) { L.quick.ms.push(ms); if (ms < FAST_MS) L.quick.fast++; }
    tally(item.c, ok);
    if (L.quick.fast >= 5) award("lightning");
  }
  if (ok) {
    SAVE.xp += 5;
    gainFlorins(ms != null && ms < FAST_MS ? 4 : 2, L ? L.p.x + 15 : undefined, L ? L.p.y - 24 : undefined);
    streakReward();
  }
  if (ok && ms != null && ms < FAST_MS && !r.nowAutomatic && !Learn.isAutomatic(item.c) && SAVE.flash[item.c] && !(L && L.def && L.def.kind === "voyage")) {
    const f = SAVE.flash[item.c], n = Math.min(3, f.fast);
    toast(n < 3 ? `⚡ Lightning answer! ${CONCEPTS[item.c].name}: ${n} of 3 toward automatic` : `⚡ ${CONCEPTS[item.c].name}: 3 lightning answers! Get it right once more later to lock it in.`, "buff");
  }
  if (r.nowAutomatic) {
    award("automatic"); Sfx.play("auto");
    toast(`${CONCEPTS[item.c].name} is now automatic ⚡`, "buff");
    checkAbilities();
  }
  writeSave();
}

// ---------------------------------------------------------------- Level 3 helpers
const TUDORS = [["h8", "Henry VIII"], ["e6", "Edward VI"], ["mry", "Mary I"], ["eliz", "Elizabeth I"]];
const GALLERY_Y = 7 * T + 6;
function orreryCue() {
  const c = ORRERY_CUES[Math.floor(Math.random() * ORRERY_CUES.length)];
  return { c: c.c, dir: "cue", prompt: c.prompt, answer: c.answer, options: shuffle(c.options), fix: c.c === "hel" ? "Helio = Sun: the sun at the center" : "Geo = Earth: Earth at the center" };
}

// ---------------------------------------------------------------- comic panels
function showComic(panels, title) {
  return new Promise(resolve => {
    let i = 0;
    const show = () => {
      const p = panels[i];
      openPanel(`<div class="eyebrow">${esc(title)} · ${i + 1} of ${panels.length}</div>
        <div class="comic"><div class="cframe"></div><p class="ccap">${esc(p.caption)}</p></div>
        <div class="row"><button class="btn" id="cskip">Skip</button><button class="btn primary" id="cnext" autofocus>${i < panels.length - 1 ? "Next ▶" : "Let’s go ▶"}</button></div>`, "wide");
      const frame = panelEl.querySelector(".cframe");
      try { frame.appendChild(Art.renderPanel(p)); } catch (e) { frame.remove(); }
      onPanelClick("#cnext", () => { if (++i < panels.length) show(); else { closePanel(); resolve(); } });
      onPanelClick("#cskip", () => { closePanel(); resolve(); });
    };
    show();
  });
}

// ---------------------------------------------------------------- class sync + teacher dashboard
// When the page is opened on claude.ai by a signed-in student who can use it, a
// small progress summary is saved to the artifact's shared database
// (progress/<their id>). Only the teacher (owner or editors) can read the class.
// Offline or signed out, everything still works from the browser save.
const Sync = {
  db: null, user: null, myId: null, teacher: false, timer: null,
  async init() {
    const C = window.claude;
    if (!C || !C.use) return;
    try {
      const [db, user] = await Promise.all([C.use("db"), C.use("user")]);
      if (!db || !user) return;
      this.db = db; this.user = user;
      this.myId = await user.id();
      this.teacher = await user.canEdit();
      try { const st = await db.doc("settings/units").get(); UNIT2.open = !!(st && st.exists && st.data().unit2); } catch (e) { }
      if (G.scene === "map") updateMapBar();
      if (this.myId) this.push();
      if (typeof Race !== "undefined") Race.init();
    } catch (e) { /* no class sync in this view */ }
  },
  summary() {
    let right = 0, wrong = 0;
    for (const id in SAVE.items) { right += SAVE.items[id].right; wrong += SAVE.items[id].wrong; }
    for (const c in SAVE.flash) { right += SAVE.flash[c].right; wrong += SAVE.flash[c].wrong; }
    const mastery = {};
    for (const c of CODEX_ORDER) if (Learn.isIntroduced(c)) mastery[c] = Math.round(Learn.mastery(c) * 100);
    return {
      nick: (SAVE.name || "").slice(0, 24), updated: Date.now(), xp: SAVE.xp,
      levels: SAVE.levels, answers: right + wrong, accuracy: right + wrong ? Math.round(right / (right + wrong) * 100) : null,
      automatic: CODEX_ORDER.filter(c => Learn.isAutomatic(c)), mastery,
      misses: SAVE.misses.slice(0, 8).map(m => m.id), manuscripts: Object.keys(SAVE.manuscripts),
      abilities: Object.keys(SAVE.abilities), reviews: SAVE.reviews, bestStreak: SAVE.bestStreak
    };
  },
  schedule() {
    if (!this.db || !this.myId) return;
    clearTimeout(this.timer); this.timer = setTimeout(() => this.push(), 5000);
  },
  async push() {
    if (!this.db || !this.myId) return;
    try { await this.db.doc("progress/" + this.myId).set(this.summary()); } catch (e) { /* not allowed to write here; local save still works */ }
  }
};

async function showTeacher(back) {
  openPanel(`<div class="phead"><h2>Teacher Dashboard</h2><button class="btn" data-back id="tback">Close</button></div><p class="small">Loading your class…</p>`, "wide xwide");
  onPanelClick("#tback", () => { closePanel(); if (back) back(); });
  let rows = [];
  try { rows = (await Sync.db.collection("progress").get()).docs.filter(d => d.exists && d.id !== Sync.myId).map(d => ({ id: d.id, ...d.data() })); }
  catch (e) { panelEl.querySelector(".small").textContent = "Couldn’t load class progress. Check that you’re signed in and own or can edit this game."; return; }
  let names = {};
  try { names = await Sync.user.profiles(rows.map(r => r.id)); } catch (e) {}
  const nameOf = r => (names[r.id] && names[r.id].name) || r.nick || "Student";
  rows.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  const concepts = CODEX_ORDER.filter(c => rows.some(r => r.mastery && r.mastery[c] !== undefined));
  const avg = list => list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
  const classMastery = Object.fromEntries(concepts.map(c => [c, avg(rows.filter(r => r.mastery && r.mastery[c] !== undefined).map(r => r.mastery[c]))]));
  const reteach = concepts.slice().sort((a, b) => classMastery[a] - classMastery[b]).slice(0, 4);
  const missCount = {};
  rows.forEach(r => (r.misses || []).forEach(id => { missCount[id] = (missCount[id] || 0) + 1; }));
  const topMisses = Object.entries(missCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => QBYID[id] ? `<li><span>${esc(QBYID[id].q)}</span><b>${n} student${n > 1 ? "s" : ""}</b></li>` : "").join("");
  const heat = v => v === undefined ? `<td class="hc none" title="Not started"></td>` : `<td class="hc" style="--m:${v}" title="${v}%">${v}</td>`;
  const stars = r => id => { const L = r.levels && r.levels[id]; return L && L.done ? "★".repeat(L.stars || 1) : "—"; };
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
  const body = rows.length ? `
    <div class="stats">
      <div><b>${rows.length}</b><span>Students</span></div>
      <div><b>${avg(rows.filter(r => r.accuracy != null).map(r => r.accuracy)) ?? "—"}%</b><span>Average accuracy</span></div>
      ${Object.keys(LEVELS).map(id => `<div><b>${rows.filter(r => r.levels && r.levels[id] && r.levels[id].done).length}</b><span>Finished ${LEVELS[id].label || "Level " + LEVELS[id].num}</span></div>`).join("")}
    </div>
    <h3>Reteach next</h3>
    <p class="small">Lowest class mastery: ${reteach.map(c => `<b>${esc(CONCEPTS[c].name)}</b> (${classMastery[c]}%)`).join(", ") || "not enough data yet"}.</p>
    ${topMisses ? `<h3>Most-missed questions</h3><ul class="misses classmiss">${topMisses}</ul>` : ""}
    <h3>Class mastery by concept</h3>
    <div class="tablewrap"><table class="mtable heat">
      <thead><tr><th>Student</th><th>Active</th>${Object.keys(LEVELS).map(id => `<th>${LEVELS[id].kind === "voyage" ? "V1" : "L" + LEVELS[id].num}</th>`).join("")}<th class="num">Acc.</th><th class="num">⚡</th><th class="num">Ms.</th>${concepts.map(c => `<th class="vert" title="${esc(CONCEPTS[c].name)}"><span>${esc(SHORT[c] || CONCEPTS[c].name)}</span></th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr><td>${esc(nameOf(r))}</td><td class="tiny">${r.updated ? ago(r.updated) : "—"}</td>${Object.keys(LEVELS).map(id => `<td class="st">${stars(r)(id)}</td>`).join("")}
        <td class="num">${r.accuracy ?? "—"}${r.accuracy != null ? "%" : ""}</td><td class="num">${(r.automatic || []).length}</td><td class="num">${(r.manuscripts || []).length}</td>
        ${concepts.map(c => heat(r.mastery ? r.mastery[c] : undefined)).join("")}</tr>`).join("")}
      <tr class="classrow"><td><b>Class average</b></td><td></td>${Object.keys(LEVELS).map(() => "<td></td>").join("")}<td></td><td></td><td></td>${concepts.map(c => heat(classMastery[c])).join("")}</tr></tbody>
    </table></div>
    <p class="tiny">Mastery grows with correct answers spread over time, so expect it to climb across several sessions. ⚡ = concepts recalled fast and correctly at least 3 times. Ms. = Lost Manuscripts found.</p>`
    : `<p class="small">No student progress yet. Share this game with your class on claude.ai so they can open and use it while signed in. Each student’s progress appears here as they play.</p>`;
  openPanel(`<div class="phead"><h2>Teacher Dashboard</h2><div class="row" style="margin:0"><button class="btn" id="trefresh">Refresh</button><button class="btn" data-back id="tback">Close</button></div></div>
    <div class="unitsw"><div><b>Next unit · The Age of Exploration</b><span>${unit2Open() ? "Open: students who finish London can sail from the Iberian Peninsula to Portugal." : "Locked: after London, students see a clue pointing to the Iberian Peninsula. Open it when you start the next unit."}</span></div>
      <button class="btn ${unit2Open() ? "" : "primary"}" id="tunit">${unit2Open() ? "Lock it again" : "Open for my class"}</button></div>${body}`, "wide xwide");
  onPanelClick("#tback", () => { closePanel(); if (back) back(); });
  onPanelClick("#trefresh", () => showTeacher(back));
  onPanelClick("#tunit", async () => {
    try { await Sync.db.doc("settings/units").set({ unit2: !unit2Open(), updated: Date.now() }); UNIT2.open = !unit2Open(); }
    catch (e) { toast("Couldn’t change the setting. Only the game’s owner or editors can."); }
    showTeacher(back);
  });
}

// ---------------------------------------------------------------- the printing press (Level 2)
// Step 1: set the type for an argument (claim, two pieces of evidence, reasoning).
// Step 2: race the censor to carry copies to four cities (fast recall at each).
function runPressPuzzle(L) {
  const P = PAMPHLETS[Math.floor(Math.random() * PAMPHLETS.length)];
  const pick = { claim: null, ev: [], reason: null };
  let mistakes = 0, stage = "claim";
  return new Promise(resolve => {
    const opts = (list, key) => shuffle(list.map((x, i) => [x[0], x[1], i])).map(([text, ok, i]) =>
      `<button class="typebtn ${pick[key] === text || (key === "ev" && pick.ev.includes(text)) ? "on" : ""}" data-k="${key}" data-i="${i}">${esc(text)}</button>`).join("");
    const render = msg => {
      const sheet = `<div class="pamphlet">
          <div class="phd">${esc(P.side)}</div><div class="woodcut" aria-hidden="true"></div>
          <p class="pclaim">${pick.claim ? esc(pick.claim) : "<span class='slot'>Claim</span>"}</p>
          <ul>${[0, 1].map(i => `<li>${pick.ev[i] ? esc(pick.ev[i]) : "<span class='slot'>Evidence</span>"}</li>`).join("")}</ul>
          <p class="preason">${pick.reason ? esc(pick.reason) : "<span class='slot'>Reasoning</span>"}</p></div>`;
      const step = { claim: ["1 · Choose the CLAIM", "An arguable statement the pamphlet will try to prove.", opts(P.claims, "claim")],
        ev: ["2 · Choose TWO pieces of EVIDENCE", "Facts that actually support this claim.", opts(P.evidence, "ev")],
        reason: ["3 · Choose the REASONING", "The sentence that connects the evidence to the claim.", opts(P.reasons, "reason")] }[stage];
      openPanel(`<div class="eyebrow">The Printing Press · Wittenberg</div><h2 class="center">Set the type</h2>
        <p class="small center">Printers turned arguments into pamphlets in days. Build ${esc(P.side.toLowerCase())}, written by ${esc(P.author)}.</p>
        <div class="press">${sheet}<div class="typecol"><h3>${step[0]}</h3><p class="tiny">${step[1]}</p><div class="typeopts">${step[2]}</div>
        ${msg ? `<p class="pmsg">${msg}</p>` : ""}</div></div>`, "wide");
      panelEl.querySelectorAll(".typebtn").forEach(btn => btn.onclick = () => choose(btn.dataset.k, +btn.dataset.i));
    };
    const choose = (key, i) => {
      const list = { claim: P.claims, ev: P.evidence, reason: P.reasons }[key], [text, ok] = list[i];
      if (!ok) {
        mistakes++; Sfx.play("wrong");
        const hint = key === "claim" ? "That’s a fact, not an arguable claim. A claim is something people could disagree with."
          : key === "ev" ? "True, maybe, but it doesn’t support THIS claim. Pick evidence that proves the point."
          : "That doesn’t follow from the evidence. Which sentence explains why the evidence proves the claim?";
        return render(hint);
      }
      Sfx.play("tick");
      if (key === "claim") { pick.claim = text; stage = "ev"; }
      else if (key === "ev") { if (!pick.ev.includes(text)) pick.ev.push(text); if (pick.ev.length === 2) stage = "reason"; }
      else { pick.reason = text; stage = "done"; }
      if (stage !== "done") return render();
      // printed!
      Sfx.play("door");
      if (inLevel()) { L.deep.n++; if (!mistakes) L.deep.right++; }
      SAVE.xp += 30; gainFlorins(mistakes ? 6 : 12); award("printer"); writeSave();
      openPanel(`<div class="eyebrow">Printed!</div><h2 class="center">Your pamphlet is ready</h2>
        <div class="press one">${panelEl.querySelector(".pamphlet") ? "" : ""}<div class="pamphlet">
          <div class="phd">${esc(P.side)}</div><div class="woodcut" aria-hidden="true"></div>
          <p class="pclaim">${esc(pick.claim)}</p><ul>${pick.ev.map(e => `<li>${esc(e)}</li>`).join("")}</ul><p class="preason">${esc(pick.reason)}</p></div></div>
        <p class="small">${esc(P.why)}</p>
        <p class="small"><b>Next:</b> carry copies to four cities before the censor’s wagon gets there. At each city, answer a quick recall fast. Under 6 seconds beats the wagon.</p>
        <div class="row"><button class="btn primary" id="prace" autofocus>Start the race</button></div>`, "wide");
      onPanelClick("#prace", () => race());
    };
    const race = async () => {
      const states = PRESS_CITIES.map(() => "");
      const view = { lon0: 5.6, lon1: 17.2, lat0: 47.2, lat1: 55.2 };
      const showMap = (msg, cur) => {
        const pins = [{ lon: 12.65, lat: 51.87, label: "Wittenberg", state: "home" }, ...PRESS_CITIES.map(([label, lon, lat], i) => ({ label, lon, lat, state: states[i] || (i === cur ? "next" : "") }))];
        openPanel(`<div class="eyebrow">Spread the pamphlet</div><h2 class="center">Race the censor</h2>
          <div class="qmap racemap">${mapSVG({ view, hi: "de", pins })}</div><p class="center small">${msg}</p>`, "narrow steady");
      };
      for (let i = 0; i < PRESS_CITIES.length; i++) {
        showMap(`Next stop: <b>${PRESS_CITIES[i][0]}</b>. Answer fast!`, i);
        await new Promise(r => setTimeout(r, 900));
        const item = Learn.pickFlash({ focus: L.focus });
        if (!item) break;
        const { ok, ms } = await Quiz.flash(item, { title: `Courier to ${PRESS_CITIES[i][0]} · beat the wagon (6s)` });
        afterQuick(item, ok, ms);
        states[i] = ok && ms < 6000 ? "won" : "lost";
        Sfx.play(states[i] === "won" ? "coin" : "hurt");
      }
      const got = states.filter(s => s === "won").length;
      gainFlorins(got * 3); if (got === 4) award("courier");
      showMap(`Your pamphlet reached <b>${got} of 4</b> cities ahead of the censor. In 1520, the first 4,000 copies of one of Martin Luther’s pamphlets sold out in just days.`);
      panelEl.querySelector(".pcard").insertAdjacentHTML("beforeend", `<div class="row"><button class="btn primary" id="pdone" autofocus>Back to the workshop</button></div>`);
      onPanelClick("#pdone", () => { closePanel(); resolve(); });
      setTimeout(() => { const b = panelEl.querySelector("#pdone"); if (b) b.focus(); }, 50);
    };
    render();
  });
}

// ---------------------------------------------------------------- panels (DOM)
const panelEl = document.getElementById("panel");
function openPanel(html, cls = "") {
  panelEl.innerHTML = `<div class="pcard ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  panelEl.hidden = false; G.modal = true; clearKeys();
  setTimeout(() => { const f = panelEl.querySelector("[autofocus], .btn.primary, button"); if (f) f.focus(); }, 30);
  return panelEl;
}
function closePanel() { panelEl.hidden = true; panelEl.innerHTML = ""; G.modal = false; clearKeys(); }
function onPanelClick(sel, fn) { const b = panelEl.querySelector(sel); if (b) b.onclick = fn; }
panelEl.addEventListener("keydown", e => {
  if (e.key === "Escape") { const b = panelEl.querySelector("[data-back]"); if (b) { e.preventDefault(); b.click(); } }
});

function codexCardHTML(c, reveal = true) {
  const k = CONCEPTS[c];
  return `<div class="codex">
    <div class="ckind">${k.kind}</div>
    <div class="cicon" aria-hidden="true">${k.icon}</div>
    <h2>${esc(k.name)}</h2>
    ${k.map ? `<div class="qmap">${mapSVG({ labels: true, florence: c === "weu", hi: c === "ger" ? "de" : c === "eng" ? "gb" : null })}</div>` : ""}
    ${reveal ? `<p class="cdef">${esc(k.def)}</p>
    <p class="cex"><b>Example.</b> ${esc(k.example)}</p>
    <p class="cclue">Quick clue <b>${esc(FLASH[c][0])}</b></p>` : ""}
  </div>`;
}
function showCodexIntro(c) {
  return new Promise(res => {
    const n = Learn.introducedCount();
    openPanel(`<div class="eyebrow">New Codex page · ${n} of ${CODEX_ORDER.length}</div>${codexCardHTML(c)}
      <p class="small">Lock in the quick clue. Quick-recall blocks will ask for it later, when remembering takes a little effort.</p>
      <div class="row"><button class="btn primary" id="cgo" autofocus>Add to my Codex</button></div>`, "codexpanel");
    onPanelClick("#cgo", () => { closePanel(); res(); });
  });
}
function fluencyCell(c) {
  const f = SAVE.flash[c];
  if (!f || !f.seen || (!f.ms && !Learn.isAutomatic(c))) return `<span class="tiny">—</span>`;
  const auto = Learn.isAutomatic(c);
  return `<span class="flu ${auto ? "auto" : ""}">${auto ? "⚡ Automatic" : (f.ms / 1000).toFixed(1) + "s"}</span>`;
}

function showCodexBook(back) {
  const card = c => {
    if (!Learn.isIntroduced(c)) return `<div class="cbook locked"><div class="cicon">?</div><h3>Undiscovered</h3><p>Find this page in ${LEVEL_CODEX.L1.includes(c) ? "Florence" : LEVEL_CODEX.L2.includes(c) ? "Germany" : LEVEL_CODEX.L3.includes(c) ? "England" : "the voyage around Africa"}.</p></div>`;
    const k = CONCEPTS[c], m = Learn.mastery(c);
    return `<div class="cbook"><div class="ckind">${k.kind}</div><h3>${esc(k.name)} ${Learn.isAutomatic(c) ? "⚡" : ""}</h3><p>${esc(k.def)}</p>
      <p class="chook">${esc(k.hook)}</p><div class="meter" title="Mastery"><span style="width:${Math.round(m * 100)}%"></span></div></div>`;
  };
  const cards = Object.keys(LEVEL_CODEX).filter(id => (id !== "L4" || unit2Open()) && (id === "L1" || l1Done()) || LEVEL_CODEX[id].some(c => Learn.isIntroduced(c)))
    .map(id => `<h3 class="cgroup">${LEVELS[id].label || "Level " + LEVELS[id].num} · ${esc(LEVELS[id].title)}</h3>${LEVEL_CODEX[id].map(card).join("")}`).join("");
  openPanel(`<div class="phead"><h2>Your Codex</h2><button class="btn" data-back id="cback">Close</button></div>
    <p class="small">Try to recall each definition before you read it. That beats rereading.</p>
    <div class="cgrid">${cards}</div>`, "wide");
  onPanelClick("#cback", () => { closePanel(); if (back) back(); });
}

function showProgress(back) {
  let right = 0, wrong = 0;
  for (const id in SAVE.items) { right += SAVE.items[id].right; wrong += SAVE.items[id].wrong; }
  for (const c in SAVE.flash) { right += SAVE.flash[c].right; wrong += SAVE.flash[c].wrong; }
  const acc = right + wrong ? Math.round(right / (right + wrong) * 100) : 0;
  const autoN = CODEX_ORDER.filter(c => Learn.isAutomatic(c)).length;
  const rows = CODEX_ORDER.map(c => {
    const k = CONCEPTS[c], m = Learn.mastery(c);
    const tier = Learn.isIntroduced(c) ? Learn.readyTier(c) : 0;
    return `<tr><td>${esc(k.name)}<div class="tiny">${k.kind}</div></td>
      <td><div class="meter"><span style="width:${Math.round(m * 100)}%"></span></div></td>
      <td class="num">${Math.round(m * 100)}%</td><td class="num">${fluencyCell(c)}</td><td class="num">${tier ? "Tier " + Math.min(4, tier) : "—"}</td></tr>`;
  }).join("");
  const misses = SAVE.misses.slice(0, 5).map(m => {
    const q = QBYID[m.id]; if (!q) return "";
    let ans = q.type === "tf" ? (q.a ? "True" : "False") : q.a;
    if (q.type === "match") ans = q.pairs.map(p => p[0] + " → " + p[1]).join("; ");
    if (q.type === "sort") ans = q.items.map(i => i[0] + " → " + q.bins[i[1]]).join("; ");
    if (q.type === "order") ans = q.seq.join(" → ");
    return `<li><span>${esc(q.q)}</span><b>${esc(ans)}</b></li>`;
  }).join("");
  const achs = Object.keys(ACH).map(id => `<div class="ach ${SAVE.achievements[id] ? "got" : ""}"><b>${ACH[id][0]}</b><span>${ACH[id][1]}</span></div>`).join("");
  const r = rankInfo();
  openPanel(`<div class="phead"><h2>Progress${SAVE.name ? " · " + esc(SAVE.name) : ""}</h2><button class="btn" data-back id="pback">Close</button></div>
    <div class="stats">
      <div><b>${r.name}</b><span>Rank · ${SAVE.xp} XP</span></div>
      <div><b>${acc}%</b><span>Accuracy · ${right + wrong} answers</span></div>
      <div><b>${autoN}/${CODEX_ORDER.length}</b><span>Concepts automatic ⚡</span></div>
      <div><b>${Learn.dueForReview()}</b><span>Ready for review</span></div>
    </div>
    <h3>Mastery</h3>
    <div class="tablewrap"><table class="mtable"><thead><tr><th>Concept</th><th>Mastery</th><th></th><th class="num">Recall speed</th><th class="num">Level</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="tiny">⚡ Automatic means recalled correctly in under 3 seconds at least 3 times, spread out over time.</p>
    <h3>Recently missed</h3>
    ${misses ? `<ul class="misses">${misses}</ul>` : `<p class="small">No misses yet.</p>`}
    <h3>Achievements</h3><div class="achs">${achs}</div>
    <div class="row end"><button class="btn danger" id="preset">Reset all progress</button></div>`, "wide");
  onPanelClick("#pback", () => { closePanel(); if (back) back(); });
  onPanelClick("#preset", () => {
    const b = panelEl.querySelector("#preset");
    if (b.dataset.armed) { resetSave(); closePanel(); location.reload(); }
    else { b.dataset.armed = "1"; b.textContent = "Click again to erase everything"; }
  });
}

function showCollection(back) {
  const auto = automaticCount();
  const abil = ABILITIES.map(a => `<div class="abil ${hasAbility(a.id) ? "got" : ""}"><b>${esc(a.name)}</b><span>${esc(a.how)}</span>
    <div class="meter"><span style="width:${Math.min(100, Math.round(auto / a.need * 100))}%"></span></div>
    <em>${hasAbility(a.id) ? "Unlocked" : `${auto} of ${a.need} concepts ⚡ automatic`}</em></div>`).join("");
  const ms = Object.keys(LEVELS).map(id => {
    const list = MANUSCRIPTS.filter(m => m.level === id);
    return `<h3>${LEVELS[id].label || "Level " + LEVELS[id].num} · ${esc(LEVELS[id].title)} <span class="tiny">${list.filter(m => SAVE.manuscripts[m.id]).length} of ${list.length}</span></h3>` +
      list.map(m => SAVE.manuscripts[m.id]
        ? `<blockquote class="srcq"><b>${esc(m.title)}</b><p>${esc(m.text)}</p><cite>${esc(m.cite)}</cite></blockquote>`
        : `<div class="msmissing">Undiscovered manuscript${m.needs ? ` · needs ${esc(ABILITIES.find(a => a.id === m.needs).name)}` : " · hidden off the main path"}</div>`).join("");
  }).join("");
  openPanel(`<div class="phead"><h2>Manuscripts &amp; Abilities</h2><button class="btn" data-back id="cback2">Close</button></div>
    <div class="howto"><b>How to earn powers</b><ol><li>Bump a gold <b>?</b> block (or visit the Hall of Memory) for a quick question.</li><li>Answer correctly in <b>under 3 seconds</b>: that’s a ⚡ lightning answer.</li><li>Three lightning answers for the same concept, on different turns, make it <b>⚡ automatic</b>.</li><li>Each power unlocks when enough concepts are automatic, and opens secrets in earlier levels.</li></ol></div>
    <div class="abils">${abil}</div>${ms}`, "wide");
  onPanelClick("#cback2", () => { closePanel(); if (back) back(); });
}

function showGallery(back) {
  const list = COMMISSIONS.map(cm => {
    const owned = SAVE.commissions.includes(cm.id);
    return `<div class="comm ${owned ? "owned" : ""}">
      <div class="swatch" style="background:${cm.cape}"></div>
      <div class="cinfo"><b>${esc(cm.name)}</b>
        ${owned ? `<p>${esc(cm.fact)}</p>` : `<p class="tiny">Commission it to unlock a fact and a new cape color.</p>`}</div>
      <div>${owned ? `<button class="btn" data-wear="${cm.id}">${SAVE.cape === cm.cape ? "Wearing" : "Wear cape"}</button>`
        : `<button class="btn primary" data-buy="${cm.id}" ${SAVE.florins < cm.cost ? "disabled" : ""}>${cm.cost} ƒ</button>`}</div>
    </div>`;
  }).join("");
  openPanel(`<div class="phead"><h2>Become a Patron</h2><button class="btn" data-back id="gback">Close</button></div>
    <p class="small">You have <b>${SAVE.florins} florins</b>. Spend them the way the Medici did: by paying artists to create.</p>
    <div class="comms">${list}</div>`, "wide");
  onPanelClick("#gback", () => { closePanel(); if (back) back(); });
  panelEl.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => {
    const cm = COMMISSIONS.find(x => x.id === b.dataset.buy);
    if (SAVE.florins < cm.cost) return;
    SAVE.florins -= cm.cost; SAVE.commissions.push(cm.id); SAVE.cape = cm.cape; writeSave();
    Sfx.play("buff"); award("patron");
    toast(`You are now a patron! ${cm.name} commissioned.`, "buff");
    showGallery(back);
  });
  panelEl.querySelectorAll("[data-wear]").forEach(b => b.onclick = () => {
    SAVE.cape = COMMISSIONS.find(x => x.id === b.dataset.wear).cape; writeSave(); showGallery(back);
  });
}

function showPause() {
  const lv = G.scene === "level";
  openPanel(`<h2 class="center">Paused</h2>
    <div class="menu">
      <button class="btn primary" id="mres" data-back autofocus>Resume</button>
      <button class="btn" id="mcod">Codex</button>
      <button class="btn" id="mpro">Progress</button>
      <button class="btn" id="mman">Manuscripts &amp; Abilities</button>
      ${typeof Race !== "undefined" && Race.ready ? `<button class="btn" id="mrace">Class Race</button>` : ""}
      ${Sync.teacher ? `<button class="btn" id="mteach">Teacher dashboard</button>` : ""}
      ${lv ? "" : `<button class="btn" id="mgal">Become a Patron</button>`}
      <button class="btn" id="mmus">Music: ${SAVE.music ? "On" : "Off"}</button>
      <button class="btn" id="msnd">Sound effects: ${SAVE.muted ? "Off" : "On"}</button>
      ${lv ? `<button class="btn" id="mquit">Leave level (back to map)</button>` : ""}
    </div>`, "narrow");
  onPanelClick("#mres", closePanel);
  onPanelClick("#mcod", () => showCodexBook(showPause));
  onPanelClick("#mpro", () => showProgress(showPause));
  onPanelClick("#mman", () => showCollection(showPause));
  onPanelClick("#mteach", () => showTeacher(showPause));
  onPanelClick("#mrace", () => Race.openMenu(showPause));
  onPanelClick("#mgal", () => showGallery(showPause));
  onPanelClick("#mmus", () => { Music.toggle(); showPause(); });
  onPanelClick("#msnd", () => { SAVE.muted = !SAVE.muted; writeSave(); showPause(); });
  onPanelClick("#mquit", () => { closePanel(); toMap(); });
}

// =====================================================================
//  LEVEL 1 — layout
//  Grid legend: # ground  = brick  - plank (one-way)  ? quick-recall block
//               C Codex page  o florin  g gloomling  v pigeon  D Medici gate
//               K checkpoint  S spring  F flying machine  ^ caltrops
//               % crumbling roof tile
//               P start  1-9 signs.  Word blocks, rings, moving platforms
//               and water are listed separately in `meta`.
// =====================================================================
function buildLevel1() {
  const W = 303, H = 17, g = [];
  const meta = { sets: [], plats: [], water: [], landmarks: [], manus: [], hints: [] };
  for (let y = 0; y < H; y++) g.push(new Array(W).fill("."));
  const set = (x, y, ch) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; };
  const ground = (x0, x1, top = 14) => { for (let x = x0; x <= x1; x++) for (let y = top; y < H; y++) set(x, y, "#"); };
  const row = (x0, x1, y, ch) => { for (let x = x0; x <= x1; x++) set(x, y, ch); };
  const gate = x => { for (let y = 0; y <= 13; y++) set(x, y, "D"); };
  const words = x => { meta.sets.push({ type: "blocks", x }); for (const dx of [0, 4, 8]) row(x + dx, x + dx + 2, 10, "W"); };
  const rings = x => meta.sets.push({ type: "rings", x });
  const ms = (x, y, id, need) => { meta.manus.push({ x, y, id }); if (need) meta.hints.push({ x, need }); };

  // Zone 1 · Streets of Florence
  ground(0, 24); set(2, 13, "P"); set(3, 13, "1"); set(6, 13, "2");
  set(9, 13, "C"); row(11, 13, 11, "o"); set(15, 10, "?"); set(19, 13, "g"); set(21, 13, "C");
  // secret: a shaft only the Vitruvian Leap (wall-jump) can climb
  for (let y = 2; y <= 10; y++) set(17, y, "#"); for (let y = 5; y <= 10; y++) set(20, y, "#"); row(20, 22, 4, "=");
  ms(21, 3, "ms_lor", "wall");
  ground(29, 75); row(31, 34, 10, "="); row(31, 34, 9, "o"); set(36, 13, "g"); row(38, 39, 13, "^"); set(40, 13, "C"); set(43, 10, "?");
  set(46, 13, "K"); ground(48, 52, 12); set(50, 11, "C"); set(54, 13, "7");
  words(57); set(64, 13, "g"); set(70, 13, "g"); gate(73);

  // Zone 2 · Leonardo da Vinci's Bottega and the Arno
  ground(76, 95); set(78, 13, "4"); set(80, 13, "C"); set(86, 13, "g");
  row(83, 87, 11, "-"); row(89, 93, 8, "-"); row(89, 93, 7, "o"); set(91, 4, "?"); row(93, 94, 13, "^");
  ground(99, 131); set(103, 13, "C"); set(105, 13, "g"); set(106, 10, "?");
  // secret: a manuscript sealed in cracked stone (Printer's Press breaks it)
  row(100, 102, 11, "X"); set(100, 12, "X"); set(100, 13, "X"); set(102, 12, "X"); set(102, 13, "X"); ms(101, 13, "ms_pico", "pound");
  set(109, 13, "S"); row(111, 114, 6, "="); row(111, 114, 4, "o"); set(111, 3, "o"); set(114, 3, "o"); ms(112.5, 3, "ms_leo");
  row(115, 116, 13, "^"); set(117, 9, "v"); set(119, 13, "C"); set(121, 13, "K");
  ground(123, 127, 12); set(125, 11, "C"); set(128, 13, "8"); set(130, 13, "F");
  meta.water.push([132, 170]);
  row(136, 138, 6, "o"); rings(142); row(148, 151, 9, "o"); set(153, 6, "v"); rings(161); row(165, 168, 5, "o");
  ground(171, 190); set(175, 10, "?"); set(178, 13, "g"); set(181, 13, "K"); set(183, 13, "g"); gate(186);

  // Zone 3 · Rooftops of the Duomo
  ground(191, 201); set(193, 13, "5"); set(195, 13, "C"); row(196, 199, 11, "o"); set(197, 8, "?");
  meta.plats.push({ kind: "barge", x0: 202, x1: 209, y: 12 });
  ground(212, 239); set(215, 10, "?"); set(218, 9, "v"); set(221, 13, "g"); row(224, 225, 13, "^");
  words(228); set(233, 13, "g");
  row(240, 247, 13, "%"); row(241, 246, 10, "="); row(241, 246, 9, "o"); set(243, 6, "?");
  ground(248, 252); set(251, 13, "K");
  ground(256, 302); set(259, 13, "g"); row(261, 261, 13, "^"); set(262, 9, "v"); set(265, 10, "?"); gate(269);

  // Boss arena · The Fog of Forgetting
  set(272, 13, "6");
  row(277, 280, 10, "-"); row(284, 287, 7, "-"); row(291, 294, 10, "-");
  for (let y = 0; y < H; y++) set(302, y, "#");
  return { g, meta };
}

const RING_ROWS = [3.5, 7.5, 11.5];

// =====================================================================
//  LEVEL 2 — layout (same legend as Level 1, plus)
//               > <  ink-roller conveyors     g ink blot     v raven
//               meta.plats: presses (move up and down) and the Rhine raft
// =====================================================================
function buildLevel2() {
  const W = 312, H = 17, g = [];
  const meta = { sets: [], plats: [], water: [], landmarks: [], manus: [], hints: [], stations: [] };
  for (let y = 0; y < H; y++) g.push(new Array(W).fill("."));
  const set = (x, y, ch) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; };
  const ground = (x0, x1, top = 14) => { for (let x = x0; x <= x1; x++) for (let y = top; y < H; y++) set(x, y, "#"); };
  const row = (x0, x1, y, ch) => { for (let x = x0; x <= x1; x++) set(x, y, ch); };
  const gate = x => { for (let y = 0; y <= 13; y++) set(x, y, "D"); };
  const ms = (x, y, id, need) => { meta.manus.push({ x, y, id }); if (need) meta.hints.push({ x, need }); };
  const wall = x => { for (let y = 0; y <= 13; y++) set(x, y, "#"); };
  const words = (x, lead) => { meta.sets.push({ type: "blocks", x, lead }); for (const dx of [0, 4, 8]) row(x + dx, x + dx + 2, 10, "W"); };

  // Zone 1 · Wittenberg, 1517
  ground(0, 26); set(2, 13, "P"); set(3, 13, "1"); set(6, 13, "2");
  set(9, 13, "C"); row(11, 13, 11, "o"); set(15, 10, "?"); set(18, 13, "g"); set(22, 13, "C");
  ground(31, 80); row(33, 36, 10, "="); row(33, 36, 9, "o"); row(38, 39, 13, "^"); set(40, 8, "v");
  set(42, 13, "3"); meta.landmarks.push({ kind: "churchdoor", tx: 44, w: 3 });
  set(48, 13, "C"); set(50, 10, "?"); set(52, 13, "K"); ground(54, 58, 12); set(56, 11, "C");
  set(60, 13, "g"); words(63); set(68, 13, "g"); set(75, 13, "g"); gate(78);

  // Zone 2 · The Printing Workshop (ends with the Ink Golem)
  ground(81, 100); set(83, 13, "4"); set(86, 13, "C"); row(89, 94, 14, ">"); set(92, 10, "?"); set(97, 13, "g");
  meta.plats.push({ kind: "press", x: 102, y0: 9, y1: 13 });
  ground(107, 138); set(110, 13, "C"); meta.stations.push({ x: 112 }); set(123, 13, "g"); row(116, 121, 14, "<"); set(118, 10, "?");
  row(124, 127, 10, "="); row(124, 127, 9, "o"); ms(125.5, 6, "ms_86"); set(128, 13, "C"); set(130, 13, "K"); row(133, 133, 13, "^"); set(136, 13, "C");
  ground(139, 170); set(141, 13, "5"); row(150, 157, 10, "-"); wall(169);

  // Zone 3 · The Road to Worms, 1521 (down the Rhine)
  ground(171, 194); set(173, 13, "6"); set(176, 13, "C"); set(179, 13, "g"); set(182, 10, "?"); set(185, 8, "v");
  set(188, 13, "C"); set(192, 13, "K");
  for (let y = 2; y <= 10; y++) set(178, y, "#"); for (let y = 5; y <= 10; y++) set(181, y, "#"); row(181, 183, 4, "=");
  ms(182, 3, "ms_27", "wall");
  meta.water.push([195, 238]);
  meta.plats.push({ kind: "raft", x0: 195, x1: 235, y: 14 });
  words(201, 8); row(214, 217, 7, "o"); set(215, 6, "v"); words(223, 8);
  ground(239, 279); set(242, 13, "C"); set(245, 13, "g"); set(247, 10, "?");
  row(250, 255, 13, "%"); for (let x = 250; x <= 255; x++) for (let y = 14; y < H; y++) set(x, y, ".");
  row(251, 254, 9, "o"); set(258, 13, "K"); set(262, 9, "v"); set(265, 13, "g"); row(268, 268, 13, "^"); set(259, 10, "?"); gate(274);
  // secret: a high island only Da Vinci's Cloak (glide) can reach from the spring
  set(256, 13, "S"); row(267, 269, 8, "="); ms(268, 7, "ms_worms", "glide");

  // Final arena · The Rumor Mill
  ground(280, 311); set(281, 13, "7");
  row(286, 289, 10, "-"); row(293, 296, 7, "-"); row(300, 303, 10, "-");
  wall(311);
  return { g, meta };
}

// =====================================================================
//  LEVEL 3 — layout (same legend, plus)
//               B  palace wall that opens when the Long Gallery is solved
//               H  star-bridge: solid only with Galileo's Lens
//               meta.gallery: Tudor portraits (touch them in order)
//               meta.orrery: the Great Orrery, whose planets are platforms
//               meta.plats: ships that bob on the Channel
// =====================================================================
function buildLevel3() {
  const W = 346, H = 17, g = [];
  const meta = { sets: [], plats: [], water: [], landmarks: [], manus: [], hints: [], gallery: null, orrery: null };
  for (let y = 0; y < H; y++) g.push(new Array(W).fill("."));
  const set = (x, y, ch) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; };
  const ground = (x0, x1, top = 14) => { for (let x = x0; x <= x1; x++) for (let y = top; y < H; y++) set(x, y, "#"); };
  const row = (x0, x1, y, ch) => { for (let x = x0; x <= x1; x++) set(x, y, ch); };
  const gate = x => { for (let y = 0; y <= 13; y++) set(x, y, "D"); };
  const ms = (x, y, id, need) => { meta.manus.push({ x, y, id }); if (need) meta.hints.push({ x, need }); };
  const wall = x => { for (let y = 0; y <= 13; y++) set(x, y, "#"); };
  const words = (x, lead) => { meta.sets.push({ type: "blocks", x, lead }); for (const dx of [0, 4, 8]) row(x + dx, x + dx + 2, 10, "W"); };

  // Zone 1 · London, 1534
  ground(0, 26); set(2, 13, "P"); set(3, 13, "1"); set(6, 13, "2");
  set(9, 13, "C"); row(11, 13, 11, "o"); set(15, 10, "?"); set(19, 13, "g"); set(22, 13, "C");
  ground(29, 50); row(31, 34, 10, "="); row(31, 34, 9, "o"); row(37, 38, 13, "^"); set(40, 13, "C"); set(42, 10, "?");
  set(44, 13, "S"); row(45, 48, 5, "="); row(45, 48, 4, "o"); ms(46.5, 3, "ms_sup");
  set(49, 13, "K");
  row(51, 56, 13, "%"); set(54, 8, "v");
  ground(57, 82); set(58, 13, "3"); words(61); set(73, 13, "g"); set(76, 10, "?"); gate(80);

  // Zone 2 · Hampton Court Palace
  ground(83, 104); set(85, 13, "4"); set(88, 13, "C"); set(92, 10, "?"); set(97, 13, "g"); set(100, 13, "C");
  row(94, 97, 10, "-"); row(94, 97, 9, "o");
  ground(105, 158); set(107, 13, "C"); set(110, 13, "K"); set(112, 13, "5");
  meta.gallery = { x: 115, wall: 132 };
  for (let y = 0; y <= 13; y++) set(132, y, "B");
  set(136, 13, "g"); set(139, 10, "?"); words(141, 13); set(154, 9, "v"); gate(156);

  // Zone 3 · The Stargazer's Tower (ends with the Crystal Spheres)
  ground(159, 192); set(161, 13, "6"); set(164, 13, "C"); set(168, 10, "?"); set(170, 7, "v"); set(172, 13, "C"); set(176, 13, "C"); set(179, 13, "K");
  meta.sets.push({ type: "model", x: 183, lead: 6, n: 2, gap: 5 }); row(183, 185, 10, "W"); row(188, 190, 10, "W");
  meta.orrery = { x0: 193, x1: 214, cx: 204 * T, cy: 10 * T };
  ground(215, 222); set(216, 13, "K");
  // secret: a stair of star-bridges, visible only through Galileo's Lens
  row(220, 221, 11, "H"); row(217, 218, 8, "H"); row(220, 221, 5, "H"); ms(220.5, 3, "ms_cop", "lens");
  ground(223, 252); set(225, 13, "7"); row(234, 241, 10, "-"); wall(253);

  // Zone 4 · The English Channel, 1588
  ground(254, 272); set(256, 13, "8"); set(259, 13, "C"); set(261, 10, "?"); set(268, 13, "g"); set(271, 13, "K");
  // secret: a cracked chalk cave (Printer's Press smashes it)
  row(263, 265, 11, "X"); set(263, 12, "X"); set(263, 13, "X"); set(265, 12, "X"); set(265, 13, "X"); ms(264, 13, "ms_til", "pound");
  meta.water.push([273, 300]);
  meta.plats.push({ kind: "ship", x0: 275, y: 13, ph: 0 }, { kind: "ship", x0: 282, y: 12.4, ph: 2 }, { kind: "ship", x0: 289, y: 13, ph: 4 }, { kind: "ship", x0: 295, y: 12.4, ph: 1 });
  row(283, 286, 7, "o"); set(287, 6, "v");
  ground(301, 314); words(301, 10); gate(314);

  // Final arena · The Spanish Armada
  ground(315, 334); set(316, 13, "9");
  row(323, 326, 10, "-"); row(327, 330, 7, "-");
  meta.water.push([335, 344]);
  wall(345);
  return { g, meta };
}

// =====================================================================
//  LEVEL REGISTRY
//  Each level: layout, zones (sky, tiles, background layers, particles),
//  gates, signs, boss arenas, music, scenery and heraldry.
// =====================================================================
const LEVELS = {
  L1: {
    id: "L1", num: 1, title: "The Renaissance", build: buildLevel1, music: "level", bossMusic: "boss",
    zones: [
      { x0: 0, x1: 75, name: "Streets of Florence", sky: ["#8ec1e0", "#f4dfb3"], tiles: "z0", bg: ["hills", "city", "street"], tint: 0, sun: true, rays: true, amb: ["#f2b8c6", 1, "petal"] },
      { x0: 76, x1: 190, name: "Leonardo da Vinci’s Bottega", sky: ["#e9b878", "#f8e6bd"], tiles: "z1", bg: ["hills", "city", "street"], tint: 1, sun: true, rays: true, amb: ["#ffe6a0", -0.2, "mote"] },
      { x0: 191, x1: 270, name: "Rooftops of the Duomo", sky: ["#d9785a", "#f4c38c"], tiles: "z2", bg: ["hills", "city", "roofs"], tint: 2, sun: true, rays: true, amb: ["#ffb36b", -0.8, "dot"] },
      { x0: 271, x1: 999, name: "The Fog of Forgetting", sky: ["#3a2a4e", "#8a5a78"], tiles: "z3", bg: ["hills", "city", "roofs"], tint: 3, sun: "moon", dark: true, amb: ["#c9b2f0", -0.6, "wisp"] }
    ],
    gates: [
      { need: 1, min: 1, max: 2, name: "The First Medici Gate" },
      { need: 1, min: 1, max: 2, name: "The Bottega Gate" },
      { need: 2, min: 2, max: 3, name: "The Gate of Oblivion" }
    ],
    signs: {
      1: "← → (or A, D) to walk. SPACE (or ↑, W) to jump. Bump gold ? blocks from below!",
      2: "Glowing pages are Codex pages. Learn the short blue clue on each. Press C to reread.",
      4: "Leonardo da Vinci’s Bottega: a workshop where apprentices learned many skills at once.",
      5: "The Duomo rooftops! From up here you can see all of Europe. Ride the barge, and don’t linger on cracked roof tiles.",
      6: "The Fog of Forgetting! Touch the glowing lanterns and answer to blast it with light.",
      7: "Word blocks! Read the CLUE at the top of the screen, then bump the matching word.",
      8: "Leonardo da Vinci’s flying machine! Tap SPACE to flap. Fly through the ring with the right word."
    },
    arenas: [{ seal: 271, cam: 273, wall: 302, start: 274, boss: "fog", hp: 4, min: 3, max: 4, final: true, trig: "lantern",
      triggers: [[278.5, 9], [285.5, 6], [292.5, 9], [274.5, 13], [297.5, 13]],
      title: "Lantern of Knowledge", verb: "Light the lantern to strike the Fog", miss: "The lantern flickers out. Another will light soon." }],
    decor: [["lamp", "stall", "flowers", "barrel", "banner", "well", "lamp", "flowers"],
            ["easel", "bench", "sketch", "bush", "cypress", "barrel", "easel"],
            ["chimney", "pots", "laundry", "vane", "chimney", "pots"],
            ["column", "deadtree", "wisplamp"]],
    enemies: { g: "gloom", v: "bird" }, flag: "florence", arms: "medici", water: "arno", crumble: "crumble",
    flightEnd: 172, bridge: true, boats: [[136, 1], [160, -1]],
    npcs: { 2: { kind: "scholar", name: "Marsilio Ficino, a Florentine scholar" }, 8: { kind: "leonardo", name: "Leonardo da Vinci" } },
    comics: {
      intro: [
        { level: "L1", zone: 0, cam: 900, actors: [["player", 330, 448, 1], ["scholar", 520, 448, -1]], caption: "Florence, 1480. Bankers, artists, and scholars are filling the city with new ideas." },
        { level: "L1", zone: 3, cam: 1500, dark: true, actors: [["fog", 560, 170]], caption: "But a Fog of Forgetting is creeping over Italy, swallowing everything people have learned." },
        { level: "L1", zone: 3, cam: 300, dark: true, actors: [["herald", 600, 430, -1], ["player", 300, 448, 1]], caption: "The Herald of Forgetting: “Soon no one will remember any of it!” Only someone who truly remembers can stop him." }
      ],
      outro: [
        { level: "L1", zone: 2, cam: 1200, actors: [["fog", 600, 150, 110], ["player", 360, 448, 1]], caption: "The Fog lifts. Florence remembers!" },
        { level: "L1", zone: 2, cam: 600, actors: [["herald", 640, 360, 1]], caption: "The Herald flees north over the Alps, toward Germany. “You haven’t seen the last of me!”" }
      ]
    },
    win: { title: "The Fog lifts over Florence", next: "Visit the <b>Hall of Memory</b> in Siena tomorrow, or replay Florence for harder gate questions." },
    hurt: "The Fog overwhelmed you!"
  },
  L2: {
    id: "L2", num: 2, title: "The Reformation", build: buildLevel2, music: "level2", bossMusic: "boss2",
    zones: [
      { x0: 0, x1: 80, name: "Wittenberg, 1517", sky: ["#9fb4c7", "#e6e0d2"], tiles: "g0", bg: ["plains", "wittenberg", "fachwerk"], tint: 4, sun: true, amb: ["#c8642a", 0.8, "leaf"] },
      { x0: 81, x1: 170, name: "The Printing Workshop", sky: ["#4a3a2c", "#7a6048"], tiles: "g1", bg: ["workshopBack", "workshopFront"], tint: 5, sun: false, amb: ["#f4ead2", 0.35, "paper"] },
      { x0: 171, x1: 279, name: "The Road to Worms, 1521", sky: ["#e0967a", "#f3d2a8"], tiles: "g2", bg: ["rhineFar", "forest"], tint: 6, sun: true, rays: true, amb: ["#fff0a0", -0.25, "firefly"] },
      { x0: 280, x1: 999, name: "The Rumor Mill", sky: ["#1a1d33", "#3c3a5c"], tiles: "g3", bg: ["worms"], tint: 7, sun: "moon", amb: ["#f4ead2", 0.5, "paper"] }
    ],
    gates: [
      { need: 1, min: 1, max: 2, name: "The Wittenberg Gate" },
      { need: 2, min: 2, max: 3, name: "The Gate of Worms" }
    ],
    signs: {
      1: "Same controls as before: ← → to walk, SPACE to jump. Welcome to Germany!",
      2: "Wittenberg, October 1517. Indulgences are being sold nearby. Find the Codex pages to follow the story.",
      3: "Tradition says Martin Luther posted his 95 Theses on this church door on October 31, 1517. He also sent them to the Archbishop of Mainz.",
      4: "The printing workshop. Printers spread Martin Luther’s pamphlets across Germany in weeks. Watch the ink rollers and moving presses!",
      5: "The Ink Golem! Pull the glowing press levers and answer to break it apart.",
      6: "The road to Worms, 1521. Martin Luther was summoned to defend his writings. Ride the raft down the Rhine and bump the right answers!",
      7: "The Rumor Mill! As pamphlets spread, so did wild rumors. Answer at the lamps of truth to jam the mill."
    },
    arenas: [
      { seal: 139, cam: 140, wall: 169, start: 142, boss: "golem", hp: 2, min: 2, max: 3, final: false, trig: "lever",
        triggers: [[145.5, 13], [153.5, 9], [163.5, 13]],
        title: "Press Lever", verb: "Pull the lever to strike the Ink Golem", miss: "The lever jams. Another will glow soon." },
      { seal: 280, cam: 282, wall: 311, start: 283, boss: "rumor", hp: 4, min: 3, max: 4, final: true, trig: "lectern",
        triggers: [[287.5, 9], [294.5, 6], [301.5, 9], [283.5, 13], [307.5, 13]],
        title: "Lamp of Truth", verb: "Answer to light the lamp and jam the Rumor Mill", miss: "The lamp gutters out. Another will light soon." }
    ],
    decor: [["lamp", "pretzel", "cart", "barrel", "notice", "well", "lamp", "flowers"],
            ["press", "typecase", "paper", "inkbarrel", "drying", "typecase"],
            ["fir", "fern", "rock", "fir", "milestone", "mushroom"],
            ["torch", "eagleBanner", "column", "torch"]],
    enemies: { g: "blot", v: "raven" }, flag: "eagle", arms: "eagle", water: "rhine", crumble: "rockCrumble",
    npcs: { 2: { kind: "student", name: "Kaspar, a student at the university" }, 4: { kind: "printer", name: "Johann Rhau-Grunenberg, printer" },
            6: { kind: "raftsman", name: "Greta, a Rhine raft pilot" } },
    comics: {
      intro: [
        { level: "L2", zone: 0, cam: 700, actors: [["player", 330, 448, 1], ["student", 520, 448, -1]], caption: "Wittenberg, Germany, 1517. A monk and professor named Martin Luther is about to start an argument that will change Europe." },
        { level: "L2", zone: 1, cam: 300, actors: [["printer", 480, 448, -1], ["player", 300, 448, 1]], caption: "Printing presses can now copy ideas faster than ever before." },
        { level: "L2", zone: 3, cam: 600, actors: [["rumor", 560, 150], ["herald", 280, 420, 1]], caption: "The Herald is back, with a machine that spins rumors from every pamphlet!" }
      ],
      outro: [
        { level: "L2", zone: 3, cam: 900, actors: [["rumor", 560, 160, 110], ["player", 330, 448, 1]], caption: "The Rumor Mill grinds to a halt. Checking sources beats spreading rumors." },
        { level: "L2", zone: 2, cam: 1400, actors: [["herald", 640, 360, 1]], caption: "The Herald slips away again, this time toward the sea. Where will he strike next?" }
      ]
    },
    win: { title: "The Rumor Mill grinds to a halt", next: "Visit the <b>Hall of Memory</b> in Siena after a break. Level 2 terms now appear there too." },
    hurt: "The rumors overwhelmed you!"
  },
  L3: {
    id: "L3", num: 3, title: "Crown and Cosmos", build: buildLevel3, music: "level3", bossMusic: "boss3", mix: true,
    zones: [
      { x0: 0, x1: 82, name: "London, 1534", sky: ["#a9bfd4", "#ece3cf"], tiles: "t0", bg: ["thames", "tudorStreet"], tint: 8, sun: true, amb: ["#e8e2d6", 0.15, "mote"] },
      { x0: 83, x1: 158, name: "Hampton Court Palace", sky: ["#8fb6d8", "#f2e2c0"], tiles: "t1", bg: ["palace", "knot"], tint: 9, sun: true, rays: true, amb: ["#f4c8d0", 0.9, "petal"] },
      { x0: 159, x1: 253, name: "The Stargazer’s Tower", sky: ["#0f1530", "#2e3560"], tiles: "t2", bg: ["spires"], tint: 10, sun: "moon", amb: ["#fff3c0", -0.2, "star"] },
      { x0: 254, x1: 314, name: "The English Channel, 1588", sky: ["#86a8c0", "#e2dccb"], tiles: "t3", bg: ["channel", "dover"], tint: 11, sun: true, amb: ["#ffffff", 0.3, "spray"] },
      { x0: 315, x1: 999, name: "The Spanish Armada", sky: ["#2c3444", "#6a6e78"], tiles: "t3", bg: ["channel", "armadaFar"], tint: 12, sun: false, amb: ["#cfd8e0", 3, "rain"] }
    ],
    gates: [
      { need: 1, min: 1, max: 2, name: "The Tower Gate" },
      { need: 2, min: 2, max: 3, name: "The Tudor Gate" },
      { need: 2, min: 2, max: 4, name: "The Beacon Gate" }
    ],
    signs: {
      1: "Welcome to England! Same controls: ← → to walk, SPACE to jump, ↓ in mid-air to ground-pound if you have it.",
      2: "London, 1534. King Henry VIII has just broken with the pope. Watch for ideas from Italy and Germany: they followed you here!",
      3: "Clue bridges! Read the clue at the top, then bump the word that matches. Answers from ALL your levels can appear now.",
      4: "I am Catherine Parr, Henry VIII’s sixth wife. I helped raise his three children, Edward, Mary, and Elizabeth. Each would wear the crown.",
      5: "The Long Gallery! Jump up and touch the royal portraits in the order the Tudors ruled. The way out opens when you finish.",
      6: "In 1576 I explained Copernicus’s sun-centered universe in English. Bump the right answer to set the Great Orrery spinning the TRUE way!",
      7: "The Crystal Spheres! The Herald’s machine insists Earth is the center of everything. Use the telescopes and answer to shatter it.",
      8: "The Armada is coming! Light the beacons along the coast. Each answer sends the warning, and a fireship, against the fleet.",
      9: "The Spanish Armada! Light the beacons to strike. When the storm comes, you’ll need ideas from your WHOLE journey."
    },
    arenas: [
      { seal: 223, cam: 224, wall: 253, start: 226, boss: "spheres", hp: 2, min: 2, max: 3, final: false, trig: "scope",
        triggers: [[228.5, 13], [237.5, 9], [248.5, 13]],
        title: "Telescope", verb: "Observe and answer to crack a crystal sphere", miss: "The lens fogs over. Another telescope will clear soon." },
      { seal: 315, cam: 316, wall: 345, start: 318, boss: "armada", hp: 4, min: 3, max: 4, final: true, trig: "beacon",
        triggers: [[320.5, 13], [324.5, 9], [328.5, 6], [332.5, 13], [317.5, 13]],
        title: "Warning Beacon", verb: "Answer to light the beacon and send a fireship", miss: "The beacon smolders out. Another will catch soon." }
    ],
    decor: [["lamp", "barrel", "signpost", "crates", "pump", "barrel", "flowers"],
            ["topiary", "urn", "rose", "bench", "topiary", "fountain"],
            ["armillary", "globe", "quadrant", "candles", "books"],
            ["grass", "gorse", "anchor", "nets", "lobsterpot"],
            ["anchor", "nets", "beaconPost"]],
    enemies: { g: "rat", v: "gull" }, flag: "rose", arms: "tudor", water: "sea", crumble: "thatch",
    npcs: { 2: { kind: "apprentice", name: "Joan, a London apprentice" }, 4: { kind: "parr", name: "Catherine Parr, queen of England" },
            6: { kind: "digges", name: "Thomas Digges, astronomer" }, 8: { kind: "drake", name: "Francis Drake, sea captain" } },
    comics: {
      intro: [
        { level: "L3", zone: 0, cam: 700, actors: [["player", 330, 448, 1], ["apprentice", 520, 448, -1]], caption: "London, 1534. King Henry VIII has broken with the pope, and England will never be the same." },
        { level: "L3", zone: 2, cam: 400, actors: [["spheres", 560, 170], ["herald", 280, 420, 1]], caption: "The Herald has built a machine of crystal spheres to keep everyone believing that Earth is the center of everything." },
        { level: "L3", zone: 4, cam: 300, actors: [["armada", 620, 448], ["player", 300, 448, 1]], caption: "And out at sea, a mighty fleet is sailing for England. Can a kingdom that remembers stand firm?" }
      ],
      outro: [
        { level: "L3", zone: 4, cam: 300, actors: [["armada", 620, 448, 110], ["player", 330, 448, 1]], caption: "Fireships and storms scatter the Armada. England stands, and so does everything you’ve learned." },
        { level: "L3", zone: 3, cam: 900, actors: [["herald", 640, 360, 1], ["drake", 300, 448, 1]], caption: "The Herald is blown far out to sea. Francis Drake: “Remember this day, and he can never win.”" }
      ]
    },
    win: { title: "The Armada is scattered", next: "A new phase awaits: sail from London to <b>Portugal</b> and begin the Age of Exploration. Your whole journey mixes together in the <b>Hall of Memory</b>." },
    hurt: "The storm overwhelmed you!"
  }
};
const DECOR_WIDTH = { stall: 3, laundry: 3, pretzel: 3, drying: 3, cart: 3, press: 2, fountain: 2, nets: 2, crates: 2 };

// ---------------------------------------------------------------- level
class Level {
  constructor(def) {
    this.def = def;
    const { g, meta } = def.build();
    this.grid = g; this.H = g.length; this.W = g[0].length;
    this.replay = !!(SAVE.levels[def.id] && SAVE.levels[def.id].done);
    this.focus = LEVEL_CODEX[def.id];
    this.landmarks = meta.landmarks || [];
    this.manus = (meta.manus || []).map(m => ({ x: m.x * T + 16, y: m.y * T + 16, id: m.id, taken: !!SAVE.manuscripts[m.id], wasFound: !!SAVE.manuscripts[m.id] }));
    this.hints = (meta.hints || []).map(h => ({ x: h.x * T + 16, need: h.need }));
    this.stations = (meta.stations || []).map(st => ({ x: st.x * T, done: false }));
    this.arenas = (def.arenas || []).map(a => ({ ...a, done: false }));
    this.arena = null;
    this.coins = []; this.codex = []; this.enemies = []; this.checks = []; this.signs = [];
    this.doors = []; this.springs = []; this.machines = []; this.spikes = []; this.crumbles = [];
    this.water = meta.water;
    this.sets = meta.sets.map(s => ({ ...s, state: "idle", item: null, labels: [], result: null, t: 0 }));
    this.plats = meta.plats.map(m => m.kind === "press"
      ? { kind: "press", x: m.x * T, y: m.y1 * T, w: 3 * T, y0: m.y0 * T, y1: m.y1 * T, dir: -1, dx: 0, dy: 0 }
      : m.kind === "ship" ? { kind: "ship", x: m.x0 * T, y: m.y * T, y0: m.y * T, w: 4 * T, ph: m.ph, dx: 0, dy: 0 }
      : { kind: m.kind, x: m.x0 * T, y: m.y * T, w: (m.kind === "raft" ? 4 : 3) * T, x0: m.x0 * T, x1: m.x1 * T, dir: 1, dx: 0, dy: 0, go: m.kind !== "raft" });
    // The Great Orrery (Level 3): planets are platforms circling the center.
    // Geocentric mode adds looping epicycles; heliocentric mode is smooth.
    this.orrery = meta.orrery ? { ...meta.orrery, helio: false, k: 0, sunA: 0 } : null;
    if (this.orrery) [[330, 0.011, Math.PI], [215, -0.016, 0.6], [105, 0.024, 2.2]].forEach(([r, sp, ph]) => {
      const m = { kind: "orbit", r, sp, ph, w: 3 * T, dx: 0, dy: 0 };
      this.orbitPlace(m); this.plats.push(m);
    });
    // The Long Gallery (Level 3): touch the Tudor portraits in the order they ruled.
    this.gallery = meta.gallery ? { ...meta.gallery, order: shuffle([0, 1, 2, 3]), next: 0, errors: 0, cool: 0, done: false, lit: [false, false, false, false] } : null;
    let ci = 0;
    for (let x = 0; x < this.W; x++) for (let y = 0; y < this.H; y++) {
      const ch = g[y][x], px = x * T, py = y * T;
      const clear = () => { g[y][x] = "."; };
      if (ch === "P") { this.spawn = { x: px + 1, y: py + T - 42 }; clear(); }
      else if (ch === "o") { this.coins.push({ x: px + 16, y: py + 16, taken: false }); clear(); }
      else if (ch === "C") { this.codex.push({ x: px + 16, y: py + 16, c: this.focus[ci++], taken: false }); clear(); }
      else if (ch === "g") { this.enemies.push({ kind: def.enemies.g, x: px, y: py + 2, w: 36, h: 30, vx: -1.1, vy: 0, alive: true, dead: 0 }); clear(); }
      else if (ch === "v") { this.enemies.push({ kind: def.enemies.v, fly: true, x: px, y: py, by: py, w: 36, h: 24, vx: -1.4, x0: px - 140, x1: px + 140, alive: true, dead: 0, dive: 0, cool: 0, amp: 0 }); clear(); }
      else if (ch === "K") { this.checks.push({ x: px, y: py, on: false }); clear(); }
      else if (ch === "S") { this.springs.push({ x: px, y: py, squash: 0 }); clear(); }
      else if (ch === "F") { this.machines.push({ x: px, y: py }); clear(); }
      else if (ch === "^") { this.spikes.push({ x: px, y: py }); clear(); }
      else if (ch === "%") this.crumbles.push({ tx: x, ty: y, t: 0 });
      else if (ch >= "1" && ch <= "9") { this.signs.push({ x: px, y: py, id: +ch }); clear(); }
      else if (ch === "D" && !this.doors.find(d => d.x === x)) this.doors.push({ x, have: 0, open: false, lift: 0, cfg: def.gates[this.doors.length] });
    }
    this.p = { x: this.spawn.x, y: this.spawn.y, w: 30, h: 42, vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, jumpBuf: 0, jumps: 0, inv: 0, anim: 0, hearts: 4, maxHearts: 4, fly: false, flap: 0, ride: null, combo: 0, star: 0 };
    this.items = []; this.prizes = 0;
    this.respawn = { ...this.spawn };
    this.cam = 0; this.florinsEarned = 0;
    this.quick = { n: 0, right: 0, fast: 0, ms: [] }; this.deep = { n: 0, right: 0 }; this.byConcept = {};
    this.zone = -1; this.banner = null; this.busy = false; this.boss = null; this.won = false;
    this.bumps = []; this.activeSign = null; this.clue = null;
    this.ghosts = []; this.ghostAt = {};
    this.buildDecor();
    this.boats = (def.boats || []).map(([x, dir]) => ({ x: x * T, dir }));
    this.amb = [];
  }

  get zones() { return this.def.zones; }
  orbitPlace(m) {
    const O = this.orrery, e = (1 - O.k) * 46;
    m.x = O.cx + Math.cos(m.ph) * m.r + Math.cos(m.ph * 4) * e - m.w / 2;
    m.y = O.cy + Math.sin(m.ph) * m.r * 0.4 + Math.sin(m.ph * 4) * e * 0.7;
  }
  zoneOf(tx) { const i = this.zones.findIndex(z => tx <= z.x1); return i < 0 ? this.zones.length - 1 : i; }

  // Scenery: placed from a fixed seed so the level looks the same every time.
  buildDecor() {
    const g = this.grid, used = new Set(), r = mulberry(99);
    const mark = o => used.add(Math.floor(o.x / T));
    [...this.signs, ...this.checks, ...this.springs, ...this.machines, ...this.spikes].forEach(mark);
    this.doors.forEach(d => { used.add(d.x); used.add(d.x - 1); used.add(d.x + 1); });
    this.landmarks.forEach(l => { for (let k = -1; k <= l.w; k++) used.add(l.tx + k); });
    this.arenas.forEach(a => a.triggers.forEach(([tx]) => { used.add(Math.floor(tx)); used.add(Math.floor(tx) - 1); }));
    for (const m of this.plats) if (m.kind === "press") for (let k = -1; k <= 4; k++) used.add(Math.floor(m.x / T) + k);
    for (const st of this.stations) for (let k = -1; k <= 3; k++) used.add(Math.floor(st.x / T) + k);
    if (this.gallery) for (let k = this.gallery.x - 2; k <= this.gallery.wall + 1; k++) used.add(k);
    const KINDS = this.def.decor;
    const surface = tx => { for (let ty = 4; ty < this.H; ty++) { if (g[ty][tx] === "#") return g[ty - 1][tx] === "." ? ty : -1; if (g[ty][tx] !== ".") return -1; } return -1; };
    this.decor = [];
    let last = -10;
    for (let tx = 4; tx < this.W - 3; tx++) {
      const top = surface(tx);
      if (top < 0 || used.has(tx) || tx - last < 3 || r() > 0.38) continue;
      if (this.sets.some(st => st.type !== "rings" && tx >= st.x - 1 && tx <= st.x + 11)) continue;
      const z = this.zoneOf(tx);
      let kind = KINDS[z][Math.floor(r() * KINDS[z].length)];
      const wide = DECOR_WIDTH[kind] || 1;
      let fits = true;
      for (let k = 1; k < wide; k++) if (surface(tx + k) !== top || used.has(tx + k)) fits = false;
      if (!fits) kind = KINDS[z].find(k => !DECOR_WIDTH[k]) || "barrel";
      this.decor.push({ tx, base: top * T, kind, seed: r() });
      last = tx + (DECOR_WIDTH[kind] || 1) - 1;
    }
    const surf2 = tx => { for (let ty = 4; ty < this.H; ty++) if (g[ty][tx] !== ".") return ty; return 14; };
    for (const l of this.landmarks) this.decor.push({ tx: l.tx, base: surf2(l.tx) * T, kind: l.kind, seed: 0.5 });
  }

  tile(tx, ty) { if (tx < 0 || tx >= this.W) return "#"; if (ty < 0 || ty >= this.H) return "."; return this.grid[ty][tx]; }
  solid(ch) { return ch === "#" || ch === "=" || ch === "?" || ch === "u" || ch === "D" || ch === "W" || ch === "%" || ch === ">" || ch === "<" || ch === "G" || ch === "X" || ch === "B" || (ch === "H" && hasAbility("lens")); }
  inWater(tx) { return this.water.some(([a, b]) => tx >= a && tx <= b); }

  moveX(o) {
    o.x += o.vx;
    const top = Math.floor(o.y / T), bot = Math.floor((o.y + o.h - 1) / T);
    if (o.vx > 0) {
      const tx = Math.floor((o.x + o.w) / T);
      for (let ty = top; ty <= bot; ty++) if (this.solid(this.tile(tx, ty))) { o.x = tx * T - o.w - 0.01; o.vx = 0; return true; }
    } else if (o.vx < 0) {
      const tx = Math.floor(o.x / T);
      for (let ty = top; ty <= bot; ty++) if (this.solid(this.tile(tx, ty))) { o.x = (tx + 1) * T; o.vx = 0; return true; }
    }
    return false;
  }
  moveY(o) {
    const prevBottom = o.y + o.h;
    o.y += o.vy; o.onGround = false;
    const l = Math.floor(o.x / T), r = Math.floor((o.x + o.w - 1) / T);
    if (o.vy > 0) {
      const ty = Math.floor((o.y + o.h) / T);
      for (let tx = l; tx <= r; tx++) {
        const ch = this.tile(tx, ty);
        if (this.solid(ch) || (ch === "-" && prevBottom <= ty * T + 0.5)) { o.y = ty * T - o.h; o.vy = 0; o.onGround = true; return null; }
      }
    } else if (o.vy < 0) {
      const ty = Math.floor(o.y / T), cx = o.x + o.w / 2;
      let hit = null;
      for (let tx = l; tx <= r; tx++) if (this.solid(this.tile(tx, ty)) && (hit === null || Math.abs(tx * T + 16 - cx) < Math.abs(hit * T + 16 - cx))) hit = tx;
      if (hit !== null) { o.y = (ty + 1) * T; o.vy = 0; return { tx: hit, ty }; }
    }
    return null;
  }

  update() {
    const p = this.p;
    if (p.squash) p.squash *= 0.8;
    const jumpHeld = keys.jump || keys.up, jumpPressed = pressed.jump || pressed.up;

    // --- moving platforms (move first so riders are carried)
    for (const m of this.plats) {
      const ox = m.x, oy = m.y;
      if (m.kind === "press") { m.y += m.dir * 1.3; if (m.y < m.y0 || m.y > m.y1) { m.dir *= -1; m.y = clamp(m.y, m.y0, m.y1); } }
      else if (m.kind === "ship") m.y = m.y0 + Math.sin(G.t / 40 + m.ph) * 10;
      else if (m.kind === "orbit") { m.ph += m.sp * (1 + (1 - this.orrery.k) * 0.8); this.orbitPlace(m); }
      else if (m.kind === "raft") { if (m.go && m.x < m.x1) { m.x = Math.min(m.x1, m.x + 1.6); if (m.x >= m.x1 && Math.abs(p.x + 15 - (m.x + m.w / 2)) < 110) award("rafter"); } }
      else { m.x += m.dir * 1.9; if (m.x > m.x1 || m.x < m.x0) { m.dir *= -1; m.x = clamp(m.x, m.x0, m.x1); } }
      m.dx = m.x - ox; m.dy = m.y - oy;
    }
    if (p.ride) { p.x += p.ride.dx; p.y += p.ride.dy; }
    if (this.orrery) { const O = this.orrery; if (O.helio) O.k = Math.min(1, O.k + 0.01); O.sunA += 0.006; }

    // --- player
    if (p.fly) {
      const base = 3.4 + (keys.right ? 1 : 0) - (keys.left ? 1.6 : 0);
      p.vx += (base - p.vx) * 0.1; p.face = 1;
      if (jumpPressed) { p.vy = -5.6; p.flap = 14; Sfx.play("flap"); }
      p.vy = Math.min(p.vy + 0.3, 5);
      if (p.flap > 0) p.flap--;
    } else {
      const accel = p.onGround ? 0.55 : 0.4, max = 4.4;
      if (keys.left && !keys.right) { p.vx = Math.max(-max, p.vx - accel); p.face = -1; }
      else if (keys.right && !keys.left) { p.vx = Math.min(max, p.vx + accel); p.face = 1; }
      else { p.vx *= p.onGround ? 0.72 : 0.94; if (Math.abs(p.vx) < 0.1) p.vx = 0; }
      if (jumpPressed) p.jumpBuf = 8; else if (p.jumpBuf > 0) p.jumpBuf--;
      if (p.onGround) p.coyote = 7; else if (p.coyote > 0) p.coyote--;
      // Vitruvian Leap: wall contact while airborne
      const wallDir = !p.onGround ? this.wallSide(p) : 0;
      if (p.jumpBuf > 0 && p.coyote > 0) {
        p.carry = p.ride ? p.ride.dx : 0;   // keep a moving platform's momentum through the jump
        p.vy = -12.4; p.coyote = 0; p.jumpBuf = 0; p.ride = null; p.squash = 0.18; Sfx.play("jump");
      } else if (jumpPressed && wallDir && hasAbility("wall")) {
        p.vy = -11.2; p.vx = p.wallKick = -wallDir * 5.2; p.face = -wallDir; p.jumpBuf = 0; p.carry = 0; p.wallLock = 10;
        Sfx.play("jump"); burst(p.x + (wallDir > 0 ? p.w : 0), p.y + 20, "#e8dcc0", 8, 2);
      }
      // Printer's Press: slam down from mid-air
      if (pressed.down && !p.onGround && !p.pound && hasAbility("pound")) { p.pound = true; p.vy = 4; p.vx = 0; Sfx.play("whoosh"); }
      if (p.pound) { p.vy = Math.min(p.vy + 1.6, 15); p.vx *= 0.6; }
      else {
        if (p.vy >= 0) p.bounce = false;
        p.vy += (!jumpHeld && p.vy < 0 && !p.bounce) ? 1.2 : 0.55;   // releasing jump early makes a short hop (not for springs)
        if (wallDir && hasAbility("wall") && p.vy > 2.2 && ((wallDir > 0 && keys.right) || (wallDir < 0 && keys.left))) p.vy = 2.2;   // wall slide
        p.gliding = hasAbility("glide") && jumpHeld && p.vy > 1.3 && !p.onGround;
        if (p.gliding) p.vy = 1.3;
        p.vy = Math.min(p.vy, 12);
      }
      if (p.wallLock > 0) { p.wallLock--; p.vx = p.wallKick; }
    }
    const prevBottom = p.y + p.h, wasGround = p.onGround, fallV = p.vy;
    if (p.carry && !p.onGround) { const sv = p.vx; p.vx = p.carry; this.moveX(p); p.vx = sv; }
    this.moveX(p);
    const hit = this.moveY(p);
    if (p.onGround) { p.carry = 0; p.combo = 0; }
    if (p.pound && p.onGround) this.landPound();
    if (p.onGround && !wasGround && fallV > 6) { p.squash = -0.16; burst(p.x + 15, p.y + p.h, "rgba(200,180,150,0.8)", 6, 1.5); }
    if (hit) this.hitBlock(hit.tx, hit.ty);
    p.ride = null;
    for (const m of this.plats) {
      if (p.vy >= 0 && p.x + p.w > m.x + 4 && p.x < m.x + m.w - 4 && prevBottom <= m.y + 2 + Math.max(0, -m.dy) && p.y + p.h >= m.y) {
        p.y = m.y - p.h; p.vy = 0; p.onGround = true; p.ride = m;
        if (m.kind === "raft" && !m.go) { m.go = true; Sfx.play("splash"); toast("The current carries you down the Rhine!"); }
      }
    }
    // ink-roller conveyors push whatever stands on them
    if (p.onGround && !p.ride) {
      const under = this.tile(Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h + 1) / T));
      if (under === ">" || under === "<") { const sv = p.vx; p.vx = under === ">" ? 1.7 : -1.7; this.moveX(p); p.vx = sv; }
    }
    if (p.x < 0) p.x = 0;
    if (p.fly && p.y < 0) { p.y = 0; p.vy = Math.max(p.vy, 0); }
    if (p.inv > 0) p.inv--;
    if (p.star > 0) { p.star--; if (G.t % 3 === 0) burst(p.x + rnd(0, 30), p.y + rnd(0, 42), "#ffe58a", 1, 1.5); if (p.star === 90) toast("The laurel is fading…"); }
    this.updateItems(p);
    p.anim += Math.abs(p.vx) * 0.08;
    if (p.y > this.H * T + 40) {
      if (this.inWater(Math.floor((p.x + 15) / T))) { Sfx.play("splash"); burst(p.x + 15, this.H * T - 40, "#9fd0ee", 20, 4); }
      this.hurt(true); return;
    }
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2, ptx = pcx / T;

    // --- flight
    if (p.fly && ptx > (this.def.flightEnd || 0)) {
      p.fly = false; p.vy = Math.max(p.vy, 0); Sfx.play("whoosh"); burst(pcx, p.y, "#c9a46a", 20, 4);
      floatText(pcx, p.y - 20, "Safe landing!"); award("aviator");
    }
    for (const fm of this.machines) {
      if (!p.fly && Math.abs(pcx - (fm.x + 16)) < 26 && Math.abs(pcy - (fm.y + 8)) < 50) {
        p.fly = true; p.vy = -6; p.flap = 14; this.respawn = { x: fm.x - 40, y: fm.y + T - 42 };
        Sfx.play("whoosh"); toast("Tap SPACE to flap!");
      }
    }

    // --- zones
    const zi = this.zones.findIndex(z => ptx >= z.x0 && ptx <= z.x1 + 0.99);
    if (zi !== this.zone && zi >= 0) {
      this.zone = zi;
      this.banner = { text: this.zones[zi].name, sub: zi < this.zones.length - 1 ? `Level ${this.def.num} · Zone ${zi + 1}` : "Final challenge", t: 200 };
    }
    if (this.banner && --this.banner.t <= 0) this.banner = null;

    // --- recall sets (word blocks / rings) and ghosts of missed questions
    this.updateSets(ptx, pcx, pcy);
    if (this.gallery && !this.gallery.done) this.updateGallery(ptx);
    this.updateGhosts(ptx);

    // --- florins
    for (const c of this.coins) {
      if (c.taken) continue;
      const dx = pcx - c.x, dy = pcy - c.y, d = Math.hypot(dx, dy);
      if (d < 28) { c.taken = true; gainFlorins(1); Sfx.play("coin"); burst(c.x, c.y, "#ffd75e", 6, 2); }
    }
    // --- the printing press station (Level 2): unskippable, like a Codex page
    for (const st of this.stations) if (!st.done && pcx > st.x + 20) { st.done = true; this.busy = true; runPressPuzzle(this).then(() => { this.busy = false; }); return; }
    // --- lost manuscripts (secret) and hints near secrets you can't reach yet
    for (const m of this.manus) if (!m.taken && Math.hypot(pcx - m.x, pcy - m.y) < 36) { this.collectManuscript(m); return; }
    this.hint = null;
    for (const h of this.hints) {
      const ab = ABILITIES.find(a => a.id === h.need);
      const m = this.manus.find(m => Math.abs(m.x - h.x) < 70);
      if (!hasAbility(h.need) && Math.abs(pcx - h.x) < 110 && m && !m.taken) this.hint = { x: h.x, ab };
    }
    // --- codex pages: collected as soon as you pass them, so none can be skipped
    for (const c of this.codex) {
      if (!c.taken && pcx > c.x - 20) { this.collectCodex(c); return; }
    }
    // --- springs
    for (const s of this.springs) {
      if (s.squash > 0) s.squash--;
      if (p.vy > 0 && p.x + p.w > s.x + 4 && p.x < s.x + T - 4 && prevBottom <= s.y + 16 && p.y + p.h >= s.y + 12) {
        p.y = s.y + 12 - p.h; p.vy = -18; p.bounce = true; p.pound = false; s.squash = 12; Sfx.play("spring");
      }
    }
    // --- enemies (they hold still while you read a sign or a guide's tip)
    const reading = !!this.activeSign;
    for (const e of this.enemies) {
      if (!e.alive) { e.dead++; continue; }
      if (Math.abs(e.x - p.x) > 900) continue;
      e.frozen = reading && Math.abs(e.x - p.x) < 700;
      if (e.frozen) continue;
      if (e.fly) {
        e.x += e.vx; if (e.x < e.x0 || e.x > e.x1) e.vx *= -1;
        if (e.cool > 0) e.cool--;
        if (!e.dive && !e.cool && Math.abs(pcx - (e.x + 18)) < 120 && e.by < p.y - 20) { e.dive = 1; e.amp = clamp(p.y + 10 - e.by, 40, 220); Sfx.play("coo"); }
        let dy = 0;
        if (e.dive) { dy = Math.sin(e.dive / 56 * Math.PI) * e.amp; if (++e.dive > 56) { e.dive = 0; e.cool = 220; } }
        e.y = e.by + Math.sin(G.t / 22 + e.x0) * 26 + dy;
        if (G.t % 240 === 0 && Math.abs(e.x - p.x) < 400) Sfx.play("coo");
      } else {
        e.vy = Math.min(e.vy + 0.5, 10);
        const vx = e.vx;
        if (this.moveX(e)) e.vx = -vx;
        this.moveY(e);
        if (e.onGround && Math.random() < 0.004) e.vy = -8;
        if (e.onGround) {
          const ahead = e.vx > 0 ? e.x + e.w + 2 : e.x - 2;
          const ch = this.tile(Math.floor(ahead / T), Math.floor((e.y + e.h + 4) / T));
          if (!this.solid(ch) && ch !== "-") e.vx = -e.vx;
        }
      }
      if (p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
        if (p.star > 0) {
          e.alive = false; Sfx.play("stomp"); gainFlorins(3, e.x + 18, e.y); burst(e.x + 18, e.y + 12, "#ffd75e", 18, 4);
        } else if (p.vy > 0 && prevBottom <= e.y + 12) {
          e.alive = false; p.vy = jumpHeld ? -11 : -7; Sfx.play("stomp");
          p.combo++;
          gainFlorins(2 * p.combo, e.x + 18, e.y);
          if (p.combo >= 2) { floatText(e.x + 18, e.y - 34, `Combo ×${p.combo}!`, "#ffb347"); Sfx.play("ding"); } burst(e.x + 18, e.y + 12, { bird: "#c9c2b8", raven: "#2a2a34", blot: "#1a1a2a", rat: "#6e5a4a", gull: "#f2f2ee" }[e.kind] || "#6b4f8a", 14, 3);
        } else this.hurt();
      }
    }
    // --- caltrops
    for (const k of this.spikes) if (p.x + p.w > k.x + 6 && p.x < k.x + T - 6 && p.y + p.h > k.y + 18 && p.y < k.y + T) this.hurt();
    // --- crumbling roof tiles: fall shortly after you land on them, return later
    if (p.onGround) {
      const ty = Math.floor((p.y + p.h + 1) / T);
      for (const c of this.crumbles) if (c.ty === ty && !c.t && c.tx >= Math.floor(p.x / T) && c.tx <= Math.floor((p.x + p.w - 1) / T)) c.t = 1;
    }
    for (const c of this.crumbles) {
      if (!c.t) continue;
      c.t++;
      if (c.t === 26) { this.grid[c.ty][c.tx] = "."; burst(c.tx * T + 16, c.ty * T + 16, this.def.crumble === "crumble" ? "#b5532f" : "#8a8476", 8, 2.5); Sfx.play("bump"); }
      if (c.t > 26 + 240 && !(p.x + p.w > c.tx * T && p.x < c.tx * T + T && p.y + p.h > c.ty * T)) { this.grid[c.ty][c.tx] = "%"; c.t = 0; }
    }
    // --- checkpoints, chests, signs
    for (const k of this.checks) if (!k.on && pcx > k.x + 8) {
      k.on = true; this.respawn = { x: k.x + 2, y: k.y + T - 42 };
      if (p.hearts < p.maxHearts) { p.hearts = p.maxHearts; floatText(k.x + 16, k.y - 64, "Hearts restored!", "#ffb0a8"); }
      Sfx.play("check"); floatText(k.x + 16, k.y - 40, "Checkpoint!"); burst(k.x + 16, k.y - 30, "#ffd75e", 14, 3);
    }
    this.activeSign = null;
    for (const s of this.signs) if (Math.abs(pcx - (s.x + 16)) < 70 && Math.abs(pcy - s.y) < 90) this.activeSign = s;
    // --- gates
    for (const d of this.doors) {
      if (d.open) { if (d.lift < 96) d.lift += 3; continue; }
      if (!this.busy && p.x + p.w >= d.x * T - 3 && p.x < d.x * T) { this.openGate(d); return; }
    }
    // --- boss arenas
    if (!this.boss) for (const a of this.arenas) if (!a.done && ptx > a.start) { this.startArena(a); break; }
    if (this.boss) this.updateBoss();

    // --- camera
    let target = this.arena ? this.arena.cam * T : p.x - VW * 0.4;
    target = clamp(target, 0, this.W * T - VW);
    this.cam += (target - this.cam) * (this.arena ? 0.06 : 0.15);
    this.bumps = this.bumps.filter(b => --b.t > 0);
  }

  // ------------------------------------------------ recall sets
  updateSets(ptx, pcx, pcy) {
    this.clue = null;
    for (const s of this.sets) {
      if (s.state === "idle" && ptx > s.x - (s.lead || (s.type === "rings" ? 11 : 15))) {
        s.item = s.type === "model" ? orreryCue() : Learn.pickFlash({ dir: "cue", focus: this.focus, mix: !!this.def.mix });
        if (!s.item) { this.finishSet(s); continue; }
        s.labels = s.item.options.slice();
        s.state = "active"; Sfx.play("tick");
      }
      if (s.state === "active") {
        this.clue = { text: s.item.prompt, how: s.type === "rings" ? "Fly through the matching ring" : "Bump the matching word" };
        if (s.type === "rings") {
          const rx = s.x * T + 16;
          if (s.prevX !== undefined && s.prevX < rx && pcx >= rx) {
            let best = -1, bd = 52;
            RING_ROWS.forEach((r, i) => { const d = Math.abs(pcy - r * T); if (d < bd) { bd = d; best = i; } });
            if (best >= 0) this.resolveSet(s, best); else this.missSet(s);
          }
          s.prevX = pcx;
        } else if (ptx > s.x + this.setSpan(s) + 2) this.missSet(s);
      } else if (s.state === "result") {
        if (--s.t <= 0) this.finishSet(s);
        else this.clue = { text: s.item.prompt, how: s.result.ok ? "Correct!" : s.item.fix, ok: s.result.ok };
      }
    }
  }
  setSpan(s) { return ((s.n || 3) - 1) * (s.gap || 4) + 2; }
  setAtTile(tx) { return this.sets.find(s => s.type !== "rings" && s.state === "active" && tx >= s.x && tx <= s.x + this.setSpan(s)); }
  resolveSet(s, slot) {
    const ok = s.labels[slot] === s.item.answer;
    s.state = "result"; s.t = s.type === "rings" ? 60 : 100; s.result = { slot, ok };
    afterQuick(s.item, ok, null);
    const x = s.type === "rings" ? s.x * T + 16 : (s.x + slot * (s.gap || 4) + 1.5) * T, y = s.type === "rings" ? RING_ROWS[slot] * T : 10 * T;
    if (ok) { Sfx.play("ding"); burst(x, y, "#ffd75e", 24, 4.5); }
    else { Sfx.play("wrong"); burst(x, y, "#c0504a", 14, 3); if (s.type !== "model") this.queueGhost({ quick: s.item }); }
    if (s.type === "model") {
      if (ok) this.setHelio();
      else toast("The orrery keeps grinding the old way: planets loop and lurch. Try again!");
    }
  }
  missSet(s) {
    s.state = "result"; s.t = 110; s.result = { slot: -1, ok: false };
    if (s.type === "model") return;
    this.queueGhost({ quick: s.item });
    floatText(this.p.x + 15, this.p.y - 30, s.item.fix, "#ffe0d0");
  }
  finishSet(s) {
    // A wrong orrery answer re-arms with a fresh clue while you are still nearby.
    if (s.type === "model" && !(s.result && s.result.ok) && !this.orrery.helio && (this.p.x + 15) / T < s.x + this.setSpan(s) + 2) {
      s.state = "idle"; s.result = null; return;
    }
    s.state = "done";
    if (s.type !== "rings") for (let tx = s.x; tx <= s.x + this.setSpan(s); tx++) if (this.grid[10][tx] === "W") this.grid[10][tx] = ".";
  }
  setHelio() {
    const O = this.orrery;
    if (O.helio) return;
    O.helio = true; award("copernican"); Sfx.play("auto"); G.shake = 6;
    toast("Copernicus was right! With the sun at the center, the planets glide in simple circles.", "buff");
  }

  // ------------------------------------------------ the Long Gallery
  updateGallery(ptx) {
    const Gl = this.gallery, p = this.p;
    if (ptx < Gl.x - 5 || ptx > Gl.wall) return;
    if (Gl.cool > 0) Gl.cool--;
    const next = TUDORS[Gl.next];
    this.clue = { text: Gl.next === 0 ? "Who ruled FIRST?" : `Who ruled after ${TUDORS[Gl.next - 1][1]}?`, how: "Jump up and touch the right portrait" };
    if (Gl.cool) return;
    for (let i = 0; i < 4; i++) {
      const fx = (Gl.x + i * 4) * T - 10, fy = GALLERY_Y;
      if (Gl.lit[i] || !(p.x + p.w > fx && p.x < fx + 52 && p.y < fy + 66 && p.y + p.h > fy)) continue;
      const who = Gl.order[i];
      if (who === Gl.next) {
        Gl.lit[i] = true; Gl.next++; Gl.cool = 20;
        Sfx.play("ding"); burst(fx + 26, fy + 33, "#ffd75e", 22, 4); gainFlorins(3, fx + 26, fy - 10);
        floatText(fx + 26, fy - 30, TUDORS[who][1], "#fff3c4");
        if (Gl.next === 4) this.finishGallery();
      } else {
        Gl.errors++; Gl.cool = 50; Sfx.play("wrong"); burst(fx + 26, fy + 33, "#c0504a", 12, 3);
        floatText(fx + 26, fy - 30, `Not yet: ${next[1]} comes next`, "#ffe0d0");
        tally(TUDORS[who][0], false);
      }
      return;
    }
  }
  finishGallery() {
    const Gl = this.gallery, q = QBYID.t_succ, ok = Gl.errors === 0;
    Gl.done = true;
    for (let y = 0; y <= 13; y++) if (this.grid[y][Gl.wall] === "B") { this.grid[y][Gl.wall] = "."; burst(Gl.wall * T + 16, y * T + 16, "#b5532f", 4, 3); }
    afterAnswer(q, ok, Learn.record(q, ok));
    if (ok) award("gallery");
    Sfx.play("door"); G.shake = 8;
    toast(ok ? "A perfect line of succession! The gallery doors open." : "The Tudors in order: Henry VIII → Edward VI → Mary I → Elizabeth I. The doors open.", ok ? "buff" : "");
  }

  // Which side (if any) the player is pressed against: -1 left, 1 right.
  wallSide(o) {
    const top = Math.floor((o.y + 4) / T), bot = Math.floor((o.y + o.h - 6) / T);
    for (const [dir, x] of [[1, o.x + o.w + 2], [-1, o.x - 2]]) {
      const tx = Math.floor(x / T);
      for (let ty = top; ty <= bot; ty++) { const ch = this.tile(tx, ty); if (ch === "#" || ch === "=" || ch === "X") return dir; }
    }
    return 0;
  }
  landPound() {
    const p = this.p; p.pound = false; G.shake = 9; Sfx.play("stomp");
    burst(p.x + 15, p.y + p.h, "#c9b48a", 14, 3);
    const ty = Math.floor((p.y + p.h + 2) / T);
    for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w - 1) / T); tx++) if (this.tile(tx, ty) === "X") this.smash(tx, ty);
    for (const e of this.enemies) if (e.alive && !e.fly && Math.abs(e.x + 18 - p.x - 15) < 90 && Math.abs(e.y + e.h - p.y - p.h) < 20) { e.alive = false; gainFlorins(2, e.x + 18, e.y); }
  }
  // Break a cluster of cracked stone.
  smash(tx, ty) {
    const stack = [[tx, ty]]; let n = 0;
    while (stack.length && n < 16) {
      const [x, y] = stack.pop();
      if (this.tile(x, y) !== "X") continue;
      this.grid[y][x] = "."; n++;
      burst(x * T + 16, y * T + 16, "#9a948a", 10, 3.5);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    Sfx.play("door"); floatText(tx * T + 16, ty * T - 10, "Smashed!", "#fff3c4");
  }
  async collectManuscript(m) {
    m.taken = true; Sfx.play("page"); burst(m.x, m.y, "#ffe58a", 26, 4.5);
    const M = MANUSCRIPTS.find(x => x.id === m.id);
    const first = !SAVE.manuscripts[M.id];
    SAVE.manuscripts[M.id] = true; writeSave();
    this.busy = true; G.modal = true; clearKeys();
    const ok = await Quiz.ask(M.q, { title: `Lost Manuscript · ${M.title}`, subtitle: "A real primary source. Read it like a historian." });
    G.modal = false; clearKeys(); this.busy = false;
    afterAnswer(M.q, ok, Learn.record(M.q, ok));
    if (ok && first) gainFlorins(15, m.x, m.y - 30);
    const found = MANUSCRIPTS.filter(x => x.level === this.def.id && SAVE.manuscripts[x.id]).length;
    toast(`Lost Manuscript found · ${found} of 3 in this level`, "ach");
    if (found === 3) award("seal" + this.def.num);
    award("archivist");
  }

  // ------------------------------------------------ ghost blocks
  // A missed question comes back as a translucent block a little further on.
  queueGhost(payload) {
    if (this.arena || this.ghosts.length >= 4) return;
    const ptx = (this.p.x + 15) / T;
    this.ghosts.push({ after: ptx + 15, payload });
  }
  ghostSpotOK(tx) {
    if (tx < 2 || tx >= this.W - 2) return -1;
    if (this.arenas.some(a => tx >= a.seal - 2 && tx <= a.wall + 1) || this.inWater(tx)) return -1;
    if (this.sets.some(st => tx >= st.x - 2 && tx <= st.x + 12) || this.doors.some(d => Math.abs(d.x - tx) < 3)) return -1;
    if (this.landmarks.some(l => tx >= l.tx - 1 && tx <= l.tx + l.w)) return -1;
    let ty = 4; while (ty < this.H && this.grid[ty][tx] === ".") ty++;
    if (ty >= this.H || this.grid[ty][tx] !== "#" || ty < 7) return -1;
    for (let y = ty - 6; y < ty; y++) for (let x = tx - 1; x <= tx + 1; x++) if (this.tile(x, y) !== ".") return -1;
    return ty - 4;
  }
  updateGhosts(ptx) {
    for (const gq of this.ghosts) {
      if (gq.placed || ptx < gq.after) continue;
      for (let tx = Math.floor(ptx) + 19; tx < Math.floor(ptx) + 34; tx++) {
        const ty = this.ghostSpotOK(tx);
        if (ty > 0) { this.grid[ty][tx] = "G"; this.ghostAt[tx + "," + ty] = gq.payload; gq.placed = true; break; }
      }
    }
    this.ghosts = this.ghosts.filter(g => !g.placed);
  }
  async askGhost(tx, ty) {
    const payload = this.ghostAt[tx + "," + ty];
    this.grid[ty][tx] = "."; delete this.ghostAt[tx + "," + ty];
    if (!payload) return;
    burst(tx * T + 16, ty * T + 16, "#e9dcff", 20, 3.5); Sfx.play("page");
    G.modal = true; clearKeys();
    let ok;
    if (payload.deep) {
      const q = payload.deep;
      ok = await Quiz.ask(q, { title: "Ghost of a Missed Question", subtitle: "Second chance: you missed this one earlier" });
      afterAnswer(q, ok, Learn.record(q, ok));
    } else {
      const item = { ...payload.quick, options: shuffle(payload.quick.options) };
      const r = await Quiz.flash(item, { title: "Ghost of a Missed Question" });
      ok = r.ok; afterQuick(item, ok, r.ms);
    }
    G.modal = false; clearKeys();
    if (ok) {
      gainFlorins(6, tx * T + 16, ty * T - 10); floatText(tx * T + 16, ty * T - 34, "Comeback!", "#c9b2f0");
      award("ghostbuster"); this.ghostsCleared = (this.ghostsCleared || 0) + 1;
    }
  }

  hitBlock(tx, ty) {
    const ch = this.tile(tx, ty);
    if (ch === "G") { this.askGhost(tx, ty); return; }
    if (ch === "?") {
      this.grid[ty][tx] = "u";
      this.bumps.push({ tx, ty, t: 10 });
      Sfx.play("bump");
      this.askBlock(tx, ty);
    } else if (ch === "W") {
      const s = this.setAtTile(tx);
      if (s) { const gap = s.gap || 4, slot = Math.floor((tx - s.x) / gap); if (tx - s.x - slot * gap < 3) this.resolveSet(s, slot); }
      else Sfx.play("bump");
    } else Sfx.play("bump");
  }
  async askBlock(tx, ty) {
    const ok = await askQuick("Quick recall", this.focus);
    const x = tx * T + 16, y = ty * T;
    if (ok === false) { burst(x, y + 16, "#8c6a3f", 10, 2); return; }
    burst(x, y - 8, "#ffd75e", 16, 3.5);
    if (ok !== true) return;
    // the first prize in a level is always a laurel, so everyone discovers it
    const p = this.p, kind = this.prizes === 0 ? "laurel" : p.hearts < p.maxHearts ? "heart" : Math.random() < 0.45 ? "laurel" : null;
    if (!kind) return;
    this.prizes++;
    this.items.push({ kind, x, y: y - 6, vy: -5, rise: 26, t: 0 });
    Sfx.play("auto");
  }
  // Prizes float up out of a block and wait above it to be collected.
  updateItems(p) {
    for (const it of this.items) {
      it.t++;
      if (it.rise > 0) { it.y += it.vy; it.vy = Math.min(it.vy + 0.35, -0.5); it.rise--; }
      if (Math.hypot(p.x + 15 - it.x, p.y + 21 - it.y) < 34) {
        it.got = true; burst(it.x, it.y, it.kind === "heart" ? "#ff8a80" : "#ffe58a", 24, 4);
        if (it.kind === "heart") { p.hearts = Math.min(p.maxHearts, p.hearts + 1); floatText(it.x, it.y - 30, "+1 heart", "#ffb0a8"); Sfx.play("check"); }
        else { p.star = 480; toast("Golden Laurel! Invincible for a few seconds: run through enemies!", "streak"); Sfx.play("win"); award("laurel"); }
      }
      if (it.t > 900) it.got = true;
    }
    this.items = this.items.filter(i => !i.got);
  }

  async collectCodex(c) {
    c.taken = true; Sfx.play("page"); burst(c.x, c.y, "#fff3c4", 20, 4);
    if (Learn.introduce(c.c)) {
      await showCodexIntro(c.c);
      award("first_codex");
      if (this.focus.every(c => Learn.isIntroduced(c))) award(this.def.num === 1 ? "polymath" : "polymath" + this.def.num);
    } else { gainFlorins(3, c.x, c.y - 30); floatText(c.x, c.y - 56, CONCEPTS[c.c].name, "#fff3c4"); }
  }

  async openGate(d) {
    this.busy = true;
    // The gate asks its questions once and always opens; correct answers earn a reward.
    const maxT = this.replay ? d.cfg.max : Math.max(1, d.cfg.max - 1), minT = Math.min(d.cfg.min, maxT);
    let asked = 0;
    while (asked < d.cfg.need) {
      const ok = await askQ({
        focus: this.focus,
        title: d.cfg.name,
        subtitle: d.cfg.need > 1 ? `Question ${asked + 1} of ${d.cfg.need} · each right answer earns florins` : "Answer to earn florins as the gate opens",
        minTier: minT, maxTier: maxT
      });
      if (ok === null) break;
      asked++;
      if (ok) d.have++;
    }
    d.open = true;
    for (let y = 11; y <= 13; y++) this.grid[y][d.x] = ".";
    Sfx.play("door"); G.shake = 8;
    if (asked && d.have === asked) { gainFlorins(10, this.p.x + 15, this.p.y - 30); toast("Perfect! The gate swings open (+10 florins).", "buff"); }
    else toast(asked ? "The gate swings open. Missed questions will come back as ghost blocks." : "The gate swings open!");
    this.busy = false;
  }

  hurt(pit = false) {
    const p = this.p;
    if (!pit && (p.inv > 0 || p.star > 0)) return;
    p.hearts--; Sfx.play("hurt"); G.shake = 10;
    if (p.hearts <= 0) {
      p.hearts = p.maxHearts;
      const lost = Math.min(SAVE.florins, 5); SAVE.florins -= lost; writeSave();
      toast(`${this.def.hurt} Back to the checkpoint (−${lost} florins).`);
      this.toRespawn();
    } else if (pit) this.toRespawn();
    else { p.inv = 70; p.vy = -6; p.vx = -p.face * 4; }
  }
  toRespawn() {
    const p = this.p; p.x = this.respawn.x; p.y = this.respawn.y; p.vx = p.vy = 0; p.inv = 90; p.fly = false; p.ride = null;
    for (const m of this.plats) if (m.kind === "raft" && this.respawn.x < m.x0 + 8) { m.x = m.x0; m.go = false; }
  }

  // ------------------------------------------------ boss arenas
  // fog: floats and drops orbs (Level 1)
  // golem: stomps along the floor, hurls ink and sends ink waves (Level 2 mini-boss)
  // rumor: floats, fires rumor scrolls and drops pamphlets (Level 2 final boss)
  startArena(a) {
    this.arena = a;
    for (let y = 0; y <= 13; y++) this.grid[y][a.seal] = "#";
    const cx = (a.cam + 15) * T;
    const bx = a.boss === "armada" ? (a.cam + 24) * T : cx;
    this.boss = { type: a.boss, x: bx, y: a.boss === "golem" || a.boss === "armada" ? 14 * T : 100, wind: 0, vy: 0, air: false, hp: a.hp, maxHp: a.hp, t: 0, orbs: [], lantern: -1, last: 3, cd: 90, flash: 0, beam: null, dying: 0, cx: bx };
    this.respawn = { x: a.start * T, y: 13 * T + T - 42 };
    Sfx.play("boss"); Music.play(this.def.bossMusic); G.shake = 14;
  }
  updateBoss() {
    const b = this.boss, a = this.arena, p = this.p, pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    b.t++;
    if (b.flash > 0) b.flash--;
    if (b.beam && --b.beam.t <= 0) b.beam = null;
    if (b.dying) {
      b.dying++;
      if (b.dying % 4 === 0) burst(b.x + rnd(-90, 90), b.y + (b.type === "golem" || b.type === "armada" ? rnd(-100, 0) : rnd(-50, 50)), { fog: "#cdb8e8", golem: "#1a1a2a", spheres: "#d8ecff", armada: "#ffb347" }[b.type] || "#f4ead2", 6, 3);
      if (b.dying === 150) a.final ? (!this.won && this.win()) : this.arenaCleared();
      return;
    }
    const left = (a.cam + 2) * T, right = (a.cam + 28) * T, rage = b.maxHp - b.hp;
    if (b.type === "fog") {
      b.x = b.cx + Math.sin(b.t / 90) * 300;
      b.y = 100 + Math.sin(b.t / 37) * 25;
      const rate = 118 - rage * 16;
      if (b.t % rate === 0) {
        const vx = clamp((pcx - b.x) / 70, -3.6, 3.6);
        b.orbs.push({ kind: "fog", x: b.x, y: b.y + 40, vx, vy: 0, g: 0.12 });
        if (b.hp <= 3) b.orbs.push({ kind: "fog", x: b.x, y: b.y + 40, vx: vx - 1.6, vy: -1, g: 0.12 }, { kind: "fog", x: b.x, y: b.y + 40, vx: vx + 1.6, vy: -1, g: 0.12 });
      }
    } else if (b.type === "golem") {
      const floor = 14 * T;
      if (!b.air) {
        b.x += clamp(pcx - b.x, -1, 1) * (0.7 + rage * 0.25);
        if (b.t % 170 === 0) { b.vy = -9; b.air = true; }
      } else {
        b.vy += 0.4; b.y += b.vy;
        if (b.y >= floor) {
          b.y = floor; b.air = false; G.shake = 12; Sfx.play("stomp");
          for (const dir of [-1, 1]) b.orbs.push({ kind: "wave", x: b.x + dir * 40, y: floor - 12, vx: dir * 3.2, vy: 0, g: 0, ground: true });
        }
      }
      b.x = clamp(b.x, left + 40, right - 40);
      b.throwing = b.t % 110 > 96;
      if (b.t % 110 === 0) {
        const dx = pcx - b.x;
        b.orbs.push({ kind: "ink", x: b.x + 30, y: b.y - 100, vx: clamp(dx / 55, -5, 5), vy: -6, g: 0.22 });
      }
      if (Math.abs(pcx - b.x) < 44 && pcy > b.y - 110 && pcy < b.y) this.hurt();
    } else if (b.type === "rumor") {
      b.x = b.cx + Math.sin(b.t / 85) * 280;
      b.y = 110 + Math.sin(b.t / 31) * 22;
      const rate = 104 - rage * 12;
      if (b.t % rate === 0) {
        const dir = pcx < b.x ? -1 : 1;
        b.orbs.push({ kind: "scroll", x: b.x + dir * 50, y: clamp(pcy, 200, 420), vx: dir * (3 + rage * 0.3), vy: 0, g: 0, ttl: 400 });
      }
      if (b.hp <= 3 && b.t % 70 === 0) b.orbs.push({ kind: "pamphlet", x: rnd(left, right), y: -10, vx: rnd(-0.6, 0.6), vy: 1.4, g: 0, ttl: 500 });
    } else if (b.type === "spheres") {
      b.x = b.cx + Math.sin(b.t / 110) * 260;
      b.y = 150 + Math.sin(b.t / 43) * 22;
      const rate = 140 - rage * 22;
      if (b.t % rate === 0) {
        const n = 6 + rage * 2;
        for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2 + b.t / 50; b.orbs.push({ kind: "shard", x: b.x, y: b.y, vx: Math.cos(an) * 2.4, vy: Math.sin(an) * 2.4, g: 0, ttl: 300 }); }
        Sfx.play("tick");
      }
    } else if (b.type === "armada") {
      b.x = b.cx + Math.sin(b.t / 160) * 60;
      b.y = 14 * T + Math.sin(b.t / 30) * 3;
      const rate = 118 - rage * 14;
      if (b.t % rate === 0) {
        const sx = b.x - 80, sy = b.y - 46, tt = rnd(58, 78), tx = pcx + rnd(-50, 50);
        b.orbs.push({ kind: "ball", x: sx, y: sy, vx: (tx - sx) / tt, vy: (pcy - sy - 0.1 * tt * tt) / tt, g: 0.2 });
        b.smoke = 24; Sfx.play("stomp");
      }
      if (b.smoke) b.smoke--;
      // the storm: gusts push you about in the final phase
      if (b.hp <= 2) {
        b.wind = Math.sin(b.t / 70) * 1.5;
        if (!this.busy) { const sv = p.vx; p.vx = b.wind; this.moveX(p); p.vx = sv; }
      }
    }
    for (const o of b.orbs) {
      o.vy += o.g; o.x += o.vx; o.y += o.vy;
      if (o.kind === "pamphlet") o.x += Math.sin(b.t / 12 + o.y / 30) * 0.8;
      if (o.ttl !== undefined && --o.ttl <= 0) o.dead = true;
      const hitWall = o.ground ? (o.x < left - 30 || o.x > right + 30) : o.kind === "scroll" ? (o.x < left - 60 || o.x > right + 60) : (this.solid(this.tile(Math.floor(o.x / T), Math.floor(o.y / T))) || o.y > this.H * T);
      if (hitWall) { o.dead = true; burst(o.x, o.y, o.kind === "fog" ? "#7a5f9a" : o.kind === "scroll" || o.kind === "pamphlet" ? "#f4ead2" : "#1a1a2a", 8, 2); }
      else if (Math.hypot(o.x - pcx, o.y - pcy) < (o.kind === "wave" ? 26 : 24)) { o.dead = true; this.hurt(); }
    }
    b.orbs = b.orbs.filter(o => !o.dead);
    if (b.lantern < 0) {
      if (--b.cd <= 0) {
        let i; do { i = Math.floor(Math.random() * a.triggers.length); } while (i === b.last && a.triggers.length > 1);
        b.lantern = i;
      }
    } else {
      const [lx, ly] = a.triggers[b.lantern];
      if (Math.abs(pcx - lx * T) < 26 && Math.abs(pcy - (ly * T + 8)) < 40 && !this.busy) this.askLantern();
    }
  }
  async askLantern() {
    const b = this.boss, a = this.arena, li = b.lantern;
    b.last = li; b.lantern = -1; this.busy = true;
    const sourcePhase = b.type === "rumor" && b.hp <= 2, stormPhase = b.type === "armada" && b.hp <= 2;
    const togo = `${b.hp} strike${b.hp > 1 ? "s" : ""} to go`;
    // Boss battles may also draw the longer "sort" questions kept out of regular play.
    const ok = await askQ(sourcePhase
      ? { boss: true, skill: "source", title: "Check the Source", subtitle: `Rumors fly! Pick the reliable evidence to jam the mill · ${togo}`, minTier: 1, maxTier: 4 }
      : stormPhase ? { boss: true, cross: true, focus: this.focus, title: "The Storm", subtitle: `Connect ideas from your whole journey to scatter the fleet · ${togo}`, minTier: 2, maxTier: 4 }
      : { boss: true, focus: this.focus, title: a.title, subtitle: `${a.verb} · ${togo}`, minTier: Math.min(a.min, this.replay ? a.max : a.max - 1), maxTier: this.replay ? a.max : a.max - 1 });
    this.busy = false;
    if (ok !== false) {
      b.hp--; b.beam = { from: a.triggers[li], t: 40 }; b.flash = 24; G.shake = 14; Sfx.play("beam");
      if (b.type === "rumor" && b.hp === 2) toast("The Rumor Mill spins faster! Final phase: check your sources to jam it.", "streak");
      if (b.type === "armada" && b.hp === 2) toast("A storm blows in! Final phase: connect ideas from your WHOLE journey.", "streak");
      if (a.final && (b.hp === 3 || b.hp === 1)) {
        this.enemies.push(b.type === "rumor" || b.type === "armada"
          ? { kind: b.type === "rumor" ? "raven" : "gull", fly: true, x: b.x, y: b.y + 40, by: b.y + 120, w: 36, h: 24, vx: -1.8, x0: (a.cam + 3) * T, x1: (a.cam + 27) * T, alive: true, dead: 0, dive: 0, cool: 60, amp: 0 }
          : { kind: this.def.enemies.g, x: b.x - 18, y: b.y + 30, w: 36, h: 30, vx: -1.5, vy: 0, alive: true, dead: 0 });
        toast(b.type === "rumor" ? "The Rumor Mill releases a raven!" : b.type === "armada" ? "Gulls swirl out of the rigging!" : "The Fog spits out a Gloomling!");
      }
      if (b.hp <= 0) {
        b.dying = 1; b.orbs = [];
        award({ fog: "boss", golem: "golem", rumor: "boss2", spheres: "spheres", armada: "boss3" }[b.type]);
        Music.stop(true); Sfx.play("win");
      }
      b.cd = 80;
    } else {
      b.cd = 140;
      toast(a.miss);
    }
  }
  // A mini-boss is beaten: open the far wall and carry on.
  arenaCleared() {
    const a = this.arena;
    a.done = true;
    for (let y = 0; y <= 13; y++) this.grid[y][a.wall] = ".";
    this.respawn = { x: (a.wall + 1) * T, y: 13 * T + T - 42 };
    this.boss = null; this.arena = null;
    Music.play(this.def.music); G.shake = 10; Sfx.play("door");
    toast("The way forward is open!", "buff");
  }

  async win() {
    this.won = true;
    const racing = typeof Race !== "undefined" && Race.running;
    if (racing) Race.onLevelWin();
    if (this.def.comics && !this.replay && !racing) await showComic(this.def.comics.outro, `${this.def.label || "Level " + this.def.num} complete`);
    const q = this.quick, d = this.deep;
    const total = q.n + d.n, right = q.right + d.right;
    const acc = total ? right / total : 1;
    const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    const id = this.def.id, prev = SAVE.levels[id] || {};
    const finale = id === "L3" && !prev.done && !racing;      // finishing London completes the game
    SAVE.levels[id] = { done: true, stars: Math.max(stars, prev.stars || 0), bestAcc: Math.max(acc, prev.bestAcc || 0) };
    if (stars === 3) award("stars3");
    SAVE.xp += 50; writeSave(); Sync.push();
    const avg = q.ms.length ? (q.ms.reduce((a, b) => a + b, 0) / q.ms.length / 1000).toFixed(1) + "s" : "—";
    const shown = [...this.focus, ...CODEX_ORDER.filter(c => !this.focus.includes(c) && this.byConcept[c])];
    const weak = shown.filter(c => this.byConcept[c] && this.byConcept[c].wrong > 0)
      .sort((a, b) => this.byConcept[b].wrong - this.byConcept[a].wrong).slice(0, 3);
    const rows = shown.map(c => {
      const bc = this.byConcept[c] || { right: 0, wrong: 0 };
      return `<tr><td>${esc(CONCEPTS[c].name)}${this.focus.includes(c) ? "" : ` <span class="tiny">(review)</span>`}</td>
        <td><div class="meter"><span style="width:${Math.round(Learn.mastery(c) * 100)}%"></span></div></td>
        <td class="num">${fluencyCell(c)}</td>
        <td class="num">${bc.right}<span class="tiny"> ✓</span> ${bc.wrong ? `<span class="miss">${bc.wrong} ✗</span>` : ""}</td></tr>`;
    }).join("");
    openPanel(`<div class="eyebrow">${this.def.label || "Level " + this.def.num} complete · ${esc(this.def.title)}</div>
      <h2 class="center">${esc(this.def.win.title)}</h2>
      <div class="stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}<span>${"★".repeat(3 - stars)}</span></div>
      <div class="stats">
        <div><b>${q.right}/${q.n}</b><span>Quick recall · avg ${avg}</span></div>
        <div><b>${q.fast}</b><span>Lightning answers ⚡ (&lt;3s)</span></div>
        <div><b>${d.right}/${d.n}</b><span>Deep questions</span></div>
        <div><b>${this.florinsEarned}</b><span>Florins earned</span></div>
      </div>
      <h3>Your analytics</h3>
      <div class="tablewrap"><table class="mtable"><thead><tr><th>Concept</th><th>Mastery</th><th class="num">Recall speed</th><th class="num">This level</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="focus">${weak.length ? `<b>Focus next:</b> ${weak.map(c => esc(CONCEPTS[c].name)).join(", ")}. These will come back first in the Hall of Memory.` : "<b>No weak spots this time.</b> Come back after a break to keep them fresh."}</p>
      <p class="small">Memory is strongest when you return after a break. ${this.def.win.next}</p>
      <div class="row"><button class="btn primary" id="rgo">${finale ? "Celebrate! ✦" : `Return to the ${this.def.kind === "voyage" ? "sea chart" : "map"}`}</button></div>`, "wide");
    onPanelClick("#rgo", () => { closePanel(); if (finale) runFinale(); else toMap(); });
  }

  // ------------------------------------------------------------ drawing
  draw() {
    const cam = this.cam, t = G.t;
    const ctile = (cam + VW / 2) / T;
    const zones = this.zones, last = zones.length - 1;
    let zi = zones.findIndex(z => ctile <= z.x1 + 0.99); if (zi < 0) zi = last;
    const z = zones[zi], nzi = Math.min(last, zi + 1);
    const f = clamp((ctile - (z.x1 - 8)) / 16, 0, 1);
    Art.sky(cam, zones, zi, nzi, f, t);
    // background layers cross-fade between neighboring zones
    const names = [...z.bg, ...zones[nzi].bg.filter(n => !z.bg.includes(n))];
    for (const n of names) {
      const a = (z.bg.includes(n) ? 1 - f : 0) + (zones[nzi].bg.includes(n) ? f : 0);
      if (a > 0.01) Art.layer(n, cam, 0, 0, Math.min(1, a));
    }
    if (z.dark || (this.boss && this.def.id === "L1")) { ctx.fillStyle = "rgba(36,18,56,0.4)"; ctx.fillRect(0, 0, VW, VH); }
    const sx = G.shake ? rnd(-G.shake, G.shake) / 2 : 0, sy = G.shake ? rnd(-G.shake, G.shake) / 2 : 0;
    ctx.save();
    ctx.translate(-Math.round(cam) + sx, sy);
    const t0 = Math.max(0, Math.floor(cam / T) - 1), t1 = Math.min(this.W - 1, t0 + VW / T + 2);
    for (const [a, b] of this.water) {
      if (b < t0 || a > t1) continue;
      Art.water(a * T, (b + 1) * T, 14.4 * T, t, this.def.water);
      if (!G.modal) for (const bt of this.boats) { bt.x += bt.dir * 0.5; if (bt.x < a * T + 20 || bt.x > (b + 1) * T - 80) bt.dir *= -1; }
    }
    if (this.def.bridge && t1 > 136 && t0 < 166) Art.bridge();
    for (const [a, b] of this.water) if (!(b < t0 || a > t1)) for (const bt of this.boats) Art.boat(bt, 14.4 * T, t);
    for (const d of this.decor) if (d.tx >= t0 - 3 && d.tx <= t1 + 1) Art.decor(d, t);
    for (let ty = 0; ty < this.H; ty++) for (let tx = t0; tx <= t1; tx++) {
      const ch = this.grid[ty][tx];
      if (ch !== "." && ch !== "W") this.drawTile(ch, tx, ty);
    }
    for (const d of this.doors) if (d.x >= t0 - 1 && d.x <= t1 + 1) Art.door(d, this.def.arms);
    if (this.orrery && t1 > this.orrery.x0 - 12 && t0 < this.orrery.x1 + 12) Art.orrery(this.orrery, this.plats, t);
    for (const m of this.plats) Art.plat(m, t);
    if (this.gallery && t1 > this.gallery.x - 3 && t0 < this.gallery.wall + 2) for (let i = 0; i < 4; i++) {
      const Gl = this.gallery;
      Art.portrait((Gl.x + i * 4) * T - 10, GALLERY_Y, Gl.order[i], Gl.lit[i], !Gl.done && Gl.cool === 0, t);
    }
    for (const st of this.stations) Art.pressStation(st.x, 14 * T, !st.done, t);
    for (const s of this.signs) {
      const npc = this.def.npcs && this.def.npcs[s.id];
      if (npc) Art.npc(npc.kind, s.x + 16, s.y + T, t, this.p.x + 15 < s.x + 16 ? -1 : 1); else Art.sign(s.x, s.y, s.id);
    }
    for (const k of this.checks) Art.checkpoint(k, t, this.def.flag);
    for (const s of this.springs) Art.spring(s);
    for (const k of this.spikes) Art.spikes(k);
    for (const fm of this.machines) if (!this.p.fly) Art.machine(fm.x + 16, fm.y + 20, false, false, t);
    for (const s of this.sets) this.drawSet(s);
    for (const c of this.coins) if (!c.taken) Art.coin(c.x, c.y, t);
    for (const c of this.codex) if (!c.taken) Art.codexPage(c.x, c.y, t);
    for (const m of this.manus) if (!m.taken || m.wasFound) Art.manuscript(m.x, m.y, t, m.taken);
    const pcx = this.p.x + 15;
    for (const e of this.enemies) if (e.alive && !e.frozen && e.x > this.cam - 80 && e.x < this.cam + VW + 80) Art.danger(e, t);
    for (const e of this.enemies) ({ bird: () => Art.pigeon(e, t), raven: () => Art.raven(e, t), blot: () => Art.blot(e, t, pcx), gloom: () => Art.gloom(e, t, pcx), rat: () => Art.rat(e, t), gull: () => Art.gull(e, t) })[e.kind]();
    for (const it of this.items) Art.prize(it, t);
    for (const e of this.enemies) if (e.alive && e.frozen) Art.frozen(e, t);
    if (this.boss) this.drawBoss();
    if (typeof Race !== "undefined" && Race.running) Race.drawGhosts(this);
    this.drawPlayer();
    drawParticles();
    if (this.activeSign) this.drawBubble(this.activeSign);
    else if (this.hint) this.drawHint(this.hint);
    ctx.restore();
    this.drawAmbient(zi);
    this.drawStorm();
    Art.post();
    this.drawHUD();
  }

  drawTile(ch, tx, ty) {
    const x = tx * T, y = ty * T;
    if (ch === "#") {
      const set = this.zones[this.zoneOf(tx)].tiles, top = !this.solid(this.tile(tx, ty - 1));
      let key = set + (top ? "Top" : "Body");
      if (set === "z2" && !top && ty === 15 && tx % 4 === 1) key = "z2Win";
      Art.tile(key, tx, ty, x, y);
    } else if (ch === ">" || ch === "<") Art.conveyor(x, y, ch === ">" ? 1 : -1, G.t);
    else if (ch === "G") Art.ghostBlock(x, y, G.t);
    else if (ch === "X") Art.tile("cracked", tx, ty, x, y);
    else if (ch === "B") Art.tile("palaceDoor", tx, ty, x, y);
    else if (ch === "H") Art.starBridge(x, y, G.t, hasAbility("lens"));
    else if (ch === "%") {
      const c = this.crumbles.find(c => c.tx === tx && c.ty === ty);
      Art.tile(this.def.crumble, tx, ty, x + (c && c.t ? rnd(-1.5, 1.5) : 0), y);
    } else if (ch === "=") Art.tile("brick", tx, ty, x, y);
    else if (ch === "-") Art.tile("plank", tx, ty, x, y);
    else if (ch === "D") { if (ty <= 10) Art.tile("tower", tx, ty, x, y); }
    else if (ch === "?" || ch === "u") {
      const b = this.bumps.find(b => b.tx === tx && b.ty === ty);
      const yy = y - (b ? Math.sin(b.t / 10 * Math.PI) * 8 : 0);
      Art.tile(ch === "?" ? "qblock" : "used", tx, ty, x, yy);
      if (ch === "?") {
        const sh = (G.t * 1.6 + tx * 20) % 140;
        if (sh < 34) {
          ctx.save(); rr(x + 1, yy + 1, 30, 30, 4); ctx.clip();
          ctx.fillStyle = "rgba(255,255,230,0.5)"; ctx.beginPath(); ctx.moveTo(x + sh - 8, yy + 32); ctx.lineTo(x + sh, yy); ctx.lineTo(x + sh + 6, yy); ctx.lineTo(x + sh - 2, yy + 32); ctx.fill();
          ctx.restore();
        }
      }
    }
  }
  drawSet(s) {
    if (s.state === "done") return;
    if (s.type !== "rings") {
      for (let i = 0; i < (s.n || 3); i++) {
        let state = "idle";
        if (s.state === "result") state = s.labels[i] === s.item.answer ? "right" : s.result.slot === i ? "wrong" : "dim";
        Art.wordBlock((s.x + i * (s.gap || 4)) * T, 10 * T, 3 * T, s.state === "idle" ? "· · ·" : s.labels[i], state);
      }
    } else {
      if (s.state === "idle") return;
      RING_ROWS.forEach((r, i) => {
        let col = "gold";
        if (s.state === "result") col = s.labels[i] === s.item.answer ? "#2f7a64" : s.result.slot === i ? "#b23a2e" : "rgba(160,140,110,0.6)";
        Art.ring(s.x * T + 16, r * T, s.labels[i], col, G.t);
      });
    }
  }
  drawAmbient(zi) {
    // each zone has its own drifting particles: petals, motes, embers, leaves, paper, fireflies
    const [col, fall, shape] = this.zones[zi].amb;
    if (this.amb.length < 34 && G.t % 6 === 0) this.amb.push({ x: rnd(0, VW), y: fall > 0.2 ? -10 : fall > -0.4 ? rnd(40, VH - 60) : VH + 10, vx: rnd(-0.6, 0.6), vy: fall * rnd(0.6, 1.4) || rnd(-0.3, 0.3), life: 400, ph: rnd(0, 6) });
    for (const a of this.amb) {
      if (!G.modal) { a.x += a.vx + Math.sin(G.t / 30 + a.ph) * 0.4; a.y += a.vy; a.life--; }
      ctx.globalAlpha = Math.min(1, a.life / 60) * 0.8; ctx.fillStyle = col;
      if (shape === "petal" || shape === "leaf" || shape === "paper") {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(G.t / 20 + a.ph);
        if (shape === "paper") { ctx.fillRect(-3, -4, 6, 8); ctx.fillStyle = "rgba(60,40,25,0.6)"; ctx.fillRect(-2, -2, 4, 0.8); ctx.fillRect(-2, 0, 4, 0.8); }
        else { ctx.beginPath(); ctx.ellipse(0, 0, shape === "leaf" ? 4.5 : 3.4, shape === "leaf" ? 2.4 : 1.8, 0, 0, 7); ctx.fill(); }
        ctx.restore();
      } else if (shape === "rain") {
        ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x - 4, a.y - 14); ctx.stroke();
        if (!G.modal) { a.y += 6; a.x -= 1.5; }
      } else if (shape === "star") {
        ctx.globalAlpha *= 0.4 + 0.6 * Math.abs(Math.sin(G.t / 14 + a.ph));
        ctx.save(); ctx.translate(a.x, a.y); ctx.fillRect(-0.7, -4, 1.4, 8); ctx.fillRect(-4, -0.7, 8, 1.4); ctx.restore();
      } else if (shape === "firefly") {
        ctx.globalAlpha *= 0.5 + 0.5 * Math.sin(G.t / 8 + a.ph);
        ctx.fillStyle = "rgba(255,240,160,0.35)"; ctx.beginPath(); ctx.arc(a.x, a.y, 5, 0, 7); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(a.x, a.y, 1.8, 0, 7); ctx.fill();
      } else { ctx.beginPath(); ctx.arc(a.x, a.y, shape === "wisp" ? 3 : 1.8, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    this.amb = this.amb.filter(a => a.life > 0 && a.y > -20 && a.y < VH + 20);
  }
  drawBubble(s) {
    ctx.font = `600 16px ${FONT_B}`;
    const npc = this.def.npcs && this.def.npcs[s.id];
    const lines = wrapText(this.def.signs[s.id], 300);
    const w = 326, h = lines.length * 20 + 20 + (npc ? 22 : 0);
    const bx = clamp(s.x + 16 - w / 2, this.cam + 8, this.cam + VW - w - 8), by = s.y - h - (npc ? 60 : 40);
    ctx.fillStyle = "rgba(20,10,5,0.25)"; rr(bx + 3, by + 4, w, h, 10); ctx.fill();
    const g = ctx.createLinearGradient(0, by, 0, by + h); g.addColorStop(0, "#fdf6e3"); g.addColorStop(1, "#efdfb8");
    ctx.fillStyle = g; rr(bx, by, w, h, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s.x + 10, by + h); ctx.lineTo(s.x + 18, by + h + 12); ctx.lineTo(s.x + 24, by + h); ctx.fill();
    ctx.strokeStyle = "#6b4f2a"; ctx.lineWidth = 2; rr(bx, by, w, h, 10); ctx.stroke();
    ctx.strokeStyle = "rgba(201,162,39,0.6)"; ctx.lineWidth = 1; rr(bx + 4, by + 4, w - 8, h - 8, 7); ctx.stroke();
    ctx.fillStyle = INK; ctx.textAlign = "left"; ctx.textBaseline = "top";
    if (npc) { ctx.font = `15px ${FONT_D}`; ctx.fillStyle = "#7a2c20"; ctx.fillText(npc.name, bx + 14, by + 9); ctx.font = `600 16px ${FONT_B}`; ctx.fillStyle = INK; }
    lines.forEach((l, i) => ctx.fillText(l, bx + 14, by + 10 + (npc ? 22 : 0) + i * 20));
  }
  drawHint(h) {
    const owned = ABILITIES.filter(a => hasAbility(a.id)).length, auto = automaticCount();
    const text = `Something is hidden here. It needs ${h.ab.name} (${h.ab.short}). Unlock it by making ${h.ab.need} concepts ⚡ automatic: answer gold ? blocks correctly in under 3 seconds, 3 times each. You have ${auto} of ${h.ab.need}.`;
    ctx.font = `600 15px ${FONT_B}`;
    const lines = wrapText(text, 280), w = 304, hh = lines.length * 19 + 18;
    const bx = clamp(h.x - w / 2, this.cam + 8, this.cam + VW - w - 8), by = 120;
    ctx.fillStyle = "rgba(36,24,52,0.9)"; rr(bx, by, w, hh, 10); ctx.fill();
    ctx.strokeStyle = "#c9b2f0"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#f2e9ff"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, bx + 12, by + 9 + i * 19));
  }
  drawPlayer() {
    const p = this.p;
    if (p.onGround) Art.shadow(p.x + 15, p.y + p.h, 15);
    if (p.star > 0 && (p.star > 90 || Math.floor(p.star / 6) % 2)) Art.laurelGlow(p, G.t);
    if (p.inv > 0 && Math.floor(p.inv / 4) % 2) return;
    if (p.fly) Art.machine(p.x + 15, p.y + 2, true, p.flap > 0, G.t);
    if (p.gliding) Art.cloak(p.x + 15, p.y + 12, G.t);
    if (p.pound) { ctx.strokeStyle = "rgba(255,240,200,0.6)"; ctx.lineWidth = 2; for (const dx of [4, 15, 26]) { ctx.beginPath(); ctx.moveTo(p.x + dx, p.y - 24); ctx.lineTo(p.x + dx, p.y - 4); ctx.stroke(); } }
    Art.player(p, G.t);
  }
  drawBoss() {
    const b = this.boss, t = G.t, a = this.arena;
    a.triggers.forEach(([lx, ly], i) => Art[a.trig](lx * T, ly * T + 32, b.lantern === i, t));
    if (b.beam) {
      const [lx, ly] = b.beam.from, a = b.beam.t / 40, by = b.type === "golem" || b.type === "armada" ? b.y - 70 : b.y;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255,220,140,${a * 0.5})`; ctx.lineWidth = 26 * a + 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lx * T, ly * T - 30); ctx.lineTo(b.x, by); ctx.stroke();
      ctx.strokeStyle = `rgba(255,250,220,${a})`; ctx.lineWidth = 8 * a + 2;
      ctx.beginPath(); ctx.moveTo(lx * T, ly * T - 30); ctx.lineTo(b.x, by); ctx.stroke();
      ctx.restore();
    }
    for (const o of b.orbs) Art.proj(o, t);
    if (b.type === "golem") Art.golem(b, t); else if (b.type === "rumor") Art.rumor(b, t);
    else if (b.type === "spheres") Art.spheres(b, t); else if (b.type === "armada") Art.galleon(b, t); else Art.boss(b, t);
  }

  // Gusts and rain in the Armada's storm.
  drawStorm() {
    const b = this.boss;
    if (!b || b.type !== "armada" || b.hp > 2 || b.dying) return;
    ctx.fillStyle = "rgba(20,26,40,0.28)"; ctx.fillRect(0, 0, VW, VH);
    ctx.strokeStyle = "rgba(210,225,240,0.45)"; ctx.lineWidth = 1.2;
    for (let i = 0; i < 70; i++) {
      const x = ((i * 137 + G.t * (9 + b.wind * 3)) % (VW + 100)) - 50, y = (i * 89 + G.t * 14) % VH;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6 + b.wind * 6, y + 16); ctx.stroke();
    }
    if (G.t % 400 < 4) { ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(0, 0, VW, VH); }
  }

  drawHUD() {
    const p = this.p;
    ctx.textBaseline = "middle";
    const panel = (x, y, w, h) => {
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "rgba(58,40,28,0.9)"); g.addColorStop(1, "rgba(36,24,16,0.9)");
      ctx.fillStyle = g; rr(x, y, w, h, 10); ctx.fill();
      ctx.strokeStyle = "rgba(201,162,39,0.75)"; ctx.lineWidth = 1.5; rr(x + 2.5, y + 2.5, w - 5, h - 5, 8); ctx.stroke();
    };
    panel(10, 10, 300, 46);
    for (let i = 0; i < p.maxHearts; i++) {
      heart(32 + i * 26, 21, 22, i < p.hearts ? "#e0574a" : "rgba(255,255,255,0.18)");
      if (i < p.hearts) { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(28 + i * 26, 27, 2.2, 0, 7); ctx.fill(); }
    }
    Art.coin(140, 33, 0);
    ctx.fillStyle = "#fff6d8"; ctx.font = `bold 20px ${FONT_B}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(SAVE.florins, 158, 34);
    ctx.fillStyle = SAVE.streak >= 3 ? "#ffb347" : "#d8cbb0"; ctx.font = `bold 16px ${FONT_B}`; ctx.fillText(`Streak ${SAVE.streak}`, 222, 34);

    const r = rankInfo();
    panel(VW - 250, 10, 240, 46);
    ctx.fillStyle = "#fff6d8"; ctx.font = `17px ${FONT_D}`; ctx.textAlign = "left"; ctx.fillText(r.name, VW - 236, 26);
    ctx.font = `600 13px ${FONT_B}`; ctx.fillStyle = "#d8cbb0"; ctx.fillText(`${SAVE.xp} XP · Codex ${this.focus.filter(c => Learn.isIntroduced(c)).length}/${this.focus.length}`, VW - 236, 44);
    if (r.next) {
      const pct = (SAVE.xp - r.base) / (r.next - r.base);
      ctx.fillStyle = "rgba(255,255,255,0.15)"; rr(VW - 102, 22, 80, 6, 3); ctx.fill();
      ctx.fillStyle = "#ffd75e"; rr(VW - 102, 22, Math.max(6, 80 * pct), 6, 3); ctx.fill();
    }
    const nextAb = ABILITIES.find(a => !hasAbility(a.id));
    if (nextAb) {
      const have = automaticCount();
      panel(VW - 250, 60, 240, 34);
      ctx.fillStyle = "#d9c79c"; ctx.font = `600 12px ${FONT_B}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`Next power: ${nextAb.name}`, VW - 236, 72);
      ctx.fillStyle = "#fff6d8"; ctx.font = `bold 12px ${FONT_B}`; ctx.fillText(`⚡ ${have}/${nextAb.need}`, VW - 236, 86);
      ctx.fillStyle = "rgba(255,255,255,0.15)"; rr(VW - 190, 82, 166, 6, 3); ctx.fill();
      ctx.fillStyle = "#ffd75e"; rr(VW - 190, 82, Math.max(6, 166 * Math.min(1, have / nextAb.need)), 6, 3); ctx.fill();
    }
    if (this.boss && !this.boss.dying) {
      const b = this.boss;
      ctx.fillStyle = "rgba(20,10,30,0.85)"; rr(VW / 2 - 160, 64, 320, 36, 8); ctx.fill();
      ctx.strokeStyle = "rgba(160,120,220,0.7)"; ctx.lineWidth = 1.5; rr(VW / 2 - 157, 67, 314, 30, 6); ctx.stroke();
      ctx.fillStyle = "#e9dcff"; ctx.font = `15px ${FONT_D}`; ctx.textAlign = "center"; ctx.fillText({ fog: "The Fog of Forgetting", golem: "The Ink Golem", rumor: "The Rumor Mill", spheres: "The Crystal Spheres", armada: "The Spanish Armada" }[b.type], VW / 2, 78);
      for (let i = 0; i < b.maxHp; i++) { ctx.fillStyle = i < b.hp ? "#9b6bd6" : "rgba(255,255,255,0.15)"; rr(VW / 2 - 100 + i * 41, 87, 36, 6, 3); ctx.fill(); }
    }
    if (this.clue) {
      const c = this.clue;
      ctx.font = `800 24px ${FONT_B}`;
      const w = Math.max(380, ctx.measureText(c.text).width + 70);
      const g = ctx.createLinearGradient(0, 64, 0, 136); g.addColorStop(0, "#fdf6e3"); g.addColorStop(1, "#efdfb8");
      ctx.fillStyle = "rgba(20,10,5,0.25)"; rr(VW / 2 - w / 2 + 3, 68, w, 72, 10); ctx.fill();
      ctx.fillStyle = g; rr(VW / 2 - w / 2, 64, w, 72, 10); ctx.fill();
      ctx.strokeStyle = c.ok === undefined ? "#c9a227" : c.ok ? "#2f7a64" : "#b23a2e"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#6b4f2a"; ctx.font = `800 12px ${FONT_B}`; ctx.textAlign = "center";
      ctx.fillText("CLUE", VW / 2, 79);
      ctx.fillStyle = INK; ctx.font = `800 24px ${FONT_B}`; ctx.fillText(c.text, VW / 2, 102);
      ctx.fillStyle = c.ok === undefined ? "#6b4f2a" : c.ok ? "#2f7a64" : "#b23a2e"; ctx.font = `700 14px ${FONT_B}`;
      ctx.fillText(c.how, VW / 2, 124);
    }
    if (this.banner) {
      const a = Math.min(1, this.banner.t / 40, (200 - this.banner.t) / 30);
      ctx.save(); ctx.globalAlpha = a;
      panel(VW / 2 - 230, 150, 460, 80);
      ctx.fillStyle = "#d9c79c"; ctx.font = `600 14px ${FONT_B}`; ctx.textAlign = "center";
      ctx.fillText(this.banner.sub.toUpperCase(), VW / 2, 172);
      ctx.fillStyle = "#fff6d8"; ctx.font = `32px ${FONT_D}`; ctx.fillText(this.banner.text, VW / 2, 204);
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,246,216,0.8)"; ctx.font = `600 13px ${FONT_B}`; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
    ctx.fillText("Esc pause · C codex · M music", VW - 14, VH - 12);
  }
}

function drawParticles() {
  for (const p of G.parts) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.font = `bold 18px ${FONT_B}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const f of G.floats) {
    ctx.globalAlpha = Math.min(1, f.life / 20);
    ctx.fillStyle = "rgba(43,29,20,0.7)"; ctx.fillText(f.text, f.x + 1, f.y + 1);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}
function updateParticles() {
  for (const p of G.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--; }
  G.parts = G.parts.filter(p => p.life > 0);
  for (const f of G.floats) { f.y -= 0.8; f.life--; }
  G.floats = G.floats.filter(f => f.life > 0);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - 0.6);
}

// =====================================================================
//  OVERWORLD MAP — stylized Italy with fog of forgetting
// =====================================================================
// The chart runs from the Mediterranean to the Baltic, and west to England; the view scrolls.
const MAP_H = 940, MAP_OX = 290;
const proj = (lon, lat) => [200 + MAP_OX + (lon - 6.5) * 38, 18 + (55.5 - lat) * 48];
const ALPS = [[7.2, 45.7], [8.0, 46.2], [8.9, 46.3], [9.8, 46.35], [10.8, 46.6], [11.8, 46.7], [12.8, 46.45]].map(p => proj(...p));
const APENNINES = [[8.8, 44.5], [9.9, 44.35], [10.9, 44.15], [12.0, 43.6], [12.9, 42.9], [13.6, 42.2], [14.4, 41.6], [15.3, 40.9], [15.9, 40.3], [16.2, 39.4]].map(p => proj(...p));
const RIVERS = [
  [[11.6, 43.82], [11.25, 43.77], [10.9, 43.72], [10.3, 43.68]],                                   // Arno
  [[7.7, 45.0], [9.0, 45.15], [10.5, 45.05], [11.6, 44.95], [12.3, 44.95]],                         // Po
  [[12.5, 42.9], [12.4, 42.3], [12.25, 41.75]],                                                     // Tiber
  [[9.2, 47.65], [8.6, 47.6], [7.6, 47.6], [7.6, 48.6], [8.2, 49.3], [8.36, 49.63], [8.27, 50.0], [7.6, 50.35], [7.2, 50.7], [6.9, 51.1], [6.2, 51.85], [5.4, 51.9], [4.2, 51.95]], // Rhine
  [[14.3, 50.8], [13.7, 51.05], [12.65, 51.87], [11.6, 52.1], [10.8, 53.1], [10.0, 53.55], [8.7, 53.9]], // Elbe
  [[9.0, 48.1], [10.9, 48.7], [12.1, 49.0], [13.5, 48.6], [16.4, 48.2]]                              // Danube
].map(r => r.map(p => proj(...p)));
const MAP_TOWNS = [["Mainz", 8.27, 50.0, -1], ["Worms", 8.36, 49.63, 1], ["Wartburg", 10.3, 50.97, -1], ["Augsburg", 10.9, 48.37, 1]];

const NODES = {
  pisa: { x: 348, y: 586, name: "Port of Pisa", type: "start" },
  florence: { x: 394, y: 570, name: "Florence", type: "level", level: "L1" },
  siena: { x: 408, y: 620, name: "Siena", type: "review" },
  milan: { x: 302, y: 500, name: "Milan", type: "locked" },
  venice: { x: 422, y: 501, name: "Venice", type: "locked" },
  rome: { x: 430, y: 674, name: "Rome", type: "locked" },
  brenner: { x: 386, y: 410, name: "Brenner Pass", type: "pass" },
  wittenberg: { x: 434, y: 192, name: "Wittenberg", type: "level", level: "L2" },
  antwerp: { x: 124, y: 224, name: "Antwerp", type: "pass", after: "L2" },
  london: { x: -46, y: 210, name: "London", type: "level", level: "L3" }
};
for (const k in NODES) NODES[k].x += MAP_OX;
// After London: sail south around Spain to Portugal and Phase II.
{ const [bx, by] = proj(-2.8, 40.0); NODES.iberia = { x: bx, y: by, name: "The Iberian Peninsula", type: "sail" }; }
// The next unit (Phase II, the Age of Exploration) stays a teaser until the teacher opens it.
const UNIT2 = { open: false };
const unit2Open = () => UNIT2.open;
const levelDone = id => !!(SAVE.levels[id] && SAVE.levels[id].done);
const l1Done = () => levelDone("L1");
const l2Done = () => levelDone("L2");
// A level (or the pass leading to it) opens once the level before it is done.
const LEVEL_PREV = { L1: null, L2: "L1", L3: "L2", L4: "L3" };
const levelOpen = id => !LEVEL_PREV[id] || levelDone(LEVEL_PREV[id]);
const nodeOpen = n => n.type === "level" ? levelOpen(n.level) : n.type === "pass" ? levelDone(n.after || "L1") : n.type === "sail" ? levelDone("L3") : n.type === "review" ? l1Done() : n.type === "start";
const EDGES = [["pisa", "florence", () => true], ["florence", "siena", l1Done], ["florence", "milan", () => false], ["florence", "venice", () => false],
  ["siena", "rome", () => false], ["florence", "brenner", l1Done], ["brenner", "wittenberg", l1Done],
  ["wittenberg", "antwerp", l2Done], ["antwerp", "london", l2Done], ["london", "iberia", () => levelDone("L3")]];
const ROMAN = ["", "I", "II", "III", "IV"];

const MapS = {
  cur: "pisa", from: null, to: null, t: 0, camY: null, fog: { pisa: 0, florence: 0, siena: 0, brenner: 0, wittenberg: 0, antwerp: 0, london: 0, iberia: 0 }, fogTex: null, fogC: null,
  init() {
    if (SAVE.mapNode === "biscay") SAVE.mapNode = "iberia";
    if (SAVE.mapNode && NODES[SAVE.mapNode]) this.cur = SAVE.mapNode;
    if (!this.fogTex && MAPBASE) this.buildFog();
  },
  buildFog() {
    const [c, x] = Art.mk(VW + 120, MAP_H), r = mulberry(3);
    x.fillStyle = "#d9d3c4"; x.fillRect(0, 0, VW + 120, MAP_H);
    for (let i = 0; i < 480; i++) {
      const px = r() * (VW + 120), py = r() * MAP_H, rad = 20 + r() * 70, tone = 190 + Math.floor(r() * 50);
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(${tone},${tone - 6},${tone - 18},0.55)`); g.addColorStop(1, `rgba(${tone},${tone - 6},${tone - 18},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, 7); x.fill();
    }
    this.fogTex = c;
    this.fogC = Art.mk(VW, MAP_H)[0];
  },
  fogTargets() {
    const m1 = Learn.totalMastery(LEVEL_CODEX.L1), m2 = Learn.totalMastery(LEVEL_CODEX.L2), m3 = Learn.totalMastery(LEVEL_CODEX.L3), d1 = l1Done(), d2 = l2Done(), d3 = levelDone("L3");
    const found = id => LEVEL_CODEX[id].filter(c => Learn.isIntroduced(c)).length;
    return {
      pisa: 85,
      florence: 80 + 150 * m1 + (d1 ? 40 : 0) + found("L1") * 4,
      siena: d1 ? 60 + 70 * m1 + 10 * Math.min(SAVE.reviews, 6) : 0,
      brenner: d1 ? 75 : 0,
      wittenberg: d1 ? 95 + 170 * m2 + (d2 ? 50 : 0) + found("L2") * 4 : 0,
      antwerp: d2 ? 80 : 0,
      london: d2 ? 95 + 170 * m3 + (d3 ? 50 : 0) + found("L3") * 4 : 0,
      iberia: d3 ? 150 : 0
    };
  },
  neighbors(n) { return EDGES.filter(e => e[0] === n || e[1] === n).map(e => ({ n: e[0] === n ? e[1] : e[0], open: e[2]() })); },
  go(n) { this.from = this.cur; this.to = n; this.t = 0; Sfx.play("step"); },
  update() {
    const tg = this.fogTargets();
    for (const k in tg) this.fog[k] += (tg[k] - this.fog[k]) * 0.03;
    if (this.to) {
      const a = NODES[this.from], b = NODES[this.to];
      this.t += 2.6 / Math.hypot(b.x - a.x, b.y - a.y);
      if (this.t >= 1) { this.cur = this.to; this.to = null; SAVE.mapNode = this.cur; writeSave(); updateMapBar(); }
      return;
    }
    let dir = null;
    if (keys.left) dir = [-1, 0]; else if (keys.right) dir = [1, 0]; else if (keys.up) dir = [0, -1]; else if (keys.down) dir = [0, 1];
    if (dir) {
      const here = NODES[this.cur]; let best = null, bd = 0.35;
      for (const nb of this.neighbors(this.cur)) {
        if (!nb.open) continue;
        const o = NODES[nb.n], dx = o.x - here.x, dy = o.y - here.y, len = Math.hypot(dx, dy);
        const dot = (dx * dir[0] + dy * dir[1]) / len;
        if (dot > bd) { bd = dot; best = nb.n; }
      }
      if (best) this.go(best);
    }
    if (pressed.enter || pressed.jump) activateNode(this.cur);
  },
  playerPos() {
    if (!this.to) return NODES[this.cur];
    const a = NODES[this.from], b = NODES[this.to];
    return { x: a.x + (b.x - a.x) * this.t, y: a.y + (b.y - a.y) * this.t };
  },
  draw() {
    const pp0 = this.focus || this.playerPos(), target = clamp(pp0.y - VH * 0.48, 0, MAP_H - VH + 70);
    this.camY = this.camY === null ? target : this.camY + (target - this.camY) * 0.08;
    ctx.save(); ctx.translate(0, -Math.round(this.camY));
    Art.put(MAPBASE, 0, 0);
    const t = G.t;
    // ships under sail and a sea serpent, as on old charts
    [[710, 766, 46, 18, 0.004], [542, 694, 24, 30, 0.005], [830, 616, 14, 8, 0.006], [440, 72, 40, 12, 0.003], [120, 290, 50, 14, 0.004], [60, 520, 30, 40, 0.003]].forEach(([cx, cy, rx, ry, sp], i) => {
      const a = t * sp + i * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, dir = -Math.sin(a) >= 0 ? 1 : -1;
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.rotate(Math.sin(t / 30 + i) * 0.05);
      ctx.strokeStyle = "rgba(43,29,20,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-18, 6); ctx.lineTo(-26, 6); ctx.moveTo(-16, 8); ctx.lineTo(-22, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(14, 0); ctx.lineTo(9, 7); ctx.lineTo(-10, 7); ctx.closePath();
      ctx.fillStyle = "#7d5128"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#3b2a1a"; ctx.fillRect(-0.8, -22, 1.6, 22);
      ctx.beginPath(); ctx.moveTo(1, -20); ctx.quadraticCurveTo(12, -12, 1, -3); ctx.closePath(); ctx.fillStyle = "#f4ead2"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1, -17); ctx.quadraticCurveTo(-9, -10, -1, -3); ctx.closePath(); ctx.fill(); ctx.stroke();
      lily(ctx, 6, -10, 0.45, "#b23a2e");
      ctx.fillStyle = "#b23a2e"; ctx.beginPath(); ctx.moveTo(1, -24); ctx.lineTo(9, -22.5); ctx.lineTo(1, -21); ctx.fill();
      ctx.restore();
    });
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const hx = 440 + i * 22, hy = 872 + Math.sin(t / 25 + i) * 2;
      ctx.strokeStyle = INK; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.arc(hx, hy, 9, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = "#4f8a6a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(hx, hy, 9, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = "#c9a227"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, 9, Math.PI * 1.3, Math.PI * 1.7); ctx.stroke();
    }
    const sy = 866 + Math.sin(t / 25 + 3) * 2, sx0 = 290;
    ctx.beginPath(); ctx.moveTo(sx0 + 214, sy + 4); ctx.quadraticCurveTo(sx0 + 218, sy - 9, sx0 + 232, sy - 4); ctx.lineTo(sx0 + 229, sy + 3); ctx.quadraticCurveTo(sx0 + 222, sy + 2, sx0 + 214, sy + 4);
    ctx.fillStyle = "#4f8a6a"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#e9d27a"; ctx.beginPath(); ctx.arc(sx0 + 224, sy - 3, 1.6, 0, 7); ctx.fill();
    ctx.fillStyle = "#b23a2e"; ctx.beginPath(); ctx.moveTo(sx0 + 231, sy - 1); ctx.lineTo(sx0 + 238, sy - 2); ctx.lineTo(sx0 + 236, sy + 1); ctx.fill();
    ctx.lineCap = "butt";
    // roads
    for (const [a, b, open] of EDGES) {
      const A = NODES[a], B = NODES[b], o = open();
      ctx.setLineDash(o ? [7, 6] : [3, 8]);
      if (o) { ctx.strokeStyle = "rgba(251,244,224,0.8)"; ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); }
      ctx.strokeStyle = o ? "#7a2c20" : "rgba(91,58,30,0.4)"; ctx.lineWidth = o ? 3.5 : 2;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const k in NODES) this.drawNode(k, false);
    // fog of forgetting
    const fx = this.fogC.getContext("2d");
    fx.setTransform(Art.res, 0, 0, Art.res, 0, 0);
    fx.globalCompositeOperation = "source-over"; fx.clearRect(0, 0, VW, MAP_H);
    fx.drawImage(this.fogTex, -60 + Math.sin(t / 400) * 60, 0, this.fogTex.lw, this.fogTex.lh);
    fx.globalCompositeOperation = "destination-out";
    for (const k in this.fog) {
      const r = this.fog[k]; if (r < 2) continue;
      const n = NODES[k], g = fx.createRadialGradient(n.x, n.y, r * 0.45, n.x, n.y, r);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
      fx.fillStyle = g; fx.beginPath(); fx.arc(n.x, n.y, r, 0, 7); fx.fill();
    }
    // once the game is complete the Fog of Forgetting lifts from the whole map
    this.fogFade = levelDone("L3") ? Math.max(0, (this.fogFade ?? 1) - 0.008) : 1;
    if (this.fogFade > 0) { ctx.globalAlpha = this.fogFade; ctx.drawImage(this.fogC, 0, 0, VW, MAP_H); ctx.globalAlpha = 1; }
    for (const k of ["milan", "venice", "rome", ...(l1Done() ? [] : ["brenner", "wittenberg"]), ...(l2Done() ? [] : ["antwerp", "london"]), ...(levelDone("L3") ? [] : ["iberia"])]) {
      const n = NODES[k];
      ctx.fillStyle = "rgba(91,58,30,0.38)"; ctx.font = `bold 22px ${FONT_D}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("?", n.x, n.y + Math.sin(t / 30 + n.x) * 2);
    }
    if (!l1Done()) { const n = NODES.siena; ctx.fillStyle = "rgba(91,58,30,0.38)"; ctx.fillText("?", n.x, n.y); }
    for (const k in this.fog) if (this.fog[k] > 30) this.drawNode(k, true);
    // the Herald of Forgetting lurks at the edge of what you've uncovered
    const hpos = !l1Done() ? [760, 470] : !l2Done() ? [790, 120] : !levelDone("L3") ? [150, 300] : null;
    if (hpos) Art.herald(hpos[0], hpos[1], t, -1, 0.55);
    if (levelDone("L3")) Art.iberiaSignal(NODES.iberia, t, unit2Open());
    // the apprentice
    const pp = this.playerPos(), moving = !!this.to;
    ctx.save(); ctx.translate(pp.x, pp.y + 2); ctx.scale(0.8, 0.8);
    Art.shadow(0, 0, 14);
    const dir = moving ? Math.sign(NODES[this.to].x - NODES[this.from].x) || 1 : 1;
    Art.player({ x: -15, y: -42, face: dir, onGround: true, vx: moving ? 3 : 0, anim: t * 0.3, fly: false, squash: 0 }, t);
    ctx.restore();
    ctx.restore();
    // cartouche
    const cx = VW - 155;
    ctx.fillStyle = "rgba(20,10,5,0.25)"; rr(cx - 132, 20, 270, 72, 8); ctx.fill();
    const g = ctx.createLinearGradient(0, 16, 0, 86); g.addColorStop(0, "#fdf6e3"); g.addColorStop(1, "#ead7a8");
    ctx.fillStyle = g; rr(cx - 135, 16, 270, 70, 8); ctx.fill();
    ctx.strokeStyle = "#6b4f2a"; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "#c9a227"; ctx.lineWidth = 1; rr(cx - 130, 21, 260, 60, 5); ctx.stroke();
    for (const s of [-1, 1]) { ctx.fillStyle = "#c9a227"; ctx.beginPath(); ctx.arc(cx + s * 135, 51, 6, 0, 7); ctx.fill(); ctx.strokeStyle = "#6b4f2a"; ctx.stroke(); }
    ctx.fillStyle = INK; ctx.font = `28px ${FONT_D}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(levelDone("L3") ? "Europa · Complete!" : l2Done() ? "Europa · 1480–1588" : l1Done() ? "Europa · 1480–1521" : "Italia · 1480", cx, 50);
    ctx.font = `600 13px ${FONT_B}`; ctx.fillStyle = "#6b4f2a";
    const learned = CODEX_ORDER.filter(c => Learn.isIntroduced(c));
    ctx.fillText(levelDone("L3") ? `The fog is lifted · ${learned.length} Codex pages · ${SAVE.florins} florins` : `Fog cleared ${Math.round(Learn.totalMastery(learned.length ? learned : undefined) * 100)}% · ${SAVE.florins} florins`, cx, 72);
    // frame
    ctx.strokeStyle = "#4a3420"; ctx.lineWidth = 8; ctx.strokeRect(4, 4, VW - 8, VH - 8);
    ctx.strokeStyle = "#c9a227"; ctx.lineWidth = 1.5; ctx.strokeRect(12, 12, VW - 24, VH - 24);
    ctx.strokeStyle = "rgba(201,162,39,0.5)"; ctx.lineWidth = 0.8; ctx.strokeRect(15, 15, VW - 30, VH - 30);
    for (const [px, py] of [[12, 12], [VW - 12, 12], [12, VH - 12], [VW - 12, VH - 12]]) {
      ctx.fillStyle = "#c9a227"; ctx.beginPath(); ctx.moveTo(px, py - 8); ctx.lineTo(px + 8, py); ctx.lineTo(px, py + 8); ctx.lineTo(px - 8, py); ctx.fill();
      ctx.fillStyle = "#b23a2e"; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 7); ctx.fill();
    }
    Art.post();
  },
  drawNode(k, labelOnly) {
    const n = NODES[k], here = this.cur === k && !this.to;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (labelOnly) { this.drawLabel(n, here); return; }
    cityIcon(k, n.x, n.y);
    if (n.type === "level") {
      if (!levelOpen(n.level)) return;
      const st = SAVE.levels[n.level] ? SAVE.levels[n.level].stars : 0;
      ctx.fillStyle = "#2b1d14"; ctx.beginPath(); ctx.arc(n.x, n.y, 13, 0, 7); ctx.fill();
      ctx.fillStyle = st ? "#d9a728" : "#b23a2e"; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff6d8"; ctx.font = `bold 12px ${FONT_D}`; ctx.fillText(ROMAN[LEVELS[n.level].num], n.x, n.y + 1);
      ctx.font = `13px ${FONT_B}`;
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < st ? "#ffd75e" : "rgba(43,29,20,0.35)"; ctx.fillText("★", n.x - 14 + i * 14, n.y - 22); }
      if (MANUSCRIPTS.filter(m => m.level === n.level).every(m => SAVE.manuscripts[m.id])) {
        ctx.fillStyle = "#b23a2e"; ctx.beginPath(); ctx.arc(n.x + 14, n.y + 12, 8, 0, 7); ctx.fill(); ctx.strokeStyle = "#d9a728"; ctx.lineWidth = 2; ctx.stroke();
        lily(ctx, n.x + 14, n.y + 13, 0.55, "#f6d77a");
      }
    } else if (n.type === "review") {
      if (!l1Done()) return;
      ctx.fillStyle = "#2b1d14"; ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, 7); ctx.fill();
      ctx.fillStyle = "#24508f"; ctx.beginPath(); ctx.arc(n.x, n.y, 9, 0, 7); ctx.fill();
      const due = Learn.dueForReview();
      if (due) { ctx.fillStyle = "#b23a2e"; ctx.beginPath(); ctx.arc(n.x + 11, n.y - 10, 8, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `bold 11px ${FONT_B}`; ctx.fillText(Math.min(99, due), n.x + 11, n.y - 9); }
    } else if (n.type === "start" || ((n.type === "pass" || n.type === "sail") && nodeOpen(n))) {
      ctx.fillStyle = "#2b1d14"; ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, 7); ctx.fill();
      ctx.fillStyle = "#e1cf9b"; ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, 7); ctx.fill();
    }
  },
  drawLabel(n, here) {
    if (n.type !== "start" && n.type !== "locked" && !nodeOpen(n)) return;
    ctx.font = `${here ? "bold " : ""}15px ${FONT_D}`; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(251,244,224,0.85)";
    const w = ctx.measureText(n.name).width + 12;
    const lx = n.type === "start" ? n.x - w / 2 - 14 : n.x + 18, ly = n.y + (n.type === "level" ? 2 : 0);
    rr(n.type === "start" ? lx - w / 2 : lx, ly - 10, w, 20, 5); ctx.fill();
    ctx.fillStyle = "#2b1d14"; ctx.textAlign = "left";
    ctx.fillText(n.name, (n.type === "start" ? lx - w / 2 : lx) + 6, ly + 1);
  }
};

// Tiny landmark drawn beside each city.
function cityIcon(k, x, y) {
  if (NODES[k].type !== "start" && NODES[k].type !== "locked" && !nodeOpen(NODES[k])) return;
  const [ox, oy] = k === "pisa" ? [4, 32] : [-30, -6];
  ctx.save(); ctx.translate(x + ox, y + oy);
  ctx.fillStyle = "#6b4f2a"; ctx.strokeStyle = "#6b4f2a"; ctx.lineWidth = 1.5;
  if (k === "florence") { ctx.fillStyle = "#b5532f"; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.bezierCurveTo(-8, -14, 8, -14, 9, 0); ctx.fill(); ctx.fillStyle = "#efe1bc"; ctx.fillRect(-1.5, -14, 3, 4); ctx.fillStyle = "#c9b48a"; ctx.fillRect(-11, 0, 22, 5); }
  else if (k === "pisa") { ctx.save(); ctx.rotate(0.18); ctx.fillStyle = "#efe1bc"; ctx.fillRect(-4, -20, 8, 22); ctx.fillStyle = "#b8a77f"; for (let i = 0; i < 5; i++) ctx.fillRect(-4, -18 + i * 4, 8, 1); ctx.restore(); }
  else if (k === "siena") { ctx.fillStyle = "#a4462a"; ctx.fillRect(-2.5, -24, 5, 26); ctx.fillStyle = "#efe1bc"; ctx.fillRect(-4, -27, 8, 4); ctx.fillStyle = "#b5532f"; ctx.fillRect(-10, -4, 20, 6); }
  else if (k === "milan") { ctx.fillStyle = "#e6dcc6"; ctx.fillRect(-10, -8, 20, 10); for (let i = 0; i < 5; i++) ctx.fillRect(-10 + i * 4.5, -16 + (i === 2 ? -4 : 0), 1.8, 9); }
  else if (k === "venice") { ctx.fillStyle = "#a4462a"; ctx.fillRect(-3, -20, 6, 22); ctx.beginPath(); ctx.moveTo(-4, -20); ctx.lineTo(0, -27); ctx.lineTo(4, -20); ctx.fill(); ctx.strokeStyle = "#2b1d14"; ctx.beginPath(); ctx.moveTo(-12, 4); ctx.quadraticCurveTo(0, 8, 12, 2); ctx.stroke(); }
  else if (k === "wittenberg") { ctx.fillStyle = "#a9846a"; ctx.fillRect(-12, -10, 24, 12); for (const ox of [-12, 6]) { ctx.fillStyle = "#b08c70"; ctx.fillRect(ox, -22, 6, 24); ctx.fillStyle = "#4f5d58"; ctx.beginPath(); ctx.moveTo(ox - 1, -22); ctx.lineTo(ox + 3, -30); ctx.lineTo(ox + 7, -22); ctx.fill(); } }
  else if (k === "brenner") { ctx.fillStyle = "#8a7a62"; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-6, -14); ctx.lineTo(0, -4); ctx.lineTo(6, -16); ctx.lineTo(14, 2); ctx.fill(); ctx.fillStyle = "#f6f2e8"; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-6, -14); ctx.lineTo(-4, -10); ctx.moveTo(4, -12); ctx.lineTo(6, -16); ctx.lineTo(8, -12); ctx.fill(); }
  else if (k === "london") { ctx.fillStyle = "#cfc3a6"; ctx.fillRect(-10, -14, 20, 16); for (const ox of [-12, 8]) { ctx.fillRect(ox, -20, 4, 22); ctx.fillStyle = "#6b4f2a"; ctx.beginPath(); ctx.moveTo(ox - 1, -20); ctx.lineTo(ox + 2, -25); ctx.lineTo(ox + 5, -20); ctx.fill(); ctx.fillStyle = "#cfc3a6"; } ctx.fillStyle = "#4a3a30"; ctx.fillRect(-3, -6, 6, 8); }
  else if (k === "antwerp") { ctx.fillStyle = "#b8a88a"; ctx.fillRect(-10, -6, 20, 8); ctx.fillRect(-3, -24, 6, 20); ctx.beginPath(); ctx.moveTo(-3, -24); ctx.lineTo(0, -32); ctx.lineTo(3, -24); ctx.fill(); }
  else if (k === "iberia") { ctx.translate(0, 2); ctx.fillStyle = "#7d5128"; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(8, 6); ctx.lineTo(-9, 6); ctx.fill(); ctx.fillRect(-0.8, -20, 1.6, 20); ctx.fillStyle = "#f4ead2"; ctx.beginPath(); ctx.moveTo(1, -19); ctx.lineTo(11, -4); ctx.lineTo(1, -3); ctx.fill(); ctx.beginPath(); ctx.moveTo(-1, -15); ctx.lineTo(-9, -3); ctx.lineTo(-1, -3); ctx.fill(); ctx.fillStyle = "#b23a2e"; ctx.fillRect(2, -13, 4, 1.4); ctx.fillRect(3.3, -15, 1.4, 5); }
  else if (k === "rome") { ctx.fillStyle = "#cdb88c"; ctx.beginPath(); ctx.ellipse(0, -4, 12, 8, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-12, -4, 24, 6); ctx.fillStyle = "#6b4f2a"; for (let i = 0; i < 5; i++) ctx.fillRect(-10 + i * 4.5, -6, 2, 4); }
  ctx.restore();
}

// The static chart: watercolor sea, rhumb lines, inked coasts, hills, rivers, names.
let MAPBASE = null;
function buildMapBase() {
  const H = MAP_H, [c, x] = Art.mk(VW, H), r = mulberry(17);
  x.fillStyle = lgr(x, 0, 0, 0, H, [[0, "#86a9aa"], [1, "#5f8a96"]]); x.fillRect(0, 0, VW, H);
  blobs(x, r, 0, 0, VW, H, 90, "rgba(165,195,185,0.35)", 30, 100);
  blobs(x, r, 0, 0, VW, H, 55, "rgba(70,110,125,0.22)", 30, 90);
  // rhumb lines radiating from two wind roses (a portolan chart)
  const lineCols = ["rgba(43,29,20,0.32)", "rgba(40,110,80,0.38)", "rgba(178,58,46,0.38)"];
  for (const [rx, ry] of [[410, 824], [930, 800], [330, 100]]) for (let k = 0; k < 32; k++) {
    const a = k * Math.PI / 16;
    x.strokeStyle = lineCols[k % 4 === 0 ? 0 : k % 2 === 0 ? 1 : 2]; x.lineWidth = k % 4 === 0 ? 0.9 : 0.6;
    x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + Math.cos(a) * 1300, ry + Math.sin(a) * 1300); x.stroke();
  }
  const shape = pts => { x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.closePath(); };
  const land = (pts, base) => {
    shape(pts);
    for (const [w, a] of [[18, 0.07], [12, 0.1], [7, 0.14], [3, 0.2]]) { x.strokeStyle = `rgba(30,60,80,${a})`; x.lineWidth = w; x.stroke(); }
    x.fillStyle = base; x.fill();
    x.save(); x.clip();
    blobs(x, r, 0, 0, VW, H, 90, "rgba(255,245,215,0.3)", 10, 40);
    blobs(x, r, 0, 0, VW, H, 60, "rgba(150,120,70,0.16)", 10, 40);
    speck(x, r, 0, 0, VW, H, 1500, ["rgba(110,80,40,0.18)", "rgba(255,250,230,0.3)"]);
    x.restore();
    shape(pts); x.strokeStyle = INK; x.lineWidth = 1.6; x.stroke();
  };
  const P = poly => poly.map(p => proj(...p));
  for (const poly of OTHER_LAND) land(P(poly), "#c4b893");
  for (const k in COUNTRIES) for (const poly of COUNTRIES[k].polys) land(P(poly), k === "it" || k === "de" ? "#ecdcae" : "#d6c8a0");
  // the borders of the Holy Roman Empire were not modern borders; a dashed line hints at the Alps divide
  x.setLineDash([4, 4]); x.strokeStyle = "rgba(91,58,30,0.45)"; x.lineWidth = 1.2;
  x.beginPath(); P([[6.1, 46.4], [7.0, 45.9], [8.4, 46.45], [9.3, 46.5], [10.5, 46.9], [12.2, 47.1], [13.7, 46.5]]).forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke();
  x.setLineDash([]);
  // rivers
  for (const rv of RIVERS) {
    x.beginPath(); rv.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py));
    x.strokeStyle = INK; x.lineWidth = 3; x.stroke(); x.strokeStyle = "#5b8fb0"; x.lineWidth = 1.8; x.stroke();
  }
  // hills and mountains: shaded, inked, snow on the Alps
  const hill = (hx, hy, s, snow) => {
    x.beginPath(); x.moveTo(hx - s, hy + s * 0.5); x.quadraticCurveTo(hx - s * 0.3, hy - s * 0.9, hx, hy - s * 0.85); x.quadraticCurveTo(hx + s * 0.4, hy - s * 0.7, hx + s, hy + s * 0.5); x.closePath();
    x.fillStyle = lgr(x, hx - s, 0, hx + s, 0, [[0, "#c9b07a"], [0.5, "#a88d5a"], [1, "#7d6640"]]); x.fill();
    if (snow) { x.save(); x.clip(); x.fillStyle = "#f6f2e8"; x.fillRect(hx - s, hy - s, s * 2, s * 0.6); x.restore(); }
    x.strokeStyle = INK; x.lineWidth = 1; x.stroke();
    x.strokeStyle = "rgba(43,29,20,0.4)"; x.lineWidth = 0.7;
    for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(hx + s * 0.15 + k * s * 0.22, hy - s * 0.5 + k * s * 0.2); x.lineTo(hx + s * 0.05 + k * s * 0.22, hy + s * 0.3); x.stroke(); }
  };
  ALPS.forEach(([hx, hy], i) => { hill(hx - 6, hy + 10, 11, true); hill(hx + 6, hy + 6, 13, true); });
  APENNINES.forEach(([hx, hy]) => { hill(hx - 4, hy + 2, 8, false); hill(hx + 5, hy - 1, 7, false); });
  // names
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "rgba(30,50,60,0.6)"; x.font = `italic 19px ${FONT_D}`;
  x.fillText("Mare Tyrrhenum", 720, 729); x.fillText("Mare Adriaticum", 855, 599); x.fillText("Mare Mediterraneum", 600, 905);
  x.fillText("Mare Germanicum", 414, 64); x.fillText("Mare Balticum", 880, 40); x.fillText("Oceanus Atlanticus", 96, 520);
  x.font = `italic 14px ${FONT_D}`; x.fillText("Mare Britannicum", ...proj(-2.2, 49.75));
  x.fillStyle = "rgba(91,58,30,0.55)"; x.font = `italic 15px ${FONT_D}`;
  [["Toscana", 10.8, 43.0], ["Lombardia", 9.5, 45.7], ["Veneto", 12.0, 45.9], ["Lazio", 13.3, 41.6], ["Regno di Napoli", 15.4, 41.0]].forEach(([n, lo, la]) => { const [px, py] = proj(lo, la); x.fillText(n, px, py); });
  x.fillStyle = "rgba(60,45,30,0.5)"; x.font = `20px ${FONT_D}`; x.fillText("Francia", ...proj(3.2, 47.4)); x.fillText("Helvetia", ...proj(8.1, 46.75));
  x.fillText("Anglia", ...proj(-1.6, 52.6)); x.fillText("Hispania", ...proj(-3.8, 40.2)); x.fillText("Flandria", ...proj(3.6, 50.75));
  x.font = `italic 22px ${FONT_D}`; x.fillStyle = "rgba(91,58,30,0.5)"; x.fillText("Sacrum Romanum Imperium", ...proj(10.4, 50.4));
  x.font = `italic 15px ${FONT_D}`; x.fillText("Saxonia", ...proj(13.4, 51.2));
  // towns of the Reformation story
  for (const [name, lo, la, side] of MAP_TOWNS) {
    const [px, py] = proj(lo, la);
    x.fillStyle = INK; x.beginPath(); x.arc(px, py, 3.4, 0, 7); x.fill(); x.fillStyle = "#b23a2e"; x.beginPath(); x.arc(px, py, 2, 0, 7); x.fill();
    x.fillStyle = "rgba(43,29,20,0.8)"; x.font = `13px ${FONT_D}`; x.textAlign = side < 0 ? "right" : "left"; x.fillText(name, px + side * 7, py);
  }
  x.textAlign = "center";
  // wind roses
  const rose = (rx, ry, R) => {
    x.save(); x.translate(rx, ry);
    x.fillStyle = "rgba(251,244,224,0.85)"; x.beginPath(); x.arc(0, 0, R * 0.42, 0, 7); x.fill();
    x.strokeStyle = INK; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, R * 0.42, 0, 7); x.stroke(); x.beginPath(); x.arc(0, 0, R * 0.36, 0, 7); x.stroke();
    for (let k = 0; k < 16; k++) {
      const a = k * Math.PI / 8 - Math.PI / 2, len = k % 4 === 0 ? R : k % 2 === 0 ? R * 0.7 : R * 0.48, w = k % 4 === 0 ? R * 0.12 : R * 0.08;
      const col = k % 4 === 0 ? (k === 0 ? "#b23a2e" : "#24508f") : k % 2 === 0 ? "#c9a227" : "#2f7a64";
      for (const side of [-1, 1]) {
        x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * len, Math.sin(a) * len); x.lineTo(Math.cos(a + side * Math.PI / 2) * w, Math.sin(a + side * Math.PI / 2) * w); x.closePath();
        x.fillStyle = side > 0 ? col : shade(col.length === 7 ? col : "#24508f", -0.35); x.fill(); x.strokeStyle = INK; x.lineWidth = 0.6; x.stroke();
      }
    }
    x.fillStyle = "#c9a227"; x.beginPath(); x.arc(0, 0, R * 0.07, 0, 7); x.fill(); x.stroke();
    lily(x, 0, -R - 8, R * 0.09, "#b23a2e");
    x.restore();
  };
  rose(410, 824, 52); rose(930, 800, 26); rose(330, 100, 26);
  return c;
}

function activateNode(k) {
  const n = NODES[k];
  if (n.type === "level") startLevel(n.level);
  else if (n.type === "pass" && k === "antwerp") toast("Antwerp, a great trading port. Printed English Bibles were smuggled from here into England. Keep heading west (←).");
  else if (n.type === "pass") toast("The road over the Alps. Renaissance ideas and printed books traveled this way. Keep heading north (↑).");
  else if (n.type === "review") runReview();
  else if (n.type === "sail") { if (unit2Open()) toChart(); else showIberiaClue(); }
  else if (n.type === "start") toast("Walk east (→) to Florence, where the Renaissance began.");
}

function updateMapBar() {
  const bar = document.getElementById("mapbar");
  if (G.scene === "chart") { updateChartBar(bar); return; }
  const k = MapS.cur, n = NODES[k];
  let title = n.name, desc = "", action = "";
  if (k === "pisa") desc = l1Done() ? "Where your journey began. Florence is to the east." : "Your journey begins at the mouth of the Arno. Walk east to Florence.";
  if (n.type === "level") {
    const L = LEVELS[n.level], st = SAVE.levels[n.level] ? SAVE.levels[n.level].stars : 0;
    title = `${n.name} · Level ${L.num}: ${L.title}`;
    desc = st ? `Best: ${"★".repeat(st)}${"☆".repeat(3 - st)}. Replays ask harder gate questions.`
      : n.level === "L1" ? `Patrons, painters, and big ideas. Discover ${LEVEL_CODEX.L1.length} Codex pages and break the Fog.`
      : n.level === "L2" ? `Indulgences, protest, and the printing press. Discover ${LEVEL_CODEX.L2.length} Codex pages and jam the Rumor Mill.`
      : `Tudor monarchs, the Spanish Armada, and a revolution in science. Discover ${LEVEL_CODEX.L3.length} Codex pages and scatter the Armada.`;
    action = `<button class="btn primary" id="mbgo">${st ? "Replay" : "Play"} ▶</button>`;
    const found = MANUSCRIPTS.filter(m => m.level === n.level && SAVE.manuscripts[m.id]).length;
    if (st) desc += ` Lost Manuscripts: ${found} of 3${found === 3 ? " (gold seal!)" : ""}.`;
  }
  if (k === "brenner") { title = "The Brenner Pass"; desc = "The road north over the Alps, toward Germany. Head up (↑) to Wittenberg."; }
  if (k === "iberia") {
    if (unit2Open()) { title = "Phase II · The Age of Exploration"; desc = "Sail south to Lisbon, Portugal, where a new age of ocean voyages begins."; action = `<button class="btn primary" id="mbgo">Sail to Portugal ▶</button>`; }
    else { title = "The Iberian Peninsula · Coming next unit"; desc = "Something important will set sail from here…"; action = `<button class="btn primary" id="mbgo">Read the clue ✦</button><button class="btn" id="mbwins">My strengths</button>`; }
  }
  if (k === "antwerp") { title = "Antwerp"; desc = "A busy port where printers and merchants met. Head west (←) across the sea to London."; }
  if (k === "siena") {
    const due = Learn.dueForReview();
    title = "Siena · Hall of Memory";
    desc = `Spaced review. Recall works best after a break. ${due} memor${due === 1 ? "y is" : "ies are"} ready now.`;
    action = `<button class="btn primary" id="mbgo">Review ▶</button>`;
  }
  bar.innerHTML = `<div class="mbtext"><b>${esc(title)}</b><span>${esc(desc)}</span></div>
    <div class="mbbtns">${action}${typeof Race !== "undefined" && Race.ready ? `<button class="btn" id="mbrace">${Race.active ? "Race ●" : Sync.teacher ? "Host race" : "Join race"}</button>` : ""}${Sync.teacher ? `<button class="btn" id="mbteach">Class</button>` : ""}<button class="btn" id="mbmenu">Menu</button></div>`;
  const go = document.getElementById("mbgo"); if (go) go.onclick = () => activateNode(k);
  const wb = document.getElementById("mbwins"); if (wb) wb.onclick = () => showStrengths(false);
  document.getElementById("mbmenu").onclick = showPause;
  const tb = document.getElementById("mbteach"); if (tb) tb.onclick = () => showTeacher();
  const rb = document.getElementById("mbrace"); if (rb) rb.onclick = () => Race.openMenu();
}

// =====================================================================
//  THE FINALE: finishing London completes the game
// =====================================================================
// Fireworks, two banners (what you know well / what needs more work), then the map
// opens and a beacon on the Iberian Peninsula hints at the next unit.
const GAME_CODEX = () => [...LEVEL_CODEX.L1, ...LEVEL_CODEX.L2, ...LEVEL_CODEX.L3].filter(c => Learn.isIntroduced(c));
function strengthLists() {
  const all = GAME_CODEX().map(c => ({ c, m: Learn.mastery(c), auto: Learn.isAutomatic(c), miss: (SAVE.flash[c] ? SAVE.flash[c].wrong : 0) }));
  const strong = all.filter(x => x.auto || x.m >= 0.55).sort((a, b) => b.m - a.m);
  const weak = all.filter(x => !strong.includes(x)).sort((a, b) => a.m - b.m);
  return { strong, weak };
}
function bannerHTML() {
  const { strong, weak } = strengthLists();
  const chip = x => `<li><span>${esc(CONCEPTS[x.c].name)}${x.auto ? " ⚡" : ""}</span><i style="--m:${Math.round(x.m * 100)}%"></i></li>`;
  return `<div class="banners">
    <div class="banner good"><div class="bhead">✦ You know these well ✦</div><ul>${strong.map(chip).join("") || "<li class='none'>Keep playing: your strengths will show up here.</li>"}</ul></div>
    <div class="banner work"><div class="bhead">Keep practicing these</div><ul>${weak.map(chip).join("") || "<li class='none'>Nothing! Every idea is strong. Bravissimo!</li>"}</ul>
      ${weak.length ? `<p class="bnote">The Hall of Memory in Siena will bring these back first.</p>` : ""}</div>
  </div>`;
}
function showStrengths(fromFinale) {
  return new Promise(res => {
    openPanel(`<div class="eyebrow">${fromFinale ? "The Age of Rebirth · Complete" : "Your strengths"}</div>
      <h2 class="center">${fromFinale ? "What you’ve mastered" : "Where you stand"}</h2>${bannerHTML()}
      <div class="row"><button class="btn primary" id="sgo">${fromFinale ? "Open the map ▶" : "Back to the map"}</button></div>`, "wide xwide");
    onPanelClick("#sgo", () => { closePanel(); res(); });
  });
}
async function runFinale() {
  G.modal = true;
  Music.play("map"); Sfx.play("win"); award("complete");
  const learned = GAME_CODEX().length, ms = MANUSCRIPTS.filter(m => m.level !== "L4" && SAVE.manuscripts[m.id]).length;
  await new Promise(res => {
    openPanel(`<canvas class="fireworks" aria-hidden="true"></canvas>
      <div class="finale">
        <div class="eyebrow">Florence · Wittenberg · London</div>
        <h1>The Age of Rebirth</h1>
        <p class="lede">${SAVE.name ? esc(SAVE.name) + ", you" : "You"} have cleared the Fog of Forgetting from all of Europe!</p>
        <div class="stats"><div><b>${learned}</b><span>Codex pages</span></div><div><b>${CODEX_ORDER.filter(c => Learn.isAutomatic(c)).length}</b><span>Automatic ⚡</span></div><div><b>${ms}</b><span>Lost Manuscripts</span></div><div><b>${SAVE.florins}</b><span>Florins</span></div></div>
        <div class="row"><button class="btn primary" id="fgo">See what you’ve learned ▶</button></div>
      </div>`, "wide xwide finalepanel");
    fireworks(panelEl.querySelector(".fireworks"));
    onPanelClick("#fgo", () => { closePanel(); res(); });
  });
  await showStrengths(true);
  // the map opens: the fog lifts and the camera glides to a beacon on the Iberian Peninsula
  SAVE.mapNode = "london"; writeSave();
  toMap();
  G.modal = true;
  MapS.focus = { x: NODES.iberia.x, y: NODES.iberia.y };
  await new Promise(r => setTimeout(r, 2600));
  MapS.focus = null;
  G.modal = false;
  showIberiaClue(true);
}
function showIberiaClue(first) {
  G.modal = true; clearKeys(); Sfx.play("page");
  openPanel(`<div class="eyebrow">${first ? "A clue at the edge of the map" : "The Iberian Peninsula"}</div>
    <h2 class="center">Something important will come from here…</h2>
    <div class="clue">
      <p>On the far western edge of Europe, a small kingdom looks out over an endless ocean. Its shipbuilders are making small, fast ships with triangular sails. Its sailors are learning to read the sun and stars.</p>
      <p>Merchants dream of spices and gold. Kings dream of glory. No one knows what lies at the end of the ocean…</p>
      <p class="tease">✦ Watch the Iberian Peninsula. Our next unit begins here. ✦</p>
    </div>
    ${first ? `<p class="center small">You’ve completed <b>The Age of Rebirth</b>. Keep your memories strong in the Hall of Memory, and replay any level to beat your stars.</p>` : ""}
    <div class="row"><button class="btn primary" id="igo">${first ? "The End ✦" : "Back to the map"}</button></div>`, "wide");
  onPanelClick("#igo", () => { closePanel(); MapS.cur = "iberia"; SAVE.mapNode = "iberia"; writeSave(); updateMapBar(); });
}
function fireworks(cnv) {
  if (!cnv) return;
  const x = cnv.getContext("2d"), parts = [];
  const fit = () => { cnv.width = cnv.clientWidth; cnv.height = cnv.clientHeight; };
  fit();
  const cols = ["#ffd75e", "#e0574a", "#8fcf7a", "#7ab8e0", "#f4c8d0", "#fff6d8"];
  let n = 0;
  const tick = () => {
    if (!cnv.isConnected) return;
    if (n++ % 28 === 0) {
      const cx = cnv.width * (0.15 + Math.random() * 0.7), cy = cnv.height * (0.15 + Math.random() * 0.35), col = cols[Math.floor(Math.random() * cols.length)];
      for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, v = 1.5 + Math.random() * 2.5; parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 70 + Math.random() * 30, col }); }
      if (n < 200) Sfx.play("stomp");
    }
    x.globalCompositeOperation = "destination-out"; x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(0, 0, cnv.width, cnv.height);
    x.globalCompositeOperation = "lighter";
    for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.985; p.life--; x.fillStyle = p.col; x.globalAlpha = Math.max(0, p.life / 90); x.beginPath(); x.arc(p.x, p.y, 2.2, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
    requestAnimationFrame(tick);
  };
  tick();
}

// Hall of Memory: mostly quick recall, with a deep question every third turn.
async function runReview() {
  if (Learn.introducedCount() === 0) { toast("Play Florence first to fill your Codex."); return; }
  const N = 9; let right = 0;
  for (let i = 0; i < N; i++) {
    let ok;
    if (i % 3 === 2) {
      const q = Learn.pick({ review: true, minTier: 1, maxTier: 4 });
      if (!q) continue;
      G.modal = true;
      ok = await Quiz.ask(q, { title: "Hall of Memory", subtitle: `Recall ${i + 1} of ${N}` });
      afterAnswer(q, ok, Learn.record(q, ok));
    } else {
      const item = Learn.pickFlash();
      G.modal = true;
      const r = await Quiz.flash(item, { title: `Hall of Memory · ${i + 1} of ${N}` });
      ok = r.ok; afterQuick(item, r.ok, r.ms);
    }
    G.modal = false;
    if (ok) right++;
  }
  SAVE.reviews++; SAVE.florins += right * 3; writeSave();
  award("memory");
  openPanel(`<div class="eyebrow">Hall of Memory</div><h2 class="center">${right} of ${N} recalled</h2>
    <p class="center">+${right * 3} florins. The fog around Siena thins.</p>
    <p class="small center">Come back after a break (an hour, a day, a few days). Memories you almost forgot get the strongest boost when you retrieve them.</p>
    <div class="row"><button class="btn primary" id="hgo">Back to the map</button></div>`, "narrow");
  onPanelClick("#hgo", () => { closePanel(); updateMapBar(); });
}

// =====================================================================
//  SCENES
// =====================================================================
function setScene(s) {
  G.scene = s;
  document.getElementById("mapbar").hidden = s !== "map" && s !== "chart";
  document.getElementById("touch").hidden = !(s === "level" && matchMedia("(pointer: coarse)").matches);
}
function startLevel(id = "L1", opts = {}) {
  const def = LEVELS[id];
  Art.keepLayers(def.zones.flatMap(z => z.bg));
  G.level = def.kind === "voyage" ? new Voyage(def) : new Level(def); G.parts = []; G.floats = [];
  setScene("level"); Music.play(def.music);
  SAVE.seen = SAVE.seen || {};
  if (opts.race) toast(`Race! Score points with correct answers. Lightning answers earn more.`, "streak");
  else if (def.comics && !SAVE.seen[id]) { SAVE.seen[id] = true; writeSave(); showComic(def.comics.intro, `${def.label || "Level " + def.num} · ${def.title}`); }
  else if (G.level.replay) toast("Replay: gate questions start one tier harder.");
}
function toMap() {
  if (SAVE.sheet === "atlantic" && unit2Open()) { toChart(); return; }
  SAVE.sheet = "europe";
  G.level = null; G.parts = []; G.floats = [];
  MapS.init(); setScene("map"); updateMapBar(); Music.play("map");
}

function showTitle() {
  setScene("title");
  const cont = hasSave() && (SAVE.turn > 0 || SAVE.fturn > 0 || SAVE.name);
  openPanel(`<div class="title">
      <div class="eyebrow">Florence · Anno Domini 1480</div>
      <h1>The Age of Rebirth</h1>
      <p class="lede">A Fog of Forgetting has rolled across Italy. Only knowledge can clear it. You are a young apprentice in Florence. Discover the ideas of the Renaissance, remember them, and drive back the fog.</p>
      <label class="field" for="pname">Your name<input id="pname" maxlength="24" autocomplete="off" value="${esc(SAVE.name || "")}" placeholder="e.g. Giulia"></label>
      <div class="row"><button class="btn primary" id="tgo">${cont ? "Continue journey" : "Begin"}</button></div>
      <p class="tiny center">Arrow keys or WASD to move · Space to jump · Esc to pause · M for music</p>
    </div>`, "titlecard");
  const go = () => {
    SAVE.name = panelEl.querySelector("#pname").value.trim(); writeSave();
    closePanel(); Sfx.play("page"); toMap();
  };
  onPanelClick("#tgo", go);
  panelEl.querySelector("#pname").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}

// ---------------------------------------------------------------- canvas click (map)
cv.addEventListener("click", e => {
  if (G.scene !== "map" || G.modal || MapS.to) return;
  const r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) * VW / r.width, y = (e.clientY - r.top) * VH / r.height + (MapS.camY || 0);
  for (const k in NODES) {
    const n = NODES[k];
    if (Math.hypot(n.x - x, n.y - y) > 22) continue;
    if (k === MapS.cur) activateNode(k);
    else if (MapS.neighbors(MapS.cur).some(nb => nb.n === k && nb.open)) MapS.go(k);
  }
});

// ---------------------------------------------------------------- touch controls
document.querySelectorAll("#touch [data-k]").forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); if (!keys[k]) pressed[k] = true; keys[k] = true; };
  const off = e => { e.preventDefault(); keys[k] = false; };
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off);
  b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
});

// ---------------------------------------------------------------- main loop
function step() {
  G.t++;
  if (!G.modal && pendingAbilities.length && (G.scene === "level" || G.scene === "map" || G.scene === "chart")) showAbilityUnlock(pendingAbilities.shift());
  if (!G.modal) {
    if (pressed.music) { Music.toggle(); toast(SAVE.music ? "Music on" : "Music off"); }
    if (pressed.pause && (G.scene === "level" || G.scene === "map" || G.scene === "chart")) showPause();
    else if (pressed.codex && (G.scene === "level" || G.scene === "map" || G.scene === "chart")) showCodexBook();
    else if (G.scene === "level" && G.level && !G.level.won) G.level.update();
    else if (G.scene === "level" && G.level && G.level.boss) G.level.updateBoss();
    else if (G.scene === "map") MapS.update();
    else if (G.scene === "chart") Chart.update();
    updateParticles();
  } else {
    G.shake = 0;                       // nothing shakes behind a panel or question
  }
  if (G.modal && G.scene === "map") {
    const tg = MapS.fogTargets(); for (const k in tg) MapS.fog[k] += (tg[k] - MapS.fog[k]) * 0.03;
  }
  for (const k in pressed) delete pressed[k];
}
function render() {
  ctx.setTransform(Art.res, 0, 0, Art.res, 0, 0);
  if (G.scene === "level" && G.level) G.level.draw();
  else if (G.scene === "chart") { Chart.init(); Chart.draw(); }
  else { MapS.init(); MapS.draw(); }
}
let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
  const s0 = performance.now();
  render();
  const dt = performance.now() - s0;
  PERF.avg = PERF.avg * 0.95 + dt * 0.05;
  if (++PERF.n > 90 && PERF.avg > 14 && Art.res > 1) {
    PERF.cap = Math.max(1, Art.res - 0.5); PERF.n = 0; PERF.avg = 0; fitCanvas();
  }
  requestAnimationFrame(frame);
}

// Render at the screen's real pixel density so the art stays crisp, but
// step the resolution down on slower machines to keep the game smooth.
const PERF = { cap: 2, avg: 0, n: 0 };
function fitCanvas() {
  const rect = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const r = Math.round(clamp(rect.width * dpr / VW, 1, PERF.cap) * 4) / 4;
  if (r === Art.res && cv.width === Math.round(VW * r) && MAPBASE) return;
  Art.res = r; cv.width = Math.round(VW * r); cv.height = Math.round(VH * r);
  Art.build(); MAPBASE = buildMapBase(); Art.grainify(MAPBASE, MAPBASE.getContext("2d"), VW, VH, 1); MapS.buildFog();
}
addEventListener("resize", () => { clearTimeout(fitCanvas.timer); fitCanvas.timer = setTimeout(fitCanvas, 200); });

function boot() {
  loadSave();
  fitCanvas();
  Sync.init();
  MapS.init();
  showTitle();
  requestAnimationFrame(frame);
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
