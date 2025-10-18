import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";

// Liste des pays africains avec drapeaux
const countries = [
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯" },
  { code: "BW", name: "Botswana", flag: "🇧🇼" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CV", name: "Cap-Vert", flag: "🇨🇻" },
  { code: "CF", name: "République centrafricaine", flag: "🇨🇫" },
  { code: "TD", name: "Tchad", flag: "🇹🇩" },
  { code: "KM", name: "Comores", flag: "🇰🇲" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "CI", name: "Côte d’Ivoire", flag: "🇨🇮" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯" },
  { code: "EG", name: "Égypte", flag: "🇪🇬" },
  { code: "GQ", name: "Guinée équatoriale", flag: "🇬🇶" },
  { code: "ER", name: "Érythrée", flag: "🇪🇷" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿" },
  { code: "ET", name: "Éthiopie", flag: "🇪🇹" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "GM", name: "Gambie", flag: "🇬🇲" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
  { code: "GW", name: "Guinée-Bissau", flag: "🇬🇼" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸" },
  { code: "LR", name: "Libéria", flag: "🇱🇷" },
  { code: "LY", name: "Libye", flag: "🇱🇾" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬" },
  { code: "MW", name: "Malawi", flag: "🇲🇼" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷" },
  { code: "MU", name: "Maurice", flag: "🇲🇺" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿" },
  { code: "NA", name: "Namibie", flag: "🇳🇦" },
  { code: "NE", name: "Niger", flag: "🇳🇪" },
  { code: "NG", name: "Nigéria", flag: "🇳🇬" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "ST", name: "Sao Tomé-et-Principe", flag: "🇸🇹" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "SO", name: "Somalie", flag: "🇸🇴" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
  { code: "SS", name: "Soudan du Sud", flag: "🇸🇸" },
  { code: "SD", name: "Soudan", flag: "🇸🇩" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬" },
  { code: "ZM", name: "Zambie", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
];

const ChooseLocation = () => {
  const navigation = useNavigation();
  const [locationGranted, setLocationGranted] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState(
    countries.map((c) => ({
      label: `${c.flag} ${c.name}`,
      value: c.code,
    }))
  );

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationGranted(true);
      detectUserLocation();
    } else {
      setLocationGranted(false);
    }
  };

  const detectUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      const countryCode = data.address?.country_code?.toUpperCase();
      if (countryCode) {
        await AsyncStorage.setItem("countryCode", countryCode);
        navigation.navigate("Tabs" as never);
      } else {
        Alert.alert("Erreur", "Impossible de détecter votre pays.");
      }
    } catch (error) {
      Alert.alert("Erreur localisation", "Impossible de détecter votre position.");
    }
  };

  const handleConfirm = async () => {
    if (!value) {
      Alert.alert("Attention", "Veuillez sélectionner un pays.");
      return;
    }
    await AsyncStorage.setItem("countryCode", value);
    navigation.navigate("Tabs" as never);
  };

  return (
    <View style={styles.container}>
      {/* Logo centré */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Choisissez votre pays</Text>

      {!locationGranted && (
        <Button
          title="Autoriser la localisation"
          onPress={requestLocationPermission}
          color="#D35400"
        />
      )}

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        searchable={true}
        placeholder="Sélectionnez un pays"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        searchPlaceholder="Rechercher un pays..."
      />

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChooseLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF7E0",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#D35400",
  },
  dropdown: {
    borderColor: "#D35400",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    borderColor: "#D35400",
  },
  confirmButton: {
    backgroundColor: "#D35400",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
