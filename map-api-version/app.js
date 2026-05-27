let spots = [];
let map;
let markers = [];

const citySelect = document.querySelector("#citySelect");
const searchInput = document.querySelector("#searchInput");
const spotsContainer = document.querySelector("#spotsContainer");
const placeCount = document.querySelector("#placeCount");

async function startApp() {
  const response = await fetch("spots.json");
  spots = await response.json();

  createMap();
  fillCitySelect();
  render();
}

function createMap() {
  map = L.map("map").setView([35.68, 139.76], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

function fillCitySelect() {
  const cities = [];

  spots.forEach(function (spot) {
    if (!cities.includes(spot.city)) {
      cities.push(spot.city);
    }
  });

  cities.forEach(function (city) {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

function getFilteredSpots() {
  const city = citySelect.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return spots.filter(function (spot) {
    const matchesCity = city === "all" || spot.city === city;
    const text = (spot.name + " " + spot.city + " " + spot.description).toLowerCase();
    const matchesKeyword = text.includes(keyword);

    return matchesCity && matchesKeyword;
  });
}

function render() {
  const filteredSpots = getFilteredSpots();

  placeCount.textContent = filteredSpots.length + " 个地点";
  renderSpotCards(filteredSpots);
  renderMarkers(filteredSpots);
}

function renderSpotCards(filteredSpots) {
  spotsContainer.innerHTML = "";

  if (filteredSpots.length === 0) {
    spotsContainer.innerHTML = '<p class="muted">没有找到匹配的地点。</p>';
    return;
  }

  filteredSpots.forEach(function (spot) {
    const card = document.createElement("article");
    card.className = "spot-card";
    card.innerHTML = `
      <h3>${spot.name}</h3>
      <div class="meta">${spot.city}</div>
      <p>${spot.description}</p>
    `;

    card.addEventListener("click", function () {
      map.setView([spot.lat, spot.lng], 13);
      const marker = markers.find(function (item) {
        return item.spotId === spot.id;
      });

      if (marker) {
        marker.leafletMarker.openPopup();
      }
    });

    spotsContainer.appendChild(card);
  });
}

function renderMarkers(filteredSpots) {
  markers.forEach(function (item) {
    item.leafletMarker.remove();
  });
  markers = [];

  filteredSpots.forEach(function (spot) {
    const leafletMarker = L.marker([spot.lat, spot.lng])
      .addTo(map)
      .bindPopup("<strong>" + spot.name + "</strong><br>" + spot.city);

    markers.push({
      spotId: spot.id,
      leafletMarker: leafletMarker,
    });
  });

  if (filteredSpots.length > 0) {
    const bounds = filteredSpots.map(function (spot) {
      return [spot.lat, spot.lng];
    });
    map.fitBounds(bounds, { padding: [30, 30] });
  }
}

citySelect.addEventListener("change", render);
searchInput.addEventListener("input", render);

startApp();
