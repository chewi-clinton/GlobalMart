const AUTH_REFRESH_URL = "http://62.171.174.37:8001/api/auth/login/refresh/";

const getToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

let _refreshPromise = null;
let _isLoggingOut = false;

const clearSession = () => {
  if (_isLoggingOut) return;
  _isLoggingOut = true;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
  window.location.href = "/login";
};

const tryRefresh = () => {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await fetch(AUTH_REFRESH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          localStorage.setItem("access_token", data.access);
          return data.access;
        }
      }
    } catch {}
    return null;
  })().finally(() => { _refreshPromise = null; });
  return _refreshPromise;
};

/**
 * Authenticated request — sends Bearer token, auto-refreshes on 401.
 * Use for endpoints that REQUIRE authentication.
 */
export const request = async (url, options = {}) => {
  const token = getToken();
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }

  let res = await fetch(url, options);

  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      options.headers = { ...options.headers, Authorization: `Bearer ${newToken}` };
      res = await fetch(url, options);
      // Still 401 after refresh = backend JWT secret mismatch (backend config issue).
      // Return error data, do NOT clear session — user is still valid on auth service.
      if (res.status === 401) return res.json();
    } else {
      // Refresh failed = session genuinely expired → logout
      clearSession();
      return null;
    }
  }

  if (res.status === 204) return null;
  return res.json();
};

/**
 * Public request — NO auth header sent.
 * Use for endpoints that are AllowAny (product list, categories, etc.)
 * This avoids DRF rejecting requests with an invalid/wrong-secret JWT header.
 */
export const publicRequest = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (res.status === 204) return null;
  return res.json();
};
