import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { supabase } from "../utils/supabase";

interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  email?: string;
  countryCode?: string;
}

interface AuthContextType {
  userToken: string | null;
  userProfile: UserProfile | null;
  setUserToken: (token: string | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userProfile: null,
  setUserToken: () => {},
  setUserProfile: () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        // 🔹 Récupération du token depuis SecureStore
        const savedToken = await SecureStore.getItemAsync("userToken");

        if (savedToken) {
          // 🔹 On récupère la session Supabase
          const { data } = await supabase.auth.getSession();
          const session = data.session;

          if (session && session.user) {
            const countryCode = await AsyncStorage.getItem("countryCode");

            setUserToken(session.access_token);
            setUserProfile({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || "Utilisateur",
              username: session.user.user_metadata?.username || "",
              email: session.user.email || "",
              countryCode: countryCode || "",
            });
          } else {
            // Si session expirée, on efface le token
            await SecureStore.deleteItemAsync("userToken");
          }
        }
      } catch (error) {
        console.log("Erreur chargement auth:", error);
      } finally {
        setLoading(false); // ✅ Important pour SplashScreen
      }
    };

    loadAuth();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync("userToken");
    await AsyncStorage.removeItem("countryCode");
    setUserToken(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ userToken, userProfile, setUserToken, setUserProfile, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
