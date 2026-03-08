import React, { useState } from "react";
import {
  FiMapPin,
  FiChevronDown,
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
} from "react-icons/fi";
import "../styles/Header.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="main-nav">
        {/* Left: Logo */}
        <div className="main-nav__left">
          <a href="#" className="main-nav__logo">
            Global mart
          </a>
        </div>

        {/* Center: Search (PC only) */}
        <div className="main-nav__center">
          <div className="main-nav__search">
            <FiSearch className="main-nav__search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="main-nav__search-input"
            />
          </div>
        </div>

        {/* Right: Dropdowns & Icons */}
        <div className="main-nav__right">
          <div className="main-nav__dropdown">
            <span>ENG</span>
            <FiChevronDown className="main-nav__arrow" />
          </div>
          <div className="main-nav__dropdown">
            <span>USD</span>
            <FiChevronDown className="main-nav__arrow" />
          </div>
          <button className="main-nav__icon-btn" aria-label="Location">
            <FiMapPin />
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

          {/* Mobile: Search & Hamburger */}
          <button
            className="main-nav__icon-btn main-nav__icon-btn--mobile"
            aria-label="Search"
          >
            <FiSearch />
          </button>
          <button
            className="main-nav__hamburger"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__search">
            <FiSearch className="mobile-menu__search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="mobile-menu__search-input"
            />
          </div>
          <div className="mobile-menu__content">
            <div className="mobile-menu__dropdown">
              <span>ENG</span>
              <FiChevronDown className="mobile-menu__arrow" />
            </div>
            <div className="mobile-menu__dropdown">
              <span>USD</span>
              <FiChevronDown className="mobile-menu__arrow" />
            </div>
            <a href="#" className="mobile-menu__link">
              <FiMapPin /> Location
            </a>
            <a href="#" className="mobile-menu__link">
              <FiUser /> Account
            </a>
            <a href="#" className="mobile-menu__link">
              <FiHeart /> Wishlist
            </a>
            <a href="#" className="mobile-menu__link">
              <FiShoppingCart /> Cart
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
