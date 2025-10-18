import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Modal,
  Linking,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";

interface Recipe {
  uri?: string;
  id?: string | number;
  label: string;
  title?: string;
  image: string;
  source?: string;
  ingredientLines?: string[];
  calories?: number;
  yield?: number;
  dietLabels?: string[];
  healthLabels?: string[];
  totalTime?: number;
  video?: string; // URL vidéo
  youtube?: string; // pour MealDB
}

const RecipeDetail = () => {
  const route = useRoute();
  const { recipe } = route.params as { recipe: Recipe };
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Priorité : Spoonacular -> MealDB
    if (recipe.video) {
      setVideoUrl(recipe.video);
    } else if (recipe.youtube) {
      // Convertir YouTube URL en embed ou lecture via Linking si nécessaire
      setVideoUrl(recipe.youtube.replace("watch?v=", "embed/"));
    }
  }, [recipe]);

  const handleShare = async () => {
    try {
      const message = `${recipe.label}\nDécouvrez cette recette ! ${
        recipe.url || recipe.source || ""
      }`;
      await Share.share({ message });
    } catch (error) {
      console.error("Erreur partage :", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
      <Image source={{ uri: recipe.image }} style={styles.image} />

      {/* Titre et source */}
      <Text style={styles.title}>{recipe.label}</Text>
      {recipe.source && (
        <Text style={styles.source}>
          <Ionicons name="restaurant-outline" size={16} color="#D35400" /> {recipe.source}
        </Text>
      )}

      {/* Bouton partager */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={20} color="#fff" />
        <Text style={styles.shareText}>Partager la recette</Text>
      </TouchableOpacity>

      {/* Infos clés */}
      <View style={styles.infoContainer}>
        {recipe.calories !== undefined && (
          <View style={styles.infoBox}>
            <FontAwesome5 name="fire" size={18} color="#FF4500" />
            <Text style={styles.infoText}>{Math.round(recipe.calories)} kcal</Text>
          </View>
        )}
        {recipe.yield !== undefined && (
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="food-fork-drink" size={18} color="#4CAF50" />
            <Text style={styles.infoText}>{recipe.yield} portions</Text>
          </View>
        )}
        {recipe.totalTime !== undefined && (
          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={18} color="#1E90FF" />
            <Text style={styles.infoText}>
              {recipe.totalTime > 0 ? `${recipe.totalTime} min` : "Non renseigné"}
            </Text>
          </View>
        )}
      </View>

      {/* Labels diététiques */}
      {recipe.dietLabels && recipe.dietLabels.length > 0 && (
        <View style={styles.labelsContainer}>
          <Text style={styles.sectionTitle}>Labels diététiques :</Text>
          <View style={styles.labelsBox}>
            {recipe.dietLabels.map((label, index) => (
              <Text key={index} style={styles.label}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Labels santé */}
      {recipe.healthLabels && recipe.healthLabels.length > 0 && (
        <View style={styles.labelsContainer}>
          <Text style={styles.sectionTitle}>Labels santé :</Text>
          <View style={styles.labelsBox}>
            {recipe.healthLabels.map((label, index) => (
              <Text
                key={index}
                style={[styles.label, { backgroundColor: "#FDEBD0", color: "#D35400" }]}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Ingrédients */}
      {recipe.ingredientLines && recipe.ingredientLines.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Ingrédients :</Text>
          {recipe.ingredientLines.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Ionicons name="ellipse" size={8} color="#FF6347" style={{ marginRight: 6 }} />
              <Text style={styles.ingredient}>{ingredient}</Text>
            </View>
          ))}
        </>
      )}

      {/* Vidéo */}
      {videoUrl && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Vidéo :</Text>
          <TouchableOpacity onPress={() => setVideoVisible(true)}>
            <Image
              source={{ uri: recipe.image }}
              style={[styles.image, { height: 200 }]}
            />
            <View style={styles.playIcon}>
              <Ionicons name="play-circle-outline" size={60} color="#fff" />
            </View>
          </TouchableOpacity>

          <Modal visible={videoVisible} animationType="slide">
            <View style={{ flex: 1, backgroundColor: "#000" }}>
              <Video
                source={{ uri: videoUrl }}
                style={{ flex: 1 }}
                controls
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setVideoVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-circle" size={40} color="#fff" />
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

export default RecipeDetail;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#FFF7E0" },
  image: { width: "100%", height: 250, borderRadius: 15, marginBottom: 15 },
  playIcon: { position: "absolute", top: "35%", left: "35%", opacity: 0.8 },
  closeButton: { position: "absolute", top: 40, right: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 5, textAlign: "center", color: "#D35400" },
  source: { fontSize: 16, color: "#555", marginBottom: 15, textAlign: "center" },
  shareButton: {
    flexDirection: "row",
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  shareText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  infoContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  infoBox: { alignItems: "center" },
  infoText: { marginTop: 5, fontSize: 16, fontWeight: "600" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#D35400" },
  labelsContainer: { marginBottom: 15 },
  labelsBox: { flexDirection: "row", flexWrap: "wrap" },
  label: { backgroundColor: "#D5F5E3", color: "#196F3D", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, marginBottom: 6, fontWeight: "500" },
  ingredientRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  ingredient: { fontSize: 16, color: "#555" },
});
