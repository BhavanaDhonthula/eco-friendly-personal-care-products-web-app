import { useContext } from "react";
import "./index.css";
import { Link } from "react-router-dom";
import CartContext from "../../services/contexts/CartContext";

const CartItemCard = (props) => {
  const imageConst = "http://localhost:8000/major-project-imgs/";
  const { cartItemDetails } = props;
  const { productName, quantity, thumbnail, _id, price, orderQuantity } =
    cartItemDetails;
  const cartContextValue = useContext(CartContext);

  const { increaseOrdQty, decreaseOrdQty, removeFromCart } = cartContextValue;

  // const increaseOrdQty = () => {
  //   if (productOrderQty >= 1) {
  //     setProductOrderQty((prevState) => prevState + 1);
  //   } else {
  //     removeFromCart(_id);
  //   }
  // };

  // const decreaseOrdQty = (productId) => {
  //   if (productOrderQty === 1) {
  //     removeFromCart(productId);
  //     return;
  //   }
  //   setProductOrderQty((prevState) => prevState - 1);
  // };

  return (
    <div className="cart-item-card-container">
      <div className="cart-item-img-details-container">
        <div className="cart-item-image-container">
          <img
            src={`${imageConst}${thumbnail}`}
            alt="thumbnail"
            className="cart-item-thumnail"
          />
        </div>
        <div className="cart-item-details-container">
          <p className="cart-item-product-name">{productName}</p>
          <p className="cart-item-quantity">Quantity: {quantity} </p>
          <p className="cart-item-price">Price: ₹{price * orderQuantity}</p>
          <div className="d-flex gap-3">
            <span className="cart-item-quantity-container bg-success">
              <button
                type="button"
                className="reduce-btn"
                onClick={() => {
                  decreaseOrdQty(_id);
                }}
              >
                -
              </button>
              <span className="reduce-btn">{orderQuantity}</span>
              <button
                type="button"
                onClick={() => {
                  increaseOrdQty(_id);
                }}
                className="increase-btn"
              >
                +
              </button>
            </span>{" "}
            <Link to="/checkout">
              <button className="btn btn-outline-primary" type="button">
                Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="remove-btn-container">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => removeFromCart(_id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
