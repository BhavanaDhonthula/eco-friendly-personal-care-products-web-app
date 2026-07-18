const dotenv = require("dotenv");
dotenv.config();

// ── Mobile OTP verification ──────────────────────────────────────────────────
//
// Uses Twilio Verify when configured via server/.env:
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN=your_auth_token
//   TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   (create a Verify Service at https://console.twilio.com/us1/develop/verify/services)
//
// If those aren't set yet, falls back to an in-memory OTP store and logs the
// code to the server console, so registration + OTP verification still work
// end-to-end during local development/demo. Swap in real Twilio credentials
// whenever you're ready for production - no other code changes needed.

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
  process.env;

const isTwilioConfigured = !!(
  TWILIO_ACCOUNT_SID &&
  TWILIO_AUTH_TOKEN &&
  TWILIO_VERIFY_SERVICE_SID
);

console.log(TWILIO_ACCOUNT_SID);
console.log(TWILIO_AUTH_TOKEN);
console.log(TWILIO_VERIFY_SERVICE_SID);

let twilioClient = null;
if (isTwilioConfigured) {
  try {
    twilioClient = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.log(
      "Twilio client failed to initialize, falling back to dev OTP mode:",
      error.message,
    );
    twilioClient = null;
  }
}

// ── Dev fallback in-memory store: mobileNumber -> { code, expiresAt, attempts }
const devOtpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const generateSixDigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Basic Indian mobile number validation: 10 digits, starts with 6-9.
// (Adjust this regex if you need to support other countries.)
const isValidMobileNumber = (mobileNumber) =>
  /^[6-9]\d{9}$/.test(String(mobileNumber || "").trim());

// POST /send-otp
const sendOtp = async (mobileNumber) => {
  if (!isValidMobileNumber(mobileNumber)) {
    return { ok: false, err_msg: "Enter a valid 10-digit mobile number" };
  }

  const e164Number = `+91${mobileNumber}`;

  if (twilioClient) {
    try {
      await twilioClient.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: e164Number, channel: "sms" });
      return { ok: true, succ_msg: "OTP sent to your mobile number" };
    } catch (error) {
      console.log("Twilio sendOtp error:", error.message);
      return {
        ok: false,
        err_msg: "Unable to send OTP right now, please try again",
      };
    }
  }

  // Dev fallback
  const code = generateSixDigitCode();
  devOtpStore.set(mobileNumber, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  console.log(
    `[otp-service:DEV] OTP for ${mobileNumber} is ${code} (valid 5 min). ` +
      `Configure TWILIO_* env vars to send this over real SMS instead.`,
  );
  return { ok: true, succ_msg: "OTP sent to your mobile number" };
};

// POST /verify-otp
const verifyOtp = async (mobileNumber, code) => {
  if (!isValidMobileNumber(mobileNumber)) {
    return { ok: false, err_msg: "Enter a valid 10-digit mobile number" };
  }
  if (!code) {
    return { ok: false, err_msg: "Enter the OTP sent to your mobile" };
  }

  const e164Number = `+91${mobileNumber}`;

  if (twilioClient) {
    try {
      const check = await twilioClient.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: e164Number, code });

      if (check.status === "approved") {
        return { ok: true, succ_msg: "Mobile number verified" };
      }
      return { ok: false, err_msg: "Incorrect or expired OTP" };
    } catch (error) {
      console.log("Twilio verifyOtp error:", error.message);
      return { ok: false, err_msg: "Incorrect or expired OTP" };
    }
  }

  // Dev fallback
  const record = devOtpStore.get(mobileNumber);
  if (!record) {
    return {
      ok: false,
      err_msg: "No OTP request found, please request a new OTP",
    };
  }
  if (Date.now() > record.expiresAt) {
    devOtpStore.delete(mobileNumber);
    return { ok: false, err_msg: "OTP expired, please request a new one" };
  }
  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    devOtpStore.delete(mobileNumber);
    return {
      ok: false,
      err_msg: "Too many incorrect attempts, please request a new OTP",
    };
  }
  if (record.code !== String(code).trim()) {
    return { ok: false, err_msg: "Incorrect OTP" };
  }

  devOtpStore.delete(mobileNumber);
  return { ok: true, succ_msg: "Mobile number verified" };
};

module.exports = { sendOtp, verifyOtp, isValidMobileNumber };
