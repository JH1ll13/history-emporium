// =====================================================================
//  LEARNING ENGINE
//  - Spacing: every question has a Leitner "box". Correct answers push it
//    further into the future; misses bring it back within ~3 questions.
//    Across sessions, real clock time decides what is "due" for review.
//  - Interleaving: the picker avoids repeating the last concept or the
//    last question format back-to-back.
//  - Ascending complexity: a concept unlocks tier N+1 only after a correct
//    answer at tier N. Zones of the level also raise the ceiling.
//  - Pre-training (cognitive load): a concept is never quizzed until its
//    Codex page has been read.
// =====================================================================

const SAVE_KEY = "ageOfRebirth.v1";
// Review intervals in minutes for the Hall of Memory (box 0..5).
const REVIEW_MINUTES = [1, 10, 60, 60 * 24, 60 * 24 * 3, 60 * 24 * 7];
// In-level spacing measured in questions answered (box 0..5).
const TURN_GAPS = [3, 4, 7, 12, 20, 35];
// Quick-recall spacing, measured in quick recalls answered.
const FLASH_GAPS = [2, 3, 5, 8, 13, 21];
// A correct quick recall under this many ms counts as "fluent".
const FAST_MS = 3000;

function freshSave() {
  return {
    name: "", florins: 0, xp: 0, turn: 0, fturn: 0, streak: 0, bestStreak: 0,
    flash: {},               // concept -> quick-recall fluency stats
    introF: {},              // concept -> fturn when introduced
    music: true,
    manuscripts: {},         // manuscript id -> true once found
    abilities: {},           // ability id -> true once unlocked
    introduced: {},          // concept -> turn when introduced
    items: {},               // question id -> stats
    ct: {},                  // concept -> {tier: correctCount}
    levels: {},              // level id -> {done, stars, bestAcc}
    commissions: [], cape: "#b23a2e",
    achievements: {}, misses: [], reviews: 0, muted: false,
    lastConcept: null, lastType: null, recent: []
  };
}

let SAVE = freshSave();
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) SAVE = Object.assign(freshSave(), JSON.parse(raw));
  } catch (e) { /* storage blocked: play without saving */ }
  return SAVE;
}
function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {}
}
function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
function resetSave() { SAVE = freshSave(); writeSave(); }

const QBYID = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

