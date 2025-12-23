import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TrainerClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [saving, setSaving] = useState(false);

  const classTypes = [
    'Yoga', 'HIIT', 'Strength Training', 'Cardio', 'Pilates', 'Zumba',
    'Boxing', 'CrossFit', 'Spinning', 'Swimming', 'Functional Training',
    'Kickboxing', 'Dance Fitness', 'Meditation',
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all-levels', label: 'All Levels' },
  ];

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
      
      const allClasses = classesRes.data.data || classesRes.data;
      const allTrainers = trainersRes.data.data || trainersRes.data;
      
      // Find current trainer's profile
      const myTrainerProfile = allTrainers.find(t => 
        t.user?._id === user?._id || 
        t.email === user?.email ||
        t.user === user?._id
      );
      
      setTrainers(allTrainers);
      
      // Filter classes created by this trainer
      const myClasses = allClasses.filter(cls => {
        if (cls.trainer?._id === myTrainerProfile?._id) return true;
        if (cls.trainer === myTrainerProfile?._id) return true;
        if (cls.trainer?.user?._id === user?._id) return true;
        if (cls.trainer?.email === user?.email) return true;
        return false;
      });
      
      setClasses(myClasses);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const getMyTrainerId = () => {
    const myTrainer = trainers.find(t => 
      t.user?._id === user?._id || 
      t.email === user?.email ||
      t.user === user?._id
    );
    return myTrainer?._id;
  };

  const handleAdd = () => {
    setSelectedClass({
      name: '',
      description: '',
      type: 'Yoga',
      difficulty: 'all-levels',
      duration: 60,
      capacity: 20,
      location: 'Main Studio',
      schedules: [{ day: 'Monday', startTime: '09:00', endTime: '10:00' }],
      isActive: true,
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleEdit = (cls) => {
    setSelectedClass({
      ...cls,
      schedules: cls.schedules?.length > 0 ? cls.schedules : 
        (cls.schedule?.day ? [cls.schedule] : [{ day: 'Monday', startTime: '09:00', endTime: '10:00' }]),
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/classes/${id}`);
        setClasses(classes.filter(c => c._id !== id));
        toast.success('Class deleted successfully');
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!selectedClass.name || !selectedClass.description) {
        toast.error('Please fill in all required fields');
        setSaving(false);
        return;
      }

      const trainerId = getMyTrainerId();
      
      const classData = {
        name: selectedClass.name,
        description: selectedClass.description,
        type: selectedClass.type,
        difficulty: selectedClass.difficulty,
        duration: selectedClass.duration,
        capacity: selectedClass.capacity,
        location: selectedClass.location,
        schedules: selectedClass.schedules,
        schedule: selectedClass.schedules?.[0] || {},
        trainer: trainerId,
        trainerName: user?.fullName,
        isActive: selectedClass.isActive,
      };

      if (modalMode === 'add') {
        const response = await api.post('/classes', classData);
        const newClass = response.data.data || response.data;
        setClasses([...classes, newClass]);
        toast.success('Class created successfully! It will appear in the schedule for members.');
      } else {
        const response = await api.put(`/classes/${selectedClass._id}`, classData);
        const updatedClass = response.data.data || response.data;
        setClasses(classes.map(c => c._id === selectedClass._id ? updatedClass : c));
        toast.success('Class updated successfully');
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (classId, isActive) => {
    try {
      await api.put(`/classes/${classId}`, { isActive });
      setClasses(classes.map(c => c._id === classId ? { ...c, isActive } : c));
      toast.success(`Class ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update class');
    }
  };

  const addSchedule = () => {
    setSelectedClass({
      ...selectedClass,
      schedules: [...(selectedClass.schedules || []), { day: 'Monday', startTime: '09:00', endTime: '10:00' }],
    });
  };

  const removeSchedule = (index) => {
    setSelectedClass({
      ...selectedClass,
      schedules: selectedClass.schedules.filter((_, i) => i !== index),
    });
  };

  const updateSchedule = (index, field, value) => {
    const newSchedules = [...selectedClass.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSelectedClass({ ...selectedClass, schedules: newSchedules });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">My Classes</h1>
          <p className="text-gray-400 mt-1">Create and manage your fitness classes</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="mr-2" size={20} />
          Add Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Classes</p>
              <p className="text-2xl font-bold text-white mt-1">{classes.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineCalendar className="text-primary-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Classes</p>
              <p className="text-2xl font-bold text-white mt-1">
                {classes.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineCheck className="text-green-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Capacity</p>
              <p className="text-2xl font-bold text-white mt-1">
                {classes.reduce((sum, c) => sum + (c.capacity || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <HiOutlineUsers className="text-secondary-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <HiOutlineCalendar className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">You haven't created any classes yet.</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          classes.map((cls) => (
            <motion.div
              key={cls._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden hover:border-dark-600 transition-colors"
            >
              {/* Class Header Image */}
              <div className="relative h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
                <img
                  src={cls.image || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400`}
                  alt={cls.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(cls.difficulty)}`}>
                    {cls.difficulty || 'All Levels'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cls.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Class Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{cls.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{cls.type}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-400">
                    <HiOutlineClock className="mr-2" size={16} />
                    <span>{cls.duration || 60} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <HiOutlineUsers className="mr-2" size={16} />
                    <span>Capacity: {cls.capacity || 20} members</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <HiOutlineLocationMarker className="mr-2" size={16} />
                    <span>{cls.location || 'Main Studio'}</span>
                  </div>
                </div>

                {/* Schedule */}
                {cls.schedule && cls.schedule.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <p className="text-xs text-gray-500 mb-2">Schedule</p>
                    <div className="flex flex-wrap gap-1">
                      {cls.schedule.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-dark-700 rounded text-xs text-gray-300">
                          {s.day?.substring(0, 3)} {s.startTime}
                        </span>
                      ))}
                      {cls.schedule.length > 3 && (
                        <span className="px-2 py-1 bg-dark-700 rounded text-xs text-gray-400">
                          +{cls.schedule.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(cls)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cls._id)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleActive(cls._id, !cls.isActive)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      cls.isActive 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {cls.isActive ? <HiOutlineX className="mr-1" size={16} /> : <HiOutlineCheck className="mr-1" size={16} />}
                    {cls.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
                <h3 className="text-lg font-semibold text-white">
                  {modalMode === 'add' ? 'Create New Class' : 'Edit Class'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-dark-700 text-gray-400">
                  <HiOutlineX size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Class Name *</label>
                    <input
                      type="text"
                      value={selectedClass.name || ''}
                      onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="e.g., Morning Yoga Flow"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      value={selectedClass.type || 'Yoga'}
                      onChange={(e) => setSelectedClass({ ...selectedClass, type: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      {classTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={selectedClass.difficulty || 'all-levels'}
                      onChange={(e) => setSelectedClass({ ...selectedClass, difficulty: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={selectedClass.duration || 60}
                      onChange={(e) => setSelectedClass({ ...selectedClass, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={selectedClass.capacity || 20}
                      onChange={(e) => setSelectedClass({ ...selectedClass, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={selectedClass.location || ''}
                      onChange={(e) => setSelectedClass({ ...selectedClass, location: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="e.g., Main Studio, Room 101"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={selectedClass.description || ''}
                      onChange={(e) => setSelectedClass({ ...selectedClass, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      placeholder="Describe your class..."
                    />
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="pt-4 border-t border-dark-700">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-300">Schedule</label>
                    <button
                      type="button"
                      onClick={addSchedule}
                      className="text-sm text-primary-400 hover:text-primary-300"
                    >
                      + Add Time Slot
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedClass.schedules?.map((schedule, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                        <select
                          value={schedule.day || 'Monday'}
                          onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                          className="flex-1 px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm"
                        >
                          {daysOfWeek.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <input
                          type="time"
                          value={schedule.startTime || '09:00'}
                          onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                          className="px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={schedule.endTime || '10:00'}
                          onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                          className="px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm"
                        />
                        {selectedClass.schedules?.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                          >
                            <HiOutlineX size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Class Active</p>
                    <p className="text-xs text-gray-500">Active classes appear in the schedule for members</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClass({ ...selectedClass, isActive: !selectedClass.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      selectedClass.isActive ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      selectedClass.isActive ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-dark-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create Class' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainerClasses;
