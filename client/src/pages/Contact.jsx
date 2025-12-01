import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/common';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['Lovely Professional University', 'Phagwara, Punjab 144411'],
      action: 'Get Directions',
      link: 'https://www.google.com/maps?q=31.252814674821924,75.70477938132755'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+91 9430260097', '+91 9939896403'],
      action: 'Call Now',
      link: 'tel:+919430260097'
    },
    {
      icon: '✉️',
      title: 'Email Us',
      details: ['rameshlpu779@gmail.com', 'support@fitzone.com'],
      action: 'Send Email',
      link: 'mailto:rameshlpu779@gmail.com'
    },
    {
      icon: '⏰',
      title: 'Working Hours',
      details: ['Mon-Fri: 5AM - 11PM', 'Sat-Sun: 6AM - 10PM'],
      action: 'View Schedule',
      link: '/schedule'
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com' },
    { name: 'YouTube', icon: 'youtube', url: 'https://youtube.com' },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select a subject';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-mesh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 right-10 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="section-container relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-6">
              📬 Get In Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              We'd Love to <span className="gradient-text">Hear From You</span>
            </h1>
            <p className="text-xl text-gray-400">
              Have questions about membership, classes, or personal training? 
              Reach out and our team will get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-dark-500">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center group"
              >
                <span className="text-4xl mb-4 block">{info.icon}</span>
                <h3 className="text-xl font-bold text-white mb-3">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-400">{detail}</p>
                ))}
                <a 
                  href={info.link}
                  target={info.link.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
                >
                  {info.action} →
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-dark-600">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-4">
                Send a Message
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Drop Us a <span className="gradient-text">Line</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 bg-dark-400 border ${
                        errors.name ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors`}
                    />
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 bg-dark-400 border ${
                        errors.email ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors`}
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 bg-dark-400 border ${
                        errors.phone ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors`}
                    />
                    {errors.phone && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-dark-400 border ${
                        errors.subject ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors`}
                    >
                      <option value="">Select a subject</option>
                      <option value="membership">Membership Inquiry</option>
                      <option value="personal-training">Personal Training</option>
                      <option value="group-classes">Group Classes</option>
                      <option value="nutrition">Nutrition Consultation</option>
                      <option value="corporate">Corporate Wellness</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.subject}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-4 py-3 bg-dark-400 border ${
                      errors.message ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none`}
                  />
                  {errors.message && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-1"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Google Maps Embed */}
              <div className="glass-card overflow-hidden h-80 lg:h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1648.139988118999!2d75.70500000552374!3d31.252819061068934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5f66540a278b%3A0x25064d351ca33204!2sDivision%20of%20Admissions%2C%20LPU!5e1!3m2!1sen!2sin!4v1764614959475!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="FitZone Location - Lovely Professional University"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Quick Contact Box */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📧</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email us directly</p>
                      <a href="mailto:rameshlpu779@gmail.com" className="text-white hover:text-primary-400 transition-colors">
                        rameshlpu779@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">WhatsApp</p>
                      <a href="https://wa.me/919430260097" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary-400 transition-colors">
                        +91 9430260097
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
                <p className="text-gray-400 mb-4">Stay connected for updates, tips, and motivation!</p>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 bg-dark-400 rounded-xl flex items-center justify-center hover:bg-primary-500 transition-colors group"
                    >
                      {social.icon === 'facebook' && (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                        </svg>
                      )}
                      {social.icon === 'instagram' && (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      )}
                      {social.icon === 'twitter' && (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )}
                      {social.icon === 'youtube' && (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-dark-500">
        <div className="section-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 text-secondary-400 rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              Common <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { q: 'Do I need to book classes in advance?', a: 'Yes, we recommend booking classes at least 24 hours in advance to secure your spot. You can book through our app or website.' },
              { q: 'Is there parking available?', a: 'Yes! We have a free parking garage with over 200 spots for members. Validated parking is available for visitors.' },
              { q: 'Can I bring a guest?', a: 'Premium and Elite members can bring guests. Guest passes vary by membership level. Check your plan details for specifics.' },
              { q: 'What should I bring for my first visit?', a: 'Bring comfortable workout clothes, athletic shoes, a water bottle, and a towel. We provide lockers and shower facilities.' },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-dark-600 relative overflow-hidden">
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
              Stay <span className="gradient-text">Updated</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Subscribe to our newsletter for fitness tips, special offers, and event updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-dark-400 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <Button variant="primary">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
