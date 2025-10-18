import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Bouton retour */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        {/* Titre centré */}
        <Text style={styles.title}>{t("contactTitle")}</Text>
      </View>

      {/* Contenu centré */}
      <View style={styles.content}>
        {/* Message d’intro */}
        <Text style={styles.intro}>{t("contactIntro")}</Text>

        {/* Adresse email */}
        <Text style={styles.label}>{t("email")} :</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:support@recetteafrique.com")}
        >
          <Text style={styles.email}>support@recetteafrique.com</Text>
        </TouchableOpacity>

        {/* Lien vers FAQ */}
        <Text style={styles.label}>{t("faqTitle")} :</Text>
        <TouchableOpacity onPress={() => navigation.navigate("HelpFAQ")}>
          <Text style={styles.link}>{t("faqLink")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7E0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
    textAlign: "center",
    maxWidth: "70%",
  },
  content: {
    flex: 1,
    justifyContent: "center", // centre verticalement
    alignItems: "center", // centre horizontalement
    padding: 20,
  },
  intro: {
    fontSize: 16,
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D35400",
    marginTop: 20,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#2980b9",
    marginTop: 8,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  link: {
    fontSize: 16,
    color: "#27ae60",
    marginTop: 8,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
