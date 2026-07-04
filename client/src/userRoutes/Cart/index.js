import "./index.css";
import { useContext } from "react";
import { Link } from "react-router-dom";
import CartContext from "../../services/contexts/CartContext";
import CartItemCard from "../../components/CartItemCard";

const Cart = () => {
  const { cartItems, isCartLoading } = useContext(CartContext);

  let subTotal = 0;

  cartItems.forEach(
    (eachItem) => (subTotal += eachItem.price * eachItem.orderQuantity),
  );

  const numberOfSellers = new Set(
    cartItems.map((item) => item.sellerId?.toString()),
  ).size;
  const deliveryCharges = 40 * Math.max(numberOfSellers, 1);

  if (isCartLoading) {
    return (
      <div className="cart-bg-container container-fluid text-center mt-5">
        <p className="fw-bold">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-bg-container container-fluid">
      <div className="row">
        <div className="col-12 heading-container mr-auto">
          <h1 className="mt-3  cart-heading text-success fw-bold">My Cart</h1>
        </div>
        <div className="col-12">
          <ul className="cart-items-list">
            {cartItems.map((item) => (
              <li className="cart-item mt-3" key={item.cartItemId || item._id}>
                <CartItemCard cartItemDetails={item} />
              </li>
            ))}
          </ul>
        </div>

        <>
          {cartItems.length > 0 ? (
            <div className="col-6 mt-5 mb-5 text-start m-auto sub-total-container">
              <h6 className="d-flex justify-content-between">
                <span> Subtotal:</span>
                <span> {subTotal}/-</span>
              </h6>
              <h6 className="d-flex justify-content-between">
                <span>Delivery Charges:</span>
                <span>{deliveryCharges}/-</span>
              </h6>
              <h6 className="d-flex justify-content-between">
                <span>Total:</span>
                <span>{subTotal + deliveryCharges}/-</span>
              </h6>
              <div className="text-center mt-3">
                <Link to="/checkout" className="btn btn-success fw-bold w-100">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-cart-container">
              <h3>Your Cart is Empty Add Items To Shop Now</h3>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default Cart;
