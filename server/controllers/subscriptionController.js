const asyncHandler = require('express-async-handler');
const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Public
const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ isActive: true });

  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Public
const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (subscription) {
    res.json({
      success: true,
      data: subscription,
    });
  } else {
    res.status(404);
    throw new Error('Subscription not found');
  }
});

// @desc    Create subscription
// @route   POST /api/subscriptions
// @access  Private/Admin
const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.create(req.body);

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private/Admin
const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (subscription) {
    Object.assign(subscription, req.body);
    const updatedSubscription = await subscription.save();

    res.json({
      success: true,
      data: updatedSubscription,
    });
  } else {
    res.status(404);
    throw new Error('Subscription not found');
  }
});

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private/Admin
const deleteSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (subscription) {
    await Subscription.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: 'Subscription removed',
    });
  } else {
    res.status(404);
    throw new Error('Subscription not found');
  }
});

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
