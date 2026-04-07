import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuperAdminDashboard.css";

// ── Sample Data ──
const platformData = {
  totalRevenue: 124580.75,
  todayRevenue: 3240.50,
  totalUsers: 1248,
  newUsersToday: 24,
  totalSellers: 86,
  pendingSellers: 7,
  totalOrders: 3842,
  pendingOrders: 142,
  totalProducts: 624,
};

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@gmail.com", role: "Buyer", joined: "2026-01-15", orders: 12, status: "Active" },
  { id: 2, name: "Bob Smith", email: "bob@gmail.com", role: "Buyer", joined: "2026-02-03", orders: 5, status: "Active" },
  { id: 3, name: "Clara Davis", email: "clara@gmail.com", role: "Buyer", joined: "2026-02-20", orders: 8, status: "Banned" },
  { id: 4, name: "David Lee", email: "david@gmail.com", role: "Buyer", joined: "2026-03-01", orders: 3, status: "Active" },
  { id: 5, name: "Eva Brown", email: "eva@gmail.com", role: "Buyer", joined: "2026-03-15", orders: 1, status: "Active" },
];

const sellers = [
  { id: 1, name: "John's Store", email: "john@gmail.com", products: 24, sales: 12450.75, joined: "2025-12-01", status: "Approved" },
  { id: 2, name: "TechZone", email: "techzone@gmail.com", products: 18, sales: 8320.00, joined: "2026-01-10", status: "Approved" },
  { id: 3, name: "FashionHub", email: "fashion@gmail.com", products: 35, sales: 15600.50, joined: "2026-01-20", status: "Approved" },
  { id: 4, name: "SportsPro", email: "sports@gmail.com", products: 0, sales: 0, joined: "2026-03-28", status: "Pending" },
  { id: 5, name: "GadgetWorld", email: "gadget@gmail.com", products: 0, sales: 0, joined: "2026-03-30", status: "Pending" },
  { id: 6, name: "HomeDecor", email: "home@gmail.com", products: 0, sales: 0, joined: "2026-04-01", status: "Pending" },
];

const allOrders = [
  { id: "ORD-001", customer: "Alice Johnson", seller: "John's Store", product: "Wireless Headphones", date: "2026-04-01", amount: 149.99, status: "Delivered" },
  { id: "ORD-002", customer: "Bob Smith", seller: "TechZone", product: "Smart Watch", date: "2026-04-01", amount: 299.99, status: "Pending" },
  { id: "ORD-003", customer: "Clara Davis", seller: "FashionHub", product: "Leather Bag", date: "2026-03-31", amount: 89.99, status: "Shipped" },
  { id: "ORD-004", customer: "David Lee", seller: "SportsPro", product: "Running Shoes", date: "2026-03-30", amount: 129.99, status: "Cancelled" },
  { id: "ORD-005", customer: "Eva Brown", seller: "John's Store", product: "Bluetooth Speaker", date: "2026-03-29", amount: 79.99, status: "Delivered" },
];

const allProducts = [
  { id: 1, name: "Wireless Headphones", seller: "John's Store", category: "Tech", price: 149.99, stock: 45, status: "Active" },
  { id: 2, name: "Smart Watch Series X", seller: "TechZone", category: "Tech", price: 299.99, stock: 3, status: "Low Stock" },
  { id: 3, name: "Premium Leather Bag", seller: "FashionHub", category: "Fashion", price: 89.99, stock: 0, status: "Out of Stock" },
  { id: 4, name: "Running Shoes", seller: "SportsPro", category: "Sports", price: 129.99, stock: 20, status: "Active" },
  { id: 5, name: "Bluetooth Speaker", seller: "John's Store", category: "Tech", price: 79.99, stock: 12, status: "Active" },
];

const monthlyRevenue = [
  { month: "Oct", revenue: 8200 },
  { month: "Nov", revenue: 12400 },
  { month: "Dec", revenue: 18600 },
  { month: "Jan", revenue: 14200 },
  { month: "Feb", revenue: 16800 },
  { month: "Mar", revenue: 19400 },
  { month: "Apr", revenue: 8200 },
];

// ── Status Badge ──
const StatusBadge = ({ status }) => {
  const colors = {
    Active: { bg: "#e6f4ea", color: "#007600" },
    Approved: { bg: "#e6f4ea", color: "#007600" },
    Delivered: { bg: "#e6f4ea", color: "#007600" },
    Shipped: { bg: "#e8f0fe", color: "#1a73e8" },
    Pending: { bg: "#fff8e1", color: "#e47911" },
    "Low Stock": { bg: "#fff8e1", color: "#e47911" },
    Banned: { bg: "#fce8e6", color: "#cc0c39" },
    Rejected: { bg: "#fce8e6", color: "#cc0c39" },
    Cancelled: { bg: "#fce8e6", color: "#cc0c39" },
    "Out of Stock": { bg: "#fce8e6", color: "#cc0c39" },
  };
  const style = colors[status] || { bg: "#f5f5f5", color: "#555" };
  return (
    <span className="sa__badge" style={{ backgroundColor: style.bg, color: style.color }}>
      {status}
    </span>
  );
};

