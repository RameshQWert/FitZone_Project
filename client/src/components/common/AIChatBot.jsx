import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineX, 
  HiOutlinePaperAirplane,
  HiOutlineLightBulb,
  HiOutlineRefresh
} from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { aiChatService } from '../../services';

const AIChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load suggestions on mount
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const response = await aiChatService.getSuggestions();
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([
        "What's a good workout routine?",
        "How much protein do I need?",
        "Tips for staying motivated",
        "Best exercises for weight loss"
      ]);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setShowSuggestions(false);
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await aiChatService.sendMessage(messageText, conversationHistory);
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data?.message || "I'm sorry, I couldn't process that. Please try again!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again in a moment. 🔄",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    loadSuggestions();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Don't show for non-authenticated users
  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow ${isOpen ? 'hidden' : ''}`}
      >
        <RiRobot2Line className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <RiRobot2Line className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">FitBot AI</h3>
                  <p className="text-xs text-white/80">Your Fitness Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <HiOutlineRefresh className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <HiOutlineX className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiRobot2Line className="w-9 h-9 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Hey {user?.fullName?.split(' ')[0] || 'there'}! 👋</h4>
                  <p className="text-gray-400 text-sm">
                    I'm FitBot, your AI fitness assistant. Ask me about workouts, nutrition, or anything fitness-related!
                  </p>
                </motion.div>
              )}

              {/* Suggestions */}
              {showSuggestions && messages.length === 0 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <HiOutlineLightBulb className="w-4 h-4" />
                    <span>Try asking:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about fitness..."
                  disabled={isTyping}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                >
                  <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                </motion.button>
              </div>
              <p className="text-center text-gray-500 text-xs mt-2">
                Powered by AI • Fitness advice only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBot;
