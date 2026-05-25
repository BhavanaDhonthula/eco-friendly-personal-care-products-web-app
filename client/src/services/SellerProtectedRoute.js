import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const SellerProtectedRoute = ({ children }) => {
  const sellerJwtToken = Cookies.get("seller_access_token");

  if (sellerJwtToken === undefined) {
    return <Navigate to="/seller-login" replace />;
  }
  return children;
};
export default SellerProtectedRoute;
