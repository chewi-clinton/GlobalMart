import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import "../styles/HeroSection.css";
import ProductDetailOverlay from "../components/ProductDetailOverlay";

import bag from "../assets/bag.png";
import watch from "../assets/smart_watch.jpg";
import headphone from "../assets/headphone.jpg";
import camera from "../assets/camera.jpg";
import phone from "../assets/smartphone.jpg";
import giftbox from "../assets/giftbox.jpg";

const products = [
  {
    id: 1,
    image: bag,
    seller_tag: "@trendy_finds",
    product_name: "Premium Bag",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.6,
    reviews: 142,
    brand: "StyleCraft",
    colors: [
      { name: "Tan", hex: "#c8a882" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["One Size"],
    description: "Handcrafted genuine leather bag.",
    features: ["Genuine Leather", "Adjustable Strap", "Multiple Pockets"],
    questions: 5,
    reviewsList: [
      {
        id: 1,
        author: "Emma L.",
        rating: 5,
        date: "3 days ago",
        text: "Beautiful quality!",
        verified: true,
      },
    ],
    questionsList: [],
    images: [bag],
  },
  {
    id: 2,
    image: watch,
    seller_tag: "@global_picks",
    product_name: "Smart Watch",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    reviews: 512,
    brand: "TechPro",
    colors: [
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    sizes: ["40mm", "44mm"],
    description: "Track fitness, stay connected.",
    features: ["Heart Rate Monitor", "Built-in GPS", "7-Day Battery"],
    questions: 20,
    reviewsList: [
      {
        id: 1,
        author: "Mike R.",
        rating: 5,
        date: "1 week ago",
        text: "Best smartwatch ever.",
        verified: true,
      },
    ],
    questionsList: [],
    images: [watch],
  },
  {
    id: 3,
    image: headphone,
    seller_tag: null,
    product_name: "Wireless Audio",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviews: 234,
    brand: "AudioMax",
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "White", hex: "#f5f5f5" },
    ],
    sizes: ["One Size"],
    description: "40-hour battery, active noise cancellation.",
    features: ["ANC", "Bluetooth 5.0", "Memory Foam"],
    questions: 12,
    reviewsList: [
      {
        id: 1,
        author: "Alex M.",
        rating: 5,
        date: "2 days ago",
        text: "Amazing sound!",
        verified: true,
      },
    ],
    questionsList: [],
    images: [headphone],
  },
  {
    id: 4,
    image: camera,
    seller_tag: "@tech_hub",
    product_name: "Camera Pro",
    price: 599.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 98,
    brand: "OpticGear",
    colors: [{ name: "Black", hex: "#1a1a1a" }],
    sizes: ["One Size"],
    description: "Professional mirrorless camera.",
    features: ["4K Video", "24MP Sensor", "5-Axis Stabilization"],
    questions: 8,
    reviewsList: [
      {
        id: 1,
        author: "Sam P.",
        rating: 5,
        date: "5 days ago",
        text: "Incredible image quality.",
        verified: true,
      },
    ],
    questionsList: [],
    images: [camera],
  },
  {
    id: 5,
    image: phone,
    seller_tag: null,
    product_name: "Smartphone X",
    price: 999.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 876,
    brand: "TechPro",
    colors: [
      { name: "Midnight", hex: "#1a1a2e" },
      { name: "Silver", hex: "#c0c0c0" },
    ],
    sizes: ["One Size"],
    description: "Flagship performance in a slim design.",
    features: ["120Hz Display", "5G Ready", "All-day Battery"],
    questions: 30,
    reviewsList: [
      {
        id: 1,
        author: "Priya K.",
        rating: 5,
        date: "1 day ago",
        text: "Absolutely love this phone.",
        verified: true,
      },
    ],
    questionsList: [],
    images: [phone],
  },
  {
    id: 6,
    image: giftbox,
    seller_tag: "@seller_1",
    product_name: "Gift Box",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.5,
    reviews: 320,
    brand: "GiftCo",
    colors: [
      { name: "Gold", hex: "#ffd700" },
      { name: "Red", hex: "#cc0000" },
    ],
    sizes: ["S", "M", "L"],
    description: "Curated gift box for every occasion.",
    features: ["Custom Message", "Premium Wrapping", "Next-Day Delivery"],
    questions: 6,
    reviewsList: [
      {
        id: 1,
        author: "Chris T.",
        rating: 5,
        date: "4 days ago",
        text: "Perfect gift, loved it!",
        verified: true,
      },
    ],
    questionsList: [],
    images: [giftbox],
  },
];

// ─── Orbital config ───────────────────────────────────────────────────────────
const TOTAL = products.length;
const RADIUS = 220;
const CARDSIZE = 190;
const DURATION = 14;

// Threshold: how close to the top of orbit (0.75 in normalized units) to show tag
const TOP_THRESHOLD = 0.08; // ±8% of orbit ≈ ±29° arc

function getPathOffset(index) {
  return index / TOTAL;
}

// Ghost card inside last card to make the loop seamless
function SquareWithOffset({ index, parentIndex, cardSize, radius }) {
  const offset = useMotionValue(0);
  useEffect(() => {
    const c = animate(offset, 1, {
      repeat: Infinity,
      repeatType: "loop",
      ease: [0.42, 0, 0.58, 1],
      duration: DURATION,
    });
    return () => c.stop();
  }, [offset]);
  const x = useTransform(offset, (v) => {
    const a1 = ((getPathOffset(index) + v) % 1) * Math.PI * 2;
    const a2 = ((getPathOffset(parentIndex) + v) % 1) * Math.PI * 2;
    return Math.cos(a1) * radius - Math.cos(a2) * radius;
  });
  const y = useTransform(offset, (v) => {
    const a1 = ((getPathOffset(index) + v) % 1) * Math.PI * 2;
    const a2 = ((getPathOffset(parentIndex) + v) % 1) * Math.PI * 2;
    return Math.sin(a1) * radius - Math.sin(a2) * radius;
  });
  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        overflow: "hidden",
        x,
        y,
      }}
    >
      <img
        src={products[index].image}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </motion.div>
  );
}

