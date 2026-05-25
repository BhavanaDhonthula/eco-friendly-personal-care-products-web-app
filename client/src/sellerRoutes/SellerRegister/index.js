import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import "./index.css";

const SellerRegister = () => {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [storeLogo, setStoreLogo] = useState(null);
  const navigate = useNavigate();

  const onChangeSetShopLogo = (e) => {
    const shopLogoFile = e.target.files?.[0];
    console.log(shopLogoFile);
    setStoreLogo(shopLogoFile);
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();

    if (storeName === "" || email === "") {
      alert("Please fill all the fields");
      return;
    }

    if (!storeLogo) {
      alert("Please upload store logo");
      return;
    }

    const sellerDetails = {
      storeName,
      email,
      storeLogo,
    };

    const formData = new FormData();

    Object.entries(sellerDetails).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const url = "http://localhost:8000/seller-register";
    const options = {
      method: "POST",
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
      console.log(data);
    }
  };

  return (
    <div className="seller-register-container container-fluid">
      <div className="row d-flex justify-content-center">
        <div className="col-12">
          <h1 className="text-center text-black p-3 seller-register-heading">
            Create Seller Account
          </h1>
        </div>
        <div className="col-12 col-md-6 seller-form-container">
          <form
            encType="multipart/form-data"
            onSubmit={onSubmitRegister}
            className="seller-register-form m-4 p-2"
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
            <div className="btn-container m-auto mt-3">
              <button type="submit" className="btn btn-success text-white">
                Register
              </button>
            </div>
          </form>
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
  );
};
export default SellerRegister;
