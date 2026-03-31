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
}, // <-- KEEP THIS COMMA

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
},
mauve_night: {
  "--bg": "#100F14",
  "--surface": "#15131A",
  "--surface-2": "#201B25",
  "--border": "rgba(255,255,255,.14)",
  "--primary": "#9FB6FF",          // periwinkle
  "--primary-soft": "rgba(159,182,255,.35)",
  "--accent": "#D7A6FF",           // lavender
  "--text": "#F2F0F7",
  "--text-muted": "rgba(242,240,247,.75)",
},
deep_sage: {
  "--bg": "#0F1412",
  "--surface": "#141A17",
  "--surface-2": "#1C2621",
  "--border": "rgba(255,255,255,.14)",
  "--primary": "#93D1B3",          // sage/mint
  "--primary-soft": "rgba(147,209,179,.35)",
  "--accent": "#FF9BB7",           // warm pink
  "--text": "#F2F0F7",
  "--text-muted": "rgba(242,240,247,.75)",
},
blueberry_dusk: {
  "--bg": "#0D101A",
  "--surface": "#12172A",
  "--surface-2": "#1A2140",
  "--border": "rgba(255,255,255,.14)",
  "--primary": "#8EA2FF",          // blue-violet
  "--primary-soft": "rgba(142,162,255,.35)",
  "--accent": "#8FE3FF",           // pastel cyan
  "--text": "#F2F0F7",
  "--text-muted": "rgba(242,240,247,.75)",
},
cocoa_lilac: {
  "--bg": "#141014",
  "--surface": "#1A141B",
  "--surface-2": "#261C28",
  "--border": "rgba(255,255,255,.14)",
  "--primary": "#E2B3FF",          // lilac
  "--primary-soft": "rgba(226,179,255,.35)",
  "--accent": "#FFB38A",           // peach
  "--text": "#F2F0F7",
  "--text-muted": "rgba(242,240,247,.75)",
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
  const theme = THEMES[themeName] || THEMES.petal;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme)) root.style.setProperty(k, v);
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
  img.className = "sticker"; // matches your CSS: .rte img.sticker

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
  // restore selections
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

  // stickers (event delegation)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-sticker]");
    if (!btn) return;
    insertSticker(btn.dataset.sticker);
  });
});

/* ------------------------ Firebase Auth + Access ------------------------ */

(() => {
  const auth = window.firebaseAuth; // from index.html
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

  const betaThemes = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt"]);

  function initFeatureAccess() {
    const earlyAccess = localStorage.getItem("petal_early_access") === "1";

    // disable/enable beta themes in dropdown
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

  async function checkBirthdayAndCelebrate(user) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const { birthday } = snap.data(); // "YYYY-MM-DD"
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
      console.error("Birthday check failed:", e);
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("petal_early_access", "1");

      if (els.authButton) els.authButton.style.display = "none";

      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex";
        els.profileButton.textContent = user.displayName ? `${user.displayName}'s Profile` : "Profile";
        els.profileButton.href = "profile.html";
      }

      if (els.btnSignOut) els.btnSignOut.style.display = "inline-flex";
      if (els.btnLock) els.btnLock.style.display = "none";
      if (els.btnSetPasscode) els.btnSetPasscode.style.display = "none";

      toast(`Logged in as ${user.email}`);
      checkBirthdayAndCelebrate(user);
    } else {
      localStorage.removeItem("petal_early_access");

      if (els.authButton) {
        els.authButton.style.display = "inline-flex";
        els.authButton.textContent = "Login";
        els.authButton.href = "login.html";
      }

      if (els.profileButton) els.profileButton.style.display = "none";
      if (els.btnSignOut) els.btnSignOut.style.display = "none";
      if (els.btnLock) els.btnLock.style.display = "inline-flex";
      if (els.btnSetPasscode) els.btnSetPasscode.style.display = "inline-flex";

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
