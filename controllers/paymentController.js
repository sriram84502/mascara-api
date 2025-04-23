const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendWhatsAppMessage } = require('../utils/whatsappService');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Step 1: Create Razorpay Order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    const options = {
      amount: amount * 100,
      currency,
      receipt: `rcpt_${Math.floor(Math.random() * 10000)}`
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Step 2: Verify Razorpay Signature, Update Order, Send Notifications
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, dbOrderId } = req.body;

    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === signature;
    if (!isValid) {
      return res.status(400).json({ msg: "Invalid payment signature", verified: false });
    }

    // ✅ Mark order as paid & retrieve updated order
    const updatedOrder = await Order.findByIdAndUpdate(
      dbOrderId,
      {
        isPaid: true,
        paidAt: new Date(),
        paymentId: payment_id,
        paymentSignature: signature
      },
      { new: true }
    );

    // 👤 Get user info
    const user = await User.findById(updatedOrder.userId);

    // ✅ 1. Send confirmation to user
    await sendWhatsAppMessage(
      user.phone,
      `✅ *Order Confirmed*\nYour order #${updatedOrder._id} has been placed successfully.\nWe'll notify you when it ships!`
    );

    // ✅ 2. Notify Admin
    const adminPhone = process.env.ADMIN_PHONE || "91XXXXXXXXXX";
    await sendWhatsAppMessage(
      adminPhone,
      `🆕 *New Order Alert*\nOrder #${updatedOrder._id} placed by *${user.name}*\nTotal: ₹${updatedOrder.totalAmount}\n\n📦 View & manage: https://youradminpanel.com/orders/${updatedOrder._id}`
    );

    // ✅ Respond after all logic completes
    res.json({ msg: "Payment verified, order confirmed, notifications sent", verified: true });

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: err.message });
  }
};