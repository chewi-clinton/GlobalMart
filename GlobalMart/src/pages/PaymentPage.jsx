import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PaymentPage.css";

const steps = ["Delivery Address", "Payment Method", "Review Order"];

const PaymentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);
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

  const orderSummary = {
    items: 149.99,
    shipping: 9.99,
    tax: 0.0,
    importCharges: 0.0,
  };

  const orderTotal = (
    orderSummary.items +
    orderSummary.shipping +
    orderSummary.tax +
    orderSummary.importCharges
  ).toFixed(2);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setSavedAddress(address);
    setShowAddressForm(false);
  };

  const handleDeliverHere = () => {
    if (!savedAddress) {
      setShowAddressForm(true);
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentContinue = () => {
    if (!selectedPayment) return;
    setCurrentStep(3);
  };

  const handlePlaceOrder = () => {
    alert("🎉 Order placed successfully! Thank you for shopping with GlobalMart.");
    navigate("/");
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

              {/* Saved Address */}
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

              {/* Add New Address */}
              {!showAddressForm && (
                <p
                  className="payment__add-address"
                  onClick={() => setShowAddressForm(true)}
                >
                  + Add a new delivery address
                </p>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <form className="payment__address-form" onSubmit={handleSaveAddress}>
                  <h4 className="payment__form-title">Add a new address</h4>

                  <div className="payment__autofill">
                    <span>Save time. Autofill your current location.</span>
                    <button type="button" className="payment__autofill-btn">Autofill</button>
                  </div>

                  <div className="payment__field">
                    <label>Country/Region</label>
                    <select
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                      className="payment__input"
                    >
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
                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      className="payment__input"
                      required
                    />
                  </div>

                  <div className="payment__field">
                    <label>Street address</label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      className="payment__input"
                      required
                    />
                  </div>

                  <div className="payment__field">
                    <input
                      type="text"
                      name="apartment"
                      value={address.apartment}
                      onChange={handleAddressChange}
                      className="payment__input"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="payment__field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="payment__input"
                      required
                    />
                  </div>

                  <div className="payment__field-row">
                    <div className="payment__field">
                      <label>State / Province / Region</label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className="payment__input"
                      />
                    </div>
                    <div className="payment__field">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleAddressChange}
                        className="payment__input"
                      />
                    </div>
                  </div>

                  <div className="payment__field">
                    <label>Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      className="payment__input"
                      required
                    />
                    <small>May be used to assist delivery</small>
                  </div>

                  <label className="payment__checkbox">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={address.isDefault}
                      onChange={handleAddressChange}
                    />
                    <span>Use as my default address</span>
                  </label>

                  <button type="submit" className="payment__btn payment__btn--primary">
                    Use this address
                  </button>
                </form>
              )}

              {/* Deliver Button */}
              {!showAddressForm && (
                <button
                  className="payment__btn payment__btn--primary"
                  onClick={handleDeliverHere}
                >
                  Deliver to this address
                </button>
              )}

              {/* Promo Code */}
              <div className="payment__promo">
                <p>Use a gift card, voucher, or promo code</p>
                <div className="payment__promo-row">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="payment__input payment__promo-input"
                  />
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
                    <p className="payment__delivering-label">
                      Delivering to {savedAddress.fullName}
                    </p>
                    <p className="payment__delivering-address">
                      {savedAddress.street}, {savedAddress.city}, {savedAddress.country}
                    </p>
                  </div>
                  <button
                    className="payment__change-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change
                  </button>
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
                    <input
                      type="tel"
                      placeholder="e.g. 6XXXXXXXX"
                      className="payment__input"
                    />
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
                    <input
                      type="tel"
                      placeholder="e.g. 6XXXXXXXX"
                      className="payment__input"
                    />
                  </div>
                </div>
              )}

              {/* Gift Card */}
              <div className="payment__gift-card">
                <p className="payment__section-subtitle">Your available balance</p>
                <div className="payment__field">
                  <label>Enter a gift card, voucher or promotional code</label>
                  <div className="payment__promo-row">
                    <input
                      type="text"
                      placeholder="Enter Code"
                      className="payment__input payment__promo-input"
                    />
                    <button className="payment__btn payment__btn--secondary">Apply</button>
                  </div>
                </div>
              </div>

              <button
                className="payment__btn payment__btn--primary"
                onClick={handlePaymentContinue}
                disabled={!selectedPayment}
              >
                Use this payment method
              </button>
            </div>
          )}

          {/* ── STEP 3: Review Order ── */}
          {currentStep === 3 && (
            <div className="payment__section">
              <h3 className="payment__section-title">Review items and shipping</h3>

              <div className="payment__review-info">
                <p>
                  By placing your order, you agree to GlobalMart's{" "}
                  <a href="/Terms">Conditions of Use</a> and{" "}
                  <a href="/privacy">Privacy Notice</a>.
                </p>
                <p>
                  We'll send you an email confirming your order once it has been shipped.
                </p>
                <p>
                  Within 30 days of delivery, you may return new, unopened merchandise
                  in its original condition.
                </p>
                <a href="/cart" className="payment__back-cart">
                  Back to cart
                </a>
              </div>

              <button
                className="payment__btn payment__btn--place-order"
                onClick={handlePlaceOrder}
              >
                Place your order
              </button>
            </div>
          )}
        </div>

        {/* Right Summary */}
        <div className="payment__summary">
          {currentStep === 1 && (
            <button
              className="payment__btn payment__btn--primary"
              onClick={handleDeliverHere}
            >
              Deliver to this address
            </button>
          )}
          {currentStep === 2 && (
            <button
              className="payment__btn payment__btn--primary"
              onClick={handlePaymentContinue}
              disabled={!selectedPayment}
            >
              Use this payment method
            </button>
          )}
          {currentStep === 3 && (
            <button
              className="payment__btn payment__btn--place-order"
              onClick={handlePlaceOrder}
            >
              Place your order
            </button>
          )}

          <div className="payment__summary-box">
            <div className="payment__summary-row">
              <span>Items:</span>
              <span>${orderSummary.items.toFixed(2)}</span>
            </div>
            <div className="payment__summary-row">
              <span>Shipping & handling:</span>
              <span>${orderSummary.shipping.toFixed(2)}</span>
            </div>
            <div className="payment__summary-row">
              <span>Estimated tax:</span>
              <span>${orderSummary.tax.toFixed(2)}</span>
            </div>
            <div className="payment__summary-row">
              <span>Import Charges:</span>
              <span>${orderSummary.importCharges.toFixed(2)}</span>
            </div>
            <div className="payment__summary-divider" />
            <div className="payment__summary-total">
              <span>Order total:</span>
              <span>${orderTotal}</span>
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