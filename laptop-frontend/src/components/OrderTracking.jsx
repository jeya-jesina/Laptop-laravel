import { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  CheckCircle,
  Truck,
  Navigation,
  Home,
  Package,
  PackageCheck,
  Check,
  Clock,
  AlertCircle,
  RotateCcw,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import api from "../services/api";

const STEP_META = {
  placed: {
    Icon: ShoppingBag,
    desc: "We have received your order and are preparing it.",
  },
  confirmed: {
    Icon: CheckCircle,
    desc: "Your order has been confirmed and locked in.",
  },
  shipped: {
    Icon: Truck,
    desc: "Your order has been handed over to the courier.",
  },
  out_for_delivery: {
    Icon: Navigation,
    desc: "Our delivery partner is on the way to you.",
  },
  delivered: {
    Icon: Home,
    desc: "Your order has been delivered. Enjoy!",
  },
};

const POLL_MS = 30000; // re-sync from the backend every 30s

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function OrderTracking({ orderId, showSummary = false, onReset }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const fetchTracking = useCallback(async () => {
    try {
      const res = await api.get("/shop/tracking", { params: { order: orderId } });
      const payload = res.data;
      if (payload?.success && payload.data) {
        setData(payload.data);
        setError(null);
      } else {
        setError(payload?.message || "Order not found");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load tracking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // The parent keys this component by orderId, so a fresh mount resets all state.
  useEffect(() => {
    const timer = setTimeout(fetchTracking, 0);
    return () => clearTimeout(timer);
  }, [fetchTracking]);

  // Live ticker for the countdown.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Periodic re-sync so the backend stays up to date while viewing.
  useEffect(() => {
    const poll = setInterval(fetchTracking, POLL_MS);
    return () => clearInterval(poll);
  }, [fetchTracking]);

  const steps = data?.steps || [];
  const order = data?.order || null;
  const nextMs = data?.next_step_at ? new Date(data.next_step_at).getTime() : null;
  const delivered = steps.length > 0 && steps.every((s) => s.status === "completed");

  // Auto-refresh the instant the next step becomes due.
  useEffect(() => {
    if (nextMs == null) return;
    const delay = Math.max(0, nextMs - Date.now()) + 500;
    const timer = setTimeout(fetchTracking, delay);
    return () => clearTimeout(timer);
  }, [nextMs, fetchTracking]);

  const remaining = nextMs != null ? Math.max(0, nextMs - now) : 0;
  const minutes = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  const progressPct = steps.length > 0 ? (steps.filter((s) => s.status === "completed").length / steps.length) * 100 : 0;

  if (loading && !data) {
    return (
      <div className="space-y-5">
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-[#3271D7] to-emerald-500 rounded-full animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-7 w-7 rounded-full bg-gray-100"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 bg-gray-100 rounded"></div>
              <div className="h-3 w-48 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
          <AlertCircle size={26} />
        </div>
        <p className="text-gray-700 font-semibold">Tracking unavailable</p>
        <p className="text-gray-400 text-sm mt-1.5">{error}</p>
        <button
          onClick={fetchTracking}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#3271D7] bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  if (!data || !order) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
          <Package size={26} />
        </div>
        <p className="text-gray-500 font-semibold">No tracking data</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Order summary */}
      {showSummary && (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#3271D7] flex-shrink-0">
                <PackageCheck size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Order Number
                </p>
                <p className="font-mono font-semibold text-gray-900 truncate">
                  {order.order_no || `#${order.id}`}
                </p>
              </div>
            </div>
            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
              >
                <RotateCcw size={12} />
                New Search
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Status
              </p>
              <p className="text-sm font-semibold text-[#3271D7] capitalize">{order.status}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Calendar size={11} /> Placed on
              </p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Items
              </p>
              <p className="text-sm font-semibold text-gray-900">{order.items_count}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <CreditCard size={11} /> Total
              </p>
              <p className="text-sm font-bold text-[#3271D7]">
                ₹{parseFloat(order.total || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {order.shipping_address && (
            <div className="flex items-start gap-2 mt-4 text-sm text-gray-600">
              <MapPin size={15} className="text-[#3271D7] mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{order.shipping_address}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-7">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3271D7] to-emerald-500 transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#3271D7]">
            {delivered ? (
              <PackageCheck size={17} />
            ) : (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#3271D7] opacity-60 animate-ping"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3271D7]"></span>
              </span>
            )}
          </span>
          <span className="text-[15px] font-semibold text-gray-900">
            {delivered ? "Order Delivered" : steps.find((s) => s.status === "in_progress")?.label || "Order Placed"}
          </span>
        </div>
        {!delivered && nextMs != null && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3271D7] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <Clock size={13} />
            Next update in {minutes}:{seconds}
          </span>
        )}
      </div>

      {/* Timeline */}
      <ol className="relative">
        <div className="absolute left-[13px] top-0 h-full w-0.5 bg-gray-100 rounded-full" />
        <div
          className="absolute left-[13px] top-0 w-0.5 bg-emerald-400 rounded-full transition-all duration-700"
          style={{ height: `${progressPct}%` }}
        />
        {steps.map((step) => {
          const meta = STEP_META[step.key] || { Icon: Package, desc: "" };
          const Icon = meta.Icon;
          const done = step.status === "completed";
          const active = step.status === "in_progress";
          return (
            <li key={step.key} className="relative pl-11 pb-7 last:pb-0">
              <span
                className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  done
                    ? "bg-emerald-500 border-emerald-500"
                    : active
                    ? "bg-[#3271D7] border-[#3271D7] shadow-lg shadow-blue-200 scale-110"
                    : "bg-white border-gray-200"
                }`}
              >
                {done ? (
                  <Check size={14} className="text-white" strokeWidth={3} />
                ) : (
                  <Icon size={13} className={active ? "text-white" : "text-gray-300"} />
                )}
              </span>
              <div className="pt-0.5">
                <p
                  className={`text-[15px] font-semibold ${
                    done ? "text-emerald-600" : active ? "text-[#3271D7]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[13px] text-gray-400 mt-1">
                  {done
                    ? `Completed at ${formatTime(step.completed_at)}`
                    : active
                    ? meta.desc
                    : "Upcoming"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}