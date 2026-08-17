import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { resolveMediaUrl, getActiveCompanyId } from '../services/api'

export default function Banner() {
  const [banners, setBanners] = useState([])
  const [brandLogos, setBrandLogos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    getActiveCompanyId().then((companyId) => {

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
    })
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
        <div className="relative overflow-hidden flex justify-center rounded-2xl overflow-hidden">

          {showCarousel && (
            <div className="relative w-[94%] overflow-hidden rounded-2xl">
              <AnimatePresence initial={false}>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="relative w-full"
                >
                  {banners.map((b, i) => (
                    i === index && (
                      <div key={b.id || i} className="relative w-full">
                        <img
                          src={resolveMediaUrl(b.image_url)}
                          alt={b.title || "Banner"}
                          className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[470px] xl:h-[500px] object-cover object-center"
                        />

                        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/40 via-black/10 to-transparent">
                          <div className="pl-6 sm:pl-10 md:pl-14 lg:pl-16 max-w-[760px]">
                            {b.title && (
                              <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="font-extrabold text-white leading-[1.08]
                                text-2xl
                                sm:text-[42px]
                                md:text-[58px]
                                lg:text-[66px]"
                              >
                                {b.title}
                              </motion.h1>
                            )}

                            {b.description && (
                              <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="mt-5 max-w-[560px]
                                  text-white/90
                                  text-[13px]
                                  md:text-[18px]
                                  leading-relaxed"
                              >
                                {b.description}
                              </motion.p>
                            )}

                            {b.link_url && (
                              <motion.a
                                href={b.link_url}
                                target="_blank"
                                rel="noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59,130,246,0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-8 inline-block bg-[#3B82F6] hover:bg-[#2563EB]
                                  text-white
                                  font-semibold
                                  rounded-full
                                  px-10
                                  py-3
                                  transition-colors"
                              >
                                BUY NOW
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </motion.div>
              </AnimatePresence>

              {count > 1 && (
                <>
                  <button
                    onClick={() => goTo(index - 1)}
                    aria-label="Previous banner"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10
                      rounded-full bg-black/30 hover:bg-black/50 text-white
                      flex items-center justify-center transition-all duration-300 z-10 hover:scale-110 hover:shadow-lg"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => goTo(index + 1)}
                    aria-label="Next banner"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10
                      rounded-full bg-black/30 hover:bg-black/50 text-white
                      flex items-center justify-center transition-all duration-300 z-10 hover:scale-110 hover:shadow-lg"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                    {banners.map((b, i) => (
                      <button
                        key={b.id || i}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to banner ${i + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          i === index
                            ? "w-8 h-2.5 bg-white"
                            : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60 hover:scale-125"
                        }`}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, staggerChildren: 0.08 }}
              className="grid grid-cols-3 md:grid-cols-6 items-center justify-items-center gap-y-6"
            >
              {brandLogos.map((b, i) => (
                <motion.div
                  key={b.id || b.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.15, y: -4 }}
                  className="flex flex-col items-center gap-2 px-4 cursor-pointer"
                >
                  <img
                    src={resolveMediaUrl(b.image_url)}
                    alt={b.title || "Brand"}
                    className="h-10 md:h-12 lg:h-14 object-contain transition duration-300 hover:drop-shadow-lg"
                  />
                  {b.title && (
                    <span className="text-white/80 text-[11px] md:text-xs font-semibold tracking-wide uppercase transition-colors duration-300 hover:text-white">
                      {b.title}
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
};
