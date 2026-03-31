/* ------------------------ Journal: entries + SFX ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    // editor
    date: $("date"),
    mood: $("mood"),
    title: $("title"),
    content: $("content"),
    moodChip: $("moodChip"),
    status: $("status"),

    // list/search/tags
    entryList: $("entryList"),
    count: $("count"),
    search: $("search"),
    tagRow: $("tagRow"),

    // buttons
    btnSave: $("btnSave"),
    btnDelete: $("btnDelete"),
    btnNew: $("btnNew"),
    btnExport: $("btnExport"),

    // clock
    clock: $("clock"),

    // sfx
    saveSfx: $("saveSfx"),
    deleteSfx: $("deleteSfx"),
    newEntrySfx: $("newEntrySfx"),
    exportSfx: $("exportSfx"),
  };

  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;
  let activeTag = null;

  function play(audioEl) {
    if (!audioEl) return;
    try {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    } catch {}
  }

  function nowDateValue() {
    // yyyy-mm-dd (works well in inputs)
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatClock() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function loadEntries() {
    try {
      entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(entries)) entries = [];
    } catch {
      entries = [];
    }
  }

  function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function getEditorData() {
    return {
      date: els.date?.value || nowDateValue(),
      mood: els.mood?.value || "Calm",
      title: (els.title?.value || "").trim(),
      content: els.content?.innerHTML || "",
    };
  }

  function setEditorData(e) {
    if (els.date) els.date.value = e?.date || nowDateValue();
    if (els.mood) els.mood.value = e?.mood || "Calm";
    if (els.title) els.title.value = e?.title || "";
    if (els.content) els.content.innerHTML = e?.content || "";
    updateMoodChip();
  }

  function updateMoodChip() {
    if (!els.moodChip || !els.mood) return;
    els.moodChip.textContent = `Mood: ${els.mood.value || "Calm"}`;
  }

  function makeId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function filteredEntries() {
    const q = (els.search?.value || "").trim().toLowerCase();
    return entries
      .filter((e) => (activeTag ? (e.tags || []).includes(activeTag) : true))
      .filter((e) => {
        if (!q) return true;
        const hay = `${e.title || ""} ${stripHtml(e.content || "")} ${(e.tags || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function renderList() {
    if (!els.entryList) return;

    const list = filteredEntries();
    els.entryList.innerHTML = "";

    for (const e of list) {
      const card = document.createElement("div");
      card.className = "entry-card";
      card.dataset.id = e.id;

      const h = document.createElement("h4");
      h.textContent = e.title?.trim() ? e.title : "(untitled)";

      const p = document.createElement("p");
      const preview = stripHtml(e.content || "").trim().slice(0, 80);
      p.textContent = `${e.date || ""} • ${(e.mood || "").trim()}${preview ? " • " + preview : ""}`;

      card.appendChild(h);
      card.appendChild(p);

      card.addEventListener("click", () => {
        activeId = e.id;
        setEditorData(e);
        if (els.status) els.status.textContent = "Loaded entry.";
      });

      els.entryList.appendChild(card);
    }

    if (els.count) els.count.textContent = `${list.length}`;
  }

  function newEntry() {
    activeId = null;
    setEditorData({ date: nowDateValue(), mood: "Calm", title: "", content: "" });
    if (els.status) els.status.textContent = "New entry.";
    play(els.newEntrySfx);
  }

  function saveEntry() {
    const data = getEditorData();
    const now = Date.now();

    const tags = []; // optional: you can add tag UI later

    if (!data.title && !stripHtml(data.content)) {
      if (els.status) els.status.textContent = "Nothing to save yet.";
      return;
    }

    if (!activeId) {
      activeId = makeId();
      entries.push({ id: activeId, createdAt: now, updatedAt: now, tags, ...data });
    } else {
      const idx = entries.findIndex((e) => e.id === activeId);
      if (idx === -1) {
        entries.push({ id: activeId, createdAt: now, updatedAt: now, tags, ...data });
      } else {
        entries[idx] = { ...entries[idx], ...data, tags: entries[idx].tags || tags, updatedAt: now };
      }
    }

    saveEntries();
    renderList();
    if (els.status) els.status.textContent = "Saved.";
    play(els.saveSfx);
  }

  function deleteEntry() {
    if (!activeId) {
      if (els.status) els.status.textContent = "No entry selected.";
      return;
    }
    entries = entries.filter((e) => e.id !== activeId);
    activeId = null;
    saveEntries();
    renderList();
    newEntry();
    play(els.deleteSfx);
  }

  function initTags() {
    if (!els.tagRow) return;
    els.tagRow.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tag]");
      if (!btn) return;

      const tag = btn.dataset.tag;
      activeTag = activeTag === tag ? null : tag;

      // simple visual state
      [...els.tagRow.querySelectorAll("button[data-tag]")].forEach((b) => {
        b.classList.toggle("active", b.dataset.tag === activeTag);
      });

      renderList();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // clock
    if (els.clock) {
      els.clock.textContent = formatClock();
      setInterval(() => (els.clock.textContent = formatClock()), 1000 * 20);
    }

    // date default
    if (els.date && !els.date.value) els.date.value = nowDateValue();

    // mood chip
    updateMoodChip();
    els.mood?.addEventListener("change", updateMoodChip);

    // load/render entries
    loadEntries();
    renderList();

    // wire buttons
    els.btnSave?.addEventListener("click", saveEntry);
    els.btnDelete?.addEventListener("click", deleteEntry);
    els.btnNew?.addEventListener("click", newEntry);

    // export: just sfx for now (you can add actual PDF export later)
    els.btnExport?.addEventListener("click", () => play(els.exportSfx));

    // search
    els.search?.addEventListener("input", renderList);

    // tags
    initTags();

    // start with a new entry if nothing selected
    if (!entries.length) newEntry();
  });
})();
