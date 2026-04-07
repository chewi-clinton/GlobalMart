import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SellerDashboard.css";

// ── Sample Data ──
const sellerData = {
  name: "John's Store",
  email: "john@globalmart.com",
  accountHealth: 92,
  totalSales: 12450.75,
  todaySales: 320.50,
  totalOrders: 148,
  pendingOrders: 12,
  totalProducts: 24,
  lowStock: 3,
};

const products = [
  { id: 1, name: "Wireless Bluetooth Headphones Pro", category: "Tech", price: 149.99, stock: 45, status: "Active", sales: 34 },
  { id: 2, name: "Premium Leather Crossbody Bag", category: "Fashion", price: 89.99, stock: 12, status: "Active", sales: 21 },
  { id: 3, name: "Smart Watch Series X", category: "Tech", price: 299.99, stock: 3, status: "Low Stock", sales: 18 },
  { id: 4, name: "Minimalist Running Shoes", category: "Sports", price: 129.99, stock: 0, status: "Out of Stock", sales: 45 },
  { id: 5, name: "Designer Sunglasses Collection", category: "Fashion", price: 175.00, stock: 20, status: "Active", sales: 12 },
];

const orders = [
  { id: "ORD-001", customer: "Alice Johnson", product: "Wireless Bluetooth Headphones Pro", date: "2026-04-01", amount: 149.99, status: "Pending" },
  { id: "ORD-002", customer: "Bob Smith", product: "Smart Watch Series X", date: "2026-03-31", amount: 299.99, status: "Shipped" },
  { id: "ORD-003", customer: "Clara Davis", product: "Premium Leather Crossbody Bag", date: "2026-03-30", amount: 89.99, status: "Delivered" },
  { id: "ORD-004", customer: "David Lee", product: "Minimalist Running Shoes", date: "2026-03-29", amount: 129.99, status: "Cancelled" },
  { id: "ORD-005", customer: "Eva Brown", product: "Designer Sunglasses Collection", date: "2026-03-28", amount: 175.00, status: "Delivered" },
];

const reviews = [
  { id: 1, customer: "Alex M.", product: "Wireless Bluetooth Headphones Pro", rating: 5, comment: "Amazing sound quality!", date: "2026-04-01", verified: true },
  { id: 2, customer: "Sarah K.", product: "Smart Watch Series X", rating: 4, comment: "Great watch, battery could be better.", date: "2026-03-30", verified: true },
  { id: 3, customer: "Mike R.", product: "Premium Leather Crossbody Bag", rating: 5, comment: "Beautiful bag, great quality!", date: "2026-03-28", verified: true },
  { id: 4, customer: "Emma L.", product: "Designer Sunglasses Collection", rating: 3, comment: "Good but delivery was slow.", date: "2026-03-25", verified: false },
];

const monthlySales = [
  { month: "Oct", sales: 3200 },
  { month: "Nov", sales: 4100 },
  { month: "Dec", sales: 6800 },
  { month: "Jan", sales: 3900 },
  { month: "Feb", sales: 4500 },
  { month: "Mar", sales: 5200 },
  { month: "Apr", sales: 2100 },
];

// ── Star Rating ──
const StarRating = ({ rating }) => (
  <span className="sd__stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? "sd__star--full" : "sd__star--empty"}>★</span>
    ))}
  </span>
);

// ── Status Badge ──
const StatusBadge = ({ status }) => {
  const colors = {
    Active: { bg: "#e6f4ea", color: "#007600" },
    "Low Stock": { bg: "#fff8e1", color: "#f0c14b" },
    "Out of Stock": { bg: "#fce8e6", color: "#cc0c39" },
    Pending: { bg: "#fff8e1", color: "#e47911" },
    Shipped: { bg: "#e8f0fe", color: "#1a73e8" },
    Delivered: { bg: "#e6f4ea", color: "#007600" },
    Cancelled: { bg: "#fce8e6", color: "#cc0c39" },
  };
  const style = colors[status] || { bg: "#f5f5f5", color: "#555" };
  return (
    <span className="sd__badge" style={{ backgroundColor: style.bg, color: style.color }}>
      {status}
    </span>
  );
};

