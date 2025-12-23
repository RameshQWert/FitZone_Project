import React, { useState, useEffect, useCallback, memo } from 'react';
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
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
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

  // Close menus when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen && !isMobileUserMenuOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-menu') && !e.target.closest('.mobile-user-menu')) {
        setIsProfileMenuOpen(false);
        setIsMobileUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen, isMobileUserMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileUserMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-500/95 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-dark-500/80 to-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.png" 
              alt="FitZone Logo" 
              className="h-11 w-auto group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-xl font-heading font-bold bg-gradient-to-r from-white via-primary-300 to-secondary-400 bg-clip-text text-transparent">
              FitZone
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg border border-primary-500/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Cart Icon */}
            <Link
              to="/store/cart"
              className="relative p-2.5 text-gray-400 hover:text-white bg-dark-400/50 hover:bg-dark-400 rounded-xl transition-all duration-300 group"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex items-center space-x-3 bg-gradient-to-r from-dark-400/80 to-dark-300/80 hover:from-dark-400 hover:to-dark-300 rounded-xl px-4 py-2.5 transition-all duration-300 border border-white/5 hover:border-white/10"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium max-w-[100px] truncate">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* Desktop Dropdown Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-dark-400/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold truncate">{user?.fullName}</p>
                            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                          </div>
                        </div>
                        <span className="inline-block mt-3 px-3 py-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 text-xs rounded-full capitalize border border-primary-500/30">
                          {user?.role || 'Member'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {(user?.role === 'admin' || user?.role === 'trainer') && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-primary-400 hover:bg-primary-500/10 transition-colors group"
                          >
                            <div className="w-9 h-9 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors group"
                        >
                          <div className="w-9 h-9 bg-dark-300 rounded-lg flex items-center justify-center mr-3 group-hover:bg-dark-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          My Profile
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors group"
                        >
                          <div className="w-9 h-9 bg-dark-300 rounded-lg flex items-center justify-center mr-3 group-hover:bg-dark-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          Booking History
                        </Link>
                        <Link
                          to="/attendance-scanner"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors group"
                        >
                          <div className="w-9 h-9 bg-dark-300 rounded-lg flex items-center justify-center mr-3 group-hover:bg-dark-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M4 20h2m0-4h2m10 0h2m-6-4h.01M4 8h2m6-4h.01" />
                            </svg>
                          </div>
                          Check In / Out
                        </Link>
                        <Link
                          to="/chat"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors group"
                        >
                          <div className="w-9 h-9 bg-dark-300 rounded-lg flex items-center justify-center mr-3 group-hover:bg-dark-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          Chat with Admin
                        </Link>
                        <Link
                          to="/bmi-calculator"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors group"
                        >
                          <div className="w-9 h-9 bg-dark-300 rounded-lg flex items-center justify-center mr-3 group-hover:bg-dark-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          BMI Calculator
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group"
                        >
                          <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-500/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-white hover:text-primary-400 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Cart Icon - Mobile */}
            <Link
              to="/store/cart"
              className="p-2.5 text-gray-400 hover:text-white bg-dark-400/50 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Mobile User Avatar - Shows when authenticated */}
            {isAuthenticated && (
              <div className="relative mobile-user-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
                  }}
                  className="w-10 h-10 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
                >
                  <span className="text-white font-bold text-sm">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </button>

                {/* Mobile User Dropdown */}
                <AnimatePresence>
                  {isMobileUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 bg-dark-400/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{user?.fullName}</p>
                            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                          </div>
                        </div>
                        <span className="inline-block mt-3 px-3 py-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 text-xs rounded-full capitalize border border-primary-500/30">
                          {user?.role || 'Member'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2 max-h-[50vh] overflow-y-auto">
                        {(user?.role === 'admin' || user?.role === 'trainer') && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-primary-400 hover:bg-primary-500/10 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setIsMobileUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Booking History
                        </Link>
                        <Link
                          to="/attendance-scanner"
                          onClick={() => setIsMobileUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M4 20h2m0-4h2m10 0h2m-6-4h.01M4 8h2m6-4h.01" />
                          </svg>
                          Check In / Out
                        </Link>
                        <Link
                          to="/chat"
                          onClick={() => setIsMobileUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chat with Admin
                        </Link>
                        <Link
                          to="/bmi-calculator"
                          onClick={() => setIsMobileUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          BMI Calculator
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
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
            )}

            {/* Mobile Menu Button (Hamburger) */}
            <button
              className="p-2.5 text-white bg-dark-400/50 hover:bg-dark-400 rounded-xl transition-all"
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
        </div>

        {/* Mobile Navigation Menu - Only Navigation Links */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-dark-400/95 backdrop-blur-xl rounded-2xl mt-2 p-4 border border-white/10"
            >
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`py-3 px-4 rounded-xl text-center transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-300 hover:bg-dark-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              {/* Auth Buttons for Non-Authenticated Users */}
              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 px-4 text-white bg-dark-300 hover:bg-dark-200 rounded-xl transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-3 px-4 text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 rounded-xl transition-colors font-medium shadow-lg shadow-primary-500/25"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
});

export default Navbar;
