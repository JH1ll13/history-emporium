#!/usr/bin/env python3
"""Builds the Emporium's pages from games.json.

To add a game:
  1. Put its files in games/<slug>/ with the game's main page named play.html
  2. Add a 800x500 thumbnail at assets/thumbs/<slug>.webp
  3. Add an entry to games.json
  4. Run:  python3 build.py
"""
import json, html, os

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE_NAME = "Mr. Teacher's History Emporium"
SITE_URL = "https://mthe.net"
YEAR = "2026"

games = json.load(open(os.path.join(ROOT, "games.json"), encoding="utf-8"))
e = html.escape

MARK = """<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="15" width="30" height="21" rx="2" fill="#f6efdf"/>
<path d="M3 15 L8 5 H32 L37 15 Z" fill="#7d2121"/><path d="M8 5 L11 15 M14 5 L15.5 15 M20 5 V15 M26 5 L24.5 15 M32 5 L29 15" stroke="#f6efdf" stroke-width="2.4"/>
<rect x="16" y="22" width="8" height="14" fill="#c9a24a"/><rect x="8" y="20" width="6" height="6" fill="#c9a24a"/><rect x="26" y="20" width="6" height="6" fill="#c9a24a"/></svg>"""

def head(title, desc, path, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{SITE_URL}{path}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#2a1a12">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/site.css">
{extra}</head>
"""

def nav(active=""):
    items = [("/", "Games"), ("/teachers/", "For Teachers"), ("/shop/", "Teacher Shop"), ("/about/", "About")]
    links = "".join(f'<a href="{h}"{" aria-current=page" if h == active else ""}>{t}</a>' for h, t in items)
    return f"""<nav class="topnav wrap" aria-label="Main">
  <a class="brand" href="/">{MARK}<span>History Emporium</span></a>
  <div class="links">{links}</div>
</nav>"""

FOOT = f"""<footer><div class="wrap">
  <div>© {YEAR} {SITE_NAME}. Free history games for the classroom.</div>
  <div><a href="/teachers/">For Teachers</a><a href="/shop/">Teacher Shop</a><a href="/about/">About</a><a href="/privacy/">Privacy</a></div>
</div></footer>
</body></html>
"""

def card(i, g, small=False):
    return f"""<a class="card" href="/games/{g['slug']}/" style="--c:{g['color']}">
  <div class="thumb" style="background-image:url(/assets/thumbs/{g['slug']}.webp)">{'' if small else f'<span class="num">{e(g["years"])}</span>'}{'<span class="tbadge">▶ Video</span>' if g.get('trailer') else ''}</div>
  <div class="body">
    <div class="unit">{e(g['unit'])}</div>
    <h3>{e(g['title'])}</h3>
    <p>{e(g['blurb'])}</p>
    {'' if small else '<span class="play">Play ▸</span>'}
  </div>
</a>"""

def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)

# ---------- home ----------
cards = "\n".join(card(i, g) for i, g in enumerate(games))
home_desc = "Free world history games for middle school: the Renaissance, Exploration, the Enlightenment, the French Revolution, the Industrial Revolution, Imperialism, World War I and World War II."
ld = json.dumps({"@context": "https://schema.org", "@type": "WebSite", "name": SITE_NAME, "url": SITE_URL + "/",
                 "description": home_desc, "audience": {"@type": "EducationalAudience", "educationalRole": "student"}})
write("index.html", head(f"{SITE_NAME} — Free History Games", home_desc, "/",
      f'<script type="application/ld+json">{ld}</script>\n') + f"""<body>
<header class="shop">
{nav("/")}
  <div class="sign wrap">
    <div class="est">Est. {YEAR} · World History · Grades 6–8</div>
    <h1><small>Mr. Teacher's</small>History Emporium</h1>
    <p>Five hundred years of world history, one game at a time. Pick an era and start playing.</p>
  </div>
</header>
<main class="wrap">
  <div class="shelf-head">
    <h2>The Games</h2>
    <p>In order, from the Renaissance to World War II · free, no sign-up</p>
  </div>
  <div class="grid">
{cards}
  </div>
  <div class="note">
    <p><strong>Teachers:</strong> every game follows the 7th grade world history sequence and works on school Chromebooks.</p>
    <a class="btn" href="/teachers/">Teacher guide</a>
  </div>
</main>
{FOOT}""")

# ---------- one page per game ----------
for i, g in enumerate(games):
    others = [x for x in games if x["slug"] != g["slug"]]
    nxt = games[(i + 1) % len(games)]
    more = "\n".join(card(0, x, small=True) for x in others[:4] if True)
    desc = f"Play {g['title']}, a free {g['unit']} history game. {g['blurb']}"
    write(f"games/{g['slug']}/index.html", head(f"{g['title']} — {g['unit']} Game | History Emporium", desc, f"/games/{g['slug']}/") + f"""<body class="player-body">
<div class="bar">
  <a class="brand" href="/" title="Back to all games">{MARK}<span class="brand-text">History Emporium</span></a>
  <div class="title">{e(g['title'])}<span>{e(g['unit'])} · {e(g['years'])}</span></div>
  {'<button type="button" id="tr" data-trailer="/games/'+g['slug']+'/'+g['trailer']+'" data-game="/games/'+g['slug']+'/play.html">▶ Watch video</button>' if g.get('trailer') else ''}
  <button type="button" id="fs">⛶ Full screen</button>
  <a class="ghost" href="/games/{nxt['slug']}/" title="Next game: {e(nxt['title'])}">Next ▸</a>
</div>
<div class="stage" id="stage">
  <iframe id="game" src="/games/{g['slug']}/play.html" title="{e(g['title'])}" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe>
</div>
<section class="about-game"><div class="wrap">
  <div class="cols">
    <div>
      <h2>{e(g['title'])}</h2>
      <p>{e(g['blurb'])}</p>
      {'<p><a class="btn" id="tl" href="#trailer">▶ Watch the video</a></p>' if g.get('trailer') else ''}
      <div class="panel"><h3>What students learn</h3><p style="margin:0">{e(g['learn'])}</p></div>
    </div>
    <div class="panel"><h3>How to play</h3><p style="margin:0">{e(g['controls'])}</p>
      <h3 style="margin-top:14px">Era</h3><p style="margin:0">{e(g['unit'])}, {e(g['years'])}</p></div>
  </div>
  <div class="more"><div class="shelf-head"><h2 style="font-size:20px">More from the Emporium</h2><a href="/">All games ▸</a></div>
    <div class="grid">{more}</div></div>
</div></section>
<script>
const f=document.getElementById('game');
f.addEventListener('load',()=>{{try{{f.contentWindow.focus()}}catch(e){{}}}});
const tr=document.getElementById('tr');
if(tr){{const show=t=>{{f.src=t?tr.dataset.trailer:tr.dataset.game;tr.textContent=t?'🎮 Play game':'▶ Watch video';tr.dataset.on=t?'1':'';}};
  tr.addEventListener('click',()=>{{show(!tr.dataset.on);window.scrollTo(0,0)}});
  const tl=document.getElementById('tl');if(tl)tl.addEventListener('click',ev=>{{ev.preventDefault();show(true);window.scrollTo(0,0)}});
  if(location.hash==='#trailer')show(true);}}
document.getElementById('fs').addEventListener('click',()=>{{
  const s=document.getElementById('stage');
  const r=s.requestFullscreen||s.webkitRequestFullscreen; if(r) r.call(s); f.focus();
}});
</script>
{FOOT}""")

# ---------- teachers ----------
rows = "".join(f"<li><a href=\"/games/{g['slug']}/\"><strong>{e(g['title'])}</strong></a> — {e(g['unit'])} ({e(g['years'])}). {e(g['learn'])}</li>" for g in games)
write("teachers/index.html", head(f"For Teachers | {SITE_NAME}", "How to use History Emporium games in a middle school world history classroom.", "/teachers/") + f"""<body>
<header class="shop">{nav("/teachers/")}<div class="sign wrap" style="padding-top:14px;padding-bottom:40px"><h1 style="font-size:clamp(30px,5vw,52px)">For Teachers</h1></div></header>
<main class="wrap"><div class="prose">
<h2>Built by a classroom teacher</h2>
<p>Every game here was made by a 7th grade world history teacher to give students lots of quick, low-stakes retrieval practice on the key terms, people and places of each unit, wrapped in gameplay they actually want to keep playing.</p>
<h3>The games, in unit order</h3>
<ul>{rows}</ul>
<h3>Classroom notes</h3>
<ul>
<li>No accounts or sign-ups. Students click a game and play.</li>
<li>Progress saves in the student's own browser. It stays on that device and is never sent to us.</li>
<li>Games run on Chromebooks, laptops and most tablets. Headphones help: several games have music and sound.</li>
<li>History Hero's class mode lets students join one game with a class code. It connects devices directly to each other, so a few school networks may block it. Solo play always works.</li>
</ul>
<h3>Getting the site approved on your network</h3>
<p>If your school filter blocks the site, ask your technology department to allow this domain. It is an educational site with no chat, no user uploads and no outside links.</p>
<h3>Lesson and practice decks</h3><p>Matching Google Slides lesson decks and student practice decks are in the <a href="/shop/">Teacher Shop</a>.</p>\n<p><em>Teacher accounts with class dashboards are on the way.</em></p>
</div></main>
{FOOT}""")

# ---------- about ----------
write("about/index.html", head(f"About | {SITE_NAME}", "About Mr. Teacher's History Emporium, a free collection of world history games.", "/about/") + f"""<body>
<header class="shop">{nav("/about/")}<div class="sign wrap" style="padding-top:14px;padding-bottom:40px"><h1 style="font-size:clamp(30px,5vw,52px)">About the Emporium</h1></div></header>
<main class="wrap"><div class="prose">
<h2>Learning history should feel like play</h2>
<p>Mr. Teacher's History Emporium is a free collection of world history games for middle school students. It covers the last five hundred years, from the Renaissance to World War II, with a final challenge, History Hero, that brings the whole year together.</p>
<p>Each game is built around the research on how memory works: short, frequent questions spaced out over time, mixed together and tied to the story of each era. The goal is simple: students who remember the basics automatically have room to think about the big questions.</p>
<h3>Safe for school</h3>
<ul><li>No chat, no user uploads and no links to outside sites.</li><li>No accounts and no personal information collected.</li><li>Everything loads from this site.</li></ul>
</div></main>
{FOOT}""")

# ---------- privacy ----------
write("privacy/index.html", head(f"Privacy | {SITE_NAME}", "Privacy policy for Mr. Teacher's History Emporium.", "/privacy/") + f"""<body>
<header class="shop">{nav()}<div class="sign wrap" style="padding-top:14px;padding-bottom:40px"><h1 style="font-size:clamp(30px,5vw,52px)">Privacy</h1></div></header>
<main class="wrap"><div class="prose">
<h2>Privacy policy</h2>
<p><em>Last updated November {YEAR}.</em></p>
<p>This site is made for students, including children under 13. We do not ask for, collect or store personal information.</p>
<ul>
<li><strong>No accounts.</strong> Students do not sign up or log in.</li>
<li><strong>Game progress</strong> and any name a student types into a game are saved only in that student's own browser (local storage). That data never leaves the device, and clearing the browser deletes it.</li>
<li><strong>Visitor statistics.</strong> We may count page visits with Cloudflare Web Analytics, which does not use cookies and does not track individual visitors.</li>
<li><strong>Class mode in History Hero.</strong> When students choose to join a class game, their devices connect directly to each other using a connection service (PeerJS). Only the game moves and the nickname a student chooses are exchanged.</li>
<li><strong>Teacher Shop purchases</strong> are processed by Payhip on its own site. We never see or store card details. Payhip's privacy policy covers that checkout.</li>\n<li><strong>No advertising</strong> is shown on this site at this time. If that changes, this policy will be updated first.</li>
</ul>
<p>Questions? Contact the site owner.</p>
</div></main>
{FOOT}""")

# ---------- 404 ----------
write("404.html", head(f"Page not found | {SITE_NAME}", "Page not found.", "/404") + f"""<body>
<header class="shop">{nav()}<div class="sign wrap"><h1 style="font-size:clamp(30px,5vw,52px)">Lost in history</h1><p>That page isn't on our shelves. Head back to the games.</p></div></header>
<main class="wrap" style="text-align:center"><a class="btn" href="/">Back to all games</a></main>
{FOOT}""")


# ---------- teacher shop ----------
shopdata = json.load(open(os.path.join(ROOT, "shop.json"), encoding="utf-8"))
def buy(item):
    label = f"{e(item['kind'])} · {e(item['price'])}"
    tm = f'<span class="tm">{e(item["time"])}</span>' if item.get("time") else ""
    left = f'<span class="bl"><b>{label}</b>{tm}</span>'
    if item.get("url"):
        note = f"<small>{e(item['note'])}</small>" if item.get("note") else ""
        return f'<a class="buy{" best" if item.get("note") else ""}" href="{e(item["url"])}" rel="noopener">{left}{note}</a>'
    return f'<span class="buy soon">{left}<small>Coming soon</small></span>'
units_html = "".join(f"""<article class="sunit" style="--c:{next((g['color'] for g in games if g['slug']==u['game']), '#555')}">
  <div class="thumb" style="background-image:url(/assets/thumbs/{u['game']}.webp)"></div>
  <div class="body"><div class="unit">{e(u['unit'])}</div><h3>{e(u['title'])}</h3><p>{e(u['blurb'])}</p>
  <div class="buys">{''.join(buy(i) for i in u['items'])}</div>
  <a class="tiny" href="/games/{u['game']}/">Play the matching game ▸</a></div>
</article>""" for u in shopdata["units"])
fy = shopdata["fullYear"]
write("shop/index.html", head(f"Teacher Shop | {SITE_NAME}", "Middle school world history lesson decks and practice decks in Google Slides, made by a classroom teacher to match the History Emporium games.", "/shop/") + f"""<body>
<header class="shop">{nav("/shop/")}<div class="sign wrap" style="padding-top:14px;padding-bottom:40px"><h1 style="font-size:clamp(30px,5vw,52px)">Teacher Shop</h1><p>Lesson and practice decks in Google Slides that match each game. Made by a 7th grade world history teacher.</p></div></header>
<main class="wrap">
  <div class="fullyear">
    <div><div class="unit" style="color:var(--brass-lt)">Best value</div><h2>{e(fy['title'])}</h2><p>{e(fy['blurb'])}</p><p style="margin-top:6px;color:var(--brass-lt)">{e(fy.get('time',''))}</p></div>
    {buy({'kind': 'Get the bundle', 'price': fy['price'], 'url': fy['url']})}
  </div>
  <div class="shelf-head" style="margin-top:34px"><h2>Units</h2><p>Practice decks are student-ready: every activity has a space for students to type their answers.</p></div>
  <div class="sgrid">{units_html}</div>
  <div class="note"><p>Purchases are handled securely by Payhip. You'll get your files by email right away. Class-period estimates assume 50-minute classes, moderate use of each deck, and teachers mixing in their own material.</p></div>
</main>
{FOOT}""")

# ---------- sitemap / robots ----------
urls = ["/", "/teachers/", "/shop/", "/about/", "/privacy/"] + [f"/games/{g['slug']}/" for g in games]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "".join(f"  <url><loc>{SITE_URL}{u}</loc></url>\n" for u in urls) + "</urlset>\n")
write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n")
print(f"Built {len(games)} game pages + home, teachers, about, privacy, 404, sitemap.")
