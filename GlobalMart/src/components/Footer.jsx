import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="back-to-top" onClick={scrollToTop}>
        Back to top
      </div>

      <div className="footer-content">
        <div className="footer-column">
          <h3>Get to Know Us</h3>
          <ul>
            <li>Careers</li>
            <li>Blog</li>
            <li>About Global Mart</li>
            <li>Investor Relations</li>
            <li>Global Mart Devices</li>
            <li>Global Mart Science</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Make Money with Us</h3>
          <ul>
            <li>Sell products on Global Mart</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Global Mart Payment Products</h3>
          <ul>
            <li>Global Mart Business Card</li>
            <li>Shop with Points</li>
            <li>Reload Your Balance</li>
            <li>Global Mart Currency Converter</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Let Us Help You</h3>
          <ul>
            <li>
              <Link to="/cart">Your Cart</Link>
            </li>
            <li>
              <Link to="/login">Your Account</Link>
            </li>
            <li>
              <Link to="/register">New Customer? Start here.</Link>
            </li>
            <li>Your Orders</li>
            <li>Shipping Rates & Policies</li>
            <li>Returns & Replacements</li>
            <li>Manage Your Content and Devices</li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/Terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/membership-agreement">Membership Agreement</Link>
            </li>
            <li>Help</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-wrapper">
        <div className="footer-bottom-content">
          <div className="footer-logo">
            Global<span>Mart</span>
          </div>

          <div className="footer-settings">
            <button className="settings-btn">
              <span className="flag-icon">🇺🇸</span> English - EN
            </button>
            <button className="settings-btn">$ USD - U.S. Dollar</button>
            <button className="settings-btn">
              <span className="flag-icon">🇺🇸</span> United States
            </button>
          </div>
        </div>
        <div className="footer-copyright">
          © 1996-2026, Global Mart, Inc. or its affiliates
        </div>
      </div>
    </footer>
  );
};

export default Footer;
