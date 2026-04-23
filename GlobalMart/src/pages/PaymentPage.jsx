import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder, initiatePayment } from "../api";
import { showToast } from "../components/Toast";
import "../styles/PaymentPage.css";

const steps = ["Delivery Address", "Payment Method", "Review Order"];

const SHIPPING_FEE = 0;

const PaymentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [address, setAddress] = useState({
    country: "Cameroon",
    fullName: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) { navigate("/cart"); return; }
    setCartItems(cart);
  }, [navigate]);

  const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = cartItems[0]?.currency || "XAF";
  const orderTotal = (itemsTotal + SHIPPING_FEE).toFixed(2);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setSavedAddress(address);
    setShowAddressForm(false);
  };

  const handleDeliverHere = () => {
    if (!savedAddress) { setShowAddressForm(true); return; }
    setCurrentStep(2);
  };

  const handlePaymentContinue = () => {
    if (!selectedPayment) return;
    if ((selectedPayment === "momo" || selectedPayment === "orange") && !phoneNumber) return;
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError("");

    const shippingAddress = savedAddress
      ? `${savedAddress.fullName}, ${savedAddress.street}${savedAddress.apartment ? ", " + savedAddress.apartment : ""}, ${savedAddress.city}, ${savedAddress.state}, ${savedAddress.country}`
      : "";

    const orderPayload = {
      items: cartItems.map((item) => ({
        product_id: item.id,
        seller_id: item.seller_id || 1,
        quantity: item.quantity,
        unit_price: item.price.toFixed(2),
        ...(item.variant_id ? { variant_id: item.variant_id } : {}),
      })),
      currency_code: currency,
      shipping_address: shippingAddress,
      notes: "",
    };

    try {
      const orderData = await placeOrder(orderPayload);

      if (!orderData.order_id) {
        const msg = Object.values(orderData).flat().join(" ") || "Failed to place order.";
        setOrderError(msg);
        showToast(msg, "error");
        setPlacing(false);
        return;
      }

      // Initiate payment after order is created
      const paymentMethodMap = {
        momo: "mtn_momo",
        orange: "orange_money",
        card: "card",
      };

      await initiatePayment({
        order_id: orderData.order_id,
        amount: orderTotal,
        currency_code: currency,
        payment_method: paymentMethodMap[selectedPayment] || "mtn_momo",
        phone_number: phoneNumber,
      });

      localStorage.removeItem("cart");
      showToast(`Order #${orderData.order_id} placed! Payment initiated.`, "success");
      navigate("/", { state: { orderSuccess: true, orderId: orderData.order_id } });
    } catch {
      setOrderError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="payment">

      {/* Progress Steps */}
      <div className="payment__steps">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`payment__step ${currentStep === i + 1 ? "payment__step--active" : ""} ${currentStep > i + 1 ? "payment__step--done" : ""}`}
          >
            <span className="payment__step-number">{i + 1}</span>
            <span className="payment__step-label">{step}</span>
            {i < steps.length - 1 && <span className="payment__step-arrow">›</span>}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="payment__body">

        {/* Left Main */}
        <div className="payment__main">

          {/* ── STEP 1: Delivery Address ── */}
          {currentStep === 1 && (
            <div className="payment__section">
              <h3 className="payment__section-title">Select a delivery address</h3>

              {savedAddress && (
                <div className="payment__address-card payment__address-card--selected">
                  <input type="radio" checked readOnly />
                  <div className="payment__address-details">
                    <p className="payment__address-name">{savedAddress.fullName}</p>
                    <p>{savedAddress.street}, {savedAddress.city}</p>
                    <p>{savedAddress.state}, {savedAddress.country}</p>
                    <p>Phone: {savedAddress.phone}</p>
                  </div>
                </div>
              )}

              {!showAddressForm && (
                <p className="payment__add-address" onClick={() => setShowAddressForm(true)}>
                  + Add a new delivery address
                </p>
              )}

              {showAddressForm && (
                <form className="payment__address-form" onSubmit={handleSaveAddress}>
                  <h4 className="payment__form-title">Add a new address</h4>

                  <div className="payment__field">
                    <label>Country/Region</label>
                    <select name="country" value={address.country} onChange={handleAddressChange} className="payment__input">
                      <option>Cameroon</option>
                      <option>Nigeria</option>
                      <option>Ghana</option>
                      <option>Senegal</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>France</option>
                      <option>Germany</option>
                    </select>
                  </div>

                  <div className="payment__field">
                    <label>Full name (First and Last name)</label>
                    <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} className="payment__input" required />
                  </div>

                  <div className="payment__field">
                    <label>Street address</label>
                    <input type="text" name="street" value={address.street} onChange={handleAddressChange} className="payment__input" required />
                  </div>

                  <div className="payment__field">
                    <input type="text" name="apartment" value={address.apartment} onChange={handleAddressChange} className="payment__input" placeholder="Apartment, suite, unit, building, floor, etc." />
                  </div>

                  <div className="payment__field">
                    <label>City</label>
                    <input type="text" name="city" value={address.city} onChange={handleAddressChange} className="payment__input" required />
                  </div>

                  <div className="payment__field-row">
                    <div className="payment__field">
                      <label>State / Province / Region</label>
                      <input type="text" name="state" value={address.state} onChange={handleAddressChange} className="payment__input" />
                    </div>
                    <div className="payment__field">
                      <label>Zip Code</label>
                      <input type="text" name="zipCode" value={address.zipCode} onChange={handleAddressChange} className="payment__input" />
                    </div>
                  </div>

                  <div className="payment__field">
                    <label>Phone number</label>
                    <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} className="payment__input" required />
                    <small>May be used to assist delivery</small>
                  </div>

                  <label className="payment__checkbox">
                    <input type="checkbox" name="isDefault" checked={address.isDefault} onChange={handleAddressChange} />
                    <span>Use as my default address</span>
                  </label>

                  <button type="submit" className="payment__btn payment__btn--primary">Use this address</button>
                </form>
              )}

              {!showAddressForm && (
                <button className="payment__btn payment__btn--primary" onClick={handleDeliverHere}>
                  Deliver to this address
                </button>
              )}

              <div className="payment__promo">
                <p>Use a gift card, voucher, or promo code</p>
                <div className="payment__promo-row">
                  <input type="text" placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="payment__input payment__promo-input" />
                  <button className="payment__btn payment__btn--secondary">Apply</button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment Method ── */}
          {currentStep === 2 && (
            <div className="payment__section">
              {savedAddress && (
                <div className="payment__delivering-to">
                  <div>
                    <p className="payment__delivering-label">Delivering to {savedAddress.fullName}</p>
                    <p className="payment__delivering-address">{savedAddress.street}, {savedAddress.city}, {savedAddress.country}</p>
                  </div>
                  <button className="payment__change-btn" onClick={() => setCurrentStep(1)}>Change</button>
                </div>
              )}

              <h3 className="payment__section-title">Payment method</h3>

              {/* MTN Mobile Money */}
              <div
                className={`payment__option ${selectedPayment === "momo" ? "payment__option--selected" : ""}`}
                onClick={() => setSelectedPayment("momo")}
              >
                <input type="radio" checked={selectedPayment === "momo"} readOnly />
                <div className="payment__option-info">
                  <span className="payment__option-icon">📱</span>
                  <div>
                    <p className="payment__option-name">Mobile Money (MTN)</p>
                    <p className="payment__option-desc">Pay with your MTN Mobile Money account</p>
                  </div>
                </div>
              </div>
              {selectedPayment === "momo" && (
                <div className="payment__option-form">
                  <div className="payment__field">
                    <label>MTN Mobile Money Number</label>
                    <input type="tel" placeholder="e.g. 6XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="payment__input" required />
                  </div>
                </div>
              )}

              {/* Orange Money */}
              <div
                className={`payment__option ${selectedPayment === "orange" ? "payment__option--selected" : ""}`}
                onClick={() => setSelectedPayment("orange")}
              >
                <input type="radio" checked={selectedPayment === "orange"} readOnly />
                <div className="payment__option-info">
                  <span className="payment__option-icon">🟠</span>
                  <div>
                    <p className="payment__option-name">Orange Money</p>
                    <p className="payment__option-desc">Pay with your Orange Money account</p>
                  </div>
                </div>
              </div>
              {selectedPayment === "orange" && (
                <div className="payment__option-form">
                  <div className="payment__field">
                    <label>Orange Money Number</label>
                    <input type="tel" placeholder="e.g. 6XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="payment__input" required />
                  </div>
                </div>
              )}

              <div className="payment__gift-card">
                <p className="payment__section-subtitle">Your available balance</p>
                <div className="payment__field">
                  <label>Enter a gift card, voucher or promotional code</label>
                  <div className="payment__promo-row">
                    <input type="text" placeholder="Enter Code" className="payment__input payment__promo-input" />
                    <button className="payment__btn payment__btn--secondary">Apply</button>
                  </div>
                </div>
              </div>

              <button
                className="payment__btn payment__btn--primary"
                onClick={handlePaymentContinue}
                disabled={!selectedPayment || ((selectedPayment === "momo" || selectedPayment === "orange") && !phoneNumber)}
              >
                Use this payment method
              </button>
            </div>
          )}

          {/* ── STEP 3: Review Order ── */}
          {currentStep === 3 && (
            <div className="payment__section">
              <h3 className="payment__section-title">Review items and shipping</h3>

              {/* Cart Items Preview */}
              <div className="payment__review-items">
                {cartItems.map((item, i) => (
                  <div key={i} className="payment__review-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="payment__review-img"
                      onError={(e) => { e.target.src = "https://placehold.co/60x60?text=N/A"; }}
                    />
                    <div className="payment__review-item-info">
                      <p className="payment__review-item-name">{item.name}</p>
                      <p className="payment__review-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="payment__review-item-price">
                      {(item.price * item.quantity).toLocaleString()} {item.currency}
                    </p>
                  </div>
                ))}
              </div>

              <div className="payment__review-info">
                <p>
                  By placing your order, you agree to GlobalMart's{" "}
                  <a href="/Terms">Conditions of Use</a> and{" "}
                  <a href="/privacy">Privacy Notice</a>.
                </p>
                <p>We'll send you an email confirming your order once it has been shipped.</p>
                <p>Within 30 days of delivery, you may return new, unopened merchandise in its original condition.</p>
                <a href="/cart" className="payment__back-cart">Back to cart</a>
              </div>

              {orderError && <p className="payment__error">{orderError}</p>}

              <button
                className="payment__btn payment__btn--place-order"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? "Placing order..." : "Place your order"}
              </button>
            </div>
          )}
        </div>

        {/* Right Summary */}
        <div className="payment__summary">
          {currentStep === 1 && (
            <button className="payment__btn payment__btn--primary" onClick={handleDeliverHere}>
              Deliver to this address
            </button>
          )}
          {currentStep === 2 && (
            <button
              className="payment__btn payment__btn--primary"
              onClick={handlePaymentContinue}
              disabled={!selectedPayment || ((selectedPayment === "momo" || selectedPayment === "orange") && !phoneNumber)}
            >
              Use this payment method
            </button>
          )}
          {currentStep === 3 && (
            <button
              className="payment__btn payment__btn--place-order"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? "Placing order..." : "Place your order"}
            </button>
          )}

          <div className="payment__summary-box">
            <div className="payment__summary-row">
              <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)}):</span>
              <span>{itemsTotal.toLocaleString()} {currency}</span>
            </div>
            <div className="payment__summary-row">
              <span>Shipping & handling:</span>
              <span>{SHIPPING_FEE === 0 ? "FREE" : `${SHIPPING_FEE} ${currency}`}</span>
            </div>
            <div className="payment__summary-divider" />
            <div className="payment__summary-total">
              <span>Order total:</span>
              <span>{parseFloat(orderTotal).toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="payment__footer">
        <div className="payment__footer-links">
          <a href="/Terms">Conditions of Use</a>
          <a href="/privacy">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <p>©2026, GlobalMart, Inc. or its affiliates</p>
      </div>
    </div>
  );
};

export default PaymentPage;
