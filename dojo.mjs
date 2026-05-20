const listEl = document.getElementById("jutsuList");
const inputEl = document.getElementById("jutsuInput");
const btnAdd = document.getElementById("btnAddJutsu");
const gaiTalk = document.getElementById("gaiTalk");

let jutsus = JSON.parse(localStorage.getItem("petal_jutsus") || "[]");

const gaiQuotes = [
  "THE SPRINGTIME OF YOUTH HASN'T ENDED YET!",
  "A FAILURE WILL WIN EVEN AGAINST A GENIUS WITH HARD WORK!",
  "LOOK DEEP INTO MY EYES AND ACCEPT THIS ENTHUSIASM!",
  "YOU HAVE THE POWER OF YOUTH WITHIN YOU!",
  "HARD WORK PAYS OFF! DON'T GIVE UP!",
  "TEN PUSHUPS IF YOU MISS A JUTSU! JUST KIDDING! START AGAIN!"
];

function updateGai() {
  gaiTalk.textContent = gaiQuotes[Math.floor(Math.random() * gaiQuotes.length)];
}

function saveJutsus() {
  localStorage.setItem("petal_jutsus", JSON.stringify(jutsus));
  renderJutsus();
}

function renderJutsus() {
  listEl.innerHTML = "";
  jutsus.forEach((jutsu, index) => {
    const item = document.createElement("div");
    item.className = "jutsu-item";
    
    item.innerHTML = `
      <div class="jutsu-name">${jutsu.name}</div>
      <button class="check-btn ${jutsu.done ? 'checked' : ''}">${jutsu.done ? '✔' : ''}</button>
      <button class="btn" style="margin-left:10px; background:#ff4d4d; border:2px solid black;" onclick="deleteJutsu(${index})">×</button>
    `;

    item.querySelector(".check-btn").onclick = () => {
      jutsus[index].done = !jutsus[index].done;
      if (jutsus[index].done) {
        updateGai();
        // Reward XP!
        let xp = Number(localStorage.getItem("petal_dojo_xp") || "0");
        localStorage.setItem("petal_dojo_xp", xp + 10);
      }
      saveJutsus();
    };

    listEl.appendChild(item);
  });
}

// Global functions for the buttons
window.deleteJutsu = (index) => {
  jutsus.splice(index, 1);
  saveJutsus();
};

btnAdd.onclick = () => {
  const name = inputEl.value.trim();
  if (name) {
    jutsus.push({ name, done: false });
    inputEl.value = "";
    saveJutsus();
  }
};

// Initial Load
renderJutsus();
