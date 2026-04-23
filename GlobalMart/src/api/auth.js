import { request } from "./request";

const AUTH_URL = "http://62.171.174.37:8001/api/auth";

export const register = async (userData) => {
  const res = await fetch(`${AUTH_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const login = async (credentials) => {
  // Use plain fetch — no auth header needed, and must never trigger clearSession
  const res = await fetch(`${AUTH_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (data?.access) {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
  }
  return data;
};

export const logout = async () => {
  const data = await request(`${AUTH_URL}/logout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
  });
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  return data;
};

export const getProfile = () =>
  request(`${AUTH_URL}/profile/`, { method: "GET" });

export const updateProfile = (profileData) =>
  request(`${AUTH_URL}/profile/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

export const changePassword = (passwordData) =>
  request(`${AUTH_URL}/change-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData),
  });

export const forgotPassword = (email) =>
  request(`${AUTH_URL}/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const refreshToken = async () => {
  const data = await request(`${AUTH_URL}/login/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
  });
  if (data?.access) localStorage.setItem("access_token", data.access);
  return data;
};

export const isLoggedIn = () => !!localStorage.getItem("access_token");

// ─── Admin ────────────────────────────────────────────────────────────

export const getAdminUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${AUTH_URL}/admin/users/${query ? "?" + query : ""}`, { method: "GET" });
};

export const updateUserStatus = (userId, isActive) =>
  request(`${AUTH_URL}/admin/users/${userId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: isActive }),
  });
