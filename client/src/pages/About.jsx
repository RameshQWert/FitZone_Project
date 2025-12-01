import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common';
import { Card, CardBody } from '../components/ui';

const About = () => {
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

  const timeline = [
    {
      year: '2008',
      title: 'The Beginning',
      description: 'FitZone was founded with a vision to make fitness accessible to everyone in our community.',
      icon: '🚀'
    },
    {
      year: '2012',
      title: 'First Expansion',
      description: 'Expanded our facility to include a swimming pool and dedicated yoga studio.',
      icon: '🏊'
    },
    {
      year: '2016',
      title: 'Going Digital',
      description: 'Launched our mobile app and digital member portal for seamless fitness tracking.',
      icon: '📱'
    },
    {
      year: '2020',
      title: 'Community Growth',
      description: 'Reached 5000+ active members and opened our second location.',
      icon: '🎉'
    },
    {
      year: '2024',
      title: 'Innovation Hub',
      description: 'Introduced AI-powered personal training and state-of-the-art recovery facilities.',
      icon: '🤖'
    },
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from equipment quality to member service.'
    },
    {
      icon: '🤝',
      title: 'Community',
      description: 'Building a supportive community where members encourage and inspire each other.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Continuously adopting new technologies and methods to enhance your fitness experience.'
    },
    {
      icon: '❤️',
      title: 'Wellness',
      description: 'Promoting holistic wellness that encompasses physical, mental, and emotional health.'
    },
  ];

  const facilities = [
    {
      title: 'Cardio Zone',
      description: 'Over 50 cardio machines including treadmills, ellipticals, bikes, and rowing machines.',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500',
      features: ['50+ Machines', 'Personal TVs', 'Heart Rate Monitoring']
    },
    {
      title: 'Weight Training',
      description: 'Complete free weight area with dumbbells up to 150lbs and Olympic lifting platforms.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
      features: ['Free Weights', 'Olympic Platforms', 'Cable Machines']
    },
    {
      title: 'Group Fitness Studios',
      description: 'Three dedicated studios for yoga, cycling, and high-intensity group classes.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
      features: ['3 Studios', '100+ Classes/Week', 'Premium Sound']
    },
    {
      title: 'Swimming Pool',
      description: 'Olympic-sized indoor pool with dedicated lap lanes and aqua fitness classes.',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500',
      features: ['Olympic Size', 'Heated', 'Aqua Classes']
    },
    {
      title: 'Recovery Center',
      description: 'Full recovery suite with saunas, steam rooms, and massage therapy.',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
      features: ['Sauna & Steam', 'Massage Rooms', 'Ice Bath']
    },
    {
      title: 'Functional Training',
      description: 'Dedicated space for CrossFit, TRX, kettlebells, and functional movement training.',
      image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500',
      features: ['CrossFit Rig', 'TRX Stations', 'Battle Ropes']
    },
  ];

  const equipment = [
    { name: 'Treadmills', brand: 'Life Fitness', count: 20, image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=300' },
    { name: 'Ellipticals', brand: 'Precor', count: 15, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300' },
    { name: 'Spin Bikes', brand: 'Peloton', count: 30, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300' },
    { name: 'Cable Machines', brand: 'Technogym', count: 10, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    { name: 'Smith Machines', brand: 'Hammer Strength', count: 5, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    { name: 'Dumbbells', brand: 'Rogue', count: '5-150 lbs', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    { name: 'Barbells', brand: 'Eleiko', count: 15, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    { name: 'Rowing Machines', brand: 'Concept2', count: 10, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
  ];

  const team = [
    {
      name: 'James Wilson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      bio: 'Former Olympic athlete with 20+ years in fitness industry.'
    },
    {
      name: 'Sarah Martinez',
      role: 'Operations Director',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      bio: 'MBA graduate with expertise in fitness center management.'
    },
    {
      name: 'Dr. Robert Kim',
      role: 'Head of Wellness',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
      bio: 'Sports medicine specialist ensuring member health and safety.'
    },
  ];

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

        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6">
                About FitZone
              </span>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
                Building a Healthier <span className="gradient-text">Community</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Since 2008, FitZone has been dedicated to transforming lives through fitness. 
                We believe everyone deserves access to world-class facilities and expert guidance 
                to achieve their health goals.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg">Join Our Family</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">Contact Us</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600"
                  alt="FitZone Gym"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 to-transparent" />
              </div>
              
              {/* Floating Card */}
              <motion.div 
                className="absolute -bottom-6 -left-6 glass-card p-6 z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold gradient-text">15+</div>
                  <div className="text-gray-400 text-sm">Years of<br/>Excellence</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-dark-500">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="glass-card p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To empower individuals of all fitness levels to achieve their health and wellness goals 
                through exceptional facilities, expert guidance, and a supportive community environment. 
                We are committed to making fitness accessible, enjoyable, and transformative for everyone.
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To become the most trusted and innovative fitness destination, recognized for transforming 
                lives and building the healthiest community. We envision a future where optimal health and 
                wellness are achievable for everyone, regardless of their starting point.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
              What Drives Us
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Our Core <span className="gradient-text">Values</span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <Card variant="glass" className="p-6 h-full text-center">
                  <CardBody className="p-0">
                    <span className="text-5xl mb-4 block">{value.icon}</span>
                    <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-400 text-sm">{value.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story Timeline - New Modern Design */}
      <section className="py-24 bg-dark-500 overflow-hidden">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-4">
              Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              The FitZone <span className="gradient-text">Story</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From humble beginnings to becoming the city's premier fitness destination.
            </p>
          </motion.div>

          {/* Modern Horizontal Timeline for Desktop */}
          <div className="hidden lg:block relative">
            {/* Timeline Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 transform -translate-y-1/2 rounded-full" />
            
            {/* Animated Glow on Track */}
            <motion.div 
              className="absolute top-1/2 left-0 w-20 h-1 bg-white rounded-full transform -translate-y-1/2 blur-sm"
              animate={{ x: ['0%', '1700%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <div className="flex justify-between relative">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, y: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  {/* Timeline Node */}
                  <motion.div 
                    className={`absolute top-1/2 transform -translate-y-1/2 z-20 ${
                      index % 2 === 0 ? '-mt-32' : 'mt-32'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  >
                    <div className="relative">
                      {/* Outer Glow Ring */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-md"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      {/* Main Node */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 border-4 border-dark-500">
                        <span className="text-white font-bold text-sm">{item.year}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Content Card */}
                  <motion.div 
                    className={`w-48 ${index % 2 === 0 ? 'mb-40' : 'mt-40'}`}
                    whileHover={{ scale: 1.05, y: index % 2 === 0 ? -5 : 5 }}
                  >
                    <div className="glass-card p-5 text-center relative overflow-hidden group">
                      {/* Hover Gradient Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Icon */}
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{item.icon || '🎯'}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                      
                      {/* Connector Line */}
                      <div className={`absolute left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary-500 to-transparent transform -translate-x-1/2 ${
                        index % 2 === 0 ? 'bottom-0 translate-y-full' : 'top-0 -translate-y-full rotate-180'
                      }`} />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline - Vertical */}
          <div className="lg:hidden relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500 rounded-full" />

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex gap-6 relative"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg border-4 border-dark-500"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-white font-bold text-xs">{item.year}</span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <motion.div 
                    className="flex-1 glass-card p-5"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{item.icon || '🎯'}</span>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-4">
              World-Class Amenities
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Our <span className="gradient-text">Facilities</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience fitness like never before with our state-of-the-art facilities.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="glass-card overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={facility.image} 
                      alt={facility.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{facility.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{facility.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {facility.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Equipment Gallery */}
      <section className="py-24 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-4">
              Premium Equipment
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Equipment <span className="gradient-text">Gallery</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We invest in the best equipment from world-renowned brands to ensure your workout is effective and safe.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {equipment.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="w-full h-24 bg-dark-400 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl">🏋️</span>
                </div>
                <h4 className="text-white font-semibold mb-1">{item.name}</h4>
                <p className="text-gray-400 text-sm">{item.brand}</p>
                <p className="text-primary-400 text-xs mt-1">{item.count} units</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-dark-600">
        <div className="section-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-4">
              Leadership
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <div className="glass-card overflow-hidden text-center">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent" />
                  </div>
                  <div className="p-6 -mt-8 relative z-10">
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-primary-400 text-sm mb-2">{member.role}</p>
                    <p className="text-gray-400 text-sm">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-dark-500">
        <div className="section-container">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: '5000+', label: 'Happy Members', icon: '👥' },
              { number: '50+', label: 'Expert Staff', icon: '🏆' },
              { number: '25000', label: 'Sq. Ft. Space', icon: '🏢' },
              { number: '98%', label: 'Satisfaction Rate', icon: '⭐' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card p-8 text-center"
              >
                <span className="text-4xl mb-2 block">{stat.icon}</span>
                <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                <p className="text-gray-400">{stat.label}</p>
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
            className="glass-card p-12 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold text-white mb-6">
              Ready to Start Your <span className="gradient-text">Journey</span>?
            </h2>
            <p className="text-gray-400 mb-8">
              Visit our facility for a free tour and consultation with our fitness experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Join Today
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Schedule a Tour
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
