import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { ImLeaf } from "react-icons/im";
import { sendOtp, verifyOtp } from "../../services/otpApi";

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const businessTypes = [
  "Select",
  "Certified Organic Manufacturer",
  "Manufacturer",
  "Handmade / Artisan",
  "Reseller",
  "Distributor",
];

const packagingCommitments = [
  "Select",
  "Plastic-Free",
  "Biodegradable",
  "Recyclable",
  "Standard",
];

const sourcingPractices = [
  "Select",
  "Organic / Sustainably Farmed",
  "Locally Sourced",
  "Upcycled / Recycled Materials",
  "Standard",
];

const certificationOptions = [
  "USDA Organic",
  "Ecocert",
  "GOTS Certified",
  "Fair Trade Certified",
  "Leaping Bunny (Cruelty-Free)",
  "FSC Certified",
  "B Corp Certified",
];

const SellerRegister = () => {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [storeLogo, setStoreLogo] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  // ── Mobile OTP verification ──────────────────────────────────────────────
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileVerificationToken, setMobileVerificationToken] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const isMobileValid = MOBILE_REGEX.test(mobileNumber);

  // ── Business location details ────────────────────────────────────────────
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // ── Eco-seller verification details ──────────────────────────────────────
  const [businessType, setBusinessType] = useState("");
  const [packagingCommitment, setPackagingCommitment] = useState("");
  const [sourcingPractice, setSourcingPractice] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [carbonNeutralShipping, setCarbonNeutralShipping] = useState(false);

  // ── One seller account per user: check status before showing the form ───
  // (The route itself is also wrapped in <ProtectedRoute> in App.js, so a
  // logged-out visitor never reaches this page at all.)
  const [statusChecked, setStatusChecked] = useState(false);
  const [alreadyHasSellerAccount, setAlreadyHasSellerAccount] = useState(false);
  const [existingStoreName, setExistingStoreName] = useState("");

  useEffect(() => {
    const checkSellerAccountStatus = async () => {
      const token = Cookies.get("access_token");
      if (!token) {
        setStatusChecked(true);
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:8000/seller-account-status",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await response.json();
        if (response.ok && data.hasSellerAccount) {
          setAlreadyHasSellerAccount(true);
          setExistingStoreName(data.storeName || "");
        }
      } catch (error) {
        console.log("checkSellerAccountStatus error:", error);
      } finally {
        setStatusChecked(true);
      }
    };
    checkSellerAccountStatus();
  }, []);

  const onChangeSetShopLogo = (e) => {
    const shopLogoFile = e.target.files?.[0];
    console.log(shopLogoFile);
    setStoreLogo(shopLogoFile);
  };

  const onChangeMobileNumber = (e) => {
    setMobileNumber(e.target.value);
    setMobileVerified(false);
    setMobileVerificationToken("");
    setOtpSent(false);
    setOtp("");
    setOtpMsg("");
  };

  const onClickSendOtp = async () => {
    setOtpMsg("");
    if (!isMobileValid) {
      setOtpMsg("Enter a valid 10-digit mobile number first");
      return;
    }
    setOtpSending(true);
    try {
      await sendOtp(mobileNumber);
      setOtpSent(true);
      setOtpMsg(
        "OTP sent! Check your phone (or the server console in dev mode).",
      );
    } catch (error) {
      setOtpMsg(error.message);
    } finally {
      setOtpSending(false);
    }
  };

  const onClickVerifyOtp = async () => {
    setOtpMsg("");
    if (!otp) {
      setOtpMsg("Enter the OTP");
      return;
    }
    setOtpVerifying(true);
    try {
      const data = await verifyOtp(mobileNumber, otp);
      setMobileVerified(true);
      setMobileVerificationToken(data.mobileVerificationToken);
      setOtpMsg("✅ Mobile number verified");
    } catch (error) {
      setOtpMsg(error.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const onToggleCertification = (cert) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    setErrMsg("");

    if (storeName === "" || email === "") {
      setErrMsg("Please fill all the fields");
      return;
    }

    if (!storeLogo) {
      setErrMsg("Please upload store logo");
      return;
    }

    if (!isMobileValid) {
      setErrMsg("Enter a valid 10-digit mobile number");
      return;
    }

    if (!mobileVerified || !mobileVerificationToken) {
      setErrMsg("Please verify your mobile number via OTP before registering");
      return;
    }

    if (!businessType || businessType === "Select") {
      setErrMsg("Please select your business type");
      return;
    }

    if (!addressLine || !city || !stateName || !pincode) {
      setErrMsg("Please fill in your business location details");
      return;
    }

    if (!/^[1-9]\d{5}$/.test(pincode)) {
      setErrMsg("Enter a valid 6-digit PIN code");
      return;
    }

    const sellerDetails = {
      storeName,
      email,
      storeLogo,
      mobileNumber,
      mobileVerificationToken,
      addressLine,
      city,
      state: stateName,
      pincode,
      gstNumber,
      businessType,
      packagingCommitment:
        packagingCommitment && packagingCommitment !== "Select"
          ? packagingCommitment
          : "Standard",
      sourcingPractice:
        sourcingPractice && sourcingPractice !== "Select"
          ? sourcingPractice
          : "Standard",
      sustainabilityCertifications: JSON.stringify(certifications),
      carbonNeutralShipping: String(carbonNeutralShipping),
    };

    const formData = new FormData();

    Object.entries(sellerDetails).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const token = Cookies.get("access_token");
    if (!token) {
      setErrMsg("Please log in to your user account first");
      navigate("/login", { replace: true });
      return;
    }

    const url = "http://localhost:8000/seller-register";
    const options = {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(response);

    if (response.ok) {
      navigate("/seller-login", { replace: true });
      setEmail("");
      setStoreName("");
      setStoreLogo(null);
      console.log(data);
    } else {
      setErrMsg(data.err_msg || "Registration failed, please try again");
    }
  };

  // ── Gate: one seller account per user ────────────────────────────────────
  if (!statusChecked) {
    return (
      <Popup open modal closeOnDocumentClick={false}>
        <div className="seller-register-container container-fluid text-center p-4">
          <p className="fw-bold mb-0">Checking your account...</p>
        </div>
      </Popup>
    );
  }

  if (alreadyHasSellerAccount) {
    return (
      <Popup
        open
        modal
        closeOnDocumentClick={false}
        overlayStyle={{ background: "trasparent", backdropFilter: "blur(0px)" }}
        contentStyle={{
          border: "none",
          borderRadius: "20px",
          overflow: "hidden",
          width: "50%",
        }}
      >
        <div className="seller-register-container container-fluid text-center p-4">
          <h3 className="fw-bold mb-3">You already have a seller account</h3>
          <p className="mb-4">
            This account is linked to the store{" "}
            <b>{existingStoreName || "your store"}</b>. Each user can only
            register one seller account.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/seller-login" className="btn btn-success">
              Go to Seller Login
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              Back to Store
            </Link>
          </div>
        </div>
      </Popup>
    );
  }
  // ─────────────────────────────────────────────────────────────────────

  return (
    <Popup
      open
      modal
      closeOnDocumentClick={false}
      overlayStyle={{
        background: "trasparent",
        backdropFilter: "blur(0px)",
      }}
      contentStyle={{
        border: "none",
        borderRadius: "20px",
        overflowY: "auto",
        maxHeight: "90vh",
        width: "50%",
      }}
    >
      <div className="seller-register-container container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <h1 className="text-center text-black p-2 seller-register-heading">
              Create Seller Account
            </h1>
          </div>
          <div className="col-12 col-md-6 seller-form-container w-100">
            <form
              encType="multipart/form-data"
              onSubmit={onSubmitRegister}
              className="seller-register-form"
            >
              <input
                autoComplete="true"
                type="text"
                name="storeName"
                placeholder="Store Name"
                className="form-control  fw-bold mt-4 p-2"
                onChange={(e) => {
                  setStoreName(e.target.value);
                }}
              />

              <input
                autoComplete="true"
                type="email"
                name="email"
                placeholder="Email"
                className="form-control  fw-bold mt-4 p-2"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />

              <input
                autoComplete="true"
                type="file"
                name="storeLogo"
                placeholder="Store Logo"
                className="form-control  fw-bold mt-4 p-2"
                onChange={(e) => {
                  onChangeSetShopLogo(e);
                }}
              />

              {/* ── Business location details ───────────────────────────── */}
              <label className="fw-bold mt-4 mb-1">Business Location</label>
              <input
                autoComplete="true"
                type="text"
                placeholder="Address Line (building, street, area)"
                value={addressLine}
                className="form-control fw-bold p-2"
                onChange={(e) => setAddressLine(e.target.value)}
              />
              <div className="d-flex gap-2 mt-2">
                <input
                  autoComplete="true"
                  type="text"
                  placeholder="City"
                  value={city}
                  className="form-control fw-bold p-2"
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  autoComplete="true"
                  type="text"
                  placeholder="State"
                  value={stateName}
                  className="form-control fw-bold p-2"
                  onChange={(e) => setStateName(e.target.value)}
                />
                <input
                  autoComplete="true"
                  type="text"
                  maxLength="6"
                  placeholder="PIN Code"
                  value={pincode}
                  className="form-control fw-bold p-2"
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              <input
                autoComplete="true"
                type="text"
                placeholder="GST Number (optional)"
                value={gstNumber}
                className="form-control fw-bold mt-2 p-2"
                onChange={(e) => setGstNumber(e.target.value)}
              />
              {/* ──────────────────────────────────────────────────────────── */}

              {/* ── Mobile number + OTP verification ────────────────────── */}
              <div className="d-flex gap-2 mt-4">
                <input
                  autoComplete="true"
                  type="text"
                  maxLength="10"
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  className="form-control fw-bold p-2"
                  disabled={mobileVerified}
                  onChange={onChangeMobileNumber}
                />
                <button
                  type="button"
                  className="btn btn-outline-success fw-bold text-nowrap"
                  disabled={!isMobileValid || mobileVerified || otpSending}
                  onClick={onClickSendOtp}
                >
                  {mobileVerified
                    ? "Verified ✅"
                    : otpSending
                      ? "Sending..."
                      : otpSent
                        ? "Resend OTP"
                        : "Send OTP"}
                </button>
              </div>

              {otpSent && !mobileVerified && (
                <div className="d-flex gap-2 mt-2">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter OTP"
                    value={otp}
                    className="form-control fw-bold p-2"
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-success fw-bold text-nowrap"
                    disabled={otpVerifying}
                    onClick={onClickVerifyOtp}
                  >
                    {otpVerifying ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {otpMsg && (
                <p
                  className={`mt-2 fw-bold ${mobileVerified ? "text-success" : "text-danger"}`}
                >
                  {otpMsg}
                </p>
              )}
              {/* ──────────────────────────────────────────────────────────── */}

              {/* ── Eco-seller verification details ─────────────────────── */}
              <div className="d-flex align-items-center gap-2 mt-4">
                <ImLeaf className="text-success" size={18} />
                <b>Eco-Seller Verification</b>
              </div>
              <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                Tell us about your sustainability practices - this determines
                your store's eco-verification badge shown to customers.
              </p>

              <label className="fw-bold mt-2 mb-1" htmlFor="businessType">
                Business Type
              </label>
              <select
                id="businessType"
                className="form-select fw-bold p-2"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                {businessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <label
                className="fw-bold mt-3 mb-1"
                htmlFor="packagingCommitment"
              >
                Packaging Commitment
              </label>
              <select
                id="packagingCommitment"
                className="form-select fw-bold p-2"
                value={packagingCommitment}
                onChange={(e) => setPackagingCommitment(e.target.value)}
              >
                {packagingCommitments.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <label className="fw-bold mt-3 mb-1" htmlFor="sourcingPractice">
                Ingredient / Material Sourcing
              </label>
              <select
                id="sourcingPractice"
                className="form-select fw-bold p-2"
                value={sourcingPractice}
                onChange={(e) => setSourcingPractice(e.target.value)}
              >
                {sourcingPractices.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <p className="fw-bold mt-3 mb-1">
                Sustainability Certifications (if any)
              </p>
              <div className="d-flex flex-wrap gap-3 mb-2">
                {certificationOptions.map((cert) => (
                  <label
                    key={cert}
                    className="d-flex align-items-center gap-1"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <input
                      type="checkbox"
                      checked={certifications.includes(cert)}
                      onChange={() => onToggleCertification(cert)}
                    />
                    {cert}
                  </label>
                ))}
              </div>

              <label className="d-flex align-items-center gap-2 fw-bold mt-2">
                <input
                  type="checkbox"
                  checked={carbonNeutralShipping}
                  onChange={(e) => setCarbonNeutralShipping(e.target.checked)}
                />
                We offer carbon-neutral shipping
              </label>
              {/* ──────────────────────────────────────────────────────────── */}

              {errMsg && <p className="text-danger fw-bold mt-3">{errMsg}</p>}

              <div className="btn-container text-center m-auto mt-3">
                <button type="submit" className="btn btn-success text-white">
                  Register
                </button>
              </div>
            </form>
          </div>
          <div className="col-12">
            <hr />
            <p className="fw-bold">
              Already have an account?
              <Link to="/seller-login">
                <span className="text-success text-decoration-underline">
                  Login
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Popup>
  );
};
export default SellerRegister;
