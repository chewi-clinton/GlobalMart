import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getExchangeRate } from "../api/currency";

const STORAGE_KEY = "gm_currency";

// Default = USD (matches original header default)
const DEFAULT_CURRENCY = { code: "USD", symbol: "$", name: "US Dollar" };

const CurrencyContext = createContext({
  selectedCurrency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  formatPrice: (amount) => `$ ${amount}`,
  convertAmount: (amount) => amount,
  ratesReady: false,
});

export const useCurrency = () => useContext(CurrencyContext);

// ─── Helper ───────────────────────────────────────────────────────────
const fmt = (num, symbol) =>
  `${symbol} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// ─── Provider ─────────────────────────────────────────────────────────
export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  // Backend only stores USD-based rates (USD → XAF, USD → EUR, etc.)
  // We keep two values:
  //   usdToSelected  — rate for USD → selectedCurrency
  //   usdToXaf       — rate for USD → XAF  (constant, used for cross-rate math)
  const [usdToSelected, setUsdToSelected] = useState(1);
  const [usdToXaf, setUsdToXaf] = useState(655.957); // reasonable fallback
  const [ratesReady, setRatesReady] = useState(false);

  useEffect(() => {
    const to = selectedCurrency.code;
    setRatesReady(false);

    const promises = [];

    // 1. Fetch USD → selected (skip if already USD)
    if (to === "USD") {
      setUsdToSelected(1);
    } else {
      promises.push(
        getExchangeRate("USD", to)
          .then((data) => {
            if (data?.rate) setUsdToSelected(parseFloat(data.rate));
          })
          .catch(() => {})
      );
    }

    // 2. Fetch USD → XAF for cross-rate math (skip if selected is already XAF)
    if (to === "XAF") {
      // usdToXaf is the same as usdToSelected in this case — handled in getRate()
    } else {
      promises.push(
        getExchangeRate("USD", "XAF")
          .then((data) => {
            if (data?.rate) setUsdToXaf(parseFloat(data.rate));
          })
          .catch(() => {})
      );
    }

    Promise.all(promises).then(() => setRatesReady(true));
  }, [selectedCurrency.code]);

  // ── Cross-rate calculator ──────────────────────────────────────────
  // Backend stores only USD-based rates, so we derive everything else:
  //
  //   USD → selected  = usdToSelected          (direct from backend)
  //   XAF → selected  = usdToSelected / usdToXaf   (cross-rate)
  //   XAF → USD       = 1 / usdToXaf               (inverse)
  //   USD → XAF       = usdToXaf              (when selected = XAF, usdToSelected = usdToXaf)
  const getRate = useCallback(
    (fromCode) => {
      const to = selectedCurrency.code;
      if (fromCode === to) return 1;

      if (fromCode === "USD") {
        return usdToSelected; // USD → any
      }

      if (fromCode === "XAF") {
        if (to === "XAF") return 1;
        if (to === "USD") return usdToXaf > 0 ? 1 / usdToXaf : 1; // XAF → USD
        // XAF → other = (USD → other) / (USD → XAF)
        return usdToXaf > 0 ? usdToSelected / usdToXaf : 1;
      }

      // Unknown fromCode — best effort with usdToSelected
      return usdToSelected;
    },
    [usdToSelected, usdToXaf, selectedCurrency.code]
  );

  // ── Public helpers ─────────────────────────────────────────────────
  const setCurrency = useCallback((currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
  }, []);

  /**
   * Convert `amount` priced in `fromCode` to the selected currency
   * and return a formatted string with the currency symbol.
   */
  const formatPrice = useCallback(
    (amount, fromCode = "USD") => {
      if (amount === null || amount === undefined) return `${selectedCurrency.symbol} 0`;
      const num = parseFloat(amount);

      if (fromCode === selectedCurrency.code) return fmt(num, selectedCurrency.symbol);
      // While rates are loading, show the original price in its own currency
      if (!ratesReady) return fmt(num, selectedCurrency.symbol);

      return fmt(num * getRate(fromCode), selectedCurrency.symbol);
    },
    [getRate, ratesReady, selectedCurrency]
  );

  /** Returns the converted numeric value (no symbol). */
  const convertAmount = useCallback(
    (amount, fromCode = "USD") => {
      if (!amount) return 0;
      const num = parseFloat(amount);
      if (fromCode === selectedCurrency.code) return num;
      return num * getRate(fromCode);
    },
    [getRate, selectedCurrency.code]
  );

  return (
    <CurrencyContext.Provider
      value={{ selectedCurrency, setCurrency, formatPrice, convertAmount, ratesReady }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
