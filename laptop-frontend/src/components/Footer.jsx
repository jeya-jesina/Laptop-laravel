import React from "react";
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
          <div>
            <h2 className="text-[42px] font-extrabold text-[#3E73D3] tracking-tight">
              REnewLAP
            </h2>

            <p className="mt-4 text-[14px] leading-7 text-gray-600 max-w-[270px]">
              India's most trusted certified renewed laptop seller -
              professionally tested, securely wiped, warranty-backed,
              with fast delivery and responsive local support.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-4 sm:mb-5">
              SHOP
            </h3>

            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-[14px] text-gray-600">
              <li><Link to="/bridal-lehenga" className="hover:text-[#1F2937]">Shop All Laptops</Link></li>
              <li><Link to="/search?q=macbook" className="hover:text-[#1F2937]">Macbook Laptops</Link></li>
              <li><Link to="/search?q=lenovo" className="hover:text-[#1F2937]">Lenovo Laptops</Link></li>
              <li><Link to="/search?q=dell" className="hover:text-[#1F2937]">Dell Laptops</Link></li>
              <li><Link to="/search?q=hp" className="hover:text-[#1F2937]">HP Laptops</Link></li>
            </ul>
          </div>

          {/* ACCOUNT */}

          <div>
            <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-4 sm:mb-5">
              ACCOUNT
            </h3>

            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-[14px] text-gray-600">
              <li><Link to="/search" className="hover:text-[#1F2937]">Search Products</Link></li>
              <li><Link to="/profile" className="hover:text-[#1F2937]">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#1F2937]">Wishlist</Link></li>
              <li><Link to="/orders" className="hover:text-[#1F2937]">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-[#1F2937]">My Cart</Link></li>
            </ul>
          </div>

          {/* COMPANY */}

         

          {/* CONTACT */}

         {/* CONTACT */}
<div>
  <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-4 sm:mb-5">
    CONTACT US
  </h3>

  <div className="space-y-5">
    <div className="flex items-start gap-4">
      <FaMapMarkerAlt className="mt-1 text-black flex-shrink-0" />
      <p className="text-[13px] sm:text-[14px] leading-6 text-gray-600">
        Star City Mall, Chennai,
        Tamil Nadu - 600053
      </p>
    </div>

    <div className="flex items-center gap-4">
      <FaPhoneAlt className="text-black" />
      <span className="text-[14px] text-gray-600">
        +91 93899 03752
      </span>
    </div>

    <div className="flex items-center gap-4">
      <FaEnvelope className="text-black" />
      <a
        href="mailto:sale@renewlap.in"
        className="text-[14px] text-gray-600 hover:text-[#1F2937]"
      >
        sale@renewlap.in
      </a>
    </div>
  </div>
</div>

{/* STAY CONNECTED */}
<div>
  <h3 className="font-bold text-[13px] sm:text-[15px] uppercase mb-5">
    STAY CONNECTED
  </h3>

  <div className="flex gap-4 text-black text-lg">
    <FaFacebook className="cursor-pointer hover:text-blue-600 transition" />
    <FaInstagram className="cursor-pointer hover:text-pink-500 transition" />
    <FaYoutube className="cursor-pointer hover:text-red-600 transition" />
  </div>
</div>

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
