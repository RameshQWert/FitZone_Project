import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineCalendar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [saving, setSaving] = useState(false);

  const classTypes = [
    'strength',
    'cardio',
    'yoga',
    'pilates',
    'hiit',
    'crossfit',
    'swimming',
    'cycling',
    'boxing',
    'dance',
    'other',
  ];

  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, trainersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/trainers?all=true'),
      ]);
      setClasses(classesRes.data.data || classesRes.data);
      setTrainers(trainersRes.data.data || trainersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cls.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/classes/${id}`);
        setClasses(classes.filter((c) => c._id !== id));
        toast.success('Class deleted successfully');
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  const handleEdit = (cls) => {
    setSelectedClass({ ...cls });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedClass({
      name: '',
      type: 'strength',
      description: '',
      shortDescription: '',
      duration: 60,
      capacity: 20,
      difficulty: 'All Levels',
      trainer: '',
      schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:00' }],
      image: '',
      icon: '💪',
      color: 'from-blue-500 to-blue-600',
      benefits: [],
      featured: false,
      isActive: true,
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare class data
      const classData = {
        name: selectedClass.name,
        type: selectedClass.type,
        description: selectedClass.description,
        shortDescription: selectedClass.shortDescription,
        duration: selectedClass.duration || 60,
        capacity: selectedClass.capacity || 20,
        difficulty: selectedClass.difficulty || 'All Levels',
        trainer: selectedClass.trainer || undefined,
        schedule: selectedClass.schedule || [],
        image: selectedClass.image,
        icon: selectedClass.icon || '💪',
        color: selectedClass.color || 'from-blue-500 to-blue-600',
        benefits: selectedClass.benefits || [],
        featured: selectedClass.featured || false,
        isActive: selectedClass.isActive !== false,
      };
      
      if (modalMode === 'add') {
        const response = await api.post('/classes', classData);
        const newClass = response.data.data || response.data;
        setClasses([...classes, newClass]);
        toast.success('Class added successfully');
      } else {
        const response = await api.put(`/classes/${selectedClass._id}`, classData);
        const updatedClass = response.data.data || response.data;
        setClasses(classes.map((c) => (c._id === selectedClass._id ? updatedClass : c)));
        toast.success('Class updated successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || (modalMode === 'add' ? 'Failed to add class' : 'Failed to update class'));
    } finally {
      setSaving(false);
    }
  };

  const addScheduleSlot = () => {
    setSelectedClass({
      ...selectedClass,
      schedule: [...(selectedClass.schedule || []), { day: 'Monday', startTime: '09:00', endTime: '10:00' }],
    });
  };

  const removeScheduleSlot = (index) => {
    setSelectedClass({
      ...selectedClass,
      schedule: selectedClass.schedule.filter((_, i) => i !== index),
    });
  };

  const updateScheduleSlot = (index, field, value) => {
    const newSchedule = [...selectedClass.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSelectedClass({ ...selectedClass, schedule: newSchedule });
  };

  const getTypeIcon = (type) => {
    const icons = {
      strength: '🏋️',
      cardio: '❤️',
      yoga: '🧘',
      pilates: '🎯',
      hiit: '🔥',
      crossfit: '🏆',
      swimming: '🏊',
      cycling: '🚴',
      boxing: '🥊',
      dance: '💃',
      other: '💪',
    };
    return icons[type] || '💪';
  };

  const getTypeColor = (type) => {
    const colors = {
      strength: 'bg-blue-500/20 text-blue-400',
      cardio: 'bg-red-500/20 text-red-400',
      yoga: 'bg-green-500/20 text-green-400',
      pilates: 'bg-purple-500/20 text-purple-400',
      hiit: 'bg-orange-500/20 text-orange-400',
      crossfit: 'bg-yellow-500/20 text-yellow-400',
      swimming: 'bg-cyan-500/20 text-cyan-400',
      cycling: 'bg-pink-500/20 text-pink-400',
      boxing: 'bg-red-500/20 text-red-400',
      dance: 'bg-fuchsia-500/20 text-fuchsia-400',
      other: 'bg-gray-500/20 text-gray-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Classes</h1>
          <p className="text-gray-400 mt-1">Manage fitness classes and schedules</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="mr-2" size={20} />
          Add Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Types</option>
            {classTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700/50">
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Class</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Type</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Trainer</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Schedule</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Capacity</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Loading classes...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No classes found
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{cls.icon || getTypeIcon(cls.type)}</span>
                        <div>
                          <p className="text-white font-medium">{cls.name}</p>
                          <p className="text-gray-400 text-sm">{cls.duration || 60} min • {cls.difficulty || 'All Levels'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(cls.type)}`}>
                        {cls.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {cls.trainer?.fullName || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {cls.schedule?.length > 0 ? (
                          <>
                            <p>{cls.schedule[0].day}</p>
                            <p className="text-gray-400">{cls.schedule[0].startTime} - {cls.schedule[0].endTime}</p>
                          </>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-300">
                        <HiOutlineUsers className="mr-2 text-gray-400" size={16} />
                        {cls.capacity || 20}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cls.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {cls.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <HiOutlinePencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cls._id)}
                          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Modal */}
      <AnimatePresence>
        {showModal && selectedClass && (
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
                  {modalMode === 'edit' ? 'Edit Class' : 'Add Class'}
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">Class Name *</label>
                      <input
                        type="text"
                        value={selectedClass.name}
                        onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., Morning Yoga"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                      <select
                        value={selectedClass.type}
                        onChange={(e) => setSelectedClass({ ...selectedClass, type: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      >
                        {classTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                    <input
                      type="text"
                      value={selectedClass.shortDescription || ''}
                      onChange={(e) => setSelectedClass({ ...selectedClass, shortDescription: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="Brief description for cards"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
                    <textarea
                      value={selectedClass.description || ''}
                      onChange={(e) => setSelectedClass({ ...selectedClass, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="Detailed description of the class"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration (min)</label>
                      <input
                        type="number"
                        min="15"
                        value={selectedClass.duration || 60}
                        onChange={(e) => setSelectedClass({ ...selectedClass, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={selectedClass.capacity || 20}
                        onChange={(e) => setSelectedClass({ ...selectedClass, capacity: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                      <select
                        value={selectedClass.difficulty || 'All Levels'}
                        onChange={(e) => setSelectedClass({ ...selectedClass, difficulty: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      >
                        {difficultyLevels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Trainer</label>
                    <select
                      value={selectedClass.trainer?._id || selectedClass.trainer || ''}
                      onChange={(e) => setSelectedClass({ ...selectedClass, trainer: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select a trainer</option>
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer._id}>
                          {trainer.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Schedule Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">Schedule</label>
                      <button
                        type="button"
                        onClick={addScheduleSlot}
                        className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
                      >
                        <HiOutlinePlus className="mr-1" size={16} />
                        Add Time Slot
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(selectedClass.schedule || []).map((slot, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                          <select
                            value={slot.day}
                            onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                            className="px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary-500"
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                            className="px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary-500"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                            className="px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary-500"
                          />
                          {selectedClass.schedule.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeScheduleSlot(index)}
                              className="p-2 text-gray-400 hover:text-red-400"
                            >
                              <HiOutlineTrash size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={selectedClass.image || ''}
                        onChange={(e) => setSelectedClass({ ...selectedClass, image: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-end space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClass.featured || false}
                          onChange={(e) => setSelectedClass({ ...selectedClass, featured: e.target.checked })}
                          className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-300">Featured</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClass.isActive !== false}
                          onChange={(e) => setSelectedClass({ ...selectedClass, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-300">Active</span>
                      </label>
                    </div>
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
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Add Class' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClasses;
