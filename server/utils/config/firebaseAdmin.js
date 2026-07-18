const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

// ── Firebase Admin (used to send push notifications via FCM) ────────────────
//
// Configure by setting these in server/.env:
//   FIREBASE_PROJECT_ID=your-project-id
//   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
//   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//
// These three values come from a Firebase service account JSON key
// (Firebase Console -> Project Settings -> Service Accounts -> Generate new
// private key). Paste the "private_key" value as-is (keep the \n escapes);
// dotenv will read it as a literal string and we unescape the \n below.
//
// If these env vars are not set, push notifications are safely skipped (and
// logged to the console) instead of crashing the server - this lets the rest
// of the app run before Firebase is configured.

let firebaseApp = null;

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
  process.env;

if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin initialized - push notifications enabled");
  } catch (error) {
    console.log("Firebase Admin initialization failed:", error.message);
    firebaseApp = null;
  }
} else {
  console.log(
    "Firebase Admin not configured (missing FIREBASE_* env vars) - " +
      "push notifications will be logged to the console instead of sent.",
  );
}

module.exports = firebaseApp;
