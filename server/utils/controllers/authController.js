const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Seller = require("../models/Seller");

const { isValidMobileNumber } = require("../utils/otpService");
const { verifyMobileVerificationToken } = require("./otpController");
const calculateSellerEcoScore = require("../utils/calculateSellerEcoScore");
const { lookupPincode } = require("../utils/pincodeService");

const dotenv = require("dotenv");
dotenv.config();

// POST /register  (user/customer registration)
const registerUser = async (req, res) => {
  try {
    const { username, email, password, mobileNumber, mobileVerificationToken } =
      req.body;

    if (!username || !email || !password || !mobileNumber) {
      return res.status(400).json({ err_msg: "All fields are required" });
    }

    if (!isValidMobileNumber(mobileNumber)) {
      return res
        .status(400)
        .json({ err_msg: "Enter a valid 10-digit mobile number" });
    }

    if (!verifyMobileVerificationToken(mobileVerificationToken, mobileNumber)) {
      return res.status(400).json({
        err_msg: "Please verify your mobile number via OTP before registering",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ err_msg: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobileNumber,
      mobileVerified: true,
      fcmTokens: [],
      cartItems: [],
      addresses: [],
    });

    await newUser.save();

    return res.status(201).json({ succ_msg: "User registered successfully" });
  } catch (error) {
    console.log("registerUser error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /login (user/customer login)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ err_msg: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ err_msg: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ err_msg: "Invalid email or password" });
    }

    const payload = { userId: user._id, email: user.email };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "30d",
    });

    return res.status(200).json({ jwtToken, succ_msg: "Login Successful" });
  } catch (error) {
    console.log("loginUser error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId, "username email mobileNumber");
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("getUserProfile error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// DELETE /delete-account
// Requires the user to confirm their password before deleting.
// Deletes the User document. Also removes the user's comments from
// all seller products so orphaned reviews don't remain in the DB.
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ err_msg: "Password is required to delete your account" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    // Verify password before allowing deletion
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ err_msg: "Incorrect password. Account not deleted." });
    }

    // Remove this user's comments from all seller products
    const sellers = await Seller.find({
      "products.comments.userId": req.userId,
    });
    for (const seller of sellers) {
      let changed = false;
      for (const product of seller.products) {
        const before = product.comments.length;
        product.comments = product.comments.filter(
          (c) => c.userId.toString() !== req.userId,
        );
        if (product.comments.length !== before) changed = true;
      }
      if (changed) await seller.save();
    }

    // Delete the user document
    await User.findByIdAndDelete(req.userId);

    return res.status(200).json({ succ_msg: "Account deleted successfully" });
  } catch (error) {
    console.log("deleteAccount error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /seller-register (seller registration with store logo upload)
const registerSeller = async (req, res) => {
  try {
    // ── Must already have a user account, and only one seller account per
    // user is allowed ────────────────────────────────────────────────────
    // req.userId is set by authenticateUserToken (mounted on this route).
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser) {
      return res.status(401).json({
        err_msg:
          "Please log in to your user account before registering as a seller",
      });
    }

    const existingSellerForUser = await Seller.findOne({ userId: req.userId });
    if (existingSellerForUser) {
      return res.status(400).json({
        err_msg:
          "This account already has a seller/store registered. Each user can only have one seller account.",
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    const {
      storeName,
      email,
      mobileNumber,
      mobileVerificationToken,
      businessType,
      packagingCommitment,
      sourcingPractice,
      carbonNeutralShipping,
      gstNumber,
      addressLine,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !storeName ||
      !email ||
      !mobileNumber ||
      !businessType ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({ err_msg: "All fields are required" });
    }

    if (!isValidMobileNumber(mobileNumber)) {
      return res
        .status(400)
        .json({ err_msg: "Enter a valid 10-digit mobile number" });
    }

    if (!verifyMobileVerificationToken(mobileVerificationToken, mobileNumber)) {
      return res.status(400).json({
        err_msg: "Please verify your mobile number via OTP before registering",
      });
    }

    // ── Validate the seller's business location PIN code ────────────────────
    const pincodeLookup = await lookupPincode(pincode);
    if (!pincodeLookup.valid) {
      return res.status(400).json({ err_msg: pincodeLookup.reason });
    }
    // ─────────────────────────────────────────────────────────────────────

    const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
    if (existingSeller) {
      return res
        .status(400)
        .json({ err_msg: "Seller already exists with this email" });
    }

    // multipart/form-data sends arrays/booleans as strings, so parse them.
    let sustainabilityCertifications = [];
    try {
      sustainabilityCertifications = req.body.sustainabilityCertifications
        ? JSON.parse(req.body.sustainabilityCertifications)
        : [];
    } catch (e) {
      sustainabilityCertifications = [];
    }

    const storeLogo = req.file ? req.file.filename : "";

    // ── Eco-seller verification: score the seller's declared practices ──────
    const ecoDetails = {
      businessType,
      packagingCommitment,
      sourcingPractice,
      sustainabilityCertifications,
      carbonNeutralShipping: carbonNeutralShipping === "true",
    };
    const { ecoVerificationScore, ecoVerificationStatus } =
      calculateSellerEcoScore(ecoDetails);
    // ──────────────────────────────────────────────────────────────────────

    const newSeller = new Seller({
      userId: req.userId,
      storeName,
      email: email.toLowerCase(),
      storeLogo,
      mobileNumber,
      mobileVerified: true,
      fcmTokens: [],
      businessAddress: {
        addressLine,
        city,
        state,
        pincode,
      },
      gstNumber: gstNumber || undefined,
      businessType,
      sustainabilityCertifications,
      packagingCommitment: packagingCommitment || "Standard",
      sourcingPractice: sourcingPractice || "Standard",
      carbonNeutralShipping: carbonNeutralShipping === "true",
      ecoVerificationScore,
      ecoVerificationStatus,
      products: [],
      orders: [],
    });

    await newSeller.save();

    return res.status(201).json({
      succ_msg: "Seller registered successfully",
      ecoVerificationScore,
      ecoVerificationStatus,
    });
  } catch (error) {
    console.log("registerSeller error:", error);
    // Race-condition safety net: unique index on userId/email caught two
    // near-simultaneous submissions before the explicit pre-checks did.
    if (error.code === 11000) {
      if (error.keyPattern?.userId) {
        return res.status(400).json({
          err_msg:
            "This account already has a seller/store registered. Each user can only have one seller account.",
        });
      }
      return res
        .status(400)
        .json({ err_msg: "Seller already exists with this email" });
    }
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /seller-login (no password in this app, identified by storeName + email)
const loginSeller = async (req, res) => {
  try {
    const { storeName, email } = req.body;

    if (!storeName || !email) {
      return res.status(400).json({ err_msg: "All fields are required" });
    }

    const seller = await Seller.findOne({
      email: email.toLowerCase(),
      storeName,
    });

    if (!seller) {
      return res.status(400).json({ err_msg: "Invalid store name or email" });
    }

    const payload = { sellerId: seller._id, email: seller.email };
    const sellerJwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "30d",
    });

    return res
      .status(200)
      .json({ sellerJwtToken, succ_msg: "Login Successful" });
  } catch (error) {
    console.log("loginSeller error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// GET /seller-account-status (authenticated user)
// Lets the client check, before showing the seller-register form, whether
// this user already has a seller account - so it can redirect to the
// seller dashboard/login instead of letting them fill out the whole form
// only to be rejected at submit time.
const getSellerAccountStatus = async (req, res) => {
  try {
    const existingSeller = await Seller.findOne(
      { userId: req.userId },
      "storeName email",
    );
    return res.status(200).json({
      hasSellerAccount: !!existingSeller,
      storeName: existingSeller?.storeName || null,
    });
  } catch (error) {
    console.log("getSellerAccountStatus error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  deleteAccount,
  registerSeller,
  loginSeller,
  getSellerAccountStatus,
};
