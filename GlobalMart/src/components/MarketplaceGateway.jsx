import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import "../styles/MarketplaceGateway.css";

// Product images for the perspective stack
const productImages = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    name: "Minimalist Headphones",
    price: "$299",
    category: "Audio",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
    name: "Mechanical Keyboard",
    price: "$189",
    category: "Tech",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    name: "Smart Watch Pro",
    price: "$449",
    category: "Wearables",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1585155770913-5bda89e68e62?w=800&q=80",
    name: "Premium Sunglasses",
    price: "$179",
    category: "Fashion",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1491553895911-0055uj88ea83?w=800&q=80",
    name: "Wireless Speaker",
    price: "$249",
    category: "Audio",
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

const GlobalMartShowcase = () => {
  const gatewayRef = useRef(null);
  const stackRef = useRef(null);
  const isGatewayInView = useInView(gatewayRef, {
    once: true,
    margin: "-200px",
  });
  const [isStackHovered, setIsStackHovered] = useState(false);

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
            <div className="gateway__content">
              <h2 className="gateway__heading">Find your edge.</h2>
              <p className="gateway__subtext">
                Discover curated global tech and fashion, handpicked for the
                discerning buyer.
              </p>
              <button className="gateway__button gateway__button--outline">
                <span>Shop Now</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>

          {/* Seller Card */}
          <motion.div
            className="gateway__card gateway__card--seller"
            variants={sellerVariants}
            initial="hidden"
            animate={isGatewayInView ? "visible" : "hidden"}
          >
            <div className="gateway__content">
              <h2 className="gateway__heading gateway__heading--light">
                Build your empire.
              </h2>
              <p className="gateway__subtext gateway__subtext--light">
                The easiest way to sell to a global audience. Start your journey
                today.
              </p>
              <button className="gateway__button gateway__button--solid">
                <span>Start Selling</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 2: Perspective Stack Product Showcase */}
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
              Best Sellers
            </motion.span>
            <motion.h2
              className="products__title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Top Picks for You
            </motion.h2>
          </div>

          {/* Perspective Stack Container */}
          <div
            className="products__stack-wrapper"
            ref={stackRef}
            onMouseEnter={() => setIsStackHovered(true)}
            onMouseLeave={() => setIsStackHovered(false)}
          >
            <div className="products__stack">
              {productImages.map((product, index) => (
                <div
                  key={product.id}
                  className="stack-card"
                  style={{
                    "--i": index,
                    zIndex: 5 - index,
                  }}
                >
                  {/* Top Seller Badge */}
                  <div className="stack-card__badge">
                    <span>Top Seller</span>
                  </div>

                  {/* Card Image */}
                  <div className="stack-card__image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="stack-card__image"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="stack-card__content">
                    <span className="stack-card__category">
                      {product.category}
                    </span>
                    <h3 className="stack-card__name">{product.name}</h3>
                    <p className="stack-card__price">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalMartShowcase;
