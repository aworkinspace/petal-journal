import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

const auth = window.firebaseAuth;
const db = window.firebaseDb;
const storage = window.firebaseStorage;

let currentUser = null;

const $ = (id) => document.getElementById(id);

const DEFAULT_PROFILE_PIC = "assets/default.png";

// -----------------------------------------------------------------------------
// Owned Items
// -----------------------------------------------------------------------------

function getOwnedItems() {
  try {
    const raw = localStorage.getItem("petal_owned_items");
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not parse owned items:", err);
    return [];
  }
}

// -----------------------------------------------------------------------------
// SFX
// -----------------------------------------------------------------------------

const sfxAudioMap = {
  sfx_chidori: "assets/sfx/chidori.mp3",
  sfx_dattebayo: "assets/sfx/dattebayo.mp3",
  sfx_yowaimo: "assets/sfx/yowaimo.mp3",
  sfx_usuratonkachi: "assets/sfx/usuratonkachi.mp3",
  sfx_notazenin: "assets/sfx/notazenin.mp3",
  sfx_sukunalaugh: "assets/sfx/sukunalaugh.mp3",
  sfx_sasukesayingnaruto: "assets/sfx/naruto.mp3",
  sfx_narutosayingsasuke: "assets/sfx/sasuke.mp3",
  sfx_hashirama: "assets/sfx/hashirama.mp3",
  sfx_domain: "assets/sfx/domain.mp3",
  sfx_prominence: "assets/sfx/prominence.mp3",
  default_save: "assets/sfx/default_save.mp3",
  default_delete: "assets/sfx/default_delete.mp3"
};

const sfxDisplayNames = {
  sfx_chidori: "Chidori",
  sfx_dattebayo: "Dattebayo!",
  sfx_yowaimo: "Yowaimo",
  sfx_usuratonkachi: "Usuratonkachi",
  sfx_notazenin: "Not a Zenin",
  sfx_sukunalaugh: "Sukuna Laugh",
  sfx_sasukesayingnaruto: "Sasuke ('Naruto!')",
  sfx_narutosayingsasuke: "Naruto ('Sasuke!')",
  sfx_hashirama: "Hashirama!",
  sfx_domain: "Domain Expansion",
  sfx_prominence: "Prominence Burn"
};

function playSFX(sfxId) {
  if (!sfxId) return;

  const audioPath = sfxAudioMap[sfxId];
  if (!audioPath) return;

  const audio = new Audio(audioPath);

  audio.play().catch((err) => {
    console.warn("SFX playback warning:", err);
  });
}

function setupSfxDropdown(selectEl, storageKey, defaultAudioKey) {
  if (!selectEl) return;

  const ownedItems = getOwnedItems();
  const isDeleteSound = storageKey.includes("delete");

  selectEl.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "default";
  defaultOption.textContent = `Default ${isDeleteSound ? "Delete" : "Save"} Sound`;
  selectEl.appendChild(defaultOption);

  ownedItems.forEach((itemId) => {
    if (!itemId.startsWith("sfx_")) return;

    const option = document.createElement("option");
    option.value = itemId;
    option.textContent =
      sfxDisplayNames[itemId] ||
      itemId.replace("sfx_", "").replace(/_/g, " ").toUpperCase();

    selectEl.appendChild(option);
  });

  selectEl.value = localStorage.getItem(storageKey) || "default";

  selectEl.addEventListener("change", (event) => {
    const selected = event.target.value;

    localStorage.setItem(storageKey, selected);

    const soundToPlay = selected === "default" ? defaultAudioKey : selected;
    playSFX(soundToPlay);
  });
}

// -----------------------------------------------------------------------------
// Customizations
// -----------------------------------------------------------------------------

