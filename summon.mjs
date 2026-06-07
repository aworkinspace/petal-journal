const btn = document.getElementById("btnSummon");
const container = document.getElementById("cardContainer");
const cardFront = document.getElementById("cardFront");
const msg = document.getElementById("summonMsg");
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
// 1. Updated list of your Cards
const cards = [
  { name: "Sage Mode Naruto", img: "assets/naruto_vmax.png" }, // Sage Mode Naruto
  { name: "Susanoo Sasuke", img: "assets/sasuke_vmax.png" }, // Susanoo Sasuke
  { name: "Chidori Kakashi", img: "assets/kakashichidori_vmax.png" }, // Kakashi Chidori
  { name: "Kamui Kakashi", img: "assets/kakashikamui_vmax.png" },      // Kakashi Kamui
  { name: "Byakugo Sakura", img: "assets/sakurabyakugo_vmax.png" }, // Sakura Byakugo
  { name: "Valley of the End", img: "assets/valleyoftheend_vmax.png" }, // Valley of the End
];


function checkCooldown() {
  const lastSummon = localStorage.getItem("petal_last_summon");
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (lastSummon && now - lastSummon < oneDay) {
    const hoursLeft = Math.ceil((oneDay - (now - lastSummon)) / (1000 * 60 * 60));
    btn.disabled = true;
    msg.textContent = `Chakra depleted! Come back in ${hoursLeft} hours.`;
    return false;
  }
  return true;
}

btn.onclick = () => {
  if (!checkCooldown()) return;

  // Pick a random card
  const pick = cards[Math.floor(Math.random() * cards.length)];
  
  // Update UI
  cardFront.innerHTML = `<img src="${pick.img}" alt="${pick.name}" class="shimmer">`;
  container.classList.add("is-flipped");
  
  // Save cooldown
  localStorage.setItem("petal_last_summon", Date.now());
  
  // Reward XP
  let xp = Number(localStorage.getItem("petal_summon_xp") || "0");
  localStorage.setItem("petal_summon_xp", xp + 50);

  btn.disabled = true;
  msg.textContent = `You summoned ${pick.name}! +50 Zen XP earned.`;
  
  // Optional: Play a sound effect!
  const sfx = new Audio("assets/summon-sfx.mp3");
  sfx.play().catch(() => {});
};

// Check on page load
checkCooldown();
