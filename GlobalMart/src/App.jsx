import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header.jsx";
import Hero from "./components/HeroSection.jsx";
import Gateway from "./components/MarketplaceGateway.jsx";
import Footer from "./components/Footer.jsx";
import NotFound from "./pages/NotFound.jsx";
import MembershipAgreement from "./pages/MembershipAgreement";
import TermsOfService from "./pages/TermsOfService.jsx";
import Categories from "./components/CategorySlider.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Login from "./pages/LoginPage.jsx";
import Cart from "./pages/CartPage.jsx";
import Favorite from "./pages/FavoritesPage.jsx";
import Shop from "./pages/ShopePage.jsx";
import Register from "./pages/RegisterPage.jsx";
import ProductDetail from "./components/ProductDetailOverlay.jsx";
import WarehouseAdmin from "./admin/WarehouseAdmin.jsx";
import CustomerOrderAdmin from "./admin/CustomerOrderAdmin.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
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
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/Product-Detail" element={<ProductDetail />} />
            <Route path="/Terms" element={<TermsOfService />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shop" element={<Shop />} />
            <Route
              path="/membership-agreement"
              element={<MembershipAgreement />}
            />
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/warehouse" element={<WarehouseAdmin />} />
            <Route path="/admin/customers" element={<CustomerOrderAdmin />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="*" element={<NotFound />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
