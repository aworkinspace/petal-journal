import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
  doc, getDoc, setDoc, 
  enableNetwork, disableNetwork 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

// 1. Get Elements
const board = document.getElementById("board");
const btnAdd = document.getElementById("btnAddVision");
const btnClear = document.getElementById("btnClearBoard");
const btnManualSave = document.getElementById("btnManualSave");
const statusMsg = document.getElementById("saveStatus");

// 2. Setup the Picker (Safe Method)
const picker = document.getElementById("visionPicker");

if (btnAdd && picker) {
  btnAdd.onclick = (e) => {
    e.preventDefault();
    console.log("Add button clicked, opening picker...");
    picker.click();
  };
} else {
  console.error("Could not find btnAddVision or visionPicker in HTML!");
}


// --- FORCE RECONNECT LOGIC ---
(async () => {
  try {
    await disableNetwork(db);
    await enableNetwork(db);
    console.log("Vision Board Firestore reconnected");
  } catch (e) {
    console.error("Network reset failed", e);
  }
})();

// 1. AUTH CHECK
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadBoard();
  } else {
    // Wait a moment for auth to catch up before redirecting
    setTimeout(() => {
      if (!window.firebaseAuth.currentUser) window.location.href = "login.html";
    }, 2000);
  }
});

// 2. ADD IMAGE LOGIC
btnAdd.onclick = () => picker.click();

picker.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log("File selected:", file.name);

  // 1. AUTH CHECK
  if (!currentUser) {
    alert("Please log in first!");
    return;
  }

  // 2. CREATE A LOCAL PREVIEW IMMEDIATELY
  // This ensures you see the image even if the internet is slow
  const localUrl = URL.createObjectURL(file);
  const tempId = "temp_" + Date.now();
  
  console.log("Creating local preview...");
  createBoardItem(localUrl, 50, 50, tempId);

  // 3. START FIREBASE UPLOAD
  try {
    console.log("Starting Firebase Storage upload...");
    const path = `vision_boards/${currentUser.uid}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const fileRef = storageRef(window.firebaseStorage, path);
    
    const snapshot = await uploadBytes(fileRef, file);
    const finalUrl = await getDownloadURL(snapshot.ref);
    
    console.log("Upload successful! URL:", finalUrl);

    // Swap the local preview URL with the permanent Firebase URL
    const itemEl = document.querySelector(`[data-id="${tempId}"] img`);
    if (itemEl) {
      itemEl.src = finalUrl;
      // Mark as ready to save
      itemEl.parentElement.dataset.id = Date.now().toString(); 
    }
    
    saveBoard(); // Save positions to Firestore
  } catch (err) {
    console.error("FIREBASE ERROR:", err);
    // If upload fails, remove the "broken" local image
    document.querySelector(`[data-id="${tempId}"]`)?.remove();
    alert("Upload failed: " + err.message);
  }

  // Clear the picker so you can select the same file twice if needed
  e.target.value = "";
};


// 3. CREATE ELEMENT LOGIC
function createBoardItem(url, x, y, id) {
  const container = document.createElement("div");
  container.className = "board-item";
  container.dataset.id = id;
  container.style.left = x + "px";
  container.style.top = y + "px";

  const img = document.createElement("img");
  img.src = url;
  img.style.pointerEvents = "none"; // Better for dragging
  img.draggable = false;

  const delBtn = document.createElement("div");
  delBtn.className = "delete-btn";
  delBtn.innerHTML = "×";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    if (confirm("Delete this image?")) {
      container.remove();
      saveBoard();
      board.appendChild(container); // <--- THIS is the line that makes it appear
  console.log("Item appended to board.");
    }
  };

  container.appendChild(img);
  container.appendChild(delBtn);
  board.appendChild(container);

  container.onmousedown = (e) => startDrag(e, container);
  container.ontouchstart = (e) => startDrag(e, container);
}

// 4. DRAG & DROP ENGINE
function startDrag(e, item) {
  activeItem = item;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const rect = item.getBoundingClientRect();
  offset.x = clientX - rect.left;
  offset.y = clientY - rect.top;
  document.onmousemove = drag;
  document.ontouchmove = drag;
  document.onmouseup = stopDrag;
  document.ontouchend = stopDrag;
}

function drag(e) {
  if (!activeItem) return;
  e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const boardRect = board.getBoundingClientRect();
  activeItem.style.left = (clientX - boardRect.left - offset.x) + "px";
  activeItem.style.top = (clientY - boardRect.top - offset.y) + "px";
}

function stopDrag() {
  activeItem = null;
  document.onmousemove = null;
  document.ontouchmove = null;
  saveBoard(); 
}

// 5. IMPROVED DATABASE LOGIC
async function saveBoard() {
  if (!currentUser) return;
  if (statusMsg) statusMsg.textContent = "Saving...";

  const items = [];
  document.querySelectorAll(".board-item").forEach(el => {
    const img = el.querySelector("img");
    // CRITICAL: Don't save temporary "blob" URLs or it will break on reload
    if (img && !img.src.startsWith("blob:")) {
      items.push({
        id: el.dataset.id,
        url: img.src,
        x: parseInt(el.style.left),
        y: parseInt(el.style.top)
      });
    }
  });

  try {
    await setDoc(doc(db, "vision_boards", currentUser.uid), { items });
    if (statusMsg) {
      statusMsg.textContent = "Progress Saved ✨";
      setTimeout(() => { if(statusMsg.textContent.includes("Saved")) statusMsg.textContent = ""; }, 3000);
    }
  } catch (err) {
    console.error("Save failed", err);
    if (statusMsg) statusMsg.textContent = "Sync Error.";
  }
}

// Manual Button Listener
if (btnManualSave) btnManualSave.onclick = () => saveBoard();

async function loadBoard() {
  try {
    const snap = await getDoc(doc(db, "vision_boards", currentUser.uid));
    if (snap.exists()) {
      board.innerHTML = "";
      snap.data().items.forEach(item => {
        createBoardItem(item.url, item.x, item.y, item.id);
      });
    }
  } catch(e) { console.error("Load failed", e); }
}

// 6. CLEAR BOARD
btnClear.onclick = async () => {
  if (confirm("Clear your whole board?")) {
    board.innerHTML = "";
    saveBoard();
  }
};

// --- Spotify Logic ---
(() => {
  const urlEl = document.getElementById("spotifyUrl");
  const btnSet = document.getElementById("btnSetSpotify");
  const btnClear = document.getElementById("btnClearSpotify");
  const host = document.getElementById("spotifyEmbed");
  if (!urlEl || !host) return;

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

  function render(base) {
    const darks = ["midnight", "dusky_rose", "mauve_night", "midnight_snowfall", "ghost_uchiha"];
    const theme = darks.includes(localStorage.getItem("petal_theme")) ? "dark" : "light";
    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:152px; border:0; border-radius:12px; margin-top:10px;" src="${base}?theme=${theme}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  btnSet.onclick = () => {
    const embed = toEmbed(urlEl.value.trim());
    if (embed) {
      localStorage.setItem("petal_spotify_embed", embed);
      render(embed);
    }
  };

  btnClear.onclick = () => {
    localStorage.removeItem("petal_spotify_embed");
    host.innerHTML = "";
    urlEl.value = "";
  };

  if (localStorage.getItem("petal_spotify_embed")) render(localStorage.getItem("petal_spotify_embed"));
})();

// Safety Warning before leaving
window.onbeforeunload = function() {
  if (statusMsg && statusMsg.textContent === "Saving...") {
    return "Your changes are still uploading. Are you sure you want to leave?";
  }
};
