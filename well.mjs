import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const btnToss = document.getElementById("btnToss");
const wishInput = document.getElementById("wishText");
const historyEl = document.getElementById("wishHistory");
const pond = document.getElementById("pond");

let currentUser = null;

onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    currentUser = user;
    loadWishes();
  } else {
    window.location.href = "login.html";
  }
});

btnToss.onclick = async () => {
  const wish = wishInput.value.trim();
  if (!wish) return;

  try {
    btnToss.disabled = true;
    btnToss.textContent = "Releasing...";

    // 1. Save to Firebase
    await addDoc(collection(window.firebaseDb, "manifestations"), {
  userId: currentUser.uid, // <--- Ensure this is spelled exactly like this
  text: wish,
  timestamp: Date.now()
});


    // 2. Add Zen XP!
    let count = parseInt(localStorage.getItem("petal_well_count") || "0");
    localStorage.setItem("petal_well_count", count + 1);

    // 3. UI Animation
    createPetal();
    wishInput.value = "";
    btnToss.disabled = false;
    btnToss.textContent = "Toss into Well ✨";
    
    loadWishes();
    alert("Your intention has been sent to the universe! +30 XP");
  } catch (e) {
    console.error(e);
    btnToss.disabled = false;
  }
};

function createPetal() {
  const petal = document.createElement("div");
  petal.className = "wish-petal";
  petal.style.left = Math.random() * 80 + 10 + "%";
  petal.style.top = Math.random() * 80 + 10 + "%";
  pond.appendChild(petal);
}

async function loadWishes() {
  const q = query(
    collection(window.firebaseDb, "manifestations"),
    where("userId", "==", currentUser.uid),
    orderBy("timestamp", "desc"),
    limit(5)
  );

  const snap = await getDocs(q);
  historyEl.innerHTML = "";
  snap.forEach(doc => {
    const card = document.createElement("div");
    card.className = "wish-card";
    card.textContent = `✨ ${doc.data().text}`;
    historyEl.appendChild(card);
    createPetal(); // Add a visual petal for each recent wish
  });
}
