const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  shippingAddress: String,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    default: 'Pending'
  },
  totalAmount: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  paymentId: String,
  paymentSignature: String,
  shippingAddress: {
    line1: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);