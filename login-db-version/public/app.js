let spots = [];
let favorites = [];
let token = localStorage.getItem("loginDbToken") || "";

const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const registerButton = document.querySelector("#registerButton");
const loginButton = document.querySelector("#loginButton");
const logoutButton = document.querySelector("#logoutButton");
const userStatus = document.querySelector("#userStatus");
const message = document.querySelector("#message");
const citySelect = document.querySelector("#citySelect");
const searchInput = document.querySelector("#searchInput");
const spotsContainer = document.querySelector("#spotsContainer");
const placeCount = document.querySelector("#placeCount");
const favoritesList = document.querySelector("#favoritesList");
const emptyFavorites = document.querySelector("#emptyFavorites");

async function startApp() {
  const response = await fetch("spots.json");
  spots = await response.json();

  fillCitySelect();
  await loadCurrentUser();
  renderSpots();
  renderFavorites();
}

async function requestApi(path, options) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : "",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "请求失败");
  }

  return data;
}

async function loadCurrentUser() {
  if (!token) {
    updateLoginState("");
    return;
  }

  try {
    const user = await requestApi("/api/me", {});
    const favoriteData = await requestApi("/api/favorites", {});
    favorites = favoriteData.favorites;
    updateLoginState(user.username);
  } catch (error) {
    token = "";
    localStorage.removeItem("loginDbToken");
    updateLoginState("");
  }
}

function updateLoginState(username) {
  userStatus.textContent = username ? "已登录：" + username : "未登录";
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

function renderSpots() {
  const filteredSpots = getFilteredSpots();

  placeCount.textContent = filteredSpots.length + " 个地点";
  spotsContainer.innerHTML = "";

  if (filteredSpots.length === 0) {
    spotsContainer.innerHTML = '<p class="muted">没有找到匹配的地点。</p>';
    return;
  }

  filteredSpots.forEach(function (spot) {
    const isSaved = favorites.includes(spot.id);
    const card = document.createElement("article");
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

async function register() {
  try {
    await requestApi("/api/register", {
      method: "POST",
      body: getLoginBody(),
    });
    message.textContent = "注册成功，请登录。";
  } catch (error) {
    message.textContent = error.message;
  }
}

async function login() {
  try {
    const data = await requestApi("/api/login", {
      method: "POST",
      body: getLoginBody(),
    });

    token = data.token;
    localStorage.setItem("loginDbToken", token);
    favorites = [];
    message.textContent = "登录成功。";
    await loadCurrentUser();
    renderSpots();
    renderFavorites();
  } catch (error) {
    message.textContent = error.message;
  }
}

function logout() {
  token = "";
  favorites = [];
  localStorage.removeItem("loginDbToken");
  updateLoginState("");
  renderSpots();
  renderFavorites();
}

function getLoginBody() {
  return {
    username: usernameInput.value.trim(),
    password: passwordInput.value,
  };
}

async function toggleFavorite(spotId) {
  if (!token) {
    message.textContent = "请先登录再收藏。";
    return;
  }

  try {
    if (favorites.includes(spotId)) {
      const data = await requestApi("/api/favorites/" + encodeURIComponent(spotId), {
        method: "DELETE",
      });
      favorites = data.favorites;
    } else {
      const data = await requestApi("/api/favorites", {
        method: "POST",
        body: { spotId: spotId },
      });
      favorites = data.favorites;
    }

    renderSpots();
    renderFavorites();
  } catch (error) {
    message.textContent = error.message;
  }
}

registerButton.addEventListener("click", register);
loginButton.addEventListener("click", login);
logoutButton.addEventListener("click", logout);
citySelect.addEventListener("change", renderSpots);
searchInput.addEventListener("input", renderSpots);

spotsContainer.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (button) {
    toggleFavorite(button.dataset.id);
  }
});

startApp();
