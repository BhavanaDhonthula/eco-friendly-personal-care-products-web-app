import "./index.css";
import getProductData from "../../services/getProductData";
import { useEffect, useState, useContext } from "react";
import { MdVerified } from "react-icons/md";
import { useParams } from "react-router-dom";
import EcoScoreChart from "../../components/EcoScoreChart";
import EcoScoreBreakDownChart from "../../components/EcoScoreBreakDownChart";
import CarbonFootprintChart from "../../components/CarbonFootprintChart";
import calculateEcoScore from "../../services/calculateEcoScore";
import { GiSproutDisc, GiFootprint } from "react-icons/gi";
import { CiDroplet } from "react-icons/ci";
import { LuLeaf } from "react-icons/lu";
import { FaTree, FaStar } from "react-icons/fa6";
import { SlEnergy } from "react-icons/sl";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsCardList, BsBox } from "react-icons/bs";
import CartContext from "../../services/contexts/CartContext";
import { fetchComments } from "../../services/orderApi";

// ── Read-only star display ────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        style={{
          color: s <= Math.round(rating) ? "#f6c23e" : "#dee2e6",
          fontSize: "1.1rem",
        }}
      >
        ★
      </span>
    ))}
  </span>
);

// ── Comments Section ──────────────────────────────────────────────────────────
const CommentsSection = ({ productId }) => {
  const [data, setData] = useState({ comments: [], avgRating: null, total: 0 });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchComments(productId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [productId]);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="comments-section mt-3 mb-4 p-3 p-md-4 rounded">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom border-success border-opacity-25">
        <h5 className="fw-bold mb-0">
          ⭐ Customer Reviews
          <span
            className="text-muted fw-normal ms-2"
            style={{ fontSize: "0.88rem" }}
          >
            ({data.total} review{data.total !== 1 ? "s" : ""})
          </span>
        </h5>
        {data.avgRating && (
          <div
            className="d-flex align-items-center gap-2 px-3 py-1 rounded"
            style={{ background: "#f0faf0", border: "1px solid #c3e6cb" }}
          >
            <Stars rating={parseFloat(data.avgRating)} />
            <span className="fw-bold text-success">{data.avgRating}</span>
            <span className="text-muted small">/ 5</span>
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="d-flex align-items-center gap-2 text-muted py-3">
          <div className="spinner-border spinner-border-sm text-success" />
          <span>Loading reviews…</span>
        </div>
      ) : data.total === 0 ? (
        <div
          className="text-center py-4 rounded"
          style={{ background: "#f8f9fa", border: "1px dashed #dee2e6" }}
        >
          <div style={{ fontSize: "2rem" }}>💬</div>
          <p className="fw-semibold text-muted mt-2 mb-1">No reviews yet.</p>
          <p className="text-muted small mb-0">
            Purchase this product and review it from the Orders page after
            delivery!
          </p>
        </div>
      ) : (
        <div>
          {data.comments.map((c) => (
            <div
              key={c._id}
              className="comment-card p-3 mb-3 rounded border"
              style={{ background: "#fafafa" }}
            >
              {/* Top row */}
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                <div className="d-flex align-items-center gap-2">
                  {/* Avatar */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{
                      width: "34px",
                      height: "34px",
                      background: "#198754",
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    {c.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-bold" style={{ fontSize: "0.92rem" }}>
                    {c.username}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: "#d4edda",
                      color: "#155724",
                      border: "1px solid #c3e6cb",
                      fontSize: "0.68rem",
                    }}
                  >
                    Verified Purchase
                  </span>
                </div>
                <span className="text-muted small">{fmtDate(c.createdAt)}</span>
              </div>

              <div className="d-flex flex-column ps-2 mt-2 align-items-start">
                {/* Stars */}
                <div className="mb-1">
                  <Stars rating={c.rating} />
                </div>
                {/* Comment text */}
                <p
                  className="mb-0"
                  style={{
                    fontSize: "0.92rem",
                    color: "#333",
                    lineHeight: "1.6",
                  }}
                >
                  {c.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted small mt-3 mb-0" style={{ fontStyle: "italic" }}>
        💡 To leave a review, place an order and submit your feedback from the
        <strong> My Orders</strong> page after your order is delivered.
      </p>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProductDetailsPage = () => {
  const [productDetails, setProductDetails] = useState({});
  const { id } = useParams();

  const cartContextValue = useContext(CartContext);
  const { addToCart, cartItems } = cartContextValue;

  useEffect(() => {
    const getProduct = async () => {
      const productData = await getProductData(id);
      setProductDetails(productData[0]);
    };
    getProduct();
  }, [id]);

  const url = "http://localhost:8000/major-project-imgs/";

  const {
    _id,
    productName,
    category,
    brand,
    price,
    carbonFootprint,
    description,
    ingredientType,
    ingredients,
    packagingType,
    productImgs,
    quantity,
    specifications,
  } = productDetails;

  const isItemInCart = cartItems.find((each) => each._id === _id);
  const allScores =
    Object.keys(productDetails).length > 0
      ? calculateEcoScore(productDetails)
      : {};

  return (
    <div className="product-details-page-bg-container container">
      <div className="row">
        {/* ── Left ─────────────────────────────────────────────── */}
        <div className="left-container col-12 col-md-6">
          {/* Image carousel */}
          <div
            id="productImgsCarousel"
            className="carousel slide carousel-container"
          >
            <div className="carousel-indicators" id="custome-indicators">
              {productImgs?.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#productImgsCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-current={index === 0 ? "true" : undefined}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="carousel-inner">
              {productImgs?.map((eachImg, index) => (
                <div
                  key={index}
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                >
                  <img
                    src={`${url}${eachImg}`}
                    className="d-block w-100 carousel-product-img"
                    alt={`Product ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#productImgsCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon bg-success"
                aria-hidden="true"
              />
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#productImgsCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon bg-success"
                aria-hidden="true"
              />
              <span className="visually-hidden">Next</span>
            </button>
          </div>

          {/* Basic details */}
          <div className="product-details-page-basic-details d-flex justify-content-start flex-column p-3 gap-2 col-12">
            <h5 className="product-details-page-product-name text-start">
              {productName}
            </h5>
            <h6 className="product-details-page-side-heading">
              <span className="d-flex align-items-center">
                <span>Brand:</span>
                <span className="text-success ps-2">{brand}</span>
                <MdVerified
                  className="ms-1 verified-icon text-white"
                  size={20}
                />
              </span>
            </h6>
            <h6 className="product-details-page-side-heading">
              <span className="d-flex align-items-center">
                <span>Eco Score:</span>
                <span className="ps-2 text-success">{allScores.ecoScore}</span>
                <GiSproutDisc
                  size={25}
                  className="ms-1 text-white plant-icon"
                />
              </span>
            </h6>
            <div className="d-flex align-items-center gap-2">
              <h3 className="product-details-page-price text-success">
                ₹{price}
              </h3>
              <h6 className="product-details-page-quantity ms-4">
                <span className="text-success fw-bold">Quantity</span>
                <span className="ms-3 product-details-page-qty">
                  ({quantity})
                </span>
              </h6>
            </div>
            <strong style={{ fontSize: "12px" }} className="text-start">
              {description}
            </strong>
            <div className="add-to-cart-btn-container text-start">
              {isItemInCart ? (
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

          {/* Specs table */}
          <div className="product-details-page-main-details col-12">
            <div className="row text-start">
              <table
                style={{
                  borderCollapse: "separate",
                  borderSpacing: "0px 15px",
                  padding: "5px 20px",
                }}
              >
                <tbody>
                  <tr>
                    <th colSpan={2}>Feature</th>
                    <th>Value</th>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-black fw-bold col-4">
                      <span className="d-flex align-items-center">
                        <BsCardList className="me-1" size={20} />
                        Specifications
                      </span>
                    </td>
                    <td className="product-details-page-side-heading text-start ms-2">
                      {specifications}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-black fw-bold col-4">
                      <span className="d-flex align-items-center">
                        <CiDroplet className="me-1" size={20} />
                        IngredientType
                      </span>
                    </td>
                    <td className="product-details-page-side-heading text-start ms-2">
                      {ingredientType}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-black fw-bold col-4">
                      <span className="d-flex align-items-center">
                        <LuLeaf className="me-1" size={20} />
                        Ingredients
                      </span>
                    </td>
                    <td className="product-details-page-side-heading text-start ms-2">
                      {ingredients}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-black fw-bold col-4">
                      <span className="d-flex align-items-center">
                        <BsBox className="me-2" size={20} />
                        PackagingType
                      </span>
                    </td>
                    <td className="product-details-page-side-heading text-start ms-2">
                      {packagingType}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-black fw-bold col-4">
                      <span className="d-flex align-items-center">
                        <GiFootprint size={20} className="me-2" />
                        Carbonfootprint
                      </span>
                    </td>
                    <td className="product-details-page-side-heading text-start ms-2">
                      {carbonFootprint} KG
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-black fw-bold col-4">
                      <span className="d-flex align-items-center">
                        <GiFootprint size={20} className="me-2" />
                        Category
                      </span>
                    </td>
                    <td className="product-details-page-side-heading text-start ms-2">
                      {category}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right ────────────────────────────────────────────── */}
        <div className="right-container col-12 col-md-6">
          <div className="col-12 eco-score-chart-container">
            <EcoScoreChart ecoScore={allScores.ecoScore} />
          </div>
          <div className="eco-score-chart-container">
            <EcoScoreBreakDownChart scoreData={allScores} />
          </div>
          <div className="eco-score-chart-container">
            <CarbonFootprintChart
              carbonFootprintScore={allScores.carbonFootprintScore}
              carbonFootprint={carbonFootprint}
            />
          </div>
        </div>

        {/* ── Impact ───────────────────────────────────────────── */}
        <div className="col-12 footer">
          <h4>Impact at a Glance</h4>
          <div className="row p-2 gap-2 d-flex justify-content-center">
            <div className="col-5 impact">
              <LuLeaf size={30} className="text-success" />
              <strong>Water Saved</strong>
            </div>
            <div className="col-5 impact">
              <FaTree size={30} className="text-success" />
              <strong>Trees Not Cut</strong>
            </div>
            <div className="col-5 impact">
              <SlEnergy size={30} className="text-success" />
              <strong>Energy Saved</strong>
            </div>
            <div className="col-5 impact">
              <RiDeleteBin6Line size={30} className="text-success" />
              <strong>Waste Diverted</strong>
            </div>
          </div>
        </div>

        {/* ── Comments section ─────────────────────────────────── */}
        <div className="col-12">
          <hr className="mt-2 mb-0" />
          {/* Only render once _id is available (after product data loads) */}
          {id ? (
            <CommentsSection productId={_id} />
          ) : (
            <div className="py-3 text-center text-muted small">
              Loading reviews…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
