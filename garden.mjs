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
    
    for (let i = 0; i < plantCount; i++) {
      const plant = document.createElement("div");
      plant.className = "plant";
      
      // Random position along the bottom
      plant.style.left = Math.random() * 90 + 5 + "%";
      
      // Determine growth stage based on total entry count
      let icon = "🌱"; // Sprout
      if (count > 20) icon = "🌿"; // Leafy
      if (count > 50) icon = "🌸"; // Bloom
      if (count > 100) icon = "🌺"; // Rare Bloom

      plant.textContent = icon;
      plant.style.fontSize = (Math.random() * 20 + 30) + "px";
      
      // Add a slight delay to each "pop up"
      setTimeout(() => {
        garden.appendChild(plant);
      }, i * 100);
    }
  }

  growGarden();
});
