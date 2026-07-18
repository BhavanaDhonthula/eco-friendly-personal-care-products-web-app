import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";
import { fetchAddresses } from "../../services/addressApi";
import { placeOrder } from "../../services/orderApi";
import CartContext from "../../services/contexts/CartContext";

const IMG_BASE = "http://localhost:8000/major-project-imgs/";
const DELIVERY_CHARGE = 40;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, isCartLoading } = useContext(CartContext);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelected] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [loadingAddr, setLoadingAddr] = useState(true);

  // ── Order summary: itemized products + grand total ──────────────────────
  // Delivery is charged per seller (matches how the backend splits one
  // checkout into one order per seller - see placeOrder in
  // orderController.js), so we count distinct sellers in the cart.
  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.orderQuantity,
    0,
  );
  const numberOfSellers = new Set(
    cartItems.map((item) => item.sellerId?.toString()),
  ).size;
  const deliveryCharges = DELIVERY_CHARGE * Math.max(numberOfSellers, 1);
  const grandTotal = subTotal + deliveryCharges;
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Load saved addresses
    const load = async () => {
      setLoadingAddr(true);
      const data = await fetchAddresses();
      setAddresses(data);
      const def = data.find((a) => a.isDefault);
      if (def) setSelected(def._id);
      else if (data.length > 0) setSelected(data[0]._id);
      setLoadingAddr(false);
    };
    load();
  }, []);

  const onPlaceOrder = async () => {
    if (cartItems.length === 0) {
      setPlaceError("Your cart is empty.");
      return;
    }
    if (!selectedAddressId) {
      setPlaceError("Please select a delivery address.");
      return;
    }
    setIsPlacing(true);
    setPlaceError("");
    try {
      const result = await placeOrder(selectedAddressId, "COD");
      navigate("/order-success", { state: { orderData: result } });
    } catch (err) {
      setPlaceError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="checkout-bg container mt-4 mb-5">
      <h1 className="fw-bold text-success mb-4">Checkout</h1>

      <div className="row g-4">
        {/* ── Left: address + payment ──────────────────────────── */}
        <div className="col-12 col-lg-7">
          {/* Delivery address */}
          <div className="checkout-card card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold text-success mb-3">📍 Delivery Address</h5>
              {loadingAddr ? (
                <p className="text-muted">Loading addresses…</p>
              ) : addresses.length === 0 ? (
                <div>
                  <p className="text-muted mb-2">No saved addresses.</p>
                  <Link
                    to="/addresses"
                    className="btn btn-outline-success btn-sm"
                  >
                    + Add Address
                  </Link>
                </div>
              ) : (
                <>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`address-option p-3 mb-2 rounded border ${
                        selectedAddressId === addr._id
                          ? "border-success bg-light"
                          : ""
                      }`}
                      onClick={() => setSelected(addr._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <input
                          type="radio"
                          name="address"
                          className="form-check-input mt-1"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelected(addr._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <p className="fw-bold mb-0">
                            {addr.fullName}
                            <span
                              className="badge bg-secondary ms-2"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span
                                className="badge bg-success ms-1"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Default
                              </span>
                            )}
                          </p>
                          <p className="mb-0 text-muted small">
                            {addr.addressLine}
                            {addr.locality ? `, ${addr.locality}` : ""},{" "}
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          <p className="mb-0 text-muted small">
                            📞 {addr.mobileNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/addresses"
                    state={{ fromCheckout: true }}
                    className="btn btn-outline-success btn-sm mt-2"
                  >
                    + Add / Manage Addresses
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Items*/}
          <div className="checkout-card card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold text-success mb-3">
                🛍️ Order Items ({cartItems.length})
              </h5>

              {isCartLoading ? (
                <p className="text-muted small mb-0">Loading your cart…</p>
              ) : cartItems.length === 0 ? (
                <div>
                  <p className="text-muted mb-2">Your cart is empty.</p>
                  <Link
                    to="/products"
                    className="btn btn-outline-success btn-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <ul className="list-unstyled mb-0">
                  {cartItems.map((item) => (
                    <li
                      key={item.cartItemId || item._id}
                      className="d-flex align-items-center gap-3 py-2 border-bottom"
                    >
                      <img
                        src={`${IMG_BASE}${item.thumbnail}`}
                        alt={item.productName}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                      <div className="flex-grow-1">
                        <p className="fw-semibold mb-0 small">
                          {item.productName}
                        </p>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {item.brand ? `${item.brand} · ` : ""}₹{item.price} ×{" "}
                          {item.orderQuantity}
                        </p>
                      </div>
                      <span className="fw-bold small text-nowrap">
                        ₹{item.price * item.orderQuantity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Payment method */}
        </div>

        {/* ── Right: order items + place order summary ─────────── */}
        <div className="col-12 col-lg-5">
          {/* Order items */}

          {/* Price summary + place order */}
          <div className="checkout-card card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold text-success mb-3">💰 Price Summary</h5>

              <div className="d-flex justify-content-between mb-1 small">
                <span>
                  Items Subtotal ({cartItems.length}{" "}
                  {cartItems.length === 1 ? "item" : "items"})
                </span>
                <span>₹{subTotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-1 small">
                <span>
                  Delivery Charges (₹{DELIVERY_CHARGE} ×{" "}
                  {Math.max(numberOfSellers, 1)}{" "}
                  {numberOfSellers === 1 ? "seller" : "sellers"})
                </span>
                <span>₹{deliveryCharges}</span>
              </div>
              <div className="d-flex justify-content-between mb-1 small">
                <span>Payment</span>
                <span className="fw-semibold">Cash on Delivery</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold fs-5">Grand Total</span>
                <span className="fw-bold fs-5 text-success">₹{grandTotal}</span>
              </div>

              {placeError && (
                <div className="alert alert-danger py-2 small fw-bold">
                  {placeError}
                </div>
              )}

              <button
                className="btn btn-success w-100 fw-bold"
                onClick={onPlaceOrder}
                disabled={
                  isPlacing || !selectedAddressId || cartItems.length === 0
                }
              >
                {isPlacing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Placing Order…
                  </>
                ) : (
                  `Place Order (COD) · ₹${grandTotal}`
                )}
              </button>

              <p className="text-muted small text-center mt-2 mb-0">
                💵 Pay in cash when your order arrives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
