// script.js (type="module")

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

/* ----------------------------- Theme + Skin ----------------------------- */

const THEMES = {
  petal: {
  "--bg": "var(--rose-50)",
  "--surface": "var(--rose-50)",
  "--surface-2": "var(--pink-200)",
  "--border": "var(--mauve-200)",
  "--primary": "var(--periwinkle-400)",
  "--primary-soft": "var(--periwinkle-200)",
  "--accent": "var(--pink-500)",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(167,171,222,.45)",  // periwinkle tint
  "--bg-spot-2": "rgba(255,165,214,.35)",  // pink tint
},

lavender: {
  "--bg": "#F6F2FF",
  "--surface": "#F6F2FF",
  "--surface-2": "#EDE4FF",
  "--border": "#D8CBF2",
  "--primary": "#A7ABDE",
  "--primary-soft": "#CED1F8",
  "--accent": "#D7A6FF",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(215,166,255,.32)",
  "--bg-spot-2": "rgba(167,171,222,.28)",
},

sky_sorbet: {
  "--bg": "#F2FBFF",
  "--surface": "#F2FBFF",
  "--surface-2": "#DFF3FF",
  "--border": "#C7E4F5",
  "--primary": "#7DB6FF",
  "--primary-soft": "#CFE4FF",
  "--accent": "#FFA5D6",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(125,182,255,.30)",
  "--bg-spot-2": "rgba(255,165,214,.24)",
},

peach_milk: {
  "--bg": "#FFF6F0",
  "--surface": "#FFF6F0",
  "--surface-2": "#FFE3D2",
  "--border": "#F2CDBB",
  "--primary": "#A7ABDE",
  "--primary-soft": "#CED1F8",
  "--accent": "#FFB38A",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(255,179,138,.34)",
  "--bg-spot-2": "rgba(167,171,222,.24)",
},

lemon_cream: {
  "--bg": "#FFFCEB",
  "--surface": "#FFFCEB",
  "--surface-2": "#FFF2B8",
  "--border": "#E9DFA2",
  "--primary": "#9AB6FF",
  "--primary-soft": "#D6E3FF",
  "--accent": "#FFC857",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(255,200,87,.32)",
  "--bg-spot-2": "rgba(154,182,255,.22)",
},

  // darker pastels
  dusky_rose: {
    "--bg": "#141016",
    "--surface": "#19131C",
    "--surface-2": "#241A26",
    "--border": "rgba(255,255,255,.14)",
    "--primary": "#B7A6FF",
    "--primary-soft": "rgba(183,166,255,.35)",
    "--accent": "#FF8FBC",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(183,166,255,.22)",
    "--bg-spot-2": "rgba(255,143,188,.16)",
  },
  mauve_night: {
    "--bg": "#100F14",
    "--surface": "#15131A",
    "--surface-2": "#201B25",
    "--border": "rgba(255,255,255,.14)",
    "--primary": "#9FB6FF",
    "--primary-soft": "rgba(159,182,255,.35)",
    "--accent": "#D7A6FF",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(159,182,255,.18)",
  "--bg-spot-2": "rgba(215,166,255,.14)",
  },
    deep_sage: {
    "--bg": "#0F1412",
    "--surface": "#141A17",
    "--surface-2": "#1C2621",
    "--border": "rgba(255,255,255,.14)",
    "--primary": "#93D1B3",
    "--primary-soft": "rgba(147,209,179,.35)",
    "--accent": "#FF9BB7",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(147,209,179,.18)", // Corrected line
    "--bg-spot-2": "rgba(255,155,183,.12)", // Corrected line
  },
  blueberry_dusk: {
    "--bg": "#0D101A",
    "--surface": "#12172A",
    "--surface-2": "#1A2140",
    "--border": "rgba(255,255,255,.14)",
    "--primary": "#8EA2FF",
    "--primary-soft": "rgba(142,162,255,.35)",
    "--accent": "#8FE3FF",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(142,162,255,.20)",
    "--bg-spot-2": "rgba(143,227,255,.12)",
  },
  cocoa_lilac: {
    "--bg": "#141014",
    "--surface": "#1A141B",
    "--surface-2": "#261C28",
    "--border": "rgba(255,255,255,.14)",
    "--primary": "#E2B3FF",
    "--primary-soft": "rgba(226,179,255,.35)",
    "--accent": "#FFB38A",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(226,179,255,.18)",
    "--bg-spot-2": "rgba(255,179,138,.10)",
  },
  midnight: {
    "--bg": "#0F0D14",
    "--surface": "#14121A",
    "--surface-2": "#1C1824",
    "--border": "rgba(255,255,255,.14)",
    "--primary": "#8EA2FF",
    "--primary-soft": "rgba(142,162,255,.35)",
    "--accent": "#FFA5D6",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(142,162,255,.18)",
    "--bg-spot-2": "rgba(255,165,214,.12)",
  },

  strawberry_matcha: {
  "--bg": "#F7FFF6",
  "--surface": "#F7FFF6",
  "--surface-2": "#E8F7E6",
  "--border": "#CFE6CC",
  "--primary": "#7FBF9B",
  "--primary-soft": "#CFEBDD",
  "--accent": "#FF8FB8",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(127,191,155,.28)",  // matcha
  "--bg-spot-2": "rgba(255,143,184,.22)",  // strawberry
},

blueberry_yogurt: {
  "--bg": "#F4F6FF",
  "--surface": "#F4F6FF",
  "--surface-2": "#E2E7FF",
  "--border": "#CAD3FF",
  "--primary": "#7F8CFF",
  "--primary-soft": "#C9D0FF",
  "--accent": "#FFA5D6",
  "--text": "#2B2B33",
  "--text-muted": "#5A5A6A",
  "--bg-spot-1": "rgba(127,140,255,.30)",  // blueberry
  "--bg-spot-2": "rgba(255,165,214,.20)",  // yogurt-berry swirl
}, // <-- Correct closing for blueberry_yogurt
}; // <-- Correct closing for the entire THEMES object.


