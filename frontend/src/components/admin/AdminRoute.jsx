import { useState } from "react";
import { Navigate, Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Home,
  User,
  LogOut,
  Languages,
  Leaf,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/useLanguage";

export default function AdminRoute({ children }) {
  const { user, loading, logout } = useAuth();
  const { language, toggleLanguage, t, isKhmer } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // 1. Loading State — Elegant warm minimal verification screen
  if (loading) {
    return (
      <div
        className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-paper px-4 py-16 text-ink select-none ${
          isKhmer ? "font-khmer" : ""
        }`}
      >
        {/* Floating Language Switcher */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline bg-surface/90 hover:bg-paper text-[12px] font-medium text-ink transition-colors cursor-pointer shadow-2xs backdrop-blur-xs"
            aria-label="Toggle language"
          >
            <Languages size={14} className="text-moss" />
            <span>{language === "km" ? "English" : "ភាសាខ្មែរ"}</span>
          </button>
        </div>

        {/* Ambient background glows */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-moss/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-clay/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in duration-300">
          {/* Pulsing Icon Badge */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-surface shadow-xs">
            <span className="absolute -inset-1 rounded-2xl bg-moss/10 animate-ping opacity-60" />
            <Leaf size={28} className="text-moss" strokeWidth={1.75} />
            <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-moss text-white">
              <Loader2 size={10} className="animate-spin" />
            </span>
          </div>

          <h2 className="font-display text-[20px] font-medium text-ink">
            {t("admin_auth_verifying", "Verifying Access...")}
          </h2>

          <p className="mt-1.5 max-w-sm text-[13px] text-stone leading-relaxed">
            {t(
              "admin_auth_verifying_sub",
              "Please wait while we verify your administrator permissions.",
            )}
          </p>
        </div>
      </div>
    );
  }

  // 2. Not Logged In — Clean redirect to admin login with location saved
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Logged In But Not Admin (Role !== "admin") — Beautiful 403 Forbidden Access Page
  if (user.role !== "admin") {
    const handleSwitchAccount = async () => {
      setLoggingOut(true);
      try {
        await logout();
      } catch {
        // Continue even if logout api fails
      } finally {
        navigate("/admin/login", { replace: true });
      }
    };

    const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

    return (
      <div
        className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-paper px-4 py-12 text-ink sm:px-6 ${
          isKhmer ? "font-khmer" : ""
        }`}
      >
        {/* Top Header Bar */}
        <div className="absolute top-5 left-5 right-5 sm:top-7 sm:left-8 sm:right-8 z-20 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 text-ink transition-colors hover:text-moss"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss-tint text-moss transition-transform duration-200 group-hover:scale-105">
              <Leaf size={16} strokeWidth={2} />
            </div>
            <span className="font-display text-[15px] font-medium tracking-tight">
              Botaniq Store
            </span>
          </Link>

          {/* Floating Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline bg-surface/90 hover:bg-paper text-[12px] font-medium text-ink transition-colors cursor-pointer shadow-2xs backdrop-blur-xs"
            aria-label="Toggle language"
          >
            <Languages size={14} className="text-moss" />
            <span>{language === "km" ? "English" : "ភាសាខ្មែរ"}</span>
          </button>
        </div>

        {/* Ambient background glows */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-clay/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-moss/5 blur-3xl"
          aria-hidden="true"
        />

        {/* Main Center Card */}
        <div className="relative z-10 w-full max-w-md text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Large Decorative 403 Watermark */}
          <div className="relative mb-2 inline-flex items-center justify-center">
            <span
              className="select-none font-display text-[88px] font-bold leading-none tracking-tighter text-clay/10 sm:text-[104px]"
              aria-hidden="true"
            >
              403
            </span>

            {/* Central Warning Shield Badge */}
            <div className="absolute flex h-16 w-16 items-center justify-center rounded-2xl border border-clay/20 bg-surface shadow-xs text-clay">
              <ShieldAlert size={32} strokeWidth={1.75} />
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8 shadow-[0_8px_30px_rgba(33,31,27,0.06)]">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-clay/20 bg-clay-tint px-3 py-1 text-[11px] font-medium text-clay">
              <Lock size={12} strokeWidth={2} />
              <span>{t("admin_denied_badge", "403 Restricted Access")}</span>
            </div>

            <h1 className="font-display text-[22px] font-medium text-ink sm:text-[24px]">
              {t("admin_denied_title", "Administrator Access Required")}
            </h1>

            <p className="mt-2 text-[13px] text-stone leading-relaxed">
              {t(
                "admin_denied_desc",
                "This dashboard is strictly reserved for store administrators. Your current account does not have permission to access administrative tools.",
              )}
            </p>

            {/* Signed-in account pill */}
            <div className="my-6 rounded-xl border border-hairline bg-paper/70 p-3 text-left">
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-stone">
                {t("admin_denied_signed_in_as", "Signed in as")}
              </p>

              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss text-[12px] font-medium text-white shadow-xs">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {user?.name || "Customer Account"}
                    </p>
                    <p className="truncate text-[11.5px] text-stone">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-clay/25 bg-clay-tint px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-clay">
                  {user?.role || "customer"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <Link
                to="/"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss px-5 py-2.5 text-[13.5px] font-medium text-white shadow-xs transition-all hover:bg-moss-deep active:scale-[0.99]"
              >
                <Home size={15} strokeWidth={2} />
                <span>{t("admin_denied_btn_home", "Back to Storefront")}</span>
              </Link>

              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={loggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-2.5 text-[13.5px] font-medium text-ink transition-colors hover:bg-paper disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 size={15} className="animate-spin text-stone" />
                ) : (
                  <LogOut size={15} strokeWidth={1.75} className="text-stone" />
                )}
                <span>
                  {t("admin_denied_btn_switch", "Switch to Admin Account")}
                </span>
              </button>
            </div>

            {/* Extra Links */}
            <div className="mt-5 flex items-center justify-center gap-3 border-t border-hairline pt-4 text-[12px] text-stone">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1 transition-colors hover:text-ink"
              >
                <User size={13} />
                <span>{t("admin_denied_btn_profile", "My Customer Profile")}</span>
              </Link>
              <span>•</span>
              <Link
                to="/products"
                className="transition-colors hover:text-ink"
              >
                {t("shop_all_products", "Browse Products")}
              </Link>
            </div>
          </div>

          {/* Help footer */}
          <p className="mx-auto mt-5 max-w-xs text-[11.5px] text-stone/80">
            {t(
              "admin_denied_help",
              "Need access? Please contact your store administrator or supervisor.",
            )}
          </p>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin — Render child components or outlet
  return children ? children : <Outlet />;
}
