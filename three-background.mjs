/* Petal Journal — shared Three.js background scene
   One renderer/canvas for petals and the evolving miniature Zen garden. */
import * as THREE from "three";

const canvas = document.getElementById("threePetalBg");
if (canvas && !window.__petalThreeBackgroundStarted) {
  window.__petalThreeBackgroundStarted = true;
  const startScene = () => {
    if (!canvas.isConnected) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sceneRoot = new THREE.Group();
    scene.add(sceneRoot);

    // Existing floating sakura-petal layer, retained in the shared renderer.
    const petalGroup = new THREE.Group(); sceneRoot.add(petalGroup);
    const petalMaterials = [0xffb7d5, 0xc4b5fd, 0xfff1f7].map((color, i) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.75, side: THREE.DoubleSide, transparent: true, opacity: [0.62, 0.48, 0.42][i] })
    );
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.9); shape.bezierCurveTo(0.65, 0.55, 0.58, -0.35, 0, -0.85); shape.bezierCurveTo(-0.58, -0.35, -0.65, 0.55, 0, 0.9);
    const petalGeometry = new THREE.ShapeGeometry(shape, 20); petalGeometry.center();
    const petals = [];
    const petalCount = reducedMotion.matches ? 12 : 36;
    for (let i = 0; i < petalCount; i++) {
      const mesh = new THREE.Mesh(petalGeometry, petalMaterials[i % petalMaterials.length].clone());
      const scale = THREE.MathUtils.randFloat(0.3, 0.85);
      mesh.scale.set(scale, scale * THREE.MathUtils.randFloat(0.8, 1.2), scale);
      mesh.position.set(THREE.MathUtils.randFloatSpread(28), THREE.MathUtils.randFloatSpread(18), THREE.MathUtils.randFloat(-16, 4));
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = { speed: THREE.MathUtils.randFloat(0.002, 0.009), drift: THREE.MathUtils.randFloat(0.002, 0.01), spin: THREE.MathUtils.randFloat(0.002, 0.01), baseX: mesh.position.x, phase: Math.random() * Math.PI * 2 };
      petalGroup.add(mesh); petals.push(mesh);
    }

    const starPositions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) { starPositions[i*3] = THREE.MathUtils.randFloatSpread(34); starPositions[i*3+1] = THREE.MathUtils.randFloatSpread(22); starPositions[i*3+2] = THREE.MathUtils.randFloat(-20, 1); }
    const starGeometry = new THREE.BufferGeometry(); starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.48 })); sceneRoot.add(stars);

    // Miniature garden: positioned off-center so it reads as ambient scenery, not UI.
    const garden = new THREE.Group(); garden.position.set(7.2, -4.0, -3.2); garden.scale.setScalar(0.88); sceneRoot.add(garden);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe8dfc9, roughness: 1, transparent: true, opacity: 0.58 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x9aa68a, roughness: 0.92, transparent: true, opacity: 0.58 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7d8b7b, roughness: 0.94, transparent: true, opacity: 0.74 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b6a55, roughness: 0.9, transparent: true, opacity: 0.85 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.15, 3.25, 0.22, 64), baseMat); base.position.y = -0.72; garden.add(base);
    const sand = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.05, 0.08, 64), sandMat); sand.position.y = -0.57; garden.add(sand);
    // Concentric raked-sand grooves.
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0xb7a98e, roughness: 1, transparent: true, opacity: 0.48 });
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35 + i * 0.28, 0.018, 4, 72), grooveMat);
      ring.rotation.x = Math.PI / 2; ring.position.set(-0.35, -0.51 + i * 0.002, 0.05); ring.scale.y = 0.62; garden.add(ring);
    }
    // Stones with softened proportions.
    const stones = [];
    [[-1.65,-0.35,0.12,0.48,0.42,0.38],[1.25,-0.39,0.2,0.58,0.36,0.45],[0.45,-0.42,-0.72,0.34,0.25,0.3]].forEach(([x,y,z,sx,sy,sz]) => {
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 1), stoneMat.clone());
      stone.position.set(x,y,z); stone.scale.set(sx,sy,sz); stone.rotation.set(0.1, Math.random(), 0.15); garden.add(stone); stones.push(stone);
    });
    // A little bonsai: curved-looking trunk, branch arms, and foliage clusters.
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 1.65, 8), trunkMat); trunk.position.set(0.95, 0.25, -0.25); trunk.rotation.z = -0.18; garden.add(trunk);
    const branchGroup = new THREE.Group(); branchGroup.position.set(0.95, 0.5, -0.25); garden.add(branchGroup);
    [[-0.38,0.3,0.32,0.75],[0.28,0.48,0.18,0.68],[-0.12,0.7,0.28,0.55]].forEach(([x,y,z,len]) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.07, len, 6), trunkMat);
      b.position.set(x,y,z); b.rotation.z = x < 0 ? -0.7 : 0.55; branchGroup.add(b);
    });
    const foliageGroup = new THREE.Group(); garden.add(foliageGroup);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x7da77d, roughness: 0.8, transparent: true, opacity: 0.82 });
    const bloomGroup = new THREE.Group(); garden.add(bloomGroup);
    const bloomMat = new THREE.MeshStandardMaterial({ color: 0xf1b6cb, roughness: 0.55, transparent: true, opacity: 0.9 });
    const leafGeometry = new THREE.IcosahedronGeometry(0.42, 1);
    const bloomGeometry = new THREE.SphereGeometry(0.11, 10, 8);
    const leafNodes = [], bloomNodes = [];
    const leafPoints = [[0.35,1.28,-0.28],[1.05,1.42,-0.22],[1.5,1.18,-0.3],[0.65,1.75,-0.3],[1.3,1.8,-0.36],[0.25,1.7,-0.2],[1.75,1.55,-0.4],[0.85,1.05,-0.1]];
    leafPoints.forEach(([x,y,z], i) => {
      const leaf = new THREE.Mesh(leafGeometry, foliageMat.clone()); leaf.position.set(x,y,z); leaf.scale.set(1.05,0.7,0.8); leaf.userData.index = i; foliageGroup.add(leaf); leafNodes.push(leaf);
    });
    const bloomPoints = [[0.25,1.48,-0.12],[0.75,1.92,-0.15],[1.22,1.57,-0.1],[1.6,1.32,-0.14],[1.35,1.96,-0.12],[0.48,1.82,-0.1],[1.82,1.68,-0.15],[0.9,1.26,-0.1],[1.05,2.1,-0.1],[0.05,1.72,-0.1],[1.65,1.9,-0.1],[0.55,2.08,-0.1]];
    bloomPoints.forEach(([x,y,z], i) => { const bloom = new THREE.Mesh(bloomGeometry, bloomMat.clone()); bloom.position.set(x,y,z); bloom.userData.index = i; bloomGroup.add(bloom); bloomNodes.push(bloom); });
    // A few floating lantern-like pebbles make progress changes visible without UI overlays.
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd8e7, transparent: true, opacity: 0.55 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), glowMat); glow.position.set(-1.95, 0.45, 0.25); garden.add(glow);

    scene.add(new THREE.AmbientLight(0xffffff, 1.65));
    const warmLight = new THREE.PointLight(0xffc9dc, 1.4, 35); warmLight.position.set(-8, 5, 8); scene.add(warmLight);
    const greenLight = new THREE.PointLight(0xb7dfbd, 1.1, 30); greenLight.position.set(8, -3, 6); scene.add(greenLight);

    let mouseX = 0, mouseY = 0, rafId = 0, running = true, lastProgressKey = "";
    const onMove = (event) => { mouseX = (event.clientX / window.innerWidth - 0.5) * 2; mouseY = (event.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener("pointermove", onMove, { passive: true });
    const cssColor = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    const applyThemeColors = () => {
      const accent = cssColor("--accent", "#f1b6cb");
      const primary = cssColor("--primary", "#7da77d");
      foliageMat.color.set(primary); bloomMat.color.set(accent); glowMat.color.set(accent);
      foliageMat.needsUpdate = true; bloomMat.needsUpdate = true;
    };
    const readProgress = () => {
      let entries = [];
      try { entries = JSON.parse(localStorage.getItem("petal_entries_v1") || "[]"); if (!Array.isArray(entries)) entries = []; } catch { entries = []; }
      const counts = ["petal_whiteboard_count","petal_vision_count","petal_capsule_count","petal_well_count","petal_dojo_xp","petal_summon_xp"].map(k => Number(localStorage.getItem(k)) || 0);
      let xp = entries.length * 50 + counts[0]*20 + counts[1]*30 + counts[2]*100 + counts[3]*30 + counts[4] + counts[5];
      for (const entry of entries) xp += String(entry?.content || "").replace(/<[^>]*>/g," ").split(/\s+/).filter(Boolean).length;
      const level = Math.floor(xp / 200) + 1;
      return { entries: entries.length, xp, level };
    };
    const updateGarden = () => {
      const p = readProgress();
      const key = `${p.entries}:${p.level}`;
      const leavesVisible = Math.min(leafNodes.length, 2 + Math.floor((p.level - 1) / 2));
      const bloomsVisible = Math.min(bloomNodes.length, Math.floor(p.level / 2) + Math.min(p.entries, 3));
      leafNodes.forEach((node, i) => { node.visible = i < leavesVisible; });
      bloomNodes.forEach((node, i) => { node.visible = i < bloomsVisible; });
      garden.scale.setScalar(0.78 + Math.min(p.level, 12) * 0.012);
      applyThemeColors();
      if (key !== lastProgressKey) {
        if (lastProgressKey) {
          const old = lastProgressKey.split(":").map(Number);
          if (p.entries > old[0] || p.level > old[1]) {
            glow.scale.setScalar(1.5); glow.material.opacity = 0.9;
          }
        }
        lastProgressKey = key;
      }
    };
    updateGarden();
    window.addEventListener("petal:journal-updated", updateGarden);
    window.addEventListener("storage", (event) => { if (!event.key || event.key.startsWith("petal_")) updateGarden(); });
    document.addEventListener("themeChanged", applyThemeColors);
    const observer = new MutationObserver(applyThemeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); };
    window.addEventListener("resize", onResize);
    const clock = new THREE.Clock();
    const frame = () => {
      const elapsed = clock.getElapsedTime();
      if (!reducedMotion.matches) {
        petalGroup.rotation.y = mouseX * 0.025; petalGroup.rotation.x = -mouseY * 0.02;
        stars.rotation.y = elapsed * 0.006; stars.rotation.x = elapsed * 0.003;
        petals.forEach(p => { const d = p.userData; p.position.y -= d.speed; p.position.x = d.baseX + Math.sin(elapsed * 0.7 + d.phase) * 0.65; p.rotation.x += d.spin * 0.35; p.rotation.y += d.spin * 0.5; p.rotation.z += d.drift; if (p.position.y < -11) { p.position.y = 11; p.position.x = THREE.MathUtils.randFloatSpread(28); d.baseX = p.position.x; p.position.z = THREE.MathUtils.randFloat(-16, 4); } });
        garden.rotation.y = Math.sin(elapsed * 0.12) * 0.025 + mouseX * 0.008;
        foliageGroup.rotation.z = Math.sin(elapsed * 0.35) * 0.018;
        glow.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.12);
        glow.material.opacity = 0.42 + Math.sin(elapsed * 2) * 0.12;
      }
      renderer.render(scene, camera);
      if (running && !document.hidden) rafId = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) rafId = requestAnimationFrame(frame); else cancelAnimationFrame(rafId);
    });
    reducedMotion.addEventListener?.("change", () => { if (reducedMotion.matches) { petals.forEach(p => p.position.y = p.position.y); } });
    rafId = requestAnimationFrame(frame);
  };
  if ("requestIdleCallback" in window) requestIdleCallback(startScene, { timeout: 1800 }); else setTimeout(startScene, 250);
}
