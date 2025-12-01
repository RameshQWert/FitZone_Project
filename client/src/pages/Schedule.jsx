import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/common';

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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

  const scheduleData = {
    monday: [
      { id: 1, time: '06:00', duration: 60, name: 'Morning Yoga', type: 'yoga', trainer: 'sarah', spots: 5, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
      { id: 2, time: '07:00', duration: 45, name: 'Spin Express', type: 'spin', trainer: 'lisa', spots: 3, totalSpots: 25, room: 'Spin Room', level: 'Intermediate' },
      { id: 3, time: '08:00', duration: 60, name: 'Strength Foundations', type: 'strength', trainer: 'marcus', spots: 8, totalSpots: 15, room: 'Weight Room', level: 'Beginner' },
      { id: 4, time: '09:00', duration: 45, name: 'HIIT Blast', type: 'hiit', trainer: 'david', spots: 0, totalSpots: 20, room: 'Main Floor', level: 'Advanced' },
      { id: 5, time: '10:00', duration: 60, name: 'Pilates Core', type: 'pilates', trainer: 'sarah', spots: 12, totalSpots: 18, room: 'Studio B', level: 'All Levels' },
      { id: 6, time: '12:00', duration: 30, name: 'Lunch Express HIIT', type: 'hiit', trainer: 'david', spots: 6, totalSpots: 20, room: 'Main Floor', level: 'Intermediate' },
      { id: 7, time: '17:00', duration: 60, name: 'After Work Spin', type: 'spin', trainer: 'lisa', spots: 2, totalSpots: 25, room: 'Spin Room', level: 'All Levels' },
      { id: 8, time: '18:00', duration: 75, name: 'Power Lifting', type: 'strength', trainer: 'marcus', spots: 4, totalSpots: 12, room: 'Weight Room', level: 'Advanced' },
      { id: 9, time: '19:00', duration: 60, name: 'Boxing Fundamentals', type: 'boxing', trainer: 'michael', spots: 7, totalSpots: 16, room: 'Boxing Ring', level: 'Beginner' },
      { id: 10, time: '20:00', duration: 60, name: 'Evening Yoga Flow', type: 'yoga', trainer: 'sarah', spots: 10, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
    ],
    tuesday: [
      { id: 11, time: '06:00', duration: 45, name: 'Early Bird Cardio', type: 'cardio', trainer: 'lisa', spots: 8, totalSpots: 30, room: 'Main Floor', level: 'All Levels' },
      { id: 12, time: '07:00', duration: 60, name: 'Aqua Aerobics', type: 'aqua', trainer: 'emma', spots: 6, totalSpots: 15, room: 'Pool', level: 'All Levels' },
      { id: 13, time: '08:00', duration: 45, name: 'Tabata Training', type: 'hiit', trainer: 'david', spots: 4, totalSpots: 20, room: 'Main Floor', level: 'Advanced' },
      { id: 14, time: '09:00', duration: 60, name: 'Vinyasa Flow', type: 'yoga', trainer: 'sarah', spots: 11, totalSpots: 20, room: 'Studio A', level: 'Intermediate' },
      { id: 15, time: '10:00', duration: 60, name: 'Boxing Conditioning', type: 'boxing', trainer: 'michael', spots: 5, totalSpots: 16, room: 'Boxing Ring', level: 'Intermediate' },
      { id: 16, time: '12:00', duration: 45, name: 'Lunch Spin', type: 'spin', trainer: 'lisa', spots: 0, totalSpots: 25, room: 'Spin Room', level: 'All Levels' },
      { id: 17, time: '17:00', duration: 60, name: 'Functional Strength', type: 'strength', trainer: 'marcus', spots: 3, totalSpots: 15, room: 'Weight Room', level: 'Intermediate' },
      { id: 18, time: '18:00', duration: 60, name: 'Cardio Dance', type: 'cardio', trainer: 'lisa', spots: 9, totalSpots: 25, room: 'Studio A', level: 'All Levels' },
      { id: 19, time: '19:00', duration: 45, name: 'Core Crusher', type: 'hiit', trainer: 'david', spots: 2, totalSpots: 20, room: 'Main Floor', level: 'Intermediate' },
      { id: 20, time: '20:00', duration: 60, name: 'Restorative Yoga', type: 'yoga', trainer: 'sarah', spots: 14, totalSpots: 20, room: 'Studio B', level: 'Beginner' },
    ],
    wednesday: [
      { id: 21, time: '06:00', duration: 60, name: 'Sunrise Strength', type: 'strength', trainer: 'marcus', spots: 6, totalSpots: 15, room: 'Weight Room', level: 'All Levels' },
      { id: 22, time: '07:00', duration: 45, name: 'Power Spin', type: 'spin', trainer: 'lisa', spots: 1, totalSpots: 25, room: 'Spin Room', level: 'Advanced' },
      { id: 23, time: '08:00', duration: 60, name: 'Hatha Yoga', type: 'yoga', trainer: 'sarah', spots: 9, totalSpots: 20, room: 'Studio A', level: 'Beginner' },
      { id: 24, time: '09:00', duration: 45, name: 'HIIT Circuit', type: 'hiit', trainer: 'david', spots: 5, totalSpots: 20, room: 'Main Floor', level: 'Intermediate' },
      { id: 25, time: '10:00', duration: 60, name: 'Aqua Zumba', type: 'aqua', trainer: 'emma', spots: 8, totalSpots: 15, room: 'Pool', level: 'All Levels' },
      { id: 26, time: '12:00', duration: 30, name: 'Express Boxing', type: 'boxing', trainer: 'michael', spots: 4, totalSpots: 16, room: 'Boxing Ring', level: 'All Levels' },
      { id: 27, time: '17:00', duration: 60, name: 'Pilates Reformer', type: 'pilates', trainer: 'sarah', spots: 0, totalSpots: 10, room: 'Pilates Studio', level: 'Intermediate' },
      { id: 28, time: '18:00', duration: 60, name: 'Kickboxing', type: 'boxing', trainer: 'michael', spots: 6, totalSpots: 16, room: 'Boxing Ring', level: 'Intermediate' },
      { id: 29, time: '19:00', duration: 75, name: 'Bodybuilding Basics', type: 'strength', trainer: 'marcus', spots: 7, totalSpots: 12, room: 'Weight Room', level: 'Beginner' },
      { id: 30, time: '20:00', duration: 60, name: 'Candlelit Yoga', type: 'yoga', trainer: 'sarah', spots: 3, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
    ],
    thursday: [
      { id: 31, time: '06:00', duration: 45, name: 'Spin & Sweat', type: 'spin', trainer: 'lisa', spots: 5, totalSpots: 25, room: 'Spin Room', level: 'All Levels' },
      { id: 32, time: '07:00', duration: 60, name: 'Morning Pilates', type: 'pilates', trainer: 'sarah', spots: 7, totalSpots: 18, room: 'Studio B', level: 'All Levels' },
      { id: 33, time: '08:00', duration: 45, name: 'Cardio Kickboxing', type: 'cardio', trainer: 'michael', spots: 10, totalSpots: 20, room: 'Main Floor', level: 'Intermediate' },
      { id: 34, time: '09:00', duration: 60, name: 'Strength & Tone', type: 'strength', trainer: 'marcus', spots: 4, totalSpots: 15, room: 'Weight Room', level: 'Intermediate' },
      { id: 35, time: '10:00', duration: 60, name: 'Yin Yoga', type: 'yoga', trainer: 'sarah', spots: 12, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
      { id: 36, time: '12:00', duration: 45, name: 'Lunch HIIT', type: 'hiit', trainer: 'david', spots: 1, totalSpots: 20, room: 'Main Floor', level: 'Advanced' },
      { id: 37, time: '17:00', duration: 60, name: 'Aqua Power', type: 'aqua', trainer: 'emma', spots: 9, totalSpots: 15, room: 'Pool', level: 'Intermediate' },
      { id: 38, time: '18:00', duration: 45, name: 'Sprint Spin', type: 'spin', trainer: 'lisa', spots: 0, totalSpots: 25, room: 'Spin Room', level: 'Advanced' },
      { id: 39, time: '19:00', duration: 60, name: 'Boxing Sparring', type: 'boxing', trainer: 'michael', spots: 2, totalSpots: 12, room: 'Boxing Ring', level: 'Advanced' },
      { id: 40, time: '20:00', duration: 60, name: 'Stretch & Relax', type: 'yoga', trainer: 'sarah', spots: 15, totalSpots: 20, room: 'Studio A', level: 'Beginner' },
    ],
    friday: [
      { id: 41, time: '06:00', duration: 60, name: 'TGIF HIIT', type: 'hiit', trainer: 'david', spots: 8, totalSpots: 20, room: 'Main Floor', level: 'All Levels' },
      { id: 42, time: '07:00', duration: 60, name: 'Power Yoga', type: 'yoga', trainer: 'sarah', spots: 6, totalSpots: 20, room: 'Studio A', level: 'Intermediate' },
      { id: 43, time: '08:00', duration: 45, name: 'Spin Journey', type: 'spin', trainer: 'lisa', spots: 4, totalSpots: 25, room: 'Spin Room', level: 'All Levels' },
      { id: 44, time: '09:00', duration: 60, name: 'Olympic Lifting', type: 'strength', trainer: 'marcus', spots: 3, totalSpots: 10, room: 'Weight Room', level: 'Advanced' },
      { id: 45, time: '10:00', duration: 60, name: 'Pilates Mat', type: 'pilates', trainer: 'sarah', spots: 11, totalSpots: 18, room: 'Studio B', level: 'All Levels' },
      { id: 46, time: '12:00', duration: 45, name: 'Friday Fitness Mix', type: 'cardio', trainer: 'lisa', spots: 7, totalSpots: 25, room: 'Main Floor', level: 'All Levels' },
      { id: 47, time: '16:00', duration: 60, name: 'Happy Hour Spin', type: 'spin', trainer: 'lisa', spots: 2, totalSpots: 25, room: 'Spin Room', level: 'All Levels' },
      { id: 48, time: '17:00', duration: 60, name: 'Boxing Bootcamp', type: 'boxing', trainer: 'michael', spots: 5, totalSpots: 16, room: 'Boxing Ring', level: 'All Levels' },
      { id: 49, time: '18:00', duration: 75, name: 'Total Body Strength', type: 'strength', trainer: 'marcus', spots: 6, totalSpots: 15, room: 'Weight Room', level: 'Intermediate' },
    ],
    saturday: [
      { id: 50, time: '07:00', duration: 60, name: 'Weekend Warrior HIIT', type: 'hiit', trainer: 'david', spots: 4, totalSpots: 25, room: 'Main Floor', level: 'Advanced' },
      { id: 51, time: '08:00', duration: 90, name: 'Saturday Morning Yoga', type: 'yoga', trainer: 'sarah', spots: 8, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
      { id: 52, time: '09:00', duration: 60, name: 'Spin Party', type: 'spin', trainer: 'lisa', spots: 0, totalSpots: 30, room: 'Spin Room', level: 'All Levels' },
      { id: 53, time: '10:00', duration: 60, name: 'Family Aqua Fun', type: 'aqua', trainer: 'emma', spots: 10, totalSpots: 20, room: 'Pool', level: 'All Levels' },
      { id: 54, time: '11:00', duration: 60, name: 'Strength Challenge', type: 'strength', trainer: 'marcus', spots: 5, totalSpots: 15, room: 'Weight Room', level: 'All Levels' },
      { id: 55, time: '12:00', duration: 60, name: 'Boxing Basics', type: 'boxing', trainer: 'michael', spots: 9, totalSpots: 16, room: 'Boxing Ring', level: 'Beginner' },
      { id: 56, time: '14:00', duration: 60, name: 'Zumba Party', type: 'cardio', trainer: 'lisa', spots: 12, totalSpots: 30, room: 'Studio A', level: 'All Levels' },
      { id: 57, time: '16:00', duration: 60, name: 'Power Pilates', type: 'pilates', trainer: 'sarah', spots: 6, totalSpots: 18, room: 'Studio B', level: 'Intermediate' },
    ],
    sunday: [
      { id: 58, time: '08:00', duration: 90, name: 'Sunday Zen Yoga', type: 'yoga', trainer: 'sarah', spots: 7, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
      { id: 59, time: '09:00', duration: 60, name: 'Easy Spin', type: 'spin', trainer: 'lisa', spots: 11, totalSpots: 25, room: 'Spin Room', level: 'Beginner' },
      { id: 60, time: '10:00', duration: 60, name: 'Aqua Relax', type: 'aqua', trainer: 'emma', spots: 8, totalSpots: 15, room: 'Pool', level: 'All Levels' },
      { id: 61, time: '11:00', duration: 60, name: 'Functional Fitness', type: 'strength', trainer: 'marcus', spots: 4, totalSpots: 12, room: 'Weight Room', level: 'Intermediate' },
      { id: 62, time: '12:00', duration: 45, name: 'Light HIIT', type: 'hiit', trainer: 'david', spots: 9, totalSpots: 20, room: 'Main Floor', level: 'Beginner' },
      { id: 63, time: '14:00', duration: 60, name: 'Stretch & Restore', type: 'yoga', trainer: 'sarah', spots: 14, totalSpots: 20, room: 'Studio A', level: 'All Levels' },
      { id: 64, time: '16:00', duration: 60, name: 'Meditation & Mindfulness', type: 'yoga', trainer: 'sarah', spots: 10, totalSpots: 15, room: 'Studio B', level: 'All Levels' },
    ],
  };

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

  const filteredClasses = scheduleData[selectedDay].filter(cls => {
    const matchesClass = selectedClass === 'all' || cls.type === selectedClass;
    const matchesTrainer = selectedTrainer === 'all' || cls.trainer === selectedTrainer;
    return matchesClass && matchesTrainer;
  });

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

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
            /* Grid View */
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredClasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="glass-card overflow-hidden group"
                  >
                    {/* Header with gradient */}
                    <div className={`h-2 bg-gradient-to-r ${getClassTypeColor(cls.type)}`} />
                    
                    <div className="p-5">
                      {/* Time & Duration */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-white">{formatTime(cls.time)}</span>
                        <span className="text-gray-400 text-sm">{cls.duration} min</span>
                      </div>

                      {/* Class Name */}
                      <h3 className="text-lg font-semibold text-white mb-2">{cls.name}</h3>

                      {/* Type Badge */}
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getClassTypeBg(cls.type)} mb-3`}>
                        {classTypes.find(c => c.id === cls.type)?.icon} {classTypes.find(c => c.id === cls.type)?.name}
                      </span>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>👤</span>
                          <span className="truncate">{getTrainerName(cls.trainer)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>📍</span>
                          <span>{cls.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>📊</span>
                          <span>{cls.level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span className={cls.spots === 0 ? 'text-red-400' : cls.spots <= 3 ? 'text-orange-400' : 'text-green-400'}>
                            {cls.spots === 0 ? 'Full' : `${cls.spots} spots`}
                          </span>
                        </div>
                      </div>

                      {/* Spots Progress Bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${cls.spots === 0 ? 'bg-red-500' : cls.spots <= 3 ? 'bg-orange-500' : 'bg-green-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${((cls.totalSpots - cls.spots) / cls.totalSpots) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{cls.totalSpots - cls.spots}/{cls.totalSpots} booked</p>
                      </div>

                      {/* Book Button */}
                      <Button 
                        variant={cls.spots === 0 ? 'outline' : 'primary'} 
                        className="w-full"
                        size="sm"
                        disabled={cls.spots === 0}
                      >
                        {cls.spots === 0 ? 'Join Waitlist' : 'Book Class'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* List View */
            <motion.div className="space-y-3" layout>
              <AnimatePresence mode="popLayout">
                {filteredClasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4"
                  >
                    {/* Time */}
                    <div className="flex items-center gap-4 md:w-32">
                      <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${getClassTypeColor(cls.type)}`} />
                      <div>
                        <span className="text-xl font-bold text-white">{formatTime(cls.time)}</span>
                        <p className="text-gray-400 text-sm">{cls.duration} min</p>
                      </div>
                    </div>

                    {/* Class Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{cls.name}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getClassTypeBg(cls.type)}`}>
                          {classTypes.find(c => c.id === cls.type)?.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>👤 {getTrainerName(cls.trainer)}</span>
                        <span>📍 {cls.room}</span>
                        <span>📊 {cls.level}</span>
                      </div>
                    </div>

                    {/* Spots & Book */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-lg font-bold ${cls.spots === 0 ? 'text-red-400' : cls.spots <= 3 ? 'text-orange-400' : 'text-green-400'}`}>
                          {cls.spots === 0 ? 'Full' : `${cls.spots} spots`}
                        </span>
                        <p className="text-gray-500 text-xs">{cls.totalSpots - cls.spots}/{cls.totalSpots} booked</p>
                      </div>
                      <Button 
                        variant={cls.spots === 0 ? 'outline' : 'primary'}
                        size="sm"
                        disabled={cls.spots === 0}
                      >
                        {cls.spots === 0 ? 'Waitlist' : 'Book'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
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
              const dayClasses = scheduleData[day.id];
              const totalSpots = dayClasses.reduce((acc, cls) => acc + cls.spots, 0);
              
              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedDay(day.id)}
                  className={`glass-card p-4 text-center cursor-pointer transition-all ${
                    selectedDay === day.id ? 'border-2 border-primary-500' : ''
                  }`}
                >
                  <h3 className="text-white font-semibold mb-2">{day.shortName}</h3>
                  <div className="text-3xl font-bold gradient-text mb-1">{dayClasses.length}</div>
                  <p className="text-gray-400 text-xs">classes</p>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-green-400 text-sm">{totalSpots}</span>
                    <p className="text-gray-500 text-xs">spots open</p>
                  </div>
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