// ── Mini Bar Chart ──
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.sales));
  return (
    <div className="sd__chart">
      {data.map((d, i) => (
        <div key={i} className="sd__chart-bar-wrapper">
          <div
            className="sd__chart-bar"
            style={{ height: `${(d.sales / max) * 100}%` }}
            title={`$${d.sales}`}
          />
          <span className="sd__chart-label">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ──
const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", price: "", stock: "",
  });

  const navItems = [
    { id: "home", label: "Home", icon: "" },
    { id: "inventory", label: "Inventory", icon: "" },
    { id: "orders", label: "Orders", icon: "" },
    { id: "reports", label: "Reports", icon: "" },
    { id: "performance", label: "Performance", icon: "" },
    { id: "settings", label: "Settings", icon: "" },
  ];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="sd">

      <div className="sd__layout">

        {/* Sidebar */}
        <aside className="sd__sidebar">
          <div className="sd__sidebar-profile">
            <div className="sd__sidebar-avatar">
              {sellerData.name.charAt(0)}
            </div>
            <div>
              <p className="sd__sidebar-name">{sellerData.name}</p>
              <p className="sd__sidebar-email">{sellerData.email}</p>
            </div>
          </div>

          <nav className="sd__sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`sd__nav-item ${activeSection === item.id ? "sd__nav-item--active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="sd__nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sd__sidebar-health">
            <p className="sd__health-label">Account Health</p>
            <div className="sd__health-bar-wrapper">
              <div
                className="sd__health-bar"
                style={{ width: `${sellerData.accountHealth}%` }}
              />
            </div>
            <p className="sd__health-score">{sellerData.accountHealth}/100</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="sd__content">

          {/* ── HOME ── */}
          {activeSection === "home" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Welcome back, {sellerData.name}! 👋</h2>

              {/* Summary Cards */}
              <div className="sd__cards">
                {[
                  { label: "Today's Sales", value: `$${sellerData.todaySales.toFixed(2)}`, icon: "💰", color: "#f0c14b" },
                  { label: "Total Revenue", value: `$${sellerData.totalSales.toFixed(2)}`, icon: "📈", color: "#007600" },
                  { label: "Total Orders", value: sellerData.totalOrders, icon: "🛒", color: "#1a73e8" },
                  { label: "Pending Orders", value: sellerData.pendingOrders, icon: "⏳", color: "#e47911" },
                  { label: "Total Products", value: sellerData.totalProducts, icon: "📦", color: "#6b21a8" },
                  { label: "Low Stock", value: sellerData.lowStock, icon: "⚠️", color: "#cc0c39" },
                ].map((card) => (
                  <div key={card.label} className="sd__card">
                    <div className="sd__card-icon" style={{ color: card.color }}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="sd__card-label">{card.label}</p>
                      <p className="sd__card-value" style={{ color: card.color }}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales Chart */}
              <div className="sd__chart-section">
                <h3 className="sd__subsection-title">Sales Overview (Last 7 Months)</h3>
                <BarChart data={monthlySales} />
              </div>

              {/* Recent Orders */}
              <div className="sd__recent">
                <h3 className="sd__subsection-title">Recent Orders</h3>
                <table className="sd__table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 3).map((order) => (
                      <tr key={order.id}>
                        <td className="sd__order-id">{order.id}</td>
                        <td>{order.customer}</td>
                        <td>${order.amount.toFixed(2)}</td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {activeSection === "inventory" && (
            <div className="sd__section">
              <div className="sd__section-header">
                <h2 className="sd__section-title">Inventory</h2>
                <button
                  className="sd__btn sd__btn--primary"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                >
                  + Add Product
                </button>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <div className="sd__add-form">
                  <h3 className="sd__subsection-title">Add New Product</h3>
                  <div className="sd__form-grid">
                    {[
                      { label: "Product Name", key: "name", type: "text" },
                      { label: "Category", key: "category", type: "text" },
                      { label: "Price ($)", key: "price", type: "number" },
                      { label: "Stock Quantity", key: "stock", type: "number" },
                    ].map((field) => (
                      <div key={field.key} className="sd__form-field">
                        <label>{field.label}</label>
                        <input
                          type={field.type}
                          value={newProduct[field.key]}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, [field.key]: e.target.value })
                          }
                          className="sd__input"
                          placeholder={field.label}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="sd__form-actions">
                    <button className="sd__btn sd__btn--primary">Save Product</button>
                    <button
                      className="sd__btn sd__btn--secondary"
                      onClick={() => setShowAddProduct(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Search */}
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="sd__search"
              />

              {/* Products Table */}
              <table className="sd__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sales</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td className="sd__product-name">{p.name}</td>
                      <td>{p.category}</td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.stock}</td>
                      <td>{p.sales}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div className="sd__actions">
                          <button className="sd__action-btn sd__action-btn--edit">Edit</button>
                          <button className="sd__action-btn sd__action-btn--delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeSection === "orders" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Orders</h2>

              {/* Summary */}
              <div className="sd__cards">
                {[
                  { label: "Total Orders", value: orders.length, color: "#1a73e8" },
                  { label: "Pending", value: orders.filter(o => o.status === "Pending").length, color: "#e47911" },
                  { label: "Shipped", value: orders.filter(o => o.status === "Shipped").length, color: "#1a73e8" },
                  { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, color: "#007600" },
                  { label: "Cancelled", value: orders.filter(o => o.status === "Cancelled").length, color: "#cc0c39" },
                ].map((card) => (
                  <div key={card.label} className="sd__card sd__card--small">
                    <p className="sd__card-label">{card.label}</p>
                    <p className="sd__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search by customer or order ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="sd__search"
              />

              {/* Orders Table */}
              <table className="sd__table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="sd__order-id">{order.id}</td>
                      <td>{order.customer}</td>
                      <td className="sd__product-name">{order.product}</td>
                      <td>{order.date}</td>
                      <td>${order.amount.toFixed(2)}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeSection === "reports" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Reports</h2>

              <div className="sd__reports-grid">
                {/* Sales Report */}
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">📈 Sales Report</h3>
                  <div className="sd__report-rows">
                    {[
                      { label: "Today", value: `$${sellerData.todaySales.toFixed(2)}` },
                      { label: "This Week", value: "$1,240.50" },
                      { label: "This Month", value: "$5,200.00" },
                      { label: "This Year", value: "$12,450.75" },
                    ].map((row) => (
                      <div key={row.label} className="sd__report-row">
                        <span>{row.label}</span>
                        <span className="sd__report-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders Report */}
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">🛒 Orders Report</h3>
                  <div className="sd__report-rows">
                    {[
                      { label: "Total Orders", value: sellerData.totalOrders },
                      { label: "Pending", value: sellerData.pendingOrders },
                      { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length },
                      { label: "Cancelled", value: orders.filter(o => o.status === "Cancelled").length },
                    ].map((row) => (
                      <div key={row.label} className="sd__report-row">
                        <span>{row.label}</span>
                        <span className="sd__report-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Report */}
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">💰 Financial Report</h3>
                  <div className="sd__report-rows">
                    {[
                      { label: "Gross Revenue", value: "$12,450.75" },
                      { label: "Platform Fees (5%)", value: "-$622.54" },
                      { label: "Shipping Costs", value: "-$320.00" },
                      { label: "Net Earnings", value: "$11,508.21" },
                    ].map((row) => (
                      <div key={row.label} className="sd__report-row">
                        <span>{row.label}</span>
                        <span className={`sd__report-value ${row.value.startsWith("-") ? "sd__report-value--negative" : ""}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">🏆 Top Products</h3>
                  <div className="sd__report-rows">
                    {products
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 4)
                      .map((p) => (
                        <div key={p.id} className="sd__report-row">
                          <span>{p.name.split(" ").slice(0, 3).join(" ")}...</span>
                          <span className="sd__report-value">{p.sales} sold</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="sd__chart-section">
                <h3 className="sd__subsection-title">Monthly Sales Trend</h3>
                <BarChart data={monthlySales} />
              </div>
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {activeSection === "performance" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Performance</h2>

              {/* Account Health */}
              <div className="sd__health-section">
                <h3 className="sd__subsection-title">Account Health</h3>
                <div className="sd__health-cards">
                  {[
                    { label: "Order Defect Rate", value: "0.5%", status: "Good", target: "< 1%" },
                    { label: "Late Shipment Rate", value: "1.2%", status: "Good", target: "< 4%" },
                    { label: "Cancellation Rate", value: "0.8%", status: "Good", target: "< 2.5%" },
                    { label: "Valid Tracking Rate", value: "98%", status: "Good", target: "> 95%" },
                  ].map((metric) => (
                    <div key={metric.label} className="sd__health-card">
                      <p className="sd__health-metric-label">{metric.label}</p>
                      <p className="sd__health-metric-value">{metric.value}</p>
                      <p className="sd__health-metric-target">Target: {metric.target}</p>
                      <span className="sd__badge" style={{ backgroundColor: "#e6f4ea", color: "#007600" }}>
                        {metric.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews */}
              <div className="sd__reviews-section">
                <h3 className="sd__subsection-title">Customer Reviews</h3>
                <div className="sd__reviews-summary">
                  <div className="sd__reviews-avg">
                    <span className="sd__avg-number">4.3</span>
                    <StarRating rating={4} />
                    <span className="sd__avg-total">{reviews.length} reviews</span>
                  </div>
                </div>
                <div className="sd__reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="sd__review">
                      <div className="sd__review-header">
                        <strong>{review.customer}</strong>
                        <StarRating rating={review.rating} />
                        {review.verified && (
                          <span className="sd__verified">✓ Verified</span>
                        )}
                        <span className="sd__review-date">{review.date}</span>
                      </div>
                      <p className="sd__review-product">📦 {review.product}</p>
                      <p className="sd__review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === "settings" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Settings</h2>

              <div className="sd__settings-grid">
                {/* Account Info */}
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Account Info</h3>
                  <div className="sd__form-field">
                    <label>Store Name</label>
                    <input defaultValue={sellerData.name} className="sd__input" />
                  </div>
                  <div className="sd__form-field">
                    <label>Email</label>
                    <input defaultValue={sellerData.email} className="sd__input" />
                  </div>
                  <div className="sd__form-field">
                    <label>Phone Number</label>
                    <input defaultValue="+237 6XX XXX XXX" className="sd__input" />
                  </div>
                  <button className="sd__btn sd__btn--primary">Save Changes</button>
                </div>

                {/* Payment Settings */}
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Payment Settings</h3>
                  <div className="sd__form-field">
                    <label>Payout Method</label>
                    <select className="sd__input">
                      <option>MTN Mobile Money</option>
                      <option>Orange Money</option>
                    </select>
                  </div>
                  <div className="sd__form-field">
                    <label>Mobile Money Number</label>
                    <input defaultValue="6XX XXX XXX" className="sd__input" />
                  </div>
                  <button className="sd__btn sd__btn--primary">Save Changes</button>
                </div>

                {/* Shipping Settings */}
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Shipping Settings</h3>
                  <div className="sd__form-field">
                    <label>Default Shipping Rate ($)</label>
                    <input defaultValue="9.99" className="sd__input" type="number" />
                  </div>
                  <div className="sd__form-field">
                    <label>Free Shipping Threshold ($)</label>
                    <input defaultValue="50.00" className="sd__input" type="number" />
                  </div>
                  <div className="sd__form-field">
                    <label>Processing Time (days)</label>
                    <input defaultValue="2" className="sd__input" type="number" />
                  </div>
                  <button className="sd__btn sd__btn--primary">Save Changes</button>
                </div>

                {/* Notifications */}
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Notifications</h3>
                  {[
                    "New order received",
                    "Order shipped",
                    "Low stock alert",
                    "New customer review",
                    "Payment received",
                  ].map((notif) => (
                    <label key={notif} className="sd__toggle-row">
                      <span>{notif}</span>
                      <input type="checkbox" defaultChecked className="sd__toggle" />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;