// Login.tsx
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../utils/supabase";
import { AuthContext } from "../AuthContext";

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const navigation = useNavigation();
  const { setUserToken, setUserProfile } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupération du pays enregistré
  useEffect(() => {
    const loadCountry = async () => {
      const savedCountry = await AsyncStorage.getItem("countryCode");
      if (!savedCountry) {
        Alert.alert(
          "Pays non choisi",
          "Veuillez sélectionner votre pays avant de vous connecter."
        );
        navigation.navigate("ChooseLocation" as never);
      } else {
        setCountry(savedCountry);
      }
    };
    loadCountry();
  }, []);

  // ✅ Fonction commune pour gérer la création/vérification du profil
  const ensureProfile = async (user: any) => {
    const { id, email, user_metadata } = user;

    // Vérifier si le profil existe déjà
    const { data: existing, error: selectErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (selectErr || !existing) {
      // Si le profil n'existe pas, on le crée
      const { error: insertErr } = await supabase.from("profiles").insert([
        {
          id,
          full_name: user_metadata?.full_name || "Utilisateur",
          country_code: country,
          avatar_url: user_metadata?.avatar_url || null,
        },
      ]);
      if (insertErr) throw insertErr;
    }

    return {
      id,
      email,
      full_name: user_metadata?.full_name || "Utilisateur",
      countryCode: country || "",
    };
  };

  // ✅ Connexion email/password
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Utilisateur non trouvé");

      const profile = await ensureProfile(data.user);

      // 🔹 Mettre à jour le contexte global
      setUserToken(data.session?.access_token || "");
      setUserProfile(profile);

      Alert.alert("Succès", "Connexion réussie !");
      navigation.navigate("Tabs" as never);
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Connexion via Google (direct avec Supabase)
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "recetteafrique://redirect" },
      });

      if (error) throw error;

      // Ici Supabase gère la redirection automatiquement
      // Tu peux écouter l'événement onAuthStateChange pour récupérer l'user
    } catch (err: any) {
      Alert.alert("Erreur Google", err.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D35400" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#DB4437" }]}
        onPress={handleGoogleSignIn}
      >
        <Text style={styles.buttonText}>Se connecter avec Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register" as never)}
        style={{ marginTop: 20 }}
      >
        <Text style={styles.linkText}>Pas de compte ? Inscrivez-vous</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#FFF7E0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D35400",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D35400",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#27AE60",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#D35400",
    textAlign: "center",
    fontWeight: "bold",
  },
});
