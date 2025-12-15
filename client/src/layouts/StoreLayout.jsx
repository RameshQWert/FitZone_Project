import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShoppingCart, 
  HiOutlineSearch, 
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineLogin
} from 'react-icons/hi';
import { useAuth } from '../context';
import { storeService } from '../services';

const StoreLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCartCount = async () => {
        try {
          const response = await storeService.getCartCount();
          setCartCount(response.data?.count || 0);
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      };
      fetchCartCount();
    }
  }, [isAuthenticated, location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/store');
  };

  const categories = [
    { name: 'All Products', path: '/store' },
    { name: 'Supplements', path: '/store?category=supplements' },
    { name: 'Clothing', path: '/store?category=clothing' },
    { name: 'Equipment', path: '/store?category=equipment' },
    { name: 'Accessories', path: '/store?category=accessories' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Store Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg shadow-orange-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/store" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">FitZone</span>
                <span className="text-xs text-orange-400 -mt-1">Store</span>
              </div>
            </Link>

            {/* Desktop Categories */}
            <div className="hidden md:flex items-center space-x-1">
              {categories.map((cat) => {
                const isActive = location.pathname + location.search === cat.path || 
                  (cat.path === '/store' && location.pathname === '/store' && !location.search);
                return (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'text-gray-300 hover:text-orange-400 hover:bg-gray-800'
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-300 hover:text-orange-400 transition-colors"
                >
                  <HiOutlineSearch className="w-6 h-6" />
                </button>
                
                <AnimatePresence>
                  {showSearch && (
                    <motion.form
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 250 }}
                      exit={{ opacity: 0, width: 0 }}
                      onSubmit={handleSearch}
                      className="absolute right-0 top-12 bg-gray-800 rounded-lg overflow-hidden shadow-xl"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        autoFocus
                        className="w-full bg-transparent text-white px-4 py-2 focus:outline-none"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link
                to="/store/cart"
                className="relative p-2 text-gray-300 hover:text-orange-400 transition-colors"
              >
                <HiOutlineShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Back to Main Site */}
              <Link
                to="/"
                className="p-2 text-gray-300 hover:text-orange-400 transition-colors"
                title="Back to FitZone"
              >
                <HiOutlineHome className="w-6 h-6" />
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-300 hover:text-orange-400 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-white font-medium truncate">{user?.fullName}</p>
                      <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/store/orders"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-400 transition-colors"
                      >
                        <HiOutlineShoppingCart className="w-5 h-5 mr-2" />
                        My Orders
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-400 transition-colors"
                      >
                        <HiOutlineUser className="w-5 h-5 mr-2" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors"
                      >
                        <HiOutlineLogout className="w-5 h-5 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  <HiOutlineLogin className="w-5 h-5" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <HiOutlineX className="w-6 h-6" />
                ) : (
                  <HiOutlineMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-800/95 backdrop-blur-lg border-t border-gray-700"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </form>

                {/* Mobile Categories */}
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-400 rounded-lg transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}

                <div className="border-t border-gray-700 pt-2 mt-2">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-400 rounded-lg transition-colors"
                  >
                    🏠 Back to Main Site
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Store Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/store" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-white">FitZone Store</span>
                </div>
              </Link>
              <p className="text-gray-400 mb-4">
                Your one-stop shop for premium fitness gear, supplements, and accessories.
                Quality products to fuel your fitness journey.
              </p>
              <div className="flex space-x-4">
                <span className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">💳 Secure Payments</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">🚚 Fast Delivery</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.slice(1).map((cat) => (
                  <li key={cat.name}>
                    <Link
                      to={cat.path}
                      className="text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-orange-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-400 hover:text-orange-400 transition-colors">
                    FitZone Gym
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} FitZone Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
