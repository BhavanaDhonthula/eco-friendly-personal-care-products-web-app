const mongoose = require("mongoose");
const { Schema } = mongoose;

// Each cart item stores a snapshot reference to the product plus the
// quantity the user wants to order. We keep enough product details
// (productName, price, thumbnail) so the cart can render quickly
// without extra lookups, but we also keep productId & sellerId so we
// can always re-fetch fresh data (price/stock) at checkout time.
const cartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    orderQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { _id: true, timestamps: true },
);

// A user can save multiple addresses, one of which can be marked default.
const addressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
    },
    addressLine: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true },
);

const userSchema = new Schema(
  {
    username: {
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
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    cartItems: {
      type: [cartItemSchema],
      default: [],
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
