const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  getMemberByUserId,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect, admin, trainer } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(trainer, getMembers);
router.route('/user/:userId').get(getMemberByUserId);
router.route('/:id').get(getMemberById).put(updateMember).delete(admin, deleteMember);

module.exports = router;
