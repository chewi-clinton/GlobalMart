import { useState, useEffect } from "react";
import { getAdminOrders, cancelOrder } from "../api";
import { showToast } from "../components/Toast";
import "../styles/AdminPages.css";

const statusConfig = (status) => {
  const s = status?.toLowerCase();
  if (s === "delivered") return { bg: "#e6f4ea", color: "#007600" };
  if (s === "shipped")   return { bg: "#e8f0fe", color: "#1a73e8" };
  if (s === "confirmed" || s === "processing") return { bg: "#e8f0fe", color: "#1a73e8" };
  if (s === "pending")   return { bg: "#fff8e1", color: "#e47911" };
  return { bg: "#fce8e6", color: "#cc0c39" };
};

function CustomerOrderAdmin() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAdminOrders();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setError("Failed to load orders.");
        }
      } catch {
        setError("Network error loading orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const pending   = orders.filter((o) => o.status?.toLowerCase() === "pending").length;
  const delivered = orders.filter((o) => o.status?.toLowerCase() === "delivered").length;
  const cancelled = orders.filter((o) => o.status?.toLowerCase() === "cancelled").length;

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.order_id).includes(q) ||
      String(o.customer_id).includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      o.currency_code?.toLowerCase().includes(q)
    );
  });

  const handleCancel = async (orderId) => {
    if (!window.confirm(`Cancel order #${orderId}?`)) return;
    try {
      await cancelOrder(orderId, { reason: "Cancelled by admin" });
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, status: "cancelled" } : o))
      );
      showToast(`Order #${orderId} cancelled.`, "info");
    } catch {
      showToast("Failed to cancel order.", "error");
    }
  };

  if (loading) return <div className="ap"><p style={{ padding: 24, color: "#888" }}>Loading orders…</p></div>;
  if (error)   return <div className="ap"><p style={{ padding: 24, color: "#c0392b" }}>{error}</p></div>;

  return (
    <div className="ap">
      <div className="ap__header">
        <h2 className="ap__title">Customer &amp; Order Admin</h2>
      </div>

      {/* Summary Cards */}
      <div className="ap__cards">
        {[
          { label: "Total Orders", value: totalOrders, color: "#1a73e8" },
          { label: "Pending",      value: pending,     color: "#e47911" },
          { label: "Delivered",    value: delivered,   color: "#007600" },
          { label: "Cancelled",    value: cancelled,   color: "#cc0c39" },
        ].map((card) => (
          <div key={card.label} className="ap__card">
            <div>
              <p className="ap__card-label">{card.label}</p>
              <p className="ap__card-value" style={{ color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="ap__toolbar">
        <input
          type="text"
          placeholder="Search by order ID, customer ID or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ap__search"
        />
      </div>

      {/* Orders Table */}
      <div className="ap__table-wrapper">
        <table className="ap__table">
          <thead>
            <tr>
              {["Order ID", "Customer ID", "Date", "Total", "Currency", "Payment", "Status", "Actions"].map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#888" }}>No orders found.</td></tr>
            ) : (
              filtered.map((order) => {
                const sc = statusConfig(order.status);
                const canCancel = ["pending", "confirmed"].includes(order.status?.toLowerCase());
                return (
                  <tr key={order.order_id}>
                    <td className="ap__td-order-id">#{order.order_id}</td>
                    <td className="ap__td-bold">{order.customer_id}</td>
                    <td className="ap__td-muted">
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : "—"}
                    </td>
                    <td>{parseFloat(order.total_amount || 0).toLocaleString()}</td>
                    <td className="ap__td-muted">{order.currency_code}</td>
                    <td>
                      <span className="ap__badge" style={statusConfig(order.payment_status)}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className="ap__badge" style={{ backgroundColor: sc.bg, color: sc.color }}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {canCancel && (
                        <button
                          className="ap__action-btn ap__action-btn--delete"
                          onClick={() => handleCancel(order.order_id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerOrderAdmin;
