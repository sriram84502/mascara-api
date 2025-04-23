const Order = require('../models/Order');

// 🛒 Place an order
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    const newOrder = await Order.create({
      userId: req.user.userId,
      items,
      shippingAddress,
      totalAmount
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📜 View order history (for logged-in user)
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Track a specific order
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.userId
    });

    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};