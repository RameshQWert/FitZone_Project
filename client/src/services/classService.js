import api from './api';

export const classService = {
  // Get all classes/programs
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data.data || response.data;
  },

  // Get class by ID
  getById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data.data || response.data;
  },

  // Create class (Admin only)
  create: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  // Update class (Admin only)
  update: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  // Delete class (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  // Enroll in class
  enroll: async (classId, memberId) => {
    const response = await api.post(`/classes/${classId}/enroll`, { memberId });
    return response.data;
  },

  // Unenroll from class
  unenroll: async (classId, memberId) => {
    const response = await api.post(`/classes/${classId}/unenroll`, { memberId });
    return response.data;
  },
};

export default classService;
