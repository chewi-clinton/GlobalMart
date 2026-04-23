import { request } from "./request";

const CURRENCY_URL = "http://62.171.174.37:8003/api/currencies";

export const getCurrencies = () =>
  request(`${CURRENCY_URL}/`, { method: "GET" });

export const getExchangeRates = () =>
  request(`${CURRENCY_URL}/rates/`, { method: "GET" });

export const getExchangeRate = (fromCurrency, toCurrency) =>
  request(`${CURRENCY_URL}/rate/?from=${fromCurrency}&to=${toCurrency}`, { method: "GET" });

export const convertCurrency = (amount, fromCurrency, toCurrency) =>
  request(`${CURRENCY_URL}/convert/?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`, { method: "GET" });
