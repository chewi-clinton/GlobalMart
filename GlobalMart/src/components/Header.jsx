import React, { useState, useEffect, useCallback } from "react";
import { logout, getCategories } from "../api";
import { showToast } from "./Toast";
import { useCurrency } from "../context/CurrencyContext";
import {
  FiMapPin,
  FiChevronDown,
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiCheck,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import "../styles/Header.css"
const countries = [
  { code: "CM", name: "Cameroon", flag: "🇨🇲" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "SN", name: "Senegal", flag: "🇸🇳" },
  { code: "CI", name: "Ivory Coast", flag: "🇨🇮" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
];

const languages = [
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "PT", name: "Português", flag: "🇵🇹" },
  { code: "IT", name: "Italiano", flag: "🇮🇹" },
  { code: "NL", name: "Nederlands", flag: "🇳🇱" },
  { code: "ZH", name: "中文", flag: "🇨🇳" },
  { code: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "KO", name: "한국어", flag: "🇰🇷" },
  { code: "AR", name: "العربية", flag: "🇸🇦" },
  { code: "HI", name: "हिन्दी", flag: "🇮🇳" },
];

const currencies = [
  { code: "XAF", symbol: "FCFA", name: "CFA Franc (Central)" },
  { code: "XOF", symbol: "CFA", name: "CFA Franc (West)" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
];

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

const Header = () => {
  const navigate = useNavigate();
  const { selectedCurrency, setCurrency: setContextCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCategories, setSidebarCategories] = useState([]);
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  });

  const syncAuth = useCallback(() => {
    try {
      setCurrentUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setCurrentUser(null);
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  useEffect(() => {
    // "auth-change" fires from login, logout, and clearSession (same tab)
    window.addEventListener("auth-change", syncAuth);
    // "storage" fires when another tab changes localStorage
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [syncAuth]);

  const handleLogout = useCallback(async () => {
    setProfilePanelOpen(false);
    await logout();
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    showToast("Signed out successfully.", "info");
    navigate("/login");
  }, [navigate]);

  // Fetch categories for sidebar "Shop by Department"
  useEffect(() => {
    getCategories()
      .then((data) => { if (Array.isArray(data)) setSidebarCategories(data); })
      .catch(() => {});
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const [userLocation, setUserLocation] = useState({
    country: "Cameroon",
    countryCode: "CM",
  });
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  // ipapi.co removed (rate-limited and CORS issues in dev).
  // Default to Cameroon/XAF. User can change manually via the country selector.

  useEffect(() => {
    const handleClickOutside = () => {
      setLocationDropdownOpen(false);
      setLanguageDropdownOpen(false);
      setCurrencyDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDropdownClick = (e, setDropdown) => {
    e.stopPropagation();
    setLocationDropdownOpen(false);
    setLanguageDropdownOpen(false);
    setCurrencyDropdownOpen(false);
    setDropdown((prev) => !prev);
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      country.code.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  const handleCountrySelect = (country) => {
    setUserLocation({ country: country.name, countryCode: country.code });
    setLocationDropdownOpen(false);
    setLocationSearch("");

    const currencyMap = {
      CM: "XAF",
      SN: "XOF",
      CI: "XOF",
      GH: "GHS",
      NG: "NGN",
      KE: "KES",
      MA: "MAD",
      ZA: "ZAR",
      US: "USD",
      GB: "GBP",
      CA: "CAD",
      AU: "AUD",
      JP: "JPY",
      CN: "CNY",
      IN: "INR",
      BR: "BRL",
      MX: "MXN",
      DE: "EUR",
      FR: "EUR",
      IT: "EUR",
      ES: "EUR",
      NL: "EUR",
      BE: "EUR",
      AT: "EUR",
      PT: "EUR",
      GR: "EUR",
      FI: "EUR",
      IE: "EUR",
      CH: "CHF",
      SE: "SEK",
      NO: "NOK",
      DK: "DKK",
      AE: "AED",
      SA: "SAR",
      TR: "TRY",
      RU: "RUB",
      PL: "PLN",
      TH: "THB",
      ID: "IDR",
      MY: "MYR",
      PH: "PHP",
      SG: "SGD",
      KR: "KRW",
    };

    const code = currencyMap[country.code] || "USD";
    const newCurrency = currencies.find((c) => c.code === code);
    if (newCurrency) setContextCurrency(newCurrency);
  };

  const getCountryFlag = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.flag : "🌍";
  };

  const profileNavLinks = [
    { label: "My GlobalMart", path: "/account" },
    { label: "Orders", path: "/orders" },
    { label: "Membership Program", path: "/membership" },
    { label: "Account Settings", path: "/settings" },
  ];

  return (
    <header className="header">
      <nav className="main-nav">
        <div className="main-nav__left">
          <a href="/" className="main-nav__logo">
            ‚
            <div className="main-nav__logo-text">
              Global<span>Mart</span>
            </div>
          </a>
        </div>

        {/* Deliver To */}
        <div
          className="main-nav__deliver"
          onClick={(e) => handleDropdownClick(e, setLocationDropdownOpen)}
        >
          <FiMapPin className="main-nav__deliver-icon" />
          <div className="main-nav__deliver-text">
            <span className="main-nav__deliver-line1">Deliver to</span>
            <span className="main-nav__deliver-line2">
              {userLocation.country}
            </span>
          </div>

          {locationDropdownOpen && (
            <div
              className="main-nav__dropdown-menu main-nav__dropdown-menu--location"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="main-nav__dropdown-header">
                <FiMapPin /> Choose your location
              </div>
              <div className="main-nav__dropdown-search">
                <FiSearch className="main-nav__dropdown-search-icon" />
                <input
                  type="text"
                  placeholder="Search country..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="main-nav__dropdown-search-input"
                  autoFocus
                />
              </div>
              <div className="main-nav__dropdown-list">
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className={`main-nav__dropdown-item ${userLocation.countryCode === country.code ? "main-nav__dropdown-item--active" : ""}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className="main-nav__flag">{country.flag}</span>
                    <span>{country.name}</span>
                    {userLocation.countryCode === country.code && (
                      <FiCheck className="main-nav__check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="main-nav__center">
          <div className="main-nav__search">
            <select className="main-nav__search-category">
              <option value="all">All</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
            </select>
            <input
              type="text"
              placeholder="Search Global Mart"
              className="main-nav__search-input"
            />
            <button className="main-nav__search-btn">
              <FiSearch className="main-nav__search-icon" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="main-nav__right">
          {/* Language */}
          <div
            className="nav-item main-nav__dropdown"
            onClick={(e) => handleDropdownClick(e, setLanguageDropdownOpen)}
          >
            <span className="main-nav__flag">{selectedLanguage.flag}</span>
            <span style={{ fontWeight: 700, color: "white" }}>
              {selectedLanguage.code}
            </span>
            <FiChevronDown
              style={{ color: "white", marginTop: "2px" }}
              size={12}
            />

            {languageDropdownOpen && (
              <div
                className="main-nav__dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`main-nav__dropdown-item ${selectedLanguage.code === lang.code ? "main-nav__dropdown-item--active" : ""}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    <span className="main-nav__flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {selectedLanguage.code === lang.code && (
                      <FiCheck className="main-nav__check-icon" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <div
            className="nav-item main-nav__dropdown"
            onClick={(e) => handleDropdownClick(e, setCurrencyDropdownOpen)}
          >
            <span style={{ color: "#ccc" }}>{selectedCurrency.symbol}</span>
            <span style={{ fontWeight: 700, color: "white" }}>
              {selectedCurrency.code}
            </span>
            <FiChevronDown
              style={{ color: "white", marginTop: "2px" }}
              size={12}
            />

            {currencyDropdownOpen && (
              <div
                className="main-nav__dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                {currencies.map((currency) => (
                  <div
                    key={currency.code}
                    className={`main-nav__dropdown-item ${selectedCurrency.code === currency.code ? "main-nav__dropdown-item--active" : ""}`}
                    onClick={() => setContextCurrency(currency)}
                  >
                    <span style={{ width: "30px" }}>{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="main-nav__currency-code">
                      {currency.code}
                    </span>
                    {selectedCurrency.code === currency.code && (
                      <FiCheck className="main-nav__check-icon" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account */}
          <div
            className="nav-item main-nav__profile-wrapper"
            onMouseEnter={() => setProfilePanelOpen(true)}
            onMouseLeave={() => setProfilePanelOpen(false)}
          >
            <div onClick={() => setProfilePanelOpen((prev) => !prev)}>
              <div className="nav-item__line1">
                Hello, {currentUser ? currentUser.username || "User" : "sign in"}
              </div>
              <div className="nav-item__line2">
                Account & Lists <FiChevronDown size={12} />
              </div>
            </div>

            <AnimatePresence>
              {profilePanelOpen && (
                <motion.div
                  className="profile-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseEnter={() => setProfilePanelOpen(true)}
                  onMouseLeave={() => setProfilePanelOpen(false)}
                >
                  <div className="profile-dropdown__btn-group">
                    {currentUser ? (
                      <button
                        className="profile-panel__btn profile-panel__btn--signin"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    ) : (
                      <>
                        <button
                          className="profile-panel__btn profile-panel__btn--signin"
                          onClick={() => { setProfilePanelOpen(false); navigate("/login"); }}
                        >
                          Sign in
                        </button>
                        <button
                          className="profile-panel__btn profile-panel__btn--register"
                          onClick={() => { setProfilePanelOpen(false); navigate("/register"); }}
                        >
                          Sign up
                        </button>
                      </>
                    )}
                  </div>
                  <div className="profile-panel__divider" />
                  <nav className="profile-panel__nav">
                    {profileNavLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.path}
                        className="profile-panel__nav-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setProfilePanelOpen(false);
                          navigate(link.path);
                        }}
                      >
                        <span>{link.label}</span>
                        <FiChevronRight />
                      </a>
                    ))}
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Returns & Orders */}
          <div className="nav-item" onClick={() => navigate("/orders")}>
            <div className="nav-item__line1">Returns</div>
            <div className="nav-item__line2">& Orders</div>
          </div>

          {/* Cart */}
          <div
            className="nav-item nav-item--cart"
            onClick={() => navigate("/cart")}
          >
            <div className="main-nav__cart-wrapper">
              <FiShoppingCart className="main-nav__cart-icon" />
              <span className="main-nav__cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            </div>
          </div>

          {/* Logout — visible only when signed in */}
          {currentUser && (
            <button
              className="main-nav__logout-btn"
              onClick={handleLogout}
              title="Sign out"
            >
              Sign Out
            </button>
          )}

          <button
            className="main-nav__hamburger"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Bottom Navigation Bar */}
      <div className="bottom-nav">
        <div className="bottom-nav__content">
          <button className="bottom-nav__item" onClick={() => setSidebarOpen(true)}>
            <FiMenu /> All
          </button>
          <button className="bottom-nav__item" onClick={() => navigate("/shop")}>Today's Deals</button>
        </div>
      </div>

      {/* Original Mobile Dropdown Menu (top hamburger) */}
      {mobileMenuOpen && (
        <div className="mobile-menu mobile-menu--open">
          <div className="mobile-menu__search">
            <FiSearch className="mobile-menu__search-icon" />
            <input
              type="text"
              placeholder="Search Global Mart"
              className="mobile-menu__search-input"
            />
          </div>

          <div className="mobile-menu__section-title">Location</div>
          <div className="mobile-menu__location-grid">
            {countries.slice(0, 12).map((country) => (
              <button
                key={country.code}
                className={`mobile-menu__location-btn ${userLocation.countryCode === country.code ? "mobile-menu__location-btn--active" : ""}`}
                onClick={() => handleCountrySelect(country)}
              >
                <span className="main-nav__flag">{country.flag}</span>
                <span>{country.code}</span>
              </button>
            ))}
          </div>

          {currentUser ? (
            <a href="#" className="mobile-menu__link" onClick={handleLogout}>
              Sign Out ({currentUser.username})
            </a>
          ) : (
            <a href="#" className="mobile-menu__link" onClick={() => navigate("/login")}>
              Sign In
            </a>
          )}
          <a href="#" className="mobile-menu__link" onClick={() => navigate("/orders")}>Orders</a>
          <a href="#" className="mobile-menu__link" onClick={() => navigate("/favorite")}>Wishlist</a>
        </div>
      )}

      {/* Sidebar Overlay (bottom nav "All" button) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Amazon-style Left Sidebar */}
      <div className={`left-sidebar ${sidebarOpen ? "left-sidebar--open" : ""}`}>
        {/* Sidebar Header */}
        <div className="left-sidebar__header">
          <FiUser size={20} />
          <span>Hello, {currentUser ? currentUser.username || "User" : "Sign in"}</span>
          <button className="left-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <div className="left-sidebar__body">

          {/* Shop by Department — real categories from API */}
          <div className="left-sidebar__section">
            <h3 className="left-sidebar__section-title">Shop by Department</h3>
            {(showAllDepts ? sidebarCategories : sidebarCategories.slice(0, 4)).map((cat) => (
              <div
                key={cat.category_id}
                className="left-sidebar__item"
                onClick={() => { navigate("/shop"); setSidebarOpen(false); }}
              >
                <span>{cat.name}</span>
                <FiChevronRight size={14} />
              </div>
            ))}
            {sidebarCategories.length > 4 && (
              <button
                className="left-sidebar__see-all"
                onClick={() => setShowAllDepts((v) => !v)}
              >
                {showAllDepts ? "See less" : "See all"}{" "}
                <FiChevronDown
                  size={14}
                  style={{ transform: showAllDepts ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
              </button>
            )}
          </div>

          {/* Account */}
          <div className="left-sidebar__section">
            <h3 className="left-sidebar__section-title">Account</h3>
            <div className="left-sidebar__item" onClick={() => { navigate("/orders"); setSidebarOpen(false); }}>
              <span>Returns &amp; Orders</span>
              <FiChevronRight size={14} />
            </div>
            <div className="left-sidebar__item" onClick={() => { navigate("/favorite"); setSidebarOpen(false); }}>
              <span>Wishlist</span>
              <FiChevronRight size={14} />
            </div>
            {currentUser ? (
              <div className="left-sidebar__item" onClick={() => { handleLogout(); setSidebarOpen(false); }}>
                <span>Sign Out</span>
              </div>
            ) : (
              <div className="left-sidebar__item" onClick={() => { navigate("/login"); setSidebarOpen(false); }}>
                <span>Sign In</span>
              </div>
            )}
          </div>

         

        </div>
      </div>
    </header>
  );
};

export default Header;
