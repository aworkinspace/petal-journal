import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
  doc, getDoc, setDoc, 
  enableNetwork, disableNetwork 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";
function applyGlobalCursor(cursorId) {
  if (!cursorId || cursorId === "default") {
    document.documentElement.style.cursor = "auto";
    // Also reset buttons
    const style = document.getElementById("dynamic-cursor-style");
    if (style) style.remove();
    return;
  }

  const fileName = cursorId.replace("cursor_", "");
  const url = `assets/${fileName}_cursor.png`;

  // We create a style tag to override EVERYTHING (buttons, links, etc)
  let style = document.getElementById("dynamic-cursor-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "dynamic-cursor-style";
    document.head.appendChild(style);
  }

  // Cursors need to be 32x32 or smaller to work in all browsers
  style.innerHTML = `
    * { cursor: url('${url}'), auto !important; }
    a, button, summary, .btn, .chip { cursor: url('${url}'), pointer !important; }
  `;
}

// Initial check on page load
applyGlobalCursor(localStorage.getItem("petal_equipped_cursor"));
// 1. GLOBAL VARIABLES (Defined at the top to avoid ReferenceErrors)
const board = document.getElementById("board");
const btnAdd = document.getElementById("btnAddVision");
const btnClear = document.getElementById("btnClearBoard");
const btnManualSave = document.getElementById("btnManualSave");
const statusMsg = document.getElementById("saveStatus");
const picker = document.getElementById("visionPicker");

const db = window.firebaseDb;
let currentUser = null;
let activeItem = null;
let offset = { x: 0, y: 0 };

// 2. FORCE RECONNECT LOGIC
if (db) {
  (async () => {
    try {
      await disableNetwork(db);
      await enableNetwork(db);
      console.log("Vision Board Firestore reconnected");
    } catch (e) {
      console.error("Network reset failed", e);
    }
  })();
}

// 3. AUTH CHECK
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    console.log("Logged in as:", user.uid);
    currentUser = user;
    loadBoard();
  } else {
    // Safety delay to check if auth is just slow
    setTimeout(() => {
        if (!window.firebaseAuth.currentUser) window.location.href = "login.html";
    }, 3000);
  }
});

// 4. ADD IMAGE LOGIC
if (btnAdd && picker) {
  btnAdd.onclick = () => picker.click();
}

picker.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  // Create Local Preview
  const localUrl = URL.createObjectURL(file);
  const tempId = "temp_" + Date.now();
  createBoardItem(localUrl, 50, 50, tempId);

  try {
    const path = `vision_boards/${currentUser.uid}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const fileRef = storageRef(window.firebaseStorage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const finalUrl = await getDownloadURL(snapshot.ref);
    
    // Swap blob with Firebase URL
    const itemEl = document.querySelector(`[data-id="${tempId}"] img`);
    if (itemEl) {
      itemEl.src = finalUrl;
      itemEl.parentElement.dataset.id = Date.now().toString(); 
    }
    saveBoard(); 
  } catch (err) {
    console.error("Upload failed:", err);
    document.querySelector(`[data-id="${tempId}"]`)?.remove();
    alert("Upload failed. Check Storage rules.");
  }
  e.target.value = ""; // Reset picker
};

// 5. CREATE ELEMENT LOGIC
function createBoardItem(url, x, y, id) {
  const container = document.createElement("div");
  container.className = "board-item";
  container.dataset.id = id;
  container.style.left = x + "px";
  container.style.top = y + "px";

  const img = document.createElement("img");
  img.src = url;
  img.style.pointerEvents = "none"; 
  img.draggable = false;

  const delBtn = document.createElement("div");
  delBtn.className = "delete-btn";
  delBtn.innerHTML = "×";
  
  delBtn.onclick = (e) => {
    e.stopPropagation(); // Stop drag from triggering
    if (confirm("Delete this image?")) {
      container.remove();
      saveBoard();
    }
  };

  container.appendChild(img);
  container.appendChild(delBtn);
  board.appendChild(container);

  container.onmousedown = (e) => startDrag(e, container);
  container.ontouchstart = (e) => startDrag(e, container);
}

// 6. DRAG & DROP ENGINE
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
  if (activeItem) saveBoard();
  activeItem = null;
  document.onmousemove = null;
  document.ontouchmove = null;
}

// 7. FIREBASE SAVE/LOAD
async function saveBoard() {
  if (!currentUser) return;
  if (statusMsg) statusMsg.textContent = "Saving...";

  const items = [];
  document.querySelectorAll(".board-item").forEach(el => {
    const img = el.querySelector("img");
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

async function loadBoard() {
  if (!currentUser) return;
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

// 8. CLEAR BOARD
if (btnClear) {
  btnClear.onclick = async () => {
    if (confirm("Clear your whole board?")) {
      board.innerHTML = "";
      saveBoard();
    }
  };
}

// 9. MANUAL SAVE
if (btnManualSave) btnManualSave.onclick = () => saveBoard();

// 10. SPOTIFY
(() => {
  const urlEl = document.getElementById("spotifyUrl");
  const host = document.getElementById("spotifyEmbed");
  if (!urlEl || !host) return;

  function render(base) {
    const darks = ["midnight", "dusky_rose", "mauve_night", "midnight_snowfall", "ghost_uchiha", "ninja_rivalry", "copy_ninja", "akatsuki_cloud"];
    const theme = darks.includes(localStorage.getItem("petal_theme")) ? "dark" : "light";
    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:152px; border:0; border-radius:12px; margin-top:10px;" src="${base}?theme=${theme}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  document.getElementById("btnSetSpotify").onclick = () => {
    const match = urlEl.value.match(/(?:playlist|track|album|show|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
        let type = 'playlist';
        if (urlEl.value.includes('track/')) type = 'track';
        if (urlEl.value.includes('show/')) type = 'show';
        const embed = `https://open.spotify.com/embed/${type}/${match[1]}`;
        localStorage.setItem("petal_spotify_embed", embed);
        render(embed);
    }
  };

  document.getElementById("btnClearSpotify").onclick = () => {
    localStorage.removeItem("petal_spotify_embed");
    host.innerHTML = "";
    urlEl.value = "";
  };

  const saved = localStorage.getItem("petal_spotify_embed");
  if (saved) render(saved);
})();
