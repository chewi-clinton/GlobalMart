import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { useCurrency } from "../context/CurrencyContext";
import {
  getProfile,
  updateProfile,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  uploadProductImage,
  getProductImages,
  deleteProductImage,
  setImagePrimary,
  getProductVariants,
  createProductVariant,
  getInventory,
  createInventoryEntry,
  adjustStock,
  updateThreshold,
  getOrders,
  cancelOrder,
} from "../api";
import "../styles/SellerDashboard.css";

// ── Helpers ──
const getTokenPayload = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const flattenCategories = (cats, prefix = "") =>
  cats.flatMap((cat) => [
    { category_id: cat.category_id, name: prefix + cat.name },
    ...(cat.children?.length ? flattenCategories(cat.children, prefix + cat.name + " > ") : []),
  ]);

const BLANK_FORM = {
  title: "", slug: "", description: "",
  base_price: "", currency_code: "USD",
  specs: [], status: "active", category: "",
  stock_units: "", reorder_threshold: "",
};

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
    active: { bg: "#e6f4ea", color: "#007600" },
    inactive: { bg: "#fce8e6", color: "#cc0c39" },
    pending: { bg: "#fff8e1", color: "#e47911" },
    confirmed: { bg: "#e8f0fe", color: "#1a73e8" },
    processing: { bg: "#e8f0fe", color: "#1a73e8" },
    shipped: { bg: "#e8f0fe", color: "#1a73e8" },
    delivered: { bg: "#e6f4ea", color: "#007600" },
    cancelled: { bg: "#fce8e6", color: "#cc0c39" },
    refunded: { bg: "#f5f5f5", color: "#555" },
    unpaid: { bg: "#fff8e1", color: "#e47911" },
    paid: { bg: "#e6f4ea", color: "#007600" },
    failed: { bg: "#fce8e6", color: "#cc0c39" },
  };
  const style = colors[status?.toLowerCase()] || { bg: "#f5f5f5", color: "#555" };
  return (
    <span className="sd__badge" style={{ backgroundColor: style.bg, color: style.color }}>
      {status}
    </span>
  );
};

