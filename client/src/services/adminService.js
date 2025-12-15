import api from './api';

// ============ MEMBERS ============
export const getMembers = async () => {
  const response = await api.get('/members');
  return response.data.data || response.data;
};

export const getMemberById = async (id) => {
  const response = await api.get(`/members/${id}`);
  return response.data.data || response.data;
};

export const createMember = async (memberData) => {
  const response = await api.post('/auth/register', {
    ...memberData,
    role: 'member',
  });
  return response.data.data || response.data;
};

export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data.data || response.data;
};

export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

// ============ TRAINERS ============
export const getTrainers = async (includeAll = false) => {
  const response = await api.get('/trainers');
  return response.data.data || response.data;
};

export const getTrainerById = async (id) => {
  const response = await api.get(`/trainers/${id}`);
  return response.data.data || response.data;
};

export const createTrainer = async (trainerData) => {
  const response = await api.post('/trainers', trainerData);
  return response.data.data || response.data;
};

export const updateTrainer = async (id, trainerData) => {
  const response = await api.put(`/trainers/${id}`, trainerData);
  return response.data.data || response.data;
};

export const deleteTrainer = async (id) => {
  const response = await api.delete(`/trainers/${id}`);
  return response.data;
};

// ============ CLASSES ============
export const getClasses = async () => {
  const response = await api.get('/classes');
  return response.data.data || response.data;
};

export const getClassById = async (id) => {
  const response = await api.get(`/classes/${id}`);
  return response.data.data || response.data;
};

export const createClass = async (classData) => {
  const response = await api.post('/classes', classData);
  return response.data.data || response.data;
};

export const updateClass = async (id, classData) => {
  const response = await api.put(`/classes/${id}`, classData);
  return response.data.data || response.data;
};

export const deleteClass = async (id) => {
  const response = await api.delete(`/classes/${id}`);
  return response.data;
};

// ============ PLANS (Subscriptions) ============
export const getPlans = async () => {
  const response = await api.get('/subscriptions');
  return response.data.data || response.data;
};

export const getPlanById = async (id) => {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data.data || response.data;
};

export const createPlan = async (planData) => {
  const response = await api.post('/subscriptions', planData);
  return response.data.data || response.data;
};

export const updatePlan = async (id, planData) => {
  const response = await api.put(`/subscriptions/${id}`, planData);
  return response.data.data || response.data;
};

export const deletePlan = async (id) => {
  const response = await api.delete(`/subscriptions/${id}`);
  return response.data;
};

// ============ USERS ============
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data || response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data || response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data.data || response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// ============ DASHBOARD STATS ============
export const getDashboardStats = async () => {
  // Fetch all data for dashboard
  const [members, trainers, classes, plans] = await Promise.all([
    api.get('/users').catch(() => ({ data: { data: [] } })),
    api.get('/trainers').catch(() => ({ data: { data: [] } })),
    api.get('/classes').catch(() => ({ data: { data: [] } })),
    api.get('/subscriptions').catch(() => ({ data: { data: [] } })),
  ]);

  return {
    totalMembers: (members.data.data || members.data || []).length,
    totalTrainers: (trainers.data.data || trainers.data || []).length,
    totalClasses: (classes.data.data || classes.data || []).length,
    totalPlans: (plans.data.data || plans.data || []).length,
  };
};

// ============ STORE PRODUCTS ============
export const getStoreProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  // Use admin endpoint to see ALL products (including inactive ones)
  const response = await api.get(`/products/admin/all${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export const getStoreProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data || response.data;
};

export const createStoreProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data.data || response.data;
};

export const updateStoreProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data.data || response.data;
};

export const deleteStoreProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const toggleProductStatus = async (id) => {
  const response = await api.patch(`/products/${id}/toggle-status`);
  return response.data.data || response.data;
};

export const updateProductStock = async (id, stock) => {
  const response = await api.patch(`/products/${id}/stock`, { stock });
  return response.data.data || response.data;
};

// ============ STORE ORDERS ============
export const getStoreOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/orders/admin/all${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export const getStoreOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data.data || response.data;
};

export const updateOrderStatus = async (id, statusData) => {
  const response = await api.put(`/orders/${id}/status`, statusData);
  return response.data;
};

// ============ STORE DASHBOARD STATS ============
export const getStoreDashboardStats = async () => {
  try {
    const [productsRes, ordersRes] = await Promise.all([
      api.get('/products').catch(() => ({ data: { data: [] } })),
      api.get('/orders/admin/all').catch(() => ({ data: { data: [] } })),
    ]);

    const products = productsRes.data.data || productsRes.data || [];
    const orders = ordersRes.data.data || ordersRes.data || [];

    // Calculate stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStockProducts = products.filter(p => p.stock <= 10);
    const outOfStock = products.filter(p => p.stock === 0).length;

    // Order stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'processing').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    
    // Revenue calculation
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Best selling products (from orders)
    const productSales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productId = item.product?._id || item.product;
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                product: item.product,
                name: item.name,
                totalQuantity: 0,
                totalRevenue: 0
              };
            }
            productSales[productId].totalQuantity += item.quantity || 0;
            productSales[productId].totalRevenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Category-wise sales
    const categorySales = {};
    products.forEach(product => {
      if (!categorySales[product.category]) {
        categorySales[product.category] = { count: 0, revenue: 0 };
      }
      categorySales[product.category].count++;
    });

    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const product = products.find(p => p._id === (item.product?._id || item.product));
          if (product && categorySales[product.category]) {
            categorySales[product.category].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    // Recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Revenue by date (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayRevenue = orders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= date && orderDate < nextDate && o.paymentStatus === 'completed';
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayRevenue
      });
    }

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      bestSellers,
      categorySales,
      recentOrders,
      revenueByDate: last7Days
    };
  } catch (error) {
    console.error('Error fetching store dashboard stats:', error);
    throw error;
  }
};

// ============ IMAGE UPLOAD ============
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload multiple product images
export const uploadProductImages = async (formData) => {
  const response = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Alias for store dashboard
export const getStoreDashboard = getStoreDashboardStats;

export default {
  // Members
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  // Trainers
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  // Classes
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  // Plans
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  // Users
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Dashboard
  getDashboardStats,
  // Store Products
  getStoreProducts,
  getStoreProductById,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  toggleProductStatus,
  updateProductStock,
  // Store Orders
  getStoreOrders,
  getStoreOrderById,
  updateOrderStatus,
  // Store Dashboard
  getStoreDashboardStats,
  getStoreDashboard,
  // Upload
  uploadImage,
  uploadProductImages,
};
