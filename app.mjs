// app.mjs (type="module")
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";
function applyGlobalCursor(cursorId) {
  if (!cursorId || cursorId === "default") {
    document.documentElement.style.cursor = "auto";
    // Also reset buttons
    const style = document.getElementById("dynamic-cursor-style");
    if (style) style.remove();
    return;
  }

  const fileName = cursorId.replace("cursor_", "");
  const url = `assets/${fileName}_cursor.png`;

  // We create a style tag to override EVERYTHING (buttons, links, etc)
  let style = document.getElementById("dynamic-cursor-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "dynamic-cursor-style";
    document.head.appendChild(style);
  }

  // Cursors need to be 32x32 or smaller to work in all browsers
  style.innerHTML = `
    * { cursor: url('${url}'), auto !important; }
    a, button, summary, .btn, .chip { cursor: url('${url}'), pointer !important; }
  `;
}

// Initial check on page load
applyGlobalCursor(localStorage.getItem("petal_equipped_cursor"));
/* ----------------------------- Theme Data ----------------------------- */
const THEME_DEFAULTS = {
  "--bg": "#FFFFFF",
  "--surface": "#FFFFFF",
  "--surface-2": "#F3F4F6",
  "--border": "rgba(0, 0, 0, 0.12)",
  "--primary": "#A7ABDE",
  "--primary-soft": "rgba(167, 171, 222, 0.25)",
  "--accent": "#FFA5D6",
  "--text": "#2B2B33",
  "--text-muted": "rgba(43, 43, 51, 0.65)",
  "--bg-spot-1": "transparent",
  "--bg-spot-2": "transparent",
  animation: "none",
};

const normalizeTheme = (theme = {}) => ({
  ...THEME_DEFAULTS,
  ...theme,
});

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

  cyberpunk_neo: {
    "--bg": "#050505",
    "--surface": "#0D0D0D",
    "--surface-2": "#FF007A",
    "--border": "rgba(0, 243, 255, 0.3)",
    "--primary": "#00F3FF",
    "--primary-soft": "rgba(0, 243, 255, 0.1)",
    "--accent": "#FF007A",
    "--text": "#E0E0E0",
    "--text-muted": "rgba(224, 224, 224, 0.5)",
    animation: "glitch",
  },

  deep_sea_abyss: {
    "--bg": "#02080D",
    "--surface": "#04121A",
    "--surface-2": "#00FFC2",
    "--border": "rgba(0, 255, 194, 0.15)",
    "--primary": "#00FFC2",
    "--primary-soft": "rgba(0, 255, 194, 0.05)",
    "--accent": "#0077B6",
    "--text": "#CAF0F8",
    "--text-muted": "rgba(202, 240, 248, 0.4)",
    animation: "plankton",
  },

  fairy_forest: {
    "--bg": "#0B120E",
    "--surface": "#141D17",
    "--surface-2": "#EAB308",
    "--border": "rgba(34, 197, 94, 0.2)",
    "--primary": "#22C55E",
    "--primary-soft": "rgba(34, 197, 94, 0.1)",
    "--accent": "#FEF08A",
    "--text": "#ECFDF5",
    "--text-muted": "rgba(236, 253, 245, 0.4)",
    animation: "fireflies",
  },

  retro_handheld: {
    "--bg": "#E0E0E0",
    "--surface": "#F5F5F5",
    "--surface-2": "#A0A0A0",
    "--border": "#4A4A4A",
    "--primary": "#4A4A4A",
    "--primary-soft": "rgba(74, 74, 74, 0.1)",
    "--accent": "#FF0000",
    "--text": "#1A1A1A",
    "--text-muted": "#4A4A4A",
    animation: "pixels",
  },

  classic_desktop: {
    "--bg": "#008080",
    "--surface": "#C0C0C0",
    "--surface-2": "#FFFFFF",
    "--border": "#000000",
    "--primary": "#000080",
    "--primary-soft": "rgba(0, 0, 128, 0.1)",
    "--accent": "#C0C0C0",
    "--text": "#000000",
    "--text-muted": "#404040",
    animation: "cursors",
  },

  farm_life: {
    "--bg": "#78B159",
    "--surface": "#F4EBD0",
    "--surface-2": "#8B5A2B",
    "--border": "#4D331F",
    "--primary": "#FF8C00",
    "--primary-soft": "rgba(255, 140, 0, 0.1)",
    "--accent": "#EE4B2B",
    "--text": "#2D1B1B",
    "--text-muted": "#5C4033",
    animation: "crops",
  },

  cozy_cafe: {
    "--bg": "#E6CCB2",
    "--surface": "#EDE0D4",
    "--surface-2": "#7F5539",
    "--border": "#9C6644",
    "--primary": "#B08968",
    "--primary-soft": "rgba(176, 137, 104, 0.1)",
    "--accent": "#DDB892",
    "--text": "#432818",
    "--text-muted": "#7F5539",
    animation: "steam",
  },

  icy_heir: {
    "--bg": "#F8FBFF",
    "--surface": "#EEF5FF",
    "--surface-2": "#D9E7FF",
    "--border": "rgba(11, 15, 26, 0.16)",
    "--primary": "#A9C8FF",
    "--primary-soft": "rgba(169, 200, 255, 0.18)",
    "--accent": "#D7DCE6",
    "--text": "#0B0F1A",
    "--text-muted": "rgba(11, 15, 26, 0.55)",
    animation: "cold_flash",
  },

  steel_ink: {
    "--bg": "#F2F6FF",
    "--surface": "#E6EEFF",
    "--surface-2": "#C7D8FF",
    "--border": "rgba(25, 32, 48, 0.22)",
    "--primary": "#7AA7FF",
    "--primary-soft": "rgba(122, 167, 255, 0.16)",
    "--accent": "#BFC7D6",
    "--text": "#111827",
    "--text-muted": "rgba(17, 24, 39, 0.55)",
    animation: "curving_bullets",
  },

  zenin_glint: {
    "--bg": "#F6FAFF",
    "--surface": "#EAF2FF",
    "--surface-2": "#D7E6FF",
    "--border": "rgba(11, 15, 26, 0.18)",
    "--primary": "#A9C8FF",
    "--primary-soft": "rgba(169, 200, 255, 0.18)",
    "--accent": "#C8CDD8",
    "--text": "#0B0F1A",
    "--text-muted": "rgba(11, 15, 26, 0.55)",
    animation: "zenin_glint",
  },

  zenin_frame: {
    "--bg": "#EEF5FF",
    "--surface": "#DDEAFF",
    "--surface-2": "#C7DCFF",
    "--border": "rgba(13, 20, 35, 0.22)",
    "--primary": "#7FB0FF",
    "--primary-soft": "rgba(127, 176, 255, 0.16)",
    "--accent": "#B9C2D3",
    "--text": "#0A1020",
    "--text-muted": "rgba(10, 16, 32, 0.6)",
    animation: "zenin_frame",
  },

  heavenly_restriction: {
    "--bg": "#0B0D10",
    "--surface": "#11151B",
    "--surface-2": "#1B2330",
    "--border": "rgba(231, 220, 193, 0.18)",
    "--primary": "#2F7A6A",
    "--primary-soft": "rgba(47, 122, 106, 0.16)",
    "--accent": "#E7DCC1",
    "--text": "#F3F4F6",
    "--text-muted": "rgba(243, 244, 246, 0.60)",
    animation: "curving_bullets",
  },

  cursed_worm: {
    "--bg": "#07090B",
    "--surface": "#0E1218",
    "--surface-2": "#151D25",
    "--border": "rgba(148, 163, 184, 0.18)",
    "--primary": "#8B5E3C",
    "--primary-soft": "rgba(139, 94, 60, 0.18)",
    "--accent": "#9AA6B2",
    "--text": "#F8FAFC",
    "--text-muted": "rgba(248, 250, 252, 0.58)",
    animation: "cold_flash",
  },

  inverted_spear: {
    "--bg": "#0A0A0A",
    "--surface": "#121212",
    "--surface-2": "#1A1A1A",
    "--border": "rgba(217, 119, 6, 0.16)",
    "--primary": "#D97706",
    "--primary-soft": "rgba(217, 119, 6, 0.16)",
    "--accent": "#2DD4BF",
    "--text": "#FAFAFA",
    "--text-muted": "rgba(250, 250, 250, 0.55)",
    animation: "zenin_glint",
  },

  /*
    Paste the rest of your existing themes here.

    Cleanup rules:
    - Keep quotes around CSS variables like "--bg".
    - Change "animation": "name" to animation: "name".
    - Add commas between every theme.
    - You no longer need to add "--bg-spot-1" or "--bg-spot-2" to every theme,
      because defaults fill them in automatically.
  */
};
const THEME_DEFAULTS = {
  "--bg": "#FFFFFF",
  "--surface": "#FFFFFF",
  "--surface-2": "#F3F4F6",
  "--border": "rgba(0, 0, 0, 0.12)",
  "--primary": "#A7ABDE",
  "--primary-soft": "rgba(167, 171, 222, 0.25)",
  "--accent": "#FFA5D6",
  "--text": "#2B2B33",
  "--text-muted": "rgba(43, 43, 51, 0.65)",
  "--bg-spot-1": "transparent",
  "--bg-spot-2": "transparent",
};

