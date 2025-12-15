const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
  const { amount, planId, planName, billingCycle } = req.body;

  if (!amount || !planName) {
    res.status(400);
    throw new Error('Amount and plan name are required');
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      planId: planId || '',
      planName: planName,
      billingCycle: billingCycle || 'monthly',
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      planName: planName,
      billingCycle: billingCycle,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500);
    throw new Error('Failed to create payment order');
  }
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, planName, billingCycle, amount, userId } = req.body;

  // Verify signature
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    // Payment verified successfully - Save to database
    try {
      const payment = await Payment.create({
        user: userId || req.user?._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: amount,
        planName: planName,
        planId: planId,
        billingCycle: billingCycle || 'monthly',
        status: 'completed',
        method: 'card' // Razorpay default
      });

      // Calculate due date based on billing cycle
      const paidDate = new Date();
      let dueDate = new Date();
      if (billingCycle === 'yearly') {
        dueDate.setFullYear(dueDate.getFullYear() + 1);
      } else {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      // Update user's subscription
      const userIdToUpdate = userId || req.user?._id;
      if (userIdToUpdate) {
        await User.findByIdAndUpdate(userIdToUpdate, {
          subscription: {
            planId: planId,
            planName: planName,
            amount: amount,
            billingCycle: billingCycle || 'monthly',
            paidDate: paidDate,
            dueDate: dueDate,
            paymentId: razorpay_payment_id,
            status: 'active'
          }
        });
      }

      res.json({
        success: true,
        message: 'Payment verified and saved successfully',
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          payment: payment,
          subscription: {
            planName,
            paidDate,
            dueDate,
            status: 'active'
          }
        },
      });
    } catch (error) {
      console.error('Error saving payment:', error);
      res.json({
        success: true,
        message: 'Payment verified but failed to save record',
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        },
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid payment signature');
  }
});

// @desc    Check user subscription status
// @route   GET /api/payments/check-subscription
// @access  Private
const checkSubscription = asyncHandler(async (req, res) => {
  const { planName, amount, userId } = req.query;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return res.json({
      success: true,
      canPurchase: true,
      message: 'User not found, can proceed with purchase'
    });
  }

  const subscription = user.subscription;
  
  // No active subscription
  if (!subscription || !subscription.status || subscription.status !== 'active') {
    return res.json({
      success: true,
      canPurchase: true,
      message: 'No active subscription'
    });
  }

  // Check if subscription is expired
  const now = new Date();
  if (subscription.dueDate && new Date(subscription.dueDate) < now) {
    return res.json({
      success: true,
      canPurchase: true,
      message: 'Subscription expired, can purchase new plan'
    });
  }

  // Same plan check
  if (subscription.planName === planName) {
    return res.json({
      success: false,
      canPurchase: false,
      reason: 'same_plan',
      message: `You already have an active ${planName} subscription valid until ${new Date(subscription.dueDate).toLocaleDateString('en-IN')}`,
      currentSubscription: {
        planName: subscription.planName,
        amount: subscription.amount,
        paidDate: subscription.paidDate,
        dueDate: subscription.dueDate,
        billingCycle: subscription.billingCycle
      }
    });
  }

  // Lower plan check (downgrade)
  if (Number(amount) < subscription.amount) {
    return res.json({
      success: false,
      canPurchase: false,
      reason: 'downgrade',
      message: `You have an active ${subscription.planName} plan (₹${subscription.amount}). You can only upgrade to a higher plan.`,
      currentSubscription: {
        planName: subscription.planName,
        amount: subscription.amount,
        paidDate: subscription.paidDate,
        dueDate: subscription.dueDate,
        billingCycle: subscription.billingCycle
      }
    });
  }

  // Can upgrade
  return res.json({
    success: true,
    canPurchase: true,
    reason: 'upgrade',
    message: `Upgrade from ${subscription.planName} to ${planName}`,
    currentSubscription: {
      planName: subscription.planName,
      amount: subscription.amount,
      paidDate: subscription.paidDate,
      dueDate: subscription.dueDate,
      billingCycle: subscription.billingCycle
    }
  });
});

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: 'user',
      select: 'fullName email avatar phone',
      options: { retainNullValues: true }
    })
    .populate('planId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Transform payments to handle null users
  const transformedPayments = payments.map(payment => ({
    ...payment,
    user: payment.user || { fullName: 'Deleted User', email: 'N/A' }
  }));

  res.json({
    success: true,
    count: transformedPayments.length,
    data: transformedPayments
  });
});

// @desc    Get payment stats (Admin)
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = asyncHandler(async (req, res) => {
  const totalPayments = await Payment.countDocuments();
  const completedPayments = await Payment.countDocuments({ status: 'completed' });
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Monthly revenue for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyRevenue = await Payment.aggregate([
    { 
      $match: { 
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo }
      } 
    },
    {
      $group: {
        _id: { 
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalPayments,
      completedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue
    }
  });
});

// @desc    Get Razorpay key (for frontend)
// @route   GET /api/payments/key
// @access  Public
const getKey = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  getKey,
  getAllPayments,
  getPaymentStats,
  checkSubscription,
};
