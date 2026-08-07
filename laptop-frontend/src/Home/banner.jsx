import React, { useEffect, useState, useCallback } from 'react'
import api, { resolveMediaUrl } from '../services/api'

export default function Banner() {
  const [banners, setBanners] = useState([])
  const [brandLogos, setBrandLogos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const companyId = parseInt(localStorage.getItem("selected_company_id") || "1", 10)

    api
      .get("/banner/get_active", {
        params: { company_id: companyId, banner_group: "home_top" },
      })
      .then((res) => {
        if (res.data.status && Array.isArray(res.data.data)) {
          setBanners(res.data.data)
        }
      })
      .catch((err) => {
        console.error("Failed to load banners:", err)
      })

    api
      .get("/banner/get_active", {
        params: { company_id: companyId, banner_group: "brand_logo" },
      })
      .then((res) => {
        if (res.data.status && Array.isArray(res.data.data)) {
          setBrandLogos(res.data.data)
        }
      })
      .catch((err) => {
        console.error("Failed to load brand logos:", err)
      })
      .finally(() => setLoaded(true))
  }, [])

  const count = banners.length

  const goTo = useCallback((i) => {
    setIndex(((i % count) + count) % count)
  }, [count])

  useEffect(() => {
    if (count < 2) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count)
    }, 4500)
    return () => clearInterval(timer)
  }, [count])

  const showCarousel = loaded && count > 0

  return (
    <section className="w-full bg-[#2F6FE4] py-2">
      <div className="max-w-[1440px] mx-auto px-5">

        {/* Banner */}
        <div className="relative overflow-hidden flex justify-center">

          {showCarousel && (
            <div className="relative w-[94%] overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {banners.map((b, i) => (
                  <div key={b.id || i} className="relative w-full shrink-0">
                    <img
                      src={resolveMediaUrl(b.image_url)}
                      alt={b.title || "Banner"}
                      className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[470px] xl:h-[500px] object-cover object-center"
                    />

                    <div className="absolute inset-0 flex items-center">
                      <div className="pl-6 sm:pl-10 md:pl-14 lg:pl-16 max-w-[760px]">
                        {b.title && (
                          <h1 className="font-extrabold text-white leading-[1.08]
                            text-[30px]
                            sm:text-[42px]
                            md:text-[58px]
                            lg:text-[66px]">
                            {b.title}
                          </h1>
                        )}

                        {b.description && (
                          <p className="mt-5 max-w-[560px]
                            text-white
                            text-[13px]
                            md:text-[18px]
                            leading-relaxed">
                            {b.description}
                          </p>
                        )}

                        {b.link_url && (
                          <a
                            href={b.link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 inline-block bg-[#3B82F6] hover:bg-[#2563EB]
                              text-white
                              font-semibold
                              rounded-full
                              px-10
                              py-3
                              transition"
                          >
                            BUY NOW
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {count > 1 && (
                <>
                  <button
                    onClick={() => goTo(index - 1)}
                    aria-label="Previous banner"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9
                      rounded-full bg-black/30 hover:bg-black/50 text-white
                      flex items-center justify-center transition z-10"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => goTo(index + 1)}
                    aria-label="Next banner"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9
                      rounded-full bg-black/30 hover:bg-black/50 text-white
                      flex items-center justify-center transition z-10"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((b, i) => (
                      <button
                        key={b.id || i}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to banner ${i + 1}`}
                        className={`w-2.5 h-2.5 rounded-full transition
                          ${i === index ? "bg-white" : "bg-white/40"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Brand Logos */}
        <div className="bg-[#2F6FE4] py-5">
          {brandLogos.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 items-center justify-items-center gap-y-6">
              {brandLogos.map((b) => (
                <div
                  key={b.id || b.title}
                  className="flex flex-col items-center gap-2 px-4"
                >
                  <img
                    src={resolveMediaUrl(b.image_url)}
                    alt={b.title || "Brand"}
                    className="h-10 md:h-12 lg:h-14 object-contain transition duration-300 hover:scale-105"
                  />
                  {b.title && (
                    <span className="text-white/80 text-[11px] md:text-xs font-semibold tracking-wide uppercase">
                      {b.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
