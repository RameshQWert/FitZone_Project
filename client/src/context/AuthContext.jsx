import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            logout();
          }
        } catch (error) {
          // Token expired or invalid
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token: newToken, ...userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        const { token: newToken, ...userInfo } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        setToken(newToken);
        setUser(userInfo);
        setIsAuthenticated(true);
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  // Update user data
  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedData }));
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  // Check if user is trainer
  const isTrainer = useCallback(() => {
    return user?.role === 'trainer';
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isTrainer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
