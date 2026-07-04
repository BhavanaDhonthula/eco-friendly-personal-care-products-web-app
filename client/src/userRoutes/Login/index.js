import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import "./index.css";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const Login = () => {
  const navigate = useNavigate();
  const [errMSg, setErrMsg] = useState("");
  const [isShowPasswordClicked, setIsShowPasswordClicked] = useState(false);
  const [email, updateEmail] = useState("");
  const [password, updatePassword] = useState("");

  const onSubmitLogin = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    };

    const response = await fetch("http://localhost:8000/login", config);
    const data = await response.json();

    if (response.ok) {
      Cookies.set("access_token", data.jwtToken, { expires: 30 });
      console.log(email[0]);
      Cookies.set("letter", email[0], {
        expires: 30,
      });
      updateEmail("");
      updatePassword("");
      navigate("/", { replace: true });
    } else {
      setErrMsg(data.err_msg);
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
        width: "50%",
        border: "none",
        borderRadius: "20px",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {(close) => {
        const onClickCloseLoginPage = () => {
          close();
          navigate("/");
        };

        return (
          <>
            <div className="popup-content w-100" id="popup">
              <div className="login-bg-container">
                <div className="container">
                  <div className="row d-flex  justify-content-center">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                      <h1 className="fw-bold login-heading mt-2 text-center">
                        Welcome Back!
                      </h1>
                      <button
                        className="btn d-flex justify-content-end bg-success opacity-2 text-white"
                        onClick={onClickCloseLoginPage}
                      >
                        X
                      </button>
                    </div>

                    <div className="col-12">
                      <form className="register-form" onSubmit={onSubmitLogin}>
                        <input
                          type="text"
                          className="form-control mt-4"
                          placeholder="Email"
                          name="email"
                          onChange={(e) => {
                            updateEmail(e.target.value.toLowerCase());
                          }}
                        />
                        <input
                          type={isShowPasswordClicked ? "text" : "password"}
                          className="form-control mt-4"
                          placeholder="Password"
                          name="password"
                          onChange={(e) => {
                            updatePassword(e.target.value);
                          }}
                        />

                        <div className="show-password-container  mt-3">
                          <input
                            type="checkbox"
                            className="checkbox"
                            id="show-password-checkbox"
                            onClick={() => {
                              setIsShowPasswordClicked(!isShowPasswordClicked);
                            }}
                          />
                          <label
                            htmlFor="show-password-checkbox"
                            className="text-black fw-bold"
                          >
                            Show Password
                          </label>
                        </div>

                        <div className="btn-container text-center mt-3">
                          <button
                            type="submit"
                            className="btn bg-success mt-2 fw-bold"
                          >
                            Login
                          </button>
                          {errMSg ? (
                            <p className="text-danger mt-2 fw-bold">{errMSg}</p>
                          ) : (
                            ""
                          )}
                        </div>
                      </form>
                    </div>
                    <div className="col-12">
                      <hr />
                      <p className="fw-bold">
                        Don't have an account?
                        <Link to="/register">
                          <span className="text-success text-decoration-underline">
                            Register
                          </span>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }}
    </Popup>
  );
};

export default Login;
