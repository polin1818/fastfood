// DOIT ÊTRE PREMIER
import 'react-native-url-polyfill/auto';

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { I18nextProvider } from "react-i18next"; 
import i18n from "./i18n"; 
import RootStack from "./app/RootStack";
import { AuthProvider } from "./app/AuthContext"; 
import { Provider as PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </AuthProvider>
    </I18nextProvider>
  );
}
