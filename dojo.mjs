const listEl = document.getElementById("jutsuList");
const inputEl = document.getElementById("jutsuInput");
const btnAdd = document.getElementById("btnAddJutsu");
const gaiTalk = document.getElementById("gaiTalk");
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
