const User = require("../models/User");

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
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
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
      return res.status(400).json({ err_msg: "Please fill all required fields" });
    }

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

    return res.status(201).json({
      succ_msg: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("addAddress error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
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
        eachAddress.isDefault =
          eachAddress._id.toString() === addressId;
      });
    }

    await user.save();

    return res.status(200).json({
      succ_msg: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("updateAddress error:", error);
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
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
    return res.status(500).json({ err_msg: "Something went wrong, please try again" });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