// Fill missing theme values without changing the original THEMES structure.
for (const [themeId, theme] of Object.entries(THEMES)) {
  THEMES[themeId] = {
    ...THEME_DEFAULTS,
    ...theme,
  };
}
window.allThemes = THEMES;
 
/* ------------------- Helpers (Robust & Balanced) ------------------- */
function applyVars(vars) {
  if (!vars) return;
  for (const [k, v] of Object.entries(vars)) {
    document.documentElement.style.setProperty(k, v);
  }
}

async function applyTheme(themeName) {
  // 1. XP Threshold Check (Locked Themes)
  const lockedThemes = ["golden_petal", "six_paths_sage", "celestial_sovereignty", "infinite_zen", "omniscient_origin", "reanimated_legend", "threads_of_fate", "eternal_nirvana", "empty_throne", "honored_one", "reapers_moon", "the_origin" , "void_century", "pure_zen", "the_akashic_record", "true_transcendence"
];

  if (lockedThemes.includes(themeName)) {
    // Safety: use Number() and || 0 to prevent NaN breaking the math
    const wb = Number(localStorage.getItem("petal_whiteboard_count")) || 0;
    const vs = Number(localStorage.getItem("petal_vision_count")) || 0;
    const cp = Number(localStorage.getItem("petal_capsule_count")) || 0;
    const wl = Number(localStorage.getItem("petal_well_count")) || 0;
    const dj = Number(localStorage.getItem("petal_dojo_xp")) || 0;
    const sm = Number(localStorage.getItem("petal_summon_xp")) || 0;
    
    let entries = [];
    try { 
      entries = JSON.parse(localStorage.getItem("petal_entries_v1") || "[]"); 
    } catch (e) { entries = []; }

    let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30) + dj + sm;
    entries.forEach(e => {
       const words = (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
       totalXP += words;
    });

    // Tier validation
    if (themeName === "golden_petal" && totalXP < 800) { themeName = "petal"; toast("Level 5 Required"); }
    else if (themeName === "six_paths_sage" && totalXP < 1800) { themeName = "petal"; toast("Level 10 Required"); }
    else if (themeName === "celestial_sovereignty" && totalXP < 3000) { themeName = "petal"; toast("Level 15 Required"); }
    else if (themeName === "infinite_zen" && totalXP < 4000) { themeName = "petal"; toast("Level 20 Required"); }
    else if (themeName === "omniscient_origin" && totalXP < 5800) { themeName = "petal"; toast("Level 30 Required"); }
    else if (themeName === "reanimated_legend" && totalXP < 7800) { themeName = "petal"; toast("Level 40 Required"); }
    else if (themeName === "the_origin" && totalXP < 20000) { themeName = "petal"; toast("Level 100 Required"); }
  }

  // 2. Apply Colors
  const theme = THEMES[themeName] || THEMES.petal;
  applyVars(theme);
  localStorage.setItem("petal_theme", themeName);

  // 3. Trigger updates (Animations/Spotify)
  document.dispatchEvent(new CustomEvent('themeChanged'));
  
  // 4. Update UI ranks/glows immediately
  if (typeof checkUnlocks === "function") checkUnlocks();
}

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;
  
  notebook.classList.remove(
    "skin-ruled", "skin-grid", "skin-dots", 
    "skin-dark-ruled", "skin-dark-grid", "skin-dark-dots",
    "skin-rainy-paper", "skin-glitch-paper", "skin-holo-paper",
    "skin-hokage-scroll", "skin-prison-realm", "skin-toji-arsenal", "skin-eternal-bond"
  );

  const formattedName = String(skinName).replace("_", "-");
  notebook.classList.add(`skin-${formattedName}`);
  localStorage.setItem("petal_skin", skinName);
}

function applyFilter(filterId) {
  let filterOverlay = document.getElementById("screen-filter-overlay");
  if (!filterOverlay) {
    filterOverlay = document.createElement("div");
    filterOverlay.id = "screen-filter-overlay";
    document.body.prepend(filterOverlay);
  }
  
  filterOverlay.className = (filterId === "none" || !filterId) ? "" : filterId.replace("_", "-");
  localStorage.setItem("petal_equipped_filter", filterId || "none");
}

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg; 
  t.classList.add("show");
  clearTimeout(toast._id); 
  toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------- Firebase Logic (With Title Sync) ------------------- */
