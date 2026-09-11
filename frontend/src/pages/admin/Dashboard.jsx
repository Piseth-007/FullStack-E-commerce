import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Check,
  X,
} from "lucide-react";

import api from "../../api/axios";
import { StatSkeleton } from "../../components/Skeleton";
import { ToastContext } from "../../context/ToastContext";
import { useLanguage } from "../../context/useLanguage";

const RANGES = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "12m", label: "Last 12 months" },
];

const PIE_COLORS = {
  completed: "#3F5843",
  pending: "#D9A441",
  cancelled: "#C96A5B",
};

const CANCELLED_STATUSES = ["cancelled", "canceled", "rejected", "refunded"];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_KM = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const WEEKDAY_NAMES_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAY_NAMES_KM = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];

function formatYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculatePresetDates(preset) {
  const today = new Date();
  switch (preset) {
    case "today": {
      const d = formatYMD(today);
      return { startDate: d, endDate: d };
    }
    case "yesterday": {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const d = formatYMD(y);
      return { startDate: d, endDate: d };
    }
    case "7d": {
      const past = new Date();
      past.setDate(past.getDate() - 6);
      return { startDate: formatYMD(past), endDate: formatYMD(today) };
    }
    case "30d": {
      const past = new Date();
      past.setDate(past.getDate() - 29);
      return { startDate: formatYMD(past), endDate: formatYMD(today) };
    }
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { startDate: formatYMD(start), endDate: formatYMD(end) };
    }
    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: formatYMD(start), endDate: formatYMD(end) };
    }
    case "all":
    default:
      return { startDate: null, endDate: null };
  }
}

