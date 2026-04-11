import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../styles/HeroSection.css";

import hero1 from "../assets/Hero_img_1.jpeg";
import hero2 from "../assets/Hero_img_2.jpg";
import hero3 from "../assets/Hero_img_3.jpg";
import hero4 from "../assets/Hero_img_4.jpg";
import hero5 from "../assets/Hero_img_5.jpg";
import hero6 from "../assets/Hero_img_6.jpg";

const heroBanners = [hero1, hero2, hero3, hero4, hero5, hero6];

const Hero = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToNext = () => {
    setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  };

  const goToPrev = () => {
    setCurrentBanner(
      (prev) => (prev - 1 + heroBanners.length) % heroBanners.length,
    );
  };

  return (
    <div className="home">
      <div className="hero-banner">
        <div className="hero-slider">
          {heroBanners.map((banner, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentBanner ? "active" : ""}`}
              style={{ backgroundImage: `url(${banner})` }}
            />
          ))}
        </div>

        <button className="hero-arrow hero-arrow-left" onClick={goToPrev}>
          <FiChevronLeft size={28} />
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={goToNext}>
          <FiChevronRight size={28} />
        </button>

        <div className="hero-dots">
          {heroBanners.map((_, index) => (
            <div
              key={index}
              className={`hero-dot ${index === currentBanner ? "active" : ""}`}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>
      </div>

      <div className="content-grid">
        <div className="content-box">
          <h3>Fashion trends you like</h3>
          <div className="fashion-grid">
            <div className="fashion-item">
              <img src="https://picsum.photos/id/1015/300/380" alt="Dresses" />
              <p>Dresses</p>
            </div>
            <div className="fashion-item">
              <img src="https://picsum.photos/id/1027/300/380" alt="Knits" />
              <p>Knits</p>
            </div>
            <div className="fashion-item">
              <img src="https://picsum.photos/id/106/300/380" alt="Jackets" />
              <p>Jackets</p>
            </div>
            <div className="fashion-item">
              <img src="https://picsum.photos/id/133/300/380" alt="Jewelry" />
              <p>Jewelry</p>
            </div>
          </div>
          <a href="/fashion" className="explore-link">
            Explore more
          </a>
        </div>

        <div className="content-box">
          <h3>Up to 45% off on home refresh</h3>
          <div className="home-refresh-grid">
            <div className="refresh-item">
              <div className="pink-bg">
                <img
                  src="https://picsum.photos/id/201/280/280"
                  alt="Home décor"
                />
              </div>
              <p>Home décor</p>
            </div>
            <div className="refresh-item">
              <div className="pink-bg">
                <img
                  src="https://picsum.photos/id/1074/280/280"
                  alt="Home improvement"
                />
              </div>
              <p>Home improvement</p>
            </div>
            <div className="refresh-item">
              <div className="pink-bg">
                <img
                  src="https://picsum.photos/id/870/280/280"
                  alt="Cleaning essentials"
                />
              </div>
              <p>Cleaning essentials</p>
            </div>
            <div className="refresh-item">
              <div className="pink-bg">
                <img
                  src="https://picsum.photos/id/1060/280/280"
                  alt="Storage & organizers"
                />
              </div>
              <p>Storage & organizers</p>
            </div>
          </div>
          <a href="/home-deals" className="explore-link">
            Shop Season Deals
          </a>
        </div>

        <div className="content-box">
          <h3>Easy updates for elevated spaces</h3>
          <div className="elevated-grid">
            <div className="elevated-item">
              <img
                src="https://picsum.photos/id/201/300/200"
                alt="Baskets & hampers"
              />
              <p>Baskets & hampers</p>
            </div>
            <div className="elevated-item">
              <img src="https://picsum.photos/id/106/300/200" alt="Hardware" />
              <p>Hardware</p>
            </div>
            <div className="elevated-item">
              <img
                src="https://picsum.photos/id/133/300/200"
                alt="Accent furniture"
              />
              <p>Accent furniture</p>
            </div>
            <div className="elevated-item">
              <img
                src="https://picsum.photos/id/1074/300/200"
                alt="Wallpaper & paint"
              />
              <p>Wallpaper & paint</p>
            </div>
          </div>
          <a href="/home" className="explore-link">
            Shop home products
          </a>
        </div>

        <div className="content-box">
          <h3>Get ready for Easter</h3>
          <div className="easter-grid">
            <div className="easter-item">
              <div className="purple-bg">
                <img
                  src="https://picsum.photos/id/201/260/260"
                  alt="Easter bunny"
                />
              </div>
              <p>Easter bunny</p>
            </div>
            <div className="easter-item">
              <div className="purple-bg">
                <img
                  src="https://picsum.photos/id/1060/260/260"
                  alt="Easter baskets"
                />
              </div>
              <p>Easter baskets</p>
            </div>
            <div className="easter-item">
              <div className="purple-bg">
                <img
                  src="https://picsum.photos/id/870/260/260"
                  alt="Easter decor"
                />
              </div>
              <p>Easter decor</p>
            </div>
            <div className="easter-item">
              <div className="purple-bg">
                <img
                  src="https://picsum.photos/id/133/260/260"
                  alt="Easter baking"
                />
              </div>
              <p>Easter baking</p>
            </div>
          </div>
          <a href="/easter" className="explore-link">
            Shop for Easter
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
