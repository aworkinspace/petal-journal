import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// 1. SELECT ELEMENTS
const grid = document.getElementById("shopGrid");
const balanceEl = document.getElementById("shopBalance");
const tabButtons = document.querySelectorAll(".tab-btn");

// 2. STATE
let currentFilter = "all";
let currentUser = null;

// 3. SHOP INVENTORY (Defined at top so functions can see it)
const shopItems = [
  { id: "sticker_kunai", name: "Steel Kunai", type: "sticker", price: 25, icon: "assets/kunai.gif" },
  { id: "sticker_curse", name: "Cursed Mark", type: "sticker", price: 25, icon: "assets/cursedmark.gif" },
  { id: "sticker_joyboy", name: "Nika Sun", type: "sticker", price: 25, icon: "assets/sungod.gif" },
  { id: "sticker_chibigojo", name: "Chibi Gojo", type: "sticker", price: 25, icon: "assets/gojo_chibi.gif" },
  { id: "sticker_cukootoji", name: "Cukoo Toji", type: "sticker", price: 25, icon: "assets/cukoo_toji.gif" },
  { id: "layout_rainy", name: "Rainy Paper", type: "layout", price: 100, icon: "assets/rain_icon.png" },
  { id: "layout_matrix", name: "Glitch Paper", type: "layout", price: 100, icon: "assets/glitch_icon.png" },
  { id: "layout_hologram", name: "Holo-Prism", type: "layout", price: 100, icon: "assets/holo_icon.png" },
  { id: "sfx_chidori", name: "SFX: Chidori", type: "sfx", price: 50, icon: "assets/kakashi_nendo.png" },
  { id: "sfx_dattebayo", name: "SFX: Dattebayo!", type: "sfx", price: 50, icon: "assets/naruto_nendo.png" },
  { id: "sfx_yowaimo", name: "SFX: Yowaimo", type: "sfx", price: 50, icon: "assets/gojo_nendo.png" },
  { id: "sfx_usuratonkachi", name: "SFX: Usuratonkachi", type: "sfx", price: 50, icon: "assets/sasuke_nendo.png" },
  { id: "sfx_hashirama", name: "SFX: Tsuna?", type: "sfx", price: 50, icon: "assets/hashirama_nendo.png" },
  { id: "sfx_notazenin", name: "SFX: Not A Zenin", type: "sfx", price: 50, icon: "assets/toji_nendo.png" },
  { id: "sfx_sukunalaugh", name: "SFX: Sukuna's Laugh", type: "sfx", price: 50, icon: "assets/sukuna_nendo.png" },
  { id: "cursor_kunai", name: "Kunai Pointer", type: "cursor", price: 25, icon: "assets/kunai_cursor.png" },
  { id: "cursor_scythe", name: "Hidan's Scythe", type: "cursor", price: 25, icon: "assets/scythe_cursor.png" },
  { id: "cursor_mangekyo", name: "Eternal Mangekyo", type: "cursor", price: 25, icon: "assets/mangekyo_cursor.png" },
  { id: "layout_hokage", name: "Hokage Scroll", type: "layout", price: 500, icon: "assets/scroll_icon.png" },
  { id: "layout_prison", name: "Prison Realm", type: "layout", price: 500, icon: "assets/prison_icon.png" },
  { id: "layout_toji", name: "Toji Arsenal", type: "layout", price: 500, icon: "assets/toji_icon.png" },
  { id: "layout_bond", name: "Eternal Bond", type: "layout", price: 600, icon: "assets/bond_icon.png" },
  { id: "pet_nendo_kakashi", name: "Nendo Kakashi", type: "pet", price: 400, icon: "assets/nendo_kakashi.png" },
  { id: "pet_nendo_naruto", name: "Nendo Naruto", type: "pet", price: 400, icon: "assets/nendo_naruto.png" },
  { id: "pet_nendo_sasuke", name: "Nendo Sasuke", type: "pet", price: 400, icon: "assets/nendo_sasuke.png" },
  { id: "pet_nendo_narusasu", name: "Nendo NaruSasu", type: "pet", price: 450, icon: "assets/nendo_narusasu.png" },
  { id: "pet_nendo_gojo", name: "Nendo Gojo", type: "pet", price: 400, icon: "assets/nendo_gojo.png" },
  { id: "pet_nendo_law", name: "Nendo Law", type: "pet", price: 400, icon: "assets/nendo_law.png" },
  { id: "pet_nendo_madara", name: "Nendo Madara", type: "pet", price: 400, icon: "assets/nendo_madara.png" },
  { id: "pet_nendo_hashirama", name: "Nendo Hashirama", type: "pet", price: 400, icon: "assets/nendo_hashirama.png" },
  { id: "pet_nendo_obito", name: "Nendo Obito", type: "pet", price: 400, icon: "assets/nendo_obito.png" },
  { id: "title_sannin", name: "Sannin Title", type: "title", price: 300, icon: "assets/title_scroll.png" },
  { id: "title_uchiha", name: "Uchiha Title", type: "title", price: 300, icon: "assets/title_fan.png" },
  { id: "title_mednin", name: "The Medical-Nin", type: "title", price: 300, icon: "assets/title_health.png" }
];

// 4. HELPERS
function getTokens() { return Number(localStorage.getItem("petal_tokens")) || 0; }
function getOwned() { return JSON.parse(localStorage.getItem("petal_owned_items") || "[]"); }

// 5. UI RENDERER
function updateUI() {
  if (!grid || !balanceEl) return;
  
  balanceEl.textContent = getTokens();
  const owned = getOwned();
  grid.innerHTML = "";

  // Filter based on active tab
  const filtered = currentFilter === "all" ? shopItems : shopItems.filter(i => i.type === currentFilter);

  filtered.forEach(item => {
    const isOwned = owned.includes(item.id);
    const card = document.createElement("div");
    card.className = `shop-item ${isOwned ? 'owned' : ''}`;
    
    card.innerHTML = `
      <img src="${item.icon}" onerror="this.src='assets/placeholder.png'">
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

// 6. BUY LOGIC
async function buyItem(item) {
  let tokens = getTokens();
  if (tokens < item.price) {
    alert("Not enough tokens! Write more in your journal!");
    return;
  }

  if (confirm(`Purchase ${item.name} for ${item.price} tokens?`)) {
    tokens -= item.price;
    localStorage.setItem("petal_tokens", tokens);

    const owned = getOwned();
    owned.push(item.id);
    localStorage.setItem("petal_owned_items", JSON.stringify(owned));

    updateUI();

    // Sync to Cloud
    if (window.firebaseAuth?.currentUser) {
      const db = window.firebaseDb;
      const uid = window.firebaseAuth.currentUser.uid;
      try {
        await setDoc(doc(db, "users", uid, "stats", "zen"), { 
          tokens: tokens, 
          ownedItems: owned 
        }, { merge: true });
        console.log("Cloud synced successfully");
      } catch (e) { console.error("Cloud error:", e); }
    }
    alert("Success! Check your profile or stickers.");
  }
}

// 7. TAB LOGIC
tabButtons.forEach(btn => {
  btn.onclick = () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.type;
    updateUI();
  };
});

// 8. INITIAL LOAD
updateUI();

// 9. GLOBAL CURSOR (Matches other pages)
if (localStorage.getItem("petal_equipped_cursor")) {
    const cursor = localStorage.getItem("petal_equipped_cursor").replace("cursor_", "");
    const url = `assets/${cursor}_cursor.png`;
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: url('${url}'), auto !important; }`;
    document.head.appendChild(style);
}
