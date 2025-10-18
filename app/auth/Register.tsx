// Register.tsx
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

const Register = () => {
  const navigation = useNavigation();
  const { setUserToken, setUserProfile } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCountry = async () => {
      const savedCountry = await AsyncStorage.getItem("countryCode");
      if (!savedCountry) {
        Alert.alert(
          "Pays non choisi",
          "Veuillez sélectionner votre pays avant de vous inscrire."
        );
        navigation.navigate("ChooseLocation" as never);
      } else {
        setCountry(savedCountry);
      }
    };
    loadCountry();
  }, []);

  // ✅ Fonction commune pour créer ou vérifier un profil
  const ensureProfile = async (user: any, full_name?: string) => {
    const { id, email, user_metadata } = user;

    const { data: existing, error: selectErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (selectErr || !existing) {
      const { error: insertErr } = await supabase.from("profiles").insert([
        {
          id,
          full_name: full_name || user_metadata?.full_name || "Utilisateur",
          country_code: country,
          avatar_url: user_metadata?.avatar_url || null,
        },
      ]);
      if (insertErr) throw insertErr;
    }

    return {
      id,
      email,
      full_name: full_name || user_metadata?.full_name || "Utilisateur",
      countryCode: country || "",
    };
  };

  // ✅ Inscription email/password
  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Impossible de récupérer l'utilisateur.");

      const profile = await ensureProfile(data.user, fullName);

      // 🔹 Mettre à jour le contexte
      setUserToken(data.session?.access_token || "");
      setUserProfile(profile);

      Alert.alert("Succès", "Inscription réussie !");
      navigation.navigate("Tabs" as never);
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de s'inscrire.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Inscription/Connexion via Google
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "recetteafrique://redirect" },
      });

      if (error) throw error;

      // Ici, l’utilisateur sera redirigé et `onAuthStateChange` (dans ton AuthContext) prendra le relais
    } catch (err: any) {
      Alert.alert("Erreur Google", err.message || "Impossible de se connecter.");
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
      <Text style={styles.title}>Inscription</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom complet"
        value={fullName}
        onChangeText={setFullName}
      />
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#DB4437" }]}
        onPress={handleGoogleSignIn}
      >
        <Text style={styles.buttonText}>Continuer avec Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login" as never)}
        style={{ marginTop: 20 }}
      >
        <Text style={styles.linkText}>
          Vous avez déjà un compte ? Connectez-vous
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

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
