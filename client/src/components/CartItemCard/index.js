import { useContext } from "react";
import { useState } from "react";
import "./index.css";
import CartContext from "../../services/contexts/CartContext";

const CartItemCard = (props) => {
  const imageConst = "http://localhost:8000/major-project-imgs/";
  const { cartItemDetails } = props;
  const [productOrderQty, setProductOrderQty] = useState(1);
  const { productName, price, quantity, thumbnail, _id } = cartItemDetails;
  const cartContextValue = useContext(CartContext);

  const { removeFromCart } = cartContextValue;

  const increaseQty = () => {
    if (productOrderQty >= 1) {
      setProductOrderQty((prevState) => prevState + 1);
    } else {
      setProductOrderQty(1);
    }
  };

  const decreaseQty = (productId) => {
    if (productOrderQty === 1) {
      removeFromCart(productId);
      return;
    }
    setProductOrderQty((prevState) => prevState - 1);
  };

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
          <p className="cart-item-price">Price: ₹{price}</p>
          <span className="cart-item-quantity-container bg-success">
            <button
              type="button"
              className="reduce-btn"
              onClick={() => {
                decreaseQty(_id);
              }}
            >
              -
            </button>
            <span className="reduce-btn">{productOrderQty}</span>
            <button
              type="button"
              onClick={() => {
                increaseQty();
              }}
              className="increase-btn"
            >
              +
            </button>
          </span>
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
