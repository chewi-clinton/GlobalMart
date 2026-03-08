import { useState } from "react";
import "./App.css";

import Header from "./components/Header.jsx";
import Hero from "./components/HeroSection.jsx";
import Gateway from "./components/MarketplaceGateway.jsx";
import Footer from "./components/Footer.jsx";
function App() {
  return (
    <div className="app-container">
      <Header />
      <Hero />
      <Gateway />
      <Footer />
    </div>
  );
}

export default App;
