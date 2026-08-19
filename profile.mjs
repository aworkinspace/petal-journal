import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, updateProfile 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyBNB-V-biC7y2-dKx_qzYCpplnwU2r5PaI",
  authDomain: "petal-journal-final.firebaseapp.com",
  projectId: "petal-journal-final",
  storageBucket: "petal-journal-final.firebasestorage.app",
  messagingSenderId: "805852798492",
  appId: "1:805852798492:web:0e2b1e4fa74850a77a09d9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;
const $ = (id) => document.getElementById(id);

// Load owned items from storage
const ownedItems = JSON.parse(localStorage.getItem("petal_owned_items")) || [];

// Audio Map
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
  "default_delete": "assets/sfx/default_delete.mp3",
};

function playSFX(sfxId) {
  if (!sfxId) return;
  const audioPath = sfxAudioMap[sfxId];
  if (!audioPath) return;
  const audio = new Audio(audioPath);
  audio.play().catch(err => console.warn("Audio playback issue:", err));
}

// Update Zen Level Progress
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
        localStorage.setItem("petal_whiteboard_count", wb);
        localStorage.setItem("petal_well_count", wl);
      }
    } catch (e) { console.warn("Cloud fetch failed:", e); }
  }

  let entries = [];
  try {
    const raw = localStorage.getItem("petal_entries_v1");
    if (raw) entries = JSON.parse(raw);
  } catch (e) { console.error("Entry parse error", e); }

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

// Initialize Dropdowns & Form Bindings
function initProfileOptions() {
  // 1. Tokens
  const tokens = Number(localStorage.getItem("petal_tokens")) || 0;
  if ($("tokenBalance")) $("tokenBalance").textContent = tokens;

  // 2. SFX Dropdowns
  const saveSelect = $("sfxSelect");
  const deleteSelect = $("deleteSfxSelect");

  if (saveSelect) {
    saveSelect.value = localStorage.getItem("petal_equipped_sfx") || "default";
    saveSelect.addEventListener("change", (e) => {
      localStorage.setItem("petal_equipped_sfx", e.target.value);
      playSFX(e.target.value === "default" ? "default_save" : e.target.value);
    });
  }

  if (deleteSelect) {
    deleteSelect.value = localStorage.getItem("petal_equipped_delete_sfx") || "default";
    deleteSelect.addEventListener("change", (e) => {
      localStorage.setItem("petal_equipped_delete_sfx", e.target.value);
      playSFX(e.target.value === "default" ? "default_delete" : e.target.value);
    });
  }

  // 3. Cursors
  const cursorSelect = $("cursorSelect");
  if (cursorSelect) {
    cursorSelect.innerHTML = '<option value="default">Default Pointer</option>';
    ownedItems.forEach(itemId => {
      if (itemId.startsWith("cursor_")) {
        const name = itemId.replace("cursor_", "").replace(/_/g, " ").toUpperCase();
        const opt = document.createElement("option");
        opt.value = itemId;
        opt.textContent = `${name} Cursor`;
        cursorSelect.appendChild(opt);
      }
    });
    cursorSelect.value = localStorage.getItem("petal_equipped_cursor") || "default";
    cursorSelect.onchange = (e) => localStorage.setItem("petal_equipped_cursor", e.target.value);
  }

  // 4. Companions
  const petSelect = $("petSelect");
  if (petSelect) {
    petSelect.innerHTML = '<option value="none">No Companion</option>';
    ownedItems.forEach(itemId => {
      if (itemId.startsWith("pet_")) {
        const name = itemId.replace("pet_nendo_", "").replace("pet_", "").replace(/_/g, " ").toUpperCase();
        const opt = document.createElement("option");
        opt.value = itemId;
        opt.textContent = `${name} Nendoroid`;
        petSelect.appendChild(opt);
      }
    });
    petSelect.value = localStorage.getItem("petal_equipped_pet") || "none";
    petSelect.onchange = (e) => localStorage.setItem("petal_equipped_pet", e.target.value);
  }

  // 5. Titles
  const titleSelect = $("titleSelect");
  const display = $("activeTitleDisplay");
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
      "title_hellflame_sovereign": "Hellflame Sovereign",
    };

    ownedItems.forEach(itemId => {
      if (itemId.startsWith("title_")) {
        const opt = document.createElement("option");
        opt.value = itemId;
        opt.textContent = titleNames[itemId] || "Elite Shinobi";
        titleSelect.appendChild(opt);
      }
    });

    const equipped = localStorage.getItem("petal_equipped_title") || "none";
    titleSelect.value = equipped;
    if (equipped !== "none" && display) {
      display.textContent = titleNames[equipped] || "Elite Shinobi";
      display.style.display = "inline-block";
    }

    titleSelect.onchange = (e) => {
      localStorage.setItem("petal_equipped_title", e.target.value);
      if (display) {
        display.textContent = titleNames[e.target.value] || "";
        display.style.display = e.target.value === "none" ? "none" : "inline-block";
      }
      updateZenProgress();
    };
  }

  // 6. Animation Toggle
  const animKEY = "prefs.reduceAnimations";
  const toggle = $("toggleAnims");
  if (toggle) {
    const reduce = localStorage.getItem(animKEY) === "1";
    toggle.checked = reduce;
    document.documentElement.classList.toggle("reduce-anim", reduce);
    toggle.addEventListener("change", () => {
      const reduceNow = toggle.checked;
      localStorage.setItem(animKEY, reduceNow ? "1" : "0");
      document.documentElement.classList.toggle("reduce-anim", reduceNow);
    });
  }
}

// Global window animation helper
window.animationsEnabled = () => localStorage.getItem("prefs.reduceAnimations") !== "1";

// Auth State & Profile Updating
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    if ($("displayName")) $("displayName").value = user.displayName || "";
    if ($("profilePic")) $("profilePic").src = user.photoURL || "assets/default.png";

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && $("userBirthday")) {
      $("userBirthday").value = userDoc.data().birthday || "";
    }

    initProfileOptions();
    updateZenProgress();
  } else {
    window.location.href = "login.html";
  }
});

// Event Handlers
$("btnUploadPic")?.addEventListener("click", () => $("picUpload")?.click());

$("picUpload")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;
  $("picUploadMsg").textContent = "Uploading...";
  try {
    const path = `profile_pictures/${currentUser.uid}/profile.${file.name.split('.').pop()}`;
    const sRef = ref(storage, path);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    await updateProfile(currentUser, { photoURL: url });
    $("profilePic").src = url;
    $("picUploadMsg").textContent = "Success!";
  } catch (err) {
    console.error(err);
    $("picUploadMsg").textContent = "Error uploading picture.";
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
    alert("Error updating profile!");
  }
});
