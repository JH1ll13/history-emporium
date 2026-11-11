# Mr. Teacher's History Emporium

Free world history games for middle school. Plain static files, no build tools required.

## Layout
- `index.html`: homepage (generated)
- `games/<slug>/play.html`: the game itself
- `games/<slug>/index.html`: the game's page with the top bar and info (generated)
- `assets/`: shared styles, self-hosted fonts, thumbnails, vendored libraries
- `games.json`: the list of games, in unit order
- `_headers`: security and caching headers for Cloudflare Pages

## Add a game
1. Put the game in `games/<slug>/` and name its main page `play.html`.
2. Add an 800x500 thumbnail at `assets/thumbs/<slug>.webp`.
3. Add an entry to `games.json`.
4. Run `python3 build.py`, then commit and push. Cloudflare redeploys automatically.

## Rules for staying filter-friendly
- Load nothing from other sites (fonts, scripts, images all live in `assets/`).
- No "unblocked" wording anywhere.
- Keep the About, For Teachers and Privacy pages.

## Deploy
Cloudflare Pages → Connect to Git → this repo. Build command: none. Output directory: `/`.
