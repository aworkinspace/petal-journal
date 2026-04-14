import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

const board = document.getElementById("board");
const picker = document.getElementById("visionPicker");
const btnAdd = document.getElementById("btnAddVision");
const btnClear = document.getElementById("btnClearBoard");

let currentUser = null;
let activeItem = null;
let offset = { x: 0, y: 0 };

// 1. AUTH CHECK
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadBoard(); // Load saved items from database
  } else {
    alert("Please log in to use the Vision Board.");
    window.location.href = "login.html";
  }
});

// 2. ADD IMAGE LOGIC
btnAdd.onclick = () => picker.click();

picker.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  const path = `vision_boards/${currentUser.uid}/${Date.now()}_${file.name}`;
  const fileRef = storageRef(window.firebaseStorage, path);

  try {
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    // Create the item on the board at a default position
    createBoardItem(url, 50, 50, Date.now().toString());
    saveBoard(); // Save the new item to Firestore
  } catch (err) {
    console.error("Upload failed", err);
  }
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
  img.draggable = false; // Prevent default browser ghost image dragging

  container.appendChild(img);
  board.appendChild(container);

  // Setup dragging for this specific item
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

  // Calculate new position relative to the board
  let newX = clientX - boardRect.left - offset.x;
  let newY = clientY - boardRect.top - offset.y;

  activeItem.style.left = newX + "px";
  activeItem.style.top = newY + "px";
}

function stopDrag() {
  activeItem = null;
  document.onmousemove = null;
  document.ontouchmove = null;
  saveBoard(); // Save positions whenever an item is dropped
}

// 5. DATABASE LOGIC (Firestore)
async function saveBoard() {
  if (!currentUser) return;
  const items = [];
  document.querySelectorAll(".board-item").forEach(el => {
    items.push({
      id: el.dataset.id,
      url: el.querySelector("img").src,
      x: parseInt(el.style.left),
      y: parseInt(el.style.top)
    });
  });

  await setDoc(doc(window.firebaseDb, "vision_boards", currentUser.uid), { items });
}

async function loadBoard() {
  const snap = await getDoc(doc(window.firebaseDb, "vision_boards", currentUser.uid));
  if (snap.exists()) {
    board.innerHTML = ""; // Clear board before loading
    snap.data().items.forEach(item => {
      createBoardItem(item.url, item.x, item.y, item.id);
    });
  }
}

// 6. CLEAR BOARD
btnClear.onclick = async () => {
  if (confirm("Clear your whole board?")) {
    board.innerHTML = "";
    saveBoard();
  }
};

