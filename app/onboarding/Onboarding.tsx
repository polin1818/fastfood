import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const slides = [
  {
    title: "Bienvenue sur RecetteAfrique",
    subtitle: "Découvrez des recettes de votre région",
  },
  {
    title: "Partagez vos recettes",
    subtitle: "Ajoutez vos propres recettes et inspirez la communauté",
  },
  {
    title: "Favoris",
    subtitle: "Sauvegardez vos recettes préférées pour les retrouver facilement",
  },
];

const Onboarding = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate("ChooseLocation" as never);
    }
  };

  const { title, subtitle } = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Texte */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentSlide === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7E0",
    paddingHorizontal: 20,
    justifyContent: "space-between", // équilibre texte et footer
    paddingVertical: 60,
  },
  content: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#D35400",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#D35400",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#D35400",
    width: 10,
    height: 10,
  },
});
