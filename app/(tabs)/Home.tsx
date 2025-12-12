// Home.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { supabase } from "../../utils/supabase"; // adapte le path si besoin

// Import APIs (tes wrappers existants)
import { getAfricanRecipes } from "../api/edamam";
import { getDessertRecipes } from "../api/mealdb";
import {
  getPopularRecipes,
  searchSpoonacularRecipes,
} from "../api/spoonacular";

// ---------------------- Types ----------------------
type Recipe = {
  id: string; // uniﬁed id (string)
  uri?: string; // edamam
  label: string;
  title?: string;
  image?: string | null;
  source?: string;
  url?: string | null;
  raw?: any; // raw original object if besoin
};

// State par section (pagination locale)
type SectionState = {
  items: Recipe[]; // tous les items chargés côté client
  visibleCount: number; // combien afficher actuellement
  loading: boolean; // chargement initial / pagination
  error?: string | null;
  finished: boolean; // plus rien à charger
};

// ---------------------- Helpers ----------------------
const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/300x200.png?text=No+Image";

const normalizeFromEdamamHit = (hit: any): Recipe => {
  const r = hit?.recipe ?? hit;
  const uri = r.uri ?? r.url ?? JSON.stringify(r.label || r.title || Math.random());
  return {
    id: (uri || Math.random()).toString(),
    uri: uri,
    label: r.label || r.title || "Recette",
    image: r.image || null,
    source: r.source || r.sourceName || null,
    url: r.url || null,
    raw: r,
  };
};

const normalizeFromMealDB = (m: any): Recipe => {
  return {
    id: (m.idMeal ?? m.id ?? m.strMeal ?? Math.random()).toString(),
    label: m.strMeal ?? m.name ?? "Recette",
    image: m.strMealThumb ?? m.thumbnail ?? null,
    source: m.strArea ?? null,
    url: null,
    raw: m,
  };
};

const normalizeFromSpoonacular = (r: any): Recipe => {
  return {
    id: (r.id ?? r.recipeId ?? Math.random()).toString(),
    label: r.title ?? r.name ?? "Recette",
    image: r.image ?? r.imageUrl ?? null,
    source: r.sourceName ?? null,
    url: r.sourceUrl ?? null,
    raw: r,
  };
};

const normalizeFromSupabase = (r: any): Recipe => {
  return {
    id: (r.id ?? r.uuid ?? Math.random()).toString(),
    label: r.title ?? r.name ?? "Recette",
    image: r.image_url ?? r.image ?? null,
    source: r.source ?? "Local",
    url: r.url ?? null,
    raw: r,
  };
};

// Paginate local array: return next chunk
const paginateLocal = (arr: Recipe[], visibleCount: number, chunk = 6) =>
  arr.slice(0, Math.min(arr.length, visibleCount + chunk));

