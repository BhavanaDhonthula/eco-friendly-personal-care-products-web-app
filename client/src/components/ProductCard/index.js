import "./index.css";
import { FaStar } from "react-icons/fa";
import { GiChestnutLeaf } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useContext } from "react";
import CartContext from "../../services/contexts/CartContext";
import calculateEcoScore from "../../services/calculateEcoScore";

const ProductCard = (props) => {
  const url = "http://localhost:8000/major-project-imgs/";
  const { productDetails } = props;
  const { productName, price, thumbnail, _id, brand, stock } = productDetails;

  const cartContextValue = useContext(CartContext);
  const { addToCart } = cartContextValue;

  const { ecoScore } = calculateEcoScore(productDetails);

  const itemPresentInCart = cartContextValue.cartItems.find(
    (item) => item._id === _id,
  );

  return (
    <div className="product-card-container p-3 m-1">
      <div className="product-img-container">
        <img
          src={url + thumbnail}
          className="w-100 h-100 product-img"
          alt="product img"
        />
      </div>
      <div className="product-details-container">
        <h1 className="fw-bold product-name pt-2">{productName}</h1>
        <h6 className="product-brand">Sold by: {brand}</h6>
        <h5 className="text-dark fw-bold">
          Eco-Score:
          <span
            className={`fw-bolder
            ${
              (ecoScore >= 80 && "text-success") ||
              ((ecoScore >= 50) & (ecoScore < 80) && "text-warning") ||
              (ecoScore < 50 && "text-danger")
            }`}
          >
            <GiChestnutLeaf size={20} className="leaf" />
            <span className="eco-score">{ecoScore} </span>
          </span>
        </h5>

        <h5 className="fw-bold text-success product-price pt-2 pb-2">
          ₹{price}
        </h5>

        <p className="fw-bold text-success product-price pt-1 pb-1">
          {stock === 0 ? (
            <span className="bg-danger border-0 text-white p-2 rounded-2">
              Out Of Stock
            </span>
          ) : (
            <span className="bg-success border-0 text-white p-2 rounded-2">{`Stock Available: ${stock}`}</span>
          )}
        </p>

        <div className="btn-container w-100">
          <Link
            to={`/productDetailsPage/${_id}`}
            className="view-product-details-btn btn p-2 w-100 text-center text-decoration-none"
          >
            View Details
          </Link>
        </div>
        <div className="btn-container w-100">
          {itemPresentInCart !== undefined ? (
            <div
              className="disabled-btn-container"
              style={{ cursor: "not-allowed" }}
            >
              <button
                type="button"
                className="btn product-added-btn justify-content-center d-flex align-items-center opacity-100 fw-bold text-black w-100"
                disabled
              >
                Added To Cart
                <span>
                  <FaStar className="star-icon" />
                </span>
              </button>
            </div>
          ) : (
            <button
              className="btn add-to-cart-btn w-100"
              onClick={() => addToCart(productDetails)}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
