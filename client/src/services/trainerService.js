import api from './api';

export const trainerService = {
  // Get all trainers
  getAll: async () => {
    const response = await api.get('/trainers');
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
    return response.data;
  },

  // Update trainer
  update: async (id, trainerData) => {
    const response = await api.put(`/trainers/${id}`, trainerData);
    return response.data;
  },

  // Delete trainer (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/trainers/${id}`);
    return response.data;
  },
};

export default trainerService;
