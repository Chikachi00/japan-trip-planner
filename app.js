let spots = [];
let favorites = [];

const citySelect = document.querySelector("#citySelect");
const searchInput = document.querySelector("#searchInput");
const spotsContainer = document.querySelector("#spotsContainer");
const placeCount = document.querySelector("#placeCount");
const favoritesList = document.querySelector("#favoritesList");
const emptyFavorites = document.querySelector("#emptyFavorites");
const clearFavoritesButton = document.querySelector("#clearFavorites");

async function startApp() {
  favorites = loadFavorites();

  const response = await fetch("spots.json");
  spots = await response.json();

  fillCitySelect();
  renderSpots();
  renderFavorites();
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

function renderSpots() {
  const city = citySelect.value;
  const keyword = searchInput.value.trim().toLowerCase();

  const filteredSpots = spots.filter(function (spot) {
    const matchesCity = city === "all" || spot.city === city;
    const text = (spot.name + " " + spot.city + " " + spot.description).toLowerCase();
    const matchesKeyword = text.includes(keyword);

    return matchesCity && matchesKeyword;
  });

  placeCount.textContent = filteredSpots.length + " 个地点";
  spotsContainer.innerHTML = "";

  if (filteredSpots.length === 0) {
    spotsContainer.innerHTML = '<p class="muted">没有找到匹配的地点。</p>';
    return;
  }

  filteredSpots.forEach(function (spot) {
    const card = document.createElement("article");
    const isSaved = favorites.includes(spot.id);

    card.className = "spot-card";
    card.innerHTML = `
      <h3>${spot.name}</h3>
      <div class="meta">${spot.city}</div>
      <p>${spot.description}</p>
      <button class="${isSaved ? "saved" : ""}" data-id="${spot.id}">
        ${isSaved ? "已收藏" : "收藏"}
      </button>
    `;

    spotsContainer.appendChild(card);
  });
}

function renderFavorites() {
  favoritesList.innerHTML = "";
  emptyFavorites.hidden = favorites.length > 0;

  favorites.forEach(function (spotId) {
    const spot = spots.find(function (item) {
      return item.id === spotId;
    });

    if (spot) {
      const li = document.createElement("li");
      li.textContent = spot.name + " - " + spot.city;
      favoritesList.appendChild(li);
    }
  });
}

function toggleFavorite(spotId) {
  if (favorites.includes(spotId)) {
    favorites = favorites.filter(function (id) {
      return id !== spotId;
    });
  } else {
    favorites.push(spotId);
  }

  saveFavorites();
  renderSpots();
  renderFavorites();
}

function loadFavorites() {
  const savedText = localStorage.getItem("favoriteSpots");

  if (savedText) {
    return JSON.parse(savedText);
  }

  return [];
}

function saveFavorites() {
  localStorage.setItem("favoriteSpots", JSON.stringify(favorites));
}

citySelect.addEventListener("change", renderSpots);
searchInput.addEventListener("input", renderSpots);

spotsContainer.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (button) {
    toggleFavorite(button.dataset.id);
  }
});

clearFavoritesButton.addEventListener("click", function () {
  favorites = [];
  saveFavorites();
  renderSpots();
  renderFavorites();
});

startApp();
