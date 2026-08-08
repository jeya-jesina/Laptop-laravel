import React, { useEffect, useState } from "react";
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
        <h2 className="text-[34px] font-extrabold text-[#222] uppercase mb-10">
          OUR VALUABLE CLIENTS
        </h2>

        {/* Auto Scroll */}
        <div className="relative overflow-hidden">

          <div className="flex animate-client-scroll">

            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex-shrink-0 w-[220px] flex items-center justify-center"
              >
                <img
                  src={resolveMediaUrl(logo.image_url)}
                  alt={logo.title || "Client Logo"}
                  className="h-16 object-contain transition duration-300 hover:scale-105"
                />
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
};

export default Clients;
