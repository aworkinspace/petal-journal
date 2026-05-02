// app.mjs (type="module")
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

/* ----------------------------- Theme Data ----------------------------- */
const THEMES = {
  petal: { "--bg": "var(--rose-50)", "--surface": "var(--rose-50)", "--surface-2": "var(--pink-200)", "--border": "var(--mauve-200)", "--primary": "var(--periwinkle-400)", "--primary-soft": "var(--periwinkle-200)", "--accent": "var(--pink-500)", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(167,171,222,.45)", "--bg-spot-2": "rgba(255,165,214,.35)" },
  lavender: { "--bg": "#F6F2FF", "--surface": "#F6F2FF", "--surface-2": "#EDE4FF", "--border": "#D8CBF2", "--primary": "#A7ABDE", "--primary-soft": "#CED1F8", "--accent": "#D7A6FF", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(215,166,255,.32)", "--bg-spot-2": "rgba(167,171,222,.28)" },
  sky_sorbet: { "--bg": "#F2FBFF", "--surface": "#F2FBFF", "--surface-2": "#DFF3FF", "--border": "#C7E4F5", "--primary": "#7DB6FF", "--primary-soft": "#CFE4FF", "--accent": "#FFA5D6", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(125,182,255,.30)", "--bg-spot-2": "rgba(255,165,214,.24)" },
  peach_milk: { "--bg": "#FFF6F0", "--surface": "#FFF6F0", "--surface-2": "#FFE3D2", "--border": "#F2CDBB", "--primary": "#A7ABDE", "--primary-soft": "#CED1F8", "--accent": "#FFB38A", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(255,179,138,.34)", "--bg-spot-2": "rgba(167,171,222,.24)" },
  lemon_cream: { "--bg": "#FFFCEB", "--surface": "#FFFCEB", "--surface-2": "#FFF2B8", "--border": "#E9DFA2", "--primary": "#9AB6FF", "--primary-soft": "#D6E3FF", "--accent": "#FFC857", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(255,200,87,.32)", "--bg-spot-2": "rgba(154,182,255,.22)" },
  dusky_rose: { "--bg": "#141016", "--surface": "#19131C", "--surface-2": "#241A26", "--border": "rgba(255,255,255,.14)", "--primary": "#B7A6FF", "--primary-soft": "rgba(183,166,255,.35)", "--accent": "#FF8FBC", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(183,166,255,.22)", "--bg-spot-2": "rgba(255,143,188,.16)" },
  mauve_night: { "--bg": "#100F14", "--surface": "#15131A", "--surface-2": "#201B25", "--border": "rgba(255,255,255,.14)", "--primary": "#9FB6FF", "--primary-soft": "rgba(159,182,255,.35)", "--accent": "#D7A6FF", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(159,182,255,.18)", "--bg-spot-2": "rgba(215,166,255,.14)" },
  deep_sage: { "--bg": "#0F1412", "--surface": "#141A17", "--surface-2": "#1C2621", "--border": "rgba(255,255,255,.14)", "--primary": "#93D1B3", "--primary-soft": "rgba(147,209,179,.35)", "--accent": "#FF9BB7", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(147,209,179,.18)", "--bg-spot-2": "rgba(255,155,183,.12)" },
  blueberry_dusk: { "--bg": "#0D101A", "--surface": "#12172A", "--surface-2": "#1A2140", "--border": "rgba(255,255,255,.14)", "--primary": "#8EA2FF", "--primary-soft": "rgba(142,162,255,.35)", "--accent": "#8FE3FF", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(142,162,255,.20)", "--bg-spot-2": "rgba(143,227,255,.12)" },
  cocoa_lilac: { "--bg": "#141014", "--surface": "#1A141B", "--surface-2": "#261C28", "--border": "rgba(255,255,255,.14)", "--primary": "#E2B3FF", "--primary-soft": "rgba(226,179,255,.35)", "--accent": "#FFB38A", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(226,179,255,.18)", "--bg-spot-2": "rgba(255,179,138,.10)" },
  midnight: { "--bg": "#0F0D14", "--surface": "#14121A", "--surface-2": "#1C1824", "--border": "rgba(255,255,255,.14)", "--primary": "#8EA2FF", "--primary-soft": "rgba(142,162,255,.35)", "--accent": "#FFA5D6", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(142,162,255,.18)", "--bg-spot-2": "rgba(255,165,214,.12)" },
  strawberry_matcha: { "--bg": "#F7FFF6", "--surface": "#F7FFF6", "--surface-2": "#E8F7E6", "--border": "#CFE6CC", "--primary": "#7FBF9B", "--primary-soft": "#CFEBDD", "--accent": "#FF8FB8", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(127,191,155,.28)", "--bg-spot-2": "rgba(255,143,184,.22)" },
  blueberry_yogurt: { "--bg": "#F4F6FF", "--surface": "#F4F6FF", "--surface-2": "#E2E7FF", "--border": "#CAD3FF", "--primary": "#7F8CFF", "--primary-soft": "#C9D0FF", "--accent": "#FFA5D6", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(127,140,255,.30)", "--bg-spot-2": "rgba(255,165,214,.20)" },
  cosmic_starfall: { "--bg": "#0D0B1A", "--surface": "#16142E", "--surface-2": "#231F4D", "--border": "rgba(183,166,255,.14)", "--primary": "#B7A6FF", "--primary-soft": "rgba(183,166,255,.25)", "--accent": "#FFD700", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(130,100,255,0.2)", "--bg-spot-2": "rgba(50,200,255,0.1)" },
  autumn_forest: { "--bg": "#FFF9F2", "--surface": "#FCF3E8", "--surface-2": "#F5E6D3", "--border": "#DBC7B5", "--primary": "#A67B5B", "--primary-soft": "#E3D5C4", "--accent": "#D95D39", "--text": "#4A3728", "--text-muted": "#856D5B" },
  spring_blossom: { "--bg": "#FFF5F8", "--surface": "#FEF0F5", "--surface-2": "#FDE2E9", "--border": "#F9C8D9", "--primary": "#FFB7C5", "--primary-soft": "#FFE4E8", "--accent": "#FF69B4", "--text": "#5E3A44", "--text-muted": "#8A6B74" },
  summer_shimmer: { "--bg": "#F0FBFF", "--surface": "#E3F7FF", "--surface-2": "#D1F2FF", "--border": "#B6E9FF", "--primary": "#00A8E8", "--primary-soft": "#BCEBFF", "--accent": "#FFD700", "--text": "#1A465C", "--text-muted": "#4B758E" },
  midnight_snowfall: { "--bg": "#0B0E14", "--surface": "#12161F", "--surface-2": "#1A202C", "--border": "rgba(255,255,255,.08)", "--primary": "#A0C4FF", "--primary-soft": "rgba(160,196,255,.2)", "--accent": "#FFFFFF", "--text": "#E0E6ED", "--text-muted": "rgba(224,230,237,.6)", "--bg-spot-1": "rgba(100,150,255,0.1)", "--bg-spot-2": "rgba(255,255,255,0.05)" },
  golden_petal: {
    "--bg": "#FFFDF0", 
    "--surface": "#FFFCDB",
    "--surface-2": "#FFF5AD",
    "--border": "#E6D695",
    "--primary": "#FFD700",
    "--primary-soft": "rgba(255, 215, 0, 0.3)",
    "--accent": "#DAA520",
    "--text": "#4A3F1F",
    "--text-muted": "#8B7D54",
    "--bg-spot-1": "rgba(255, 223, 0, 0.25)",
    "--bg-spot-2": "rgba(255, 255, 255, 0.5)",
    "animation": "sunbeams" // Re-uses the summer shimmer animation!
  },
    ninja_rivalry: {
    "--bg": "#0D0D1F", // Deep Uchiha Navy
    "--surface": "#16162D",
    "--surface-2": "#F97316", // Naruto Orange
    "--border": "rgba(59, 130, 246, 0.3)", // Chakra Blue
    "--primary": "#3B82F6", // Sasuke Blue
    "--primary-soft": "rgba(59, 130, 246, 0.2)",
    "--accent": "#EF4444", // Sharingan Red
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.6)",
    "--bg-spot-1": "rgba(59, 130, 246, 0.2)", // Chidori Glow
    "--bg-spot-2": "rgba(249, 115, 22, 0.15)", // Kyuubi Glow
    "animation": "sparks"
  },
  copy_ninja: {
    "--bg": "#1A1B26", // Muted Dark Navy
    "--surface": "#24283B",
    "--surface-2": "#414868", // Muted Jonin Grey/Blue
    "--border": "rgba(160, 233, 255, 0.2)", // Lightning Glow
    "--primary": "#A0E9FF", // Chidori Blue
    "--primary-soft": "rgba(160, 233, 255, 0.15)",
    "--accent": "#FF4C4C", // Sharingan Red
    "--text": "#C0CAF5",
    "--text-muted": "#565F89",
    "--bg-spot-1": "rgba(160, 233, 255, 0.1)", // Chidori glow
    "--bg-spot-2": "rgba(255, 76, 76, 0.05)",  // Red eye glow
    "animation": "lightning"
  },
    medical_kunoichi: {
    "--bg": "#FFF0F3", // Soft Sakura Pink
    "--surface": "#FFE3E8",
    "--surface-2": "#FBCFE8",
    "--border": "rgba(16, 185, 129, 0.2)", // Healing Green
    "--primary": "#10B981", // Chakra Green
    "--primary-soft": "rgba(16, 185, 129, 0.15)",
    "--accent": "#F43F5E", // Inner Sakura Red
    "--text": "#4C0519",
    "--text-muted": "#9F1239",
    "animation": "healing"
  },
    gallant_tale: {
    "--bg": "#F5E6D3", // Aged Parchment
    "--surface": "#FCF8F0",
    "--surface-2": "#8B0000", // Signature Jiraiya Red
    "--border": "rgba(139, 0, 0, 0.2)",
    "--primary": "#B45309", // Warm Sage Orange
    "--primary-soft": "rgba(180, 83, 9, 0.15)",
    "--accent": "#FACC15", // Toad Oil Gold
    "--text": "#2D1B1B", // Deep Ink
    "--text-muted": "#634832",
    "animation": "sage_history"
  },
  legendary_sannin: {
    "--bg": "#1E1B2E", // Deep Orochimaru Purple
    "--surface": "#2D2B4A",
    "--surface-2": "#B45309", // Jiraiya Sage Red/Orange
    "--border": "rgba(20, 184, 166, 0.3)", // Tsunade Teal
    "--primary": "#14B8A6", // Strength Teal
    "--primary-soft": "rgba(20, 184, 166, 0.2)",
    "--accent": "#FACC15", // Snake Gold
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.6)",
    "animation": "seals"
  },
  akatsuki_cloud: {
    "--bg": "#0A0A0C", // Obsidian
    "--surface": "#121217",
    "--surface-2": "#3D0000", // Blood Red
    "--border": "rgba(255, 0, 0, 0.15)",
    "--primary": "#FF0000", // Crimson
    "--primary-soft": "rgba(255, 0, 0, 0.1)",
    "--accent": "#FFFFFF", 
    "--text": "#E0E0E0",
    "--text-muted": "rgba(224, 224, 224, 0.5)",
    "animation": "clouds"
  },
  hidden_rain: {
    "--bg": "#111418", // Dark Stormy Grey
    "--surface": "#1B2026",
    "--surface-2": "#2C343D",
    "--border": "rgba(100, 149, 237, 0.2)",
    "--primary": "#6495ED", // Steel Blue
    "--primary-soft": "rgba(100, 149, 237, 0.1)",
    "--accent": "#87CEEB", // Sky Chakra
    "--text": "#D1D9E0",
    "--text-muted": "rgba(209, 217, 224, 0.5)",
    "animation": "rain"
  },
  kurama_sage: {
    "--bg": "#FFFBEB", // Pale Gold Cream
    "--surface": "#FEF3C7",
    "--surface-2": "#FDE68A",
    "--border": "rgba(245, 158, 11, 0.2)", 
    "--primary": "#F59E0B", // Golden Orange
    "--primary-soft": "rgba(245, 158, 11, 0.15)",
    "--accent": "#D97706", // Deep Amber
    "--text": "#451A03",
    "--text-muted": "#92400E",
    "animation": "embers"
  },
  hidden_sand: {
    "--bg": "#F5F5DC", // Light Beige Sand
    "--surface": "#EFEBD8",
    "--surface-2": "#D2B48C", // Tan
    "--border": "rgba(153, 27, 27, 0.15)", // Gourd Red tint
    "--primary": "#991B1B", // Desert Crimson
    "--primary-soft": "rgba(153, 27, 27, 0.1)",
    "--accent": "#B45309", // Warm Brown
    "--text": "#451A03",
    "--text-muted": "#78350F",
    "animation": "sand"
  },
  desert_love: {
    "--bg": "#F2E8CF", // Warm Sand
    "--surface": "#EAD7B1",
    "--surface-2": "#D4A373",
    "--border": "rgba(188, 71, 73, 0.2)", // Red tint
    "--primary": "#BC4749", // Gourd Red
    "--primary-soft": "rgba(188, 71, 73, 0.15)",
    "--accent": "#6A994E", // Eye Teal
    "--text": "#386641",
    "--text-muted": "#6A994E",
    "--bg-spot-1": "rgba(188, 71, 73, 0.05)",
    "--bg-spot-2": "rgba(255, 255, 255, 0.3)",
    "animation": "love_sand"
  },
    god_of_shinobi: {
    "--bg": "#E9F5DB", // Earthy Sage
    "--surface": "#CFE1B9",
    "--surface-2": "#718355", // Forest Green
    "--border": "rgba(113, 131, 85, 0.2)",
    "--primary": "#B56576", // Armor Red
    "--primary-soft": "rgba(181, 101, 118, 0.15)",
    "--accent": "#4F772D", // Mokuton Green
    "--text": "#31572C",
    "--text-muted": "#4F772D",
    "animation": "wood_style"
  },
  tactical_suiton: {
    "--bg": "#F0F8FF", // Ice Blue
    "--surface": "#D0E1F9",
    "--surface-2": "#4E6582", // Fur Collar Grey
    "--border": "rgba(30, 81, 123, 0.2)",
    "--primary": "#1E517B", // Deep Water Blue
    "--primary-soft": "rgba(30, 81, 123, 0.1)",
    "--accent": "#FFFFFF", 
    "--text": "#102A43",
    "--text-muted": "#334E68",
    "animation": "bubbles"
  },
  ghost_uchiha: {
    "--bg": "#0B0B0E", // Eternal Night
    "--surface": "#16161D",
    "--surface-2": "#3B1E54", // Susanoo Purple
    "--border": "rgba(255, 76, 76, 0.15)",
    "--primary": "#FF4C4C", // Mangekyou Red
    "--primary-soft": "rgba(255, 76, 76, 0.1)",
    "--accent": "#FACC15", // Gunbai Gold
    "--text": "#E2E8F0",
    "--text-muted": "rgba(226, 232, 240, 0.5)",
    "animation": "tomoe"
  },
  crow_illusion: {
    "--bg": "#08080A", // Uchiha Shadow
    "--surface": "#121217",
    "--surface-2": "#2D0A0A", // Crow Crimson
    "--border": "rgba(255, 0, 0, 0.1)",
    "--primary": "#FF3E3E", // Mangekyou Red
    "--primary-soft": "rgba(255, 62, 62, 0.1)",
    "--accent": "#4A4A4A", // Raven Grey
    "--text": "#E0E0E0",
    "--text-muted": "rgba(224, 224, 224, 0.5)",
    "animation": "feathers"
  },
  yellow_flash: {
    "--bg": "#FFFFFF", // Minato Cloak White
    "--surface": "#FFF9E6",
    "--surface-2": "#FFD700", // Flash Gold
    "--border": "rgba(0, 168, 232, 0.2)", // Teleport Teal
    "--primary": "#00A8E8", // Hokage Teal
    "--primary-soft": "rgba(0, 168, 232, 0.1)",
    "--accent": "#FF4500", // Seal Red
    "--text": "#333333",
    "--text-muted": "#666666",
    "animation": "teleport"
  },
  lavender_pearl: {
    "--bg": "#F3E8FF", // Hyuga Lavender
    "--surface": "#FAF5FF",
    "--surface-2": "#E9D5FF",
    "--border": "rgba(168, 85, 247, 0.2)",
    "--primary": "#A855F7", // Gentleness Purple
    "--primary-soft": "rgba(168, 85, 247, 0.1)",
    "--accent": "#FFFFFF", // Byakugan White
    "--text": "#44337A",
    "--text-muted": "#6B46C1",
    "animation": "pearls"
  },
  springtime_youth: {
    "--bg": "#0B1A0E", // Deep Jumpsuit Green
    "--surface": "#162B1A",
    "--surface-2": "#F97316", // Leg-warmer Orange
    "--border": "rgba(239, 68, 68, 0.3)", // Gate Red
    "--primary": "#22C55E", // Youth Green
    "--primary-soft": "rgba(34, 197, 94, 0.15)",
    "--accent": "#EF4444", // Eighth Gate Red
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.6)",
    "--bg-spot-1": "rgba(34, 197, 94, 0.1)", // Green aura glow
    "--bg-spot-2": "rgba(239, 68, 68, 0.1)",  // Red gate glow
    "animation": "aura"
  },

};

/* ------------------- Theme Helpers ------------------- */
function applyVars(vars) {
  if (!vars) return;
  for (const [k, v] of Object.entries(vars)) {
    document.documentElement.style.setProperty(k, v);
  }
}

function applyTheme(themeName) {
  // 1. Safety Check: Is the user actually Level 5?
  if (themeName === "golden_petal") {
     const wbSaves = parseInt(localStorage.getItem("petal_whiteboard_count") || "0");
     const visionSaves = parseInt(localStorage.getItem("petal_vision_count") || "0");
     const capsuleSaves = parseInt(localStorage.getItem("petal_capsule_count") || "0");
     const entries = JSON.parse(localStorage.getItem("petal_entries_v1") || "[]");
     
     // Calculate total XP roughly (same as your Level 5 logic)
     let totalXP = (entries.length * 50) + (wbSaves * 20) + (visionSaves * 30) + (capsuleSaves * 100);
     entries.forEach(e => {
       const words = (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
       totalXP += words;
     });

     // If total XP is less than 800 (which is Level 5), force back to petal
     if (totalXP < 800) { 
        themeName = "petal"; 
        toast("Reach Level 5 to unlock Golden Petal!");
     }
  } // <--- THIS BRACE was missing in your version!

  // 2. Standard theme applying logic
  if (themeName === "custom") {
    const raw = localStorage.getItem("petal_custom_theme_vars");
    if (raw) try { applyVars(JSON.parse(raw)); } catch {}
    localStorage.setItem("petal_theme", "custom");
  } else {
    const theme = THEMES[themeName] || THEMES.petal;
    applyVars(theme);
    localStorage.setItem("petal_theme", themeName);
  }

  // 3. Tell the rest of the site (Spotify, Animations) the theme changed
  document.dispatchEvent(new CustomEvent('themeChanged'));
}


function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;
  notebook.className = `panel panel-pad notebook skin-${skinName.replace("_", "-")}`;
  localStorage.setItem("petal_skin", skinName);
}

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._id); toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------- Firebase Logic ------------------- */
(() => {
  const auth = window.firebaseAuth;
  if (!auth) return;
  onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("authButton");
    const profBtn = document.getElementById("profileButton");
    const outBtn = document.getElementById("btnSignOut");
    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (profBtn) { profBtn.style.display = "inline-flex"; profBtn.textContent = user.displayName || "My Profile"; }
      if (outBtn) outBtn.style.display = "inline-flex";
    } else {
      if (loginBtn) loginBtn.style.display = "inline-flex";
      if (profBtn) profBtn.style.display = "none";
      if (outBtn) outBtn.style.display = "none";
    }
  });
  document.getElementById("btnSignOut")?.addEventListener("click", () => signOut(auth).then(() => toast("Logged out.")));
})();

/* ------------------- Journal Logic (With Level Unlocks) ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;
  let activeTag = null;

  // --- NEW: Level Calculation Helper ---
  function getZenLevel() {
    const wbSaves = parseInt(localStorage.getItem("petal_whiteboard_count") || "0");
    const visionSaves = parseInt(localStorage.getItem("petal_vision_count") || "0");
    const capsuleSaves = parseInt(localStorage.getItem("petal_capsule_count") || "0");
    
    let totalXP = (entries.length * 50) + (wbSaves * 20) + (visionSaves * 30) + (capsuleSaves * 100);
    entries.forEach(e => {
      const plainText = (e.content || "").replace(/<[^>]*>/g, ' ');
      totalXP += plainText.split(/\s+/).filter(Boolean).length;
    });

    return Math.floor(totalXP / 200) + 1; // Level 1 starts at 0 XP
  }

  // --- NEW: Function to toggle Level 5 stickers ---
    function checkUnlocks() {
    const currentLevel = getZenLevel();
    
    // 1. Stickers
    document.querySelectorAll(".level-5-reward").forEach(el => {
      el.style.display = currentLevel >= 5 ? "inline-flex" : "none";
    });

    // 2. Theme Dropdown
    const optGolden = document.getElementById("optGolden");
    if (optGolden) {
      if (currentLevel >= 5) {
        optGolden.disabled = false;
        optGolden.textContent = "✨ Golden Petal (Unlocked!)";
      } else {
        optGolden.disabled = true;
        optGolden.textContent = "🔒 Level 5: Golden Petal";
      }
    }
  }

  function allTagsFromEntries() {
    const DEFAULT_TAGS = ["gratitude", "work", "health", "family"];
    const set = new Set(DEFAULT_TAGS);
    entries.forEach(e => {
      if (e.tags) e.tags.forEach(t => set.add(t.toLowerCase()));
    });
    return [...set].sort();
  }

  function renderTagChips() {
    const tagRow = $("tagRow");
    if (!tagRow) return;
    const tags = allTagsFromEntries();
    tagRow.innerHTML = tags.map(t => `
      <button class="chip tag ${activeTag === t ? 'active' : ''}" data-tag="${t}" type="button">${t}</button>
    `).join('');

    tagRow.querySelectorAll('.chip.tag').forEach(btn => {
      btn.onclick = () => {
        const tag = btn.dataset.tag;
        activeTag = (activeTag === tag) ? null : tag;
        renderTagChips();
        renderList();
      };
    });
  }

  function renderList() {
    const list = $("entryList"); 
    if (!list) return;
    const q = ($("search")?.value || "").toLowerCase();
    const filtered = entries.filter(e => {
      const matchTag = activeTag ? (e.tags || []).includes(activeTag) : true;
      const matchSearch = ((e.title||"") + (e.content||"")).toLowerCase().includes(q);
      return matchTag && matchSearch;
    }).sort((a,b) => b.updatedAt - a.updatedAt);

    list.innerHTML = filtered.map(e => `
      <div class="entry-card" data-id="${e.id}">
        <h4>${e.title || '(Untitled)'}</h4>
        <p>${e.date} • ${e.mood}</p>
      </div>
    `).join('');
    
    list.querySelectorAll('.entry-card').forEach(card => {
      card.onclick = () => {
        const e = entries.find(ent => ent.id === card.dataset.id);
        activeId = e.id; 
        if($("date")) $("date").value = e.date; 
        if($("mood")) $("mood").value = e.mood; 
        if($("title")) $("title").value = e.title; 
        if($("tagsInput")) $("tagsInput").value = (e.tags || []).join(', '); 
        if($("content")) $("content").innerHTML = e.content;
      };
    });
    if ($("count")) $("count").textContent = filtered.length;
  }

  function resetEditor() {
    activeId = null; 
    if($("date")) $("date").value = new Date().toISOString().split('T')[0]; 
    if($("mood")) $("mood").value = "Calm"; 
    if($("title")) $("title").value = ""; 
    if($("content")) $("content").innerHTML = ""; 
    if($("tagsInput")) $("tagsInput").value = "";
  }

  $("btnNew")?.addEventListener('click', () => { 
    resetEditor(); 
    const sfx = $("newEntrySfx"); 
    if(sfx) sfx.play(); 
  });

  $("btnSave")?.addEventListener('click', () => {
    const contentHtml = $("content").innerHTML || "";
    const plainText = contentHtml.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const xpEarned = 50 + wordCount;

    const data = { 
      id: activeId || Date.now().toString(), 
      date: $("date").value, mood: $("mood").value, title: $("title").value, 
      content: contentHtml, tags: $("tagsInput").value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), 
      updatedAt: Date.now() 
    };

    if (!activeId) entries.push(data); 
    else entries = entries.map(e => e.id === activeId ? data : e);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); 
    renderList();      
    renderTagChips();  
    checkUnlocks(); // <--- UPDATE UNLOCKS ON SAVE
    
    toast(`Saved! +${xpEarned} Zen XP earned.`);
    const sfx = document.getElementById("saveSfx");
    if (sfx) { sfx.currentTime = 0; sfx.play().catch(() => {}); }
  });

  $("btnDelete")?.addEventListener('click', () => {
    if (!activeId || !confirm("Delete this entry?")) return;
    entries = entries.filter(e => e.id !== activeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); 
    renderList();
    renderTagChips();
    checkUnlocks(); // <--- UPDATE UNLOCKS ON DELETE
    resetEditor(); 
    toast("Deleted.");
    const sfx = $("deleteSfx"); if (sfx) sfx.play();
  });

  document.addEventListener("DOMContentLoaded", () => {
    try { 
      entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); 
    } catch { entries = []; }
    renderList(); 
    renderTagChips(); 
    checkUnlocks(); // <--- CHECK UNLOCKS ON LOAD
    $("search")?.addEventListener('input', renderList);
  });
})();

/* ------------------- Music & Spotify (Fixed & Debugged) ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const tracks = ["assets/lofi.mp3", "assets/elevator.mp3", "assets/monty.mp3", "assets/intro.mp3"];
  let trackIdx = Number(localStorage.getItem("petal_track_index") || "0") % tracks.length;

  // 1. MUSIC PLAYER LOGIC
  function initMusic() {
    const bgm = $("bgm");
    const btnMusic = $("btnMusic");
    const btnNext = $("btnNextTrack");
    if (!bgm || !btnMusic) return;

    bgm.volume = Number(localStorage.getItem("petal_music_vol") || 0.35);
    bgm.src = tracks[trackIdx];

    btnMusic.onclick = () => {
      if (bgm.paused) bgm.play().catch(e => console.log("Play blocked"));
      else bgm.pause();
      btnMusic.textContent = bgm.paused ? "Play Music" : "Pause Music";
    };

    if (btnNext) {
      btnNext.onclick = () => {
        trackIdx = (trackIdx + 1) % tracks.length;
        bgm.src = tracks[trackIdx];
        bgm.play();
        localStorage.setItem("petal_track_index", trackIdx);
      };
    }
  }

  // 2. SPOTIFY LOGIC
  function toEmbed(url) {
    console.log("Processing URL:", url);
    if (!url) return null;
    
    // Improved Regex to catch IDs even with ?si=... at the end
    const match = url.match(/(?:playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    
    const id = match[1];
    let type = 'playlist';
    if (url.includes('track/')) type = 'track';
    else if (url.includes('album/')) type = 'album';
    else if (url.includes('show/')) type = 'show';
    else if (url.includes('episode/')) type = 'episode';
    
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
    console.log("Generated Embed URL:", embedUrl);
    return embedUrl;
  }

  function renderSpotify(base) {
    const host = $("spotifyEmbed");
    if (!host || !base) return;
    const darks = new Set(["midnight", "cosmic_starfall", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "midnight_snowfall", "ninja_rivalry", "copy_ninja", "ghost_uchiha", "akatsuki_cloud", "hidden_rain", "legendary_sannin" , "springtime_youth" ]);
    const theme = darks.has(localStorage.getItem("petal_theme")) ? "dark" : "light";
    
    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:352px; border:0; border-radius:16px; margin-top:10px;" src="${base}?theme=${theme}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  // 3. ATTACH LISTENERS
  function initSpotify() {
    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) renderSpotify(saved);

    const btnSet = $("btnSetSpotify");
    const btnClr = $("btnClearSpotify");
    const urlInput = $("spotifyUrl");

    if (btnSet) {
      btnSet.onclick = () => {
        const rawUrl = urlInput.value.trim();
        const embed = toEmbed(rawUrl);
        if (embed) {
          localStorage.setItem("petal_spotify_embed", embed);
          localStorage.setItem("petal_spotify_url", rawUrl);
          renderSpotify(embed);
          toast("Spotify Set!");
        } else {
          alert("Invalid Spotify link! Please copy a link to a playlist, song, or podcast.");
        }
      };
    }

    if (btnClr) {
      btnClr.onclick = () => {
        localStorage.removeItem("petal_spotify_embed");
        localStorage.removeItem("petal_spotify_url");
        if (urlInput) urlInput.value = "";
        if ($("spotifyEmbed")) $("spotifyEmbed").innerHTML = "";
        toast("Spotify Cleared");
      };
    }
  }

  // RUN ON LOAD
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initMusic(); initSpotify(); });
  } else {
    initMusic(); initSpotify();
  }

  document.addEventListener('themeChanged', () => {
    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) renderSpotify(saved);
  });
})();


/* ------------------- Seasonal Animations ------------------- */
(() => {
  const overlay = document.createElement("div");
  overlay.id = "animation-overlay";
  document.body.prepend(overlay);

  let animationInterval = null;

        function startAnimation(type) {
    if (animationInterval) clearInterval(animationInterval);
    overlay.innerHTML = "";
    if (!type) return;

    animationInterval = setInterval(() => {
      const particle = document.createElement("div");
      const startX = Math.random() * window.innerWidth;
      
      if (type === "meteors") {
        particle.className = "meteor";
        particle.style.left = (startX + 400) + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 1 + 0.5) + "s";
      } 
      else if (type === "leaves") {
        particle.className = "leaf";
        particle.style.left = startX + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 3 + 4) + "s";
      } 
      else if (type === "blossoms") {
        particle.className = "blossom";
        particle.style.left = startX + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 4 + 5) + "s";
      } 
      else if (type === "sunbeams") {
        particle.className = "sunbeam";
        particle.style.left = startX + "px";
        particle.style.top = "-150px";
        particle.style.animationDuration = (Math.random() * 2 + 3) + "s";
      } 
      else if (type === "snow") {
        particle.className = "snowflake";
        particle.style.left = startX + "px";
        particle.style.top = "-10px";
        const size = Math.random() * 4 + 2 + "px";
        particle.style.width = size; particle.style.height = size;
        particle.style.animationDuration = (Math.random() * 3 + 5) + "s";
      } 
      else if (type === "aura") {
        particle.className = Math.random() > 0.3 ? "aura-flame" : "aura-flame aura-orange";
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.bottom = "-100px";
        particle.style.animationDuration = (Math.random() * 1.5 + 1.5) + "s";
      } 
      else if (type === "teleport") {
        particle.className = "flash-spark";
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 100 + "vh";
        const randomRotation = Math.random() * 360;
        particle.style.setProperty('--rot', `${randomRotation}deg`);
        particle.style.animationDuration = "0.25s";
      } 
      else if (type === "pearls") {
        particle.className = "pearl";
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 100 + "vh";
        const randomSize = Math.floor(Math.random() * 12 + 10) + "px";
        particle.style.width = randomSize;
        particle.style.height = randomSize;
        particle.style.animationDelay = (Math.random() * 5) + "s";
      }
      else if (type === "sage_history") {
        const isLeaf = Math.random() > 0.3;
        particle.className = isLeaf ? "sage-leaf" : "ink-blot";
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = isLeaf ? "-20px" : (Math.random() * 100 + "vh");
        particle.style.animationDuration = isLeaf ? (Math.random() * 4 + 6) + "s" : "4s";
      }

      overlay.appendChild(particle);
      setTimeout(() => particle.remove(), 8000);

    // Dynamic speeds: Minato(80ms), Gai(150ms), Others(800ms)
    }, type === "teleport" ? 80 : (type === "aura" ? 150 : 800));
  }
  


  document.addEventListener("themeChanged", () => {
    const theme = localStorage.getItem("petal_theme");
    const map = { cosmic_starfall: "meteors", autumn_forest: "leaves", spring_blossom: "blossoms", summer_shimmer: "sunbeams", midnight_snowfall: "snow" , ninja_rivalry: "sparks" , copy_ninja: "lightning" , medical_kunoichi: "healing", // ADDED
      legendary_sannin: "seals" , akatsuki_cloud: "clouds", hidden_rain: "rain" , kurama_sage: "embers",
      hidden_sand: "sand" , desert_love: "love_sand" , god_of_shinobi: "wood_style",
      tactical_suiton: "bubbles",
      ghost_uchiha: "tomoe" , crow_illusion: "feathers",
      yellow_flash: "teleport",
      lavender_pearl: "pearls" , springtime_youth: "aura" , gallant_tale: "sage_history" };
    startAnimation(map[theme] || null);
  });
})();

/* ------------------- Stickers & Prompts ------------------- */
function insertSticker(src) {
  const content = document.getElementById("content");
  if (!content) return;
  const img = document.createElement("img");
  img.src = src; img.className = "sticker";
  content.appendChild(img);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sticker]");
  if (btn) insertSticker(btn.dataset.sticker);
});

document.getElementById("btnAddImage")?.addEventListener("click", () => {
  if (!window.firebaseAuth?.currentUser) { alert("Please log in!"); return; }
  document.getElementById("imgPicker")?.click();
});

document.getElementById("imgPicker")?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file || !window.firebaseAuth?.currentUser || !window.firebaseStorage) return;
  try {
    toast("Uploading...");
    const path = `entry_images/${window.firebaseAuth.currentUser.uid}/${Date.now()}_image`;
    const fileRef = storageRef(window.firebaseStorage, path);
    await uploadBytes(fileRef, file, { contentType: file.type });
    const url = await getDownloadURL(fileRef);
    insertSticker(url); toast("Image added!");
  } catch (err) { alert("Upload failed."); }
});

