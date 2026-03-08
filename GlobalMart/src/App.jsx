import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header.jsx";
import Hero from "./components/HeroSection.jsx";
import Gateway from "./components/MarketplaceGateway.jsx";
import Footer from "./components/Footer.jsx";
import NotFound from "./pages/NotFound.jsx";
import Categories from "./components/CategorySlider.jsx";
import Login from "./pages/LoginPage.jsx";

// Home Page Component
function HomePage() {
  return (
    <>
      <Hero />
      <Gateway />
      <Categories />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
