import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../styles/HeroSection.css";
import { getCategories, getProducts } from "../api";

import hero1 from "../assets/Hero_img_1.jpeg";
import hero2 from "../assets/Hero_img_2.jpg";
import hero3 from "../assets/Hero_img_3.jpg";
import hero4 from "../assets/Hero_img_4.jpg";
import hero5 from "../assets/Hero_img_5.jpg";
import hero6 from "../assets/Hero_img_6.jpg";

const heroBanners = [hero1, hero2, hero3, hero4, hero5, hero6];

const Hero = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-advance hero banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories then fetch 4 products per category
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const cats = await getCategories();
        if (!Array.isArray(cats) || cats.length === 0) return;

        const first4 = cats.slice(0, 4);

        const productResults = await Promise.all(
          first4.map((cat) => getProducts({ category: cat.category_id }))
        );

        const built = first4.map((cat, i) => {
          const raw = Array.isArray(productResults[i]) ? productResults[i] : [];
          return {
            categoryId: cat.category_id,
            title: cat.name,
            items: raw.slice(0, 4).map((p) => ({
              id: p.product_id,
              name: p.title,
              image: p.primary_image || "https://placehold.co/300x300?text=No+Image",
            })),
          };
        });

        setSections(built);
      } catch (err) {
        console.error("Homepage sections failed to load:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const goToNext = () =>
    setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  const goToPrev = () =>
    setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);

  return (
    <div className="home">
      {/* ── Hero Banner ── */}
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

      {/* ── Category Boxes ── */}
      <div className="content-grid">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="content-box home-skeleton-box">
              <div className="home-skeleton home-skeleton--title" />
              <div className="fashion-grid">
                {[...Array(4)].map((__, j) => (
                  <div key={j} className="fashion-item">
                    <div className="home-skeleton home-skeleton--img" />
                    <div className="home-skeleton home-skeleton--text" />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : sections.length === 0 ? (
          <div className="content-box" style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888" }}>
            No categories found.
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.categoryId} className="content-box">
              <h3>{section.title}</h3>

              {section.items.length > 0 ? (
                <div className="fashion-grid">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="fashion-item"
                      onClick={() => navigate("/shop")}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={item.image} alt={item.name} />
                      <p>{item.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "#aaa", margin: "20px 0" }}>
                  No products yet in this category.
                </p>
              )}

              <button
                className="explore-link"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                onClick={() => navigate("/shop")}
              >
                Explore more
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Hero;
