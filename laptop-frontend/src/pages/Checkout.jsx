
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Plus,
  Home,
  Briefcase,
  Building2,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { formatCurrency } from "../utils/formatters";
import { showToast } from "../utils/toast";
import api, { getActiveCompanyId } from "../services/api";
import CheckoutStepper from "../components/CheckoutStepper";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3271D7] focus:border-transparent transition";

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const labelIcons = {
  Home: Home,
  Office: Briefcase,
  Other: Building2,
};

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
  });

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Check if coming from product details (single product)
  const fromProduct = location.state?.fromProduct || false;
  const productData = location.state?.product || null;
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
    if (fromProduct && location.state) {
      setForm((prev) => ({
        customer_name: location.state.customer_name || prev.customer_name || user?.name || "",
        email: location.state.email || prev.email || user?.email || "",
        mobile: location.state.mobile || prev.mobile || user?.phone || "",
      }));
      return;
    }

    if (user) {
      setForm((prev) => ({
        customer_name: prev.customer_name || user.name || "",
        email: prev.email || user.email || "",
        mobile: prev.mobile || user.phone || "",
      }));
    }
  }, [user, fromProduct, location.state]);

  // Load saved addresses
  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get("/address", { params: { user_id: user.id } });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setSavedAddresses(list);
      const def = list.find((a) => Number(a.is_default) === 1) || list[0];
      if (def) {
        setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

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

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || null;

  const buildShippingAddress = () => {
    if (selectedAddress) {
      const parts = [
        selectedAddress.address,
        selectedAddress.city,
        selectedAddress.state,
        selectedAddress.pincode,
      ].filter(Boolean);
      return parts.join(", ");
    }
    const parts = [
      newAddress.address,
      newAddress.city,
      newAddress.state,
      newAddress.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleDeleteAddress = async (id) => {
    if (!user?.id) return;
    try {
      await api.delete(`/address/${id}`, { params: { user_id: user.id } });
      await loadAddresses();
      showToast("Address removed", "success");
    } catch (err) {
      showToast("Failed to remove address", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!form.customer_name || !form.email || !form.mobile) {
      setError("Please fill in your name, email and mobile number");
      setLoading(false);
      return;
    }

    const shippingAddress = buildShippingAddress();
    if (!shippingAddress) {
      setError("Please select an address or add a new one");
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
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        payment_method: "cash",
        address_id: selectedAddress ? selectedAddress.id : 0,
        save_address: !selectedAddress && saveAddress && user ? 1 : 0,
        address_label: newAddress.label,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
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
            fromCart,
            fromProduct,
            items,
            subtotal,
            gst_total: gstTotal,
            total,
            customer_name: form.customer_name,
            email: form.email,
            mobile: form.mobile,
            shipping_address: shippingAddress,
            address_id: selectedAddress ? selectedAddress.id : 0,
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
      <div className="min-h-screen bg-gradient-to-b from-[#f4f7fc] to-white pt-28 px-4 md:px-8 lg:px-12 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-lg border border-gray-100 p-12 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <ShoppingBag className="text-[#3271D7]" size={36} />
          </div>
          <p className="text-gray-600 font-medium">No items to checkout.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-5 px-6 py-2.5 bg-[#3271D7] text-white rounded-xl hover:bg-[#265bb5] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3fb] via-[#f6f8fc] to-white pt-28 pb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            {fromProduct ? "Confirm Your Order" : "Secure Checkout"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {fromProduct
              ? "Review your product, confirm details and pay."
              : "Review your cart items, confirm details and pay."}
          </p>
          <CheckoutStepper current={1} />
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Step 1: Customer Details ── */}
            <div className="rounded-3xl bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#3271D7] text-white font-bold text-sm">
                  1
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User size={18} className="text-[#3271D7]" /> Customer Details
                  </h2>
                  <p className="text-xs text-gray-400">Who is this order for?</p>
                </div>
              </div>

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

                <div className="grid sm:grid-cols-2 gap-5">
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
                </div>
              </div>
            </div>

            {/* ── Step 2: Delivery Address ── */}
            <div className="rounded-3xl bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#3271D7] text-white font-bold text-sm">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={18} className="text-[#3271D7]" /> Delivery Address
                  </h2>
                  <p className="text-xs text-gray-400">Where should we deliver this order?</p>
                </div>
              </div>

              {/* Saved addresses */}
              {user && savedAddresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-semibold text-gray-700">Saved Addresses</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const Icon = labelIcons[addr.label] || Home;
                      const active = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                            active
                              ? "border-[#3271D7] bg-blue-50/50 shadow-md shadow-blue-100"
                              : "border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                                active ? "bg-[#3271D7] text-white" : "bg-white text-gray-500 border border-gray-200"
                              }`}
                            >
                              <Icon size={12} /> {addr.label || "Home"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id);
                              }}
                              className="text-gray-300 hover:text-red-500 transition"
                              title="Remove address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                            {[addr.address, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                          </p>
                          {addr.name && (
                            <p className="mt-1 text-xs text-gray-400">
                              {addr.name} {addr.phone ? `• ${addr.phone}` : ""}
                            </p>
                          )}
                          {active && (
                            <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#3271D7] text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add new address */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="w-full rounded-2xl border-2 border-dashed border-[#3271D7]/40 bg-blue-50/30 px-4 py-3.5 text-sm font-semibold text-[#3271D7] hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  {showNewAddress ? (
                    <>
                      <ChevronUp size={18} /> Close Address Form
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Add New Address
                    </>
                  )}
                </button>
              </div>

              {showNewAddress && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 space-y-4">
                  <div>
                    <label className={labelClass}>Address Label</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Home", "Office", "Other"].map((lbl) => {
                        const Icon = labelIcons[lbl];
                        return (
                          <button
                            type="button"
                            key={lbl}
                            onClick={() => setNewAddress({ ...newAddress, label: lbl })}
                            className={`rounded-xl border-2 px-3 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                              newAddress.label === lbl
                                ? "border-[#3271D7] bg-white text-[#3271D7]"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            <Icon size={14} /> {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <MapPin size={14} className="inline mr-1 text-[#3271D7]" /> Complete Address *
                    </label>
                    <textarea
                      className={`${inputClass} min-h-24 resize-none`}
                      placeholder="House no, Street, Area, Landmark"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        className={inputClass}
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input
                        className={inputClass}
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClass}>Pincode</label>
                      <input
                        className={inputClass}
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, pincode: e.target.value.replace(/[^0-9]/g, "") })
                        }
                      />
                    </div>
                  </div>

                  {user && (
                    <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#3271D7] focus:ring-[#3271D7]"
                      />
                      Save this address for next time
                    </label>
                  )}
                </div>
              )}

              {/* Summary of chosen address */}
              {buildShippingAddress() && (
                <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-start gap-3">
                  <MapPin size={16} className="text-[#3271D7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Delivering to</p>
                    <p className="text-sm font-medium text-gray-800">{buildShippingAddress()}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full rounded-2xl bg-gradient-to-r from-[#3271D7] to-[#4f8ef5] px-4 py-4 text-white font-bold hover:from-[#265bb5] hover:to-[#3d7ae0] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 flex items-center justify-center gap-2 text-lg"
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
                  <Lock size={20} /> Proceed to Payment
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-green-600" /> Your information is encrypted and secure
            </p>
          </form>

          {/* Order Summary */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden h-fit sticky top-28">
            <div className="bg-gradient-to-r from-[#1a1f36] via-[#2a2f4a] to-[#3271D7] px-6 py-5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5"></div>
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

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(gstTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              </div>

              <div className="mt-4 border-t border-dashed border-gray-200 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#3271D7] text-2xl">{formatCurrency(total)}</span>
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
