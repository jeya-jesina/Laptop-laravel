import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveMediaUrl } from "../services/api";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toast";

function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN") + ".00";
}

const filters = [
  { label: "BASIC USERS", sub: "UNDER ₹20K", min: 0, max: 20000 },
  { label: "PROGRAMMERS", sub: "₹20K – ₹50K", min: 20000, max: 50000 },
  { label: "POWER USERS", sub: "₹50K – ₹90K", min: 50000, max: 90000 },
  { label: "PRO MODELS", sub: "ABOVE ₹90K", min: 90000, max: Infinity },
];

export default function BudgerRefurbished() {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState(-1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCompanyId = () =>
    parseInt(localStorage.getItem("selected_company_id") || "1", 10);

  useEffect(() => {
    let active = true;
    const companyId = getCompanyId();

    const load = (companyOverride) => {
      const cid = companyOverride || companyId;
      api
        .get("/shop/products", {
          params: {
            company_id: cid,
            home_budget: 1,
            per_page: 10,
          },
        })
        .then((res) => {
          if (!active) return;
          const payload = res.data?.data || res.data;
          const list = Array.isArray(payload) ? payload : payload?.data || [];
          if (list.length === 0 && cid !== 1) {
            load(1);
          } else {
            setProducts(list);
          }
        })
        .catch((err) => {
          console.error("Failed to load budget products:", err);
          if (active && cid !== 1) load(1);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    load();

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

  const priceOf = (p) => Number(p.offer_price) || Number(p.price) || 0;

  const visibleProducts =
    activeFilter === -1
      ? products
      : products.filter((p) => {
          const price = priceOf(p);
          const f = filters[activeFilter];
          return price >= f.min && price < f.max;
        });

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="w-full bg-white py-8">
      <div className="max-w-[93%] mx-auto px-6 md:px-8 lg:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            BUDGER REFURBISHED DEALS
          </h1>
          <button
            onClick={() => navigate("/offers")}
            className="hidden sm:inline-flex items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            VIEW ALL
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filters.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(activeFilter === i ? -1 : i)}
              className={`flex flex-col items-start rounded-md border px-4 py-2 min-w-[150px] text-left transition-colors ${activeFilter === i
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <span className="text-xs font-semibold text-gray-900">
                {f.label}
              </span>
              <span className="text-[11px] text-gray-500">{f.sub}</span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visibleProducts.map((p) => {
            const price = priceOf(p);
            const mrp = Number(p.original_price) || price;
            const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white cursor-pointer"
              >
                {/* Image */}
                <div className="relative bg-[#F5F5F5] h-[150px] flex items-center justify-center">
                  <img
                    src={resolveMediaUrl(p.image)}
                    alt={p.product_name || "Budget Offer"}
                    className="max-w-[75%] max-h-[120px] object-contain"
                  />
                  {discountPct > 0 && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {discountPct}% off
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 p-3">

                  {/* Brand */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500">
                      {p.brand_name || "Laptop"}
                    </span>
                  </div>

                  {/* Product Title */}
                  <p className="text-xs text-gray-800 leading-snug line-clamp-3 mb-2 min-h-[54px]">
                    {p.product_name}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      {formatINR(price)}
                    </span>
                    {mrp > price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatINR(mrp)}
                      </span>
                    )}
                  </div>

                  {p.warranty ? (
                    <span className="text-[10px] text-green-600 font-medium mb-2">
                      ✓ {p.warranty}
                    </span>
                  ) : (
                    <span className="text-[10px] text-transparent mb-2">
                      placeholder
                    </span>
                  )}

                  <button
                    onClick={(e) => handleAddToCart(e, p)}
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded"
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
