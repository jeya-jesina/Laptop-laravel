import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Package,
  Search,
  Truck,
  ArrowLeft,
  X,
  Home,
} from "lucide-react";
import OrderTracking from "../components/OrderTracking";

const STEPS_INFO = [
  {
    title: "Order Placed",
    desc: "We receive your order and get it ready in our warehouse.",
    Icon: Package,
  },
  {
    title: "Shipped",
    desc: "Your order leaves our warehouse and heads to your city.",
    Icon: Truck,
  },
  {
    title: "Delivered",
    desc: "The package is handed over safely at your doorstep.",
    Icon: Home,
  },
];

export default function TrackOrder() {
  const [params] = useSearchParams();
  const initial = (params.get("order") || "").trim();
  const [input, setInput] = useState(initial);
  const [trackedId, setTrackedId] = useState(initial);

  const handleTrack = (e) => {
    e.preventDefault();
    const id = input.trim();
    if (id) setTrackedId(id);
  };

  const clearSearch = () => {
    setInput("");
    setTrackedId("");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-14 md:pt-32 pb-20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#3271D7]/10 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"></div>

      <div className="relative max-w-2xl mx-auto px-4 md:px-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#3271D7] transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3271D7] to-[#4f8ef5] text-white shadow-lg shadow-blue-200 ring-8 ring-blue-50 mb-6 animate-float">
            <Truck size={34} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#3271D7] mb-4">
            Live Order Status
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#181818] tracking-tight leading-tight">
            Track Your Order
          </h1>
          <p className="text-gray-500 mt-4 text-[15px] leading-relaxed max-w-md mx-auto">
            Enter your order number below to follow its journey from our
            warehouse to your doorstep.
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleTrack}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-7 mb-8 animate-fade-in-up"
        >
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
            Order Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Package
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter order ID or order number"
                className="w-full h-12 pl-12 pr-11 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#3271D7] focus:ring-4 focus:ring-blue-100 outline-none text-[15px] text-gray-900 placeholder:text-gray-400 transition-all"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  aria-label="Clear"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 h-12 px-7 bg-[#3271D7] text-white rounded-xl hover:bg-[#265bb5] transition font-semibold text-sm shadow-md shadow-blue-200 active:scale-[0.98]"
            >
              <Search size={16} />
              Track Order
            </button>
          </div>
        </form>

        {/* Tracking view */}
        {trackedId ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 animate-scale-in">
            <OrderTracking key={trackedId} orderId={trackedId} showSummary onReset={clearSearch} />
          </div>
        ) : (
          <div className="text-center py-14 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <Truck size={34} className="text-[#3271D7]" />
            </div>
            <p className="text-gray-700 font-semibold">No order tracked yet</p>
            <p className="text-gray-400 text-sm mt-1.5">
              Enter your order ID or order number above to see its live status.
            </p>
          </div>
        )}

        {/* How it works */}
        <section className="mt-10">
          <h2 className="text-center font-serif text-2xl md:text-3xl font-bold text-[#181818] mb-2">
            How tracking works
          </h2>
          <p className="text-center text-sm text-gray-500 mb-7">
            A simple, transparent journey for every order.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS_INFO.map(({ title, desc, Icon }, i) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#3271D7] mb-4">
                  <Icon size={22} />
                </span>
                <p className="font-semibold text-gray-900 mb-1.5">{title}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  {desc}
                </p>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400 text-xs font-bold mt-4">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-6">
            Tracking updates automatically every 2 minutes.
          </p>
        </section>
      </div>
    </div>
  );
}