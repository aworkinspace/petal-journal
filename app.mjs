// script.js (type="module")

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
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
  midnight_snowfall: {
    "--bg": "#0B0E14",
    "--surface": "#12161F",
    "--surface-2": "#1A202C",
    "--border": "rgba(255,255,255,.08)",
    "--primary": "#A0C4FF",
    "--primary-soft": "rgba(160,196,255,.2)",
    "--accent": "#FFFFFF",
    "--text": "#E0E6ED",
    "--text-muted": "rgba(224,230,237,.6)",
    "--bg-spot-1": "rgba(100,150,255,0.1)",
    "--bg-spot-2": "rgba(255,255,255,0.05)",
    "animation": "snow"
  },
};

function applyVars(vars) {
  if (!vars) return;
  for (const [k, v] of Object.entries(vars)) {
    document.documentElement.style.setProperty(k, v);
  }
}

function applyTheme(themeName) {
  if (themeName === "custom") {
    const raw = localStorage.getItem("petal_custom_theme_vars");
    if (raw) try { applyVars(JSON.parse(raw)); } catch {}
    localStorage.setItem("petal_theme", "custom");
  } else {
    const theme = THEMES[themeName] || THEMES.petal;
    applyVars(theme);
    localStorage.setItem("petal_theme", themeName);
  }
  document.dispatchEvent(new CustomEvent('themeChanged'));
}

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;
  notebook.className = `panel panel-pad notebook skin-${skinName.replace("_", "-")}`;
  localStorage.setItem("petal_skin", skinName);
}

/* ------------------- UI & Auth ------------------- */
function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._id); toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

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

/* ------------------- Journal Logic ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;

  function renderList() {
    const list = $("entryList"); if (!list) return;
    const q = ($("search")?.value || "").toLowerCase();
    const filtered = entries.filter(e => (e.title + e.content).toLowerCase().includes(q)).sort((a,b) => b.updatedAt - a.updatedAt);
    list.innerHTML = filtered.map(e => `<div class="entry-card" data-id="${e.id}"><h4>${e.title || '(Untitled)'}</h4><p>${e.date} • ${e.mood}</p></div>`).join('');
    list.querySelectorAll('.entry-card').forEach(card => {
      card.onclick = () => {
        const e = entries.find(ent => ent.id === card.dataset.id);
        activeId = e.id; $("date").value = e.date; $("mood").value = e.mood; $("title").value = e.title; $("tagsInput").value = (e.tags || []).join(', '); $("content").innerHTML = e.content;
      };
    });
  }

  $("btnSave")?.addEventListener('click', () => {
    const data = { id: activeId || Date.now().toString(), date: $("date").value, mood: $("mood").value, title: $("title").value, content: $("content").innerHTML, tags: $("tagsInput").value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), updatedAt: Date.now() };
    if (!activeId) entries.push(data); else entries = entries.map(e => e.id === activeId ? data : e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); renderList(); toast("Saved!");
    const sfx = $("saveSfx"); if (sfx) sfx.play();
  });

  $("btnDelete")?.addEventListener('click', () => {
    if (!activeId || !confirm("Delete this?")) return;
    entries = entries.filter(e => e.id !== activeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); renderList();
    activeId = null; $("title").value = ""; $("content").innerHTML = ""; toast("Deleted.");
    const sfx = $("deleteSfx"); if (sfx) sfx.play();
  });

  document.addEventListener("DOMContentLoaded", () => {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { entries = []; }
    renderList(); $("search")?.addEventListener('input', renderList);
  });
})();

/* ------------------- Music & Spotify ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const tracks = ["assets/lofi.mp3", "assets/elevator.mp3", "assets/monty.mp3", "assets/intro.mp3"];
  let trackIdx = Number(localStorage.getItem("petal_track_index") || "0") % tracks.length;

  document.addEventListener("DOMContentLoaded", () => {
    const bgm = $("bgm"); if (!bgm) return;
    bgm.volume = Number(localStorage.getItem("petal_music_vol") || 0.35);
    bgm.src = tracks[trackIdx];
    $("btnMusic")?.addEventListener("click", () => { if (bgm.paused) bgm.play(); else bgm.pause(); $("btnMusic").textContent = bgm.paused ? "Play Music" : "Pause Music"; });
    $("btnNextTrack")?.addEventListener("click", () => { trackIdx = (trackIdx + 1) % tracks.length; bgm.src = tracks[trackIdx]; bgm.play(); localStorage.setItem("petal_track_index", trackIdx); });
  });

  const darks = new Set(["midnight", "cosmic_starfall", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac"]);
  document.addEventListener('themeChanged', () => {
    const host = $("spotifyEmbed"); if (!host) return;
    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) {
      const theme = darks.has(localStorage.getItem("petal_theme")) ? "dark" : "light";
      host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:352px; border:0; border-radius:16px;" src="${saved}?theme=${theme}" loading="lazy"></iframe>`;
    }
  });
})();

/* ------------------- Moving Themes Logic (FIXED) ------------------- */
(() => {
  const overlay = document.createElement("div");
  overlay.id = "animation-overlay";
  document.body.prepend(overlay);

  let animationInterval = null;

  function startAnimation(type) {
    if (animationInterval) clearInterval(animationInterval);
    overlay.innerHTML = "";

    animationInterval = setInterval(() => {
      const particle = document.createElement("div");
      const startX = Math.random() * window.innerWidth;
      
      if (type === "meteors") {
        particle.className = "meteor";
        particle.style.left = (startX + 400) + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 1 + 0.5) + "s";
      } else if (type === "leaves") {
        particle.className = "leaf";
        particle.style.left = startX + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 3 + 4) + "s";
      } else if (type === "blossoms") {
        particle.className = "blossom";
        particle.style.left = startX + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 4 + 5) + "s";
      } else if (type === "sunbeams") {
        particle.className = "sunbeam";
        particle.style.left = startX + "px";
        particle.style.top = "-150px";
        particle.style.animationDuration = (Math.random() * 2 + 3) + "s";
      }

      overlay.appendChild(particle);
      setTimeout(() => particle.remove(), 8000);
    }, type === "meteors" ? 1500 : 600);
  }

  document.addEventListener("themeChanged", () => {
    const themeName = localStorage.getItem("petal_theme");
    if (themeName === "cosmic_starfall") startAnimation("meteors");
    else if (themeName === "autumn_forest") startAnimation("leaves");
    else if (themeName === "spring_blossom") startAnimation("blossoms");
    else if (themeName === "summer_shimmer") startAnimation("sunbeams");
    else { if (animationInterval) clearInterval(animationInterval); overlay.innerHTML = ""; }
  });

  // Trigger once on load
  setTimeout(() => document.dispatchEvent(new CustomEvent('themeChanged')), 500);
})();

