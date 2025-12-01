import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
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
    'Guest Passes',
    'Nutrition Consultation',
    'Mobile App Access',
  ];

  const colorOptions = [
    { name: 'Blue', value: 'from-blue-500 to-blue-600' },
    { name: 'Purple', value: 'from-purple-500 to-purple-600' },
    { name: 'Green', value: 'from-green-500 to-green-600' },
    { name: 'Orange', value: 'from-orange-500 to-orange-600' },
    { name: 'Pink', value: 'from-pink-500 to-pink-600' },
    { name: 'Primary', value: 'from-primary-500 to-secondary-500' },
  ];

  const iconOptions = ['🌱', '⭐', '👑', '💪', '🔥', '💎', '🚀', '🎯'];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      const data = response.data.data || response.data;
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/subscriptions/${id}`);
        setPlans(plans.filter((p) => p._id !== id));
        toast.success('Plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan({ ...plan });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedPlan({
      name: '',
      description: '',
      price: 29,
      displayPrice: '$29',
      period: 'month',
      duration: 30,
      features: [],
      color: 'from-blue-500 to-blue-600',
      icon: '🌱',
      popular: false,
      isActive: true,
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare plan data
      const planData = {
        name: selectedPlan.name,
        description: selectedPlan.description,
        price: selectedPlan.price || 29,
        displayPrice: selectedPlan.displayPrice || `$${selectedPlan.price}`,
        period: selectedPlan.period || 'month',
        duration: selectedPlan.duration || 30,
        features: selectedPlan.features || [],
        color: selectedPlan.color || 'from-blue-500 to-blue-600',
        icon: selectedPlan.icon || '🌱',
        popular: selectedPlan.popular || false,
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
      toast.error(error.response?.data?.message || (modalMode === 'add' ? 'Failed to add plan' : 'Failed to update plan'));
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Membership Plans</h1>
          <p className="text-gray-400 mt-1">Manage your subscription plans and pricing</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="mr-2" size={20} />
          Add Plan
        </button>
      </div>

      {/* Search */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No plans found</div>
        ) : (
          filteredPlans.map((plan) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-dark-800 rounded-2xl border overflow-hidden ${
                plan.popular ? 'border-primary-500' : 'border-dark-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  POPULAR
                </div>
              )}
              
              <div className={`h-2 bg-gradient-to-r ${plan.color || 'from-blue-500 to-blue-600'}`} />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{plan.icon || '💪'}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description || 'Membership plan'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/{plan.period || 'month'}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {(plan.features || []).slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <HiOutlineCheck className="text-green-400 mr-2 flex-shrink-0" size={18} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {(plan.features || []).length > 5 && (
                    <p className="text-gray-400 text-sm">+{plan.features.length - 5} more features</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plan.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {plan.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {showModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 rounded-2xl w-full max-w-2xl border border-dark-700 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
                <h3 className="text-lg font-semibold text-white">
                  {modalMode === 'edit' ? 'Edit Plan' : 'Add Plan'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-dark-700 text-gray-400"
                >
                  <HiOutlineX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name *</label>
                      <input
                        type="text"
                        value={selectedPlan.name}
                        onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., Premium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setSelectedPlan({ ...selectedPlan, icon })}
                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                              selectedPlan.icon === icon
                                ? 'bg-primary-500 ring-2 ring-primary-400'
                                : 'bg-dark-700 hover:bg-dark-600'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={selectedPlan.description || ''}
                      onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="Brief description of the plan"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price ($) *</label>
                      <input
                        type="number"
                        min="0"
                        value={selectedPlan.price}
                        onChange={(e) => setSelectedPlan({ ...selectedPlan, price: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
                      <select
                        value={selectedPlan.period || 'month'}
                        onChange={(e) => setSelectedPlan({ ...selectedPlan, period: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                        <option value="week">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={selectedPlan.duration || 30}
                        onChange={(e) => setSelectedPlan({ ...selectedPlan, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color Theme</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedPlan({ ...selectedPlan, color: color.value })}
                          className={`px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r ${color.value} ${
                            selectedPlan.color === color.value ? 'ring-2 ring-white' : ''
                          }`}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {defaultFeatures.map((feature) => (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
                          className={`px-3 py-2 rounded-lg text-sm text-left flex items-center transition-colors ${
                            selectedPlan.features?.includes(feature)
                              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                              : 'bg-dark-700 text-gray-400 border border-dark-600 hover:border-dark-500'
                          }`}
                        >
                          <HiOutlineCheck className={`mr-2 flex-shrink-0 ${
                            selectedPlan.features?.includes(feature) ? 'text-primary-400' : 'text-gray-600'
                          }`} size={16} />
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPlan.popular || false}
                        onChange={(e) => setSelectedPlan({ ...selectedPlan, popular: e.target.checked })}
                        className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-300">Mark as Popular</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPlan.isActive !== false}
                        onChange={(e) => setSelectedPlan({ ...selectedPlan, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-300">Active</span>
                    </label>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-dark-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-xl hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
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
