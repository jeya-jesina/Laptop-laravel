import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { formatCurrency } from "../utils/formatters";
import CheckoutStepper from "../components/CheckoutStepper";
import {
  CreditCard,
  Wallet,
  QrCode,
  Building2,
  User,
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3271D7] focus:border-transparent transition disabled:bg-gray-100";

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const orderData = location.state || {};
  const isFromCart = orderData.fromCart || false;

  const [form, setForm] = useState({
    mobile: orderData.mobile || "",
    shipping_address: orderData.shipping_address || "",
    payment_method: "cash",
    payment_type: "cash",
    gst_type: "without_gst",
    gst_no: "",
    paid_amount: 0,
  });

  useEffect(() => {
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      navigate("/cart");
      return;
    }

    if (user) {
      setForm((prev) => ({
        ...prev,
        mobile: prev.mobile || user.phone || "",
        shipping_address: prev.shipping_address || user.address || "",
      }));
    }
  }, [user, orderData, navigate]);

  const subtotal = orderData.subtotal || 0;
  const items = orderData.items || [];
  const gstTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const gstPercent = Number(item.gst_percentage || item.gst || 0);
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      return sum + (price * quantity * gstPercent) / 100;
    }, 0);
  }, [items]);
  const totalWithGst = subtotal + gstTotal;
  const total = orderData.total || totalWithGst;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const phoneClean = form.mobile.replace(/[^0-9]/g, "");
    if (!form.mobile || phoneClean.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    if (!form.shipping_address.trim()) {
      setError("Please enter shipping address");
      return false;
    }

    if (form.gst_type === "with_gst" && !form.gst_no.trim()) {
      setError("Please enter GST number");
      return false;
    }

    if (form.payment_type === "cash") {
      const paidAmount = parseFloat(form.paid_amount) || 0;
      if (paidAmount > 0 && paidAmount > total) {
        setError("Paid amount cannot exceed total amount");
        return false;
      }
      if (paidAmount < 0) {
        setError("Paid amount cannot be negative");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    let paidAmount = 0;
    let paymentStatus = "pending";
    let balanceAmount = totalWithGst;

    if (form.payment_type === "credit") {
      paidAmount = 0;
      paymentStatus = "pending";
      balanceAmount = totalWithGst;
    } else {
      paidAmount = parseFloat(form.paid_amount) || totalWithGst;
      if (paidAmount >= totalWithGst) {
        paymentStatus = "paid";
        balanceAmount = 0;
      } else {
        paymentStatus = "partial";
        balanceAmount = totalWithGst - paidAmount;
      }
    }

    const payload = {
      user_id: user?.id || 0,
      order_id: orderData.order_id || 0,
      paid_amount: paidAmount,
      payment_method: form.payment_method,
    };

    try {
      const orderId = orderData.order_id || 0;
      const response = await api.post(`/shop/payment/${orderId}`, payload);

      if (response.data?.success || response.data?.status) {
        setSuccess(true);

        if (isFromCart) {
          await clearCart();
        }

        setTimeout(() => {
          navigate("/payment-success", {
            state: {
              invoice_no: response.data.invoice_no,
              invoice_id: response.data.invoice_id,
              payment_id: response.data.payment_id,
              order_id: response.data.order_id || 0,
              total_amount: total,
              paid_amount: paidAmount,
              balance_amount: balanceAmount,
              payment_status: paymentStatus,
              customer_name: orderData.customer_name || user?.name,
              customer_phone: form.mobile,
              shipping_address: form.shipping_address,
            },
          });
        }, 1500);
      } else {
        setError(response.data?.message || "Payment failed. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      if (err.response) {
        setError(err.response.data?.message || "Server error. Please try again.");
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Wallet, desc: "Pay at delivery" },
    { value: "online", label: "Online", icon: CreditCard, desc: "Card / Net banking" },
    { value: "upi", label: "UPI", icon: Smartphone, desc: "GPay, PhonePe" },
    { value: "credit", label: "Credit", icon: Building2, desc: "Pay later" },
  ];

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eef3fb] to-white pt-28 px-4 md:px-8 lg:px-12 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-lg border border-gray-100 p-12 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">No Order Found</h2>
          <p className="text-gray-500 mt-2">Please add items to your cart first.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2.5 bg-[#3271D7] text-white rounded-xl hover:bg-[#265bb5] transition"
          >
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3fb] via-[#f6f8fc] to-white pt-28 px-4 md:px-8 lg:px-12 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Payment Details
          </h1>
          <p className="mt-2 text-sm text-gray-500">Choose your payment method and confirm your order</p>
          <CheckoutStepper current={3} />
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200 flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>Payment successful! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Customer Details */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#3271D7] text-white">
                    <User size={17} />
                  </span>
                  Customer Details
                </h3>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Order for</div>
                    <div className="mt-1 font-bold text-gray-900 text-lg">
                      {orderData.customer_name || user?.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <Mail size={14} className="text-[#3271D7]" />
                      {orderData.email || user?.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <MapPin size={14} className="text-[#3271D7]" />
                      {form.shipping_address}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Phone size={14} className="inline mr-1 text-[#3271D7]" /> Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      disabled={submitting || success}
                      className={inputClass}
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#3271D7] text-white">
                    <CreditCard size={17} />
                  </span>
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          payment_method: method.value,
                          payment_type: method.value === "credit" ? "credit" : "cash",
                        }));
                      }}
                      disabled={submitting || success}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                        form.payment_method === method.value
                          ? "border-[#3271D7] bg-blue-50 shadow-md shadow-blue-100 scale-[1.02]"
                          : "border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <method.icon
                        className={`mx-auto h-7 w-7 mb-2 ${
                          form.payment_method === method.value ? "text-[#3271D7]" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`block text-xs font-semibold ${
                          form.payment_method === method.value ? "text-[#3271D7]" : "text-gray-600"
                        }`}
                      >
                        {method.label}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{method.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || success}
                className="w-full bg-gradient-to-r from-[#3271D7] to-[#4f8ef5] text-white py-4 rounded-2xl hover:from-[#265bb5] hover:to-[#3d7ae0] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-bold shadow-xl shadow-blue-200"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pay {formatCurrency(total)}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-green-600" /> Your payment is secure and encrypted
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden h-fit sticky top-28">
            <div className="bg-gradient-to-r from-[#1a1f36] via-[#2a2f4a] to-[#3271D7] px-6 py-5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5"></div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag size={20} /> Order Summary
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(gstTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#3271D7] text-2xl">{formatCurrency(totalWithGst)}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Items</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm py-2 px-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-gray-600">
                        {item.product_name} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {user && (
                <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-green-600" /> Order will be linked to your account
                  </p>
                  <p className="mt-1">You can view your orders in your profile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
