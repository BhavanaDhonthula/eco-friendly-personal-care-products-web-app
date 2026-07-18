import Cookies from "js-cookie";
import { requestNotificationPermissionAndGetToken } from "../firebaseConfig";

const BASE_URL = "http://localhost:8000";

// Call after a successful user login. Asks the browser for notification
// permission, grabs an FCM token for this device, and registers it with the
// backend so push notifications (order updates, new products) can reach it.
export const registerUserForPushNotifications = async () => {
  const token = Cookies.get("access_token");
  if (!token) return;

  const fcmToken = await requestNotificationPermissionAndGetToken();
  if (!fcmToken) return;

  try {
    await fetch(`${BASE_URL}/save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fcmToken }),
    });
  } catch (error) {
    console.log("registerUserForPushNotifications error:", error);
  }
};

// Call after a successful seller login.
export const registerSellerForPushNotifications = async () => {
  const token = Cookies.get("seller_access_token");
  if (!token) return;

  const fcmToken = await requestNotificationPermissionAndGetToken();
  if (!fcmToken) return;

  try {
    await fetch(`${BASE_URL}/seller-save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fcmToken }),
    });
  } catch (error) {
    console.log("registerSellerForPushNotifications error:", error);
  }
};
