// app.mjs (type="module")
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

/* ----------------------------- Theme Logic ----------------------------- */
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
  golden_petal: { "--bg": "#FFFDF0", "--surface": "#FFFCDB", "--surface-2": "#FFF5AD", "--border": "#E6D695", "--primary": "#FFD700", "--primary-soft": "rgba(255, 215, 0, 0.3)", "--accent": "#DAA520", "--text": "#4A3F1F", "--text-muted": "#8B7D54", "--bg-spot-1": "rgba(255, 223, 0, 0.25)", "--bg-spot-2": "rgba(255, 255, 255, 0.5)" },
  six_paths_sage: { "--bg": "#FFFFFF", "--surface": "#FDFDFD", "--surface-2": "#1A1A1A", "--border": "#FFD700", "--primary": "#FFD700", "--primary-soft": "rgba(255, 215, 0, 0.2)", "--accent": "#000000", "--text": "#1A1A1A", "--text-muted": "#555555", "--bg-spot-1": "rgba(255, 215, 0, 0.1)" },
  uchiha_avenger: { "--bg": "#0A0A1F", "--surface": "#14142D", "--surface-2": "#6D28D9", "--border": "rgba(160, 233, 255, 0.2)", "--primary": "#A0E9FF", "--accent": "#EF4444", "--text": "#D1D5DB", "--text-muted": "rgba(209, 213, 219, 0.4)", "--bg-spot-1": "rgba(109, 40, 217, 0.2)" },
  hokage_dream: { "--bg": "#FFF7ED", "--surface": "#FFEDD5", "--surface-2": "#F97316", "--border": "rgba(59, 130, 246, 0.2)", "--primary": "#F97316", "--accent": "#3B82F6", "--text": "#431407", "--text-muted": "#7C2D12" },
  ninja_rivalry: { "--bg": "#0D0D1F", "--surface": "#16162D", "--surface-2": "#F97316", "--border": "rgba(59, 130, 246, 0.3)", "--primary": "#3B82F6", "--accent": "#EF4444", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.6)", "--bg-spot-1": "rgba(59, 130, 246, 0.2)", "--bg-spot-2": "rgba(249, 115, 22, 0.15)" },
  copy_ninja: { "--bg": "#1A1B26", "--surface": "#24283B", "--surface-2": "#414868", "--border": "rgba(160, 233, 255, 0.2)", "--primary": "#A0E9FF", "--accent": "#FF4C4C", "--text": "#C0CAF5", "--text-muted": "#565F89", "--bg-spot-1": "rgba(160, 233, 255, 0.1)", "--bg-spot-2": "rgba(255, 76, 76, 0.05)" },
  medical_kunoichi: { "--bg": "#FFF0F3", "--surface": "#FFE3E8", "--surface-2": "#FBCFE8", "--border": "rgba(16, 185, 129, 0.2)", "--primary": "#10B981", "--accent": "#F43F5E", "--text": "#4C0519", "--text-muted": "#9F1239" },
  shadow_possession: { "--bg": "#0A0B0D", "--surface": "#14171A", "--surface-2": "#2D3436", "--border": "rgba(46, 204, 113, 0.15)", "--primary": "#2ECC71", "--accent": "#000000", "--text": "#E0E0E0", "--text-muted": "rgba(224, 224, 224, 0.5)", "--bg-spot-1": "rgba(0, 0, 0, 0.8)" },
  mind_transfer: { "--bg": "#F5F3FF", "--surface": "#EDE9FE", "--surface-2": "#C4B5FD", "--border": "rgba(139, 92, 246, 0.2)", "--primary": "#8B5CF6", "--accent": "#10B981", "--text": "#4C1D95", "--text-muted": "#7C3AED" },
  butterfly_mode: { "--bg": "#2D0A0A", "--surface": "#3F1212", "--surface-2": "#1E3A8A", "--border": "rgba(59, 130, 246, 0.3)", "--primary": "#3B82F6", "--accent": "#FACC15", "--text": "#FEE2E2", "--text-muted": "rgba(254, 226, 226, 0.5)" },
  gallant_tale: { "--bg": "#F5E6D3", "--surface": "#FCF8F0", "--surface-2": "#8B0000", "--border": "rgba(139, 0, 0, 0.2)", "--primary": "#B45309", "--accent": "#FACC15", "--text": "#2D1B1B", "--text-muted": "#634832" },
  forbidden_lab: { "--bg": "#0D0B12", "--surface": "#16141F", "--surface-2": "#4B3F72", "--border": "rgba(220, 214, 247, 0.1)", "--primary": "#FFD700", "--accent": "#DCD6F7", "--text": "#DCD6F7", "--text-muted": "rgba(220, 214, 247, 0.5)", "--bg-spot-1": "rgba(75, 63, 114, 0.2)" },
  slug_princess: { "--bg": "#F0F9F6", "--surface": "#E6F2ED", "--surface-2": "#14B8A6", "--border": "rgba(20, 184, 166, 0.2)", "--primary": "#14B8A6", "--accent": "#B45309", "--text": "#0F4C3A", "--text-muted": "#3D7061", "--bg-spot-1": "rgba(20, 184, 166, 0.1)" },
  legendary_sannin: { "--bg": "#1E1B2E", "--surface": "#2D2B4A", "--surface-2": "#B45309", "--border": "rgba(20, 184, 166, 0.3)", "--primary": "#14B8A6", "--accent": "#FACC15", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.6)" },
  nine_tails_malice: { "--bg": "#0D0505", "--surface": "#1A0B0B", "--surface-2": "#4A0000", "--border": "rgba(255, 0, 0, 0.2)", "--primary": "#FF0000", "--accent": "#F97316", "--text": "#F2F0F7", "--text-muted": "rgba(242, 240, 247, 0.5)", "--bg-spot-1": "rgba(255, 0, 0, 0.15)" },
  akatsuki_cloud: { "--bg": "#0A0A0C", "--surface": "#121217", "--surface-2": "#3D0000", "--border": "rgba(255, 0, 0, 0.15)", "--primary": "#FF0000", "--accent": "#FFFFFF", "--text": "#E0E0E0", "--text-muted": "rgba(224, 224, 224, 0.5)" },
  hidan_ritual: { "--bg": "#080808", "--surface": "#121212", "--surface-2": "#4A0000", "--border": "rgba(255, 0, 0, 0.2)", "--primary": "#FF0000", "--accent": "#FFFFFF", "--text": "#E5E5E5", "--text-muted": "rgba(229, 229, 229, 0.5)", "--bg-spot-1": "rgba(74, 0, 0, 0.3)" },
  kakuzu_hearts: { "--bg": "#0F110D", "--surface": "#1A1D17", "--surface-2": "#3E4437", "--border": "rgba(255, 215, 0, 0.15)", "--primary": "#FFD700", "--accent": "#B22222", "--text": "#D1D5DB", "--text-muted": "rgba(209, 213, 223, 0.5)", "--bg-spot-1": "rgba(62, 68, 55, 0.2)" },
  art_explosion: { "--bg": "#FFFDF0", "--surface": "#FEF3C7", "--surface-2": "#FBBF24", "--border": "rgba(0, 168, 232, 0.2)", "--primary": "#00A8E8", "--accent": "#FF4500", "--text": "#451A03", "--text-muted": "#92400E" },
  ultimate_masterpiece: { "--bg": "#FFFFFF", "--surface": "#FAFAFA", "--surface-2": "#FFD700", "--border": "rgba(255, 215, 0, 0.3)", "--primary": "#FFD700", "--accent": "#000000", "--text": "#1A1A1A", "--text-muted": "#666666", "--bg-spot-1": "rgba(255, 255, 255, 1)" },
  eternal_beauty: { "--bg": "#0D0B0B", "--surface": "#1A1616", "--surface-2": "#4A0E0E", "--border": "rgba(168, 85, 247, 0.2)", "--primary": "#A855F7", "--accent": "#D2B48C", "--text": "#FEE2E2", "--text-muted": "rgba(254, 226, 226, 0.5)" },
  paper_angel: { "--bg": "#E0E7FF", "--surface": "#EEF2FF", "--surface-2": "#818CF8", "--border": "rgba(129, 140, 248, 0.2)", "--primary": "#6366F1", "--accent": "#4338CA", "--text": "#1E1B4B", "--text-muted": "#4338CA" },
  six_paths_pain: { "--bg": "#0D0D0F", "--surface": "#16161A", "--surface-2": "#4C1D95", "--border": "rgba(139, 92, 246, 0.2)", "--primary": "#8B5CF6", "--accent": "#FF4500", "--text": "#D1D5DB", "--text-muted": "rgba(209, 213, 219, 0.5)" },
  original_hope: { "--bg": "#F0F9FF", "--surface": "#E0F2FE", "--surface-2": "#F97316", "--border": "rgba(14, 165, 233, 0.2)", "--primary": "#0EA5E9", "--accent": "#FB923C", "--text": "#0C4A6E", "--text-muted": "#0369A1" },
  tobi_good_boy: { "--bg": "#FFF7ED", "--surface": "#FFEDD5", "--surface-2": "#FB923C", "--border": "rgba(34, 197, 94, 0.2)", "--primary": "#22C55E", "--accent": "#EA580C", "--text": "#431407", "--text-muted": "#7C2D12" },
  monster_mist: { "--bg": "#051622", "--surface": "#0B2435", "--surface-2": "#1A759F", "--border": "rgba(160, 233, 255, 0.2)", "--primary": "#52B69A", "--accent": "#184E77", "--text": "#D9EDF7", "--text-muted": "rgba(217, 237, 247, 0.5)" },
  stinky_aloe: { "--bg": "#0D110D", "--surface": "#1A1F1A", "--surface-2": "#4D7C0F", "--border": "rgba(255, 255, 255, 0.1)", "--primary": "#FFFFFF", "--accent": "#000000", "--text": "#E2E8F0", "--text-muted": "rgba(226, 232, 240, 0.4)", "--bg-spot-1": "rgba(77, 124, 15, 0.15)" },
  god_of_shinobi: { "--bg": "#E9F5DB", "--surface": "#CFE1B9", "--surface-2": "#718355", "--border": "#4F772D", "--primary": "#B56576", "--accent": "#31572C", "--text": "#132A13", "--text-muted": "#31572C", "--bg-spot-1": "rgba(49, 87, 44, 0.15)", "--bg-spot-2": "rgba(113, 131, 85, 0.2)" },
  desert_love: { "--bg": "#F2E8CF", "--surface": "#EAD7B1", "--surface-2": "#D4A373", "--border": "rgba(188, 71, 73, 0.2)", "--primary": "#BC4749", "--accent": "#6A994E", "--text": "#386641", "--text-muted": "#6A994E", "--bg-spot-1": "rgba(188, 71, 73, 0.05)", "--bg-spot-2": "rgba(255, 255, 255, 0.3)" }
};

