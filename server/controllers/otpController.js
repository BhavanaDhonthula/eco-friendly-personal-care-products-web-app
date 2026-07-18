const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { sendOtp, verifyOtp } = require("../utils/otpService");

// POST /send-otp
// body: { mobileNumber }
const sendOtpHandler = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const result = await sendOtp(mobileNumber);

    if (!result.ok) {
      return res.status(400).json({ err_msg: result.err_msg });
    }
    return res.status(200).json({ succ_msg: result.succ_msg });
  } catch (error) {
    console.log("sendOtpHandler error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /verify-otp
// body: { mobileNumber, otp }
// On success, issues a short-lived signed token proving this mobile number
// was verified. The registration endpoints (registerUser / registerSeller)
// require this token so a mobile number can't be attached to an account
// without actually completing OTP verification for it.
const verifyOtpHandler = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const result = await verifyOtp(mobileNumber, otp);

    if (!result.ok) {
      return res.status(400).json({ err_msg: result.err_msg });
    }

    const mobileVerificationToken = jwt.sign(
      { mobileNumber, purpose: "mobile-verification" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      succ_msg: result.succ_msg,
      mobileVerificationToken,
    });
  } catch (error) {
    console.log("verifyOtpHandler error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// Shared helper used by registerUser / registerSeller to confirm the
// mobileVerificationToken presented at registration really does match the
// mobile number being registered, and hasn't expired.
const verifyMobileVerificationToken = (token, mobileNumber) => {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return (
      payload.purpose === "mobile-verification" &&
      payload.mobileNumber === mobileNumber
    );
  } catch (error) {
    return false;
  }
};

module.exports = {
  sendOtpHandler,
  verifyOtpHandler,
  verifyMobileVerificationToken,
};
