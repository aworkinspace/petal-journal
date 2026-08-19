(() => {
  const PREF_KEY = "prefs.reduceAnimations";

  // 1. Initialize default preference based on OS/Browser settings if not set
  if (localStorage.getItem(PREF_KEY) === null) {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) {
      localStorage.setItem(PREF_KEY, "1");
    }
  }

  // Helper function to check if animations are enabled
  window.animationsEnabled = function () {
    return localStorage.getItem(PREF_KEY) !== "1";
  };

  // Sync root element class
  function syncRootClass() {
    document.documentElement.classList.toggle("reduce-anim", !window.animationsEnabled());
  }
  syncRootClass();

  // 2. Set up Overlay Element
  let overlay = document.getElementById("animation-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "animation-overlay";
    document.body.prepend(overlay);
  }

  let animationInterval = null;
  let currentAnimationType = null;

  // Helper to completely stop active animations and clear overlay
  function stopAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    if (overlay) {
      overlay.innerHTML = "";
    }
  }

  // Helper to toggle animation preference dynamically
  window.setAnimationsEnabled = function (enabled) {
    localStorage.setItem(PREF_KEY, enabled ? "0" : "1");
    syncRootClass();

    if (!enabled) {
      stopAnimation();
    } else if (currentAnimationType) {
      startAnimation(currentAnimationType);
    }
  };

  // 3. Main Animation Control Function
  function startAnimation(type) {
    currentAnimationType = type;

    // Clear existing interval and overlay elements
    stopAnimation();

    // Stop if animations are disabled or type is empty
    if (!window.animationsEnabled() || !type) return;

    animationInterval = setInterval(() => {
      if (!window.animationsEnabled()) {
        stopAnimation();
        return;
      }

      const p = document.createElement("div");
      const startX = Math.random() * window.innerWidth;

      // --- 1. BASIC SEASONS ---
      if (type === "meteors") { p.className = "meteor"; p.style.left = (startX + 400) + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 1 + 0.5) + "s"; }
      else if (type === "leaves") { p.className = "leaf"; p.style.left = startX + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "blossoms") { p.className = "blossom"; p.style.left = startX + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 4 + 5) + "s"; }
      else if (type === "sunbeams") { p.className = "sunbeam"; p.style.left = startX + "px"; p.style.top = "-150px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; }
      else if (type === "snow") { p.className = "snowflake"; p.style.left = startX + "px"; p.style.top = "-10px"; const size = Math.random() * 4 + 2 + "px"; p.style.width = size; p.style.height = size; p.style.animationDuration = (Math.random() * 3 + 5) + "s"; }
      
      // --- 2. NARUTO THEMES ---
      else if (type === "aura") { p.className = Math.random() > 0.3 ? "aura-flame" : "aura-flame aura-orange"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-100px"; p.style.animationDuration = (Math.random() * 1.5 + 1.5) + "s"; }
      else if (type === "teleport") { p.className = "flash-spark"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; const rot = Math.random() * 360; p.style.setProperty('--rot', `${rot}deg`); p.style.animationDuration = "0.25s"; }
      else if (type === "pearls") { p.className = "pearl"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; const s = Math.floor(Math.random() * 12 + 10) + "px"; p.style.width = s; p.style.height = s; p.style.animationDelay = (Math.random() * 5) + "s"; }
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
        const rand = Math.random();
        if (rand > 0.92) { 
          p.className = "sage-mark"; p.style.left = "50vw"; p.style.top = "50vh"; p.style.transform = "translate(-50%, -50%)"; p.style.animationDuration = "5s";
        } else if (rand > 0.65) { 
          p.className = "wood-vine"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-50px"; const randomRot = Math.random() * 360; p.style.setProperty('--rot', `${randomRot}deg`); p.style.animationDuration = "6s";
        } else { 
          p.className = "wood-petal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s";
        }
      }
      else if (type === "bubbles") { if (Math.random() > 0.6) { p.className = "water-ripple"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; } else { p.className = "water-drop"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; } p.style.animationDuration = "4s"; }
      else if (type === "spirals") { p.className = "uzumaki-spiral"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "5s"; } 
      else if (type === "bolts") { p.className = "chidori-bolt"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.transform = `rotate(${Math.random() * 360}deg)`; p.style.animationDuration = "0.3s"; }
      else if (type === "sharks") { p.className = "shark-fin"; p.style.left = "-40px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; } 
      else if (type === "flytraps") { p.className = "flytrap-spike"; p.style.left = Math.random() * 100 + "vw"; const isT = Math.random() > 0.5; p.style[isT ? 'top' : 'bottom'] = "-10px"; if (isT) p.style.transform = "rotate(180deg)"; p.style.animationDuration = "3s"; }
      else if (type === "love_sand") { p.className = "love-kanji"; p.textContent = "愛"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-40px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "shadows") { const edge = Math.random(); if (edge > 0.5) { p.style.bottom = "-50px"; p.style.left = Math.random() * 100 + "vw"; p.style.setProperty('--rot', `${(Math.random() * 40) - 20}deg`); } else { p.style.top = Math.random() * 100 + "vh"; p.style.left = edge > 0.25 ? "-50px" : "100vw"; p.style.setProperty('--rot', edge > 0.25 ? "90deg" : "-90deg"); } p.className = "shadow-tendril"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; }
      else if (type === "edo_shards") { p.className = "paper-sheet"; p.style.backgroundColor = "#262626"; p.style.boxShadow = "0 0 10px #63B3ED"; }
      else if (type === "fate_lines") { p.className = "fate-line"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "jashin") { p.className = "jashin-seal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.transform = `rotate(${Math.random() * 360}deg)`; p.style.animationDuration = "5s"; }
      else if (type === "clouds") { p.className = "red-cloud"; p.style.left = "-60px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 10 + 15) + "s"; }
      else if (type === "threads") { p.className = "stitch-thread"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-70px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "explosive_birds") { p.className = "clay-bird"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = "3s"; }
      else if (type === "puppet_strings") { p.className = "puppet-string"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "0"; }
      else if (type === "paper") { p.className = "paper-sheet"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-30px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "gravity") { p.className = "gravity-ring"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "tobi_swirl") { p.className = "tobi-spiral"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "rain") { p.className = "rain-drop"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = (Math.random() * 0.4 + 0.6) + "s"; }
      else if (type === "seals") { const k = ["蝦", "蛞", "蛇"]; p.className = "kanji-seal"; p.textContent = k[Math.floor(Math.random() * k.length)]; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "5s"; }

      // --- 3. JJK THEMES ---
      else if (type === "infinity") { p.className = "infinity-ring"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "4s"; }
      else if (type === "slashes") { p.className = "sukuna-slash"; p.style.left = Math.random() * 80 + 10 + "vw"; p.style.top = Math.random() * 80 + 10 + "vh"; const rR = Math.random() * 360; p.style.setProperty('--rot', `${rR}deg`); p.style.animationDuration = "0.2s"; }

      // Append element and clean up after animation finishes
      if (p.className) {
        overlay.appendChild(p);
        const duration = parseFloat(p.style.animationDuration || "3") * 1000;
        setTimeout(() => p.remove(), duration);
      }
    }, 400);
  }

  // Expose function globally
  window.startAnimation = startAnimation;

  // 4. UI Toggle Binding (#toggleAnims)
  function setupToggleUI() {
    const toggleBtn = document.getElementById("toggleAnims");
    if (!toggleBtn) return;

    // Set initial checkbox state (checked if reduce-animations is ON)
    toggleBtn.checked = !window.animationsEnabled();

    // Listen to changes
    toggleBtn.onchange = (e) => {
      const reduce = e.target.checked;
      window.setAnimationsEnabled(!reduce);
    };
  }

  // Initialize toggle UI binding on load or DOM readiness
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupToggleUI);
  } else {
    setupToggleUI();
  }

  // Delegate event handling if #toggleAnims is rendered dynamically later
  document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "toggleAnims") {
      const reduce = e.target.checked;
      window.setAnimationsEnabled(!reduce);
    }
  });

  // 5. Theme Changed Listener
  window.addEventListener("themeChanged", (e) => {
    const animType = e.detail?.animation || e.detail?.themeAnim;
    if (animType) {
      startAnimation(animType);
    }
  });
})();
