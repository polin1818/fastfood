import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission refusée",
            "La localisation est nécessaire pour détecter votre pays."
          );
        }
      } catch (error) {
        console.log("Erreur permission localisation :", error);
      }
    };

    requestLocationPermission();

    const timer = setTimeout(() => {
      navigation.navigate("Onboarding" as never);
    }, 2000); // 2 secondes

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo centré */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ActivityIndicator size="large" color="#D35400" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7E0",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
});
