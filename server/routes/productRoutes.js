const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin routes - MUST come before dynamic :slug route
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);
router.get('/admin/low-stock', protect, authorize('admin'), getLowStockProducts);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleProductStatus);
router.patch('/:id/stock', protect, authorize('admin'), updateProductStock);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/id/:id', getProductById);

// Protected routes
router.post('/:id/reviews', protect, addProductReview);

// Dynamic slug route - MUST be LAST as it catches everything
router.get('/:slug', getProductBySlug);

module.exports = router;
