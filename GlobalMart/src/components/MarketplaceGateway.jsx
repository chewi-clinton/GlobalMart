import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import "../styles/MarketplaceGateway.css";
import { getProducts } from "../api";

const BADGE_PRESETS = [
  { label: "Top Seller",   color: "#f0c14b" },
  { label: "Good Deals",   color: "#22c55e" },
  { label: "Recommended",  color: "#3b82f6" },
  { label: "Best Value",   color: "#a855f7" },
  { label: "Hot Item",     color: "#ef4444" },
  { label: "New Arrival",  color: "#06b6d4" },
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
  const isGatewayInView = useInView(gatewayRef, { once: true, margin: "-200px" });
  const [featuredCards, setFeaturedCards] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getProducts();
        if (!Array.isArray(data)) return;
        const cards = data.slice(0, 6).map((p, i) => ({
          id: p.product_id,
          image: p.primary_image || "https://placehold.co/300x400?text=No+Image",
          name: p.title,
          price: `${p.currency_code || "XAF"} ${parseFloat(p.base_price).toLocaleString()}`,
          badge: BADGE_PRESETS[i % BADGE_PRESETS.length].label,
          badgeColor: BADGE_PRESETS[i % BADGE_PRESETS.length].color,
          seller_tag: null,
        }));
        setFeaturedCards(cards);
      } catch (err) {
        console.error("MarketplaceGateway fetch error:", err);
      }
    };
    fetchFeatured();
  }, []);

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
          {featuredCards.length > 0 && <CardFan cards={featuredCards} />}
        </div>
      </div>
    </section>
  );
};

export default GlobalMartShowcase;