/* ------------------- Helpers ------------------- */
function applyVars(vars) {
  if (!vars) return;
  for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v);
}

function applyTheme(themeName) {
  if (themeName === "golden_petal" || themeName === "six_paths_sage") {
    const wb = parseInt(localStorage.getItem("petal_whiteboard_count") || "0");
    const vs = parseInt(localStorage.getItem("petal_vision_count") || "0");
    const cp = parseInt(localStorage.getItem("petal_capsule_count") || "0");
    const wl = parseInt(localStorage.getItem("petal_well_count") || "0");
    const entries = JSON.parse(localStorage.getItem("petal_entries_v1") || "[]");
    let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30);
    entries.forEach(e => totalXP += (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length);

    if (themeName === "golden_petal" && totalXP < 800) { themeName = "petal"; toast("Level 5 required!"); }
    if (themeName === "six_paths_sage" && totalXP < 1800) { themeName = "petal"; toast("Level 10 required!"); }
  }

  const theme = THEMES[themeName] || THEMES.petal;
  applyVars(theme);
  localStorage.setItem("petal_theme", themeName);
  document.dispatchEvent(new CustomEvent('themeChanged'));
}

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (notebook) notebook.className = `panel panel-pad notebook skin-${skinName.replace("_", "-")}`;
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
      setTimeout(() => {
        if (!auth.currentUser) {
          if (loginBtn) loginBtn.style.display = "inline-flex";
          if (profBtn) profBtn.style.display = "none";
          if (outBtn) outBtn.style.display = "none";
        }
      }, 2500);
    }
  });
  document.getElementById("btnSignOut")?.addEventListener("click", () => signOut(auth).then(() => location.reload()));
})();

