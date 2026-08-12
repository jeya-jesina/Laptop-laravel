import React, { useEffect, useState } from "react";
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
    <section className="w-full bg-white py-16">
      <div className="w-[92%] max-w-[1450px] mx-auto">

        {/* Heading */}
        <h2 className="text-[38px] font-extrabold uppercase text-black mb-8 tracking-tight">
          WHAT OUR CUSTOMERS SAYS
        </h2>

        {/* Cards - Auto Scroll */}
        <div className="relative overflow-hidden">

            <div className="flex animate-client-scroll w-max">

            {[...reviews, ...reviews].map((item, index) => (
              <div
                key={`${item.id || index}-${index}`}
                className="flex-shrink-0 w-[300px] mx-3 bg-white p-5 shadow-sm border border-gray-100 h-[270px] flex flex-col justify-between"
              >

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                      {(item.title || "?").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[15px]">
                        {item.title || "Customer"}
                      </h3>

                      <StarRow rating={item.rating} size={13} />
                    </div>

                  </div>

                  <p className="text-[13px] text-gray-700 mt-5 leading-6">
                    {item.description}
                  </p>

                </div>

                <div className="flex justify-between items-center mt-6">
                  <a
                    href={item.link_url || "#"}
                    className="text-gray-500 text-xs underline hover:text-blue-600"
                  >
                    Read more...
                  </a>

                  <span className="text-lg font-bold">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>

              </div>
            ))}

            </div>
          </div>
        </div>
    </section>
  );
};

export default Enquire;
