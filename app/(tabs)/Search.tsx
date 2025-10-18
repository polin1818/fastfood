import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";// 👈 Icône de recherche
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../../utils/supabase";

import { getAfricanRecipes } from "../api/edamam";
import { getDessertRecipes } from "../api/mealdb";
import {
  getPopularRecipes,
  getQuickRecipes,
  searchSpoonacularRecipes,
} from "../api/spoonacular";

interface Recipe {
  id?: string | number;
  label: string;
  image: string;
  category?: string;
  duration?: number;
  fromSupabase?: boolean;
}

const Search = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const category = route.params?.category;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Toutes");

  useEffect(() => {
    loadAllRecipes();
  }, []);

  // 🔹 Charger toutes les recettes (BD + API)
  const loadAllRecipes = async () => {
    try {
      setLoading(true);
      let combined: Recipe[] = [];

      // Supabase
      const { data: local, error } = await supabase.from("recettes").select("*");
      if (error) console.error(error);

      if (local?.length) {
        combined.push(
          ...local.map((r: any) => ({
            id: r.id,
            label: r.title,
            image: r.image_url,
            fromSupabase: true,
            category: r.category || "Déjeuner",
            duration: r.duration || Math.floor(Math.random() * 60) + 15,
          }))
        );
      }

      // API Edamam
      const african = await getAfricanRecipes();
      if (african?.hits) {
        combined.push(
          ...african.hits.map((hit: any) => ({
            label: hit.recipe.label,
            image: hit.recipe.image,
            category: ["Petit déjeuner", "Déjeuner", "Dîner"][
              Math.floor(Math.random() * 3)
            ],
            duration: Math.floor(Math.random() * 60) + 15,
          }))
        );
      }

      // API Dessert
      const dessert = await getDessertRecipes();
      if (dessert?.meals) {
        combined.push(
          ...dessert.meals.map((m: any) => ({
            id: m.idMeal,
            label: m.strMeal,
            image: m.strMealThumb,
            category: "Dessert",
            duration: Math.floor(Math.random() * 60) + 15,
          }))
        );
      }

      // API Popular
      const popular = await getPopularRecipes();
      if (popular?.recipes) {
        combined.push(
          ...popular.recipes.map((r: any) => ({
            id: r.id,
            label: r.title,
            image: r.image,
            category: ["Petit déjeuner", "Déjeuner", "Dîner"][
              Math.floor(Math.random() * 3)
            ],
            duration: Math.floor(Math.random() * 60) + 15,
          }))
        );
      }

      setRecipes(combined);
      setAllRecipes(combined);
    } catch (err) {
      console.error("Erreur :", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Recherche
  const handleSearch = async () => {
    if (!query.trim()) {
      setRecipes(allRecipes);
      return;
    }

    const search = allRecipes.filter((r) =>
      r.label.toLowerCase().includes(query.toLowerCase())
    );
    setRecipes(search);
  };

  // 🎯 Filtres
  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);

    if (filter === "Toutes") {
      setRecipes(allRecipes);
      return;
    }

    if (filter === "30 min") {
      setRecipes(allRecipes.filter((r) => r.duration && r.duration <= 30));
    } else if (filter === "1h") {
      setRecipes(
        allRecipes.filter((r) => r.duration && r.duration > 30 && r.duration <= 60)
      );
    } else {
      setRecipes(allRecipes.filter((r) => r.category === filter));
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.label}</Text>
      {item.duration && <Text style={styles.duration}>{item.duration} min</Text>}
      {item.fromSupabase && <Text style={styles.local}>🇨🇲 Local</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🔍 Barre de recherche améliorée */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Rechercher une recette..."
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {["Toutes", "Petit déjeuner", "Déjeuner", "Dîner", "30 min", "1h"].map(
          (filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => applyFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Liste des recettes */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item, i) => item.id?.toString() || i.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {!loading && recipes.length === 0 && (
        <Text style={styles.noResult}>Aucune recette trouvée 😢</Text>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },

  // 🔍 Recherche améliorée
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  iconButton: {
    backgroundColor: "#FF6347",
    borderRadius: 12,
    padding: 10,
    marginLeft: 8,
  },

  filters: { flexGrow: 0, marginBottom: 12 },
  filterButton: {
    borderWidth: 1,
    borderColor: "#FF6347",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilter: { backgroundColor: "#FF6347" },
  filterText: { color: "#FF6347", fontWeight: "600" },
  activeFilterText: { color: "#fff" },

  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    elevation: 2,
  },
  image: { width: "100%", height: 130 },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },
  duration: { fontSize: 12, color: "#666", marginBottom: 4 },
  local: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#FF6347",
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 5,
  },
  noResult: {
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
    color: "#666",
  },
});
