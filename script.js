// --- Minimal local journaling app (localStorage) ---
const $ = (id) => document.getElementById(id);

const els = {
  search: $("search"),
  date: $("date"),
  mood: $("mood"),
  title: $("title"),
  content: $("content"), // contenteditable div
  moodChip: $("moodChip"),
  entryList: $("entryList"),
  count: $("count"),
  toast: $("toast"),
  status: $("status"),
  promptCard: $("promptCard"),
  tagRow: $("tagRow"),
  btnSave: $("btnSave"),
  btnDelete: $("btnDelete"),
  btnNew: $("btnNew"),
  btnExport: $("btnExport"),
  btnPrompt: $("btnPrompt"),

  // New elements for Firebase Auth UI
  authButton: $("authButton"),
  profileButton: $("profileButton"),
  btnSignOut: $("btnSignOut"),
  btnLock: $("btnLock"), // Added to els
  btnSetPasscode: $("btnSetPasscode"), // Added to els
};

// --- Firebase Authentication Listener ---
// This listens for when a user logs in or out and updates the UI/flags
(() => {
  const auth = window.firebaseAuth; // Get auth instance from global scope (initialized in index.html head)
  if (!auth) {
    console.error("Firebase Auth not initialized. Check firebaseConfig in index.html.");
    return;
  }

  // Update UI and early access flag based on auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      localStorage.setItem("petal_early_access", "1");
      if (els.authButton) els.authButton.style.display = "none"; // Hide Login button
      if (els.profileButton) {
        els.profileButton.style.display = "inline-flex"; // Show Profile button
        els.profileButton.textContent = user.displayName ? `${user.displayName}'s Profile` : `Profile`;
        els.profileButton.href = "profile.html"; // Link to new profile page
      }
      if (els.btnSignOut) els.btnSignOut.style.display = "inline-flex"; // Show Logout button

      // Temporarily hide local lock/passcode features for authenticated users
      // These will be replaced by Firebase-managed user settings later
      if (els.btnLock) els.btnLock.style.display = "none";
      if (els.btnSetPasscode) els.btnSetPasscode.style.display = "none";

      toast(`Logged in as ${user.email}`);
    } else {
      // User is signed out
      localStorage.removeItem("petal_early_access");
      if (els.authButton) {
        els.authButton.style.display = "inline-flex"; // Show Login button
        els.authButton.textContent = "Login";
        els.authButton.href = "login.html";
      }
      if (els.profileButton) els.profileButton.style.display = "none"; // Hide Profile button
      if (els.btnSignOut) els.btnSignOut.style.display = "none"; // Hide Logout button

      // Show local lock/passcode features for unauthenticated users
      if (els.btnLock) els.btnLock.style.display = "inline-flex";
      if (els.btnSetPasscode) els.btnSetPasscode.style.display = "inline-flex";

      toast("Logged out.");
    }

    // After auth state changes, re-run initialization for feature availability
    // This will update the theme/skin dropdowns and add image button
    initFeatureAccess();
  });

  // Logout functionality
  els.btnSignOut?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      toast("Successfully logged out!");
      // UI will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Logout failed:", error.code, error.message);
      toast(`Logout failed: ${error.message}`);
    }
  });

  // --- Helper to update feature access based on earlyAccess flag ---
  function initFeatureAccess() {
    // Re-apply early access logic for themes
    const themeSelect = document.getElementById("themeSelect");
    const betaThemes = new Set(["midnight", "strawberry_matcha", "blueberry_yogurt"]);
    const earlyAccess = localStorage.getItem("petal_early_access") === "1";

    if (themeSelect) {
      [...themeSelect.options].forEach((opt) => {
        if (betaThemes.has(opt.value)) {
          opt.disabled = !earlyAccess;
        }
      });
      // If a beta theme was saved and access is now revoked, revert to petal
      const currentTheme = localStorage.getItem("petal_theme");
      if (!earlyAccess && betaThemes.has(currentTheme)) {
        themeSelect.value = "petal";
        themeSelect.dispatchEvent(new Event('change')); // Trigger change to apply theme
      }
    }

    // Re-apply early access logic for image upload button
    const btnAddImage = document.getElementById("btnAddImage");
    const imgPicker = document.getElementById("imgPicker");
    if (btnAddImage && imgPicker) {
      if (!earlyAccess) {
        btnAddImage.style.display = "none";
        imgPicker.remove(); // Remove to prevent accidental usage
      } else {
        btnAddImage.style.display = "inline-flex"; // Show if user is logged in
        // Re-add picker if it was removed (in case user logs in on same session)
        if (!document.getElementById("imgPicker")) {
          const newPicker = document.createElement("input");
          newPicker.id = "imgPicker";
          newPicker.type = "file";
          newPicker.accept = "image/*";
          newPicker.hidden = true;
          btnAddImage.parentNode.appendChild(newPicker);
        }
      }
    }
    // Any other early access features should call initFeatureAccess or check the flag
  }
  // Run initial check
  initFeatureAccess();

})();
// Import Firebase functions needed for authentication
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
