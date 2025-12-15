import React, { useState, useEffect, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common';
import { Card, CardBody } from '../components/ui';
import { trainerService } from '../services';
import api from '../services/api';

// Memoized static data to prevent re-creation on each render
const features = [
  {
    icon: '💪',
    title: 'Modern Equipment',
    description: 'State-of-the-art fitness machines and free weights for all your training needs.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: '👨‍🏫',
    title: 'Expert Trainers',
    description: 'Certified personal trainers to guide you through your fitness journey.',
    color: 'from-secondary-500 to-secondary-600'
  },
  {
    icon: '🧘',
    title: 'Diverse Classes',
    description: 'From yoga to HIIT, we offer a wide variety of group fitness classes.',
    color: 'from-accent-500 to-accent-600'
  },
  {
    icon: '📱',
    title: 'Track Progress',
    description: 'Monitor your fitness goals and achievements with our digital platform.',
    color: 'from-purple-500 to-purple-600'
  },
];

const stats = [
  { number: '5000+', label: 'Active Members', icon: '👥' },
  { number: '50+', label: 'Expert Trainers', icon: '🏆' },
  { number: '100+', label: 'Weekly Classes', icon: '📅' },
  { number: '15+', label: 'Years Experience', icon: '⭐' },
];

const programs = [
  {
    title: 'Strength Training',
    description: 'Build muscle and increase strength with our comprehensive weight training programs.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=60',
    duration: '45-60 min',
    level: 'All Levels',
    calories: '300-500'
  },
  {
    title: 'HIIT Workouts',
    description: 'High-intensity interval training to maximize calorie burn and improve endurance.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=60',
    duration: '30-45 min',
    level: 'Intermediate',
    calories: '400-600'
  },
  {
    title: 'Yoga & Meditation',
    description: 'Find balance and flexibility with our calming yoga and meditation sessions.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=60',
    duration: '60 min',
    level: 'All Levels',
    calories: '150-250'
  },
  {
    title: 'Cardio Classes',
    description: 'Get your heart pumping with our energetic cardio and dance fitness classes.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=60',
    duration: '45 min',
    level: 'All Levels',
    calories: '350-500'
  },
  {
    title: 'CrossFit',
    description: 'Challenge yourself with varied functional movements at high intensity.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&q=60',
    duration: '60 min',
    level: 'Advanced',
    calories: '500-700'
  },
  {
    title: 'Swimming',
    description: 'Low-impact full-body workout in our Olympic-sized swimming pool.',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&q=60',
    duration: '45-60 min',
    level: 'All Levels',
    calories: '400-600'
  },
];

const defaultTestimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Member since 2022',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=60',
    content: 'FitZone completely transformed my life! I\'ve lost 30 pounds and gained so much confidence. The trainers are amazing and the community is so supportive.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Member since 2021',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=60',
    content: 'Best gym I\'ve ever been to. The equipment is top-notch, classes are varied and fun, and the staff genuinely cares about your progress.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Member since 2023',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=60',
    content: 'As a beginner, I was nervous to join a gym. FitZone made me feel welcome from day one. Now I can\'t imagine my life without it!',
    rating: 5
  },
  {
    name: 'David Thompson',
    role: 'Member since 2020',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=60',
    content: 'The personal training here is exceptional. My trainer designed a program perfect for my goals and I\'ve seen incredible results.',
    rating: 5
  },
];

