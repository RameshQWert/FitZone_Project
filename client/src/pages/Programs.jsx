import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Loading } from '../components/common';
import { Card, CardBody } from '../components/ui';
import { classService } from '../services';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProgram, setHoveredProgram] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await classService.getAll();
        // Map API data to expected format
        const mappedPrograms = data.map((program, index) => ({
          id: program._id,
          title: program.name,
          category: mapTypeToCategory(program.type),
          description: program.shortDescription || program.description?.substring(0, 150) || 'Transform your fitness with this program.',
          longDescription: program.description || program.shortDescription,
          image: program.image || getDefaultImage(program.type),
          icon: program.icon || getDefaultIcon(program.type),
          duration: formatDuration(program.duration),
          level: program.difficulty || 'All Levels',
          calories: getCalorieRange(program.type),
          schedule: formatProgramSchedule(program.schedule),
          trainer: program.trainer?.fullName || 'Expert Trainer',
          benefits: program.benefits || getDefaultBenefits(program.type),
          equipment: getDefaultEquipment(program.type)
        }));
        setPrograms(mappedPrograms);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError('Failed to load programs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Helper functions
  const mapTypeToCategory = (type) => {
    const mapping = {
      'strength': 'strength',
      'cardio': 'cardio',
      'yoga': 'flexibility',
      'pilates': 'flexibility',
      'hiit': 'hiit',
      'crossfit': 'hiit',
      'swimming': 'aqua',
      'cycling': 'cardio',
      'boxing': 'cardio',
      'dance': 'cardio',
      'other': 'all'
    };
    return mapping[type] || 'all';
  };

  const getDefaultImage = (type) => {
    const images = {
      'strength': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      'cardio': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
      'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
      'hiit': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
      'swimming': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
      'boxing': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600',
      'cycling': 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600'
    };
    return images[type] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600';
  };

  const getDefaultIcon = (type) => {
    const icons = {
      'strength': '🏋️',
      'cardio': '❤️',
      'yoga': '🧘',
      'pilates': '🎯',
      'hiit': '🔥',
      'crossfit': '🏆',
      'swimming': '🏊',
      'boxing': '🥊',
      'cycling': '🚴',
      'dance': '💃'
    };
    return icons[type] || '💪';
  };

  const formatDuration = (duration) => {
    if (!duration) return '45-60 min';
    return `${duration} min`;
  };

  const getCalorieRange = (type) => {
    const ranges = {
      'strength': '300-500',
      'cardio': '350-500',
      'yoga': '150-250',
      'hiit': '400-600',
      'swimming': '400-600',
      'boxing': '400-600',
      'cycling': '400-700'
    };
    return ranges[type] || '300-400';
  };

  const formatProgramSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return 'Mon, Wed, Fri';
    const days = schedule.map(s => s.day?.substring(0, 3)).filter(Boolean);
    return days.length > 0 ? days.join(', ') : 'Mon, Wed, Fri';
  };

  const getDefaultBenefits = (type) => {
    const benefits = {
      'strength': ['Build Muscle', 'Increase Strength', 'Boost Metabolism', 'Improve Posture'],
      'cardio': ['Improve Heart Health', 'Burn Calories', 'Boost Mood', 'Increase Stamina'],
      'yoga': ['Increase Flexibility', 'Reduce Stress', 'Improve Balance', 'Mental Clarity'],
      'hiit': ['Burn Fat Fast', 'Improve Endurance', 'Time Efficient', 'Boost Energy'],
      'swimming': ['Low Impact', 'Joint Friendly', 'Full Body', 'Refreshing'],
      'boxing': ['Full Body Workout', 'Stress Relief', 'Coordination', 'Self Defense'],
      'cycling': ['Leg Strength', 'Cardio Endurance', 'Low Impact', 'Calorie Burn']
    };
    return benefits[type] || ['Improve Fitness', 'Build Strength', 'Boost Energy', 'Feel Great'];
  };

  const getDefaultEquipment = (type) => {
    const equipment = {
      'strength': ['Barbells', 'Dumbbells', 'Cable Machines', 'Squat Racks'],
      'cardio': ['Treadmills', 'Ellipticals', 'Step Platforms', 'Jump Ropes'],
      'yoga': ['Yoga Mats', 'Blocks', 'Straps', 'Bolsters'],
      'hiit': ['Kettlebells', 'Battle Ropes', 'Box Jumps', 'Medicine Balls'],
      'swimming': ['Pool Noodles', 'Water Dumbbells', 'Kickboards', 'Resistance Bands'],
      'boxing': ['Heavy Bags', 'Speed Bags', 'Boxing Gloves', 'Hand Wraps'],
      'cycling': ['Peloton Bikes', 'Heart Rate Monitors', 'Cycling Shoes']
    };
    return equipment[type] || ['Various Equipment'];
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const categories = [
    { id: 'all', name: 'All Programs', icon: '🏋️' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'cardio', name: 'Cardio', icon: '❤️' },
    { id: 'flexibility', name: 'Flexibility', icon: '🧘' },
    { id: 'hiit', name: 'HIIT', icon: '🔥' },
    { id: 'aqua', name: 'Aqua', icon: '🏊' },
  ];

  const filteredPrograms = selectedCategory === 'all' 
    ? programs 
    : programs.filter(p => p.category === selectedCategory);

  const [selectedProgram, setSelectedProgram] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-mesh">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-mesh">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Oops!</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-mesh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 right-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6">
              🏋️ Fitness Programs
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Find Your Perfect <span className="gradient-text">Workout</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose from our wide variety of programs designed for all fitness levels. 
              Whether you're a beginner or a pro, we have something for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-dark-600 sticky top-20 z-30 border-b border-white/10">
        <div className="section-container">
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredPrograms.map((program) => (
                <motion.div
                  key={program.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProgram(program)}
                  onMouseEnter={() => setHoveredProgram(program.id)}
                  onMouseLeave={() => setHoveredProgram(null)}
                >
                  <div className="glass-card overflow-hidden h-full">
                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={program.image} 
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-dark-500/50 to-transparent" />
                      
                      {/* Floating Icon */}
                      <motion.div 
                        className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg"
                        animate={hoveredProgram === program.id ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-2xl">{program.icon}</span>
                      </motion.div>

                      {/* Level Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          program.level === 'Advanced' 
                            ? 'bg-red-500/80 text-white' 
                            : program.level === 'Intermediate'
                            ? 'bg-accent-500/80 text-white'
                            : 'bg-secondary-500/80 text-white'
                        }`}>
                          {program.level}
                        </span>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{program.title}</h3>
                        <p className="text-gray-300 text-sm">with {program.trainer}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{program.description}</p>
                      
                      {/* Stats */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1.5 bg-dark-400 rounded-lg text-xs text-gray-300 flex items-center gap-1">
                          ⏱️ {program.duration}
                        </span>
                        <span className="px-3 py-1.5 bg-dark-400 rounded-lg text-xs text-gray-300 flex items-center gap-1">
                          🔥 {program.calories} cal
                        </span>
                        <span className="px-3 py-1.5 bg-dark-400 rounded-lg text-xs text-gray-300 flex items-center gap-1">
                          📅 {program.schedule}
                        </span>
                      </div>

                      {/* Benefits Preview */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {program.benefits.slice(0, 3).map((benefit, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                            {benefit}
                          </span>
                        ))}
                        {program.benefits.length > 3 && (
                          <span className="px-2 py-1 bg-dark-400 text-gray-400 rounded text-xs">
                            +{program.benefits.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="text-primary-400 text-sm font-medium group-hover:text-primary-300 transition-colors flex items-center gap-1">
                          View Details
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <Button variant="primary" size="sm">
                          Join Now
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Program Detail Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProgram(null)}
          >
            <motion.div
              className="bg-dark-500 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-64 md:h-80">
                <img 
                  src={selectedProgram.image} 
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-dark-500/50 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-dark-500/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-dark-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Title */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl">{selectedProgram.icon}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedProgram.title}</h2>
                      <p className="text-gray-300">with {selectedProgram.trainer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="glass-card p-4 text-center">
                    <span className="text-2xl mb-2 block">⏱️</span>
                    <p className="text-white font-semibold">{selectedProgram.duration}</p>
                    <p className="text-gray-400 text-xs">Duration</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <span className="text-2xl mb-2 block">📊</span>
                    <p className="text-white font-semibold">{selectedProgram.level}</p>
                    <p className="text-gray-400 text-xs">Level</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <span className="text-2xl mb-2 block">🔥</span>
                    <p className="text-white font-semibold">{selectedProgram.calories}</p>
                    <p className="text-gray-400 text-xs">Calories</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <span className="text-2xl mb-2 block">📅</span>
                    <p className="text-white font-semibold">{selectedProgram.schedule}</p>
                    <p className="text-gray-400 text-xs">Schedule</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-3">About This Program</h3>
                  <p className="text-gray-400 leading-relaxed">{selectedProgram.longDescription}</p>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-3">Benefits</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProgram.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-3">Equipment Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.equipment.map((item, idx) => (
                      <span key={idx} className="px-4 py-2 bg-dark-400 text-gray-300 rounded-lg text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="flex-1">
                    <Button variant="primary" className="w-full">
                      Join This Program
                    </Button>
                  </Link>
                  <Link to="/pricing" className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <section className="py-16 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: '12+', label: 'Programs', icon: '🏋️' },
              { number: '50+', label: 'Classes Weekly', icon: '📅' },
              { number: '100%', label: 'Expert Led', icon: '🏆' },
              { number: '24/7', label: 'Access', icon: '🔓' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card p-6 text-center"
              >
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <div className="text-3xl font-bold gradient-text">{stat.number}</div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Start Your <span className="gradient-text">Fitness Journey</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join FitZone today and get access to all programs, expert trainers, and a supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
