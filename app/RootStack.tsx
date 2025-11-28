import React, { useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";

import SplashScreen from "./splash/SplashScreen";
import Onboarding from "./onboarding/Onboarding";
import ChooseLocation from "./choose-location/ChooseLocation";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Profile from "./auth/Profile";
import Tabs from "./(tabs)/Index";
import Settings from "./settings/Settings";
import RecipeDetail from "./detail/RecipeDetail";
import AddRecipeForm from "./recette/AddRecipeForm";
import DayDetails from "./planner/DayDetails";
import MealSelectorScreen from "./planner/MealSelectorScreen";
import MyPlans from "./planner/MyPlans";

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const { user, loading } = useContext(AuthContext);

  const [installChecked, setInstallChecked] = useState(false);
  const [firstInstall, setFirstInstall] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInstallStatus = async () => {
      const hasInstalled = await AsyncStorage.getItem("hasInstalled");

      if (hasInstalled === null) {
        // Première ouverture de l’app
        await AsyncStorage.setItem("hasInstalled", "true");
        setFirstInstall(true);
      } else {
        setFirstInstall(false);
      }

      setInstallChecked(true);
    };

    checkInstallStatus();
  }, []);

  if (loading || !installChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D35400" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Cas 1 : Première installation */}
      {firstInstall ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="ChooseLocation" component={ChooseLocation} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Tabs" component={Tabs} />
        </>
      ) : user ? (
        // Cas 2 : App déjà installée + utilisateur connecté
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
        </>
      ) : (
        // Cas 3 : App installée + pas de compte
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}

      {/* Screens secondaires */}
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetail}
        options={{ headerShown: true, title: "Détails de la recette" }}
      />
      <Stack.Screen
        name="AddRecipeForm"
        component={AddRecipeForm}
        options={{ headerShown: true, title: "Ajouter une recette" }}
      />
      <Stack.Screen
        name="DayDetails"
        component={DayDetails}
        options={{ headerShown: true, title: "Détails du jour" }}
      />
      <Stack.Screen
        name="MealSelector"
        component={MealSelectorScreen}
        options={{ headerShown: true, title: "Choisir un plat" }}
      />
      <Stack.Screen
        name="MyPlans"
        component={MyPlans}
        options={{ headerShown: true, title: "Mes plans de repas" }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
