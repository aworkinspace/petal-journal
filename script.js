// --- Minimal local journaling app (localStorage) ---
const $ = (id) => document.getElementById(id);

const els = {
  search: $("search"),
  date: $("date"),
  mood: $("mood"),
  title: $("title"),
  content: $("content"), // contenteditable div
  moodChip: $("moodChip"),
  entryList: $("entryList"),
  count: $("count"),
  toast: $("toast"),
  status: $("status"),
  promptCard: $("promptCard"),
  tagRow: $("tagRow"),
  btnSave: $("btnSave"),
  btnDelete: $("btnDelete"),
  btnNew: $("btnNew"),
  btnExport: $("btnExport"),
  btnPrompt: $("btnPrompt"),
};

// --- Theme / palette switcher ---
(() => {
  const select = document.getElementById("themeSelect");
  const betaChip = document.getElementById("betaChip");
  if (!select) return;

  const betaThemes = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt"]);

  const themes = {
    petal: {
      "--pink-500": "#FFA5D6",
      "--pink-200": "#FFD6EE",
      "--rose-50": "#FFF0F1",
      "--mauve-200": "#ECD2E0",
      "--periwinkle-200": "#CED1F8",
      "--periwinkle-400": "#A7ABDE",
      "--text": "#2B2B33",
      "--text-muted": "#5A5A6A",
    },
    lavender: {
      "--pink-500": "#FFB6E1",
      "--pink-200": "#F5D9FF",
      "--rose-50": "#FFF7FB",
      "--mauve-200": "#E8D7EF",
      "--periwinkle-200": "#D7DEFF",
      "--periwinkle-400": "#9AA6FF",
      "--text": "#2B2B33",
      "--text-muted": "#5A5A6A",
    },

    // Early access (beta)
    midnight: {
      "--pink-500": "#FFA5D6",
      "--pink-200": "#2A2233",
      "--rose-50": "#14121A",
      "--mauve-200": "#3A3247",
      "--periwinkle-200": "#2E2A45",
      "--periwinkle-400": "#A7ABDE",
      "--text": "#F2F0F7",
      "--text-muted": "#C9C5D6",
    },
    strawberry_matcha: {
      "--pink-500": "#FF9FC6",
      "--pink-200": "#FFD6EA",
      "--rose-50": "#FFF5F9",
      "--mauve-200": "#DDF2E2",
      "--periwinkle-200": "#BFE5C9",
      "--periwinkle-400": "#7FCF9A",
      "--text": "#2B2B33",
      "--text-muted": "#5A5A6A",
    },
    blueberry_yogurt: {
      "--pink-500": "#AEB7FF",
      "--pink-200": "#DFE2FF",
      "--rose-50": "#FFF7FB",
      "--mauve-200": "#F2D6E8",
      "--periwinkle-200": "#E6C0DB",
      "--periwinkle-400": "#B58AB7",
      "--text": "#2B2B33",
      "--text-muted": "#5A5A6A",
    },
  };

  function applyTheme(name) {
    const t = themes[name] || themes.petal;
    Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    localStorage.setItem("petal_theme", name);
    if (betaChip) betaChip.style.display = betaThemes.has(name) ? "inline-flex" : "none";
  }

  const earlyAccess = localStorage.getItem("petal_early_access") === "1";

  if (!earlyAccess) {
    [...select.options].forEach((opt) => {
      if (betaThemes.has(opt.value)) opt.disabled = true;
    });

    const saved = localStorage.getItem("petal_theme");
    if (betaThemes.has(saved)) localStorage.setItem("petal_theme", "petal");
  }

  select.addEventListener("change", () => applyTheme(select.value));

  const saved = localStorage.getItem("petal_theme") || "petal";
  select.value = saved;
  applyTheme(saved);
})();

// --- Notebook skins ---
(() => {
  const notebook = document.getElementById("notebook");
  const select = document.getElementById("skinSelect");
  if (!notebook || !select) return;

  const skins = ["ruled", "grid", "dots", "dark"];

  function applySkin(name) {
    skins.forEach((s) => notebook.classList.remove(`skin-${s}`));
    notebook.classList.add(`skin-${name}`);
    localStorage.setItem("petal_skin", name);
  }

  select.addEventListener("change", () => applySkin(select.value));

  const saved = localStorage.getItem("petal_skin") || "ruled";
  select.value = saved;
  applySkin(saved);
})();

