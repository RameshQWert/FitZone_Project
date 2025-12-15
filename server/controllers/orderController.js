const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes, isFirstOrder, promoCode, promoDiscount, freeShipping } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Verify if this is truly the first order
  const existingOrders = await Order.countDocuments({ user: req.user._id });
  const isReallyFirstOrder = existingOrders === 0;

  // Validate promo code NEW10 - only for new users (first order)
  let validPromoDiscount = 0;
  let appliedPromoCode = null;
  
  if (promoCode === 'NEW10' && isReallyFirstOrder) {
    // Calculate 10% discount
    const itemsTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    validPromoDiscount = Math.round(itemsTotal * 0.10);
    appliedPromoCode = 'NEW10';
  }

  // Validate stock and prepare order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id || item.product);
    
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product "${item.name}" is no longer available`);
    }
    
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${item.name}"`);
    }

    orderItems.push({
      product: product._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      flavor: item.flavor
    });
  }

  // Calculate totals
  const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // First order gets free shipping, otherwise free shipping above ₹999
  const shippingCost = isReallyFirstOrder ? 0 : (itemsTotal >= 999 ? 0 : 49);
  
  const tax = Math.round(itemsTotal * 0.18); // 18% GST
  
  // Total discount includes promo code discount
  const totalDiscount = validPromoDiscount;
  
  const totalAmount = itemsTotal + shippingCost + tax - totalDiscount;

  // Create order
  const order = new Order({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingCost,
    discount: totalDiscount,
    couponCode: appliedPromoCode,
    tax,
    totalAmount,
    notes: isReallyFirstOrder ? `${notes || ''} [First Order - Free Shipping]`.trim() : notes,
    orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
  });

  // If Razorpay payment, create Razorpay order
  if (paymentMethod === 'razorpay') {
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          userId: req.user._id.toString()
        }
      });

      order.paymentDetails.razorpayOrderId = razorpayOrder.id;
      
      await order.save();

      // Don't clear cart yet - wait for payment confirmation

      return res.status(201).json({
        success: true,
        data: {
          order,
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
          },
          key: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      res.status(500);
      throw new Error('Failed to create payment order');
    }
  }

  // For COD orders
  await order.save();

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity }
    });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order }
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  // Update order
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
  order.paymentDetails.razorpaySignature = razorpay_signature;
  order.statusHistory.push({
    status: 'confirmed',
    note: 'Payment received'
  });

  await order.save();

  // Update product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity }
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalItems: 0, totalAmount: 0 }
  );

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: { order }
  });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { user: req.user._id };
  if (status) query.orderStatus = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name thumbnail slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order belongs to user or user is admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Order cannot be cancelled');
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  order.statusHistory.push({
    status: 'cancelled',
    note: reason || 'Cancelled by customer'
  });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity }
    });
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// ============ ADMIN ROUTES ============

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, search } = req.query;

  const query = {};
  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, estimatedDelivery } = req.body;
  
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  order.statusHistory.push({
    status,
    note: note || `Status updated to ${status}`
  });

  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();

  res.json({
    success: true,
    message: 'Order status updated',
    data: order
  });
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue,
    todayRevenue
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0
    }
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
};