const Learn = {
  introduce(c) {
    if (SAVE.introduced[c] !== undefined) return false;
    SAVE.introduced[c] = SAVE.turn;
    SAVE.introF[c] = SAVE.fturn;
    writeSave();
    return true;
  },
  isIntroduced(c) { return SAVE.introduced[c] !== undefined; },
  introducedCount() { return Object.keys(SAVE.introduced).length; },

  readyTier(c) {
    const t = SAVE.ct[c] || {};
    let r = 1;
    for (let k = 1; k <= 3; k++) if ((t[k] || 0) > 0) r = k + 1;
    return r;
  },

  stat(id) {
    return SAVE.items[id] || (SAVE.items[id] = { box: 0, due: 0, seen: 0, right: 0, wrong: 0, last: -99, time: 0 });
  },

  fstat(c) {
    return SAVE.flash[c] || (SAVE.flash[c] = { box: 0, due: 0, seen: 0, right: 0, wrong: 0, fast: 0, ms: 0, time: 0 });
  },
  // Automatic = recalled correctly and quickly, several times, across spacing.
  isAutomatic(c) { const f = SAVE.flash[c]; return !!f && f.fast >= 3 && f.box >= 3; },

  // Mastery 0..1 per concept: quick-recall fluency + item boxes weighted by tier.
  mastery(c) {
    let pts = SAVE.flash[c] ? SAVE.flash[c].box * 1.0 : 0;
    for (const q of QUESTIONS) {
      if (!q.c.includes(c)) continue;
      const s = SAVE.items[q.id];
      if (s) pts += s.box * (0.6 + 0.2 * q.t);
    }
    return Math.min(1, pts / 18);
  },
  totalMastery(list) {
    const ks = list || Object.keys(CONCEPTS);
    return ks.reduce((a, c) => a + Learn.mastery(c), 0) / ks.length;
  },

  // opts: {minTier, maxTier, review}
  pick(opts = {}) {
    const minT = opts.minTier || 1, maxT = opts.maxTier || 4;
    const now = Date.now();
    const pool = QUESTIONS.filter(q => q.c.every(c => Learn.isIntroduced(c)) && (!q.ms || SAVE.manuscripts[q.ms]) && (!opts.type || q.type === opts.type) && (opts.skill ? q.skill === opts.skill : !q.skill || Learn.isIntroduced(q.c[0])) && (!opts.cross || Learn.spansLevels(q)) && (!q.boss || opts.boss));
    if (!pool.length) return null;

    const attempt = (strictReady, useMin) => {
      const scored = [];
      for (const q of pool) {
        if (q.t > maxT) continue;
        if (useMin && q.t < minT) continue;
        const ready = q.c.reduce((a, c) => a + Learn.readyTier(c), 0) / q.c.length;
        if (strictReady && q.t > Math.ceil(ready)) continue;
        if (SAVE.recent.includes(q.id)) continue;
        const s = Learn.stat(q.id);
        let score = Math.random() * 8;
        // Ascend: prefer the hardest tier the learner is ready for.
        const target = Math.max(minT, Math.min(maxT, Math.floor(ready)));
        score += q.t === target ? 30 : -Math.abs(q.t - target) * 8;
        // Focus on the current level's concepts; earlier levels return now and then as spaced review.
        // In mixed (interleaved) levels, questions that connect levels score highest and earlier levels return often.
        if (opts.focus) {
          const all = q.c.every(c => opts.focus.includes(c)), some = q.c.some(c => opts.focus.includes(c));
          score += opts.mix ? (all ? 16 : some ? 24 : 6) : (all ? 25 : some ? 8 : -14);
        }
        // Interleave.
        if (q.c.includes(SAVE.lastConcept)) score -= 45;
        if (q.type === SAVE.lastType) score -= 15;
        // Spacing.
        if (opts.review) {
          const ageMin = s.seen ? (now - s.time) / 60000 : 999;
          score += Math.min(60, ageMin / REVIEW_MINUTES[s.box] * 20);
          score += (5 - s.box) * 4;
        } else {
          const overdue = SAVE.turn - s.due;
          score += overdue >= 0 ? 12 + Math.min(overdue, 10) : overdue * 6;
          if (!s.seen) score += 8;
          score += (5 - s.box) * 2;
        }
        // Give a just-read Codex page a breather before quizzing it.
        for (const c of q.c) if (SAVE.turn - SAVE.introduced[c] < 1 && Learn.introducedCount() > 1) score -= 20;
        scored.push([score, q]);
      }
      scored.sort((a, b) => b[0] - a[0]);
      return scored.length ? scored[0][1] : null;
    };
    return attempt(true, true) || attempt(false, true) || attempt(false, false) ||
      (SAVE.recent = [], attempt(false, false));
  },

  record(q, ok) {
    const s = Learn.stat(q.id);
    const wasMissed = s.wrong > 0 && s.box === 0;
    s.seen++; s.last = SAVE.turn; s.time = Date.now();
    if (ok) {
      s.right++; s.box = Math.min(5, s.box + 1);
      for (const c of q.c) {
        SAVE.ct[c] = SAVE.ct[c] || {};
        SAVE.ct[c][q.t] = (SAVE.ct[c][q.t] || 0) + 1;
      }
      SAVE.streak++; SAVE.bestStreak = Math.max(SAVE.bestStreak, SAVE.streak);
    } else {
      s.wrong++; s.box = 0; SAVE.streak = 0;
      SAVE.misses.unshift({ id: q.id, time: Date.now() });
      SAVE.misses = SAVE.misses.slice(0, 12);
    }
    s.due = SAVE.turn + TURN_GAPS[s.box];
    SAVE.turn++;
    SAVE.lastConcept = q.c[Math.floor(Math.random() * q.c.length)];
    SAVE.lastType = q.type;
    SAVE.recent.push(q.id);
    if (SAVE.recent.length > 6) SAVE.recent.shift();
    writeSave();
    return { comeback: ok && wasMissed };
  },

  // Quick recall: a short clue and three one-word answers.
  // dir "cue": clue → pick the term.  dir "term": term → pick the clue.
  // Wrong answers for fast questions: clearly different from the right one, so a quick
  // card tests recall rather than splitting hairs. Never a look-alike (CONFUSE, either way),
  // never a name sharing a word with the answer; preferably another stage and another kind.
  clearDistractors(c, pool, n, rand = Math.random) {
    const stageOf = k => Object.keys(LEVEL_CODEX).find(id => LEVEL_CODEX[id].includes(k));
    const kindOf = k => ((CONCEPTS[k] && CONCEPTS[k].kind) || "").replace(/s$/, "");
    const words = k => new Set(((SHORT[k] || "") + " " + ((CONCEPTS[k] && CONCEPTS[k].name) || "")).toLowerCase().match(/[a-z]{4,}/g) || []);
    const mine = words(c), stem = (SHORT[c] || "").toLowerCase().slice(0, 4);
    const near = k => (CONFUSE[c] || []).includes(k) || (CONFUSE[k] || []).includes(c) ||
      [...words(k)].some(w => mine.has(w)) || (SHORT[k] || "").toLowerCase().slice(0, 4) === stem;
    const ok = pool.filter(k => k !== c && SHORT[k] && !near(k));
    const score = k => (stageOf(k) !== stageOf(c) ? 3 : 0) + (kindOf(k) !== kindOf(c) ? 2 : 0) + rand() * 1.5;
    return ok.map(k => [k, score(k)]).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]);
  },
  pickFlash(opts = {}) {
    const intro = CODEX_ORDER.filter(c => Learn.isIntroduced(c));
    if (!intro.length) return null;
    let c = null, best = -1e9;
    for (const k of intro) {
      const f = Learn.fstat(k);
      let s = Math.random() * 6;
      const od = SAVE.fturn - f.due;
      s += od >= 0 ? 10 + Math.min(od, 8) : od * 5;
      if (k === SAVE.lastConcept) s -= 40;
      if (!f.seen) s += 6;
      s += (5 - f.box) * 2;
      if (intro.length > 1 && SAVE.fturn - (SAVE.introF[k] || 0) < 1) s -= 25;
      if (opts.focus && !opts.focus.includes(k)) s -= opts.mix ? 3 : 16;
      if (s > best) { best = s; c = k; }
    }
    const f = Learn.fstat(c);
    if (c === "weu") return Learn.geoFlash(opts.dir);
    const dir = opts.dir || (f.box < 2 || Math.random() < 0.5 ? "cue" : "term");
    const distract = Learn.clearDistractors(c, intro, 2);
    const pickCue = k => FLASH[k][Math.floor(Math.random() * FLASH[k].length)];
    let prompt, answer, options;
    if (dir === "cue") {
      prompt = pickCue(c); answer = SHORT[c];
      options = [answer, ...distract.map(d => SHORT[d])];
      for (let i = 0; options.length < 3; i++) options.push(FILLER[i]);
    } else {
      prompt = SHORT[c]; answer = pickCue(c);
      options = [answer, ...distract.map(pickCue)];
      for (let i = 0; options.length < 3; i++) options.push(FILLER_CUES[i]);
    }
    return { c, dir, prompt, answer, options: shuffle(options), fix: `${SHORT[c]} = ${FLASH[c][0]}` };
  },

  // Geography quick recall: name the highlighted nation, or match a clue to a nation.
  geoFlash(dir) {
    const quizzable = Object.keys(COUNTRIES).filter(k => COUNTRIES[k].quiz !== false);
    const withClue = quizzable.filter(k => COUNTRIES[k].clue);
    const mode = dir || (Math.random() < 0.5 ? "map" : "cue");
    const pool = mode === "cue" ? withClue : quizzable;
    const k = pool[Math.floor(Math.random() * pool.length)], C = COUNTRIES[k];
    const options = shuffle([C.name, ...shuffle(quizzable.filter(x => x !== k)).slice(0, 2).map(x => COUNTRIES[x].name)]);
    return {
      c: "weu", dir: mode, map: mode === "map" ? k : null,
      prompt: mode === "map" ? "Which nation is highlighted?" : C.clue,
      answer: C.name, options,
      fix: C.clue ? `${C.name} = ${C.clue}` : `That was ${C.name}`
    };
  },

  recordFlash(item, ok, ms) {
    const c = item.c, f = Learn.fstat(c);
    const wasAuto = Learn.isAutomatic(c);
    f.seen++; f.time = Date.now();
    if (ok) {
      f.right++; f.box = Math.min(5, f.box + 1);
      SAVE.ct[c] = SAVE.ct[c] || {};
      SAVE.ct[c][1] = (SAVE.ct[c][1] || 0) + 1;
      if (ms != null && ms < FAST_MS) f.fast++;
      SAVE.streak++; SAVE.bestStreak = Math.max(SAVE.bestStreak, SAVE.streak);
    } else {
      f.wrong++; f.box = 0; f.fast = Math.max(0, f.fast - 1); SAVE.streak = 0;
    }
    if (ms != null) f.ms = f.ms ? Math.round(f.ms * 0.7 + ms * 0.3) : Math.round(ms);
    f.due = SAVE.fturn + FLASH_GAPS[f.box];
    SAVE.fturn++;
    SAVE.lastConcept = c;
    writeSave();
    return { nowAutomatic: !wasAuto && Learn.isAutomatic(c) };
  },

  // Does a question connect concepts from more than one level?
  spansLevels(q) {
    const lv = new Set(q.c.map(c => Object.keys(LEVEL_CODEX).find(id => LEVEL_CODEX[id].includes(c))));
    return lv.size > 1;
  },

  dueForReview() {
    const now = Date.now();
    let n = 0;
    for (const id in SAVE.items) {
      const s = SAVE.items[id];
      if (s.seen && (now - s.time) / 60000 >= REVIEW_MINUTES[s.box]) n++;
    }
    return n;
  }
};

