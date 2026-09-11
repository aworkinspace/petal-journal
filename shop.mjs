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
  { id: "sticker_sharingan_eye", name: "Active Sharingan", type: "sticker", price: 75, icon: "assets/sharingan_eye.gif" },
  { id: "sticker_hawk", name: "Hawks", type: "sticker", price: 50, icon: "assets/hawks.gif" },
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
  { id: "sfx_domain", name: "SFX: Ryoiki Tenkai", type: "sfx", price: 50, icon: "assets/gojo_eye_nendo.png" },
  { id: "sfx_prominence", name: "SFX: Plus Ultra! PROMINENCE BURN!", type: "sfx", price: 50, icon: "assets/endeavor_pb_nendo.png" },
  { id: "cursor_kunai", name: "Kunai Pointer", type: "cursor", price: 25, icon: "assets/kunai_cursor.png" },
  { id: "cursor_scythe", name: "Hidan's Scythe", type: "cursor", price: 25, icon: "assets/scythe_cursor.png" },
  { id: "cursor_mangekyo", name: "Eternal Mangekyo", type: "cursor", price: 25, icon: "assets/mangekyo_cursor.png" },
  { id: "layout_hokage", name: "Hokage Scroll", type: "layout", price: 500, icon: "assets/scroll_icon.png" },
  { id: "layout_prison", name: "Prison Realm", type: "layout", price: 500, icon: "assets/prison_icon.png" },
  { id: "layout_toji", name: "Toji Arsenal", type: "layout", price: 500, icon: "assets/toji_icon.png" },
  { id: "layout_bond", name: "Eternal Bond", type: "layout", price: 600, icon: "assets/bond_icon.png" },
  { id: "pet_nendo_kakashi", name: "Nendo Kakashi", type: "pet", price: 400, icon: "assets/nendo_kakashi.png" },
  { id: "pet_nendo_sakura", name: "Nendo Sakura", type: "pet", price: 400, icon: "assets/nendo_sakura.png" },
  { id: "pet_nendo_naruto", name: "Nendo Naruto", type: "pet", price: 400, icon: "assets/nendo_naruto.png" },
  { id: "pet_nendo_sasuke", name: "Nendo Sasuke", type: "pet", price: 400, icon: "assets/nendo_sasuke.png" },
  { id: "pet_nendo_narusasu", name: "Nendo NaruSasu", type: "pet", price: 450, icon: "assets/nendo_narusasu.png" },
  { id: "pet_nendo_gojo", name: "Nendo Gojo", type: "pet", price: 400, icon: "assets/nendo_gojo.png" },
  { id: "pet_nendo_sukuna", name: "Nendo Sukuna", type: "pet", price: 400, icon: "assets/nendo_sukuna.png" },
  { id: "pet_nendo_yuji", name: "Nendo Yuji", type: "pet", price: 400, icon: "assets/nendo_yuji.png" },
  { id: "pet_nendo_megumi", name: "Nendo Megumi", type: "pet", price: 400, icon: "assets/nendo_megumi.png" },
  { id: "pet_nendo_nobara", name: "Nendo Nobara", type: "pet", price: 400, icon: "assets/nendo_nobara.png" },
  { id: "pet_nendo_nanami", name: "Nendo Nanami", type: "pet", price: 400, icon: "assets/nendo_nanami.png" },
  { id: "pet_nendo_toji", name: "Nendo Toji", type: "pet", price: 400, icon: "assets/nendo_toji.png" },
  { id: "pet_nendo_naoya", name: "Nendo Naoya", type: "pet", price: 400, icon: "assets/nendo_naoya.png" },
  { id: "pet_nendo_choso", name: "Nendo Choso", type: "pet", price: 400, icon: "assets/nendo_choso.png" },
  { id: "pet_nendo_maki", name: "Nendo Maki", type: "pet", price: 400, icon: "assets/nendo_maki.png" },
  { id: "pet_nendo_law", name: "Nendo Law", type: "pet", price: 400, icon: "assets/nendo_law.png" },
  { id: "pet_nendo_madara", name: "Nendo Madara", type: "pet", price: 400, icon: "assets/nendo_madara.png" },
  { id: "pet_nendo_hashirama", name: "Nendo Hashirama", type: "pet", price: 400, icon: "assets/nendo_hashirama.png" },
  { id: "pet_nendo_obito", name: "Nendo Obito", type: "pet", price: 400, icon: "assets/nendo_obito.png" },
  { id: "pet_nendo_allmight", name: "Nendo All Might", type: "pet", price: 400, icon: "assets/nendo_allmight.png" },
  { id: "pet_nendo_hawks", name: "Nendo Hawks", type: "pet", price: 400, icon: "assets/nendo_hawks.png" },
  { id: "pet_nendo_dabi", name: "Nendo Dabi", type: "pet", price: 400, icon: "assets/nendo_dabi.png" },
  { id: "pet_nendo_endeavor", name: "Nendo Endeavor", type: "pet", price: 400, icon: "assets/nendo_endeavor.png" },
  { id: "pet_nendo_shiggy", name: "Nendo Shigaraki", type: "pet", price: 400, icon: "assets/nendo_shiggy.png" },
  { id: "pet_nendo_deku", name: "Nendo Izuku", type: "pet", price: 400, icon: "assets/nendo_deku.png" },
  { id: "pet_nendo_baku", name: "Nendo Katsuki", type: "pet", price: 400, icon: "assets/nendo_baku.png" },
  { id: "pet_nendo_shoto", name: "Nendo Shoto", type: "pet", price: 400, icon: "assets/nendo_shoto.png" },
  { id: "pet_nendo_aizawa", name: "Nendo Aizawa", type: "pet", price: 400, icon: "assets/nendo_aizawa.png" },
  { id: "pet_nendo_nagant", name: "Nendo Nagant", type: "pet", price: 450, icon: "assets/nendo_nagant.png" },
  { id: "title_sannin", name: "Sannin Title", type: "title", price: 300, icon: "assets/title_scroll.png" },
  { id: "title_uchiha", name: "Uchiha Title", type: "title", price: 300, icon: "assets/title_fan.png" },
  { id: "title_mednin", name: "The Medical-Nin", type: "title", price: 300, icon: "assets/title_health.png" },
  { id: "title_joyboy", name: "The Warrior of Liberation", type: "title", price: 500, icon: "assets/title_sun.png" },
  { id: "title_curse_king", name: "King of Curses", type: "title", price: 500, icon: "assets/title_mask.png" },
  { id: "title_fierce_wings", name: "Fierce Wings", type: "title", price: 300, icon: "assets/title_feather.png" },
  { id: "title_hellflame_sovereign", name: "Hellflame Sovereign", type: "title", price: 300, icon: "assets/title_flame.png" },
  { id: "filter_crt", name: "Retro CRT Scanlines", type: "filter", price: 400, icon: "assets/crt_icon.png" },
  { id: "filter_dust", name: "Warm Library Dust", type: "filter", price: 400, icon: "assets/dust_icon.png" },
  { id: "filter_vignette", name: "Cinematic Focus", type: "filter", price: 400, icon: "assets/vignette_icon.png" },
  { id: "filter_sepia", name: "Nostalgic Sepia", type: "filter", price: 300, icon: "assets/sepia_icon.png" },
    // Profile Frames
  { id: "frame_sakura", name: "Sakura Frame", type: "frame", price: 250, icon: "assets/frame_sakura.png", rarity: "rare", description: "A soft pink profile frame with falling petal energy." },
  { id: "frame_infinity", name: "Infinity Frame", type: "frame", price: 500, icon: "assets/frame_infinity.png", rarity: "legendary", description: "A blue limitless aura for your profile picture." },
  { id: "frame_curse", name: "Cursed Energy Frame", type: "frame", price: 400, icon: "assets/frame_curse.png", rarity: "epic", description: "A dark purple cursed-energy profile frame." },

  // Badges
  { id: "badge_leaf", name: "Hidden Leaf Badge", type: "badge", price: 150, icon: "assets/badge_leaf.png", rarity: "common", description: "Display a small Hidden Leaf badge on your profile." },
  { id: "badge_uchiha", name: "Uchiha Crest Badge", type: "badge", price: 250, icon: "assets/badge_uchiha.png", rarity: "rare", description: "Display the Uchiha crest on your profile." },
  { id: "badge_strawhat", name: "Straw Hat Badge", type: "badge", price: 250, icon: "assets/badge_strawhat.png", rarity: "rare", description: "A badge for those chasing freedom." },
  { id: "badge_hollow_purple", name: "Special Grade Badge", type: "badge", price: 500, icon: "assets/badge_hollow_purple.png", rarity: "legendary", description: "A badge reserved for terrifying potential." },

  // Additional Filters
  { id: "filter_chakra_glow", name: "Chakra Glow", type: "filter", price: 350, icon: "assets/filter_chakra.png", rarity: "rare", description: "Applies a soft blue chakra glow to the app." },
  { id: "filter_cursed_energy", name: "Cursed Energy Overlay", type: "filter", price: 450, icon: "assets/filter_cursed.png", rarity: "epic", description: "Adds a dark purple cursed-energy overlay." },
  
  // More Titles
  { id: "title_six_eyes", name: "Six Eyes Title", type: "title", price: 600, icon: "assets/title_six_eyes.png", rarity: "legendary", description: "Equip the title: The Honored One." },
  { id: "title_limitless", name: "Limitless Title", type: "title", price: 500, icon: "assets/title_infinity.png", rarity: "epic", description: "Equip the title: Limitless." },
  { id: "title_symbol_of_peace", name: "Symbol of Peace", type: "title", price: 500, icon: "assets/title_peace.png", rarity: "epic", description: "Equip the title: Symbol of Peace." },
  { id: "title_shadow_monarch", name: "Shadow Monarch", type: "title", price: 700, icon: "assets/title_shadow.png", rarity: "legendary", description: "Equip the title: Shadow Monarch." },
  { id: "title_strawhat_captain", name: "Straw Hat Captain", type: "title", price: 500, icon: "assets/title_strawhat.png", rarity: "epic", description: "Equip the title: Straw Hat Captain." },

  // Premium Layouts
  { id: "layout_infinity_void", name: "Infinity Void", type: "layout", price: 700, icon: "assets/layout_infinity_void.png", rarity: "legendary", description: "A deep cosmic layout with limitless blue highlights." },
  { id: "layout_sakura_shrine", name: "Sakura Shrine", type: "layout", price: 450, icon: "assets/layout_sakura_shrine.png", rarity: "epic", description: "A peaceful shrine layout filled with soft petals." },
  { id: "layout_akatsuki_night", name: "Akatsuki Night", type: "layout", price: 600, icon: "assets/layout_akatsuki.png", rarity: "legendary", description: "A dark red-cloud layout for rogue spirits." },
  { id: "layout_ua_training", name: "U.A. Training Room", type: "layout", price: 450, icon: "assets/layout_ua.png", rarity: "epic", description: "A clean heroic layout inspired by training halls." },

  // Pet Accessories
  { id: "pet_acc_leaf_headband", name: "Leaf Headband", type: "pet_accessory", price: 150, icon: "assets/pet_acc_leaf_headband.png", rarity: "common", description: "Equip a Leaf headband on compatible companions." },
  { id: "pet_acc_strawhat", name: "Tiny Straw Hat", type: "pet_accessory", price: 200, icon: "assets/pet_acc_strawhat.png", rarity: "rare", description: "Give compatible companions a tiny straw hat." },
  { id: "pet_acc_blindfold", name: "Tiny Blindfold", type: "pet_accessory", price: 250, icon: "assets/pet_acc_blindfold.png", rarity: "rare", description: "Give compatible companions a mysterious blindfold." },
  { id: "pet_acc_flame_aura", name: "Flame Aura", type: "pet_accessory", price: 300, icon: "assets/pet_acc_flame_aura.png", rarity: "epic", description: "Adds a flame aura to compatible companions." },

  // More Stickers
  { id: "sticker_leaf_symbol", name: "Leaf Symbol", type: "sticker", price: 25, icon: "assets/sticker_leaf_symbol.gif", rarity: "common", description: "A small animated Hidden Leaf sticker." },
  { id: "sticker_strawhat", name: "Straw Hat", type: "sticker", price: 50, icon: "assets/sticker_strawhat.gif", rarity: "rare", description: "A cheerful straw hat sticker." },
  { id: "sticker_black_flash", name: "Black Flash", type: "sticker", price: 75, icon: "assets/sticker_black_flash.gif", rarity: "epic", description: "An animated Black Flash impact sticker." },
  { id: "sticker_blue_flame", name: "Blue Flame", type: "sticker", price: 75, icon: "assets/sticker_blue_flame.gif", rarity: "epic", description: "An animated blue flame sticker." },
  { id: "sticker_plus_ultra", name: "Plus Ultra", type: "sticker", price: 75, icon: "assets/sticker_plus_ultra.gif", rarity: "rare", description: "A bold heroic sticker." },

];
// 4. HELPERS
function getTokens() { return Number(localStorage.getItem("petal_tokens")) || 0; }
function getOwned() { return JSON.parse(localStorage.getItem("petal_owned_items") || "[]"); }

window.shopItems = shopItems; 

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
  // --- GLOBAL FILTER APPLY ---
  const activeFilter = localStorage.getItem("petal_equipped_filter") || "none";
  if (activeFilter !== "none") {
    let filterOverlay = document.getElementById("screen-filter-overlay");
    if (!filterOverlay) {
      filterOverlay = document.createElement("div");
      filterOverlay.id = "screen-filter-overlay";
      document.body.prepend(filterOverlay);
    }
    // Convert 'filter_crt' -> 'filter-crt' for the CSS class
    const cssClass = activeFilter.replace("_", "-");
    filterOverlay.className = cssClass;
  }
