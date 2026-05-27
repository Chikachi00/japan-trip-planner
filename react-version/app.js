const { useEffect, useMemo, useState } = React;

function App() {
  const [spots, setSpots] = useState([]);
  const [city, setCity] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [favorites, setFavorites] = useState(function () {
    const savedText = localStorage.getItem("reactFavoriteSpots");
    return savedText ? JSON.parse(savedText) : [];
  });

  useEffect(function () {
    fetch("spots.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        setSpots(data);
      });
  }, []);

  useEffect(
    function () {
      localStorage.setItem("reactFavoriteSpots", JSON.stringify(favorites));
    },
    [favorites]
  );

  const cities = useMemo(
    function () {
      const cityList = [];
      spots.forEach(function (spot) {
        if (!cityList.includes(spot.city)) {
          cityList.push(spot.city);
        }
      });
      return cityList;
    },
    [spots]
  );

  const filteredSpots = spots.filter(function (spot) {
    const matchesCity = city === "all" || spot.city === city;
    const text = (spot.name + " " + spot.city + " " + spot.description).toLowerCase();
    const matchesKeyword = text.includes(keyword.trim().toLowerCase());
    return matchesCity && matchesKeyword;
  });

  function toggleFavorite(spotId) {
    if (favorites.includes(spotId)) {
      setFavorites(
        favorites.filter(function (id) {
          return id !== spotId;
        })
      );
    } else {
      setFavorites(favorites.concat(spotId));
    }
  }

  const favoriteSpots = favorites
    .map(function (spotId) {
      return spots.find(function (spot) {
        return spot.id === spotId;
      });
    })
    .filter(Boolean);

  return React.createElement(
    "div",
    { className: "page" },
    React.createElement(
      "header",
      null,
      React.createElement("h1", null, "React 版日本旅行规划器"),
      React.createElement("p", null, "用 React state 管理筛选、搜索和收藏。")
    ),
    React.createElement(
      "section",
      { className: "controls" },
      React.createElement(
        "label",
        null,
        "城市",
        React.createElement(
          "select",
          {
            value: city,
            onChange: function (event) {
              setCity(event.target.value);
            },
          },
          React.createElement("option", { value: "all" }, "全部城市"),
          cities.map(function (cityName) {
            return React.createElement("option", { key: cityName, value: cityName }, cityName);
          })
        )
      ),
      React.createElement(
        "label",
        null,
        "搜索",
        React.createElement("input", {
          type: "search",
          placeholder: "例如：寺庙、美食、夜景",
          value: keyword,
          onChange: function (event) {
            setKeyword(event.target.value);
          },
        })
      )
    ),
    React.createElement(
      "main",
      { className: "layout" },
      React.createElement(
        "section",
        null,
        React.createElement(
          "div",
          { className: "section-title" },
          React.createElement("h2", null, "地点"),
          React.createElement("span", { id: "placeCount" }, filteredSpots.length + " 个地点")
        ),
        React.createElement(
          "div",
          { className: "card-list" },
          filteredSpots.length === 0
            ? React.createElement("p", { className: "muted" }, "没有找到匹配的地点。")
            : filteredSpots.map(function (spot) {
                const isSaved = favorites.includes(spot.id);
                return React.createElement(
                  "article",
                  { className: "spot-card", key: spot.id },
                  React.createElement("h3", null, spot.name),
                  React.createElement("div", { className: "meta" }, spot.city),
                  React.createElement("p", null, spot.description),
                  React.createElement(
                    "button",
                    {
                      className: isSaved ? "saved" : "",
                      onClick: function () {
                        toggleFavorite(spot.id);
                      },
                    },
                    isSaved ? "已收藏" : "收藏"
                  )
                );
              })
        )
      ),
      React.createElement(
        "aside",
        null,
        React.createElement(
          "div",
          { className: "section-title" },
          React.createElement("h2", null, "收藏"),
          React.createElement(
            "button",
            {
              id: "clearFavorites",
              onClick: function () {
                setFavorites([]);
              },
            },
            "清空"
          )
        ),
        React.createElement(
          "ul",
          { id: "favoritesList" },
          favoriteSpots.map(function (spot) {
            return React.createElement("li", { key: spot.id }, spot.name + " - " + spot.city);
          })
        ),
        favoriteSpots.length === 0
          ? React.createElement("p", { className: "muted" }, "还没有收藏地点。")
          : null
      )
    )
  );
}

ReactDOM.createRoot(document.querySelector("#root")).render(React.createElement(App));