(() => {
  const auth = window.firebaseAuth;
  if (!auth) return;

  onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("authButton");
    const profBtn = document.getElementById("profileButton");
    const outBtn = document.getElementById("btnSignOut");

    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (profBtn) {
        profBtn.style.display = "inline-flex";
        
        // --- NEW: TITLE SYNC ---
        // Get the equipped title from memory
        const equippedTitle = localStorage.getItem("petal_equipped_title") || "none";
        const titleNames = {
          "title_sannin": "Legendary Sannin",
          "title_uchiha": "Ghost of the Uchiha",
          "title_honored": "The Honored One",
          "title_kage": "Shadow of the Leaf",
          "title_yonko": "The Strongest Man",
          "title_mednin": "The Medical-Nin",
          "title_joyboy": "Warrior of Liberation", // NEW
          "title_curse_king": "King of Curses",
          "title_fierce_wings": "Fierce Wings", // NEW
          "title_hellflame_sovereign": "Hellflame Sovereign",
        };

        let displayName = user.displayName || "My Profile";
        
        // If a title is equipped, add it to the button text
        if (equippedTitle !== "none" && titleNames[equippedTitle]) {
          profBtn.textContent = `[${titleNames[equippedTitle]}] ${displayName}`;
        } else {
          profBtn.textContent = displayName;
        }
        // ------------------------
      }
      if (outBtn) outBtn.style.display = "inline-flex";
    } else {
      setTimeout(() => {
        if (!auth.currentUser) {
          if (loginBtn) loginBtn.style.display = "inline-flex";
          if (profBtn) profBtn.style.display = "none";
          if (outBtn) outBtn.style.display = "none";
        }
      }, 2000);
    }
  });

  document.getElementById("btnSignOut")?.addEventListener("click", () => {
    signOut(auth).then(() => {
      // Clear session-specific data but keep tokens/owned items
      location.reload();
    });
  });
})();


