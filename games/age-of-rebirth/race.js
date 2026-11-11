"use strict";
// =====================================================================
//  CLASS RACE — race classmates live with a class code.
//  The teacher (an Editor of the game) hosts and picks a format:
//    Recall Sprint · everyone answers the same quick-recall questions, in
//                    the same order, against the clock
//    Level Race    · everyone plays the same level at the same time
//  Accuracy wins: points for correct answers (more for harder tiers and for
//  lightning recall), a penalty for wrong ones, a bonus for finishing.
//  Storage:
//    races/<CODE>   race settings and status, written by the teacher
//    racers/<id>    each student's latest race result, written by that student
//  Live standings travel as room presence in a room named for the code.
// =====================================================================
const RACE_TEAMS = [["Medici", "#b23a2e"], ["Tudor", "#24508f"], ["Wittenberg", "#b8861a"]];
const RACE_WORDS = ["FALCON", "LANTERN", "QUILL", "GLOBE", "COMPASS", "ROSE", "EAGLE", "PRESS", "ORBIT", "BEACON", "SCROLL", "CROWN", "TOWER", "RAVEN", "GALLEY", "LUTE"];
const RACE_PTS = { quick: 10, fast: 5, wrong: -5, tier: 10, finish: 50 };
const RACE_SCOPES = { L1: "Level 1 · The Renaissance", L2: "Level 2 · The Reformation", L3: "Level 3 · Crown and Cosmos", L4: "Voyage 1 · Around the Cape", all: "Everything so far" };

// One sprint question, drawn from a seeded generator so every student gets the same sequence.
function sprintItem(rng, scope, prev) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let c = pick(scope);
  for (let k = 0; k < 4 && c === prev && scope.length > 1; k++) c = pick(scope);
  if (c === "weu") {
    const ks = Object.keys(COUNTRIES).filter(k => COUNTRIES[k].quiz !== false), k = pick(ks), C = COUNTRIES[k];
    const map = !C.clue || rng() < 0.5;
    return { c, dir: map ? "map" : "cue", map: map ? k : null, prompt: map ? "Which nation is highlighted?" : C.clue, answer: C.name,
      options: shuf([C.name, ...shuf(ks.filter(x => x !== k)).slice(0, 2).map(x => COUNTRIES[x].name)]), fix: C.clue ? `${C.name} = ${C.clue}` : `That was ${C.name}` };
  }
  const dir = rng() < 0.6 ? "cue" : "term";
  const terms = CODEX_ORDER.filter(x => x !== "weu" && x !== c);
  const distract = Learn.clearDistractors(c, terms, 2, rng);   // same seed for every racer
  const answer = dir === "cue" ? SHORT[c] : pick(FLASH[c]);
  const options = shuf([answer, ...distract.map(d => dir === "cue" ? SHORT[d] : pick(FLASH[d]))]);
  return { c, dir, prompt: dir === "cue" ? pick(FLASH[c]) : SHORT[c], answer, options, fix: `${SHORT[c]} = ${FLASH[c][0]}` };
}

