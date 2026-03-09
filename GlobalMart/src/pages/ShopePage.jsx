import React, { useState, useCallback } from "react";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import sorryAnimation from "../assets/sorry.json";
import ProductDetailOverlay from "../components/ProductDetailOverlay";
import "../styles/ShopPage.css";

const allProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones Pro",
    price: 149.99,
    originalPrice: 199.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Tech",
    rating: 4.8,
    reviews: 234,
    brand: "AudioMax",
    topItem: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Midnight Black", hex: "#1a1a1a" },
      { name: "Pearl White", hex: "#f5f5f5" },
      { name: "Rose Gold", hex: "#b76e79" },
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Experience premium audio with our latest wireless headphones. Featuring active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions.",
    features: [
      "Active Noise Cancellation",
      "40-Hour Battery Life",
      "Bluetooth 5.0",
      "Memory Foam Cushions",
      "Built-in Microphone",
    ],
    questions: 12,
    reviewsList: [
      {
        id: 1,
        author: "Alex M.",
        rating: 5,
        date: "2 days ago",
        text: "Absolutely amazing sound quality!",
        verified: true,
      },
      {
        id: 2,
        author: "Sarah K.",
        rating: 4,
        date: "1 week ago",
        text: "Very comfortable for long sessions.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "John D.",
        question: "Compatible with iPhone?",
        answer: "Yes, works with all Bluetooth devices.",
        answered: true,
      },
    ],
  },
  {
    id: 2,
    name: "Premium Leather Crossbody Bag",
    price: 89.99,
    originalPrice: null,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.5,
    reviews: 156,
    brand: "StyleCraft",
    topItem: false,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Tan", hex: "#c8a882" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["One Size"],
    description:
      "Handcrafted from genuine leather with premium stitching. Spacious interior with multiple pockets.",
    features: [
      "Genuine Leather",
      "Adjustable Strap",
      "Multiple Pockets",
      "Magnetic Closure",
    ],
    questions: 5,
    reviewsList: [
      {
        id: 1,
        author: "Emma L.",
        rating: 5,
        date: "3 days ago",
        text: "Beautiful bag, great quality leather.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "Lisa M.",
        question: "What are the dimensions?",
        answer: "30cm x 20cm x 10cm",
        answered: true,
      },
    ],
  },
  {
    id: 3,
    name: "Smart Watch Series X",
    price: 299.99,
    originalPrice: 349.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Tech",
    rating: 4.9,
    reviews: 512,
    brand: "TechPro",
    topItem: true,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Gold", hex: "#ffd700" },
    ],
    sizes: ["40mm", "44mm"],
    description:
      "Track your fitness, stay connected, and look great. Features heart rate monitoring, GPS, and 7-day battery.",
    features: [
      "Heart Rate Monitor",
      "Built-in GPS",
      "7-Day Battery",
      "Water Resistant",
      "Sleep Tracking",
    ],
    questions: 20,
    reviewsList: [
      {
        id: 1,
        author: "Mike R.",
        rating: 5,
        date: "1 week ago",
        text: "Best smartwatch I've ever owned.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "Tom S.",
        question: "Is it waterproof?",
        answer: "Yes, water resistant up to 50m.",
        answered: true,
      },
    ],
  },
  {
    id: 4,
    name: "Minimalist Running Shoes",
    price: 129.99,
    originalPrice: null,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "Sports",
    rating: 4.6,
    reviews: 289,
    brand: "SprintMax",
    topItem: false,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Red", hex: "#cc0000" },
      { name: "Navy", hex: "#001f5b" },
    ],
    sizes: ["7", "8", "9", "10", "11", "12"],
    description:
      "Ultra-lightweight running shoes with responsive cushioning for maximum performance.",
    features: [
      "Lightweight Foam",
      "Breathable Mesh",
      "Non-slip Sole",
      "Reflective Details",
    ],
    questions: 8,
    reviewsList: [
      {
        id: 1,
        author: "Chris P.",
        rating: 5,
        date: "5 days ago",
        text: "Perfect for long runs, very comfortable.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "Dave K.",
        question: "True to size?",
        answer: "Yes, fits true to standard sizing.",
        answered: true,
      },
    ],
  },
  {
    id: 5,
    name: "Designer Sunglasses Collection",
    price: 175.0,
    originalPrice: 220.0,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.4,
    reviews: 98,
    brand: "VisionLux",
    topItem: true,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Tortoise", hex: "#8B6914" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["One Size"],
    description:
      "Premium UV400 polarized lenses with lightweight titanium frames.",
    features: [
      "UV400 Protection",
      "Polarized Lenses",
      "Titanium Frame",
      "Includes Case",
    ],
    questions: 6,
    reviewsList: [
      {
        id: 1,
        author: "Sophie M.",
        rating: 4,
        date: "2 weeks ago",
        text: "Stylish and great UV protection.",
        verified: true,
      },
    ],
    questionsList: [],
  },
  {
    id: 6,
    name: "Portable Bluetooth Speaker",
    price: 79.99,
    originalPrice: null,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "Tech",
    rating: 4.3,
    reviews: 445,
    brand: "SoundWave",
    topItem: false,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "Blue", hex: "#0066cc" },
      { name: "Red", hex: "#cc0000" },
    ],
    sizes: ["One Size"],
    description:
      "360° surround sound with 20-hour battery. Waterproof and drop-resistant.",
    features: [
      "360° Sound",
      "20-Hour Battery",
      "IPX7 Waterproof",
      "Built-in Mic",
      "USB-C Charging",
    ],
    questions: 15,
    reviewsList: [
      {
        id: 1,
        author: "Jake T.",
        rating: 4,
        date: "1 week ago",
        text: "Great sound for the price!",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "Anna B.",
        question: "Can it pair with two phones?",
        answer: "Yes, supports dual pairing.",
        answered: true,
      },
    ],
  },
  {
    id: 7,
    name: "Yoga Mat Premium",
    price: 45.99,
    originalPrice: 59.99,
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
    category: "Sports",
    rating: 4.7,
    reviews: 678,
    brand: "FitLife",
    topItem: false,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Purple", hex: "#6b21a8" },
      { name: "Teal", hex: "#0d9488" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["Standard", "XL"],
    description:
      "Eco-friendly non-slip yoga mat with alignment lines. 6mm thick for joint support.",
    features: [
      "Non-slip Surface",
      "6mm Thickness",
      "Eco-friendly Material",
      "Carrying Strap",
      "Alignment Lines",
    ],
    questions: 9,
    reviewsList: [
      {
        id: 1,
        author: "Yoga Fan",
        rating: 5,
        date: "3 days ago",
        text: "Best mat I've used, great grip.",
        verified: true,
      },
    ],
    questionsList: [],
  },
  {
    id: 8,
    name: "Vintage Denim Jacket",
    price: 125.0,
    originalPrice: null,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.5,
    reviews: 234,
    brand: "StyleCraft",
    topItem: true,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Light Wash", hex: "#9eb8d9" },
      { name: "Dark Wash", hex: "#2d3f5e" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Classic vintage-inspired denim jacket with distressed detailing. 100% cotton.",
    features: [
      "100% Cotton",
      "Distressed Detail",
      "Button Front",
      "Chest Pockets",
      "Machine Washable",
    ],
    questions: 7,
    reviewsList: [
      {
        id: 1,
        author: "Retro Fan",
        rating: 5,
        date: "4 days ago",
        text: "Perfect vintage look, great quality.",
        verified: true,
      },
    ],
    questionsList: [],
  },
  {
    id: 9,
    name: "Wireless Charging Pad",
    price: 34.99,
    originalPrice: 44.99,
    image:
      "https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=400&h=400&fit=crop",
    category: "Tech",
    rating: 4.2,
    reviews: 892,
    brand: "TechPro",
    topItem: false,
    images: [
      "https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["One Size"],
    description:
      "15W fast wireless charging pad compatible with all Qi-enabled devices.",
    features: [
      "15W Fast Charge",
      "Qi Compatible",
      "LED Indicator",
      "Anti-slip Base",
      "Foreign Object Detection",
    ],
    questions: 18,
    reviewsList: [
      {
        id: 1,
        author: "Tech Guy",
        rating: 4,
        date: "6 days ago",
        text: "Works perfectly with my iPhone.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "Penny L.",
        question: "Works with Samsung?",
        answer: "Yes, compatible with all Qi devices.",
        answered: true,
      },
    ],
  },
  {
    id: 10,
    name: "Professional Running Tights",
    price: 69.99,
    originalPrice: null,
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop",
    category: "Sports",
    rating: 4.8,
    reviews: 345,
    brand: "SprintMax",
    topItem: true,
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "Navy", hex: "#001f5b" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Compression running tights with moisture-wicking fabric and reflective details.",
    features: [
      "Compression Fit",
      "Moisture-wicking",
      "Reflective Details",
      "Hidden Pocket",
      "4-way Stretch",
    ],
    questions: 11,
    reviewsList: [
      {
        id: 1,
        author: "Runner Pro",
        rating: 5,
        date: "2 days ago",
        text: "Great compression, very comfortable.",
        verified: true,
      },
    ],
    questionsList: [],
  },
  {
    id: 11,
    name: "Canvas Backpack Pro",
    price: 79.99,
    originalPrice: 99.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Fashion",
    rating: 4.6,
    reviews: 567,
    brand: "TravelGear",
    topItem: false,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "Khaki", hex: "#c3b091" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Olive", hex: "#6b7c2d" },
    ],
    sizes: ["One Size"],
    description:
      "Durable canvas backpack with laptop compartment and ergonomic shoulder straps.",
    features: [
      '15" Laptop Compartment',
      "Water Resistant",
      "USB Charging Port",
      "Ergonomic Straps",
      "Multiple Pockets",
    ],
    questions: 14,
    reviewsList: [
      {
        id: 1,
        author: "Traveler",
        rating: 5,
        date: "1 week ago",
        text: "Perfect for travel and daily use.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "Sam R.",
        question: "Fits 15 inch laptop?",
        answer: "Yes, fits up to 15.6 inch laptops.",
        answered: true,
      },
    ],
  },
  {
    id: 12,
    name: "Smart Home Hub",
    price: 149.99,
    originalPrice: null,
    image:
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop",
    category: "Tech",
    rating: 4.4,
    reviews: 223,
    brand: "SmartLife",
    topItem: true,
    images: [
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=600&fit=crop",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["One Size"],
    description:
      "Control all your smart home devices from one hub. Compatible with Alexa, Google Home, and Apple HomeKit.",
    features: [
      "Alexa Compatible",
      "Google Home Compatible",
      "Apple HomeKit",
      "Zigbee & Z-Wave",
      "App Control",
    ],
    questions: 25,
    reviewsList: [
      {
        id: 1,
        author: "Smart Home Fan",
        rating: 4,
        date: "3 days ago",
        text: "Easy setup, works great with all my devices.",
        verified: true,
      },
    ],
    questionsList: [
      {
        id: 1,
        author: "New User",
        question: "Works with Philips Hue?",
        answer: "Yes, fully compatible.",
        answered: true,
      },
    ],
  },
];

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
        <svg key={i} className="star filled" viewBox="0 0 24 24" fill="#ff9900">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className="star half" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`hg-${rating}-${i}`}>
              <stop offset="50%" stopColor="#ff9900" />
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
          fill={wished ? "#ff9900" : "none"}
          stroke={wished ? "#ff9900" : "#fff"}
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
};

// Product Card — clicks open overlay
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
  const [activeCategory, setActiveCategory] = useState("All");
  const [filters, setFilters] = useState({
    priceRange: [0, 400],
    brands: [],
    rating: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setOverlayOpen(true);
  }, []);

  const handleOverlayClose = useCallback(() => {
    setOverlayOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

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

      {/* Product Detail Overlay — renders as modal over the shop */}
      {selectedProduct && (
        <ProductDetailOverlay
          isOpen={overlayOpen}
          onClose={handleOverlayClose}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ShopPage;
