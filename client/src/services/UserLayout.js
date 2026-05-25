import { Outlet } from "react-router-dom";
import Header from "../userRoutes/Header";

const UserLayout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

export default UserLayout;
