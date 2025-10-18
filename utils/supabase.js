// supabase.js
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';

// 🔹 URL et clé anonyme Supabase
const SUPABASE_URL = 'https://hgrtyfiifcgfzmzbvlak.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncnR5ZmlpZmNnZnptemJ2bGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzQxODEsImV4cCI6MjA3Mjc1MDE4MX0.xXl4EwF2aZW5HAXyHkSn6lZAWlBJ5_beWSR2fgyh_vE';

// ✅ Création du client Supabase avec session persistante
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,       // Conserve la session utilisateur (JWT)
    autoRefreshToken: true,     // Rafraîchit automatiquement le token
    detectSessionInUrl: true,   // Nécessaire pour les connexions OAuth (Google)
  },
});

// 🔹 Connexion avec email / mot de passe
export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

// 🔹 Connexion avec Google (OAuth)
export const signInWithGoogle = async () => {
  const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'recetteafrique' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: false,
    },
  });
  return { data, error };
};

// 🔹 Déconnexion
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// 🔹 Obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// 🔹 Obtenir la session actuelle (utile pour vérifier auth.uid)
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};
