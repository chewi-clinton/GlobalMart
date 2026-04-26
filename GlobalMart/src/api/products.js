import { request, publicRequest } from "./request";

const PRODUCT_URL = "http://62.171.174.37:8002/api/products";
const getToken = () => localStorage.getItem("access_token");

// ─── Categories (public) ──────────────────────────────────────────────

export const getCategories = () =>
  publicRequest(`${PRODUCT_URL}/categories/`, { method: "GET" });

export const getCategoryDetail = (categoryId) =>
  publicRequest(`${PRODUCT_URL}/categories/${categoryId}/`, { method: "GET" });

export const createCategory = (data) =>
  request(`${PRODUCT_URL}/categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateCategory = (categoryId, data) =>
  request(`${PRODUCT_URL}/categories/${categoryId}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// ─── Products ─────────────────────────────────────────────────────────

// Public GET — no auth header so DRF doesn't reject on AllowAny endpoints
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return publicRequest(`${PRODUCT_URL}/${query ? "?" + query : ""}`, { method: "GET" });
};

export const getProductDetail = (productId) =>
  publicRequest(`${PRODUCT_URL}/${productId}/`, { method: "GET" });

// Authenticated writes
export const createProduct = (data) =>
  request(`${PRODUCT_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateProduct = (productId, data) =>
  request(`${PRODUCT_URL}/${productId}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteProduct = (productId) =>
  request(`${PRODUCT_URL}/${productId}/`, { method: "DELETE" });

// ─── Variants (public reads, authenticated writes) ────────────────────

export const getProductVariants = (productId) =>
  publicRequest(`${PRODUCT_URL}/${productId}/variants/`, { method: "GET" });

export const createProductVariant = (productId, data) =>
  request(`${PRODUCT_URL}/${productId}/variants/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// ─── Images (public reads, authenticated writes) ──────────────────────

export const getProductImages = (productId) =>
  publicRequest(`${PRODUCT_URL}/${productId}/images/`, { method: "GET" });

export const uploadProductImage = async (productId, file, options = {}) => {
  const formData = new FormData();
  formData.append("image", file);
  if (options.is_primary !== undefined) formData.append("is_primary", String(options.is_primary));
  if (options.alt_text) formData.append("alt_text", options.alt_text);
  if (options.display_order !== undefined) formData.append("display_order", String(options.display_order));
  return request(`${PRODUCT_URL}/${productId}/images/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
};

export const deleteProductImage = (productId, imageId) =>
  request(`${PRODUCT_URL}/${productId}/images/${imageId}/`, { method: "DELETE" });

export const setImagePrimary = (productId, imageId) =>
  request(`${PRODUCT_URL}/${productId}/images/${imageId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_primary: true }),
  });