function applyVars(vars) {
  if (!vars || typeof vars !== "object") return;
  for (const [k, v] of Object.entries(vars)) {
    if (typeof k === "string" && k.startsWith("--") && typeof v === "string") {
      document.documentElement.style.setProperty(k, v);
    }
  }
}

function applyTheme(themeName) {
  if (themeName === "custom") {
    const raw = localStorage.getItem("petal_custom_theme_vars");
    if (raw) {
      try {
        applyVars(JSON.parse(raw));
      } catch {}
    }
    localStorage.setItem("petal_theme", "custom");
    return;
  }

  const theme = THEMES[themeName] || THEMES.petal;
  applyVars(theme);
  localStorage.setItem("petal_theme", themeName);
}

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;

  notebook.classList.remove(
    "skin-ruled",
    "skin-grid",
    "skin-dots",
    "skin-dark-ruled",
    "skin-dark-grid",
    "skin-dark-dots"
  );

  notebook.classList.add(`skin-${String(skinName).replace("_", "-")}`);
  localStorage.setItem("petal_skin", skinName);
}

/* ------------------------------ Stickers / Images ------------------------------ */

function insertSticker(src) {
  const content = document.getElementById("content");
  if (!content) return;

  const img = document.createElement("img");
  img.src = src;
  img.alt = "sticker";
  img.className = "sticker";

  const sel = window.getSelection();
  if (sel && sel.rangeCount && content.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    content.appendChild(img);
  }
}

/* ------------------------------- Toast ------------------------------- */

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._id);
  toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------- Wire UI once DOM is ready ------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById("themeSelect");
  const skinSelect = document.getElementById("skinSelect");

  const savedTheme = localStorage.getItem("petal_theme") || "petal";
  const savedSkin = localStorage.getItem("petal_skin") || "ruled";

  applyTheme(savedTheme);
  applySkin(savedSkin);

  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
  }

  if (skinSelect) {
    skinSelect.value = savedSkin;
    skinSelect.addEventListener("change", (e) => applySkin(e.target.value));
  }

  // Stickers
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-sticker]");
    if (!btn) return;
    insertSticker(btn.dataset.sticker);
  });

  // Add image (beta) -> upload to Firebase Storage (logged-in only)
