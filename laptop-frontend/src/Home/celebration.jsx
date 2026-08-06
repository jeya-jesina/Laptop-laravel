// Celebration.jsx
// "CRAFTED FOR CELEBRATION" luxury homepage section.
// The banner is loaded dynamically from the `celebration_banners` backend
// module. Only ACTIVE banners are fetched, ordered by `display_order`
// (ascending), and the first one is rendered.
import { useEffect, useState } from "react";
import api, { FALLBACK_IMAGE } from "../services/api";

function Celebration() {
  const [banner, setBanner] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBanner = async () => {
      try {
        const res = await api.get("celebration-banners/get_active");
        if (!cancelled && res.data.status && Array.isArray(res.data.data)) {
          setBanner(res.data.data[0] || null);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadBanner();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!banner) return null;

  const image = imgFailed || !banner.image_url ? FALLBACK_IMAGE : banner.image_url;

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="relative h-[380px] bg-cover bg-center overflow-hidden rounded-lg"
          style={{
            backgroundImage: `url("${image}")`,
          }}
        >
          <img
            src={banner.image_url || FALLBACK_IMAGE}
            alt={banner.banner_name || "Crafted For Celebration"}
            style={{ display: "none" }}
            onError={() => setImgFailed(true)}
          />

          <div className="absolute inset-0 bg-black/20"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <h2 className="text-white text-5xl font-serif text-center mb-8">
              {banner.banner_name || "Crafted For Celebration"}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Celebration;
