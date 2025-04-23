const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean, default: false }
  }, { timestamps: true });

module.exports = mongoose.model('User', userSchema);