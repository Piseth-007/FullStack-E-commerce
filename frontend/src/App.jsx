import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { StoreSettingsProvider } from "./context/StoreSettingsContext";

import Navbar from "./components/storefront/Navbar";
import RequireAuth from "./components/RequireAuth";

import AdminRoute from "./components/admin/AdminRoute";
import Footer from "./components/storefront/Footer";
import ScrollProgress from "./components/storefront/ScrollProgress";
import { FavoritesProvider } from "./context/FavoriteContext";
import { LanguageProvider } from "./context/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/shop/Home"));
const ProductList = lazy(() => import("./pages/shop/ProductList"));
const ProductDetail = lazy(() => import("./pages/shop/ProductDetail"));
const Category = lazy(() => import("./pages/shop/Category"));
const Brand = lazy(() => import("./pages/shop/Brands"));
const Cart = lazy(() => import("./pages/shop/Cart"));
const Favorites = lazy(() => import("./pages/shop/Favorites"));
const Profile = lazy(() => import("./pages/shop/Profile"));
const Checkout = lazy(() => import("./pages/shop/Checkout"));
const OrderHistory = lazy(() => import("./pages/shop/OrderHistory"));
const OrderDetail = lazy(() => import("./pages/shop/OrderDetail"));
const About = lazy(() => import("./pages/shop/About"));
const Contact = lazy(() => import("./pages/shop/Contact"));
const Contacts = lazy(() => import("./pages/admin/Contacts"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));
const AdminForgotPassword = lazy(
  () => import("./pages/auth/AdminForgotPassword"),
);
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Brands = lazy(() => import("./pages/admin/Brands"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));

function StorefrontLayout() {
  return (
    <StoreSettingsProvider>
      <ScrollProgress />
      <Navbar />
      <Outlet />
      <Footer />
    </StoreSettingsProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ConfirmProvider>
                <FavoritesProvider>
                  <Suspense fallback={<div className="min-h-screen bg-paper" />}>
                    <Routes>
                    {/* Storefront — persistent header/footer, zero remounting */}
                    <Route element={<StorefrontLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/categories" element={<Category />} />
                      <Route path="/brands" element={<Brand />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/profile" element={<Profile />} />

                      {/* Storefront — requires login */}
                      <Route
                        path="/checkout"
                        element={
                          <RequireAuth>
                            <Checkout />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <RequireAuth>
                            <OrderHistory />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/orders/:id"
                        element={
                          <RequireAuth>
                            <OrderDetail />
                          </RequireAuth>
                        }
                      />
                    </Route>

                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/signup" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin/forgot-password"
                      element={<AdminForgotPassword />}
                    />

                    {/* Admin — no Navbar/storefront chrome */}
                    <Route
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      <Route path="/admin/dashboard" element={<Dashboard />} />
                      <Route path="/admin/products" element={<Products />} />
                      <Route
                        path="/admin/categories"
                        element={<Categories />}
                      />
                      <Route path="/admin/brands" element={<Brands />} />
                      <Route path="/admin/orders" element={<Orders />} />
                      <Route path="/admin/contacts" element={<Contacts />} />
                      <Route path="/admin/reviews" element={<Reviews />} />
                      <Route path="/admin/settings" element={<Settings />} />
                    </Route>
                  </Routes>
                </Suspense>
              </FavoritesProvider>
            </ConfirmProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);
}

export default App;
