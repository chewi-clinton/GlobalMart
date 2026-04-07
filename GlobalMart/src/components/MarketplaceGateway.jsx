import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import "../styles/MarketplaceGateway.css";
import bag from "../assets/bag.png";
import watch from "../assets/smart_watch.jpg";
import headphone from "../assets/headphone.jpg";
import camera from "../assets/camera.jpg";
import phone from "../assets/smartphone.jpg";
import giftbox from "../assets/giftbox.jpg";

// Same product images from hero section
const productImages = [
  {
    id: 1,
    image: bag,
    name: "Premium Bag",
    price: "$299",
    badge: "Top Seller",
    badgeColor: "#f0c14b",
    seller_tag: "@trendy_finds",
  },
  {
    id: 2,
    image: watch,
    name: "Smart Watch",
    price: "$449",
    badge: "Good Deals",
    badgeColor: "#22c55e",
    seller_tag: "@global_picks",
  },
  {
    id: 3,
    image: headphone,
    name: "Wireless Audio",
    price: "$189",
    badge: "Recommended",
    badgeColor: "#3b82f6",
    seller_tag: null,
  },
  {
    id: 4,
    image: camera,
    name: "Camera Pro",
    price: "$899",
    badge: "Best Value",
    badgeColor: "#a855f7",
    seller_tag: "@tech_hub",
  },
  {
    id: 5,
    image: phone,
    name: "Smartphone X",
    price: "$1,199",
    badge: "Hot Item",
    badgeColor: "#ef4444",
    seller_tag: null,
  },
  {
    id: 6,
    image: giftbox,
    name: "Gift Box",
    price: "$59",
    badge: "New Arrival",
    badgeColor: "#06b6d4",
    seller_tag: "@gift_lovers",
  },
];

// Animation variants for spring effect
const buyerVariants = {
  hidden: { x: -200, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 20,
      mass: 1.2,
    },
  },
};

const sellerVariants = {
  hidden: { x: 200, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 20,
      mass: 1.2,
      delay: 0.1,
    },
  },
};

