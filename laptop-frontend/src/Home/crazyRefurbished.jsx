import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toast";

const filters = [
  { label: "MacBook", sub: "Up to 50% off" },
  { label: "Premium laptops", sub: "Up to 35% off" },
  { label: "OG gaming laptops", sub: "Up to 20% off" },
  { label: "2 in 1 laptops", sub: "Up to 15% off" },
];

function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN") + ".00";
}

export default function CrazyRefurbished() {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = (cid) => {
      api
        .get("/shop/products", {
          params: { company_id: cid, offer: 1, per_page: 10 },
        })
        .then((res) => {
          if (!active) return;
          const payload = res.data?.data || res.data;
          const list = Array.isArray(payload) ? payload : payload?.data || [];
          setProducts(list);
        })
        .catch((err) => {
          console.error("Failed to load offers:", err);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    getActiveCompanyId().then(load);

    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please log in to add items to cart", "error");
      navigate("/login");
      return;
    }

    const price = Number(product.offer_price) || Number(product.price) || 0;
    const res = await addToCart(product.id, 1, price);
    if (res?.status) {
      showToast("Added to cart successfully", "success");
    } else {
      showToast(res?.message || "Unable to add to cart", "error");
    }
  };

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="w-full bg-white py-3 md:py-8">
      <div className="max-w-[97%] mx-auto px-3 md:px-8 lg:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            CRAZY REFURBISHED DEALS
          </h1>
          <button
            onClick={() => navigate("/offers")}
            className="hidden sm:inline-flex items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            VIEW ALL
          </button>
        </div>

    {/* Filter pills */}
<div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 mb-3 md:mb-6">
  {filters.map((f) => (
    <button
      key={f.label}
      onClick={() => navigate("/offers")}
      className="w-full md:w-auto flex flex-col items-start rounded-md border px-3 md:px-4 py-2 min-w-0 md:min-w-[150px] text-left transition-colors border-gray-200 hover:border-gray-300"
    >
      <span className="text-xs font-semibold text-gray-900">
        {f.label}
      </span>

      <span className="text-[11px] text-gray-500">
        {f.sub}
      </span>
    </button>
  ))}
</div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
          {products.map((p) => {
            const price = Number(p.offer_price) || Number(p.price) || 0;
            const mrp = Number(p.original_price) || price;
            const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white cursor-pointer"
              >
                {/* Image */}
                <div className="relative bg-[#F5F5F5] h-[90px] md:h-[150px] flex items-center justify-center">
                  <img
                    src={resolveMediaUrl(p.image)}
                    alt={p.product_name || "Offer"}
                    className="max-w-[75%] max-h-[70px] md:max-h-[120px] object-contain mix-blend-multiply"
                  />
                  {discountPct > 0 && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {discountPct}% off
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 p-2 md:p-3">

                  {/* Brand */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] md:text-[11px] font-semibold tracking-[2px] uppercase text-gray-500">
                      {p.brand_name || "Laptop"}
                    </span>
                  </div>

                  {/* Product Title */}
                  <p className="text-[10px] md:text-xs text-gray-800 leading-tight line-clamp-1 truncate mb-1 min-h-0">
                    {p.product_name}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs md:text-sm font-bold text-gray-900">
                      {formatINR(price)}
                    </span>
                    {mrp > price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatINR(mrp)}
                      </span>
                    )}
                  </div>

                  {p.warranty ? (
                    <span className="text-[9px] md:text-[10px] text-green-600 font-medium mb-1.5">
                      ✓ {p.warranty}
                    </span>
                  ) : (
                    <span className="text-[9px] md:text-[10px] text-transparent mb-1.5">
                      placeholder
                    </span>
                  )}

                  <button
                    onClick={(e) => handleAddToCart(e, p)}
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] md:text-xs font-semibold py-1 md:py-2 rounded"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
