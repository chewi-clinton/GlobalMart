import React, { useState } from "react";
import logo from "../Assets/logo.png";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Continue with:", email);
  };

  return (
    <div className="login-page">

      {/* Logo */}
      <div className="login-page__logo-wrapper">
        <img src={logo} alt="GlobalMart" className="login-page__logo" />
      </div>

      {/* Card */}
      <div className="login-page__card">
        <h1 className="login-page__title">Sign in or create account</h1>

        <form className="login-page__form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-page__field">
            <label htmlFor="email" className="login-page__label">
              Enter your email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-page__input"
              required
            />
          </div>

          {/* Continue Button */}
          <button type="submit" className="login-page__submit">
            Continue
          </button>

          {/* Terms */}
          <p className="login-page__terms">
            By continuing, you agree to GlobalMart's{" "}
            <a href="/Terms">Conditions of Use</a> and{" "}
            <a href="/privacy">Privacy Notice</a>.
          </p>

          {/* Need help */}
          <a href="#" className="login-page__help">Need help?</a>
        </form>

        {/* Divider */}
        <div className="login-page__divider" />

        {/* Business account */}
        <div className="login-page__business">
          <p className="login-page__business-title">Buying for work?</p>
          <a href="#" className="login-page__business-link">
            Create a free business account
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="login-page__footer">
        <div className="login-page__footer-links">
          <a href="/Terms">Conditions of Use</a>
          <a href="/privacy">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <p className="login-page__footer-copy">
          © 2026, GlobalMart, Inc. or its affiliates
        </p>
      </div>

    </div>
  );
};

export default LoginPage;