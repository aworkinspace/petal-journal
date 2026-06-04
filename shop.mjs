const grid = document.getElementById("shopGrid");
const balanceEl = document.getElementById("shopBalance");

// 1. SHOP INVENTORY
const shopItems = [
  { id: "sticker_kunai", name: "Steel Kunai", type: "sticker", price: 50, icon: "assets/kunai.png" },
  { id: "sticker_curse", name: "Cursed Mark", type: "sticker", price: 75, icon: "assets/cursed_mark.png" },
  { id: "sticker_joyboy", name: "Nika Sun", type: "sticker", price: 100, icon: "assets/sun_icon.png" }
];

function getTokens() { return Number(localStorage.getItem("petal_tokens")) || 0; }
function getOwned() { return JSON.parse(localStorage.getItem("petal_owned_items") || "[]"); }

function updateUI() {
  balanceEl.textContent = getTokens();
  const owned = getOwned();

  grid.innerHTML = "";
  shopItems.forEach(item => {
    const isOwned = owned.includes(item.id);
    const card = document.createElement("div");
    card.className = `shop-item ${isOwned ? 'owned' : ''}`;
    
    card.innerHTML = `
      <img src="${item.icon}">
      <strong>${item.name}</strong>
      <div class="price">🪙 ${item.price}</div>
      <button class="btn btn-primary" ${isOwned ? 'disabled' : ''}>
        ${isOwned ? 'Purchased' : 'Buy Now'}
      </button>
    `;

    if (!isOwned) {
      card.querySelector("button").onclick = () => buyItem(item);
    }
    grid.appendChild(card);
  });
}

async function buyItem(item) {
  let tokens = getTokens();
  if (tokens < item.price) {
    alert("Not enough tokens! Keep journaling to earn more.");
    return;
  }

  if (confirm(`Spend ${item.price} tokens on ${item.name}?`)) {
    // 1. Deduct tokens
    tokens -= item.price;
    localStorage.setItem("petal_tokens", tokens);

    // 2. Add to owned list
    const owned = getOwned();
    owned.push(item.id);
    localStorage.setItem("petal_owned_items", JSON.stringify(owned));

    // 3. Update UI
    updateUI();
    alert("Purchase successful! Check your collection.");

    // 4. SYNC TO CLOUD (If logged in)
    if (window.firebaseAuth?.currentUser) {
      const statsRef = doc(window.firebaseDb, "users", window.firebaseAuth.currentUser.uid, "stats", "zen");
      await setDoc(statsRef, { tokens: tokens, ownedItems: owned }, { merge: true });
    }
  }
}

// Initial Load
updateUI();
