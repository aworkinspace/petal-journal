// script.js (loaded with type="module")

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
  };

  const betaThemes = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt"]);

  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._id);
    toast._id = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function initFeatureAccess() {
    const earlyAccess = localStorage.getItem("petal_early_access") === "1";

    // Themes
    if (els.themeSelect) {
      [...els.themeSelect.options].forEach((opt) => {
        if (betaThemes.has(opt.value)) opt.disabled = !earlyAccess;
      });

      const currentTheme = localStorage.getItem("petal_theme");
      if (!earlyAccess && betaThemes.has(currentTheme)) {
        els.themeSelect.value = "petal";
        els.themeSelect.dispatchEvent(new Event("change"));
      }
    }

    // Add image (beta)
    const btnAddImage = els.btnAddImage;
    const imgPicker = document.getElementById("imgPicker");

    if (btnAddImage) btnAddImage.style.display = earlyAccess ? "inline-flex" : "none";

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

      fireBirthdayConfetti();
      localStorage.setItem(flagKey, "1");
      toast("Happy birthday!");
    } catch (e) {
      console.error("Birthday check failed:", e);
    }
  }

  function fireBirthdayConfetti() {
    if (!window.confetti) return;

    const end = Date.now() + 3000;
    (function frame() {
      window.confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      window.confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("petal_early_access", "1");

      els.authButton && (els.authButton.style.display = "none");

      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex";
        els.profileButton.textContent = user.displayName ? `${user.displayName}'s Profile` : "Profile";
        els.profileButton.href = "profile.html";
      }

      els.btnSignOut && (els.btnSignOut.style.display = "inline-flex");
      els.btnLock && (els.btnLock.style.display = "none");
      els.btnSetPasscode && (els.btnSetPasscode.style.display = "none");

      toast(`Logged in as ${user.email}`);
      checkBirthdayAndCelebrate(user);
    } else {
      localStorage.removeItem("petal_early_access");

      if (els.authButton) {
        els.authButton.style.display = "inline-flex";
        els.authButton.textContent = "Login";
        els.authButton.href = "login.html";
      }

      els.profileButton && (els.profileButton.style.display = "none");
      els.btnSignOut && (els.btnSignOut.style.display = "none");
      els.btnLock && (els.btnLock.style.display = "inline-flex");
      els.btnSetPasscode && (els.btnSetPasscode.style.display = "inline-flex");

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
