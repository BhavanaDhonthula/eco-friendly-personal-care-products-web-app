import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import CartContext from "./contexts/CartContext";
import {
  fetchCart,
  addItemToCart,
  updateCartItemQty,
  removeItemFromCart,
  clearUserCart,
} from "./cartApi";

const CartLayout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const loadCart = async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      setCartItems([]);
      return;
    }

    setIsCartLoading(true);
    try {
      const items = await fetchCart();
      setCartItems(items);
    } catch (error) {
      console.log("loadCart error:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = async (product) => {
    const token = Cookies.get("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const items = await addItemToCart(product._id);
      setCartItems(items);
    } catch (error) {
      console.log("addToCart error:", error);
    }
  };

  const increaseOrdQty = async (id) => {
    const item = cartItems.find((eachItem) => eachItem._id === id);
    if (!item) return;

    try {
      const items = await updateCartItemQty(item.cartItemId, "increase");
      setCartItems(items);
    } catch (error) {
      console.log("increaseOrdQty error:", error);
    }
  };

  const decreaseOrdQty = async (id) => {
    const item = cartItems.find((eachItem) => eachItem._id === id);
    if (!item) return;

    try {
      const items = await updateCartItemQty(item.cartItemId, "decrease");
      setCartItems(items);
    } catch (error) {
      console.log("decreaseOrdQty error:", error);
    }
  };

  const removeFromCart = async (productId) => {
    const item = cartItems.find((eachItem) => eachItem._id === productId);
    if (!item) return;

    try {
      const items = await removeItemFromCart(item.cartItemId);
      setCartItems(items);
    } catch (error) {
      console.log("removeFromCart error:", error);
    }
  };

  const clearCart = async () => {
    try {
      await clearUserCart();
      setCartItems([]);
    } catch (error) {
      console.log("clearCart error:", error);
    }
  };

  return (
    <>
      <CartContext.Provider
        value={{
          cartItems,
          isCartLoading,
          addToCart,
          removeFromCart,
          increaseOrdQty,
          decreaseOrdQty,
          clearCart,
          refreshCart: loadCart,
        }}
      >
        <Outlet />
      </CartContext.Provider>
    </>
  );
};

export default CartLayout;
