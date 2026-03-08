import React, { useState } from "react";
import Lottie from "lottie-react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiChevronDown,
} from "react-icons/fi";
import loginAnimation from "../assets/login.json";
import logo from "../Assets/logo.png";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Register attempted with:", form);
    }, 1500);
  };

  return (
    <div className="register-page">
      <div className="register-page__decoration register-page__decoration--1" />
      <div className="register-page__decoration register-page__decoration--2" />
      <div className="register-page__decoration register-page__decoration--3" />

      <div className="register-page__card">
        {/* Left: Logo + Lottie */}
        <div className="register-page__visual">
          <div className="register-page__gradient-bg" />
          <div className="register-page__logo-wrapper">
            <img src={logo} alt="GlobalMart" className="register-page__logo" />
          </div>
          <div className="register-page__animation-wrapper">
            <Lottie
              animationData={loginAnimation}
              loop={true}
              autoplay={true}
              className="register-page__lottie"
            />
          </div>
        </div>

        {/* Right: Form */}
        <div className="register-page__form-container">
          <div className="register-page__header">
            <h1>Create account</h1>
          </div>

          <form className="register-page__form" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="input-group">
              <div className="input-group__icon">
                <FiUser />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder=" "
                required
                className="input-group__input"
              />
              <label htmlFor="username" className="input-group__label">
                Username
              </label>
            </div>

            {/* Email */}
            <div className="input-group">
              <div className="input-group__icon">
                <FiMail />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                required
                className="input-group__input"
              />
              <label htmlFor="email" className="input-group__label">
                Email Address
              </label>
            </div>

            {/* Password */}
            <div className="input-group">
              <div className="input-group__icon">
                <FiLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                required
                className="input-group__input"
              />
              <label htmlFor="password" className="input-group__label">
                Password
              </label>
              <button
                type="button"
                className="input-group__toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <div className="input-group__icon">
                <FiLock />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder=" "
                required
                className="input-group__input"
              />
              <label htmlFor="confirmPassword" className="input-group__label">
                Confirm Password
              </label>
              <button
                type="button"
                className="input-group__toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Role Dropdown */}
            <div className="input-group">
              <div className="input-group__icon">
                <FiChevronDown />
              </div>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className={`input-group__input input-group__select ${form.role ? "input-group__select--filled" : ""}`}
              >
                <option value="" disabled hidden></option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              <label
                htmlFor="role"
                className={`input-group__label ${form.role ? "input-group__label--active" : ""}`}
              >
                I am a
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`register-page__submit ${isLoading ? "register-page__submit--loading" : ""}`}
              disabled={isLoading || !form.role}
            >
              <span className="register-page__submit-text">Create Account</span>
              <span className="register-page__submit-loader" />
            </button>
          </form>

          <div className="register-page__divider">
            <span>Already have an account?</span>
          </div>

          <a href="/login" className="register-page__login">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
