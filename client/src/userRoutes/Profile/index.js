import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";
import { fetchUserOrders } from "../../services/orderApi";

const BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = Cookies.get("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Delete Account Confirmation Modal ─────────────────────────────────────────
const DeleteAccountModal = ({ onClose, onDeleted }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) {
      setError("Please enter your password to confirm.");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/delete-account`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.err_msg || "Failed to delete account.");
        return;
      }
      onDeleted();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="delete-modal-header">
          <h5 className="fw-bold text-danger mb-0">⚠️ Delete Account</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-muted mb-1" style={{ fontSize: "0.95rem" }}>
            This action is <strong>permanent and cannot be undone</strong>. Your
            account, cart, addresses, and reviews will be deleted.
          </p>
          <p className="text-muted mb-3" style={{ fontSize: "0.95rem" }}>
            Enter your password to confirm:
          </p>

          <input
            type="password"
            className="form-control mb-2"
            placeholder="Your current password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            autoFocus
          />

          {error && (
            <div
              className="alert alert-danger py-2 mb-2"
              style={{ fontSize: "0.88rem" }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="delete-modal-footer">
          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger fw-bold"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting…
              </>
            ) : (
              "Yes, Delete My Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`${BASE_URL}/user-profile`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      const loadOrders = async () => {
        setIsLoadingOrders(true);
        const data = await fetchUserOrders();
        setOrders(data);
        setIsLoadingOrders(false);
      };
      loadOrders();
    }
  }, [activeTab]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("letter");
    navigate("/login");
  };

  // Called after successful deletion — clear cookies and redirect
  const handleAccountDeleted = () => {
    Cookies.remove("access_token");
    Cookies.remove("letter");
    navigate("/register");
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Placed":
        return "bg-primary";
      case "Confirmed":
        return "bg-info text-dark";
      case "Shipped":
        return "bg-warning text-dark";
      case "Delivered":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const username =
    userProfile?.username || Cookies.get("letter")?.toUpperCase() || "User";
  const email = userProfile?.email || "";
  const letter = username.charAt(0).toUpperCase();

  const sidebarItems = [
    { id: "dashboard", label: "Profile Dashboard", icon: "👤" },
    { id: "orders", label: "Order History", icon: "📦" },
    { id: "account", label: "Account Information", icon: "ℹ️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="profile-bg-container container mt-4 mb-5">
      <div className="row g-4">
        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="col-12 col-md-3">
          <div className="profile-avatar-card card shadow-sm mb-3 text-center p-3">
            <div className="profile-avatar mx-auto mb-2">{letter}</div>
            {isLoadingProfile ? (
              <p className="text-muted small mb-0">Loading...</p>
            ) : (
              <>
                <h6 className="fw-bold mb-0">{username}</h6>
                <p className="text-muted small mb-0">{email}</p>
              </>
            )}
          </div>

          <div className="list-group shadow-sm">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 fw-semibold ${activeTab === item.id ? "active-tab" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <Link
              to="/addresses"
              className="list-group-item list-group-item-action d-flex align-items-center gap-2 fw-semibold"
            >
              <span>🏠</span> Manage Addresses
            </Link>

            <Link
              to="/orders"
              className="list-group-item list-group-item-action d-flex align-items-center gap-2 fw-semibold"
            >
              <span>🚚</span>Track Orders
            </Link>

            <button
              className="list-group-item list-group-item-action d-flex align-items-center gap-2 fw-semibold text-danger"
              onClick={handleLogout}
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────────────── */}
        <div className="col-12 col-md-9">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="profile-content-card card shadow-sm p-4">
              <h4 className="fw-bold text-success mb-4">
                Welcome back, {username}! 👋
              </h4>

              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div
                    className="profile-stat-card text-center p-3 rounded border"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("orders")}
                  >
                    <div className="stat-icon">📦</div>
                    <p className="fw-bold mb-0 mt-1">My Orders</p>
                    <p className="text-muted small mb-0">View history</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/addresses" style={{ textDecoration: "none" }}>
                    <div className="profile-stat-card text-center p-3 rounded border">
                      <div className="stat-icon">🏠</div>
                      <p className="fw-bold mb-0 mt-1">Addresses</p>
                      <p className="text-muted small mb-0">Manage</p>
                    </div>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/cart" style={{ textDecoration: "none" }}>
                    <div className="profile-stat-card text-center p-3 rounded border">
                      <div className="stat-icon">🛒</div>
                      <p className="fw-bold mb-0 mt-1">My Cart</p>
                      <p className="text-muted small mb-0">Continue shopping</p>
                    </div>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <div
                    className="profile-stat-card text-center p-3 rounded border"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("settings")}
                  >
                    <div className="stat-icon">⚙️</div>
                    <p className="fw-bold mb-0 mt-1">Settings</p>
                    <p className="text-muted small mb-0">Preferences</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded eco-tip-box">
                <p className="mb-0 fw-semibold">
                  🌿 <strong>Eco Tip:</strong> Every eco-friendly purchase you
                  make helps reduce carbon emissions. Keep it green!
                </p>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="profile-content-card card shadow-sm p-4">
              <h4 className="fw-bold text-success mb-4">📦 Order History</h4>
              {isLoadingOrders ? (
                <p className="text-muted fw-bold">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center mt-4">
                  <p className="text-muted fw-bold">
                    You haven't placed any orders yet.
                  </p>
                  <Link to="/products" className="btn btn-success mt-2">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="order-card mb-3 p-3 border rounded"
                  >
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                      <div>
                        <span className="fw-bold text-success">
                          {order.orderId}
                        </span>
                        <span className="text-muted small ms-2">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <span
                        className={`badge ${statusBadgeClass(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <ul className="list-unstyled mb-2">
                      {order.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="d-flex align-items-center gap-2 mb-1"
                        >
                          {item.thumbnail && (
                            <img
                              src={`http://localhost:8000/major-project-imgs/${item.thumbnail}`}
                              alt={item.productName}
                              width="40"
                              height="40"
                              className="rounded"
                              style={{ objectFit: "cover" }}
                            />
                          )}
                          <span style={{ fontSize: "0.9rem" }}>
                            {item.productName} × {item.orderQuantity} — ₹
                            {item.price * item.orderQuantity}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">
                        Seller: <strong>{order.sellerName}</strong>
                      </span>
                      <span className="fw-bold">
                        Total: ₹{order.orderTotal}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Account Info Tab */}
          {activeTab === "account" && (
            <div className="profile-content-card card shadow-sm p-4">
              <h4 className="fw-bold text-success mb-4">
                ℹ️ Account Information
              </h4>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    readOnly
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    readOnly
                  />
                </div>
                {userProfile?.mobileNumber && (
                  <div className="col-12">
                    <label className="form-label fw-bold">Mobile Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userProfile.mobileNumber}
                      readOnly
                    />
                  </div>
                )}
              </div>
              <div
                className="alert alert-info mt-4 py-2"
                style={{ fontSize: "0.88rem" }}
              >
                To update your account details, please contact support.
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="profile-content-card card shadow-sm p-4">
              <h4 className="fw-bold text-success mb-4">⚙️ Settings</h4>

              <div className="settings-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                <div>
                  <p className="fw-bold mb-0">Email Notifications</p>
                  <p className="text-muted small mb-0">
                    Receive order updates via email
                  </p>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                  />
                </div>
              </div>

              <div className="settings-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                <div>
                  <p className="fw-bold mb-0">Eco Score Alerts</p>
                  <p className="text-muted small mb-0">
                    Notify me about eco-friendly deals
                  </p>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                  />
                </div>
              </div>

              <div className="settings-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                <div>
                  <p className="fw-bold mb-0">Promotional Emails</p>
                  <p className="text-muted small mb-0">
                    Receive coupons and offers
                  </p>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </div>

              <hr />
              <div className="mt-2">
                <button
                  className="btn btn-outline-danger fw-bold"
                  onClick={handleLogout}
                >
                  🚪 Logout from EcoGlow
                </button>

                <div className="delete-account-box p-3 rounded border border-danger mt-2">
                  <p className="fw-bold text-danger mb-1">🗑️ Delete Account</p>
                  <p className="text-muted small mb-3">
                    Permanently delete your EcoGlow account and all associated
                    data. This action cannot be undone.
                  </p>
                  <button
                    className="btn btn-danger btn-sm fw-bold"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onDeleted={handleAccountDeleted}
        />
      )}
    </div>
  );
};

export default Profile;
