import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./Home/Home"));
const Product = lazy(() => import("./pages/product"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Payment = lazy(() => import("./pages/Payment"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const InvoicePage = lazy(() => import("./pages/InvoicePage"));
const Search = lazy(() => import("./pages/search"));
const ForgotPassword = lazy(() => import("./pages/login/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/login/ResetPassword"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f2]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#3271D7] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bridal-lehenga" element={<Product />} />
          <Route path="/offers" element={<Product />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/invoice/:id" element={<InvoicePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
