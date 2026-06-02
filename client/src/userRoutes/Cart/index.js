import "./index.css";
import { useContext } from "react";
import CartContext from "../../services/contexts/CartContext";
import CartItemCard from "../../components/CartItemCard";

const Cart = () => {
  const { cartItems } = useContext(CartContext);

  return (
    <div className="cart-bg-container container-fluid">
      <div className="row">
        <div className="col-12 heading-container mr-auto">
          <h5 className="mt-3  cart-heading text-success fw-bold">My Cart</h5>
        </div>
        <div className="col-12">
          <ul className="cart-items-list">
            {cartItems.map((item) => (
              <li key={item._id} className="cart-item mt-3">
                <CartItemCard cartItemDetails={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Cart;
