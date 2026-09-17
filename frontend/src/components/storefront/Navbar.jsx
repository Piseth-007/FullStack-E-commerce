import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Leaf,
  Menu,
  X,
  LogOut,
  Package,
  Tag,
  Percent,
  Award,
  Sun,
  Moon,
  ChevronDown,
  ArrowRight,
  Languages,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import { useCart } from "../../context/useCard";
import { FavoritesContext } from "../../context/FavoriteContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../context/useLanguage";
import api from "../../api/axios";
import { prefetchApi, fetchWithCache } from "../../utils/apiCache";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: favoriteCount } = useContext(FavoritesContext);
  const store = useStoreSettings();
  const { language, setLanguage, toggleLanguage, t, isKhmer } = useLanguage();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { isDark: darkMode, toggleTheme } = useTheme();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const closeTimer = useRef(null);
  const searchFocused = useRef(false);
  const searchInputRef = useRef(null);

  const profileImage =
    user?.profile_image ||
    user?.avatar ||
    user?.image_url ||
    user?.profile?.image_url ||
    null;

  useEffect(() => {
    let mounted = true;

    const fetchNavbarData = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          fetchWithCache("/categories"),
          fetchWithCache("/brands"),
        ]);

        if (!mounted) return;

        const categoryData = Array.isArray(categoriesResponse?.data)
          ? categoriesResponse.data
          : Array.isArray(categoriesResponse)
            ? categoriesResponse
            : [];

        const brandData = Array.isArray(brandsResponse?.data)
          ? brandsResponse.data
          : Array.isArray(brandsResponse)
            ? brandsResponse
            : [];

        setCategories(categoryData);
        setBrands(brandData);
      } catch (error) {
        if (!mounted) return;

        console.error("Failed to load navbar data:", error);

        setCategories([]);
        setBrands([]);
      }
    };

    fetchNavbarData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (openMenu === "search") {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [openMenu]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && openMenu === "search") {
        searchFocused.current = false;
        setOpenMenu(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openMenu]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccountOpen(false);
      setMenuOpen(false);
      navigate("/");
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();

    const trimmed = searchTerm.trim();

    if (!trimmed) return;

    navigate(`/products?search=${encodeURIComponent(trimmed)}`);

    searchFocused.current = false;
    setOpenMenu(null);
    setSearchTerm("");
  };

  const toggleSearch = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    if (openMenu === "search") {
      searchFocused.current = false;
      setOpenMenu(null);
    } else {
      openDropdown("search");
    }
  };

  const closeSearch = () => {
    searchFocused.current = false;
    setOpenMenu(null);
  };

  const openDropdown = (key) => {
    clearTimeout(closeTimer.current);
    if (key === "search") {
      setMenuOpen(false);
      setAccountOpen(false);
    }
    setOpenMenu(key);
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);

    closeTimer.current = setTimeout(() => {
      if (searchFocused.current) return;
      setOpenMenu(null);
    }, 180);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-hairline">
      <style>{`
        @keyframes navdrop-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes navmega-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes navmenu-in {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes navbadge-pop {
          0% {
            transform: scale(.55);
            opacity: 0;
          }

          70% {
            transform: scale(1.12);
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .navdrop-in {
          animation: navdrop-in .18s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .navmega-in {
          animation: navmega-in .2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .navmenu-in {
          animation: navmenu-in .3s cubic-bezier(.22, 1, .36, 1) both;
        }

        .nav-action {
          transition:
            transform .2s cubic-bezier(.22, 1, .36, 1),
            color .2s ease,
            background-color .2s ease,
            border-color .2s ease;
        }

        .nav-action:hover {
          transform: translateY(-1px);
        }

        .nav-action:active {
          transform: translateY(0) scale(.94);
        }

        .nav-link {
          position: relative;
          transition: color .2s ease;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 1.5px;
          border-radius: 0px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: center;
          transition:
            transform .24s cubic-bezier(.22, 1, .36, 1);
        }

        .nav-link:hover::after {
          transform: scaleX(1);
        }

        .nav-cart-badge {
          animation: navbadge-pop .32s
            cubic-bezier(.22, 1, .36, 1) both;
        }

        .nav-profile-image {
          transition:
            transform .2s cubic-bezier(.22, 1, .36, 1),
            opacity .2s ease;
        }

        .nav-profile-image:hover {
          transform: scale(1.04);
        }

        @media (prefers-reduced-motion: reduce) {
          .navdrop-in,
          .navmega-in,
          .navmenu-in,
          .nav-cart-badge {
            animation: none !important;
          }

          .nav-action,
          .nav-link::after,
          .nav-profile-image {
            transition: none !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
        <Link
          to="/"
          className="nav-action flex items-center gap-2 shrink-0"
          aria-label="Botaniq home"
        >
          {store.logo?.url ? (
            <img
              src={store.logo.url}
              alt=""
              className="h-7 w-7 rounded-md object-cover"
            />
          ) : (
            <Leaf size={18} className="text-moss" strokeWidth={1.75} />
          )}

          <span className="font-display text-[18px] font-medium text-ink">
            {store.name || "Botaniq"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-5 lg:gap-6 text-[13.5px] font-medium text-stone">
          <Link
            to="/products"
            onMouseEnter={() => {
              prefetchApi("/products", { page: "1" });
              import("../../pages/shop/ProductList").catch(() => {});
            }}
            className="nav-link hover:text-ink"
          >
            {t("nav_shop_all", "Shop all")}
          </Link>
          <div
            onMouseEnter={() => {
              openDropdown("categories");
              prefetchApi("/categories");
              import("../../pages/shop/Category").catch(() => {});
            }}
            onMouseLeave={scheduleClose}
          >
            <Link
              to="/categories"
              className={`nav-link flex items-center gap-1 ${
                openMenu === "categories" ? "text-ink" : "hover:text-ink"
              }`}
            >
              {t("nav_categories", "Categories")}
              <ChevronDown
                size={13}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  openMenu === "categories" ? "rotate-180" : ""
                }`}
              />
            </Link>

            {openMenu === "categories" && (
              <MegaMenu
                title="Shop by category"
                description="Explore every category, from cleansers to serums, curated for your skin."
                items={categories}
                emptyLabel="No categories yet"
                buildHref={(item) => `/products?category_id=${item.id}`}
                viewAllHref="/categories"
                viewAllLabel="View all categories"
                onNavigate={() => setOpenMenu(null)}
                onMouseEnter={() => openDropdown("categories")}
                onMouseLeave={scheduleClose}
              />
            )}
          </div>

          <div
            onMouseEnter={() => {
              openDropdown("brands");
              prefetchApi("/brands");
              import("../../pages/shop/Brands").catch(() => {});
            }}
            onMouseLeave={scheduleClose}
          >
            <Link
              to="/brands"
              className={`nav-link flex items-center gap-1 ${
                openMenu === "brands" ? "text-ink" : "hover:text-ink"
              }`}
            >
              {t("nav_brands", "Brands")}
              <ChevronDown
                size={13}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  openMenu === "brands" ? "rotate-180" : ""
                }`}
              />
            </Link>

            {openMenu === "brands" && (
              <MegaMenu
                title="Shop by brand"
                description="Discover the brands behind your favorite formulas."
                items={brands}
                emptyLabel="No brands yet"
                buildHref={(item) => `/products?brand_id=${item.id}`}
                viewAllHref="/brands"
                viewAllLabel="View all brands"
                onNavigate={() => setOpenMenu(null)}
                onMouseEnter={() => openDropdown("brands")}
                onMouseLeave={scheduleClose}
                showLogo
              />
            )}
          </div>

          <Link
            to="/products?has_rating=1&sort=rating"
            className="nav-link hover:text-ink"
          >
            {t("nav_best_rated", "Best rated")}
          </Link>

          <Link
            to="/products?has_discount=1&sort=discount"
            className="nav-link hover:text-ink"
          >
            {t("nav_promotions", "Promotions")}
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 justify-self-end">
          <div
            className="relative"
            onMouseEnter={() => openDropdown("search")}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={toggleSearch}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                openMenu === "search"
                  ? "bg-moss text-white shadow-xs"
                  : "text-stone hover:bg-paper hover:text-ink"
              }`}
              aria-label={openMenu === "search" ? "Close search" : "Search"}
              aria-expanded={openMenu === "search"}
            >
              {openMenu === "search" ? (
                <X size={18} strokeWidth={1.75} />
              ) : (
                <Search size={18} strokeWidth={1.75} />
              )}
            </button>
          </div>

          <Link
            to="/cart"
            onMouseEnter={() => {
              import("../../pages/shop/Cart").catch(() => {});
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-paper hover:text-ink"
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          >
            <ShoppingBag size={18} strokeWidth={1.75} />

            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-moss px-1 text-[9px] font-semibold text-white shadow-2xs">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <Link
            to="/favorites"
            onMouseEnter={() => {
              import("../../pages/shop/Favorites").catch(() => {});
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-paper hover:text-ink"
            aria-label={`Favorites${
              favoriteCount > 0 ? `, ${favoriteCount} items` : ""
            }`}
          >
            <Heart size={18} strokeWidth={1.75} />

            {favoriteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-semibold text-white shadow-2xs">
                {favoriteCount > 99 ? "99+" : favoriteCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-hairline bg-paper text-stone transition-all hover:ring-moss hover:ring-2"
                aria-label="Account menu"
                aria-expanded={accountOpen}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={user.name || "Profile"}
                    className="h-full w-full object-cover rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <User size={18} strokeWidth={1.75} />
                )}
              </button>

              {accountOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAccountOpen(false)}
                    aria-hidden="true"
                  />

                  <div className="navdrop-in absolute right-0 top-11 z-50 w-56 rounded-2xl border border-hairline bg-surface shadow-[0_12px_32px_rgba(33,31,27,0.12)] p-1.5">
                    <div className="px-3.5 py-2.5 mb-1 border-b border-hairline">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-hairline bg-paper flex items-center justify-center">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={user.name || "Profile"}
                              className="h-full w-full object-cover rounded-full"
                            />
                          ) : (
                            <User size={15} strokeWidth={1.75} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-ink truncate">
                            {user.name || "User"}
                          </p>

                          <p className="text-[12px] text-stone truncate">
                            {user.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-ink hover:bg-paper transition-colors"
                    >
                      <Package size={15} strokeWidth={1.75} />
                      My orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-ink hover:bg-paper transition-colors"
                    >
                      <User size={15} strokeWidth={1.75} />
                      My profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-stone hover:bg-clay-tint hover:text-clay transition-colors"
                    >
                      <LogOut size={15} strokeWidth={1.75} />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex h-9 items-center gap-1.5 px-2.5 sm:px-3.5 rounded-full border border-hairline bg-surface text-stone hover:text-ink hover:border-moss hover:bg-paper transition-all text-[13px] font-medium shadow-2xs"
            >
              <User size={15} strokeWidth={1.75} />
              <span className="hidden sm:inline">{t("nav_signin", "Sign in")}</span>
            </Link>
          )}

          {/* Font & Language Switcher (EN / ខ្មែរ) */}
          <div
            className="hidden sm:flex items-center rounded-full border border-hairline bg-surface p-1 text-[11px] font-medium shadow-2xs"
            role="group"
            aria-label={t("nav_language", "Language & Font")}
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1 text-center transition-all duration-200 ${
                language === "en"
                  ? "bg-moss text-white font-semibold shadow-xs"
                  : "text-stone hover:text-ink hover:bg-paper"
              }`}
              title="English Font (Inter & Fraunces)"
              aria-label="Switch to English font"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("km")}
              className={`rounded-full px-3 py-1 text-center transition-all duration-200 ${
                language === "km"
                  ? "bg-moss text-white font-semibold shadow-xs"
                  : "text-stone hover:text-ink hover:bg-paper"
              }`}
              title="Khmer Font (Google Sans & Poppins)"
              aria-label="Switch to Khmer font"
            >
              ខ្មែរ
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-paper hover:text-ink"
            aria-label={
              darkMode ? t("nav_theme_light", "Switch to light mode") : t("nav_theme_dark", "Switch to dark mode")
            }
            title={darkMode ? t("nav_theme_light", "Light mode") : t("nav_theme_dark", "Dark mode")}
          >
            {darkMode ? (
              <Sun size={18} strokeWidth={1.75} />
            ) : (
              <Moon size={18} strokeWidth={1.75} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-paper hover:text-ink md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={18} strokeWidth={1.75} />
            ) : (
              <Menu size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {openMenu === "search" && (
        <SearchDropdown
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSubmit={handleSearchSubmit}
          onClose={closeSearch}
          categories={categories}
          brands={brands}
          onMouseEnter={() => openDropdown("search")}
          onMouseLeave={scheduleClose}
          searchInputRef={searchInputRef}
          onFocus={() => {
            searchFocused.current = true;
            openDropdown("search");
          }}
          onBlur={() => {
            searchFocused.current = false;
          }}
          t={t}
        />
      )}

      {menuOpen && (
        <nav
          className="navmenu-in md:hidden border-t border-hairline px-4 sm:px-6 py-3 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          <Link
            to="/products"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
          >
            <ShoppingBag size={15} strokeWidth={1.75} />
            {t("nav_shop_all", "Shop all")}
          </Link>

          <Link
            to="/categories"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
          >
            <Tag size={15} strokeWidth={1.75} />
            {t("nav_categories", "Categories")}
          </Link>

          <Link
            to="/brands"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
          >
            <Award size={15} strokeWidth={1.75} />
            {t("nav_brands", "Brands")}
          </Link>

          <Link
            to="/favorites"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
          >
            <Heart size={15} strokeWidth={1.75} />
            {t("nav_favorites", "Favorites")}
            {favoriteCount > 0 && (
              <span className="ml-auto rounded-full border border-clay bg-clay px-1.5 py-0.5 text-[10px] font-mono font-medium text-white">
                {favoriteCount > 99 ? "99+" : favoriteCount}
              </span>
            )}
          </Link>

          <Link
            to="/products?has_rating=1&sort=rating"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
          >
            <Award size={15} strokeWidth={1.75} />
            {t("shop_best_rated", "Best rated")}
          </Link>

          <Link
            to="/products?has_discount=1&sort=discount"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
          >
            <Percent size={15} strokeWidth={1.75} />
            {t("shop_promotions", "Promotions")}
          </Link>

          {/* Language & Font toggle in mobile drawer */}
          <div className="mt-2 pt-2.5 border-t border-hairline flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-stone flex items-center gap-2">
              <Languages size={15} strokeWidth={1.75} className="text-moss" />
              {t("nav_language", "Language & Font")}
            </span>

            <div className="flex items-center rounded-full border border-hairline bg-surface p-1 text-[11px] font-medium shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-3 py-1 transition-all duration-200 ${
                  language === "en"
                    ? "bg-moss text-white font-semibold shadow-xs"
                    : "text-stone hover:text-ink hover:bg-paper"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("km")}
                className={`rounded-full px-3 py-1 transition-all duration-200 ${
                  language === "km"
                    ? "bg-moss text-white font-semibold shadow-xs"
                    : "text-stone hover:text-ink hover:bg-paper"
                }`}
              >
                ភាសាខ្មែរ
              </button>
            </div>
          </div>

          {user && (
            <div className="mt-2 pt-2 border-t border-hairline">
              <div className="flex items-center gap-3 py-2.5 mb-1">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-hairline bg-paper flex items-center justify-center text-stone">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <User size={17} strokeWidth={1.75} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {user.name || "User"}
                  </p>

                  <p className="text-[12px] text-stone truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>

              <Link
                to="/orders"
                onClick={closeMobileMenu}
                className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
              >
                <Package size={15} strokeWidth={1.75} />
                {t("nav_orders", "My orders")}
              </Link>

              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-stone hover:text-ink"
              >
                <User size={15} strokeWidth={1.75} />
                {t("nav_profile", "My profile")}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full py-2 text-[13.5px] font-medium text-stone hover:text-clay"
              >
                <LogOut size={15} strokeWidth={1.75} />
                {t("nav_signout", "Log out")}
              </button>
            </div>
          )}

          {!user && (
            <div className="mt-2 pt-2 border-t border-hairline">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center gap-2.5 py-2 text-[13.5px] font-medium text-moss hover:text-moss-deep"
              >
                <User size={15} strokeWidth={1.75} />
                {t("nav_signin", "Sign in")}
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}



function MegaMenu({
  title,
  description,
  items,
  emptyLabel,
  buildHref,
  viewAllHref,
  viewAllLabel,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
  showLogo = false,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div
      className="navmega-in absolute left-0 top-full z-30 w-screen border-t border-hairline bg-surface shadow-[0_24px_60px_rgba(33,31,27,0.12)]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[1fr_260px]">
        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            {title}
          </p>

          {safeItems.length === 0 ? (
            <p className="text-[13px] text-stone">{emptyLabel}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
              {safeItems.map((item) => (
                <Link
                  key={item.id}
                  to={buildHref(item)}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-[13.5px] font-medium capitalize text-ink transition-colors hover:bg-paper hover:text-moss"
                >
                  {showLogo && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-paper">
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt=""
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-moss">
                          {item.name?.charAt(0).toUpperCase() || "B"}
                        </span>
                      )}
                    </span>
                  )}

                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-hairline bg-moss-tint p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-surface text-moss">
            <Leaf size={16} strokeWidth={1.75} />
          </span>

          <p className="mt-4 font-display text-[17px] font-medium text-ink">
            {description}
          </p>

          <Link
            to={viewAllHref}
            onClick={onNavigate}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-moss hover:text-moss-deep"
          >
            {viewAllLabel}
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchDropdown({
  searchTerm,
  setSearchTerm,
  onSubmit,
  onClose,
  categories = [],
  brands = [],
  onMouseEnter,
  onMouseLeave,
  searchInputRef,
  onFocus,
  onBlur,
  t,
}) {
  const navigate = useNavigate();

  const trimmed = searchTerm.trim().toLowerCase();
  const matchingCategories = trimmed
    ? categories
        .filter((c) => c.name?.toLowerCase().includes(trimmed))
        .slice(0, 5)
    : [];
  const matchingBrands = trimmed
    ? brands
        .filter((b) => b.name?.toLowerCase().includes(trimmed))
        .slice(0, 5)
    : [];

  const POPULAR_SEARCHES = [
    "Serum",
    "Cleanser",
    "Moisturizer",
    "Sunscreen",
    "Toner",
    "Best rated",
  ];

  const handleSuggestionClick = (query) => {
    setSearchTerm(query);
    navigate(`/products?search=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 top-16 z-25 bg-ink/15 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="navmega-in absolute left-0 right-0 top-full z-30 w-full border-t border-hairline bg-surface/98 backdrop-blur-md shadow-[0_24px_60px_rgba(33,31,27,0.12)]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-5 sm:py-7">
          {/* Main Search Input Form */}
          <form onSubmit={onSubmit} className="relative">
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-4 text-moss pointer-events-none"
                strokeWidth={2}
              />

              <input
                ref={searchInputRef}
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={t(
                  "nav_search_placeholder",
                  "Search products, brands, or categories...",
                )}
                className="w-full pl-11 pr-24 sm:pr-28 py-3 rounded-2xl border border-hairline bg-paper text-[14px] sm:text-[15px] text-ink placeholder:text-stone/50 focus:outline-none focus:ring-2 focus:ring-moss/25 focus:border-moss transition-all shadow-xs"
                aria-label={t("nav_search_aria", "Search products")}
              />

              <div className="absolute right-2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="p-1.5 text-stone hover:text-ink rounded-lg hover:bg-surface transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-moss text-white text-[12.5px] sm:text-[13px] font-medium hover:bg-moss-deep transition-all shadow-xs active:scale-95 shrink-0"
                >
                  <span>{t("search", "Search")}</span>
                  <ArrowRight size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
          </form>

          {/* Dynamic Content: Live suggestions or Popular Searches */}
          <div className="mt-4 sm:mt-5">
            {trimmed ? (
              /* Live matches while typing */
              <div className="space-y-3">
                {matchingCategories.length > 0 && (
                  <div>
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-stone mb-2">
                      {t("nav_categories", "Categories")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchingCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category_id=${cat.id}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-paper text-[12.5px] font-medium text-ink hover:border-moss hover:bg-moss-tint hover:text-moss-deep transition-all"
                        >
                          <Tag size={12} className="text-moss" />
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {matchingBrands.length > 0 && (
                  <div>
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-stone mb-2">
                      {t("nav_brands", "Brands")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchingBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          to={`/products?brand_id=${brand.id}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-paper text-[12.5px] font-medium text-ink hover:border-moss hover:bg-moss-tint hover:text-moss-deep transition-all"
                        >
                          <Award size={12} className="text-moss" />
                          <span>{brand.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {matchingCategories.length === 0 && matchingBrands.length === 0 && (
                  <p className="text-xs text-stone pt-1">
                    Press <span className="font-mono text-ink font-semibold">Enter</span> to search for "{searchTerm}"
                  </p>
                )}
              </div>
            ) : (
              /* Default: Popular searches & Browse categories */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1">
                <div>
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-stone mb-2">
                    {t("search_popular", "Popular searches")}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {POPULAR_SEARCHES.map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => handleSuggestionClick(query)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-hairline bg-paper text-[11.5px] sm:text-[12px] font-medium text-stone hover:text-ink hover:border-moss/40 hover:bg-moss-tint hover:text-moss-deep transition-all active:scale-95"
                      >
                        <Search size={10} className="text-stone/60" />
                        <span>{query}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {categories.length > 0 && (
                  <div>
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-stone mb-2">
                      {t("search_explore_categories", "Explore categories")}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category_id=${cat.id}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-hairline bg-paper text-[11.5px] sm:text-[12px] font-medium text-stone hover:text-ink hover:border-moss/40 hover:bg-moss-tint hover:text-moss-deep transition-all"
                        >
                          <Leaf size={10} className="text-moss" />
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
