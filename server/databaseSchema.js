const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: { type: [String], required: true },
  specifications: { type: [String], required: true },
  ingredientType: { type: String },
  carbonFootprint: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  productImgs: { type: [String], required: true },
  packagingType: { type: String, required: true },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
  },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String },
});

const sellerSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  email: { type: String, require: true, unique: true },
  storeLogo: { type: String, required: true },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
    },
  ],
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Seller = mongoose.model("Seller", sellerSchema);
const Cart = mongoose.model("Cart", cartSchema);

module.exports = {
  Product,
  User,
  Seller,
  Cart,
};
