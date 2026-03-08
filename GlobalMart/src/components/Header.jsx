import React from "react";
import {
  FiMapPin,
  FiChevronDown,
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      {/* Top Utility Bar */}
      <div className="utility-bar">
        <div className="utility-bar__left">
          <div className="utility-bar__item utility-bar__item--location">
            <FiMapPin className="utility-bar__icon" />
            <span>Ukraine</span>
          </div>
        </div>
        <div className="utility-bar__right">
          <a href="#" className="utility-bar__link">
            Sell on Global Mart
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="main-nav__left">
          <a href="#" className="main-nav__logo">
            Global mart
          </a>
        </div>
        <div className="main-nav__right">
          <div className="main-nav__dropdown">
            <span>ENG</span>
            <FiChevronDown className="main-nav__arrow" />
          </div>
          <div className="main-nav__dropdown">
            <span>USD</span>
            <FiChevronDown className="main-nav__arrow" />
          </div>
          <button className="main-nav__icon-btn" aria-label="Search">
            <FiSearch />
          </button>
          <button className="main-nav__icon-btn" aria-label="Account">
            <FiUser />
          </button>
          <button className="main-nav__icon-btn" aria-label="Wishlist">
            <FiHeart />
          </button>
          <button className="main-nav__icon-btn" aria-label="Cart">
            <FiShoppingCart />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
