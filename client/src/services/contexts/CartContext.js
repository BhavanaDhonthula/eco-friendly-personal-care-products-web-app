import { createContext } from "react";

const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  increaseOrdQty: () => {},
  decreaseOrdQty: () => {}
});

export default CartContext;