// =====================================================================
//  QUIZ UI — renders one question in the #quiz overlay.
//  Quiz.ask(question, {title, subtitle}) -> Promise<boolean>
// =====================================================================

// Signaling: key terms in a question are bolded so the eye finds them first.
function emphTerms(text, cs) {
  let h = esc(text);
  const names = [...new Set(cs.flatMap(c => [CONCEPTS[c].name, SHORT[c]]).filter(Boolean))].sort((a, b) => b.length - a.length);
  for (const n of names) {
    const re = new RegExp("(^|[^\\w>])(" + esc(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![^<]*</b>)", "i");
    h = h.replace(re, "$1<b class=\"kt\">$2</b>");
  }
  return h;
}
// Read aloud (for any learner who would rather listen than read).
function readAloud(text) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {}
}
function stopReading() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} }
const TIER_NAMES = ["", "Recall", "Apply", "Connect", "Synthesize"];
const PRAISE = ["Bravo!", "Magnifico!", "Exactly right!", "Well reasoned!", "Brilliant!", "Perfetto!"];
const ENCOURAGE = [
  "Mistakes make memories stronger. You’ll see this one again soon.",
  "Good try. Struggling to remember is how learning sticks.",
  "Not yet! Read the explanation, and this will come back later.",
];

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])); }

