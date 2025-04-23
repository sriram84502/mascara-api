const otpStore = new Map(); // In-memory (consider Redis in production)
const crypto = require('crypto');

exports.generateOTP = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.storeOTP = (phone, otp) => {
  const expiresIn = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(phone, { otp, expiresIn });
};

exports.validateOTP = (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresIn) {
    otpStore.delete(phone);
    return false;
  }
  if (record.otp === otp) {
    otpStore.delete(phone); // One-time use
    return true;
  }
  return false;
};