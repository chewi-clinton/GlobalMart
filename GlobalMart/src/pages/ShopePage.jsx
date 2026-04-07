import React, { useState, useCallback } from "react";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import sorryAnimation from "../assets/sorry.json";
import { allProducts } from "../data/products";
import "../styles/ShopPage.css";

const categories = ["All", "Tech", "Fashion", "Sports"];
const brandOptions = [
  "AudioMax",
  "StyleCraft",
  "TechPro",
  "SprintMax",
  "VisionLux",
  "SoundWave",
  "FitLife",
  "TravelGear",
  "SmartLife",
];

// Star Rating Component
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className="star filled" viewBox="0 0 24 24" fill="#f0c14b">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>,
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
        </svg>,
      );
    } else {
      stars.push(
        <svg key={i} className="star empty" viewBox="0 0 24 24" fill="#e0e0e0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>,
      );
    }
  }
  return <div className="star-rating">{stars}</div>;
};

// Dual-Thumb Price Range Slider
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
        Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100),
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
        <span>${values[0]}</span>
        <span>${values[1]}</span>
      </div>
      <div className="slider-track" ref={rangeRef}>
        <div
          className="slider-fill"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
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

// Particle Burst
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

// Wishlist Heart Button
const WishlistButton = ({ productId }) => {
  const [wished, setWished] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (!wished) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 700);
      }
      setWished((w) => !w);
    },
    [wished],
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

// Product Card
const ProductCard = ({ product, index, onProductClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 25,
        delay: index * 0.05,
      }}
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
        />
        {product.originalPrice && (
          <span className="discount-badge">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        <WishlistButton productId={product.id} />
      </div>

      <div className="card-content">
        {product.topItem && <span className="top-item-badge">Top Item</span>}
        <h3 className="product-name">{product.name}</h3>
        <div className="rating-row">
          <StarRating rating={product.rating} />
          <span className="review-count">({product.reviews})</span>
        </div>
        <div className="price-row">
          <span
            className="current-price"
            style={{
              textShadow: isHovered ? "0 0 20px rgba(255,153,0,0.5)" : "none",
            }}
          >
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="original-price">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="brand-tag">{product.brand}</div>
        <motion.button
          className={`add-to-cart-btn ${isHovered ? "glow" : ""}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
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

// Filter Sidebar
const FilterSidebar = ({ filters, setFilters }) => {
  const [priceRange, setPriceRange] = useState([0, 400]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  useEffect(() => {
    setFilters({ priceRange, brands: selectedBrands, rating: selectedRating });
  }, [priceRange, selectedBrands, selectedRating, setFilters]);

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
          max={400}
          values={priceRange}
          onChange={setPriceRange}
        />
      </div>
      <div className="filter-section">
        <h3 className="filter-heading">Star Rating</h3>
        <div className="rating-filters">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`rating-btn ${selectedRating === rating ? "active" : ""}`}
              onClick={() =>
                setSelectedRating(selectedRating === rating ? 0 : rating)
              }
            >
              <StarRating rating={rating} />
              <span className="rating-label">& Up</span>
            </button>
          ))}
        </div>
      </div>
      <div className="filter-section">
        <h3 className="filter-heading">Brand</h3>
        <div className="brand-list">
          {brandOptions.map((brand) => (
            <label key={brand} className="brand-checkbox">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
              <span className="checkbox-custom"></span>
              <span className="brand-name">{brand}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        className="clear-filters-btn"
        onClick={() => {
          setPriceRange([0, 400]);
          setSelectedBrands([]);
          setSelectedRating(0);
        }}
      >
        Clear All Filters
      </button>
    </motion.aside>
  );
};

// Main ShopPage
const ShopPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [filters, setFilters] = useState({
    priceRange: [0, 400],
    brands: [],
    rating: 0,
  });

  const handleProductClick = useCallback((product) => {
    navigate(`/product/${product.id}`);
  }, [navigate]);

  const filteredProducts = allProducts.filter((product) => {
    if (activeCategory !== "All" && product.category !== activeCategory)
      return false;
    if (
      product.price < filters.priceRange[0] ||
      product.price > filters.priceRange[1]
    )
      return false;
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand))
      return false;
    if (filters.rating > 0 && product.rating < filters.rating) return false;
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
                onClick={() => setActiveCategory(category)}
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
          <FilterSidebar filters={filters} setFilters={setFilters} />
          <main className="product-grid-container">
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
                    <Lottie
                      animationData={sorryAnimation}
                      loop={true}
                      autoplay={true}
                    />
                  </div>
                  <h3>No products found</h3>
                  <p>
                    Try adjusting your filters or browse different categories
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;