const btnAddImage = document.getElementById("btnAddImage");
const imgPicker = document.getElementById("imgPicker");

btnAddImage?.addEventListener("click", () => {
  const auth = window.firebaseAuth;
  if (!auth?.currentUser) {
    toast("Login to add images.");
    return;
  }
  imgPicker?.click();
});

imgPicker?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const auth = window.firebaseAuth;
  const storage = window.firebaseStorage;
  const user = auth?.currentUser;

  if (!user) {
    toast("Login to add images.");
    e.target.value = "";
    return;
  }

  if (!storage) {
    toast("Storage not ready.");
    e.target.value = "";
    return;
  }

  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.");
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast("Image too large (max 5MB).");
    e.target.value = "";
    return;
  }

  try {
    toast("Uploading image…");

    const safeName = (file.name || "image").replace(/[^\w.-]+/g, "_").slice(0, 80);
    const fileRef = storageRef(storage, `entry_images/${user.uid}/${Date.now()}_${safeName}`);

await uploadBytes(fileRef, file, { contentType: file.type });
const url = await getDownloadURL(fileRef);

    insertSticker(url);
    toast("Image added!");
  } catch (err) {
    console.error("Image upload failed:", err);
    toast(`Upload failed: ${err?.message ?? "Unknown error"}`);
  } finally {
    e.target.value = "";
  }
});
});
/* ------------------------ Firebase Auth + Access ------------------------ */

