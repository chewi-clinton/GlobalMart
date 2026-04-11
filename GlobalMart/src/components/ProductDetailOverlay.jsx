import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/ProductDetailOverlay.css";

const ArrowLeftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={filled ? "#f0c14b" : "none"}
    stroke={filled ? "#f0c14b" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill={filled ? "#f0c14b" : "#e0e0e0"}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    stars.push(
      <StarIcon
        key={i}
        filled={i < fullStars || (i === fullStars && hasHalfStar)}
      />,
    );
  }
  return <div className="star-rating">{stars}</div>;
};

const DetailsTab = ({ product }) => (
  <motion.div
    className="tab-content"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18 }}
  >
    <p className="product-description">{product.description}</p>
    <div className="features-section">
      <h4 className="features-title">Key Features</h4>
      <ul className="features-list">
        {product.features.map((f, i) => (
          <li key={i} className="feature-item">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const ReviewsTab = ({ product }) => (
  <motion.div
    className="tab-content"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18 }}
  >
    <div className="reviews-summary">
      <div className="rating-big">{product.rating}</div>
      <div className="rating-meta">
        <StarRating rating={product.rating} />
        <span className="total-reviews">{product.reviews} reviews</span>
      </div>
    </div>
    <div className="reviews-list">
      {product.reviewsList.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="reviewer-info">
              <span className="reviewer-name">{review.author}</span>
              {review.verified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            <span className="review-date">{review.date}</span>
          </div>
          <StarRating rating={review.rating} />
          <p className="review-text">{review.text}</p>
        </div>
      ))}
    </div>
    <button className="see-all-btn">See All {product.reviews} Reviews</button>
  </motion.div>
);

const QuestionsTab = ({ product }) => (
  <motion.div
    className="tab-content"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18 }}
  >
    <div className="questions-list">
      {product.questionsList.map((q) => (
        <div key={q.id} className="question-item">
          <p className="question-text">
            <strong>Q:</strong> {q.question}
          </p>
          {q.answered && q.answer ? (
            <div className="answer-container">
              <span className="answer-label">Answer</span>
              <p className="answer-text">{q.answer}</p>
            </div>
          ) : (
            <span className="pending-answer">Awaiting answer…</span>
          )}
        </div>
      ))}
    </div>
    <button className="ask-question-btn">+ Ask a Question</button>
  </motion.div>
);

const sampleProduct = {
  id: 1,
  name: "Premium Wireless Bluetooth Headphones Pro",
  price: 119.99,
  originalPrice: 139.99,
  image:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
  ],
  rating: 4.8,
  reviews: 234,
  questions: 18,
  topItem: true,
  colors: [
    { name: "Midnight Black", hex: "#1a1a1a" },
    { name: "Pearl White", hex: "#f5f5f5" },
    { name: "Rose Gold", hex: "#b76e79" },
    { name: "Ocean Blue", hex: "#0066cc" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  description:
    "Experience premium audio with our latest wireless headphones. Featuring active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions.",
  features: [
    "Active Noise Cancellation",
    "40-Hour Battery Life",
    "Bluetooth 5.0",
    "Memory Foam Cushions",
    "Built-in Microphone",
    "Foldable Design",
  ],
  reviewsList: [
    {
      id: 1,
      author: "Alex M.",
      rating: 5,
      date: "2 days ago",
      text: "Absolutely amazing sound quality! The noise cancellation is top-notch.",
      verified: true,
    },
    {
      id: 2,
      author: "Sarah K.",
      rating: 4,
      date: "1 week ago",
      text: "Great headphones, very comfortable for long sessions.",
      verified: true,
    },
    {
      id: 3,
      author: "Mike R.",
      rating: 5,
      date: "2 weeks ago",
      text: "Best purchase I've made this year.",
      verified: false,
    },
  ],
  questionsList: [
    {
      id: 1,
      author: "John D.",
      question: "Is this compatible with iPhone?",
      answer: "Yes, works with all Bluetooth-enabled devices.",
      answered: true,
    },
    {
      id: 2,
      author: "Emily S.",
      question: "How long does shipping take?",
      answer: null,
      answered: false,
    },
  ],
};

const ProductDetailOverlay = ({ isOpen, onClose, product = sampleProduct }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    alert(
      `Added!\n${product.name}\nColor: ${selectedColor.name} | Size: ${selectedSize}`,
    );
  }, [product, selectedColor, selectedSize]);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "reviews", label: `Reviews (${product.reviews})` },
    { id: "questions", label: `Q&A (${product.questions})` },
  ];

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="overlay-modal"
            initial={{ scale: 0.93, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT PANEL ── */}
            <div className="panel-left">
              {/* Back button */}
              <button
                className="btn-icon btn-back"
                onClick={onClose}
                aria-label="Close"
              >
                <ArrowLeftIcon />
              </button>

              {/* Main image */}
              <div className="main-image-wrap">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="main-image"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>
                {product.topItem && (
                  <span className="badge-top">⭐ Top Item</span>
                )}
                {discount && (
                  <span className="badge-discount">-{discount}%</span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="thumbnail-row">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb ${currentImageIndex === i ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="panel-right">
              {/* Wishlist */}
              <button
                className={`btn-icon btn-wish ${isWishlisted ? "wished" : ""}`}
                onClick={() => setIsWishlisted((w) => !w)}
                aria-label="Wishlist"
              >
                <HeartIcon filled={isWishlisted} />
              </button>

              {/* Scrollable content */}
              <div className="panel-right-scroll">
                {/* Title + rating */}
                <div className="product-header">
                  <div className="product-brand">
                    {product.brand || "GlobalMart"}
                  </div>
                  <h2 className="product-title">{product.name}</h2>
                  <div className="rating-row">
                    <StarRating rating={product.rating} />
                    <span className="rating-val">{product.rating}</span>
                    <span className="rating-sep">·</span>
                    <span className="rating-count">
                      {product.reviews} reviews
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="tab-nav">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
                      onClick={() => setActiveTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="tab-content-wrap">
                  <AnimatePresence mode="wait">
                    {activeTab === "details" && (
                      <DetailsTab key="d" product={product} />
                    )}
                    {activeTab === "reviews" && (
                      <ReviewsTab key="r" product={product} />
                    )}
                    {activeTab === "questions" && (
                      <QuestionsTab key="q" product={product} />
                    )}
                  </AnimatePresence>
                </div>

                {/* Color picker */}
                <div className="option-section">
                  <div className="option-label">
                    Color{" "}
                    <span className="option-value">{selectedColor.name}</span>
                  </div>
                  <div className="color-row">
                    {product.colors.map((c) => (
                      <button
                        key={c.hex}
                        className={`color-dot ${selectedColor.hex === c.hex ? "active" : ""}`}
                        style={{ background: c.hex }}
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                      >
                        {selectedColor.hex === c.hex && (
                          <motion.span
                            className="color-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckIcon />
                          </motion.span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size picker */}
                <div className="option-section">
                  <div className="option-label">
                    Size{" "}
                    {selectedSize && (
                      <span className="option-value">{selectedSize}</span>
                    )}
                  </div>
                  <div className="size-row">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        className={`size-chip ${selectedSize === s ? "active" : ""}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* end scroll */}

              {/* Sticky footer */}
              <div className="panel-footer">
                <div className="price-block">
                  {product.originalPrice && (
                    <span className="price-original">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="price-current">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <motion.button
                  className="btn-cart"
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShoppingBagIcon />
                  Add to Cart
                </motion.button>
              </div>
            </div>
            {/* end right panel */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailOverlay;
