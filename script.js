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
  },
};

function applyTheme(themeName) {
  // "custom" is applied from Firestore vars; don't overwrite it here.
  if (themeName === "custom") {
    localStorage.setItem("petal_theme", "custom");
    return;
  }

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

  // Add image (beta) -> insert local image into editor
  const btnAddImage = document.getElementById("btnAddImage");
  const imgPicker = document.getElementById("imgPicker");

  btnAddImage?.addEventListener("click", () => imgPicker?.click());

  imgPicker?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) return; // 4MB

    const url = URL.createObjectURL(file);
    insertSticker(url);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    e.target.value = "";
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

    // Add image (beta) visibility + picker presence
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

      for (const [k, v] of Object.entries(t.vars)) {
        if (typeof k === "string" && k.startsWith("--") && typeof v === "string") {
          document.documentElement.style.setProperty(k, v);
        }
      }

      localStorage.setItem("petal_theme", "custom");
      if (els.themeSelect && [...els.themeSelect.options].some((o) => o.value === "custom")) {
        els.themeSelect.value = "custom";
      }
    } catch {
      // ignore Firestore offline/blocked/etc.
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
    } catch {
      // silently ignore
    }
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
    const btnNextTrack = $("btnNextTrack"); // add this button in HTML
    const musicVol = $("musicVol");
    const bgm = $("bgm");

    const btnAmbient = $("btnAmbient");
    const ambientSfx = $("ambientSfx");

    const btnJumpscare = $("btnJumpscare");
    const jumpscareSfx = $("jumpscareSfx");

    const btnToreador = $("btnToreador");
    const toreadorSfx = $("toreadorSfx");

    if (!bgm || !btnMusic || !musicVol) return;

    // Playlist (add files to /assets or change paths)
    const tracks = [
  "assets/lofi.mp3",
  "assets/elevator.mp3",
  "assets/monty.mp3",
  "assets/intro.mp3"
];

    let trackIndex = Number(localStorage.getItem("petal_track_index") || "0");
    if (!Number.isFinite(trackIndex) || trackIndex < 0) trackIndex = 0;
    trackIndex %= tracks.length;

    // Restore volume
    const savedVol = localStorage.getItem("petal_music_vol");
    if (savedVol !== null) musicVol.value = savedVol;

    function setVolume(v) {
      const vol = Number(v);
      if (Number.isFinite(vol)) {
        bgm.volume = vol;
        if (ambientSfx) ambientSfx.volume = vol;
      }
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
      bgm.loop = false; // allow "Next" / ended to advance
      bgm.load();

      if (autoplay || wasPlaying) safePlay(bgm);
      setBtn();
    }

    // Initial track load
    setTrack(trackIndex, false);

    // Play/pause
    btnMusic.addEventListener("click", () => {
      if (bgm.paused) safePlay(bgm);
      else safePause(bgm);
      setBtn();
    });

    // Next track
    btnNextTrack?.addEventListener("click", () => setTrack(trackIndex + 1, true));

    // Auto-advance
    bgm.addEventListener("ended", () => setTrack(trackIndex + 1, true));

    // Volume
    musicVol.addEventListener("input", () => {
      setVolume(musicVol.value);
      localStorage.setItem("petal_music_vol", String(musicVol.value));
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
