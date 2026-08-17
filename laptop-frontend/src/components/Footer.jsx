import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 lg:gap-12">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[42px] font-extrabold text-[#3E73D3] tracking-tight transition-all duration-300 hover:tracking-[2px] cursor-default">
              REnewLAP
            </h2>

            <p className="mt-4 text-[14px] leading-7 text-gray-600 max-w-[270px]">
              India's most trusted certified renewed laptop seller -
              professionally tested, securely wiped, warranty-backed,
              with fast delivery and responsive local support.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-4 sm:mb-5">
              SHOP
            </h3>

            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-[14px] text-gray-600">
              <li><Link to="/bridal-lehenga" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">Shop All Laptops</Link></li>
              <li><Link to="/search?q=macbook" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">Macbook Laptops</Link></li>
              <li><Link to="/search?q=lenovo" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">Lenovo Laptops</Link></li>
              <li><Link to="/search?q=dell" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">Dell Laptops</Link></li>
              <li><Link to="/search?q=hp" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">HP Laptops</Link></li>
            </ul>
          </motion.div>

          {/* ACCOUNT */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-4 sm:mb-5">
              ACCOUNT
            </h3>

            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-[14px] text-gray-600">
              <li><Link to="/search" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">Search Products</Link></li>
              <li><Link to="/profile" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">My Account</Link></li>
              <li><Link to="/wishlist" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">Wishlist</Link></li>
              <li><Link to="/orders" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">My Orders</Link></li>
              <li><Link to="/cart" className="underline-slide hover:text-[#3271D7] transition-colors duration-300">My Cart</Link></li>
            </ul>
          </motion.div>

          {/* COMPANY */}

         

          {/* CONTACT */}

         {/* CONTACT */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.3, duration: 0.5 }}
>
  <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-4 sm:mb-5">
    CONTACT US
  </h3>

  <div className="space-y-5">
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start gap-4"
    >
      <FaMapMarkerAlt className="mt-1 text-black flex-shrink-0 transition-colors duration-300 group-hover:text-[#3271D7]" />
      <p className="text-[13px] sm:text-[14px] leading-6 text-gray-600">
        Star City Mall, Chennai,
        Tamil Nadu - 600053
      </p>
    </motion.div>

    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4"
    >
      <FaPhoneAlt className="text-black" />
      <span className="text-[14px] text-gray-600">
        +91 93899 03752
      </span>
    </motion.div>

    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4"
    >
      <FaEnvelope className="text-black" />
      <a
        href="mailto:sale@renewlap.in"
        className="text-[14px] text-gray-600 hover:text-[#3271D7] transition-colors duration-300"
      >
        sale@renewlap.in
      </a>
    </motion.div>
  </div>
</motion.div>

{/* STAY CONNECTED */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.4, duration: 0.5 }}
>
  <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-5">
    STAY CONNECTED
  </h3>

  <div className="flex gap-4 text-black text-lg">
    <motion.div whileHover={{ scale: 1.3, rotate: 10, color: "#1877F2" }} transition={{ type: "spring", stiffness: 400 }}>
      <FaFacebook className="cursor-pointer" />
    </motion.div>
    <motion.div whileHover={{ scale: 1.3, rotate: -10, color: "#E4405F" }} transition={{ type: "spring", stiffness: 400 }}>
      <FaInstagram className="cursor-pointer" />
    </motion.div>
    <motion.div whileHover={{ scale: 1.3, rotate: 10, color: "#FF0000" }} transition={{ type: "spring", stiffness: 400 }}>
      <FaYoutube className="cursor-pointer" />
    </motion.div>
  </div>
</motion.div>

        </div>

        <div className="border-t border-gray-300 mt-14 pt-6">
          <p className="text-[13px] text-gray-500">
            © 2026 Renewlap. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
