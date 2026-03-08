import React, { useState } from "react";
import "../styles/HeroSection.css";

// For Vite - Use import.meta.url to get proper asset URLs
// Make sure your images are in src/assets folder

// Fallback placeholder images if local images fail to load
const placeholderImages = {
  bag: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='220' viewBox='0 0 180 220'%3E%3Crect fill='%23f5f5f5' width='180' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='14'%3EPremium Bag%3C/text%3E%3C/svg%3E",
  watch:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='220' viewBox='0 0 180 220'%3E%3Crect fill='%23f5f5f5' width='180' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='14'%3ESmart Watch%3C/text%3E%3C/svg%3E",
  headphone:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='220' viewBox='0 0 180 220'%3E%3Crect fill='%23f5f5f5' width='180' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='14'%3EWireless Audio%3C/text%3E%3C/svg%3E",
  camera:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='220' viewBox='0 0 180 220'%3E%3Crect fill='%23f5f5f5' width='180' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='14'%3ECamera Pro%3C/text%3E%3C/svg%3E",
  phone:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='220' viewBox='0 0 180 220'%3E%3Crect fill='%23f5f5f5' width='180' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='14'%3ESmartphone X%3C/text%3E%3C/svg%3E",
  giftbox:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='220' viewBox='0 0 180 220'%3E%3Crect fill='%23f5f5f5' width='180' height='220'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='14'%3EGift Box%3C/text%3E%3C/svg%3E",
};

// Try to import images, use fallbacks if they fail
let bagImg, watchImg, headphoneImg, cameraImg, phoneImg, giftboxImg;

// Method 1: Try direct imports (works in most Vite setups)
try {
  bagImg = new URL("../assets/bag.png", import.meta.url).href;
} catch {
  bagImg = placeholderImages.bag;
}

try {
  watchImg = new URL("../assets/smart_watch.jpg", import.meta.url).href;
} catch {
  watchImg = placeholderImages.watch;
}

try {
  headphoneImg = new URL("../assets/headphone.jpg", import.meta.url).href;
} catch {
  headphoneImg = placeholderImages.headphone;
}

try {
  cameraImg = new URL("../assets/camera.jpg", import.meta.url).href;
} catch {
  cameraImg = placeholderImages.camera;
}

try {
  phoneImg = new URL("../assets/smartphone.jpg", import.meta.url).href;
} catch {
  phoneImg = placeholderImages.phone;
}

try {
  giftboxImg = new URL("../assets/giftbox.jpg", import.meta.url).href;
} catch {
  giftboxImg = placeholderImages.giftbox;
}

const GlobalMartHero = () => {
  const [imageErrors, setImageErrors] = useState({});

  const products = [
    {
      id: 1,
      image: bagImg,
      seller_tag: "@trendy_finds",
      product_name: "Premium Bag",
    },
    {
      id: 2,
      image: watchImg,
      seller_tag: "@global_picks",
      product_name: "Smart Watch",
    },
    {
      id: 3,
      image: headphoneImg,
      seller_tag: null,
      product_name: "Wireless Audio",
    },
    {
      id: 4,
      image: cameraImg,
      seller_tag: "@tech_hub",
      product_name: "Camera Pro",
    },
    {
      id: 5,
      image: phoneImg,
      seller_tag: null,
      product_name: "Smartphone X",
    },
    {
      id: 6,
      image: giftboxImg,
      seller_tag: "@seller_1",
      product_name: "Gift Box",
    },
  ];

  const handleImageError = (productId, productName) => {
    console.error(`Failed to load image for: ${productName}`);
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  // Debug: Log image URLs
  console.log("Image URLs:", {
    bag: bagImg,
    watch: watchImg,
    headphone: headphoneImg,
    camera: cameraImg,
    phone: phoneImg,
    giftbox: giftboxImg,
  });

  return (
    <section className="hero">
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
                    src={
                      imageErrors[product.id]
                        ? placeholderImages[
                            product.product_name.toLowerCase().replace(" ", "")
                          ] || placeholderImages.bag
                        : product.image
                    }
                    alt={product.product_name}
                    className="hero__card-image"
                    onError={() =>
                      handleImageError(product.id, product.product_name)
                    }
                    loading="lazy"
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

        {/* Decorative Elements */}
        <div className="hero__decoration hero__decoration--1"></div>
        <div className="hero__decoration hero__decoration--2"></div>
        <div className="hero__decoration hero__decoration--3"></div>
      </div>
    </section>
  );
};

export default GlobalMartHero;
