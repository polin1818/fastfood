import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Favorites = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vos recettes favorites</Text>
      {/* Ici tu pourras afficher les recettes favorites */}
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold" },
});
