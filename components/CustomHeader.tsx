// CustomHeader.tsx
import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../app/AuthContext";



const CustomHeader = () => {
  const navigation = useNavigation();
  const { userProfile } = useContext(AuthContext);

  const handleProfilePress = () => {
    if (userProfile?.full_name) navigation.navigate("Profile" as never);
    else navigation.navigate("Login" as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />

        <TouchableOpacity style={styles.center} onPress={handleProfilePress}>
          {userProfile?.countryCode && (
            <Image source={{ uri: `https://flagcdn.com/w40/${userProfile.countryCode.toLowerCase()}.png` }} style={styles.flag} />
          )}
          <Text style={styles.username}>{userProfile?.full_name || "Connexion"}</Text>
          {!userProfile?.full_name && <Ionicons name="person-circle-outline" size={26} color="black" style={{ marginLeft: 5 }} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Settings" as never)}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#fff", borderBottomWidth: 0.3, borderBottomColor: "#ddd" },
  logo: { width: 32, height: 32 },
  center: { flexDirection: "row", alignItems: "center" },
  flag: { width: 26, height: 18, borderRadius: 3, marginRight: 6 },
  username: { fontSize: 13, fontWeight: "600" },
});