const titleNames = {
  title_sannin: "Legendary Sannin",
  title_uchiha: "Ghost of the Uchiha",
  title_honored: "The Honored One",
  title_kage: "Shadow of the Leaf",
  title_yonko: "The Strongest Man",
  title_mednin: "The Medical-Nin",
  title_joyboy: "Warrior of Liberation",
  title_curse_king: "King of Curses",
  title_fierce_wings: "Fierce Wings",
  title_hellflame_sovereign: "Hellflame Sovereign"
};

function setupCursorSelect(ownedItems) {
  const cursorSelect = $("cursorSelect");
  if (!cursorSelect) return;

  cursorSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "default";
  defaultOption.textContent = "Default Pointer";
  cursorSelect.appendChild(defaultOption);

  ownedItems.forEach((itemId) => {
    if (!itemId.startsWith("cursor_")) return;

    const name = itemId
      .replace("cursor_", "")
      .replace(/_/g, " ")
      .toUpperCase();

    const option = document.createElement("option");
    option.value = itemId;
    option.textContent = `${name} Cursor`;

    cursorSelect.appendChild(option);
  });

  cursorSelect.value = localStorage.getItem("petal_equipped_cursor") || "default";

  cursorSelect.addEventListener("change", (event) => {
    localStorage.setItem("petal_equipped_cursor", event.target.value);
  });
}

function updateTitleDisplay(titleId) {
  const titleDisplay = $("activeTitleDisplay");
  if (!titleDisplay) return;

  if (titleId && titleId !== "none") {
    titleDisplay.textContent = titleNames[titleId] || "Elite Title";
    titleDisplay.style.display = "inline-block";
  } else {
    titleDisplay.textContent = "";
    titleDisplay.style.display = "none";
  }
}

function setupTitleSelect(ownedItems) {
  const titleSelect = $("titleSelect");
  if (!titleSelect) return;

  titleSelect.innerHTML = "";

  const noneOption = document.createElement("option");
  noneOption.value = "none";
  noneOption.textContent = "No Title";
  titleSelect.appendChild(noneOption);

  ownedItems.forEach((itemId) => {
    if (!itemId.startsWith("title_")) return;

    const option = document.createElement("option");
    option.value = itemId;
    option.textContent = titleNames[itemId] || "Elite Shinobi";

    titleSelect.appendChild(option);
  });

  const equippedTitle = localStorage.getItem("petal_equipped_title") || "none";
  titleSelect.value = equippedTitle;
  updateTitleDisplay(equippedTitle);

  titleSelect.addEventListener("change", (event) => {
    const selectedTitle = event.target.value;

    localStorage.setItem("petal_equipped_title", selectedTitle);
    updateTitleDisplay(selectedTitle);
  });
}

function setupPetSelect(ownedItems) {
  const petSelect = $("petSelect");
  if (!petSelect) return;

  petSelect.innerHTML = "";

  const noneOption = document.createElement("option");
  noneOption.value = "none";
  noneOption.textContent = "No Companion";
  petSelect.appendChild(noneOption);

  ownedItems.forEach((itemId) => {
    if (!itemId.startsWith("pet_")) return;

    const name = itemId
      .replace("pet_nendo_", "")
      .replace("pet_", "")
      .replace(/_/g, " ")
      .toUpperCase();

    const option = document.createElement("option");
    option.value = itemId;
    option.textContent = `${name} Companion`;

    petSelect.appendChild(option);
  });

  petSelect.value = localStorage.getItem("petal_equipped_pet") || "none";

  petSelect.addEventListener("change", (event) => {
    localStorage.setItem("petal_equipped_pet", event.target.value);
  });
}

function setupCustomizations() {
  const ownedItems = getOwnedItems();

  setupCursorSelect(ownedItems);
  setupTitleSelect(ownedItems);
  setupPetSelect(ownedItems);
}

// -----------------------------------------------------------------------------
// Zen Progress / XP
// -----------------------------------------------------------------------------

function getLocalNumber(key) {
  return Number(localStorage.getItem(key)) || 0;
}

