import React, { useState } from "react";
import Lottie from "lottie-react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import loginAnimation from "../assets/login.json";
import logo from "../Assets/logo.png";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login attempted with:", { email, password });
    }, 1500);
  };

  return (
    <div className="login-page">
      {/* Decorative background circles */}
      <div className="login-page__decoration login-page__decoration--1" />
      <div className="login-page__decoration login-page__decoration--2" />
      <div className="login-page__decoration login-page__decoration--3" />

      {/* Single unified card — horizontal layout */}
      <div className="login-page__card">
        {/* Left: Logo + Lottie */}
        <div className="login-page__visual">
          <div className="login-page__gradient-bg" />
          <div className="login-page__logo-wrapper">
            <img src={logo} alt="GlobalMart" className="login-page__logo" />
          </div>
          <div className="login-page__animation-wrapper">
            <Lottie
              animationData={loginAnimation}
              loop={true}
              autoplay={true}
              className="login-page__lottie"
            />
          </div>
        </div>

        {/* Right: Form */}
        <div className="login-page__form-container">
          <div className="login-page__header">
            <h1>Welcome back</h1>
          </div>

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-group__icon">
                <FiMail />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="input-group__input"
              />
              <label htmlFor="email" className="input-group__label">
                Email Address
              </label>
            </div>

            <div className="input-group">
              <div className="input-group__icon">
                <FiLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className="login-page__forgot">
              <a href="/forgot-password" className="login-page__forgot-link">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className={`login-page__submit ${isLoading ? "login-page__submit--loading" : ""}`}
              disabled={isLoading}
            >
              <span className="login-page__submit-text">Sign In</span>
              <span className="login-page__submit-loader" />
            </button>
          </form>

          <div className="login-page__divider">
            <span>New to GlobalMart?</span>
          </div>

          <a href="/signup" className="login-page__signup">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
