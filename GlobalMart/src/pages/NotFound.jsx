import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      {/* Animated Background Stars */}
      <div className="not-found__stars">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              "--delay": `${i * 0.5}s`,
              "--x": `${Math.random() * 100}%`,
              "--y": `${Math.random() * 100}%`,
              "--size": `${Math.random() * 4 + 2}px`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="not-found__container">
        {/* Animated SVG Illustration */}
        <div className="not-found__illustration">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="illustration-svg"
          >
            {/* Orange Background Shape */}
            <circle
              cx="200"
              cy="180"
              r="140"
              fill="#f0c14b"
              opacity="0.15"
              className="bg-circle"
            />
            <circle
              cx="200"
              cy="180"
              r="100"
              fill="#f0c14b"
              opacity="0.2"
              className="bg-circle-inner"
            />

            {/* Tripod Legs */}
            <g className="tripod">
              <line
                x1="180"
                y1="280"
                x2="140"
                y2="360"
                stroke="#1a1a1a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="220"
                y1="280"
                x2="260"
                y2="360"
                stroke="#1a1a1a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="200"
                y1="280"
                x2="200"
                y2="370"
                stroke="#1a1a1a"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Telescope Group - Animated */}
            <g className="telescope">
              {/* Telescope Mount */}
              <rect
                x="185"
                y="260"
                width="30"
                height="25"
                rx="4"
                fill="#1a1a1a"
              />

              {/* Main Telescope Body */}
              <g transform="rotate(0, 200, 200)">
                <rect
                  x="165"
                  y="120"
                  width="70"
                  height="100"
                  rx="8"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                />

                {/* Lens */}
                <circle
                  cx="200"
                  cy="130"
                  r="28"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="3"
                />
                <circle
                  cx="200"
                  cy="130"
                  r="18"
                  fill="#f5f5f5"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
                <circle
                  cx="200"
                  cy="130"
                  r="8"
                  fill="#f0c14b"
                  opacity="0.3"
                  className="lens-glow"
                />

                {/* Eyepiece */}
                <rect
                  x="185"
                  y="215"
                  width="30"
                  height="40"
                  rx="4"
                  fill="#1a1a1a"
                />
                <ellipse cx="200" cy="255" rx="12" ry="6" fill="#1a1a1a" />
              </g>
            </g>

            {/* Explorer Character */}
            <g className="explorer">
              {/* Body */}
              <ellipse
                cx="130"
                cy="290"
                rx="25"
                ry="35"
                fill="#ffffff"
                stroke="#1a1a1a"
                strokeWidth="3"
              />

              {/* Head */}
              <circle
                cx="130"
                cy="230"
                r="30"
                fill="#ffffff"
                stroke="#1a1a1a"
                strokeWidth="3"
              />

              {/* Hair */}
              <path
                d="M105 220 Q130 195 155 220"
                stroke="#1a1a1a"
                strokeWidth="3"
                fill="none"
              />

              {/* Eye - Looking into telescope (animated) */}
              <g className="eye">
                <ellipse
                  cx="145"
                  cy="230"
                  rx="8"
                  ry="10"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
                <circle
                  cx="147"
                  cy="232"
                  r="4"
                  fill="#1a1a1a"
                  className="pupil"
                />
              </g>

              {/* Other Eye (closed/squinting) */}
              <path
                d="M110 228 Q115 232 120 228"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Nose */}
              <path
                d="M130 235 L128 245 L132 245"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Smile */}
              <path
                d="M118 252 Q130 260 142 252"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Arm reaching to telescope */}
              <path
                d="M155 280 Q170 250 185 240"
                stroke="#1a1a1a"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Hand */}
              <circle
                cx="185"
                cy="240"
                r="8"
                fill="#ffffff"
                stroke="#1a1a1a"
                strokeWidth="2"
              />
            </g>

            {/* Decorative Elements */}
            <circle
              cx="320"
              cy="100"
              r="4"
              fill="#f0c14b"
              className="decorative-star"
            />
            <circle
              cx="80"
              cy="120"
              r="3"
              fill="#f0c14b"
              className="decorative-star"
            />
            <circle
              cx="350"
              cy="200"
              r="3"
              fill="#f0c14b"
              className="decorative-star"
            />
            <circle
              cx="60"
              cy="280"
              r="2"
              fill="#f0c14b"
              className="decorative-star"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className="not-found__content">
          <p className="not-found__subtext">
            Error 404: We looked everywhere but couldn't find this page.
          </p>
          <p className="not-found__subtext not-found__subtext--secondary">
            Alternatively, this section of GlobalMart may still be under
            construction as we onboard new global partners.
          </p>
        </div>

        {/* Navigation Button */}
        <div className="not-found__action">
          <Link to="/" className="not-found__button">
            <span>Go to Home Page</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
