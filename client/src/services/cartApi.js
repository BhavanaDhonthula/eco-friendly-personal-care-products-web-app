import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = Cookies.get("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Maps a cart item as stored in the database (with productId &
// cartItemId) to the shape the rest of the app expects, where `_id`
// refers to the product's id (so existing components like ProductCard
// and CartItemCard keep working unchanged).
export const mapCartItemFromApi = (item) => ({
  ...item,
  _id: item.productId,
  cartItemId: item._id,
});

export const fetchCart = async () => {
  const response = await fetch(`${BASE_URL}/cart`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data.map(mapCartItemFromApi);
  }

  return [];
};

export const addItemToCart = async (productId) => {
  const response = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  const data = await response.json();

  if (response.ok) {
    return data.cartItems.map(mapCartItemFromApi);
  }

  throw new Error(data.err_msg || "Unable to add item to cart");
};

export const updateCartItemQty = async (cartItemId, action) => {
  const response = await fetch(`${BASE_URL}/cart/${cartItemId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action }),
  });
  const data = await response.json();

  if (response.ok) {
    return data.cartItems.map(mapCartItemFromApi);
  }

  throw new Error(data.err_msg || "Unable to update cart");
};

export const removeItemFromCart = async (cartItemId) => {
  const response = await fetch(`${BASE_URL}/cart/${cartItemId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data.cartItems.map(mapCartItemFromApi);
  }

  throw new Error(data.err_msg || "Unable to remove item from cart");
};

export const clearUserCart = async () => {
  const response = await fetch(`${BASE_URL}/cart`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return [];
  }

  throw new Error(data.err_msg || "Unable to clear cart");
};
