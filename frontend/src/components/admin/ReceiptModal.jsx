import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, Receipt as ReceiptIcon, FileText, Check } from "lucide-react";
import Receipt from "../Receipt";

export default function ReceiptModal({
  order,
  isOpen,
  onClose,
  initialFormat = "pos",
}) {
  const [format, setFormat] = useState(initialFormat);

  // Sync initial format when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat);
    }
  }, [isOpen, initialFormat]);

  // Keyboard shortcut to close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 print:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex flex-col w-full max-w-4xl max-h-[92vh] bg-surface rounded-2xl border border-hairline shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline bg-paper/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-moss/10 text-moss flex items-center justify-center">
                <Printer size={16} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink leading-none">
                  Receipt Preview
                </h3>
                <p className="text-[11.5px] text-stone mt-0.5">
                  Order #{order.id} · {order.user?.name || "Customer"}
                </p>
              </div>
            </div>

            {/* Format Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-hairline rounded-xl">
              <button
                type="button"
                onClick={() => setFormat("pos")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  format === "pos"
                    ? "bg-moss text-white shadow-sm"
                    : "text-stone hover:text-ink hover:bg-paper"
                }`}
              >
                <ReceiptIcon size={14} />
                <span>POS Slip (80mm)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("invoice")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  format === "invoice"
                    ? "bg-moss text-white shadow-sm"
                    : "text-stone hover:text-ink hover:bg-paper"
                }`}
              >
                <FileText size={14} />
                <span>Standard Invoice (A4)</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-moss hover:bg-moss-deep text-white text-[13px] font-medium shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <Printer size={14} strokeWidth={2} />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-stone hover:text-ink hover:bg-paper transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Canvas - Shows authentic preview of the receipt */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-100/70 flex justify-center">
            <div className="w-full flex justify-center py-2">
              <div className="transition-all duration-300">
                <Receipt order={order} format={format} />
              </div>
            </div>
          </div>

          {/* Footer Info & Tip */}
          <div className="px-5 py-2.5 border-t border-hairline bg-surface flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-stone shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Ready to print in{" "}
                <strong className="text-ink">
                  {format === "pos" ? "80mm POS Thermal" : "A4 Full Invoice"}
                </strong>{" "}
                format.
              </span>
            </div>

            <p className="text-[11px] text-stone/80">
              Tip: In your browser print settings, enable <em>Background graphics</em> for crisp logos and accents.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
