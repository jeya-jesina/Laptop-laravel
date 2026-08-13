import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/filters/FilterSidebar";
import { showToast } from "../utils/toast";
import { Filter } from "lucide-react";
import api, { resolveMediaUrl, getActiveCompanyId } from "../services/api";

export default function Product() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [filterOptions, setFilterOptions] = useState(null);
    const [filters, setFilters] = useState({
        price_min: 0,
        price_max: 1000000,
        brand_ids: [],
        processors: [],
        rams: [],
        storages: [],
        conditions: [],
        operating_systems: [],
        availability: 'all',
        rating: 0,
        sort_by: 'newest',
        limit: 20,
        offset: 0,
        availableOptions: {}
    });

    const { guestId, refreshCounts, wishlistItems } = useStore();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Get category_id and subcategory_id from URL
    const categoryId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("category_id");
        return id ? parseInt(id, 10) : null;
    }, [location.search]);

    const subcategoryId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("subcategory_id");
        return id ? parseInt(id, 10) : null;
    }, [location.search]);

    const brandId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("brand_id");
        return id ? parseInt(id, 10) : null;
    }, [location.search]);

    const budgetId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("budget_id");
        return id ? parseInt(id, 10) : null;
    }, [location.search]);

    const professionId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("profession_id");
        return id ? parseInt(id, 10) : null;
    }, [location.search]);

    const offerId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("offer") === "1" ? 1 : 0;
    }, [location.search]);

    // Resolve the selected category/subcategory name from the shop menu
    const [categoryName, setCategoryName] = useState("");
    const [subcategoryName, setSubcategoryName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [budgetName, setBudgetName] = useState("");
    const [professionName, setProfessionName] = useState("");

    useEffect(() => {
        let active = true;
        const resolveNames = async () => {
            if (!categoryId && !brandId && !budgetId && !professionId) {
                setCategoryName("");
                setSubcategoryName("");
                setBrandName("");
                setBudgetName("");
                setProfessionName("");
                return;
            }
            try {
                const companyId = await getActiveCompanyId();
                const res = await api.get('/shop/menu', { params: { company_id: companyId } });
                if (res.data?.success || res.data?.status) {
                    const data = res.data?.data || res.data;
                    if (active) {
                        if (categoryId) {
                            const all = [...(data.header_categories || []), ...(data.shop_all || [])];
                            const cat = all.find(c => c.id === categoryId);
                            setCategoryName(cat?.name || "");
                            const sub = cat?.subcategories?.find(s => s.id === subcategoryId);
                            setSubcategoryName(sub?.name || "");
                        } else {
                            setCategoryName("");
                            setSubcategoryName("");
                        }
                        const brand = (data.brands || []).find(b => b.id === brandId);
                        setBrandName(brand?.name || "");
                        const budget = (data.budgets || []).find(b => b.id === budgetId);
                        setBudgetName(
                            budget
                                ? `₹${Number(budget.min_price || 0).toLocaleString("en-IN")}${budget.max_price ? ` - ₹${Number(budget.max_price).toLocaleString("en-IN")}` : "+"}`
                                : ""
                        );
                        const profession = (data.professions || []).find(p => p.id === professionId);
                        setProfessionName(profession?.name || "");
                    }
                }
            } catch (error) {
                console.error("Failed to resolve category name:", error);
            }
        };
        resolveNames();
        return () => { active = false; };
    }, [categoryId, subcategoryId, brandId, budgetId, professionId]);

    // Fetch filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const companyId = await getActiveCompanyId();
                const params = { company_id: companyId };
                if (categoryId) {
                    params.category_id = categoryId;
                }
                const response = await api.get('/shop/products/filters', { params });
                const payload = response.data?.data || response.data;
                if (response.data?.success || response.data?.status) {
                    setFilterOptions(payload);
                    setFilters(prev => ({
                        ...prev,
                        availableOptions: payload
                    }));
                }
            } catch (error) {
                console.error("Failed to load filter options:", error);
            }
        };
        fetchFilterOptions();
    }, [categoryId]);

    // Fetch products with filters
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const companyId = await getActiveCompanyId();

            const response = await api.get('/shop/products', {
                params: {
                    company_id: companyId,
                    category_id: categoryId || 0,
                    subcategory_id: subcategoryId || 0,
                    brand_id: brandId || 0,
                    budget_id: budgetId || 0,
                    profession_id: professionId || 0,
                    search: filters.search || '',
                    sort: filters.sort_by || 'newest',
                    per_page: filters.limit || 20,
                    page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
                    price_min: filters.price_min || 0,
                    price_max: filters.price_max || 0,
                    brand_id: (filters.brand_ids || []).join(','),
                    processor: (filters.processors || []).join(','),
                    ram: (filters.rams || []).join(','),
                    storage: (filters.storages || []).join(','),
                    condition_grade: (filters.conditions || []).join(','),
                    operating_system: (filters.operating_systems || []).join(','),
                    availability: filters.availability || '',
                    rating: filters.rating || 0,
                    offer: offerId ? 1 : 0,
                }
            });

            const payload = response.data?.data || response.data;
            const list = Array.isArray(payload) ? payload : payload?.data || [];

            if (response.data?.success || response.data?.status) {
                const productsWithResolvedImages = list.map(product => ({
                    ...product,
                    image: resolveMediaUrl(product.image),
                    additional_images: product.additional_images
                        ? product.additional_images.map(img => resolveMediaUrl(img))
                        : []
                }));
                setProducts(productsWithResolvedImages);
                setTotalProducts(payload?.total || list.length || 0);
            } else {
                console.error("API returned error:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            showToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters.sort_by, filters.limit, filters.offset, categoryId, subcategoryId, brandId, budgetId, professionId, offerId]);

    const applyFilters = () => {
        setFilters(prev => ({ ...prev, offset: 0 }));
        fetchProducts();
        if (window.innerWidth < 768) {
            setShowMobileFilter(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            price_min: 0,
            price_max: filterOptions?.price_range?.max || 1000000,
            brand_ids: [],
            processors: [],
            rams: [],
            storages: [],
            conditions: [],
            operating_systems: [],
            availability: 'all',
            rating: 0,
            sort_by: 'newest',
            limit: 20,
            offset: 0,
            availableOptions: filterOptions || {}
        });
        setTimeout(() => {
            fetchProducts();
        }, 100);
    };

    const getDefaultSize = (product) => {
        if (!product?.available_sizes) return "";
        const sizes = product.available_sizes
            .split(/[,;|]/)
            .map((size) => size.trim())
            .filter(Boolean);
        return sizes.length > 0 ? sizes[0] : "";
    };

    const addToCart = async (product, size = "") => {
        if (!user) {
            showToast('Please log in to add items to cart', 'error');
            setTimeout(() => navigate('/login'), 500);
            return;
        }

        const selectedSize = size || getDefaultSize(product);

        try {
            // ✅ Use the api instance
            const response = await api.post('/shop/cart', {
                user_id: user?.id || 0,
                product_id: product.id,
                quantity: 1,
                price: product.offer_price || product.price,
                size: selectedSize,
            });
            await refreshCounts();
            if (response.data?.success || response.data?.status) {
                showToast('Added to cart successfully', 'success');
            } else {
                showToast(response.data?.message || 'Unable to add to cart', 'error');
            }
        } catch (error) {
            console.error("Add to cart failed:", error);
            await refreshCounts();
            showToast('Add to cart failed. Please try again.', 'error');
        }
    };

    const wishlistIds = useMemo(
        () => new Set(wishlistItems.map((item) => item.product_id)),
        [wishlistItems]
    );

    const isWishlisted = (product) => wishlistIds.has(product.id);

    const addToWishlist = async (product, size = "") => {
        if (!user) {
            showToast("Please log in to add items to wishlist", "error");
            setTimeout(() => navigate("/login"), 500);
            return;
        }

        const existingItem = wishlistItems.find(
            (item) => item.product_id === product.id
        );

        try {
            if (existingItem) {
                // ✅ Use the api instance
                const response = await api.delete(
                    `/shop/wishlist/${existingItem.id}`, {
                        params: { user_id: user?.id || 0 }
                    }
                );
                if (response.data?.success || response.data?.status) {
                    await refreshCounts();
                    showToast("Removed from wishlist", "success");
                }
                return;
            }

            const selectedSize = size || getDefaultSize(product);
            // ✅ Use the api instance
            const response = await api.post('/shop/wishlist', {
                user_id: user?.id || 0,
                product_id: product.id,
                size: selectedSize,
            });

            if (response.data?.success || response.data?.status) {
                await refreshCounts();
                showToast("Added to wishlist", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Something went wrong", "error");
        }
    };

    const handleSortChange = (e) => {
        setFilters(prev => ({ ...prev, sort_by: e.target.value, offset: 0 }));
    };

    const activeFilterCount =
        (filters.brand_ids || []).length +
        (filters.processors || []).length +
        (filters.rams || []).length +
        (filters.storages || []).length +
        (filters.conditions || []).length +
        (filters.operating_systems || []).length +
        (filters.availability !== 'all' ? 1 : 0) +
        (filters.rating > 0 ? 1 : 0) +
        (filters.price_min > 0 ? 1 : 0);

    return (
        <div className="min-h-screen bg-[#f8f7f2] pt-12 md:pt-24 pb-16 px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                            {offerId ? "Home Offers" : (brandName || budgetName || professionName || categoryName || "Products")}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {subcategoryName ? `${subcategoryName} · ` : ""}{totalProducts} products found
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-end gap-3">
                        {/* Sort */}
                        <select
                            value={filters.sort_by}
                            onChange={handleSortChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Top Rated</option>
                        </select>

                        {/* Filter Button - Mobile */}
                        <button
                            onClick={() => setShowMobileFilter(true)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex gap-8">
                    {/* Desktop Filter Sidebar */}
                    <div className="hidden md:block w-72 flex-shrink-0">
                        <FilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                            onApply={applyFilters}
                            onClear={clearFilters}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="h-72 rounded-xl bg-white animate-pulse" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-lg text-gray-500">No products found</p>
                                <p className="text-sm text-gray-400">Try adjusting your filters</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-blue-500 hover:text-blue-700"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onNavigate={() => navigate(`/product/${product.id}`)}
                                        onAddToCart={(prod, size) => addToCart(prod, size)}
                                        onAddToWishlist={(prod, size) => addToWishlist(prod, size)}
                                        isWishlisted={isWishlisted(product)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Overlay */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowMobileFilter(false)}
                    />
                    <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white overflow-y-auto p-4 animate-slide-in">
                        <FilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                            onApply={applyFilters}
                            onClear={clearFilters}
                            isMobile={true}
                            onClose={() => setShowMobileFilter(false)}
                        />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-in {
                  from { transform: translateX(100%); }
                  to { transform: translateX(0); }
                }
                .animate-slide-in {
                  animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}