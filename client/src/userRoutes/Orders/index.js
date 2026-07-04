import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import { fetchUserOrders, postComment } from "../../services/orderApi";

const IMG_BASE = "http://localhost:8000/major-project-imgs/";

const STATUS_STEPS = [
  "Placed",
  "Accepted",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const STATUS_BADGE = {
  Placed: "badge-placed",
  Accepted: "badge-accepted",
  Packed: "badge-packed",
  Shipped: "badge-shipped",
  "Out for Delivery": "badge-otd",
  Delivered: "badge-delivered",
  Cancelled: "badge-cancelled",
};

const STATUS_ICON = {
  Placed: "🕐",
  Accepted: "✅",
  Packed: "📦",
  Shipped: "🚚",
  "Out for Delivery": "🛵",
  Delivered: "🎉",
  Cancelled: "❌",
};

const FILTER_TABS = ["All", "Active", "Delivered", "Cancelled"];

// ── Star rating picker ────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="star-picker d-flex gap-1 mb-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star-btn ${star <= value ? "filled" : ""}`}
        onClick={() => onChange(star)}
        role="button"
        aria-label={`${star} star`}
      >
        ★
      </span>
    ))}
  </div>
);

// ── Tracking timeline ─────────────────────────────────────────────────────────
const OrderTimeline = ({ currentStatus }) => {
  if (currentStatus === "Cancelled") {
    return (
      <div className="timeline-cancelled">
        <span className="me-2">❌</span>
        This order was cancelled.
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="order-timeline">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div
            key={step}
            className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}
          >
            <div className="timeline-dot">
              {done ? "✓" : active ? STATUS_ICON[step] : ""}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`timeline-line ${done || active ? "filled" : ""}`}
              />
            )}
            <span className="timeline-label">{step}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Review form for a single delivered product ────────────────────────────────
const ReviewForm = ({ productId, productName, onReviewPosted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await postComment(productId, rating, comment.trim());
      setSuccess(true);
      setComment("");
      setRating(0);
      if (onReviewPosted) onReviewPosted(productId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="review-success p-2 rounded mt-2">
        ✅ Your review has been posted! It will appear on the product page.
      </div>
    );
  }

  return (
    <div className="review-form mt-3 p-3 rounded border">
      <p className="fw-bold mb-2 small">✍️ Review: {productName}</p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        className="form-control form-control-sm mb-2"
        rows={3}
        placeholder="Share your experience with this product…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
      />
      {error && <p className="text-danger small fw-bold mb-2">{error}</p>}
      <button
        className="btn btn-success btn-sm fw-bold"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Posting…" : "Post Review"}
      </button>
    </div>
  );
};

