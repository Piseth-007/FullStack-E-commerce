import { useMemo } from "react";
import { Leaf, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { useStoreSettings } from "../context/StoreSettingsContext";

// Exchange rate USD -> KHR for realistic Cambodian e-commerce KHQR receipts
const KHR_RATE = 4100;

function BarcodeSVG({ value = "10001" }) {
  // Generate deterministic realistic barcode line pattern
  const bars = useMemo(() => {
    const seed = String(value)
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const pattern = [];
    const barWidths = [1.5, 2.5, 3.5, 1, 2, 4, 1.5, 3];
    for (let i = 0; i < 46; i++) {
      const w = barWidths[(seed + i * 3) % barWidths.length];
      const isSpace = (seed + i * 7) % 5 === 0;
      if (!isSpace) {
        pattern.push(w);
      } else {
        pattern.push(0);
      }
    }
    return pattern;
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <svg
        className="h-10 w-48 max-w-full"
        viewBox="0 0 160 38"
        fill="currentColor"
      >
        {bars.map((w, idx) => {
          if (w === 0) return null;
          const x = idx * 3.4 + 4;
          return (
            <rect
              key={idx}
              x={x}
              y="0"
              width={w * 0.9}
              height="38"
              fill="#111827"
            />
          );
        })}
      </svg>
      <span className="font-mono text-[10px] tracking-[0.25em] text-neutral-600 mt-1 uppercase">
        *ORD-{String(value).padStart(5, "0")}*
      </span>
    </div>
  );
}

export default function Receipt({
  order,
  format = "pos", // "pos" | "invoice"
  className = "",
}) {
  const store = useStoreSettings();
  const storeName = store?.name || "BOTANIQ";
  const storePhone = store?.contact_phone || "+855 23 888 999";
  const storeEmail = store?.contact_email || "care@botaniq.com";
  const storeAddress = store?.address || "Phnom Penh, Cambodia";

  if (!order) return null;

  const orderId = order.id || "—";
  const formattedOrderNo = `REC-${new Date(order.created_at || Date.now()).getFullYear()}-${String(orderId).padStart(5, "0")}`;
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  const orderTime = order.created_at
    ? new Date(order.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const customerName = order.user?.name || order.address?.full_name || "Valued Customer";
  const customerEmail = order.user?.email || "—";
  const customerPhone = order.address?.telephone || "—";

  const address = order.address;
  const addressLine = address
    ? [address.street, address.commune, address.district, address.city_province]
        .filter(Boolean)
        .join(", ")
    : "Standard Delivery";

  const items = order.items || [];
  const totalUSD = Number(order.total || 0);
  const totalKHR = Math.round(totalUSD * KHR_RATE);

  // Calculate items subtotal
  const itemsSubtotal = items.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);
  const deliveryFee = Math.max(0, totalUSD - itemsSubtotal);

  const paymentMethod =
    order.payment_method === "khqr"
      ? "Bakong KHQR"
      : order.payment_method
        ? String(order.payment_method).toUpperCase()
        : "Bakong KHQR";

  const isPaid =
    order.payment_status === "paid" ||
    order.status === "paid" ||
    order.status === "completed" ||
    order.status === "shipped";

  // -------------------------------------------------------------
  // 1. POS Thermal Receipt Slip (80mm Real Retail / Order Slip)
  // -------------------------------------------------------------
  if (format === "pos") {
    return (
      <div
        className={`receipt-pos font-mono text-neutral-900 bg-white mx-auto p-5 leading-tight select-text text-left max-w-[360px] w-full border border-neutral-200 shadow-sm print:border-0 print:shadow-none print:p-2 ${className}`}
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {/* Store Header */}
        <div className="text-center pb-3 border-b-2 border-dashed border-neutral-800">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-neutral-900 text-white">
              <Leaf size={14} />
            </span>
            <span className="font-bold text-lg tracking-wider uppercase">
              {storeName}
            </span>
          </div>
          <p className="text-[10px] tracking-wide text-neutral-600 uppercase">
            Botanical Skincare & Wellness
          </p>
          <p className="text-[11px] mt-1 text-neutral-700">{storeAddress}</p>
          <p className="text-[11px] text-neutral-700">
            Tel: {storePhone} · {storeEmail}
          </p>
          <div className="mt-2 inline-block px-2.5 py-0.5 border border-neutral-900 font-bold text-[11px] tracking-widest uppercase">
            *** ORDER RECEIPT ***
          </div>
        </div>

        {/* Order Meta */}
        <div className="py-2.5 text-[11.5px] border-b border-dashed border-neutral-400 space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-600">RECEIPT NO:</span>
            <span className="font-bold text-neutral-900">{formattedOrderNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">DATE & TIME:</span>
            <span>
              {orderDate} {orderTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">ORDER STATUS:</span>
            <span className="font-bold uppercase">
              [{order.status || "PENDING"}]
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">PAYMENT:</span>
            <span>
              {paymentMethod} {isPaid ? "(PAID)" : "(PENDING)"}
            </span>
          </div>
          {order.transaction_id && (
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>REF / TXN:</span>
              <span className="truncate max-w-[200px]">{order.transaction_id}</span>
            </div>
          )}
        </div>

        {/* Customer & Shipping Details */}
        <div className="py-2 text-[11px] border-b border-dashed border-neutral-400 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-neutral-600">CUSTOMER:</span>
            <span className="font-bold">{customerName}</span>
          </div>
          {customerPhone !== "—" && (
            <div className="flex justify-between">
              <span className="text-neutral-600">PHONE:</span>
              <span>{customerPhone}</span>
            </div>
          )}
          {addressLine && (
            <div className="pt-0.5">
              <span className="text-neutral-600 block text-[10px]">SHIP TO:</span>
              <span className="text-[10.5px] leading-snug block">
                {addressLine}
              </span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="py-2 border-b-2 border-dashed border-neutral-800">
          <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-neutral-300 uppercase">
            <span className="w-1/2">ITEM</span>
            <span className="w-1/4 text-center">QTY</span>
            <span className="w-1/4 text-right">AMT</span>
          </div>

          <div className="divide-y divide-dotted divide-neutral-200 py-1">
            {items.map((item, idx) => {
              const name = item.product_name || item.product?.name || "Product Item";
              const qty = Number(item.quantity || 1);
              const price = Number(item.price || 0);
              const subtotal = (qty * price).toFixed(2);

              return (
                <div key={item.id || idx} className="py-1.5 text-[11px]">
                  <div className="font-semibold leading-tight text-neutral-900">
                    {name}
                  </div>
                  <div className="flex justify-between items-center text-neutral-600 text-[10.5px] mt-0.5">
                    <span>
                      {qty} × ${price.toFixed(2)}
                    </span>
                    <span className="font-bold text-neutral-900 font-mono">
                      ${subtotal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="py-2.5 space-y-1 text-[11.5px] border-b-2 border-dashed border-neutral-800">
          <div className="flex justify-between text-neutral-700">
            <span>ITEMS SUBTOTAL:</span>
            <span className="font-mono">${itemsSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>DELIVERY FEE:</span>
            <span className="font-mono">
              {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "FREE"}
            </span>
          </div>
          <div className="flex justify-between text-[14px] font-bold text-neutral-950 pt-1 border-t border-dotted border-neutral-400">
            <span>TOTAL (USD):</span>
            <span className="font-mono">${totalUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11.5px] font-semibold text-neutral-700">
            <span>TOTAL (KHR):</span>
            <span className="font-mono">៛ {totalKHR.toLocaleString()}</span>
          </div>
        </div>

        {/* Barcode & Footer */}
        <div className="pt-3 pb-1 text-center space-y-2">
          <BarcodeSVG value={orderId} />

          <div className="pt-1 text-[10px] text-neutral-600 leading-normal">
            <p className="font-bold text-neutral-800 uppercase tracking-wide">
              Thank you for choosing {storeName}!
            </p>
            <p className="mt-0.5">
              Please inspect your items upon delivery.
            </p>
            <p className="text-[9px] text-neutral-500 mt-1">
              For support: {storePhone} · {storeEmail}
            </p>
          </div>

          <div className="text-[8.5px] text-neutral-400 tracking-widest uppercase pt-1">
            - - - - - - - END OF RECEIPT - - - - - - -
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. Standard Business Invoice (A4 / Letter Full Width)
  // -------------------------------------------------------------
  return (
    <div
      className={`receipt-invoice font-sans text-neutral-900 bg-white max-w-[780px] w-full mx-auto p-8 sm:p-10 border border-neutral-200 shadow-sm print:border-0 print:shadow-none print:p-4 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Leaf size={18} />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
              {storeName}
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-[280px] leading-relaxed">
            {storeAddress}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {storePhone} · {storeEmail}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200 mb-2">
            Official Invoice
          </span>
          <h2 className="text-xl font-bold font-mono text-neutral-950">
            {formattedOrderNo}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Issued: {orderDate} · {orderTime}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-neutral-50">
            {isPaid ? (
              <CheckCircle2 size={13} className="text-emerald-600" />
            ) : (
              <Clock size={13} className="text-amber-600" />
            )}
            <span className="capitalize">{order.status || "Pending"}</span>
          </div>
        </div>
      </div>

      {/* Bill To & Ship To Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">
            Billed To
          </p>
          <p className="font-semibold text-sm text-neutral-900">{customerName}</p>
          <p className="text-xs text-neutral-600 mt-0.5">{customerEmail}</p>
          {customerPhone !== "—" && (
            <p className="text-xs text-neutral-600 mt-0.5">{customerPhone}</p>
          )}
          <p className="text-[11px] text-neutral-400 mt-2">
            Customer ID: #{order.user_id || "GUEST"}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">
            Shipping & Payment
          </p>
          <p className="text-xs text-neutral-900 font-medium leading-relaxed">
            {addressLine}
          </p>
          <div className="mt-3 pt-2.5 border-t border-neutral-200/80 flex flex-wrap items-center justify-between text-xs">
            <span className="text-neutral-500">Payment Method:</span>
            <span className="font-semibold text-neutral-900">
              {paymentMethod}
            </span>
          </div>
          {order.transaction_id && (
            <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
              <span>Transaction Ref:</span>
              <span className="font-mono text-[10.5px] truncate max-w-[180px]">
                {order.transaction_id}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-100/70 border-b border-neutral-200 font-medium text-neutral-600 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right w-24">Unit Price</th>
              <th className="py-3 px-4 text-center w-20">Qty</th>
              <th className="py-3 px-4 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item, idx) => {
              const name = item.product_name || item.product?.name || "Product Item";
              const qty = Number(item.quantity || 1);
              const price = Number(item.price || 0);
              const subtotal = (qty * price).toFixed(2);

              return (
                <tr key={item.id || idx} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-4 text-center text-neutral-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    <div>{name}</div>
                    {item.product?.id && (
                      <div className="text-[10.5px] text-neutral-400 font-mono">
                        SKU: #{item.product.id}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-neutral-700">
                    ${price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-neutral-800">
                    {qty}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-950">
                    ${subtotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary Breakdown */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2 pb-6 border-b border-neutral-200">
        <div className="max-w-xs text-xs text-neutral-500 space-y-1">
          <p className="font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
            Payment Verification
          </p>
          <p>
            Status:{" "}
            <span className="font-semibold text-neutral-900">
              {isPaid ? "Payment Verified" : "Pending Confirmation"}
            </span>
          </p>
          <p>
            Currency Rate: $1.00 USD = ៛ {KHR_RATE.toLocaleString()} KHR
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Items Subtotal</span>
            <span className="font-mono font-medium text-neutral-800">
              ${itemsSubtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Shipping / Delivery</span>
            <span className="font-mono font-medium text-neutral-800">
              {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "Free Delivery"}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
            <span>Total USD</span>
            <span className="font-mono text-base">${totalUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-neutral-600">
            <span>Total KHR</span>
            <span className="font-mono">៛ {totalKHR.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Barcode & Clean Footer */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="text-xs text-neutral-500">
          <p className="font-semibold text-neutral-800">
            Thank you for your business!
          </p>
          <p className="text-[11px] mt-0.5">
            Questions? Contact support at {storeEmail} or call {storePhone}.
          </p>
        </div>
        <BarcodeSVG value={orderId} />
      </div>
    </div>
  );
}