const STORAGE_KEY = "petal_journal_entries_v1";
let selectedId = null;
let activeTag = null;

const prompts = [
  "What’s one small win you had today?",
  "What felt heavy today—and what helped, even a little?",
  "Name one thing you can let go of tonight.",
  "What are you grateful for right now?",
  "If today had a theme song, what would it be?",
  "What do you want to remember about today?",
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function toast(msg) {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.style.display = "block";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (els.toast.style.display = "none"), 1300);
}

function fmtDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function htmlToText(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || "").replace(/\s+/g, " ").trim();
}

function setEditor(entry) {
  selectedId = entry?.id ?? null;
  if (els.date) els.date.value = entry?.date ?? todayISO();
  if (els.mood) els.mood.value = entry?.mood ?? "Calm";
  if (els.title) els.title.value = entry?.title ?? "";
  if (els.content) els.content.innerHTML = entry?.content ?? "";
  syncMoodChip();
}

function syncMoodChip() {
  if (!els.mood || !els.moodChip) return;
  const label = els.mood.options[els.mood.selectedIndex]?.text ?? els.mood.value;
  els.moodChip.textContent = `Mood: ${label}`;
}

// --- SFX helpers ---
function playSfx(id) {
  const sfx = document.getElementById(id);
  if (!sfx) return;
  sfx.pause();
  sfx.currentTime = 0;
  const p = sfx.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}
const playDeleteSfx = () => playSfx("deleteSfx");
const playSaveSfx = () => playSfx("saveSfx");
const playNewEntrySfx = () => playSfx("newEntrySfx");
const playExportSfx = () => playSfx("exportSfx");

// --- Sticker toolbar (GIFs) ---
function insertSticker(url) {
  if (!els.content) return;
  els.content.focus();

  const img = document.createElement("img");
  img.src = url;
  img.alt = "sticker";
  img.className = "sticker";

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    els.content.appendChild(img);
    return;
  }

  const range = sel.getRangeAt(0);

  if (!els.content.contains(range.commonAncestorContainer)) {
    els.content.appendChild(img);
    return;
  }

  range.deleteContents();
  range.insertNode(img);

  range.setStartAfter(img);
  range.setEndAfter(img);
  sel.removeAllRanges();
  sel.addRange(range);
}

document.getElementById("stickerBar")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-sticker]");
  if (!btn) return;
  insertSticker(btn.getAttribute("data-sticker"));
});

// --- Early access: add image from desktop (HIDDEN unless early access) ---
(() => {
  const btn = document.getElementById("btnAddImage");
  const picker = document.getElementById("imgPicker");
  if (!btn || !picker) return;

  const hasEarlyAccess = () => localStorage.getItem("petal_early_access") === "1";

  // Hide completely if not early access
  if (!hasEarlyAccess()) {
    btn.style.display = "none";
    picker.remove();
    return;
  }

  function insertNodeAtCaret(node) {
    els.content?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !els.content) return els.content?.appendChild(node);
    const range = sel.getRangeAt(0);
    if (!els.content.contains(range.commonAncestorContainer)) return els.content.appendChild(node);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  async function fileToCompressedDataURL(file, maxW = 900, quality = 0.82) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });

    const scale = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);

    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/jpeg", quality);
  }

  btn.addEventListener("click", () => picker.click());

  picker.addEventListener("change", async () => {
    const file = picker.files?.[0];
    picker.value = "";
    if (!file) return;

    try {
      const dataUrl = await fileToCompressedDataURL(file);
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = "user image";
      img.className = "sticker";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      insertNodeAtCaret(img);
    } catch {
      toast("Could not add image");
    }
  });
})();

// --- FNAF cosmetics ---
function toggleAmbient() {
  const a = document.getElementById("ambientSfx");
  const btn = document.getElementById("btnAmbient");
  if (!a || !btn) return;

  if (a.paused) {
    a.volume = 0.25;
    a.play().catch(() => {});
    btn.textContent = "Ambient: On";
    localStorage.setItem("petal_ambient_on", "1");
  } else {
    a.pause();
    btn.textContent = "Ambient: Off";
    localStorage.setItem("petal_ambient_on", "0");
  }
}
function playJumpscare() {
  playSfx("jumpscareSfx");
}
function playToreador() {
  playSfx("toreadorSfx");
}

