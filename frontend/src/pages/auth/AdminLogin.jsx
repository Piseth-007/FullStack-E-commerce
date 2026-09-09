import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import AuthShell, {
  AuthField,
  AuthInput,
} from "../../components/auth/AuthShell";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  
  if (!authLoading && user?.role === "admin") {
    const redirectTo = location.state?.from || "/admin/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Admin Portal"
      description="Sign in with your administrator credentials."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Admin email">
          <AuthInput
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="username"
            required
          />
        </AuthField>

        <AuthField
          label="Password"
          action={
            <Link
              to="/admin/forgot-password"
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
              <span>Signing in…</span>
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