// Card Fan Component - Playing Card Spread Effect
const CardFan = ({ cards }) => {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const [isSpread, setIsSpread] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-150px" });

  // Scroll-based spread trigger
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(viewportCenter - elementCenter);

      // Spread when element is in view
      if (distanceFromCenter < 300) {
        setIsSpread(true);
      } else if (distanceFromCenter > 500) {
        setIsSpread(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger spread when in view
  useEffect(() => {
    if (isInView) {
      setIsSpread(true);
    }
  }, [isInView]);

  const totalCards = cards.length;
  const centerIndex = (totalCards - 1) / 2;

  // Calculate positions for fan spread
  const calculateCardPosition = (index, isSpreadActive, hovered) => {
    const offset = index - centerIndex;

    // Stacked state - cards slightly overlapping
    const stacked = {
      x: offset * 8,
      y: Math.abs(offset) * 2,
      rotate: offset * 2,
      rotateY: 0,
      scale: 1,
      z: totalCards - Math.abs(offset),
    };

    // Spread state - curved fan like playing cards
    const fanAngle = 60; // Total arc angle
    const angleStep = fanAngle / (totalCards - 1);
    const currentAngle = -30 + index * angleStep; // -30 to 30 degrees

    // Calculate X position - wider spread at edges
    const spreadX = offset * 90;

    // Calculate Y position - creates curved arc (center is highest)
    const normalizedOffset = offset / centerIndex;
    const arcHeight = 40;
    const spreadY = -arcHeight * (1 - normalizedOffset * normalizedOffset) + 30;

    const fanSpread = {
      x: spreadX,
      y: spreadY,
      rotate: currentAngle,
      rotateY: offset * 4,
      scale: hovered ? 1.15 : 1,
      z: hovered ? 100 : index + 1,
    };

    return isSpreadActive ? fanSpread : stacked;
  };

  return (
    <div className="card-fan-container" ref={sectionRef}>
      <div
        ref={containerRef}
        className={`card-fan ${isSpread ? "card-fan--spread" : ""}`}
        onMouseEnter={() => setIsSpread(true)}
      >
        {cards.map((card, index) => {
          const isHovered = hoveredIndex === index;
          const position = calculateCardPosition(index, isSpread, isHovered);

          return (
            <motion.div
              key={card.id}
              className={`card-fan__card ${isHovered ? "card-fan__card--hovered" : ""}`}
              initial={{
                opacity: 0,
                y: 150,
                x: 0,
                rotate: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                x: position.x,
                y: position.y,
                rotate: position.rotate,
                rotateY: position.rotateY,
                scale: position.scale,
                zIndex: position.z,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.8,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transformPerspective: 1000,
              }}
            >
              {/* Badge */}
              <motion.div
                className="card-fan__badge"
                style={{ backgroundColor: card.badgeColor }}
                animate={{
                  scale: isHovered ? 1.12 : isSpread ? 1.02 : 0.95,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                {card.badge}
              </motion.div>

              {/* Seller Tag */}
              {card.seller_tag && (
                <motion.div
                  className="card-fan__seller-tag"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isSpread ? 1 : 0,
                    y: isSpread ? 0 : -10,
                  }}
                  transition={{
                    delay: index * 0.04,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  {card.seller_tag}
                </motion.div>
              )}

              {/* Card Image */}
              <div className="card-fan__image-wrapper">
                <img
                  src={card.image}
                  alt={card.name}
                  className="card-fan__image"
                />
                <div className="card-fan__overlay" />
              </div>

              {/* Card Content */}
              <motion.div
                className="card-fan__content"
                animate={{
                  y: isHovered ? -6 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="card-fan__name">{card.name}</h3>
                <p className="card-fan__price">{card.price}</p>
              </motion.div>

              {/* Card Shine Effect */}
              <motion.div
                className="card-fan__shine"
                animate={{ opacity: isHovered ? 0.7 : 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Card Border Glow */}
              <motion.div
                className="card-fan__glow"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const GlobalMartShowcase = () => {
  const gatewayRef = useRef(null);
  const isGatewayInView = useInView(gatewayRef, {
    once: true,
    margin: "-200px",
  });

  return (
    <section className="showcase">
      {/* SECTION 1: Dual-Path Gateway */}
      <div className="gateway" ref={gatewayRef}>
        <div className="gateway__container">
          {/* Buyer Card */}
          <motion.div
            className="gateway__card gateway__card--buyer"
            variants={buyerVariants}
            initial="hidden"
            animate={isGatewayInView ? "visible" : "hidden"}
          >
            <h2 className="gateway__heading">Find your edge.</h2>
            <p className="gateway__description">
              Discover curated global tech and fashion, handpicked for the
              discerning buyer.
            </p>
            <button className="gateway__button gateway__button--buyer">
              <span>Shop Now</span>
              <FaArrowRight className="gateway__button-icon" />
            </button>
            <div className="gateway__card-decoration gateway__card-decoration--buyer">
              <span className="gateway__dot"></span>
              <span className="gateway__dot"></span>
              <span className="gateway__dot"></span>
            </div>
          </motion.div>

          {/* Seller Card */}
          <motion.div
            className="gateway__card gateway__card--seller"
            variants={sellerVariants}
            initial="hidden"
            animate={isGatewayInView ? "visible" : "hidden"}
          >
            <h2 className="gateway__heading">Build your empire.</h2>
            <p className="gateway__description">
              The easiest way to sell to a global audience. Start your journey
              today.
            </p>
            <button className="gateway__button gateway__button--seller">
              <span>Start Selling</span>
              <FaArrowRight className="gateway__button-icon" />
            </button>
            <div className="gateway__card-decoration gateway__card-decoration--seller">
              <span className="gateway__circle"></span>
              <span className="gateway__circle"></span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 2: Playing Card Fan Showcase */}
      <div className="products">
        <div className="products__container">
          <div className="products__header">
            <motion.span
              className="products__label"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Featured Collection
            </motion.span>
            <motion.h2
              className="products__title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Curated for Excellence
            </motion.h2>
          </div>

          {/* Playing Card Fan */}
          <CardFan cards={productImages} />
        </div>
      </div>
    </section>
  );
};

export default GlobalMartShowcase;