// ---------------------- Home Component ----------------------
const Home: React.FC = () => {
  const navigation = useNavigation();

  // Sections : africain, dessert, international, populaires, quick, nouveaux (BD)
  const [africain, setAfricain] = useState<SectionState>({
    items: [],
    visibleCount: 6,
    loading: true,
    error: null,
    finished: false,
  });
  const [dessert, setDessert] = useState<SectionState>({
    items: [],
    visibleCount: 6,
    loading: true,
    error: null,
    finished: false,
  });
  const [international, setInternational] = useState<SectionState>({
    items: [],
    visibleCount: 6,
    loading: true,
    error: null,
    finished: false,
  });
  const [popular, setPopular] = useState<SectionState>({
    items: [],
    visibleCount: 6,
    loading: true,
    error: null,
    finished: false,
  });
  const [quick, setQuick] = useState<SectionState>({
    items: [],
    visibleCount: 6,
    loading: true,
    error: null,
    finished: false,
  });
  const [nouveaux, setNouveaux] = useState<SectionState>({
    items: [],
    visibleCount: 6,
    loading: true,
    error: null,
    finished: false,
  });

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Tips
  const tips = [
    "💡 Pour un gâteau plus moelleux, ajoutez un yaourt nature.",
    "💡 Salez l’eau des pâtes seulement à ébullition pour une cuisson parfaite.",
    "💡 Ajoutez un filet de citron sur vos fruits pour éviter qu’ils brunissent.",
    "💡 Pour une viande tendre, laissez-la reposer après cuisson.",
    "💡 Congelez vos herbes fraîches dans de l’huile d’olive pour les conserver plus longtemps.",
  ];
  const todayTip = tips[new Date().getDate() % tips.length];

  // ---------- Loaders initiaux (fetch once per source, then paginate local) ----------
  useEffect(() => {
    loadAfricain();
    loadDessert();
    loadInternational();
    loadPopular();
    loadQuick();
    loadNouveaux();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AFRICA
  const loadAfricain = async () => {
    try {
      setAfricain((s) => ({ ...s, loading: true, error: null }));
      const data = await getAfricanRecipes(); // wrapper de ton code
      if (!mountedRef.current) return;
      if (!data || !data.hits) {
        setAfricain((s) => ({ ...s, loading: false, error: "Aucune donnée" }));
        return;
      }
      const normalized = data.hits.map((h: any) => normalizeFromEdamamHit(h));
      setAfricain((s) => ({
        ...s,
        items: normalized,
        loading: false,
        finished: normalized.length === 0,
      }));
    } catch (err: any) {
      console.error("Err loadAfricain", err);
      if (!mountedRef.current) return;
      setAfricain((s) => ({ ...s, loading: false, error: err.message || "Erreur" }));
    }
  };

  // DESSERT (MealDB)
  const loadDessert = async () => {
    try {
      setDessert((s) => ({ ...s, loading: true, error: null }));
      const data = await getDessertRecipes();
      if (!mountedRef.current) return;
      if (!data || !data.meals) {
        setDessert((s) => ({ ...s, loading: false, error: "Aucune donnée" }));
        return;
      }
      const normalized = data.meals.map((m: any) => normalizeFromMealDB(m));
      setDessert((s) => ({
        ...s,
        items: normalized,
        loading: false,
        finished: normalized.length === 0,
      }));
    } catch (err: any) {
      console.error("Err loadDessert", err);
      if (!mountedRef.current) return;
      setDessert((s) => ({ ...s, loading: false, error: err.message || "Erreur" }));
    }
  };

  // INTERNATIONAL (Spoonacular search pasta/chicken)
  const loadInternational = async () => {
    try {
      setInternational((s) => ({ ...s, loading: true, error: null }));
      const data = await searchSpoonacularRecipes("pasta, chicken");
      if (!mountedRef.current) return;
      const results = data?.results ?? [];
      const normalized = results.map((r: any) => normalizeFromSpoonacular(r));
      setInternational((s) => ({
        ...s,
        items: normalized,
        loading: false,
        finished: normalized.length === 0,
      }));
    } catch (err: any) {
      console.error("Err loadInternational", err);
      if (!mountedRef.current) return;
      setInternational((s) => ({ ...s, loading: false, error: err.message || "Erreur" }));
    }
  };

  // POPULAR (Spoonacular random)
  const loadPopular = async () => {
    try {
      setPopular((s) => ({ ...s, loading: true, error: null }));
      const data = await getPopularRecipes();
      if (!mountedRef.current) return;
      const results = data?.recipes ?? [];
      const normalized = results.map((r: any) => normalizeFromSpoonacular(r));
      setPopular((s) => ({
        ...s,
        items: normalized,
        loading: false,
        finished: normalized.length === 0,
      }));
    } catch (err: any) {
      console.error("Err loadPopular", err);
      if (!mountedRef.current) return;
      setPopular((s) => ({ ...s, loading: false, error: err.message || "Erreur" }));
    }
  };

  // QUICK (search spoonacular quick)
  const loadQuick = async () => {
    try {
      setQuick((s) => ({ ...s, loading: true, error: null }));
      const data = await searchSpoonacularRecipes("quick");
      if (!mountedRef.current) return;
      const results = data?.results ?? [];
      const normalized = results.map((r: any) => normalizeFromSpoonacular(r));
      setQuick((s) => ({
        ...s,
        items: normalized,
        loading: false,
        finished: normalized.length === 0,
      }));
    } catch (err: any) {
      console.error("Err loadQuick", err);
      if (!mountedRef.current) return;
      setQuick((s) => ({ ...s, loading: false, error: err.message || "Erreur" }));
    }
  };

  // NOUVEAUX (Supabase)
  const loadNouveaux = async () => {
    try {
      setNouveaux((s) => ({ ...s, loading: true, error: null }));
      const { data, error } = await supabase
        .from("recettes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50); // on fetche 50 puis paginate localement

      if (error) throw error;
      if (!data) {
        setNouveaux((s) => ({ ...s, loading: false, error: "Aucune recette" }));
        return;
      }
      const normalized = data.map((r: any) => normalizeFromSupabase(r));
      setNouveaux((s) => ({
        ...s,
        items: normalized,
        loading: false,
        finished: normalized.length === 0,
      }));
    } catch (err: any) {
      console.error("Err loadNouveaux", err);
      if (!mountedRef.current) return;
      setNouveaux((s) => ({ ...s, loading: false, error: err.message || "Erreur" }));
    }
  };

  // ---------- Pagination par section lorsqu'on scroll la section ----------
  const onEndReachedSection = (sectionName: string) => {
    switch (sectionName) {
      case "africain":
        setAfricain((s) => {
          if (s.finished) return s;
          const nextItems = paginateLocal(s.items, s.visibleCount, 6);
          return {
            ...s,
            visibleCount: Math.min(nextItems.length, s.items.length),
            finished: nextItems.length >= s.items.length,
          };
        });
        break;
      case "dessert":
        setDessert((s) => {
          if (s.finished) return s;
          const nextItems = paginateLocal(s.items, s.visibleCount, 6);
          return {
            ...s,
            visibleCount: Math.min(nextItems.length, s.items.length),
            finished: nextItems.length >= s.items.length,
          };
        });
        break;
      case "international":
        setInternational((s) => {
          if (s.finished) return s;
          const nextItems = paginateLocal(s.items, s.visibleCount, 6);
          return {
            ...s,
            visibleCount: Math.min(nextItems.length, s.items.length),
            finished: nextItems.length >= s.items.length,
          };
        });
        break;
      case "popular":
        setPopular((s) => {
          if (s.finished) return s;
          const nextItems = paginateLocal(s.items, s.visibleCount, 6);
          return {
            ...s,
            visibleCount: Math.min(nextItems.length, s.items.length),
            finished: nextItems.length >= s.items.length,
          };
        });
        break;
      case "quick":
        setQuick((s) => {
          if (s.finished) return s;
          const nextItems = paginateLocal(s.items, s.visibleCount, 6);
          return {
            ...s,
            visibleCount: Math.min(nextItems.length, s.items.length),
            finished: nextItems.length >= s.items.length,
          };
        });
        break;
      case "nouveaux":
        setNouveaux((s) => {
          if (s.finished) return s;
          const nextItems = paginateLocal(s.items, s.visibleCount, 6);
          return {
            ...s,
            visibleCount: Math.min(nextItems.length, s.items.length),
            finished: nextItems.length >= s.items.length,
          };
        });
        break;
      default:
        break;
    }
  };

  // Render card
  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const uri = item.image ?? PLACEHOLDER_IMAGE;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        <Text style={styles.name} numberOfLines={2}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // small helper to render section header + list
  const Section = ({
    title,
    state,
    onEndReached,
    horizontal = false,
  }: {
    title: string;
    state: SectionState;
    onEndReached: () => void;
    horizontal?: boolean;
  }) => {
    // show only visibleCount items
    const visibleItems = state.items.slice(0, state.visibleCount);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {state.loading ? (
          <ActivityIndicator size="small" color="#FF6347" />
        ) : state.error ? (
          <Text style={{ color: "red" }}>{state.error}</Text>
        ) : (
          <FlatList
            data={visibleItems}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            numColumns={horizontal ? 1 : 2}
            horizontal={horizontal}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={horizontal} // horizontals are scrollable, vertical columns not
            onEndReached={() => {
              if (!state.finished) onEndReached();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              state.loading ? <ActivityIndicator size="small" color="#FF6347" /> : null
            }
            contentContainerStyle={{ paddingBottom: 6 }}
          />
        )}

        {!state.loading && !state.finished && state.items.length > state.visibleCount && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              // charger plus immédiatement (fallback si onEndReached pas déclenché)
              onEndReached();
            }}
          >
            <Text style={styles.moreText}>Voir plus</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---------- Render ----------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>
        👩‍🍳 Bienvenue sur <Text style={styles.brand}>RecetteAfrique</Text> 🌍{"\n"}
        Laissez-vous inspirer par nos recettes africaines, internationales et sucrées 🍰 !
      </Text>

      {/* Recette du jour (premier africain si dispo) */}
      <View style={styles.highlight}>
        <Text style={styles.sectionTitle}>🔥 Recette du jour</Text>
        {africain.items.length > 0 ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("RecipeDetail", { recipe: africain.items[0] })}
          >
            <Image
              source={{ uri: africain.items[0].image ?? PLACEHOLDER_IMAGE }}
              style={styles.highlightImage}
            />
            <Text style={styles.highlightText}>{africain.items[0].label}</Text>
            <Text style={styles.viewRecipe}>[ Voir recette ]</Text>
          </TouchableOpacity>
        ) : africain.loading ? (
          <ActivityIndicator size="small" color="#FF6347" />
        ) : (
          <Text>Aucune recette du jour.</Text>
        )}
      </View>

      {/* Sections: Nouveautés, Africaines, Internationales, Desserts, Populaires, Rapides */}
      <Section
        title="🆕 Nouveautés"
        state={nouveaux}
        onEndReached={() => onEndReachedSection("nouveaux")}
      />

      <Section
        title="🍲 Recettes Africaines"
        state={africain}
        onEndReached={() => onEndReachedSection("africain")}
      />

      <Section
        title="🌐 Recettes Internationales"
        state={international}
        onEndReached={() => onEndReachedSection("international")}
      />

      <Section
        title="🍰 Gâteaux & Desserts"
        state={dessert}
        onEndReached={() => onEndReachedSection("dessert")}
      />

      <Section
        title="🔥 Populaires"
        state={popular}
        onEndReached={() => onEndReachedSection("popular")}
        horizontal={true}
      />

      <Section
        title="⚡ Rapides & Faciles"
        state={quick}
        onEndReached={() => onEndReachedSection("quick")}
        horizontal={true}
      />

      {/* Astuce du jour */}
      <View style={styles.tip}>
        <Text style={styles.tipTitle}>💡 Astuce du jour</Text>
        <Text style={styles.tipText}>{todayTip}</Text>
      </View>
    </ScrollView>
  );
};

export default Home;

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  welcome: { fontSize: 18, fontWeight: "600", marginVertical: 10, textAlign: "center" },
  brand: { color: "#FF6347", fontWeight: "bold" },

  highlight: { marginVertical: 10 },
  highlightImage: { width: "100%", height: 200, borderRadius: 12 },
  highlightText: { fontSize: 20, fontWeight: "bold", marginTop: 8, textAlign: "center" },
  viewRecipe: { color: "#FF6347", textAlign: "center", marginTop: 4, fontWeight: "bold" },

  section: { marginVertical: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    elevation: 2,
    maxWidth: "48%",
  },
  image: { width: "100%", height: 120 },
  name: { fontSize: 14, fontWeight: "600", margin: 6, textAlign: "center" },

  moreButton: {
    backgroundColor: "#FF6347",
    padding: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
    width: 120,
  },
  moreText: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  tip: { backgroundColor: "#FFF4E6", padding: 14, borderRadius: 10, marginTop: 18, marginBottom: 40 },
  tipTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  tipText: { fontSize: 16, fontStyle: "italic" },

  highlightTextSmall: { fontSize: 16, fontWeight: "600" },
});
