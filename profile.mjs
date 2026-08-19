import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

const auth = window.firebaseAuth;
const db = window.firebaseDb;
const storage = window.firebaseStorage;
let currentUser = null;

const $ = (id) => document.getElementById(id);

// --- 1. Load Owned Items from Storage ---
function getOwnedItems() {
  try {
    return JSON.parse(localStorage.getItem("petal_owned_items") || "[]");
  } catch (e) {
    return [];
  }
}

// --- 2. SFX Configuration & Playback ---
const sfxAudioMap = {
  "sfx_chidori": "assets/sfx/chidori.mp3",
  "sfx_dattebayo": "assets/sfx/dattebayo.mp3",
  "sfx_yowaimo": "assets/sfx/yowaimo.mp3",
  "sfx_usuratonkachi": "assets/sfx/usuratonkachi.mp3",
  "sfx_notazenin": "assets/sfx/notazenin.mp3",
  "sfx_sukunalaugh": "assets/sfx/sukunalaugh.mp3",
  "sfx_sasukesayingnaruto": "assets/sfx/naruto.mp3",
  "sfx_narutosayingsasuke": "assets/sfx/sasuke.mp3",
  "sfx_hashirama": "assets/sfx/hashirama.mp3",
  "sfx_domain": "assets/sfx/domain.mp3",
  "sfx_prominence": "assets/sfx/prominence.mp3",
  "default_save": "assets/sfx/default_save.mp3",
  "default_delete": "assets/sfx/default_delete.mp3"
};

const sfxDisplayNames = {
  "sfx_chidori": "Chidori",
  "sfx_dattebayo": "Dattebayo!",
  "sfx_yowaimo": "Yowaimo",
  "sfx_usuratonkachi": "Usuratonkachi",
  "sfx_notazenin": "Not a Zenin",
  "sfx_sukunalaugh": "Sukuna Laugh",
  "sfx_sasukesayingnaruto": "Sasuke ('Naruto!')",
  "sfx_narutosayingsasuke": "Naruto ('Sasuke!')",
  "sfx_hashirama": "Hashirama!",
  "sfx_domain": "Domain Expansion",
  "sfx_prominence": "Prominence Burn"
};

function playSFX(sfxId) {
  if (!sfxId) return;
  const audioPath = sfxAudioMap[sfxId];
  if (!audioPath) return;

  const audio = new Audio(audioPath);
  audio.play().catch(err => console.warn("SFX playback warning:", err));
}

function setupSfxDropdown(selectEl, storageKey, defaultAudioKey) {
  if (!selectEl) return;
  const ownedItems = getOwnedItems();

  selectEl.innerHTML = `<option value="default">Default ${storageKey.includes("delete") ? "Delete" : "Save"} Sound</option>`;

  ownedItems.forEach(itemId => {
    if (itemId.startsWith("sfx_")) {
      const opt = document.createElement("option");
      opt.value = itemId;
      opt.textContent = sfxDisplayNames[itemId] || itemId.replace("sfx_", "").toUpperCase();
      selectEl.appendChild(opt);
    }
  });

  selectEl.value = localStorage.getItem(storageKey) || "default";

  selectEl.addEventListener("change", (e) => {
    const selected = e.target.value;
    localStorage.setItem(storageKey, selected);

    const soundToPlay = selected === "default" ? defaultAudioKey : selected;
    playSFX(soundToPlay);
  });
}

// --- 3. Customizations (Cursors, Titles, Pets) ---
function setupCustomizations() {
  const ownedItems = getOwnedItems();

  // Cursors
  const cursorSelect = $("cursorSelect");
  if (cursorSelect) {
    cursorSelect.innerHTML = '<option value="default">Default Pointer</option>';
    ownedItems.forEach(id => {
      if (id.startsWith("cursor_")) {
        const name = id.replace("cursor_", "").replace(/_/g, " ").toUpperCase();
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = `${name} Cursor`;
        cursorSelect.appendChild(opt);
      }
    });
    cursorSelect.value = localStorage.getItem("petal_equipped_cursor") || "default";
    cursorSelect.onchange = (e) => localStorage.setItem("petal_equipped_cursor", e.target.value);
  }

  // Titles
  const titleSelect = $("titleSelect");
  const titleDisplay = $("activeTitleDisplay");
  if (titleSelect) {
    titleSelect.innerHTML = '<option value="none">No Title</option>';
    const titleNames = {
      "title_sannin": "Legendary Sannin",
      "title_uchiha": "Ghost of the Uchiha",
      "title_honored": "The Honored One",
      "title_kage": "Shadow of the Leaf",
      "title_yonko": "The Strongest Man",
      "title_mednin": "The Medical-Nin",
      "title_joyboy": "Warrior of Liberation",
      "title_curse_king": "King of Curses",
      "title_fierce_wings": "Fierce Wings",
      "title_hellflame_sovereign": "Hellflame Sovereign"
    };

    ownedItems.forEach(id => {
      if (id.startsWith("title_")) {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = titleNames[id] || "Elite Shinobi";
        titleSelect.appendChild(opt);
      }
    });

    const equippedTitle = localStorage.getItem("petal_equipped_title") || "none";
    titleSelect.value = equippedTitle;

    if (titleDisplay) {
      if (equippedTitle !== "none") {
        titleDisplay.textContent = titleNames[equippedTitle] || "Elite Title";
        titleDisplay.style.display = "inline-block";
      } else {
        titleDisplay.style.display = "none";
      }
    }

    titleSelect.onchange = (e) => {
      localStorage.setItem("petal_equipped_title", e.target.value);
      if (titleDisplay) {
        if (e.target.value !== "none") {
          titleDisplay.textContent = titleNames[e.target.value] || "Elite Title";
          titleDisplay.style.display = "inline-block";
        } else {
          titleDisplay.style.display = "none";
        }
      }
    };
  }

  // Pets / Companions
  const petSelect = $("petSelect");
  if (petSelect) {
    petSelect.innerHTML = '<option value="none">No Companion</option>';
    ownedItems.forEach(id => {
      if (id.startsWith("pet_")) {
        const name = id.replace("pet_nendo_", "").replace("pet_", "").replace(/_/g, " ").toUpperCase();
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = `${name} Companion`;
        petSelect.appendChild(opt);
      }
    });
    petSelect.value = localStorage.getItem("petal_equipped_pet") || "none";
    petSelect.onchange = (e) => localStorage.setItem("petal_equipped_pet", e.target.value);
  }
}

