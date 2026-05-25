import { Outlet } from "react-router-dom";
import SellerHeader from "../sellerRoutes/SellerHeader";

const SellerLayout = () => (
  <>
    <SellerHeader />
    <Outlet />
  </>
);

export default SellerLayout;
