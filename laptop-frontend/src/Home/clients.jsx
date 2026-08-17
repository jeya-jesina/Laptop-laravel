import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";

const Clients = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = (cid) => {
      api
        .get("/banner/get_active", {
          params: { company_id: cid, banner_group: "client_logos" },
        })
        .then((res) => {
          if (!active) return;
          const payload = res.data?.data || res.data;
          const list = Array.isArray(payload) ? payload : payload?.data || [];
          setLogos(list);
        })
        .catch((err) => {
          console.error("Failed to load client logos:", err);
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
  if (logos.length === 0) return null;

  return (
    <section className="w-full bg-white py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-[28px] font-extrabold uppercase text-black mb-4 md:mb-10 tracking-tight"
        >
  <span className="block md:inline">OUR VALUABLE</span>{" "}
  <span className="block md:inline">CLIENTS</span>
</motion.h2>
        {/* Auto Scroll */}
        <div className="relative overflow-hidden group/clients">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex animate-client-scroll w-max group-hover/clients:[animation-play-state:paused]">

            {[...logos, ...logos].map((logo, index) => (
              <motion.div
                key={`${logo.id}-${index}`}
                whileHover={{ scale: 1.1, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex-shrink-0 w-[180px] md:w-[220px] flex items-center justify-center cursor-pointer"
              >
                <img
                  src={resolveMediaUrl(logo.image_url)}
                  alt={logo.title || "Client Logo"}
                  className="h-10 md:h-16 object-contain transition duration-300 hover:drop-shadow-lg"
                />
              </motion.div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
};

export default Clients;
