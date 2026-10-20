/**
 * Upcoming Events loader.
 *
 * Events are managed by the site owner in a Google Sheet.
 * To connect the sheet:
 *   1. In Google Sheets: File > Share > Publish to web
 *   2. Choose the events tab and "Comma-separated values (.csv)", then Publish
 *   3. Paste the generated link below as SHEET_CSV_URL
 *
 * Expected column headers (row 1, any order, case-insensitive):
 *   Title | Date | Time | Location | Description | Image | Link | Link Text
 * Date should be written as YYYY-MM-DD (e.g. 2026-11-15) or MM/DD/YYYY.
 * Events whose date has passed are hidden automatically.
 */
const SHEET_CSV_URL = "";

(function () {
  const listEl = document.getElementById("events-list");
  const statusEl = document.getElementById("events-status");
  if (!listEl) return;

  // Minimal CSV parser supporting quoted fields, commas and newlines in quotes.
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else field += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(v => v.trim() !== ""));
  }

  function parseDate(value) {
    const v = (value || "").trim();
    let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  // Convert Google Drive share links into directly viewable image URLs.
  function imageUrl(url) {
    const u = (url || "").trim();
    const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
    return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : u;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function render(events) {
    listEl.innerHTML = "";
    if (!events.length) {
      statusEl.textContent = "There are no upcoming events at the moment. Please check back soon!";
      statusEl.hidden = false;
      return;
    }
    statusEl.hidden = true;

    events.forEach((ev, i) => {
      const card = el("article", "event-card fade-in-element visible");
      card.style.animationDelay = `${i * 80}ms`;

      const media = el("div", "event-media");
      if (ev.image) {
        const img = document.createElement("img");
        img.src = imageUrl(ev.image);
        img.alt = ev.title;
        img.loading = "lazy";
        img.onerror = () => img.remove();
        media.appendChild(img);
      }
      const badge = el("div", "event-date-badge");
      badge.appendChild(el("span", "event-month", ev.date.toLocaleString("en-US", { month: "short" })));
      badge.appendChild(el("span", "event-day", String(ev.date.getDate())));
      media.appendChild(badge);
      card.appendChild(media);

      const body = el("div", "event-body");
      body.appendChild(el("h3", "event-title", ev.title));
      const meta = el("ul", "event-meta");
      meta.appendChild(el("li", null, "📅 " + ev.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })));
      if (ev.time) meta.appendChild(el("li", null, "🕒 " + ev.time));
      if (ev.location) meta.appendChild(el("li", null, "📍 " + ev.location));
      body.appendChild(meta);
      if (ev.description) body.appendChild(el("p", "event-desc", ev.description));
      if (ev.link) {
        const a = el("a", "btn btn-primary event-btn", ev.linkText || "Register");
        a.href = ev.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        body.appendChild(a);
      }
      card.appendChild(body);
      listEl.appendChild(card);
    });
  }

  async function load() {
    if (!SHEET_CSV_URL) { render([]); return; }
    try {
      const res = await fetch(SHEET_CSV_URL + (SHEET_CSV_URL.includes("?") ? "&" : "?") + "t=" + Date.now());
      if (!res.ok) throw new Error(res.status);
      const rows = parseCSV(await res.text());
      const headers = rows.shift().map(h => h.trim().toLowerCase());
      const col = name => headers.indexOf(name);
      const get = (r, name) => (col(name) >= 0 ? (r[col(name)] || "").trim() : "");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const events = rows
        .map(r => ({
          title: get(r, "title"),
          date: parseDate(get(r, "date")),
          time: get(r, "time"),
          location: get(r, "location"),
          description: get(r, "description"),
          image: get(r, "image"),
          link: get(r, "link"),
          linkText: get(r, "link text"),
        }))
        .filter(e => e.title && e.date && e.date >= today)
        .sort((a, b) => a.date - b.date);

      render(events);
    } catch (err) {
      console.error("Failed to load events:", err);
      statusEl.textContent = "We couldn't load events right now. Please try again later.";
      statusEl.hidden = false;
      listEl.innerHTML = "";
    }
  }

  load();
})();
