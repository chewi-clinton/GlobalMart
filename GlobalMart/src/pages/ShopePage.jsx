import React, { useState, useCallback, useEffect } from "react";
import { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import sorryAnimation from "../assets/sorry.json";
import { getProducts, getCategories } from "../api";
import { showToast } from "../components/Toast";
import { useCurrency } from "../context/CurrencyContext";
import "../styles/ShopPage.css";

// ─── Cart helpers ─────────────────────────────────────────────────────

const addToCart = (product) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
};

const toggleFavorite = (product) => {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const idx = favs.findIndex((f) => f.id === product.id);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(product);
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
};

const isFavorited = (productId) => {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  return favs.some((f) => f.id === productId);
};

// ─── Map API product to component shape ───────────────────────────────

const mapProduct = (p) => ({
  id: p.product_id,
  name: p.title,
  price: parseFloat(p.base_price),
  image: p.primary_image || "https://placehold.co/300x300?text=No+Image",
  category: p.category_name || "Other",
  currency: p.currency_code || "XAF",
  seller_id: p.seller_id || null,
  slug: p.slug,
});

// ─── Star Rating ──────────────────────────────────────────────────────

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className="star filled" viewBox="0 0 24 24" fill="#f0c14b">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className="star half" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`hg-${rating}-${i}`}>
              <stop offset="50%" stopColor="#f0c14b" />
              <stop offset="50%" stopColor="#e0e0e0" />
            </linearGradient>
          </defs>
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={`url(#hg-${rating}-${i})`}
          />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="star empty" viewBox="0 0 24 24" fill="#e0e0e0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
  }
  return <div className="star-rating">{stars}</div>;
};

// ─── Dual-Thumb Price Range Slider ────────────────────────────────────

const PriceRangeSlider = ({ min, max, values, onChange }) => {
  const rangeRef = useRef(null);
  const minPercent = ((values[0] - min) / (max - min)) * 100;
  const maxPercent = ((values[1] - min) / (max - min)) * 100;

  const handleMouseDown = (thumb) => (e) => {
    e.preventDefault();
    const rect = rangeRef.current.getBoundingClientRect();
    const handleMouseMove = (moveEvent) => {
      const percent = Math.max(
        0,
        Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100)
      );
      const value = Math.round(min + (percent / 100) * (max - min));
      let newValues = [...values];
      if (thumb === "min") newValues[0] = Math.min(value, values[1] - 10);
      else newValues[1] = Math.max(value, values[0] + 10);
      onChange(newValues);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="price-range-slider">
      <div className="price-values">
        <span>{values[0].toLocaleString()}</span>
        <span>{values[1].toLocaleString()}</span>
      </div>
      <div className="slider-track" ref={rangeRef}>
        <div
          className="slider-fill"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <div
          className="slider-thumb"
          style={{ left: `${minPercent}%` }}
          onMouseDown={handleMouseDown("min")}
        />
        <div
          className="slider-thumb"
          style={{ left: `${maxPercent}%` }}
          onMouseDown={handleMouseDown("max")}
        />
      </div>
    </div>
  );
};

// ─── Particle Burst ───────────────────────────────────────────────────