(() => {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;

  if (!auth || !db) {
    console.error("Firebase not initialized. Check firebaseConfig in index.html.");
    return;
  }

  const els = {
    authButton: document.getElementById("authButton"),
    profileButton: document.getElementById("profileButton"),
    btnSignOut: document.getElementById("btnSignOut"),
    btnLock: document.getElementById("btnLock"),
    btnSetPasscode: document.getElementById("btnSetPasscode"),
    themeSelect: document.getElementById("themeSelect"),
    btnAddImage: document.getElementById("btnAddImage"),
    stickerBar: document.getElementById("stickerBar"),
    betaChip: document.getElementById("betaChip"),
  };

  const betaThemes = new Set([
    "midnight",
    "strawberry_matcha",
    "blueberry_yogurt",
    "dusky_rose",
    "mauve_night",
    "deep_sage",
    "blueberry_dusk",
    "cocoa_lilac",
    "custom",
  ]);

  function initFeatureAccess() {
    const earlyAccess = localStorage.getItem("petal_early_access") === "1";

    if (els.themeSelect) {
      [...els.themeSelect.options].forEach((opt) => {
        if (betaThemes.has(opt.value)) opt.disabled = !earlyAccess;
      });

      const currentTheme = localStorage.getItem("petal_theme");
      if (!earlyAccess && betaThemes.has(currentTheme)) {
        applyTheme("petal");
        els.themeSelect.value = "petal";
      }
    }

    if (els.betaChip) els.betaChip.style.display = earlyAccess ? "inline-flex" : "none";

    const imgPicker = document.getElementById("imgPicker");
    if (els.btnAddImage) els.btnAddImage.style.display = earlyAccess ? "inline-flex" : "none";

    if (!earlyAccess) {
      imgPicker?.remove();
      return;
    }

    if (!imgPicker && els.stickerBar) {
      const newPicker = document.createElement("input");
      newPicker.id = "imgPicker";
      newPicker.type = "file";
      newPicker.accept = "image/*";
      newPicker.hidden = true;
      els.stickerBar.appendChild(newPicker);
    }
  }

  async function applyCustomThemeIfAny(user) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "settings", "theme"));
      if (!snap.exists()) return;

      const t = snap.data();
      if (!t?.enabled || !t?.vars || typeof t.vars !== "object") return;

      localStorage.setItem("petal_custom_theme_vars", JSON.stringify(t.vars));
      applyVars(t.vars);
      localStorage.setItem("petal_theme", "custom");

      if (els.themeSelect && [...els.themeSelect.options].some((o) => o.value === "custom")) {
        els.themeSelect.value = "custom";
      }
    } catch {
      // ignore offline/blocked/etc.
    }
  }

  async function checkBirthdayAndCelebrate(user) {
    if (!navigator.onLine) return;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const { birthday } = snap.data();
      if (!birthday) return;

      const [, monthStr, dayStr] = birthday.split("-");
      const month = Number(monthStr);
      const day = Number(dayStr);
      if (!month || !day) return;

      const today = new Date();
      if (today.getMonth() + 1 !== month || today.getDate() !== day) return;

      const year = today.getFullYear();
      const flagKey = `petal_birthday_confetti_${user.uid}_${year}`;
      if (localStorage.getItem(flagKey) === "1") return;

      if (window.confetti) {
        const end = Date.now() + 3000;
        (function frame() {
          window.confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
          window.confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }

      localStorage.setItem(flagKey, "1");
      toast("Happy birthday!");
    } catch {}
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      localStorage.setItem("petal_early_access", "1");

      els.authButton && (els.authButton.style.display = "none");

      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex";
        els.profileButton.textContent = user.displayName ? `${user.displayName}'s Profile` : "Profile";
        els.profileButton.href = "profile.html";
      }

      els.btnSignOut && (els.btnSignOut.style.display = "inline-flex");
      els.btnLock && (els.btnLock.style.display = "none");
      els.btnSetPasscode && (els.btnSetPasscode.style.display = "none");

      toast(`Logged in as ${user.email}`);

      await applyCustomThemeIfAny(user);
      checkBirthdayAndCelebrate(user);
    } else {
      localStorage.removeItem("petal_early_access");

      if (localStorage.getItem("petal_theme") === "custom") {
        applyTheme("petal");
        if (els.themeSelect) els.themeSelect.value = "petal";
      }

      if (els.authButton) {
        els.authButton.style.display = "inline-flex";
        els.authButton.textContent = "Login";
        els.authButton.href = "login.html";
      }

      els.profileButton && (els.profileButton.style.display = "none");
      els.btnSignOut && (els.btnSignOut.style.display = "none");
      els.btnLock && (els.btnLock.style.display = "inline-flex");
      els.btnSetPasscode && (els.btnSetPasscode.style.display = "inline-flex");

      toast("Logged out.");
    }

    initFeatureAccess();
  });

  els.btnSignOut?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    toast("Successfully logged out!");
  } catch (error) {
    console.error("Logout failed:", error);
    toast(`Logout failed: ${error?.message ?? "Unknown error"}`);
  }
});

  initFeatureAccess();
})();

