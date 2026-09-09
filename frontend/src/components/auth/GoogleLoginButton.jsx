import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "758279737361-8p37o1tffa2ppnj0f4qilf9dtvflpnlg.apps.googleusercontent.com";

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  text = "continue_with",
  label = "Continue with Google",
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("Google Client ID is not configured.");
      return;
    }

    let isMounted = true;

    const handleCallback = async (response) => {
      if (!isMounted) return;
      if (!response?.credential) {
        onError?.("Google sign-in did not return valid credentials.");
        return;
      }
      setLoading(true);
      try {
        await onSuccess(response.credential);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Google sign-in failed. Please try again.";
        onError?.(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const renderGoogleBtn = () => {
      if (!isMounted || !window.google?.accounts?.id || !containerRef.current) {
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCallback,
          auto_select: false,
        });

        // Compute available container width, bounded between 240 and 400 (Google GSI spec)
        const containerWidth = containerRef.current.offsetWidth || 380;
        const targetWidth = Math.min(Math.max(containerWidth, 240), 400);

        // Clear existing children before rendering
        containerRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: text,
          shape: "rectangular",
          logo_alignment: "left",
          width: targetWidth,
        });

        setRendered(true);
      } catch (e) {
        console.error("Failed to render Google button:", e);
      }
    };

    // Load Google Identity Services script if not yet loaded
    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId);

    if (window.google?.accounts?.id) {
      // Delay slightly for Framer Motion animation / layout stabilization
      const timer = setTimeout(renderGoogleBtn, 80);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkInterval);
        renderGoogleBtn();
      }
    }, 100);

    const fallbackTimeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      clearTimeout(fallbackTimeout);
    };
  }, [text, onSuccess, onError]);

  const handleFallbackClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onError?.(
        "Google sign-in is still initializing or blocked by your browser."
      );
    }
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center gap-2 h-11 w-full rounded-xl border border-hairline bg-surface text-stone text-[13px] shadow-sm">
          <Loader2 size={16} className="animate-spin text-moss" />
          <span>Signing in with Google…</span>
        </div>
      ) : (
        <div className="w-full flex justify-center min-h-[44px] relative">
          {/* Target for Google's official GSI button */}
          <div
            ref={containerRef}
            className={`w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full ${
              rendered ? "block" : "hidden"
            }`}
          />

          {/* Fallback button shown while GSI initializes or if blocked */}
          {!rendered && (
            <button
              type="button"
              onClick={handleFallbackClick}
              className="w-full h-11 rounded-xl border border-hairline bg-surface hover:bg-moss-tint/30 text-ink text-[13.5px] font-medium transition-colors flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
            >
              <GoogleIcon />
              <span>{label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

