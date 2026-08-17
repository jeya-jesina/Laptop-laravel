import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";

export const FilterDropdown = ({ label, items, onSelect, renderItem, emptyText }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filtered = q.trim()
    ? items.filter((it) =>
        renderItem(it).toLowerCase().includes(q.trim().toLowerCase())
      )
    : items;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-white text-[16px] font-medium rounded-full px-3 py-1.5 transition-colors duration-200 ${
          open ? "bg-white/15" : "hover:bg-white/10"
        }`}
      >
        <span>{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-panel absolute left-1/2 -translate-x-1/2 top-12 w-[300px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-[0_24px_60px_rgba(2,32,71,0.18)] border border-gray-100 z-50 overflow-hidden">
          {/* Header + Search */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400">
              {label}
            </p>
            <div className="relative mt-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${label}...`}
                className="w-full h-[38px] bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#3271D7] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              {items.length === 0 ? emptyText : "No matches found"}
            </p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto dropdown-scroll py-2 px-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-[#eef4ff] hover:text-[#3271D7] group"
                >
                  <span className="truncate">{renderItem(item)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#3271D7] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SuggestionsPanel = ({ suggestions, go, query }) => {
  const products = suggestions?.products || [];
  const brands = suggestions?.brands || [];
  const budgets = suggestions?.budgets || [];

  return (
    <div className="dropdown-panel-left absolute left-0 top-[42px] w-full bg-white rounded-2xl shadow-[0_24px_60px_rgba(2,32,71,0.18)] border border-gray-100 z-50 overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto dropdown-scroll py-2 px-2">
        {products.length > 0 && (
          <div className="mb-1">
            <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">
              Products
            </p>
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => go(`/product/${p.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#eef4ff] transition-colors duration-150"
              >
                <img
                  src={resolveMediaUrl(p.image)}
                  alt={p.product_name}
                  className="w-9 h-9 rounded-lg object-contain bg-gray-100 flex-shrink-0"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-800 truncate">
                    {p.product_name}
                  </span>
                  <span className="block text-[11px] text-gray-400 truncate">
                    {p.brand_name || "Laptop"}
                    {Number(p.price)
                      ? ` • ₹${Number(p.price).toLocaleString("en-IN")}`
                      : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {brands.length > 0 && (
          <div className="mb-1">
            <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">
              Brands
            </p>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(`/bridal-lehenga?brand_id=${b.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#eef4ff] transition-colors duration-150"
              >
                <span className="w-9 h-9 rounded-lg bg-[#eef4ff] text-[#3271D7] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {b.name.charAt(0).toUpperCase()}
                </span>
                <span className="block text-sm font-medium text-gray-800 truncate">
                  {b.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {budgets.length > 0 && (
          <div className="mb-1">
            <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">
              Budgets
            </p>
            {budgets.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(`/bridal-lehenga?budget_id=${b.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#eef4ff] transition-colors duration-150"
              >
                <span className="w-9 h-9 rounded-lg bg-[#fdf1e6] text-[#b45309] flex items-center justify-center text-sm flex-shrink-0">
                  ₹
                </span>
                <span className="block text-sm font-medium text-gray-800 truncate">
                  ₹{Number(b.min_price || 0).toLocaleString("en-IN")}
                  {b.max_price
                    ? ` - ₹${Number(b.max_price).toLocaleString("en-IN")}`
                    : "+"}
                </span>
              </button>
            ))}
          </div>
        )}

        {products.length === 0 &&
          brands.length === 0 &&
          budgets.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-gray-400">
              No matches found
            </p>
          )}

        {query.trim() && (
          <button
            type="button"
            onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 mt-1 rounded-lg text-sm font-semibold text-[#3271D7] hover:bg-[#eef4ff] transition-colors duration-150 border-t border-gray-100"
          >
            View all results for "{query.trim()}"
          </button>
        )}
      </div>
    </div>
  );
};

export const SearchBox = ({
  innerRef,
  query,
  setQuery,
  show,
  setShow,
  onSubmit,
  go,
  suggestions,
  inputClass = "",
}) => {
  return (
    <form onSubmit={onSubmit} className="relative w-full" ref={innerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setShow(true)}
        placeholder="Search laptops, brands, specs"
        className={`w-full h-[36px] bg-white border border-[#D9D9D9] rounded-md pl-11 pr-10 text-[15px] text-[#333333] placeholder:text-[#8A8A8A] outline-none focus:border-[#D9D9D9] focus:ring-0 ${inputClass}`}
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

      {show && (
        <SuggestionsPanel suggestions={suggestions} go={go} query={query} />
      )}
    </form>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useStore();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState({ products: [], brands: [], budgets: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const [menu, setMenu] = useState({
    header_categories: [],
    all_categories: [],
    brands: [],
    budgets: [],
  });

  useEffect(() => {
    const loadMenu = (companyId) =>
      api
        .get("/shop/menu", { params: { company_id: companyId } })
        .then((res) => {
          if (res.data?.success || res.data?.status) {
            const data = res.data?.data || res.data;
            const header = data?.header_categories || [];
            const allCategories = data?.all_categories || [];
            setMenu({
              header_categories: header,
              all_categories: allCategories,
              brands: data?.brands || [],
              budgets: data?.budgets || [],
              professions: data?.professions || [],
            });
          }
        })
        .catch((err) => console.error("Failed to load header menu:", err));

    getActiveCompanyId().then(loadMenu);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inDesktop =
        searchRef.current && searchRef.current.contains(e.target);
      const inMobile =
        mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
      if (!inDesktop && !inMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions({ products: [], brands: [], budgets: [] });
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const companyId = await getActiveCompanyId();
        const res = await api.get("/shop/products", {
          params: { company_id: companyId, search: q, per_page: 5 },
        });
        const payload = res.data?.data || res.data;
        const list = Array.isArray(payload) ? payload : payload?.data || [];
        const lq = q.toLowerCase();
        const brands = (menu.brands || []).filter((b) =>
          (b.name || "").toLowerCase().includes(lq)
        );
        const budgets = (menu.budgets || []).filter((b) => {
          const label = `${b.min_price || 0}-${b.max_price || ""}`.toLowerCase();
          return label.includes(lq);
        });
        setSuggestions({ products: list, brands, budgets });
        setShowSuggestions(true);
      } catch (err) {
        console.error("Failed to load search suggestions:", err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, menu]);

  const goToSuggestion = (path) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(path);
  };

  const submitSearch = () => {
    const q = searchQuery.trim();
    setShowSuggestions(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    submitSearch();
  };

  const goToBrand = (brand) => {
    navigate(`/bridal-lehenga?brand_id=${brand.id}`);
  };

  const goToBudget = (budget) => {
    navigate(`/bridal-lehenga?budget_id=${budget.id}`);
  };

  const goToProfession = (profession) => {
    navigate(`/bridal-lehenga?profession_id=${profession.id}`);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/");
  };

  const renderBudget = (budget) => {
    const min = Number(budget.min_price || 0).toLocaleString("en-IN");
    const max = budget.max_price
      ? ` - ₹${Number(budget.max_price).toLocaleString("en-IN")}`
      : "+";
    return `₹${min}${max}`;
  };

  return (
    <nav className="w-full bg-[#3271D7] select-none">
      {/* Top Row */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-[72px]">
        {/* Hamburger (mobile/tablet) */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="lg:hidden text-white p-1.5 -ml-1 hover:opacity-80 transition"
        >
          {mobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 group/logo">
          <h1 className="text-white text-[24px] font-bold tracking-[-0.5px] transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:tracking-[1px]">
            REnewLAP
          </h1>
        </Link>

        {/* Center (desktop only) */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          <FilterDropdown
            label="By Brand"
            items={menu.brands}
            onSelect={goToBrand}
            renderItem={(b) => b.name}
            emptyText="No brands available"
          />

          <FilterDropdown
            label="By Budget"
            items={menu.budgets}
            onSelect={goToBudget}
            renderItem={renderBudget}
            emptyText="No budgets available"
          />

          <FilterDropdown
            label="By Profession"
            items={menu.professions}
            onSelect={goToProfession}
            renderItem={(p) => p.name}
            emptyText="No professions available"
          />

          <div className="ml-8">
            <SearchBox
              innerRef={searchRef}
              query={searchQuery}
              setQuery={setSearchQuery}
              show={showSuggestions}
              setShow={setShowSuggestions}
              onSubmit={handleSearch}
              go={goToSuggestion}
              suggestions={suggestions}
              inputClass="w-[355px]"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3 md:gap-5 xl:gap-8 ml-2 xl:ml-10">
          {/* Cart */}
          <Link to="/cart" className="relative text-white group/cart">
            <div className="transition-transform duration-300 group-hover/cart:scale-110 group-hover/cart:-translate-y-0.5">
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
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center badge-bounce animate-bounce-in">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative text-white group/wish">
            <div className="transition-transform duration-300 group-hover/wish:scale-110 group-hover/wish:-translate-y-0.5">
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
            </div>
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center badge-bounce animate-bounce-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <div className="relative">
            <button
              className="text-white group/profile"
              onClick={() => (user ? setShowProfileMenu((v) => !v) : navigate("/login"))}
            >
              <div className="transition-transform duration-300 group-hover/profile:scale-110 group-hover/profile:rotate-6">
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
              </div>
            </button>

            {user && showProfileMenu && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-up">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#eef4ff] hover:text-[#3271D7] transition-colors duration-200"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#eef4ff] hover:text-[#3271D7] transition-colors duration-200"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search (below 1280px) */}
      <div className="lg:hidden px-4 sm:px-6 lg:px-8 pb-3">
        <SearchBox
          innerRef={mobileSearchRef}
          query={searchQuery}
          setQuery={setSearchQuery}
          show={showSuggestions}
          setShow={setShowSuggestions}
          onSubmit={handleSearch}
          go={goToSuggestion}
          suggestions={suggestions}
          inputClass="h-[38px]"
        />
      </div>

      {/* Mobile Menu (below 1280px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#3271D7] px-4 sm:px-6 lg:px-8 pb-4 space-y-2">
          <FilterDropdown
            label="By Brand"
            items={menu.brands}
            onSelect={(b) => {
              goToBrand(b);
              setMobileMenuOpen(false);
            }}
            renderItem={(b) => b.name}
            emptyText="No brands available"
          />

          <FilterDropdown
            label="By Budget"
            items={menu.budgets}
            onSelect={(b) => {
              goToBudget(b);
              setMobileMenuOpen(false);
            }}
            renderItem={renderBudget}
            emptyText="No budgets available"
          />

          <FilterDropdown
            label="By Profession"
            items={menu.professions}
            onSelect={(p) => {
              goToProfession(p);
              setMobileMenuOpen(false);
            }}
            renderItem={(p) => p.name}
            emptyText="No professions available"
          />
        </div>
      )}
    </nav>
  );
};

export default Header;