function upsertCurrent() {
  const entries = load();
  const data = {
    id: selectedId || uid(),
    date: els.date?.value || todayISO(),
    mood: els.mood?.value || "Calm",
    title: els.title?.value?.trim() || "Untitled",
    content: els.content?.innerHTML || "",
    tags: activeTag ? [activeTag] : [],
    updatedAt: new Date().toISOString(),
    createdAt: null,
  };

  const idx = entries.findIndex((e) => e.id === data.id);
  if (idx >= 0) {
    data.createdAt = entries[idx].createdAt || data.updatedAt;
    entries[idx] = { ...entries[idx], ...data };
  } else {
    data.createdAt = data.updatedAt;
    entries.unshift(data);
  }

  saveAll(entries);
  selectedId = data.id;
  renderList();
  playSaveSfx();
  toast("Saved");
}

function deleteCurrent() {
  if (!selectedId) return toast("Nothing selected");

  const entries = load().filter((e) => e.id !== selectedId);
  saveAll(entries);
  setEditor(null);
  renderList();

  playDeleteSfx();
  toast("Deleted");
}

function filtered(entries) {
  const q = (els.search?.value || "").trim().toLowerCase();
  return entries.filter((e) => {
    const plain = htmlToText(e.content);
    const hay = `${e.title}\n${plain}\n${(e.tags || []).join(" ")}`.toLowerCase();
    const okQ = !q || hay.includes(q);
    const okTag = !activeTag || (e.tags || []).includes(activeTag);
    return okQ && okTag;
  });
}

function snippet(html) {
  const t = htmlToText(html);
  return t.length > 80 ? t.slice(0, 80) + "…" : t || "—";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderList() {
  const entries = load().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const list = filtered(entries);
  if (els.count) els.count.textContent = `${list.length} shown`;

  if (!els.entryList) return;
  els.entryList.innerHTML = "";

  list.forEach((e) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.tabIndex = 0;
    card.innerHTML = `
      <h4>${escapeHtml(e.title || "Untitled")}</h4>
      <p>${escapeHtml(fmtDate(e.date))} • ${escapeHtml(e.mood || "Calm")}</p>
      <p>${escapeHtml(snippet(e.content || ""))}</p>
    `;
    card.addEventListener("click", () => setEditor(e));
    card.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") setEditor(e);
    });
    els.entryList.appendChild(card);
  });
}

function setPrompt() {
  const p = prompts[Math.floor(Math.random() * prompts.length)];
  if (els.promptCard) els.promptCard.textContent = p;
}

function exportPDF() {
  const entry = {
    date: els.date?.value || todayISO(),
    mood: els.mood?.options?.[els.mood.selectedIndex]?.text || (els.mood?.value || ""),
    title: els.title?.value?.trim() || "Untitled",
    contentText: htmlToText(els.content?.innerHTML || ""),
  };

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return toast("PDF export unavailable");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const maxWidth = 612 - margin * 2;
  let y = 64;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text(entry.title, margin, y);
  y += 22;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`${entry.date}  •  ${entry.mood}`, margin, y);
  doc.setTextColor(0);
  y += 18;

  doc.setDrawColor(200);
  doc.line(margin, y, 612 - margin, y);
  y += 18;

  doc.setFontSize(12);
  const lines = doc.splitTextToSize(entry.contentText || "—", maxWidth);
  doc.text(lines, margin, y);

  const safeName = (entry.title || "entry").replace(/[^\w\- ]+/g, "").trim().slice(0, 50) || "entry";
  doc.save(`petal-journal-${safeName}.pdf`);
}

// Tag filtering
els.tagRow?.addEventListener("click", (ev) => {
  const btn = ev.target.closest("[data-tag]");
  if (!btn) return;

  const tag = btn.getAttribute("data-tag");
  activeTag = activeTag === tag ? null : tag;

  [...els.tagRow.querySelectorAll("[data-tag]")].forEach((b) => {
    b.style.outline =
      b.getAttribute("data-tag") === activeTag
        ? "3px solid color-mix(in srgb, var(--primary) 45%, transparent)"
        : "none";
  });

  renderList();
});

