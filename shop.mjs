const grid = document.getElementById("shopGrid");
const balanceEl = document.getElementById("shopBalance");

// 1. SHOP INVENTORY
const shopItems = [
  { id: "sticker_kunai", name: "Steel Kunai", type: "sticker", price: 50, icon: "assets/kunai.gif" },
  { id: "sticker_curse", name: "Cursed Mark", type: "sticker", price: 50, icon: "assets/cursedmark.gif" },
  { id: "sticker_joyboy", name: "Nika Sun", type: "sticker", price: 50, icon: "assets/sungod.gif" },
  { id: "sticker_chibigojo", name: "Chibi Gojo", type: "sticker", price: 50, icon: "assets/gojo_chibi.gif" },
  { id: "sticker_cukootoji", name: "Cukoo Toji", type: "sticker", price: 50, icon: "assets/cukoo_toji.gif" },
  { id: "layout_rainy", name: "Rain-Dashed Paper", type: "layout", price: 100, icon: "assets/rain_icon.png" },
  { id: "layout_matrix", name: "Glitch Circuitry", type: "layout", price: 100, icon: "assets/glitch_icon.png" },
  { id: "layout_hologram", name: "Holo-Prism", type: "layout", price: 100, icon: "assets/holo_icon.png" },
  { id: "sfx_chidori", name: "SFX: Chidori", type: "sfx", price: 75, icon: "assets/kakashi_nendo.png" },
  { id: "sfx_dattebayo", name: "SFX: Dattebayo!", type: "sfx", price: 75, icon: "assets/naruto_nendo.png" },
  { id: "sfx_yowaimo", name: "SFX: Yowaimo (Gojo)", type: "sfx", price: 75, icon: "assets/gojo_nendo.png" },
  { id: "sfx_usuratonkachi", name: "SFX: Usuratonkachi", type: "sfx", price: 75, icon: "assets/sasuke_nendo.png" }
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
