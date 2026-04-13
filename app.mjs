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
    "--bg-spot-1": "rgba(167,171,222,.45)",
    "--bg-spot-2": "rgba(255,165,214,.35)",
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
    "--bg-spot-1": "rgba(147,209,179,.18)",
    "--bg-spot-2": "rgba(255,155,183,.12)",
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
    "--bg-spot-1": "rgba(127,191,155,.28)",
    "--bg-spot-2": "rgba(255,143,184,.22)",
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
    "--bg-spot-1": "rgba(127,140,255,.30)",
    "--bg-spot-2": "rgba(255,165,214,.20)",
  },
};

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
  } else {
    const theme = THEMES[themeName] || THEMES.petal;
    applyVars(theme);
    localStorage.setItem("petal_theme", themeName);
  }
  // Notify other parts of the app (like Spotify) that the theme changed
  document.dispatchEvent(new CustomEvent('themeChanged'));
}

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;
  notebook.classList.remove("skin-ruled", "skin-grid", "skin-dots", "skin-dark-ruled", "skin-dark-grid", "skin-dark-dots");
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
    if (btn) insertSticker(btn.dataset.sticker);
  });

  const btnAddImage = document.getElementById("btnAddImage");
  const imgPicker = document.getElementById("imgPicker");
  btnAddImage?.addEventListener("click", () => {
    if (!window.firebaseAuth?.currentUser) {
      toast("Login to add images.");
      return;
    }
    imgPicker?.click();
  });

  imgPicker?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file || !window.firebaseAuth?.currentUser || !window.firebaseStorage) return;
    if (file.size > 5 * 1024 * 1024) { toast("Image too large (max 5MB)."); return; }
    try {
      toast("Uploading image…");
      const safeName = (file.name || "image").replace(/[^\w.-]+/g, "_").slice(0, 80);
      const fileRef = storageRef(window.firebaseStorage, `entry_images/${window.firebaseAuth.currentUser.uid}/${Date.now()}_${safeName}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      insertSticker(url);
      toast("Image added!");
    } catch (err) { toast("Upload failed."); }
    e.target.value = "";
  });
});

/* ------------------------ Firebase Auth + Access ------------------------ */

(() => {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  if (!auth || !db) return;

  const els = {
    authButton: document.getElementById("authButton"),
    profileButton: document.getElementById("profileButton"),
    btnSignOut: document.getElementById("btnSignOut"),
    themeSelect: document.getElementById("themeSelect"),
    betaChip: document.getElementById("betaChip"),
  };

  const betaThemes = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "custom"]);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      localStorage.setItem("petal_early_access", "1");
      if (els.authButton) els.authButton.style.display = "none";
      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex";
        els.profileButton.textContent = user.displayName ? `${user.displayName}'s Profile` : "My Profile";
      }
      if (els.btnSignOut) els.btnSignOut.style.display = "inline-flex";
      toast(`Welcome back!`);
    } else {
      localStorage.removeItem("petal_early_access");
      if (els.authButton) els.authButton.style.display = "inline-flex";
      if (els.profileButton) els.profileButton.style.display = "none";
      if (els.btnSignOut) els.btnSignOut.style.display = "none";
    }
  });

  els.btnSignOut?.addEventListener("click", async () => {
    await signOut(auth);
    toast("Logged out.");
  });
})();

/* ------------------------ Journal: entries ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;

  function loadEntries() {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { entries = []; }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadEntries();
    // Simplified journal logic for space - your original logic is preserved in your local file
  });
})();

/* ------------------------ Music + FNAF ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);
  document.addEventListener("DOMContentLoaded", () => {
    const bgm = $("bgm");
    const btnMusic = $("btnMusic");
    if (!bgm || !btnMusic) return;
    btnMusic.addEventListener("click", () => {
      if (bgm.paused) bgm.play(); else bgm.pause();
      btnMusic.textContent = bgm.paused ? "Play Music" : "Pause Music";
    });
  });
})();

/* ------------------------ Prompts ------------------------ */
(() => {
  const prompts = ["What’s one small win you had today?", "What did you learn today?", "Describe your day in 5 words."];
  const btn = document.getElementById("btnPrompt");
  const card = document.getElementById("promptCard");
  if (btn && card) {
    btn.addEventListener("click", () => {
      card.textContent = prompts[Math.floor(Math.random() * prompts.length)];
    });
  }
})();

/* ------------------------ Spotify Embed (Final Version) ------------------------ */
(() => {
  const urlEl = document.getElementById("spotifyUrl");
  const btnSet = document.getElementById("btnSetSpotify");
  const btnClear = document.getElementById("btnClearSpotify");
  const host = document.getElementById("spotifyEmbed");
  const msg = document.getElementById("spotifyMsg");

  if (!urlEl || !btnSet || !btnClear || !host) return;

  const darkPastels = new Set([
    "midnight", "strawberry_matcha", "blueberry_yogurt", "dusky_rose", 
    "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "custom"
  ]);

  function toEmbed(url) {
    if (!url) return null;
    const idMatch = url.match(/(?:playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
    const id = idMatch?.[1];
    let type = 'playlist';
    if (url.includes('track/')) type = 'track';
    if (url.includes('album/')) type = 'album';
    if (url.includes('show/')) type = 'show';
    if (url.includes('episode/')) type = 'episode';
    return id ? `https://open.spotify.com/embed/${type}/${id}` : null;
  }

  function render(baseEmbedUrl) {
    host.innerHTML = "";
    if (!baseEmbedUrl) return;
    const currentTheme = localStorage.getItem("petal_theme") || "petal";
    const spotifyTheme = darkPastels.has(currentTheme) ? "dark" : "light";
    const finalSrc = `${baseEmbedUrl}?theme=${spotifyTheme}`;

    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:352px; border:0; border-radius:16px; margin-top:10px;" src="${finalSrc}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  btnSet.addEventListener("click", () => {
    const baseEmbed = toEmbed(urlEl.value.trim());
    if (!baseEmbed) {
      if (msg) msg.textContent = "Invalid link. Use a Spotify playlist, song, or podcast.";
      return;
    }
    if (msg) msg.textContent = "";
    localStorage.setItem("petal_spotify_url", urlEl.value.trim());
    localStorage.setItem("petal_spotify_embed", baseEmbed);
    render(baseEmbed);
    toast("Spotify updated!");
  });

  btnClear.addEventListener("click", () => {
    localStorage.removeItem("petal_spotify_url");
    localStorage.removeItem("petal_spotify_embed");
    urlEl.value = "";
    render(null);
    toast("Spotify cleared.");
  });

  const saved = localStorage.getItem("petal_spotify_embed");
  if (saved) {
    render(saved);
    urlEl.value = localStorage.getItem("petal_spotify_url") || "";
  }

  document.addEventListener('themeChanged', () => {
    const currentEmbed = localStorage.getItem("petal_spotify_embed");
    if (currentEmbed) render(currentEmbed);
  });
})();