/* ------------------------ Journal: entries + SFX (with tags + dynamic chips) ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    date: $("date"),
    mood: $("mood"),
    title: $("title"),
    tagsInput: $("tagsInput"),
    content: $("content"),
    moodChip: $("moodChip"),
    status: $("status"),

    entryList: $("entryList"),
    count: $("count"),
    search: $("search"),
    tagRow: $("tagRow"),

    btnSave: $("btnSave"),
    btnDelete: $("btnDelete"),
    btnNew: $("btnNew"),
    btnExport: $("btnExport"),

    clock: $("clock"),

    saveSfx: $("saveSfx"),
    deleteSfx: $("deleteSfx"),
    newEntrySfx: $("newEntrySfx"),
    exportSfx: $("exportSfx"),
  };

  const DEFAULT_TAGS = ["gratitude", "work", "health", "family"];
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

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function parseTags(str) {
    return (str || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);
  }

  function loadEntries() {
  try {
    entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(entries)) entries = [];
  } catch {
    entries = [];
  }
}

function cleanupBlobImages() {
  let changed = false;

  for (const e of entries) {
    if (typeof e.content === "string" && e.content.includes('src="blob:')) {
      e.content = e.content.replace(/<img[^>]+src="blob:[^"]+"[^>]*>/g, "");
      changed = true;
    }
  }

  if (changed) saveEntries();
}

  function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function updateMoodChip() {
    if (!els.moodChip || !els.mood) return;
    els.moodChip.textContent = `Mood: ${els.mood.value || "Calm"}`;
  }

  function getEditorData() {
    return {
      date: els.date?.value || nowDateValue(),
      mood: els.mood?.value || "Calm",
      title: (els.title?.value || "").trim(),
      tags: parseTags(els.tagsInput?.value),
      content: els.content?.innerHTML || "",
    };
  }

  function setEditorData(e) {
  if (els.date) els.date.value = e?.date || nowDateValue();
  if (els.mood) els.mood.value = e?.mood || "Calm";
  if (els.title) els.title.value = e?.title || "";
  if (els.tagsInput) els.tagsInput.value = (e?.tags || []).join(", ");
  if (els.content) els.content.innerHTML = e?.content || "";

  // remove dead blob images from older entries
  if (els.content) {
    els.content.querySelectorAll('img.sticker[src^="blob:"]').forEach((img) => img.remove());
  }

  updateMoodChip();
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

  function allTagsFromEntries() {
    const set = new Set(DEFAULT_TAGS);
    for (const e of entries) for (const t of e.tags || []) set.add(String(t).toLowerCase());
    return [...set].sort();
  }

  function renderTagChips() {
    if (!els.tagRow) return;
    const tags = allTagsFromEntries();
    els.tagRow.innerHTML = tags
      .map(
        (t) =>
          `<button class="chip tag ${activeTag === t ? "active" : ""}" data-tag="${t}" type="button">${t}</button>`
      )
      .join("");
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
      const tagText = (e.tags || []).length ? ` • #${(e.tags || []).join(" #")}` : "";
      p.textContent = `${e.date || ""} • ${(e.mood || "").trim()}${tagText}${preview ? " • " + preview : ""}`;

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
    setEditorData({ date: nowDateValue(), mood: "Calm", title: "", tags: [], content: "" });
    if (els.status) els.status.textContent = "New entry.";
    play(els.newEntrySfx);
  }

  function saveEntry() {
    const data = getEditorData();
    const now = Date.now();

    if (!data.title && !stripHtml(data.content)) {
      if (els.status) els.status.textContent = "Nothing to save yet.";
      return;
    }

    if (!activeId) {
      activeId = makeId();
      entries.push({ id: activeId, createdAt: now, updatedAt: now, ...data });
    } else {
      const idx = entries.findIndex((e) => e.id === activeId);
      if (idx === -1) entries.push({ id: activeId, createdAt: now, updatedAt: now, ...data });
      else entries[idx] = { ...entries[idx], ...data, updatedAt: now };
    }

    saveEntries();
    renderTagChips();
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
    renderTagChips();
    renderList();
    newEntry();
    play(els.deleteSfx);
  }

  function initTagChips() {
    if (!els.tagRow) return;
    els.tagRow.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tag]");
      if (!btn) return;

      const tag = (btn.dataset.tag || "").toLowerCase();
      activeTag = activeTag === tag ? null : tag;

      renderTagChips();
      renderList();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (els.clock) {
      els.clock.textContent = formatClock();
      setInterval(() => (els.clock.textContent = formatClock()), 1000 * 20);
    }

    if (els.date && !els.date.value) els.date.value = nowDateValue();

    updateMoodChip();
    els.mood?.addEventListener("change", updateMoodChip);

    loadEntries();
    cleanupBlobImages();
    renderTagChips();
    renderList();
    

    els.btnSave?.addEventListener("click", saveEntry);
    els.btnDelete?.addEventListener("click", deleteEntry);
    els.btnNew?.addEventListener("click", newEntry);

    els.btnExport?.addEventListener("click", () => play(els.exportSfx));

    els.search?.addEventListener("input", renderList);
    initTagChips();

    if (!entries.length) newEntry();
  });
})();

/* ------------------------ Music + FNAF audio buttons (+ Next track) ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);

  function safePlay(audio) {
    if (!audio) return;
    audio.play().catch(() => {});
  }
  function safePause(audio) {
    if (!audio) return;
    audio.pause();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btnMusic = $("btnMusic");
    const btnNextTrack = $("btnNextTrack");
    const musicVol = $("musicVol");
    const bgm = $("bgm");

    const btnAmbient = $("btnAmbient");
    const ambientSfx = $("ambientSfx");

    const btnJumpscare = $("btnJumpscare");
    const jumpscareSfx = $("jumpscareSfx");

    const btnToreador = $("btnToreador");
    const toreadorSfx = $("toreadorSfx");

    if (!bgm || !btnMusic || !musicVol) return;

    const tracks = ["assets/lofi.mp3", "assets/elevator.mp3", "assets/monty.mp3", "assets/intro.mp3"];

    let trackIndex = Number(localStorage.getItem("petal_track_index") || "0");
    if (!Number.isFinite(trackIndex) || trackIndex < 0) trackIndex = 0;
    trackIndex %= tracks.length;

    const savedVol = localStorage.getItem("petal_music_vol");
    if (savedVol !== null) musicVol.value = savedVol;

    function setVolume(v) {
      const vol = Number(v);
      if (!Number.isFinite(vol)) return;
      bgm.volume = vol;
      if (ambientSfx) ambientSfx.volume = vol;
    }
    setVolume(musicVol.value ?? 0.35);

    function setBtn() {
      btnMusic.textContent = bgm.paused ? "Play Music" : "Pause Music";
    }

    function setTrack(nextIndex, autoplay = false) {
      trackIndex = ((nextIndex % tracks.length) + tracks.length) % tracks.length;
      localStorage.setItem("petal_track_index", String(trackIndex));

      const wasPlaying = !bgm.paused;
      bgm.src = tracks[trackIndex];
      bgm.loop = false;
      bgm.load();

      if (autoplay || wasPlaying) safePlay(bgm);
      setBtn();
    }

    setTrack(trackIndex, false);

    btnMusic.addEventListener("click", () => {
      if (bgm.paused) safePlay(bgm);
      else safePause(bgm);
      setBtn();
    });

    btnNextTrack?.addEventListener("click", () => setTrack(trackIndex + 1, true));
    bgm.addEventListener("ended", () => setTrack(trackIndex + 1, true));

    musicVol.addEventListener("input", () => {
      setVolume(musicVol.value);
      localStorage.setItem("petal_music_vol", String(musicVol.value));
    });

    btnAmbient?.addEventListener("click", () => {
      if (!ambientSfx) return;
      if (ambientSfx.paused) {
        safePlay(ambientSfx);
        btnAmbient.textContent = "Ambient: On";
      } else {
        safePause(ambientSfx);
        btnAmbient.textContent = "Ambient: Off";
      }
    });

    btnJumpscare?.addEventListener("click", () => {
      if (!jumpscareSfx) return;
      jumpscareSfx.currentTime = 0;
      safePlay(jumpscareSfx);
    });

    btnToreador?.addEventListener("click", () => {
      if (!toreadorSfx) return;
      toreadorSfx.currentTime = 0;
      safePlay(toreadorSfx);
    });
  });
})();

/* ------------------------ Prompts ------------------------ */
(() => {
  const prompts = [
    "What’s one small win you had today?",
    "What’s taking up the most space in your mind right now?",
    "What’s one thing you can let go of today?",
    "Write 3 things you’re grateful for (tiny counts).",
    "What did you learn today?",
    "What do you need more of this week?",
    "Describe your day in 5 words.",
    "What would you tell a friend in your situation?",
    "What’s one kind thing you did for yourself today?",
    "What’s one next step (the smallest possible)?",
  ];

  const btn = document.getElementById("btnPrompt");
  const card = document.getElementById("promptCard");
  if (!btn || !card) return;

  function pick() {
    const next = prompts[Math.floor(Math.random() * prompts.length)];
    card.textContent = next;
    localStorage.setItem("petal_prompt", next);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("petal_prompt");
    if (saved) card.textContent = saved;
  });

  btn.addEventListener("click", pick);
})();
