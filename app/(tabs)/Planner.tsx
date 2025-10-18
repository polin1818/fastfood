import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai";

// 🧭 Typage clair de la navigation RootStack
type RootStackParamList = {
  Tabs: undefined;
  MealSelector: { selectedDate: string; selectedDayName: string };
  MyPlans: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ⚙️ Configuration IA
const GEMINI_API_KEY = "AIzaSyCONPkpdlwSm7KOn5BqHOgjHe-JqIXaxu8";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const modelName = "gemini-2.5-flash";

// Message du chat
interface ChatMessage {
  role: "user" | "model";
  text: string;
  id: number;
}

// ----------------------------------------------------------------------
// LOGIQUE DE DATE (inclut Dimanche)
// ----------------------------------------------------------------------
interface DayData {
  dayName: string;
  dateISO: string;
  isToday: boolean;
}

const getWeekData = (): DayData[] => {
  const daysOfWeekNames = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const currentDay = new Date();
  const weekData: DayData[] = [];

  const dayIndex = currentDay.getDay();
  const diffToMonday = currentDay.getDate() - (dayIndex === 0 ? 6 : dayIndex - 1);
  const monday = new Date(currentDay.setDate(diffToMonday));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const dateISO = date.toISOString().split("T")[0];

    weekData.push({
      dayName: daysOfWeekNames[date.getDay()],
      dateISO: dateISO,
      isToday: isToday,
    });
  }
  return weekData;
};

// ----------------------------------------------------------------------

const PlannerHome = () => {
  const navigation = useNavigation<NavigationProp>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const weekData = useMemo(() => getWeekData(), []);

  // --- Configuration du chat IA
  const chat = useMemo(() => {
    const systemInstruction = `
      Tu es "GourmetGPT", un assistant expert en planification de repas.
      Ton objectif : aider l’utilisateur à planifier ses repas selon ses goûts, son budget et sa culture culinaire.
      Utilise un ton amical et clair, propose des repas africains et internationaux.
    `;
    return ai.chats.create({
      model: modelName,
      config: { systemInstruction },
    });
  }, []);

  // --- Charger les anciens messages
  useEffect(() => {
    const loadMessages = async () => {
      const stored = await AsyncStorage.getItem("chat_messages");
      if (stored) setMessages(JSON.parse(stored));
      else {
        setMessages([
          {
            role: "model",
            text: "👋 Bonjour ! Je suis GourmetGPT. Souhaitez-vous planifier vos repas pour la semaine ou découvrir de nouvelles recettes ?",
            id: 0,
          },
        ]);
      }
    };
    loadMessages();
  }, []);

  // --- Sauvegarder automatiquement
  useEffect(() => {
    AsyncStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", text: input, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage.text });
      const modelResponse: ChatMessage = {
        role: "model",
        text: response.text,
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "❌ Erreur : impossible de contacter l'IA. Vérifie ta connexion ou ta clé API.",
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = (dayData: DayData) => {
    navigation.navigate("MealSelector", {
      selectedDate: dayData.dateISO,
      selectedDayName: dayData.dayName,
    });
  };

  const renderMessage = (msg: ChatMessage) => (
    <View
      key={msg.id}
      style={[
        styles.messageBubble,
        msg.role === "user" ? styles.userBubble : styles.modelBubble,
      ]}
    >
      <Text style={msg.role === "user" ? styles.userText : styles.modelText}>
        {msg.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>📅 Votre Semaine Repas</Text>
        <View style={styles.weekContainer}>
          {weekData.map((dayData, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayCard, dayData.isToday && styles.todayCard]}
              onPress={() => handleAddMeal(dayData)}
            >
              <Text
                style={[styles.dayText, dayData.isToday && styles.todayText]}
              >
                {dayData.dayName}
              </Text>
              <Text
                style={[styles.dateText, dayData.isToday && styles.todayText]}
              >
                {dayData.dateISO.slice(8, 10)} / {dayData.dateISO.slice(5, 7)}
              </Text>
              <Ionicons
                name="add-circle"
                size={24}
                color={dayData.isToday ? "#FFF" : "#D35400"}
                style={{ marginTop: 8 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Bouton Voir Mes Planifications (corrigé) */}
      <TouchableOpacity
        style={styles.myPlansButton}
        onPress={() => navigation.navigate("MyPlans")}
      >
        <Ionicons name="calendar" size={18} color="#fff" />
        <Text style={styles.myPlansText}>Voir mes planifications</Text>
      </TouchableOpacity>

      {/* --- Bouton flottant IA --- */}
      <TouchableOpacity style={styles.aiButton} onPress={() => setShowChat(true)}>
        <Ionicons name="chatbubbles" size={30} color="#fff" />
      </TouchableOpacity>

      {/* --- Chat IA --- */}
      <Modal visible={showChat} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowChat(false)}>
          <View />
        </Pressable>
        <View style={styles.chatModal}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>🤖 GourmetGPT</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
          >
            {messages.map(renderMessage)}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Idées de repas africains"
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (loading || !input.trim()) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default PlannerHome;

// ----------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------
const ACCENT_COLOR = "#D35400";
const LIGHT_GREY = "#F7F7F7";
const MEDIUM_GREY = "#EAEAEA";
const TEXT_DARK = "#333333";
const TEXT_GREY = "#777777";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingTop: 10, paddingBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 15,
  },
  weekContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  dayCard: {
    backgroundColor: LIGHT_GREY,
    width: "47%",
    marginVertical: 6,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MEDIUM_GREY,
  },
  todayCard: { backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, elevation: 3 },
  dayText: { color: TEXT_DARK, fontWeight: "600", fontSize: 15 },
  dateText: { color: TEXT_GREY, fontSize: 13 },
  todayText: { color: "#fff" },

  myPlansButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  myPlansText: { color: "#fff", fontWeight: "600", marginLeft: 6 },

  aiButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: ACCENT_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  chatModal: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
  },
  chatHeader: {
    backgroundColor: ACCENT_COLOR,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chatTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  chatArea: { backgroundColor: LIGHT_GREY, maxHeight: 250, padding: 10 },
  chatContent: { paddingBottom: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: "85%",
  },
  userBubble: { backgroundColor: ACCENT_COLOR, alignSelf: "flex-end" },
  modelBubble: { backgroundColor: MEDIUM_GREY, alignSelf: "flex-start" },
  userText: { color: "#fff" },
  modelText: { color: TEXT_DARK },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: MEDIUM_GREY,
    padding: 6,
  },
  input: { flex: 1, paddingHorizontal: 10, color: TEXT_DARK },
  sendButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: TEXT_GREY },
});
