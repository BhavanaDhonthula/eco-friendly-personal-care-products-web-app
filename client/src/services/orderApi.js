import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = Cookies.get("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const placeOrder = async (addressId, paymentMethod) => {
  const response = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ addressId, paymentMethod }),
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  }
  throw new Error(data.err_msg || "Unable to place order");
};

export const fetchUserOrders = async () => {
  const response = await fetch(`${BASE_URL}/orders`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  return [];
};

// POST /products/:productId/comments
export const postComment = async (productId, rating, comment) => {
  const response = await fetch(`${BASE_URL}/products/${productId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rating, comment }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.err_msg || "Failed to post review");
  return data;
};

// GET /products/:productId/comments  (no auth needed)
export const fetchComments = async (productId) => {
  const response = await fetch(`${BASE_URL}/products/${productId}/comments`);
  const data = await response.json();
  return response.ok ? data : { comments: [], avgRating: null, total: 0 };
};
