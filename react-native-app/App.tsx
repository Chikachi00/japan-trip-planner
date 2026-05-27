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
import { spots, type Spot } from "./data/spots";

const FAVORITES_KEY = "nativeFavoriteSpots";

export default function App() {
  const [selectedCity, setSelectedCity] = useState("全部城市");
  const [keyword, setKeyword] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(function () {
    AsyncStorage.getItem(FAVORITES_KEY).then(function (savedText) {
      if (savedText) {
        setFavorites(JSON.parse(savedText));
      }
    });
  }, []);

  useEffect(
    function () {
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    },
    [favorites]
  );

  const cities = useMemo(function () {
    const cityList = ["全部城市"];

    spots.forEach(function (spot) {
      if (!cityList.includes(spot.city)) {
        cityList.push(spot.city);
      }
    });

    return cityList;
  }, []);

  const filteredSpots = spots.filter(function (spot) {
    const matchesCity = selectedCity === "全部城市" || spot.city === selectedCity;
    const text = (spot.name + " " + spot.city + " " + spot.description).toLowerCase();
    const matchesKeyword = text.includes(keyword.trim().toLowerCase());

    return matchesCity && matchesKeyword;
  });

  function toggleFavorite(spotId: string) {
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

  function renderSpot({ item }: { item: Spot }) {
    const isSaved = favorites.includes(item.id);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.meta}>{item.city}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Pressable
          style={[styles.button, isSaved && styles.savedButton]}
          onPress={function () {
            toggleFavorite(item.id);
          }}
        >
          <Text style={styles.buttonText}>{isSaved ? "已收藏" : "收藏"}</Text>
        </Pressable>
      </View>
    );
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
        <Text style={styles.title}>日本旅行规划器</Text>
        <Text style={styles.subtitle}>React Native App 版本</Text>

        <TextInput
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索寺庙、美食、夜景"
        />

        <FlatList
          horizontal
          data={cities}
          keyExtractor={function (city) {
            return city;
          }}
          renderItem={function ({ item }) {
            const isSelected = item === selectedCity;

            return (
              <Pressable
                style={[styles.cityChip, isSelected && styles.cityChipSelected]}
                onPress={function () {
                  setSelectedCity(item);
                }}
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
          keyExtractor={function (spot) {
            return spot.id;
          }}
          renderItem={renderSpot}
          ListEmptyComponent={<Text style={styles.empty}>没有找到匹配的地点。</Text>}
        />

        <View style={styles.favoritesBox}>
          <Text style={styles.favoriteTitle}>收藏</Text>
          <Text style={styles.meta}>
            {favoriteNames.length > 0 ? favoriteNames.join("、") : "还没有收藏地点。"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
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
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: "#666",
  },
  input: {
    padding: 12,
    backgroundColor: "white",
    borderColor: "#ddd6cc",
    borderWidth: 1,
    borderRadius: 8,
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
  button: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#e76f51",
    borderRadius: 6,
  },
  savedButton: {
    backgroundColor: "#2a9d8f",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  empty: {
    color: "#666",
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
