const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendWhatsAppMessage = async (phone, message) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_PHONE, // e.g., 'whatsapp:+14155238886'
      to: `whatsapp:+91${phone}`,    // ensure phone is in correct format
      body: message
    });
    console.log('WhatsApp message sent');
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err.message);
  }
};