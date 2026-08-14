import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toast";

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN") + ".00";

function CountdownTimer({ endAt }) {
  const [now, setNow] = useState(Date.now());

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
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getActiveCompanyId().then((companyId) => {

      api
        .get("/banner/get_active", {
          params: { company_id: companyId, banner_group: "deal_of_day" },
        })
        .then((res) => {
          if (res.data.status && Array.isArray(res.data.data) && res.data.data.length > 0) {
            setDeal(res.data.data[0]);
          }
        })
        .catch((err) => console.error("Failed to load deal of the day:", err));
    });
  }, []);

  if (!deal) return null;

  const price = Number(deal.price) || 0;
  const mrp = Number(deal.mrp) || 0;
  const saveAmt = mrp - price;
  const discountPct = mrp > 0 ? Math.round((saveAmt / mrp) * 100) : 0;
  const saveText =
    deal.badge || (mrp > 0 ? `SAVE ₹${saveAmt.toLocaleString("en-IN")} (${discountPct}% OFF)` : "");

  const handleBuyNow = () => {
    if (!user) {
      showToast("Please log in to continue with Buy Now", "error");
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    navigate("/checkout", {
      state: {
        fromProduct: true,
        product: {
          product_id: deal.product_id || 0,
          product_name: deal.title || "Deal of the Day",
          price: price,
          quantity: 1,
          gst_percentage: Number(deal.gst_percentage || 0),
          size: "",
          image: deal.image_url || "",
        },
        customer_name: user.name || "",
        email: user.email || "",
        mobile: user.phone || "",
        shipping_address: user.address || "",
      },
    });
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
                onClick={handleBuyNow}
                className="h-[46px] px-8 rounded-full bg-[#2b6be2] text-white font-extrabold text-[13px] hover:bg-[#1f56be] transition shadow-sm tracking-wide"
              >
                Buy Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Deals;
