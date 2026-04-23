import { request } from "./request";

const PAYMENT_URL = "http://62.171.174.37:8006/api/payments";

export const getPayments = () =>
  request(`${PAYMENT_URL}/`, { method: "GET" });

export const getPaymentDetail = (paymentId) =>
  request(`${PAYMENT_URL}/${paymentId}/`, { method: "GET" });

export const initiatePayment = (data) =>
  request(`${PAYMENT_URL}/initiate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const requestRefund = (paymentId, data) =>
  request(`${PAYMENT_URL}/${paymentId}/refund/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const processRefund = (refundId, action) =>
  request(`${PAYMENT_URL}/refunds/${refundId}/process/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
