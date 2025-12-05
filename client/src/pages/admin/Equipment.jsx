import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineCog,
  HiOutlineRefresh,
  HiOutlineCube,
  HiOutlineHeart,
  HiOutlineLightningBolt,
  HiOutlineCollection,
  HiOutlineColorSwatch,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [saving, setSaving] = useState(false);

  const categories = ['Cardio', 'Strength', 'Free Weights', 'Machines', 'Accessories', 'Other'];
  const statuses = [
    { value: 'available', label: 'Available', color: 'green' },
    { value: 'in_use', label: 'In Use', color: 'blue' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
    { value: 'out_of_order', label: 'Out of Order', color: 'red' },
  ];

  const locations = [
    'Main Gym Floor',
    'Cardio Zone',
    'Strength Area',
    'Free Weights Section',
    'Functional Training Zone',
    'Studio A',
    'Studio B',
    'Swimming Pool Area',
    'Outdoor Area',
    'Storage Room',
  ];

  const categoryIcons = {
    'Cardio': HiOutlineHeart,
    'Strength': HiOutlineLightningBolt,
    'Free Weights': HiOutlineCube,
    'Machines': HiOutlineCog,
    'Accessories': HiOutlineColorSwatch,
    'Other': HiOutlineCollection,
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get('/equipment');
      setEquipment(response.data.data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEquipment({
      name: '',
      category: 'Cardio',
      description: '',
      quantity: 1,
      status: 'available',
      location: 'Main Gym Floor',
      purchaseDate: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      image: '',
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedEquipment({
      ...item,
      purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
      lastMaintenanceDate: item.lastMaintenanceDate ? item.lastMaintenanceDate.split('T')[0] : '',
      nextMaintenanceDate: item.nextMaintenanceDate ? item.nextMaintenanceDate.split('T')[0] : '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedEquipment.name || !selectedEquipment.location) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSaving(true);

      const equipmentData = {
        name: selectedEquipment.name,
        category: selectedEquipment.category,
        description: selectedEquipment.description || '',
        quantity: Number(selectedEquipment.quantity) || 1,
        status: selectedEquipment.status,
        location: selectedEquipment.location,
        purchaseDate: selectedEquipment.purchaseDate || null,
        lastMaintenanceDate: selectedEquipment.lastMaintenanceDate || null,
        nextMaintenanceDate: selectedEquipment.nextMaintenanceDate || null,
        image: selectedEquipment.image || '',
      };

      if (modalMode === 'add') {
        const response = await api.post('/equipment', equipmentData);
        const newEquipment = response.data.data || response.data;
        setEquipment([...equipment, newEquipment]);
        toast.success('Equipment added successfully');
      } else {
        const response = await api.put(`/equipment/${selectedEquipment._id}`, equipmentData);
        const updatedEquipment = response.data.data || response.data;
        setEquipment(equipment.map((e) => (e._id === selectedEquipment._id ? updatedEquipment : e)));
        toast.success('Equipment updated successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await api.delete(`/equipment/${id}`);
      setEquipment(equipment.filter((e) => e._id !== id));
      toast.success('Equipment deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete equipment');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/equipment/${id}`, { status: newStatus });
      const updatedEquipment = response.data.data || response.data;
      setEquipment(equipment.map((e) => (e._id === id ? updatedEquipment : e)));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getStatusBadgeClasses = (status) => {
    const colors = {
      available: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_use: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      out_of_order: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const stats = {
    total: equipment.length,
    available: equipment.filter((e) => e.status === 'available').length,
    maintenance: equipment.filter((e) => e.status === 'maintenance').length,
    outOfOrder: equipment.filter((e) => e.status === 'out_of_order').length,
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HiOutlineCube className="text-primary-500" />
            Equipment Management
          </h1>
          <p className="text-gray-400 mt-1">Manage gym equipment inventory and maintenance</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Equipment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Equipment</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineCube className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Available</p>
              <p className="text-2xl font-bold text-green-400">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineCheck className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineCog className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Out of Order</p>
              <p className="text-2xl font-bold text-red-400">{stats.outOfOrder}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineExclamation className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-xl p-4 mb-6 border border-dark-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <button
              onClick={fetchEquipment}
              className="p-2 bg-dark-700 border border-dark-600 rounded-xl text-gray-400 hover:text-white hover:border-primary-500 transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <HiOutlineCube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No equipment found</p>
            <p className="text-gray-500 text-sm">Add your first equipment or adjust your filters</p>
          </div>
        ) : (
          filteredEquipment.map((item) => {
            const CategoryIcon = categoryIcons[item.category] || HiOutlineCube;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700 hover:border-dark-600 transition-colors"
              >
                {/* Image/Icon Header */}
                <div className="h-40 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CategoryIcon className="w-20 h-20 text-gray-600" />
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClasses(item.status)}`}>
                    {statuses.find((s) => s.value === item.status)?.label || item.status}
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-dark-900/80 rounded-full text-xs font-medium text-gray-300">
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.description || 'No description provided'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-300">{item.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="text-gray-300">{item.quantity}</span>
                    </div>
                    {item.nextMaintenanceDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Next Maintenance:</span>
                        <span className={`${new Date(item.nextMaintenanceDate) < new Date() ? 'text-red-400' : 'text-gray-300'}`}>
                          {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Status Change */}
                  <div className="mb-4">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium border ${getStatusBadgeClasses(item.status)} bg-transparent focus:outline-none cursor-pointer`}
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value} className="bg-dark-800">
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiOutlineCube className="text-primary-500" />
                  {modalMode === 'add' ? 'Add New Equipment' : 'Edit Equipment'}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Equipment Name *</label>
                    <input
                      type="text"
                      value={selectedEquipment?.name || ''}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, name: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="e.g., Treadmill"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      value={selectedEquipment?.category || 'Cardio'}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, category: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={selectedEquipment?.description || ''}
                    onChange={(e) => setSelectedEquipment({ ...selectedEquipment, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    rows="2"
                    placeholder="Brief description of the equipment"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedEquipment?.quantity || 1}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, quantity: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={selectedEquipment?.status || 'available'}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, status: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                    <select
                      value={selectedEquipment?.location || 'Main Gym Floor'}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, location: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Date</label>
                    <input
                      type="date"
                      value={selectedEquipment?.purchaseDate || ''}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, purchaseDate: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Maintenance</label>
                    <input
                      type="date"
                      value={selectedEquipment?.lastMaintenanceDate || ''}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, lastMaintenanceDate: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Next Maintenance</label>
                    <input
                      type="date"
                      value={selectedEquipment?.nextMaintenanceDate || ''}
                      onChange={(e) => setSelectedEquipment({ ...selectedEquipment, nextMaintenanceDate: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    value={selectedEquipment?.image || ''}
                    onChange={(e) => setSelectedEquipment({ ...selectedEquipment, image: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
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
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Add Equipment' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEquipment;
