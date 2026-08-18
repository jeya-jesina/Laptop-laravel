import React from "react";
import { motion } from "framer-motion";

const Customer = () => {
  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
          className="bg-[#3E73D3] rounded-sm py-16 px-6 text-center relative overflow-hidden"
        >
          {/* Decorative floating circles */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white/5 rounded-full animate-float" />
          <div className="absolute bottom-6 right-8 w-32 h-32 bg-white/5 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-10 right-16 w-12 h-12 bg-white/5 rounded-full animate-float" style={{ animationDelay: "2s" }} />

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white text-xl sm:text-2xl md:text-5xl font-bold leading-tight relative z-10"
          >
            Exclusive Bulk Rates
            <br />
            for Corporates & Resellers!
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-white/80 text-sm md:text-base mt-5 max-w-3xl mx-auto leading-relaxed font-normal relative z-10"
          >
            Special Pricing for Corporates & Resellers! Get Exclusive Bulk
            Discounts on Refurbished Laptops.
            <br />
            Imported Premium Quality, Lowest Price Guarantee, After-Sales
            Support.
          </motion.p>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.07, boxShadow: "0 12px 30px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-white text-[#3E73D3] font-semibold text-sm px-8 py-3 rounded-full transition duration-300 shadow-md relative z-10 ripple"
          >
            ENQUIRE NOW
          </motion.button>

        </motion.div>
      </div>
    </section>
  );
};

export default Customer;
