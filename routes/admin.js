const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getStats
} = require('../controllers/adminController');

const adminAuth = [verifyToken, adminOnly];

router.get('/orders', adminAuth, getAllOrders);
router.put('/orders/:id', adminAuth, updateOrderStatus);
router.get('/users', adminAuth, getAllUsers);
router.get('/stats', adminAuth, getStats);

module.exports = router;