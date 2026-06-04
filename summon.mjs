const btn = document.getElementById("btnSummon");
const container = document.getElementById("cardContainer");
const cardFront = document.getElementById("cardFront");
const msg = document.getElementById("summonMsg");

// 1. Updated list of your Cards
const cards = [
  { name: "Sage Mode Naruto", img: "assets/naruto_vmax.png" },
  { name: "Susanoo Sasuke", img: "assets/sasuke_vmax.png" },
  { name: "Chidori Kakashi", img: "assets/kakashichidori_vmax.png" }, // Add first one
  { name: "Kamui Kakashi", img: "assets/kakashikamui_vmax.png" }      // Add second one
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