function getJournalEntries() {
  try {
    const raw = localStorage.getItem("petal_entries_v1");
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not parse journal entries:", err);
    return [];
  }
}

function getWordCountFromHtml(html) {
  const text = String(html || "").replace(/<[^>]*>/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

async function getCloudZenStats() {
  if (!currentUser) return null;

  try {
    const statsSnap = await getDoc(
      doc(db, "users", currentUser.uid, "stats", "zen")
    );

    return statsSnap.exists() ? statsSnap.data() : null;
  } catch (err) {
    console.warn("Cloud zen stats fetch failed:", err);
    return null;
  }
}

async function updateZenProgress() {
  let whiteboardCount = getLocalNumber("petal_whiteboard_count");
  let visionCount = getLocalNumber("petal_vision_count");
  let capsuleCount = getLocalNumber("petal_capsule_count");
  let wellCount = getLocalNumber("petal_well_count");
  const dojoXP = getLocalNumber("petal_dojo_xp");
  const summonXP = getLocalNumber("petal_summon_xp");

  const cloudStats = await getCloudZenStats();

  if (cloudStats) {
    whiteboardCount = Math.max(whiteboardCount, cloudStats.whiteboard || 0);
    visionCount = Math.max(visionCount, cloudStats.vision || 0);
    capsuleCount = Math.max(capsuleCount, cloudStats.capsule || 0);
    wellCount = Math.max(wellCount, cloudStats.well || 0);
  }

  const entries = getJournalEntries();

  let totalXP =
    entries.length * 50 +
    whiteboardCount * 20 +
    visionCount * 30 +
    capsuleCount * 100 +
    wellCount * 30 +
    dojoXP +
    summonXP;

  entries.forEach((entry) => {
    totalXP += getWordCountFromHtml(entry.content);
  });

  const xpPerLevel = 200;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const currentXPInLevel = totalXP % xpPerLevel;
  const progressPercent = (currentXPInLevel / xpPerLevel) * 100;

  const zenBarFill = $("zenBarFill");
  const zenXP = $("zenXP");
  const zenLevel = $("zenLevel");
  const ninjaRank = $("ninjaRank");
  const level5Badge = $("level5Badge");

  if (zenBarFill) zenBarFill.style.width = `${progressPercent}%`;
  if (zenXP) zenXP.textContent = `${currentXPInLevel} / ${xpPerLevel} XP`;
  if (zenLevel) zenLevel.textContent = `Level ${level}`;

  let rank = "Genin";
  if (level >= 5) rank = "Jonin";
  if (level >= 10) rank = "Kage";
  if (level >= 15) rank = "Celestial Sage";

  if (ninjaRank) ninjaRank.textContent = `Rank: ${rank}`;

  if (level >= 5 && level5Badge) {
    level5Badge.className = "badge-visible";
  }

  if (level >= 10) {
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.add("kage-aura");
    });
  }
}

// -----------------------------------------------------------------------------
// Animation Preferences
// -----------------------------------------------------------------------------

function setupAnimationToggle() {
  const STORAGE_KEY = "prefs.reduceAnimations";
  const toggle = $("toggleAnims");

  if (!toggle) return;

  const reduceAnimations = localStorage.getItem(STORAGE_KEY) === "1";

  toggle.checked = reduceAnimations;
  document.documentElement.classList.toggle("reduce-anim", reduceAnimations);

  toggle.addEventListener("change", () => {
    const reduceNow = toggle.checked;

    localStorage.setItem(STORAGE_KEY, reduceNow ? "1" : "0");
    document.documentElement.classList.toggle("reduce-anim", reduceNow);
  });
}

// -----------------------------------------------------------------------------
// Profile Picture
// -----------------------------------------------------------------------------

function setProfilePic(url) {
  const profilePic = $("profilePic");
  if (!profilePic) return;

  const finalUrl = url || DEFAULT_PROFILE_PIC;

  if (profilePic.tagName.toLowerCase() === "img") {
    profilePic.src = finalUrl;
    return;
  }

  profilePic.style.backgroundImage = `url("${finalUrl}")`;
}

