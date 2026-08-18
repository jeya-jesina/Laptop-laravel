import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      className="w-full px-3 py-4 sm:p-6 md:min-h-screen md:flex md:items-center md:justify-center"
      style={{ backgroundColor: "#E1EDFF" }}
    >
      <div className="w-full max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4"
        >
          {banners.map((banner) => {
            return (
            <motion.div
              key={banner.id}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => navigate("/offers")}
              style={{ backgroundColor: banner.bg_color || "#B2EDD5" }}
              className="p-3 md:p-8 flex flex-col justify-between min-h-[230px] md:min-h-[420px] cursor-pointer transition-colors duration-300"
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
                  href="/offers"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/offers");
                  }}
                  className="inline-block text-[11px] md:text-sm font-medium text-[#3271D7] underline underline-offset-2 mt-1 md:mt-2 hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Shop Now
                </a>
              </div>

              <div className="mt-3 md:mt-6 flex justify-center">
                <motion.img
                  whileHover={{ scale: 1.2, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  src={resolveMediaUrl(banner.image_url)}
                  alt={banner.title || "Laptop Deal"}
                  className="w-full max-w-[100px] md:max-w-[180px] object-contain mix-blend-multiply cursor-pointer"
                />
              </div>
            </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
