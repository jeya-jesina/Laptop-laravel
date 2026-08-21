import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus, PackageOpen } from "lucide-react";
import api, { resolveMediaUrl, FALLBACK_IMAGE } from "../services/api";
import { formatCurrency } from "../utils/formatters";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toast";

// ─── Helper Component: Loading Spinner ──────────────────────────────────────
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#f4f7fc] pt-12 md:pt-28 pb-12 px-4 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3271D7]/20 border-t-[#3271D7]" />
  </div>
);

// ─── Helper Component: Empty Cart ──────────────────────────────────────────
const EmptyCart = () => (
  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
    <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
      <PackageOpen className="w-12 h-12 text-[#3271D7]" />
    </div>
    <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
    <p className="text-gray-500 text-sm mt-2">Start shopping to add items to your cart</p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-[#3271D7] text-white rounded-full hover:bg-[#265bb5] transition shadow-md shadow-blue-200"
    >
      Continue Shopping <ArrowRight size={18} />
    </Link>
  </div>
);

// ─── Helper Component: Single Cart Item ────────────────────────────────────
const CartItem = ({ item, onUpdate, onRemove }) => {
  const imageSrc =
    resolveMediaUrl(item.image) ||
    FALLBACK_IMAGE;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl bg-white p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300">
      {/* Left: Image + Details */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
          <img
            src={imageSrc}
            alt={item.product_name || "Product"}
            className="w-full h-full object-contain mix-blend-multiply p-1"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
            {item.product_name}
          </h3>
          <p className="text-base md:text-lg font-bold text-[#3271D7] mt-0.5 md:mt-1">
            {formatCurrency(Number(item.price))}
            {Number(item.gst_percentage) > 0 && (
              <span className="text-xs text-gray-400 font-normal ml-1">
                (incl. GST {item.gst_percentage}%)
              </span>
            )}
          </p>
          {item.size && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] md:text-xs font-medium text-[#3271D7] mt-1">
              Size: {item.size}
            </span>
          )}
        </div>
      </div>

      {/* Right: Quantity + Remove */}
      <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-1 md:gap-2 bg-blue-50 rounded-full px-1.5 py-1">
          <button
            onClick={() => onUpdate(item.id, Number(item.quantity) - 1)}
            className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white text-[#3271D7] shadow-sm hover:bg-blue-100 transition flex items-center justify-center disabled:opacity-40"
            disabled={Number(item.quantity) <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-5 text-center text-sm md:text-base font-bold text-gray-900">{item.quantity}</span>
          <button
            onClick={() => onUpdate(item.id, Number(item.quantity) + 1)}
            className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white text-[#3271D7] shadow-sm hover:bg-blue-100 transition flex items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-red-500 hover:text-red-700 transition"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Helper Component: Order Summary ───────────────────────────────────────
const OrderSummary = ({ subtotal, gst, total, onCheckout, itemCount }) => {
  const avgGst = itemCount > 0 && gst > 0 ? Math.round((gst / subtotal) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden h-fit sticky top-24 md:top-28">
      <div className="bg-gradient-to-r from-[#3271D7] to-[#4f8ef5] px-6 py-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCart size={20} /> Order Summary
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
          </div>

          {gst > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">GST ({avgGst}%)</span>
              <span className="font-semibold text-gray-900">{formatCurrency(gst)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600 font-semibold">Free</span>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-bold text-lg">Total</span>
            <span className="font-extrabold text-2xl text-[#3271D7]">
              {formatCurrency(total)}
            </span>
          </div>

          {gst > 0 && (
            <p className="text-xs text-gray-400 text-right -mt-2">
              Inclusive of all taxes
            </p>
          )}
        </div>

        <button
          onClick={onCheckout}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-[#3271D7] text-white py-3.5 rounded-xl hover:bg-[#265bb5] transition font-semibold shadow-lg shadow-blue-200"
        >
          Proceed to Checkout <ArrowRight size={18} />
        </button>

        <Link
          to="/"
          className="block text-center mt-4 text-[#3271D7] text-sm font-medium hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT: Cart ──────────────────────────────────────────────────
export default function Cart() {
  const { cartItems, refreshCounts } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // ─── Load cart on mount ──────────────────────────────────────────────────
  useEffect(() => {
    refreshCounts()
      .catch((err) => console.error("Failed to load cart:", err))
      .finally(() => setLoading(false));
  }, []);

  // ─── API: Update quantity ──────────────────────────────────────────────
  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;

    const item = cartItems.find((i) => String(i.id) === String(id));
    const stock = item ? Number(item.stock) : NaN;

    if (Number.isFinite(stock) && stock <= 0) {
      showToast("Product is not available in stock", "error");
      return;
    }
    if (Number.isFinite(stock) && quantity > stock) {
      showToast(
        `Only ${stock} unit${stock > 1 ? "s" : ""} available in stock`,
        "error"
      );
      return;
    }

    try {
      await api.post(`/shop/cart/${id}`, { user_id: user?.id || 0, quantity });
      await refreshCounts();
      showToast("Quantity updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Unable to update quantity", "error");
    }
  };

  // ─── API: Remove item ──────────────────────────────────────────────────
  const removeItem = async (id) => {
    try {
      await api.delete(`/shop/cart/${id}`, { params: { user_id: user?.id || 0 } });
      await refreshCounts();
      showToast("Item removed successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Unable to remove item", "error");
    }
  };

  // ─── Calculations ──────────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cartItems]);

  const gstTotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => {
      const gst = Number(item.gst_percentage || 0);
      return sum + (Number(item.price) * Number(item.quantity) * gst) / 100;
    }, 0);
  }, [cartItems]);

  const grandTotal = subtotal + gstTotal;

  // ─── Checkout handler ──────────────────────────────────────────────────
  const handleCheckout = () => {
    if (!user) {
      showToast("Please login first", "error");
      setTimeout(() => navigate("/login"), 500);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    navigate("/checkout", {
      state: {
        fromCart: true,
        cartItems,
        subtotal,
        gstAmount: gstTotal,
        total: grandTotal,
        customer_name: user.name || "",
        email: user.email || "",
        mobile: user.phone || "",
        shipping_address: user.address || "",
      },
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-12 md:pt-28 pb-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-gray-900 flex items-center gap-3"
      >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3271D7] text-white">
            <ShoppingCart size={22} />
          </span>
          Cart
          {cartItems?.length > 0 && (
            <span className="text-sm font-bold bg-blue-50 text-[#3271D7] px-3 py-1 rounded-full">
              {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
            </span>
          )}
        </motion.h1>

        <div className="mt-8 grid lg:grid-cols-[2fr_1fr] gap-8 items-start">
          {/* ─── Left Column: Cart Items ────────────────────────────────── */}
          <div className="space-y-4">
            {!cartItems || cartItems.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <EmptyCart />
              </motion.div>
            ) : (
              cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <CartItem
                    item={item}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                  />
                </motion.div>
              ))
            )}
        </div>

          {/* ─── Right Column: Order Summary ───────────────────────────── */}
          {cartItems && cartItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <OrderSummary
                subtotal={subtotal}
                gst={gstTotal}
                total={grandTotal}
                itemCount={cartItems.length}
                onCheckout={handleCheckout}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
