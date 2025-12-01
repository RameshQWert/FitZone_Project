import api from './api';

export const subscriptionService = {
  // Get all subscription plans
  getAll: async () => {
    const response = await api.get('/subscriptions');
    return response.data.data || response.data;
  },

  // Get subscription by ID
  getById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data.data || response.data;
  },

  // Create subscription (Admin only)
  create: async (subscriptionData) => {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },

  // Update subscription (Admin only)
  update: async (id, subscriptionData) => {
    const response = await api.put(`/subscriptions/${id}`, subscriptionData);
    return response.data;
  },

  // Delete subscription (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },
};

export default subscriptionService;
