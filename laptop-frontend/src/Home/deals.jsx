import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toast";

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN") + ".00";

const DEAL_STOPWORDS = new Set([
  "refurbished", "with", "and", "the", "new", "of", "for", "inch", "inches",
  "retina", "display", "fhd", "uhd", "series", "gen", "touch", "bar",
  "laptop", "notebook", "ultrabook", "best", "price", "deal",
]);

const tokenize = (s = "") =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ")
    .filter(Boolean)
    .filter((t) => !DEAL_STOPWORDS.has(t) && t.length > 1);

const pickBestProduct = (title, products) => {
  const titleTokens = tokenize(title);
  if (titleTokens.length === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const p of products) {
    const nameTokens = new Set(tokenize(p.product_name));
    const score = titleTokens.reduce((acc, t) => acc + (nameTokens.has(t) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore > 0 ? best : null;
};

function CountdownTimer({ endAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, new Date(endAt).getTime() - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="text-white font-black text-xl sm:text-[28px] tracking-widest leading-none sm:pr-2">
      {pad(h)}H : {pad(m)}M : {pad(s)}S
    </div>
  );
}

const Deals = () => {
  const [deal, setDeal] = useState(null);
  const [companyId, setCompanyId] = useState(0);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const { refreshCounts } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    getActiveCompanyId().then((cid) => {
      setCompanyId(cid);

      api
        .get("/banner/get_active", {
          params: { company_id: cid, banner_group: "deal_of_day" },
        })
        .then((res) => {
          if (res.data.status && Array.isArray(res.data.data) && res.data.data.length > 0) {
            setDeal(res.data.data[0]);
          }
        })
        .catch((err) => console.error("Failed to load deal of the day:", err));
    });
  }, []);

  useEffect(() => {
    if (!deal) return;

    // Preferred: use the product the admin explicitly linked to the banner.
    if (Number(deal.product_id) > 0) {
      api
        .get(`/shop/products/${Number(deal.product_id)}`)
        .then((res) => {
          if (res.data?.success && res.data.data) setProduct(res.data.data);
        })
        .catch(() => setProduct(null));
      return;
    }

    // Fallback: auto-match the deal to the closest product in the catalog.
    api
      .get("/shop/products", { params: { company_id: companyId, per_page: 100 } })
      .then((res) => {
        const payload = res.data?.data || res.data;
        const list = Array.isArray(payload) ? payload : payload?.data || [];
        setProduct(pickBestProduct(deal.title, list));
      })
      .catch(() => setProduct(null));
  }, [deal, companyId]);

  if (!deal) return null;

  const price = Number(deal.price) || 0;
  const mrp = Number(deal.mrp) || 0;
  const saveAmt = mrp - price;
  const discountPct = mrp > 0 ? Math.round((saveAmt / mrp) * 100) : 0;
  const saveText =
    deal.badge || (mrp > 0 ? `SAVE ₹${saveAmt.toLocaleString("en-IN")} (${discountPct}% OFF)` : "");
  const productId = product?.id || Number(deal.product_id) || 0;

  const handleAddToCart = async () => {
    if (!productId) {
      showToast("No matching product found for this deal", "error");
      return;
    }
    if (!user) {
      showToast("Please log in to add items to cart", "error");
      setTimeout(() => navigate("/login"), 500);
      return;
    }

    try {
      const res = await api.post("/shop/cart", {
        user_id: user.id || 0,
        product_id: productId,
        quantity: 1,
        price: price,
      });
      await refreshCounts();
      if (res.data?.success || res.data?.status) {
        showToast("Added to cart successfully", "success");
      } else {
        showToast(res.data?.message || "Unable to add to cart", "error");
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      showToast("Add to cart failed. Please try again.", "error");
    }
  };

  const handleViewDetails = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else if (deal.link_url) {
      window.open(deal.link_url, "_blank", "noreferrer");
    } else {
      showToast("Product details not available", "error");
    }
  };

  return (
    <section className="w-full bg-[#f3f3f3] py-12 px-4">
      <div className="max-w-[91%] mx-auto bg-[#eff4fc] rounded-[32px] overflow-hidden shadow-sm">

        {/* TOP BAR: GRADIENT HEADER SECTION */}
        <div className="bg-gradient-to-r from-[#f7cbb1] to-[#ff7a7a] px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-[26px] font-black text-[#1c1c1c] tracking-tight leading-tight">
              <span className="block sm:inline">DEAL OF</span>{" "}
              <span className="block sm:inline">THE DAY</span>
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#2c2c2c] font-medium mt-0.5">
              Handpicked daily — the deepest discount and biggest savings on a flagship pick.
            </p>
          </div>

          {/* TIMER */}
          {deal.timer_end_at ? (
            <CountdownTimer endAt={deal.timer_end_at} />
          ) : null}
        </div>

        {/* CONTENT CARD WRAPPER */}
        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* LEFT IMAGE DISPLAY CONTAINER */}
          <div className="md:col-span-6 flex justify-center items-center">
            <div className="w-full max-w-[440px]">
              {deal.image_url && (
                <img
                  src={resolveMediaUrl(deal.image_url)}
                  alt={deal.title || "Deal"}
                  className="w-full h-auto object-contain mix-blend-multiply"
                />
              )}
            </div>
          </div>

          {/* RIGHT SIDE DATA */}
          <div className="md:col-span-6 flex flex-col justify-center">
            {deal.subtitle && (
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#7a7a7a] uppercase mb-1">
                {deal.subtitle}
              </span>
            )}

            {deal.title && (
              <h3 className="text-base md:text-[22px] lg:text-[25px] font-black text-[#1a1a1a] leading-[1.25] tracking-tight">
                {deal.title}
              </h3>
            )}

            {deal.description && (
              <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#28a745]"></span>
                <span className="text-[#6c6c6c]">{deal.description}</span>
              </div>
            )}

            {mrp > 0 && (
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-xl md:text-[28px] font-black text-[#1c1c1c] tracking-tight">
                  {formatINR(price)}
                </span>
                <span className="text-sm md:text-[16px] text-[#ababab] line-through font-semibold">
                  {formatINR(mrp)}
                </span>
              </div>
            )}

            {saveText && (
              <div className="mt-2.5 self-start bg-[#2b6be2] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-[4px] tracking-wide">
                {saveText}
              </div>
            )}

            {/* INTERACTION ACTION BUTTONS ZONE */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                className="h-[46px] px-8 rounded-full bg-[#2b6be2] text-white font-extrabold text-[13px] hover:bg-[#1f56be] transition shadow-sm tracking-wide"
              >
                ADD CART
              </button>

              <button
                onClick={handleViewDetails}
                className="h-[46px] px-7 rounded-full border border-[#d2d2d2] text-[#555] font-extrabold text-[13px] bg-[#f8f9fa] hover:bg-[#ececec] transition tracking-wide"
              >
                VIEW DETAILS
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Deals;
