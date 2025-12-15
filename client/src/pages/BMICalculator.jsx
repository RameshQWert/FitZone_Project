import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCalculator, 
  HiOutlineScale,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineClipboardList,
  HiOutlineLightningBolt,
  HiOutlineCake,
  HiOutlineRefresh
} from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import { GiMuscleUp, GiFruitBowl, GiMeal } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { aiChatService } from '../services';
import { Loading } from '../components/common';

const BMICalculator = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });
  const [bmiResult, setBmiResult] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 'extreme', label: 'Extremely Active', desc: 'Very hard exercise & physical job' }
  ];

  const goals = [
    { value: 'lose', label: 'Lose Weight', icon: '🔥' },
    { value: 'maintain', label: 'Maintain Weight', icon: '⚖️' },
    { value: 'gain', label: 'Build Muscle', icon: '💪' }
  ];

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const heightInM = parseFloat(formData.height) / 100;
    const bmi = weight / (heightInM * heightInM);
    
    let category, color, advice;
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-400';
      advice = 'You may need to gain some weight for optimal health.';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-400';
      advice = 'Great! You\'re at a healthy weight.';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-400';
      advice = 'Consider lifestyle changes for better health.';
    } else {
      category = 'Obese';
      color = 'text-red-400';
      advice = 'It\'s recommended to consult a healthcare professional.';
    }

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * parseFloat(formData.height) - 5 * parseFloat(formData.age) + 5;
    } else {
      bmr = 10 * weight + 6.25 * parseFloat(formData.height) - 5 * parseFloat(formData.age) - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extreme: 1.9
    };
    const tdee = bmr * activityMultipliers[formData.activityLevel];

    // Adjust calories based on goal
    let targetCalories;
    if (formData.goal === 'lose') {
      targetCalories = tdee - 500; // 500 calorie deficit
    } else if (formData.goal === 'gain') {
      targetCalories = tdee + 300; // 300 calorie surplus
    } else {
      targetCalories = tdee;
    }

    return {
      bmi: bmi.toFixed(1),
      category,
      color,
      advice,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein: Math.round(weight * (formData.goal === 'gain' ? 2.2 : 1.8)),
      carbs: Math.round((targetCalories * 0.4) / 4),
      fats: Math.round((targetCalories * 0.25) / 9)
    };
  };

  const getAISuggestions = async (bmiData) => {
    setLoading(true);
    try {
      const prompt = `Based on this person's data:
- BMI: ${bmiData.bmi} (${bmiData.category})
- Age: ${formData.age} years old
- Gender: ${formData.gender}
- Activity Level: ${formData.activityLevel}
- Goal: ${formData.goal === 'lose' ? 'Lose weight' : formData.goal === 'gain' ? 'Build muscle' : 'Maintain weight'}
- Target Calories: ${bmiData.targetCalories} cal/day
- Recommended Protein: ${bmiData.protein}g/day

Please provide:
1. A personalized 7-day workout routine (brief, 2-3 exercises per day)
2. A sample daily meal plan with breakfast, lunch, dinner, and snacks
3. 3 key tips specific to their goal

Keep it concise, practical, and motivating. Use emojis to make it engaging.`;

      const response = await aiChatService.sendMessage(prompt);
      setAiSuggestions(response.data?.message || 'Unable to generate suggestions. Please try again.');
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setAiSuggestions(generateFallbackSuggestions(bmiData));
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackSuggestions = (bmiData) => {
    const { goal } = formData;
    
    if (goal === 'lose') {
      return `🔥 **Weight Loss Plan**

**Weekly Workout Routine:**
• Mon/Wed/Fri: 30 min cardio + 20 min strength training
• Tue/Thu: HIIT workout (20 min)
• Sat: Active recovery (yoga/walking)
• Sun: Rest

**Sample Meal Plan (${bmiData.targetCalories} cal):**
🌅 Breakfast: Oatmeal with berries + egg whites
🌞 Lunch: Grilled chicken salad with olive oil dressing
🌙 Dinner: Baked fish with steamed vegetables
🍎 Snacks: Greek yogurt, almonds, fruits

**Top Tips:**
1. Drink 8+ glasses of water daily 💧
2. Get 7-8 hours of sleep for recovery 😴
3. Track your meals to stay accountable 📝`;
    } else if (goal === 'gain') {
      return `💪 **Muscle Building Plan**

**Weekly Workout Routine:**
• Mon: Chest & Triceps
• Tue: Back & Biceps
• Wed: Rest or Light Cardio
• Thu: Shoulders & Abs
• Fri: Legs
• Sat/Sun: Active recovery

**Sample Meal Plan (${bmiData.targetCalories} cal):**
🌅 Breakfast: 4 eggs + oatmeal + banana
🌞 Lunch: Chicken breast + rice + vegetables
🍴 Pre-workout: Protein shake + banana
🌙 Dinner: Salmon + sweet potato + broccoli
🥛 Before bed: Casein protein or cottage cheese

**Top Tips:**
1. Eat protein with every meal (${bmiData.protein}g daily) 🥩
2. Progressive overload - increase weights gradually 📈
3. Rest muscles 48 hours between training same group 💤`;
    } else {
      return `⚖️ **Maintenance Plan**

**Weekly Workout Routine:**
• Mon/Thu: Full body strength training
• Tue/Fri: 30 min cardio (running, cycling)
• Wed: Yoga or flexibility work
• Sat: Sports or recreational activity
• Sun: Rest

**Sample Meal Plan (${bmiData.targetCalories} cal):**
🌅 Breakfast: Whole grain toast + eggs + avocado
🌞 Lunch: Lean protein + quinoa + mixed vegetables
🌙 Dinner: Grilled meat/fish + salad + whole grains
🍎 Snacks: Nuts, fruits, protein bars

**Top Tips:**
1. Balance is key - enjoy treats in moderation 🍕
2. Stay consistent with workouts 📅
3. Listen to your body and adjust as needed 🎯`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.weight || !formData.height || !formData.age) {
      alert('Please fill in all fields');
      return;
    }

    const result = calculateBMI();
    setBmiResult(result);
    setShowResults(true);
    await getAISuggestions(result);
  };

  const handleReset = () => {
    setFormData({
      weight: '',
      height: '',
      age: '',
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain'
    });
    setBmiResult(null);
    setAiSuggestions(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm mb-4">
            <RiRobot2Line className="w-5 h-5" />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Smart BMI Calculator
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get personalized diet plans and workout routines based on your body metrics, powered by AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <HiOutlineCalculator className="w-6 h-6 text-purple-400" />
              Enter Your Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Weight & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    <HiOutlineScale className="inline w-4 h-4 mr-1" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="70"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    <HiOutlineUser className="inline w-4 h-4 mr-1" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="175"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    <HiOutlineCake className="inline w-4 h-4 mr-1" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Gender</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        formData.gender === 'male'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-900 text-gray-400 border border-gray-700'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        formData.gender === 'female'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-900 text-gray-400 border border-gray-700'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  <HiOutlineLightningBolt className="inline w-4 h-4 mr-1" />
                  Activity Level
                </label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  <HiOutlineSparkles className="inline w-4 h-4 mr-1" />
                  Your Goal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: goal.value })}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        formData.goal === goal.value
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-105'
                          : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-lg">{goal.icon}</span>
                      <p className="text-xs mt-1">{goal.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RiRobot2Line className="w-5 h-5" />
                    Calculate & Get AI Plan
                  </>
                )}
              </motion.button>

              {showResults && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <HiOutlineRefresh className="w-5 h-5" />
                  Reset Calculator
                </button>
              )}
            </form>
          </motion.div>

          {/* Results Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {showResults && bmiResult && (
                <>
                  {/* BMI Result Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <HiOutlineClipboardList className="w-6 h-6 text-green-400" />
                      Your Results
                    </h2>

                    {/* BMI Score */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-4 border-purple-500 mb-3">
                        <div>
                          <p className={`text-4xl font-bold ${bmiResult.color}`}>{bmiResult.bmi}</p>
                          <p className="text-gray-400 text-sm">BMI</p>
                        </div>
                      </div>
                      <p className={`text-xl font-semibold ${bmiResult.color}`}>{bmiResult.category}</p>
                      <p className="text-gray-400 text-sm mt-1">{bmiResult.advice}</p>
                    </div>

                    {/* BMI Scale */}
                    <div className="mb-6">
                      <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400 relative">
                        <div 
                          className="absolute w-4 h-4 bg-white rounded-full -top-0.5 shadow-lg border-2 border-gray-800"
                          style={{ 
                            left: `${Math.min(Math.max((parseFloat(bmiResult.bmi) - 15) / 25 * 100, 0), 100)}%`,
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>15</span>
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                        <span>40</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Daily Calories</p>
                        <p className="text-xl font-bold text-white">{bmiResult.targetCalories}</p>
                        <p className="text-purple-400 text-xs">kcal/day</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Base Metabolic Rate</p>
                        <p className="text-xl font-bold text-white">{bmiResult.bmr}</p>
                        <p className="text-purple-400 text-xs">kcal/day</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Protein Target</p>
                        <p className="text-xl font-bold text-white">{bmiResult.protein}g</p>
                        <p className="text-red-400 text-xs">per day</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Carbs / Fats</p>
                        <p className="text-xl font-bold text-white">{bmiResult.carbs}g / {bmiResult.fats}g</p>
                        <p className="text-yellow-400 text-xs">per day</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Suggestions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <RiRobot2Line className="w-6 h-6 text-purple-400" />
                      AI-Powered Recommendations
                    </h2>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Generating your personalized plan...</p>
                      </div>
                    ) : aiSuggestions ? (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                          {aiSuggestions}
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Placeholder when no results */}
            {!showResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center"
              >
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiRobot2Line className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Ready to Analyze</h3>
                <p className="text-gray-400 text-sm">
                  Enter your details and our AI will create a personalized diet and workout plan just for you!
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <GiFruitBowl className="w-5 h-5 text-green-400" />
                    Diet Plans
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <GiMuscleUp className="w-5 h-5 text-red-400" />
                    Workouts
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <GiMeal className="w-5 h-5 text-yellow-400" />
                    Meal Plans
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
