"""
DNU - Dylan's New York Updates
NYC news aggregator pulling the 5 most recent articles from the past 12 hours
across five local sources.
"""
from flask import Flask, jsonify, render_template
import feedparser
import requests
from datetime import datetime, timedelta, timezone
import concurrent.futures
import time
import os

app = Flask(__name__)

# Source list. RSS URL is what we actually fetch; site URL is shown to the user.
SOURCES = [
    {
        "id": "nyt",
        "name": "NYT — NY Region",
        "rss": "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
        "site": "https://www.nytimes.com/section/nyregion",
    },
    {
        "id": "thecity",
        "name": "THE CITY",
        "rss": "https://www.thecity.nyc/rss/",
        "site": "https://www.thecity.nyc",
    },
    {
        "id": "gothamist",
        "name": "Gothamist",
        "rss": "https://gothamist.com/feed",
        "site": "https://www.gothamist.com",
    },
    {
        "id": "nypost",
        "name": "NY Post — Metro",
        "rss": "https://nypost.com/metro/feed/",
        "site": "https://nypost.com/metro",
    },
    {
        "id": "nydn",
        "name": "NY Daily News — Crime",
        "rss": "https://www.nydailynews.com/news/crime-public-safety/feed/",
        "site": "https://www.nydailynews.com/news/crime-public-safety/",
    },
]

# Pretend to be a normal browser. Some outlets 403 unknown user agents.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    ),
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}


def _entry_timestamp(entry):
    """Return a tz-aware datetime for an entry, or None if we can't parse one."""
    for key in ("published_parsed", "updated_parsed"):
        struct = entry.get(key)
        if struct:
            try:
                return datetime.fromtimestamp(time.mktime(struct), tz=timezone.utc)
            except Exception:
                continue
    return None


def fetch_source(source):
    """Fetch one RSS feed, filter to last 12 hours, return up to 5 newest items."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=12)
    try:
        resp = requests.get(source["rss"], headers=HEADERS, timeout=15)
        resp.raise_for_status()
        feed = feedparser.parse(resp.content)
    except Exception as e:
        return {
            "id": source["id"],
            "name": source["name"],
            "site": source["site"],
            "items": [],
            "error": f"Fetch failed: {e}",
        }

    items = []
    for entry in feed.entries:
        published = _entry_timestamp(entry)
        if not published or published < cutoff:
            continue
        items.append(
            {
                "title": entry.get("title", "Untitled").strip(),
                "url": entry.get("link", "#"),
                "published": published.isoformat(),
            }
        )

    items.sort(key=lambda i: i["published"], reverse=True)
    return {
        "id": source["id"],
        "name": source["name"],
        "site": source["site"],
        "items": items[:5],
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/feeds")
def feeds():
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(SOURCES)) as pool:
        results = list(pool.map(fetch_source, SOURCES))
    return jsonify(
        {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "sources": results,
        }
    )


@app.route("/healthz")
def healthz():
    return {"ok": True}


if __name__ == "__main__":
    # Replit injects PORT in some configurations. Default to 8080.
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