/* ------------------- Journal Logic ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;
  let activeTag = null;

  function getZenLevel() {
    const wb = parseInt(localStorage.getItem("petal_whiteboard_count") || "0");
    const vs = parseInt(localStorage.getItem("petal_vision_count") || "0");
    const cp = parseInt(localStorage.getItem("petal_capsule_count") || "0");
    const wl = parseInt(localStorage.getItem("petal_well_count") || "0");
    let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30);
    entries.forEach(e => totalXP += (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length);
    return Math.floor(totalXP / 200) + 1;
  }

  function checkUnlocks() {
    const lvl = getZenLevel();
    document.querySelectorAll(".level-5-reward").forEach(el => el.style.display = lvl >= 5 ? "inline-flex" : "none");
    const optG = $("optGolden"); if (optG) { optG.disabled = lvl < 5; optG.textContent = lvl >= 5 ? "✨ Golden Petal" : "🔒 Level 5"; }
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
        activeId = e.id; $("date").value = e.date; $("mood").value = e.mood; $("title").value = e.title; $("tagsInput").value = (e.tags || []).join(', '); $("content").innerHTML = e.content;
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

  $("btnSave")?.addEventListener('click', () => {
    const html = $("content").innerHTML;
    const data = { id: activeId || Date.now().toString(), date: $("date").value, mood: $("mood").value, title: $("title").value, content: html, tags: $("tagsInput").value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), updatedAt: Date.now() };
    if (!activeId) entries.push(data); else entries = entries.map(e => e.id === activeId ? data : e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); renderList(); renderTagChips(); checkUnlocks(); toast("Saved!");
    $("saveSfx")?.play();
  });

  $("btnDelete")?.addEventListener('click', () => {
    if (!activeId || !confirm("Delete?")) return;
    entries = entries.filter(e => e.id !== activeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); renderList(); renderTagChips(); checkUnlocks();
    activeId = null; $("title").value = ""; $("content").innerHTML = ""; toast("Deleted.");
    $("deleteSfx")?.play();
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
    const darks = new Set(["midnight", "cosmic_starfall", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "midnight_snowfall", "ninja_rivalry", "copy_ninja", "ghost_uchiha", "akatsuki_cloud", "hidden_rain", "legendary_sannin" , "springtime_youth" , "forbidden_lab" , "kamui_dimension" , "tactical_suiton" , "shadow_possession" , "butterfly_mode" , "hidan_ritual" , "kakuzu_hearts" , "eternal_beauty" , "monster_mist" , "stinky_aloe" , "uchiha_avenger" , "eternal_amaterasu"]);
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
    $("btnClearSpotify")?.onclick = () => { localStorage.removeItem("petal_spotify_embed"); $("spotifyEmbed").innerHTML = ""; };
  });

  document.addEventListener('themeChanged', () => { renderSpotify(localStorage.getItem("petal_spotify_embed")); });
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
      const p = document.createElement("div");
      const startX = Math.random() * window.innerWidth;
      
      if (type === "meteors") { p.className = "meteor"; p.style.left = (startX + 400) + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 1 + 0.5) + "s"; }
      else if (type === "leaves") { p.className = "leaf"; p.style.left = startX + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "blossoms") { p.className = "blossom"; p.style.left = startX + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 4 + 5) + "s"; }
      else if (type === "sunbeams") { p.className = "sunbeam"; p.style.left = startX + "px"; p.style.top = "-150px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; }
      else if (type === "snow") { p.className = "snowflake"; p.style.left = startX + "px"; p.style.top = "-10px"; const size = Math.random() * 4 + 2 + "px"; p.style.width = size; p.style.height = size; p.style.animationDuration = (Math.random() * 3 + 5) + "s"; }
      else if (type === "aura") { p.className = Math.random() > 0.3 ? "aura-flame" : "aura-flame aura-orange"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-100px"; p.style.animationDuration = (Math.random() * 1.5 + 1.5) + "s"; }
      else if (type === "teleport") { p.className = "flash-spark"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; const rot = Math.random() * 360; p.style.setProperty('--rot', `${rot}deg`); p.style.animationDuration = "0.25s"; }
      else if (type === "pearls") { p.className = "pearl"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; const size = Math.floor(Math.random() * 12 + 10) + "px"; p.style.width = size; p.style.height = size; p.style.animationDelay = (Math.random() * 5) + "s"; }
      else if (type === "sage_history") { const isL = Math.random() > 0.3; p.className = isL ? "sage-leaf" : "ink-blot"; p.style.left = Math.random() * 100 + "vw"; p.style.top = isL ? "-20px" : (Math.random() * 100 + "vh"); p.style.animationDuration = isL ? (Math.random() * 4 + 6) + "s" : "4s"; }
      else if (type === "snakes") { p.className = "snake-line"; p.style.left = "-50px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 4 + 6) + "s"; } 
      else if (type === "tomoe") { p.className = "tomoe"; p.textContent = "©"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "4s"; } 
      else if (type === "warps") { p.className = "kamui-warp"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "3s"; } 
      else if (type === "black_fire") { p.className = "black-flame"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; if (Math.random() > 0.5) p.style.transform = "scaleX(-1)"; }
      else if (type === "feathers") { p.className = "feather"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-30px"; p.style.animationDuration = (Math.random() * 4 + 5) + "s"; if (Math.random() > 0.5) p.style.transform = "scaleX(-1)"; } 
      else if (type === "truth_orbs") { p.className = "truth-orb"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 5) + "s"; }
      else if (type === "hundred_seals") { p.className = "diamond-seal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "4s"; } 
      else if (type === "malice") { p.className = "malice-orb"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; if (Math.random() > 0.8) { p.style.background = "#F97316"; p.style.boxShadow = "0 0 20px 4px #F97316"; } } 
      else if (type === "wood_style") { 
        if (Math.random() > 0.7) { p.className = "wood-vine"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-50px"; const rot = Math.random() * 360; p.style.setProperty('--rot', `${rot}deg`); p.style.animationDuration = (Math.random() * 2 + 4) + "s"; } 
        else { p.className = "wood-petal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      }
      else if (type === "bubbles") {
        if (Math.random() > 0.6) { p.className = "water-ripple"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; } 
        else { p.className = "water-drop"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; }
        p.style.animationDuration = "4s";
      } 
      else if (type === "spirals") { p.className = "uzumaki-spiral"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "5s"; } 
      else if (type === "bolts") { p.className = "chidori-bolt"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.transform = `rotate(${Math.random() * 360}deg)`; p.style.animationDuration = "0.3s"; }
      else if (type === "sharks") { p.className = "shark-fin"; p.style.left = "-40px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; } 
      else if (type === "flytraps") { p.className = "flytrap-spike"; p.style.left = Math.random() * 100 + "vw"; const isT = Math.random() > 0.5; p.style[isT ? 'top' : 'bottom'] = "-10px"; if (isT) p.style.transform = "rotate(180deg)"; p.style.animationDuration = "3s"; }
      else if (type === "love_sand") { p.className = "love-kanji"; p.textContent = "愛"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-40px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }

      overlay.appendChild(p);
      setTimeout(() => p.remove(), 8000);
    }, type === "teleport" || type === "bolts" ? 80 : (type === "aura" ? 150 : 800));
  }

  document.addEventListener("themeChanged", () => {
    const theme = localStorage.getItem("petal_theme");
    const map = { cosmic_starfall: "meteors", autumn_forest: "leaves", spring_blossom: "blossoms", summer_shimmer: "sunbeams", midnight_snowfall: "snow", ninja_rivalry: "sparks", copy_ninja: "lightning", medical_kunoichi: "healing", legendary_sannin: "seals", desert_love: "love_sand", god_of_shinobi: "wood_style", tactical_suiton: "bubbles", ghost_uchiha: "tomoe", crow_illusion: "feathers", yellow_flash: "teleport", lavender_pearl: "pearls", gallant_tale: "sage_history", forbidden_lab: "snakes", slug_princess: "hundred_seals", nine_tails_malice: "malice", springtime_youth: "aura", eternal_amaterasu: "black_fire", kamui_dimension: "warps", six_paths_sage: "truth_orbs", shadow_possession: "shadows", mind_transfer: "mind_waves", butterfly_mode: "butterflies", hidan_ritual: "jashin", kakuzu_hearts: "threads", art_explosion: "explosive_birds", eternal_beauty: "puppet_strings", paper_angel: "paper", six_paths_pain: "gravity", original_hope: "rain", tobi_good_boy: "tobi_swirl", monster_mist: "sharks", stinky_aloe: "flytraps", ultimate_masterpiece: "c0_explosion", hokage_dream: "spirals", uchiha_avenger: "bolts" };
    startAnimation(map[theme] || null);
  });
})();

/* ------------------- Stickers & Prompts ------------------- */
const prompts = ["What is your personal 'Ninja Way' for today?", "If you became Hokage tomorrow, what is the first thing you would change?", "What is one 'Jutsu' (a new skill or habit) you are currently training to master?", "Think about your 'Team 7.' Who are the two people who support you the most?", "Recall a time you failed but didn't give up. How did that make you stronger?", "Which Hidden Village matches your current mood?", "‘A person grows up when they're able to overcome hardships.’ What is a hardship you are currently overcoming?", "‘People become stronger because they have memories they can't forget.’ What is a memory that makes you strong today?", "‘True art is an explosion!’ What was the most exciting or 'explosive' moment of your week?"];