// ── Orders Page ────────────────────────────────────────────────────────────────
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("All");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  // track which productIds the user has already reviewed in this session
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchUserOrders();
      setOrders(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filterTab === "All") return true;
    if (filterTab === "Active")
      return !["Delivered", "Cancelled"].includes(order.orderStatus);
    return order.orderStatus === filterTab;
  });

  const toggleExpand = (id) =>
    setExpandedOrderId((prev) => (prev === id ? null : id));

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleReviewPosted = (productId) => {
    setReviewedProducts((prev) => new Set([...prev, productId]));
  };

  return (
    <div className="orders-bg-container container mt-4 mb-5">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h1 className="fw-bold text-success mb-0">My Orders</h1>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-success btn-sm fw-semibold"
            onClick={() => navigate("/")}
          >
            🏠 Home
          </button>
          <Link to="/products" className="btn btn-success btn-sm fw-semibold">
            🛍️ Shop More
          </Link>
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────── */}
      <div className="orders-filter-tabs mb-4">
        {FILTER_TABS.map((tab) => {
          const count =
            tab === "All"
              ? orders.length
              : tab === "Active"
                ? orders.filter(
                    (o) => !["Delivered", "Cancelled"].includes(o.orderStatus),
                  ).length
                : orders.filter((o) => o.orderStatus === tab).length;
          return (
            <button
              key={tab}
              className={`orders-tab-btn ${filterTab === tab ? "active" : ""}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab}
              <span className="orders-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="orders-loading">
          <div className="spinner-border text-success" />
          <p className="mt-3 text-muted fw-semibold">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty text-center py-5">
          <div style={{ fontSize: "3rem" }}>📭</div>
          <h4 className="fw-bold mt-3">
            {filterTab === "All"
              ? "You haven't placed any orders yet."
              : `No ${filterTab.toLowerCase()} orders.`}
          </h4>
          <p className="text-muted">
            Discover eco-friendly products and start shopping.
          </p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            <button
              className="btn btn-outline-success fw-semibold"
              onClick={() => navigate("/")}
            >
              🏠 Go Home
            </button>
            <Link to="/products" className="btn btn-success fw-semibold">
              🛍️ Browse Products
            </Link>
          </div>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order._id;
          const badgeClass = STATUS_BADGE[order.orderStatus] || "badge-placed";
          const isDelivered = order.orderStatus === "Delivered";

          return (
            <div
              key={order._id}
              className="order-card-user mb-3 border rounded shadow-sm"
            >
              {/* Card header — always visible */}
              <div
                className="order-card-header d-flex justify-content-between align-items-start flex-wrap gap-2 p-3"
                onClick={() => toggleExpand(order._id)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="fw-bold text-success">
                      {order.orderId}
                    </span>
                    <span className={`order-status-badge ${badgeClass}`}>
                      {STATUS_ICON[order.orderStatus]} {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-muted small mb-0">
                    Placed on {formatDate(order.createdAt)} ·{" "}
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}{" "}
                    · <strong>₹{order.orderTotal}</strong>
                  </p>
                  <p className="text-muted small mb-0">
                    Seller: {order.sellerName}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">
                    {isExpanded ? "▲ Hide" : "▼ Track"}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="order-card-body p-3 border-top">
                  {/* Tracking timeline */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">📍 Order Tracking</h6>
                    <OrderTimeline currentStatus={order.orderStatus} />
                  </div>

                  {/* Items */}
                  <h6 className="fw-bold mb-2">🛍️ Items</h6>
                  <div className="mb-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="order-item-row d-flex align-items-center gap-3 mb-2 p-2 rounded"
                      >
                        {item.thumbnail && (
                          <img
                            src={`${IMG_BASE}${item.thumbnail}`}
                            alt={item.productName}
                            width="55"
                            height="55"
                            className="rounded"
                            style={{ objectFit: "cover", flexShrink: 0 }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <p className="fw-semibold mb-0">{item.productName}</p>
                          <p className="text-muted small mb-0">
                            Qty: {item.orderQuantity} × ₹{item.price}
                          </p>
                        </div>
                        <span className="fw-bold">
                          ₹{item.price * item.orderQuantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ── Write a Review (only for Delivered orders) ───── */}
                  {isDelivered && (
                    <div className="review-section mb-3">
                      <h6 className="fw-bold mb-2">⭐ Write a Review</h6>
                      <p className="text-muted small mb-2">
                        Share your experience to help other eco-conscious
                        shoppers.
                      </p>
                      {order.items.map((item) => {
                        const alreadyReviewed = reviewedProducts.has(
                          item.productId?.toString() || item.productId,
                        );
                        if (alreadyReviewed) {
                          return (
                            <div
                              key={item.productId}
                              className="review-success p-2 rounded mb-2"
                            >
                              ✅ Review posted for{" "}
                              <strong>{item.productName}</strong>
                            </div>
                          );
                        }
                        return (
                          <ReviewForm
                            key={item.productId}
                            productId={item.productId}
                            productName={item.productName}
                            onReviewPosted={handleReviewPosted}
                          />
                        );
                      })}
                    </div>
                  )}
                  {/* ─────────────────────────────────────────────────── */}

                  {/* Price summary */}
                  <div className="price-summary p-3 rounded mb-3">
                    <div className="d-flex justify-content-between mb-1 small">
                      <span>Items Total</span>
                      <span>₹{order.itemsTotal}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1 small">
                      <span>Delivery Charges</span>
                      <span>₹{order.deliveryCharges}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Order Total</span>
                      <span>₹{order.orderTotal}</span>
                    </div>
                    <p className="text-muted small mb-0 mt-1">
                      Payment: {order.paymentMethod}
                    </p>
                  </div>

                  {/* Shipping address */}
                  {order.shippingAddress && (
                    <div className="shipping-box p-3 rounded">
                      <p className="fw-bold mb-1">🏠 Delivery Address</p>
                      <p className="mb-0 small">
                        {order.shippingAddress.fullName}
                        <br />
                        {order.shippingAddress.addressLine}
                        {order.shippingAddress.locality
                          ? `, ${order.shippingAddress.locality}`
                          : ""}
                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} —{" "}
                        {order.shippingAddress.pincode}
                        <br />
                        📞 {order.shippingAddress.mobileNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Bottom nav ───────────────────────────────────────────── */}
      {!isLoading && orders.length > 0 && (
        <div className="d-flex gap-2 flex-wrap mt-4">
          <button
            className="btn btn-outline-success fw-semibold"
            onClick={() => navigate("/")}
          >
            🏠 Back to Home
          </button>
          <Link to="/products" className="btn btn-success fw-semibold">
            🛍️ Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
