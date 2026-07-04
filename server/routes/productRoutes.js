const express = require("express");
const router = express.Router();

const upload = require("../utils/upload");
const { authenticateSellerToken } = require("../middlewares/authenticateToken");
const {
  getAllProducts,
  getProductById,
  addProduct,
  getSellerProducts,
  getSellerProfile,
} = require("../controllers/productController");

router.get("/products", getAllProducts);
router.get("/productDetailsPage/:id", getProductById);

console.log("authenticateSellerToken:", typeof authenticateSellerToken);
console.log("upload:", typeof upload);
console.log("upload.fields:", typeof upload.fields);
console.log("addProduct:", typeof addProduct);
router.post(
  "/products",
  authenticateSellerToken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "productImgs", maxCount: 10 },
  ]),
  addProduct,
);

router.get("/seller-products", authenticateSellerToken, getSellerProducts);
router.get("/seller-profile", authenticateSellerToken, getSellerProfile);

module.exports = router;
