import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";
import Cookies from "js-cookie";
import { fetchAddresses } from "../../services/addressApi";
import { placeOrder } from "../../services/orderApi";

const DELIVERY_CHARGE = 40;

const Checkout = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelected] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [cartItems, setCartItems] = useState([]);

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

    // Read cart from context via localStorage snapshot (safe fallback)
    // The real cart is managed by CartContext; we read it here for summary display
  }, []);

  const onPaymentClick = (method) => {
    if (method !== "COD") {
      alert(
        "Online payment is coming soon! Please use Cash on Delivery for now.",
      );
      return;
    }
    setPaymentMethod("COD");
  };

  const onPlaceOrder = async () => {
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

          {/* Payment method */}
          <div className="checkout-card card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold text-success mb-3">💳 Payment Method</h5>

              {/* COD — active */}
              <div
                className="payment-option p-3 mb-2 rounded border border-success bg-light d-flex align-items-center gap-3"
                onClick={() => setPaymentMethod("COD")}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="radio"
                  name="payment"
                  className="form-check-input"
                  checked={paymentMethod === "COD"}
                  readOnly
                />
                <span style={{ fontSize: "1.3rem" }}>💵</span>
                <div>
                  <span className="fw-semibold">Cash on Delivery</span>
                  <span
                    className="badge bg-success ms-2"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Available
                  </span>
                </div>
              </div>

              {/* UPI — coming soon */}
              <div
                className="payment-option payment-disabled p-3 mb-2 rounded border d-flex align-items-center gap-3"
                onClick={() => onPaymentClick("UPI")}
                style={{ cursor: "pointer", opacity: 0.6 }}
              >
                <input
                  type="radio"
                  name="payment"
                  className="form-check-input"
                  disabled
                />
                <span style={{ fontSize: "1.3rem" }}>📱</span>
                <div>
                  <span className="fw-semibold text-muted">UPI</span>
                  <span
                    className="badge bg-secondary ms-2"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Card — coming soon */}
              <div
                className="payment-option payment-disabled p-3 rounded border d-flex align-items-center gap-3"
                onClick={() => onPaymentClick("CARD")}
                style={{ cursor: "pointer", opacity: 0.6 }}
              >
                <input
                  type="radio"
                  name="payment"
                  className="form-check-input"
                  disabled
                />
                <span style={{ fontSize: "1.3rem" }}>💳</span>
                <div>
                  <span className="fw-semibold text-muted">
                    Credit / Debit Card
                  </span>
                  <span
                    className="badge bg-secondary ms-2"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: place order summary ───────────────────────── */}
        <div className="col-12 col-lg-5">
          <div className="checkout-card card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold text-success mb-3">🛒 Place Order</h5>
              <p className="text-muted small mb-3">
                Items total and delivery charges are calculated at checkout.
              </p>

              <div className="d-flex justify-content-between mb-1 small">
                <span>Delivery Charges</span>
                <span>₹{DELIVERY_CHARGE} per seller</span>
              </div>
              <div className="d-flex justify-content-between mb-1 small">
                <span>Payment</span>
                <span className="fw-semibold">Cash on Delivery</span>
              </div>

              <hr />

              {placeError && (
                <div className="alert alert-danger py-2 small fw-bold">
                  {placeError}
                </div>
              )}

              <button
                className="btn btn-success w-100 fw-bold"
                onClick={onPlaceOrder}
                disabled={isPlacing || !selectedAddressId}
              >
                {isPlacing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Placing Order…
                  </>
                ) : (
                  "Place Order (COD)"
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
