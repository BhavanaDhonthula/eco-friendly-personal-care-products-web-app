import { Outlet } from "react-router-dom";
import { useState } from "react";
import CartContext from "./contexts/CartContext";

const CartLayout = () => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const itemPresentInCart = prevCartItems.find(
        (item) => item._id === product._id,
      );
      if (itemPresentInCart) {
        return [...prevCartItems];
      } else {
        return [...prevCartItems, product];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevCartItems) => {
      let itemPresentInCart = prevCartItems.find(
        (item) => item._id === productId,
      );
      if (itemPresentInCart) {
        return prevCartItems.filter((item) => item._id !== productId);
      } else {
        return prevCartItems;
      }
    });
  };

  return (
    <>
      <CartContext.Provider
        value={{
          cartItems,
          addToCart,
          removeFromCart,
        }}
      >
        <Outlet />
      </CartContext.Provider>
    </>
  );
};

export default CartLayout;
