import React, { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Header.css";

// All country options with flags
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

// Language options with flags
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

// Currency options with symbols
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

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // User selections state
  const [userLocation, setUserLocation] = useState({
    country: "United States",
    countryCode: "US",
  });
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[2]); // Default to USD

  // Auto-detect user location on mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data && data.country_name && data.country_code) {
        const detectedCountry = countries.find(
          (c) => c.code === data.country_code,
        );

        if (detectedCountry) {
          setUserLocation({
            country: detectedCountry.name,
            countryCode: detectedCountry.code,
          });
        } else {
          setUserLocation({
            country: data.country_name,
            countryCode: data.country_code,
          });
        }

        // Auto-set currency based on country
        const currencyMap = {
          CM: currencies.find((c) => c.code === "XAF"), // Cameroon
          SN: currencies.find((c) => c.code === "XOF"), // Senegal
          CI: currencies.find((c) => c.code === "XOF"), // Ivory Coast
          US: currencies.find((c) => c.code === "USD"),
          GB: currencies.find((c) => c.code === "GBP"),
          CA: currencies.find((c) => c.code === "CAD"),
          AU: currencies.find((c) => c.code === "AUD"),
          JP: currencies.find((c) => c.code === "JPY"),
          CN: currencies.find((c) => c.code === "CNY"),
          IN: currencies.find((c) => c.code === "INR"),
          NG: currencies.find((c) => c.code === "NGN"),
          BR: currencies.find((c) => c.code === "BRL"),
          MX: currencies.find((c) => c.code === "MXN"),
          DE: currencies.find((c) => c.code === "EUR"),
          FR: currencies.find((c) => c.code === "EUR"),
          IT: currencies.find((c) => c.code === "EUR"),
          ES: currencies.find((c) => c.code === "EUR"),
          NL: currencies.find((c) => c.code === "EUR"),
          BE: currencies.find((c) => c.code === "EUR"),
          AT: currencies.find((c) => c.code === "EUR"),
          PT: currencies.find((c) => c.code === "EUR"),
          GR: currencies.find((c) => c.code === "EUR"),
          FI: currencies.find((c) => c.code === "EUR"),
          IE: currencies.find((c) => c.code === "EUR"),
          SK: currencies.find((c) => c.code === "EUR"),
          SI: currencies.find((c) => c.code === "EUR"),
          LU: currencies.find((c) => c.code === "EUR"),
          LV: currencies.find((c) => c.code === "EUR"),
          EE: currencies.find((c) => c.code === "EUR"),
          LT: currencies.find((c) => c.code === "EUR"),
          CY: currencies.find((c) => c.code === "EUR"),
          MT: currencies.find((c) => c.code === "EUR"),
          SG: currencies.find((c) => c.code === "SGD"),
          HK: currencies.find((c) => c.code === "HKD"),
          KR: currencies.find((c) => c.code === "KRW"),
          CH: currencies.find((c) => c.code === "CHF"),
          SE: currencies.find((c) => c.code === "SEK"),
          NO: currencies.find((c) => c.code === "NOK"),
          DK: currencies.find((c) => c.code === "DKK"),
          AE: currencies.find((c) => c.code === "AED"),
          SA: currencies.find((c) => c.code === "SAR"),
          ZA: currencies.find((c) => c.code === "ZAR"),
          TR: currencies.find((c) => c.code === "TRY"),
          RU: currencies.find((c) => c.code === "RUB"),
          PL: currencies.find((c) => c.code === "PLN"),
          TH: currencies.find((c) => c.code === "THB"),
          ID: currencies.find((c) => c.code === "IDR"),
          MY: currencies.find((c) => c.code === "MYR"),
          PH: currencies.find((c) => c.code === "PHP"),
          GH: currencies.find((c) => c.code === "GHS"),
          KE: currencies.find((c) => c.code === "KES"),
          MA: currencies.find((c) => c.code === "MAD"),
        };

        const detectedCurrency = currencyMap[data.country_code];
        if (detectedCurrency) {
          setSelectedCurrency(detectedCurrency);
        }
      }
    } catch (error) {
      console.log("Could not detect location, using defaults");
    }
  };

  // Handle navigation to NotFound page
  const handleNavigation = () => {
    navigate("/not-found");
  };

  // Close all dropdowns when clicking outside
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

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      country.code.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  // Handle country selection
  const handleCountrySelect = (country) => {
    setUserLocation({
      country: country.name,
      countryCode: country.code,
    });
    setLocationDropdownOpen(false);
    setLocationSearch("");

    // Update currency based on selected country
    const currencyMap = {
      CM: currencies.find((c) => c.code === "XAF"), // Cameroon
      SN: currencies.find((c) => c.code === "XOF"), // Senegal
      CI: currencies.find((c) => c.code === "XOF"), // Ivory Coast
      US: currencies.find((c) => c.code === "USD"),
      GB: currencies.find((c) => c.code === "GBP"),
      CA: currencies.find((c) => c.code === "CAD"),
      AU: currencies.find((c) => c.code === "AUD"),
      JP: currencies.find((c) => c.code === "JPY"),
      CN: currencies.find((c) => c.code === "CNY"),
      IN: currencies.find((c) => c.code === "INR"),
      NG: currencies.find((c) => c.code === "NGN"),
      BR: currencies.find((c) => c.code === "BRL"),
      MX: currencies.find((c) => c.code === "MXN"),
      DE: currencies.find((c) => c.code === "EUR"),
      FR: currencies.find((c) => c.code === "EUR"),
      IT: currencies.find((c) => c.code === "EUR"),
      ES: currencies.find((c) => c.code === "EUR"),
      NL: currencies.find((c) => c.code === "EUR"),
      BE: currencies.find((c) => c.code === "EUR"),
      AT: currencies.find((c) => c.code === "EUR"),
      PT: currencies.find((c) => c.code === "EUR"),
      GR: currencies.find((c) => c.code === "EUR"),
      SG: currencies.find((c) => c.code === "SGD"),
      HK: currencies.find((c) => c.code === "HKD"),
      KR: currencies.find((c) => c.code === "KRW"),
      CH: currencies.find((c) => c.code === "CHF"),
      SE: currencies.find((c) => c.code === "SEK"),
      NO: currencies.find((c) => c.code === "NOK"),
      DK: currencies.find((c) => c.code === "DKK"),
      AE: currencies.find((c) => c.code === "AED"),
      SA: currencies.find((c) => c.code === "SAR"),
      ZA: currencies.find((c) => c.code === "ZAR"),
      TR: currencies.find((c) => c.code === "TRY"),
      RU: currencies.find((c) => c.code === "RUB"),
      PL: currencies.find((c) => c.code === "PLN"),
      TH: currencies.find((c) => c.code === "THB"),
      ID: currencies.find((c) => c.code === "IDR"),
      MY: currencies.find((c) => c.code === "MYR"),
      PH: currencies.find((c) => c.code === "PHP"),
      GH: currencies.find((c) => c.code === "GHS"),
      KE: currencies.find((c) => c.code === "KES"),
      MA: currencies.find((c) => c.code === "MAD"),
    };

    const newCurrency = currencyMap[country.code];
    if (newCurrency) {
      setSelectedCurrency(newCurrency);
    }
  };

  // Get flag for a country
  const getCountryFlag = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.flag : "🌍";
  };

  return (
    <header className="header">
      <nav className="main-nav">
        {/* Left: Logo */}
        <div className="main-nav__left">
          <a href="/" className="main-nav__logo">
            <img src={logo} alt="GlobalMart" className="main-nav__logo-image" />
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
          {/* Location Dropdown */}
          <div
            className={`main-nav__dropdown main-nav__dropdown--location ${locationDropdownOpen ? "main-nav__dropdown--open" : ""}`}
            onClick={(e) => handleDropdownClick(e, setLocationDropdownOpen)}
          >
            <span className="main-nav__flag">
              {getCountryFlag(userLocation.countryCode)}
            </span>
            <FiMapPin className="main-nav__dropdown-icon" />
            <FiChevronDown className="main-nav__arrow" />

            {locationDropdownOpen && (
              <div
                className="main-nav__dropdown-menu main-nav__dropdown-menu--location"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="main-nav__dropdown-header">
                  <FiMapPin /> Select Your Location
                </div>

                {/* Search Input */}
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

                {/* Current Location */}
                <div className="main-nav__dropdown-current">
                  <span className="main-nav__dropdown-current-label">
                    Current:
                  </span>
                  <span className="main-nav__flag">
                    {getCountryFlag(userLocation.countryCode)}
                  </span>
                  <span>{userLocation.country}</span>
                </div>

                <div className="main-nav__dropdown-divider" />

                {/* Country List */}
                <div className="main-nav__dropdown-list">
                  {filteredCountries.map((country) => (
                    <div
                      key={country.code}
                      className={`main-nav__dropdown-item ${userLocation.countryCode === country.code ? "main-nav__dropdown-item--active" : ""}`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="main-nav__flag">{country.flag}</span>
                      <span className="main-nav__country-name">
                        {country.name}
                      </span>
                      {userLocation.countryCode === country.code && (
                        <FiCheck className="main-nav__check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div
            className={`main-nav__dropdown ${languageDropdownOpen ? "main-nav__dropdown--open" : ""}`}
            onClick={(e) => handleDropdownClick(e, setLanguageDropdownOpen)}
          >
            <span className="main-nav__flag">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.code}</span>
            <FiChevronDown className="main-nav__arrow" />

            {languageDropdownOpen && (
              <div className="main-nav__dropdown-menu">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`main-nav__dropdown-item ${selectedLanguage.code === lang.code ? "main-nav__dropdown-item--active" : ""}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    <span className="main-nav__flag">{lang.flag}</span>
                    <span className="main-nav__country-name">{lang.name}</span>
                    {selectedLanguage.code === lang.code && (
                      <FiCheck className="main-nav__check-icon" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currency Dropdown */}
          <div
            className={`main-nav__dropdown ${currencyDropdownOpen ? "main-nav__dropdown--open" : ""}`}
            onClick={(e) => handleDropdownClick(e, setCurrencyDropdownOpen)}
          >
            <span className="main-nav__currency-symbol">
              {selectedCurrency.symbol}
            </span>
            <span>{selectedCurrency.code}</span>
            <FiChevronDown className="main-nav__arrow" />

            {currencyDropdownOpen && (
              <div className="main-nav__dropdown-menu main-nav__dropdown-menu--currency">
                {currencies.map((currency) => (
                  <div
                    key={currency.code}
                    className={`main-nav__dropdown-item ${selectedCurrency.code === currency.code ? "main-nav__dropdown-item--active" : ""}`}
                    onClick={() => setSelectedCurrency(currency)}
                  >
                    <span className="main-nav__currency-symbol">
                      {currency.symbol}
                    </span>
                    <span className="main-nav__currency-name">
                      {currency.name}
                    </span>
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

          {/* Icon Buttons */}
          <button
            className="main-nav__icon-btn"
            aria-label="Account"
            onClick={handleNavigation}
          >
            <FiUser />
          </button>
          <button
            className="main-nav__icon-btn"
            aria-label="Wishlist"
            onClick={handleNavigation}
          >
            <FiHeart />
          </button>
          <button
            className="main-nav__icon-btn main-nav__icon-btn--cart"
            aria-label="Cart"
            onClick={handleNavigation}
          >
            <FiShoppingCart />
            <span className="main-nav__cart-badge">0</span>
          </button>

          {/* Mobile: Search & Hamburger */}
          <button
            className="main-nav__icon-btn main-nav__icon-btn--mobile"
            aria-label="Search"
            onClick={handleNavigation}
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
            {/* Mobile Location */}
            <div className="mobile-menu__section">
              <span className="mobile-menu__section-title">Location</span>
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
            </div>

            {/* Mobile Language Selection */}
            <div className="mobile-menu__section">
              <span className="mobile-menu__section-title">Language</span>
              <div className="mobile-menu__options">
                {languages.slice(0, 6).map((lang) => (
                  <button
                    key={lang.code}
                    className={`mobile-menu__option ${selectedLanguage.code === lang.code ? "mobile-menu__option--active" : ""}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    <span className="main-nav__flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Currency Selection */}
            <div className="mobile-menu__section">
              <span className="mobile-menu__section-title">Currency</span>
              <div className="mobile-menu__options mobile-menu__options--currency">
                {currencies.slice(0, 8).map((currency) => (
                  <button
                    key={currency.code}
                    className={`mobile-menu__option ${selectedCurrency.code === currency.code ? "mobile-menu__option--active" : ""}`}
                    onClick={() => setSelectedCurrency(currency)}
                  >
                    <span className="main-nav__currency-symbol">
                      {currency.symbol}
                    </span>
                    <span>{currency.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mobile-menu__divider" />

            {/* Mobile Navigation Links */}
            <a
              href="#"
              className="mobile-menu__link"
              onClick={handleNavigation}
            >
              <FiUser /> Account
            </a>
            <a
              href="#"
              className="mobile-menu__link"
              onClick={handleNavigation}
            >
              <FiHeart /> Wishlist
            </a>
            <a
              href="#"
              className="mobile-menu__link"
              onClick={handleNavigation}
            >
              <FiShoppingCart /> Cart
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
