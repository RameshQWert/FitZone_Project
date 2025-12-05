import api, { cachedGet, clearCache } from './api';

export const trainerService = {
  // Get all trainers (with caching)
  getAll: async () => {
    const response = await cachedGet('/trainers');
    return response.data.data || response.data;
  },

  // Get trainer by ID
  getById: async (id) => {
    const response = await api.get(`/trainers/${id}`);
    return response.data.data || response.data;
  },

  // Create trainer (Admin only)
  create: async (trainerData) => {
    const response = await api.post('/trainers', trainerData);
    clearCache('/trainers'); // Clear cache on create
    return response.data;
  },

  // Update trainer
  update: async (id, trainerData) => {
    const response = await api.put(`/trainers/${id}`, trainerData);
    clearCache('/trainers'); // Clear cache on update
    return response.data;
  },

  // Delete trainer (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/trainers/${id}`);
    clearCache('/trainers'); // Clear cache on delete
    return response.data;
  },
};

export default trainerService;
