const Order = require('../models/Order');
const User = require('../models/User');
const { sendWhatsAppMessage } = require('../utils/whatsappService');

// 👥 Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚚 Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const user = await User.findById(order.userId);
    if (user?.phone) {
      await sendWhatsAppMessage(
        user.phone,
        `Hi ${user.name}, your order #${order._id} is now *${order.status}*.`
      );
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const breakdown = {};
    statusCounts.forEach(s => breakdown[s._id] = s.count);

    res.json({
      totalOrders,
      totalUsers,
      totalRevenue,
      orderStatusBreakdown: breakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};