import React, { useEffect, useState } from "react";
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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Video from "react-native-video";

interface Recipe {
  id?: string | number;
  label?: string;
  title?: string;
  name?: string;
  image: string;
  source?: string;
  instructions?: string[] | string;
  ingredientLines?: string[];
  strInstructions?: string;
  calories?: number;
  yield?: number;
  dietLabels?: string[];
  healthLabels?: string[];
  totalTime?: number;
  video?: string;
  youtube?: string;
}

const RecipeDetail = () => {
  const route = useRoute();
  const { recipe } = route.params as { recipe: Recipe };
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const title =
    recipe.label || recipe.title || recipe.name || "Recette";

  // détection vidéo
  useEffect(() => {
    if (recipe.video) setVideoUrl(recipe.video);
    else if (recipe.youtube) setVideoUrl(recipe.youtube.replace("watch?v=", "embed/"));
  }, [recipe]);

  const shareRecipe = async () => {
    await Share.share({
      message: `Découvrez cette recette : ${title}`,
    });
  };

  // Récupération des instructions uniformisées
  const getInstructions = () => {
    if (recipe.instructions) {
      if (Array.isArray(recipe.instructions)) return recipe.instructions;
      return recipe.instructions.split(". ");
    }
    if (recipe.strInstructions) return recipe.strInstructions.split(". ");
    return [];
  };

  return (
    <ScrollView style={styles.container}>
      {/* IMAGE HEADER */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: recipe.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>

          <TouchableOpacity onPress={shareRecipe} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* INFORMATIONS */}
      <View style={styles.infoRow}>
        {recipe.calories && (
          <View style={styles.infoCard}>
            <FontAwesome5 name="fire" size={18} color="#FF4500" />
            <Text style={styles.infoTxt}>{Math.round(recipe.calories)} kcal</Text>
          </View>
        )}

        {recipe.yield && (
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="food" size={20} color="#27AE60" />
            <Text style={styles.infoTxt}>{recipe.yield} portions</Text>
          </View>
        )}

        {recipe.totalTime !== undefined && (
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color="#2980B9" />
            <Text style={styles.infoTxt}>
              {recipe.totalTime > 0 ? `${recipe.totalTime} min` : "Temps inconnu"}
            </Text>
          </View>
        )}
      </View>

      {/* INGREDIENTS */}
      {recipe.ingredientLines && recipe.ingredientLines.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Ingrédients</Text>

          {recipe.ingredientLines.map((item, i) => (
            <View key={i} style={styles.ingRow}>
              <Ionicons name="checkmark-circle" size={20} color="#D35400" />
              <Text style={styles.ingText}>{item}</Text>
            </View>
          ))}
        </>
      )}

      {/* INSTRUCTIONS */}
      {getInstructions().length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Préparation</Text>

          {getInstructions().map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step.trim()}</Text>
            </View>
          ))}
        </>
      )}

      {/* VIDEO */}
      {videoUrl && (
        <>
          <Text style={styles.sectionTitle}>Vidéo</Text>

          <TouchableOpacity onPress={() => setVideoVisible(true)}>
            <Image
              source={{ uri: recipe.image }}
              style={[styles.headerImage, { height: 200 }]}
            />
            <Ionicons
              name="play-circle"
              size={64}
              color="#fff"
              style={styles.playIcon}
            />
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
                style={styles.closeBtn}
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
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  /* HEADER IMAGE */
  headerContainer: {
    position: "relative",
    height: 280,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerContent: {
    position: "absolute",
    bottom: 20,
    left: 15,
  },
  headerTitle: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    width: "80%",
  },
  shareBtn: {
    position: "absolute",
    right: -20,
    top: -10,
  },

  /* INFO */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  infoCard: {
    alignItems: "center",
  },
  infoTxt: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "600",
  },

  /* INGREDIENTS */
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 15,
    color: "#D35400",
  },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 8,
  },
  ingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#555",
  },

  /* INSTRUCTIONS */
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },

  /* VIDEO */
  playIcon: {
    position: "absolute",
    top: "35%",
    left: "40%",
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
  },
});
