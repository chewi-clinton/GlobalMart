import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import favouriteAnimation from "../assets/favorite.json";
import "../styles/FavoritePage.css";

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

// Heart Icon Component
const HeartIcon = ({ filled, onClick }) => (
  <svg
    className={`heart-icon ${filled ? "filled" : ""}`}
    viewBox="0 0 24 24"
    fill={filled ? "#f0c14b" : "none"}
    stroke={filled ? "#f0c14b" : "#666"}
    strokeWidth="2"
    onClick={onClick}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Particle Burst Component
const ParticleBurst = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="particle-burst">
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            "--particle-angle": `${i * 30}deg`,
            "--particle-delay": `${i * 0.02}s`,
          }}
        />
      ))}
    </div>
  );
};

// Empty State Component
const EmptyFavorites = ({ onDiscover }) => (
  <motion.div
    className="empty-favorites"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <div className="empty-lottie">
      <Lottie animationData={favouriteAnimation} loop={true} autoplay={true} />
    </div>
    <div className="empty-content">
      <h2 className="empty-title">Start Your Wishlist Collection</h2>
      <p className="empty-message">
        Your favorites list is empty. Explore products from around the world and
        save items you love by clicking the heart icon.
      </p>
      <motion.button
        className="discover-btn"
        onClick={onDiscover}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 8px 30px rgba(255, 153, 0, 0.4)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon
            points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
            fill="currentColor"
          />
        </svg>
        Discover New Products
      </motion.button>
    </div>
  </motion.div>
);

// Favorite Card Component
const FavoriteCard = ({ item, index, onRemove, onAddToCart }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleRemove = useCallback(() => {
    setShowParticles(true);
    setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => onRemove(item.id), 300);
    }, 400);
  }, [item.id, onRemove]);

  const handleAddToCart = useCallback(() => {
    onAddToCart(item);
  }, [item, onAddToCart]);

  return (
    <motion.div
      className={`favorite-card ${isRemoving ? "removing" : ""}`}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.3 } }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
        delay: index * 0.08,
      }}
      layout
    >
      <div className="card-image-container">
        <img
          src={item.image}
          alt={item.name}
          className="card-image"
          loading="lazy"
        />

        <div className="heart-container">
          <ParticleBurst isActive={showParticles} />
          <HeartIcon filled={true} onClick={handleRemove} />
        </div>

        <div className="card-overlay">
          <motion.button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
      </div>

      <div className="card-content">
        <span className="card-category">{item.category}</span>
        <h3 className="card-name">{item.name}</h3>
        <p className="card-price">{item.price.toLocaleString()} {item.currency || ""}</p>
      </div>
    </motion.div>
  );
};

// Main FavoritesPage Component
const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const handleRemove = useCallback((itemId) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleAddToCart = useCallback((item) => {
    addToCart(item);
    showToast(`"${item.name}" added to cart!`, "success");
  }, []);

  const handleDiscover = useCallback(() => {
    navigate("/shop");
  }, [navigate]);

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <motion.header
          className="favorites-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h1 className="header-title">Your Wishlist Collection</h1>
          <p className="header-count">
            {favorites.length} {favorites.length === 1 ? "Item" : "Items"} Saved
          </p>
        </motion.header>

        {favorites.length > 0 ? (
          <motion.div
            className="favorites-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="popLayout">
              {favorites.map((item, index) => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyFavorites onDiscover={handleDiscover} />
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
