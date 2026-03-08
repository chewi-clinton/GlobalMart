import React, { useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPaperPlane,
  FaArrowRight,
} from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="footer">
      {/* Overlapping Newsletter Card */}
      <div className="footer__newsletter">
        <div className="newsletter__container">
          <div className="newsletter__content">
            <h2 className="newsletter__heading">GlobalMart Insights</h2>
            <p className="newsletter__subtext">
              Get exclusive deals, trending products, and insider tips delivered
              straight to your inbox.
            </p>
          </div>
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <div className="newsletter__input-wrapper">
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter__button">
                <span>Get Started</span>
                <FaArrowRight />
              </button>
            </div>
            <p className="newsletter__disclaimer">
              By subscribing, you agree to our Privacy Policy and consent to
              receive updates.
            </p>
          </form>
        </div>
      </div>

      {/* Dark Footer Base */}
      <div className="footer__base">
        <div className="footer__container">
          {/* Column 1: Brand Identity */}
          <div className="footer__column footer__column--brand">
            <h3 className="footer__logo">GlobalMart</h3>
            <p className="footer__tagline">
              Connecting sellers and buyers across the globe.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a
                href="#"
                className="footer__social-link"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="#" className="footer__social-link" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div className="footer__column">
            <h4 className="footer__column-header">Marketplace</h4>
            <ul className="footer__links">
              <li>
                <a href="#">Shop All</a>
              </li>
              <li>
                <a href="#">Best Sellers</a>
              </li>
              <li>
                <a href="#">New Arrivals</a>
              </li>
              <li>
                <a href="#">Global Deals</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="footer__column">
            <h4 className="footer__column-header">Solutions</h4>
            <ul className="footer__links">
              <li>
                <a href="#">Sell on GlobalMart</a>
              </li>
              <li>
                <a href="#">Seller Tools</a>
              </li>
              <li>
                <a href="#">Shipping Logistics</a>
              </li>
              <li>
                <a href="#">Verified Badges</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer__column">
            <h4 className="footer__column-header">Support</h4>
            <ul className="footer__links">
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Track Order</a>
              </li>
              <li>
                <a href="#">Privacy</a>
              </li>
              <li>
                <a href="#">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-container">
            <p className="footer__copyright">
              © 2026 GlobalMart. All rights reserved.
            </p>
            <div className="footer__bottom-links">
              <a href="#">Privacy Policy</a>
              <span className="footer__divider">|</span>
              <a href="#">Terms of Service</a>
              <span className="footer__divider">|</span>
              <a href="#">Cookie Settings</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
