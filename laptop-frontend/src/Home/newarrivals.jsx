import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { resolveMediaUrl, FALLBACK_IMAGE } from "../services/api";

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const navigate = useNavigate();

  const companyId = parseInt(localStorage.getItem("selected_company_id") || "1", 10);

  useEffect(() => {
    let cancelled = false;

    const fetchNewArrivals = async () => {
      try {
        const res = await api.get("/shop/products", {
          params: {
            company_id: companyId,
            sort: "newest",
            per_page: 4,
            page: 1,
          },
        });

        const payload = res.data?.data || res.data;
        const list = Array.isArray(payload) ? payload : payload?.data || [];

        if (cancelled) return;

        if (res.data?.success || res.data?.status) {
          setProducts(list);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        if (cancelled) return;
        setError("Failed to load new arrivals");
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNewArrivals();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Resolve the primary image for a product, falling back on load errors.
  const getImageSrc = useCallback(
    (product) => {
      if (failedImages[product?.id]) return FALLBACK_IMAGE;
      return product?.image ? resolveMediaUrl(product.image) : FALLBACK_IMAGE;
    },
    [failedImages]
  );

  const markImageFailed = useCallback((id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleShopNow = (product) => {
    if (product?.id) {
      navigate(`/product/${product.id}`);
    } else {
      navigate("/bridal-lehenga");
    }
  };

  const cards = useMemo(() => products.slice(0, 4), [products]);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-4xl font-semibold tracking-[6px] uppercase text-gray-900 mb-12">
            New Arrivals On Sale
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-4xl font-semibold tracking-[6px] uppercase text-gray-900 mb-12">
            New Arrivals On Sale
          </h2>
          <div className="text-center text-red-500 py-20">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-4xl font-semibold tracking-[6px] uppercase text-gray-900 mb-12">
          New Arrivals On Sale
        </h2>

        {cards.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg">No products available yet</p>
            <p className="text-sm">New products will appear here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {cards.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg bg-[#f8f8f8] cursor-pointer"
                onClick={() => handleShopNow(product)}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <img
                    src={getImageSrc(product)}
                    alt={product.product_name || "Product"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={() => markImageFailed(product.id)}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-6 px-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopNow(product);
                    }}
                    className="border-2 border-white bg-transparent text-white font-medium uppercase px-10 py-3.5 tracking-wide transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 active:scale-95 pointer-events-auto"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NewArrivals;