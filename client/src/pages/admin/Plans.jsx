import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineStar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [saving, setSaving] = useState(false);

  const defaultFeatures = [
    'Gym Access',
    'Cardio Equipment',
    'Locker Room',
    'Free WiFi',
    'Fitness Assessment',
    'Group Classes',
    'Personal Training',
    'Swimming Pool',
    'Spa & Sauna',
    'Nutrition Consultation',
  ];

  const colorOptions = [
    { name: 'Blue', value: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Purple', value: 'purple', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Green', value: 'green', gradient: 'from-green-500 to-green-600' },
    { name: 'Orange', value: 'orange', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Primary', value: 'primary', gradient: 'from-primary-500 to-secondary-500' },
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPlan({
      name: '',
      description: '',
      price: 999,
      duration: 1,
      features: [],
      color: 'blue',
      isPopular: false,
      isActive: true,
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan({ ...plan });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedPlan.name || !selectedPlan.price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      
      const planData = {
        name: selectedPlan.name,
        description: selectedPlan.description || '',
        price: Number(selectedPlan.price),
        duration: Number(selectedPlan.duration) || 1,
        features: selectedPlan.features || [],
        color: selectedPlan.color || 'blue',
        isPopular: Boolean(selectedPlan.isPopular),
        isActive: selectedPlan.isActive !== false,
      };

      if (modalMode === 'add') {
        const response = await api.post('/subscriptions', planData);
        const newPlan = response.data.data || response.data;
        setPlans([...plans, newPlan]);
        toast.success('Plan added successfully');
      } else {
        const response = await api.put(`/subscriptions/${selectedPlan._id}`, planData);
        const updatedPlan = response.data.data || response.data;
        setPlans(plans.map((p) => (p._id === selectedPlan._id ? updatedPlan : p)));
        toast.success('Plan updated successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      await api.delete(`/subscriptions/${id}`);
      setPlans(plans.filter((p) => p._id !== id));
      toast.success('Plan deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete plan');
    }
  };

  const handleFeatureToggle = (feature) => {
    const current = selectedPlan.features || [];
    if (current.includes(feature)) {
      setSelectedPlan({
        ...selectedPlan,
        features: current.filter((f) => f !== feature),
      });
    } else {
      setSelectedPlan({
        ...selectedPlan,
        features: [...current, feature],
      });
    }
  };

  const getColorGradient = (color) => {
    const option = colorOptions.find((c) => c.value === color);
    return option ? option.gradient : 'from-blue-500 to-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
          <p className="text-gray-400 mt-1">Manage your membership plans</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No plans yet. Add your first plan!</p>
          </div>
        ) : (
          plans.map((plan) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700"
            >
              {/* Card Header */}
              <div className={`p-6 bg-gradient-to-r ${getColorGradient(plan.color)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-white/80 text-sm mt-1">{plan.description || 'Membership plan'}</p>
                  </div>
                  {plan.isPopular && (
                    <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                      <HiOutlineStar className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                  <span className="text-white/70">/{plan.duration === 1 ? 'month' : `${plan.duration} months`}</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {(plan.features || []).slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                      <HiOutlineCheck className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {(plan.features || []).length > 5 && (
                    <li className="text-gray-500 text-sm">+{plan.features.length - 5} more features</li>
                  )}
                </ul>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-dark-700">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'add' ? 'Add New Plan' : 'Edit Plan'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-dark-700 rounded-lg text-gray-400"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name *</label>
                    <input
                      type="text"
                      value={selectedPlan?.name || ''}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="e.g., Basic Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedPlan?.price || ''}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, price: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={selectedPlan?.description || ''}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    rows="2"
                    placeholder="Brief description of the plan"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (months)</label>
                    <select
                      value={selectedPlan?.duration || 1}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color Theme</label>
                    <select
                      value={selectedPlan?.color || 'blue'}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, color: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      {colorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Features</label>
                  <div className="grid grid-cols-2 gap-2">
                    {defaultFeatures.map((feature) => (
                      <label
                        key={feature}
                        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                          (selectedPlan?.features || []).includes(feature)
                            ? 'bg-primary-500/20 border border-primary-500'
                            : 'bg-dark-700 border border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={(selectedPlan?.features || []).includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="hidden"
                        />
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            (selectedPlan?.features || []).includes(feature)
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-600'
                          }`}
                        >
                          {(selectedPlan?.features || []).includes(feature) && (
                            <HiOutlineCheck className="w-3 h-3" />
                          )}
                        </span>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlan?.isPopular || false}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, isPopular: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Mark as Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlan?.isActive !== false}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, isActive: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-dark-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Add Plan' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPlans;
