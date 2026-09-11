import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PackageX, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import khqrLogoRed from "../../assets/KHQR Logo red.svg";

const STEPS = [
  { key: "pending", label: "Placed" },
  { key: "paid", label: "Paid" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Delivered" },
];
const dataOf = (response) => response.data?.data || response.data;
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const formatDate = (value) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function Timeline({ status }) {
  if (status === "cancelled")
    return <p className="text-sm text-clay">This order was cancelled.</p>;
  const active = Math.max(
    STEPS.findIndex((step) => step.key === status),
    0,
  );
  return (
    <div className="flex items-start w-full overflow-x-auto pb-2">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className={`h-2.5 w-2.5 rounded-full ${index <= active ? "bg-moss" : "bg-hairline"}`}
            />
            <span
              className={`text-xs whitespace-nowrap ${index <= active ? "text-ink" : "text-stone"}`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`h-px flex-1 -mt-5 ${index < active ? "bg-moss" : "bg-hairline"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ItemRow({ item }) {
  const product = item.product || {};
  const rawImage = product.images[0] || product.image_url || item.image_url;
  const image = typeof rawImage === "string" ? rawImage : rawImage?.url || rawImage?.image_url || rawImage?.path
  const skinTypes = product.skin_types || product.skinTypes || [];
  return (
    <div className="flex gap-4 py-5 border-b border-hairline">
      <div className="w-16 h-16 shrink-0 flex items-center justify-center rounded-lg overflow-hidden bg-paper">
        {image ? (
          <img
            src={image}
            alt={item.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-stone">—</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {product.brand?.name && (
          <p className="text-xs text-stone">{product.brand.name}</p>
        )}
        <p className="font-display text-base leading-snug mt-0.5 text-ink">
          {item.product_name}
        </p>
        {skinTypes.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {skinTypes.map((skinType) => (
              <span
                key={skinType.id || skinType.name || skinType}
                className="text-[11px] px-2.5 py-0.5 rounded-full border border-hairline text-stone font-mono uppercase tracking-wider"
              >
                {skinType.name || skinType}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-right shrink-0 font-mono">
        <p className="text-sm text-ink">{money(item.price)}</p>
        <p className="text-xs mt-1 text-stone">qty {item.quantity}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={strong ? "text-sm text-ink" : "text-sm text-stone"}>
        {label}
      </span>
      <span
        className={`${strong ? "text-base text-ink" : "text-sm text-stone"} font-mono`}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/orders/${id}`);
        console.log(response.data);
        if (mounted) setOrder(dataOf(response));
      } catch (err) {
        if (mounted)
          setError(
            err.response?.data?.message || "We couldn't load this order.",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadOrder();
    return () => {
      mounted = false;
    };
  }, [id]);

  const details = useMemo(() => {
    if (!order) return null;
    const items = order.items || [];
    return {
      items,
      subtotal: items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
      payment: order.payments?.[0] || order.payment,
      address: order.address || {},
    };
  }, [order]);

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order || !details) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl border border-hairline bg-moss-tint flex items-center justify-center mx-auto mb-4">
          <PackageX size={24} className="text-moss" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-[22px] font-medium text-ink mb-1.5">
          Order not found
        </h1>
        <p className="text-[13.5px] text-stone mb-6">
          {error ||
            "We couldn't find the order you're looking for. It may have been cancelled or the ID is incorrect."}
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-moss bg-moss text-white text-[13px] font-medium hover:bg-moss-deep transition-colors shadow-xs"
        >
          <ArrowLeft size={14} />
          Back to all orders
        </Link>
      </div>
    );
  }

  const { items, subtotal, payment, address } = details;
  const paidStatuses = ["paid", "shipped", "completed"];
  const paymentStatus =
    payment?.status ||
    (paidStatuses.includes(order.status) ? "paid" : "pending");
  const paymentMethod =
    payment?.method === "khqr"
      ? "Bakong KHQR"
      : payment?.method || "Bakong KHQR";
  const statusTone =
    order.status === "cancelled"
      ? "bg-clay-tint text-clay"
      : order.status === "completed"
        ? "bg-moss text-white"
        : "bg-moss-tint text-moss-deep";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        to="/orders"
        className="text-sm inline-flex items-center gap-1 mb-8 text-stone hover:text-ink"
      >
        ← Back to orders
      </Link>
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl text-ink">Order #{order.id}</h1>
          <p className="text-sm mt-1.5 text-stone">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-wider capitalize ${statusTone}`}
        >
          {order.status || "pending"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <main className="md:col-span-2">
          <div className="mb-10">
            <Timeline status={order.status} />
          </div>
          <h2 className="text-sm mb-1 text-stone">
            {items.length} {items.length === 1 ? "item" : "items"}
          </h2>
          <div className="border-t border-hairline">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </main>
        <aside className="md:col-span-1">
          <div className="p-5 rounded-xl sticky top-6 bg-surface border border-hairline">
            <div className="mb-5 pb-5 border-b border-hairline">
              <p className="text-sm mb-1 text-stone">Payment</p>
              <div className="flex items-center gap-2">
                <p className="font-display text-base text-ink">{paymentMethod}</p>
                {payment?.method === "khqr" && (
                  <img
                    src={khqrLogoRed}
                    alt="KHQR"
                    className="h-3.5 w-auto object-contain"
                  />
                )}
              </div>
              <p
                className={`text-xs mt-1 ${paymentStatus === "paid" ? "text-moss" : "text-clay"}`}
              >
                {paymentStatus === "paid"
                  ? `Paid ${formatDate(payment?.paid_at || order.updated_at)}`
                  : "Awaiting payment"}
              </p>
            </div>
            <div className="mb-5 pb-5 border-b border-hairline">
              <p className="text-sm mb-1 text-stone">Shipping to</p>
              <p className="text-sm leading-relaxed text-ink">
                {address.full_name || "—"}
                <br />
                {[
                  address.street,
                  address.commune,
                  address.district,
                  address.city_province,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
                <br />
                {address.telephone || "—"}
              </p>
            </div>
            <SummaryRow label="Subtotal" value={money(subtotal)} />
            <div className="my-3 border-t border-hairline" />
            <SummaryRow label="Total" value={money(order.total)} strong />
          </div>
        </aside>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 w-28 bg-hairline/50 mb-6" />
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-hairline mb-8">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-hairline/60" />
          <div className="h-4 w-32 bg-hairline/40" />
        </div>
        <div className="h-7 w-24 bg-hairline/50" />
      </div>
      <div className="h-14 w-full bg-paper border border-hairline mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 w-24 bg-hairline/50" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-hairline">
              <div className="w-16 h-16 bg-paper border border-hairline shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-48 bg-hairline/60" />
                <div className="h-3 w-20 bg-hairline/40" />
              </div>
              <div className="h-4 w-14 bg-hairline/50" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-surface border border-hairline p-5" />
          <div className="h-40 bg-surface border border-hairline p-5" />
        </div>
      </div>
    </div>
  );
}
