import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";
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
const shelf = document.getElementById("mangaShelf");
const btnAdd = document.getElementById("btnAddManga");
const picker = document.getElementById("mangaPicker");

let currentUser = null;

// 1. Auth Listener
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadShelf();
  } else {
    window.location.href = "login.html";
  }
});

// 2. Add Manga Logic
btnAdd.onclick = async () => {
  const title = document.getElementById("mangaTitle").value.trim();
  const rating = document.getElementById("mangaRating").value;
  const file = picker.files[0];

  if (!title || !file) {
    alert("Please provide a title and a cover image!");
    return;
  }

  try {
    btnAdd.disabled = true;
    btnAdd.textContent = "Uploading...";

    // A. Upload Image to Storage
    const path = `manga_covers/${currentUser.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(window.firebaseStorage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // B. Save to Firestore
    await addDoc(collection(window.firebaseDb, "manga"), {
      userId: currentUser.uid,
      title: title,
      rating: rating,
      coverUrl: url,
      timestamp: Date.now()
    });

    // C. Reward XP
    let count = parseInt(localStorage.getItem("petal_manga_count") || "0");
    localStorage.setItem("petal_manga_count", count + 1);

    // Reset Form
    document.getElementById("mangaTitle").value = "";
    picker.value = "";
    btnAdd.disabled = false;
    btnAdd.textContent = "Add to Shelf 📚";
    
    loadShelf();
    alert("Manga added to your collection! +25 XP");
  } catch (e) {
    console.error(e);
    alert("Error adding manga.");
    btnAdd.disabled = false;
  }
};

// 3. Load Shelf Logic
async function loadShelf() {
  shelf.innerHTML = "<p class='muted'>Loading your library...</p>";
  
  const q = query(
    collection(window.firebaseDb, "manga"),
    where("userId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);
  shelf.innerHTML = "";

  snap.forEach(mDoc => {
    const data = mDoc.data();
    const card = document.createElement("div");
    card.className = "manga-card";
    
    let starDisplay = "⭐".repeat(data.rating);

    card.innerHTML = `
      <button class="del-manga" data-id="${mDoc.id}">×</button>
      <img src="${data.coverUrl}">
      <span class="manga-title">${data.title}</span>
      <div class="stars">${starDisplay}</div>
    `;

    card.querySelector(".del-manga").onclick = async () => {
      if(confirm("Delete from shelf?")) {
        await deleteDoc(doc(window.firebaseDb, "manga", mDoc.id));
        loadShelf();
      }
    };

    shelf.appendChild(card);
  });
}
