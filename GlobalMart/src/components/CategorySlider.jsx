import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import "../styles/CategorySlider.css";

// Category data with high-quality images
const categories = [
  {
    id: 1,
    name: "Tech",
    subtitle: "Innovation at your fingertips",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    productCount: "2,450+ Products",
  },
  {
    id: 2,
    name: "Fashion",
    subtitle: "Style that speaks volumes",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
    productCount: "3,800+ Products",
  },
  {
    id: 3,
    name: "Home",
    subtitle: "Transform your living space",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
    productCount: "1,920+ Products",
  },
  {
    id: 4,
    name: "Beauty",
    subtitle: "Radiance redefined",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
    productCount: "1,650+ Products",
  },
];

// 3D Tilt Card Component
const CategoryCard = ({ category, isActive, onHover, onLeave, index }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current || !isActive) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -5;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    onLeave();
  };

  return (
    <motion.div
      ref={cardRef}
      className={`category-card ${isActive ? "category-card--active" : ""}`}
      initial={{ flex: 1 }}
      animate={{
        flex: isActive ? 5 : 1,
      }}
      transition={{
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
      }}
      onMouseEnter={() => onHover(category.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image with 3D Tilt */}
      <motion.div
        className="category-card__image-container"
        animate={{
          scale: isActive ? 1.1 : 1,
          rotateX: isActive ? tilt.x : 0,
          rotateY: isActive ? tilt.y : 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        style={{
          transformPerspective: 1000,
          transformOrigin: "center center",
        }}
      >
        <img
          src={category.image}
          alt={category.name}
          className="category-card__image"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="category-card__overlay" />

      {/* Content Container */}
      <div className="category-card__content">
        {/* Vertical Title (shown when collapsed) */}
        <motion.span
          className="category-card__title-vertical"
          initial={{ opacity: 1 }}
          animate={{
            opacity: isActive ? 0 : 1,
            x: isActive ? -20 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {category.name}
        </motion.span>

        {/* Expanded Content */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="category-card__expanded-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{
                duration: 0.4,
                delay: 0.15,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              <motion.h2
                className="category-card__title"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {category.name}
              </motion.h2>

              <motion.p
                className="category-card__subtitle"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {category.subtitle}
              </motion.p>

              <motion.span
                className="category-card__count"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {category.productCount}
              </motion.span>

              <motion.button
                className="category-card__button"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Explore</span>
                <FaArrowRight />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="category-card__decoration"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />

      {/* Card Border Glow */}
      <motion.div
        className="category-card__glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};

const CategorySlider = () => {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <section className="category-slider">
      <div className="category-slider__container">
        {/* Section Header */}
        <motion.div
          className="category-slider__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="category-slider__label">Browse by Category</span>
          <h2 className="category-slider__title">Find What You Love</h2>
        </motion.div>

        {/* Category Cards Container */}
        <motion.div
          className="category-slider__cards"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              isActive={activeCard === category.id}
              onHover={setActiveCard}
              onLeave={() => setActiveCard(null)}
              index={index}
            />
          ))}
        </motion.div>

        {/* Bottom Hint */}
        <motion.p
          className="category-slider__hint"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Hover over a category to explore
        </motion.p>
      </div>
    </section>
  );
};

export default CategorySlider;
