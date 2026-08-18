import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import api, { getActiveCompanyId } from "../services/api";

function StarRow({ rating, size }) {
  const rounded = Math.round(Number(rating) || 5);
  const count = Math.max(1, Math.min(5, rounded));
  return (
    <div className="flex text-[#F4B400]">
      {[...Array(count)].map((_, i) => (
        <Star key={i} size={size} fill="#F4B400" strokeWidth={0} />
      ))}
    </div>
  );
}

const Enquire = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = (cid) => {
      api
        .get("/banner/get_active", {
          params: { company_id: cid, banner_group: "testimonial" },
        })
        .then((res) => {
          if (!active) return;
          const payload = res.data?.data || res.data;
          const list = Array.isArray(payload) ? payload : payload?.data || [];
          setReviews(list);
        })
        .catch((err) => {
          console.error("Failed to load reviews:", err);
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
  if (reviews.length === 0) return null;

  return (
    <section className="w-full bg-white py-5 md:py-16">
      <div className="w-[92%] max-w-[1450px] mx-auto">

{/* Heading */}
<motion.h2
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  className="text-2xl sm:text-3xl md:text-[28px] font-extrabold uppercase text-black mb-4 md:mb-8 tracking-tight"
>
  <span className="block md:inline">WHAT OUR</span>{" "}
  <span className="block md:inline">CUSTOMERS SAYS</span>
</motion.h2>

        {/* Cards - Auto Scroll */}
        <div className="relative overflow-hidden group/testimonials">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex animate-client-scroll w-max group-hover/testimonials:[animation-play-state:paused]">

            {[...reviews, ...reviews].map((item, index) => (
              <motion.div
                key={`${item.id || index}-${index}`}
                whileHover={{ y: -6, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex-shrink-0 w-[240px] md:w-[300px] mx-3 bg-white p-4 md:p-5 shadow-sm border border-gray-100 h-[220px] md:h-[270px] flex flex-col justify-between cursor-pointer transition-colors hover:border-[#3271D7]/20"
              >

                <div>

                  <div className="flex items-center gap-3">

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-red-500 text-white flex items-center justify-center font-bold"
                    >
                      {(item.title || "?").charAt(0).toUpperCase()}
                    </motion.div>

                    <div>
                      <h3 className="font-semibold text-sm md:text-[15px]">
                        {item.title || "Customer"}
                      </h3>

                      <StarRow rating={item.rating} size={12} />
                    </div>

                  </div>

                  <p className="text-xs md:text-[13px] text-gray-700 mt-4 md:mt-5 leading-5 md:leading-6">
                    {item.description}
                  </p>

                </div>

                <div className="flex justify-between items-center mt-5 md:mt-6">
                  <a
                    href={item.link_url || "#"}
                    className="text-gray-500 text-xs underline hover:text-blue-600 underline-slide transition-colors"
                  >
                    Read more...
                  </a>

                  <span className="text-sm md:text-lg font-bold">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>

              </motion.div>
            ))}

            </div>
          </div>
        </div>
    </section>
  );
};

export default Enquire;