const ParticleBurst = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="wishlist-particle-burst">
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="wishlist-particle"
          style={{
            "--particle-angle": `${i * 30}deg`,
            "--particle-delay": `${i * 0.02}s`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Wishlist Heart Button ────────────────────────────────────────────

const WishlistButton = ({ product }) => {
  const [wished, setWished] = useState(() => isFavorited(product.id));
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (!wished) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 700);
      }
      toggleFavorite(product);
      setWished((w) => !w);
    },
    [wished, product]
  );

  return (
    <div className="wishlist-btn-container">
      <ParticleBurst isActive={showParticles} />
      <button
        className={`wishlist-btn ${wished ? "wished" : ""}`}
        onClick={handleClick}
        aria-label="Add to wishlist"
      >
        <svg
          viewBox="0 0 24 24"
          fill={wished ? "#f0c14b" : "none"}
          stroke={wished ? "#f0c14b" : "#fff"}
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────

const ProductCard = ({ product, index, onProductClick }) => {
  const { formatPrice } = useCurrency(); // ← fix: pull formatPrice from context
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 280, damping: 25, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
      layout
    >
      <div className="card-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="card-image"
          loading="lazy"
          onError={(e) => { e.target.src = "https://placehold.co/300x300?text=No+Image"; }}
        />
        <WishlistButton product={product} />
      </div>

      <div className="card-content">
        <h3 className="product-name">{product.name}</h3>
        <div className="price-row">
          <span
            className="current-price"
            style={{ textShadow: isHovered ? "0 0 20px rgba(255,153,0,0.5)" : "none" }}
          >
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        <div className="brand-tag">{product.category}</div>
        <motion.button
          className={`add-to-cart-btn ${isHovered ? "glow" : ""}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
            showToast(`"${product.name}" added to cart!`, "success");
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Filter Sidebar ───────────────────────────────────────────────────

const FilterSidebar = ({ filters, setFilters, priceMax }) => {
  const [priceRange, setPriceRange] = useState([0, priceMax]);

  useEffect(() => {
    setPriceRange([0, priceMax]);
  }, [priceMax]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, priceRange }));
  }, [priceRange, setFilters]);

  return (
    <motion.aside
      className="filter-sidebar"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <h2 className="sidebar-title">Filters</h2>
      <div className="filter-section">
        <h3 className="filter-heading">Price Range</h3>
        <PriceRangeSlider
          min={0}
          max={priceMax}
          values={priceRange}
          onChange={setPriceRange}
        />
      </div>
      <button
        className="clear-filters-btn"
        onClick={() => {
          setPriceRange([0, priceMax]);
          setFilters({ priceRange: [0, priceMax] });
        }}
      >
        Clear All Filters
      </button>
    </motion.aside>
  );
};

// ─── Main ShopPage ────────────────────────────────────────────────────

const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [categories, setCategoriesList] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ priceRange: [0, 99999999] });

  const priceMax = products.length
    ? Math.ceil(Math.max(...products.map((p) => p.price)) / 1000) * 1000
    : 99999999;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((c) => { map[c.name] = c.category_id; });
          setCategoryMap(map);
          setCategoriesList(["All", ...data.map((c) => c.name)]);

          const urlId = parseInt(searchParams.get("category"));
          if (urlId) {
            const matched = data.find((c) => c.category_id === urlId);
            if (matched) {
              setActiveCategory(matched.name);
              setActiveCategoryId(urlId);
            }
          }
        }
      } catch {
        // categories are non-critical
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (activeCategoryId) params.category = activeCategoryId;
        const data = await getProducts(params);
        if (Array.isArray(data)) {
          setProducts(data.map(mapProduct));
        } else {
          setError("Failed to load products.");
        }
      } catch {
        setError("Network error. Could not load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategoryId]);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
    setActiveCategoryId(category === "All" ? null : categoryMap[category] || null);
  }, [categoryMap]);

  const handleProductClick = useCallback((product) => {
    navigate(`/product/${product.id}`);
  }, [navigate]);

  const filteredProducts = products.filter((product) => {
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1])
      return false;
    return true;
  });

  return (
    <div className="shop-page">
      <div className="shop-container">
        <motion.nav
          className="category-nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="category-pills">
            {categories.map((category) => (
              <motion.button
                key={category}
                className={`category-pill ${activeCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
          <div className="results-count">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
          </div>
        </motion.nav>

        <div className="shop-content">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            priceMax={priceMax}
          />
          <main className="product-grid-container">
            {loading ? (
              <div className="shop-loading">Loading products...</div>
            ) : error ? (
              <div className="shop-error">{error}</div>
            ) : (
              <AnimatePresence mode="wait">
                {filteredProducts.length > 0 ? (
                  <motion.div
                    key="grid"
                    className="product-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onProductClick={handleProductClick}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-results"
                    className="no-results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="no-results-lottie">
                      <Lottie animationData={sorryAnimation} loop autoplay />
                    </div>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or browse different categories</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;