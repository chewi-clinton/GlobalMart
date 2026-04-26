import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import emptyCartAnimation from "../assets/empty_cart.json";
import { useCurrency } from "../context/CurrencyContext";
import "../styles/CartPage.css";

// Price helper — reads from context so it re-renders when currency changes
const CartItemPrice = ({ price, currency }) => {
  const { formatPrice } = useCurrency();
  return <>{formatPrice(price, currency)}</>;
};

// Cart Item Component — forwardRef so AnimatePresence can attach its ref
const CartItem = React.forwardRef(({ item, onRemove, onUpdateQuantity, index }, ref) => {
  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="cart-item"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: -100,
        height: 0,
        marginBottom: 0,
        padding: 0,
        overflow: "hidden",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.1,
      }}
      layout
    >
      <div className="cart-item-image-container">
        <img
          src={item.image}
          alt={item.name}
          className="cart-item-image"
          loading="lazy"
        />
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <p className="cart-item-price"><CartItemPrice price={item.price} currency={item.currency} /></p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-selector">
          <button
            className="quantity-btn"
            onClick={() => handleQuantityChange(-1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => handleQuantityChange(1)}
            disabled={item.quantity >= 99}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          className="remove-btn"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
          </svg>
          <span>Remove</span>
        </button>
      </div>
    </motion.div>
  );
});

// Order Summary Component
const OrderSummary = ({ items, onCheckout }) => {
  const { formatPrice, convertAmount } = useCurrency();
  const baseCurrency = items[0]?.currency || "XAF";
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <motion.div
      className="order-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
    >
      <h2 className="summary-title">Order Summary</h2>

      <div className="summary-row">
        <span>
          Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
        </span>
        <span className="summary-value">{formatPrice(subtotal, baseCurrency)}</span>
      </div>

      <div className="summary-divider"></div>

      <div className="summary-row total-row">
        <span>Total</span>
        <span className="total-value">{formatPrice(total, baseCurrency)}</span>
      </div>

      <motion.button
        className="checkout-btn"
        onClick={onCheckout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="checkout-btn-text">Proceed to Checkout</span>
        <span className="checkout-btn-shimmer"></span>
      </motion.button>

      <div className="security-badges">
        <div className="security-badge">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure Checkout
        </div>
        <div className="security-badge">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          All Cards Accepted
        </div>
      </div>
    </motion.div>
  );
};

// Empty Cart Component
const EmptyCart = ({ onContinueShopping }) => (
  <motion.div
    className="empty-cart"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <div className="empty-cart-lottie">
      <Lottie animationData={emptyCartAnimation} loop={true} autoplay={true} />
    </div>
    <h2 className="empty-cart-title">Your cart is looking a bit lonely</h2>
    <p className="empty-cart-message">
      Looks like you haven't added anything yet. Explore our products and find
      something you'll love!
    </p>
    <motion.button
      className="continue-shopping-btn"
      onClick={onContinueShopping}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Start Shopping
    </motion.button>
  </motion.div>
);

// Main CartPage Component
const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleRemoveItem = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    if (item) showToast(`"${item.name}" removed from cart.`, "info");
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const handleCheckout = () => {
    navigate("/payment");
  };

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        {cartItems.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items-section">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </AnimatePresence>
            </div>
            <div className="cart-summary-section">
              <OrderSummary items={cartItems} onCheckout={handleCheckout} />
            </div>
          </div>
        ) : (
          <EmptyCart onContinueShopping={handleContinueShopping} />
        )}
      </div>
    </div>
  );
};

export default CartPage;
