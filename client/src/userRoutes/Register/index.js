import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./index.css";

const Register = (props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errMSg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    const userData = {
      username,
      email,
      password,
      mobileNumber,
    };

    if (username === "") {
      setErrMsg("Username required");
    } else if (email === "") {
      setErrMsg("Email Required");
    } else if (password === "") {
      setErrMsg("Password required");
    }

    const url = "http://localhost:8000/register";
    const configOptions = {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(url, configOptions);
    // console.log(response);
    const data = await response.json();
    // console.log(data);
    if (response.ok) {
      navigate("/login", { replace: true });

      setUsername("");
      setEmail("");
      setPassword("");
      setMobileNumber("");
    } else {
      console.log(data);
    }
  };

  return (
    <div className="register-bg-container">
      <div className="container-fluid ">
        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <h1 className="register-heading text-center p-3">
              Create an Account
            </h1>
          </div>
          <div className="col-12 col-md-6 ">
            <form onSubmit={register} className="register-form m-4 p-2">
              <input
                autoComplete="true"
                type="text"
                placeholder="Username"
                className="form-control  fw-bold mt-4 p-2"
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
              <input
                autoComplete="true"
                type="text"
                maxLength="10"
                placeholder="Mobile Number"
                className="form-control   fw-bold mt-4  p-2"
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                }}
              />
              <div className="register-btn-container mt-3">
                <button className="btn p-2 fw-bold bg-success  text-white">
                  Register
                </button>

                {errMSg ? (
                  <p className="text-danger mt-2 fw-bold">{errMSg}</p>
                ) : (
                  ""
                )}
              </div>
            </form>
            <hr />
            <p className="fw-bold">
              Already have acoount?
              <Link to="/login">
                <span className="text-success text-decoration-underline">
                  Login
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