// Individual orbiting card — reuses existing .hero__card styles exactly
function OrbitalCard({
  product,
  index,
  cardSize,
  radius,
  isLast,
  onCardClick,
}) {
  const pathOffset = useMotionValue(getPathOffset(index));
  const [tagVisible, setTagVisible] = useState(false);

  useEffect(() => {
    const c = animate(pathOffset, pathOffset.get() + 1, {
      repeat: Infinity,
      repeatType: "loop",
      ease: [0.42, 0, 0.58, 1],
      duration: DURATION,
    });
    return () => c.stop();
  }, [pathOffset]);

  // Subscribe to pathOffset changes — show tag only when card is near the top (0.75)
  useEffect(() => {
    if (!product.seller_tag) return;
    const unsubscribe = pathOffset.on("change", (v) => {
      const normalized = ((v % 1) + 1) % 1;
      let distFromTop = Math.abs(normalized - 0.75);
      if (distFromTop > 0.5) distFromTop = 1 - distFromTop;
      setTagVisible(distFromTop < TOP_THRESHOLD);
    });
    return unsubscribe;
  }, [pathOffset, product.seller_tag]);

  const x = useTransform(
    pathOffset,
    (v) => Math.cos((v % 1) * Math.PI * 2) * radius,
  );
  const y = useTransform(
    pathOffset,
    (v) => Math.sin((v % 1) * Math.PI * 2) * radius,
  );

  return (
    <motion.div
      className="hero__card"
      onClick={() => onCardClick(product)}
      style={{
        position: "absolute",
        width: cardSize,
        height: cardSize * 1.26,
        left: `calc(50% - ${cardSize / 2}px)`,
        top: `calc(50% - ${cardSize * 0.63}px)`,
        x,
        y,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.9, delay: index * 0.12 + 0.3 },
        scale: { duration: 0.9, delay: index * 0.12 + 0.3 },
      }}
    >
      {/* Seller tag — only visible when card reaches the top of its orbit */}
      {product.seller_tag && (
        <span
          className="hero__card-tag"
          style={{
            opacity: tagVisible ? 1 : 0,
            transform: tagVisible
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(-8px)",
          }}
        >
          {product.seller_tag}
        </span>
      )}

      <div className="hero__card-image-wrapper">
        <img
          src={product.image}
          alt={product.product_name}
          className="hero__card-image"
        />
        <div className="hero__card-image-overlay" />
      </div>
      <div className="hero__card-inner">
        <p className="hero__card-name">{product.product_name}</p>
        <p className="hero__card-price">${product.price.toFixed(2)}</p>
      </div>
      <div className="hero__card-shine" />

      {/* Seamless-loop ghost — only on last card */}
      {isLast && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SquareWithOffset
            index={0}
            parentIndex={TOTAL - 1}
            cardSize={cardSize}
            radius={radius}
          />
        </div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const GlobalMartHero = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const [dims, setDims] = useState({
    cardSize: CARDSIZE,
    radius: RADIUS,
    arenaSize: 660,
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setDims({ cardSize: 95, radius: 135, arenaSize: 350 });
      else if (w < 700) setDims({ cardSize: 120, radius: 170, arenaSize: 440 });
      else if (w < 1024)
        setDims({ cardSize: 150, radius: 200, arenaSize: 530 });
      else setDims({ cardSize: CARDSIZE, radius: RADIUS, arenaSize: 660 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleCardClick = (p) => {
    setSelectedProduct(p);
    setOverlayOpen(true);
  };
  const handleOverlayClose = () => {
    setOverlayOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <section className="hero">
      <div className="hero__bg-orb hero__bg-orb--1" />
      <div className="hero__bg-orb hero__bg-orb--2" />
      <div className="hero__bg-orb hero__bg-orb--3" />

      <div className="hero__content">
        {/* Hero Text — unchanged */}
        <div className="hero__text">
          <h1 className="hero__title">
            Discover unique products from{" "}
            <span className="hero__title--accent">
              trusted sellers worldwide
            </span>
          </h1>
          <p className="hero__subtitle">
            Explore exclusive finds from global creators you can trust
          </p>
        </div>

        {/* ── Orbital arena replaces marquee ── */}
        <div
          className="hero__marquee-section"
          style={{ overflow: "visible", padding: "40px 0 48px" }}
        >
          <div
            style={{
              position: "relative",
              width: dims.arenaSize,
              height: dims.arenaSize,
              margin: "0 auto",
            }}
          >
            {products.map((product, index) => (
              <OrbitalCard
                key={product.id}
                product={product}
                index={index}
                cardSize={dims.cardSize}
                radius={dims.radius}
                isLast={index === TOTAL - 1}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* CTA Button — unchanged */}
        <div className="hero__button-wrapper">
          <button
            className="hero__button"
            onClick={() => (window.location.href = "/shop")}
          >
            <span className="hero__button-text">Shop Now</span>
            <span className="hero__button-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailOverlay
          isOpen={overlayOpen}
          onClose={handleOverlayClose}
          product={selectedProduct}
        />
      )}
    </section>
  );
};

export default GlobalMartHero;