// --- 4. Zen Progress & XP Calculation ---
async function updateZenProgress() {
  let wb = Number(localStorage.getItem("petal_whiteboard_count")) || 0;
  let vs = Number(localStorage.getItem("petal_vision_count")) || 0;
  let cp = Number(localStorage.getItem("petal_capsule_count")) || 0;
  let wl = Number(localStorage.getItem("petal_well_count")) || 0;
  let dj = Number(localStorage.getItem("petal_dojo_xp")) || 0;
  let sm = Number(localStorage.getItem("petal_summon_xp")) || 0;

  if (currentUser) {
    try {
      const statsSnap = await getDoc(doc(db, "users", currentUser.uid, "stats", "zen"));
      if (statsSnap.exists()) {
        const cloud = statsSnap.data();
        wb = Math.max(wb, cloud.whiteboard || 0);
        vs = Math.max(vs, cloud.vision || 0);
        cp = Math.max(cp, cloud.capsule || 0);
        wl = Math.max(wl, cloud.well || 0);
      }
    } catch (e) {
      console.warn("Cloud fetch failed:", e);
    }
  }

  let entries = [];
  try {
    const raw = localStorage.getItem("petal_entries_v1");
    if (raw) entries = JSON.parse(raw);
  } catch (e) {
    console.error("Entry parse error", e);
  }

  let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30) + dj + sm;
  entries.forEach(e => {
    const text = String(e.content || "").replace(/<[^>]*>/g, ' ');
    totalXP += text.split(/\s+/).filter(Boolean).length;
  });

  const xpPerLevel = 200;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const currentXPInLevel = totalXP % xpPerLevel;
  const progressPercent = (currentXPInLevel / xpPerLevel) * 100;

  if ($("zenBarFill")) $("zenBarFill").style.width = progressPercent + "%";
  if ($("zenXP")) $("zenXP").textContent = `${currentXPInLevel} / ${xpPerLevel} XP`;
  if ($("zenLevel")) $("zenLevel").textContent = "Level " + level;

  let rank = "Genin";
  if (level >= 5) rank = "Jonin";
  if (level >= 10) rank = "Kage";
  if (level >= 15) rank = "Celestial Sage";
  if ($("ninjaRank")) $("ninjaRank").textContent = "Rank: " + rank;

  if (level >= 5 && $("level5Badge")) $("level5Badge").className = "badge-visible";
  if (level >= 10) document.querySelectorAll(".panel").forEach(p => p.classList.add("kage-aura"));
}

// --- 5. Animation Preferences ---
function setupAnimationToggle() {
  const KEY = "prefs.reduceAnimations";
  const toggle = $("toggleAnims");
  if (!toggle) return;

  const reduce = localStorage.getItem(KEY) === "1";
  toggle.checked = reduce;
  document.documentElement.classList.toggle("reduce-anim", reduce);

  toggle.addEventListener("change", () => {
    const reduceNow = toggle.checked;
    localStorage.setItem(KEY, reduceNow ? "1" : "0");
    document.documentElement.classList.toggle("reduce-anim", reduceNow);
  });
}

// --- 6. Event Listeners & Auth Loop ---
$("btnUploadPic")?.addEventListener("click", () => $("picUpload")?.click());

$("picUpload")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;
  if ($("picUploadMsg")) $("picUploadMsg").textContent = "Uploading...";
  try {
    const path = `profile_pictures/${currentUser.uid}/profile.${file.name.split('.').pop()}`;
    const sRef = ref(storage, path);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    await updateProfile(currentUser, { photoURL: url });
    if ($("profilePic")) $("profilePic").src = url;
    if ($("picUploadMsg")) $("picUploadMsg").textContent = "Success!";
  } catch (err) {
    console.error(err);
    if ($("picUploadMsg")) $("picUploadMsg").textContent = "Error!";
  }
});

$("btnUpdateProfile")?.addEventListener("click", async () => {
  if (!currentUser) return;
  try {
    await updateProfile(currentUser, { displayName: $("displayName").value.trim() });
    await setDoc(doc(db, "users", currentUser.uid), { birthday: $("userBirthday").value }, { merge: true });
    alert("Profile Saved!");
    updateZenProgress();
  } catch (e) {
    alert("Error saving profile!");
  }
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupSfxDropdown($("sfxSelect"), "petal_equipped_sfx", "default_save");
  setupSfxDropdown($("deleteSfxSelect"), "petal_equipped_delete_sfx", "default_delete");
  setupCustomizations();
  setupAnimationToggle();

  const tokens = Number(localStorage.getItem("petal_tokens")) || 0;
  if ($("tokenBalance")) $("tokenBalance").textContent = tokens;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      if ($("displayName")) $("displayName").value = user.displayName || "";
      if ($("profilePic")) $("profilePic").src = user.photoURL || "assets/default.png";

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && $("userBirthday")) {
        $("userBirthday").value = userDoc.data().birthday || "";
      }

      updateZenProgress();
    } else {
      window.location.href = "login.html";
    }
  });
});
