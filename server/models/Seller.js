const mongoose = require("mongoose");
const { Schema } = mongoose;

// ── Comment left by a buyer after delivery ────────────────────────────────────
const commentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: true, timestamps: true },
);

// Products are stored as sub-documents inside the Seller document, as
// requested. Each product keeps all the details the storefront needs
// (basic info + eco details + images).
const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    // ── NEW: numeric stock count ──────────────────────────────────────
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // ─────────────────────────────────────────────────────────────────

    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    ingredientType: {
      type: String,
    },
    carbonFootprint: {
      type: Number,
    },
    packagingType: {
      type: String,
    },
    specifications: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
    },
    productImgs: {
      type: [String],
      default: [],
    },
    // ── Reviews / comments ───────────────────────────────────────────────────
    comments: [
      {
        username: String,
        userId: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { _id: true, timestamps: true },
);

// Each order placed by a customer for products belonging to this seller
// is stored inside the seller document. An incoming checkout may create
// one order document per seller (since stock/quantity needs to be
// decremented from that seller's products array).
const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    orderQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userEmail: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    shippingAddress: {
      fullName: String,
      mobileNumber: String,
      pincode: String,
      locality: String,
      addressLine: String,
      city: String,
      state: String,
      landmark: String,
      addressType: String,
    },
    itemsTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    orderTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Accepted",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },
  },
  { _id: true, timestamps: true },
);

const sellerSchema = new Schema(
  {
    storeName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    storeLogo: {
      type: String,
    },
    products: {
      type: [productSchema],
      default: [],
    },
    orders: {
      type: [orderSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
