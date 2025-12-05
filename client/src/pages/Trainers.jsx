import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Loading } from '../components/common';
import { trainerService } from '../services';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getAll();
        // Map API data to expected format
        // Trainer model has: name, image, email, phone, specializations, experience, bio, rating, socialMedia, achievements
        const mappedTrainers = data.map((trainer, index) => ({
          id: trainer._id,
          name: trainer.name || trainer.fullName || trainer.user?.fullName || 'Unknown Trainer',
          role: trainer.specializations?.[0] || 'Trainer',
          specialty: mapSpecializationToFilter(trainer.specializations?.[0]),
          image: trainer.image || trainer.avatar || trainer.user?.avatar || `https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop`,
          bio: trainer.bio || 'Dedicated fitness professional committed to helping you achieve your goals.',
          certifications: trainer.achievements || [],
          experience: `${trainer.experience || 0}+ years`,
          clients: `${trainer.totalClients || 100}+`,
          rating: trainer.rating || 4.8,
          reviews: trainer.totalReviews || Math.floor(Math.random() * 100) + 50,
          specialties: trainer.specializations || [],
          schedule: formatSchedule(trainer.availability),
          instagram: trainer.socialMedia?.instagram || '',
          twitter: trainer.socialMedia?.twitter || '',
          achievements: trainer.achievements || [],
          quote: trainer.bio?.substring(0, 80) + '...' || 'Transform your body, transform your life.',
          email: trainer.email || trainer.user?.email || '',
          phone: trainer.phone || trainer.user?.phone || '',
        }));
        setTrainers(mappedTrainers);
      } catch (err) {
        console.error('Error fetching trainers:', err);
        setError('Failed to load trainers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Helper function to map specialization to filter
  const mapSpecializationToFilter = (specialization) => {
    const mapping = {
      'Strength Training': 'strength',
      'Weight Training': 'strength',
      'Yoga': 'yoga',
      'Pilates': 'yoga',
      'HIIT': 'hiit',
      'CrossFit': 'hiit',
      'Nutrition': 'nutrition',
      'Boxing': 'boxing',
      'MMA': 'boxing',
      'Cardio': 'cardio',
      'Spinning': 'cardio',
      'Meditation': 'wellness',
      'Flexibility': 'wellness',
      'Rehabilitation': 'wellness',
    };
    return mapping[specialization] || 'strength';
  };

  // Helper function to format schedule - returns array for modal display
  const formatSchedule = (availability) => {
    if (!availability || availability.length === 0) {
      return ['Mon-Fri: 6AM-8PM'];
    }
    return availability.map(a => `${a.day}: ${a.startTime || '6AM'} - ${a.endTime || '8PM'}`);
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

  const specialties = [
    { id: 'all', name: 'All Trainers', icon: '👥' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'yoga', name: 'Yoga & Pilates', icon: '🧘' },
    { id: 'hiit', name: 'HIIT', icon: '🔥' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'boxing', name: 'Boxing/MMA', icon: '🥊' },
    { id: 'cardio', name: 'Cardio', icon: '🚴' },
    { id: 'wellness', name: 'Wellness', icon: '💚' },
  ];

  const filteredTrainers = filterSpecialty === 'all' 
    ? trainers 
    : trainers.filter(t => t.specialty === filterSpecialty);

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
            className="absolute top-20 right-20 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
            transition={{ duration: 18, repeat: Infinity }}
          />
        </div>

        <div className="section-container relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-6">
              🏋️ Expert Team
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Meet Our <span className="gradient-text">World-Class Trainers</span>
            </h1>
            <p className="text-xl text-gray-400">
              Our certified fitness professionals are passionate about helping you achieve your goals. 
              Find the perfect trainer to guide your fitness journey.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { value: '50+', label: 'Expert Trainers' },
              { value: '25+', label: 'Specializations' },
              { value: '4.9', label: 'Average Rating' },
              { value: '10K+', label: 'Happy Clients' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card p-6 text-center"
              >
                <span className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</span>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-dark-600 sticky top-20 z-30">
        <div className="section-container">
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {specialties.map((specialty) => (
              <motion.button
                key={specialty.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterSpecialty(specialty.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  filterSpecialty === specialty.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-white'
                }`}
              >
                <span>{specialty.icon}</span>
                <span>{specialty.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-16 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredTrainers.map((trainer) => (
                <motion.div
                  key={trainer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  className="glass-card overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={trainer.image} 
                      alt={trainer.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-transparent to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-dark-500/80 backdrop-blur-sm rounded-full flex items-center gap-1">
                      <span className="text-accent-400">⭐</span>
                      <span className="text-white text-sm font-medium">{trainer.rating}</span>
                    </div>

                    {/* Social Icons - Show on Hover */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <a href="#" className="p-2 bg-dark-500/80 backdrop-blur-sm rounded-lg hover:bg-primary-500 transition-colors">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a href="#" className="p-2 bg-dark-500/80 backdrop-blur-sm rounded-lg hover:bg-primary-500 transition-colors">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{trainer.name}</h3>
                    <p className="text-primary-400 text-sm mb-3">{trainer.role}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trainer.specialties.slice(0, 2).map((spec, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-dark-400 text-gray-400 rounded-lg text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>📅 {trainer.experience}</span>
                      <span>👥 {trainer.clients} clients</span>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mt-4" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrainer(trainer);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Trainer Detail Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-500/90 backdrop-blur-sm"
            onClick={() => setSelectedTrainer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-dark-400 rounded-full hover:bg-dark-300 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side - Image */}
                <div className="relative h-64 md:h-auto">
                  <img 
                    src={selectedTrainer.image} 
                    alt={selectedTrainer.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-dark-500 via-dark-500/50 to-transparent" />
                  
                  {/* Quote Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 md:hidden">
                    <p className="text-white/90 italic text-sm">"{selectedTrainer.quote}"</p>
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-secondary-500/20 text-secondary-400 rounded-lg text-xs">
                        {selectedTrainer.role}
                      </span>
                      <div className="flex items-center gap-1 text-accent-400">
                        <span>⭐</span>
                        <span className="text-sm">{selectedTrainer.rating}</span>
                        <span className="text-gray-400 text-xs">({selectedTrainer.reviews} reviews)</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">{selectedTrainer.name}</h2>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-400 mb-6">{selectedTrainer.bio}</p>

                  {/* Quote - Desktop */}
                  <div className="hidden md:block mb-6 p-4 bg-primary-500/10 border-l-4 border-primary-500 rounded-r-lg">
                    <p className="text-white/90 italic">"{selectedTrainer.quote}"</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-dark-400 rounded-xl">
                      <span className="text-xl font-bold gradient-text">{selectedTrainer.experience}</span>
                      <p className="text-gray-400 text-xs mt-1">Experience</p>
                    </div>
                    <div className="text-center p-3 bg-dark-400 rounded-xl">
                      <span className="text-xl font-bold gradient-text">{selectedTrainer.clients}</span>
                      <p className="text-gray-400 text-xs mt-1">Clients</p>
                    </div>
                    <div className="text-center p-3 bg-dark-400 rounded-xl">
                      <span className="text-xl font-bold gradient-text">{selectedTrainer.rating}</span>
                      <p className="text-gray-400 text-xs mt-1">Rating</p>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrainer.specialties.map((spec, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {selectedTrainer.certifications?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrainer.certifications.map((cert, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-dark-400 text-gray-300 rounded-lg text-sm"
                          >
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {selectedTrainer.achievements?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">Achievements</h3>
                      <ul className="space-y-2">
                        {selectedTrainer.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-400 text-sm">
                            <span className="text-accent-400">🏆</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">Schedule</h3>
                    <div className="space-y-1">
                      {selectedTrainer.schedule?.map((time, idx) => (
                        <p key={idx} className="text-gray-400 text-sm flex items-center gap-2">
                          <span>📅</span> {time}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Link to="/register" className="flex-1">
                      <Button variant="primary" className="w-full">
                        Book Session
                      </Button>
                    </Link>
                    <Button variant="outline">
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Our Team Section */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
                🌟 Join Our Team
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                Are You a Fitness <span className="gradient-text">Professional</span>?
              </h2>
              <p className="text-gray-400 mb-6">
                We're always looking for passionate, certified trainers to join our team. 
                If you love helping people transform their lives through fitness, we want to hear from you.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Competitive compensation packages',
                  'Flexible scheduling options',
                  'Access to premium facilities',
                  'Continuing education support',
                  'Build your personal brand',
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link to="/contact">
                <Button variant="primary" size="lg">
                  Apply Now →
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop" 
                  alt="Training session"
                  className="rounded-2xl h-48 w-full object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=300&fit=crop" 
                  alt="Group fitness"
                  className="rounded-2xl h-40 w-full object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img 
                  src="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=300&h=300&fit=crop" 
                  alt="Personal training"
                  className="rounded-2xl h-40 w-full object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=400&fit=crop" 
                  alt="Spin class"
                  className="rounded-2xl h-48 w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark-500 relative overflow-hidden">
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
              Ready to Start Your <span className="gradient-text">Transformation</span>?
            </h2>
            <p className="text-gray-400 mb-8">
              Book a free consultation with one of our expert trainers and take the first step towards your fitness goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Book Free Consultation
                </Button>
              </Link>
              <Link to="/programs">
                <Button variant="outline" size="lg">
                  View Programs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Trainers;
