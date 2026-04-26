import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getCategories, getProducts } from "../api";

const SLIDE_WIDTH = 224;

// ── Shared styles ─────────────────────────────────────────────────────────────
const s = {
  container: {
    background: "#f3f3f3",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: { background: "#ffffff", padding: "24px" },
  title: { fontSize: "21px", fontWeight: "700", color: "#0F1111", marginBottom: "20px" },
  sliderWrapper: { position: "relative", overflow: "hidden" },
  track: { display: "flex", gap: "24px", transition: "transform 0.5s ease" },
  productCard: { flex: "0 0 200px", cursor: "pointer" },
  imageBox: {
    height: "200px",
    background: "#f9f9f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  label: { fontSize: "14px", fontWeight: "600", color: "#0F1111", marginTop: "8px", textAlign: "center" },
  arrow: {
    position: "absolute",
    top: "40%",
    transform: "translateY(-50%)",
    background: "white",
    border: "1px solid #ddd",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  link: {
    color: "#007185",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "20px",
    display: "inline-block",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  skeletonBar: {
    background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
    backgroundSize: "800px 100%",
    animation: "shimmerSkeleton 1.4s infinite",
    borderRadius: "4px",
  },
};

// ── Single category slider section ────────────────────────────────────────────
const CategorySection = ({ title, categoryId, products, navigate }) => {
  const [index, setIndex] = useState(0);
  const visible = 5;

  if (products.length === 0) return null;

  return (
    <div style={s.card}>
      <h2 style={s.title}>{title}</h2>
      <div style={s.sliderWrapper}>
        <button
          style={{ ...s.arrow, left: 0 }}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <FiChevronLeft size={20} />
        </button>

        <div
          style={{
            ...s.track,
            transform: `translateX(-${index * SLIDE_WIDTH}px)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={s.productCard}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div style={s.imageBox}>
                <img
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  src={product.image}
                  alt={product.name}
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/200x200?text=No+Image")
                  }
                />
              </div>
              <div style={s.label}>{product.name}</div>
            </div>
          ))}
        </div>

        <button
          style={{ ...s.arrow, right: 0 }}
          onClick={() =>
            setIndex((i) => Math.min(i + 1, products.length - visible))
          }
          disabled={index >= products.length - visible}
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      <button style={s.link} onClick={() => navigate(`/shop?category=${categoryId}`)}>
        See all →
      </button>
    </div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={s.container}>
    {[...Array(3)].map((_, i) => (
      <div key={i} style={s.card}>
        <div style={{ ...s.skeletonBar, height: "22px", width: "40%", marginBottom: "20px" }} />
        <div style={{ display: "flex", gap: "24px" }}>
          {[...Array(5)].map((__, j) => (
            <div
              key={j}
              style={{ ...s.skeletonBar, flex: "0 0 200px", height: "200px" }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const BestSellerSlider = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, products] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        if (!Array.isArray(cats) || !Array.isArray(products)) return;

        // Group real products by category name
        const built = cats
          .map((cat) => ({
            categoryId: cat.category_id,
            title: cat.name,
            products: products
              .filter((p) => p.category_name === cat.name)
              .map((p) => ({
                id: p.product_id,
                name: p.title,
                image:
                  p.primary_image ||
                  "https://placehold.co/200x200?text=No+Image",
              })),
          }))
          .filter((g) => g.products.length > 0);

        setGroups(built);
      } catch (err) {
        console.error("BestSellerSlider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Skeleton />;

  if (groups.length === 0) {
    return (
      <div style={{ ...s.container, textAlign: "center", color: "#888", padding: "40px" }}>
        No products available yet.
      </div>
    );
  }

  return (
    <div style={s.container}>
      {groups.map((group) => (
        <CategorySection
          key={group.categoryId}
          title={`Best Sellers in ${group.title}`}
          categoryId={group.categoryId}
          products={group.products}
          navigate={navigate}
        />
      ))}
    </div>
  );
};

export default BestSellerSlider;
