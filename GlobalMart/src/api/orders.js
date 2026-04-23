import { request } from "./request";

const ORDER_URL = "http://62.171.174.37:8005/api/orders";

export const getOrders = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${ORDER_URL}/${query ? "?" + query : ""}`, { method: "GET" });
};

export const getOrder = (orderId) =>
  request(`${ORDER_URL}/${orderId}/`, { method: "GET" });

export const placeOrder = (orderData) =>
  request(`${ORDER_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

export const cancelOrder = (orderId, data = {}) =>
  request(`${ORDER_URL}/${orderId}/cancel/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getAdminOrders = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${ORDER_URL}/admin/all/${query ? "?" + query : ""}`, { method: "GET" });
};
