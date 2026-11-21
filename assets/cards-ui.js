/* Emporium cards page: packs, album and quiz battle. Needs cards-core.js and cards-data.js. */
(function () {
  'use strict';
  var D = window.EMP_CARDS, EC = window.EmporiumCards;
  if (!D || !EC) return;

  var RAR = { C: { n: 'Common', w: 60, g: 1 }, U: { n: 'Uncommon', w: 25, g: 2 }, R: { n: 'Rare', w: 10, g: 3 },
              E: { n: 'Epic', w: 4, g: 4 }, L: { n: 'Legendary', w: 1, g: 5 } };
  var TYPE = { term: 'Key term', person: 'Key person', place: 'Key place', event: 'Key event' };
  var FOES = {
    'age-of-rebirth': ['The Fog of Forgetting', 'Forget it, apprentice. Nobody remembers the old books.'],
    'beyond-the-horizon': ['The Great Storm', 'Turn back, sailor! The edge of the map is near.'],
    'lantern-of-reason': ['Baron Blindfold', 'Tradition says: no questions allowed!'],
    'the-last-king': ['The Old Regime', 'Let them eat cake, and let you flunk this quiz.'],
    'full-steam': ['The Smog Baron', 'My factories never sleep, and neither do my questions.'],
    'empire-chase': ['The Greedy Empire', 'Everything on this map is mine.'],
    'over-the-top': ['The Stalemate', 'Dig in. Nobody is getting past me.'],
    'front-line': ['The Fog of War', 'Can you tell where the front line really is?'],
    'the-red-imposter': ['The Imposter', 'Somebody in this room is not who they say they are...'],
    mixed: ['The Rival Historian', 'Let us see how much of your collection you really know.']
  };
  var ART_BG = {};
  var byId = {}, byUnit = {}, uMeta = {};
  D.units.forEach(function (u) { uMeta[u.slug] = u; byUnit[u.slug] = []; });
  D.cards.forEach(function (c) { byId[c.id] = c; byUnit[c.u].push(c); });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function skinOf(xp) { return xp >= 8 ? 'holo' : xp >= 3 ? 'foil' : 'standard'; }
  var SKIN = { standard: 'Standard', foil: 'Foil', holo: 'Holographic' };
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(x) { return Math.max(0, Math.min(255, Math.round(x + (amt > 0 ? (255 - x) : x) * amt))); }
    return '#' + [f(r), f(g), f(b)].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }

  /* ---------- card art (drawn, no photos of real people) ---------- */
  function star(cx, cy, r1, r2, n) {
    var p = [];
    for (var i = 0; i < n * 2; i++) { var a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? r2 : r1; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); }
    return p.join(' ');
  }
  function art(c) {
    var col = uMeta[c.u].color, h = hash(c.id), id = 'g' + h;
    var dark = shade(col, -0.35), light = shade(col, 0.35);
    var s = '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="' + light + '"/><stop offset="1" stop-color="' + dark + '"/></radialGradient></defs>';
    s += '<rect width="100" height="100" fill="url(#' + id + ')"/>';
    for (var i = 0; i < 4; i++) { s += '<circle cx="' + (10 + (h >> (i * 3)) % 80) + '" cy="' + (8 + (h >> (i * 2 + 1)) % 84) + '" r="' + (14 + (h >> i) % 22) + '" fill="#fff" opacity=".06"/>'; }
    s += '<path d="M0 84 Q25 72 50 82 T100 78 V100 H0Z" fill="#000" opacity=".18"/>';
    var e = '#fffaf0';
    if (c.t === 'person') {
      s += '<g fill="' + e + '"><circle cx="50" cy="38" r="15"/><path d="M20 92c0-20 13-31 30-31s30 11 30 31z"/></g><path d="M40 62l10 12 10-12" fill="none" stroke="' + dark + '" stroke-width="3"/>';
    } else if (c.t === 'term') {
      s += '<g fill="' + e + '"><path d="M16 30Q33 22 50 31 67 22 84 30V74Q67 66 50 76 33 66 16 74Z"/></g><path d="M50 31V76" stroke="' + dark + '" stroke-width="2.5"/><g stroke="' + dark + '" stroke-width="2" opacity=".6"><path d="M24 42Q36 38 44 43M24 52Q36 48 44 53M56 43Q64 38 76 42M56 53Q64 48 76 52"/></g>';
    } else if (c.t === 'place') {
      s += '<path d="M0 90L28 52 44 74 62 44 100 90Z" fill="#000" opacity=".22"/><path d="M50 14c-14 0-24 10-24 23 0 17 24 44 24 44s24-27 24-44c0-13-10-23-24-23z" fill="' + e + '"/><circle cx="50" cy="37" r="9" fill="' + dark + '"/>';
    } else {
      s += '<polygon points="' + star(50, 48, 36, 18, 10) + '" fill="' + e + '"/><circle cx="50" cy="48" r="13" fill="' + dark + '" opacity=".85"/><circle cx="50" cy="48" r="6" fill="' + e + '"/>';
    }
    if (c.r === 'E' || c.r === 'L') {
      for (var k = 0; k < 6; k++) { s += '<polygon points="' + star(8 + (h >> k) % 84, 8 + (h >> (k + 2)) % 50, 3.2, 1, 4) + '" fill="#fff" opacity=".85"/>'; }
    }
    return s + '</svg>';
  }

  /* ---------- card markup ---------- */
  function gems(r) { var n = RAR[r].g, o = ''; for (var i = 0; i < 5; i++) o += i < n ? '◆' : '◇'; return o; }
  function cardHTML(c, o) {
    o = o || {};
    var cls = 'ecard' + (o.sm ? ' sm' : '') + (o.locked ? ' locked' : '') + (o.down ? '' : '');
    var skin = o.skin || 'standard';
    var xp = o.xp || 0, next = xp >= 8 ? 8 : xp >= 3 ? 8 : 3, prev = xp >= 8 ? 0 : xp >= 3 ? 3 : 0;
    var pct = xp >= 8 ? 100 : Math.round((xp - prev) / (next - prev) * 100);
    var label = c.n + ', ' + RAR[c.r].n + ' ' + TYPE[c.t].toLowerCase() + (skin !== 'standard' ? ', ' + SKIN[skin] + ' skin' : '');
    var h = '<div class="' + cls + '" data-id="' + c.id + '" data-r="' + c.r + '" data-skin="' + skin + '" role="button" tabindex="0" aria-label="' + esc(o.locked ? 'Locked card' : label) + '">';
    if (o.isNew) h += '<span class="newb">NEW!</span>';
    h += '<div class="in"><div class="face"><div class="nm">' + esc(c.n) + '</div><div class="art">' + art(c) + '</div>' +
         '<span class="tag">' + TYPE[c.t] + '</span>' + (skin !== 'standard' ? '<span class="skinb">' + SKIN[skin] + '</span>' : '') +
         '<div class="ft"><span>' + esc(c.y) + '</span><span class="gems" title="' + RAR[c.r].n + '">' + gems(c.r) + '</span></div></div>' +
         '<div class="back"><h4>' + esc(c.n) + '</h4><p>' + esc(c.c) + '</p><div class="xp" title="Mastery"><i style="width:' + pct + '%"></i></div><small>' + RAR[c.r].n + ' · ' + esc(uMeta[c.u].unit) + '</small></div></div>';
    if (o.down) h += '<div class="cover"><span>Emporium<br>Cards</span></div>';
    return h + '</div>';
  }

  /* ---------- state helpers ---------- */
  function xpOf(S, id) { return (S.owned[id] && S.owned[id].xp) || 0; }
  function ownedCount(S) { return Object.keys(S.owned).length; }

  /* ---------- pack rolling ---------- */
  function pickRarity(forceHigh) {
    var tot = 0, key, r;
    var W = forceHigh ? { R: 70, E: 25, L: 5 } : { C: 60, U: 25, R: 10, E: 4, L: 1 };
    for (key in W) tot += W[key];
    r = Math.random() * tot;
    for (key in W) { if ((r -= W[key]) < 0) return key; }
    return 'C';
  }
  function rollCard(S, rar) {
    var pool = D.cards.filter(function (c) { return c.r === rar; });
    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (S.owned[pick.id] && Math.random() < 0.5) pick = pool[Math.floor(Math.random() * pool.length)]; // gentle nudge away from duplicates
    return pick;
  }
  function openPack() {
    var S = EC.reload();
    if (S.packs < 1) return null;
    S.packs -= 1; S.stats.opened += 1;
    var out = [], hadHigh = false, forceHigh = S.pity >= 9;
    for (var i = 0; i < 3; i++) {
      var r = pickRarity(forceHigh && i === 2 && !hadHigh);
      if (r !== 'C' && r !== 'U') hadHigh = true;
      var c = rollCard(S, r);
      var o = S.owned[c.id], isNew = !o;
      if (isNew) S.owned[c.id] = { n: 1, xp: 0 }; else { o.n += 1; o.xp += 1; }
      out.push({ c: c, isNew: isNew, xp: S.owned[c.id].xp });
    }
    S.pity = hadHigh ? 0 : S.pity + 1;
    EC.save();
    return out;
  }

  /* ---------- UI ---------- */
  var root, tab = 'packs';
  function header() {
    var S = EC.reload(); EC.touchDay(); S = EC.reload();
    var total = D.cards.length;
    return '<div class="cx-hero"><div class="cx-stats">' +
      '<div class="cx-stat"><b id="cxPacks">' + S.packs + '</b><span>Packs to open</span></div>' +
      '<div class="cx-stat"><b>' + ownedCount(S) + ' / ' + total + '</b><span>Cards collected</span></div>' +
      '<div class="cx-stat"><b>' + S.streak + '</b><span>Day streak</span></div></div>' +
      '<div class="cx-note" style="max-width:420px">Earn packs by playing the games and winning Quiz Battles. Your collection is saved on this device only.</div></div>';
  }
  function tabs() {
    var T = [['packs', 'Open Packs'], ['album', 'Album'], ['battle', 'Quiz Battle']];
    return '<div class="cx-tabs" role="tablist">' + T.map(function (t) {
      return '<button role="tab" id="tab-' + t[0] + '" aria-selected="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  }
  function render() {
    root.innerHTML = '<div class="cx">' + header() + tabs() + '<div id="cxBody" role="tabpanel"></div></div>';
    root.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; render(); }; });
    ({ packs: viewPacks, album: viewAlbum, battle: viewBattle })[tab]($('#cxBody'));
  }
  function refreshStats() { var h = $('.cx-hero'); if (h) { var d = document.createElement('div'); d.innerHTML = header(); h.replaceWith(d.firstChild); } }

  function viewPacks(el) {
    var S = EC.reload();
    el.innerHTML = '<div class="cx-packs"><div id="cxStage"></div></div>' +
      '<p class="cx-note" style="text-align:center">Each pack has 3 cards. You are guaranteed a Rare or better at least every 10 packs.</p>';
    stage(S.packs);
  }
  function stage(n) {
    var st = $('#cxStage');
    st.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:16px"><div class="cx-pack"><b>3</b><small>CARDS</small><span style="font-size:15px">History<br>Emporium</span></div>' +
      '<button class="cx-btn" id="cxOpen"' + (n < 1 ? ' disabled' : '') + '>' + (n < 1 ? 'No packs yet' : 'Open a pack (' + n + ' left)') + '</button>' +
      (n < 1 ? '<p class="cx-sum">Play any game or win a Quiz Battle to earn more packs.</p>' : '') + '</div>';
    var b = $('#cxOpen'); if (b && n >= 1) b.onclick = reveal;
  }
  function reveal() {
    var res = openPack(); if (!res) return;
    var st = $('#cxStage'), flipped = 0;
    st.innerHTML = '<div class="cx-reveal" id="cxRev">' + res.map(function (x) {
      return cardHTML(x.c, { down: true, skin: skinOf(x.xp), xp: x.xp, isNew: x.isNew });
    }).join('') + '</div><p class="cx-sum" id="cxSum">Tap each card to reveal it.</p><div id="cxAct"><button class="cx-btn alt" id="cxAll">Reveal all</button></div>';
    var cards = st.querySelectorAll('.ecard');
    function done() {
      var nw = res.filter(function (x) { return x.isNew; }).length, du = 3 - nw;
      var best = res.reduce(function (a, x) { return 'CURLE'.indexOf(x.c.r) > 'CURLE'.indexOf(a) ? x.c.r : a; }, 'C');
      $('#cxSum').innerHTML = '<b>' + nw + ' new</b>' + (du ? ' · ' + du + ' duplicate' + (du > 1 ? 's' : '') + ' (+1 mastery each)' : '') + (best === 'L' ? '<br>🌟 A LEGENDARY card!' : best === 'E' ? '<br>✨ An Epic find!' : '');
      var left = EC.reload().packs;
      $('#cxAct').innerHTML = '<button class="cx-btn" id="cxNext"' + (left < 1 ? ' disabled' : '') + '>' + (left < 1 ? 'No more packs' : 'Open another (' + left + ' left)') + '</button>';
      var nx = $('#cxNext'); if (left >= 1) nx.onclick = reveal;
      refreshStats();
    }
    function rev(c) { if (c.classList.contains('rev')) return; c.classList.add('rev'); flipped++; if (flipped === 3) done(); }
    cards.forEach(function (c) { c.onclick = function () { rev(c); }; c.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rev(c); } }; });
    $('#cxAll').onclick = function () { cards.forEach(function (c, i) { setTimeout(function () { rev(c); }, i * 260); }); };
  }

  function viewAlbum(el) {
    var S = EC.reload(), h = '';
    D.units.forEach(function (u) {
      var cs = byUnit[u.slug], got = cs.filter(function (c) { return S.owned[c.id]; }).length;
      cs = cs.slice().sort(function (a, b) { return 'CURLE'.indexOf(a.r) - 'CURLE'.indexOf(b.r); });
      h += '<section class="cx-unit' + (got === cs.length ? ' done' : '') + '" style="--c:' + u.color + '"><h3>' + esc(u.title) + ' <span>' + esc(u.unit) + ' · ' + got + ' of ' + cs.length + '</span></h3>' +
        '<div class="cx-bar"><i style="width:' + Math.round(got / cs.length * 100) + '%"></i></div><div class="cx-row">' +
        cs.map(function (c) {
          var o = S.owned[c.id];
          return cardHTML(c, { sm: true, locked: !o, skin: o ? skinOf(o.xp) : 'standard', xp: o ? o.xp : 0 });
        }).join('') + '</div></section>';
    });
    h += '<p style="text-align:center;margin-top:30px"><button class="cx-btn alt" id="cxReset" style="font-size:14px;padding:8px 18px">Reset my collection</button></p>';
    el.innerHTML = h;
    el.querySelectorAll('.ecard').forEach(function (c) {
      function go() { if (!c.classList.contains('locked')) detail(c.dataset.id); }
      c.onclick = go; c.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
    $('#cxReset').onclick = function () {
      if (window.confirm('Erase your whole card collection on this device? This cannot be undone.')) { try { localStorage.removeItem(EC.KEY); } catch (e) {} EC.reload(); render(); }
    };
  }
  function detail(id) {
    var S = EC.reload(), c = byId[id], o = S.owned[id], xp = o.xp, sk = skinOf(xp);
    var m = document.createElement('div'); m.className = 'cx-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', c.n);
    var need = sk === 'holo' ? 'Maxed out: Holographic!' : sk === 'foil' ? (8 - xp) + ' more mastery for Holographic' : (3 - xp) + ' more mastery for Foil';
    m.innerHTML = '<div class="box">' + cardHTML(c, { skin: sk, xp: xp }) + '<p>Tap the card to flip it.<br>Owned: ' + o.n + ' · Mastery ' + xp + ' · ' + need + '</p><button class="cx-btn" id="cxClose">Close</button></div>';
    document.body.appendChild(m);
    var cd = m.querySelector('.ecard'); cd.onclick = function () { cd.classList.toggle('flip'); };
    function close() { m.remove(); document.removeEventListener('keydown', esc2); }
    function esc2(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc2);
    m.onclick = function (e) { if (e.target === m) close(); };
    $('#cxClose', m).onclick = close; $('#cxClose', m).focus();
  }

  /* ---------- quiz battle ---------- */
  function viewBattle(el) {
    var S = EC.reload(), left = Math.max(0, EC.caps.battle - (S.day === EC.today() ? S.battlePacks : 0));
    var h = '<p class="cx-note">Pick an era. Answer the clues to beat the rival before you run out of hearts. Wins can earn a pack (' + left + ' battle pack' + (left === 1 ? '' : 's') + ' left today), and every right answer on a card you own adds mastery toward Foil and Holographic skins.</p><div class="cx-pick">';
    D.units.forEach(function (u) {
      h += '<button data-u="' + u.slug + '" style="--c:' + u.color + '">' + esc(u.title) + '<small>' + esc(u.unit) + ' · ' + esc(u.years) + '</small></button>';
    });
    var oc = ownedCount(S);
    h += '<button data-u="mixed" style="--c:#7d2121"' + (oc < 6 ? ' disabled style="--c:#aaa;opacity:.6"' : '') + '>Mixed review<small>' + (oc < 6 ? 'Collect 6 cards to unlock' : 'Only cards you own, all eras') + '</small></button></div>';
    el.innerHTML = h;
    el.querySelectorAll('[data-u]').forEach(function (b) { b.onclick = function () { if (!b.disabled) battle(el, b.dataset.u); }; });
  }
  function battle(el, slug) {
    var S0 = EC.reload();
    var pool = slug === 'mixed' ? D.cards.filter(function (c) { return S0.owned[c.id]; }) : byUnit[slug];
    var Q = shuffle(pool).slice(0, 8), qi = 0, hp = 100, hearts = 3, streak = 0, miss = [], correct = 0, answered = 0;
    var foe = FOES[slug] || FOES.mixed;
    function opts(c) {
      var same = shuffle(pool.filter(function (x) { return x.id !== c.id && x.t === c.t; }));
      var rest = shuffle(pool.filter(function (x) { return x.id !== c.id && x.t !== c.t; }));
      var d = same.concat(rest).slice(0, 3);
      return shuffle(d.concat([c]));
    }
    function draw(fb) {
      if (hp <= 0 || hearts <= 0 || qi >= Q.length) return end();
      var c = Q[qi], o = opts(c);
      el.innerHTML = '<div class="cx-arena"><div class="cx-vs"><span class="cx-foe">' + esc(foe[0]) + '</span><div class="cx-hp" aria-label="Rival health"><i style="width:' + Math.max(0, hp) + '%"></i></div>' +
        '<span class="cx-hearts" aria-label="' + hearts + ' hearts left">' + '♥'.repeat(hearts) + '<span style="opacity:.25">' + '♥'.repeat(3 - hearts) + '</span></span></div>' +
        '<p class="cx-taunt">' + esc(fb || foe[1]) + '</p>' +
        '<div class="cx-q"><small>Round ' + (qi + 1) + ' · ' + TYPE[c.t] + '</small>' + esc(c.c) + '</div><div class="cx-ans">' +
        o.map(function (x) { return '<button data-id="' + x.id + '">' + esc(x.n) + '</button>'; }).join('') + '</div><p class="cx-fb" id="cxFb" aria-live="polite"></p></div>';
      el.querySelectorAll('.cx-ans button').forEach(function (b) {
        b.onclick = function () {
          el.querySelectorAll('.cx-ans button').forEach(function (x) { x.disabled = true; if (x.dataset.id === c.id) x.classList.add('ok'); });
          var ok = b.dataset.id === c.id; answered++;
          var S = EC.reload(); S.stats.answered += 1;
          if (ok) {
            correct++; streak++; var dmg = streak >= 3 ? 30 : 20; hp -= dmg; S.stats.correct += 1;
            if (S.owned[c.id]) S.owned[c.id].xp += 1;
            $('#cxFb').textContent = (streak >= 3 ? 'Critical hit! ' : 'Hit! ') + '-' + dmg + (S.owned[c.id] ? ' · +1 mastery' : '');
          } else {
            b.classList.add('no'); hearts--; streak = 0; miss.push(c);
            $('#cxFb').textContent = 'Not quite. The answer is ' + c.n + '.';
          }
          EC.save();
          setTimeout(function () { qi++; draw(ok ? 'Nice one!' : 'Try the next one.'); }, ok ? 900 : 1700);
        };
      });
    }
    function end() {
      var win = hp <= 0, S = EC.reload(), got = 0;
      EC.touchDay(); S = EC.reload();
      S.stats.battles += 1; if (win) S.stats.wins += 1;
      if (win && slug !== 'mixed' || (win && slug === 'mixed')) {
        if (S.battlePacks < EC.caps.battle) { S.battlePacks += 1; S.packs += 1; got = 1; }
      }
      EC.save();
      var h = '<div class="cx-arena cx-end"><h3>' + (win ? 'Victory!' : 'Defeated... this time') + '</h3><p>' + correct + ' of ' + answered + ' correct' +
        (win ? ' · you beat ' + esc(foe[0]) + '.' : '. Review these and try again.') + '</p>' +
        (got ? '<p><b>🃏 +1 card pack earned!</b></p>' : win ? '<p class="cx-note">You have reached today\'s battle pack limit, but your mastery still counted.</p>' : '') +
        (miss.length ? '<ul class="cx-miss"><b>To review:</b>' + miss.map(function (c) { return '<li><b>' + esc(c.n) + ':</b> ' + esc(c.c) + '</li>'; }).join('') + '</ul>' : '') +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="cx-btn" id="cxAgain">Play again</button><button class="cx-btn alt" id="cxPicks">Choose another era</button>' +
        (got ? '<button class="cx-btn alt" id="cxToPacks">Open my pack</button>' : '') + '</div></div>';
      el.innerHTML = h; refreshStats();
      $('#cxAgain').onclick = function () { battle(el, slug); };
      $('#cxPicks').onclick = function () { viewBattle(el); };
      var tp = $('#cxToPacks'); if (tp) tp.onclick = function () { tab = 'packs'; render(); };
    }
    draw();
  }

  window.EmporiumCardsUI = { init: function (el) { root = el; render(); } };
  var mount = document.getElementById('cardsApp');
  if (mount) window.EmporiumCardsUI.init(mount);
})();
