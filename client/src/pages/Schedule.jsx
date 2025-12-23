import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { classService, bookingService } from '../services';
import { Button } from '../components/common';

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (classId, date) => {
    try {
      const response = await bookingService.getClassAvailability(classId, date);
      setAvailability(prev => ({
        ...prev,
        [`${classId}-${date}`]: response.data
      }));
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const getClassesForDay = (day) => {
    if (!classes.length) return [];

    return classes
      .filter(classItem =>
        classItem.schedules?.some(schedule =>
          schedule.day.toLowerCase() === day.toLowerCase()
        )
      )
      .map(classItem => {
        const schedule = classItem.schedules.find(s =>
          s.day.toLowerCase() === day.toLowerCase()
        );
        return {
          ...classItem,
          scheduleTime: schedule.startTime,
          scheduleEndTime: schedule.endTime,
          scheduleDay: schedule.day
        };
      })
      .sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const days = [
    { id: 'monday', name: 'Monday', shortName: 'Mon' },
    { id: 'tuesday', name: 'Tuesday', shortName: 'Tue' },
    { id: 'wednesday', name: 'Wednesday', shortName: 'Wed' },
    { id: 'thursday', name: 'Thursday', shortName: 'Thu' },
    { id: 'friday', name: 'Friday', shortName: 'Fri' },
    { id: 'saturday', name: 'Saturday', shortName: 'Sat' },
    { id: 'sunday', name: 'Sunday', shortName: 'Sun' },
  ];

  const classTypes = [
    { id: 'all', name: 'All Classes', icon: '📋' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'cardio', name: 'Cardio', icon: '🏃' },
    { id: 'yoga', name: 'Yoga', icon: '🧘' },
    { id: 'hiit', name: 'HIIT', icon: '🔥' },
    { id: 'spin', name: 'Spin', icon: '🚴' },
    { id: 'boxing', name: 'Boxing', icon: '🥊' },
    { id: 'pilates', name: 'Pilates', icon: '🤸' },
    { id: 'aqua', name: 'Aqua', icon: '🏊' },
  ];

  const trainers = [
    { id: 'all', name: 'All Trainers' },
    { id: 'marcus', name: 'Marcus Johnson' },
    { id: 'sarah', name: 'Sarah Williams' },
    { id: 'david', name: 'David Chen' },
    { id: 'emma', name: 'Emma Rodriguez' },
    { id: 'michael', name: 'Michael Thompson' },
    { id: 'lisa', name: 'Lisa Park' },
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  const getClassTypeColor = (type) => {
    const colors = {
      strength: 'from-red-500 to-orange-500',
      cardio: 'from-pink-500 to-rose-500',
      yoga: 'from-purple-500 to-indigo-500',
      hiit: 'from-orange-500 to-amber-500',
      spin: 'from-green-500 to-emerald-500',
      boxing: 'from-gray-600 to-gray-700',
      pilates: 'from-teal-500 to-cyan-500',
      aqua: 'from-blue-500 to-cyan-500',
    };
    return colors[type] || 'from-primary-500 to-secondary-500';
  };

  const getClassTypeBg = (type) => {
    const colors = {
      strength: 'bg-red-500/20 text-red-400',
      cardio: 'bg-pink-500/20 text-pink-400',
      yoga: 'bg-purple-500/20 text-purple-400',
      hiit: 'bg-orange-500/20 text-orange-400',
      spin: 'bg-green-500/20 text-green-400',
      boxing: 'bg-gray-500/20 text-gray-400',
      pilates: 'bg-teal-500/20 text-teal-400',
      aqua: 'bg-blue-500/20 text-blue-400',
    };
    return colors[type] || 'bg-primary-500/20 text-primary-400';
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? trainer.name : 'TBA';
  };

  const filteredClasses = getClassesForDay(selectedDay).filter(cls => {
    // Map filter IDs to actual class types
    const typeMapping = {
      'strength': 'Strength Training',
      'cardio': 'Cardio',
      'yoga': 'Yoga',
      'hiit': 'HIIT',
      'spin': 'Spinning',
      'boxing': 'Boxing',
      'pilates': 'Pilates',
      'aqua': 'Swimming',
    };

    const targetType = typeMapping[selectedClass] || selectedClass;
    const matchesClass = selectedClass === 'all' || cls.type === targetType;
    const matchesTrainer = selectedTrainer === 'all' || cls.trainerName === selectedTrainer;
    return matchesClass && matchesTrainer;
  });

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-mesh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-10 right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 left-20 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="section-container relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6">
              📅 Class Schedule
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Weekly <span className="gradient-text">Timetable</span>
            </h1>
            <p className="text-xl text-gray-400">
              Plan your week with our diverse range of classes. Book your spot and start your fitness journey!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Day Selector */}
      <section className="py-6 bg-dark-600 sticky top-20 z-30 border-b border-white/5">
        <div className="section-container">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {days.map((day) => (
              <motion.button
                key={day.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  selectedDay === day.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-white'
                }`}
              >
                <span className="hidden md:inline">{day.name}</span>
                <span className="md:hidden">{day.shortName}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-dark-500">
        <div className="section-container">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Class Type Filter */}
            <div className="flex flex-wrap gap-2">
              {classTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedClass(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                    selectedClass === type.id
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                      : 'bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="hidden sm:inline">{type.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Trainer Filter & View Toggle */}
            <div className="flex items-center gap-4">
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="px-4 py-2 bg-dark-400 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
              >
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex bg-dark-400 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Display */}
      <section className="py-12 bg-dark-500">
        <div className="section-container">
          {/* Current Day Header */}
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {days.find(d => d.id === selectedDay)?.name}'s Classes
            </h2>
            <p className="text-gray-400">
              {filteredClasses.length} classes available
              {selectedClass !== 'all' && ` in ${classTypes.find(c => c.id === selectedClass)?.name}`}
              {selectedTrainer !== 'all' && ` with ${getTrainerName(selectedTrainer)}`}
            </p>
          </motion.div>

          {filteredClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-2xl font-bold text-white mb-2">No Classes Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters to see more classes.</p>
              <Button variant="outline" onClick={() => { setSelectedClass('all'); setSelectedTrainer('all'); }}>
                Clear Filters
              </Button>
            </motion.div>
          ) : viewMode === 'grid' ? (
            /* Grid View - Modern Premium Cards */
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredClasses.map((cls, index) => {
                  const typeKey = cls.type?.toLowerCase().replace(' ', '') || 'cardio';
                  const gradientClass = getClassTypeColor(typeKey);
                  
                  return (
                    <motion.div
                      key={cls._id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative bg-gradient-to-br from-dark-400/80 to-dark-500/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500"
                    >
                      {/* Animated Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      {/* Top Accent Line */}
                      <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`} />

                      {/* Floating Time Badge */}
                      <div className="absolute top-5 right-4 z-10">
                        <div className="bg-dark-500/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                          <span className="text-white font-bold text-sm">{formatTime(cls.scheduleTime)}</span>
                        </div>
                      </div>

                      <div className="p-6 pt-5">
                        {/* Category Icon & Badge */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl">
                              {cls.type === 'Yoga' ? '🧘' : 
                               cls.type === 'HIIT' ? '🔥' : 
                               cls.type === 'Strength Training' ? '💪' : 
                               cls.type === 'Cardio' ? '🏃' : 
                               cls.type === 'Boxing' ? '🥊' : 
                               cls.type === 'Spinning' ? '🚴' : 
                               cls.type === 'Pilates' ? '🤸' : 
                               cls.type === 'Swimming' ? '🏊' : 
                               cls.type === 'CrossFit' ? '🏋️' : 
                               cls.type === 'Zumba' ? '💃' : '🏋️'}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${getClassTypeBg(typeKey)}`}>
                              {cls.type}
                            </span>
                          </div>
                        </div>

                        {/* Class Name */}
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                          {cls.name}
                        </h3>

                        {/* Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

                        {/* Info Cards */}
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <span className="text-sm">👤</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Trainer</p>
                              <p className="text-sm font-medium text-white truncate">{cls.trainerName || 'TBA'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                              <span className="text-sm">⏱️</span>
                              <span className="text-xs text-gray-400">{cls.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                              <span className="text-sm">📍</span>
                              <span className="text-xs text-gray-400 truncate">{cls.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                              </span>
                              <span className="text-xs font-medium text-green-400">Available</span>
                            </div>
                            <span className="text-xs text-gray-500">{cls.capacity} spots</span>
                          </div>
                        </div>

                        {/* Book Button */}
                        <Link
                          to={`/book-class/${cls._id}`}
                          className={`relative w-full block overflow-hidden rounded-xl`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-90`} />
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <div className="relative py-3 px-4 text-center">
                            <span className="font-semibold text-white flex items-center justify-center gap-2">
                              Book Now
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </div>
                        </Link>
                      </div>

                      {/* Decorative Corner Glow */}
                      <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradientClass} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* List View - Modern Design */
            <motion.div className="space-y-4" layout>
              <AnimatePresence mode="popLayout">
                {filteredClasses.map((cls, index) => {
                  const typeKey = cls.type?.toLowerCase().replace(' ', '') || 'cardio';
                  const gradientClass = getClassTypeColor(typeKey);
                  
                  return (
                    <motion.div
                      key={cls._id}
                      layout
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                      className="group relative bg-gradient-to-r from-dark-400/80 to-dark-500/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Left Accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradientClass}`} />
                      
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 pl-6">
                        {/* Time Block */}
                        <div className="flex items-center gap-4 lg:w-40">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
                            <span className="text-2xl">
                              {cls.type === 'Yoga' ? '🧘' : 
                               cls.type === 'HIIT' ? '🔥' : 
                               cls.type === 'Strength Training' ? '💪' : 
                               cls.type === 'Cardio' ? '🏃' : 
                               cls.type === 'Boxing' ? '🥊' : 
                               cls.type === 'Spinning' ? '🚴' : '🏋️'}
                            </span>
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-white">{formatTime(cls.scheduleTime)}</span>
                            <p className="text-gray-400 text-sm">{cls.duration} min</p>
                          </div>
                        </div>

                        {/* Class Info */}
                        <div className="flex-1 lg:border-l lg:border-white/10 lg:pl-6">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{cls.name}</h3>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getClassTypeBg(typeKey)}`}>
                              {cls.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-2 text-gray-400">
                              <span className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center text-xs">👤</span>
                              {cls.trainerName || 'TBA'}
                            </span>
                            <span className="flex items-center gap-2 text-gray-400">
                              <span className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center text-xs">📍</span>
                              {cls.location}
                            </span>
                            <span className="flex items-center gap-2 text-green-400">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              {cls.capacity} spots available
                            </span>
                          </div>
                        </div>

                        {/* Book Button */}
                        <Link
                          to={`/book-class/${cls._id}`}
                          className={`relative overflow-hidden rounded-xl group/btn`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`} />
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                          <div className="relative py-3 px-8 text-center">
                            <span className="font-semibold text-white whitespace-nowrap flex items-center gap-2">
                              Book Now
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Weekly Overview */}
      <section className="py-16 bg-dark-600">
        <div className="section-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-4">
              Weekly Overview
            </span>
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              Class <span className="gradient-text">Statistics</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {days.map((day, index) => {
              const dayClasses = getClassesForDay(day.id);

              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedDay(day.id)}
                  className={`glass-card p-4 text-center cursor-pointer transition-all ${
                    selectedDay === day.id ? 'border-2 border-primary-500' : ''
                  }`}
                >
                  <h3 className="text-white font-semibold mb-2">{day.shortName}</h3>
                  <div className="text-3xl font-bold gradient-text mb-1">{dayClasses.length}</div>
                  <p className="text-gray-400 text-xs">classes</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative z-10">
          <motion.div 
            className="glass-card p-12 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold text-white mb-6">
              Ready to Get <span className="gradient-text">Started</span>?
            </h2>
            <p className="text-gray-400 mb-8">
              Join FitZone today and get access to all classes. First class is on us!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  View Membership Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Schedule;
