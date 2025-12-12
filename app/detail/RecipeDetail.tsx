import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../../utils/supabase";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";

const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

const DetailRecette = () => {
  const route = useRoute();
  const { recipe } = route.params as { recipe: any };

  const [steps, setSteps] = useState<any[]>([]);
  const [author, setAuthor] = useState<string>("Inconnu");
  const [loading, setLoading] = useState(true);

  // Ingrédients
  const ingredients =
    recipe.ingredient_lines && Array.isArray(recipe.ingredient_lines)
      ? recipe.ingredient_lines
      : recipe.raw?.ingredientLines || [];

  // Infos supplémentaires
  const totalTime = recipe.total_time ?? recipe.raw?.totalTime;
  const portions = recipe.yield ?? recipe.raw?.yield;
  const calories = recipe.calories ?? recipe.raw?.calories;
  const category = recipe.category ?? recipe.raw?.category;
  const country = recipe.country ?? recipe.raw?.country;
  const dietLabels = recipe.diet_labels ?? recipe.raw?.dietLabels ?? [];
  const healthLabels = recipe.health_labels ?? recipe.raw?.healthLabels ?? [];

  useEffect(() => {
    const fetchBDData = async () => {
      // Si recette locale BD
      if (recipe.id && isUUID(recipe.id)) {
        try {
          setLoading(true);

          // Étapes
          if (recipe.id && isUUID(recipe.id)) {
            const { data: stepsData, error: stepsError } = await supabase
              .from("steps")
              .select("*")
              .eq("recette_id", recipe.id)
              .order("step_number", { ascending: true });
            if (stepsError) throw stepsError;
            setSteps(stepsData || []);
          }

          // Auteur
          if (recipe.created_by && isUUID(recipe.created_by)) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", recipe.created_by)
              .single();
            if (!profileError && profileData) setAuthor(profileData.full_name);
          }
        } catch (err) {
          console.error("Erreur fetch BD:", err);
        } finally {
          setLoading(false);
        }
      } else {
        // Recette API
        setAuthor(recipe.source || "API Externe");
        setLoading(false);
      }
    };

    fetchBDData();
  }, [recipe]);

  if (!recipe)
    return (
      <View style={styles.center}>
        <Text>Aucune recette reçue</Text>
      </View>
    );

  const img =
    recipe.image ?? recipe.image_url ?? recipe.raw?.image ?? "https://via.placeholder.com/500x300.png?text=Aucune+Image";

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: img }} style={styles.image} />
      <Text style={styles.title}>{recipe.label || recipe.title}</Text>
      <View style={styles.row}>
        <FontAwesome5 name="user" size={16} color="#555" />
        <Text style={styles.author}> {author}</Text>
      </View>

      {recipe.description && (
        <>
          <Text style={styles.section}>
            <MaterialIcons name="description" size={20} color="#FF6347" /> Description
          </Text>
          <Text style={styles.item}>{recipe.description}</Text>
        </>
      )}

      <Text style={styles.section}>
        <Entypo name="bowl" size={20} color="#FF6347" /> Ingrédients
      </Text>
      {ingredients.length > 0 ? (
        ingredients.map((i, idx) => (
          <Text key={idx} style={styles.item}>
            • {i}
          </Text>
        ))
      ) : (
        <Text style={styles.noData}>Aucun ingrédient disponible</Text>
      )}

      <Text style={styles.section}>
        <MaterialIcons name="timer" size={20} color="#FF6347" /> Informations
      </Text>
      <Text style={styles.item}>⏱ Temps : {totalTime ?? "N/A"} min</Text>
      <Text style={styles.item}>🍽 Portions : {portions ?? "N/A"}</Text>
      <Text style={styles.item}>🔥 Calories : {calories ?? "N/A"}</Text>
      <Text style={styles.item}>📂 Catégorie : {category ?? "N/A"}</Text>
      <Text style={styles.item}>🌍 Pays : {country ?? "N/A"}</Text>
      {dietLabels.length > 0 && <Text style={styles.item}>🥗 Labels diététiques : {dietLabels.join(", ")}</Text>}
      {healthLabels.length > 0 && <Text style={styles.item}>💊 Labels santé : {healthLabels.join(", ")}</Text>}

      <Text style={styles.section}>
        <MaterialIcons name="restaurant-menu" size={20} color="#FF6347" /> Étapes
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color="#FF6347" />
      ) : steps.length > 0 ? (
        steps.map((s: any) => (
          <Text key={s.id} style={styles.item}>
            {s.step_number}. {s.instruction}
          </Text>
        ))
      ) : (
        <Text style={styles.noData}>
          {isUUID(recipe.id) ? "Aucune étape enregistrée" : "Étapes non disponibles pour cette recette API"}
        </Text>
      )}
    </ScrollView>
  );
};

export default DetailRecette;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#FAFAFA" },
  image: { width: "100%", height: 250, borderRadius: 12, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "bold", marginVertical: 8, color: "#333" },
  author: { fontSize: 16, fontStyle: "italic", color: "#555" },
  section: { fontSize: 20, marginTop: 20, fontWeight: "bold", color: "#FF6347", marginBottom: 5 },
  item: { fontSize: 16, marginVertical: 3, color: "#444" },
  noData: { color: "gray", marginVertical: 5, fontStyle: "italic" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
});
