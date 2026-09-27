import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Search,
  ArrowLeft,
  ArrowRight,
  Home,
  ShoppingBag,
  Tag,
  Award,
  HelpCircle,
  PackageOpen,
  Leaf,
} from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

export default function NotFound({
  type = "page",
  customTitle,
  customDesc,
}) {
  const navigate = useNavigate();
  const { t, isKhmer } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
  };

  const isProduct = type === "product";

  const title =
    customTitle ||
    (isProduct
      ? t("not_found_product_title", "Product Not Found")
      : t("not_found_title", "Page Not Found"));

  const desc =
    customDesc ||
    (isProduct
      ? t(
          "not_found_product_desc",
          "This product is no longer available or the link may have changed.",
        )
      : t(
          "not_found_desc",
          "The page you're looking for doesn't exist, may have been removed, or the link might be broken.",
        ));

  return (
    <div
      className={`min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 relative overflow-hidden bg-paper text-ink ${
        isKhmer ? "font-khmer" : ""
      }`}
    >
      <style>{`
        @keyframes notfound-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: notfound-spin 14s linear infinite;
        }
      `}</style>
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-moss/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-clay/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl mx-auto text-center animate-in fade-in duration-500">
        {/* Large Decorative 404 Watermark */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <span
            className="font-display text-[96px] sm:text-[130px] font-bold leading-none tracking-tighter select-none text-moss/10"
            aria-hidden="true"
          >
            404
          </span>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-surface border border-hairline shadow-lg flex items-center justify-center text-moss transition-transform duration-500 hover:scale-105">
              {isProduct ? (
                <PackageOpen size={32} strokeWidth={1.5} />
              ) : (
                <Compass size={32} strokeWidth={1.5} className="animate-spin-slow" />
              )}
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-hairline bg-surface/80 text-[11px] font-mono tracking-wider text-moss uppercase mb-4 shadow-2xs backdrop-blur-xs">
          <Leaf size={12} strokeWidth={2} />
          <span>{t("not_found_badge", "404 Not Found")}</span>
        </div>

        {/* Title & Description */}
        <h1 className="font-display text-2xl sm:text-[36px] font-semibold text-ink leading-tight tracking-[-0.02em] mb-3">
          {title}
        </h1>
        <p className="text-[14px] sm:text-[15px] text-stone leading-relaxed max-w-md mx-auto mb-8">
          {desc}
        </p>

        {/* Direct Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-md mx-auto mb-8 shadow-xs rounded-2xl overflow-hidden border border-hairline focus-within:border-moss/60 focus-within:ring-2 focus-within:ring-moss/20 transition-all bg-surface"
        >
          <div className="flex items-center px-4 py-2.5">
            <Search size={16} className="text-stone shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "not_found_search_placeholder",
                "Try searching for products or brands...",
              )}
              className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-stone/60 outline-hidden"
            />
            <button
              type="submit"
              className="ml-2 shrink-0 px-3.5 py-1.5 rounded-xl bg-moss hover:bg-moss-deep text-white text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              {t("not_found_search_btn", "Search")}
            </button>
          </div>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-hairline bg-surface hover:bg-paper text-ink text-[13px] font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{t("not_found_btn_back", "Go Back")}</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-hairline bg-surface hover:bg-paper text-ink text-[13px] font-medium transition-colors shadow-2xs"
          >
            <Home size={14} />
            <span>{t("not_found_btn_home", "Back to Home")}</span>
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-moss hover:bg-moss-deep text-white text-[13px] font-medium transition-colors shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>{t("not_found_btn_shop", "Browse Collection")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Quick Discovery Destinations */}
        <div className="border-t border-hairline pt-8 max-w-lg mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-stone mb-4">
            {t("not_found_popular_title", "Helpful links")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <Link
              to="/products"
              className="group p-3 rounded-xl border border-hairline bg-surface hover:border-moss/30 hover:bg-moss-tint/20 transition-all flex flex-col justify-between"
            >
              <ShoppingBag size={16} className="text-moss mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[12.5px] font-medium text-ink group-hover:text-moss transition-colors">
                {t("nav_shop_all", "Shop all")}
              </span>
            </Link>

            <Link
              to="/categories"
              className="group p-3 rounded-xl border border-hairline bg-surface hover:border-moss/30 hover:bg-moss-tint/20 transition-all flex flex-col justify-between"
            >
              <Tag size={16} className="text-moss mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[12.5px] font-medium text-ink group-hover:text-moss transition-colors">
                {t("not_found_link_categories", "Categories")}
              </span>
            </Link>

            <Link
              to="/brands"
              className="group p-3 rounded-xl border border-hairline bg-surface hover:border-moss/30 hover:bg-moss-tint/20 transition-all flex flex-col justify-between"
            >
              <Award size={16} className="text-moss mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[12.5px] font-medium text-ink group-hover:text-moss transition-colors">
                {t("not_found_link_brands", "Brands")}
              </span>
            </Link>

            <Link
              to="/contact"
              className="group p-3 rounded-xl border border-hairline bg-surface hover:border-moss/30 hover:bg-moss-tint/20 transition-all flex flex-col justify-between"
            >
              <HelpCircle size={16} className="text-moss mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[12.5px] font-medium text-ink group-hover:text-moss transition-colors">
                {t("not_found_link_contact", "Contact")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
