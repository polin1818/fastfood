import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n"; // chemin vers ton fichier i18n.js

const HelpFAQ = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>{t("helpTitle")}</Text>
      </View>

      {/* FAQ */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.question}>👉 {t("faqAddRecipeQ")}</Text>
        <Text style={styles.answer}>{t("faqAddRecipeA")}</Text>

        <Text style={styles.question}>👉 {t("faqSearchRecipeQ")}</Text>
        <Text style={styles.answer}>{t("faqSearchRecipeA")}</Text>

        <Text style={styles.question}>👉 {t("faqCountryRecipeQ")}</Text>
        <Text style={styles.answer}>{t("faqCountryRecipeA")}</Text>

        <Text style={styles.question}>👉 {t("faqCreateAccountQ")}</Text>
        <Text style={styles.answer}>{t("faqCreateAccountA")}</Text>

        <Text style={styles.question}>👉 {t("faqOtherQ")}</Text>
        <Text style={styles.answer}>{t("faqOtherA")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpFAQ;

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
    fontSize: 18,
    fontWeight: "bold",
    color: "#D35400",
    textAlign: "center",
    maxWidth: "70%",
  },
  scroll: {
    padding: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D35400",
    marginTop: 15,
  },
  answer: {
    fontSize: 14,
    color: "#444",
    marginTop: 5,
    lineHeight: 20,
  },
});
