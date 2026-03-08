import React from "react";
import "../styles/HeroSection.css";

// Import images - update paths to match your project
import bag from "../assets/bag.png";
import watch from "../assets/smart_watch.jpg";
import headphone from "../assets/headphone.jpg";
import camera from "../assets/camera.jpg";
import phone from "../assets/smartphone.jpg";
import giftbox from "../assets/giftbox.jpg";

const GlobalMartHero = () => {
  const products = [
    {
      id: 1,
      image: bag,
      seller_tag: "@trendy_finds",
      product_name: "Premium Bag",
    },
    {
      id: 2,
      image: watch,
      seller_tag: "@global_picks",
      product_name: "Smart Watch",
    },
    {
      id: 3,
      image: headphone,
      seller_tag: null,
      product_name: "Wireless Audio",
    },
    {
      id: 4,
      image: camera,
      seller_tag: "@tech_hub",
      product_name: "Camera Pro",
    },
    {
      id: 5,
      image: phone,
      seller_tag: null,
      product_name: "Smartphone X",
    },
    {
      id: 6,
      image: giftbox,
      seller_tag: "@seller_1",
      product_name: "Gift Box",
    },
  ];

  return (
    <section className="hero">
      {/* Animated Background Elements */}
      <div className="hero__bg-orb hero__bg-orb--1"></div>
      <div className="hero__bg-orb hero__bg-orb--2"></div>
      <div className="hero__bg-orb hero__bg-orb--3"></div>

      <div className="hero__content">
        {/* Hero Text */}
        <div className="hero__text">
          <h1 className="hero__title">
            A place to buy your next{" "}
            <span className="hero__title--accent">global find</span>
          </h1>
          <p className="hero__subtitle">
            Discover unique products from trusted sellers worldwide
          </p>
        </div>

        {/* Product Cards */}
        <div className="hero__cards-wrapper">
          <div className="hero__cards-container">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="hero__card"
                style={{
                  "--card-index": index,
                  "--total-cards": products.length,
                }}
              >
                {/* Seller Tag */}
                {product.seller_tag && (
                  <span className="hero__card-tag">{product.seller_tag}</span>
                )}

                {/* Image */}
                <div className="hero__card-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.product_name}
                    className="hero__card-image"
                  />
                  <div className="hero__card-image-overlay"></div>
                </div>

                {/* Card Content */}
                <div className="hero__card-inner">
                  <p className="hero__card-name">{product.product_name}</p>
                </div>

                {/* Shine Effect */}
                <div className="hero__card-shine"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop Now Button */}
        <div className="hero__button-wrapper">
          <button className="hero__button">
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
            <span className="hero__button-glow"></span>
            <span className="hero__button-particles">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="hero__decoration hero__decoration--1"></div>
        <div className="hero__decoration hero__decoration--2"></div>
        <div className="hero__decoration hero__decoration--3"></div>
      </div>
    </section>
  );
};

export default GlobalMartHero;
