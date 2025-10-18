import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fonction pour charger la langue sauvegardée
const getSavedLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem("appLanguage");
    if (savedLang) {
      return savedLang;
    }
  } catch (e) {
    console.log("Erreur AsyncStorage langue :", e);
  }
  return Localization.locale?.split("-")[0] || "fr";
};

(async () => {
  const lng = await getSavedLanguage();

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    lng, // langue chargée
    fallbackLng: "fr",
    resources: {
      fr: {
        translation: {
          appName: "RecetteAfrique",
          settings: "Réglages",
          stats: "Statistiques",
          sync: "Sauvegarder & synchroniser",
          profile: "Profil & langue",
          deleteAccount: "Supprimer mon compte",
          share: "Envoyer RecetteAfrique à mes amis",
          help: "Aide & FAQ",
          contact: "Contact",

          // FAQ
          helpTitle: "Comment utiliser RecetteAfrique",
          faqAddRecipeQ: "Comment ajouter une recette ?",
          faqAddRecipeA:
            "Allez dans l’onglet 'Ajouter une recette', remplissez le formulaire puis validez.",
          faqSearchRecipeQ: "Comment rechercher une recette ?",
          faqSearchRecipeA:
            "Utilisez la barre de recherche ou filtrez par pays, type de plat ou ingrédients.",
          faqCountryRecipeQ: "Les recettes par pays",
          faqCountryRecipeA:
            "Découvrez les spécialités locales en filtrant vos recherches par pays (Cameroun, Côte d’Ivoire, Sénégal...).",
          faqCreateAccountQ: "Comment créer un compte ?",
          faqCreateAccountA:
            "Rendez-vous dans l’onglet 'Profil' puis cliquez sur 'Créer un compte'.",
          faqOtherQ: "Autres questions fréquentes",
          faqOtherA:
            "- Modifier mon profil : allez dans 'Profil' > 'Modifier'.\n\n- Sauvegarder mes recettes préférées : cliquez sur l’icône ❤️.\n\n- Activer les notifications : allez dans 'Paramètres' > 'Notifications'.",

          // Contact
          contactTitle: "Contact",
          contactIntro:
            "Vous avez une question, une suggestion ou rencontré un problème ? Contactez-nous !",
          email: "Adresse email de support",
          faqTitle: "FAQ rapide",
          faqLink:
            "Avant de nous écrire, consultez la section Aide & FAQ.",
        },
      },
      en: {
        translation: {
          appName: "RecipeAfrica",
          settings: "Settings",
          stats: "Statistics",
          sync: "Backup & Sync",
          profile: "Profile & Language",
          deleteAccount: "Delete my account",
          share: "Share RecipeAfrica with friends",
          help: "Help & FAQ",
          contact: "Contact",

          // FAQ
          helpTitle: "How to use RecipeAfrica",
          faqAddRecipeQ: "How to add a recipe?",
          faqAddRecipeA:
            "Go to the 'Add a recipe' tab, fill in the form and confirm.",
          faqSearchRecipeQ: "How to search for a recipe?",
          faqSearchRecipeA:
            "Use the search bar or filter by country, dish type, or ingredients.",
          faqCountryRecipeQ: "Recipes by country",
          faqCountryRecipeA:
            "Discover local specialties by filtering searches by country (Cameroon, Ivory Coast, Senegal...).",
          faqCreateAccountQ: "How to create an account?",
          faqCreateAccountA:
            "Go to the 'Profile' tab, click on 'Create an account', enter your details and confirm.",
          faqOtherQ: "Other common questions",
          faqOtherA:
            "- Modify my profile: go to 'Profile' > 'Edit'.\n\n- Save my favorite recipes: click on the ❤️ icon.\n\n- Enable notifications: go to 'Settings' > 'Notifications'.",

          // Contact
          contactTitle: "Contact",
          contactIntro:
            "Do you have a question, suggestion, or issue? Contact us!",
          email: "Support email address",
          faqTitle: "Quick FAQ",
          faqLink:
            "Before writing to us, check out the Help & FAQ section.",
        },
      },
    },
    interpolation: { escapeValue: false },
  });
})();

export default i18n;
