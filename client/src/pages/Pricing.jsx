import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Loading } from '../components/common';
import { subscriptionService } from '../services';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' });
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlanForQR, setSelectedPlanForQR] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // UPI Details
  const UPI_ID = '9939896403@ybl';
  const UPI_NAME = 'FitZone';

  // Generate UPI QR Code URL
  const getUPIQRCode = (amount, planName) => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(planName + ' Plan Payment')}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
  };

  // Handle UPI QR Payment
  const handleUPIPayment = (plan) => {
    if (!isAuthenticated) {
      setPaymentMessage({ type: 'error', text: 'Please login to purchase a plan' });
      setTimeout(() => {
        navigate('/login', { state: { from: '/pricing' } });
      }, 1500);
      return;
    }
    setSelectedPlanForQR(plan);
    setShowQRModal(true);
  };

  // Handle Razorpay Payment
  const handleBuyNow = async (plan) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      setPaymentMessage({ type: 'error', text: 'Please login to purchase a plan' });
      setTimeout(() => {
        navigate('/login', { state: { from: '/pricing' } });
      }, 1500);
      return;
    }

    try {
      setProcessingPlanId(plan._id);
      setPaymentMessage({ type: '', text: '' });

      // Calculate amount based on billing cycle
      const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

      // Check if user already has this subscription
      const subscriptionCheck = await paymentService.checkSubscription(plan.name, amount, user?._id);
      
      if (!subscriptionCheck.canPurchase) {
        setPaymentMessage({ 
          type: 'error', 
          text: subscriptionCheck.message 
        });
        setProcessingPlanId(null);
        return;
      }

      // Load Razorpay script
      const loaded = await paymentService.loadRazorpayScript();
      if (!loaded) {
        setPaymentMessage({ type: 'error', text: 'Failed to load payment gateway. Please try again.' });
        setProcessingPlanId(null);
        return;
      }

      // Get Razorpay key
      const keyData = await paymentService.getKey();
      const razorpayKey = keyData.key;

      // Create order
      const orderData = await paymentService.createOrder({
        amount,
        planId: plan._id,
        planName: plan.name,
        billingCycle
      });

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'FitZone',
        description: `${plan.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyData = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
              planName: plan.name,
              billingCycle,
              amount,
              userId: user?._id
            });
            
            if (verifyData.success) {
              setPaymentMessage({ type: 'success', text: 'Payment successful! Welcome to ' + plan.name + ' plan!' });
              setTimeout(() => {
                navigate('/');
              }, 2000);
            } else {
              setPaymentMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
            }
          } catch (err) {
            setPaymentMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        options: {
          checkout: {
            method: {
              upi: 1,
              card: 1,
              netbanking: 1,
              wallet: 1,
              paylater: 1
            }
          }
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: function() {
            setProcessingPlanId(null);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setPaymentMessage({ type: 'error', text: 'Payment failed: ' + response.error.description });
        setProcessingPlanId(null);
      });
      razorpay.open();
      
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentMessage({ type: 'error', text: err.message || 'Failed to initiate payment. Please try again.' });
    } finally {
      setProcessingPlanId(null);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await subscriptionService.getAll();
        // Map API data to expected format
        const mappedPlans = data.map(plan => ({
          _id: plan._id,
          name: plan.name,
          description: plan.description || `${plan.name} membership plan`,
          monthlyPrice: plan.price,
          yearlyPrice: plan.price * 10, // 2 months free on yearly
          icon: plan.icon || getDefaultIcon(plan.name),
          color: plan.color || getDefaultColor(plan.name),
          shadowColor: getShadowColor(plan.name),
          popular: plan.popular || false,
          features: mapFeatures(plan.features || [])
        }));
        setPlans(mappedPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Helper functions
  const getDefaultIcon = (name) => {
    const icons = { 'Basic': '🌱', 'Premium': '⭐', 'Elite': '👑' };
    return icons[name] || '💪';
  };

  const getDefaultColor = (name) => {
    const colors = {
      'Basic': 'from-blue-500 to-blue-600',
      'Premium': 'from-primary-500 to-secondary-500',
      'Elite': 'from-accent-500 to-orange-600'
    };
    return colors[name] || 'from-primary-500 to-secondary-500';
  };

  const getShadowColor = (name) => {
    const shadows = {
      'Basic': 'shadow-blue-500/30',
      'Premium': 'shadow-primary-500/30',
      'Elite': 'shadow-accent-500/30'
    };
    return shadows[name] || 'shadow-primary-500/30';
  };

  const mapFeatures = (features) => {
    // Default features structure if API only returns strings
    const defaultFeatureDetails = {
      'Gym Access': { detail: '24/7 Access' },
      'Cardio Equipment': { detail: 'Full Access' },
      'Locker Room': { detail: 'Premium' },
      'Free WiFi': { detail: 'Unlimited' },
      'Group Classes': { detail: 'All Classes' },
      'Personal Training': { detail: '2 sessions/month' },
      'Swimming Pool': { detail: 'Full Access' },
      'Spa & Sauna': { detail: 'Unlimited' },
      'Guest Passes': { detail: '2 per month' },
      'Fitness Assessment': { detail: 'Unlimited' },
    };

    return features.map(feature => {
      if (typeof feature === 'string') {
        return {
          name: feature,
          included: true,
          detail: defaultFeatureDetails[feature]?.detail || 'Included'
        };
      }
      return feature;
    });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const faqs = [
    {
      question: 'Can I cancel my membership anytime?',
      answer: 'Yes! All our memberships are flexible. You can cancel anytime with no hidden fees. For annual plans, we offer prorated refunds.'
    },
    {
      question: 'Is there a joining fee?',
      answer: 'No joining fees! The price you see is the price you pay. We believe in transparent pricing with no surprises.'
    },
    {
      question: 'Can I freeze my membership?',
      answer: 'Absolutely! You can freeze your membership for up to 3 months per year at no extra cost. Perfect for vacations or recovery periods.'
    },
    {
      question: 'Do you offer family plans?',
      answer: 'Yes! We offer special family discounts. Add family members to your plan at 20% off their individual membership rate.'
    },
    {
      question: 'What\'s included in the free trial?',
      answer: 'Our 7-day free trial includes full gym access, one group class, and a complimentary fitness assessment with a trainer.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply to your next billing cycle.'
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-mesh">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-mesh">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Oops!</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Payment Message Toast */}
      {paymentMessage.text && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg ${
            paymentMessage.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentMessage.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{paymentMessage.text}</span>
            <button 
              onClick={() => setPaymentMessage({ type: '', text: '' })}
              className="ml-2 hover:opacity-80"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative py-24 bg-mesh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 right-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-6">
              💰 Simple Pricing
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              No hidden fees. No surprises. Just straightforward pricing for your fitness goals.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-2 bg-dark-400 rounded-2xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-secondary-500 text-white text-xs rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium rounded-full shadow-lg">
                      🔥 Most Popular
                    </span>
                  </div>
                )}

                <div className={`glass-card overflow-hidden h-full ${
                  plan.popular ? 'border-2 border-primary-500/50 shadow-2xl ' + plan.shadowColor : ''
                }`}>
                  {/* Header */}
                  <div className={`p-8 bg-gradient-to-r ${plan.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10">
                      <span className="text-4xl mb-4 block">{plan.icon}</span>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-white/80 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="p-8 text-center border-b border-white/10">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-gray-400 text-2xl">₹</span>
                      <motion.span 
                        key={billingCycle}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-white"
                      >
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </motion.span>
                      <span className="text-gray-400">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-secondary-400 text-sm mt-2">
                        Save ₹{plan.monthlyPrice * 12 - plan.yearlyPrice}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="p-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <svg className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div>
                            <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                              {feature.name}
                            </span>
                            <span className={`block text-xs ${feature.included ? 'text-gray-400' : 'text-gray-600'}`}>
                              {feature.detail}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="mt-8 space-y-3">
                      <Button 
                        variant={plan.popular ? 'primary' : 'outline'} 
                        className="w-full"
                        onClick={() => handleBuyNow(plan)}
                        disabled={processingPlanId !== null}
                      >
                        {processingPlanId === plan._id ? 'Processing...' : 'Buy Now'}
                      </Button>
                      <button 
                        onClick={() => handleUPIPayment(plan)}
                        disabled={processingPlanId !== null}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.36 12.02l-6.32-6.32c-.42-.42-1.14-.13-1.14.47v3.32c-5.52.52-9.48 5.03-9.48 10.51 0 .82.67 1.5 1.5 1.5.69 0 1.29-.47 1.46-1.14.89-3.46 3.87-5.84 7.52-5.84v3.32c0 .6.72.89 1.14.47l6.32-6.32c.26-.26.26-.68 0-.94z"/>
                        </svg>
                        Pay with UPI / QR
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-4">
              Detailed Comparison
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Compare <span className="gradient-text">Plans</span>
            </h2>
          </motion.div>

          <motion.div 
            className="overflow-x-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-6 px-4 text-gray-400 font-medium">Features</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="py-6 px-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">{plan.icon}</span>
                        <span className={`font-bold ${plan.popular ? 'text-primary-400' : 'text-white'}`}>
                          {plan.name}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ₹{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans[0].features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-gray-300">{feature.name}</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="py-4 px-4 text-center">
                        {plan.features[idx].included ? (
                          <div className="flex flex-col items-center">
                            <svg className="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-400 mt-1">{plan.features[idx].detail}</span>
                          </div>
                        ) : (
                          <svg className="w-5 h-5 text-gray-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="py-24 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-4">
              All Plans Include
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Premium <span className="gradient-text">Benefits</span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { icon: '📱', title: 'Mobile App', description: 'Track workouts and book classes from anywhere' },
              { icon: '🎯', title: 'Goal Tracking', description: 'Set and monitor your fitness goals' },
              { icon: '🍎', title: 'Nutrition Tips', description: 'Get personalized nutrition advice' },
              { icon: '🏆', title: 'Rewards Program', description: 'Earn points for working out' },
              { icon: '👕', title: 'Free Towels', description: 'Complimentary towel service' },
              { icon: '🚿', title: 'Clean Facilities', description: 'Sanitized hourly for your safety' },
              { icon: '🎧', title: 'Music System', description: 'Premium audio throughout the gym' },
              { icon: '💪', title: 'Equipment Training', description: 'Learn proper equipment usage' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center"
              >
                <span className="text-3xl mb-3 block">{benefit.icon}</span>
                <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-dark-600">
        <div className="section-container max-w-4xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
              Questions?
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  <motion.svg 
                    className="w-5 h-5 text-primary-400 flex-shrink-0"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: openFaq === index ? 'auto' : 0,
                    opacity: openFaq === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-gray-400">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative z-10">
          <motion.div 
            className="glass-card p-12 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold text-white mb-6">
              Still Have <span className="gradient-text">Questions</span>?
            </h2>
            <p className="text-gray-400 mb-8">
              Our team is here to help you choose the perfect plan for your fitness goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="primary" size="lg">
                  Contact Us
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Schedule a Tour
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* UPI QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedPlanForQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Pay with UPI</h3>
                    <p className="text-sm text-gray-500">Scan QR or use UPI ID</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Plan Details */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 mb-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">Plan</p>
                    <p className="text-lg font-bold">{selectedPlanForQR.name} - {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Amount</p>
                    <p className="text-2xl font-bold">
                      ₹{billingCycle === 'monthly' ? selectedPlanForQR.monthlyPrice : selectedPlanForQR.yearlyPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-inner">
                  <img 
                    src={getUPIQRCode(
                      billingCycle === 'monthly' ? selectedPlanForQR.monthlyPrice : selectedPlanForQR.yearlyPrice,
                      selectedPlanForQR.name
                    )}
                    alt="UPI QR Code"
                    className="w-56 h-56"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3">Scan with any UPI app</p>
                
                {/* UPI Apps Icons */}
                <div className="flex items-center gap-4 mt-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" className="h-8" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" alt="PhonePe" className="h-8" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-8" />
                </div>
              </div>

              {/* UPI ID */}
              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">Or pay using UPI ID</p>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-200">
                  <span className="font-mono font-semibold text-gray-800">{UPI_ID}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(UPI_ID);
                      setPaymentMessage({ type: 'success', text: 'UPI ID copied to clipboard!' });
                      setTimeout(() => setPaymentMessage({ type: '', text: '' }), 2000);
                    }}
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-gray-500">
                <p>After payment, please share the screenshot</p>
                <p>to <span className="text-orange-500 font-medium">support@fitzone.com</span></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
