const express = require("express");
const router = express.Router();

const {
  authenticateUserToken,
  authenticateSellerToken,
} = require("../middlewares/authenticateToken");

const {
  saveUserFcmToken,
  removeUserFcmToken,
  saveSellerFcmToken,
  removeSellerFcmToken,
} = require("../controllers/notificationController");

router.post("/save-fcm-token", authenticateUserToken, saveUserFcmToken);
router.delete("/save-fcm-token", authenticateUserToken, removeUserFcmToken);

router.post(
  "/seller-save-fcm-token",
  authenticateSellerToken,
  saveSellerFcmToken,
);
router.delete(
  "/seller-save-fcm-token",
  authenticateSellerToken,
  removeSellerFcmToken,
);

module.exports = router;
