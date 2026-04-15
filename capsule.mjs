import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const contentEl = document.getElementById("capsuleContent");
const dateEl = document.getElementById("unlockDate");
const btnSeal = document.getElementById("btnSeal");
const listEl = document.getElementById("capsuleList");

let currentUser = null;

// 1. Auth Observer
onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadVault();
  } else {
    window.location.href = "login.html";
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

  try {
    btnSeal.disabled = true;
    btnSeal.textContent = "Sealing...";

    await addDoc(collection(window.firebaseDb, "capsules"), {
      userId: currentUser.uid,
      content: content,
      unlockDate: unlockDate, // Format: YYYY-MM-DD
      createdAt: new Date().toISOString()
    });

    contentEl.value = "";
    dateEl.value = "";
    btnSeal.disabled = false;
    btnSeal.textContent = "Seal Capsule 🔒";
    
    alert("Your letter has been sealed and placed in the vault!");
    loadVault();
  } catch (e) {
    console.error(e);
    alert("Error sealing capsule.");
  }
};

// 3. Load Vault Logic
async function loadVault() {
  listEl.innerHTML = "<p class='muted'>Opening the vault...</p>";
  
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
}
