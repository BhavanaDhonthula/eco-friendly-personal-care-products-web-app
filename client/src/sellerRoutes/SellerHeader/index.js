import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import Cookies from "js-cookie";

function SellerHeader() {
  const navigate = useNavigate();

  const onClickLogoutSeller = () => {
    Cookies.remove("seller_access_token");
    navigate("/seller-login", { replace: true });
  };

  return (
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <Link className="navbar-brand" to="/seller-dashboard">
          EcoGlow
        </Link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <Link
                className="nav-link fw-bold text-black active tab"
                aria-current="page"
                to="/seller-dashboard"
              >
                Dashboard
              </Link>
            </li>
            <li class="nav-item">
              <Link
                class="nav-link"
                to="/seller-add-product"
                className="nav-link fw-bold text-black"
              >
                Add Products
              </Link>
            </li>
            <li class="nav-item">
              <Link to="/" className="nav-link text-black fw-bold">
                Switch To Customer View
              </Link>
            </li>
          </ul>
          {Cookies.get("seller_access_token") !== undefined && (
            <button
              className="bg-danger p-1 pe-3 ps-3 border-0 fw-bold rounded-2 text-white"
              onClick={onClickLogoutSeller}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default SellerHeader;
