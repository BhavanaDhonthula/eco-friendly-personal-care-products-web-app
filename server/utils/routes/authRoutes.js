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
  getSellerAccountStatus,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
// ── NEW: returns logged-in user's basic profile ──────────────────────
router.get("/user-profile", authenticateUserToken, getUserProfile);
router.delete("/delete-account", authenticateUserToken, deleteAccount);
// A seller account must be created FROM an existing, logged-in user
// account (authenticateUserToken), and each user may only have one.
router.get(
  "/seller-account-status",
  authenticateUserToken,
  getSellerAccountStatus,
);
router.post(
  "/seller-register",
  authenticateUserToken,
  upload.single("storeLogo"),
  registerSeller,
);
router.post("/seller-login", loginSeller);

module.exports = router;
