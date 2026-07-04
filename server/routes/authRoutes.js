const express = require("express");
const router = express.Router();
const { authenticateUserToken } = require("../middlewares/authenticateToken");

const upload = require("../utils/upload");
const {
  registerUser,
  loginUser,
  getUserProfile,
  deleteAccount,
  registerSeller,
  loginSeller,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
// ── NEW: returns logged-in user's basic profile ──────────────────────
router.get("/user-profile", authenticateUserToken, getUserProfile);
router.delete("/delete-account", authenticateUserToken, deleteAccount);
router.post("/seller-register", upload.single("storeLogo"), registerSeller);
router.post("/seller-login", loginSeller);

module.exports = router;
