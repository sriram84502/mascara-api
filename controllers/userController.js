const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  sendOtp,
  verifyOtp
} = require('../controllers/authController');

// Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/reset/send-otp', sendOtp);
router.post('/reset/verify-otp', verifyOtp);

module.exports = router;