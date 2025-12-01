import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineMail,
  HiOutlinePhone,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [saving, setSaving] = useState(false);

  const specializations = [
    'Strength Training',
    'Weight Training',
    'Yoga',
    'Pilates',
    'HIIT',
    'CrossFit',
    'Cardio',
    'Spinning',
    'Boxing',
    'MMA',
    'Nutrition',
    'Meditation',
    'Flexibility',
    'Rehabilitation',
  ];

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trainers?all=true');
      const data = response.data.data || response.data;
      setTrainers(data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const trainerName = trainer.name || trainer.fullName || '';
    const trainerEmail = trainer.email || '';
    const matchesSearch =
      trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      filterSpecialty === 'all' ||
      trainer.specializations?.includes(filterSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await api.delete(`/trainers/${id}`);
        setTrainers(trainers.filter((t) => t._id !== id));
        toast.success('Trainer deleted successfully');
      } catch (error) {
        toast.error('Failed to delete trainer');
      }
    }
  };

  const handleView = (trainer) => {
    setSelectedTrainer(trainer);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (trainer) => {
    setSelectedTrainer({ ...trainer });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedTrainer({
      name: '',
      email: '',
      phone: '',
      specializations: [],
      experience: 1,
      bio: '',
      hourlyRate: 50,
      rating: 5,
      isAvailable: true,
      image: '',
      achievements: [],
      socialMedia: {
        instagram: '',
        twitter: '',
        facebook: '',
      },
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const trainerData = {
        name: selectedTrainer.name || selectedTrainer.fullName,
        email: selectedTrainer.email,
        phone: selectedTrainer.phone,
        image: selectedTrainer.image || selectedTrainer.avatar,
        specializations: selectedTrainer.specializations || [],
        experience: selectedTrainer.experience || 1,
        bio: selectedTrainer.bio,
        hourlyRate: selectedTrainer.hourlyRate || 50,
        rating: selectedTrainer.rating || 4.5,
        achievements: selectedTrainer.achievements || [],
        socialMedia: selectedTrainer.socialMedia || {},
        isAvailable: selectedTrainer.isAvailable !== false,
      };

      if (modalMode === 'add') {
        const response = await api.post('/trainers', trainerData);
        const newTrainer = response.data.data || response.data;
        setTrainers([...trainers, newTrainer]);
        toast.success('Trainer added successfully');
      } else {
        const response = await api.put(`/trainers/${selectedTrainer._id}`, trainerData);
        const updatedTrainer = response.data.data || response.data;
        setTrainers(trainers.map((t) => (t._id === selectedTrainer._id ? updatedTrainer : t)));
        toast.success('Trainer updated successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || (modalMode === 'add' ? 'Failed to add trainer' : 'Failed to update trainer'));
    } finally {
      setSaving(false);
    }
  };

  const handleSpecializationToggle = (spec) => {
    const current = selectedTrainer.specializations || [];
    if (current.includes(spec)) {
      setSelectedTrainer({
        ...selectedTrainer,
        specializations: current.filter((s) => s !== spec),
      });
    } else {
      setSelectedTrainer({
        ...selectedTrainer,
        specializations: [...current, spec],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Trainers</h1>
          <p className="text-gray-400 mt-1">Manage your fitness trainers and their schedules</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="mr-2" size={20} />
          Add Trainer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search trainers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Specialties</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading trainers...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No trainers found</div>
        ) : (
          filteredTrainers.map((trainer) => (
            <motion.div
              key={trainer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden hover:border-dark-600 transition-colors"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
                <img
                  src={trainer.image || trainer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.name || trainer.fullName || 'Trainer')}&background=8b5cf6&color=fff&size=200`}
                  alt={trainer.name || trainer.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-dark-900/80 px-2 py-1 rounded-lg">
                  <HiOutlineStar className="text-yellow-400" size={16} />
                  <span className="text-white text-sm font-medium">{trainer.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{trainer.name || trainer.fullName}</h3>
                <p className="text-gray-400 text-sm mt-1">{trainer.specializations?.join(', ') || 'Trainer'}</p>
                <div className="flex items-center mt-3 text-sm text-gray-400">
                  <span>{trainer.experience || 0}+ years experience</span>
                  <span className="mx-2">•</span>
                  <span>${trainer.hourlyRate || 50}/hr</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trainer.isAvailable !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trainer.isAvailable !== false ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(trainer)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                    >
                      <HiOutlineEye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(trainer)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(trainer._id)}
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

      {/* Trainer Modal */}
      <AnimatePresence>
        {showModal && selectedTrainer && (
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
                  {modalMode === 'view' ? 'Trainer Details' : modalMode === 'edit' ? 'Edit Trainer' : 'Add Trainer'}
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
                {modalMode === 'view' ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedTrainer.image || selectedTrainer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTrainer.name || selectedTrainer.fullName || 'Trainer')}&background=8b5cf6&color=fff&size=100`}
                        alt={selectedTrainer.name || selectedTrainer.fullName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xl font-semibold text-white">{selectedTrainer.name || selectedTrainer.fullName}</h4>
                        <div className="flex items-center mt-1">
                          <HiOutlineStar className="text-yellow-400 mr-1" />
                          <span className="text-gray-300">{selectedTrainer.rating?.toFixed(1) || '5.0'} rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <HiOutlineMail className="text-gray-400" />
                        <span>{selectedTrainer.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <HiOutlinePhone className="text-gray-400" />
                        <span>{selectedTrainer.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Specializations</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrainer.specializations?.map((spec) => (
                          <span key={spec} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Bio</h5>
                      <p className="text-gray-300">{selectedTrainer.bio || 'No bio available.'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-1">Experience</h5>
                        <p className="text-white">{selectedTrainer.experience || 0}+ years</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-1">Hourly Rate</h5>
                        <p className="text-white">${selectedTrainer.hourlyRate || 50}/hr</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={selectedTrainer.name || selectedTrainer.fullName || ''}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, name: e.target.value })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          value={selectedTrainer.email || ''}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, email: e.target.value })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={selectedTrainer.phone || ''}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, phone: e.target.value })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                        <input
                          type="url"
                          value={selectedTrainer.avatar || ''}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, avatar: e.target.value })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Specializations</label>
                      <div className="flex flex-wrap gap-2">
                        {specializations.map((spec) => (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => handleSpecializationToggle(spec)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedTrainer.specializations?.includes(spec)
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        value={selectedTrainer.bio || ''}
                        onChange={(e) => setSelectedTrainer({ ...selectedTrainer, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="Tell us about this trainer..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          min="0"
                          value={selectedTrainer.experience || 0}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, experience: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={selectedTrainer.hourlyRate || 50}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, hourlyRate: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                        <select
                          value={selectedTrainer.isAvailable ? 'true' : 'false'}
                          onChange={(e) => setSelectedTrainer({ ...selectedTrainer, isAvailable: e.target.value === 'true' })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        >
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
                        </select>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-dark-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-xl hover:bg-dark-600 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Add Trainer' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTrainers;
