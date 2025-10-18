import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const categories = [
  { id: "1", name: "Dessert", icon: <FontAwesome5 name="birthday-cake" size={30} color="#FF6347" /> },
  { id: "2", name: "Plat Africain", icon: <MaterialCommunityIcons name="food" size={30} color="#4CAF50" /> },
  { id: "3", name: "International", icon: <MaterialCommunityIcons name="earth" size={30} color="#1E90FF" /> },
  { id: "4", name: "Rapide & Facile", icon: <MaterialCommunityIcons name="flash" size={30} color="#FFD700" /> },
  { id: "5", name: "Boissons", icon: <MaterialCommunityIcons name="cup" size={30} color="#8B4513" /> },
];

const AddRecipe = () => {
  const navigation = useNavigation();

  const handleSelectCategory = async (categoryName: string) => {
    // Sauvegarde la catégorie choisie
    await AsyncStorage.setItem("selectedCategory", categoryName);
    // Navigue vers la page du formulaire
    navigation.navigate("AddRecipeForm", { category: categoryName });
  };

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleSelectCategory(item.name)}
    >
      {item.icon}
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Ajouter une recette</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
};

export default AddRecipe;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    elevation: 3,
  },
  cardText: { marginTop: 10, fontSize: 16, fontWeight: "600" },
});