// ── Mini Bar Chart ──
const BarChart = ({ data }) => {
  if (!data.length) return <p style={{ color: "#888", padding: "20px" }}>No sales data yet.</p>;
  const max = Math.max(...data.map((d) => d.sales));
  return (
    <div className="sd__chart">
      {data.map((d, i) => (
        <div key={i} className="sd__chart-bar-wrapper">
          <div className="sd__chart-bar" style={{ height: `${max > 0 ? (d.sales / max) * 100 : 0}%` }} title={d.sales.toLocaleString()} />
          <span className="sd__chart-label">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// Derive monthly sales from real order data
const groupOrdersByMonth = (orders) => {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const map = {};
  orders.forEach((o) => {
    if (!o.order_date) return;
    const key = MONTHS[new Date(o.order_date).getMonth()];
    map[key] = (map[key] || 0) + parseFloat(o.total_amount || 0);
  });
  return MONTHS
    .filter((m) => map[m] !== undefined)
    .slice(-7)
    .map((m) => ({ month: m, sales: map[m] }));
};

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
const SellerDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [activeSection, setActiveSection] = useState("home");

  const [seller, setSeller] = useState({ name: "", email: "" });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [variants, setVariants] = useState([]);
  const [existingVariants, setExistingVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  const [inventoryEntryId, setInventoryEntryId] = useState(null);
  const [inventoryOriginalStock, setInventoryOriginalStock] = useState(0);

  const [inventory, setInventory] = useState([]);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");

  const [settingsForm, setSettingsForm] = useState({ username: "", phone: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const navItems = [
    { id: "home",      label: "Home",      icon: "" },
    { id: "products",  label: "Products",  icon: "" },
    { id: "inventory", label: "Inventory", icon: "" },
    { id: "orders",    label: "Orders",    icon: "" },
    { id: "reports",   label: "Reports",   icon: "" },
    { id: "settings",  label: "Settings",  icon: "" },
  ];

  useEffect(() => {
    const payload = getTokenPayload();
    if (!payload) { navigate("/login"); return; }
    if (payload.role !== "seller" && payload.role !== "admin") { navigate("/"); return; }
    getProfile().then((data) => {
      if (data.username || data.email) {
        setSeller({ name: data.username || "Seller", email: data.email || "" });
        setSettingsForm({ username: data.username || "", phone: data.phone || "" });
      }
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const payload = getTokenPayload();
      const data = await getProducts(payload?.user_id ? { seller_id: payload.user_id } : {});
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProductsError("Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      if (Array.isArray(data)) setCategories(flattenCategories(data));
    } catch {}
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const data = await getInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await getOrders();
      // Handle both plain array and paginated { results: [...] } responses
      const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setOrders(list);
      if (!Array.isArray(data) && !Array.isArray(data?.results)) {
        console.warn("Unexpected orders response shape:", data);
      }
    } catch {
      setOrdersError("Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "products")  { fetchProducts(); fetchCategories(); }
    if (activeSection === "inventory") { fetchProducts(); fetchInventory(); }
    if (activeSection === "orders")    { fetchOrders(); }
    if (activeSection === "home")      { fetchProducts(); fetchOrders(); fetchInventory(); }
    if (activeSection === "reports")   { fetchProducts(); fetchOrders(); }
  }, [activeSection]);

  const getStock = (productId) => {
    const entries = inventory.filter((inv) => inv.product_id === productId);
    return entries.reduce((sum, inv) => sum + inv.quantity_on_hand, 0);
  };

  const getThreshold = (productId) => {
    const entries = inventory.filter((inv) => inv.product_id === productId);
    return entries.reduce((sum, inv) => sum + (inv.reorder_threshold || 0), 0);
  };

  const stockStatus = (stock, threshold) => {
    if (stock === 0) return { label: "Out of Stock", color: "#cc0c39", bg: "#fce8e6" };
    if (stock <= threshold) return { label: "Low Stock", color: "#e47911", bg: "#fff8e1" };
    return { label: "In Stock", color: "#007600", bg: "#e6f4ea" };
  };

  const hasInventoryEntry = (productId) =>
    inventory.some((inv) => inv.product_id === productId);

  const lowStockCount = products.filter((p) => {
    if (!hasInventoryEntry(p.product_id)) return false;
    const s = getStock(p.product_id);
    const t = getThreshold(p.product_id);
    return s > 0 && s <= t;
  }).length;

  const outOfStockCount = products.filter((p) => {
    if (!hasInventoryEntry(p.product_id)) return false;
    return getStock(p.product_id) === 0;
  }).length;

  const totalStockUnits = inventory.reduce((sum, inv) => sum + inv.quantity_on_hand, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(BLANK_FORM);
    setImageFiles([]);
    setExistingImages([]);
    setVariants([]);
    setExistingVariants([]);
    setInventoryEntryId(null);
    setInventoryOriginalStock(0);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title || "",
      slug: product.slug || "",
      description: product.description || "",
      base_price: product.base_price || "",
      currency_code: product.currency_code || "USD",
      specs: Object.entries(product.specs || {}).map(([key, value]) => ({ key, value })),
      status: product.status || "active",
      category: product.category?.category_id || product.category || "",
      stock_units: "",
      reorder_threshold: "",
    });
    setImageFiles([]);
    setExistingImages([]);
    setVariants([]);
    setExistingVariants([]);
    setInventoryEntryId(null);
    setInventoryOriginalStock(0);
    getProductImages(product.product_id)
      .then((data) => setExistingImages(Array.isArray(data) ? data : []))
      .catch(() => {});
    setVariantsLoading(true);
    getProductVariants(product.product_id)
      .then((data) => setExistingVariants(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setVariantsLoading(false));
    getInventory({ product_id: product.product_id })
      .then((data) => {
        const entries = Array.isArray(data) ? data : [];
        if (entries.length > 0) {
          const entry = entries[0];
          setInventoryEntryId(entry.inventory_id);
          setInventoryOriginalStock(entry.quantity_on_hand || 0);
          setForm((prev) => ({
            ...prev,
            stock_units: String(entry.quantity_on_hand ?? ""),
            reorder_threshold: String(entry.reorder_threshold ?? ""),
          }));
        }
      })
      .catch(() => {});
    setFormError(null);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title" && !editingProduct) updated.slug = slugify(value);
      return updated;
    });
  };

  const addSpecRow = () => setForm((p) => ({ ...p, specs: [...p.specs, { key: "", value: "" }] }));
  const updateSpec = (i, field, value) => setForm((p) => {
    const specs = [...p.specs];
    specs[i] = { ...specs[i], [field]: value };
    return { ...p, specs };
  });
  const removeSpec = (i) => setForm((p) => ({ ...p, specs: p.specs.filter((_, j) => j !== i) }));

  const handleImageFilesChange = (e) => {
    const incoming = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: false,
    }));
    e.target.value = "";
    setImageFiles((prev) => {
      const combined = [...prev, ...incoming];
      const hasPrimary = combined.some((f) => f.is_primary);
      if (!hasPrimary && combined.length > 0) combined[0] = { ...combined[0], is_primary: true };
      return combined;
    });
  };

  const removeImageFile = (idx) => {
    setImageFiles((prev) => {
      const wasPrimary = prev[idx].is_primary;
      const updated = prev.filter((_, i) => i !== idx);
      if (wasPrimary && updated.length > 0) updated[0] = { ...updated[0], is_primary: true };
      return updated;
    });
  };

  const setPrimaryImage = (idx) =>
    setImageFiles((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    try {
      await deleteProductImage(editingProduct.product_id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.image_id !== imageId));
      showToast("Image deleted.", "success");
    } catch {
      showToast("Failed to delete image.", "error");
    }
  };

  const handleSetExistingImagePrimary = async (imageId) => {
    try {
      await setImagePrimary(editingProduct.product_id, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.image_id === imageId }))
      );
      showToast("Primary image updated.", "success");
    } catch {
      showToast("Failed to update primary image.", "error");
    }
  };

  const addVariantRow = () =>
    setVariants((prev) => [...prev, { sku: "", price_override: "", attributes: [] }]);

  const removeVariantRow = (idx) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const updateVariantField = (idx, field, value) =>
    setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));

  const addVariantAttr = (variantIdx) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx ? { ...v, attributes: [...v.attributes, { key: "", value: "" }] } : v
      )
    );

  const removeVariantAttr = (variantIdx, attrIdx) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx ? { ...v, attributes: v.attributes.filter((_, j) => j !== attrIdx) } : v
      )
    );

  const updateVariantAttr = (variantIdx, attrIdx, field, value) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx
          ? { ...v, attributes: v.attributes.map((a, j) => j === attrIdx ? { ...a, [field]: value } : a) }
          : v
      )
    );

  const specsToObject = (arr) => arr.reduce((acc, { key, value }) => {
    if (key.trim()) acc[key.trim()] = value;
    return acc;
  }, {});

  const handleSubmit = async () => {
    setFormLoading(true);
    setFormError(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      base_price: parseFloat(form.base_price),
      currency_code: form.currency_code,
      specs: specsToObject(form.specs),
      status: form.status,
      category: form.category || null,
    };
    try {
      const result = editingProduct
        ? await updateProduct(editingProduct.product_id, payload)
        : await createProduct(payload);
      if (result.product_id) {
        if (imageFiles.length > 0) {
          let anyFailed = false;
          for (const img of imageFiles) {
            const imgResult = await uploadProductImage(result.product_id, img.file, { is_primary: img.is_primary });
            if (!imgResult.image_id) anyFailed = true;
          }
          if (anyFailed) showToast("Product saved but one or more image uploads failed.", "warning");
        }
        const newVariants = variants.filter((v) => v.sku.trim());
        if (newVariants.length > 0) {
          let variantsFailed = 0;
          for (const v of newVariants) {
            const variantPayload = {
              sku: v.sku.trim(),
              price_override: v.price_override ? parseFloat(v.price_override) : null,
              variant_attributes: v.attributes.reduce((acc, { key, value }) => {
                if (key.trim()) acc[key.trim()] = value;
                return acc;
              }, {}),
            };
            const vResult = await createProductVariant(result.product_id, variantPayload);
            if (!vResult.variant_id) variantsFailed++;
          }
          if (variantsFailed > 0) showToast(`${variantsFailed} variant(s) failed to save.`, "warning");
        }
        const stockUnits     = parseInt(form.stock_units)     || 0;
        const reorderAt      = parseInt(form.reorder_threshold) || 0;
        const hasStockInput  = form.stock_units !== "" || form.reorder_threshold !== "";

        if (!editingProduct && hasStockInput) {
          // New product — create inventory entry
          try {
            await createInventoryEntry({
              product_id:        result.product_id,
              quantity_on_hand:  stockUnits,
              reorder_threshold: reorderAt,
            });
          } catch {
            showToast("Product saved but inventory entry could not be created.", "warning");
          }
        } else if (editingProduct && inventoryEntryId && hasStockInput) {
          // Existing product — adjust stock to reach target, update threshold
          try {
            const change = stockUnits - inventoryOriginalStock;
            if (change !== 0) await adjustStock(inventoryEntryId, { quantity_change: change });
            await updateThreshold(inventoryEntryId, reorderAt);
          } catch {
            showToast("Product saved but stock update failed.", "warning");
          }
        }

        showToast(editingProduct ? "Product updated successfully!" : "Product created successfully!", "success");
        setShowForm(false);
        fetchProducts();
        fetchInventory();
      } else {
        const msg = Object.values(result).flat().join(" ") || "Failed to save product.";
        setFormError(msg);
        showToast(msg, "error");
      }
    } catch {
      setFormError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Deactivate this product?")) return;
    try {
      await deleteProduct(productId);
      showToast("Product deactivated.", "success");
      fetchProducts();
    } catch {
      showToast("Failed to deactivate product.", "error");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await cancelOrder(orderId, { reason: "Cancelled by seller" });
      showToast("Order cancelled.", "success");
      fetchOrders();
    } catch {
      showToast("Failed to cancel order.", "error");
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMsg("");
    try {
      const data = await updateProfile({
        username: settingsForm.username,
        phone: settingsForm.phone,
      });
      if (data.username) {
        setSeller((prev) => ({ ...prev, name: data.username }));
        setSettingsMsg("Saved successfully.");
        showToast("Account settings saved!", "success");
      } else {
        setSettingsMsg("Failed to save changes.");
        showToast("Failed to save changes.", "error");
      }
    } catch {
      setSettingsMsg("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setSettingsSaving(false);
      setTimeout(() => setSettingsMsg(""), 3000);
    }
  };

  // Derived from real orders — replaces the old hardcoded monthlySales array
  const monthlySales = groupOrdersByMonth(orders);

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredOrders = orders.filter((o) =>
    String(o.order_id).includes(orderSearch) ||
    String(o.customer_id).includes(orderSearch)
  );

  return (
    <div className="sd">
      <div className="sd__layout">

        {/* Sidebar */}
        <aside className="sd__sidebar">
          <div className="sd__sidebar-profile">
            <div className="sd__sidebar-avatar">{seller.name?.charAt(0) || "S"}</div>
            <div>
              <p className="sd__sidebar-name">{seller.name || "Seller"}</p>
              <p className="sd__sidebar-email">{seller.email}</p>
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
              <div className="sd__health-bar" style={{ width: "92%" }} />
            </div>
            <p className="sd__health-score">92/100</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="sd__content">

          {/* ── HOME ── */}
          {activeSection === "home" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Welcome back, {seller.name || "Seller"}! 👋</h2>
              <div className="sd__cards">
                {[
                  { label: "Total Revenue", value: formatPrice(totalRevenue, "USD"), icon: "📈", color: "#007600" },
                  { label: "Total Orders", value: orders.length, icon: "🛒", color: "#1a73e8" },
                  { label: "Pending Orders", value: pendingOrders, icon: "⏳", color: "#e47911" },
                  { label: "Total Products", value: products.length, icon: "📦", color: "#6b21a8" },
                  { label: "Low Stock", value: lowStockCount, icon: "⚠️", color: "#cc0c39" },
                ].map((card) => (
                  <div key={card.label} className="sd__card">
                    <div className="sd__card-icon" style={{ color: card.color }}>{card.icon}</div>
                    <div>
                      <p className="sd__card-label">{card.label}</p>
                      <p className="sd__card-value" style={{ color: card.color }}>{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sd__chart-section">
                <h3 className="sd__subsection-title">Sales Overview (Last 7 Months)</h3>
                <BarChart data={monthlySales} />
              </div>
              <div className="sd__recent">
                <h3 className="sd__subsection-title">Recent Orders</h3>
                <table className="sd__table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer ID</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 3).map((order) => (
                      <tr key={order.order_id}>
                        <td className="sd__order-id">#{order.order_id}</td>
                        <td>{order.customer_id}</td>
                        <td>{formatPrice(order.total_amount, order.currency_code)}</td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeSection === "products" && (
            <div className="sd__section">
              <div className="sd__section-header">
                <h2 className="sd__section-title">Products</h2>
                <button className="sd__btn sd__btn--primary" onClick={openAddForm}>+ Add Product</button>
              </div>

              {showForm && (
                <div className="sd__add-form">
                  <h3 className="sd__subsection-title">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                  {formError && <div className="sd__form-error">{formError}</div>}
                  <div className="sd__form-grid">
                    <div className="sd__form-field">
                      <label>Title *</label>
                      <input name="title" value={form.title} onChange={handleFormChange} className="sd__input" placeholder="Product title" />
                    </div>
                    <div className="sd__form-field">
                      <label>Slug *</label>
                      <input name="slug" value={form.slug} onChange={handleFormChange} className="sd__input" placeholder="auto-generated" />
                    </div>
                    <div className="sd__form-field">
                      <label>Base Price *</label>
                      <input name="base_price" type="number" min="0" step="0.01" value={form.base_price} onChange={handleFormChange} className="sd__input" placeholder="0.00" />
                    </div>
                    <div className="sd__form-field">
                      <label>Currency</label>
                      <input name="currency_code" maxLength={3} value={form.currency_code} onChange={handleFormChange} className="sd__input" placeholder="USD" />
                    </div>
                    <div className="sd__form-field">
                      <label>Category</label>
                      <select name="category" value={form.category} onChange={handleFormChange} className="sd__input">
                        <option value="">— Select category —</option>
                        {categories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sd__form-field">
                      <label>Status</label>
                      <select name="status" value={form.status} onChange={handleFormChange} className="sd__input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div className="sd__form-field">
                      <label>Stock Units</label>
                      <input name="stock_units" type="number" min="0" step="1" value={form.stock_units} onChange={handleFormChange} className="sd__input" placeholder="e.g. 100" />
                    </div>
                    <div className="sd__form-field">
                      <label>Reorder At</label>
                      <input name="reorder_threshold" type="number" min="0" step="1" value={form.reorder_threshold} onChange={handleFormChange} className="sd__input" placeholder="e.g. 10" />
                    </div>
                  </div>
                  <div className="sd__form-field">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleFormChange} className="sd__input sd__textarea" rows={3} placeholder="Describe the product..." />
                  </div>
                  <div className="sd__form-field">
                    <label>Specifications</label>
                    {form.specs.map((spec, i) => (
                      <div key={i} className="sd__spec-row">
                        <input type="text" placeholder="Key" value={spec.key} onChange={(e) => updateSpec(i, "key", e.target.value)} className="sd__input sd__spec-input" />
                        <input type="text" placeholder="Value" value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)} className="sd__input sd__spec-input" />
                        <button className="sd__action-btn sd__action-btn--delete" onClick={() => removeSpec(i)}>✕</button>
                      </div>
                    ))}
                    <button className="sd__btn sd__btn--secondary" onClick={addSpecRow}>+ Add Spec</button>
                  </div>
                  <div className="sd__form-field">
                    <label>Variants</label>
                    {variantsLoading && <p className="sd__file-name">Loading existing variants...</p>}
                    {existingVariants.length > 0 && (
                      <div className="sd__existing-variants">
                        <p className="sd__variants-subtitle">Existing variants (read-only)</p>
                        {existingVariants.map((v) => (
                          <div key={v.variant_id} className="sd__variant-existing">
                            <span className="sd__variant-sku">{v.sku}</span>
                            {v.price_override != null && (
                              <span className="sd__variant-price">{v.price_override}</span>
                            )}
                            {Object.entries(v.variant_attributes || {}).map(([k, val]) => (
                              <span key={k} className="sd__variant-attr">{k}: {val}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {variants.map((v, idx) => (
                      <div key={idx} className="sd__variant-row">
                        <div className="sd__variant-row-header">
                          <span>Variant {idx + 1}</span>
                          <button type="button" className="sd__action-btn sd__action-btn--delete" onClick={() => removeVariantRow(idx)}>✕ Remove</button>
                        </div>
                        <div className="sd__variant-fields">
                          <div className="sd__form-field">
                            <label>SKU *</label>
                            <input type="text" placeholder="e.g. SHIRT-RED-XL" value={v.sku} onChange={(e) => updateVariantField(idx, "sku", e.target.value)} className="sd__input" />
                          </div>
                          <div className="sd__form-field">
                            <label>Price Override</label>
                            <input type="number" placeholder="Leave blank to use base price" value={v.price_override} onChange={(e) => updateVariantField(idx, "price_override", e.target.value)} className="sd__input" min="0" step="0.01" />
                          </div>
                        </div>
                        <div className="sd__form-field">
                          <label>Attributes (e.g. color, size)</label>
                          {v.attributes.map((attr, attrIdx) => (
                            <div key={attrIdx} className="sd__spec-row">
                              <input type="text" placeholder="Key (e.g. color)" value={attr.key} onChange={(e) => updateVariantAttr(idx, attrIdx, "key", e.target.value)} className="sd__input sd__spec-input" />
                              <input type="text" placeholder="Value (e.g. red)" value={attr.value} onChange={(e) => updateVariantAttr(idx, attrIdx, "value", e.target.value)} className="sd__input sd__spec-input" />
                              <button type="button" className="sd__action-btn sd__action-btn--delete" onClick={() => removeVariantAttr(idx, attrIdx)}>✕</button>
                            </div>
                          ))}
                          <button type="button" className="sd__btn sd__btn--secondary" onClick={() => addVariantAttr(idx)}>+ Add Attribute</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="sd__btn sd__btn--secondary" onClick={addVariantRow}>+ Add Variant</button>
                  </div>
                  <div className="sd__form-field">
                    <label>Product Images</label>

                    {/* ── Saved images (edit mode) ── */}
                    {existingImages.length > 0 && (
                      <>
                        <p className="sd__variants-subtitle">Saved images</p>
                        <div className="sd__image-preview-grid">
                          {existingImages.map((img) => (
                            <div key={img.image_id} className={`sd__image-preview-item${img.is_primary ? " sd__image-preview-item--primary" : ""}`}>
                              <img src={img.image_url} alt={img.alt_text || "product"} className="sd__image-preview-thumb" />
                              <div className="sd__image-preview-actions">
                                {img.is_primary
                                  ? <span className="sd__image-primary-badge">Primary</span>
                                  : <button type="button" className="sd__image-btn sd__image-btn--set-primary" onClick={() => handleSetExistingImagePrimary(img.image_id)}>Set Primary</button>
                                }
                                <button type="button" className="sd__image-btn sd__image-btn--remove" onClick={() => handleDeleteExistingImage(img.image_id)}>✕ Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* ── New uploads ── */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="sd-image-upload"
                      style={{ display: "none" }}
                      onChange={handleImageFilesChange}
                    />
                    <label htmlFor="sd-image-upload" className="sd__btn sd__btn--secondary" style={{ display: "inline-block", cursor: "pointer", margin: "8px 0" }}>
                      + Add Images
                    </label>
                    {imageFiles.length > 0 && (
                      <>
                        <p className="sd__variants-subtitle">New images (will upload on save)</p>
                        <div className="sd__image-preview-grid">
                          {imageFiles.map((img, idx) => (
                            <div key={idx} className={`sd__image-preview-item${img.is_primary ? " sd__image-preview-item--primary" : ""}`}>
                              <img src={img.preview} alt={`preview-${idx}`} className="sd__image-preview-thumb" />
                              <div className="sd__image-preview-actions">
                                {img.is_primary
                                  ? <span className="sd__image-primary-badge">Primary</span>
                                  : <button type="button" className="sd__image-btn sd__image-btn--set-primary" onClick={() => setPrimaryImage(idx)}>Set Primary</button>
                                }
                                <button type="button" className="sd__image-btn sd__image-btn--remove" onClick={() => removeImageFile(idx)}>✕ Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="sd__form-actions">
                    <button className="sd__btn sd__btn--primary" onClick={handleSubmit} disabled={formLoading}>
                      {formLoading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                    </button>
                    <button className="sd__btn sd__btn--secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button>
                  </div>
                </div>
              )}

              <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="sd__search" />

              {productsLoading && <p className="sd__state-msg">Loading products...</p>}
              {productsError && <p className="sd__state-msg sd__state-msg--error">{productsError}</p>}

              {!productsLoading && !productsError && (
                <table className="sd__table">
                  <thead>
                    <tr><th>#</th><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No products found.</td></tr>
                    ) : filteredProducts.map((p, i) => (
                      <tr key={p.product_id}>
                        <td>{i + 1}</td>
                        <td>
                          {p.primary_image
                            ? <img src={p.primary_image} alt={p.title} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                            : <div style={{ width: 48, height: 48, borderRadius: 6, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
                          }
                        </td>
                        <td className="sd__product-name">{p.title}</td>
                        <td>{p.category_name || "—"}</td>
                        <td>{formatPrice(p.base_price, p.currency_code)}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>
                          <div className="sd__actions">
                            <button className="sd__action-btn sd__action-btn--edit" onClick={() => openEditForm(p)}>Edit</button>
                            <button className="sd__action-btn sd__action-btn--delete" onClick={() => handleDelete(p.product_id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── INVENTORY ── */}
          {activeSection === "inventory" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Inventory</h2>

              {/* Summary cards */}
              <div className="sd__cards">
                {[
                  { label: "Total Products",    value: products.length,    color: "#1a73e8" },
                  { label: "Total Stock Units",  value: totalStockUnits,    color: "#007600" },
                  { label: "Low Stock",          value: lowStockCount,      color: "#e47911" },
                  { label: "Out of Stock",       value: outOfStockCount,    color: "#cc0c39" },
                ].map((card) => (
                  <div key={card.label} className="sd__card sd__card--small">
                    <p className="sd__card-label">{card.label}</p>
                    <p className="sd__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                ))}
              </div>

              {productsLoading && <p className="sd__state-msg">Loading inventory...</p>}
              {productsError  && <p className="sd__state-msg sd__state-msg--error">{productsError}</p>}

              {!productsLoading && !productsError && (
                <table className="sd__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Units</th>
                      <th>Reorder At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No products yet. Add products first.</td></tr>
                    ) : products.map((p, i) => {
                      const tracked   = hasInventoryEntry(p.product_id);
                      const stock     = tracked ? getStock(p.product_id) : null;
                      const threshold = tracked ? getThreshold(p.product_id) : null;
                      const status    = tracked ? stockStatus(stock, threshold) : null;
                      return (
                        <tr key={p.product_id}>
                          <td>{i + 1}</td>
                          <td>
                            {p.primary_image
                              ? <img src={p.primary_image} alt={p.title} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} />
                              : <div style={{ width: 44, height: 44, borderRadius: 6, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                            }
                          </td>
                          <td className="sd__product-name">{p.title}</td>
                          <td>{p.category_name || "—"}</td>
                          <td>{formatPrice(p.base_price, p.currency_code)}</td>
                          <td><strong>{tracked ? stock : "—"}</strong></td>
                          <td>{tracked && threshold > 0 ? threshold : "—"}</td>
                          <td>
                            {tracked
                              ? <span className="sd__badge" style={{ backgroundColor: status.bg, color: status.color }}>{status.label}</span>
                              : <span className="sd__badge" style={{ backgroundColor: "#f5f5f5", color: "#888" }}>Not Tracked</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeSection === "orders" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Orders</h2>
              <div className="sd__cards">
                {[
                  { label: "Total Orders", value: orders.length, color: "#1a73e8" },
                  { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "#e47911" },
                  { label: "Shipped", value: orders.filter((o) => o.status === "shipped").length, color: "#1a73e8" },
                  { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, color: "#007600" },
                  { label: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length, color: "#cc0c39" },
                ].map((card) => (
                  <div key={card.label} className="sd__card sd__card--small">
                    <p className="sd__card-label">{card.label}</p>
                    <p className="sd__card-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                ))}
              </div>
              <input type="text" placeholder="Search by order ID or customer ID..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="sd__search" />

              {ordersLoading && <p className="sd__state-msg">Loading orders...</p>}
              {ordersError && <p className="sd__state-msg sd__state-msg--error">{ordersError}</p>}

              {!ordersLoading && !ordersError && (
                <table className="sd__table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer ID</th><th>Items</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No orders found.</td></tr>
                    ) : filteredOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td className="sd__order-id">#{order.order_id}</td>
                        <td>{order.customer_id}</td>
                        <td>{order.items_count}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td>{formatPrice(order.total_amount, order.currency_code)}</td>
                        <td><StatusBadge status={order.payment_status} /></td>
                        <td><StatusBadge status={order.status} /></td>
                        <td>
                          {["pending", "confirmed"].includes(order.status) && (
                            <button className="sd__action-btn sd__action-btn--delete" onClick={() => handleCancelOrder(order.order_id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeSection === "reports" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Reports</h2>
              <div className="sd__reports-grid">
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">📈 Sales Report</h3>
                  <div className="sd__report-rows">
                    {[
                      { label: "Total Revenue", value: formatPrice(totalRevenue, "USD") },
                      { label: "Total Orders", value: orders.length },
                      { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
                      { label: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length },
                    ].map((row) => (
                      <div key={row.label} className="sd__report-row">
                        <span>{row.label}</span>
                        <span className="sd__report-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">🛒 Orders Report</h3>
                  <div className="sd__report-rows">
                    {[
                      { label: "Total", value: orders.length },
                      { label: "Pending", value: orders.filter((o) => o.status === "pending").length },
                      { label: "Processing", value: orders.filter((o) => o.status === "processing").length },
                      { label: "Shipped", value: orders.filter((o) => o.status === "shipped").length },
                    ].map((row) => (
                      <div key={row.label} className="sd__report-row">
                        <span>{row.label}</span>
                        <span className="sd__report-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">📦 Inventory Report</h3>
                  <div className="sd__report-rows">
                    {[
                      { label: "Total Products", value: products.length },
                      { label: "Active", value: products.filter((p) => p.status === "active").length },
                      { label: "Inactive", value: products.filter((p) => p.status === "inactive").length },
                      { label: "Low Stock Items", value: lowStockCount },
                    ].map((row) => (
                      <div key={row.label} className="sd__report-row">
                        <span>{row.label}</span>
                        <span className="sd__report-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sd__report-card">
                  <h3 className="sd__subsection-title">🏆 Top Products</h3>
                  <div className="sd__report-rows">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.product_id} className="sd__report-row">
                        <span>{p.title?.split(" ").slice(0, 3).join(" ")}...</span>
                        <span className="sd__report-value"><StatusBadge status={p.status} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sd__chart-section">
                <h3 className="sd__subsection-title">Monthly Sales Trend</h3>
                <BarChart data={monthlySales} />
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === "settings" && (
            <div className="sd__section">
              <h2 className="sd__section-title">Settings</h2>
              <div className="sd__settings-grid">
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Account Info</h3>
                  <div className="sd__form-field">
                    <label>Store Name</label>
                    <input
                      value={settingsForm.username}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, username: e.target.value }))}
                      className="sd__input"
                    />
                  </div>
                  <div className="sd__form-field">
                    <label>Email</label>
                    <input value={seller.email} className="sd__input" readOnly />
                  </div>
                  <div className="sd__form-field">
                    <label>Phone Number</label>
                    <input
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, phone: e.target.value }))}
                      className="sd__input"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                  {settingsMsg && <p style={{ fontSize: 13, color: settingsMsg.includes("success") ? "#007600" : "#cc0c39" }}>{settingsMsg}</p>}
                  <button className="sd__btn sd__btn--primary" onClick={handleSaveSettings} disabled={settingsSaving}>
                    {settingsSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
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
                    <input placeholder="e.g. 6XX XXX XXX" className="sd__input" />
                  </div>
                  <button className="sd__btn sd__btn--primary">Save Changes</button>
                </div>
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Shipping Settings</h3>
                  <div className="sd__form-field">
                    <label>Default Shipping Rate</label>
                    <input placeholder="0.00" className="sd__input" type="number" min="0" step="0.01" />
                  </div>
                  <div className="sd__form-field">
                    <label>Free Shipping Threshold</label>
                    <input placeholder="0.00" className="sd__input" type="number" min="0" step="0.01" />
                  </div>
                  <div className="sd__form-field">
                    <label>Processing Time (days)</label>
                    <input placeholder="1" className="sd__input" type="number" min="1" />
                  </div>
                  <button className="sd__btn sd__btn--primary">Save Changes</button>
                </div>
                <div className="sd__settings-card">
                  <h3 className="sd__subsection-title">Notifications</h3>
                  {["New order received", "Order shipped", "Low stock alert", "New customer review", "Payment received"].map((notif) => (
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