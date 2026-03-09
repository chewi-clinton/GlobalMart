import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header.jsx";
import Hero from "./components/HeroSection.jsx";
import Gateway from "./components/MarketplaceGateway.jsx";
import Footer from "./components/Footer.jsx";
import NotFound from "./pages/NotFound.jsx";
import Categories from "./components/CategorySlider.jsx";
import Login from "./pages/LoginPage.jsx";
import Cart from "./pages/CartPage.jsx";
import Favorite from "./pages/FavoritesPage.jsx";
import Shop from "./pages/ShopePage.jsx";
import Register from "./pages/RegisterPage.jsx";
import ProductDetail from "./components/ProductDetailOverlay.jsx";
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

            <Route path="/Product-Detail" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
