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
    cosmic_starfall: {
    "--bg": "#0D0B1A",
    "--surface": "#16142E",
    "--surface-2": "#231F4D",
    "--border": "rgba(183,166,255,.14)",
    "--primary": "#B7A6FF",
    "--primary-soft": "rgba(183,166,255,.25)",
    "--accent": "#FFD700",
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.75)",
    "--bg-spot-1": "rgba(130,100,255,0.2)",
    "--bg-spot-2": "rgba(50,200,255,0.1)",
    "animation": "meteors" // Custom flag for JS
  },
  autumn_forest: {
    "--bg": "#FFF9F2",
    "--surface": "#FCF3E8",
    "--surface-2": "#F5E6D3",
    "--border": "#DBC7B5",
    "--primary": "#A67B5B",
    "--primary-soft": "#E3D5C4",
    "--accent": "#D95D39",
    "--text": "#4A3728",
    "--text-muted": "#856D5B",
    "animation": "leaves" // Custom flag for JS
  },
    spring_blossom: {
    "--bg": "#FFF5F8",
    "--surface": "#FEF0F5",
    "--surface-2": "#FDE2E9",
    "--border": "#F9C8D9",
    "--primary": "#FFB7C5",
    "--primary-soft": "#FFE4E8",
    "--accent": "#FF69B4",
    "--text": "#5E3A44",
    "--text-muted": "#8A6B74",
    "animation": "blossoms"
  },
  summer_shimmer: {
    "--bg": "#F0FBFF",
    "--surface": "#E3F7FF",
    "--surface-2": "#D1F2FF",
    "--border": "#B6E9FF",
    "--primary": "#00A8E8",
    "--primary-soft": "#BCEBFF",
    "--accent": "#FFD700",
    "--text": "#1A465C",
    "--text-muted": "#4B758E",
    "animation": "sunbeams"
  }

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

/* ------------------------------ UI Helpers ------------------------------ */

function insertSticker(src) {
  const content = document.getElementById("content");
  if (!content) return;
  const img = document.createElement("img");
  img.src = src;
  img.className = "sticker";
  content.appendChild(img);
}

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._id);
  toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------- Firebase Auth Logic ------------------- */

(() => {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  if (!auth) return;

  const els = {
    authButton: document.getElementById("authButton"),
    profileButton: document.getElementById("profileButton"),
    btnSignOut: document.getElementById("btnSignOut"),
    themeSelect: document.getElementById("themeSelect")
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (els.authButton) els.authButton.style.display = "none";
      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex";
        els.profileButton.textContent = user.displayName ? `${user.displayName}'s Profile` : "My Profile";
      }
      if (els.btnSignOut) els.btnSignOut.style.display = "inline-flex";
    } else {
      if (els.authButton) els.authButton.style.display = "inline-flex";
      if (els.profileButton) els.profileButton.style.display = "none";
      if (els.btnSignOut) els.btnSignOut.style.display = "none";
    }
  });

  els.btnSignOut?.addEventListener("click", () => signOut(auth).then(() => toast("Logged out.")));
})();

