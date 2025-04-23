const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, storeOTP, validateOTP } = require('../utils/otpService');
const { sendWhatsAppMessage } = require('../utils/whatsappService');

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, phone, password: hashed });
    res.status(201).json({ msg: 'Signup successful', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send WhatsApp OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: 'Phone number not found' });

    const otp = generateOTP();
    storeOTP(phone, otp);

    await sendWhatsAppMessage(phone, `Your OTP for password reset is *${otp}*. It expires in 5 minutes.`);
    res.json({ msg: 'OTP sent via WhatsApp' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP & Reset Password
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const isValid = validateOTP(phone, otp);
    if (!isValid) return res.status(400).json({ msg: 'Invalid or expired OTP' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ phone }, { password: hashed });

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};