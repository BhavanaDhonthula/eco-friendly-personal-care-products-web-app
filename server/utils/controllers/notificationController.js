const User = require("../models/User");
const Seller = require("../models/Seller");

// POST /save-fcm-token  (authenticated user)
// body: { fcmToken }
// Adds the device's FCM token to the user's fcmTokens array (if not already
// present) so push notifications can be delivered to this device.
const saveUserFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ err_msg: "fcmToken is required" });
    }

    await User.updateOne(
      { _id: req.userId },
      { $addToSet: { fcmTokens: fcmToken } },
    );

    return res
      .status(200)
      .json({ succ_msg: "Device registered for notifications" });
  } catch (error) {
    console.log("saveUserFcmToken error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// DELETE /save-fcm-token  (authenticated user) - e.g. call on logout
const removeUserFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ err_msg: "fcmToken is required" });
    }

    await User.updateOne(
      { _id: req.userId },
      { $pull: { fcmTokens: fcmToken } },
    );

    return res.status(200).json({ succ_msg: "Device unregistered" });
  } catch (error) {
    console.log("removeUserFcmToken error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /seller-save-fcm-token  (authenticated seller)
const saveSellerFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ err_msg: "fcmToken is required" });
    }

    await Seller.updateOne(
      { _id: req.sellerId },
      { $addToSet: { fcmTokens: fcmToken } },
    );

    return res
      .status(200)
      .json({ succ_msg: "Device registered for notifications" });
  } catch (error) {
    console.log("saveSellerFcmToken error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// DELETE /seller-save-fcm-token  (authenticated seller)
const removeSellerFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ err_msg: "fcmToken is required" });
    }

    await Seller.updateOne(
      { _id: req.sellerId },
      { $pull: { fcmTokens: fcmToken } },
    );

    return res.status(200).json({ succ_msg: "Device unregistered" });
  } catch (error) {
    console.log("removeSellerFcmToken error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = {
  saveUserFcmToken,
  removeUserFcmToken,
  saveSellerFcmToken,
  removeSellerFcmToken,
};
