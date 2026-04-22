import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
  collection, addDoc, query, where, getDocs, 
  enableNetwork, disableNetwork 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const contentEl = document.getElementById("capsuleContent");
const dateEl = document.getElementById("unlockDate");
const btnSeal = document.getElementById("btnSeal");
const listEl = document.getElementById("capsuleList");

let currentUser = null;
const db = window.firebaseDb;

// --- FORCE RECONNECT LOGIC (Fixes the 'Client is Offline' bug) ---
(async () => {
  try {
    if (db) {
      await disableNetwork(db);
      await enableNetwork(db);
      console.log("Capsule Vault connected");
    }
  } catch (e) {
    console.error("Network reset failed", e);
  }
})();

// 1. Auth Observer
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadVault();
  } else {
    // Give it a moment to check auth status
    setTimeout(() => {
      if(!window.firebaseAuth.currentUser) window.location.href = "login.html";
    }, 3000);
  }
});

// 2. Seal (Save) Logic
btnSeal.onclick = async () => {
  const content = contentEl.value.trim();
  const unlockDate = dateEl.value;

  if (!content || !unlockDate) {
    alert("Please write a letter and choose an unlock date!");
    return;
  }

  if (!currentUser) {
    alert("You must be logged in to seal a capsule.");
    return;
  }

  try {
    btnSeal.disabled = true;
    btnSeal.textContent = "Sealing...";

    // Create a Promise that rejects after 10 seconds as a timeout
    // Changed 10000 to 30000 (30 seconds)
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error("Database connection timed out. It might be taking a while due to a slow network.")), 30000)
);


    const docData = {
      userId: currentUser.uid,
      content: content,
      unlockDate: unlockDate, // Format: YYYY-MM-DD
      createdAt: new Date().toISOString()
    };

    // Race the database write against our 10-second timer
    await Promise.race([
      addDoc(collection(window.firebaseDb, "capsules"), docData),
      timeout
    ]);

    console.log("Firestore write successful!");
    contentEl.value = "";
    dateEl.value = "";
    btnSeal.disabled = false;
    btnSeal.textContent = "Seal Capsule 🔒";
    
    alert("Your letter has been sealed and placed in the vault!");
    loadVault();
  } catch (e) {
    console.error("Seal failed:", e);
    alert("Error: " + e.message);
    btnSeal.disabled = false;
    btnSeal.textContent = "Seal Capsule 🔒";
  }
};

// 3. Load Vault Logic
async function loadVault() {
  if (!listEl) return;
  listEl.innerHTML = "<p class='muted'>Opening the vault...</p>";
  
  try {
    const q = query(
      collection(window.firebaseDb, "capsules"),
      where("userId", "==", currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    listEl.innerHTML = "";

    if (querySnapshot.empty) {
      listEl.innerHTML = "<p class='muted'>Your vault is empty.</p>";
      return;
    }

    const now = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const isLocked = data.unlockDate > now;
      
      const card = document.createElement("div");
      card.className = `capsule-card ${isLocked ? 'locked' : 'unlocked'}`;
      
      if (isLocked) {
        card.innerHTML = `
          <strong>🔒 Locked until ${data.unlockDate}</strong>
          <p class="muted" style="margin-top:10px;">This letter is from your past self. You'll have to wait a bit longer to see what it says!</p>
        `;
      } else {
        card.innerHTML = `
          <strong>🔓 Opened on ${data.unlockDate}</strong>
          <div style="margin-top:10px; border-top: 1px solid var(--border); padding-top:10px; white-space: pre-wrap;">
            ${data.content}
          </div>
        `;
      }
      
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error("Load vault failed:", err);
    listEl.innerHTML = "<p class='muted'>Could not load vault. Check connection.</p>";
  }
}
/* ------------------------ Spotify Logic (Floating Widget) ------------------------ */
(() => {
  const urlEl = document.getElementById("spotifyUrl");
  const btnSet = document.getElementById("btnSetSpotify");
  const btnClear = document.getElementById("btnClearSpotify");
  const host = document.getElementById("spotifyEmbed");

  if (!urlEl || !btnSet || !btnClear || !host) return;

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

  function renderSpotify(baseEmbedUrl) {
    if (!host || !baseEmbedUrl) return;
    // Decision for theme colors
    const darkThemes = ["midnight", "dusky_rose", "mauve_night", "cosmic_starfall", "midnight_snowfall"];
    const currentTheme = localStorage.getItem("petal_theme") || "petal";
    const spotifyTheme = darkThemes.includes(currentTheme) ? "dark" : "light";
    
    host.innerHTML = `<iframe class="spotify-iframe" src="${baseEmbedUrl}?theme=${spotifyTheme}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  // Use .onclick for maximum reliability in the widget
  btnSet.onclick = () => {
    const embed = toEmbed(urlEl.value.trim());
    if (embed) {
      localStorage.setItem("petal_spotify_embed", embed);
      localStorage.setItem("petal_spotify_url", urlEl.value.trim());
      renderSpotify(embed);
    } else {
      alert("Invalid Spotify link! Use a playlist, song, or podcast link.");
    }
  };

  btnClear.onclick = () => {
    localStorage.removeItem("petal_spotify_embed");
    localStorage.removeItem("petal_spotify_url");
    urlEl.value = "";
    host.innerHTML = "";
  };

  // Initial Load: Check if a playlist was already set on the main page
  const saved = localStorage.getItem("petal_spotify_embed");
  if (saved) {
    renderSpotify(saved);
    urlEl.value = localStorage.getItem("petal_spotify_url") || "";
  }
})();
