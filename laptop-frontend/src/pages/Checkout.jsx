
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, ShoppingBag, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { formatCurrency } from "../utils/formatters";
import api, { getActiveCompanyId } from "../services/api";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3271D7] focus:border-transparent transition";

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    mobile: "",
    shipping_address: "",
  });

  // Check if coming from product details (single product)
  const fromProduct = location.state?.fromProduct || false;
  const productData = location.state?.product || null;

  // Check if coming from cart
  const fromCart = location.state?.fromCart || false;

  // Determine items and total
  const { items, subtotal, gstTotal, total } = useMemo(() => {
    if (fromProduct && productData) {
      const items = [
        {
          product_id: productData.product_id,
          product_name: productData.product_name,
          price: productData.price,
          quantity: productData.quantity || 1,
          gst_percentage: productData.gst_percentage || 0,
          size: productData.size || "",
          image: productData.image || "",
        },
      ];
      const subtotal = productData.price * (productData.quantity || 1);
      const gstTotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity * Number(item.gst_percentage || 0)) / 100,
        0
      );
      return { items, subtotal, gstTotal, total: subtotal + gstTotal };
    } else if (fromCart && cartItems.length > 0) {
      const items = cartItems.map((item) => ({
        product_id: item.product_id || item.id,
        product_name: item.product_name || item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        size: item.size || "",
        gst_percentage: Number(item.gst_percentage || item.gst || 0),
      }));
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gstTotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity * Number(item.gst_percentage || 0)) / 100,
        0
      );
      return { items, subtotal, gstTotal, total: subtotal + gstTotal };
    }
    return { items: [], subtotal: 0, gstTotal: 0, total: 0 };
  }, [fromProduct, productData, fromCart, cartItems]);

  // Pre-fill form data
  useEffect(() => {
    // If coming from product details, use the data passed
    if (fromProduct && location.state) {
      setForm((prev) => ({
        ...prev,
        customer_name: location.state.customer_name || prev.customer_name || user?.name || "",
        email: location.state.email || prev.email || user?.email || "",
        mobile: location.state.mobile || prev.mobile || user?.phone || "",
        shipping_address:
          location.state.shipping_address || prev.shipping_address || user?.address || "",
      }));
      return;
    }

    // If user is logged in, fill with user data
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || "",
        email: prev.email || user.email || "",
        mobile: prev.mobile || user.phone || "",
        shipping_address: prev.shipping_address || user.address || "",
      }));
    }
  }, [user, fromProduct, location.state]);

  // Redirect if no items
  useEffect(() => {
    if (!fromProduct && !fromCart) {
      navigate("/cart");
      return;
    }
    if (!fromProduct && fromCart && cartItems.length === 0) {
      navigate("/cart");
    }
    if (fromProduct && !productData) {
      navigate("/");
    }
  }, [fromProduct, fromCart, cartItems, productData, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!form.customer_name || !form.email || !form.mobile || !form.shipping_address) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const companyId = await getActiveCompanyId();
      const response = await api.post("/shop/checkout", {
        user_id: user ? user.id : 0,
        company_id: companyId,
        customer_name: form.customer_name,
        mobile: form.mobile,
        email: form.email,
        shipping_address: form.shipping_address,
        billing_address: form.shipping_address,
        payment_method: "cash",
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || "",
          image: item.image || "",
          gst_percentage: item.gst_percentage || 0,
        })),
        subtotal,
        gst: gstTotal,
        grand_total: total,
      });

      if (response.data?.success || response.data?.status) {
        navigate("/payment", {
          state: {
            fromCart: fromCart,
            fromProduct: fromProduct,
            items: items,
            subtotal: subtotal,
            gst_total: gstTotal,
            total: total,
            customer_name: form.customer_name,
            email: form.email,
            mobile: form.mobile,
            shipping_address: form.shipping_address,
            user_id: user ? user.id : 0,
            order_id: response.data?.data?.order_id,
          },
        });
      } else {
        setError(response.data?.message || "Unable to process checkout");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to process checkout");
    } finally {
      setLoading(false);
    }
  };

  // If no items, show loading or redirect
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f7fc] pt-28 px-4 md:px-8 lg:px-12 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md">
          <p className="text-gray-600 font-medium">No items to checkout.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2.5 bg-[#3271D7] text-white rounded-full hover:bg-[#265bb5] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-28 pb-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-gray-900 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3271D7] text-white">
              <ShoppingBag size={22} />
            </span>
            {fromProduct ? "Confirm Order" : "Checkout"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {fromProduct
              ? "Review your product and proceed to payment."
              : "Review your cart items and proceed to payment."}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-[#3271D7] font-semibold text-sm mb-6">
              <User size={16} /> Shipping Details
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  <User size={14} className="inline mr-1 text-[#3271D7]" /> Full Name *
                </label>
                <input
                  required
                  className={inputClass}
                  placeholder="Full Name"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Mail size={14} className="inline mr-1 text-[#3271D7]" /> Email *
                </label>
                <input
                  required
                  type="email"
                  className={inputClass}
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Phone size={14} className="inline mr-1 text-[#3271D7]" /> Mobile Number *
                </label>
                <input
                  required
                  type="tel"
                  className={inputClass}
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <MapPin size={14} className="inline mr-1 text-[#3271D7]" /> Shipping Address *
                </label>
                <textarea
                  required
                  className={`${inputClass} min-h-24 resize-none`}
                  placeholder="Shipping Address"
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="mt-8 w-full rounded-xl bg-[#3271D7] px-4 py-3.5 text-white font-semibold hover:bg-[#265bb5] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <Lock size={18} /> Proceed to Payment
                </>
              )}
            </button>
          </form>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden h-fit sticky top-28">
            <div className="bg-gradient-to-r from-[#3271D7] to-[#4f8ef5] px-6 py-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag size={20} /> Order Summary
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-2.5 text-sm text-gray-600 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="font-medium text-gray-800">
                      {item.product_name}{" "}
                      <span className="text-gray-400">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-dashed border-gray-200 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#3271D7] text-xl">{formatCurrency(total)}</span>
              </div>

              {user && (
                <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span>Order will be linked to your account</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
