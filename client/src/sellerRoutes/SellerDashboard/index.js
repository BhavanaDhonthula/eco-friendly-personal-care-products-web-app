import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { Link, Navigate } from "react-router-dom";
import "./index.css";
import {
  fetchSellerProfile,
  fetchSellerProducts,
  fetchSellerOrders,
  updateOrderStatus,
  updateProduct,
} from "../../services/sellerApi";

const IMG_BASE = "http://localhost:8000/major-project-imgs/";

const ORDER_STATUSES = [
  "Placed",
  "Accepted",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLES = {
  Placed: { bg: "bg-secondary", label: "Placed" },
  Accepted: { bg: "bg-primary", label: "Accepted" },
  Packed: { bg: "bg-info text-dark", label: "Packed" },
  Shipped: { bg: "bg-warning text-dark", label: "Shipped" },
  "Out for Delivery": { bg: "bg-orange text-white", label: "Out for Delivery" },
  Delivered: { bg: "bg-success", label: "Delivered" },
  Cancelled: { bg: "bg-danger", label: "Cancelled" },
};

const stockBadgeClass = (stock) => {
  if (stock === undefined || stock === null) return "bg-secondary";
  if (stock === 0) return "bg-danger";
  if (stock <= 5) return "bg-warning text-dark";
  return "bg-success";
};

const stockLabel = (stock) => {
  if (stock === undefined || stock === null) return "N/A";
  if (stock === 0) return "Out of stock";
  if (stock <= 5) return `Low (${stock})`;
  return `${stock} in stock`;
};

// ── Edit Product Modal ────────────────────────────────────────────────────────
const EditProductModal = ({ product, onClose, onSaved }) => {
  const [form, setForm] = useState({
    productName: product.productName || "",
    brand: product.brand || "",
    category: product.category || "",
    price: product.price || "",
    quantity: product.quantity || "",
    stock: product.stock ?? "",
    description: product.description || "",
    ingredients: (product.ingredients || []).join(","),
    ingredientType: product.ingredientType || "",
    carbonFootprint: product.carbonFootprint || "",
    packagingType: product.packagingType || "",
    specifications: (product.specifications || []).join(","),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const thumbnailRef = useRef(null);
  const imgsRef = useRef(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "ingredients" || k === "specifications") {
          formData.append(
            k,
            JSON.stringify(
              v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            ),
          );
        } else {
          formData.append(k, v);
        }
      });
      if (thumbnailRef.current?.files[0])
        formData.append("thumbnail", thumbnailRef.current.files[0]);
      if (imgsRef.current?.files.length) {
        Array.from(imgsRef.current.files).forEach((f) =>
          formData.append("productImgs", f),
        );
      }
      const result = await updateProduct(product._id, formData);
      onSaved(result.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h5 className="fw-bold text-success mb-0">✏️ Edit Product</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="edit-modal-body">
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="row g-3">
            {[
              { label: "Product Name", name: "productName" },
              { label: "Brand", name: "brand" },
              { label: "Category", name: "category" },
              { label: "Price (₹)", name: "price", type: "number" },
              { label: "Quantity (e.g. 200ml)", name: "quantity" },
              { label: "Stock (units)", name: "stock", type: "number" },
              { label: "Ingredient Type", name: "ingredientType" },
              {
                label: "Carbon Footprint (kg)",
                name: "carbonFootprint",
                type: "number",
              },
              { label: "Packaging Type", name: "packagingType" },
            ].map(({ label, name, type }) => (
              <div className="col-12 col-sm-6" key={name}>
                <label className="form-label fw-semibold small mb-1">
                  {label}
                </label>
                <input
                  type={type || "text"}
                  name={name}
                  className="form-control form-control-sm"
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="col-12">
              <label className="form-label fw-semibold small mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="form-control form-control-sm"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small mb-1">
                Ingredients (comma-separated)
              </label>
              <textarea
                name="ingredients"
                rows={2}
                className="form-control form-control-sm"
                value={form.ingredients}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small mb-1">
                Specifications (comma-separated)
              </label>
              <textarea
                name="specifications"
                rows={2}
                className="form-control form-control-sm"
                value={form.specifications}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small mb-1">
                Replace Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                ref={thumbnailRef}
                className="form-control form-control-sm"
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small mb-1">
                Replace Product Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={imgsRef}
                className="form-control form-control-sm"
              />
            </div>
          </div>
        </div>

        <div className="edit-modal-footer">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const ORDER_TAB_GROUPS = ["All", ...ORDER_STATUSES];

const SellerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("products"); // "products" | "orders"
  const [orderTab, setOrderTab] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({}); // orderId → bool
  const [busy, setBusy] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [profileData, productsData, ordersData] = await Promise.all([
        fetchSellerProfile(),
        fetchSellerProducts(),
        fetchSellerOrders(),
      ]);
      setProfile(profileData);
      setProducts(productsData);
      setOrders(ordersData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (!Cookies.get("seller_access_token"))
    return <Navigate to="/seller-login" />;

  const handleStatusChange = async (orderId, newStatus) => {
    setBusy((prev) => ({ ...prev, [orderId]: true }));
    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o,
        ),
      );
    } catch (e) {
      alert(`Failed to update status: ${e.message}`);
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleProductSaved = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)),
    );
    setEditingProduct(null);
  };

  const filteredOrders =
    orderTab === "All"
      ? orders
      : orders.filter((o) => o.orderStatus === orderTab);

  return (
    <div className="seller-dashboard-container container mt-4 mb-5">
      {/* ── Profile Card ─────────────────────────────────────────── */}
      {profile && (
        <div className="seller-profile-card d-flex align-items-center gap-3 border rounded p-3 shadow-sm mb-4">
          {profile.storeLogo ? (
            <img
              src={`${IMG_BASE}${profile.storeLogo}`}
              alt={profile.storeName}
              className="seller-logo"
            />
          ) : (
            <div className="seller-logo-placeholder d-flex align-items-center justify-content-center fw-bold text-white bg-success rounded-circle">
              {profile.storeName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-start">
            <h4 className="fw-bold mb-0">{profile.storeName}</h4>
            <p className="text-muted mb-0">{profile.email}</p>
          </div>
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="fw-bold text-success mb-0">Seller Dashboard</h1>
        <Link to="/seller-add-product" className="btn btn-success fw-bold">
          + Add Product
        </Link>
      </div>

      {/* ── Section toggle ───────────────────────────────────────── */}
      <div className="section-toggle mb-4">
        <button
          className={`toggle-btn ${activeSection === "products" ? "active" : ""}`}
          onClick={() => setActiveSection("products")}
        >
          🛍️ Products ({products.length})
        </button>
        <button
          className={`toggle-btn ${activeSection === "orders" ? "active" : ""}`}
          onClick={() => setActiveSection("orders")}
        >
          📦 Orders ({orders.length})
        </button>
      </div>

      {isLoading ? (
        <p className="fw-bold text-muted">Loading dashboard...</p>
      ) : (
        <>
          {/* ── PRODUCTS section ─────────────────────────────────── */}
          {activeSection === "products" && (
            <>
              {products.length === 0 ? (
                <p className="text-muted fw-bold">
                  No products yet. Add your first product!
                </p>
              ) : (
                <div className="row g-3">
                  {products.map((product) => (
                    <div
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                      key={product._id}
                    >
                      <div className="dashboard-card border rounded p-3 h-100 shadow-sm d-flex flex-column">
                        <div className="d-flex justify-content-center mb-2">
                          <img
                            src={`${IMG_BASE}${product.thumbnail}`}
                            alt={product.productName}
                            className="dashboard-product-img"
                          />
                        </div>
                        <h6 className="fw-bold mb-1">{product.productName}</h6>
                        <p className="mb-1 text-muted small">
                          {product.brand} · {product.category}
                        </p>
                        <p className="mb-1 fw-semibold">₹{product.price}</p>
                        <p className="mb-2 small text-muted">
                          Size: {product.quantity}
                        </p>
                        <span
                          className={`badge ${stockBadgeClass(product.stock)} mb-2 p-3`}
                        >
                          {stockLabel(product.stock)}
                        </span>
                        <div className="mt-auto">
                          <button
                            className="btn btn-outline-success btn-sm w-100"
                            onClick={() => setEditingProduct(product)}
                          >
                            ✏️ Edit Product
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── ORDERS section ───────────────────────────────────── */}
          {activeSection === "orders" && (
            <>
              {/* Status tabs */}
              <div className="order-status-tabs mb-3">
                {ORDER_TAB_GROUPS.map((tab) => {
                  const count =
                    tab === "All"
                      ? orders.length
                      : orders.filter((o) => o.orderStatus === tab).length;
                  return (
                    <button
                      key={tab}
                      className={`status-tab-btn ${orderTab === tab ? "active" : ""}`}
                      onClick={() => setOrderTab(tab)}
                    >
                      {tab}
                      <span className="status-tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {filteredOrders.length === 0 ? (
                <p className="text-muted fw-bold">No orders in "{orderTab}".</p>
              ) : (
                filteredOrders.map((order) => {
                  const style =
                    STATUS_STYLES[order.orderStatus] || STATUS_STYLES.Placed;
                  const isLocked =
                    order.orderStatus === "Delivered" ||
                    order.orderStatus === "Cancelled";
                  const isBusy = !!busy[order._id];
                  return (
                    <div
                      key={order._id}
                      className="order-card border rounded p-3 mb-3 shadow-sm"
                    >
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
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
                          <p className="mb-0 small text-muted">
                            Customer: <strong>{order.userEmail}</strong>
                          </p>
                        </div>
                        <span className={`badge ${style.bg}`}>
                          {style.label}
                        </span>
                      </div>

                      {/* Items */}
                      <ul className="list-unstyled mb-3">
                        {order.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="d-flex align-items-center gap-2 mb-1"
                          >
                            {item.thumbnail && (
                              <img
                                src={`${IMG_BASE}${item.thumbnail}`}
                                alt={item.productName}
                                width="40"
                                height="40"
                                className="rounded"
                                style={{ objectFit: "cover" }}
                              />
                            )}
                            <span className="small">
                              {item.productName} × {item.orderQuantity} — ₹
                              {item.price * item.orderQuantity}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span className="fw-bold">
                          Total: ₹{order.orderTotal}
                        </span>

                        {/* Status changer */}
                        <div className="d-flex align-items-center gap-2">
                          <label className="small fw-semibold mb-0">
                            Update Status:
                          </label>
                          <select
                            className="form-select form-select-sm status-select"
                            style={{ maxWidth: "200px" }}
                            value={order.orderStatus}
                            disabled={isLocked || isBusy}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          {statusUpdating[order._id] && (
                            <span className="spinner-border spinner-border-sm text-success" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleProductSaved}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
