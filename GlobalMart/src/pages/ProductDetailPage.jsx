import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { allProducts } from "../data/products";
import "../styles/ProductDetailPage.css";

function StarRating({ rating }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<span key={i} className="pdp__star pdp__star--full">★</span>);
    else if (i === fullStars && hasHalf) stars.push(<span key={i} className="pdp__star pdp__star--half">★</span>);
    else stars.push(<span key={i} className="pdp__star pdp__star--empty">☆</span>);
  }
  return <span className="pdp__stars">{stars}</span>;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = allProducts.find((p) => p.id === parseInt(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "60px", fontSize: "18px" }}>
        Product not found.{" "}
        <a href="/shop" style={{ color: "#0066c0" }}>
          Go back to shop
        </a>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="pdp">

      {/* Breadcrumb */}
      <div className="pdp__breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>
        <span> › </span>
        <span onClick={() => navigate("/shop")}>Shop</span>
        <span> › </span>
        <span onClick={() => navigate("/shop")}>{product.category}</span>
        <span> › </span>
        <span className="pdp__breadcrumb--current">{product.name}</span>
      </div>

      {/* Main Layout */}
      <div className="pdp__main">

        {/* Thumbnails */}
        <div className="pdp__thumbnails">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`View ${i + 1}`}
              className={`pdp__thumb ${selectedImage === i ? "pdp__thumb--active" : ""}`}
              onClick={() => setSelectedImage(i)}
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="pdp__main-image-wrapper">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="pdp__main-image"
          />
        </div>

        {/* Product Info */}
        <div className="pdp__info">
          {/* Brand */}
          <p className="pdp__brand">Visit the {product.brand} Store</p>

          {/* Title */}
          <h1 className="pdp__title">{product.name}</h1>

          {/* Rating */}
          <div className="pdp__rating-row">
            <StarRating rating={product.rating} />
            <span className="pdp__rating-number">{product.rating}</span>
            <span className="pdp__review-count">
              ({product.reviews.toLocaleString()} reviews)
            </span>
          </div>

          {/* Bought last month */}
          <p className="pdp__bought">1K+ bought in past month</p>

          {/* Deal Badge */}
          {discountPercent && (
            <span className="pdp__deal-badge">Limited time deal</span>
          )}

          {/* Price */}
          <div className="pdp__price-row">
            {discountPercent && (
              <span className="pdp__discount">-{discountPercent}%</span>
            )}
            <span className="pdp__price">${product.price.toFixed(2)}</span>
          </div>
          {product.originalPrice && (
            <p className="pdp__original-price">
              List Price:{" "}
              <span className="pdp__strikethrough">
                ${product.originalPrice.toFixed(2)}
              </span>
            </p>
          )}

          <div className="pdp__divider" />

          {/* Color Variants */}
          {product.colors && product.colors.length > 0 && (
            <div className="pdp__variants">
              <p className="pdp__variant-label">
                Color: <strong>{product.colors[selectedColor].name}</strong>
              </p>
              <div className="pdp__color-swatches">
                {product.colors.map((color, i) => (
                  <div
                    key={i}
                    className={`pdp__color-dot ${selectedColor === i ? "pdp__color-dot--active" : ""}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(i)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pdp__divider" />

          {/* Size Variants */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pdp__size">
              <p className="pdp__variant-label">Size:</p>
              <div className="pdp__size-buttons">
                {product.sizes.map((size, i) => (
                  <button
                    key={i}
                    className={`pdp__size-btn ${selectedSize === i ? "pdp__size-btn--active" : ""}`}
                    onClick={() => setSelectedSize(i)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pdp__divider" />

          {/* Description */}
          <p className="pdp__description">{product.description}</p>
        </div>

        {/* Buy Box */}
        <div className="pdp__buybox">
          {/* Price */}
          <p className="pdp__buybox-price">
            ${product.price.toFixed(2)}
          </p>

          {/* Delivery */}
          <p className="pdp__buybox-delivery">
            <span className="pdp__buybox-free">FREE delivery</span>{" "}
            <strong>Thursday, April 16</strong>
          </p>

          <p className="pdp__buybox-location"> Delivery</p>

          {/* Stock */}
          <p className="pdp__stock pdp__stock--in">In Stock</p>

          {/* Quantity */}
          <div className="pdp__quantity">
            <label className="pdp__quantity-label">Quantity:</label>
            <select
              className="pdp__quantity-select"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <button
            className="pdp__btn pdp__btn--cart"
            onClick={() => navigate("/cart")}
          >
            Add to Cart
          </button>
          <button
            className="pdp__btn pdp__btn--buy"
            onClick={() => navigate("/payment")}
          >
            Buy Now
          </button>

          {/* Extra Info */}
          <div className="pdp__buybox-info">
            <div className="pdp__buybox-info-row">
              <span className="pdp__buybox-info-label">Shipper/Seller</span>
              <span>GlobalMart</span>
            </div>
            <div className="pdp__buybox-info-row">
              <span className="pdp__buybox-info-label">Returns</span>
              <span>30-day refund / replacement</span>
            </div>
            <div className="pdp__buybox-info-row">
              <span className="pdp__buybox-info-label">Packaging</span>
              <span>Ships in product packaging</span>
            </div>
          </div>

          <button className="pdp__add-list">+ Add to List</button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pdp__bottom">

        {/* Features */}
        <div className="pdp__section">
          <h2 className="pdp__section-title">Top highlights</h2>
          <ul className="pdp__features">
            {product.features.map((f, i) => (
              <li key={i}>✓ {f}</li>
            ))}
          </ul>
        </div>

        {/* Details Table */}
        <div className="pdp__section">
          <h2 className="pdp__section-title">Product details</h2>
          <table className="pdp__details-table">
            <tbody>
              {product.details.map((d, i) => (
                <tr key={i}>
                  <td className="pdp__details-key">{d.label}</td>
                  <td className="pdp__details-value">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reviews */}
        <div className="pdp__section pdp__section--reviews">
          <h2 className="pdp__section-title">Customer Reviews</h2>
          <div className="pdp__reviews-summary">
            <span className="pdp__reviews-avg">{product.rating}</span>
            <StarRating rating={product.rating} />
            <span className="pdp__reviews-total">
              {product.reviews.toLocaleString()} ratings
            </span>
          </div>
          <div className="pdp__reviews-list">
            {product.reviewsList.map((review) => (
              <div key={review.id} className="pdp__review">
                <div className="pdp__review-header">
                  <strong>{review.author}</strong>
                  {review.verified && (
                    <span className="pdp__verified">✓ Verified Purchase</span>
                  )}
                </div>
                <StarRating rating={review.rating} />
                <p className="pdp__review-date">{review.date}</p>
                <p className="pdp__review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;