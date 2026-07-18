const dotenv = require("dotenv");
dotenv.config();

// ── SMS notifications (order status / new product) ────────────────────────
//
// Reuses the same Twilio account as OTP verification, but sending a plain
// SMS (not a Verify code) needs a Twilio phone number to send FROM, which
// the Verify Service SID alone doesn't provide. Add to server/.env:
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   (same as OTP)
//   TWILIO_AUTH_TOKEN=your_auth_token                        (same as OTP)
//   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx   (a number you bought/rented in Twilio)
//
// Without TWILIO_PHONE_NUMBER set, falls back to logging to the console so
// the rest of the flow keeps working during local development/demo.

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
  process.env;

const isSmsConfigured = !!(
  TWILIO_ACCOUNT_SID &&
  TWILIO_AUTH_TOKEN &&
  TWILIO_PHONE_NUMBER
);

let twilioClient = null;
if (isSmsConfigured) {
  try {
    twilioClient = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.log(
      "Twilio SMS client failed to initialize, falling back to dev SMS mode:",
      error.message,
    );
    twilioClient = null;
  }
}

const isValidMobileNumber = (mobileNumber) =>
  /^[6-9]\d{9}$/.test(String(mobileNumber || "").trim());

// Sends one SMS. Never throws - always resolves, so callers can fire-and-forget
// without a failed send breaking the request that triggered it.
const sendSms = async (mobileNumber, message) => {
  if (!isValidMobileNumber(mobileNumber)) {
    console.log(
      `[sms-notification] Skipped - invalid mobile number: ${mobileNumber}`,
    );
    return { ok: false };
  }

  if (!twilioClient) {
    console.log(`[sms-notification:DEV] To ${mobileNumber}: ${message}`);
    console.log(
      "[sms-notification:DEV] Configure TWILIO_PHONE_NUMBER (Twilio " +
        "credentials already exist for OTP) to send this over real SMS.",
    );
    return { ok: true, dev: true };
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber}`,
    });
    return { ok: true };
  } catch (error) {
    console.log(`sendSms error (${mobileNumber}):`, error.message);
    return { ok: false, error: error.message };
  }
};

// Sends the same SMS to many numbers, e.g. "new product" broadcasts.
// Dedupes numbers and never lets one failure block the rest.
// NOTE: this fires one SMS per recipient - real Twilio SMS costs money per
// message, so double check you actually want every user texted for every
// new product before enabling real credentials in production.
const sendBulkSms = async (mobileNumbers, message) => {
  const uniqueNumbers = [...new Set((mobileNumbers || []).filter(Boolean))];
  if (uniqueNumbers.length === 0) {
    console.log("[sms-notification] No mobile numbers to send to");
    return;
  }

  const results = await Promise.all(
    uniqueNumbers.map((num) => sendSms(num, message)),
  );
  const successCount = results.filter((r) => r.ok).length;
  console.log(
    `[sms-notification] Bulk send: ${successCount}/${uniqueNumbers.length} succeeded`,
  );
};

module.exports = { sendSms, sendBulkSms };
