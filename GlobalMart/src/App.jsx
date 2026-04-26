import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };
import "./App.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AdminRoute, SellerRoute } from "./components/AdminRoute";

import Header from "./components/Header.jsx";
import Toast from "./components/Toast.jsx";
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
import PaymentPage from "./pages/PaymentPage.jsx";
import CustomerOrderAdmin from "./admin/CustomerOrderAdmin.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";

import SellerDashboard from "./pages/SellerDashboard.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
// Home Page Component
function HomePage() {
  return (
    <>
      <Hero />

      <Categories />
      <Footer />
    </>
  );
}

function App() {
  return (
    <CurrencyProvider>
    <Router future={routerFuture}>
      <div className="app-container">
        <Toast />
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
            <Route path="/admin/warehouse" element={<AdminRoute><WarehouseAdmin /></AdminRoute>} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/admin/customers" element={<AdminRoute><CustomerOrderAdmin /></AdminRoute>} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/seller" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
            <Route path="/super-admin" element={<AdminRoute><SuperAdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
         <Footer />
      </div>
    </Router>
    </CurrencyProvider>
  );
}

export default App;
