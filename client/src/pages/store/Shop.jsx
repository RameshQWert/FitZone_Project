import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlineX,
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineStar,
  HiOutlineChevronDown,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineAdjustments
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services';
import { Loading } from '../../components/common';
import toast from 'react-hot-toast';

const Shop = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    inStock: searchParams.get('inStock') === 'true'
  });

  // Sync filters when URL params change (when clicking navbar category links)
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      brand: searchParams.get('brand') || '',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('search') || '',
      inStock: searchParams.get('inStock') === 'true'
    });
  }, [searchParams]);

  // Static categories (no API needed)
  const staticCategories = [
    { slug: 'supplements', name: 'Supplements', icon: '💊' },
    { slug: 'clothing', name: 'Clothing', icon: '👕' },
    { slug: 'equipment', name: 'Equipment', icon: '🏋️' },
    { slug: 'accessories', name: 'Accessories', icon: '🧤' }
  ];

  // Initialize categories with static data
  useEffect(() => {
    setCategories(staticCategories);
  }, []);

  // Fetch brands when category changes
  useEffect(() => {
    const fetchBrands = async () => {
      if (!filters.category) {
        setBrands([]);
        return;
      }
      try {
        const response = await storeService.getBrands(filters.category);
        setBrands(response.data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      }
    };
    fetchBrands();
  }, [filters.category]);

  // Fetch cart count - only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCartCount = async () => {
        try {
          const response = await storeService.getCartCount();
          setCartCount(response.data?.count || 0);
        } catch (error) {
          // Silently fail - cart count is not critical
          setCartCount(0);
        }
      };
      fetchCartCount();
    }
  }, [isAuthenticated]);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const params = {
        page,
        limit: 12,
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.search && { search: filters.search }),
        ...(filters.inStock && { inStock: 'true' })
      };

      const response = await storeService.getProducts(params);
      
      if (append) {
        setProducts(prev => [...prev, ...(response.data || [])]);
      } else {
        setProducts(response.data || []);
      }
      setPagination(response.pagination || { page: 1, total: 0, hasMore: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      // Don't show error toast on initial load, just set empty state
      setProducts([]);
      setPagination({ page: 1, total: 0, hasMore: false });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    if (filters.inStock) params.set('inStock', 'true');
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      sort: 'newest',
      search: '',
      inStock: false
    });
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await storeService.addToCart(product._id, 1);
      setCartCount(prev => prev + 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const loadMore = () => {
    if (pagination?.hasMore) {
      fetchProducts(pagination.page + 1, true);
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            FitZone Store
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Premium fitness gear, supplements, and accessories to fuel your journey
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleFilterChange('category', filters.category === cat.slug ? '' : cat.slug)}
              className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                filters.category === cat.slug 
                  ? 'ring-2 ring-emerald-400 bg-emerald-500/20' 
                  : 'bg-slate-800/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="text-white font-semibold">{cat.name}</h3>
              <p className="text-slate-400 text-sm">{cat.count} products</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 pr-10 text-white focus:outline-none focus:border-emerald-500"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-white'
            }`}
          >
            <HiOutlineAdjustments className="w-5 h-5" />
            Filters
          </button>

          {/* View Mode */}
          <div className="flex border border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              <HiOutlineViewGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              <HiOutlineViewList className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Button */}
          <Link
            to="/store/cart"
            className="relative flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
          >
            <HiOutlineShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/50 rounded-xl p-6 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand.name} value={brand.name}>
                        {brand.name} ({brand.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* In Stock Only */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-white">In Stock Only</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loading />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/store/product/${product.slug}`}
                    className={`block group ${viewMode === 'list' ? 'flex gap-4' : ''}`}
                  >
                    <div className={`bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}>
                      {/* Image */}
                      <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} overflow-hidden bg-slate-900`}>
                        <img
                          src={product.thumbnail || 'https://via.placeholder.com/400x400?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock === 0}
                          className="absolute bottom-3 right-3 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 disabled:bg-slate-600"
                        >
                          <HiOutlineShoppingCart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <p className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-slate-500 text-sm mb-2">{product.brand}</p>
                        )}
                        
                        {/* Rating */}
                        {product.ratings?.count > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <HiOutlineStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-sm">{product.ratings.average.toFixed(1)}</span>
                            <span className="text-slate-500 text-sm">({product.ratings.count})</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white">₹{product.price.toLocaleString()}</span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-slate-500 line-through text-sm">
                              ₹{product.comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Low Stock Warning */}
                        {product.stock > 0 && product.stock <= 5 && (
                          <p className="text-orange-400 text-sm mt-2 font-medium animate-pulse">
                            🔥 Only {product.stock} left in stock!
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {pagination?.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}

            {/* Results Info */}
            {pagination && (
              <p className="text-center text-slate-400 mt-4">
                Showing {products.length} of {pagination.total} products
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
