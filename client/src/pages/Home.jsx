import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Hero slides with fitness images
  const heroSlides = [
    {
      title: "IGNITE YOUR",
      highlight: "POTENTIAL",
      subtitle: "Transform your body, elevate your mind, unleash your inner champion",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
    },
    {
      title: "PUSH YOUR",
      highlight: "LIMITS",
      subtitle: "Every rep counts. Every drop of sweat matters. Your journey starts here.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80",
    },
    {
      title: "BECOME",
      highlight: "UNSTOPPABLE",
      subtitle: "Join the elite. Train with the best. Achieve the impossible.",
      image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1920&q=80",
    }
  ];

  // Stats
  const stats = [
    { number: "10K+", label: "Active Members", icon: "👥" },
    { number: "50+", label: "Expert Trainers", icon: "🏆" },
    { number: "100+", label: "Weekly Classes", icon: "📅" },
    { number: "99%", label: "Success Rate", icon: "⭐" }
  ];

  // Features
  const features = [
    { icon: "🏋️", title: "Premium Equipment", description: "State-of-the-art machines and free weights for every workout style", color: "from-red-500 to-orange-500" },
    { icon: "👨‍🏫", title: "Expert Coaching", description: "Certified trainers to guide and push you towards your goals", color: "from-orange-500 to-yellow-500" },
    { icon: "🥗", title: "Nutrition Plans", description: "Customized meal plans designed for your fitness objectives", color: "from-emerald-500 to-teal-500" },
    { icon: "💪", title: "Personal Training", description: "One-on-one sessions tailored to your specific needs", color: "from-cyan-500 to-blue-500" },
    { icon: "📱", title: "Mobile App", description: "Track workouts, book classes, and monitor progress anywhere", color: "from-violet-500 to-purple-500" },
    { icon: "🧘", title: "Wellness Programs", description: "Yoga, meditation, and recovery sessions for total wellness", color: "from-pink-500 to-rose-500" },
    { icon: "🏃", title: "Group Classes", description: "High-energy group workouts to keep you motivated", color: "from-red-500 to-pink-500" },
    { icon: "🎯", title: "Goal Tracking", description: "Advanced metrics and progress tracking to celebrate wins", color: "from-amber-500 to-orange-500" }
  ];

  // Programs
  const programs = [
    { 
      title: "Strength Training", 
      description: "Build muscle, increase power, and sculpt your physique with our comprehensive strength programs.",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&q=80",
      duration: "45-60 min",
      level: "All Levels",
      calories: "400-600",
      gradient: "from-red-600/90 to-orange-600/90"
    },
    { 
      title: "HIIT Cardio", 
      description: "Torch calories and boost metabolism with high-intensity interval training sessions.",
      image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&q=80",
      duration: "30-45 min",
      level: "Intermediate",
      calories: "500-800",
      gradient: "from-orange-600/90 to-yellow-600/90"
    },
    { 
      title: "CrossFit", 
      description: "Functional fitness at its best. Challenge yourself with varied, high-intensity workouts.",
      image: "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=800&q=80",
      duration: "60 min",
      level: "Advanced",
      calories: "600-900",
      gradient: "from-emerald-600/90 to-teal-600/90"
    },
    { 
      title: "Yoga & Pilates", 
      description: "Improve flexibility, core strength, and mental clarity through mindful movement.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      duration: "45-60 min",
      level: "All Levels",
      calories: "200-400",
      gradient: "from-violet-600/90 to-purple-600/90"
    },
    { 
      title: "Boxing & MMA", 
      description: "Learn combat techniques while getting an incredible full-body workout.",
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
      duration: "45-60 min",
      level: "All Levels",
      calories: "500-700",
      gradient: "from-rose-600/90 to-red-600/90"
    },
    { 
      title: "Spin Classes", 
      description: "High-energy cycling workouts with pumping music and motivating instructors.",
      image: "https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=800&q=80",
      duration: "45 min",
      level: "All Levels",
      calories: "400-600",
      gradient: "from-cyan-600/90 to-blue-600/90"
    }
  ];

  // Trainers
  const trainers = [
    { name: "Marcus Johnson", specialty: "Strength & Conditioning", experience: "12+ years", image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80" },
    { name: "Sarah Chen", specialty: "Yoga & Wellness", experience: "8+ years", image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80" },
    { name: "David Williams", specialty: "CrossFit & HIIT", experience: "10+ years", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
    { name: "Emily Rodriguez", specialty: "Boxing & MMA", experience: "9+ years", image: "https://images.unsplash.com/photo-1609138617989-de8d50d0e4ff?w=400&q=80" }
  ];

  // Testimonials
  const testimonials = [
    { name: "Alex Thompson", role: "Lost 30 lbs in 4 months", content: "FitZone completely transformed my life. The trainers pushed me beyond my limits, and the results speak for themselves. I've never felt stronger or more confident!", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating: 5 },
    { name: "Jennifer Martinez", role: "Marathon Runner", content: "The facilities are world-class and the community is incredibly supportive. Training here helped me achieve my dream of completing my first marathon!", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", rating: 5 },
    { name: "Michael Brown", role: "Fitness Enthusiast", content: "I've tried many gyms, but FitZone stands out. The variety of classes, equipment quality, and personal attention from staff is unmatched.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", rating: 5 },
    { name: "Lisa Chen", role: "Working Professional", content: "As a busy professional, I need efficiency. FitZone's early morning classes and flexible scheduling have made fitness a seamless part of my routine.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating: 5 }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="relative overflow-hidden">
      {/* HERO SECTION - Full screen with dynamic background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Slides */}
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.1
            }}
            transition={{ duration: 1 }}
          >
            <img 
              src={slide.image} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}

        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-600/30 via-orange-500/20 to-transparent rounded-full blur-3xl"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.div 
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-600/30 via-red-500/20 to-transparent rounded-full blur-3xl"
            animate={{ 
              rotate: -360,
              scale: [1.2, 1, 1.2]
            }}
            transition={{ 
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-yellow-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl"
            animate={{ 
              y: [0, -50, 0],
              x: [0, 30, 0]
            }}
            transition={{ 
              duration: 15, repeat: Infinity, ease: "easeInOut"
            }}
          />
        </div>

        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ opacity }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full border border-orange-500/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-medium tracking-wider uppercase">Welcome to FitZone</span>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-white block">{heroSlides[currentSlide].title}</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  {heroSlides[currentSlide].highlight}
                </span>
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-pink-500/30 blur-2xl -z-10"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link to="/register">
                <motion.button 
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl font-bold text-white text-lg overflow-hidden shadow-lg shadow-orange-500/30"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Your Journey
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
              <Link to="/programs">
                <motion.button 
                  className="group px-8 py-4 border-2 border-white/30 hover:border-orange-500 rounded-xl font-bold text-white text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Explore Programs
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-20"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="relative group"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                <div className="relative p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-orange-500/50 transition-all">
                  <span className="text-2xl md:text-3xl mb-2 block">{stat.icon}</span>
                  <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm mt-1 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'w-8 bg-gradient-to-r from-orange-500 to-red-500' 
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-gray-400 tracking-widest rotate-90 origin-center mb-8">SCROLL</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-orange-500 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION - Why Choose Us */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <div className="absolute top-1/4 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-orange-400">⚡</span>
              <span className="text-orange-400">Why Choose FitZone</span>
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We provide world-class facilities, expert guidance, and a supportive community to help you achieve your fitness goals.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="relative h-full p-6 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 overflow-hidden">
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section className="py-24 relative overflow-hidden bg-black">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-red-400">🔥</span>
              <span className="text-red-400">Our Programs</span>
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Workout
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From strength training to yoga, we offer diverse programs to match your fitness style and goals.
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
                <div className="relative h-full rounded-2xl overflow-hidden">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={program.image} 
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${program.gradient}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-white mb-2">{program.title}</h3>
                    <p className="text-gray-200 text-sm mb-4 line-clamp-2">{program.description}</p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                        ⏱️ {program.duration}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                        📊 {program.level}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                        🔥 {program.calories} cal
                      </span>
                    </div>
                    
                    <Link 
                      to="/programs" 
                      className="inline-flex items-center text-white font-semibold hover:text-orange-400 transition-colors"
                    >
                      Learn More
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <Link to="/programs">
              <motion.button 
                className="px-8 py-4 border-2 border-orange-500/50 hover:border-orange-500 rounded-xl font-bold text-white hover:bg-orange-500/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                View All Programs
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TRAINERS SECTION */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-950 to-black">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-amber-400">🏆</span>
              <span className="text-amber-400">Expert Team</span>
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Trainers
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our certified professionals are dedicated to helping you achieve your fitness goals with personalized guidance.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
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
                <div className="relative rounded-2xl overflow-hidden">
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={trainer.image} 
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{trainer.name}</h3>
                    <p className="text-orange-400 text-sm font-medium mb-1">{trainer.specialty}</p>
                    <p className="text-gray-400 text-xs">{trainer.experience} experience</p>
                    
                    {/* Social Links */}
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <a href="#" className="w-8 h-8 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center text-white transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                      </a>
                      <a href="#" className="w-8 h-8 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center text-white transition-colors">
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
              <motion.button 
                className="px-8 py-4 border-2 border-amber-500/50 hover:border-amber-500 rounded-xl font-bold text-white hover:bg-amber-500/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Meet All Trainers
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-black to-gray-950">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-400">💬</span>
              <span className="text-emerald-400">Testimonials</span>
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Success{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Stories
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Hear from our members about their incredible transformation journeys with FitZone.
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
                <div className="relative h-full p-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 text-4xl text-emerald-500/20">"</div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50"
                    />
                    <div>
                      <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-emerald-400 text-sm">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-gray-300 text-lg leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600">
          <motion.div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')] bg-cover bg-center opacity-20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-20 -left-20 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-2xl">🚀</span>
              <span className="text-white font-medium">Limited Time Offer</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Ready to{' '}
              <span className="relative inline-block">
                Transform
                <motion.div 
                  className="absolute -inset-1 bg-white/20 blur-lg -z-10"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
              {' '}Your Life?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of members who have already started their fitness journey. 
              <span className="font-bold text-yellow-300"> Get your first month at 50% off!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button 
                  className="group px-10 py-5 bg-white text-gray-900 rounded-xl font-bold text-lg shadow-2xl shadow-black/30"
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-2">
                    Start Free Trial
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </motion.button>
              </Link>
              <Link to="/pricing">
                <motion.button 
                  className="px-10 py-5 border-2 border-white/50 hover:border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Pricing Plans
                </motion.button>
              </Link>
            </div>

            <p className="text-white/60 text-sm mt-8">
              ✓ No credit card required &nbsp; ✓ Cancel anytime &nbsp; ✓ 7-day money back guarantee
            </p>
          </motion.div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="py-16 bg-gray-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Stay <span className="text-orange-400">Motivated</span>
              </h3>
              <p className="text-gray-400">
                Get fitness tips, workout plans, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 lg:w-80 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <motion.button 
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold text-white shadow-lg shadow-orange-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