document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("promptCard");
  if (card) {
      card.textContent = localStorage.getItem("petal_prompt") || prompts[0];
      document.getElementById("btnPrompt")?.addEventListener("click", () => {
          const next = prompts[Math.floor(Math.random() * prompts.length)];
          card.textContent = next; localStorage.setItem("petal_prompt", next);
      });
  }

  const picker = document.getElementById("imgPicker");
  document.getElementById("btnAddImage")?.addEventListener("click", () => { if (!window.firebaseAuth?.currentUser) { alert("Login required"); return; } picker?.click(); });
  picker?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]; if (!file || !window.firebaseAuth?.currentUser) return;
    try { toast("Uploading..."); const path = `entry_images/${window.firebaseAuth.currentUser.uid}/${Date.now()}_image`; const fileRef = storageRef(window.firebaseStorage, path); await uploadBytes(fileRef, file, { contentType: file.type }); const url = await getDownloadURL(fileRef); const img = document.createElement("img"); img.src = url; img.className = "sticker"; document.getElementById("content").appendChild(img); toast("Added!"); } catch (err) { alert("Failed"); }
  });
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sticker]");
  if (btn) { const img = document.createElement("img"); img.src = btn.dataset.sticker; img.className = "sticker"; document.getElementById("content").appendChild(img); }
});

/* ------------------- Initial Setup ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("petal_theme") || "petal";
  applyTheme(theme); applySkin(localStorage.getItem("petal_skin") || "ruled");
  if (document.getElementById("themeSelect")) document.getElementById("themeSelect").value = theme;
  if (document.getElementById("skinSelect")) document.getElementById("skinSelect").value = localStorage.getItem("petal_skin") || "ruled";
  document.getElementById("themeSelect") && (document.getElementById("themeSelect").onchange = (e) => applyTheme(e.target.value));
  document.getElementById("skinSelect") && (document.getElementById("skinSelect").onchange = (e) => applySkin(e.target.value));
});
