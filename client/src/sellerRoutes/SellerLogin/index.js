import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import "./index.css";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const SellerLogin = () => {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmitLoginSeller = async (e) => {
    e.preventDefault();

    if (storeName === "" || email === "") {
      alert("Please fill all the fields");
      return;
    }

    console.log(storeName, email);

    const sellerDetails = {
      storeName,
      email,
    };

    const url = "http://localhost:8000/seller-login";
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sellerDetails),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      Cookies.set("seller_access_token", data.sellerJwtToken, { expires: 30 });
      navigate("/seller-dashboard", { replace: true });
      console.log(data.sellerJwtToken);
    } else {
      console.log(data);
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
      <div className="seller-login-container mt-3  container-fluid">
        <div className="row  d-flex justify-content-center">
          <div className="col-12">
            <h1 className="seller-login-heading p-2 text-center text-black">
              Seller Login
            </h1>
          </div>
          <div className="col-12">
            <form
              onSubmit={onSubmitLoginSeller}
              className="seller-login-form-container"
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
                  setEmail(e.target.value.toLowerCase());
                }}
              />
              <div className="btn-container text-center mt-3">
                <button type="submit" className="btn btn-success">
                  Login
                </button>
              </div>
            </form>
          </div>
          <div className="col-12">
            <hr />
            <p className="fw-bold">
              Don't have an account?
              <Link to="/seller-register">
                <span className="text-success text-decoration-underline">
                  Register
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Popup>
  );
};
export default SellerLogin;
