import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Spot = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
};

type ApiOptions = {
  method?: string;
  body?: unknown;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const TOKEN_KEY = "finalTripToken";

function App() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const [spots, setSpots] = useState<Spot[]>([]);
  const [city, setCity] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [username, setUsername] = useState("");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(function () {
    api<{ spots: Spot[] }>("/api/spots").then(function (data) {
      setSpots(data.spots);
    });
  }, []);

  useEffect(
    function () {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        loadCurrentUser(token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUsername("");
        setFavorites([]);
      }
    },
    [token]
  );

  useEffect(function () {
    if (!mapElement.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(mapElement.current).setView([35.68, 139.76], 5);
    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);
  }, []);

  const cities = useMemo(
    function () {
      return Array.from(new Set(spots.map((spot) => spot.city)));
    },
    [spots]
  );

  const filteredSpots = spots.filter(function (spot) {
    const matchesCity = city === "all" || spot.city === city;
    const text = (spot.name + " " + spot.city + " " + spot.description).toLowerCase();
    const matchesKeyword = text.includes(keyword.trim().toLowerCase());
    return matchesCity && matchesKeyword;
  });

  useEffect(
    function () {
      const map = mapRef.current;
      const markerLayer = markerLayerRef.current;

      if (!map || !markerLayer) {
        return;
      }

      markerLayer.clearLayers();

      filteredSpots.forEach(function (spot) {
        L.marker([spot.lat, spot.lng])
          .bindPopup("<strong>" + spot.name + "</strong><br>" + spot.city)
          .addTo(markerLayer);
      });

      if (filteredSpots.length > 0) {
        const bounds = L.latLngBounds(
          filteredSpots.map(function (spot) {
            return [spot.lat, spot.lng];
          })
        );
        map.fitBounds(bounds, { padding: [28, 28] });
      }
    },
    [filteredSpots]
  );

  async function loadCurrentUser(currentToken: string) {
    try {
      const user = await api<{ username: string }>("/api/me", {}, currentToken);
      const favoriteData = await api<{ favorites: string[] }>("/api/favorites", {}, currentToken);
      setUsername(user.username);
      setFavorites(favoriteData.favorites);
    } catch (error) {
      setToken("");
    }
  }

  async function register() {
    try {
      await api("/api/register", {
        method: "POST",
        body: { username: loginName, password: password },
      });
      setMessage("注册成功，请登录。");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function login() {
    try {
      const data = await api<{ token: string; username: string }>("/api/login", {
        method: "POST",
        body: { username: loginName, password: password },
      });
      setToken(data.token);
      setUsername(data.username);
      setMessage("登录成功。");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function toggleFavorite(spotId: string) {
    if (!token) {
      setMessage("请先登录再收藏。");
      return;
    }

    try {
      const isSaved = favorites.includes(spotId);
      const data = isSaved
        ? await api<{ favorites: string[] }>(
            "/api/favorites/" + encodeURIComponent(spotId),
            { method: "DELETE" },
            token
          )
        : await api<{ favorites: string[] }>(
            "/api/favorites",
            { method: "POST", body: { spotId: spotId } },
            token
          );

      setFavorites(data.favorites);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  const favoriteSpots = favorites
    .map(function (spotId) {
      return spots.find(function (spot) {
        return spot.id === spotId;
      });
    })
    .filter(function (spot): spot is Spot {
      return spot !== undefined;
    });

  return (
    <div className="page">
      <header>
        <h1>Final 日本旅行规划器</h1>
        <p>React + TypeScript + 地图 + 登录 + 数据库收藏。</p>
      </header>

      <section className="auth-panel">
        <div>
          <h2>账号</h2>
          <p className="muted">{username ? "已登录：" + username : "未登录"}</p>
        </div>
        <div className="auth-form">
          <input
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            placeholder="用户名"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="密码"
          />
          <button onClick={register}>注册</button>
          <button onClick={login}>登录</button>
          <button className="dark-button" onClick={() => setToken("")}>
            退出
          </button>
        </div>
        <p className="message">{message}</p>
      </section>

      <section className="controls">
        <label>
          城市
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="all">全部城市</option>
            {cities.map(function (cityName) {
              return (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              );
            })}
          </select>
        </label>

        <label>
          搜索
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="例如：寺庙、美食、夜景"
          />
        </label>
      </section>

      <main className="layout">
        <section>
          <div className="section-title">
            <h2>地点</h2>
            <span>{filteredSpots.length} 个地点</span>
          </div>
          <div className="card-list">
            {filteredSpots.length === 0 ? (
              <p className="muted">没有找到匹配的地点。</p>
            ) : (
              filteredSpots.map(function (spot) {
                const isSaved = favorites.includes(spot.id);

                return (
                  <article className="spot-card" key={spot.id}>
                    <h3>{spot.name}</h3>
                    <div className="meta">{spot.city}</div>
                    <p>{spot.description}</p>
                    <button
                      className={isSaved ? "saved" : ""}
                      onClick={() => toggleFavorite(spot.id)}
                    >
                      {isSaved ? "已收藏" : "收藏"}
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="map-column">
          <div className="map-box" ref={mapElement}></div>
          <aside>
            <h2>我的收藏</h2>
            {favoriteSpots.length === 0 ? (
              <p className="muted">登录后可以保存收藏。</p>
            ) : (
              <ul>
                {favoriteSpots.map(function (spot) {
                  return <li key={spot.id}>{spot.name + " - " + spot.city}</li>;
                })}
              </ul>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

async function api<T>(path: string, options: ApiOptions = {}, token = ""): Promise<T> {
  const response = await fetch(API_BASE + path, {
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "操作失败";
}

const root = document.querySelector("#root");

if (!root) {
  throw new Error("缺少 root 节点");
}

createRoot(root).render(<App />);
