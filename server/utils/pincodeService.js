// ── PIN code validation ───────────────────────────────────────────────────────
// Uses India Post's public pincode API (no API key required):
//   https://api.postalpincode.in/pincode/<pincode>
// Returns the post office(s), district and state registered against that
// PIN code, which is used to (a) confirm the PIN code actually exists and
// (b) resolve the destination state so we can check seller serviceability.

const isValidPincodeFormat = (pincode) => /^[1-9]\d{5}$/.test(pincode || "");

// lookupPincode("500001") -> { valid: true, city, district, state, area }
//                          -> { valid: false, reason: "..." }
const lookupPincode = async (pincode) => {
  if (!isValidPincodeFormat(pincode)) {
    return { valid: false, reason: "PIN code must be a 6-digit number" };
  }

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
    );

    if (!response.ok) {
      return {
        valid: false,
        reason: "Unable to verify PIN code right now, please try again",
      };
    }

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : null;

    if (!result || result.Status !== "Success" || !result.PostOffice?.length) {
      return { valid: false, reason: "This PIN code does not exist" };
    }

    const [firstOffice] = result.PostOffice;

    return {
      valid: true,
      area: firstOffice.Name,
      district: firstOffice.District,
      state: firstOffice.State,
      city: firstOffice.Block || firstOffice.District,
    };
  } catch (error) {
    console.log("lookupPincode error:", error.message);
    return {
      valid: false,
      reason: "Unable to verify PIN code right now, please try again",
    };
  }
};

module.exports = { lookupPincode, isValidPincodeFormat };