/* ------------------- Initial Setup ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("petal_theme") || "petal";
  applyTheme(theme);
  applySkin(localStorage.getItem("petal_skin") || "ruled");
  const tSel = document.getElementById("themeSelect"); if (tSel) tSel.value = theme;
  const sSel = document.getElementById("skinSelect"); if (sSel) sSel.value = localStorage.getItem("petal_skin") || "ruled";
  
  if (tSel) tSel.onchange = (e) => applyTheme(e.target.value);
  if (sSel) sSel.onchange = (e) => applySkin(e.target.value);
});
/* ------------------------ Stickers & Image Upload ------------------------ */
function insertSticker(src) {
  const content = document.getElementById("content");
  if (!content) return;

  const img = document.createElement("img");
  img.src = src;
  img.alt = "sticker";
  img.className = "sticker";

  // Try to insert where the cursor is, otherwise just append to the end
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

// Listener for Sticker Buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sticker]");
  if (btn) insertSticker(btn.dataset.sticker);
});

// Custom Image Upload (Beta)
const btnAddImage = document.getElementById("btnAddImage");
const imgPicker = document.getElementById("imgPicker");

btnAddImage?.addEventListener("click", () => {
  if (!window.firebaseAuth?.currentUser) {
    alert("Please log in to upload custom images!");
    return;
  }
  imgPicker?.click();
});

