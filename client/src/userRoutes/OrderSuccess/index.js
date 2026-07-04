import { useLocation, Link } from "react-router-dom";
import "./index.css";

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state?.orderData;

  // Estimate delivery: today + 5 days
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryDateStr = estimatedDelivery.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const orders = orderData?.orders || [];
  const orderIds = orders.map((o) => o.orderId).join(", ");

  return (
    <div className="order-success-bg-container d-flex flex-column align-items-center justify-content-center">
      <div className="order-success-card text-center p-4 shadow-sm rounded">
        {/* Success icon */}
        <div className="success-icon-wrapper mb-3">
          <span className="success-checkmark">✅</span>
        </div>

        <h2 className="fw-bold text-success mb-1">
          Order Placed Successfully!
        </h2>
        <p className="text-muted mb-3">
          Thank you for shopping with EcoGlow. Your eco-friendly order is
          confirmed.
        </p>

        {/* Order details */}
        {orders.length > 0 && (
          <div className="order-details-box p-3 mb-3 rounded text-start">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                Order ID{orders.length > 1 ? "s" : ""}
              </span>
              <span className="fw-bold text-success">{orderIds}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Items Total</span>
              <span className="fw-semibold">₹{orderData?.itemsTotal}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Delivery Charges</span>
              <span className="fw-semibold">₹{orderData?.deliveryCharges}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between">
              <span className="fw-bold">Order Total</span>
              <span className="fw-bold text-success">
                ₹{orderData?.orderTotal}
              </span>
            </div>
          </div>
        )}

        {/* Delivery estimate */}
        <div className="delivery-estimate p-3 mb-4 rounded">
          <p className="mb-0">
            📦 Estimated Delivery: <strong>{deliveryDateStr}</strong>
          </p>
        </div>

        {/* Shipping address */}
        {orderData?.shippingAddress && (
          <div className="shipping-address-box p-3 mb-4 rounded text-start">
            <p className="fw-bold mb-1">🏠 Shipping To</p>
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
              {orderData.shippingAddress.fullName}
              <br />
              {orderData.shippingAddress.addressLine},{" "}
              {orderData.shippingAddress.locality &&
                `${orderData.shippingAddress.locality}, `}
              {orderData.shippingAddress.city},{" "}
              {orderData.shippingAddress.state} —{" "}
              {orderData.shippingAddress.pincode}
              <br />
              📞 {orderData.shippingAddress.mobileNumber}
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <Link to="/products" className="btn btn-success fw-bold px-4">
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn btn-outline-success fw-bold px-4">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
