import { Link, useLocation } from "react-router-dom";
import { Check, ShoppingBag, Home, FileText, PartyPopper, BadgeCheck } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

export default function PaymentSuccess() {
  const location = useLocation();
  const data = location.state || {};

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-28 pb-16 px-4 md:px-8 lg:px-12 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Success Hero */}
        <div className="relative bg-gradient-to-r from-[#3271D7] via-[#3d8bf0] to-[#34c98b] px-8 pt-12 pb-16 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-16 -right-8 w-56 h-56 rounded-full bg-white/10"></div>

          <div className="relative">
            {/* Animated check */}
            <div className="relative w-24 h-24 mx-auto mb-5">
              <span className="absolute inset-0 rounded-full bg-white/30 animate-ping"></span>
              <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Check className="w-12 h-12 text-[#34c98b]" strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Payment Successful!
            </h1>
            <p className="mt-2 text-blue-50 font-medium">
              Your payment has been processed successfully.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full">
              <PartyPopper size={14} /> Thank you for your purchase
            </div>
          </div>
        </div>

        {/* Receipt / Details */}
        <div className="px-8 -mt-8 relative">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg px-6 py-6">
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Invoice Number</p>
                <p className="mt-0.5 font-bold text-[#3271D7]">#{data.invoice_no || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Customer</p>
                <p className="mt-0.5 font-semibold text-gray-900 truncate">
                  {data.customer_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Amount</p>
                <p className="mt-0.5 font-extrabold text-gray-900">
                  {formatCurrency(data.total_amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <p className="mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      data.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <BadgeCheck size={13} />
                    {data.payment_status === "paid" ? "Paid" : "Partial"}
                  </span>
                </p>
              </div>

              {data.payment_status !== "paid" && data.balance_amount > 0 && (
                <div className="col-span-2 rounded-xl bg-red-50 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 font-medium">Balance Amount</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(data.balance_amount)}
                    </span>
                  </div>
                </div>
              )}

              {data.customer_phone && (
                <div className="col-span-2 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm">
                  <span className="text-gray-500">Order Phone</span>
                  <span className="font-semibold text-[#3271D7]">{data.customer_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-8 space-y-3">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 w-full bg-[#3271D7] text-white px-6 py-3.5 rounded-xl hover:bg-[#265bb5] transition font-semibold shadow-lg shadow-blue-200"
          >
            <ShoppingBag size={20} />
            View My Orders
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full border-2 border-[#3271D7]/20 bg-blue-50/50 text-[#3271D7] px-6 py-3.5 rounded-xl hover:bg-[#3271D7] hover:text-white transition font-semibold"
          >
            <Home size={20} />
            Continue Shopping
          </Link>

          <div className="pt-5 text-center text-sm text-gray-400">
            <p className="flex items-center justify-center gap-1.5">
              <FileText size={14} className="text-[#3271D7]" />
              An invoice has been generated for your order.
            </p>
            <p className="mt-1">For any queries, contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