imgPicker?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file || !window.firebaseAuth?.currentUser || !window.firebaseStorage) return;

  if (file.size > 5 * 1024 * 1024) { 
    alert("Image too large (max 5MB)."); 
    return; 
  }

  try {
    const toast = document.getElementById("toast");
    if (toast) { toast.textContent = "Uploading image..."; toast.classList.add("show"); }

    const safeName = (file.name || "image").replace(/[^\w.-]+/g, "_");
    const path = `entry_images/${window.firebaseAuth.currentUser.uid}/${Date.now()}_${safeName}`;
    const fileRef = storageRef(window.firebaseStorage, path);

    await uploadBytes(fileRef, file, { contentType: file.type });
    const url = await getDownloadURL(fileRef);

    insertSticker(url);
    if (toast) { toast.textContent = "Image added!"; setTimeout(() => toast.classList.remove("show"), 2000); }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed. Check your connection.");
  }
  e.target.value = ""; // Reset picker
});
/* ------------------------ Prompts Logic ------------------------ */
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

  // Load saved prompt
  const saved = localStorage.getItem("petal_prompt");
  if (saved) card.textContent = saved;

  btn.addEventListener("click", () => {
    let next;
    // Don't pick the same one twice in a row
    do {
      next = prompts[Math.floor(Math.random() * prompts.length)];
    } while (next === card.textContent);

    card.textContent = next;
    localStorage.setItem("petal_prompt", next);
    
    // Tiny animation effect
    card.style.transform = "scale(1.02)";
    setTimeout(() => card.style.transform = "scale(1)", 100);
  });
})();
/* ------------------------ Spotify Logic (Robust) ------------------------ */
(() => {
  const urlEl = document.getElementById("spotifyUrl");
  const btnSet = document.getElementById("btnSetSpotify");
  const btnClear = document.getElementById("btnClearSpotify");
  const host = document.getElementById("spotifyEmbed");
  const msg = document.getElementById("spotifyMsg");

  if (!urlEl || !btnSet || !btnClear || !host) return;

  // Themes that should trigger the "Dark" Spotify player
  const darkThemes = new Set([
    "midnight", "cosmic_starfall", "dusky_rose", "mauve_night", 
    "deep_sage", "blueberry_dusk", "cocoa_lilac"
  ]);

  // Function to clean the URL and extract the ID/Type
  function toEmbed(url) {
    if (!url) return null;
    
    // This regex catches Playlists, Albums, Tracks, Shows (Podcasts), and Episodes
    const match = url.match(/(?:playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
    const id = match?.[1];
    
    let type = 'playlist'; // Default
    if (url.includes('track/')) type = 'track';
    if (url.includes('album/')) type = 'album';
    if (url.includes('show/')) type = 'show';
    if (url.includes('episode/')) type = 'episode';

    return id ? `https://open.spotify.com/embed/${type}/${id}` : null;
  }

  // Function to actually put the player on the screen
  function render(baseEmbedUrl) {
    if (!host || !baseEmbedUrl) return;

    // Check current theme to decide if Spotify should be dark or light
    const currentTheme = localStorage.getItem("petal_theme") || "petal";
    const spotifyTheme = darkThemes.has(currentTheme) ? "dark" : "light";
    
    // Add the theme parameter to the URL
    const finalSrc = `${baseEmbedUrl}?theme=${spotifyTheme}`;

    host.innerHTML = `
      <iframe 
        class="spotify-iframe" 
        style="width:100%; height:352px; border:0; border-radius:16px; margin-top:10px;" 
        src="${finalSrc}" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy">
      </iframe>`;
  }

  // Button: Set Playlist
  btnSet.addEventListener("click", () => {
    const raw = urlEl.value.trim();
    const embed = toEmbed(raw);

    if (embed) {
      if (msg) msg.textContent = "";
      localStorage.setItem("petal_spotify_url", raw);
      localStorage.setItem("petal_spotify_embed", embed);
      render(embed);
      // If you have the toast function defined:
      if (typeof toast === "function") toast("Spotify player updated!");
    } else {
      if (msg) msg.textContent = "Invalid link. Use a Playlist, Album, Track, or Podcast link.";
    }
  });

  // Button: Clear
  btnClear.addEventListener("click", () => {
    localStorage.removeItem("petal_spotify_url");
    localStorage.removeItem("petal_spotify_embed");
    urlEl.value = "";
    host.innerHTML = "";
    if (msg) msg.textContent = "";
  });

  // Initial Load (when page opens)
  const saved = localStorage.getItem("petal_spotify_embed");
  if (saved) {
    render(saved);
    urlEl.value = localStorage.getItem("petal_spotify_url") || "";
  }

  // Listen for Theme Changes to update Spotify colors instantly
  document.addEventListener('themeChanged', () => {
    const currentEmbed = localStorage.getItem("petal_spotify_embed");
    if (currentEmbed) render(currentEmbed);
  });
})();
