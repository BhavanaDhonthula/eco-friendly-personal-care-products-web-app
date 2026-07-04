const Seller = require("../models/Seller");

// GET /products
// Returns a flattened list of all products from all sellers, each
// annotated with sellerId and sellerName so the frontend/cart can
// reference back to the seller that owns the product.
const getAllProducts = async (req, res) => {
  try {
    const sellers = await Seller.find({}, "storeName products");

    let allProducts = sellers.flatMap((seller) =>
      seller.products.map((product) => ({
        ...product.toObject(),
        sellerId: seller._id,
        sellerName: seller.storeName,
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
      "storeName products",
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
      "storeName email storeLogo",
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
