const BASE_URL = "http://localhost:8000";

// POST /send-otp - body: { mobileNumber }
export const sendOtp = async (mobileNumber) => {
  const response = await fetch(`${BASE_URL}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.err_msg || "Failed to send OTP");
  return data;
};

// POST /verify-otp - body: { mobileNumber, otp }
// Returns { succ_msg, mobileVerificationToken } - the token must be sent
// along with the registration request as proof this number was verified.
export const verifyOtp = async (mobileNumber, otp) => {
  const response = await fetch(`${BASE_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber, otp }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.err_msg || "OTP verification failed");
  return data;
};
