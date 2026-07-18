const express = require("express");
const router = express.Router();

const { authenticateUserToken } = require("../middlewares/authenticateToken");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.use(authenticateUserToken);

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:cartItemId", updateCartItem);
router.delete("/cart/:cartItemId", removeFromCart);
router.delete("/cart", clearCart);

module.exports = router;
