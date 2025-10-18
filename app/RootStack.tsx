import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "./AuthContext";

// --- Importation des écrans ---
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
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D35400" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="ChooseLocation" component={ChooseLocation} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Settings" component={Settings} />

      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetail}
        options={{ headerShown: true, title: "Détails de la recette", headerBackTitle: "Retour" }}
      />
      <Stack.Screen
        name="AddRecipeForm"
        component={AddRecipeForm}
        options={{ headerShown: true, title: "Ajouter une recette", headerBackTitle: "Retour" }}
      />
      <Stack.Screen
        name="DayDetails"
        component={DayDetails}
        options={{ headerShown: true, title: "Détails du jour", headerBackTitle: "Retour" }}
      />
      <Stack.Screen
        name="MealSelector"
        component={MealSelectorScreen}
        options={{ headerShown: true, title: "Choisir un plat", headerBackTitle: "Retour" }}
      />
      <Stack.Screen
        name="MyPlans"
        component={MyPlans}
        options={{ headerShown: true, title: "Mes plans de repas", headerBackTitle: "Retour" }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
