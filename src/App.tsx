import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useAuth } from './contexts/AuthContext';
import { Home } from './pages/customer/Home';
import { Contact } from './pages/customer/Contact';
import { Login } from './pages/customer/Login';
import { Menu } from './pages/customer/Menu';
import { Offers } from './pages/customer/Offers';
import { Franchise } from './pages/customer/Franchise';
import { ProductDetail } from './pages/customer/ProductDetail';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsManager } from './pages/admin/ProductsManager';
import { CategoriesManager } from './pages/admin/CategoriesManager';
import { BranchesManager } from './pages/admin/BranchesManager';
import { FranchiseEnquiries } from './pages/admin/FranchiseEnquiries';
import { ReviewsModerator } from './pages/admin/ReviewsModerator';
import { HomepageCMS } from './pages/admin/HomepageCMS';
import { OffersCMS } from './pages/admin/OffersCMS';
import { LogsViewer } from './pages/admin/LogsViewer';
import ChangePassword from './pages/admin/ChangePassword';
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-bakery-beige/30 dark:bg-bakery-chocolate/50 px-4">
    <div className="max-w-2xl text-center space-y-6 bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm rounded-3xl p-8">
      <h1 className="font-serif text-5xl font-bold text-bakery-chocolate dark:text-bakery-cream">404</h1>
      <p className="text-base text-bakery-chocolate/70 dark:text-bakery-cream/70">Oops! We couldn't find that page.</p>
      <Link to="/" className="inline-flex items-center justify-center rounded-2xl bg-bakery-brown text-bakery-cream px-6 py-3 font-bold hover:bg-bakery-brown-dark transition-all">Return Home</Link>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-bakery-surface text-bakery-chocolate dark:bg-gray-950 dark:text-bakery-cream">
      <ScrollToTop />
      <Navbar />
      <main className="pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/menu/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="branches" element={<BranchesManager />} />
            <Route path="franchise" element={<FranchiseEnquiries />} />
            <Route path="reviews" element={<ReviewsModerator />} />
            <Route path="homepage" element={<HomepageCMS />} />
            <Route path="offers" element={<OffersCMS />} />
            <Route path="logs" element={<LogsViewer />} />
           <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
