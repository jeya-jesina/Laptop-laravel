import { useState } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleNavigate}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer flex flex-col transition-colors duration-300 hover:border-[#3271D7]/30"
    >
      {/* Image */}
      <div className="relative bg-[#F5F5F5] overflow-hidden h-20 sm:h-32">
        {image ? (
          <img
            src={image}
            alt={product?.product_name || "Product"}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain mix-blend-multiply scale-110 group-hover:scale-125 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-[#c9d4e8] group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <motion.span
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
              className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded badge-bounce"
            >
              {discount}% OFF
            </motion.span>
          )}
          {product?.condition_grade && (
            <span className="bg-white/90 text-[#3271D7] text-[11px] font-medium px-2 py-0.5 rounded border border-[#3271D7]/30">
              {product.condition_grade}
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-white text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full animate-bounce-in">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </motion.button>
      </div>

      {/* Body */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        {product?.brand_name && (
          <p className="text-[9px] sm:text-[11px] uppercase tracking-wide text-gray-400 font-medium">
            {product.brand_name}
          </p>
        )}
        <h3 className="mt-1 text-[12px] sm:text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[30px] sm:min-h-[38px]">
          {product?.product_name || "Product"}
        </h3>

        {/* Specs */}
        <div className="mt-1 sm:mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] sm:text-[12px] text-gray-600">
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
        <div className="mt-1.5 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
          <span className="text-sm sm:text-lg font-bold text-gray-900">
            {formatCurrency(offerPrice)}
          </span>
          {discount > 0 && (
            <span className="text-[11px] sm:text-sm text-gray-400 line-through">
              {formatCurrency(product?.original_price || price)}
            </span>
          )}
        </div>

        {product?.warranty && (
          <p className="mt-0.5 text-[9px] sm:text-[11px] text-gray-400">
            {product.warranty} warranty
          </p>
        )}

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCart}
          disabled={outOfStock}
          className="mt-auto pt-1.5 sm:pt-3 w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-[#3271D7] text-white text-[10px] sm:text-sm font-semibold py-1 sm:py-2 h-7 sm:h-10 hover:bg-[#265bb5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}
