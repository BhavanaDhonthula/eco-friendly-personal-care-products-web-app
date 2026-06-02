import { Link } from "react-router-dom";
import { FaCartArrowDown } from "react-icons/fa";
import "./index.css";
import Cookies from "js-cookie";
import { useContext } from "react";
import CartContext from "../../services/contexts/CartContext";

const Header = () => {
  const profileWord = Cookies.get("letter") || "";
  const { cartItems } = useContext(CartContext);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <span className="logo">EcoGlow</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#headerContent"
          aria-controls="headerContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="navbar-collapse collapse" id="headerContent">
          <ul className="navbar-nav  me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className="nav-link text-black fw-bold active tab"
                aria-current="page"
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="tab nav-link text-black fw-bold" to="/products">
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="tab nav-link text-black fw-bold"
                to="/seller-register"
              >
                Become a Seller
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="nav-link tab text-black fw-bold d-flex justify-content-center align-items-center gap-1"
                to="/cart"
              >
                <FaCartArrowDown size={20} className="" />
                <div className="cart-count">
                  <span>{cartItems.length}</span>
                </div>
              </Link>
            </li>

            {profileWord ? (
              <li className="nav-item m-auto">
                <Link className="nav-link tab fw-bold " to="/profile">
                  <p className="bg-success profile text-white">
                    {profileWord.toUpperCase()}
                  </p>
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