/* ------------------------ RESTORED Journal Logic ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;
  let activeTag = null;

  const els = {
    date: $("date"), mood: $("mood"), title: $("title"), tagsInput: $("tagsInput"),
    content: $("content"), entryList: $("entryList"), search: $("search"), tagRow: $("tagRow"),
    btnSave: $("btnSave"), btnDelete: $("btnDelete"), btnNew: $("btnNew"), count: $("count"),
    // AUDIO ELEMENTS
    saveSfx: $("saveSfx"),
    deleteSfx: $("deleteSfx"),
    newEntrySfx: $("newEntrySfx")
  };

  function playSfx(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function loadEntries() {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { entries = []; }
  }

  function saveToStorage() { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }

  function renderList() {
    if (!els.entryList) return;
    const q = (els.search?.value || "").toLowerCase();
    const filtered = entries.filter(e => {
      const matchTag = activeTag ? (e.tags || []).includes(activeTag) : true;
      const matchSearch = ((e.title || "") + (e.content || "")).toLowerCase().includes(q);
      return matchTag && matchSearch;
    }).sort((a,b) => b.updatedAt - a.updatedAt);

    els.entryList.innerHTML = filtered.map(e => `
      <div class="entry-card" data-id="${e.id}">
        <h4>${e.title || '(Untitled)'}</h4>
        <p>${e.date} • ${e.mood}</p>
      </div>
    `).join('');

    els.entryList.querySelectorAll('.entry-card').forEach(card => {
      card.onclick = () => {
        const entry = entries.find(ent => ent.id === card.dataset.id);
        activeId = entry.id;
        els.date.value = entry.date;
        els.mood.value = entry.mood;
        els.title.value = entry.title;
        els.tagsInput.value = (entry.tags || []).join(', ');
        els.content.innerHTML = entry.content;
      };
    });
    if (els.count) els.count.textContent = filtered.length;
  }

  // --- NEW ENTRY FUNCTION ---
  function startNewEntry() {
    activeId = null;
    els.date.value = new Date().toISOString().split('T')[0];
    els.mood.value = "Calm";
    els.title.value = "";
    els.tagsInput.value = "";
    els.content.innerHTML = "";
    playSfx(els.newEntrySfx);
    toast("New entry started!");
  }

  els.btnNew?.addEventListener('click', startNewEntry);

  els.btnSave?.addEventListener('click', () => {
    const data = {
      id: activeId || Date.now().toString(),
      date: els.date.value,
      mood: els.mood.value,
      title: els.title.value,
      content: els.content.innerHTML,
      tags: els.tagsInput.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      updatedAt: Date.now()
    };
    if (!activeId) entries.push(data);
    else entries = entries.map(e => e.id === activeId ? data : e);
    saveToStorage(); renderList(); toast("Saved!");
    playSfx(els.saveSfx);
  });

  els.btnDelete?.addEventListener('click', () => {
    if (!activeId) return;
    if (!confirm("Are you sure you want to delete this entry?")) return;
    entries = entries.filter(e => e.id !== activeId);
    saveToStorage(); renderList();
    startNewEntry(); // Reset the screen after deleting
    playSfx(els.deleteSfx);
  });

  document.addEventListener("DOMContentLoaded", () => {
    loadEntries(); renderList();
    els.search?.addEventListener('input', renderList);
  });
})();

/* ------------------------ Spotify Logic ------------------------ */
(() => {
  const urlEl = document.getElementById("spotifyUrl");
  const btnSet = document.getElementById("btnSetSpotify");
  const btnClear = document.getElementById("btnClearSpotify");
  const host = document.getElementById("spotifyEmbed");

  const darkPastels = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "custom"]);

  function toEmbed(url) {
    if (!url) return null;
    const match = url.match(/(?:playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
    const id = match?.[1];
    let type = 'playlist';
    if (url.includes('track/')) type = 'track';
    if (url.includes('album/')) type = 'album';
    if (url.includes('show/')) type = 'show';
    if (url.includes('episode/')) type = 'episode';
    return id ? `https://open.spotify.com/embed/${type}/${id}` : null;
  }

  function render(baseEmbedUrl) {
    if (!host || !baseEmbedUrl) return;
    const theme = darkPastels.has(localStorage.getItem("petal_theme")) ? "dark" : "light";
    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:352px; border:0; border-radius:16px; margin-top:10px;" src="${baseEmbedUrl}?theme=${theme}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  btnSet?.addEventListener("click", () => {
    const embed = toEmbed(urlEl.value.trim());
    if (embed) {
      localStorage.setItem("petal_spotify_embed", embed);
      render(embed);
      toast("Spotify player updated!");
    } else { toast("Invalid link."); }
  });

  btnClear?.addEventListener("click", () => {
    localStorage.removeItem("petal_spotify_embed");
    host.innerHTML = "";
    urlEl.value = "";
  });

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) render(saved);
  });

  document.addEventListener('themeChanged', () => {
    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) render(saved);
  });
})();

