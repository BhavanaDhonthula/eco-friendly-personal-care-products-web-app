const crypto = require("crypto");
const User = require("../models/User");
const Seller = require("../models/Seller");

const DELIVERY_CHARGES = 40;

// Generates a short, human friendly order id, e.g. ORD-7F3K9QZP
const generateOrderId = () =>
  `ORD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

// POST /checkout
// body: { addressId, paymentMethod }
// Reads the user's cartItems, groups them by seller, validates stock,
// decrements product quantities, pushes an order sub-document into each
// affected seller, then clears the user's cart.
const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    if (!user.cartItems || user.cartItems.length === 0) {
      return res.status(400).json({ err_msg: "Your cart is empty" });
    }

    if (!addressId) {
      return res
        .status(400)
        .json({ err_msg: "Please select a delivery address" });
    }

    const shippingAddressDoc = user.addresses.find(
      (eachAddress) => eachAddress._id.toString() === addressId,
    );

    if (!shippingAddressDoc) {
      return res.status(404).json({ err_msg: "Selected address not found" });
    }

    const shippingAddress = {
      fullName: shippingAddressDoc.fullName,
      mobileNumber: shippingAddressDoc.mobileNumber,
      pincode: shippingAddressDoc.pincode,
      locality: shippingAddressDoc.locality,
      addressLine: shippingAddressDoc.addressLine,
      city: shippingAddressDoc.city,
      state: shippingAddressDoc.state,
      landmark: shippingAddressDoc.landmark,
      addressType: shippingAddressDoc.addressType,
    };

    // Group the cart items by their seller, since orders live inside
    // each seller's document.
    const itemsBySeller = new Map();

    user.cartItems.forEach((cartItem) => {
      const sellerId = cartItem.sellerId.toString();
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId).push(cartItem);
    });

    // Fetch all involved sellers up front and validate stock for every item.
    const sellers = await Seller.find({
      _id: { $in: Array.from(itemsBySeller.keys()) },
    });

    const sellersById = new Map(
      sellers.map((seller) => [seller._id.toString(), seller]),
    );

    for (const [sellerId, cartItemsForSeller] of itemsBySeller.entries()) {
      const seller = sellersById.get(sellerId);
      if (!seller) {
        return res
          .status(404)
          .json({ err_msg: "One of the sellers could not be found" });
      }

      for (const cartItem of cartItemsForSeller) {
        const product = seller.products.find(
          (eachProduct) =>
            eachProduct._id.toString() === cartItem.productId.toString(),
        );

        if (!product) {
          return res.status(404).json({
            err_msg: `Product "${cartItem.productName}" is no longer available`,
          });
        }

        if (product.stock < cartItem.orderQuantity) {
          return res.status(400).json({
            err_msg: `Only ${product.stock} unit(s) of "${cartItem.productName}" left in stock`,
          });
        }
      }
    }

    // All validations passed - build orders, decrement stock, and save.
    const ordersCreated = [];
    let grandItemsTotal = 0;

    for (const [sellerId, cartItemsForSeller] of itemsBySeller.entries()) {
      const seller = sellersById.get(sellerId);

      const orderItems = cartItemsForSeller.map((cartItem) => {
        const product = seller.products.find(
          (eachProduct) =>
            eachProduct._id.toString() === cartItem.productId.toString(),
        );

        // Decrement stock
        product.stock -= cartItem.orderQuantity;

        return {
          productId: cartItem.productId,
          productName: cartItem.productName,
          thumbnail: cartItem.thumbnail,
          price: cartItem.price,
          orderQuantity: cartItem.orderQuantity,
        };
      });

      const sellerItemsTotal = orderItems.reduce(
        (total, item) => total + item.price * item.orderQuantity,
        0,
      );

      grandItemsTotal += sellerItemsTotal;

      const order = {
        orderId: generateOrderId(),
        userId: user._id,
        userEmail: user.email,
        items: orderItems,
        shippingAddress,
        itemsTotal: sellerItemsTotal,
        deliveryCharges: DELIVERY_CHARGES,
        orderTotal: sellerItemsTotal + DELIVERY_CHARGES,
        paymentMethod: paymentMethod === "ONLINE" ? "ONLINE" : "COD",
        orderStatus: "Placed",
      };

      seller.orders.push(order);
      await seller.save();

      // Capture the saved sub-document (with its generated _id) for the
      // response sent back to the client.
      const savedOrder = seller.orders[seller.orders.length - 1];
      ordersCreated.push({
        ...savedOrder.toObject(),
        sellerId: seller._id,
        sellerName: seller.storeName,
      });
    }

    // Clear the user's cart now that the order has been placed.
    user.cartItems = [];
    await user.save();

    const overallOrderTotal =
      grandItemsTotal + DELIVERY_CHARGES * ordersCreated.length;

    return res.status(201).json({
      succ_msg: "Order placed successfully",
      orders: ordersCreated,
      itemsTotal: grandItemsTotal,
      deliveryCharges: DELIVERY_CHARGES * ordersCreated.length,
      orderTotal: overallOrderTotal,
      shippingAddress,
    });
  } catch (error) {
    console.log("placeOrder error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// GET /orders - all orders placed by the logged-in user, across all sellers
const getUserOrders = async (req, res) => {
  try {
    const sellers = await Seller.find(
      { "orders.userId": req.userId },
      "storeName orders",
    );

    const userOrders = sellers.flatMap((seller) =>
      seller.orders
        .filter((order) => order.userId.toString() === req.userId)
        .map((order) => ({
          ...order.toObject(),
          sellerId: seller._id,
          sellerName: seller.storeName,
        })),
    );

    // Most recent first
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(userOrders);
  } catch (error) {
    console.log("getUserOrders error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// GET /seller-orders - all orders belonging to the logged-in seller
const getSellerOrders = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId, "storeName orders");
    if (!seller) {
      return res.status(404).json({ err_msg: "Seller not found" });
    }

    const sellerOrders = [...seller.orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    return res.status(200).json(sellerOrders);
  } catch (error) {
    console.log("getSellerOrders error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// ─── PATCH /seller-orders/:orderId/status ────────────────────────────────────
// Seller updates the status of one of their orders
const VALID_STATUSES = [
  "Placed",
  "Accepted",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!VALID_STATUSES.includes(orderStatus))
      return res.status(400).json({ err_msg: "Invalid order status" });

    const seller = await Seller.findById(req.sellerId);
    if (!seller) return res.status(404).json({ err_msg: "Seller not found" });

    const order = seller.orders.find((o) => o._id.toString() === orderId);
    if (!order) return res.status(404).json({ err_msg: "Order not found" });

    order.orderStatus = orderStatus;
    await seller.save();

    return res
      .status(200)
      .json({ succ_msg: "Order status updated", orderStatus });
  } catch (error) {
    console.log("updateOrderStatus error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// ─── PUT /seller-products/:productId ─────────────────────────────────────────
// Seller edits one of their products (text fields; images handled separately)
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      brand,
      category,
      price,
      quantity,
      stock,
      description,
      ingredientType,
      carbonFootprint,
      packagingType,
    } = req.body;

    let ingredients, specifications;
    try {
      ingredients = req.body.ingredients
        ? JSON.parse(req.body.ingredients)
        : undefined;
    } catch {
      ingredients = undefined;
    }
    try {
      specifications = req.body.specifications
        ? JSON.parse(req.body.specifications)
        : undefined;
    } catch {
      specifications = undefined;
    }

    const seller = await Seller.findById(req.sellerId);
    if (!seller) return res.status(404).json({ err_msg: "Seller not found" });

    const product = seller.products.find((p) => p._id.toString() === productId);
    if (!product) return res.status(404).json({ err_msg: "Product not found" });

    // Apply only the fields that were sent
    if (productName !== undefined) product.productName = productName;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (quantity !== undefined) product.quantity = quantity;
    if (stock !== undefined) {
      const parsedStock = parseInt(stock, 10);
      if (!isNaN(parsedStock) && parsedStock >= 0) product.stock = parsedStock;
    }
    if (description !== undefined) product.description = description;
    if (ingredients !== undefined) product.ingredients = ingredients;
    if (ingredientType !== undefined) product.ingredientType = ingredientType;
    if (carbonFootprint !== undefined)
      product.carbonFootprint = parseFloat(carbonFootprint);
    if (packagingType !== undefined) product.packagingType = packagingType;
    if (specifications !== undefined) product.specifications = specifications;

    // Handle new images if uploaded
    const files = req.files || {};
    if (files.thumbnail && files.thumbnail[0])
      product.thumbnail = files.thumbnail[0].filename;
    if (files.productImgs && files.productImgs.length)
      product.productImgs = files.productImgs.map((f) => f.filename);

    await seller.save();
    return res
      .status(200)
      .json({ succ_msg: "Product updated successfully", product });
  } catch (error) {
    console.log("updateProduct error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// ── POST /products/:productId/comments ────────────────────────────────────────
// Authenticated user posts a comment on a delivered product
const addComment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment || comment.trim() === "")
      return res
        .status(400)
        .json({ err_msg: "Rating and comment are required" });

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)
      return res
        .status(400)
        .json({ err_msg: "Rating must be between 1 and 5" });

    // Check the user has a delivered order containing this product
    const allSellers = await Seller.find({ "orders.userId": req.userId });
    let hasDeliveredOrder = false;
    for (const s of allSellers) {
      if (
        s.orders.some(
          (o) =>
            o.userId.toString() === req.userId &&
            o.orderStatus === "Delivered" &&
            o.items.some((item) => item.productId.toString() === productId),
        )
      ) {
        hasDeliveredOrder = true;
        break;
      }
    }
    if (!hasDeliveredOrder)
      return res.status(403).json({
        err_msg:
          "You can only review a product after it has been delivered to you",
      });

    // Find the product and check for duplicate review
    const sellerWithProduct = await Seller.findOne({
      "products._id": productId,
    });
    if (!sellerWithProduct)
      return res.status(404).json({ err_msg: "Product not found" });

    const product = sellerWithProduct.products.id(productId);
    if (!product) return res.status(404).json({ err_msg: "Product not found" });

    const alreadyReviewed = product.comments.some(
      (c) => c.userId.toString() === req.userId,
    );
    if (alreadyReviewed)
      return res
        .status(400)
        .json({ err_msg: "You have already reviewed this product" });

    // Get username
    const user = await User.findById(req.userId, "username");
    if (!user) return res.status(404).json({ err_msg: "User not found" });

    product.comments.push({
      userId: req.userId,
      username: user.username,
      rating: parsedRating,
      comment: comment.trim(),
    });
    await sellerWithProduct.save();

    const saved = product.comments[product.comments.length - 1];
    return res
      .status(201)
      .json({ succ_msg: "Review posted successfully", comment: saved });
  } catch (error) {
    console.log("addComment error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};
// ── GET /products/:productId/comments ─────────────────────────────────────────
// Public — returns all comments for a product
const getComments = async (req, res) => {
  try {
    const { productId } = req.params;

    const seller = await Seller.findOne(
      { "products._id": productId },
      "products.$",
    );
    if (!seller || !seller.products.length)
      return res.status(404).json({ err_msg: "Product not found" });

    const product = seller.products[0];
    const comments = [...(product.comments || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    const avgRating =
      comments.length > 0
        ? (
            comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
          ).toFixed(1)
        : null;

    return res
      .status(200)
      .json({ comments, avgRating, total: comments.length });
  } catch (error) {
    console.log("getComments error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  updateProduct,
  addComment,
  getComments,
};
