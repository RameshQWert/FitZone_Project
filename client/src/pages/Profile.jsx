import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCreditCard,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common';
import api from '../services/api';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/auth/me');
        setUserDetails(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isSubscriptionActive = () => {
    if (!userDetails?.subscription?.status) return false;
    if (userDetails.subscription.status !== 'active') return false;
    if (!userDetails.subscription.dueDate) return false;
    return new Date(userDetails.subscription.dueDate) > new Date();
  };

  const getDaysRemaining = () => {
    if (!userDetails?.subscription?.dueDate) return 0;
    const dueDate = new Date(userDetails.subscription.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-mesh">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const subscription = userDetails?.subscription;

  return (
    <div className="min-h-screen pt-20 bg-mesh">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 right-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Manage your account and view your subscription details
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                <HiOutlineUser className="text-primary-400" size={28} />
                Personal Information
              </h2>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold">
                  {userDetails?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{userDetails?.fullName || 'User'}</h3>
                  <p className="text-gray-400 capitalize">{userDetails?.role || 'Member'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
                  <HiOutlineMail className="text-primary-400" size={24} />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{userDetails?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
                  <HiOutlinePhone className="text-primary-400" size={24} />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white font-medium">{userDetails?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
                  <HiOutlineCalendar className="text-primary-400" size={24} />
                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-white font-medium">{formatDate(userDetails?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                <HiOutlineCreditCard className="text-secondary-400" size={28} />
                Subscription Details
              </h2>

              {subscription?.status === 'active' && isSubscriptionActive() ? (
                <>
                  {/* Active Subscription */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <HiOutlineCheckCircle className="text-green-400" size={28} />
                      <span className="text-green-400 font-bold text-lg">Active Subscription</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-white mb-2">{subscription.planName}</h3>
                      <p className="text-gray-400 capitalize">{subscription.billingCycle} Plan</p>
                      <p className="text-2xl font-bold text-primary-400 mt-2">
                        ₹{subscription.amount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <HiOutlineCalendar className="text-blue-400" size={22} />
                        <span className="text-gray-400">Paid Date</span>
                      </div>
                      <span className="text-white font-medium">{formatDate(subscription.paidDate)}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <HiOutlineClock className="text-yellow-400" size={22} />
                        <span className="text-gray-400">Valid Until</span>
                      </div>
                      <span className="text-white font-medium">{formatDate(subscription.dueDate)}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <HiOutlineCheckCircle className="text-primary-400" size={22} />
                        <span className="text-gray-400">Days Remaining</span>
                      </div>
                      <span className="text-primary-400 font-bold text-xl">{getDaysRemaining()} days</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade Plan <HiOutlineArrowRight className="ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* No Subscription */}
                  <div className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-2xl p-6 mb-6 text-center">
                    <HiOutlineExclamationCircle className="text-gray-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                    <p className="text-gray-400">
                      {subscription?.status === 'expired' 
                        ? 'Your subscription has expired. Renew now to continue enjoying our services.'
                        : 'Get started with a membership plan to access all our facilities and services.'}
                    </p>
                  </div>

                  {subscription?.planName && (
                    <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
                      <p className="text-gray-400 text-sm mb-2">Previous Subscription</p>
                      <p className="text-white font-medium">{subscription.planName} - Expired on {formatDate(subscription.dueDate)}</p>
                    </div>
                  )}

                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => navigate('/pricing')}
                  >
                    View Plans <HiOutlineArrowRight className="ml-2" />
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
