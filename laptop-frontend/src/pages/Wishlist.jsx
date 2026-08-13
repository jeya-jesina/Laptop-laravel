import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toast";
import api, { resolveImageUrl } from "../services/api";

export default function Wishlist() {
  const { wishlistItems, refreshCounts } = useStore();
  const { user } = useAuth();
  const [items, setItems] = useState(wishlistItems);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    setItems(wishlistItems);
  }, [wishlistItems]);

  const removeItem = async (id) => {
    try {
      const response = await api.delete(`/shop/wishlist/${id}`, {
        params: { user_id: user?.id || 0 },
      });
      if (response.data?.success) {
        await refreshCounts();
        showToast("Removed from wishlist", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Unable to remove item", "error");
    }
  };

  const moveToCart = async (product) => {
    try {
      const response = await api.post("/shop/cart", {
        user_id: user?.id || 0,
        product_id: product.product_id,
        quantity: 1,
        price: product.price,
        size: product.size || "",
      });
      if (response.data?.success) {
        await removeItem(product.id);
        await refreshCounts();
        showToast("Moved to cart successfully", "success");
      } else {
        showToast(response.data?.message || "Unable to move item to cart", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Unable to move item to cart", "error");
    }
  };

  const moveAllToCart = async () => {
    for (const item of items) {
      await moveToCart(item);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-12 md:pt-28 px-4 md:px-8 lg:px-12 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3271D7] text-white">
                <Heart size={22} />
              </span>
              Wishlist
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {items.length} {items.length === 1 ? "item" : "items"} in your wishlist
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
              >
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
              <button
                onClick={moveAllToCart}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3271D7] text-white rounded-full text-sm font-semibold hover:bg-[#265bb5] transition shadow-md shadow-blue-200"
              >
                <ShoppingBag size={16} /> Move All to Cart
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-12 text-center border border-gray-100 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Heart size={36} className="text-[#3271D7]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-gray-400 mt-2">
              Start adding your favorite laptops to your wishlist
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-[#3271D7] text-white rounded-full hover:bg-[#265bb5] transition shadow-md shadow-blue-200"
            >
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-[#F5F5F5] aspect-square">
                    <img
                      src={
                        resolveImageUrl(item.image || "") ||
                        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0"
                      }
                      alt={item.product_name}
                      className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Wishlist badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#3271D7] shadow-sm flex items-center gap-1">
                        <Heart size={12} fill="#3271D7" className="text-[#3271D7]" /> Saved
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product_name}
                        </h3>
                        {item.size && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs text-gray-400">Size</span>
                            <span className="text-xs font-medium bg-blue-50 text-[#3271D7] px-2 py-0.5 rounded-md">
                              {item.size}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition p-1.5 hover:bg-red-50 rounded-full flex-shrink-0"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-extrabold text-[#3271D7]">
                        {formatCurrency(item.offer_price || item.price)}
                      </span>
                      <button
                        onClick={() => moveToCart(item)}
                        className="flex items-center gap-1.5 bg-[#181818] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-[#3271D7] transition"
                      >
                        <ShoppingBag size={13} /> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
