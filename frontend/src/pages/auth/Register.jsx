import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AuthShell, {
  AuthField,
  AuthInput,
} from "../../components/auth/AuthShell";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.password_confirmation) {
      setErrors({
        password_confirmation: ["Passwords do not match"],
      });
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {
          general: [err.response?.data?.message || "Registration failed"],
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setErrors({});
    await loginWithGoogle(credential);
    navigate("/");
  };

  return (
    <AuthShell
      title="Create an account"
      description="Sign up to start shopping and track your orders."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Full name" error={errors.name}>
          <AuthInput
            icon={User}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </AuthField>

        <AuthField label="Email" error={errors.email}>
          <AuthInput
            icon={Mail}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </AuthField>

        <AuthField label="Password" error={errors.password}>
          <AuthInput
            icon={Lock}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </AuthField>

        <AuthField
          label="Confirm password"
          error={errors.password_confirmation}
        >
          <AuthInput
            icon={Lock}
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
          />
        </AuthField>

        {errors.general && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-clay-tint border border-clay/20 text-clay-deep text-[13px] leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-clay" />
            <span>{errors.general[0]}</span>
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
              <span>Creating account…</span>
            </>
          ) : (
            "Create account"
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
        text="signup_with"
        label="Sign up with Google"
        onSuccess={handleGoogleSuccess}
        onError={(msg) => setErrors({ general: [msg] })}
      />

      <p className="mt-6 text-center text-[13px] text-stone">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-moss font-medium hover:text-moss-deep transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}