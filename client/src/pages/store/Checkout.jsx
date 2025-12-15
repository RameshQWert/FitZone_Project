import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCreditCard,
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCash,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineUser,
} from 'react-icons/hi';
import { storeService } from '../../services';
import { useAuth } from '../../context';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');

  const [shipping, setShipping] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    checkFirstOrder();
    loadRazorpayScript();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await storeService.getCart();
      // API returns { success: true, data: cart }
      if (!response.data?.items?.length) {
        toast.error('Your cart is empty');
        navigate('/store/cart');
        return;
      }
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      navigate('/store/cart');
    } finally {
      setLoading(false);
    }
  };

  const checkFirstOrder = async () => {
    try {
      const response = await storeService.getMyOrders({ limit: 1 });
      // API returns { success: true, data: orders[] }
      const orders = response.data || [];
      const hasNoOrders = orders.length === 0;
      console.log('First order check:', { orders, hasNoOrders });
      setIsFirstOrder(hasNoOrders);
    } catch (error) {
      console.error('Error checking order history:', error);
      // Assume first order if we can't check
      setIsFirstOrder(true);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shipping.name.trim()) newErrors.name = 'Name is required';
    if (!shipping.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) newErrors.email = 'Invalid email address';
    if (!shipping.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(shipping.phone)) newErrors.phone = 'Invalid phone number';
    if (!shipping.address.trim()) newErrors.address = 'Address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.state.trim()) newErrors.state = 'State is required';
    if (!shipping.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shipping.pincode)) newErrors.pincode = 'Invalid pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const getShippingCost = () => {
    if (!cart?.totalAmount) return 0;
    // First order = FREE shipping
    if (isFirstOrder) return 0;
    // Orders >= ₹999 = FREE shipping
    return cart.totalAmount >= 999 ? 0 : 99;
  };

  const getDiscount = () => {
    if (!promoApplied || !cart?.totalAmount) return 0;
    if (promoApplied.type === 'percentage') {
      return Math.round((cart.totalAmount * promoApplied.value) / 100);
    }
    return promoApplied.value;
  };

  const getTotalAmount = () => {
    const subtotal = cart?.totalAmount || 0;
    const shipping = getShippingCost();
    const discount = getDiscount();
    return Math.max(0, subtotal + shipping - discount);
  };

  const applyPromoCode = () => {
    console.log('Apply promo code clicked, code:', promoCode);
    const code = promoCode.trim().toUpperCase();
    setPromoError('');
    
    if (!code) {
      setPromoError('Please enter a promo code');
      return;
    }

    // NEW10 - 10% off for first order users only
    if (code === 'NEW10') {
      if (!isFirstOrder) {
        setPromoError('This code is only valid for first-time customers');
        return;
      }
      setPromoApplied({
        code: 'NEW10',
        type: 'percentage',
        value: 10,
        description: '10% off for new customers'
      });
      toast.success('🎉 Promo code applied! 10% off for new customers');
      return;
    }

    // FLAT100 - Flat ₹100 off on orders above ₹500
    if (code === 'FLAT100') {
      if (cart?.totalAmount < 500) {
        setPromoError('Minimum order amount ₹500 required for this code');
        return;
      }
      setPromoApplied({
        code: 'FLAT100',
        type: 'flat',
        value: 100,
        description: '₹100 off on orders above ₹500'
      });
      toast.success('🎉 Promo code applied! ₹100 off');
      return;
    }

    // FITZONE20 - 20% off (max ₹200)
    if (code === 'FITZONE20') {
      const discount = Math.min(Math.round((cart?.totalAmount * 20) / 100), 200);
      setPromoApplied({
        code: 'FITZONE20',
        type: 'flat',
        value: discount,
        description: '20% off (max ₹200)'
      });
      toast.success(`🎉 Promo code applied! ₹${discount} off`);
      return;
    }

    setPromoError('Invalid promo code');
  };

  const removePromoCode = () => {
    setPromoApplied(null);
    setPromoCode('');
    setPromoError('');
    toast.success('Promo code removed');
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setProcessing(true);

    try {
      // Create order with promo code and discount info
      // Map shipping fields to match backend expected format
      const orderResponse = await storeService.createOrder({
        shippingAddress: {
          fullName: shipping.name,
          phone: shipping.phone,
          email: shipping.email,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          country: 'India'
        },
        paymentMethod,
        isFirstOrder,
        promoCode: promoApplied ? promoApplied.code : null,
        promoDiscount: promoApplied ? getDiscount() : 0,
        freeShipping: isFirstOrder,
      });

      if (paymentMethod === 'cod') {
        // COD - Order placed directly
        setOrderId(orderResponse.data.order._id);
        setOrderSuccess(true);
        toast.success('Order placed successfully!');
      } else {
        // Razorpay Payment
        const { razorpayOrder, order } = orderResponse.data;
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Rndp3AwUq1BNhJ',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'FitZone Store',
          description: 'Purchase from FitZone Store',
          order_id: razorpayOrder.id,
          handler: async (response) => {
            try {
              // Verify payment
              const verifyResponse = await storeService.verifyPayment({
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              setOrderId(verifyResponse.data.order._id);
              setOrderSuccess(true);
              toast.success('Payment successful! Order placed.');
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: shipping.name,
            contact: shipping.phone,
            email: user?.email || '',
          },
          notes: {
            orderId: order._id,
          },
          theme: {
            color: '#f97316',
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              toast.error('Payment cancelled');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      if (paymentMethod === 'cod') {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-800 rounded-xl h-64"></div>
                <div className="bg-gray-800 rounded-xl h-48"></div>
              </div>
              <div className="bg-gray-800 rounded-xl h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <HiOutlineCheckCircle className="w-16 h-16 text-green-400" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-400 mb-2">Thank you for your purchase.</p>
            <p className="text-gray-500 mb-8">
              Order ID: <span className="text-orange-400 font-mono">{orderId}</span>
            </p>

            <div className="bg-gray-700/50 rounded-xl p-4 mb-8 text-left">
              <h3 className="text-gray-300 font-medium mb-2">What's Next?</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs">1</span>
                  You'll receive an order confirmation email shortly
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs">2</span>
                  Your order will be processed and shipped within 2-3 business days
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs">3</span>
                  Track your order in the Orders section of your profile
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/store"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>
              <Link
                to="/store/orders"
                className="inline-flex items-center justify-center gap-2 bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                View My Orders
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/store/cart"
            className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <HiOutlineTruck className="w-6 h-6 text-orange-400" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={shipping.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.name ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={shipping.phone}
                      onChange={handleInputChange}
                      placeholder="10 digit mobile number"
                      maxLength={10}
                      className={`w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phone ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      value={shipping.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className={`w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <HiOutlineLocationMarker className="absolute left-3 top-4 w-5 h-5 text-gray-500" />
                    <textarea
                      name="address"
                      value={shipping.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat No., Building, Street, Area"
                      rows={3}
                      className={`w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 resize-none ${
                        errors.address ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                      }`}
                    />
                  </div>
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shipping.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.city ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                    }`}
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={shipping.state}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.state ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                    }`}
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                  {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={shipping.pincode}
                    onChange={handleInputChange}
                    placeholder="6 digit pincode"
                    maxLength={6}
                    className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.pincode ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                    }`}
                  />
                  {errors.pincode && <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <HiOutlineCreditCard className="w-6 h-6 text-orange-400" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <HiOutlineCreditCard className="w-6 h-6 text-orange-400" />
                      <span className="text-white font-medium">Pay Online</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Credit/Debit Card, UPI, Net Banking, Wallets
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">UPI</span>
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">Cards</span>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <HiOutlineCash className="w-6 h-6 text-green-400" />
                      <span className="text-white font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Pay when your order arrives
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              {/* First Order Banner - Always show at top if first order */}
              {isFirstOrder && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-400 text-sm font-bold flex items-center gap-2">
                    🎉 Congratulations! First Order Benefits:
                  </p>
                  <ul className="text-gray-300 text-sm mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> FREE Shipping on this order
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> Use code <span className="font-bold text-orange-400">NEW10</span> for extra 10% off!
                    </li>
                  </ul>
                </div>
              )}

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart?.items?.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={
                        item.image || 
                        item.product?.thumbnail ||
                        (item.product?.images?.[0] 
                          ? (typeof item.product.images[0] === 'string' 
                              ? item.product.images[0] 
                              : item.product.images[0].url)
                          : 'https://via.placeholder.com/80x80?text=No+Image')
                      }
                      alt={item.product?.name || item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-200 text-sm font-medium truncate">
                        {item.product?.name || item.name}
                      </h4>
                      {item.variant && (
                        <p className="text-gray-500 text-xs">{item.variant}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-orange-400 font-medium text-sm">
                      ₹{(item.price * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-gray-700 pt-4 mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Promo Code
                </label>
                {promoApplied ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-green-400 font-medium">{promoApplied.code}</p>
                      <p className="text-gray-400 text-xs">{promoApplied.description}</p>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-gray-400 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        placeholder="Enter code"
                        className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                      />
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-xs mt-1">{promoError}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {isFirstOrder && (
                        <p className="text-green-400 text-xs">💡 Try NEW10 for 10% off on your first order!</p>
                      )}
                      <p className="text-gray-500 text-xs">Available codes: NEW10, FLAT100, FITZONE20</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cart?.totalItems} items)</span>
                  <span>₹{cart?.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="flex items-center gap-1">
                    Shipping
                    {isFirstOrder && <span className="text-xs text-green-400">(First Order)</span>}
                  </span>
                  <span className={getShippingCost() === 0 ? 'text-green-400' : ''}>
                    {getShippingCost() === 0 ? 'FREE' : `₹${getShippingCost()}`}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({promoApplied.code})</span>
                    <span>-₹{getDiscount()?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-white text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-400">₹{getTotalAmount()?.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <p className="text-green-400 text-sm mt-1">You save ₹{getDiscount()?.toLocaleString()}!</p>
                )}
              </div>

              {/* Place Order Button */}
              <motion.button
                onClick={handlePlaceOrder}
                disabled={processing}
                whileHover={{ scale: processing ? 1 : 1.02 }}
                whileTap={{ scale: processing ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : paymentMethod === 'razorpay' ? (
                  <>
                    <HiOutlineCreditCard className="w-5 h-5" />
                    Pay ₹{getTotalAmount()?.toLocaleString()}
                  </>
                ) : (
                  <>
                    <HiOutlineShoppingBag className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </motion.button>

              <p className="text-gray-500 text-xs text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
