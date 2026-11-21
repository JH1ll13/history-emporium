/* Emporium cards: tiny shared core. Safe to include in any game.
   Usage in a game:  window.EmporiumCards && EmporiumCards.award('front-line');
   Everything is stored in this browser only (localStorage). No accounts, no network. */
(function () {
  'use strict';
  var KEY = 'emporium.cards.v1';
  var MAX_PER_GAME_PER_DAY = 3;   // packs a single game can give each day
  var MAX_BATTLE_PACKS_PER_DAY = 3;

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function dayNum(s) { var p = s.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function fresh() {
    return { v: 1, owned: {}, packs: 1, pity: 0, day: '', byGame: {}, battlePacks: 0,
             streak: 0, lastDay: '', bonusDay: '', stats: { opened: 0, battles: 0, wins: 0, correct: 0, answered: 0 } };
  }
  var mem = null;
  function load() {
    if (mem) return mem;
    try { var r = localStorage.getItem(KEY); mem = r ? JSON.parse(r) : null; } catch (e) { mem = null; }
    if (!mem || mem.v !== 1) mem = fresh();
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem || load())); } catch (e) {} }
  // Another tab (or the game iframe) may have changed storage; re-read before every change.
  function reload() { mem = null; return load(); }

  // Counts a visit day and handles the 3-day streak bonus pack. Returns true if a bonus pack was added.
  function touchDay(s) {
    var t = today(), bonus = false;
    if (s.day !== t) { s.day = t; s.byGame = {}; s.battlePacks = 0; }
    if (s.lastDay !== t) {
      s.streak = (s.lastDay && dayNum(t) - dayNum(s.lastDay) === 1) ? s.streak + 1 : 1;
      s.lastDay = t;
      if (s.streak % 3 === 0 && s.bonusDay !== t) { s.packs += 1; s.bonusDay = t; bonus = true; }
    }
    return bonus;
  }

  function toast(msg) {
    try {
      if (!document.body) return;
      var el = document.createElement('div');
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483000;max-width:290px;background:#2a1a12;color:#f6efdf;' +
        'border:2px solid #c9a24a;border-radius:14px;padding:11px 14px;font:700 15px/1.3 system-ui,sans-serif;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.45);transition:opacity .4s,transform .4s;opacity:0;transform:translateY(10px)';
      el.innerHTML = msg + ' <a href="/cards/" target="_top" style="color:#e8cf8a;white-space:nowrap">Open ▸</a>';
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; });
      setTimeout(function () { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 500); }, 5500);
    } catch (e) {}
  }

  window.EmporiumCards = {
    KEY: KEY,
    load: load, save: save, reload: reload, today: today,
    caps: { perGame: MAX_PER_GAME_PER_DAY, battle: MAX_BATTLE_PACKS_PER_DAY },
    touchDay: function () { var s = reload(); var b = touchDay(s); save(); return b; },
    // Call when a student finishes a round / wins / completes a level in a game.
    award: function (slug, opts) {
      opts = opts || {};
      var s = reload(), bonus = touchDay(s), got = 0;
      slug = slug || 'site';
      var used = s.byGame[slug] || 0;
      if (used < MAX_PER_GAME_PER_DAY) { s.byGame[slug] = used + 1; s.packs += 1; got = 1; }
      save();
      if (!opts.silent && (got || bonus)) {
        toast(bonus ? '🎉 3-day streak! Bonus card pack' + (got ? ' + 1 more' : '') + ' earned!' : '🃏 You earned a card pack!');
      }
      return got + (bonus ? 1 : 0);
    }
  };
})();
