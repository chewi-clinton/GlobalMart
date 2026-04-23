import { request } from "./request";

const INVENTORY_URL = "http://62.171.174.37:8004/api/inventory";

export const getInventory = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${INVENTORY_URL}/${query ? "?" + query : ""}`, { method: "GET" });
};

export const getInventoryDetail = (inventoryId) =>
  request(`${INVENTORY_URL}/${inventoryId}/`, { method: "GET" });

export const checkStock = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${INVENTORY_URL}/check/?${query}`, { method: "GET" });
};

export const getWarehouses = () =>
  request(`${INVENTORY_URL}/warehouses/`, { method: "GET" });

export const adjustStock = (inventoryId, data) =>
  request(`${INVENTORY_URL}/${inventoryId}/adjust/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateThreshold = (inventoryId, reorderThreshold) =>
  request(`${INVENTORY_URL}/${inventoryId}/threshold/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reorder_threshold: reorderThreshold }),
  });
