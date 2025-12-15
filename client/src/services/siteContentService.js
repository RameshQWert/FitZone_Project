import api from './api';

// ============ TESTIMONIALS ============
export const getTestimonials = async () => {
  const response = await api.get('/site-content/testimonials');
  return response.data.data || response.data;
};

export const getTestimonialById = async (id) => {
  const response = await api.get(`/site-content/testimonials/${id}`);
  return response.data.data || response.data;
};

export const createTestimonial = async (data) => {
  const response = await api.post('/site-content/testimonials', data);
  return response.data.data || response.data;
};

export const updateTestimonial = async (id, data) => {
  const response = await api.put(`/site-content/testimonials/${id}`, data);
  return response.data.data || response.data;
};

export const deleteTestimonial = async (id) => {
  const response = await api.delete(`/site-content/testimonials/${id}`);
  return response.data;
};

// ============ TEAM MEMBERS ============
export const getTeamMembers = async () => {
  const response = await api.get('/site-content/team');
  return response.data.data || response.data;
};

export const getTeamMemberById = async (id) => {
  const response = await api.get(`/site-content/team/${id}`);
  return response.data.data || response.data;
};

export const createTeamMember = async (data) => {
  const response = await api.post('/site-content/team', data);
  return response.data.data || response.data;
};

export const updateTeamMember = async (id, data) => {
  const response = await api.put(`/site-content/team/${id}`, data);
  return response.data.data || response.data;
};

export const deleteTeamMember = async (id) => {
  const response = await api.delete(`/site-content/team/${id}`);
  return response.data;
};

export default {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
