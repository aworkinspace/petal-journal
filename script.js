// --- Firebase Authentication Listener ---
(() => {
  const auth = window.firebaseAuth; // from index.html head
  const db = window.firebaseDb;
  if (!auth || !db) {
    console.error("Firebase not initialized. Check firebaseConfig in index.html.");
    return;
  }

  // Helper to update feature access based on earlyAccess flag
  function initFeatureAccess() {
    const themeSelect = document.getElementById("themeSelect");
    const betaThemes = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt"]);
    const earlyAccess = localStorage.getItem("petal_early_access") === "1";

    if (themeSelect) {
      [...themeSelect.options].forEach((opt) => {
        if (betaThemes.has(opt.value)) opt.disabled = !earlyAccess;
      });
      const currentTheme = localStorage.getItem("petal_theme");
      if (!earlyAccess && betaThemes.has(currentTheme)) {
        themeSelect.value = "petal";
        themeSelect.dispatchEvent(new Event("change"));
      }
    }

    const btnAddImage = document.getElementById("btnAddImage");
    const imgPicker = document.getElementById("imgPicker");
    if (btnAddImage && imgPicker) {
      if (!earlyAccess) {
        btnAddImage.style.display = "none";
        imgPicker.remove();
      } else {
        btnAddImage.style.display = "inline-flex";
        if (!document.getElementById("imgPicker")) {
          const bar = document.getElementById("stickerBar");
          if (bar) {
            const newPicker = document.createElement("input");
            newPicker.id = "imgPicker";
            newPicker.type = "file";
            newPicker.accept = "image/*";
            newPicker.hidden = true;
            bar.appendChild(newPicker);
          }
        }
      }
    }
  }

  // Birthday confetti helpers
  async function checkBirthdayAndCelebrate(user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const birthday = data.birthday; // "YYYY-MM-DD"
      if (!birthday) return;

      const today = new Date();
      const [yearStr, monthStr, dayStr] = birthday.split("-");
      if (!monthStr || !dayStr) return;

      const month = Number(monthStr);
      const day = Number(dayStr);
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();
      if (todayMonth !== month || todayDay !== day) return;

      const year = today.getFullYear();
      const flagKey = `petal_birthday_confetti_${user.uid}_${year}`;
      if (localStorage.getItem(flagKey) === "1") return;

      fireBirthdayConfetti();
      localStorage.setItem(flagKey, "1");
      toast("Happy birthday!");
    } catch (e) {
      console.error("Birthday check failed:", e);
    }
  }

  function fireBirthdayConfetti() {
    if (!window.confetti) return;

    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      window.confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      window.confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });

      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  // Update UI and early access flag based on auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("petal_early_access", "1");

      if (els.authButton) els.authButton.style.display = "none";
      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex";
        els.profileButton.textContent = user.displayName
          ? `${user.displayName}'s Profile`
          : "Profile";
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

  // Logout functionality
  els.btnSignOut?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      toast("Successfully logged out!");
    } catch (error) {
      console.error("Logout failed:", error.code, error.message);
      toast(`Logout failed: ${error.message}`);
    }
  });

  initFeatureAccess();
})();