// Simple equirectangular map of western Europe as an SVG string.
function mapSVG(opts = {}) {
  const V = opts.view || MAP_VIEW, ky = opts.view ? 52 : 30, kx = ky * Math.cos(47 * Math.PI / 180);
  const P = ([lon, lat]) => `${((lon - V.lon0) * kx).toFixed(1)},${((V.lat1 - lat) * ky).toFixed(1)}`;
  const W = ((V.lon1 - V.lon0) * kx).toFixed(0), H = ((V.lat1 - V.lat0) * ky).toFixed(0);
  const path = polys => polys.map(poly => "M" + poly.map(P).join("L") + "Z").join("");
  let out = `<svg class="eumap${opts.click ? " clickable" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of western Europe">
    <rect width="${W}" height="${H}" class="sea"/>`;
  out += `<path class="other" d="${path(OTHER_LAND)}"/>`;
  for (const k in COUNTRIES) {
    const cls = ["land", k === opts.hi ? "hi" : "", COUNTRIES[k].quiz === false ? "ctx" : ""].join(" ");
    out += `<path class="${cls}" data-k="${k}" d="${path(COUNTRIES[k].polys)}"><title>${opts.labels ? esc(COUNTRIES[k].name) : ""}</title></path>`;
  }
  if (opts.labels) for (const k in COUNTRIES) {
    const [x, y] = P(COUNTRIES[k].label).split(",");
    out += `<text x="${x}" y="${y}" class="lbl">${esc(COUNTRIES[k].name)}</text>`;
  }
  if (opts.florence) { const [x, y] = P([11.25, 43.77]).split(","); out += `<circle cx="${x}" cy="${y}" r="7" class="pin"/>`; }
  for (const pin of opts.pins || []) {
    const [x, y] = P([pin.lon, pin.lat]).split(",");
    out += `<g class="cpin ${pin.state || ""}" data-pin="${esc(pin.label)}"><circle cx="${x}" cy="${y}" r="9"/><text x="${+x + 14}" y="${+y + 6}">${esc(pin.label)}</text></g>`;
  }
  return out + "</svg>";
}

