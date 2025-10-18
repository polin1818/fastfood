import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { supabase } from "../../utils/supabase";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { registerForPushNotificationsAsync, scheduleNotification, scheduleNotificationInSeconds } from "../../utils/notifications";

dayjs.locale("fr");

interface UnifiedRecipe {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
}

export default function DayDetails({ route, navigation }) {
  const { selectedDate, selectedRecipe } = route.params as {
    selectedDate: string;
    selectedRecipe: UnifiedRecipe;
  };

  const [mealType, setMealType] = useState("Dîner");
  const [portions, setPortions] = useState(1);
  const [notes, setNotes] = useState("");

  const recipeTitle = selectedRecipe?.title || "Recette inconnue";
  const recipeImage = selectedRecipe?.imageUrl;
  const recipeSource = selectedRecipe?.source;

  const showSuccessMessage = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Succès", message);
    }
  };

  // On s'assure que les notifications sont autorisées
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const handleSave = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Utilisateur non connecté");

      const recetteId = recipeSource === "Afrique" ? selectedRecipe.id : null;

      const { data, error } = await supabase.from("planned_meals").insert([
        {
          user_id: user.id,
          recette_id: recetteId,
          recipe_external_id: recetteId ? null : selectedRecipe.id,
          recipe_title: recipeTitle,
          recipe_image_url: recipeImage,
          recipe_source: recipeSource,
          meal_date: selectedDate,
          meal_type: mealType,
          portions: portions,
          notes: notes,
          is_notified: false,
        },
      ]);

      if (error) throw error;

      console.log("Plat planifié:", data);

      // ✅ Notification immédiate pour féliciter l'utilisateur
      await scheduleNotificationInSeconds(
        "🎉 Plat planifié !",
        `Vous avez planifié ${recipeTitle} (${portions} portion${portions > 1 ? "s" : ""}) pour le ${dayjs(selectedDate).format("dddd DD MMMM")}`,
        1 // notification immédiate (1 seconde)
      );

      // ✅ Notification de rappel à 9h le jour du repas
      const reminderDate = dayjs(selectedDate)
        .hour(9)
        .minute(0)
        .second(0)
        .toDate();

      const now = new Date();
      if (reminderDate > now) {
        await scheduleNotification(
          "⏰ Rappel de repas",
          `C'est le moment de préparer votre recette : ${recipeTitle} (${portions} portion${portions > 1 ? "s" : ""})`,
          reminderDate
        );
      } else {
        console.log("⚠️ Date de rappel déjà passée, notification non planifiée");
      }

      showSuccessMessage("Votre plat a été ajouté et les notifications ont été planifiées !");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le plat. Veuillez réessayer.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.dateText}>Planifier pour le {selectedDate}</Text>
          {recipeImage && (
            <Image
              source={{ uri: recipeImage }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.title}>{recipeTitle}</Text>
          <Text style={styles.sourceText}>Source: {recipeSource}</Text>
        </View>

        <Text style={styles.label}>Type de Repas</Text>
        <View style={styles.radioGroup}>
          {["Petit déjeuner", "Déjeuner", "Dîner"].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioRow}
              onPress={() => setMealType(type)}
            >
              <RadioButton
                value={type}
                status={mealType === type ? "checked" : "unchecked"}
                color="#D35400"
              />
              <Text style={styles.radioText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nombre de Portions</Text>
        <View style={styles.portionRow}>
          <Text style={styles.portionText}>{portions} portion(s)</Text>
          <View style={styles.portionButtons}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => setPortions(portions + 1)}
            >
              <Text style={styles.circleButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => setPortions(Math.max(1, portions - 1))}
            >
              <Text style={styles.circleButtonText}>−</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Notes Personnelles</Text>
        <TextInput
          style={styles.notes}
          multiline
          placeholder="Ex: Utiliser des œufs bio. Ajouter plus de piment."
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Ajouter au planificateur de repas</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { alignItems: "center", marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  dateText: { fontSize: 16, color: "#555", marginBottom: 10 },
  recipeImage: { width: "100%", height: 180, borderRadius: 10, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#D35400", marginBottom: 5 },
  sourceText: { fontSize: 14, color: "#999" },
  label: { fontWeight: "bold", color: "#D35400", marginTop: 16, marginBottom: 8, fontSize: 16 },
  radioGroup: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  radioRow: { flexDirection: "row", alignItems: "center", padding: 8 },
  radioText: { fontSize: 14, color: "#333", marginLeft: 4 },
  portionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  portionText: { fontSize: 18, fontWeight: "600", color: "#333" },
  portionButtons: { flexDirection: "row" },
  circleButton: { backgroundColor: "#FAD7A0", borderRadius: 20, width: 35, height: 35, alignItems: "center", justifyContent: "center", marginHorizontal: 8 },
  circleButtonText: { fontSize: 22, color: "#D35400", fontWeight: "bold" },
  notes: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, minHeight: 80, textAlignVertical: "top", padding: 10, fontSize: 16 },
  button: { backgroundColor: "#D35400", paddingVertical: 14, borderRadius: 10, marginTop: 30, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
