import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import AuthShell, {
  AuthField,
  AuthInput,
} from "../../components/auth/AuthShell";
import { validateRealEmail } from "../../utils/emailValidation";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not send a reset link right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Admin Password Recovery"
      description="Enter your admin email to receive a password reset link."
    >
      {sent ? (
        <div className="text-center py-2 space-y-4">
          <div className="w-12 h-12 rounded-2xl border border-moss/20 bg-moss-tint flex items-center justify-center mx-auto text-moss">
            <CheckCircle2 size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium text-ink">
              Check your email
            </h3>
            <p className="mt-1 text-[13.5px] text-stone leading-relaxed">
              We’ve sent a reset link to <span className="text-ink font-medium">{email}</span>.
            </p>
          </div>
          <Link
            to="/admin/login"
            className="w-full h-11 rounded-xl bg-moss hover:bg-moss-deep active:scale-[0.99] text-white font-medium text-[14px] shadow-sm transition-all flex items-center justify-center"
          >
            Return to admin sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="Admin email">
            <AuthInput
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
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
                <span>Sending…</span>
              </>
            ) : (
              "Send reset link"
            )}
          </button>

          <p className="pt-2 text-center text-[13px] text-stone">
            <Link
              to="/admin/login"
              className="text-moss font-medium hover:text-moss-deep transition-colors"
            >
              Back to admin sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