/* ------------------- Journal (Balanced & Fully Fixed) ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;
  let activeTag = null;

  function getZenLevel() {
    const wb = Number(localStorage.getItem("petal_whiteboard_count")) || 0;
    const vs = Number(localStorage.getItem("petal_vision_count")) || 0;
    const cp = Number(localStorage.getItem("petal_capsule_count")) || 0;
    const wl = Number(localStorage.getItem("petal_well_count")) || 0;
    const dj = Number(localStorage.getItem("petal_dojo_xp")) || 0;
    const sm = Number(localStorage.getItem("petal_summon_xp")) || 0;
    let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30) + dj + sm;
    entries.forEach(e => totalXP += (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length);
    return Math.floor(totalXP / 200) + 1;
  }

  function checkUnlocks() {
    const lvl = getZenLevel();
    const owned = JSON.parse(localStorage.getItem("petal_owned_items") || "[]");
    console.log("Checking Unlocks for Level:", lvl);

    // 1. THEME DROPDOWN UNLOCKS
       const tiers = [
      { lvl: 5, val: "golden_petal", name: "✨ Golden Petal" },
      { lvl: 10, val: "six_paths_sage", name: "☀️ Six Paths Sage" },
      { lvl: 15, val: "celestial_sovereignty", name: "🌌 Celestial" },
      { lvl: 20, val: "infinite_zen", name: "💎 Infinite Zen" },
      { lvl: 30, val: "omniscient_origin", name: "👁️ Omniscient Origin" },
      { lvl: 40, val: "reanimated_legend", name: "📜 Reanimated Legend" },
      { lvl: 50, val: "threads_of_fate", name: "🧶 Threads of Fate" },
      { lvl: 60, val: "eternal_nirvana", name: "🧘‍♂️ Eternal Nirvana" },
      { lvl: 70, val: "empty_throne", name: "👑 Empty Throne" },
      { lvl: 80, val: "honored_one", name: "👁️ The Honored One" },
      { lvl: 90, val: "reapers_moon", name: "🌙 Reaper's Moon" },
      { lvl: 100, val: "the_origin", name: "💠 THE ORIGIN" },
      // --- NEW HIGH LEVELS ---
      { lvl: 500, val: "void_century", name: "📜 Void Century" },
      { lvl: 600, val: "pure_zen", name: "💎 Pure Zen" },
      { lvl: 800, val: "the_akashic_record", name: "📚 The Akashic Record" },
      { lvl: 1000, val: "true_transcendence", name: "💠 THE ZERO POINT" }
    ];


    tiers.forEach(tier => {
      const opt = document.querySelector(`option[value="${tier.val}"]`);
      if (opt) {
        opt.disabled = lvl < tier.lvl;
        opt.textContent = lvl >= tier.lvl ? tier.name : `🔒 Level ${tier.lvl}`;
      }
    });

    // 2. STICKERS (Level 5)
    document.querySelectorAll(".level-5-reward").forEach(el => el.style.display = lvl >= 5 ? "inline-flex" : "none");

        // 3. UI TRANSFORMATIONS (Rank-based visuals)
    document.querySelectorAll(".panel").forEach(p => {
      // 1. Clear ALL special rank classes first (including the new high-level ones)
      p.classList.remove(
        "kage-aura", "celestial-border", "hologram-panel", 
        "liquid-border", "cracked-stone", "floating-panel", 
        "king-shadow", "origin-ui", "ghost-ui", "singularity-ui"
      );
      
      // 2. Apply the highest tier you have earned
      if (lvl >= 1000) {
        p.classList.add("singularity-ui");
      } else if (lvl >= 500) {
        p.classList.add("ghost-ui"); // This triggers for your Level 600 status!
      } else if (lvl >= 100) {
        p.classList.add("origin-ui");
      } else if (lvl >= 70) {
        p.classList.add("king-shadow");
      } else if (lvl >= 60) {
        p.classList.add("floating-panel");
      } else if (lvl >= 40) {
        p.classList.add("cracked-stone");
      } else if (lvl >= 30) {
        p.classList.add("liquid-border");
      } else if (lvl >= 20) {
        p.classList.add("hologram-panel");
      } else if (lvl >= 15) {
        p.classList.add("celestial-border");
      } else if (lvl >= 10) {
        p.classList.add("kage-aura");
      }
    });


    // 4. RANK TEXT
    let rank = "Genin";
    if (lvl >= 5) rank = "Jonin";
    if (lvl >= 10) rank = "Kage";
    if (lvl >= 15) rank = "Celestial Sage";
    if (lvl >= 20) rank = "Transcendent One";
    if (lvl >= 30) rank = "Omniscient Sage 👁️";
    if (lvl >= 100) rank = "The Architect";
    if (lvl >= 500) rank = "Voice of the Void 🌌";
    if (lvl >= 600) rank = "Eternal Record Keeper 📜";
    if (lvl >= 800) rank = "Sage of Six Paths ☀️"; // The ultimate level
    if (lvl >= 1000) rank = "💠 ZERO POINT 💠";
    if ($("ninjaRank")) $("ninjaRank").textContent = `Rank: ${rank}`;

    // 5. SHOP ITEM UNLOCKS (Skins)
    const shopSkins = [
      { id: "optHokage", shopId: "layout_hokage", name: "📜 Hokage Scroll" },
      { id: "optBond", shopId: "layout_bond", name: "🍥 Eternal Bond" },
      { id: "optPrison", shopId: "layout_prison", name: "👁️ Prison Realm" },
      { id: "optRainy", shopId: "layout_rainy", name: "🌧️ Rainy Paper" },
      { id: "optGlitch", shopId: "layout_matrix", name: "👾 Glitch Paper" },
      { id: "optHolo", shopId: "layout_hologram", name: "💎 Holo Paper" },
      { id: "optToji", shopId: "layout_toji", name: "⛓️ Toji Arsenal" }
    ];

    shopSkins.forEach(skin => {
      const el = $(skin.id);
      if (el) {
        el.disabled = !owned.includes(skin.shopId);
        el.textContent = owned.includes(skin.shopId) ? skin.name : "🔒 Shop Item";
      }
    });

    // 6. FILTER UNLOCKS (MOVED INSIDE)
    const filterSelect = $("filterSelect");
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="none">None</option>';
      const filterMap = { "filter_crt": "📟 CRT Filter", "filter_dust": "📜 Dust Filter", "filter_vignette": "🎬 Vignette" };
      owned.forEach(id => {
        if (id.startsWith("filter_")) {
          const opt = document.createElement("option");
          opt.value = id;
          opt.textContent = filterMap[id] || "Atmosphere";
          filterSelect.appendChild(opt);
        }
      });
      filterSelect.value = localStorage.getItem("petal_equipped_filter") || "none";
    }
  }

  function renderList() {
    const list = $("entryList"); if (!list) return;
    const q = ($("search")?.value || "").toLowerCase();
    const filtered = entries.filter(e => {
        const matchTag = activeTag ? (e.tags || []).includes(activeTag) : true;
        const matchSearch = ((e.title||"") + (e.content||"")).toLowerCase().includes(q);
        return matchTag && matchSearch;
    }).sort((a,b) => b.updatedAt - a.updatedAt);
    list.innerHTML = filtered.map(e => `<div class="entry-card" data-id="${e.id}"><h4>${e.title || '(Untitled)'}</h4><p>${e.date} • ${e.mood}</p></div>`).join('');
    list.querySelectorAll('.entry-card').forEach(card => card.onclick = () => {
        const e = entries.find(ent => ent.id === card.dataset.id);
        activeId = e.id; 
        if($("date")) $("date").value = e.date; 
        if($("mood")) $("mood").value = e.mood; 
        if($("title")) $("title").value = e.title; 
        if($("tagsInput")) $("tagsInput").value = (e.tags || []).join(', '); 
        if($("content")) $("content").innerHTML = e.content;
    });
    if ($("count")) $("count").textContent = filtered.length;
  }

  function renderTagChips() {
    const row = $("tagRow"); if (!row) return;
    const tags = new Set(["gratitude", "work", "health", "family"]);
    entries.forEach(e => e.tags && e.tags.forEach(t => tags.add(t.toLowerCase())));
    row.innerHTML = [...tags].sort().map(t => `<button class="chip tag ${activeTag === t ? 'active' : ''}" data-tag="${t}">${t}</button>`).join('');
    row.querySelectorAll('.chip.tag').forEach(btn => btn.onclick = () => { activeTag = activeTag === btn.dataset.tag ? null : btn.dataset.tag; renderTagChips(); renderList(); });
  }

  $("btnSave")?.addEventListener('click', async () => {
    const html = $("content").innerHTML;
    const data = { id: activeId || Date.now().toString(), date: $("date").value, mood: $("mood").value, title: $("title").value, content: html, tags: $("tagsInput").value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), updatedAt: Date.now() };
    const wordCount = (data.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    let tokens = (Number(localStorage.getItem("petal_tokens")) || 0) + 5 + Math.floor(wordCount / 50);
    localStorage.setItem("petal_tokens", tokens);
    
    if (!activeId) entries.push(data); else entries = entries.map(e => e.id === activeId ? data : e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    if (window.firebaseAuth?.currentUser) {
      try {
        await setDoc(doc(window.firebaseDb, "entries", data.id), { ...data, userId: window.firebaseAuth.currentUser.uid }, { merge: true });
        await setDoc(doc(window.firebaseDb, "users", window.firebaseAuth.currentUser.uid, "stats", "zen"), { whiteboard: Number(localStorage.getItem("petal_whiteboard_count")) || 0, well: Number(localStorage.getItem("petal_well_count")) || 0, tokens: tokens, updatedAt: Date.now() }, { merge: true });
      } catch (err) { console.error(err); }
    }
    renderList(); renderTagChips(); checkUnlocks(); toast("Saved & Synced! ✨🪙");
    
    // Dynamic Save Sound
    const equipped = localStorage.getItem("petal_equipped_sfx") || "default";
    let audio = (equipped === "default") ? $("saveSfx") : new Audio(`assets/${equipped.replace("sfx_", "")}.mp3`);
    if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); }
  });

  $("btnDelete")?.addEventListener('click', () => {
    if (!activeId || !confirm("Delete?")) return;
    entries = entries.filter(e => e.id !== activeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); 
    renderList(); renderTagChips(); checkUnlocks();
    activeId = null; if($("title")) $("title").value = ""; if($("content")) $("content").innerHTML = ""; toast("Deleted.");
    
    // Dynamic Delete Sound
    const equipped = localStorage.getItem("petal_equipped_delete_sfx") || "default";
    let audio = (equipped === "default") ? $("deleteSfx") : new Audio(`assets/${equipped.replace("sfx_", "")}.mp3`);
    if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); }
  });

  document.addEventListener("DOMContentLoaded", () => {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { entries = []; }
    renderList(); renderTagChips(); checkUnlocks();
    $("search")?.addEventListener('input', renderList);
  });
})();

/* ------------------- Music & Spotify ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const tracks = ["assets/lofi.mp3", "assets/elevator.mp3", "assets/monty.mp3", "assets/intro.mp3"];
  let trackIdx = Number(localStorage.getItem("petal_track_index") || "0") % tracks.length;

  function renderSpotify(base) {
    const host = $("spotifyEmbed"); if (!host || !base) return;
    const darks = new Set(["midnight", "cosmic_starfall", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "midnight_snowfall", "ninja_rivalry", "copy_ninja", "ghost_uchiha", "akatsuki_cloud", "hidden_rain", "legendary_sannin" , "springtime_youth" , "forbidden_lab" , "kamui_dimension" , "tactical_suiton" , "shadow_possession" , "butterfly_mode" , "hidan_ritual" , "kakuzu_hearts" , "eternal_beauty" , "monster_mist" , "stinky_aloe" , "uchiha_avenger" , "eternal_amaterasu" , "six_paths_pain", "ten_shadows", "cursed_manipulation", "death_painting", "blood_brother", "infinite_tsukuyomi"]);
    const theme = darks.has(localStorage.getItem("petal_theme")) ? "dark" : "light";
    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:352px; border:0; border-radius:16px;" src="${base}?theme=${theme}" loading="lazy"></iframe>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const bgm = $("bgm"); if (!bgm) return;
    bgm.volume = Number(localStorage.getItem("petal_music_vol") || 0.35);
    bgm.src = tracks[trackIdx];
    $("btnMusic")?.addEventListener("click", () => { if (bgm.paused) bgm.play(); else bgm.pause(); $("btnMusic").textContent = bgm.paused ? "Play Music" : "Pause Music"; });
    $("btnNextTrack")?.addEventListener("click", () => { trackIdx = (trackIdx + 1) % tracks.length; bgm.src = tracks[trackIdx]; bgm.play(); localStorage.setItem("petal_track_index", trackIdx); });

    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) renderSpotify(saved);
    $("btnSetSpotify")?.addEventListener("click", () => {
        const match = $("spotifyUrl").value.match(/(?:playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
        if (match) {
            let type = 'playlist';
            if ($("spotifyUrl").value.includes('track/')) type = 'track';
            const base = `https://open.spotify.com/embed/${type}/${match[1]}`;
            localStorage.setItem("petal_spotify_embed", base); renderSpotify(base);
        }
    });
    $("btnClearSpotify")?.addEventListener("click", () => { localStorage.removeItem("petal_spotify_embed"); $("spotifyEmbed").innerHTML = ""; });
  });

  document.addEventListener('themeChanged', () => { renderSpotify(localStorage.getItem("petal_spotify_embed")); });
})();

/* ------------------- Seasonal Animations (The Master Spawner) ------------------- */
(() => {
  const overlay = document.createElement("div");
  overlay.id = "animation-overlay";
  document.body.prepend(overlay);
  let animationInterval = null;

  function createParticle(type) {
    const p = document.createElement("div");
    const startX = Math.random() * window.innerWidth;

    switch (type) {
      // 1. BASIC SEASONS
      case "meteors":
        p.className = "meteor";
        p.style.left = startX + 400 + "px";
        p.style.top = "-50px";
        p.style.animationDuration = Math.random() * 1 + 0.5 + "s";
        break;
      case "leaves":
        p.className = "leaf";
        p.style.left = startX + "px";
        p.style.top = "-50px";
        p.style.animationDuration = Math.random() * 3 + 4 + "s";
        break;
      case "blossoms":
        p.className = "blossom";
        p.style.left = startX + "px";
        p.style.top = "-50px";
        p.style.animationDuration = Math.random() * 4 + 5 + "s";
        break;
      case "sunbeams":
        p.className = "sunbeam";
        p.style.left = startX + "px";
        p.style.top = "-150px";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "snow":
        p.className = "snowflake";
        p.style.left = startX + "px";
        p.style.top = "-10px";
        const snowSize = Math.random() * 4 + 2 + "px";
        p.style.width = snowSize;
        p.style.height = snowSize;
        p.style.animationDuration = Math.random() * 3 + 5 + "s";
        break;

      // 2. NARUTO THEMES
      case "aura":
        p.className = Math.random() > 0.3 ? "aura-flame" : "aura-flame aura-orange";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-100px";
        p.style.animationDuration = Math.random() * 1.5 + 1.5 + "s";
        break;
      case "teleport":
        p.className = "flash-spark";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.setProperty("--rot", `${Math.random() * 360}deg`);
        p.style.animationDuration = "0.25s";
        break;
      case "pearls":
        p.className = "pearl";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        const pearlSize = Math.floor(Math.random() * 12 + 10) + "px";
        p.style.width = pearlSize;
        p.style.height = pearlSize;
        p.style.animationDelay = Math.random() * 5 + "s";
        break;
      case "sage_history":
        const isLeaf = Math.random() > 0.3;
        p.className = isLeaf ? "sage-leaf" : "ink-blot";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = isLeaf ? "-20px" : Math.random() * 100 + "vh";
        p.style.animationDuration = isLeaf ? Math.random() * 4 + 6 + "s" : "4s";
        break;
      case "snakes":
        p.className = "snake-line";
        p.style.left = "-50px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 4 + 6 + "s";
        break;
      case "tomoe":
        p.className = "tomoe";
        p.textContent = "©";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "4s";
        break;
      case "warps":
        p.className = "kamui-warp";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "3s";
        break;
      case "black_fire":
        p.className = "black-flame";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        if (Math.random() > 0.5) p.style.transform = "scaleX(-1)";
        break;
      case "feathers":
        p.className = "feather";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-30px";
        p.style.animationDuration = Math.random() * 4 + 5 + "s";
        if (Math.random() > 0.5) p.style.transform = "scaleX(-1)";
        break;
      case "truth_orbs":
        p.className = "truth-orb";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDelay = Math.random() * 5 + "s";
        break;
      case "hundred_seals":
        p.className = "diamond-seal";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "4s";
        break;
      case "malice":
        p.className = "malice-orb";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        if (Math.random() > 0.8) {
          p.style.background = "#F97316";
          p.style.boxShadow = "0 0 20px 4px #F97316";
        }
        break;
      case "wood_style":
        const woodRand = Math.random();
        if (woodRand > 0.92) {
          p.className = "sage-mark";
          p.style.left = "50vw";
          p.style.top = "50vh";
          p.style.transform = "translate(-50%, -50%)";
          p.style.animationDuration = "5s";
        } else if (woodRand > 0.65) {
          p.className = "wood-vine";
          p.style.left = Math.random() * 100 + "vw";
          p.style.bottom = "-50px";
          p.style.setProperty("--rot", `${Math.random() * 360}deg`);
          p.style.animationDuration = "6s";
        } else {
          p.className = "wood-petal";
          p.style.left = Math.random() * 100 + "vw";
          p.style.top = "-20px";
          p.style.animationDuration = Math.random() * 3 + 4 + "s";
        }
        break;
      case "bubbles":
        if (Math.random() > 0.6) {
          p.className = "water-ripple";
          p.style.left = Math.random() * 100 + "vw";
          p.style.top = Math.random() * 100 + "vh";
        } else {
          p.className = "water-drop";
          p.style.left = Math.random() * 100 + "vw";
          p.style.bottom = "-20px";
        }
        p.style.animationDuration = "4s";
        break;
      case "spirals":
        p.className = "uzumaki-spiral";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "5s";
        break;
      case "bolts":
        p.className = "chidori-bolt";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        p.style.animationDuration = "0.3s";
        break;
      case "sharks":
        p.className = "shark-fin";
        p.style.left = "-40px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "flytraps":
        p.className = "flytrap-spike";
        p.style.left = Math.random() * 100 + "vw";
        const isTop = Math.random() > 0.5;
        p.style[isTop ? "top" : "bottom"] = "-10px";
        if (isTop) p.style.transform = "rotate(180deg)";
        p.style.animationDuration = "3s";
        break;
      case "love_sand":
        p.className = "love-kanji";
        p.textContent = "愛";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-40px";
        p.style.animationDuration = Math.random() * 3 + 4 + "s";
        break;
      case "shadows":
        const edge = Math.random();
        if (edge > 0.5) {
          p.style.bottom = "-50px";
          p.style.left = Math.random() * 100 + "vw";
          p.style.setProperty("--rot", `${Math.random() * 40 - 20}deg`);
        } else {
          p.style.top = Math.random() * 100 + "vh";
          p.style.left = edge > 0.25 ? "-50px" : "100vw";
          p.style.setProperty("--rot", edge > 0.25 ? "90deg" : "-90deg");
        }
        p.className = "shadow-tendril";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "edo_shards":
        p.className = "paper-sheet";
        p.style.backgroundColor = "#262626";
        p.style.boxShadow = "0 0 10px #63B3ED";
        break;
      case "fate_lines":
        p.className = "fate-line";
        p.style.top = Math.random() * 100 + "vh";
        break;

      // AKATSUKI & AME TRIO
      case "jashin":
        p.className = "jashin-seal";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        p.style.animationDuration = "5s";
        break;
      case "clouds":
        p.className = "red-cloud";
        p.style.left = "-60px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 10 + 15 + "s";
        break;
      case "threads":
        p.className = "stitch-thread";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-70px";
        p.style.animationDuration = Math.random() * 3 + 4 + "s";
        break;
      case "explosive_birds":
        p.className = "clay-bird";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        p.style.animationDuration = "3s";
        break;
      case "puppet_strings":
        p.className = "puppet-string";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "0";
        break;
      case "paper":
        p.className = "paper-sheet";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-30px";
        p.style.animationDuration = Math.random() * 3 + 4 + "s";
        break;
      case "gravity":
        p.className = "gravity-ring";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "tobi_swirl":
        p.className = "tobi-spiral";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "rain":
        p.className = "rain-drop";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        p.style.animationDuration = Math.random() * 0.4 + 0.6 + "s";
        break;
      case "seals":
        const kanji = ["蝦", "蛞", "蛇"];
        p.className = "kanji-seal";
        p.textContent = kanji[Math.floor(Math.random() * kanji.length)];
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "5s";
        break;

      // 3. JJK THEMES
      case "infinity":
        p.className = "infinity-ring";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "4s";
        break;
      case "slashes":
        p.className = "sukuna-slash";
        p.style.left = Math.random() * 80 + 10 + "vw";
        p.style.top = Math.random() * 80 + 10 + "vh";
        p.style.setProperty("--rot", `${Math.random() * 360}deg`);
        p.style.animationDuration = "0.3s";
        break;
      case "shikigami":
        p.className = "shadow-wolf";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "10vh";
        break;
      case "cursed_orbs":
        p.className = "cursed-orb";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "blood_streaks":
        p.className = "blood-streak";
        p.style.left = "-100px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
        break;
      case "impacts":
        p.className = "impact-ring";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "supernova":
        p.className = "blood-orb";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "3s";
        p.style.animationDelay = Math.random() * 2 + "s";
        break;
      case "clock_ticks":
        p.className = "clock-hand";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        p.style.animationDuration = Math.random() * 2 + 4 + "s";
        break;
      case "summer_clouds":
        p.className = "summer-cloud";
        p.style.top = Math.random() * 40 + "vh";
        p.style.left = "-150px";
        p.style.width = Math.random() * 100 + 100 + "px";
        p.style.animationDuration = Math.random() * 10 + 15 + "s";
        break;
      case "dimensional_tears":
        p.className = "tear";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "2s";
        break;
      case "reality_strings":
        p.className = "zen-shard";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "10s";
        break;
      case "cold_flash":
        p.className = "cold-flake";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = -10 - Math.random() * 20 + "vh";
        p.style.opacity = (Math.random() * 0.5 + 0.25).toFixed(2);
        p.style.animationDuration = Math.random() * 2 + 2.5 + "s";
        p.style.animationDelay = Math.random() * 1.5 + "s";
        p.style.setProperty("--drift", Math.random() * 60 - 30 + "px");
        break;
      case "curving_bullets":
        p.className = "curve-bullet";
        p.style.left = -40 - Math.random() * 80 + "px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 1.2 + 1.4 + "s";
        p.style.animationDelay = Math.random() * 0.8 + "s";
        p.style.setProperty("--arc", Math.random() * 160 - 80 + "px");
        p.style.setProperty("--spin", Math.random() * 240 - 120 + "deg");
        break;
      case "sniper_bullets":
        p.className = "sniper-shot";
        p.style.left = "-40px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = "0.6s";
        break;
      case "zenin_glint":
        p.className = "zenin-glint";
        p.style.left = -20 - Math.random() * 30 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 1.2 + 1.8 + "s";
        p.style.animationDelay = Math.random() * 1.2 + "s";
        p.style.setProperty("--glint-rot", `${-12 + Math.random() * 24}deg`);
        break;
      case "zenin_frame":
        p.className = "zenin-frame-pulse";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 1.5 + 2.5 + "s";
        p.style.animationDelay = Math.random() * 1.5 + "s";
        p.style.setProperty("--pulse-size", Math.random() * 40 + 40 + "px");
        break;

      // 4. ONE PIECE THEMES
      case "air_cracks":
        p.className = "air-crack";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.setProperty("--rot", `${Math.random() * 360}deg`);
        p.style.animationDuration = "0.4s";
        break;
      case "room_scan":
        p.className = "room-circle";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "drum_beats":
        p.className = "drum-beat";
        p.textContent = "DUM!";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "hearts":
        p.className = "snowflake";
        p.style.backgroundColor = "#F43F5E";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-10px";
        break;

      // 5. VIBE THEMES
      case "glitch":
        p.className = "glitch-box";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.backgroundColor = Math.random() > 0.5 ? "#FF007A" : "#00F3FF";
        break;
      case "plankton":
        p.className = "plankton";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDelay = Math.random() * 10 + "s";
        break;
      case "fireflies":
        p.className = "firefly";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDelay = Math.random() * 4 + "s";
        break;
      case "fans":
        p.className = "paper-fan";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        p.style.animationDuration = Math.random() * 4 + 6 + "s";
        break;
      case "arms":
        p.className = "flower-arm";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "pixels":
        p.className = "pixel-heart";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "cursors":
        p.className = "pixel-cursor";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDelay = Math.random() * 5 + "s";
        break;
      case "crops":
        p.className = "pixel-crop";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        p.style.backgroundColor = Math.random() > 0.5 ? "#FF8C00" : "#78B159";
        break;
      case "steam":
        p.className = "pixel-steam";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "10vh";
        p.style.animationDuration = Math.random() * 2 + 2 + "s";
        break;
      case "lightning":
        p.className = "lightning";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "0";
        p.style.animationDuration = "0.4s";
        break;
      case "star_shards":
        p.className = "star-shard";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDelay = Math.random() * 3 + "s";
        break;
      case "dream_waves":
        if (Math.random() > 0.4) {
          p.className = "tsukuyomi-ripple";
          p.style.left = Math.random() * 100 + "vw";
          p.style.top = Math.random() * 100 + "vh";
        } else {
          p.className = "soul-cocoon";
          p.style.left = Math.random() * 100 + "vw";
          p.style.top = "-30px";
        }
        break;
      case "divine_aura":
        p.className = "zen-shard";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDelay = Math.random() * 5 + "s";
        break;
      case "embers":
        p.className = "ember";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "sand":
        p.className = "sand-grain";
        p.style.left = "-10px";
        p.style.top = Math.random() * 100 + "vh";
        p.style.animationDuration = Math.random() * 1 + 2 + "s";
        break;

      // PRIDE THEMES
      case "pride_rainbow":
        p.className = "rainbow-trail";
        p.style.top = Math.random() * 100 + "vh";
        p.style.left = "-50px";
        break;
      case "pride_sunset":
        p.className = "sunset-ray";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-60px";
        break;
      case "pride_gay":
        p.className = "ocean-drop";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        break;
      case "pride_bi":
        p.className = "bi-star";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "pride_trans":
        p.className = "trans-bubble";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        const bubbleSize = Math.random() * 15 + 10 + "px";
        p.style.width = bubbleSize;
        p.style.height = bubbleSize;
        break;

      // MHA THEMES
      case "ofa_sparks":
        p.className = "ofa-spark";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "blue_fire":
        p.className = "blue-flame";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "red_feathers":
        p.className = "red-feather";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "void_tendrils":
        p.className = "void-tendril";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-50px";
        p.style.setProperty("--rot", `${Math.random() * 40 - 20}deg`);
        p.style.animationDuration = "4s";
        break;
      case "ash_decay":
        p.className = "ash-flake";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        const flakeSize = Math.random() * 5 + 2 + "px";
        p.style.width = flakeSize;
        p.style.height = flakeSize;
        p.style.animationDuration = Math.random() * 2 + 3 + "s";
        break;
      case "hell_flame":
        p.className = "hell-flame";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-30px";
        if (Math.random() > 0.5) p.style.background = "#F59E0B";
        p.style.animationDuration = Math.random() * 1 + 2 + "s";
        break;
      case "poneglyphs":
        const symbols = ["𓀀", "𓀁", "𓀂", "𓀃", "𓀄", "𓀅"];
        p.className = "poneglyph";
        p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-30px";
        p.style.animationDuration = Math.random() * 5 + 5 + "s";
        break;
      case "full_cowl":
        p.className = "cowl-spark";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.backgroundColor = Math.random() > 0.7 ? "#F43F5E" : "#10B981";
        p.style.setProperty("--rot", `${Math.random() * 360}deg`);
        break;
      case "nitros":
        p.className = "nitro-pop";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        break;
      case "binding_scarves":
        p.className = "eraser-scarf";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px";
        p.style.setProperty("--rot", `${Math.random() * 60 - 30}deg`);
        p.style.animationDuration = Math.random() * 2 + 4 + "s";
        break;
      case "ice_and_fire":
        const isIce = Math.random() > 0.5;
        p.className = isIce ? "ice-shard" : "fire-spark";
        p.style.left = Math.random() * 100 + "vw";
        if (isIce) {
          p.style.top = "-20px";
          p.style.animationDuration = Math.random() * 2 + 3 + "s";
        } else {
          p.style.bottom = "-20px";
          p.style.animationDuration = Math.random() * 1 + 2 + "s";
        }
        break;

      default:
        return null;
    }

    return p;
  }

  function startAnimation(type) {
    if (animationInterval) clearInterval(animationInterval);
    overlay.innerHTML = "";
    if (!type) return;

    const fastTypes = ["teleport", "bolts", "slashes", "air_cracks", "glitch", "lightning"];
    const intervalTime = fastTypes.includes(type) ? 80 : 800;

    animationInterval = setInterval(() => {
      const particle = createParticle(type);
      if (particle) {
        overlay.appendChild(particle);
        setTimeout(() => particle.remove(), 8000);
      }
    }, intervalTime);
  }

  document.addEventListener("themeChanged", () => {
    const themeKey = localStorage.getItem("petal_theme");
    // Look up animation type directly from THEMES config object if present
    const animType = (typeof THEMES !== "undefined" && THEMES[themeKey]?.animation)
      ? THEMES[themeKey].animation
      : null;

    startAnimation(animType);
  });
})();


