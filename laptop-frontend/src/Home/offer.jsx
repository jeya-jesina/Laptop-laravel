import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";

export default function LaptopDeals() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = (cid) => {
      api
        .get("/banner/get_active", {
          params: { company_id: cid, banner_group: "laptop_deals" },
        })
        .then((res) => {
          if (!active) return;
          const payload = res.data?.data || res.data;
          const list = Array.isArray(payload) ? payload : payload?.data || [];
          setBanners(list);
        })
        .catch((err) => {
          console.error("Failed to load laptop deals:", err);
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

  if (loading) return null;
  if (banners.length === 0) return null;

  const getDealTarget = (banner) => {
    if (banner.category_id) {
      return `/bridal-lehenga?category_id=${encodeURIComponent(banner.category_id)}`;
    }
    return banner.link_url || "";
  };

  return (
    <div
      className="w-full px-3 py-4 sm:p-6 md:min-h-screen md:flex md:items-center md:justify-center"
      style={{ backgroundColor: "#E1EDFF" }}
    >
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {banners.map((banner) => {
            const target = getDealTarget(banner);
            return (
            <div
              key={banner.id}
              onClick={() => target && navigate(target)}
              style={{ backgroundColor: banner.bg_color || "#B2EDD5" }}
              className={`p-3 md:p-8 flex flex-col justify-between min-h-[230px] md:min-h-[420px] hover:shadow-lg transition-shadow duration-300 ${
                target ? "cursor-pointer" : ""
              }`}
            >
              <div>
                <h3
                  className="text-[13px] md:text-xl font-semibold leading-snug line-clamp-2 md:line-clamp-none"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#181818",
                  }}
                >
                  {banner.title || "Laptop Deal"}
                </h3>

                {banner.badge && (
                  <p
                    className="text-[10px] md:text-sm mt-2 text-[#3271D7]"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      color: "#181818",
                    }}
                  >
                    {banner.badge}
                  </p>
                )}

                <a
                  href={target || "#"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (target) navigate(target);
                  }}
                  className="inline-block text-[11px] md:text-sm font-medium text-[#3271D7] underline underline-offset-2 mt-1 md:mt-2 hover:opacity-80"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Shop Now
                </a>
              </div>

              <div className="mt-3 md:mt-6 flex justify-center">
                <img
                  src={resolveMediaUrl(banner.image_url)}
                  alt={banner.title || "Laptop Deal"}
                  className="w-full max-w-[100px] md:max-w-[180px] object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
