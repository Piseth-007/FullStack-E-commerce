import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/useCard";
import { useToast } from "../../context/useToast";
import { useLanguage } from "../../context/useLanguage";

export default function Cart() {
  const {
    cart,
    subtotal,
    rawSubtotal,
    totalDiscount,
    updateItem,
    removeItem,
  } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      showToast(
        err.response?.data?.message || t("cart_update_error", "Could not update quantity"),
        "error",
      );
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      showToast(t("cart_item_removed", "Item removed"));
    } catch {
      showToast(t("cart_failed_remove", "Failed to remove item"), "error");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-14 h-14 rounded-2xl border border-hairline bg-moss-tint flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={22} className="text-moss" strokeWidth={1.75} />
        </div>
        <h1 className="font-display text-[24px] font-medium text-ink mb-2">
          {t("cart_empty", "Your cart is empty")}
        </h1>
        <p className="text-[13.5px] text-stone mb-6">
          {t("cart_empty_desc", "Start browsing to find your next favorite product.")}
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 rounded-xl border border-moss bg-moss text-white text-[14px] font-medium hover:bg-moss-deep transition-colors shadow-xs"
        >
          {t("cart_shop_all", "Shop all products")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-display text-[24px] sm:text-[28px] font-medium text-ink mb-6 sm:mb-8">
        {t("cart_title", "Your cart")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="col-span-1 lg:col-span-2 space-y-4">
          {items.map((item) => {
            const rawPrice = Math.max(0, Number(item.product?.price ?? 0));
            const discount = Math.min(100, Math.max(0, Number(item.product?.discount ?? 0)));
            const unitPrice = discount > 0
              ? Math.max(0, Math.round((rawPrice - (rawPrice * discount) / 100) * 100) / 100)
              : rawPrice;

            return (
              <div
                key={item.id}
                className="flex gap-3 sm:gap-4 bg-surface border border-hairline rounded-2xl p-3.5 sm:p-4 shadow-xs"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-paper border border-hairline overflow-hidden shrink-0">
                  {item.product?.images?.[0]?.url && (
                    <img
                      src={item.product.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-medium text-ink truncate mb-1">
                    {item.product?.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[13px] font-medium text-ink">
                      ${unitPrice.toFixed(2)}
                    </span>
                    {discount > 0 && (
                      <>
                        <span className="font-mono text-[11.5px] text-stone/60 line-through">
                          ${rawPrice.toFixed(2)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-500/20">
                          -{Math.round(discount)}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-hairline rounded-lg bg-paper overflow-hidden">
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="p-1.5 text-stone hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                        <Minus size={13} strokeWidth={2} />
                      </button>
                      <span className="w-7 text-center font-mono text-[13px] text-ink">
                        {item.quantity}
                      </span>
                      <button
                        disabled={
                          item.product?.stock != null &&
                          item.quantity >= item.product.stock
                        }
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="p-1.5 text-stone hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                        <Plus size={13} strokeWidth={2} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-full border border-transparent hover:border-clay/20 text-stone hover:bg-clay-tint hover:text-clay transition-colors"
                    >
                      <X size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface border border-hairline rounded-2xl p-5 h-fit lg:sticky lg:top-24 shadow-xs">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-stone mb-4">
            {t("cart_order_summary", "Order Summary")}
          </p>

          {totalDiscount > 0 ? (
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-[13.5px] text-stone">
                <span>{t("cart_subtotal", "Subtotal")}</span>
                <span className="font-mono">${rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13.5px] text-red-600 dark:text-red-400 font-medium">
                <span>{t("cart_discount", "Discount")}</span>
                <span className="font-mono">-${totalDiscount.toFixed(2)}</span>
              </div>
              <div className="border-t border-hairline pt-2 flex justify-between text-[14.5px] font-semibold text-ink">
                <span>{t("cart_total", "Total")}</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-[13.5px] text-ink mb-2">
              <span>{t("cart_subtotal", "Subtotal")}</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
          )}

          <p className="text-[12px] text-stone mb-5">
            {t("cart_shipping_calc", "Shipping calculated at checkout")}
          </p>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full py-3 rounded-xl border border-moss bg-moss text-white text-[13.5px] font-medium hover:bg-moss-deep transition-colors shadow-xs"
          >
            {t("cart_checkout", "Checkout")}
          </button>
        </div>
      </div>
    </div>
  );
}
