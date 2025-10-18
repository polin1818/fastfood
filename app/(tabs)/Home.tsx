import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../utils/supabase"; // Assure-toi d'avoir Supabase configuré

// Import APIs
import { getAfricanRecipes } from "../api/edamam";
import { getDessertRecipes } from "../api/mealdb";
import { getPopularRecipes, getQuickRecipes, searchSpoonacularRecipes } from "../api/spoonacular";

// TypeScript interface
interface Recipe {
  uri?: string;
  id?: string | number;
  label: string;
  title?: string;
  image: string;
  source?: string;
  url?: string;
}

const Home = () => {
  const [africanRecipes, setAfricanRecipes] = useState<Recipe[]>([]);
  const [dessertRecipes, setDessertRecipes] = useState<Recipe[]>([]);
  const [internationalRecipes, setInternationalRecipes] = useState<Recipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [quickRecipes, setQuickRecipes] = useState<Recipe[]>([]);
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]); // Nouveautés BD
  const [loading, setLoading] = useState<boolean>(true);

  const navigation = useNavigation();

  // Astuces du jour
  const tips = [
    "💡 Pour un gâteau plus moelleux, ajoutez un yaourt nature.",
    "💡 Salez l’eau des pâtes seulement à ébullition pour une cuisson parfaite.",
    "💡 Ajoutez un filet de citron sur vos fruits pour éviter qu’ils brunissent.",
    "💡 Pour une viande tendre, laissez-la reposer après cuisson.",
    "💡 Congelez vos herbes fraîches dans de l’huile d’olive pour les conserver plus longtemps.",
  ];
  const todayTip = tips[new Date().getDate() % tips.length];

  useEffect(() => {
    loadAllRecipes();
  }, []);

  const loadAllRecipes = async () => {
    try {
      setLoading(true);

      // Africaines
      const africanData = await getAfricanRecipes();
      if (africanData.hits) {
        setAfricanRecipes(
          africanData.hits.map((hit: any) => ({
            uri: hit.recipe.uri,
            label: hit.recipe.label,
            image: hit.recipe.image,
            source: hit.recipe.source,
            url: hit.recipe.url,
          }))
        );
      }

      // Desserts
      const dessertData = await getDessertRecipes();
      if (dessertData.meals) {
        setDessertRecipes(
          dessertData.meals.map((m: any) => ({
            id: m.idMeal,
            label: m.strMeal,
            image: m.strMealThumb,
          }))
        );
      }

      // Internationales
      const intlData = await searchSpoonacularRecipes("pasta, chicken");
      if (intlData.results) {
        setInternationalRecipes(
          intlData.results.map((r: any) => ({
            id: r.id,
            label: r.title,
            image: r.image,
          }))
        );
      }

      // Populaires
      const popularData = await getPopularRecipes();
      if (popularData.recipes) {
        setPopularRecipes(
          popularData.recipes.map((r: any) => ({
            id: r.id,
            label: r.title,
            image: r.image,
          }))
        );
      }

      // Rapides & Faciles
      const quickData = await searchSpoonacularRecipes("quick");
      if (quickData.results) {
        setQuickRecipes(
          quickData.results.map((r: any) => ({
            id: r.id,
            label: r.title,
            image: r.image,
          }))
        );
      }

      // --- Nouveautés depuis BD ---
      try {
        const { data, error } = await supabase
          .from("recettes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data) {
          setNewRecipes(
            data.map((r: any) => ({
              id: r.id,
              label: r.title,
              image: r.image_url,
              source: "Afrique",
              url: r.url,
            }))
          );
        }
      } catch (err) {
        console.error("Erreur chargement nouveautés :", err);
      }

    } catch (error) {
      console.error("Erreur lors du chargement des recettes :", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={2}>{item.label}</Text>
    </TouchableOpacity>
  );

  const handleVoirPlus = (category: string) => {
    navigation.navigate("Search", { category });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Message d'accueil */}
      <Text style={styles.welcome}>
        👩‍🍳 Bienvenue sur <Text style={styles.brand}>RecetteAfrique</Text> 🌍{"\n"}
        Laissez-vous inspirer par nos recettes africaines, internationales et sucrées 🍰 !
      </Text>

      {/* Recette du jour */}
      <View style={styles.highlight}>
        <Text style={styles.sectionTitle}>🔥 Recette du jour</Text>
        {africanRecipes[0] && (
          <TouchableOpacity
            onPress={() => navigation.navigate("RecipeDetail", { recipe: africanRecipes[0] })}
          >
            <Image source={{ uri: africanRecipes[0].image }} style={styles.highlightImage} />
            <Text style={styles.highlightText}>{africanRecipes[0].label}</Text>
            <Text style={styles.viewRecipe}>[ Voir recette ]</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nouveautés */}
      {newRecipes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆕 Nouveautés</Text>
          <FlatList
            data={newRecipes.slice(0, 10)}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            numColumns={2}
            scrollEnabled={false}
          />
          <TouchableOpacity style={styles.moreButton} onPress={() => handleVoirPlus("Nouveautés")}>
            <Text style={styles.moreText}>Voir plus</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recettes Africaines */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍲 Recettes Africaines</Text>
        <FlatList
          data={africanRecipes.slice(0, 10)}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.uri || item.id?.toString() || Math.random().toString()}
          numColumns={2}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.moreButton} onPress={() => handleVoirPlus("African")}>
          <Text style={styles.moreText}>Voir plus</Text>
        </TouchableOpacity>
      </View>

      {/* Recettes Internationales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Recettes Internationales</Text>
        <FlatList
          data={internationalRecipes.slice(0, 10)}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.moreButton} onPress={() => handleVoirPlus("International")}>
          <Text style={styles.moreText}>Voir plus</Text>
        </TouchableOpacity>
      </View>

      {/* Gâteaux & Desserts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍰 Gâteaux & Desserts</Text>
        <FlatList
          data={dessertRecipes.slice(0, 10)}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.moreButton} onPress={() => handleVoirPlus("Dessert")}>
          <Text style={styles.moreText}>Voir plus</Text>
        </TouchableOpacity>
      </View>

      {/* Populaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Populaires</Text>
        <FlatList
          data={popularRecipes.slice(0, 5)}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        <TouchableOpacity style={styles.moreButton} onPress={() => handleVoirPlus("Popular")}>
          <Text style={styles.moreText}>Voir plus</Text>
        </TouchableOpacity>
      </View>

      {/* Rapides & Faciles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Rapides & Faciles</Text>
        <FlatList
          data={quickRecipes.slice(0, 5)}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        <TouchableOpacity style={styles.moreButton} onPress={() => handleVoirPlus("Quick")}>
          <Text style={styles.moreText}>Voir plus</Text>
        </TouchableOpacity>
      </View>

      {/* Astuce du jour */}
      <View style={styles.tip}>
        <Text style={styles.tipTitle}>💡 Astuce du jour</Text>
        <Text style={styles.tipText}>{todayTip}</Text>
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { fontSize: 18, fontWeight: "600", marginVertical: 10, textAlign: "center" },
  brand: { color: "#FF6347", fontWeight: "bold" },

  highlight: { marginVertical: 15 },
  highlightImage: { width: "100%", height: 200, borderRadius: 10 },
  highlightText: { fontSize: 20, fontWeight: "bold", marginTop: 8, textAlign: "center" },
  viewRecipe: { color: "#FF6347", textAlign: "center", marginTop: 4, fontWeight: "bold" },

  section: { marginVertical: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    elevation: 3,
  },
  image: { width: "100%", height: 120 },
  name: { fontSize: 14, fontWeight: "600", margin: 5, textAlign: "center" },
  moreButton: { backgroundColor: "#FF6347", padding: 10, borderRadius: 20, alignSelf: "center", marginTop: 10 },
  moreText: { color: "#fff", fontWeight: "bold" },

  tip: { backgroundColor: "#FFF4E6", padding: 15, borderRadius: 10, marginTop: 20 },
  tipTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  tipText: { fontSize: 16, fontStyle: "italic" },
});
