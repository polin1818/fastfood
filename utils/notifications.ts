// utils/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

/**
 * ✅ Configuration du gestionnaire de notifications
 * (comment les notifications sont affichées lorsque l’app est ouverte)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * ✅ Enregistrer l'appareil pour recevoir les notifications
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("⚠️ Les notifications ne fonctionnent pas sur un émulateur !");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Si l’autorisation n’a pas encore été donnée, on la demande
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("🚫 Permission de notification refusée !");
    return;
  }

  console.log("✅ Notifications activées");
}

/**
 * ✅ Planifier une notification locale à une date donnée
 * @param title - Titre de la notification
 * @param body - Corps / message
 * @param date - Date de déclenchement
 */
export async function scheduleNotification(title: string, body: string, date: Date) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: { type: "date", date }, // ✅ format correct pour Expo
    });
    console.log(`📅 Notification planifiée pour : ${date}`);
  } catch (error) {
    console.error("Erreur lors de la planification de la notification :", error);
  }
}

/**
 * ✅ Planifier une notification après un certain délai (en secondes)
 * @param title - Titre de la notification
 * @param body - Corps / message
 * @param seconds - Délai avant la notification
 */
export async function scheduleNotificationInSeconds(title: string, body: string, seconds: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: { seconds, repeats: false }, // éviter que la notification se répète
    });
    console.log(`⏰ Notification dans ${seconds} secondes`);
  } catch (error) {
    console.error("Erreur lors de la planification différée :", error);
  }
}

/**
 * ✅ Annuler toutes les notifications planifiées
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("🧹 Toutes les notifications planifiées ont été annulées");
}
