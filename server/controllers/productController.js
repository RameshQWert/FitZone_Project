const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
    page = 1,
    limit = 12,
    featured,
    inStock
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (subcategory) {
    query.subcategory = subcategory;
  }

  if (brand) {
    query.brand = { $in: brand.split(',') };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Build sort
  let sortOptions = {};
  switch (sort) {
    case 'price_low':
      sortOptions = { price: 1 };
      break;
    case 'price_high':
      sortOptions = { price: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'popular':
      sortOptions = { soldCount: -1 };
      break;
    case 'rating':
      sortOptions = { 'ratings.average': -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-reviews'),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total
    }
  });
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ 
    slug: req.params.slug,
    isActive: true 
  }).populate('reviews.user', 'fullName avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    data: product
  });
});

// @desc    Get product by ID
// @route   GET /api/products/id/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'fullName avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    data: product
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  
  const products = await Product.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-reviews');

  res.json({
    success: true,
    data: products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 12;

  const products = await Product.find({ 
    category,
    isActive: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-reviews');

  res.json({
    success: true,
    data: products
  });
});

// @desc    Get all categories with count
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { 
      $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      } 
    },
    { $sort: { count: -1 } }
  ]);

  const categoryInfo = {
    supplements: {
      name: 'Supplements',
      description: 'Protein, Pre-workout, Vitamins & more',
      icon: '💊',
      image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400'
    },
    clothing: {
      name: 'Clothing',
      description: 'T-shirts, Shorts, Shoes & Activewear',
      icon: '👕',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400'
    },
    equipment: {
      name: 'Equipment',
      description: 'Dumbbells, Bands, Mats & Machines',
      icon: '🏋️',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'
    },
    accessories: {
      name: 'Accessories',
      description: 'Gloves, Shakers, Belts & Bags',
      icon: '🧤',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    }
  };

  const result = categories.map(cat => ({
    ...categoryInfo[cat._id],
    slug: cat._id,
    count: cat.count,
    minPrice: cat.minPrice,
    maxPrice: cat.maxPrice
  }));

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const match = { isActive: true };
  if (category) match.category = category;

  const brands = await Product.aggregate([
    { $match: match },
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $match: { _id: { $ne: null } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: brands.map(b => ({ name: b._id, count: b.count }))
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);

  // Update average rating
  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.ratings.average = totalRating / product.reviews.length;
  product.ratings.count = product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully'
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } }
    ]
  })
    .limit(parseInt(limit))
    .select('name slug thumbnail price category');

  res.json({
    success: true,
    data: products
  });
});

// ============ ADMIN ROUTES ============

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    // Log incoming data for debugging
    console.log('Creating product with data:', JSON.stringify(req.body, null, 2));
    
    // Generate slug if not provided
    if (!req.body.slug && req.body.name) {
      req.body.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }
    
    // Set thumbnail from first image if not provided
    if (!req.body.thumbnail && req.body.images && req.body.images.length > 0) {
      req.body.thumbnail = req.body.images[0].url;
    }
    
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get all products (Admin - includes inactive)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search, isActive } = req.query;

  const query = {};
  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-reviews'),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle-status
// @access  Private/Admin
const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isActive = !product.isActive;
  await product.save();

  res.json({
    success: true,
    data: product,
    message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
const updateProductStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    res.status(400);
    throw new Error('Please provide a valid stock value');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.stock = stock;
  await product.save();

  res.json({
    success: true,
    data: product,
    message: 'Stock updated successfully'
  });
});

// @desc    Get low stock products
// @route   GET /api/products/admin/low-stock
// @access  Private/Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;

  const products = await Product.find({
    stock: { $lte: threshold }
  })
    .sort({ stock: 1 })
    .select('name sku stock thumbnail category');

  res.json({
    success: true,
    data: products
  });
});

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  getBrands,
  addProductReview,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  toggleProductStatus,
  updateProductStock,
  getLowStockProducts
};