// ── Bar Chart ──
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="sa__chart">
      {data.map((d, i) => (
        <div key={i} className="sa__chart-bar-wrapper">
          <div
            className="sa__chart-bar"
            style={{ height: `${(d.revenue / max) * 100}%` }}
            title={`$${d.revenue.toLocaleString()}`}
          />
          <span className="sa__chart-label">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ──
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [userSearch, setUserSearch] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [sellers_state, setSellers] = useState(sellers);
  const [users_state, setUsers] = useState(users);

  const navItems = [
    { id: "home", label: "Dashboard", icon: "" },
    { id: "users", label: "Users", icon: "" },
    { id: "sellers", label: "Sellers", icon: "" },
    { id: "orders", label: "All Orders", icon: "" },
    { id: "products", label: "All Products", icon: "" },
    { id: "analytics", label: "Analytics", icon: "" },
    { id: "settings", label: "Settings", icon: "" },
  ];

  const handleSellerStatus = (id, status) => {
    setSellers(sellers_state.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleUserStatus = (id, status) => {
    setUsers(users_state.map(u => u.id === id ? { ...u, status } : u));
  };

  const filteredUsers = users_state.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSellers = sellers_state.filter(s =>
    s.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  const filteredOrders = allOrders.filter(o =>
    o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.seller.toLowerCase().includes(productSearch.toLowerCase())
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
              <span className="sa__nav-icon">{item.icon}</span>
              <span>{item.label}</span>
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
            <h2 className="sa__section-title"></h2>

            {/* Summary Cards */}
            <div className="sa__cards">
              {[
                { label: "Total Revenue", value: `$${platformData.totalRevenue.toLocaleString()}`, icon: "", color: "#007600" },
                { label: "Today's Revenue", value: `$${platformData.todayRevenue.toLocaleString()}`, icon: "", color: "#1a73e8" },
                { label: "Total Users", value: platformData.totalUsers.toLocaleString(), icon: "", color: "#6b21a8" },
                { label: "New Users Today", value: platformData.newUsersToday, icon: "", color: "#0d9488" },
                { label: "Total Sellers", value: platformData.totalSellers, icon: "", color: "#e47911" },
                { label: "Pending Sellers", value: platformData.pendingSellers, icon: "", color: "#cc0c39" },
                { label: "Total Orders", value: platformData.totalOrders.toLocaleString(), icon: "", color: "#1a73e8" },
                { label: "Total Products", value: platformData.totalProducts, icon: "", color: "#007600" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <span className="sa__card-icon" style={{ color: card.color }}>{card.icon}</span>
                  <div>
                    <p className="sa__card-label">{card.label}</p>
                    <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="sa__chart-section">
              <h3 className="sa__subsection-title">Platform Revenue (Last 7 Months)</h3>
              <BarChart data={monthlyRevenue} />
            </div>

            {/* Recent Orders */}
            <div className="sa__table-section">
              <h3 className="sa__subsection-title">Recent Orders</h3>
              <table className="sa__table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Seller</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.slice(0, 4).map((order) => (
                    <tr key={order.id}>
                      <td className="sa__td-id">{order.id}</td>
                      <td>{order.customer}</td>
                      <td className="sa__td-muted">{order.seller}</td>
                      <td>${order.amount.toFixed(2)}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pending Sellers */}
            <div className="sa__table-section">
              <h3 className="sa__subsection-title">Pending Seller Applications</h3>
              <table className="sa__table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Email</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers_state.filter(s => s.status === "Pending").map((seller) => (
                    <tr key={seller.id}>
                      <td className="sa__td-bold">{seller.name}</td>
                      <td className="sa__td-muted">{seller.email}</td>
                      <td className="sa__td-muted">{seller.joined}</td>
                      <td>
                        <div className="sa__actions">
                          <button
                            className="sa__action-btn sa__action-btn--approve"
                            onClick={() => handleSellerStatus(seller.id, "Approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="sa__action-btn sa__action-btn--reject"
                            onClick={() => handleSellerStatus(seller.id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeSection === "users" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Users Management</h2>

            {/* Summary */}
            <div className="sa__cards">
              {[
                { label: "Total Users", value: users_state.length, icon: "", color: "#1a73e8" },
                { label: "Active Users", value: users_state.filter(u => u.status === "Active").length, icon: "", color: "#007600" },
                { label: "Banned Users", value: users_state.filter(u => u.status === "Banned").length, icon: "", color: "#cc0c39" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <span className="sa__card-icon" style={{ color: card.color }}>{card.icon}</span>
                  <div>
                    <p className="sa__card-label">{card.label}</p>
                    <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="sa__search"
            />

            <table className="sa__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={user.id}>
                    <td className="sa__td-muted">{i + 1}</td>
                    <td className="sa__td-bold">{user.name}</td>
                    <td className="sa__td-muted">{user.email}</td>
                    <td>{user.role}</td>
                    <td className="sa__td-muted">{user.joined}</td>
                    <td>{user.orders}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>
                      <button
                        className={`sa__action-btn ${user.status === "Active" ? "sa__action-btn--reject" : "sa__action-btn--approve"}`}
                        onClick={() => handleUserStatus(user.id, user.status === "Active" ? "Banned" : "Active")}
                      >
                        {user.status === "Active" ? "Ban" : "Unban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SELLERS ── */}
        {activeSection === "sellers" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Sellers Management</h2>

            {/* Summary */}
            <div className="sa__cards">
              {[
                { label: "Total Sellers", value: sellers_state.length, icon: "", color: "#1a73e8" },
                { label: "Approved", value: sellers_state.filter(s => s.status === "Approved").length, icon: "", color: "#007600" },
                { label: "Pending", value: sellers_state.filter(s => s.status === "Pending").length, icon: "", color: "#e47911" },
                { label: "Rejected", value: sellers_state.filter(s => s.status === "Rejected").length, icon: "", color: "#cc0c39" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <span className="sa__card-icon" style={{ color: card.color }}>{card.icon}</span>
                  <div>
                    <p className="sa__card-label">{card.label}</p>
                    <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search sellers..."
              value={sellerSearch}
              onChange={(e) => setSellerSearch(e.target.value)}
              className="sa__search"
            />

            <table className="sa__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Store Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Total Sales</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((seller, i) => (
                  <tr key={seller.id}>
                    <td className="sa__td-muted">{i + 1}</td>
                    <td className="sa__td-bold">{seller.name}</td>
                    <td className="sa__td-muted">{seller.email}</td>
                    <td>{seller.products}</td>
                    <td>${seller.sales.toLocaleString()}</td>
                    <td className="sa__td-muted">{seller.joined}</td>
                    <td><StatusBadge status={seller.status} /></td>
                    <td>
                      <div className="sa__actions">
                        {seller.status === "Pending" && (
                          <>
                            <button
                              className="sa__action-btn sa__action-btn--approve"
                              onClick={() => handleSellerStatus(seller.id, "Approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="sa__action-btn sa__action-btn--reject"
                              onClick={() => handleSellerStatus(seller.id, "Rejected")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {seller.status === "Approved" && (
                          <button
                            className="sa__action-btn sa__action-btn--reject"
                            onClick={() => handleSellerStatus(seller.id, "Rejected")}
                          >
                            Suspend
                          </button>
                        )}
                        {seller.status === "Rejected" && (
                          <button
                            className="sa__action-btn sa__action-btn--approve"
                            onClick={() => handleSellerStatus(seller.id, "Approved")}
                          >
                            Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ALL ORDERS ── */}
        {activeSection === "orders" && (
          <div className="sa__section">
            <h2 className="sa__section-title">All Orders</h2>

            <div className="sa__cards">
              {[
                { label: "Total Orders", value: allOrders.length, icon: "", color: "#1a73e8" },
                { label: "Pending", value: allOrders.filter(o => o.status === "Pending").length, icon: "", color: "#e47911" },
                { label: "Delivered", value: allOrders.filter(o => o.status === "Delivered").length, icon: "", color: "#007600" },
                { label: "Cancelled", value: allOrders.filter(o => o.status === "Cancelled").length, icon: "", color: "#cc0c39" },
              ].map((card) => (
                <div key={card.label} className="sa__card">
                  <span className="sa__card-icon" style={{ color: card.color }}>{card.icon}</span>
                  <div>
                    <p className="sa__card-label">{card.label}</p>
                    <p className="sa__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search orders..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="sa__search"
            />

            <table className="sa__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Seller</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="sa__td-id">{order.id}</td>
                    <td className="sa__td-bold">{order.customer}</td>
                    <td className="sa__td-muted">{order.seller}</td>
                    <td className="sa__td-muted">{order.product}</td>
                    <td className="sa__td-muted">{order.date}</td>
                    <td>${order.amount.toFixed(2)}</td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ALL PRODUCTS ── */}
        {activeSection === "products" && (
          <div className="sa__section">
            <h2 className="sa__section-title">All Products</h2>

            <input
              type="text"
              placeholder="Search products or sellers..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="sa__search"
            />

            <table className="sa__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, i) => (
                  <tr key={product.id}>
                    <td className="sa__td-muted">{i + 1}</td>
                    <td className="sa__td-bold">{product.name}</td>
                    <td className="sa__td-muted">{product.seller}</td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td><StatusBadge status={product.status} /></td>
                    <td>
                      <button className="sa__action-btn sa__action-btn--reject">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeSection === "analytics" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Platform Analytics</h2>

            <div className="sa__analytics-grid">
              {/* Revenue Report */}
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title"> Revenue Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Today", value: `$${platformData.todayRevenue.toLocaleString()}` },
                    { label: "This Week", value: "$18,420.00" },
                    { label: "This Month", value: "$48,200.00" },
                    { label: "This Year", value: `$${platformData.totalRevenue.toLocaleString()}` },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Fees */}
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title"> Platform Fees Collected</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Today", value: "$162.03" },
                    { label: "This Week", value: "$921.00" },
                    { label: "This Month", value: "$2,410.00" },
                    { label: "This Year", value: "$6,229.04" },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users Report */}
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title"> Users Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Total Users", value: platformData.totalUsers },
                    { label: "New Today", value: platformData.newUsersToday },
                    { label: "Active Sellers", value: sellers_state.filter(s => s.status === "Approved").length },
                    { label: "Pending Sellers", value: sellers_state.filter(s => s.status === "Pending").length },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Report */}
              <div className="sa__analytics-card">
                <h3 className="sa__subsection-title"> Orders Report</h3>
                <div className="sa__report-rows">
                  {[
                    { label: "Total Orders", value: platformData.totalOrders },
                    { label: "Pending", value: platformData.pendingOrders },
                    { label: "Delivered", value: allOrders.filter(o => o.status === "Delivered").length },
                    { label: "Cancelled", value: allOrders.filter(o => o.status === "Cancelled").length },
                  ].map((row) => (
                    <div key={row.label} className="sa__report-row">
                      <span>{row.label}</span>
                      <span className="sa__report-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="sa__chart-section">
              <h3 className="sa__subsection-title">Monthly Revenue Trend</h3>
              <BarChart data={monthlyRevenue} />
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeSection === "settings" && (
          <div className="sa__section">
            <h2 className="sa__section-title">Platform Settings</h2>

            <div className="sa__settings-grid">
              {/* General Settings */}
              <div className="sa__settings-card">
                <h3 className="sa__subsection-title">General Settings</h3>
                <div className="sa__form-field">
                  <label>Platform Name</label>
                  <input defaultValue="GlobalMart" className="sa__input" />
                </div>
                <div className="sa__form-field">
                  <label>Support Email</label>
                  <input defaultValue="support@globalmart.com" className="sa__input" />
                </div>
                <div className="sa__form-field">
                  <label>Default Currency</label>
                  <select className="sa__input">
                    <option>USD ($)</option>
                    <option>XAF (FCFA)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <button className="sa__btn sa__btn--primary">Save Changes</button>
              </div>

              {/* Fee Settings */}
              <div className="sa__settings-card">
                <h3 className="sa__subsection-title">Platform Fees</h3>
                <div className="sa__form-field">
                  <label>Seller Commission (%)</label>
                  <input defaultValue="5" type="number" className="sa__input" />
                </div>
                <div className="sa__form-field">
                  <label>Payment Processing Fee (%)</label>
                  <input defaultValue="2.5" type="number" className="sa__input" />
                </div>
                <div className="sa__form-field">
                  <label>Minimum Withdrawal ($)</label>
                  <input defaultValue="50" type="number" className="sa__input" />
                </div>
                <button className="sa__btn sa__btn--primary">Save Changes</button>
              </div>

              {/* Seller Settings */}
              <div className="sa__settings-card">
                <h3 className="sa__subsection-title">Seller Settings</h3>
                <div className="sa__form-field">
                  <label>Auto-approve Sellers</label>
                  <select className="sa__input">
                    <option>No - Manual Approval</option>
                    <option>Yes - Auto Approve</option>
                  </select>
                </div>
                <div className="sa__form-field">
                  <label>Max Products Per Seller</label>
                  <input defaultValue="100" type="number" className="sa__input" />
                </div>
                <div className="sa__form-field">
                  <label>Seller Payout Schedule</label>
                  <select className="sa__input">
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <button className="sa__btn sa__btn--primary">Save Changes</button>
              </div>

              {/* Notifications */}
              <div className="sa__settings-card">
                <h3 className="sa__subsection-title">Admin Notifications</h3>
                {[
                  "New seller application",
                  "Large order placed",
                  "User account banned",
                  "Payment received",
                  "Low platform revenue alert",
                  "New user registered",
                ].map((notif) => (
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