import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const contentEl = document.getElementById("capsuleContent");
const dateEl = document.getElementById("unlockDate");
const btnSeal = document.getElementById("btnSeal");
const listEl = document.getElementById("capsuleList");

let currentUser = null;

/* ------------------- Auth Listener ------------------- */
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadVault();
  } else {
    // Redirect if not logged in
    setTimeout(() => {
      if (!window.firebaseAuth.currentUser) window.location.href = "login.html";
    }, 3000);
  }
});

/* ------------------- Seal Capsule Logic ------------------- */
btnSeal.onclick = async () => {
  const content = contentEl.value.trim();
  const unlockDate = dateEl.value;

  if (!currentUser) { alert("Please wait for login to finish..."); return; }
  if (!content || !unlockDate) { alert("Please fill in both fields!"); return; }

  try {
    btnSeal.disabled = true;
    btnSeal.textContent = "Sealing...";

    const docData = {
      userId: currentUser.uid,
      content: content,
      unlockDate: unlockDate,
      createdAt: new Date().toISOString()
    };

    // Standard save - no timeout, letting Firestore handle the network
    await addDoc(collection(window.firebaseDb, "capsules"), docData);

    console.log("Letter successfully sealed!");
    contentEl.value = "";
    dateEl.value = "";
    btnSeal.disabled = false;
    btnSeal.textContent = "Seal Capsule 🔒";
    
    // Refresh the list
    loadVault();
    alert("Your letter has been placed in the vault!");
  } catch (e) {
    console.error("Firestore Error:", e);
    alert("Save failed: " + e.message);
    btnSeal.disabled = false;
    btnSeal.textContent = "Seal Capsule 🔒";
  }
};

/* ------------------- Load Vault Logic ------------------- */
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

    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const isLocked = data.unlockDate > now;
      
      const card = document.createElement("div");
      card.className = `capsule-card ${isLocked ? 'locked' : 'unlocked'}`;
      
      if (isLocked) {
        card.innerHTML = `
          <strong>🔒 Locked until ${data.unlockDate}</strong>
          <p class="muted" style="margin-top:10px;">This letter is from your past self. You'll have to wait a bit longer!</p>
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
    listEl.innerHTML = "<p class='muted'>Connection slow... still trying to reach vault.</p>";
  }
}

/* ------------------------ Spotify Logic ------------------------ */
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

  function renderSpotify(base) {
    const darks = ["midnight", "cosmic_starfall", "midnight_snowfall"];
    const theme = darks.includes(localStorage.getItem("petal_theme")) ? "dark" : "light";
    host.innerHTML = `<iframe class="spotify-iframe" src="${base}?theme=${theme}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
  }

  btnSet.onclick = () => {
    const embed = toEmbed(urlEl.value.trim());
    if (embed) {
      localStorage.setItem("petal_spotify_embed", embed);
      renderSpotify(embed);
    }
  };

  btnClear.onclick = () => {
    localStorage.removeItem("petal_spotify_embed");
    host.innerHTML = "";
    urlEl.value = "";
  };

  const saved = localStorage.getItem("petal_spotify_embed");
  if (saved) renderSpotify(saved);
})();
