// ── Base URLs for each service ──
const AUTH_URL = "http://62.171.174.37:8001/api/auth";
const PRODUCT_URL = "http://62.171.174.37:8002/api/products";

// ── Helper function to get token from localStorage ──
const getToken = () => localStorage.getItem("access_token");

// ── Helper function for authenticated requests ──
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ════════════════════════════════════════
// AUTH SERVICES
// ════════════════════════════════════════

// Register
export const register = async (userData) => {
  const response = await fetch(`${AUTH_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Login
export const login = async (credentials) => {
  const response = await fetch(`${AUTH_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  // Save tokens to localStorage if login successful
  if (data.access) {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
  }
  return data;
};

// Logout
export const logout = async () => {
  const response = await fetch(`${AUTH_URL}/logout/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      refresh: localStorage.getItem("refresh_token"),
    }),
  });
  // Clear tokens from localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  return response.json();
};

// Get Profile
export const getProfile = async () => {
  const response = await fetch(`${AUTH_URL}/profile/`, {
    method: "GET",
    headers: authHeaders(),
  });
  return response.json();
};

// Update Profile
export const updateProfile = async (profileData) => {
  const response = await fetch(`${AUTH_URL}/profile/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(profileData),
  });
  return response.json();
};

// Change Password
export const changePassword = async (passwordData) => {
  const response = await fetch(`${AUTH_URL}/change-password/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(passwordData),
  });
  return response.json();
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await fetch(`${AUTH_URL}/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

// Refresh Token
export const refreshToken = async () => {
  const response = await fetch(`${AUTH_URL}/login/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh: localStorage.getItem("refresh_token"),
    }),
  });
  const data = await response.json();
  if (data.access) {
    localStorage.setItem("access_token", data.access);
  }
  return data;
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};

// ════════════════════════════════════════
// PRODUCT SERVICES
// ════════════════════════════════════════

// Get all products
export const getProducts = async () => {
  const response = await fetch(`${PRODUCT_URL}/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

// Get single product
export const getProduct = async (productId) => {
  const response = await fetch(`${PRODUCT_URL}/${productId}/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

// Create product (seller only)
export const createProduct = async (productData) => {
  const response = await fetch(`${PRODUCT_URL}/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  return response.json();
};

// Update product
export const updateProduct = async (productId, productData) => {
  const response = await fetch(`${PRODUCT_URL}/${productId}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  return response.json();
};

// Delete product
export const deleteProduct = async (productId) => {
  const response = await fetch(`${PRODUCT_URL}/${productId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return response.json();
};

// Get product categories
export const getCategories = async () => {
  const response = await fetch(`${PRODUCT_URL}/categories/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

// Get product images
export const getProductImages = async (productId) => {
  const response = await fetch(`${PRODUCT_URL}/${productId}/images/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

// Get product variants
export const getProductVariants = async (productId) => {
  const response = await fetch(`${PRODUCT_URL}/${productId}/variants/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};