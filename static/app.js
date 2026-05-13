// DNU — Dylan's New York Updates client logic

const READ_KEY = "dnu.read.v1";

/** @returns {Set<string>} set of article URLs the user has marked read */
function loadRead() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function saveRead(set) {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
}

function relativeTime(iso) {
  const then = new Date(iso);
  const diffMs = Date.now() - then.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return then.toLocaleString();
}

let lastPayload = null;

async function fetchFeeds() {
  const container = document.getElementById("feed-container");
  container.innerHTML = '<div class="loading">Re-fetching all five sources&hellip;</div>';

  try {
    const resp = await fetch("/api/feeds", { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    lastPayload = data;
    renderFeeds(data);
  } catch (err) {
    container.innerHTML = `<div class="loading" style="color:var(--danger)">Couldn't load feeds: ${err.message}</div>`;
  }
}

function renderFeeds(data) {
  const container = document.getElementById("feed-container");
  const sourceTpl = document.getElementById("source-template");
  const articleTpl = document.getElementById("article-template");
  const read = loadRead();

  container.innerHTML = "";

  for (const source of data.sources) {
    const node = sourceTpl.content.cloneNode(true);
    node.querySelector(".source-name").textContent = source.name;
    const link = node.querySelector(".source-link");
    link.href = source.site;
    link.textContent = "visit ↗";

    const list = node.querySelector(".article-list");

    if (source.error) {
      const li = document.createElement("li");
      li.className = "source-error";
      li.textContent = source.error;
      list.appendChild(li);
    } else if (source.items.length === 0) {
      const li = document.createElement("li");
      li.className = "source-empty";
      li.textContent = "Nothing new in the last 12 hours.";
      list.appendChild(li);
    } else {
      for (const item of source.items) {
        const artNode = articleTpl.content.cloneNode(true);
        const title = artNode.querySelector(".article-title");
        title.href = item.url;
        title.textContent = item.title;

        const time = artNode.querySelector(".article-time");
        time.dateTime = item.published;
        time.textContent = relativeTime(item.published);

        const li = artNode.querySelector(".article");
        li.dataset.url = item.url;
        if (read.has(item.url)) li.classList.add("read");

        const btn = artNode.querySelector(".btn-read");
        btn.addEventListener("click", () => {
          const current = loadRead();
          current.add(item.url);
          saveRead(current);
          li.classList.add("read");
          updateUnreadCount();
        });

        list.appendChild(artNode);
      }
    }

    container.appendChild(node);
  }

  document.getElementById("last-updated").textContent =
    `Updated ${relativeTime(data.fetched_at)}`;
  updateUnreadCount();
}

function markAllAsRead() {
  if (!lastPayload) return;
  const read = loadRead();
  for (const source of lastPayload.sources) {
    for (const item of source.items) read.add(item.url);
  }
  saveRead(read);
  document.querySelectorAll(".article").forEach((el) => el.classList.add("read"));
  updateUnreadCount();
}

function updateUnreadCount() {
  if (!lastPayload) return;
  const read = loadRead();
  let total = 0, unread = 0;
  for (const source of lastPayload.sources) {
    for (const item of source.items) {
      total += 1;
      if (!read.has(item.url)) unread += 1;
    }
  }
  document.getElementById("unread-count").textContent =
    `${unread} unread / ${total} total`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refresh-btn").addEventListener("click", fetchFeeds);
  document.getElementById("mark-all-btn").addEventListener("click", markAllAsRead);
  fetchFeeds();
});