const defaultTrainers = [
  { name: 'John Martinez', specialty: 'Strength & Conditioning', image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&q=60', experience: '10+ years' },
  { name: 'Lisa Park', specialty: 'Yoga & Pilates', image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&q=60', experience: '8+ years' },
  { name: 'Marcus Williams', specialty: 'HIIT & CrossFit', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=60', experience: '12+ years' },
  { name: 'Anna Schmidt', specialty: 'Nutrition & Wellness', image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=300&q=60', experience: '7+ years' },
];

// Simplified animation variants for better performance
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const Home = () => {
  const [trainers, setTrainers] = useState(defaultTrainers);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  // Fetch trainers from database
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await trainerService.getAll();
        const mappedTrainers = data.slice(0, 4).map((trainer) => ({
          name: trainer.name || trainer.fullName || trainer.user?.fullName || 'Trainer',
          specialty: trainer.specializations?.[0] || 'Personal Training',
          image: trainer.image || trainer.avatar || trainer.user?.avatar || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&q=60',
          experience: `${trainer.experience || 1}+ years`
        }));
        if (mappedTrainers.length > 0) {
          setTrainers(mappedTrainers);
        }
      } catch (error) {
        console.error('Error fetching trainers:', error);
      } finally {
        setLoadingTrainers(false);
      }
    };
    fetchTrainers();
  }, []);

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/site-content/testimonials');
        if (response.data.data && response.data.data.length > 0) {
          setTestimonials(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-mesh overflow-hidden">
        {/* Static Background Elements - Removed animations for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="section-container relative z-10 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6">
                🏋️ #1 Fitness Center in the City
              </span>
              <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
                <span className="text-white">Unleash Your</span>
                <br />
                <span className="gradient-text">Full Potential</span>
              </h1>
              <p className="text-xl text-gray-400 mb-10">
                Join FitZone and experience world-class fitness facilities, expert trainers,
                and a community dedicated to helping you achieve your health goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg" className="group">
                    Start Your Journey
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link to="/programs">
                  <Button variant="outline" size="lg">
                    Explore Classes
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Hero Image/Animation */}
            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Main Image */}
                <motion.div 
                  className="relative z-10 rounded-3xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" 
                    alt="Fitness Training"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 to-transparent" />
                </motion.div>

                {/* Floating Stats Cards */}
                <motion.div 
                  className="absolute -left-10 top-20 glass-card p-4 z-20"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">500+</p>
                      <p className="text-gray-400 text-sm">Calories Burned</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -right-10 bottom-32 glass-card p-4 z-20"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💪</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">50+</p>
                      <p className="text-gray-400 text-sm">Classes Weekly</p>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute -z-10 -bottom-10 -right-10 w-72 h-72 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full blur-3xl" />
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 text-center group hover:bg-white/10 transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.number}</div>
                <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide all the tools, guidance, and support you need to reach your fitness goals.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <Card variant="glass" hover className="p-6 h-full">
                  <CardBody className="p-0 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-4">
              Our Programs
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Find Your Perfect <span className="gradient-text">Workout</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose from our wide variety of programs designed for all fitness levels.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {programs.map((program, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="glass-card overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={program.image} 
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{program.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-400 text-sm mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                        ⏱️ {program.duration}
                      </span>
                      <span className="px-3 py-1 bg-secondary-500/20 text-secondary-400 rounded-full text-xs">
                        📊 {program.level}
                      </span>
                      <span className="px-3 py-1 bg-accent-500/20 text-accent-400 rounded-full text-xs">
                        🔥 {program.calories} cal
                      </span>
                    </div>
                    <Link to="/classes" className="text-primary-400 hover:text-primary-300 font-medium text-sm flex items-center">
                      Learn More
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/classes">
              <Button variant="outline" size="lg">
                View All Programs
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trainers Preview Section */}
      <section className="py-24 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
              Expert Team
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Meet Our <span className="gradient-text">Trainers</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our certified professionals are here to guide and motivate you every step of the way.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {trainers.map((trainer, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="glass-card overflow-hidden text-center">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={trainer.image} 
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 -mt-10 relative z-10">
                    <h3 className="text-lg font-bold text-white mb-1">{trainer.name}</h3>
                    <p className="text-primary-400 text-sm mb-2">{trainer.specialty}</p>
                    <p className="text-gray-400 text-xs">{trainer.experience} experience</p>
                    <div className="flex justify-center gap-3 mt-4">
                      <a href="#" className="w-8 h-8 bg-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                      </a>
                      <a href="#" className="w-8 h-8 bg-dark-400 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/trainers">
              <Button variant="outline" size="lg">
                Meet All Trainers
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              What Our Members <span className="gradient-text">Say</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from our community about their fitness transformation journey with FitZone.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <div className="glass-card p-8 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-gray-300 italic">
                    "{testimonial.content}"
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 via-secondary-600/20 to-primary-600/30" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative z-10">
          <motion.div 
            className="glass-card p-12 md:p-16 text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Ready to <span className="gradient-text">Transform</span> Your Life?
            </motion.h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of members who have already started their fitness journey. 
              Get your first month at 50% off!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" className="group">
                  Start Free Trial
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-dark-500 border-t border-white/10">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-gray-400">
                Get fitness tips, workout plans, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="input-field flex-1 md:w-80"
              />
              <Button variant="primary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
