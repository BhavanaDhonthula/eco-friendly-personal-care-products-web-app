import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = Cookies.get("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchAddresses = async () => {
  const response = await fetch(`${BASE_URL}/addresses`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  return [];
};

export const createAddress = async (addressDetails) => {
  const response = await fetch(`${BASE_URL}/addresses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(addressDetails),
  });
  const data = await response.json();

  if (response.ok) {
    return data.addresses;
  }

  throw new Error(data.err_msg || "Unable to add address");
};

export const editAddress = async (addressId, addressDetails) => {
  const response = await fetch(`${BASE_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(addressDetails),
  });
  const data = await response.json();

  if (response.ok) {
    return data.addresses;
  }

  throw new Error(data.err_msg || "Unable to update address");
};

export const removeAddress = async (addressId) => {
  const response = await fetch(`${BASE_URL}/addresses/${addressId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (response.ok) {
    return data.addresses;
  }

  throw new Error(data.err_msg || "Unable to remove address");
};
