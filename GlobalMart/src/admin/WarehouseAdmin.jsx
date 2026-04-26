import { useState, useEffect } from "react";
import { getInventory, adjustStock } from "../api";
import { showToast } from "../components/Toast";
import "../styles/AdminPages.css";

const stockStatus = (qty, threshold) => {
  const q = qty ?? 0;
  if (q === 0)                    return { label: "Out of Stock", bg: "#fce8e6", color: "#cc0c39" };
  if (q <= (threshold ?? 10))     return { label: "Low Stock",   bg: "#fff8e1", color: "#e47911" };
  return                                 { label: "In Stock",     bg: "#e6f4ea", color: "#007600" };
};

// Read whichever quantity field the inventory API returns
const getQty = (item) => item.quantity_on_hand ?? item.quantity ?? item.stock_quantity ?? 0;

function WarehouseAdmin() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [adjusting, setAdjusting] = useState(null); // inventory_id being adjusted
  const [adjustDelta, setAdjustDelta] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getInventory();
        if (Array.isArray(data)) {
          setInventory(data);
        } else {
          setError("Failed to load inventory.");
        }
      } catch {
        setError("Network error loading inventory.");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const totalProducts = inventory.length;
  const lowStock   = inventory.filter((i) => stockStatus(getQty(i), i.reorder_threshold).label === "Low Stock").length;
  const outOfStock = inventory.filter((i) => getQty(i) === 0).length;

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    return (
      String(item.product_id).includes(q) ||
      item.product_name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.warehouse_name?.toLowerCase().includes(q)
    );
  });

  const handleAdjust = async (inventoryId) => {
    const delta = parseInt(adjustDelta, 10);
    if (isNaN(delta)) { showToast("Enter a valid number.", "error"); return; }
    try {
      const updated = await adjustStock(inventoryId, { quantity_change: delta, reason: "Admin adjustment" });
      if (updated) {
        setInventory((prev) =>
          prev.map((item) =>
            item.inventory_id === inventoryId
              ? { ...item, quantity_on_hand: (item.quantity_on_hand ?? item.quantity ?? 0) + delta, quantity: (item.quantity ?? 0) + delta }
              : item
          )
        );
        showToast("Stock adjusted.", "success");
      } else {
        showToast("Adjustment failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setAdjusting(null);
      setAdjustDelta("");
    }
  };

  if (loading) return <div className="ap"><p style={{ padding: 24, color: "#888" }}>Loading inventory…</p></div>;
  if (error)   return <div className="ap"><p style={{ padding: 24, color: "#c0392b" }}>{error}</p></div>;

  return (
    <div className="ap">
      <div className="ap__header">
        <h2 className="ap__title">Warehouse Admin</h2>
      </div>

      {/* Summary Cards */}
      <div className="ap__cards">
        {[
          { label: "Total Products", value: totalProducts, color: "#1a73e8" },
          { label: "Low Stock",      value: lowStock,      color: "#e47911" },
          { label: "Out of Stock",   value: outOfStock,    color: "#cc0c39" },
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
          placeholder="Search by product ID, name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ap__search"
        />
      </div>

      {/* Inventory Table */}
      <div className="ap__table-wrapper">
        <table className="ap__table">
          <thead>
            <tr>
              {["#", "Product ID", "Product", "SKU", "Warehouse", "Qty", "Threshold", "Status", "Adjust Stock"].map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "#888" }}>No inventory found.</td></tr>
            ) : (
              filtered.map((item, index) => {
                const qty       = getQty(item);
                const threshold = item.reorder_threshold ?? 10;
                const sc        = stockStatus(qty, threshold);
                const id        = item.inventory_id;
                return (
                  <tr key={id ?? index}>
                    <td className="ap__td-muted">{index + 1}</td>
                    <td className="ap__td-bold">{item.product_id}</td>
                    <td>{item.product_name || "—"}</td>
                    <td className="ap__td-muted">{item.sku || "—"}</td>
                    <td className="ap__td-muted">{item.warehouse_name || item.warehouse_id || "—"}</td>
                    <td><strong>{qty}</strong></td>
                    <td className="ap__td-muted">{threshold}</td>
                    <td>
                      <span className="ap__badge" style={{ backgroundColor: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </td>
                    <td>
                      {adjusting === id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            type="number"
                            placeholder="±qty"
                            value={adjustDelta}
                            onChange={(e) => setAdjustDelta(e.target.value)}
                            className="ap__input"
                            style={{ width: 70 }}
                          />
                          <button className="ap__action-btn ap__action-btn--approve" onClick={() => handleAdjust(id)}>
                            Save
                          </button>
                          <button className="ap__action-btn" onClick={() => { setAdjusting(null); setAdjustDelta(""); }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          className="ap__action-btn ap__action-btn--edit"
                          onClick={() => { setAdjusting(id); setAdjustDelta(""); }}
                        >
                          Adjust
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

export default WarehouseAdmin;
