import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getExchangeRate } from "../api/currency";

const STORAGE_KEY = "gm_currency";
const BASE_CURRENCY = "XAF"; // products are priced in XAF by default

const DEFAULT_CURRENCY = { code: "XAF", symbol: "FCFA", name: "CFA Franc (Central)" };

const CurrencyContext = createContext({
  selectedCurrency: DEFAULT_CURRENCY,
  rate: 1,
  setCurrency: () => {},
  formatPrice: (amount) => `FCFA ${amount}`,
  convertAmount: (amount) => amount,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  const [rate, setRate] = useState(1);

  // Fetch rate from backend whenever the selected currency changes
  useEffect(() => {
    if (selectedCurrency.code === BASE_CURRENCY) {
      setRate(1);
      return;
    }
    getExchangeRate(BASE_CURRENCY, selectedCurrency.code)
      .then((data) => {
        if (data?.rate) setRate(parseFloat(data.rate));
        else setRate(1);
      })
      .catch(() => setRate(1));
  }, [selectedCurrency.code]);

  const setCurrency = useCallback((currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
  }, []);

  // Converts a raw amount (in XAF) to the selected currency and returns a formatted string
  const formatPrice = useCallback(
    (amount, fromCode = BASE_CURRENCY) => {
      if (amount === null || amount === undefined) return `${selectedCurrency.symbol} 0`;
      const num = parseFloat(amount);
      const converted = fromCode === selectedCurrency.code ? num : num * rate;
      return `${selectedCurrency.symbol} ${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [rate, selectedCurrency]
  );

  // Returns the converted numeric amount (no formatting)
  const convertAmount = useCallback(
    (amount, fromCode = BASE_CURRENCY) => {
      if (!amount) return 0;
      const num = parseFloat(amount);
      return fromCode === selectedCurrency.code ? num : num * rate;
    },
    [rate, selectedCurrency]
  );

  return (
    <CurrencyContext.Provider
      value={{ selectedCurrency, rate, setCurrency, formatPrice, convertAmount }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