async function uploadProfilePicture(file) {
  if (!file || !currentUser) return;

  if (!file.type.startsWith("image/")) {
    const msg = $("picUploadMsg");
    if (msg) msg.textContent = "Please choose an image file.";
    return;
  }

  const msg = $("picUploadMsg");
  if (msg) msg.textContent = "Uploading...";

  try {
    const extension = file.name.split(".").pop() || "jpg";
    const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";

    const path = `profile_pictures/${currentUser.uid}/profile.${cleanExtension}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);

    const photoURL = await getDownloadURL(storageRef);

    await updateProfile(currentUser, {
      photoURL
    });

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        photoURL
      },
      { merge: true }
    );

    await currentUser.reload();
    currentUser = auth.currentUser;

    setProfilePic(photoURL);

    if (msg) msg.textContent = "Success!";
  } catch (err) {
    console.error("Profile picture upload failed:", err);

    if (msg) {
      msg.textContent = err.message || "Error uploading profile picture.";
    }
  }
}

function setupProfilePictureUpload() {
  const uploadButton = $("btnUploadPic");
  const fileInput = $("picUpload");

  uploadButton?.addEventListener("click", () => {
    fileInput?.click();
  });

  fileInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];

    await uploadProfilePicture(file);

    // Allows choosing the same file again and still firing "change"
    event.target.value = "";
  });
}

// -----------------------------------------------------------------------------
// Profile Details
// -----------------------------------------------------------------------------

async function loadUserProfile(user) {
  currentUser = user;

  const displayNameInput = $("displayName");
  const birthdayInput = $("userBirthday");

  if (displayNameInput) {
    displayNameInput.value = user.displayName || "";
  }

  let firestoreData = null;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    firestoreData = userDoc.exists() ? userDoc.data() : null;
  } catch (err) {
    console.warn("Failed to load user profile document:", err);
  }

  if (birthdayInput) {
    birthdayInput.value = firestoreData?.birthday || "";
  }

  setProfilePic(firestoreData?.photoURL || user.photoURL || DEFAULT_PROFILE_PIC);
}

async function saveProfileDetails() {
  if (!currentUser) return;

  const displayNameInput = $("displayName");
  const birthdayInput = $("userBirthday");

  const displayName = displayNameInput?.value.trim() || "";
  const birthday = birthdayInput?.value || "";

  try {
    await updateProfile(currentUser, {
      displayName
    });

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        displayName,
        birthday
      },
      { merge: true }
    );

    await currentUser.reload();
    currentUser = auth.currentUser;

    alert("Profile saved!");
    updateZenProgress();
  } catch (err) {
    console.error("Profile save failed:", err);
    alert("Error saving profile!");
  }
}

function setupProfileDetailsForm() {
  const updateButton = $("btnUpdateProfile");

  updateButton?.addEventListener("click", saveProfileDetails);
}

// -----------------------------------------------------------------------------
// Tokens
// -----------------------------------------------------------------------------

function updateTokenBalance() {
  const tokenBalance = $("tokenBalance");
  if (!tokenBalance) return;

  const tokens = Number(localStorage.getItem("petal_tokens")) || 0;
  tokenBalance.textContent = tokens;
}

// -----------------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------------

function initProfilePage() {
  setupSfxDropdown($("sfxSelect"), "petal_equipped_sfx", "default_save");
  setupSfxDropdown($("deleteSfxSelect"), "petal_equipped_delete_sfx", "default_delete");

  setupCustomizations();
  setupAnimationToggle();
  setupProfilePictureUpload();
  setupProfileDetailsForm();
  updateTokenBalance();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    await loadUserProfile(user);
    await updateZenProgress();
  });
}

document.addEventListener("DOMContentLoaded", initProfilePage);
