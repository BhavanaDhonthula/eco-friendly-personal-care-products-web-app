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
    <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/seller-dashboard">
          EcoGlow
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

        <div className="navbar-collapse collapse" id="navbarScroll">
          <ul
            className="navbar-nav me-auto mb-2 mb-lg-0"
            style={{ maxHeight: "100px" }}
          >
            <li className="nav-item">
              <Link
                to="/seller-dashboard"
                className="nav-link fw-bold text-black active tab"
                aria-current="page"
              >
                Dashboard
              </Link>
            </li>
            <li>
              {" "}
              <Link
                to="/seller-add-product"
                className="nav-link fw-bold text-black"
              >
                Add Products
              </Link>
            </li>

            <li className="nav-item">
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
