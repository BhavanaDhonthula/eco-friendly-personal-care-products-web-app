/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker - handles push notifications that
// arrive while the browser tab / app is closed or in the background.
//
// IMPORTANT: Service workers can't read process.env, so paste the SAME
// values from client/.env (REACT_APP_FIREBASE_*) into the object below.
// These are public/client-side config values, not secrets.

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyARn7gmR_ebl2KWo4fN2Sozlkd2VzlY0FM",
  authDomain: "ecoglow-50723.firebaseapp.com",
  projectId: "ecoglow-50723",
  storageBucket: "ecoglow-50723.firebasestorage.app",
  messagingSenderId: "870290219449",
  appId: "1:870290219449:web:a7c50ae37c42bee388d668",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  window.self.registration.showNotification(title || "EcoGlow", {
    body: body || "",
    icon: "/logo192.png",
    data: payload.data,
  });
});

// Clicking the notification focuses/opens the app.
window.self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
