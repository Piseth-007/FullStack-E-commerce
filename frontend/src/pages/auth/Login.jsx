import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AuthShell, {
  AuthField,
  AuthInput,
} from "../../components/auth/AuthShell";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import OtpVerification from "../../components/auth/OtpVerification";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Unverified user OTP verification state
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const { login, verifyOtp, resendOtp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    } catch (err) {
      if (err.response?.data?.requires_verification) {
        setUnverifiedEmail(err.response.data.email || email);
        setStep("otp");
        return;
      }
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      await verifyOtp(unverifiedEmail, code);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    } catch (err) {
      setOtpError(
        err.response?.data?.errors?.otp?.[0] ||
        err.response?.data?.message ||
        "The verification code is incorrect or expired."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await resendOtp(unverifiedEmail);
  };

  const handleGoogleSuccess = async (credential) => {
    setError("");
    await loginWithGoogle(credential);
    const redirectTo = location.state?.from || "/";
    navigate(redirectTo);
  };

  return (
    <AuthShell
      title={step === "otp" ? "Verify your email" : "Welcome back"}
      description={
        step === "otp"
          ? "Your account requires email verification. Enter the 6-digit code sent to your inbox."
          : "Enter your email and password to sign in to your account."
      }
    >
      {step === "otp" ? (
        <OtpVerification
          email={unverifiedEmail}
          onVerified={handleVerifyOtp}
          onBack={() => {
            setStep("form");
            setOtpError("");
          }}
          onResend={handleResendOtp}
          loading={otpLoading}
          error={otpError}
          setError={setOtpError}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField label="Email">
              <AuthInput
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            </AuthField>

            <AuthField
              label="Password"
              action={
                <Link
                  to="/forgot-password"
                  className="text-moss hover:text-moss-deep font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              }
            >
              <AuthInput
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </AuthField>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-none bg-clay-tint border border-clay/20 text-clay-deep text-[13px] leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-clay" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-none bg-moss hover:bg-moss-deep active:scale-[0.99] text-white font-medium text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign in"
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
            label="Continue with Google"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />

          <p className="mt-6 text-center text-[13px] text-stone">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-moss font-medium hover:text-moss-deep transition-colors"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