/* ------------------- Initial Setup ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem("petal_theme") || "petal");
  applySkin(localStorage.getItem("petal_skin") || "ruled");
  
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.value = localStorage.getItem("petal_theme") || "petal";
    themeSelect.onchange = (e) => applyTheme(e.target.value);
  }
  
  const skinSelect = document.getElementById("skinSelect");
  if (skinSelect) {
    skinSelect.value = localStorage.getItem("petal_skin") || "ruled";
    skinSelect.onchange = (e) => applySkin(e.target.value);
  }
});
/* ------------------------ Background Music Logic ------------------------ */
(() => {
  const $ = (id) => document.getElementById(id);

  document.addEventListener("DOMContentLoaded", () => {
    const btnMusic = $("btnMusic");
    const btnNextTrack = $("btnNextTrack");
    const musicVol = $("musicVol");
    const bgm = $("bgm");

    // Sound effects (FNAF style)
    const btnAmbient = $("btnAmbient");
    const ambientSfx = $("ambientSfx");
    const jumpscareSfx = $("jumpscareSfx");
    const toreadorSfx = $("toreadorSfx");

    if (!bgm || !btnMusic || !musicVol) return;

    // YOUR TRACK LIST
    const tracks = [
      "assets/lofi.mp3", 
      "assets/elevator.mp3", 
      "assets/monty.mp3", 
      "assets/intro.mp3"
    ];

    let trackIndex = Number(localStorage.getItem("petal_track_index") || "0");
    if (!Number.isFinite(trackIndex) || trackIndex < 0) trackIndex = 0;
    trackIndex %= tracks.length;

    // Load saved volume
    const savedVol = localStorage.getItem("petal_music_vol");
    if (savedVol !== null) musicVol.value = savedVol;
    bgm.volume = Number(musicVol.value || 0.35);

    function updateBtnText() {
      btnMusic.textContent = bgm.paused ? "Play Music" : "Pause Music";
    }

    function setTrack(index, autoplay = false) {
      trackIndex = ((index % tracks.length) + tracks.length) % tracks.length;
      localStorage.setItem("petal_track_index", String(trackIndex));

      const wasPlaying = !bgm.paused;
      bgm.src = tracks[trackIndex];
      bgm.load();

      if (autoplay || wasPlaying) {
        bgm.play().catch(() => {
          console.log("Autoplay blocked by browser");
        });
      }
      updateBtnText();
    }

    // Initialize first track
    setTrack(trackIndex, false);

    // Play/Pause toggle
    btnMusic.addEventListener("click", () => {
      if (bgm.paused) bgm.play();
      else bgm.pause();
      updateBtnText();
    });

    // Next track button
    btnNextTrack?.addEventListener("click", () => setTrack(trackIndex + 1, true));

    // Auto-play next track when finished
    bgm.addEventListener("ended", () => setTrack(trackIndex + 1, true));

    // Volume slider
    musicVol.addEventListener("input", () => {
      bgm.volume = Number(musicVol.value);
      localStorage.setItem("petal_music_vol", String(musicVol.value));
    });

    // --- FNAF SFX Logic ---
    $("btnAmbient")?.addEventListener("click", () => {
      if (!ambientSfx) return;
      if (ambientSfx.paused) {
        ambientSfx.play();
        $("btnAmbient").textContent = "Ambient: On";
      } else {
        ambientSfx.pause();
        $("btnAmbient").textContent = "Ambient: Off";
      }
    });

    $("btnJumpscare")?.addEventListener("click", () => {
      if (jumpscareSfx) {
        jumpscareSfx.currentTime = 0;
        jumpscareSfx.play();
      }
    });

    $("btnToreador")?.addEventListener("click", () => {
      if (toreadorSfx) {
        toreadorSfx.currentTime = 0;
        toreadorSfx.play();
      }
    });
  });
})();
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

  function initPrompts() {
    const btn = document.getElementById("btnPrompt");
    const card = document.getElementById("promptCard");

    if (!btn || !card) return;

    // Load saved prompt from storage
    const saved = localStorage.getItem("petal_prompt");
    if (saved) card.textContent = saved;

    // Function to pick a new prompt
    function pickNewPrompt() {
      let next;
      // Prevent picking the same prompt twice in a row
      do {
        next = prompts[Math.floor(Math.random() * prompts.length)];
      } while (next === card.textContent && prompts.length > 1);

      card.textContent = next;
      localStorage.setItem("petal_prompt", next);
      
      // Add a little "pop" effect when it changes
      card.style.transform = "scale(1.05)";
      setTimeout(() => card.style.transform = "scale(1)", 100);
    }

    btn.addEventListener("click", pickNewPrompt);
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPrompts);
  } else {
    initPrompts();
  }
})();
/* ------------------------ Moving Themes Logic ------------------------ */
(() => {
  const overlay = document.createElement("div");
  overlay.id = "animation-overlay";
  document.body.prepend(overlay);

  let animationInterval = null;

  function startAnimation(type) {
    // Clear old animation
    if (animationInterval) clearInterval(animationInterval);
    overlay.innerHTML = "";

    animationInterval = setInterval(() => {
      const particle = document.createElement("div");
      const startX = Math.random() * window.innerWidth;
      
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
        particle.style.backgroundColor = Math.random() > 0.5 ? "var(--accent)" : "var(--primary)";
      } else if (type === "blossoms") {
        particle.className = "blossom";
        particle.style.left = startX + "px";
        particle.style.top = "-50px";
        particle.style.animationDuration = (Math.random() * 4 + 5) + "s"; // Slow drifting
        particle.style.backgroundColor = Math.random() > 0.5 ? "#FFB7C5" : "#FF69B4";
      } else if (type === "sunbeams") {
        particle.className = "sunbeam";
        particle.style.left = startX + "px";
        particle.style.top = "-150px";
        particle.style.animationDuration = (Math.random() * 2 + 3) + "s";
      }

      overlay.appendChild(particle);
      setTimeout(() => particle.remove(), 8000);
    }, type === "meteors" ? 1500 : 600); // Blossoms and sunbeams spawn fairly often


  // Hook into your existing theme system
    document.addEventListener("themeChanged", () => {
    const themeName = localStorage.getItem("petal_theme");
    if (themeName === "cosmic_starfall") startAnimation("meteors");
    else if (themeName === "autumn_forest") startAnimation("leaves");
    else if (themeName === "spring_blossom") startAnimation("blossoms");
    else if (themeName === "summer_shimmer") startAnimation("sunbeams");
    else {
      if (animationInterval) clearInterval(animationInterval);
      overlay.innerHTML = "";
    }
  });
  
  // Initial check
  window.dispatchEvent(new CustomEvent("themeChanged"));
})();

