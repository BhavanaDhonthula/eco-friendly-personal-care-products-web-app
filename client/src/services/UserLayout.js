import { Outlet } from "react-router-dom";
import Header from "../userRoutes/Header";
import Footer from "../components/footer";

const UserLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

export default UserLayout;
