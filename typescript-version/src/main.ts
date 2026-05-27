import "./style.css";

type Spot = {
  id: string;
  name: string;
  city: string;
  description: string;
};

let spots: Spot[] = [];
let favorites: string[] = [];

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error("页面缺少必要的 HTML 元素：" + selector);
  }

  return element;
}

const citySelect = getElement<HTMLSelectElement>("#citySelect");
const searchInput = getElement<HTMLInputElement>("#searchInput");
const spotsContainer = getElement<HTMLDivElement>("#spotsContainer");
const placeCount = getElement<HTMLSpanElement>("#placeCount");
const favoritesList = getElement<HTMLUListElement>("#favoritesList");
const emptyFavorites = getElement<HTMLParagraphElement>("#emptyFavorites");
const clearFavoritesButton = getElement<HTMLButtonElement>("#clearFavorites");

async function startApp(): Promise<void> {
  favorites = loadFavorites();

  const response = await fetch("/spots.json");
  spots = await response.json();

  fillCitySelect();
  renderSpots();
  renderFavorites();
}

function fillCitySelect(): void {
  const cities: string[] = [];

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

function renderSpots(): void {
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

function renderFavorites(): void {
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

function toggleFavorite(spotId: string): void {
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

function loadFavorites(): string[] {
  const savedText = localStorage.getItem("tsFavoriteSpots");
  return savedText ? JSON.parse(savedText) : [];
}

function saveFavorites(): void {
  localStorage.setItem("tsFavoriteSpots", JSON.stringify(favorites));
}

citySelect.addEventListener("change", renderSpots);
searchInput.addEventListener("input", renderSpots);

spotsContainer.addEventListener("click", function (event) {
  const target = event.target;

  if (target instanceof HTMLElement) {
    const button = target.closest("button");

    if (button) {
      toggleFavorite(button.dataset.id || "");
    }
  }
});

clearFavoritesButton.addEventListener("click", function () {
  favorites = [];
  saveFavorites();
  renderSpots();
  renderFavorites();
});

startApp();
