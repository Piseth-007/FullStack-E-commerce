import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import AuthShell, {
  AuthField,
  AuthInput,
} from "../../components/auth/AuthShell";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { validateRealEmail } from "../../utils/emailValidation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error);
      return;
    }

    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError("");
    await loginWithGoogle(credential);
    navigate("/");
  };

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email address and we'll send you a link to reset your password."
    >
      {sent ? (
        <div className="text-center py-2 space-y-4">
          <div className="w-12 h-12 rounded-none border border-moss/20 bg-moss-tint flex items-center justify-center mx-auto text-moss">
            <CheckCircle2 size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium text-ink">
              Check your email
            </h3>
            <p className="mt-1 text-[13.5px] text-stone leading-relaxed">
              We’ve sent a password reset link to{" "}
              <span className="text-ink font-medium">{email}</span>.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full h-11 rounded-xl bg-moss hover:bg-moss-deep active:scale-[0.99] text-white font-medium text-[14px] shadow-sm transition-all flex items-center justify-center"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField label="Email address">
              <AuthInput
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                  <span>Sending reset link…</span>
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center text-[12px] uppercase">
              <span className="bg-surface px-2.5 text-stone tracking-wider font-medium">
                or continue with
              </span>
            </div>
          </div>

          <GoogleLoginButton
            text="continue_with"
            label="Sign in with Google"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />

          <p className="mt-6 text-center text-[13px] text-stone">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-moss font-medium hover:text-moss-deep transition-colors"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

