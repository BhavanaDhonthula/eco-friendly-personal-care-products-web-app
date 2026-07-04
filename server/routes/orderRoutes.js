const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");

const {
  authenticateUserToken,
  authenticateSellerToken,
} = require("../middlewares/authenticateToken");

const {
  placeOrder,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  updateProduct,
  addComment,
  getComments,
} = require("../controllers/orderController");

// ── User order routes ─────────────────────────────────────────────────────────
router.post("/checkout", authenticateUserToken, placeOrder);
router.get("/orders", authenticateUserToken, getUserOrders);
router.get("/seller-orders", authenticateSellerToken, getSellerOrders);

// Seller updates order status
router.patch(
  "/seller-orders/:orderId/status",
  authenticateSellerToken,
  updateOrderStatus,
);

// Seller edits a product (text + optional image re-upload)
router.put(
  "/seller-products/:productId",
  authenticateSellerToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "productImgs", maxCount: 10 },
  ]),
  updateProduct,
);

router.get("/products/:productId/comments", getComments);
router.post("/products/:productId/comments", authenticateUserToken, addComment);

module.exports = router;
