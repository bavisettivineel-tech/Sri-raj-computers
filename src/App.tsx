import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";

import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyAccountPage from "./pages/MyAccountPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDealers from "./pages/admin/AdminDealers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminDeals from "./pages/admin/AdminDeals";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReports from "./pages/admin/AdminReports";
import AdminContact from "./pages/admin/AdminContact";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import TermsConditions from "./pages/TermsConditions";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import NotFound from "./pages/NotFound";
import CartPanel from "./components/CartPanel";
import WishlistPanel from "./components/WishlistPanel";
import SearchOverlay from "./components/SearchOverlay";
import SideMenu from "./components/SideMenu";
import AuthModal from "./components/AuthModal";
import SplashScreen from "./components/SplashScreen";
import SupportChatPanel from "./components/SupportChatPanel";
import { useStore } from "./store/useStore";
import { SectionErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const AppContent = () => {
  const { authOpen, setAuthOpen, syncCart, syncWishlist } = useStore();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      syncCart(user.id);
      syncWishlist(user.id);
    }
  }, [user, loading]);

  return (
    <>
      <SplashScreen />
      <SectionErrorBoundary name="Main App Section">
        <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/cart" element={<CheckoutPage />} />
        <Route path="/account" element={<MyAccountPage />} />
        <Route path="/order/:id" element={<OrderTrackingPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/brands" element={<AdminBrands />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/dealers" element={<AdminDealers />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/admin/deals" element={<AdminDeals />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/contact" element={<AdminContact />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/returns-refunds" element={<ReturnsPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SectionErrorBoundary>
      <CartPanel />
      <WishlistPanel />
      <SearchOverlay />
      <SideMenu />
      <SupportChatPanel />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
