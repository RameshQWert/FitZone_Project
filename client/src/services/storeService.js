import api from './api';

export const storeService = {
  // ============ PRODUCTS ============
  
  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product by slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/id/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category, limit = 12) => {
    const response = await api.get(`/products/category/${category}`, { params: { limit } });
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get brands
  getBrands: async (category) => {
    const response = await api.get('/products/brands', { params: { category } });
    return response.data;
  },

  // Search products
  searchProducts: async (query, limit = 10) => {
    const response = await api.get('/products/search', { params: { q: query, limit } });
    return response.data;
  },

  // Add review
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // ============ CART ============

  // Get cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Get cart count
  getCartCount: async () => {
    const response = await api.get('/cart/count');
    return response.data;
  },

  // Add to cart
  addToCart: async (productId, quantity = 1, options = {}) => {
    const response = await api.post('/cart/add', {
      productId,
      quantity,
      ...options
    });
    return response.data;
  },

  // Update cart item
  updateCartItem: async (itemId, quantity) => {
    const response = await api.put('/cart/update', { itemId, quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // ============ ORDERS ============

  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/orders/verify-payment', paymentData);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  }
};

export default storeService;
