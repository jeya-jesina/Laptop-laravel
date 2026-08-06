import { useEffect, useRef, useState } from "react";
import { Menu, Search, User, Heart, ShoppingBag, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import botikLogo from "../assets/Botik.png";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import UserDropdown from "./UserDropdown";
import api, { resolveImageUrl } from "../services/api";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  const [shopAllCategories, setShopAllCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const { cartCount, wishlistCount } = useStore();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const activeCategoryId = params.get("category_id") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Fetch active categories for navigation (shows only 3)
        const navUrl = `/category/get_active_category`;
        
        // Fetch all categories for dropdown
        const allUrl = `/category/get_all`;

        const [navRes, allRes] = await Promise.all([
          api.get(navUrl),
          api.get(allUrl),
        ]);

        console.log("Nav Categories:", navRes.data);
        console.log("All Categories:", allRes.data);

        // Get active categories for navigation (limit to 3)
        const navData = navRes.data?.status ? navRes.data.data || [] : [];
        setNavCategories(navData.slice(0, 3));

        // Get all categories for dropdown
        const allData = allRes.data?.status ? allRes.data.data || [] : [];
        setShopAllCategories(allData);

      } catch (err) {
        console.error("Error fetching categories:", err);
        setNavCategories([]);
        setShopAllCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [location.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchQuery.trim();
      if (!query) {
        setSuggestions([]);
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
        setSearchLoading(false);
        return;
      }

      const fetchSuggestions = async () => {
        setSearchLoading(true);
        try {
          const response = await api.get("/product/search.php", {
            params: { q: query, limit: 6 },
          });
          const items = response.data?.status ? response.data.data || [] : [];
          setSuggestions(items);
          setSuggestionsOpen(items.length > 0);
          setActiveSuggestionIndex(-1);
        } catch (error) {
          console.error("Search suggestions failed:", error);
          setSuggestions([]);
          setSuggestionsOpen(false);
        } finally {
          setSearchLoading(false);
        }
      };

      fetchSuggestions();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchNavigate = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery("");
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    setShowMobileSearch(false);
    setMenuOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!suggestionsOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        const selection = suggestions[activeSuggestionIndex];
        navigate(`/product/${selection.id}`);
        setSearchQuery("");
        setActiveSuggestionIndex(-1);
      } else {
        handleSearchNavigate(searchQuery);
      }
      setSuggestionsOpen(false);
    } else if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const getMegaMenuColumns = (categories) => {
    const totalColumns = 4;
    const columns = Array.from({ length: totalColumns }, () => []);

    if (!categories.length) return columns;

    const itemsPerColumn = Math.ceil(categories.length / totalColumns);

    categories.forEach((category, index) => {
      const columnIndex = Math.min(
        Math.floor(index / itemsPerColumn),
        totalColumns - 1
      );
      columns[columnIndex].push(category);
    });

    return columns;
  };

  const megaMenuColumns = getMegaMenuColumns(shopAllCategories);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-[1220px] mx-auto h-[82px] px-4 lg:px-0 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-6 flex-1">
            {/* Desktop Shop Button */}
            <div className="relative hidden lg:flex" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-[#D8D8D8] rounded-md px-4 h-[40px] text-[14px] font-medium hover:bg-gray-50 transition whitespace-nowrap"
              >
                <Menu size={15} />
                <span>Shop All</span>
              </button>

              <div
                className={`absolute left-0 top-[calc(100%_+_14px)] z-40 w-[1220px] rounded-none border border-[#E7E2DA] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-200 ${
                  dropdownOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-2"
                }`}
              >
                <div className="px-8 py-6">
                  <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#181818]">
                        Shop All Categories
                      </h3>
                      <p className="mt-1 text-[13px] text-gray-500">
                        Explore all available bridal collections
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="text-gray-500">Loading categories...</div>
                    </div>
                  ) : shopAllCategories.length === 0 ? (
                    <div className="flex justify-center py-10">
                      <div className="text-gray-500">No categories available</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {megaMenuColumns.map((column, columnIndex) => (
                        <div
                          key={columnIndex}
                          className={`px-4 min-h-[200px] ${
                            columnIndex !== megaMenuColumns.length - 1
                              ? "border-r border-black/10"
                              : ""
                          }`}
                        >
                          <div className="space-y-1">
                            {column.map((category) => (
                              <Link
                                key={category.id}
                                to={`/bridal-lehenga?category_id=${category.id}`}
                                className={`block rounded-md px-3 py-2 text-[15px] transition ${
                                  activeCategoryId === String(category.id)
                                    ? "bg-[#f8f3ed] text-[#a97c50] font-semibold"
                                    : "text-[#181818] hover:bg-[#faf7f2] hover:text-[#a97c50]"
                                }`}
                                onClick={() => setDropdownOpen(false)}
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border-t border-black/10 pt-3">
                    <Link
                      to="/bridal-lehenga"
                      className="inline-flex items-center text-[14px] font-medium text-[#a97c50] hover:underline"
                      onClick={() => setDropdownOpen(false)}
                    >
                      View all products
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <button onClick={() => setMenuOpen(true)} className="lg:hidden">
              <Menu size={25} />
            </button>

            {/* Desktop Navigation - Shows first 3 active categories */}
            <nav className="hidden lg:flex shrink-0 items-center gap-8 text-[14px] font-medium text-[#181818]">
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : navCategories.length > 0 ? (
                navCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/bridal-lehenga?category_id=${category.id}`}
                    className={`whitespace-nowrap hover:text-[#a97c50] ${
                      activeCategoryId === String(category.id)
                        ? "text-[#a97c50] font-semibold"
                        : ""
                    }`}
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <span className="text-gray-400">No categories</span>
              )}
            </nav>
          </div>

          {/* LOGO */}
          <div className="flex flex-col items-center flex-shrink-0">
            <Link to="/">
              <img
                src={botikLogo}
                alt="BOTIK"
                className="w-[120px] md:w-[185px]"
              />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3 md:gap-5 flex-1">
            {/* Desktop Search */}
            <div
              ref={searchRef}
              className="relative hidden md:flex items-center w-[320px] h-[42px] border border-[#D8D8D8] rounded-md px-4 bg-white"
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search"
                className="flex-1 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => handleSearchNavigate(searchQuery)}
                className="text-gray-500"
              >
                {searchLoading ? (
                  <span className="text-[12px]">Loading...</span>
                ) : (
                  <Search size={20} />
                )}
              </button>

              {suggestionsOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-[#E5E7EB] bg-white shadow-lg max-h-[400px] overflow-y-auto">
                  {suggestions.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setSearchQuery("");
                        setSuggestionsOpen(false);
                        setActiveSuggestionIndex(-1);
                      }}
                      className={`w-full text-left flex items-center gap-3 px-3 py-3 transition hover:bg-[#f8f7f2] ${
                        activeSuggestionIndex === index ? "bg-[#f0efd8]" : ""
                      }`}
                    >
                      <img
                        src={
                          product.image
                            ? resolveImageUrl(product.image)
                            : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"
                        }
                        alt={product.product_name}
                        className="h-12 w-12 rounded-xl object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f";
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold line-clamp-1">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {product.category_name || "Category"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Search */}
            <button
              type="button"
              onClick={() => setShowMobileSearch((prev) => !prev)}
              className="md:hidden"
            >
              <Search size={22} />
            </button>

            {showMobileSearch && (
              <div
                ref={mobileSearchRef}
                className="fixed inset-x-0 top-[82px] z-50 px-4 py-3 bg-white shadow-lg md:hidden"
              >
                <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-sm outline-none"
                    placeholder="Search products"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchNavigate(searchQuery)}
                    className="text-gray-500"
                  >
                    {searchLoading ? (
                      <span className="text-[12px]">Loading...</span>
                    ) : (
                      <Search size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* User Dropdown */}
            <UserDropdown />

            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <Heart
                size={22}
                className={`${
                  wishlistCount > 0 ? "text-red-600" : "text-black"
                } cursor-pointer`}
              />
              <span className="absolute -top-2 -right-2 rounded-full bg-[#a97c50] px-1.5 py-0.5 text-[10px] text-white">
                {wishlistCount}
              </span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingBag size={22} className="cursor-pointer" />
              <span className="absolute -top-2 -right-2 rounded-full bg-[#a97c50] px-1.5 py-0.5 text-[10px] text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[290px] bg-white z-[70] transition-transform duration-300 overflow-y-auto ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 h-[70px] border-b">
          <img src={botikLogo} alt="" className="w-[110px]" />
          <button onClick={() => setMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center border rounded-md h-11 px-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchNavigate(searchQuery);
                }
              }}
              placeholder="Search Products"
              className="flex-1 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => handleSearchNavigate(searchQuery)}
              className="text-gray-500"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <nav className="px-5 pb-6 flex flex-col">
          {loading ? (
            <div className="py-4 text-gray-400">Loading...</div>
          ) : navCategories.length > 0 ? (
            navCategories.map((category) => (
              <Link
                key={category.id}
                to={`/bridal-lehenga?category_id=${category.id}`}
                className={`py-4 border-b text-[16px] font-medium ${
                  activeCategoryId === String(category.id)
                    ? "text-[#a97c50] font-semibold"
                    : "text-[#181818]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))
          ) : (
            <div className="py-4 text-gray-400">No categories available</div>
          )}

          <Link
            to="/bridal-lehenga"
            className="py-4 border-b text-[16px] font-medium text-[#181818]"
            onClick={() => setMenuOpen(false)}
          >
            Shop All
          </Link>
        </nav>
      </div>
    </>
  );
}

export default Header;