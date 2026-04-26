import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductDetail } from "../api";
import { showToast } from "../components/Toast";
import { useCurrency } from "../context/CurrencyContext";
import "../styles/ProductDetailPage.css";

// ─── Cart helpers ─────────────────────────────────────────────────────

const addToCart = (product, quantity) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
};

// ─── Star Rating ──────────────────────────────────────────────────────

function StarRating({ rating }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars)
      stars.push(<span key={i} className="pdp__star pdp__star--full">★</span>);
    else if (i === fullStars && hasHalf)
      stars.push(<span key={i} className="pdp__star pdp__star--half">★</span>);
    else
      stars.push(<span key={i} className="pdp__star pdp__star--empty">☆</span>);
  }
  return <span className="pdp__stars">{stars}</span>;
}

// ─── Map API response to component shape ──────────────────────────────

const mapProductDetail = (p) => {
  const images = p.images && p.images.length > 0
    ? p.images.sort((a, b) => a.display_order - b.display_order).map((img) => img.image_url)
    : ["https://placehold.co/500x500?text=No+Image"];

  // Extract colors and sizes from variant_attributes
  const colors = [];
  const sizes = [];
  if (p.variants) {
    p.variants.filter((v) => v.is_active).forEach((v) => {
      const attrs = v.variant_attributes || {};
      if (attrs.color && !colors.find((c) => c.name === attrs.color)) {
        colors.push({ name: attrs.color, hex: attrs.color_hex || "#888888" });
      }
      if (attrs.size && !sizes.includes(attrs.size)) {
        sizes.push(attrs.size);
      }
    });
  }

  // Extract features and details from specs JSON
  const specs = p.specs || {};
  const features = Array.isArray(specs.features) ? specs.features : [];
  const details = Array.isArray(specs.details)
    ? specs.details
    : Object.entries(specs)
        .filter(([k]) => k !== "features" && k !== "details")
        .map(([k, v]) => ({ label: k, value: String(v) }));

  return {
    id: p.product_id,
    name: p.title,
    description: p.description || "",
    price: parseFloat(p.base_price),
    currency: p.currency_code || "XAF",
    category: p.category ? p.category.name : "Other",
    seller_id: p.seller_id,
    images,
    colors,
    sizes,
    features,
    details,
  };
};

// ─── ProductDetailPage ────────────────────────────────────────────────

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProductDetail(id);
        if (data.product_id) {
          setProduct(mapProductDetail(data));
        } else {
          setError(data.error || "Product not found.");
        }
      } catch {
        setError("Network error. Could not load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        currency: product.currency,
        seller_id: product.seller_id,
      },
      quantity
    );
    showToast(`"${product.name}" added to cart!`, "success");
    setCartMsg("Added to cart!");
    setTimeout(() => setCartMsg(""), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", fontSize: "18px" }}>
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "60px", fontSize: "18px" }}>
        {error || "Product not found."}{" "}
        <a href="/shop" style={{ color: "#0066c0" }}>Go back to shop</a>
      </div>
    );
  }

  return (
    <div className="pdp">

      {/* Breadcrumb */}
      <div className="pdp__breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>
        <span> › </span>
        <span onClick={() => navigate("/shop")}>Shop</span>
        <span> › </span>
        <span onClick={() => navigate("/shop")}>{product.category}</span>
        <span> › </span>
        <span className="pdp__breadcrumb--current">{product.name}</span>
      </div>

      {/* Main Layout */}
      <div className="pdp__main">

        {/* Thumbnails */}
        <div className="pdp__thumbnails">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`View ${i + 1}`}
              className={`pdp__thumb ${selectedImage === i ? "pdp__thumb--active" : ""}`}
              onClick={() => setSelectedImage(i)}
              onError={(e) => { e.target.src = "https://placehold.co/80x80?text=N/A"; }}
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="pdp__main-image-wrapper">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="pdp__main-image"
            onError={(e) => { e.target.src = "https://placehold.co/500x500?text=No+Image"; }}
          />
        </div>

        {/* Product Info */}
        <div className="pdp__info">
          <h1 className="pdp__title">{product.name}</h1>

          {/* Color Variants */}
          {product.colors.length > 0 && (
            <div className="pdp__variants">
              <p className="pdp__variant-label">
                Color: <strong>{product.colors[selectedColor].name}</strong>
              </p>
              <div className="pdp__color-swatches">
                {product.colors.map((color, i) => (
                  <div
                    key={i}
                    className={`pdp__color-dot ${selectedColor === i ? "pdp__color-dot--active" : ""}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(i)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && <div className="pdp__divider" />}

          {/* Size Variants */}
          {product.sizes.length > 0 && (
            <div className="pdp__size">
              <p className="pdp__variant-label">Size:</p>
              <div className="pdp__size-buttons">
                {product.sizes.map((size, i) => (
                  <button
                    key={i}
                    className={`pdp__size-btn ${selectedSize === i ? "pdp__size-btn--active" : ""}`}
                    onClick={() => setSelectedSize(i)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && <div className="pdp__divider" />}

          {/* Price */}
          <div className="pdp__price-row">
            <span className="pdp__price">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          <div className="pdp__divider" />

          {/* Description */}
          <p className="pdp__description">{product.description}</p>
        </div>

        {/* Buy Box */}
        <div className="pdp__buybox">
          <p className="pdp__buybox-price">
            {formatPrice(product.price, product.currency)}
          </p>

          <p className="pdp__buybox-delivery">
            <span className="pdp__buybox-free">FREE delivery</span>
          </p>

          <p className="pdp__stock pdp__stock--in">In Stock</p>

          <div className="pdp__quantity">
            <label className="pdp__quantity-label">Quantity:</label>
            <select
              className="pdp__quantity-select"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {cartMsg && <p style={{ color: "#007600", fontSize: "14px", margin: "4px 0" }}>{cartMsg}</p>}

          <button className="pdp__btn pdp__btn--cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button
            className="pdp__btn pdp__btn--buy"
            onClick={() => {
              handleAddToCart();
              navigate("/payment");
            }}
          >
            Buy Now
          </button>

          <div className="pdp__buybox-info">
            <div className="pdp__buybox-info-row">
              <span className="pdp__buybox-info-label">Returns</span>
              <span>30-day refund / replacement</span>
            </div>
            <div className="pdp__buybox-info-row">
              <span className="pdp__buybox-info-label">Packaging</span>
              <span>Ships in product packaging</span>
            </div>
          </div>

          <button className="pdp__add-list">+ Add to List</button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pdp__bottom">

        {/* Features */}
        {product.features.length > 0 && (
          <div className="pdp__section">
            <h2 className="pdp__section-title">Top highlights</h2>
            <ul className="pdp__features">
              {product.features.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Details Table */}
        {product.details.length > 0 && (
          <div className="pdp__section">
            <h2 className="pdp__section-title">Product details</h2>
            <table className="pdp__details-table">
              <tbody>
                {product.details.map((d, i) => (
                  <tr key={i}>
                    <td className="pdp__details-key">{d.label}</td>
                    <td className="pdp__details-value">{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
