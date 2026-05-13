# DNU — Dylan's New York Updates

NYC news aggregator. Pulls the 5 most recent articles from the last 12 hours across:

- NYT — NY Region
- THE CITY
- Gothamist
- NY Post — Metro
- NY Daily News — Crime

UI: blue circuit-board theme, mark-as-read per headline, "mark all as read" + "refresh all sources" buttons at the top.

## Run on Replit

1. Create a new Repl → **Import from GitHub** (if you push this) or **Upload folder**.
2. Pick the **Python** template if asked. Replit will read `.replit` and install from `requirements.txt`.
3. Click **Run**. The app listens on port 8080; Replit maps it to your public URL.
4. Click **Deploy** for a persistent URL.

## Run locally

```bash
pip install -r requirements.txt
python main.py
# open http://localhost:8080
```

## Files

- `main.py` — Flask app, parallel RSS fetch, /api/feeds JSON endpoint
- `templates/index.html` — markup with `<template>` elements for sources/articles
- `static/style.css` — circuit-board theme (pure CSS, no images)
- `static/app.js` — fetch, render, mark-as-read (localStorage)
- `.replit`, `replit.nix` — Replit run + deploy config
- `requirements.txt` — Flask, feedparser, requests

## Notes

- "Read" state is per-browser (localStorage). Same URL across sessions stays marked.
- If a source has 0 items in the last 12 hours you'll see "Nothing new..." for that card.
- If an RSS URL ever changes (NY Daily News and THE CITY have moved their feeds before), the card shows a fetch-failed message and the others keep working.