// Events
els.mood?.addEventListener("change", syncMoodChip);
els.btnSave?.addEventListener("click", upsertCurrent);
els.btnDelete?.addEventListener("click", deleteCurrent);
els.btnNew?.addEventListener("click", () => {
  playNewEntrySfx();
  setEditor(null);
  toast("New entry");
});
els.btnExport?.addEventListener("click", () => {
  playExportSfx();
  exportPDF();
});
els.btnPrompt?.addEventListener("click", setPrompt);
els.search?.addEventListener("input", renderList);

// Cosmetics buttons
document.getElementById("btnAmbient")?.addEventListener("click", toggleAmbient);
document.getElementById("btnJumpscare")?.addEventListener("click", playJumpscare);
document.getElementById("btnToreador")?.addEventListener("click", playToreador);

// Init
setEditor({ date: todayISO(), mood: "Calm", title: "", content: "" });
setPrompt();
renderList();

// Restore ambient state (optional)
(() => {
  const wantOn = localStorage.getItem("petal_ambient_on") === "1";
  if (!wantOn) return;
  const a = document.getElementById("ambientSfx");
  const btn = document.getElementById("btnAmbient");
  if (!a || !btn) return;
  btn.textContent = "Ambient: On";
  a.volume = 0.25;
  a.play().catch(() => {});
})();

// --- Sparkle cursor trail (canvas) ---
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("sparkles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function sparkleColors() {
    const s = getComputedStyle(document.documentElement);
    const arr = [1, 2, 3, 4, 5]
      .map((i) => s.getPropertyValue(`--sparkle-${i}`).trim())
      .filter(Boolean);
    return arr.length ? arr : ["#FFA5D6", "#FFD6EE", "#ECD2E0", "#CED1F8", "#A7ABDE"];
  }

  let colors = sparkleColors();
  const particles = [];
  let last = { x: 0, y: 0, t: 0 };

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  function spawn(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.4 + Math.random() * 1.6;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 0.4,
        r: 1 + Math.random() * 2.2,
        life: 18 + Math.random() * 18,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
      });
    }
  }

  addEventListener(
    "pointermove",
    (e) => {
      const now = performance.now();
      const x = e.clientX,
        y = e.clientY;

      if (now - last.t < 12) return;

      const dx = x - last.x,
        dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      const count = Math.max(2, Math.min(10, Math.floor(dist / 6)));

      spawn(x, y, count);
      last = { x, y, t: now };
    },
    { passive: true }
  );

  function drawStar(x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.45, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.45, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    colors = sparkleColors();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.rot += p.vr;
      p.life -= 1;

      const alpha = Math.max(0, Math.min(1, p.life / 24));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      drawStar(p.x, p.y, p.r, p.rot);
      ctx.globalAlpha = alpha * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) particles.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    if (particles.length > 500) particles.splice(0, particles.length - 500);
    requestAnimationFrame(tick);
  }
  tick();
})();

// --- Background music controls (local mp3 in <audio id="bgm">) ---
(() => {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("btnMusic");
  const vol = document.getElementById("musicVol");
  if (!audio || !btn || !vol) return;

  const savedVol = localStorage.getItem("petal_music_vol");
  if (savedVol !== null) vol.value = savedVol;
  audio.volume = Number(vol.value);

  function setBtn() {
    btn.textContent = audio.paused ? "Play music" : "Pause music";
  }
  setBtn();

  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
    localStorage.setItem("petal_music_vol", String(vol.value));
  });

  btn.addEventListener("click", async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
      setBtn();
    } catch {
      btn.textContent = "Music unavailable";
    }
  });
})();
// --- Clock ---
(() => {
  const el = document.getElementById("clock");
  if (!el) return;

  function tick(){
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  tick();
  setInterval(tick, 1000);
})();
document.querySelector(".menu-panel")?.addEventListener("click", (e) => {
  if (e.target.closest("a,button")) document.querySelector(".menu")?.removeAttribute("open");
});
