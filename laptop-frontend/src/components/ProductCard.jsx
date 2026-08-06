import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { formatCurrency, getDiscountPercent } from "../utils/formatters";
// 👇 Import from common api file
import { resolveMediaUrl, FALLBACK_IMAGE } from "../services/api";
export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  isWishlisted,
  onNavigate,
}) {
  const availableSizes = useMemo(() => {
    if (!product?.available_sizes) return [];
    return product.available_sizes
      .split(/[,;|]/)
      .map((size) => size.trim())
      .filter(Boolean);
  }, [product]);

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || "");
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize((prev) => prev || availableSizes[0]);
    } else {
      setSelectedSize("");
    }
  }, [availableSizes]);

  const isOutOfStock = Number(product.stock) <= 0;

  // 🖼️ Get image source – now uses centralized resolveMediaUrl
  const getImageSrc = () => {
    if (imageError) return FALLBACK_IMAGE;
    if (product.image) return resolveMediaUrl(product.image);
    return FALLBACK_IMAGE;
  };

  // 🎬 Get video source – uses the SAME function!
  const getVideoSrc = () => {
    if (videoError) return null;
    if (product.video_url) return resolveMediaUrl(product.video_url);
    return null;
  };

  const videoSrc = getVideoSrc();
  const imageSrc = getImageSrc();

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <button
        type="button"
        onClick={onNavigate}
        className="block w-full text-left relative"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#f8f8f8]">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product, selectedSize);
            }}
            className={`absolute top-3 right-3 z-30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isWishlisted
                ? "bg-red-500 text-white scale-110"
                : "bg-white text-gray-700 hover:bg-red-50 hover:scale-110"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              size={18}
              fill={isWishlisted ? "currentColor" : "none"}
              className="transition-all duration-300"
            />
          </button>

          {/* Video or Image */}
          <div className={`w-full h-full transition-all duration-500 ${isOutOfStock ? "blur-[3px]" : ""}`}>
            {videoSrc && !videoError ? (
              <video
                src={videoSrc}  // ✅ Now resolved via common function
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
                onError={() => {
                  console.error("Video failed to load:", videoSrc);
                  setVideoError(true);
                }}
              />
            ) : (
              <img
                src={imageSrc}  // ✅ Now resolved via common function
                alt={product.product_name || "Product"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => {
                  console.error("Image failed to load:", imageSrc);
                  setImageError(true);
                }}
                loading="lazy"
              />
            )}
          </div>

          {/* Video Badge */}
          {videoSrc && !videoError && (
            <div className="absolute top-3 left-3 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Video
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className="bg-black/90 text-white px-7 py-3 rounded-md text-lg font-bold tracking-[3px] shadow-xl">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Content Section */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3.5rem]">
          {product.product_name || "Product"}
        </h3>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="font-bold text-lg text-gray-900">
            {formatCurrency(product.offer_price || product.price)}
          </span>

          {product.offer_price && (
            <span className="line-through text-gray-400 text-sm">
              {formatCurrency(product.price)}
            </span>
          )}

          {product.offer_price && (
            <span className="text-[#a97c50] text-sm font-semibold">
              {getDiscountPercent(product.price, product.offer_price)}% off
            </span>
          )}
        </div>

        {/* Rating and Stock */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              4.8 ★
            </span>
            <span className="text-xs text-gray-500">
              ({product.view_count || 0})
            </span>
          </div>

          <span className={`text-xs font-medium ${isOutOfStock ? "text-red-500" : "text-green-600"}`}>
            {isOutOfStock ? "Out of Stock" : `${product.stock} Left`}
          </span>
        </div>

        {/* Size Selection - Only show if in stock */}
        {!isOutOfStock && availableSizes.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Size:</span>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
                  selectedSize === size
                    ? "border-blue-500 bg-blue-50 text-blue-600 font-semibold"
                    : "border-gray-300 hover:border-gray-400 text-gray-600"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product, selectedSize)}
          className={`mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-white font-medium transition-all duration-300 ${
            isOutOfStock
              ? "bg-gray-400 cursor-not-allowed opacity-60"
              : "bg-[#181818] hover:bg-black hover:shadow-lg active:scale-95"
          }`}
        >
          <ShoppingBag size={16} />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}