import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api";
import { showToast } from "../components/Toast";
import logo from "../Assets/logo.png";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (data.message === "Account created successfully.") {
        showToast("Account created! Please sign in.", "success");
        navigate("/login");
      } else {
        const messages = Object.values(data).flat().join(" ");
        const msg = messages || "Registration failed. Please try again.";
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
    <div className="register-page">

      {/* Logo */}
      <div className="register-page__logo-wrapper">
        <img src={logo} alt="GlobalMart" className="register-page__logo" />
      </div>

      {/* Card */}
      <div className="register-page__card">
        <h1 className="register-page__title">Create account</h1>

        {error && <p className="register-page__error">{error}</p>}

        <form className="register-page__form" onSubmit={handleSubmit}>

          {/* Username */}
          <div className="register-page__field">
            <label htmlFor="username" className="register-page__label">
              Your name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="register-page__input"
              placeholder="First and last name"
              required
            />
          </div>

          {/* Email */}
          <div className="register-page__field">
            <label htmlFor="email" className="register-page__label">
              Mobile number or email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="register-page__input"
              required
            />
          </div>

          {/* Role */}
          <div className="register-page__field">
            <label htmlFor="role" className="register-page__label">
              I am a
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="register-page__input register-page__select"
              required
            >
              <option value="" disabled hidden>Select role</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* Password */}
          <div className="register-page__field">
            <label htmlFor="password" className="register-page__label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="register-page__input"
              placeholder="At least 6 characters"
              required
            />
            <p className="register-page__hint">
              Passwords must be at least 6 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="register-page__field">
            <label htmlFor="confirmPassword" className="register-page__label">
              Re-enter password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="register-page__input"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="register-page__submit"
            disabled={!form.role || loading}
          >
            {loading ? "Creating account..." : "Continue"}
          </button>

          {/* Terms */}
          <p className="register-page__terms">
            By creating an account, you agree to GlobalMart's{" "}
            <a href="/Terms">Conditions of Use</a> and{" "}
            <a href="/privacy">Privacy Notice</a>.
          </p>

          {/* Divider */}
          <div className="register-page__divider" />

          {/* Sign in link */}
          <p className="register-page__signin-text">
            Already have an account?{" "}
            <a href="/login" className="register-page__signin-link">
              Sign in
            </a>
          </p>

        </form>
      </div>

      {/* Footer */}
      <div className="register-page__footer">
        <div className="register-page__footer-links">
          <a href="/Terms">Conditions of Use</a>
          <a href="/privacy">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <p className="register-page__footer-copy">
          © 1996-2026, GlobalMart, Inc. or its affiliates
        </p>
      </div>

    </div>
  );
};

export default RegisterPage;