/* ------------------- Stickers & Prompts Logic ------------------- */
  const promptsList = [
    // --- JJK / Sorcerer Prompts ---
    "Nanami says 'Overtime is a drag.' What is one task you need to finish *now* so you can truly rest?",
    "‘Are you the strongest because you’re you?’ What is one unique trait that defines you at your core?",
    "If you could use a Domain Expansion to create your perfect safe space, what would it look like?",
    "Choso lives for his brothers. Who are the people in your life that feel like 'family'?",
    "Like Megumi’s shadows, we all have parts we hide. What is one 'shadow' part of yourself you’re accepting?",
    "Nanami says being an adult is a series of little despairs. What was one small frustration today?",
    "Nobara never apologizes for being herself. What is one thing you love about your personality?",
    "Yuji fights to give people a 'proper death.' What does a 'proper life' look like to you right now?",
    "Geto struggled with the weight of his mission. Are you carrying a burden that isn't yours to bear?",
    "Recall a moment today where you felt like you were in the 'Zone' (Black Flash). What were you doing?",
    "Toji walked away from the world that hurt him. What is something you’ve emotionally detached from just to survive?",
    "Toji trusted strength over sentiment. When was the last time you chose survival over softness?",
    "Toji moved like someone with nothing left to lose. What is something you act fearless about, even if you aren’t?",
    "Toji carried a quiet kind of emptiness. What has been feeling hollow in your life lately?",
    "Toji rejected the systems that rejected him. Have you ever stopped trying to be accepted somewhere you knew you didn’t belong?",
    "Toji lived by instinct. What is your gut trying to tell you that your mind keeps ignoring?",
    "Behind Toji’s coldness was a life shaped by pain. What part of you became hardened because it had to?",
    "Toji left destruction behind him. Is there a choice you made in survival mode that still follows you now?",
    "Naoya believed being superior meant never showing weakness. What vulnerability do you hide because you want to stay admired?",
    "Naoya cared deeply about status and image. How much of your confidence is real, and how much is performance?",
    "Naoya measured worth through power. Have you ever felt threatened by someone simply because they were growing?",
    "Naoya wanted to be seen as exceptional. How often do you feel the need to prove you’re better instead of just being enough?",
    "Pride can protect the ego but isolate the heart. Has your pride ever stopped you from apologizing or being honest?",
    "Naoya saw respect as something owed to him. What does genuine respect actually mean to you?",
    "Naoya feared being overshadowed. When someone shines around you, do you feel inspired, insecure, or both?",
    "Naoya built his identity around superiority. If you stripped away comparison, who would you be?",
    

    // --- Naruto / Founding Fathers Prompts ---
    "Hashirama built the Leaf from a dream. If you were starting a village today, what would be your first rule?",
    "Madara dreamed of a 'perfect' world. Describe your ideal dream world—what do you see?",
    "Tobirama was a master of tactics. What is the smartest decision you made for yourself today?",
    "If you were to plant a forest for the future, what 'seeds' of good habits are you planting right now?",
    "Itachi protected the village from the shadows. What is something kind you did today that no one saw?",
    "Obito felt lost in a 'world of lies.' What is one truth about yourself that you are holding onto?",
    "We all wear 'masks' like Tobi sometimes. What mask are you wearing today, and what happens when you take it off?",
    "Jiraiya believed in a world of understanding. Who did you try to understand a little better today?",
    "Tsunade says memories make us strong. Write down one memory that gives you strength when you're sad.",
    "Orochimaru sought knowledge. What is one piece of knowledge or a skill you want to keep forever?",
    "Gai Sensei says the 'Springtime of Youth' never ends! What made your heart beat faster with excitement today?",
    "Master Kakashi says those who abandon friends are scum. How did you show up for your circle today?",
    "Naruto never goes back on his word. What is one promise you made to yourself that you are keeping?",
    "Sakura mastered healing. What part of your heart or mind needs a little 'Healing Jutsu' tonight?",
    "Which Hidden Village matches your current mood? (Leaf, Sand, Cloud, etc.)",
    "‘A person grows up when they're able to overcome hardships.’ What is a hardship you are overcoming?",
    "If you were writing your own 'Gallant Tale,' what would the current chapter be titled?",
    "‘True art is an explosion!’ What was the most exciting or 'explosive' moment of your week?",
    "Minato moved with purpose and precision. Where in your life do you need to act more intentionally?",
    "Hinata found strength in quiet courage. When were you brave today, even if no one noticed?",
    "Gaara turned loneliness into compassion. How has one of your wounds made you softer or stronger?",
    "Shikamaru values calm thinking. What problem feels less heavy when you slow down and think it through?",
    "Neji believed fate was fixed—until he proved otherwise. What is one limit you want to break for yourself?",
    "Rock Lee had no natural talent for ninjutsu, but never gave up. What is something you are improving through effort alone?",
    "Killer Bee turns rhythm into power. What is something that helps you get back into your flow?",
    "Temari knows when to strike and when to hold back. Where in your life do you need better balance?",
    "Konan turned pain into something beautiful. What have you created from a difficult experience?",
    "Nagato wanted peace through suffering. What do you think creates real peace in a person’s life?",
    "Sasuke walked a path of revenge and loss. What is something from your past you are still learning to let go of?",
    "Choji learned that kindness is not weakness. In what way was your softness a strength today?",
    "Ino values connection and understanding. Who have you been emotionally connected to lately, and how has it affected you?",
    "Kiba trusts his instincts. What is your gut trying to tell you right now?",
    "Shino observes what others miss. What is one small detail from today that stayed with you?",
    "Haku believed true strength comes from protecting someone precious. What or who brings out your strongest self?",
    "Zabuza hid pain beneath toughness. What emotion have you been covering up lately?",
    "Pain asked, ‘How would you confront hatred?’ How do you usually respond when you feel hurt or misunderstood?",
    "Kurama carried hatred for years before learning trust. What part of you is still learning how to trust?",
    "The Will of Fire lives on through generations. What value or lesson do you want to pass on to others?",
    "If your life had a chakra nature right now, what would it be—fire, water, wind, earth, or lightning—and why?",
    "If you could create your own jutsu to help your current life, what would it do?",
    "What battle are you fighting silently that deserves more compassion?",
    "What would your ninja way be right now, in one sentence?",
    "If your current season of life were an arc in Naruto, what would fans call it?",
    "What is one burden you’ve been carrying that you’re ready to set down?",
    "Who in your life feels like your ‘sensei’ right now, and what are they teaching you?",
    "What part of yourself feels strongest today? What part feels tired?",
    "If your heart were a hidden village, what would it need more of to feel safe and thriving?",
    "What dream are you still protecting, even if progress feels slow?",

  ];

