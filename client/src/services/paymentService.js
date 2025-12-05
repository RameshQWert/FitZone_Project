import api from './api';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentService = {
  // Get Razorpay key
  getKey: async () => {
    const response = await api.get('/payments/key');
    return response.data;
  },

  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/payments/create-order', orderData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  // Check subscription status
  checkSubscription: async (planName, amount, userId) => {
    const response = await api.get(`/payments/check-subscription?planName=${encodeURIComponent(planName)}&amount=${amount}&userId=${userId}`);
    return response.data;
  },

  // Load Razorpay script
  loadRazorpayScript
};

export default paymentService;
