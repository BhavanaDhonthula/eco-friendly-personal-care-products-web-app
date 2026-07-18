import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

// ── Firebase (client) ─────────────────────────────────────────────────────
// Fill these in from Firebase Console -> Project Settings -> General ->
// "Your apps" -> Web app (these are public/client-side config values, safe
// to ship in the bundle - they are NOT secrets).
//
// Put them in client/.env as REACT_APP_FIREBASE_* (see client/.env for the
// placeholders already added). After changing client/.env, restart
// `npm start` - Create React App only reads env vars at build/start time.
//
// You also need the same values pasted into
// client/public/firebase-messaging-sw.js (service workers can't read
// process.env at runtime, so that file needs literal values).
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// VAPID key from Firebase Console -> Project Settings -> Cloud Messaging ->
// Web configuration -> Web Push certificates.
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

let firebaseApp = null;
if (isFirebaseConfigured) {
  firebaseApp = initializeApp(firebaseConfig);
}

// ── Dev-mode placeholder token ───────────────────────────────────────────
// Real FCM tokens can only be issued by a real Firebase project. Without
// one, there was previously no way to register *any* device, so the whole
// notification pipeline (order updates, new products) looked silently
// broken even though the trigger logic was firing correctly - there was
// just never anyone to send to.
//
// To make the pipeline testable/demoable before Firebase is set up, we
// hand out a stable "dev-..." placeholder token per browser instead. The
// server recognizes the "dev-" prefix and logs what it *would* have sent
// (search server console for [push-notification:DEV]) rather than trying
// to deliver a real push. Once you configure REACT_APP_FIREBASE_* here,
// this path is skipped entirely in favor of real tokens/real pushes.
const DEV_TOKEN_STORAGE_KEY = "ecoglow_dev_fcm_token";

const getOrCreateDevToken = () => {
  try {
    let token = localStorage.getItem(DEV_TOKEN_STORAGE_KEY);
    if (!token) {
      token = `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
      localStorage.setItem(DEV_TOKEN_STORAGE_KEY, token);
    }
    return token;
  } catch (error) {
    // Storage unavailable (private browsing, etc) - fall back to a
    // session-only token so registration doesn't hard-fail.
    return `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
};

// Requests browser notification permission (if not already granted/denied)
// and returns an FCM registration token for this device. Returns a "dev-"
// placeholder token if Firebase isn't configured yet (see above), or null
// if permission was refused / the browser doesn't support push.
export const requestNotificationPermissionAndGetToken = async () => {
  if (!isFirebaseConfigured) {
    const devToken = getOrCreateDevToken();
    console.log(
      "[push-notification:DEV] Firebase isn't configured yet (missing " +
        "REACT_APP_FIREBASE_* in client/.env), so this device is registered " +
        "with a placeholder token. Notifications will be logged on the " +
        "SERVER console instead of arriving as real push notifications - " +
        "look for [push-notification:DEV] there to confirm sends are firing.",
    );
    return devToken;
  }

  try {
    const supported = await isSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.log("requestNotificationPermissionAndGetToken error:", error);
    return null;
  }
};

// Listens for push notifications that arrive while the app is in the
// foreground (background notifications are handled by the service worker).
export const listenForForegroundMessages = (onReceive) => {
  if (!isFirebaseConfigured) return () => {};
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, onReceive);
};

export { isFirebaseConfigured };
