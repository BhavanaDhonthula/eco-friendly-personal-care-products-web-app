const Seller = require("../models/Seller");
const User = require("../models/User");
const { sendPushNotification } = require("../utils/pushNotification");
const { sendBulkSms } = require("../utils/smsNotification");

// GET /products
// Returns a flattened list of all products from all sellers, each
// annotated with sellerId and sellerName so the frontend/cart can
// reference back to the seller that owns the product.
const getAllProducts = async (req, res) => {
  try {
    const sellers = await Seller.find(
      {},
      "storeName products ecoVerificationStatus",
    );

    let allProducts = sellers.flatMap((seller) =>
      seller.products.map((product) => ({
        ...product.toObject(),
        sellerId: seller._id,
        sellerName: seller.storeName,
        sellerEcoStatus: seller.ecoVerificationStatus,
      })),
    );

    const { category, brand, sort } = req.query;
    console.log(req.query);

    if (category) {
      allProducts = allProducts.filter(
        (product) => product.category === category,
      );
    }

    if (brand) {
      const brands = brand.split(",");
      allProducts = allProducts.filter((product) =>
        brands.includes(product.brand.trim()),
      );
    }

    if (sort === "lowToHigh") {
      allProducts.sort((a, b) => a.price - b.price);
    }

    if (sort === "highToLow") {
      allProducts.sort((a, b) => b.price - a.price);
    }

    return res.status(200).json(allProducts);
  } catch (error) {
    console.log("getAllProducts error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// GET /productDetailsPage/:id
// Returns the single product (wrapped in an array to match the
// frontend's `productData[0]` usage), annotated with seller info.
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findOne(
      { "products._id": id },
      "storeName products ecoVerificationStatus",
    );

    if (!seller) {
      return res.status(404).json({ err_msg: "Product not found" });
    }

    const product = seller.products.find(
      (eachProduct) => eachProduct._id.toString() === id,
    );

    if (!product) {
      return res.status(404).json({ err_msg: "Product not found" });
    }

    const productData = {
      ...product.toObject(),
      sellerId: seller._id,
      sellerName: seller.storeName,
      sellerEcoStatus: seller.ecoVerificationStatus,
    };

    return res.status(200).json([productData]);
  } catch (error) {
    console.log("getProductById error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /products (seller adds a new product)
// Requires seller auth - the product is pushed into req.sellerId's
// `products` array.
const addProduct = async (req, res) => {
  try {
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

    let ingredients = [];
    let specifications = [];

    try {
      ingredients = req.body.ingredients
        ? JSON.parse(req.body.ingredients)
        : [];
    } catch (e) {
      ingredients = [];
    }

    try {
      specifications = req.body.specifications
        ? JSON.parse(req.body.specifications)
        : [];
    } catch (e) {
      specifications = [];
    }

    if (!productName || !brand || !category || !price || !description) {
      return res
        .status(400)
        .json({ err_msg: "Missing required product fields" });
    }

    // ── Validate stock ──────────────────────────────────────────────
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res
        .status(400)
        .json({ err_msg: "Stock must be a non-negative number" });
    }
    // ───────────────────────────────────────────────────────────────

    const files = req.files || {};
    const thumbnail = files.thumbnail ? files.thumbnail[0].filename : "";
    const productImgs = files.productImgs
      ? files.productImgs.map((file) => file.filename)
      : [];

    const newProduct = {
      productName,
      brand,
      category,
      price: parseFloat(price),
      quantity,
      stock: parsedStock,
      description,
      ingredients,
      ingredientType,
      carbonFootprint: parseFloat(carbonFootprint) || 0,
      packagingType,
      specifications,
      thumbnail,
      productImgs,
    };

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({ err_msg: "Seller not found" });
    }

    seller.products.push(newProduct);
    await seller.save();

    // ── Notify users: new product added ─────────────────────────────────────
    // Fire-and-forget: don't block/fail the response if push notifications
    // aren't configured yet or a send fails. sendPushNotification always
    // logs what happened (including "no devices registered yet"), so check
    // the server console to confirm this fired.
    User.find({}, "fcmTokens mobileNumber")
      .then((allUsers) => {
        const allTokens = allUsers.flatMap((u) => u.fcmTokens || []);
        sendPushNotification(allTokens, {
          title: "New product added 🌱",
          body: `${seller.storeName} just added "${productName}" to the store`,
          data: {
            type: "NEW_PRODUCT",
            productId:
              seller.products[seller.products.length - 1]._id.toString(),
            sellerId: seller._id.toString(),
          },
        });

        // NOTE: fires one SMS per registered user, per product. That's
        // real money once Twilio is live - fine for now since you asked
        // for it, but worth reconsidering before this ships to production.
        const allMobileNumbers = allUsers.map((u) => u.mobileNumber);
        sendBulkSms(
          allMobileNumbers,
          `EcoGlow: ${seller.storeName} just added "${productName}". Check it out!`,
        );
      })
      .catch((error) =>
        console.log("new-product notification error:", error.message),
      );
    // ─────────────────────────────────────────────────────────────────────

    return res.status(201).json({ succ_msg: "Product added successfully" });
  } catch (error) {
    console.log("addProduct error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// GET /seller-products (seller's own products, for dashboard)
const getSellerProducts = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId, "storeName products");
    if (!seller) {
      return res.status(404).json({ err_msg: "Seller not found" });
    }

    return res.status(200).json(seller.products);
  } catch (error) {
    console.log("getSellerProducts error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

///// GET / seller-profile - returns storeName, email, storeLogo for the logged-in seller

const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(
      req.sellerId,
      "storeName email storeLogo mobileNumber mobileVerified businessAddress gstNumber businessType sustainabilityCertifications packagingCommitment sourcingPractice carbonNeutralShipping ecoVerificationScore ecoVerificationStatus",
    );
    if (!seller) {
      return res.status(404).json({ err_msg: "Seller not found" });
    }
    return res.status(200).json(seller);
  } catch (error) {
    console.log("getSellerProfile error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  getSellerProducts,
  getSellerProfile,
};
