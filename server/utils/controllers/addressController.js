const User = require("../models/User");
const Seller = require("../models/Seller");
const {
  lookupPincode,
  isValidPincodeFormat,
} = require("../utils/pincodeService");

// Given a resolved delivery state, checks the sellers behind the user's
// current cart items and returns the names of any sellers that don't
// service that state. Purely informational (doesn't block saving an
// address) - the same address may be used for future orders with a
// different cart.
const findNonServiceableSellersForCart = async (userId, state) => {
  if (!state) return [];

  const user = await User.findById(userId, "cartItems");
  if (!user || !user.cartItems.length) return [];

  const sellerIds = [
    ...new Set(user.cartItems.map((item) => item.sellerId.toString())),
  ];

  const sellers = await Seller.find(
    { _id: { $in: sellerIds } },
    "storeName nonServiceableStates",
  );

  return sellers
    .filter((seller) =>
      (seller.nonServiceableStates || []).some(
        (blockedState) =>
          blockedState.trim().toLowerCase() === state.trim().toLowerCase(),
      ),
    )
    .map((seller) => seller.storeName);
};

// GET /addresses/verify-pincode/:pincode
// Validates the PIN code is real (via the India Post API) and, if the user
// currently has items in their cart, flags any sellers among those items
// that don't deliver to the resolved state.
const verifyPincodeHandler = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!isValidPincodeFormat(pincode)) {
      return res
        .status(400)
        .json({ valid: false, err_msg: "PIN code must be a 6-digit number" });
    }

    const lookupResult = await lookupPincode(pincode);
    if (!lookupResult.valid) {
      return res
        .status(400)
        .json({ valid: false, err_msg: lookupResult.reason });
    }

    const nonServiceableSellers = await findNonServiceableSellersForCart(
      req.userId,
      lookupResult.state,
    );

    return res.status(200).json({
      valid: true,
      city: lookupResult.city,
      district: lookupResult.district,
      state: lookupResult.state,
      area: lookupResult.area,
      nonServiceableSellers,
    });
  } catch (error) {
    console.log("verifyPincodeHandler error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// GET /addresses - returns the logged-in user's saved addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId, "addresses");
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    return res.status(200).json(user.addresses);
  } catch (error) {
    console.log("getAddresses error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// POST /addresses - adds a new address to the user's addresses array
const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      pincode,
      locality,
      addressLine,
      city,
      state,
      landmark,
      addressType,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !mobileNumber ||
      !pincode ||
      !addressLine ||
      !city ||
      !state
    ) {
      return res
        .status(400)
        .json({ err_msg: "Please fill all required fields" });
    }

    // ── Validate PIN code (blocking) ────────────────────────────────────────
    const lookupResult = await lookupPincode(pincode);
    if (!lookupResult.valid) {
      return res.status(400).json({ err_msg: lookupResult.reason });
    }
    // ─────────────────────────────────────────────────────────────────────

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    const newAddress = {
      fullName,
      mobileNumber,
      pincode,
      locality,
      addressLine,
      city,
      state,
      landmark,
      addressType: addressType || "Home",
      isDefault: !!isDefault,
    };

    // If this is marked default (or it's the user's first address),
    // unset isDefault on all the other addresses.
    if (newAddress.isDefault || user.addresses.length === 0) {
      newAddress.isDefault = true;
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push(newAddress);
    await user.save();

    // Non-blocking heads-up: does any seller in the current cart skip this state?
    const nonServiceableSellers = await findNonServiceableSellersForCart(
      req.userId,
      lookupResult.state,
    );

    return res.status(201).json({
      succ_msg: "Address added successfully",
      addresses: user.addresses,
      nonServiceableSellers,
    });
  } catch (error) {
    console.log("addAddress error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// PUT /addresses/:addressId - edits an existing address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      fullName,
      mobileNumber,
      pincode,
      locality,
      addressLine,
      city,
      state,
      landmark,
      addressType,
      isDefault,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    const address = user.addresses.find(
      (eachAddress) => eachAddress._id.toString() === addressId,
    );

    if (!address) {
      return res.status(404).json({ err_msg: "Address not found" });
    }

    // ── Validate PIN code (blocking) if it's being changed ──────────────────
    let lookupResult = null;
    if (pincode !== undefined && pincode !== address.pincode) {
      lookupResult = await lookupPincode(pincode);
      if (!lookupResult.valid) {
        return res.status(400).json({ err_msg: lookupResult.reason });
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    if (fullName !== undefined) address.fullName = fullName;
    if (mobileNumber !== undefined) address.mobileNumber = mobileNumber;
    if (pincode !== undefined) address.pincode = pincode;
    if (locality !== undefined) address.locality = locality;
    if (addressLine !== undefined) address.addressLine = addressLine;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (landmark !== undefined) address.landmark = landmark;
    if (addressType !== undefined) address.addressType = addressType;

    if (isDefault) {
      user.addresses.forEach((eachAddress) => {
        eachAddress.isDefault = eachAddress._id.toString() === addressId;
      });
    }

    await user.save();

    const nonServiceableSellers = lookupResult
      ? await findNonServiceableSellersForCart(req.userId, lookupResult.state)
      : [];

    return res.status(200).json({
      succ_msg: "Address updated successfully",
      addresses: user.addresses,
      nonServiceableSellers,
    });
  } catch (error) {
    console.log("updateAddress error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

// DELETE /addresses/:addressId - removes an address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ err_msg: "User not found" });
    }

    const wasDefault = user.addresses.find(
      (eachAddress) => eachAddress._id.toString() === addressId,
    )?.isDefault;

    user.addresses = user.addresses.filter(
      (eachAddress) => eachAddress._id.toString() !== addressId,
    );

    // If we removed the default address, promote the first remaining
    // address (if any) to default.
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      succ_msg: "Address removed successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("deleteAddress error:", error);
    return res
      .status(500)
      .json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  verifyPincodeHandler,
};
