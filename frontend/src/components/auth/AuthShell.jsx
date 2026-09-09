import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Leaf } from "lucide-react";
import { useStoreSettings } from "../../context/StoreSettingsContext";

const smoothEase = [0.22, 1, 0.36, 1];

export default function AuthShell({
  children,
  title,
  description,
  showBackToShop = true,
}) {
  const store = useStoreSettings();
  const storeName = store?.name || "Botaniq";

  return (
    <main className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-8 sm:py-12 bg-paper relative">
      {/* Brand Logo Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: smoothEase }}
        className="mb-6 flex flex-col items-center"
      >
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
          aria-label={`${storeName} Home`}
        >
          <div className="w-9 h-9 rounded-xl bg-moss flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Leaf size={18} strokeWidth={2} />
          </div>
          <span className="font-display text-2xl font-medium tracking-tight text-ink">
            {storeName}
          </span>
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: smoothEase }}
        className="w-full max-w-[440px] bg-surface rounded-2xl border border-hairline p-7 sm:p-9 shadow-[0_12px_40px_-15px_rgba(33,31,27,0.06)]"
      >
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl sm:text-[26px] font-medium text-ink tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-[13.5px] text-stone leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div>{children}</div>
      </motion.div>

      {/* Back to shop navigation */}
      {showBackToShop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-stone hover:text-ink font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to shop</span>
          </Link>
        </motion.div>
      )}
    </main>
  );
}

export function AuthField({
  label,
  error,
  required = false,
  hint,
  action,
  children,
  className = "",
}) {
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || action) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-[13px] font-medium text-ink">
              {label}
              {required && <span className="text-clay ml-1">*</span>}
            </label>
          )}
          {action && <div className="text-[12.5px]">{action}</div>}
        </div>
      )}
      {children}
      {hint && !errorMessage && (
        <p className="text-[12px] text-stone mt-1">{hint}</p>
      )}
      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-clay font-medium"
        >
          {errorMessage}
        </motion.p>
      )}
    </div>
  );
}

export function AuthInput({
  icon: Icon,
  type = "text",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <span className="absolute left-3.5 text-stone/70 pointer-events-none flex items-center justify-center">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      )}
      <input
        type={effectiveType}
        className={`w-full h-11 text-[14px] text-ink bg-surface border border-hairline rounded-xl outline-none transition-all placeholder:text-stone/45 focus:border-moss focus:ring-2 focus:ring-moss/10 ${
          Icon ? "pl-10" : "pl-3.5"
        } ${isPassword ? "pr-10" : "pr-3.5"} ${className}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2.5 p-1.5 text-stone/70 hover:text-ink rounded-lg transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

export const authInputClass = "w-full h-11 text-[14px] text-ink bg-surface border border-hairline rounded-xl outline-none transition-all placeholder:text-stone/45 focus:border-moss focus:ring-2 focus:ring-moss/10 pl-3.5 pr-3.5";