const Race = {
  room: null, ready: false, cur: null, names: {}, bar: null, timer: null,

  async init() {
    try { this.room = await window.claude.use("room"); } catch (e) { this.room = null; }
    this.ready = !!(this.room && Sync.db && Sync.myId);
    if (this.ready && G.scene === "map") updateMapBar();
  },
  get active() { return !!this.cur; },
  get running() { return !!this.cur && this.cur.phase === "running"; },
  isHost() { return !!this.cur && this.cur.role === "host"; },

  // ------------------------------------------------------------ menus
  openMenu(back) {
    if (this.cur) return this.cur.role === "host" ? this.showHost() : this.showLobby();
    const scopes = Object.entries(RACE_SCOPES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
    const levels = Object.keys(LEVELS).map(id => `<option value="${id}">${LEVELS[id].label || "Level " + LEVELS[id].num} · ${esc(LEVELS[id].title)}</option>`).join("");
    const host = Sync.teacher ? `
      <h3>Host a race</h3>
      <div class="raceform">
        <label>Format <select id="rmode"><option value="sprint">Recall Sprint (same questions for everyone)</option><option value="level">Level Race (play a level together)</option></select></label>
        <label id="rscopew">Questions from <select id="rscope">${scopes}</select></label>
        <label id="rlevelw" hidden>Level <select id="rlevel">${levels}</select></label>
        <label>Time limit <select id="rdur"><option value="120">2 minutes</option><option value="180" selected>3 minutes</option><option value="300">5 minutes</option><option value="600">10 minutes</option><option value="900">15 minutes</option></select></label>
        <label class="chk"><input type="checkbox" id="rteams"> Team mode (houses pool their points)</label>
        <label class="chk"><input type="checkbox" id="rtop5" checked> Students see only the top 5 and their own rank</label>
      </div>
      <div class="row"><button class="btn primary" id="rhost">Create race code</button></div>
      <p class="small">Students tap <b>Join race</b> on the map and type the code. You run the race from here; your screen becomes the leaderboard, ready for the projector.</p>` : "";
    openPanel(`<div class="phead"><h2>Class Race</h2><button class="btn" id="rclose">Close</button></div>
      ${host}
      <h3>Join a race</h3>
      <div class="raceform"><label>Class code <input id="rcode" autocomplete="off" spellcheck="false" placeholder="e.g. FALCON-42" maxlength="16"></label></div>
      <p class="rmsg" id="rmsg" aria-live="polite"></p>
      <div class="row"><button class="btn ${Sync.teacher ? "" : "primary"}" id="rjoin">Join race</button></div>
      <p class="tiny">Scoring: +${RACE_PTS.quick} per correct quick answer (+${RACE_PTS.fast} if under 3 seconds), +${RACE_PTS.tier} × tier for deeper questions, ${RACE_PTS.wrong} for a wrong answer, +${RACE_PTS.finish} for finishing a level. Accuracy beats speed.</p>`, "narrow racepanel");
    onPanelClick("#rclose", () => { closePanel(); if (back) back(); });
    const mode = panelEl.querySelector("#rmode");
    if (mode) mode.onchange = () => { const lv = mode.value === "level"; panelEl.querySelector("#rscopew").hidden = lv; panelEl.querySelector("#rlevelw").hidden = !lv; panelEl.querySelector("#rdur").value = lv ? "600" : "180"; };
    onPanelClick("#rhost", () => this.host({
      mode: mode.value, scope: panelEl.querySelector("#rscope").value, level: panelEl.querySelector("#rlevel").value,
      durationS: +panelEl.querySelector("#rdur").value, teams: panelEl.querySelector("#rteams").checked, top5: panelEl.querySelector("#rtop5").checked
    }));
    const code = panelEl.querySelector("#rcode");
    code.onkeydown = e => { if (e.key === "Enter") this.join(code.value); };
    onPanelClick("#rjoin", () => this.join(code.value));
    if (!Sync.teacher) setTimeout(() => code.focus(), 40);
  },
  msg(text) { const m = panelEl.querySelector("#rmsg"); if (m) m.textContent = text; },

  // ------------------------------------------------------------ hosting
  async host(opts) {
    const db = Sync.db;
    let code = null;
    for (let i = 0; i < 6 && !code; i++) {
      const c = RACE_WORDS[Math.floor(Math.random() * RACE_WORDS.length)] + "-" + (10 + Math.floor(Math.random() * 90));
      const s = await db.doc("races/" + c).get().catch(() => null);
      if (s && (!s.exists || s.data().status === "done")) code = c;
    }
    if (!code) { toast("Couldn’t create a race right now. Try again in a moment."); return; }
    const doc = { status: "lobby", mode: opts.mode, scope: opts.scope, level: opts.level, durationS: opts.durationS, teams: opts.teams ? {} : null, top5: opts.top5, host: Sync.myId, createdAt: Date.now() };
    try { await db.doc("races/" + code).set(doc); } catch (e) { toast("Only the game’s owner or editors can host a race."); return; }
    if (!(await this.enter(code, "host", doc))) return;
    this.showHost();
  },
  async start() {
    const c = this.cur, players = this.players();
    if (!players.length) { toast("Wait for at least one student to join."); return; }
    const upd = { status: "running", startedAt: Date.now(), seed: Math.floor(Math.random() * 1e9) };
    if (c.doc.teams) {
      const ids = players.map(p => p.id).sort(), n = ids.length < 6 ? 2 : 3;
      upd.teams = Object.fromEntries(ids.map((id, i) => [id, i % n]));
      upd.teamCount = n;
    }
    try { await Sync.db.doc("races/" + c.code).update(upd); } catch (e) { toast("Couldn’t start the race. Check your connection."); }
  },
  async endRace() {
    if (!this.cur) return;
    try { await Sync.db.doc("races/" + this.cur.code).update({ status: "done", endedAt: Date.now() }); } catch (e) {}
  },
  showHost() {
    const c = this.cur;
    if (!c) return;
    const lobby = c.phase === "lobby";
    openPanel(`<div class="phead"><h2>${lobby ? "Race lobby" : c.phase === "done" ? "Final standings" : "Live standings"}</h2>
        <div class="row" style="margin:0">${lobby ? `<button class="btn primary" id="rstart">Start race ▶</button><button class="btn" id="rcancel">Cancel race</button>` : c.phase === "done" ? `<button class="btn" id="rleave">Close race</button>` : `<button class="btn" id="rend">End race now</button>`}</div></div>
      <div class="racecode"><span>Class code</span><b>${esc(c.code)}</b><small>${esc(c.doc.mode === "sprint" ? "Recall Sprint · " + RACE_SCOPES[c.doc.scope] : "Level Race · " + LEVELS[c.doc.level].title)} · ${Math.round(c.doc.durationS / 60)} min${c.doc.teams ? " · Teams" : ""}</small></div>
      <div id="rboard"></div>`, "wide xwide racepanel");
    onPanelClick("#rstart", () => this.start());
    onPanelClick("#rcancel", async () => { await this.endRace(); this.leave(); closePanel(); });
    onPanelClick("#rend", () => this.endRace());
    onPanelClick("#rleave", () => { this.leave(); closePanel(); });
    this.renderBoard();
  },
  // The leaderboard: live presence, merged with saved results once the race ends.
  standings() {
    const c = this.cur, rows = new Map();
    for (const r of c.saved || []) rows.set(r.id, { ...r });
    for (const p of this.players()) rows.set(p.id, { ...(rows.get(p.id) || {}), ...p, live: true });
    const list = [...rows.values()].sort((a, b) => (b.pts || 0) - (a.pts || 0) || (b.finished ? 1 : 0) - (a.finished ? 1 : 0) || (a.finishMs || 9e9) - (b.finishMs || 9e9));
    list.forEach((r, i) => { r.rank = i + 1; r.team = c.doc.teams ? c.doc.teams[r.id] : undefined; });
    return list;
  },
  teamTotals(list) {
    const c = this.cur, n = c.doc.teamCount || 0;
    if (!c.doc.teams || !n) return null;
    const tot = Array.from({ length: n }, (_, i) => ({ i, name: RACE_TEAMS[i][0], col: RACE_TEAMS[i][1], pts: 0, n: 0 }));
    for (const r of list) if (r.team !== undefined && tot[r.team]) { tot[r.team].pts += Math.max(0, r.pts || 0); tot[r.team].n++; }
    // average per member, so an uneven split stays fair
    tot.forEach(t => { t.avg = t.n ? Math.round(t.pts / t.n) : 0; });
    return tot.sort((a, b) => b.avg - a.avg);
  },
  renderBoard() {
    const el = document.getElementById("rboard"), c = this.cur;
    if (!el || !c) return;
    const list = this.standings(), teams = this.teamTotals(list);
    const left = c.phase === "running" ? Math.max(0, Math.ceil((c.endLocal - Date.now()) / 1000)) : null;
    const name = r => esc(this.nameOf(r.id));
    const acc = r => (r.right || 0) + (r.wrong || 0) ? Math.round(100 * r.right / (r.right + r.wrong)) + "%" : "—";
    el.innerHTML = `
      ${left !== null ? `<div class="rclock">⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}</div>` : ""}
      ${teams ? `<div class="rteams">${teams.map((t, i) => `<div style="--tc:${t.col}"><b>${i === 0 && c.phase === "done" ? "🏆 " : ""}${esc(t.name)}</b><span>${t.avg} pts per player · ${t.n} player${t.n === 1 ? "" : "s"}</span></div>`).join("")}</div>` : ""}
      ${list.length ? `<div class="tablewrap"><table class="mtable rtable"><thead><tr><th>#</th><th>Student</th>${teams ? "<th>House</th>" : ""}<th class="num">Points</th><th class="num">Correct</th><th class="num">Accuracy</th><th class="num">⚡</th><th>${c.doc.mode === "level" ? "Progress" : ""}</th></tr></thead>
        <tbody>${list.map(r => `<tr class="${r.rank <= 3 && c.phase !== "lobby" ? "top" : ""}"><td>${c.phase === "lobby" ? "" : ["🥇", "🥈", "🥉"][r.rank - 1] || r.rank}</td><td>${name(r)}${r.live ? "" : ' <span class="tiny">(left)</span>'}</td>
          ${teams ? `<td><span class="tdot" style="--tc:${RACE_TEAMS[r.team] ? RACE_TEAMS[r.team][1] : "#999"}"></span>${RACE_TEAMS[r.team] ? esc(RACE_TEAMS[r.team][0]) : "—"}</td>` : ""}
          <td class="num"><b>${r.pts || 0}</b></td><td class="num">${r.right || 0}</td><td class="num">${acc(r)}</td><td class="num">${r.fast || 0}</td>
          <td>${c.doc.mode === "level" ? `<div class="meter"><span style="width:${Math.round((r.prog || 0) * 100)}%"></span></div>${r.finished ? " ✓" : ""}` : ""}</td></tr>`).join("")}</tbody></table></div>`
        : `<p class="small">${c.phase === "lobby" ? "Waiting for students to join… Share the code above." : "No players."}</p>`}
      ${c.phase === "lobby" ? `<p class="small">${list.length} student${list.length === 1 ? "" : "s"} joined.</p>` : ""}`;
    this.refreshNames(list.map(r => r.id));
  },

  // ------------------------------------------------------------ joining
  async join(raw) {
    const code = String(raw || "").toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
    if (!/^[A-Z]+-\d\d$/.test(code)) { this.msg("Type the code your teacher shows, like FALCON-42."); return; }
    let snap = null;
    try { snap = await Sync.db.doc("races/" + code).get(); } catch (e) {}
    if (!snap || !snap.exists) { this.msg("No race with that code. Check the spelling."); return; }
    const doc = snap.data();
    if (doc.status === "done") { this.msg("That race has already ended."); return; }
    if (await this.enter(code, "player", doc)) this.showLobby();
  },
  async enter(code, role, doc) {
    let named;
    try { named = await this.room.join("race-" + code.toLowerCase()); } catch (e) { toast("Couldn’t connect to the race. Try again."); return false; }
    this.leave();
    const c = this.cur = { code, role, doc, named, phase: "lobby", score: { pts: 0, right: 0, wrong: 0, fast: 0, finished: false, finishMs: null, prog: 0 }, saved: [] };
    c.unsubPeers = named.onPeers(() => { if (this.cur === c) { this.renderBoard(); this.renderBar(); } });
    c.unsubDoc = Sync.db.doc("races/" + code).onSnapshot(s => { if (this.cur === c && s.exists) this.onDoc(s.data()); }, () => {});
    this.pushPresence();
    clearInterval(this.timer); this.timer = setInterval(() => this.tick(), 250);
    if (role === "player" && doc.status === "running") this.begin(true);
    if (G.scene === "map") updateMapBar();
    return true;
  },
  leave() {
    const c = this.cur;
    if (!c) return;
    this.cur = null;
    try { c.unsubPeers && c.unsubPeers(); c.unsubDoc && c.unsubDoc(); c.named.leave(); } catch (e) {}
    if (c.sprinting && Quiz.abort) Quiz.abort();
    clearInterval(this.timer);
    this.renderBar();
    if (G.scene === "map") updateMapBar();
  },
  showLobby() {
    const c = this.cur;
    if (!c) return;
    if (c.phase === "done") return this.showResults();
    openPanel(`<div class="eyebrow">Class Race · ${esc(c.code)}</div>
      <h2 class="center">${c.phase === "lobby" ? "You’re in!" : "Race in progress"}</h2>
      <p class="center">${esc(c.doc.mode === "sprint" ? "Recall Sprint · " + RACE_SCOPES[c.doc.scope] : "Level Race · " + (LEVELS[c.doc.level].label || "Level " + LEVELS[c.doc.level].num) + ": " + LEVELS[c.doc.level].title)} · ${Math.round(c.doc.durationS / 60)} minutes</p>
      <p class="small center">${c.phase === "lobby" ? "Waiting for your teacher to start. Get ready: correct answers score, fast correct answers score more, and wrong answers cost points." : "Close this to keep playing."}</p>
      <div id="rboard"></div>
      <div class="row"><button class="btn" id="rleave">Leave race</button>${c.phase === "lobby" ? "" : '<button class="btn primary" id="rback">Back to the race</button>'}</div>`, "narrow racepanel");
    onPanelClick("#rleave", () => { this.leave(); closePanel(); });
    onPanelClick("#rback", closePanel);
    this.renderBoard();
  },

  // ------------------------------------------------------------ race flow
  onDoc(d) {
    const c = this.cur, was = c.doc.status;
    c.doc = d;
    if (c.role === "host") {
      if (d.status === "running" && c.phase === "lobby") { c.phase = "running"; c.endLocal = Date.now() + d.durationS * 1000 + 4000; this.showHost(); }
      if (d.status === "done" && c.phase !== "done") { c.phase = "done"; setTimeout(() => this.loadSaved().then(() => this.showHost()), 1500); this.showHost(); }
      return;
    }
    if (d.status === "running" && c.phase === "lobby") this.begin(was === "running");
    if (d.status === "done" && c.phase !== "done") this.finish("ended");
  },
  // late: joined after the start, so trust the host's clock for the time left
  begin(late) {
    const c = this.cur, d = c.doc;
    c.team = d.teams ? d.teams[Sync.myId] : undefined;
    let ms = d.durationS * 1000;
    if (late && d.startedAt) ms = clamp(ms - (Date.now() - d.startedAt), 20000, ms);
    c.phase = "countdown";
    if (Quiz.abort) Quiz.abort();
    let n = 3;
    const team = c.team !== undefined && RACE_TEAMS[c.team] ? `<p class="center">You race for <b style="color:${RACE_TEAMS[c.team][1]}">House ${esc(RACE_TEAMS[c.team][0])}</b></p>` : "";
    const show = () => {
      openPanel(`<div class="eyebrow">Class Race · ${esc(c.code)}</div><div class="rcount">${n || "Go!"}</div>${team}`, "narrow racepanel");
      Sfx.play(n ? "tick" : "ding");
    };
    show();
    const iv = setInterval(() => {
      if (this.cur !== c) { clearInterval(iv); return; }
      n--; show();
      if (n < 0) {
        clearInterval(iv); closePanel();
        c.phase = "running"; c.startLocal = Date.now(); c.endLocal = c.startLocal + ms;
        if (d.mode === "sprint") this.runSprint(); else { startLevel(d.level, { race: true }); }
        this.renderBar();
      }
    }, 900);
  },
  async runSprint() {
    const c = this.cur, d = c.doc, scope = d.scope === "all" ? CODEX_ORDER.slice() : LEVEL_CODEX[d.scope].slice();
    const rng = mulberry(d.seed || 1);
    let prev = null, i = 0;
    c.sprinting = true; G.modal = true; clearKeys();
    while (this.cur === c && c.phase === "running") {
      const item = sprintItem(rng, scope, prev); prev = item.c;
      const r = await Quiz.flash(item, { title: `Recall Sprint · question ${++i}` });
      if (this.cur !== c || r.ok === null || c.phase !== "running") break;
      // a sprint is also real retrieval practice for concepts you have met
      if (Learn.isIntroduced(item.c)) { const res = Learn.recordFlash(item, r.ok, r.ms); if (res.nowAutomatic) { toast(`${CONCEPTS[item.c].name} is now automatic ⚡`, "buff"); checkAbilities(); } }
      this.onAnswer("quick", r.ok, { ms: r.ms });
    }
    c.sprinting = false; G.modal = false; clearKeys();
    Sync.schedule();
  },
  onAnswer(kind, ok, info = {}) {
    const c = this.cur;
    if (!c || c.role !== "player" || c.phase !== "running") return;
    const s = c.score;
    if (ok) {
      s.right++;
      s.pts += kind === "deep" ? RACE_PTS.tier * (info.t || 1) : RACE_PTS.quick;
      if (kind === "quick" && info.ms != null && info.ms < FAST_MS) { s.fast++; s.pts += RACE_PTS.fast; }
    } else { s.wrong++; s.pts = Math.max(0, s.pts + RACE_PTS.wrong); }
    this.pushPresence(); this.renderBar();
  },
  onLevelWin() {
    const c = this.cur;
    if (!c || c.role !== "player" || c.phase !== "running" || c.doc.mode !== "level") return;
    c.score.finished = true; c.score.finishMs = Date.now() - c.startLocal; c.score.pts += RACE_PTS.finish; c.score.prog = 1;
    this.pushPresence(); this.save();
    toast(`You finished! +${RACE_PTS.finish} race points.`, "streak");
  },
  tick() {
    const c = this.cur;
    if (!c) return;
    if (c.role === "player" && c.phase === "running") {
      if (c.doc.mode === "level" && inLevel() && G.level.def.id === c.doc.level) {
        const L = G.level, p = L.p, prog = clamp(p.x / (L.W * T), 0, 1);
        c.score.prog = c.score.finished ? 1 : Math.max(c.score.prog, prog);
        this.pushPresence({ x: Math.round(p.x), y: Math.round(p.y), f: p.face, lv: L.def.id });
      }
      if (Date.now() >= c.endLocal) this.finish("time");
    }
    if (c.role === "host" && c.phase === "running" && Date.now() > c.endLocal + 3000) this.endRace();
    this.renderBar();
    if (document.getElementById("rboard") && !panelEl.hidden) this.renderBoard();
  },
  pushPresence(extra) {
    const c = this.cur;
    if (!c) return;
    const s = c.score;
    c.named.presence({ role: c.role, id: Sync.myId, pts: s.pts, right: s.right, wrong: s.wrong, fast: s.fast, prog: Math.round(s.prog * 1000) / 1000, finished: s.finished, finishMs: s.finishMs, ...(extra || {}) }).catch(() => {});
  },
  async finish(why) {
    const c = this.cur;
    if (!c || c.phase === "done") return;
    const wasRunning = c.phase === "running";
    c.phase = "done";
    if (c.sprinting && Quiz.abort) Quiz.abort();
    if (wasRunning) { Sfx.play("win"); this.pushPresence(); await this.save(); }
    await new Promise(r => setTimeout(r, 1200));
    if (this.cur !== c) return;
    await this.loadSaved();
    if (c.doc.mode === "level" && inLevel() && !panelEl.hidden) { toast("Time! The race is over. Tap the race bar to see the standings."); return; }
    this.showResults();
  },
  async save() {
    const c = this.cur;
    if (!c || c.role !== "player") return;
    const s = c.score;
    try {
      await Sync.db.doc("racers/" + Sync.myId).set({ code: c.code, mode: c.doc.mode, scope: c.doc.scope || null, level: c.doc.level || null, team: c.team ?? null,
        pts: s.pts, right: s.right, wrong: s.wrong, fast: s.fast, finished: s.finished, finishMs: s.finishMs, prog: s.prog, at: Date.now() });
    } catch (e) { /* view-only: the live board still shows the score */ }
  },
  async loadSaved() {
    const c = this.cur;
    if (!c) return;
    try {
      const q = await Sync.db.collection("racers").where("code", "==", c.code).get();
      c.saved = q.docs.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {}
  },
  showResults() {
    const c = this.cur;
    if (!c) return;
    const list = this.standings(), me = list.find(r => r.id === Sync.myId), teams = this.teamTotals(list);
    const shown = c.doc.top5 ? list.filter(r => r.rank <= 5 || r.id === Sync.myId) : list;
    const s = c.score, acc = s.right + s.wrong ? Math.round(100 * s.right / (s.right + s.wrong)) : 0;
    openPanel(`<div class="eyebrow">Class Race · ${esc(c.code)} · Final</div>
      <h2 class="center">${me ? (me.rank === 1 ? "🏆 You won!" : `You placed #${me.rank} of ${list.length}`) : "Race over"}</h2>
      ${teams ? `<p class="center">Winning house: <b style="color:${teams[0].col}">${esc(teams[0].name)}</b> (${teams[0].avg} points per player)</p>` : ""}
      <div class="stats"><div><b>${s.pts}</b><span>Points</span></div><div><b>${s.right}</b><span>Correct</span></div><div><b>${acc}%</b><span>Accuracy</span></div><div><b>${s.fast}</b><span>Lightning ⚡</span></div></div>
      <div class="podium">${shown.map(r => `<div class="${r.id === Sync.myId ? "me" : ""}"><span>${["🥇", "🥈", "🥉"][r.rank - 1] || "#" + r.rank}</span><b>${esc(this.nameOf(r.id))}${r.id === Sync.myId ? " (you)" : ""}</b><i>${r.pts || 0} pts</i></div>`).join("")}</div>
      <p class="small center">Every answer also counts toward your own spaced review. Missed ones come back in the Hall of Memory.</p>
      <div class="row">${inLevel() ? '<button class="btn" id="rkeep">Keep playing</button>' : ""}<button class="btn primary" id="rdone">Done</button></div>`, "narrow racepanel");
    this.refreshNames(shown.map(r => r.id)).then(() => { if (this.cur === c && panelEl.querySelector(".podium")) panelEl.querySelectorAll(".podium b").forEach((b, i) => { b.textContent = this.nameOf(shown[i].id) + (shown[i].id === Sync.myId ? " (you)" : ""); }); });
    onPanelClick("#rkeep", () => { this.leave(); closePanel(); });
    onPanelClick("#rdone", () => { this.leave(); closePanel(); if (inLevel()) toMap(); });
  },

  // ------------------------------------------------------------ people
  // Racers are everyone in the race room except the host. Presence is display data only.
  players() {
    const c = this.cur;
    if (!c) return [];
    const out = [];
    for (const p of c.named.peers()) {
      const pr = p.presence || {}, id = p.by || pr.id;
      if (pr.role !== "player" || !id || out.some(o => o.id === id)) continue;
      out.push({ id, pts: +pr.pts || 0, right: +pr.right || 0, wrong: +pr.wrong || 0, fast: +pr.fast || 0, prog: +pr.prog || 0, finished: !!pr.finished, finishMs: pr.finishMs || null, x: pr.x, y: pr.y, f: pr.f, lv: pr.lv, isMe: p.isMe });
    }
    return out;
  },
  nameOf(id) { return this.names[id] || (id === Sync.myId ? "You" : "Student"); },
  async refreshNames(ids) {
    const need = ids.filter(id => id && this.names[id] === undefined);
    if (!need.length || !Sync.user) return;
    need.forEach(id => { this.names[id] = ""; });
    try { const ps = await Sync.user.profiles(need); for (const id of need) this.names[id] = (ps[id] && ps[id].name) || ""; } catch (e) {}
  },

  // ------------------------------------------------------------ the race bar
  renderBar() {
    let bar = this.bar;
    const c = this.cur;
    if (!c || c.role === "host" || c.phase === "lobby") { if (bar) bar.hidden = true; return; }
    if (!bar) {
      bar = this.bar = document.createElement("button");
      bar.id = "racebar"; bar.type = "button";
      bar.onclick = () => { if (!this.cur) return; if (this.cur.phase === "done") this.showResults(); else this.showLobby(); };
      document.body.appendChild(bar);
    }
    bar.hidden = false;
    const list = this.standings(), me = list.find(r => r.id === Sync.myId), lead = list[0];
    const left = c.phase === "running" ? Math.max(0, Math.ceil((c.endLocal - Date.now()) / 1000)) : 0;
    const teams = this.teamTotals(list);
    const html = `<span class="rbt">${c.phase === "done" ? "🏁 Final" : c.phase === "countdown" ? "Get ready" : `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`}</span>
      <span><b>${c.score.pts}</b> pts${me ? ` · #${me.rank}/${list.length}` : ""}</span>
      ${teams ? teams.map(t => `<span class="rbteam" style="--tc:${t.col}">${esc(t.name)} ${t.avg}</span>`).join("") : lead && lead.id !== Sync.myId ? `<span class="rblead">Leader: ${esc(this.nameOf(lead.id))} ${lead.pts}</span>` : ""}`;
    if (bar.__html !== html) { bar.innerHTML = html; bar.__html = html; }
  },

  // ------------------------------------------------------------ ghosts (Level Race)
  // Classmates appear as faint apprentices running the same level.
  drawGhosts(L) {
    const c = this.cur;
    if (!c || c.doc.mode !== "level") return;
    const cam = L.cam;
    ctx.save();
    for (const g of this.players()) {
      if (g.isMe || g.lv !== L.def.id || typeof g.x !== "number" || g.x < cam - 60 || g.x > cam + VW + 60) continue;
      ctx.globalAlpha = 0.35;
      Art.player({ x: g.x, y: g.y, face: g.f || 1, onGround: true, vx: 2, anim: G.t * 0.2 + g.x, fly: false, squash: 0 }, G.t);
      ctx.globalAlpha = 0.85;
      const n = this.nameOf(g.id);
      ctx.font = `700 12px ${FONT_B}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const w = ctx.measureText(n).width + 12, tc = c.doc.teams && RACE_TEAMS[c.doc.teams[g.id]] ? RACE_TEAMS[c.doc.teams[g.id]][1] : "#2b1d14";
      ctx.fillStyle = tc; rr(g.x + 15 - w / 2, g.y - 28, w, 16, 6); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText(n, g.x + 15, g.y - 20);
    }
    ctx.restore();
    this.refreshNames(this.players().map(p => p.id));
  }
};
