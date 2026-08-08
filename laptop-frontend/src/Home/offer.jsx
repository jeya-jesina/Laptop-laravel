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

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ backgroundColor: "#E1EDFF" }}
    >
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              onClick={() => banner.link_url && navigate(banner.link_url)}
              style={{ backgroundColor: banner.bg_color || "#B2EDD5" }}
              className={`p-8 flex flex-col justify-between min-h-[420px] hover:shadow-lg transition-shadow duration-300 ${
                banner.link_url ? "cursor-pointer" : ""
              }`}
            >
              <div>
                <h3
                  className="text-xl font-semibold leading-snug"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#181818",
                  }}
                >
                  {banner.title || "Laptop Deal"}
                </h3>

                {banner.badge && (
                  <p
                    className="text-sm mt-2 text-[#3271D7]"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      color: "#181818",
                    }}
                  >
                    {banner.badge}
                  </p>
                )}

                <a
                  href={banner.link_url || "#"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (banner.link_url) navigate(banner.link_url);
                  }}
                  className="inline-block text-sm font-medium text-[#3271D7] underline underline-offset-2 mt-2 hover:opacity-80"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Shop Now
                </a>
              </div>

              <div className="mt-6 flex justify-center">
                <img
                  src={resolveMediaUrl(banner.image_url)}
                  alt={banner.title || "Laptop Deal"}
                  className="w-full max-w-[180px] object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
