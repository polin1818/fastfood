import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { supabase } from "../../utils/supabase";

const Settings = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const handleClose = () => {
    navigation.goBack();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  // 🔥 Fonction de partage
  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Découvrez RecetteAfrique 🍲 ! Téléchargez l'application pour explorer les recettes africaines. https://play.google.com/store/apps/details?id=com.recetteafrique",
      });
    } catch (error) {
      console.log("Erreur partage :", error);
    }
  };

  // 🔥 Fonction de suppression du compte (simulation)
  const handleDeleteAccount = () => {
    Alert.alert(
      t("deleteAccount"),
      t("confirmDeleteAccount", {
        defaultValue: "Êtes-vous sûr de vouloir supprimer votre compte ?",
      }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              // 👉 On déconnecte seulement
              await supabase.auth.signOut();

              // 👉 On affiche un message de succès
              Alert.alert("Succès", "Votre compte a été supprimé.");

              // 👉 Retour à l'accueil
              navigation.reset({
                index: 0,
                routes: [{ name: "Tabs" }],
              });
            } catch (err) {
              console.error(err);
              Alert.alert("Erreur", "Une erreur est survenue.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>{t("appName")}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Section 1 : Réglages */}
        <Text style={styles.sectionTitle}>{t("settings")}</Text>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="settings-outline" size={22} color="#D35400" />
          <Text style={styles.itemText}>{t("settings")}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Section 2 : Stats + Sauvegarde */}
        <Text style={styles.sectionTitle}>{t("stats")}</Text>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="stats-chart-outline" size={22} color="#D35400" />
          <Text style={styles.itemText}>{t("stats")}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="sync" size={22} color="#D35400" />
          <Text style={styles.itemText}>{t("sync")}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Feather name="download" size={22} color="#D35400" />
          <Text style={styles.itemText}>Importer des données</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Feather name="upload" size={22} color="#D35400" />
          <Text style={styles.itemText}>Exporter des données</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Section 3 : Compte */}
        <Text style={styles.sectionTitle}>{t("profile")}</Text>
        <View style={styles.item}>
          <Ionicons name="person-outline" size={22} color="#D35400" />
          <Text style={styles.itemText}>{t("profile")}</Text>

          {/* Sélecteur de langue */}
          <View style={styles.langContainer}>
            <TouchableOpacity
              onPress={() => changeLanguage("fr")}
              style={[styles.langButton, lang === "fr" && styles.langActive]}
            >
              <Text
                style={[styles.langText, lang === "fr" && { color: "#fff" }]}
              >
                FR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeLanguage("en")}
              style={[styles.langButton, lang === "en" && styles.langActive]}
            >
              <Text
                style={[styles.langText, lang === "en" && { color: "#fff" }]}
              >
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔥 Supprimer le compte */}
        <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={22} color="red" />
          <Text style={[styles.itemText, { color: "red" }]}>
            {t("deleteAccount")}
          </Text>
        </TouchableOpacity>

        {/* Section 4 : Partage & Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.item} onPress={handleShare}>
          <FontAwesome5 name="share-alt" size={20} color="#D35400" />
          <Text style={styles.itemText}>{t("share")}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("HelpFAQ")}
        >
          <Ionicons name="help-circle-outline" size={22} color="#D35400" />
          <Text style={styles.itemText}>{t("help")}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("Contact")}
        >
          <Ionicons name="mail-outline" size={22} color="#D35400" />
          <Text style={styles.itemText}>{t("contact")}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7E0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    position: "relative",
  },
  appName: { fontSize: 18, fontWeight: "bold", color: "#D35400" },
  closeButton: { position: "absolute", right: 15 },
  scroll: { paddingVertical: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 15,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  itemText: { flex: 1, marginLeft: 12, fontSize: 15, color: "#333" },
  langContainer: { flexDirection: "row", alignItems: "center" },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginLeft: 6,
  },
  langActive: { backgroundColor: "#D35400", borderColor: "#D35400" },
  langText: { fontSize: 13, fontWeight: "600", color: "#333" },
});
