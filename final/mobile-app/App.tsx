import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

const API_BASE = "http://localhost:3001";
const TOKEN_KEY = "finalMobileTripToken";

export default function App() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedCity, setSelectedCity] = useState("全部城市");
  const [keyword, setKeyword] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(function () {
    api<{ spots: Spot[] }>("/api/spots").then(function (data) {
      setSpots(data.spots);
    });

    AsyncStorage.getItem(TOKEN_KEY).then(function (savedToken) {
      if (savedToken) {
        setToken(savedToken);
        loadCurrentUser(savedToken);
      }
    });
  }, []);

  const cities = useMemo(
    function () {
      const cityList = ["全部城市"];

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
    const matchesCity = selectedCity === "全部城市" || spot.city === selectedCity;
    const text = (spot.name + " " + spot.city + " " + spot.description).toLowerCase();
    const matchesKeyword = text.includes(keyword.trim().toLowerCase());
    return matchesCity && matchesKeyword;
  });

  async function loadCurrentUser(currentToken: string) {
    try {
      const user = await api<{ username: string }>("/api/me", {}, currentToken);
      const favoriteData = await api<{ favorites: string[] }>("/api/favorites", {}, currentToken);
      setUsername(user.username);
      setFavorites(favoriteData.favorites);
    } catch (error) {
      setToken("");
      await AsyncStorage.removeItem(TOKEN_KEY);
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
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await loadCurrentUser(data.token);
      setMessage("登录成功。");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function logout() {
    setToken("");
    setUsername("");
    setFavorites([]);
    await AsyncStorage.removeItem(TOKEN_KEY);
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

  const favoriteNames = favorites
    .map(function (spotId) {
      return spots.find(function (spot) {
        return spot.id === spotId;
      });
    })
    .filter(function (spot): spot is Spot {
      return spot !== undefined;
    })
    .map(function (spot) {
      return spot.name;
    });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Final 日本旅行规划器</Text>
        <Text style={styles.subtitle}>{username ? "已登录：" + username : "未登录"}</Text>

        <View style={styles.authBox}>
          <TextInput style={styles.input} value={loginName} onChangeText={setLoginName} placeholder="用户名" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="密码"
            secureTextEntry
          />
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={register}>
              <Text style={styles.buttonText}>注册</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={login}>
              <Text style={styles.buttonText}>登录</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.darkButton]} onPress={logout}>
              <Text style={styles.buttonText}>退出</Text>
            </Pressable>
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>

        <TextInput
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索寺庙、美食、夜景"
        />

        <FlatList
          horizontal
          data={cities}
          keyExtractor={(item) => item}
          renderItem={function ({ item }) {
            const isSelected = item === selectedCity;
            return (
              <Pressable
                style={[styles.cityChip, isSelected && styles.cityChipSelected]}
                onPress={() => setSelectedCity(item)}
              >
                <Text style={[styles.cityText, isSelected && styles.cityTextSelected]}>{item}</Text>
              </Pressable>
            );
          }}
          showsHorizontalScrollIndicator={false}
          style={styles.cityList}
        />

        <Text style={styles.count}>{filteredSpots.length} 个地点</Text>

        <FlatList
          data={filteredSpots}
          keyExtractor={(spot) => spot.id}
          renderItem={function ({ item }) {
            const isSaved = favorites.includes(item.id);
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.meta}>{item.city + " · " + item.lat + ", " + item.lng}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Pressable
                  style={[styles.button, isSaved && styles.savedButton]}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Text style={styles.buttonText}>{isSaved ? "已收藏" : "收藏"}</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.meta}>没有找到匹配的地点。</Text>}
        />

        <View style={styles.favoritesBox}>
          <Text style={styles.favoriteTitle}>收藏</Text>
          <Text style={styles.meta}>
            {favoriteNames.length > 0 ? favoriteNames.join("、") : "登录后可以保存收藏。"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f0ea",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: "#666",
  },
  authBox: {
    gap: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    padding: 12,
    backgroundColor: "white",
    borderColor: "#ddd6cc",
    borderWidth: 1,
    borderRadius: 8,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#e76f51",
    borderRadius: 6,
  },
  darkButton: {
    backgroundColor: "#555",
  },
  savedButton: {
    backgroundColor: "#2a9d8f",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  message: {
    minHeight: 20,
    color: "#b54b36",
  },
  cityList: {
    maxHeight: 44,
    marginVertical: 14,
  },
  cityChip: {
    height: 36,
    marginRight: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 18,
  },
  cityChipSelected: {
    backgroundColor: "#264653",
  },
  cityText: {
    color: "#333",
  },
  cityTextSelected: {
    color: "white",
  },
  count: {
    marginBottom: 10,
    color: "#666",
  },
  card: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: "white",
    borderColor: "#ddd6cc",
    borderWidth: 1,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    marginTop: 4,
    color: "#666",
  },
  description: {
    marginTop: 8,
    color: "#333",
    lineHeight: 22,
  },
  favoritesBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
  },
  favoriteTitle: {
    fontWeight: "700",
  },
});
