import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineLocationMarker,
  HiOutlineCheck,
  HiOutlineCog,
  HiOutlineExclamation,
  HiOutlineSearch,
  HiOutlineFilter,
} from 'react-icons/hi';
import api from '../services/api';

const Facilities = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Cardio', 'Strength', 'Free Weights', 'Machines', 'Accessories', 'Other'];

  const categoryEmojis = {
    'Cardio': '🏃',
    'Strength': '💪',
    'Free Weights': '🏋️',
    'Machines': '⚙️',
    'Accessories': '🎯',
    'Other': '📦',
  };

  const categoryColors = {
    'Cardio': 'from-red-500 to-orange-500',
    'Strength': 'from-blue-500 to-indigo-500',
    'Free Weights': 'from-purple-500 to-pink-500',
    'Machines': 'from-green-500 to-teal-500',
    'Accessories': 'from-yellow-500 to-amber-500',
    'Other': 'from-gray-500 to-slate-500',
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get('/equipment');
      // Only show available equipment to users
      const availableEquipment = (response.data.data || []).filter(
        (item) => item.status === 'available' || item.status === 'in_use'
      );
      setEquipment(availableEquipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group equipment by category
  const groupedEquipment = categories.reduce((acc, category) => {
    const items = filteredEquipment.filter((item) => item.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {});

  // Stats
  const stats = {
    totalEquipment: equipment.length,
    cardioMachines: equipment.filter((e) => e.category === 'Cardio').length,
    strengthEquipment: equipment.filter((e) => e.category === 'Strength' || e.category === 'Free Weights').length,
    locations: [...new Set(equipment.map((e) => e.location))].length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-900 to-secondary-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-6">
              🏋️ World-Class Facilities
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              State-of-the-Art{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                Equipment
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Train with the best equipment in the industry. Our gym features premium machines 
              and tools to help you achieve your fitness goals.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12"
          >
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-dark-700">
              <div className="text-3xl font-bold text-primary-400 mb-1">{stats.totalEquipment}+</div>
              <div className="text-gray-400 text-sm">Equipment Pieces</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-dark-700">
              <div className="text-3xl font-bold text-secondary-400 mb-1">{stats.cardioMachines}</div>
              <div className="text-gray-400 text-sm">Cardio Machines</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-dark-700">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.strengthEquipment}</div>
              <div className="text-gray-400 text-sm">Strength Equipment</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-dark-700">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.locations}</div>
              <div className="text-gray-400 text-sm">Training Zones</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-dark-700 bg-dark-800/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                }`}
              >
                All Equipment
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {categoryEmojis[category]} {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipment by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {Object.keys(groupedEquipment).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No equipment found matching your criteria.</p>
            </div>
          ) : (
            Object.entries(groupedEquipment).map(([category, items], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryColors[category]} flex items-center justify-center text-2xl`}>
                    {categoryEmojis[category]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category}</h2>
                    <p className="text-gray-400">{items.length} equipment items</p>
                  </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all group"
                    >
                      {/* Image/Placeholder */}
                      <div className={`h-40 bg-gradient-to-br ${categoryColors[category]} opacity-80 flex items-center justify-center relative overflow-hidden`}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl opacity-50">{categoryEmojis[category]}</span>
                        )}
                        {/* Quantity Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-dark-900/80 rounded-full text-xs font-medium text-white">
                          {item.quantity} available
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {item.description || 'Premium fitness equipment for your workout needs.'}
                        </p>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <HiOutlineLocationMarker className="w-4 h-4 text-primary-400" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-dark-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Why Our Facilities Stand Out</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We invest in the best equipment and maintain them regularly to ensure your safety and optimal performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheck className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Brands</h3>
              <p className="text-gray-400 text-sm">
                All equipment from top fitness brands like Life Fitness, Hammer Strength, and Technogym.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineCog className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Regular Maintenance</h3>
              <p className="text-gray-400 text-sm">
                All machines are serviced regularly to ensure smooth operation and your safety.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-dark-800 rounded-2xl p-6 border border-dark-700 text-center"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineExclamation className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sanitized Daily</h3>
              <p className="text-gray-400 text-sm">
                Equipment is cleaned and sanitized multiple times daily for your health and safety.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience Our Facilities?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join FitZone today and get access to all our premium equipment and facilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/pricing"
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                View Membership Plans
              </a>
              <a
                href="/contact"
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Book a Tour
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Facilities;
