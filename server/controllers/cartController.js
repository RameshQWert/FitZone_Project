const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price thumbnail stock isActive');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Filter out invalid items (deleted products, etc.)
  const validItems = cart.items.filter(item => 
    item.product && item.product.isActive
  );

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  res.json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size, color, flavor } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if item already exists in cart (with same variants)
  const existingItemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId &&
    item.size === size &&
    item.color === color &&
    item.flavor === flavor
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      res.status(400);
      throw new Error('Cannot add more than available stock');
    }
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      name: product.name,
      price: product.price,
      image: product.thumbnail || product.images[0]?.url,
      quantity,
      size,
      color,
      flavor
    });
  }

  await cart.save();

  // Populate and return
  await cart.populate('items.product', 'name price thumbnail stock isActive');

  res.json({
    success: true,
    message: 'Item added to cart',
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Check stock
  const product = await Product.findById(item.product);
  if (product && quantity > product.stock) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  if (quantity <= 0) {
    cart.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name price thumbnail stock isActive');

  res.json({
    success: true,
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items.pull(itemId);
  await cart.save();
  await cart.populate('items.product', 'name price thumbnail stock isActive');

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({
    success: true,
    message: 'Cart cleared',
    data: cart
  });
});

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
const getCartCount = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  res.json({
    success: true,
    data: {
      count: cart ? cart.totalItems : 0
    }
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};
