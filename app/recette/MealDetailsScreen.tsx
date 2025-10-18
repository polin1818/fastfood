import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const MealDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { mealName } = route.params as { mealName: string };

  const [selectedMealType, setSelectedMealType] = useState("Dîner");
  const [portions, setPortions] = useState(8);
  const [notes, setNotes] = useState("");

  const handleAddToPlanner = () => {
    // Simule l’enregistrement dans la BD
    Alert.alert(
      "Ajouté ✅",
      `${mealName} ajouté pour ${selectedMealType} (${portions} portions).`
    );
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.title}>{mealName}</Text>

      {/* --- Type de repas --- */}
      <View style={styles.section}>
        <Text style={styles.label}>Repas</Text>
        {["Petit déjeuner", "Déjeuner", "Dîner"].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.optionContainer}
            onPress={() => setSelectedMealType(type)}
          >
            <View
              style={[
                styles.radioCircle,
                selectedMealType === type && styles.selectedCircle,
              ]}
            />
            <Text style={styles.optionText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Portions --- */}
      <View style={styles.section}>
        <Text style={styles.label}>Portions</Text>
        <View style={styles.portionRow}>
          <Text style={styles.portionText}>{portions} {mealName.toLowerCase()}</Text>
          <View style={styles.portionButtons}>
            <TouchableOpacity
              onPress={() => setPortions((prev) => prev + 1)}
              style={styles.roundButton}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPortions((prev) => (prev > 1 ? prev - 1 : 1))}
              style={styles.roundButton}
            >
              <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- Notes --- */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Ajouter une note personnelle..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {/* --- Bouton Ajouter --- */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddToPlanner}>
        <Text style={styles.addButtonText}>Ajouter au planificateur de repas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MealDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#5A2D82",
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: "#5A2D82",
    marginBottom: 10,
    fontWeight: "600",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5A2D82",
    marginRight: 10,
  },
  selectedCircle: {
    backgroundColor: "#5A2D82",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  portionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portionText: {
    fontSize: 16,
    color: "#333",
  },
  portionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  roundButton: {
    backgroundColor: "#5A2D82",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#FAFAFA",
  },
  addButton: {
    backgroundColor: "#5A2D82",
    borderRadius: 25,
    paddingVertical: 14,
    marginTop: 20,
  },
  addButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
