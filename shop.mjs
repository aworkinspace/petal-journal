const grid = document.getElementById("shopGrid");
const balanceEl = document.getElementById("shopBalance");
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
// 1. SHOP INVENTORY
const shopItems = [
  { id: "sticker_kunai", name: "Steel Kunai", type: "sticker", price: 25, icon: "assets/kunai.gif" },
  { id: "sticker_curse", name: "Cursed Mark", type: "sticker", price: 25, icon: "assets/cursedmark.gif" },
  { id: "sticker_joyboy", name: "Nika Sun", type: "sticker", price: 25, icon: "assets/sungod.gif" },
  { id: "sticker_chibigojo", name: "Chibi Gojo", type: "sticker", price: 25, icon: "assets/gojo_chibi.gif" },
  { id: "sticker_cukootoji", name: "Cukoo Toji", type: "sticker", price: 25, icon: "assets/cukoo_toji.gif" },
  { id: "layout_rainy", name: "Rain-Dashed Paper", type: "layout", price: 100, icon: "assets/rain_icon.png" },
  { id: "layout_matrix", name: "Glitch Circuitry", type: "layout", price: 100, icon: "assets/glitch_icon.png" },
  { id: "layout_hologram", name: "Holo-Prism", type: "layout", price: 100, icon: "assets/holo_icon.png" },
  { id: "sfx_chidori", name: "SFX: Chidori", type: "sfx", price: 50, icon: "assets/kakashi_nendo.png" },
  { id: "sfx_dattebayo", name: "SFX: Dattebayo!", type: "sfx", price: 50, icon: "assets/naruto_nendo.png" },
  { id: "sfx_yowaimo", name: "SFX: Yowaimo (Gojo)", type: "sfx", price: 50, icon: "assets/gojo_nendo.png" },
  { id: "sfx_usuratonkachi", name: "SFX: Usuratonkachi", type: "sfx", price: 50, icon: "assets/sasuke_nendo.png" },
  { id: "sfx_notazenin", name: "SFX: Not A Zenin", type: "sfx", price: 50, icon: "assets/toji_nendo.png" },
  { id: "sfx_sukunalaugh", name: "SFX: Sukuna's Laugh", type: "sfx", price: 50, icon: "assets/sukuna_nendo.png" },
  { id: "sfx_sasukesayingnaruto", name: "SFX: NARUTOOOOO!", type: "sfx", price: 50, icon: "assets/sasuke_nendo.png" },
  { id: "sfx_narutosayingsasuke", name: "SFX: SASUKEEEE!", type: "sfx", price: 50, icon: "assets/naruto_nendo.png" },
  { id: "cursor_kunai", name: "Kunai Pointer", type: "cursor", price: 25, icon: "assets/kunai_cursor.png" },
  { id: "cursor_scythe", name: "Hidan's Scythe", type: "cursor", price: 25, icon: "assets/scythe_cursor.png" },
  { id: "cursor_heart", name: "Ope Ope Heart", type: "cursor", price: 25, icon: "assets/heart_cursor.png" },
  { id: "cursor_cat", name: "Cat", type: "cursor", price: 25, icon: "assets/cat_cursor.png" },
  { id: "layout_hokage", name: "Scroll of the First", type: "layout", price: 500, icon: "assets/scroll_icon.png" },
  { id: "layout_prison", name: "Prison Realm Case", type: "layout", price: 500, icon: "assets/prison_icon.png" },
  { id: "layout_toji", name: "Heavenly Restriction", type: "layout", price: 500, icon: "assets/toji_icon.png" },

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
