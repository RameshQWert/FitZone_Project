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
};
