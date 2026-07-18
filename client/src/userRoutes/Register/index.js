import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./index.css";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { sendOtp, verifyOtp } from "../../services/otpApi";

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const Register = (props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errMSg, setErrMsg] = useState("");
  const navigate = useNavigate();

  // ── Mobile OTP verification state ────────────────────────────────────────
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileVerificationToken, setMobileVerificationToken] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  const isMobileValid = MOBILE_REGEX.test(mobileNumber);

  const onChangeMobileNumber = (e) => {
    setMobileNumber(e.target.value);
    // Any change to the number invalidates a previous verification.
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

  const register = async (e) => {
    e.preventDefault();

    if (username === "") {
      setErrMsg("Username required");
      return;
    }
    if (email === "") {
      setErrMsg("Email Required");
      return;
    }
    if (password === "") {
      setErrMsg("Password required");
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

    const userData = {
      username,
      email,
      password,
      mobileNumber,
      mobileVerificationToken,
    };

    const url = "http://localhost:8000/register";
    const configOptions = {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(url, configOptions);
    const data = await response.json();
    if (response.ok) {
      navigate("/login", { replace: true });

      setUsername("");
      setEmail("");
      setPassword("");
      setMobileNumber("");
    } else {
      setErrMsg(data.err_msg || "Registration failed, please try again");
    }
  };

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
        overflow: "hidden",
        width: "50%",
      }}
    >
      {(close) => (
        <div className="register-bg-container">
          <div className="container-fluid ">
            <div className="row">
              <div className="col-12 d-flex align-items-center mt-3 mb-1 rounded-3 justify-content-between text-white">
                <h1 className="register-heading text-center fw-bold p-3">
                  Create an Account
                </h1>
                <span
                  className="fw-bold bg-success p-1 close-dialogue-btn rounded-2 pe-2 ps-2 text-white"
                  onClick={() => {
                    close();
                    navigate("/");
                  }}
                >
                  X
                </span>
              </div>
              <div className="col-12 col-md-6 register-form-container d-flex flex-column align-items-center justify-content-center">
                <form onSubmit={register} className="register-form">
                  <input
                    autoComplete="true"
                    type="text"
                    placeholder="Username"
                    className="form-control w-100 fw-bold mt-2 p-2"
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                  />
                  <input
                    autoComplete="true"
                    type="email"
                    placeholder="Email"
                    className="form-control  fw-bold mt-4 p-2"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="form-control fw-bold mt-4 p-2"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />

                  {/* ── Mobile number + OTP verification ──────────────────── */}
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
                  {/* ──────────────────────────────────────────────────────── */}

                  <div className="register-btn-container text-center mt-3">
                    <button className="btn p-2 fw-bold bg-success text-white">
                      Register
                    </button>

                    {errMSg ? (
                      <p className="text-danger mt-2 fw-bold">{errMSg}</p>
                    ) : (
                      ""
                    )}
                  </div>
                </form>
              </div>
              <div className="col-12 d-flex flex-column align-items-center justify-content-center">
                <hr />
                <p className="fw-bold">
                  Already have acoount?
                  <Link to="/login">
                    <span className="text-success text-decoration-underline pl-3">
                      Login
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};
export default Register;