(() => {
  /* ------------------------ Prompts Logic (Ninja Edition) ------------------------ */
(() => {
  const prompts = [
    // Standard Cozy Prompts
    "What’s one small win you had today?",
    "What’s one thing you can let go of today?",
    "Write 3 things you’re grateful for (tiny counts).",
    "Describe your day in 5 words.",
    "What’s one kind thing you did for yourself today?",
    
    // --- NEW: Naruto / Ninja Way Prompts ---
    "What is your personal 'Ninja Way' (Nindo) for today?",
    "If you became Hokage tomorrow, what is the first thing you would change to help others?",
    "What is one 'Jutsu' (a new skill or habit) you are currently training to master?",
    "Think about your 'Team 7.' Who are the two people who support you the most?",
    "What does the 'Will of Fire' mean to you in your daily life?",
    "Recall a time you failed but didn't give up. How did that make you stronger?",
    "Who is your greatest 'Rival' right now? Is it a person, or a bad habit you're fighting?",
    "If you could have a heart-to-heart with Master Kakashi, what would you ask him?",
    "Which Hidden Village matches your current mood? (Leaf, Sand, Cloud, etc.)"
    // Add this to your prompts array
"‘A person grows up when they're able to overcome hardships.’ What is a hardship you are currently overcoming?",
"If you were writing your own 'Gallant Tale,' what would the current chapter be titled?",

  ];

  function initPrompts() {
    const btn = document.getElementById("btnPrompt");
    const card = document.getElementById("promptCard");

    if (!btn || !card) return;

    const saved = localStorage.getItem("petal_prompt");
    if (saved) card.textContent = saved;

    function pickNewPrompt() {
      let next;
      do {
        next = prompts[Math.floor(Math.random() * prompts.length)];
      } while (next === card.textContent && prompts.length > 1);

      card.textContent = next;
      localStorage.setItem("petal_prompt", next);
      
      // Visual feedback
      card.style.transform = "scale(1.05)";
      setTimeout(() => card.style.transform = "scale(1)", 100);
    }

    btn.addEventListener("click", pickNewPrompt);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPrompts);
  } else {
    initPrompts();
  }
})();

})();

/* ------------------- Initial Setup ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("petal_theme") || "petal";
  applyTheme(theme);
  applySkin(localStorage.getItem("petal_skin") || "ruled");
  if (document.getElementById("themeSelect")) document.getElementById("themeSelect").value = theme;
  if (document.getElementById("skinSelect")) document.getElementById("skinSelect").value = localStorage.getItem("petal_skin") || "ruled";
  document.getElementById("themeSelect") && (document.getElementById("themeSelect").onchange = (e) => applyTheme(e.target.value));
  document.getElementById("skinSelect") && (document.getElementById("skinSelect").onchange = (e) => applySkin(e.target.value));
});
