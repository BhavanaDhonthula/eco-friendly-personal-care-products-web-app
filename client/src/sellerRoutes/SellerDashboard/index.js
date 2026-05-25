import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import "./index.css";

const SellerDashboard = () => {
  if (Cookies.get("seller_access_token") === undefined) {
    return <Navigate to="/seller-login" />;
  }

  return (
    <div className="seller-dashboard-container">
      <Link to="/seller-add-product">Add Product</Link>
    </div>
  );
};
export default SellerDashboard;
