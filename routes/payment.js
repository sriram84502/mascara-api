const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment
} = require('../controllers/paymentController');

router.post('/create-order', verifyToken, createPaymentOrder);
router.post('/verify', verifyToken, verifyPayment);

module.exports = router;