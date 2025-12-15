import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context';

// Static nav links - moved outside component to prevent recreation
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Programs', path: '/programs' },
  { name: 'Facilities', path: '/facilities' },
  { name: 'Trainers', path: '/trainers' },
  { name: 'Schedule', path: '/schedule' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Store', path: '/store' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Throttled scroll handler for better performance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLogout = useCallback(() => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-dark-500/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-heading font-bold gradient-text">
              FitZone
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary-400 ${
                  location.pathname === link.path
                    ? 'text-primary-400'
                    : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon - Always visible */}
            <Link
              to="/store/cart"
              className="relative p-2 text-gray-300 hover:text-orange-400 transition-colors"
              title="Shopping Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {isAuthenticated ? (
              <div className="relative profile-menu">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  }}
                  className="flex items-center space-x-3 bg-dark-400/50 hover:bg-dark-400 rounded-xl px-4 py-2 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium max-w-[120px] truncate">
                    {user?.fullName || 'User'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-dark-400/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-medium truncate">{user?.fullName}</p>
                        <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full capitalize">
                          {user?.role || 'Member'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Admin Panel Link - Only for admin/trainer */}
                        {(user?.role === 'admin' || user?.role === 'trainer') && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-primary-400 hover:bg-primary-500/10 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          to="/attendance-scanner"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M4 20h2m0-4h2m10 0h2m-6-4h.01M4 8h2m6-4h.01" />
                          </svg>
                          Check In / Out
                        </Link>
                        <Link
                          to="/chat"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chat with Admin
                        </Link>
                        <Link
                          to="/bmi-calculator"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          BMI Calculator
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-dark-400/95 backdrop-blur-lg rounded-2xl mt-2 p-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-3 px-4 rounded-xl transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-300 hover:bg-dark-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="mt-4 pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.fullName}</p>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                        {(user?.role === 'admin' || user?.role === 'trainer') && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full capitalize">
                            {user?.role}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Panel Link - Only for admin/trainer */}
                    {(user?.role === 'admin' || user?.role === 'trainer') && (
                      <Link
                        to="/admin"
                        className="block py-3 px-4 rounded-xl text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        🎛️ Admin Panel
                      </Link>
                    )}
                    
                    {/* Mobile Menu Links */}
                    <Link
                      to="/dashboard"
                      className="block py-3 px-4 rounded-xl text-gray-300 hover:bg-dark-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block py-3 px-4 rounded-xl text-gray-300 hover:bg-dark-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/attendance-scanner"
                      className="block py-3 px-4 rounded-xl text-gray-300 hover:bg-dark-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Check In / Out
                    </Link>
                    <Link
                      to="/chat"
                      className="block py-3 px-4 rounded-xl text-gray-300 hover:bg-dark-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      💬 Chat with Admin
                    </Link>
                    <Link
                      to="/bmi-calculator"
                      className="block py-3 px-4 rounded-xl text-gray-300 hover:bg-dark-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🧮 BMI Calculator
                    </Link>
                    <Link
                      to="/store/cart"
                      className="block py-3 px-4 rounded-xl text-gray-300 hover:bg-dark-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🛒 My Cart
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-3 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center btn-outline py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center btn-primary py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
});

export default Navbar;
