import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, updateUserStatus, getAdminOrders, getProducts, deleteProduct } from "../api";
import { showToast } from "../components/Toast";
import "../styles/SuperAdminDashboard.css";

// ─── Helpers ──────────────────────────────────────────────────────────

const getTokenPayload = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
};

const groupByMonth = (orders) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const map = {};
  orders.forEach((o) => {
    const d = new Date(o.order_date);
    const key = months[d.getMonth()];
    map[key] = (map[key] || 0) + parseFloat(o.total_amount || 0);
  });
  return months
    .filter((m) => map[m] !== undefined)
    .slice(-7)
    .map((m) => ({ month: m, revenue: map[m] }));
};

// ─── Status Badge ─────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const colors = {
    active: { bg: "#e6f4ea", color: "#007600" },
    approved: { bg: "#e6f4ea", color: "#007600" },
    delivered: { bg: "#e6f4ea", color: "#007600" },
    shipped: { bg: "#e8f0fe", color: "#1a73e8" },
    confirmed: { bg: "#e8f0fe", color: "#1a73e8" },
    processing: { bg: "#e8f0fe", color: "#1a73e8" },
    pending: { bg: "#fff8e1", color: "#e47911" },
    inactive: { bg: "#fce8e6", color: "#cc0c39" },
    suspended: { bg: "#fce8e6", color: "#cc0c39" },
    cancelled: { bg: "#fce8e6", color: "#cc0c39" },
    refunded: { bg: "#f5f5f5", color: "#555" },
    unpaid: { bg: "#fff8e1", color: "#e47911" },
    paid: { bg: "#e6f4ea", color: "#007600" },
    failed: { bg: "#fce8e6", color: "#cc0c39" },
  };
  const key = status?.toLowerCase();
  const style = colors[key] || { bg: "#f5f5f5", color: "#555" };
  return (
    <span className="sa__badge" style={{ backgroundColor: style.bg, color: style.color }}>
      {status}
    </span>
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────

const BarChart = ({ data }) => {
  if (!data.length) return <p style={{ color: "#888", padding: "20px" }}>No data available.</p>;
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="sa__chart">
      {data.map((d, i) => (
        <div key={i} className="sa__chart-bar-wrapper">
          <div
            className="sa__chart-bar"
            style={{ height: `${max > 0 ? (d.revenue / max) * 100 : 0}%` }}
            title={`${d.revenue.toLocaleString()}`}
          />
          <span className="sa__chart-label">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");

  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProductsList] = useState([]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "sellers", label: "Sellers" },
    { id: "orders", label: "All Orders" },
    { id: "products", label: "All Products" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const [custData, sellerData] = await Promise.all([
        getAdminUsers({ role: "customer" }),
        getAdminUsers({ role: "seller" }),
      ]);
      setCustomers(Array.isArray(custData) ? custData : []);
      setSellers(Array.isArray(sellerData) ? sellerData : []);
    } catch {} finally { setUsersLoading(false); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {} finally { setOrdersLoading(false); }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await getProducts({ status: "active" });
      setProductsList(Array.isArray(data) ? data : []);
    } catch {} finally { setProductsLoading(false); }
  }, []);

  useEffect(() => {
    const payload = getTokenPayload();
    if (!payload || payload.role !== "admin") { navigate("/login"); return; }
  }, []);

  useEffect(() => {
    if (activeSection === "home") { fetchUsers(); fetchOrders(); fetchProducts(); }
    if (activeSection === "users") fetchUsers();
    if (activeSection === "sellers") fetchUsers();
    if (activeSection === "orders") fetchOrders();
    if (activeSection === "products") fetchProducts();
    if (activeSection === "analytics") { fetchOrders(); fetchUsers(); }
  }, [activeSection]);

  // ─── Stats ──────────────────────────────────────────────────────────

  const totalRevenue = orders
    .filter((o) => ["delivered", "confirmed", "processing", "shipped"].includes(o.status))
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const monthlyChart = groupByMonth(orders);

  // ─── Actions ────────────────────────────────────────────────────────

  const handleUserStatus = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, isActive);
      showToast(isActive ? "User activated." : "User suspended.", isActive ? "success" : "warning");
      fetchUsers();
    } catch {
      showToast("Failed to update user status.", "error");
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm("Deactivate this product?")) return;
    try {
      await deleteProduct(productId);
      showToast("Product deactivated.", "success");
      fetchProducts();
    } catch {
      showToast("Failed to deactivate product.", "error");
    }
  };

  // ─── Filtered Lists ──────────────────────────────────────────────────

  const filteredCustomers = customers.filter((u) =>
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSellers = sellers.filter((s) =>
    s.username?.toLowerCase().includes(sellerSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    String(o.order_id).includes(orderSearch) ||
    String(o.customer_id).includes(orderSearch)
  );

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="sa">

      {/* Sidebar */}
      <aside className="sa__sidebar">
        <div className="sa__sidebar-logo">
          <h1 onClick={() => navigate("/")}>GlobalMart</h1>
          <span>Super Admin</span>
        </div>
        <nav className="sa__sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sa__nav-item ${activeSection === item.id ? "sa__nav-item--active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sa__sidebar-footer">
          <button className="sa__sidebar-logout" onClick={() => navigate("/")}>
            🚪 Back to Store
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sa__main">

        {/* ── HOME ── */}
        {activeSection === "home" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Platform Overview</h2>
            <div className="sa__cards">
              {[
                { label: "Total Revenue", value: `${totalRevenue.toLocaleString(undefined, {maximumFractionDigits:2})}`, color: "#007600" },
                { label: "Total Users", value: customers.length, color: "#6b21a8" },
                { label: "Total Sellers", value: sellers.length, color: "#e47911" },
                { label: "Total Orders", value: orders.length, color: "#1a73e8" },
                { label: "Pending Orders", value: orders.filter((o) => o.status === "pending").length, color: "#e47911" },
                { label: "Total Products", value: products.length, color: "#007600" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <div>
                    <p className="sa__card-label">{card.label}</p>
                    <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="sa__chart-section">
              <h3 className="sa__subsection-title">Platform Revenue by Month</h3>
              <BarChart data={monthlyChart} />
            </div>

            <div className="sa__table-section">
              <h3 className="sa__subsection-title">Recent Orders</h3>
              <table className="sa__table">
                <thead>
                  <tr><th>Order ID</th><th>Customer ID</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {ordersLoading
                    ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>Loading...</td></tr>
                    : orders.slice(0, 5).map((order) => (
                      <tr key={order.order_id}>
                        <td className="sa__td-id">#{order.order_id}</td>
                        <td>{order.customer_id}</td>
                        <td>{parseFloat(order.total_amount).toLocaleString()} {order.currency_code}</td>
                        <td><StatusBadge status={order.payment_status} /></td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeSection === "users" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Users Management</h2>
            <div className="sa__cards">
              {[
                { label: "Total Users", value: customers.length, color: "#1a73e8" },
                { label: "Active", value: customers.filter((u) => u.is_active).length, color: "#007600" },
                { label: "Suspended", value: customers.filter((u) => !u.is_active).length, color: "#cc0c39" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <p className="sa__card-label">{card.label}</p>
                  <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="sa__search" />
            {usersLoading
              ? <p style={{ padding: "1rem", color: "#888" }}>Loading users...</p>
              : (
                <table className="sa__table">
                  <thead>
                    <tr><th>#</th><th>Username</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No users found.</td></tr>
                      : filteredCustomers.map((user, i) => (
                        <tr key={user.user_id}>
                          <td className="sa__td-muted">{i + 1}</td>
                          <td className="sa__td-bold">{user.username}</td>
                          <td className="sa__td-muted">{user.email}</td>
                          <td className="sa__td-muted">{user.phone || "—"}</td>
                          <td className="sa__td-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td><StatusBadge status={user.is_active ? "active" : "suspended"} /></td>
                          <td>
                            <button
                              className={`sa__action-btn ${user.is_active ? "sa__action-btn--reject" : "sa__action-btn--approve"}`}
                              onClick={() => handleUserStatus(user.user_id, !user.is_active)}
                            >
                              {user.is_active ? "Suspend" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* ── SELLERS ── */}
        {activeSection === "sellers" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Sellers Management</h2>
            <div className="sa__cards">
              {[
                { label: "Total Sellers", value: sellers.length, color: "#1a73e8" },
                { label: "Active", value: sellers.filter((s) => s.is_active).length, color: "#007600" },
                { label: "Suspended", value: sellers.filter((s) => !s.is_active).length, color: "#cc0c39" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <p className="sa__card-label">{card.label}</p>
                  <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Search sellers..." value={sellerSearch} onChange={(e) => setSellerSearch(e.target.value)} className="sa__search" />
            {usersLoading
              ? <p style={{ padding: "1rem", color: "#888" }}>Loading sellers...</p>
              : (
                <table className="sa__table">
                  <thead>
                    <tr><th>#</th><th>Username</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredSellers.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No sellers found.</td></tr>
                      : filteredSellers.map((seller, i) => (
                        <tr key={seller.user_id}>
                          <td className="sa__td-muted">{i + 1}</td>
                          <td className="sa__td-bold">{seller.username}</td>
                          <td className="sa__td-muted">{seller.email}</td>
                          <td className="sa__td-muted">{seller.phone || "—"}</td>
                          <td className="sa__td-muted">{new Date(seller.created_at).toLocaleDateString()}</td>
                          <td><StatusBadge status={seller.is_active ? "active" : "suspended"} /></td>
                          <td>
                            <button
                              className={`sa__action-btn ${seller.is_active ? "sa__action-btn--reject" : "sa__action-btn--approve"}`}
                              onClick={() => handleUserStatus(seller.user_id, !seller.is_active)}
                            >
                              {seller.is_active ? "Suspend" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* ── ALL ORDERS ── */}
        {activeSection === "orders" && (
          <div className="sa__section">
            <h2 className="sa__section-title">All Orders</h2>
            <div className="sa__cards">
              {[
                { label: "Total", value: orders.length, color: "#1a73e8" },
                { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "#e47911" },
                { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, color: "#007600" },
                { label: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length, color: "#cc0c39" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <p className="sa__card-label">{card.label}</p>
                  <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Search by order ID or customer ID..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="sa__search" />
            {ordersLoading
              ? <p style={{ padding: "1rem", color: "#888" }}>Loading orders...</p>
              : (
                <table className="sa__table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer ID</th><th>Items</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No orders found.</td></tr>
                      : filteredOrders.map((order) => (
                        <tr key={order.order_id}>
                          <td className="sa__td-id">#{order.order_id}</td>
                          <td>{order.customer_id}</td>
                          <td>{order.items_count}</td>
                          <td className="sa__td-muted">{new Date(order.order_date).toLocaleDateString()}</td>
                          <td>{parseFloat(order.total_amount).toLocaleString()} {order.currency_code}</td>
                          <td><StatusBadge status={order.payment_status} /></td>
                          <td><StatusBadge status={order.status} /></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* ── ALL PRODUCTS ── */}
        {activeSection === "products" && (
          <div className="sa__section">
            <h2 className="sa__section-title">All Products</h2>
            <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="sa__search" />
            {productsLoading
              ? <p style={{ padding: "1rem", color: "#888" }}>Loading products...</p>
              : (
                <table className="sa__table">
                  <thead>
                    <tr><th>#</th><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No products found.</td></tr>
                      : filteredProducts.map((p, i) => (
                        <tr key={p.product_id}>
                          <td className="sa__td-muted">{i + 1}</td>
                          <td>
                            {p.primary_image
                              ? <img src={p.primary_image} alt={p.title} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                              : <div style={{ width: 48, height: 48, borderRadius: 6, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>
                            }
                          </td>
                          <td className="sa__td-bold">{p.title}</td>
                          <td>{p.category_name || "—"}</td>
                          <td>{parseFloat(p.base_price).toLocaleString()} {p.currency_code}</td>
                          <td><StatusBadge status={p.status} /></td>
                          <td>
                            <button className="sa__action-btn sa__action-btn--reject" onClick={() => handleRemoveProduct(p.product_id)}>
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeSection === "analytics" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Platform Analytics</h2>
            <div className="sa__analytics-grid">
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title">Revenue Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Total Revenue", value: totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                    { label: "Total Orders", value: orders.length },
                    { label: "Delivered Orders", value: orders.filter((o) => o.status === "delivered").length },
                    { label: "Cancelled Orders", value: orders.filter((o) => o.status === "cancelled").length },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title">Users Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Total Customers", value: customers.length },
                    { label: "Active Customers", value: customers.filter((u) => u.is_active).length },
                    { label: "Total Sellers", value: sellers.length },
                    { label: "Active Sellers", value: sellers.filter((s) => s.is_active).length },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title">Orders Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Pending", value: orders.filter((o) => o.status === "pending").length },
                    { label: "Processing", value: orders.filter((o) => o.status === "processing").length },
                    { label: "Shipped", value: orders.filter((o) => o.status === "shipped").length },
                    { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title">Products Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Total Products", value: products.length },
                    { label: "Active", value: products.filter((p) => p.status === "active").length },
                    { label: "Inactive", value: products.filter((p) => p.status === "inactive").length },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sa__chart-section">
              <h3 className="sa__subsection-title">Monthly Revenue Trend</h3>
              <BarChart data={monthlyChart} />
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeSection === "settings" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Platform Settings</h2>
            <div className="sa__settings-grid">
              <div className="sa__settings-card">
                <h3 className="sa__subsection-title">General Settings</h3>
                <div className="sa__form-field"><label>Platform Name</label><input defaultValue="GlobalMart" className="sa__input" /></div>
                <div className="sa__form-field"><label>Support Email</label><input defaultValue="support@globalmart.com" className="sa__input" /></div>
                <div className="sa__form-field">
                  <label>Default Currency</label>
                  <select className="sa__input"><option>XAF (FCFA)</option><option>USD ($)</option><option>EUR (€)</option></select>
                </div>
                <button className="sa__btn sa__btn--primary">Save Changes</button>
              </div>
              <div className="sa__settings-card">
                <h3 className="sa__subsection-title">Admin Notifications</h3>
                {["New order placed", "User registered", "Low stock alert", "Payment received"].map((notif) => (
                  <label key={notif} className="sa__toggle-row">
                    <span>{notif}</span>
                    <input type="checkbox" defaultChecked className="sa__toggle" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default SuperAdminDashboard;
