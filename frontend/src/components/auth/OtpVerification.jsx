import { useState, useEffect, useRef } from "react";
import { Loader2, Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

export default function OtpVerification({
  email,
  onVerified,
  onBack,
  onResend,
  loading,
  error,
  setError,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    setError?.("");
    setResendMessage("");

    // Only allow numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Handle single digit
    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 5 && digit) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (index === 5 || newOtp.every((d) => d !== "")) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        onVerified(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setError?.("");
    setResendMessage("");
    const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (!pasted) return;

    const digits = pasted.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (newOtp.every((d) => d !== "")) {
      onVerified(newOtp.join(""));
    }
  };

  const handleResendClick = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError?.("");
    setResendMessage("");

    try {
      await onResend();
      setResendMessage("A fresh 6-digit code has been sent to your email.");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError?.(err.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError?.("Please enter the complete 6-digit code.");
      return;
    }
    onVerified(fullCode);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-none border border-moss/20 bg-moss-tint text-moss mb-2">
          <Mail size={22} strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-medium font-display text-ink">
          Verify your email
        </h2>
        <p className="text-[13.5px] text-stone leading-relaxed">
          We sent a 6-digit verification code to:
          <br />
          <strong className="text-ink font-mono font-medium">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Digit Input Boxes */}
        <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className={`w-11 h-14 sm:w-12 sm:h-14 text-center font-mono text-2xl font-bold rounded-none border transition-all duration-150 outline-none
                ${
                  digit
                    ? "border-moss bg-moss-tint/40 text-ink shadow-2xs"
                    : "border-hairline bg-surface text-ink hover:border-stone/40"
                }
                focus:border-moss focus:ring-1 focus:ring-moss/30
                disabled:opacity-50`}
            />
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 text-[13px] border border-clay/30 bg-clay-tint/50 text-clay rounded-none flex items-start gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Resend Success Notice */}
        {resendMessage && (
          <div className="p-3 text-[13px] border border-moss/30 bg-moss-tint/50 text-moss rounded-none flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Verify Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.some((d) => d === "")}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-moss text-paper font-medium text-[13.5px] hover:bg-moss-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <span>Verify & Activate Account</span>
          )}
        </button>

        {/* Resend & Back Actions */}
        <div className="pt-2 flex flex-col items-center gap-3 text-[13px] text-stone">
          <div>
            Didn't receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="font-mono text-ink font-medium">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendClick}
                disabled={resending}
                className="font-medium text-moss hover:underline inline-flex items-center gap-1.5"
              >
                {resending && <RefreshCw size={13} className="animate-spin" />}
                Resend code
              </button>
            )}
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-stone hover:text-ink transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Change email or edit details</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

