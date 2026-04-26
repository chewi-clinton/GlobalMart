import { publicRequest } from "./request";

const CURRENCY_URL = "http://62.171.174.37:8003/api/currencies";

export const getCurrencies = () =>
  publicRequest(`${CURRENCY_URL}/`, { method: "GET" });

export const getExchangeRates = () =>
  publicRequest(`${CURRENCY_URL}/rates/`, { method: "GET" });

export const getExchangeRate = (fromCurrency, toCurrency) =>
  publicRequest(`${CURRENCY_URL}/rate/?from=${fromCurrency}&to=${toCurrency}`, { method: "GET" });

export const convertCurrency = (amount, fromCurrency, toCurrency) =>
  publicRequest(`${CURRENCY_URL}/convert/?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`, { method: "GET" });
