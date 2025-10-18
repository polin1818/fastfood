// Profile.tsx
import React, { useContext } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../AuthContext";

const Profile = () => {
  const navigation = useNavigation();
  const { userProfile, logout } = useContext(AuthContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#D35400" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.profileContainer}>
        <Image source={require("../../assets/logo.png")} style={styles.avatar} resizeMode="contain" />
        <Text style={styles.username}>{userProfile?.full_name || "Utilisateur"}</Text>
        {userProfile?.countryCode && (
          <Image source={{ uri: `https://flagcdn.com/w80/${userProfile.countryCode.toLowerCase()}.png` }} style={styles.flag} />
        )}
        <Text style={styles.email}>{userProfile?.email || "Aucun email"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Se Déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#FFF7E0", padding: 20, alignItems: "center" },
  header: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#D35400" },
  profileContainer: { alignItems: "center", marginBottom: 50 },
  avatar: { width: 120, height: 120, marginBottom: 15 },
  username: { fontSize: 22, fontWeight: "bold", color: "#D35400", marginBottom: 8 },
  flag: { width: 40, height: 25, marginBottom: 8 },
  email: { fontSize: 16, color: "#555" },
  logoutButton: { backgroundColor: "#D35400", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
