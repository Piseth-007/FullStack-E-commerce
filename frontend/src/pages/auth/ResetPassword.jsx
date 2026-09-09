import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import api from "../../api/axios";
import AuthShell, {
  AuthField,
  AuthInput,
} from "../../components/auth/AuthShell";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch =
    passwordConfirmation.length > 0 && password === passwordConfirmation;
  const passwordsMismatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <main className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-paper">
        <div className="w-full max-w-[440px] bg-surface rounded-2xl border border-hairline p-7 sm:p-9 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-none border border-clay/20 bg-clay-tint flex items-center justify-center mx-auto text-clay">
            <AlertCircle size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-xl font-medium text-ink">
              Invalid or expired link
            </h2>
            <p className="mt-1 text-[13.5px] text-stone leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="w-full h-11 rounded-none border border-moss bg-moss hover:bg-moss-deep text-white font-medium text-[14px] shadow-sm transition-all flex items-center justify-center"
          >
            Request new reset link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <AuthShell
      title="Set new password"
      description="Enter your new password below."
    >
      {success ? (
        <div className="text-center py-2 space-y-4">
          <div className="w-12 h-12 rounded-none border border-moss/20 bg-moss-tint flex items-center justify-center mx-auto text-moss">
            <CheckCircle2 size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium text-ink">
              Password reset successfully
            </h3>
            <p className="mt-1 text-[13.5px] text-stone leading-relaxed">
              Your password has been updated. Redirecting to sign in…
            </p>
          </div>
          <Link
            to="/login"
            className="w-full h-11 rounded-xl bg-moss hover:bg-moss-deep active:scale-[0.99] text-white font-medium text-[14px] shadow-sm transition-all flex items-center justify-center"
          >
            Continue to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="New password">
            <AuthInput
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </AuthField>

          <AuthField label="Confirm password">
            <AuthInput
              icon={Lock}
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repeat your new password"
              required
            />
          </AuthField>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-clay-tint border border-clay/20 text-clay-deep text-[13px] leading-relaxed">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-clay" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-moss hover:bg-moss-deep active:scale-[0.99] text-white font-medium text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating password…</span>
              </>
            ) : (
              "Reset password"
            )}
          </button>

          <p className="pt-2 text-center text-[13px] text-stone">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-moss font-medium hover:text-moss-deep transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