const Quiz = {
  el: null, keyHandler: null,

  // Compact quick-recall card. Resolves {ok, ms}.
  flash(item, opts = {}) {
    return new Promise(resolve => {
      const el = Quiz.el = document.getElementById("quiz");
      el.classList.add("flashmode");
      el.innerHTML = `
        <div class="fcard" role="dialog" aria-modal="true" aria-label="Quick recall">
          <div class="fhead"><span>${esc(opts.title || "Quick recall")}</span><span class="ftimer" aria-hidden="true"><i></i></span></div>
          <div class="fask">${item.map ? "Name the nation" : item.c === "weu" ? "Which nation fits?" : item.dir === "cue" ? "Which term fits?" : "Which clue fits?"}</div>
          ${item.map ? `<div class="fmap">${mapSVG({ hi: item.map })}</div>` : ""}
          <div class="fprompt">${esc(item.prompt)}</div>
          <div class="fopts">${item.options.map((o, i) => `<button class="fopt"><span class="key">${i + 1}</span>${esc(o)}</button>`).join("")}</div>
          <div class="ffb" hidden></div>
        </div>`;
      el.hidden = false;
      const start = performance.now();
      const btns = [...el.querySelectorAll(".fopt")];
      const fb = el.querySelector(".ffb");
      let done = false, closed = false;
      const close = (ok, ms) => {
        if (closed) return; closed = true;
        Quiz.abort = null;
        document.removeEventListener("keydown", Quiz.keyHandler);
        el.hidden = true; el.innerHTML = ""; el.classList.remove("flashmode");
        resolve({ ok, ms });
      };
      // A Class Race can end mid-card: the card closes and resolves {ok: null}.
      Quiz.abort = () => close(null, null);
      const choose = i => {
        if (done) return; done = true;
        const ms = performance.now() - start, ok = item.options[i] === item.answer;
        document.removeEventListener("keydown", Quiz.keyHandler);
        btns.forEach((b, j) => { b.disabled = true; if (item.options[j] === item.answer) b.classList.add("right"); });
        if (!ok) btns[i].classList.add("wrongpick");
        fb.hidden = false;
        if (ok) {
          const fast = ms < FAST_MS;
          fb.className = "ffb good";
          fb.textContent = fast ? `Quick! ${(ms / 1000).toFixed(1)}s ⚡` : "Correct!";
          Sfx.play(fast ? "quick" : "ding");
          setTimeout(() => close(true, ms), fast ? 650 : 750);
        } else {
          fb.className = "ffb bad";
          fb.innerHTML = `<span>${esc(item.fix)}</span><button class="btn primary fgo">Got it ⏎</button>`;
          Sfx.play("wrong");
          const go = fb.querySelector(".fgo");
          go.onclick = () => close(false, ms);
          go.focus();
          setTimeout(() => {
            if (closed) return;
            Quiz.keyHandler = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); close(false, ms); } };
            document.addEventListener("keydown", Quiz.keyHandler);
          }, 450);
        }
      };
      btns.forEach((b, i) => b.onclick = () => choose(i));
      Quiz.keyHandler = e => {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= btns.length) { e.preventDefault(); choose(n - 1); }
      };
      document.addEventListener("keydown", Quiz.keyHandler);
    });
  },

  ask(q, opts = {}) {
    return new Promise(resolve => {
      const el = Quiz.el = document.getElementById("quiz");
      const tags = q.c.map(c => `<span class="qtag">${esc(CONCEPTS[c].name)}</span>`).join("");
      el.innerHTML = `
        <div class="qcard" role="dialog" aria-modal="true" aria-labelledby="qprompt">
          <div class="qhead">
            <span class="qtitle">${esc(opts.title || "Question")}</span>
            <span class="qhr">${"speechSynthesis" in window ? `<button class="qsay" type="button" title="Read aloud" aria-label="Read the question aloud">🔊</button>` : ""}<span class="qtier t${q.t}">Tier ${q.t} · ${TIER_NAMES[q.t]}</span></span>
          </div>
          ${opts.subtitle ? `<div class="qsub">${esc(opts.subtitle)}</div>` : ""}
          ${q.src ? `<blockquote class="srcq"><p>${esc(q.src.text)}</p><cite>${esc(q.src.cite)}</cite></blockquote>` : ""}
          <div class="qprompt" id="qprompt"></div>
          <div class="qbody"></div>
          <div class="qfoot"><div class="qtags">${tags}</div><button class="btn primary qcheck" hidden>Check</button></div>
          <div class="qfeedback" hidden></div>
        </div>`;
      el.hidden = false;
      const prompt = el.querySelector(".qprompt");
      const say = el.querySelector(".qsay");
      if (say) say.onclick = () => readAloud([q.src ? q.src.text : "", el.querySelector(".qprompt").innerText, ...[...el.querySelectorAll(".opt span:last-child, .stext, .mbtn")].map(b => b.innerText)].filter(Boolean).join(". "));
      const body = el.querySelector(".qbody");
      const check = el.querySelector(".qcheck");
      let done = false;

      const finish = (ok, revealHtml) => {
        if (done) return; done = true;
        if (Quiz.keyHandler) document.removeEventListener("keydown", Quiz.keyHandler);
        check.hidden = true;
        el.querySelectorAll("button.opt, .qbody button").forEach(b => b.disabled = true);
        const fb = el.querySelector(".qfeedback");
        fb.hidden = false;
        fb.className = "qfeedback " + (ok ? "good" : "bad");
        fb.innerHTML = `
          <div class="fbtitle">${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : "Not quite."}</div>
          ${revealHtml ? `<div class="fbreveal">${revealHtml}</div>` : ""}
          <div class="fbwhy">${esc(q.why || "")}</div>
          ${ok ? "" : `<div class="fbnote">${ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]}</div>`}
          <button class="btn primary fbgo">Continue ⏎</button>`;
        Sfx.play(ok ? "right" : "wrong");
        const go = fb.querySelector(".fbgo");
        go.focus();
        let closed = false;
        const close = () => {
          if (closed) return; closed = true;
          stopReading();
          document.removeEventListener("keydown", Quiz.keyHandler);
          el.hidden = true; el.innerHTML = "";
          resolve(ok);
        };
        go.onclick = close;
        // Short lock so a held key doesn't skip the explanation.
        Quiz.keyHandler = null;
        setTimeout(() => {
          if (closed) return;
          Quiz.keyHandler = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); close(); } };
          document.addEventListener("keydown", Quiz.keyHandler);
        }, 700);
      };

      const optionButtons = (choices, correct, render = x => esc(x)) => {
        const list = document.createElement("div");
        list.className = "opts";
        choices.forEach((ch, i) => {
          const b = document.createElement("button");
          b.className = "opt";
          b.innerHTML = `<span class="key">${i + 1}</span><span>${render(ch)}</span>`;
          b.onclick = () => {
            const ok = ch === correct;
            b.classList.add(ok ? "right" : "wrongpick");
            if (!ok) [...list.children].forEach((bb, j) => { if (choices[j] === correct) bb.classList.add("right"); });
            finish(ok);
          };
          list.appendChild(b);
        });
        body.appendChild(list);
        Quiz.keyHandler = e => {
          const n = parseInt(e.key, 10);
          if (n >= 1 && n <= choices.length && !done) { e.preventDefault(); list.children[n - 1].click(); }
        };
        document.addEventListener("keydown", Quiz.keyHandler);
      };

      if (q.type === "mc" || q.type === "odd") {
        prompt.innerHTML = emphTerms(q.q, q.c);
        optionButtons(shuffle([q.a, ...q.o]), q.a);
      } else if (q.type === "fill") {
        prompt.innerHTML = emphTerms(q.q, q.c).replace("___", '<span class="blank">______</span>');
        optionButtons(shuffle([q.a, ...q.o]), q.a, x => `<b>${esc(x)}</b>`);
      } else if (q.type === "tf") {
        prompt.innerHTML = `<span class="tflabel">True or false?</span> ${emphTerms(q.q, q.c)}`;
        optionButtons([true, false], q.a, x => x ? "True" : "False");
      } else if (q.type === "match") {
        prompt.innerHTML = emphTerms(q.q, q.c);
        Quiz.renderMatch(q, body, check, finish);
      } else if (q.type === "sort") {
        prompt.innerHTML = emphTerms(q.q, q.c);
        Quiz.renderSort(q, body, check, finish);
      } else if (q.type === "order") {
        prompt.innerHTML = emphTerms(q.q, q.c);
        if (q.showMap) body.insertAdjacentHTML("beforebegin", `<div class="qmap">${mapSVG({ labels: true, florence: true })}</div>`);
        Quiz.renderOrder(q, body, check, finish);
      } else if (q.type === "map") {
        prompt.innerHTML = emphTerms(q.q, q.c);
        const hi = q.mode === "id" ? q.a : q.hi;
        body.insertAdjacentHTML("beforebegin", `<div class="qmap">${mapSVG({ hi, click: q.mode === "click" })}</div>`);
        if (q.mode === "click") {
          const svg = el.querySelector(".qmap svg");
          svg.querySelectorAll("path.land").forEach(path => path.addEventListener("click", () => {
            if (done) return;
            const k = path.dataset.k, ok = k === q.a;
            svg.classList.remove("clickable");
            path.classList.add(ok ? "right" : "wrongpick");
            if (!ok) svg.querySelector(`path[data-k="${q.a}"]`).classList.add("right");
            finish(ok, ok ? "" : `You picked ${esc(COUNTRIES[k].name)}. The answer is <b>${esc(COUNTRIES[q.a].name)}</b> (green).`);
          }));
          body.innerHTML = `<div class="hint">Click a nation on the map.</div>`;
        } else if (q.mode === "id") {
          optionButtons(shuffle([COUNTRIES[q.a].name, ...q.o]), COUNTRIES[q.a].name);
        } else {
          optionButtons(shuffle([q.a, ...q.o]), q.a);
        }
      }
    });
  },

  renderMatch(q, body, check, finish) {
    const lefts = q.pairs.map(p => p[0]);
    const rights = shuffle(q.pairs.map(p => p[1]));
    const pairing = {}; // left index -> right index
    let sel = null;
    body.innerHTML = `<div class="match"><div class="mcol ml"></div><div class="mcol mr"></div></div>
      <div class="hint">Tap a term, then tap its meaning.</div>`;
    const L = body.querySelector(".ml"), R = body.querySelector(".mr");
    const lb = lefts.map((t, i) => { const b = document.createElement("button"); b.className = "mbtn"; b.textContent = t; L.appendChild(b); return b; });
    const rb = rights.map((t, i) => { const b = document.createElement("button"); b.className = "mbtn"; b.textContent = t; R.appendChild(b); return b; });
    const paint = () => {
      lb.forEach((b, i) => { b.dataset.pair = pairing[i] !== undefined ? i : ""; b.classList.toggle("sel", sel === i); });
      rb.forEach((b, j) => {
        const li = Object.keys(pairing).find(k => pairing[k] === j);
        b.dataset.pair = li !== undefined ? li : "";
      });
      check.hidden = Object.keys(pairing).length !== lefts.length;
    };
    lb.forEach((b, i) => b.onclick = () => { sel = sel === i ? null : i; if (pairing[i] !== undefined && sel === i) delete pairing[i]; paint(); });
    rb.forEach((b, j) => b.onclick = () => {
      if (sel === null) return;
      for (const k in pairing) if (pairing[k] === j) delete pairing[k];
      pairing[sel] = j; sel = null; Sfx.play("tick"); paint();
    });
    check.onclick = () => {
      let ok = true;
      lefts.forEach((t, i) => {
        const good = rights[pairing[i]] === q.pairs[i][1];
        lb[i].classList.add(good ? "right" : "wrongpick");
        if (!good) ok = false;
      });
      const reveal = ok ? "" : "<ul>" + q.pairs.map(p => `<li><b>${esc(p[0])}</b> → ${esc(p[1])}</li>`).join("") + "</ul>";
      finish(ok, reveal);
    };
    paint();
  },

  renderSort(q, body, check, finish) {
    const items = shuffle(q.items);
    const choice = new Array(items.length).fill(-1);
    body.innerHTML = `<div class="sort"></div>`;
    const wrap = body.querySelector(".sort");
    const rows = items.map((it, i) => {
      const row = document.createElement("div");
      row.className = "srow";
      row.innerHTML = `<div class="stext">${esc(it[0])}</div><div class="sbins">${q.bins.map((b, k) => `<button class="sbin" data-k="${k}">${esc(b)}</button>`).join("")}</div>`;
      row.querySelectorAll(".sbin").forEach(btn => btn.onclick = () => {
        choice[i] = +btn.dataset.k; Sfx.play("tick");
        row.querySelectorAll(".sbin").forEach(bb => bb.classList.toggle("on", +bb.dataset.k === choice[i]));
        check.hidden = choice.includes(-1);
      });
      wrap.appendChild(row);
      return row;
    });
    check.onclick = () => {
      let ok = true;
      items.forEach((it, i) => {
        const good = choice[i] === it[1];
        if (!good) ok = false;
        rows[i].classList.add(good ? "right" : "wrongpick");
        if (!good) rows[i].querySelector(`.sbin[data-k="${it[1]}"]`).classList.add("should");
      });
      finish(ok, ok ? "" : "Correct categories are outlined.");
    };
  },

  renderOrder(q, body, check, finish) {
    const pool = shuffle(q.seq);
    const chosen = [];
    body.innerHTML = `<ol class="chain"></ol><div class="pool"></div><div class="hint">Tap the steps in order. Tap a placed step to remove it.</div>`;
    const chain = body.querySelector(".chain"), poolEl = body.querySelector(".pool");
    const paint = () => {
      chain.innerHTML = ""; poolEl.innerHTML = "";
      chosen.forEach((t, i) => {
        const li = document.createElement("li");
        const b = document.createElement("button"); b.className = "mbtn"; b.textContent = t;
        b.onclick = () => { chosen.splice(i, 1); paint(); };
        li.appendChild(b); chain.appendChild(li);
      });
      pool.filter(t => !chosen.includes(t)).forEach(t => {
        const b = document.createElement("button"); b.className = "mbtn"; b.textContent = t;
        b.onclick = () => { chosen.push(t); Sfx.play("tick"); paint(); };
        poolEl.appendChild(b);
      });
      check.hidden = chosen.length !== q.seq.length;
    };
    check.onclick = () => {
      const ok = chosen.every((t, i) => t === q.seq[i]);
      [...chain.children].forEach((li, i) => li.classList.add(chosen[i] === q.seq[i] ? "right" : "wrongpick"));
      finish(ok, ok ? "" : "<ol>" + q.seq.map(s => `<li>${esc(s)}</li>`).join("") + "</ol>");
    };
    paint();
  }
};
