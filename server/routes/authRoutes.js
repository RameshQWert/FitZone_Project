const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules, validate } = require('../middleware/validationMiddleware');

router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
