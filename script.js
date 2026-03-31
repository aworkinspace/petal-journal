// script.js (type="module")

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
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
"--bg-spot-1": "transparent",
"--bg-spot-2": "transparent",
  },
};

function applyTheme(themeName) {
  const theme = THEMES[themeName] || THEMES.petal;
  for (const [k, v] of Object.entries(theme)) document.documentElement.style.setProperty(k, v);
  localStorage.setItem("petal_theme", themeName);
}

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;

  notebook.classList.remove("skin-ruled", "skin-grid", "skin-dots", "skin-dark");
  notebook.classList.add(`skin-${skinName}`);
  localStorage.setItem("petal_skin", skinName);
}

/* ------------------------------ Stickers ------------------------------ */

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

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-sticker]");
    if (!btn) return;
    insertSticker(btn.dataset.sticker);
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
    } catch (e) {
      // silently ignore
    }
  }

  onAuthStateChanged(auth, (user) => {
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
      checkBirthdayAndCelebrate(user);
    } else {
      localStorage.removeItem("petal_early_access");

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
document.addEventListener("click", (e) => {
  const el = e.target.closest("button,a,summary,select,input");
  if (el) console.log("CLICK:", el.id || el.className || el.tagName, el);
});
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
/* ------------------------ Music + FNAF audio buttons ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);

  function safePlay(audio) {
    if (!audio) return;
    audio.play().catch((e) => console.warn("Audio play blocked until user gesture:", e?.message || e));
  }

  function safePause(audio) {
    if (!audio) return;
    audio.pause();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btnMusic = $("btnMusic");
    const musicVol = $("musicVol");
    const bgm = $("bgm");

    const btnAmbient = $("btnAmbient");
    const ambientSfx = $("ambientSfx");

    const btnJumpscare = $("btnJumpscare");
    const jumpscareSfx = $("jumpscareSfx");

    const btnToreador = $("btnToreador");
    const toreadorSfx = $("toreadorSfx");

    // defaults
    if (bgm && musicVol) bgm.volume = Number(musicVol.value ?? 0.35);
    if (ambientSfx) ambientSfx.volume = 0.35;

    // Music toggle
    btnMusic?.addEventListener("click", () => {
      if (!bgm) return;

      if (bgm.paused) {
        safePlay(bgm);
        btnMusic.textContent = "Pause Music";
      } else {
        safePause(bgm);
        btnMusic.textContent = "Play Music";
      }
    });

    // Volume
    musicVol?.addEventListener("input", () => {
      const v = Number(musicVol.value);
      if (bgm) bgm.volume = v;
      if (ambientSfx) ambientSfx.volume = v;
    });

    // Ambient toggle
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

    // Jumpscare (one-shot)
    btnJumpscare?.addEventListener("click", () => {
      if (!jumpscareSfx) return;
      jumpscareSfx.currentTime = 0;
      safePlay(jumpscareSfx);
    });

    // Toreador (one-shot)
    btnToreador?.addEventListener("click", () => {
      if (!toreadorSfx) return;
      toreadorSfx.currentTime = 0;
      safePlay(toreadorSfx);
    });
  });
})();
