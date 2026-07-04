import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = Cookies.get("seller_access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getAuthHeadersNoContentType = () => {
  const token = Cookies.get("seller_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchSellerProducts = async () => {
  const response = await fetch(`${BASE_URL}/seller-products`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  return [];
};

export const fetchSellerOrders = async () => {
  const response = await fetch(`${BASE_URL}/seller-orders`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  return [];
};

export const fetchSellerProfile = async () => {
  const response = await fetch(`${BASE_URL}/seller-profile`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  return null;
};

// PATCH /seller-orders/:orderId/status
export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await fetch(`${BASE_URL}/seller-orders/${orderId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderStatus }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.err_msg || "Failed to update status");
  return data;
};

// PUT /seller-products/:productId  (multipart for optional image re-upload)
export const updateProduct = async (productId, formData) => {
  const response = await fetch(`${BASE_URL}/seller-products/${productId}`, {
    method: "PUT",
    headers: getAuthHeadersNoContentType(), // let browser set multipart boundary
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.err_msg || "Failed to update product");
  return data;
};