document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("promptCard");
  if (card) {
      card.textContent = localStorage.getItem("petal_prompt") || promptsList[0];
      document.getElementById("btnPrompt")?.addEventListener("click", () => {
          const next = promptsList[Math.floor(Math.random() * promptsList.length)];
          card.textContent = next; localStorage.setItem("petal_prompt", next);
      });
  }

  const picker = document.getElementById("imgPicker");
  document.getElementById("btnAddImage")?.addEventListener("click", () => picker?.click());
  picker?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]; if (!file || !window.firebaseAuth?.currentUser) return;
    try { toast("Uploading..."); const path = `entry_images/${window.firebaseAuth.currentUser.uid}/${Date.now()}_image`; const fileRef = storageRef(window.firebaseStorage, path); await uploadBytes(fileRef, file, { contentType: file.type }); const url = await getDownloadURL(fileRef); const img = document.createElement("img"); img.src = url; img.className = "sticker"; document.getElementById("content").appendChild(img); toast("Added!"); } catch (err) { alert("Failed"); }
  });

  const ownedItems = JSON.parse(localStorage.getItem("petal_owned_items") || "[]");
  const sBar = document.querySelector(".sticker-panel");
  const sMap = { "sticker_kunai": { name: "Kunai", file: "kunai.gif" }, "sticker_curse": { name: "Cursed Mark", file: "cursedmark.gif" }, "sticker_joyboy": { name: "Sun God", file: "sungod.gif" }, "sticker_chibigojo": { name: "Chibi Gojo", file: "gojo_chibi.gif" }, "sticker_cukootoji": { name: "Cukoo Toji", file: "cukoo_toji.gif" }, "sticker_sharingan_eye": { name: "Sharingan", file: "sharingan_eye.gif" }, "sticker_hawks": { name: "Hawks", file: "hawks.gif" }, };
  if (sBar) { ownedItems.forEach(id => { const i = sMap[id]; if (i && !document.querySelector(`[data-sticker="assets/${i.file}"]`)) { const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.dataset.sticker = `assets/${i.file}`; b.textContent = `✨ ${i.name}`; sBar.appendChild(b); } }); }
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sticker]");
  if (btn) { const img = document.createElement("img"); img.src = btn.dataset.sticker; img.className = "sticker"; document.getElementById("content").appendChild(img); }
});

