const asyncHandler = require('express-async-handler');

// Fitness-focused AI responses with context
const FITNESS_CONTEXT = `You are FitBot, a friendly and knowledgeable AI fitness assistant for FitZone Gym. 
You help members with:
- Workout routines and exercise techniques
- Nutrition and diet advice
- Gym membership information
- Class schedules and recommendations
- Fitness goals and motivation
- General health and wellness tips

Keep responses concise, friendly, and encouraging. Use emojis occasionally to be engaging.
If asked about specific gym policies or pricing, suggest contacting the admin through the chat feature.
Always prioritize safety and recommend consulting professionals for medical concerns.`;

// Pre-defined responses for common questions (fallback when API is unavailable)
const FALLBACK_RESPONSES = {
  greeting: [
    "Hey there! 💪 I'm FitBot, your AI fitness assistant. How can I help you today?",
    "Hi! Welcome to FitZone! I'm here to help with workout tips, nutrition advice, and more. What's on your mind?",
    "Hello, fitness enthusiast! 🏋️ Ready to crush your goals? Ask me anything!"
  ],
  workout: [
    "For a balanced workout routine, try combining strength training 3x/week with cardio 2x/week. Start with compound exercises like squats, deadlifts, and bench press for maximum results! 💪",
    "A great beginner workout: 3 sets of 10-12 reps each of squats, push-ups, rows, and planks. Rest 60-90 seconds between sets. Consistency is key!",
    "Mix it up! Try HIIT on Monday, strength on Tuesday/Thursday, yoga on Wednesday, and active recovery on weekends. Your body will thank you! 🔥"
  ],
  nutrition: [
    "For muscle building, aim for 1.6-2.2g protein per kg of body weight. Great sources: chicken, fish, eggs, legumes, and Greek yogurt! 🥗",
    "Stay hydrated! Drink at least 8 glasses of water daily, more if you're working out intensely. Water is crucial for performance and recovery! 💧",
    "Pre-workout: eat complex carbs 2-3 hours before. Post-workout: protein + carbs within 30-45 minutes for optimal recovery! 🍌"
  ],
  motivation: [
    "Remember: Every rep counts, every step matters! You're not competing with anyone but yourself. Keep pushing! 🌟",
    "The only bad workout is the one that didn't happen. You showed up today - that's already a win! 💪",
    "Progress isn't always visible on the scale. Celebrate the small wins: more energy, better sleep, feeling stronger! 🎯"
  ],
  membership: [
    "For membership details and pricing, I'd recommend chatting with our admin through the 'Chat with Admin' feature. They can give you personalized options! 📋",
    "We have various membership plans to fit your needs! Connect with our admin via the chat feature for the best deals and current promotions! 🎫"
  ],
  classes: [
    "FitZone offers various classes including Yoga, HIIT, Spin, Strength Training, and Zumba! Check the Schedule page for timings, or ask our admin for recommendations! 🗓️",
    "Looking for group classes? We have something for everyone! From high-energy Zumba to relaxing Yoga. Visit the Schedule section to find your perfect fit! 🧘"
  ],
  default: [
    "That's a great question! While I'm still learning, I'd suggest checking with our admin for more specific information. Is there anything else fitness-related I can help with? 🤔",
    "I'm here to help with fitness, nutrition, and gym-related questions! Could you rephrase that or ask me something about workouts, diet, or classes? 💪"
  ]
};

// Simple keyword matching for fallback
const getKeywordCategory = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (/^(hi|hello|hey|greetings|good morning|good evening)/i.test(lowerMessage)) {
    return 'greeting';
  }
  if (/workout|exercise|training|gym routine|lift|cardio|strength|muscle/i.test(lowerMessage)) {
    return 'workout';
  }
  if (/diet|nutrition|food|eat|protein|calories|meal|supplement/i.test(lowerMessage)) {
    return 'nutrition';
  }
  if (/motivat|inspire|tired|lazy|give up|hard|difficult|help me/i.test(lowerMessage)) {
    return 'motivation';
  }
  if (/member|price|cost|plan|subscription|fee|join/i.test(lowerMessage)) {
    return 'membership';
  }
  if (/class|schedule|yoga|zumba|spin|hiit|session/i.test(lowerMessage)) {
    return 'classes';
  }
  return 'default';
};

const getRandomResponse = (category) => {
  const responses = FALLBACK_RESPONSES[category] || FALLBACK_RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
};

// @desc    Chat with AI Bot
// @route   POST /api/ai-chat
// @access  Private (Members)
const chatWithAI = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  try {
    // Try using Gemini API if key is available
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: FITNESS_CONTEXT }]
              },
              {
                role: 'model',
                parts: [{ text: "I understand! I'm FitBot, ready to help FitZone members with fitness advice, workout tips, nutrition guidance, and gym information. How can I assist you today? 💪" }]
              },
              // Include conversation history for context
              ...conversationHistory.slice(-6).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
              })),
              {
                role: 'user',
                parts: [{ text: message }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 500,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiResponse) {
          return res.json({
            success: true,
            data: {
              message: aiResponse,
              source: 'gemini'
            }
          });
        }
      }
    }

    // Fallback to keyword-based responses
    const category = getKeywordCategory(message);
    const fallbackResponse = getRandomResponse(category);

    res.json({
      success: true,
      data: {
        message: fallbackResponse,
        source: 'fallback'
      }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Return fallback response on error
    const category = getKeywordCategory(message);
    const fallbackResponse = getRandomResponse(category);

    res.json({
      success: true,
      data: {
        message: fallbackResponse,
        source: 'fallback'
      }
    });
  }
});

// @desc    Get AI Chat suggestions
// @route   GET /api/ai-chat/suggestions
// @access  Private (Members)
const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = [
    "What's a good workout routine for beginners?",
    "How much protein should I eat daily?",
    "Tips for losing weight effectively",
    "Best exercises for building muscle",
    "How to stay motivated at the gym?",
    "What should I eat before a workout?",
    "How often should I exercise per week?",
    "What are the benefits of strength training?"
  ];

  // Return 4 random suggestions
  const randomSuggestions = suggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  res.json({
    success: true,
    data: randomSuggestions
  });
});

module.exports = {
  chatWithAI,
  getSuggestions
};
