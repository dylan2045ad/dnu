# DNU - Dylan's New York Updates

DNU is a focused NYC news dashboard that pulls fresh local headlines from major New York sources, filters them to the most recent 12-hour window, and presents them in a fast, readable interface.

The project is intentionally small and operational: a Flask backend collects RSS feeds in parallel, exposes a clean JSON endpoint, and serves a responsive front end with local read-state tracking.

## What It Does

- Aggregates recent NYC headlines from NYT, THE CITY, Gothamist, NY Post, and NY Daily News.
- Filters results to the latest 12 hours and limits each source to the five newest articles.
- Keeps source failures isolated so one broken feed does not take down the dashboard.
- Provides a browser-friendly `/api/feeds` endpoint for reuse in other tools.
- Stores read/unread state locally in the browser with no account system required.

## Stack

| Layer | Technology |
| --- | --- |
| Backend | Python, Flask |
| Data | RSS feeds via `feedparser` and `requests` |
| UI | HTML, CSS, vanilla JavaScript |
| Runtime | Replit-compatible Python app |

## Architecture

```text
RSS sources
    -> parallel fetch workers
    -> 12-hour freshness filter
    -> normalized article JSON
    -> Flask API + responsive dashboard
```

The backend keeps source configuration in `main.py`, fetches each feed with browser-like headers, normalizes article titles and URLs, and returns a single timestamped payload for the front end.

## API

```http
GET /api/feeds
```

Example response shape:

```json
{
  "fetched_at": "2026-06-01T00:00:00+00:00",
  "sources": [
    {
      "id": "gothamist",
      "name": "Gothamist",
      "site": "https://www.gothamist.com",
      "items": [
        {
          "title": "Example headline",
          "url": "https://example.com/story",
          "published": "2026-06-01T00:00:00+00:00"
        }
      ]
    }
  ]
}
```

## Run Locally

```bash
pip install -r requirements.txt
python main.py
```

Open `http://localhost:8080`.

Health check:

```bash
curl http://localhost:8080/healthz
```

## Run on Replit

1. Create a new Repl and import this repository from GitHub.
2. Use the Python template if prompted.
3. Click **Run**. The app listens on port `8080`; Replit maps it to the public URL.
4. Deploy from Replit when you want a persistent public endpoint.

## Repository Map

| Path | Purpose |
| --- | --- |
| `main.py` | Flask app, RSS fetching, `/api/feeds`, `/healthz` |
| `templates/index.html` | Dashboard markup and article templates |
| `static/style.css` | Responsive blue circuit-board visual system |
| `static/app.js` | Fetching, rendering, refresh, local read state |
| `requirements.txt` | Python dependencies |
| `.replit`, `replit.nix` | Replit runtime configuration |

## Roadmap

- Add source freshness badges and per-source latency.
- Add deploy screenshots for the README.
- Add configurable source groups for borough, politics, transit, and culture feeds.
- Add basic tests around feed normalization and cutoff filtering.

## Notes

- Read state is stored per browser with `localStorage`.
- Feeds that return no recent items display an empty-source state.
- Feed errors are returned per source so the rest of the dashboard stays useful.
