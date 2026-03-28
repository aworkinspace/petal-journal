// --- Sparkle cursor trail (canvas) ---
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("sparkles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function sparkleColors() {
    const s = getComputedStyle(document.documentElement);
    const arr = [1, 2, 3, 4, 5]
      .map((i) => s.getPropertyValue(`--sparkle-${i}`).trim())
      .filter(Boolean);
    return arr.length ? arr : ["#FFA5D6", "#FFD6EE", "#ECD2E0", "#CED1F8", "#A7ABDE"];
  }

  let colors = sparkleColors();
  const particles = [];
  let last = { x: 0, y: 0, t: 0 };

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  function spawn(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.4 + Math.random() * 1.6;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 0.4,
        r: 1 + Math.random() * 2.2,
        life: 18 + Math.random() * 18,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
      });
    }
  }

  addEventListener(
    "pointermove",
    (e) => {
      const now = performance.now();
      const x = e.clientX,
        y = e.clientY;

      if (now - last.t < 12) return;

      const dx = x - last.x,
        dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      const count = Math.max(2, Math.min(10, Math.floor(dist / 6)));

      spawn(x, y, count);
      last = { x, y, t: now };
    },
    { passive: true }
  );

  function drawStar(x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.45, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.45, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    colors = sparkleColors();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.rot += p.vr;
      p.life -= 1;

      const alpha = Math.max(0, Math.min(1, p.life / 24));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      drawStar(p.x, p.y, p.r, p.rot);
      ctx.globalAlpha = alpha * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) particles.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    if (particles.length > 500) particles.splice(0, particles.length - 500);
    requestAnimationFrame(tick);
  }
  tick();
})();

// --- Background music controls (local mp3 in <audio id="bgm">) ---
(() => {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("btnMusic");
  const vol = document.getElementById("musicVol");
  if (!audio || !btn || !vol) return;

  const savedVol = localStorage.getItem("petal_music_vol");
  if (savedVol !== null) vol.value = savedVol;
  audio.volume = Number(vol.value);

  function setBtn() {
    btn.textContent = audio.paused ? "Play music" : "Pause music";
  }
  setBtn();

  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
    localStorage.setItem("petal_music_vol", String(vol.value));
  });

  btn.addEventListener("click", async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
      setBtn();
    } catch {
      btn.textContent = "Music unavailable";
    }
  });
})();
