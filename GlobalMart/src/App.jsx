import { useState } from "react";
import "./App.css";

import Header from "./components/Header.jsx";
import Hero from "./components/HeroSection.jsx";
function App() {
  return (
    <div className="app-container">
      <Header />
      <Hero />

      {/* The rest of your app components will go here below the header */}
    </div>
  );
}

export default App;
