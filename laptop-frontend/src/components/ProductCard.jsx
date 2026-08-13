import { useState } from "react";
import { Heart, ShoppingCart, Cpu, MemoryStick, HardDrive } from "lucide-react";
import { formatCurrency, getDiscountPercent } from "../utils/formatters";
import { resolveMediaUrl } from "../services/api";

export default function ProductCard({ product, onNavigate, onAddToCart, onAddToWishlist, isWishlisted }) {
  const [imageError, setImageError] = useState(false);

  const image = imageError ? null : resolveMediaUrl(product?.image);
  const price = Number(product?.price) || 0;
  const offerPrice = Number(product?.offer_price) || price;
  const discount = getDiscountPercent(product?.original_price || price, offerPrice);
  const outOfStock = product?.stock !== null && product?.stock !== undefined && Number(product?.stock) <= 0;

  const handleNavigate = () => {
    if (onNavigate) onNavigate(product);
  };

  const handleCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product, "");
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (onAddToWishlist) onAddToWishlist(product, "");
  };

  return (
    <div
      onClick={handleNavigate}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative bg-[#F5F5F5] overflow-hidden h-32 sm:h-52">
        {image ? (
          <img
            src={image}
            alt={product?.product_name || "Product"}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain mix-blend-multiply scale-110 group-hover:scale-125 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-[#c9d4e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
          {product?.condition_grade && (
            <span className="bg-white/90 text-[#3271D7] text-[11px] font-medium px-2 py-0.5 rounded border border-[#3271D7]/30">
              {product.condition_grade}
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        {product?.brand_name && (
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-gray-400 font-medium">
            {product.brand_name}
          </p>
        )}
        <h3 className="mt-1 text-[13px] sm:text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[34px] sm:min-h-[42px]">
          {product?.product_name || "Product"}
        </h3>

        {/* Specs */}
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-[12px] text-gray-600">
          {product?.processor && (
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#3271D7]" />
              {product.processor.split(" ").slice(0, 3).join(" ")}
            </span>
          )}
          {product?.ram && (
            <span className="inline-flex items-center gap-1">
              <MemoryStick className="w-3.5 h-3.5 text-[#3271D7]" />
              {product.ram}
            </span>
          )}
          {product?.storage && (
            <span className="inline-flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-[#3271D7]" />
              {product.storage}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 sm:mt-4 flex items-baseline gap-1 sm:gap-2">
          <span className="text-[15px] sm:text-lg font-bold text-gray-900">
            {formatCurrency(offerPrice)}
          </span>
          {discount > 0 && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              {formatCurrency(product?.original_price || price)}
            </span>
          )}
        </div>

        {product?.warranty && (
          <p className="mt-1 text-[10px] sm:text-[11px] text-gray-400">
            {product.warranty} warranty
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleCart}
          disabled={outOfStock}
          className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-[#3271D7] text-white text-[11px] sm:text-sm font-semibold py-2 sm:py-2.5 hover:bg-[#265bb5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
