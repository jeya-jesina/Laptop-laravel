import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Header = () => {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useStore();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const [professionsOpen, setProfessionsOpen] = useState(false);
  const [menu, setMenu] = useState({
    header_categories: [],
    all_categories: [],
    brands: [],
    budgets: [],
  });

  const brandsRef = useRef(null);
  const budgetsRef = useRef(null);
  const professionsRef = useRef(null);

  useEffect(() => {
    const loadMenu = (companyId) =>
      api
        .get("/shop/menu", { params: { company_id: companyId } })
        .then((res) => {
          if (res.data?.success || res.data?.status) {
            const data = res.data?.data || res.data;
            const header = data?.header_categories || [];
            const allCategories = data?.all_categories || [];
            if (header.length === 0 && allCategories.length === 0 && companyId !== 1) {
              return loadMenu(1);
            }
            setMenu({
              header_categories: header,
              all_categories: allCategories,
              brands: data?.brands || [],
              budgets: data?.budgets || [],
            });
          }
        })
        .catch((err) => console.error("Failed to load header menu:", err));

    const companyId = parseInt(localStorage.getItem("selected_company_id") || "1", 10);
    loadMenu(companyId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (brandsRef.current && !brandsRef.current.contains(e.target)) {
        setBrandsOpen(false);
      }
      if (budgetsRef.current && !budgetsRef.current.contains(e.target)) {
        setBudgetsOpen(false);
      }
      if (professionsRef.current && !professionsRef.current.contains(e.target)) {
        setProfessionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const goToCategory = (category) => {
    setBrandsOpen(false);
    setBudgetsOpen(false);
    setProfessionsOpen(false);
    navigate(`/bridal-lehenga?category_id=${category.id}`);
  };

  const goToBrand = (brand) => {
    setBrandsOpen(false);
    navigate(`/bridal-lehenga?brand_id=${brand.id}`);
  };

  const goToBudget = (budget) => {
    setBudgetsOpen(false);
    navigate(`/bridal-lehenga?budget_id=${budget.id}`);
  };

  const goToProfessionCategory = (category) => {
    setProfessionsOpen(false);
    navigate(`/bridal-lehenga?category_id=${category.id}`);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/");
  };

  return (
    <nav className="w-full h-16 bg-[#3271D7] flex items-center justify-between px-[72px] select-none">
      {/* Logo */}
      <Link to="/" className="flex items-center flex-shrink-0">
        <h1 className="text-white text-[24px] font-bold tracking-[-0.5px]">
          REnewLAP
        </h1>
      </Link>

      {/* Center */}
      <div className="flex items-center gap-10 flex-1 justify-center">
        {/* By Brand Dropdown */}
        <div className="relative" ref={brandsRef}>
          <button
            onMouseEnter={() => setBrandsOpen(true)}
            onClick={() => setBrandsOpen((v) => !v)}
            className="flex items-center gap-1 text-white text-[16px] font-medium hover:opacity-90"
          >
            <span>By Brand</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {brandsOpen && (
            <div
              onMouseLeave={() => setBrandsOpen(false)}
              className="absolute left-0 top-11 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 min-w-[240px] z-50 max-h-[420px] overflow-y-auto"
            >
              {menu.brands.length === 0 && (
                <p className="px-5 py-2 text-sm text-gray-500">No brands available</p>
              )}
              {menu.brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => goToBrand(brand)}
                  className="w-full px-5 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-[#f0f6ff] hover:text-[#3271D7]"
                >
                  {brand.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* By Budget Dropdown */}
        <div className="relative" ref={budgetsRef}>
          <button
            onMouseEnter={() => setBudgetsOpen(true)}
            onClick={() => setBudgetsOpen((v) => !v)}
            className="flex items-center gap-1 text-white text-[16px] font-medium hover:opacity-90"
          >
            <span>By Budget</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {budgetsOpen && (
            <div
              onMouseLeave={() => setBudgetsOpen(false)}
              className="absolute left-0 top-11 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 min-w-[240px] z-50 max-h-[420px] overflow-y-auto"
            >
              {menu.budgets.length === 0 && (
                <p className="px-5 py-2 text-sm text-gray-500">No budgets available</p>
              )}
              {menu.budgets.map((budget) => (
                <button
                  key={budget.id}
                  onClick={() => goToBudget(budget)}
                  className="w-full px-5 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-[#f0f6ff] hover:text-[#3271D7]"
                >
                  ₹{Number(budget.min_price || 0).toLocaleString("en-IN")}
                  {budget.max_price
                    ? ` - ₹${Number(budget.max_price).toLocaleString("en-IN")}`
                    : "+"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* By Profession Dropdown */}
        <div className="relative" ref={professionsRef}>
          <button
            onMouseEnter={() => setProfessionsOpen(true)}
            onClick={() => setProfessionsOpen((v) => !v)}
            className="flex items-center gap-1 text-white text-[16px] font-medium hover:opacity-90"
          >
            <span>By Profession</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {professionsOpen && (
            <div
              onMouseLeave={() => setProfessionsOpen(false)}
              className="absolute left-0 top-11 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 min-w-[240px] z-50 max-h-[420px] overflow-y-auto"
            >
              {menu.all_categories.length === 0 && (
                <p className="px-5 py-2 text-sm text-gray-500">No categories available</p>
              )}
              {menu.all_categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => goToProfessionCategory(category)}
                  className="w-full px-5 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-[#f0f6ff] hover:text-[#3271D7]"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>


        {/* Search */}
        <form onSubmit={handleSearch} className="relative ml-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laptops, brands, specs"
            className="
              w-[355px]
              h-[36px]
              bg-white
              border
              border-[#D9D9D9]
              rounded-md
              pl-11
              pr-4
              text-[15px]
              text-[#333333]
              placeholder:text-[#8A8A8A]
              outline-none
              focus:border-[#D9D9D9]
              focus:ring-0
            "
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
          </svg>
        </form>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-8 ml-10">
        {/* Cart */}
        <Link to="/cart" className="relative text-white hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Wishlist */}
        <Link to="/wishlist" className="relative text-white hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            className="text-white hover:opacity-80 transition"
            onClick={() => (user ? setShowProfileMenu((v) => !v) : navigate("/login"))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="9" r="2.6" />
              <path
                d="M6.6 18c.8-2.5 3-3.8 5.4-3.8s4.6 1.3 5.4 3.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {user && showProfileMenu && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setShowProfileMenu(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
