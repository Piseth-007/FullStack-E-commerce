import { createContext, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        message,
        title: options.title || "Are you sure?",
        confirmLabel: options.confirmLabel || "Delete",
        danger: options.danger !== false,
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-[2px] ${
            isAdmin ? "admin-theme" : ""
          }`}
          onClick={() => handleClose(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-surface border border-hairline p-6 w-full max-w-sm shadow-[0_8px_24px_rgba(33,31,27,0.12)] ${
              isAdmin ? "rounded-2xl" : "rounded-none"
            }`}
          >
            <div
              className={`w-10 h-10 border border-clay/20 bg-clay-tint flex items-center justify-center mb-4 ${
                isAdmin ? "rounded-xl" : "rounded-none"
              }`}
            >
              <AlertTriangle
                size={18}
                className="text-clay"
                strokeWidth={1.75}
              />
            </div>
            <h3 className="font-display text-[17px] font-medium text-ink mb-1.5">
              {dialog.title}
            </h3>
            <p className="text-[13.5px] text-stone leading-relaxed mb-6">
              {dialog.message}
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 py-2.5 border border-clay bg-clay text-white text-[13.5px] font-medium hover:bg-clay/90 transition-colors shadow-xs ${
                  isAdmin ? "rounded-lg" : "rounded-none"
                }`}
              >
                {dialog.confirmLabel}
              </button>
              <button
                onClick={() => handleClose(false)}
                className={`flex-1 py-2.5 border border-hairline text-ink text-[13.5px] font-medium hover:bg-paper transition-colors ${
                  isAdmin ? "rounded-lg" : "rounded-none"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
