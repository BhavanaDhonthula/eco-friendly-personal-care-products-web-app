import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserLayout from "./services/UserLayout";
import SellerLayout from "./services/SellerLayout";

import Home from "./userRoutes/Home";
import About from "./userRoutes/About";
import Cart from "./userRoutes/Cart";
import Contact from "./userRoutes/Contact";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Products from "./pages/Products";
import Login from "./userRoutes/Login";
import Register from "./userRoutes/Register";
import Checkout from "./userRoutes/Checkout";
import Addresses from "./userRoutes/Addresses";
import OrderSuccess from "./userRoutes/OrderSuccess";
import Profile from "./userRoutes/Profile";

import SellerRegister from "./sellerRoutes/SellerRegister";
import SellerLogin from "./sellerRoutes/SellerLogin";
import SellerDashboard from "./sellerRoutes/SellerDashboard";
import SellerAddProduct from "./sellerRoutes/SellerAddProduct";

import ProtectedRoute from "./services/ProtectedRoute";
import SellerProtectedRoute from "./services/SellerProtectedRoute";

import { useState } from "react";
import FiltersOffCanvasBody from "./components/FiltersOffCanvasBody";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

//contexts

import FiltersContext from "./services/contexts/FiltersContext";

function App() {
  const [productsList, setProductsList] = useState([]);
  const [changedProductsList, setChangedProductsList] = useState([]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<UserLayout />}>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/login" element={<Login />} />
            <Route
              exact
              path="/products"
              element={
                <FiltersContext.Provider
                  value={{
                    productsList,
                    changedProductsList,
                    setProductsList,
                    setChangedProductsList,
                  }}
                >
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                </FiltersContext.Provider>
              }
            />
            <Route
              exact
              path="/productDetailsPage/:id"
              element={<ProductDetailsPage />}
            />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/contact" element={<Contact />} />
            <Route
              exact
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              exact
              path="/addresses"
              element={
                <ProtectedRoute>
                  <Addresses />
                </ProtectedRoute>
              }
            />
            <Route exact path="/checkout" element={<Checkout />} />
            <Route exact path="/order-success" element={<OrderSuccess />} />
            <Route
              exact
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route element={<SellerLayout />}>
            <Route exact path="/seller-register" element={<SellerRegister />} />
            <Route exact path="/seller-login" element={<SellerLogin />} />
            <Route
              exact
              path="/seller-dashboard"
              element={
                <SellerProtectedRoute>
                  <SellerDashboard />
                </SellerProtectedRoute>
              }
            />

            <Route
              exact
              path="/seller-add-product"
              element={
                <SellerProtectedRoute>
                  <SellerAddProduct />
                </SellerProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
