const admin = require("firebase-admin");
const firebaseApp = require("../config/firebaseAdmin");

// ── sendPushNotification ─────────────────────────────────────────────────────
// tokens: string | string[]  - one or more FCM device tokens
// payload: { title, body, data? }  - data must be string values only (FCM rule)
//
// Returns { sent, failed, invalidTokens } so callers can optionally clean up
// stale tokens. Never throws - a notification failure should never break the
// request that triggered it (placing an order, adding a product, etc).
const sendPushNotification = async (tokens, { title, body, data = {} }) => {
  const tokenList = (Array.isArray(tokens) ? tokens : [tokens]).filter(Boolean);

  if (tokenList.length === 0) {
    // Previously this returned silently, which made it look like the
    // notification trigger itself wasn't firing (e.g. "new product" or
    // "order status" pushes appearing to do nothing). Logging here makes
    // it clear the trigger DID fire - there just wasn't anyone registered
    // to notify yet (no one has logged in / granted notification access).
    console.log(
      `[push-notification] "${title}" triggered but no devices are registered yet - skipping.`,
    );
    return { sent: 0, failed: 0, invalidTokens: [] };
  }

  // Dev-mode placeholder tokens (issued client-side by firebaseConfig.js
  // when REACT_APP_FIREBASE_* isn't set) never correspond to a real FCM
  // registration - sending them to Firebase would just fail. Always log
  // these locally instead, regardless of whether the server's Firebase
  // Admin credentials are configured.
  const devTokens = tokenList.filter((token) => token.startsWith("dev-"));
  const realTokens = tokenList.filter((token) => !token.startsWith("dev-"));

  if (devTokens.length > 0) {
    console.log(
      `[push-notification:DEV] Would send to ${devTokens.length} dev-mode device(s) -> "${title}": ${body}`,
    );
  }

  if (realTokens.length === 0) {
    return { sent: 0, failed: 0, invalidTokens: [] };
  }

  // Dev fallback: Firebase Admin isn't configured yet, so just log what
  // *would* have been sent. Keeps the rest of the app functional during
  // setup.
  if (!firebaseApp) {
    console.log(
      `[push-notification:DEV] Would send to ${realTokens.length} device(s) -> "${title}": ${body}`,
    );
    return { sent: 0, failed: 0, invalidTokens: [] };
  }

  // FCM data payload values must all be strings. We deliberately send a
  // DATA-ONLY message (no top-level `notification` field) - when a payload
  // includes `notification`, the browser can auto-display it itself,
  // bypassing our onMessage/onBackgroundMessage handlers inconsistently
  // depending on tab focus/browser. Data-only guarantees our own handlers
  // always run, in both foreground and background, so display is 100%
  // under our control.
  const stringData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: realTokens,
      data: {
        title,
        body,
        icon: "/logo192.png",
        ...stringData,
      },
    });

    const invalidTokens = [];
    response.responses.forEach((result, index) => {
      if (!result.success) {
        const code = result.error?.code || "";
        if (
          code.includes("registration-token-not-registered") ||
          code.includes("invalid-argument")
        ) {
          invalidTokens.push(realTokens[index]);
        }
      }
    });

    console.log(
      `[push-notification] "${title}" sent: ${response.successCount} succeeded, ${response.failureCount} failed`,
    );

    return {
      sent: response.successCount,
      failed: response.failureCount,
      invalidTokens,
    };
  } catch (error) {
    console.log("sendPushNotification error:", error.message);
    return { sent: 0, failed: realTokens.length, invalidTokens: [] };
  }
};

module.exports = { sendPushNotification };
