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
document.addEventListener("DOMContentLoaded", () => {
  const garden = document.getElementById("garden-bed");
  const status = document.getElementById("gardenStatus");

  // 1. Get the entries from local storage
  const entries = JSON.parse(localStorage.getItem("petal_entries_v1") || "[]");
  const count = entries.length;

  status.textContent = `Total Seeds Sown: ${count}`;

  // 2. Plant Generation Logic
  function growGarden() {
    // We place one plant for every 3 entries
    const plantCount = Math.floor(count / 3);
    
    // Safety check: if they have entries but not enough for a plant, show 1 sprout
    const displayCount = (count > 0 && plantCount === 0) ? 1 : plantCount;

    for (let i = 0; i < displayCount; i++) {
      const plantContainer = document.createElement("div");
      plantContainer.className = "plant";
      
      // Random position along the bottom
      plantContainer.style.left = Math.random() * 92 + 4 + "%";
      
      // Determine growth stage based on total entry count
      if (count < 15) {
        // STAGE 1: Tiny Sprout (Emoji)
        plantContainer.textContent = "🌱";
        plantContainer.style.fontSize = "30px";
      } else {
        // STAGE 2: Full Bloom (Your new sakura.gif!)
        const img = document.createElement("img");
        img.src = "assets/sakura.gif"; // Updated filename
        
        // Randomize size slightly for a natural look (between 60px and 100px)
        const size = Math.floor(Math.random() * 40 + 60);
        img.style.width = size + "px";
        img.style.imageRendering = "pixelated"; 
        
        plantContainer.appendChild(img);
      }
      
      // Animation delay makes them pop up one by one
      setTimeout(() => {
        garden.appendChild(plantContainer);
      }, i * 150);
    }
  }

  growGarden();
});
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
