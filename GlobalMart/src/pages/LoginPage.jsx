import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { showToast } from "../components/Toast";
import logo from "../Assets/logo.png";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });

      if (data?.access) {
        const payload = JSON.parse(atob(data.access.split(".")[1]));
        const role = payload.role;

        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-change"));
        showToast("Signed in successfully!", "success");

        if (role === "seller") {
          navigate("/seller");
        } else if (role === "admin") {
          navigate("/super-admin");
        } else {
          navigate("/");
        }
      } else {
        const msg = data?.detail || data?.error || "Invalid email or password.";
        setError(msg);
        showToast(msg, "error");
      }
    } catch {
      setError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
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

        {error && <p className="login-page__error">{error}</p>}

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

          {/* Password */}
          <div className="login-page__field">
            <label htmlFor="password" className="login-page__label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-page__input"
              required
            />
          </div>

          {/* Sign in Button */}
          <button type="submit" className="login-page__submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Terms */}
          <p className="login-page__terms">
            By continuing, you agree to GlobalMart's{" "}
            <a href="/Terms">Conditions of Use</a> and{" "}
            <a href="/privacy">Privacy Notice</a>.
          </p>

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
