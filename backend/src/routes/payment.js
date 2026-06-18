const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const logger = require('../utils/logger');

let Razorpay;
try { Razorpay = require('razorpay'); } catch { logger.warn('Razorpay not installed. Run: npm install razorpay'); }

const getRazorpay = () => {
  if (!Razorpay) throw new Error('Razorpay not installed. Run: npm install razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set in .env');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

router.post('/create-order', async (req, res) => {
  const { userId, amount = 49 } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `nyayaai_${userId}_${Date.now()}`,
      notes: { userId, purpose: 'NyayaAI document analysis credit' },
    });
    logger.info(`Payment order created: ${order.id} for user ${userId}`);
    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    logger.error('Payment order creation failed:', err.message);
    res.status(500).json({ error: err.message || 'Failed to create payment order' });
  }
});

router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('RAZORPAY_KEY_SECRET not configured');

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`Invalid payment signature for user ${userId}`);
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    logger.info(`Payment verified: ${razorpay_payment_id} for user ${userId}`);
    res.json({ success: true, paymentId: razorpay_payment_id, message: 'Payment verified successfully' });
  } catch (err) {
    logger.error('Payment verification failed:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Verification failed' });
  }
});

router.get('/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) return res.status(500).json({ error: 'Razorpay not configured' });
  res.json({ keyId });
});

module.exports = router;
