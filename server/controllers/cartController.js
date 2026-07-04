const User = require("../models/User");
const Seller = require("../models/Seller");

// GET /cart - returns the logged-in user's cartItems array
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId, "cartItems");
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    return res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("getCart error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /cart
// body: { productId }
// Adds the product to the user's cartItems (or increments orderQuantity
// if it's already present). Product details are looked up from the
// seller's products array so the cart always stores accurate info.
const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ err_msg: "productId is required" });
    }

    const seller = await Seller.findOne(
      { "products._id": productId },
      "products",
    );

    if (!seller) {
      return res.status(404).json({ err_msg: "Product not found" });
    }

    const product = seller.products.find(
      (eachProduct) => eachProduct._id.toString() === productId,
    );

    if (!product) {
      return res.status(404).json({ err_msg: "Product not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    const existingItem = user.cartItems.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      existingItem.orderQuantity += 1;
    } else {
      user.cartItems.push({
        productId: product._id,
        sellerId: seller._id,
        productName: product.productName,
        brand: product.brand,
        price: product.price,
        thumbnail: product.thumbnail,
        orderQuantity: 1,
      });
    }

    await user.save();

    return res.status(200).json({
      succ_msg: "Product added to cart",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("addToCart error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
  }
};

// PUT /cart/:cartItemId
// body: { action: "increase" | "decrease" }  OR  { orderQuantity }
// Updates the quantity of a specific cart item. If decreasing below 1,
// the item is removed from the cart.
const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { action, orderQuantity } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    const cartItem = user.cartItems.find(
      (item) => item._id.toString() === cartItemId,
    );

    if (!cartItem) {
      return res.status(404).json({ err_msg: "Cart item not found" });
    }

    if (typeof orderQuantity === "number") {
      cartItem.orderQuantity = orderQuantity;
    } else if (action === "increase") {
      cartItem.orderQuantity += 1;
    } else if (action === "decrease") {
      cartItem.orderQuantity -= 1;
    }

    if (cartItem.orderQuantity < 1) {
      user.cartItems = user.cartItems.filter(
        (item) => item._id.toString() !== cartItemId,
      );
    }

    await user.save();

    return res.status(200).json({
      succ_msg: "Cart updated",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("updateCartItem error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
  }
};

// DELETE /cart/:cartItemId - removes one item from the cart
const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    user.cartItems = user.cartItems.filter(
      (item) => item._id.toString() !== cartItemId,
    );

    await user.save();

    return res.status(200).json({
      succ_msg: "Item removed from cart",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("removeFromCart error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
  }
};

// DELETE /cart - clears the entire cart (used after a successful order)
const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    user.cartItems = [];
    await user.save();

    return res.status(200).json({ succ_msg: "Cart cleared", cartItems: [] });
  } catch (error) {
    console.log("clearCart error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