function formatDateShort(dateStr, isKhmer) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(isKhmer ? "km-KH" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getFilterDisplayLabel(filter, t, isKhmer) {
  if (filter.preset === "all" || (!filter.startDate && !filter.endDate)) {
    return t("dash_filter_all", "All Time");
  }
  if (filter.preset === "today") {
    return `${t("dash_filter_today", "Today")} (${formatDateShort(filter.startDate, isKhmer)})`;
  }
  if (filter.preset === "yesterday") {
    return `${t("dash_filter_yesterday", "Yesterday")} (${formatDateShort(filter.startDate, isKhmer)})`;
  }
  if (filter.preset === "7d") {
    return t("dash_filter_7d", "Last 7 Days");
  }
  if (filter.preset === "30d") {
    return t("dash_filter_30d", "Last 30 Days");
  }
  if (filter.preset === "this_month") {
    return t("dash_filter_this_month", "This Month");
  }
  if (filter.preset === "last_month") {
    return t("dash_filter_last_month", "Last Month");
  }

  if (filter.startDate && filter.endDate) {
    if (filter.startDate === filter.endDate) {
      return formatDateShort(filter.startDate, isKhmer);
    }
    return `${formatDateShort(filter.startDate, isKhmer)} - ${formatDateShort(filter.endDate, isKhmer)}`;
  }
  if (filter.startDate) {
    return `≥ ${formatDateShort(filter.startDate, isKhmer)}`;
  }
  return t("dash_filter_all", "All Time");
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const target = document.documentElement;

    const observer = new MutationObserver(() => {
      setIsDark(target.classList.contains("dark"));
    });

    observer.observe(target, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const { showToast } = useContext(ToastContext);
  const { t, isKhmer } = useLanguage();

  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [trend, setTrend] = useState([]);
  const [range, setRange] = useState("7d");

  const [dateFilter, setDateFilter] = useState({
    preset: "all",
    startDate: null,
    endDate: null,
    label: t("dash_filter_all", "All Time"),
  });

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);

  const ranges = [
    { key: "7d", label: t("dash_range_7d", "Last 7 days") },
    { key: "30d", label: t("dash_range_30d", "Last 30 days") },
    { key: "12m", label: t("dash_range_12m", "Last 12 months") },
  ];

  // Update dateFilter label on language change
  useEffect(() => {
    setDateFilter((prev) => ({
      ...prev,
      label: getFilterDisplayLabel(prev, t, isKhmer),
    }));
  }, [t, isKhmer]);

  const isFiltered =
    dateFilter.preset !== "all" &&
    Boolean(dateFilter.startDate || dateFilter.endDate);

  const isSingleDay = Boolean(
    dateFilter.startDate &&
      dateFilter.endDate &&
      dateFilter.startDate === dateFilter.endDate,
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setSummaryLoading(true);
        setOrdersLoading(true);

        const params = {};
        if (dateFilter.startDate) params.start_date = dateFilter.startDate;
        if (dateFilter.endDate) params.end_date = dateFilter.endDate;

        const [summaryResponse, ordersResponse] = await Promise.all([
          api.get("/admin/dashboard/summary", { params }),
          api.get("/admin/orders", { params: { ...params, per_page: 50 } }),
        ]);

        const summaryData = summaryResponse.data?.data ?? summaryResponse.data;
        const ordersData = ordersResponse.data?.data ?? ordersResponse.data;

        setSummary(summaryData || null);
        setOrders(extractOrders(ordersData));
      } catch (err) {
        setSummary(null);
        setOrders([]);

        showToast(
          err.response?.data?.message || t("dash_err_load", "Failed to load dashboard"),
          "error",
        );
      } finally {
        setSummaryLoading(false);
        setOrdersLoading(false);
      }
    };

    loadDashboard();
  }, [dateFilter, showToast, t]);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        setTrendLoading(true);

        const trendParams = {};
        if (dateFilter.startDate && dateFilter.endDate) {
          trendParams.start_date = dateFilter.startDate;
          trendParams.end_date = dateFilter.endDate;
          trendParams.range = "custom";
        } else {
          trendParams.range = range;
        }

        const res = await api.get("/admin/dashboard/sales-trend", {
          params: trendParams,
        });

        const data = res.data?.data ?? res.data;

        setTrend(Array.isArray(data) ? data : []);
      } catch (err) {
        setTrend([]);

        showToast(
          err.response?.data?.message || t("dash_err_trend", "Failed to load sales trend"),
          "error",
        );
      } finally {
        setTrendLoading(false);
      }
    };

    loadTrend();
  }, [dateFilter, range, showToast, t]);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    if (newRange === "7d") {
      const { startDate, endDate } = calculatePresetDates("7d");
      setDateFilter({
        preset: "7d",
        startDate,
        endDate,
        label: t("dash_filter_7d", "Last 7 Days"),
      });
    } else if (newRange === "30d") {
      const { startDate, endDate } = calculatePresetDates("30d");
      setDateFilter({
        preset: "30d",
        startDate,
        endDate,
        label: t("dash_filter_30d", "Last 30 Days"),
      });
    } else if (newRange === "12m") {
      setDateFilter({
        preset: "12m",
        startDate: null,
        endDate: null,
        label: t("dash_range_12m", "Last 12 months"),
      });
    }
  };

  const handleResetToAllTime = () => {
    setDateFilter({
      preset: "all",
      startDate: null,
      endDate: null,
      label: t("dash_filter_all", "All Time"),
    });
    setRange("7d");
  };

  const recentOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.createdAt || a.order_date || a.date || 0,
        ).getTime();

        const dateB = new Date(
          b.created_at || b.createdAt || b.order_date || b.date || 0,
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  const topProducts = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    const productMap = new Map();

    orders.forEach((order) => {
      const status = String(order.status || "").toLowerCase();

      if (CANCELLED_STATUSES.includes(status)) {
        return;
      }

      const items = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.order_items)
          ? order.order_items
          : [];

      items.forEach((item) => {
        const product =
          item.product || item.product_detail || item.productData || null;

        const productId = item.product_id ?? item.productId ?? product?.id;

        if (productId === undefined || productId === null) {
          return;
        }

        const quantity = Number(
          item.quantity ?? item.qty ?? item.order_quantity ?? 1,
        );

        if (!Number.isFinite(quantity) || quantity <= 0) {
          return;
        }

        const price = Number(
          item.price ??
            item.unit_price ??
            item.unitPrice ??
            product?.price ??
            0,
        );

        const revenue = price * quantity;

        const productName =
          item.product_name || item.productName || product?.name || "Product";

        const image =
          item.image ||
          item.image_url ||
          item.product_image ||
          item.productImage ||
          product?.image ||
          product?.image_url ||
          product?.images?.[0]?.url ||
          product?.images?.[0]?.image_url ||
          (typeof product?.images?.[0] === "string"
            ? product.images[0]
            : null) ||
          null;

        const existing = productMap.get(String(productId));

        if (existing) {
          existing.sold += quantity;
          existing.revenue += revenue;

          if (!existing.image && image) {
            existing.image = image;
          }
        } else {
          productMap.set(String(productId), {
            id: productId,
            name: productName,
            image,
            sold: quantity,
            revenue,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => {
        if (b.sold !== a.sold) {
          return b.sold - a.sold;
        }

        return b.revenue - a.revenue;
      })
      .slice(0, 4);
  }, [orders]);

  const orderBreakdown = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    let completed = 0;
    let pending = 0;
    let cancelled = 0;

    orders.forEach((order) => {
      const status = String(order.status || "")
        .trim()
        .toLowerCase();

      if (status === "completed" || status === "delivered") {
        completed += 1;
      } else if (
        status === "cancelled" ||
        status === "canceled" ||
        status === "rejected"
      ) {
        cancelled += 1;
      } else {
        pending += 1;
      }
    });

    return [
      {
        name: t("dash_status_completed", "Completed"),
        value: completed,
        color: PIE_COLORS.completed,
      },
      {
        name: t("dash_status_pending", "Pending"),
        value: pending,
        color: PIE_COLORS.pending,
      },
      {
        name: t("dash_status_cancelled", "Cancelled"),
        value: cancelled,
        color: PIE_COLORS.cancelled,
      },
    ];
  }, [orders, t]);

  const totalBreakdownOrders = orderBreakdown.reduce(
    (total, item) => total + item.value,
    0,
  );

  const chartColors = isDark
    ? {
        grid: "#2b2d35",
        axisText: "#a6a29a",
        barFill: "#3e6344",
        cursorFill: "#3e6344",
        tooltipBg: "#18191e",
        tooltipBorder: "#2b2d35",
        tooltipText: "#f5f4f0",
      }
    : {
        grid: "#e4e0d8",
        axisText: "#736e63",
        barFill: "#38543c",
        cursorFill: "#38543c",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e4e0d8",
        tooltipText: "#211f1b",
      };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-medium text-ink">
            {t("dash_title", "Dashboard")}
          </h1>
          {isFiltered && (
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-tint px-2.5 py-0.5 text-[11px] font-medium text-moss dark:bg-emerald-500/15 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("dash_calendar_filtered_badge", "Filtered")}: {dateFilter.label}
              </span>
              <button
                type="button"
                onClick={handleResetToAllTime}
                className="flex items-center gap-1 text-[11px] text-stone underline transition-colors hover:text-clay"
              >
                <RotateCcw size={11} />
                {t("dash_calendar_clear", "Reset to All Time")}
              </button>
            </div>
          )}
        </div>

        <DashboardDatePicker
          dateFilter={dateFilter}
          onChange={setDateFilter}
          t={t}
          isKhmer={isKhmer}
        />
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            icon={DollarSign}
            label={t("dash_stat_revenue", "Store Revenue")}
            value={`$${Number(summary.total_sales || 0).toFixed(2)}`}
            change={summary.sales_growth || summary.revenue_growth}
            iconClass="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15"
          />

          <DashboardStatCard
            icon={ShoppingBag}
            label={t("dash_stat_orders", "Total Orders")}
            value={Number(summary.total_orders || 0).toLocaleString()}
            change={summary.orders_growth}
            iconClass="bg-orange-500/10 text-orange-500 dark:bg-orange-500/15"
          />

          <DashboardStatCard
            icon={Users}
            label={t("dash_stat_customers", "Total Shoppers")}
            value={Number(summary.total_customers || 0).toLocaleString()}
            change={summary.customers_growth}
            iconClass="bg-stone-500/10 text-stone-500 dark:bg-stone-500/15 dark:text-stone-300"
          />

          <DashboardStatCard
            icon={Package}
            label={t("dash_stat_products", "Total Catalog")}
            value={Number(summary.total_products || 0).toLocaleString()}
            change={summary.products_growth}
            iconClass="bg-orange-600/10 text-orange-600 dark:bg-orange-600/15"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 text-[10.5px] font-medium uppercase tracking-widest text-stone">
                  {t("dash_sales_overview", "Sales Overview")}
                  {isFiltered && (
                    <span className="ml-2 font-normal text-moss dark:text-emerald-400">
                      • {dateFilter.label} {isSingleDay ? `(${t("dash_calendar_hourly_hint", "24h Hourly")})` : ""}
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-[28px] leading-none text-ink">
                    ${Number(summary?.total_sales || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>

                  {Number(summary?.sales_growth || 0) !== 0 && (
                    <GrowthBadge
                      value={summary?.sales_growth}
                      positive={Number(summary?.sales_growth) >= 0}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center rounded-lg border border-hairline bg-paper p-1">
                {ranges.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    disabled={trendLoading}
                    onClick={() => handleRangeChange(item.key)}
                    className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-60 ${
                      range === item.key && !isFiltered
                        ? "bg-surface text-ink shadow-[0_1px_3px_rgba(33,31,27,0.08)]"
                        : "text-stone hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                {isFiltered && (
                  <span className="rounded-md bg-surface px-3 py-1.5 text-[12px] font-medium text-moss shadow-[0_1px_3px_rgba(33,31,27,0.08)] dark:text-emerald-400">
                    {dateFilter.preset === "custom"
                      ? t("dash_filter_custom", "Custom")
                      : dateFilter.label}
                  </span>
                )}
              </div>
            </div>

            {trendLoading ? (
              <ChartSkeleton />
            ) : trend.length === 0 ? (
              <div className="flex h-75 items-center justify-center">
                <p className="text-[13px] text-stone">
                  {t("dash_no_sales", "No sales data available")}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={trend}
                  margin={{
                    top: 10,
                    right: 5,
                    left: -20,
                    bottom: 0,
                  }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={chartColors.grid}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: chartColors.axisText,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: chartColors.axisText,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />

                  <Tooltip
                    cursor={{
                      fill: chartColors.cursorFill,
                      fillOpacity: 0.06,
                    }}
                    contentStyle={{
                      background: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: 10,
                      fontSize: 12,
                      color: chartColors.tooltipText,
                      boxShadow: "0 8px 24px rgba(33,31,27,0.08)",
                    }}
                    labelStyle={{
                      color: chartColors.tooltipText,
                    }}
                    itemStyle={{
                      color: chartColors.tooltipText,
                    }}
                    labelFormatter={(label) =>
                      isSingleDay ? `${label} (Hour)` : label
                    }
                    formatter={(value) => [
                      `$${Number(value).toFixed(2)}`,
                      t("dash_sales_tooltip", "Sales"),
                    ]}
                  />

                  <Bar
                    dataKey="sales"
                    fill={chartColors.barFill}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-display text-[18px] font-medium text-ink">
                  {t("dash_recent_orders", "Recent Orders")}
                </h2>

                <p className="mt-1 text-[12px] text-stone">
                  {t(
                    "dash_recent_orders_sub",
                    isFiltered
                      ? "Orders during selected period"
                      : "Latest 5 orders from your customers",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-moss transition-colors hover:text-ink"
              >
                {t("dash_view_all", "View All")}
                <ArrowRight size={15} />
              </button>
            </div>

            {ordersLoading ? (
              <OrdersSkeleton />
            ) : recentOrders.length === 0 ? (
              <div className="flex min-h-45 items-center justify-center px-6">
                <div className="text-center">
                  <ShoppingBag
                    size={24}
                    className="mx-auto mb-3 text-stone/50"
                  />

                  <p className="text-[13px] text-stone">
                    {t("dash_no_orders", "No recent orders available")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-180">
                  <thead>
                    <tr className="border-b border-hairline bg-paper/40">
                      <TableHeader>{t("dash_col_order_id", "Order ID")}</TableHeader>
                      <TableHeader>{t("dash_col_customer", "Customer")}</TableHeader>
                      <TableHeader>{t("dash_col_date", "Date")}</TableHeader>
                      <TableHeader>{t("dash_col_payment", "Payment")}</TableHeader>
                      <TableHeader>{t("dash_col_amount", "Amount")}</TableHeader>
                      <TableHeader>{t("dash_col_status", "Status")}</TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => {
                      const customer =
                        order.customer_name ||
                        order.customerName ||
                        order.user?.name ||
                        order.customer?.name ||
                        t("dash_customer_default", "Customer");

                      const payment =
                        order.payment_method ||
                        order.paymentMethod ||
                        order.payment?.method ||
                        "—";

                      const amount =
                        order.total ??
                        order.total_amount ??
                        order.totalAmount ??
                        order.amount ??
                        order.grand_total ??
                        0;

                      const date =
                        order.created_at ||
                        order.createdAt ||
                        order.date ||
                        order.order_date;

                      const status = order.status || "pending";

                      const items = order.items || order.order_items || [];

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-hairline/70 last:border-0"
                        >
                          <TableCell>
                            <span className="font-mono text-[12px] text-ink">
                              #{order.id}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="min-w-0">
                              <p className="max-w-37.5 truncate text-[12.5px] font-medium text-ink">
                                {customer}
                              </p>

                              {Array.isArray(items) && items.length > 0 && (
                                <p className="mt-0.5 text-[11px] text-stone">
                                  {items.length}{" "}
                                  {items.length === 1 ? t("dash_item_single", "item") : t("dash_item_plural", "items")}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-[12px] text-stone">
                              {formatDate(date, isKhmer)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-[12px] capitalize text-stone">
                              {payment}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="font-mono text-[12px] text-ink">
                              ${Number(amount).toFixed(2)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <OrderStatus status={status} t={t} />
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-[18px] font-medium text-ink">
                  {t("dash_breakdown_title", "Order Breakdown")}
                </h2>

                <p className="text-[12px] text-stone">
                  {t(
                    "dash_breakdown_sub",
                    isFiltered
                      ? "Status for selected period"
                      : "Current order status",
                  )}
                </p>
              </div>
            </div>

            {summaryLoading ? (
              <div className="h-80 animate-pulse">
                <div className="mx-auto mt-8 h-44 w-44 rounded-full border-26 border-hairline/40" />

                <div className="mt-6 space-y-3">
                  <div className="h-3 rounded bg-hairline/40" />
                  <div className="h-3 rounded bg-hairline/30" />
                  <div className="h-3 rounded bg-hairline/30" />
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-61.25">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={86}
                        paddingAngle={4}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {orderBreakdown.map((item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                            cornerRadius={8}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] text-stone">
                      {t("dash_breakdown_total", "Total Orders")}
                    </span>

                    <span className="mt-1 font-mono text-[26px] font-medium text-ink">
                      {totalBreakdownOrders.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-hairline pt-4">
                  {orderBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <span className="text-[12px] text-stone">
                          {item.name}
                        </span>
                      </div>

                      <span className="font-mono text-[12px] text-ink">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[18px] font-medium text-ink">
                  {t("dash_top_products", "Top Selling Products")}
                </h2>

                <p className="mt-1 text-[12px] text-stone">
                  {t(
                    "dash_top_products_sub",
                    isFiltered
                      ? "Products with the most orders in this period"
                      : "Products with the most orders",
                  )}
                </p>
              </div>
            </div>

            {ordersLoading ? (
              <TopProductsSkeleton />
            ) : topProducts.length === 0 ? (
              <div className="flex min-h-45 items-center justify-center">
                <div className="text-center">
                  <Package
                    size={24}
                    className="mx-auto mb-3 text-stone/50"
                  />

                  <p className="text-[13px] text-stone">
                    {t("dash_no_products", "No product data available")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-paper">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          size={18}
                          className="text-stone/60"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-ink">
                        {product.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-stone">
                        {t("dash_sold_count", "{count} sold", { count: Number(product.sold).toLocaleString() })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-[12px] text-ink">
                        ${Number(product.revenue).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-hairline py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-paper"
            >
              {t("dash_view_products", "View Products")}
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractOrders(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

function DashboardStatCard({
  icon: Icon,
  label,
  value,
  change,
  iconClass = "bg-moss-tint text-moss",
}) {
  const hasChange = change !== undefined && change !== null && change !== "";

  const isPositive = Number(change || 0) >= 0;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(33,31,27,0.04)]">
      <div className="mb-5 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>

        {hasChange && <GrowthBadge value={change} positive={isPositive} />}
      </div>

      <p className="font-mono text-[25px] leading-none text-ink">
        {value}
      </p>

      <p className="text-[12.5px] text-stone">{label}</p>
    </div>
  );
}

function GrowthBadge({ value, positive }) {
  const numericValue = Number(value || 0);

  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
        positive
          ? "border-moss/20 bg-moss-tint text-moss dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400"
          : "border-red-200 bg-red-50 text-clay dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-400"
      }`}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(numericValue)}%
    </span>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-stone sm:px-6">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return <td className="px-5 py-3 sm:px-6">{children}</td>;
}

function OrderStatus({ status, t }) {
  const normalizedStatus = String(status).toLowerCase();

  const config = {
    completed: {
      icon: CheckCircle2,
      className:
        "bg-moss-tint text-moss dark:bg-emerald-500/15 dark:text-emerald-400",
      label: t ? t("dash_status_completed", "Completed") : "Completed",
    },

    delivered: {
      icon: CheckCircle2,
      className:
        "bg-moss-tint text-moss dark:bg-emerald-500/15 dark:text-emerald-400",
      label: t ? t("dash_status_delivered", "Delivered") : "Delivered",
    },

    pending: {
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
      label: t ? t("dash_status_pending", "Pending") : "Pending",
    },

    processing: {
      icon: Clock3,
      className:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      label: t ? t("dash_status_processing", "Processing") : "Processing",
    },

    paid: {
      icon: CheckCircle2,
      className:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      label: t ? t("dash_status_paid", "Paid") : "Paid",
    },

    shipped: {
      icon: Package,
      className:
        "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
      label: t ? t("dash_status_shipped", "Shipped") : "Shipped",
    },

    cancelled: {
      icon: XCircle,
      className: "bg-red-50 text-clay dark:bg-red-500/15 dark:text-red-400",
      label: t ? t("dash_status_cancelled", "Cancelled") : "Cancelled",
    },
  };

  const current = config[normalizedStatus] || {
    icon: Clock3,
    className: "bg-paper text-stone",
    label: status || "Unknown",
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider capitalize ${current.className}`}
    >
      <Icon size={11} />
      {current.label}
    </span>
  );
}

function OrdersSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-6 gap-6 border-b border-hairline px-5 py-4 last:border-0 sm:px-6"
        >
          <div className="h-3 rounded bg-hairline/40" />
          <div className="h-3 rounded bg-hairline/40" />
          <div className="h-3 rounded bg-hairline/40" />
          <div className="h-3 rounded bg-hairline/40" />
          <div className="h-3 rounded bg-hairline/40" />
          <div className="h-5 w-16 rounded-full bg-hairline/40" />
        </div>
      ))}
    </div>
  );
}

function TopProductsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-lg bg-hairline/40" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-hairline/40" />
            <div className="h-2.5 w-1/3 rounded bg-hairline/30" />
          </div>

          <div className="h-3 w-14 rounded bg-hairline/40" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="relative h-75 animate-pulse">
      <div className="absolute inset-x-0 top-5 h-px bg-hairline/50" />
      <div className="absolute inset-x-0 top-[35%] h-px bg-hairline/40" />
      <div className="absolute inset-x-0 top-[65%] h-px bg-hairline/40" />
      <div className="absolute inset-x-0 bottom-8 h-px bg-hairline/50" />

      <div className="absolute bottom-8 left-8 right-2 top-5 flex items-end gap-2">
        <div className="h-[35%] flex-1 rounded-t-md bg-hairline/30" />
        <div className="h-[55%] flex-1 rounded-t-md bg-hairline/40" />
        <div className="h-[45%] flex-1 rounded-t-md bg-hairline/30" />
        <div className="h-[70%] flex-1 rounded-t-md bg-hairline/50" />
        <div className="h-[60%] flex-1 rounded-t-md bg-hairline/40" />
        <div className="h-[85%] flex-1 rounded-t-md bg-hairline/50" />
        <div className="h-[75%] flex-1 rounded-t-md bg-hairline/40" />
      </div>

      <div className="absolute bottom-0 left-8 right-2 flex justify-between">
        <div className="h-2 w-8 rounded bg-hairline/40" />
        <div className="h-2 w-8 rounded bg-hairline/40" />
        <div className="h-2 w-8 rounded bg-hairline/40" />
        <div className="h-2 w-8 rounded bg-hairline/40" />
        <div className="h-2 w-8 rounded bg-hairline/40" />
      </div>
    </div>
  );
}

function formatDate(date, isKhmer) {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString(isKhmer ? "km-KH" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function DashboardDatePicker({ dateFilter, onChange, t, isKhmer }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [tempPreset, setTempPreset] = useState(dateFilter.preset);
  const [tempStart, setTempStart] = useState(dateFilter.startDate);
  const [tempEnd, setTempEnd] = useState(dateFilter.endDate);
  const [hoveredDate, setHoveredDate] = useState(null);

  const [viewDate, setViewDate] = useState(() => {
    if (dateFilter.endDate) {
      const [y, m, d] = dateFilter.endDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  useEffect(() => {
    if (isOpen) {
      setTempPreset(dateFilter.preset);
      setTempStart(dateFilter.startDate);
      setTempEnd(dateFilter.endDate);
      if (dateFilter.endDate) {
        const [y, m, d] = dateFilter.endDate.split("-").map(Number);
        setViewDate(new Date(y, m - 1, d));
      } else if (dateFilter.startDate) {
        const [y, m, d] = dateFilter.startDate.split("-").map(Number);
        setViewDate(new Date(y, m - 1, d));
      } else {
        setViewDate(new Date());
      }
    }
  }, [isOpen, dateFilter]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const monthName = isKhmer
    ? MONTH_NAMES_KM[viewMonth]
    : MONTH_NAMES_EN[viewMonth];
  const weekdayNames = isKhmer ? WEEKDAY_NAMES_KM : WEEKDAY_NAMES_EN;

  const todayStr = formatYMD(new Date());

  const presets = [
    { key: "all", label: t("dash_filter_all", "All Time") },
    { key: "today", label: t("dash_filter_today", "Today") },
    { key: "yesterday", label: t("dash_filter_yesterday", "Yesterday") },
    { key: "7d", label: t("dash_filter_7d", "Last 7 Days") },
    { key: "30d", label: t("dash_filter_30d", "Last 30 Days") },
    { key: "this_month", label: t("dash_filter_this_month", "This Month") },
    { key: "last_month", label: t("dash_filter_last_month", "Last Month") },
  ];

  const handlePresetSelect = (key) => {
    setTempPreset(key);
    const { startDate, endDate } = calculatePresetDates(key);
    setTempStart(startDate);
    setTempEnd(endDate);
    if (endDate) {
      const [y, m, d] = endDate.split("-").map(Number);
      setViewDate(new Date(y, m - 1, d));
    }
  };

  const handleCellClick = (dateStr) => {
    setTempPreset("custom");
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      if (dateStr < tempStart) {
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const handleCellDoubleClick = (dateStr) => {
    setTempPreset("custom");
    setTempStart(dateStr);
    setTempEnd(dateStr);
  };

  const handleApply = () => {
    let finalStart = tempStart;
    let finalEnd = tempEnd;

    if (finalStart && !finalEnd) {
      finalEnd = finalStart;
    }
    if (finalStart && finalEnd && finalStart > finalEnd) {
      const tmp = finalStart;
      finalStart = finalEnd;
      finalEnd = tmp;
    }

    const updated = {
      preset: tempPreset,
      startDate: finalStart,
      endDate: finalEnd,
    };
    updated.label = getFilterDisplayLabel(updated, t, isKhmer);
    onChange(updated);
    setIsOpen(false);
  };

  const handleClear = () => {
    const updated = {
      preset: "all",
      startDate: null,
      endDate: null,
      label: t("dash_filter_all", "All Time"),
    };
    setTempPreset("all");
    setTempStart(null);
    setTempEnd(null);
    onChange(updated);
    setIsOpen(false);
  };

  const isFiltered =
    dateFilter.preset !== "all" &&
    Boolean(dateFilter.startDate || dateFilter.endDate);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[12.5px] font-medium transition-all shadow-sm ${
          isFiltered
            ? "border-moss/40 bg-moss-tint text-moss dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-400"
            : "border-hairline bg-surface text-ink hover:bg-paper"
        }`}
      >
        <Calendar
          size={16}
          className={
            isFiltered ? "text-moss dark:text-emerald-400" : "text-stone"
          }
        />
        <span className="max-w-45 truncate font-sans sm:max-w-65">
          {dateFilter.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-stone transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:w-145">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline bg-paper/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Calendar
                size={15}
                className="text-moss dark:text-emerald-400"
              />
              <h3 className="text-[13px] font-semibold text-ink">
                {t("dash_calendar_title", "Select Date Range")}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-stone transition-colors hover:bg-paper hover:text-ink"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body: Responsive Split (Presets | Calendar) */}
          <div className="flex flex-col sm:flex-row">
            {/* Presets List */}
            <div className="shrink-0 border-b border-hairline bg-paper/20 p-3 sm:w-44 sm:border-b-0 sm:border-r">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-stone">
                Presets
              </p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-1">
                {presets.map((p) => {
                  const isActive = tempPreset === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePresetSelect(p.key)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-all ${
                        isActive
                          ? "bg-moss text-white shadow-sm dark:bg-emerald-600"
                          : "text-stone hover:bg-paper hover:text-ink"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar & Inputs Section */}
            <div className="flex-1 p-4">
              {/* Month Navigation */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-lg p-1.5 text-stone transition-colors hover:bg-paper hover:text-ink"
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-display text-[13.5px] font-medium text-ink">
                  {monthName} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-lg p-1.5 text-stone transition-colors hover:bg-paper hover:text-ink"
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="mb-1.5 grid grid-cols-7 text-center">
                {weekdayNames.map((w, idx) => (
                  <span
                    key={idx}
                    className="text-[10.5px] font-medium uppercase tracking-wider text-stone"
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div
                className="grid grid-cols-7 gap-y-1 text-center"
                onMouseLeave={() => setHoveredDate(null)}
              >
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`blank-${i}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                  const isStart = tempStart === dateStr;
                  const isEnd = tempEnd === dateStr;

                  let isInRange = false;
                  if (tempStart && tempEnd) {
                    isInRange = dateStr >= tempStart && dateStr <= tempEnd;
                  } else if (tempStart && !tempEnd && hoveredDate) {
                    const low =
                      tempStart < hoveredDate ? tempStart : hoveredDate;
                    const high =
                      tempStart < hoveredDate ? hoveredDate : tempStart;
                    isInRange = dateStr >= low && dateStr <= high;
                  }

                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleCellClick(dateStr)}
                      onDoubleClick={() => handleCellDoubleClick(dateStr)}
                      onMouseEnter={() => setHoveredDate(dateStr)}
                      className={`relative flex h-8 w-full items-center justify-center text-[12px] font-medium transition-all ${
                        isStart && isEnd
                          ? "rounded-lg bg-moss font-bold text-white shadow-sm dark:bg-emerald-600"
                          : isStart
                            ? "rounded-l-lg bg-moss font-bold text-white dark:bg-emerald-600"
                            : isEnd
                              ? "rounded-r-lg bg-moss font-bold text-white dark:bg-emerald-600"
                              : isInRange
                                ? "bg-moss-tint/80 text-moss dark:bg-emerald-500/20 dark:text-emerald-300"
                                : isToday
                                  ? "rounded-lg font-bold text-moss underline underline-offset-4 hover:bg-paper dark:text-emerald-400"
                                  : "rounded-lg text-ink hover:bg-paper"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Start & End Inputs Row */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone">
                    {t("dash_calendar_start", "Start Date")}
                  </label>
                  <input
                    type="date"
                    value={tempStart || ""}
                    onChange={(e) => {
                      setTempStart(e.target.value || null);
                      setTempPreset("custom");
                    }}
                    className="w-full rounded-lg border border-hairline bg-paper px-2.5 py-1.5 text-[11.5px] text-ink focus:border-moss focus:outline-none dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone">
                    {t("dash_calendar_end", "End Date")}
                  </label>
                  <input
                    type="date"
                    value={tempEnd || ""}
                    onChange={(e) => {
                      setTempEnd(e.target.value || null);
                      setTempPreset("custom");
                    }}
                    className="w-full rounded-lg border border-hairline bg-paper px-2.5 py-1.5 text-[11.5px] text-ink focus:border-moss focus:outline-none dark:focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-hairline bg-paper/40 px-4 py-3">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium text-stone transition-colors hover:text-clay"
            >
              <RotateCcw size={13} />
              {t("dash_calendar_clear", "Reset to All Time")}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-stone transition-colors hover:text-ink"
              >
                {t("dash_calendar_cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 rounded-lg bg-moss px-3.5 py-1.5 text-[12px] font-medium text-white shadow-sm transition-opacity hover:opacity-95 dark:bg-emerald-600"
              >
                <Check size={13} />
                {t("dash_calendar_apply", "Apply Filter")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
