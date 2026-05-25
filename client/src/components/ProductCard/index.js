import { use, useState } from "react";
import "./index.css";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const ProductCard = (props) => {
  const url = "http://localhost:8000/major-project-imgs/";
  const { productDetails } = props;
  const { productName, price, thumbnail, _id, brand } = productDetails;

  return (
    <Link to={`/productDetailsPage/${_id}`} className="product-card-link">
      <div className="product-card-container p-3 m-1">
        <div className="product-img-container">
          <img src={url + thumbnail} className="w-100 h-100 product-img" />
        </div>
        <div className="product-details-container">
          <h4 className="fw-bold product-name pt-2">{productName}</h4>
          <h6 className="product-brand">{brand}</h6>
          <h5 className="fw-bold text-success product-price pt-2 pb-2">
            ₹{price}
          </h5>
          <div className="btn-container w-100">
            <button className="btn p-2 add-cart-btn w-100">Add to Cart</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