/* ------------------- Initial Setup (Fully Unified) ------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  const $ = (id) => document.getElementById(id);
  
  // 1. Get all saved settings from memory
  const theme = localStorage.getItem("petal_theme") || "petal";
  const skin = localStorage.getItem("petal_skin") || "ruled";
  const filter = localStorage.getItem("petal_equipped_filter") || "none";
  const activePet = localStorage.getItem("petal_equipped_pet") || "none";

  // 2. Apply Visuals immediately
  try {
    // Await theme because it does XP calculations
    await applyTheme(theme); 
    applySkin(skin);
    applyFilter(filter);
  } catch (e) { 
    console.error("Visual application failed:", e); 
  }

  // 3. Link the Dropdown Menus (Theme, Skin, Filter)
  const tSel = $("themeSelect"); 
  const sSel = $("skinSelect");
  const fSel = $("filterSelect");

  if (tSel) {
    tSel.value = theme;
    tSel.onchange = (e) => applyTheme(e.target.value);
  }
  if (sSel) {
    sSel.value = skin;
    sSel.onchange = (e) => applySkin(e.target.value);
  }
  if (fSel) {
    fSel.value = filter;
    fSel.onchange = (e) => applyFilter(e.target.value);
  }

  // 4. DESK PET SYNC: Summon your Nendoroid companion
  const notebook = $("notebook");
  if (notebook && activePet !== "none") {
    let petContainer = $("activePet");
    if (!petContainer) {
      petContainer = document.createElement("div");
      petContainer.id = "activePet";
      petContainer.className = "desk-pet";
      notebook.appendChild(petContainer);
    }
    const petImgName = activePet.replace("pet_", "");
    petContainer.innerHTML = `<img src="assets/${petImgName}.png" alt="Companion">`;
    petContainer.style.display = "block";
  }

  // 5. Final Unlock Check (Stickers/Ranks/Shop Items)
  if (typeof checkUnlocks === "function") checkUnlocks();
  
  console.log("Initial Setup Complete! Rank and Level verified.");
});
