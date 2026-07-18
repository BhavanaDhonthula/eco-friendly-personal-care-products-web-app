const express = require("express");
const router = express.Router();

const {
  sendOtpHandler,
  verifyOtpHandler,
} = require("../controllers/otpController");

// Public - needed before an account exists yet (registration flow)
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);

module.exports = router;
