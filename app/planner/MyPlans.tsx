import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { scheduleNotification, scheduleNotificationInSeconds } from "../../utils/notifications";

dayjs.locale("fr");

const daysOfWeek = [
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Jeu", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sam", value: 6 },
  { label: "Dim", value: 0 },
];

const MyPlans = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(dayjs().day());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlannedMeals();
  }, []);

  const fetchPlannedMeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("planned_meals")
        .select("id, recipe_title, recipe_image_url, meal_type, meal_date, portions, recipe_url, recette_id")
        .order("meal_date", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error("Erreur chargement des planifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Fonction de reprogrammation avec notifications
  const handleReprogram = async (plan: any) => {
    Alert.prompt(
      "Reprogrammer le repas",
      "Entrez une nouvelle date (format: YYYY-MM-DD)",
      async (newDate) => {
        if (!newDate) return;

        try {
          // Mise à jour dans Supabase
          const { error } = await supabase
            .from("planned_meals")
            .update({ meal_date: newDate })
            .eq("id", plan.id);

          if (error) throw error;

          // Notification immédiate pour la reprogrammation
          await scheduleNotificationInSeconds(
            "🔄 Repas reprogrammé",
            `Votre plat "${plan.recipe_title}" a été reprogrammé pour le ${dayjs(newDate).format("DD MMMM")}`,
            1
          );

          // Planification notification de rappel à 9h le jour du repas
          const reminderDate = dayjs(newDate)
            .hour(9)
            .minute(0)
            .second(0)
            .toDate();

          if (reminderDate > new Date()) {
            await scheduleNotification(
              "⏰ Rappel de repas",
              `C'est le moment de préparer votre recette : ${plan.recipe_title} (${plan.portions || 1} portion${plan.portions > 1 ? "s" : ""})`,
              reminderDate
            );
          }

          Alert.alert("Succès", "Le repas a été reprogrammé et la notification est planifiée !");
          fetchPlannedMeals();
        } catch (err) {
          console.error("Erreur lors de la reprogrammation:", err);
          Alert.alert("Erreur", "Impossible de reprogrammer le repas.");
        }
      }
    );
  };

  const today = dayjs();
  const filteredPlans = plans.filter(
    (p) => dayjs(p.meal_date).day() === selectedDay
  );

  const totalCalories = filteredPlans.reduce(
    (sum, p) => sum + (p.portions || 1) * 250,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍽️ Planification de Repas</Text>

      {/* Jours de la semaine */}
      <View style={styles.dayTabs}>
        {daysOfWeek.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[
              styles.dayBtn,
              selectedDay === d.value && styles.dayBtnActive,
            ]}
            onPress={() => setSelectedDay(d.value)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === d.value && styles.dayTextActive,
              ]}
            >
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E67E22" style={{ marginTop: 40 }} />
      ) : filteredPlans.length === 0 ? (
        <Text style={styles.emptyText}>
          Aucune planification pour ce jour 😕
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredPlans.map((plan) => {
            const isPast = dayjs(plan.meal_date).isBefore(today, "day");

            return (
              <View key={plan.id} style={styles.card}>
                <Image
                  source={{
                    uri:
                      plan.recipe_image_url ||
                      "https://cdn-icons-png.flaticon.com/512/1046/1046873.png",
                  }}
                  style={styles.image}
                />

                <View style={styles.info}>
                  <Text style={styles.mealTitle}>{plan.recipe_title}</Text>
                  <Text style={styles.mealType}>
                    {plan.meal_type} • {dayjs(plan.meal_date).format("DD MMM")}
                  </Text>
                  <Text style={styles.calories}>
                    {(plan.portions || 1) * 250} kcal • {plan.portions} portion(s)
                  </Text>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.recipeBtn}
                      onPress={() =>
                        navigation.navigate("RecipeDetail", { recipe: plan })
                      }
                    >
                      <Text style={styles.btnText}>Voir Recette</Text>
                    </TouchableOpacity>

                    {isPast && (
                      <TouchableOpacity
                        style={styles.reprogramBtn}
                        onPress={() => handleReprogram(plan)}
                      >
                        <Text style={styles.btnText}>Reprogrammer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {/* Résumé du jour */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Résumé du jour</Text>
            <Text style={styles.summaryText}>Repas : {filteredPlans.length}</Text>
            <Text style={styles.summaryText}>Calories totales : {totalCalories} kcal</Text>

            <TouchableOpacity style={styles.shoppingBtn}>
              <Ionicons name="cart" size={18} color="#fff" />
              <Text style={styles.shoppingText}>Générer la liste d’achats</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MyPlans;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },
  header: { textAlign: "center", fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 15 },
  dayTabs: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  dayBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: "#f2f2f2" },
  dayBtnActive: { backgroundColor: "#E67E22" },
  dayText: { color: "#666", fontWeight: "500" },
  dayTextActive: { color: "#fff", fontWeight: "700" },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF8F2",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 3,
  },
  image: { width: 100, height: 100, borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
  info: { flex: 1, padding: 10, justifyContent: "space-between" },
  mealTitle: { fontSize: 15, fontWeight: "600", color: "#222" },
  mealType: { fontSize: 13, color: "#888" },
  calories: { fontSize: 13, color: "#E67E22", marginVertical: 4 },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  recipeBtn: { backgroundColor: "#D35400", padding: 6, borderRadius: 6, flex: 1, alignItems: "center", marginRight: 5 },
  reprogramBtn: { backgroundColor: "#F39C12", padding: 6, borderRadius: 6, flex: 1, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  summaryBox: { backgroundColor: "#FFF5E6", borderRadius: 12, padding: 15, marginTop: 20 },
  summaryTitle: { fontWeight: "700", fontSize: 16, color: "#D35400", marginBottom: 8 },
  summaryText: { color: "#444", marginBottom: 4 },
  shoppingBtn: {
    flexDirection: "row",
    backgroundColor: "#D35400",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  shoppingText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 60, fontSize: 15 },
});
